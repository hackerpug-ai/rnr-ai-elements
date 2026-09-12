import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';

/**
 * SHELL-002 — DocsLayout shell adoption over the REAL docs build.
 *
 * Integration tier: this lane seeds the ordered chain (registry:build ->
 * gallery:manifest), spawns the real filtered pnpm build as a subprocess, then
 * reads the emitted dist HTML, the emitted dist/_astro/*.css bundles, and the
 * authored shell/page sources from the real filesystem:
 *
 * - SHELL-002-themed-shell-on-adopted-routes (TC-1/TC-2, AC-1): the three
 *   adopted routes (registry, components index, islands/copy-button) each carry
 *   the sticky-site header (RNR wordmark, Components/Registry nav, theme mount
 *   slot), the footer, the zero-JS <details> drawer, and a /_astro/*.css
 *   stylesheet link; no <dialog> anywhere; no page imports spike.astro.
 * - SHELL-002-shell-css-token-governed (TC-3, AC-2): the built CSS makes the
 *   header position:sticky at var(--layout-header-h) with scroll-margin-top on
 *   anchored content; the authored shell components consume var(--*) tokens
 *   only (zero hex literals), carry a prefers-reduced-motion guard, and stay
 *   script-free — Header.astro/Footer.astro with zero exemptions, and
 *   DocsLayout.astro admitting exactly one script: the contracted is:inline
 *   data-astro-rerun pre-paint theme bootstrap (SHELL-003, resolving stored
 *   rnr-theme > prefers-color-scheme > dark); any other script fails.
 * - SHELL-002-sprint01-contracts-preserved (TC-4, AC-3): adoption wraps — never
 *   rewrites — the sprint-01 content structure: family section[id] anchors and
 *   ul li rows on /components, ledger table rows on /registry, all counts
 *   derived from the real datasets at run time (never hand-copied literals).
 *
 * The build runs once (beforeAll). The root vitest config sets
 * fileParallelism:false, so this lane never races the other build lanes.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DOCS_SRC = join(repoRoot, 'apps/docs/src');
const DIST_ASTRO_DIR = join(repoRoot, 'apps/docs/dist/_astro');

/** Authored shell components + the three adopting page sources (fixture authored_shell_sources). */
const SHELL_FILES = {
  layout: join(DOCS_SRC, 'layouts/DocsLayout.astro'),
  header: join(DOCS_SRC, 'components/Header.astro'),
  footer: join(DOCS_SRC, 'components/Footer.astro'),
} as const;
const ADOPTED_PAGE_FILES = [
  join(DOCS_SRC, 'pages/registry.astro'),
  join(DOCS_SRC, 'pages/components/index.astro'),
  join(DOCS_SRC, 'pages/islands/copy-button.astro'),
] as const;

/** The three routes this task adopts (fixture built_adopted_routes). */
const BUILT_ROUTES = [
  'registry/index.html',
  'components/index.html',
  'islands/copy-button/index.html',
] as const;

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

type LedgerItem = {
  name: string;
  type: string;
  engines: string[];
  expoGo: boolean;
  family: string;
};
type Family = { id: string; title: string; order: number; itemNames: string[] };

/** Read a source file, returning '' when absent so RED failures name the missing artifact. */
function readSource(path: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

/** The element slice from the first opening tag to its closing tag (site header precedes page content). */
function elementSlice(html: string, open: string, close: string): string {
  const start = html.indexOf(open);
  if (start === -1) return '';
  const end = html.indexOf(close, start);
  return end === -1 ? html.slice(start) : html.slice(start, end);
}

/** Bodies of every {...} rule in the sheet; brace-balanced, comments stripped. */
function allRuleBodies(css: string): string[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const bodies: string[] = [];
  let depth = 0;
  let open = -1;
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
      if (depth === 1) {
        open = i;
      }
    } else if (ch === '}' && depth > 0) {
      depth -= 1;
      if (depth === 0 && open !== -1) {
        bodies.push(source.slice(open + 1, i));
        open = -1;
      }
    }
  }
  return bodies;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern.flags.includes('g') ? pattern : new RegExp(pattern.source, 'g'))]
    .length;
}

let buildExit: number | null = null;
let buildLog = '';
const builtRoutes: Record<string, string> = {};
let builtCss = '';

beforeAll(() => {
  // Seed the real ordered chain first (registry:build -> gallery:manifest): a fresh
  // checkout has no apps/docs/src/data/registry-items.json yet, and pnpm runs the
  // docs package's prebuild hook BEFORE its build script. Same ordering as the root
  // e2e:docs script, the sprint-01 ci-chain-order lane, and SHELL-001's tokens lane.
  for (const [command, label] of [
    ['registry:build', 'registry:build'],
    ['gallery:manifest', 'gallery:manifest'],
  ] as const) {
    const seed = spawnSync('pnpm', [command], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const log = `${seed.stdout ?? ''}\n${seed.stderr ?? ''}`;
    expect(seed.error, `${label} failed to spawn: ${seed.error?.message}`).toBeUndefined();
    expect(seed.status, `${label} exited ${seed.status}\n${log}`).toBe(0);
  }
  const result = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  buildExit = result.status;
  buildLog = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  for (const route of BUILT_ROUTES) {
    builtRoutes[route] = readSource(join(repoRoot, 'apps/docs/dist', route));
  }
  try {
    builtCss = readdirSync(DIST_ASTRO_DIR)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(DIST_ASTRO_DIR, file), 'utf8'))
      .join('\n');
  } catch {
    builtCss = '';
  }
}, 900_000);

it('SHELL-002-themed-shell-on-adopted-routes: header + footer + zero-JS drawer + token stylesheet on all three built pages', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  expect(
    buildLog,
    'the docs prebuild marker is absent — the pnpm filter matched nothing or the chain broke',
  ).toContain('56 items');

  for (const route of BUILT_ROUTES) {
    const html = builtRoutes[route];
    expect(html, `${route} was not built (missing or empty)`).not.toBe('');

    // TC-1: the themed shell — the site header precedes page content (DocsLayout
    // renders Header before the slot), so the FIRST <header> slice is the shell's.
    const siteHeader = elementSlice(html, '<header', '</header>');
    expect(siteHeader, `${route}: no <header> element in the built page`).not.toBe('');
    expect(siteHeader, `${route}: the site header must carry the RNR wordmark anchor to /`).toMatch(
      /<a[^>]*href="\/"[^>]*>\s*RNR\s*<\/a>/,
    );
    expect(siteHeader, `${route}: header nav must link /components`).toMatch(
      /<a[^>]*href="\/components"[^>]*>/,
    );
    expect(siteHeader, `${route}: header nav must link /registry`).toMatch(
      /<a[^>]*href="\/registry"[^>]*>/,
    );
    expect(
      siteHeader,
      `${route}: header must carry the ThemeToggle mount slot for SHELL-003`,
    ).toContain('data-theme-slot');
    expect(siteHeader, `${route}: header must carry the zero-JS <details> drawer`).toContain(
      '<details',
    );

    expect(html, `${route}: no <footer> element in the built page`).toContain('<footer');

    // The built token stylesheet: real /_astro/*.css bundles linked from the head.
    const stylesheetLinks = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/g) ?? [];
    expect(
      stylesheetLinks.some((tag) => /href="[^"]*\/_astro\/[^"]*\.css"/.test(tag)),
      `${route}: no <link rel="stylesheet"> to a built /_astro/*.css bundle`,
    ).toBe(true);

    // TC-2 negative controls: no fake search dialog anywhere in the page.
    expect(html, `${route}: a <dialog> element must never render (fake search)`).not.toContain(
      '<dialog',
    );
  }

  // TC-2: no spike.astro residue — the adopted page sources import DocsLayout.
  for (const page of ADOPTED_PAGE_FILES) {
    const source = readSource(page);
    expect(source, `${page}: page source is missing`).not.toBe('');
    expect(source, `${page}: must import the DocsLayout shell`).toContain(
      'layouts/DocsLayout.astro',
    );
    expect(source, `${page}: must no longer import layouts/spike.astro`).not.toContain('spike');
  }

  // AC-1: the linked stylesheet really is the SHELL-001 token sheet (either the
  // authored 0.145 or the minifier's 14.5% serialization of the same value).
  expect(builtCss, 'no built CSS bundles on disk — global.css never reached the build').not.toBe(
    '',
  );
  expect(builtCss, 'the built CSS lost the SHELL-001 dark --background token').toMatch(
    /--background:\s*oklch\((?:0?\.145|14\.5%)\s+0\s+0\)/,
  );
});

it('SHELL-002-shell-css-token-governed: sticky header at var(--layout-header-h), scroll-margin compensation, var(--*)-only authored styles', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  expect(builtCss, 'no built CSS bundles on disk').not.toBe('');

  // The header rule itself: position:sticky consuming --layout-header-h, never fixed.
  const ruleBodies = allRuleBodies(builtCss);
  expect(
    ruleBodies.filter(
      (body) => body.includes('position:sticky') && body.includes('var(--layout-header-h)'),
    ),
    'built CSS must carry a position:sticky rule that consumes var(--layout-header-h)',
  ).not.toEqual([]);
  expect(
    ruleBodies.filter(
      (body) => body.includes('position:fixed') && body.includes('var(--layout-header-h)'),
    ),
    'the header must never be position:fixed',
  ).toEqual([]);

  // Anchored content (sections/headings) compensates for the sticky header.
  expect(builtCss, 'built CSS must carry scroll-margin-top on anchored content').toContain(
    'scroll-margin-top',
  );

  // Authored shell sources exist and consume the token vocabulary via var().
  const shellSources = {
    layout: readSource(SHELL_FILES.layout),
    header: readSource(SHELL_FILES.header),
    footer: readSource(SHELL_FILES.footer),
  };
  for (const [name, source] of Object.entries(shellSources) as [
    keyof typeof SHELL_FILES,
    string,
  ][]) {
    expect(
      source,
      `${name} (${SHELL_FILES[name]}) is missing — author the shell component`,
    ).not.toBe('');
    expect(
      source,
      `${name}: a hex color literal is banned — consume var(--*) tokens instead`,
    ).not.toMatch(HEX_LITERAL);
    expect(source, `${name}: position:fixed is banned on the shell`).not.toContain(
      'position: fixed',
    );
  }

  // No script tag may live in the shell chrome — Header/Footer, zero
  // exemptions. DocsLayout is narrowed for SHELL-003: it may carry exactly one
  // script, the contracted is:inline data-astro-rerun pre-paint theme
  // bootstrap (stored rnr-theme > prefers-color-scheme > dark). Every contract
  // marker is pinned, so a second script — or a drift of the contracted one —
  // still fails.
  for (const name of ['header', 'footer'] as const) {
    expect(shellSources[name], `${name}: no script tag may live in the shell chrome`).not.toContain(
      '<script',
    );
  }
  const layoutScripts = [...shellSources.layout.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  const contractedThemeScripts = layoutScripts.filter(
    ([, attrs, content]) =>
      attrs.includes('is:inline') &&
      attrs.includes('data-astro-rerun') &&
      content.includes('rnr-theme'),
  );
  expect(
    contractedThemeScripts.length,
    'DocsLayout: the contracted is:inline data-astro-rerun rnr-theme pre-paint script is missing',
  ).toBe(1);
  expect(
    layoutScripts.length - contractedThemeScripts.length,
    'DocsLayout: only the contracted pre-paint theme script may live here — a non-contracted script was found',
  ).toBe(0);
  // The paired-tag regex above requires a closing </script>, so a self-closing
  // <script ... /> never enters layoutScripts and would slip past both counts.
  // Every <script opener in the source must therefore be one the paired scan
  // matched — any unpaired opener (self-closing or unclosed) fails here.
  expect(
    countMatches(shellSources.layout, /<script\b/g),
    'DocsLayout: an unpaired or self-closing <script ... /> was found — only the paired contracted pre-paint theme script may live here',
  ).toBe(layoutScripts.length);
  const allShellCss = Object.values(shellSources).join('\n');
  for (const token of ['--background', '--foreground', '--border', '--primary']) {
    expect(allShellCss, `the authored shell must consume ${token} via var()`).toContain(
      `var(${token})`,
    );
  }

  // The drawer's transition carries a reduced-motion guard.
  expect(
    shellSources.header,
    'the drawer/transition rules must carry a prefers-reduced-motion guard',
  ).toContain('prefers-reduced-motion');
});

it('SHELL-002-sprint01-contracts-preserved: family section[id] anchors + ul li rows on /components, ledger table rows on /registry', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);

  // Dataset-derived expectations — never hand-copied literals (AC-3).
  const families = JSON.parse(
    readFileSync(join(DOCS_SRC, 'data/families.json'), 'utf8'),
  ) as Family[];
  const items = JSON.parse(
    readFileSync(join(DOCS_SRC, 'data/registry-items.json'), 'utf8'),
  ) as LedgerItem[];
  const familyAnchoredSections = families.length;
  const totalListedNames = families.reduce((sum, family) => sum + family.itemNames.length, 0);
  const componentNames = items.filter((item) => item.type === 'registry:component').length;

  // /components: the shell wraps — not replaces — the anchored family structure.
  const componentsHtml = builtRoutes['components/index.html'];
  expect(componentsHtml, 'components/index.html was not built').not.toBe('');
  const sectionsWithId = countMatches(componentsHtml, /<section\b[^>]*\bid="[^"]*"/);
  expect(sectionsWithId, 'id-anchored family sections on /components').toBe(familyAnchoredSections);
  expect(
    sectionsWithId,
    'at least 7 anchored family sections (sprint-01 contract)',
  ).toBeGreaterThanOrEqual(7);
  const liRows = countMatches(componentsHtml, /<li\b/);
  expect(liRows, 'ul li item rows on /components must total every family name').toBe(
    totalListedNames,
  );
  const liAnchoredRows = countMatches(componentsHtml, /<li\b[^>]*>\s*<a\s/);
  expect(
    liAnchoredRows,
    'ul li rows linking a component page must total the registry:component count',
  ).toBe(componentNames);

  // /registry: the ledger keeps its table and its derived row count.
  const registryHtml = builtRoutes['registry/index.html'];
  expect(registryHtml, 'registry/index.html was not built').not.toBe('');
  expect(registryHtml, 'the ledger <table> must survive adoption').toContain('<table');
  const tbody = elementSlice(registryHtml, '<tbody', '</tbody>');
  expect(tbody, 'the ledger <tbody> must survive adoption').not.toBe('');
  expect(countMatches(tbody, /<tr\b/), 'ledger table rows must equal the registry item count').toBe(
    items.length,
  );
});
