import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';

/**
 * SHELL-009 — /docs/theming served cold with authored content.
 *
 * Integration tier, same lane shape as shell-layout.test.ts: seed the ordered
 * chain (registry:build -> gallery:manifest), spawn the real filtered docs
 * build (`pnpm --filter @rnr-ai-elements/docs build`) as a subprocess, then
 * read apps/docs/dist/docs/theming/index.html from the real filesystem. The
 * build subprocess + filesystem artifact IS the surface — no preview server,
 * no handcrafted HTML oracle.
 *
 * - SHELL-009-theming-route-served-with-authored-content (TC-1/TC-2, AC-1):
 *   the build exits 0, dist/docs/theming/index.html exists (>0 bytes), and the
 *   served HTML carries the four copy-stable anchors plus the DocsLayout
 *   <header> (adoption, not spike.astro).
 * - SHELL-009-theming-content-honesty-and-links (TC-3/TC-4, AC-2): zero
 *   placeholder signatures, zero banned terminology, every internal anchor
 *   href resolves against the real dist tree, and the page-content link set
 *   stays exactly within {/, /components}.
 *
 * The root vitest config sets fileParallelism:false, so this lane never races
 * the other build lanes.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_ROOT = join(repoRoot, 'apps/docs/dist');
const THEMING_HTML_PATH = join(DIST_ROOT, 'docs/theming/index.html');

/** The four copy-stable anchors SHELL-010's polish must never remove. */
const ANCHORS = ['ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'] as const;
/** Placeholder signatures — a placeholder page is a stub page. */
const PLACEHOLDER_SIGNATURES = ['coming soon', 'TODO', 'placeholder', 'Lorem'] as const;
/** Banned terminology per the TR-12 lock. */
const BANNED_TERMS = ['styling engine', 'flavor', 'registry variant'] as const;
/** Routes that 404 (or redirect nowhere) today — the page must never link them. */
const FORBIDDEN_ROUTES = [
  '/docs/introduction',
  '/docs/installation',
  '/docs/cli',
  '/docs/dark-mode',
  '/docs/quickstart',
  '/theming',
] as const;

/** Strip query/hash and trailing slashes; '/' stays the root. */
function normalizeHref(href: string): string {
  const cleaned = href.split('#')[0].split('?')[0].replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

/** Directory-index resolution: '/' -> index.html, '/components' -> components/index.html. */
function resolveDistTarget(href: string): string {
  const normalized = normalizeHref(href);
  if (normalized === '/') {
    return join(DIST_ROOT, 'index.html');
  }
  const relative = normalized.slice(1);
  const lastSegment = relative.slice(relative.lastIndexOf('/') + 1);
  return join(DIST_ROOT, lastSegment.includes('.') ? relative : join(relative, 'index.html'));
}

/** Every anchor href starting with '/', in document order. */
function internalAnchorHrefs(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="(\/[^"]*)"/g)].map((match) => match[1]);
}

let buildExit: number | null = null;
let buildLog = '';
let themingHtml = '';

beforeAll(() => {
  // Seed the real ordered chain first (registry:build -> gallery:manifest): a fresh
  // checkout has no apps/docs/src/data/registry-items.json yet, and pnpm runs the
  // docs package's prebuild hook BEFORE its build script. Same ordering as the root
  // e2e:docs script and the sprint-01/02 build lanes.
  for (const command of ['registry:build', 'gallery:manifest'] as const) {
    const seed = spawnSync('pnpm', [command], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const log = `${seed.stdout ?? ''}\n${seed.stderr ?? ''}`;
    expect(seed.error, `${command} failed to spawn: ${seed.error?.message}`).toBeUndefined();
    expect(seed.status, `${command} exited ${seed.status}\n${log}`).toBe(0);
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
  // RED-safe read: an absent route yields '' so failures name the 404 signature,
  // never a thrown ENOENT that hides which assertion fired.
  try {
    themingHtml = readFileSync(THEMING_HTML_PATH, 'utf8');
  } catch {
    themingHtml = '';
  }
}, 900_000);

it('SHELL-009-theming-route-served-with-authored-content: real build emits the route on DocsLayout with the four copy-stable anchors', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  // The pnpm filter really matched the docs package — this marker is printed by
  // the docs prebuild, and a no-match filter still exits 0 on this pnpm.
  expect(
    buildLog,
    'the docs prebuild marker is absent — the pnpm filter matched nothing or the chain broke',
  ).toContain('56 items');

  // TC-1: the file exists on the real filesystem with real bytes.
  expect(
    existsSync(THEMING_HTML_PATH),
    'apps/docs/dist/docs/theming/index.html is absent — /docs/theming 404s (the sprint-start RED signature)',
  ).toBe(true);
  expect(
    statSync(THEMING_HTML_PATH).size,
    'apps/docs/dist/docs/theming/index.html is empty',
  ).toBeGreaterThan(0);
  expect(themingHtml, 'the built artifact read back empty').not.toBe('');

  // TC-2: the four copy-stable anchors are pinned in the served HTML.
  for (const anchor of ANCHORS) {
    expect(themingHtml, `served HTML must contain the copy-stable anchor '${anchor}'`).toContain(
      anchor,
    );
  }

  // DocsLayout adoption: the shell renders a <header> before the page content.
  expect(themingHtml, 'served HTML must carry the DocsLayout <header> element').toContain(
    '<header',
  );
});

it('SHELL-009-theming-content-honesty-and-links: real prose only, every internal link resolves, page links stay within {/, /components}', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  expect(themingHtml, 'dist/docs/theming/index.html is absent — run the AC-1 lane first').not.toBe(
    '',
  );

  // TC-3: zero placeholder signatures, zero banned terminology.
  for (const signature of PLACEHOLDER_SIGNATURES) {
    expect(
      themingHtml,
      `placeholder signature '${signature}' in the served HTML — a placeholder page is a stub page`,
    ).not.toContain(signature);
  }
  for (const term of BANNED_TERMS) {
    expect(themingHtml, `banned terminology '${term}' per the TR-12 lock`).not.toContain(term);
  }

  // No href to a route that 404s today, anywhere in the served page.
  for (const route of FORBIDDEN_ROUTES) {
    expect(themingHtml, `the page must never link the not-yet-built route ${route}`).not.toContain(
      `href="${route}"`,
    );
  }

  // TC-4, half one: every internal anchor href in the full served page (chrome
  // included) resolves to an existing, non-empty dist file — zero dead links.
  const allHrefs = internalAnchorHrefs(themingHtml);
  expect(allHrefs, 'the served page carries no internal anchor hrefs at all').not.toEqual([]);
  for (const href of allHrefs) {
    const target = resolveDistTarget(href);
    expect(existsSync(target), `dead internal link: ${href} resolves to absent ${target}`).toBe(
      true,
    );
    expect(statSync(target).size, `${href} -> ${target} is empty`).toBeGreaterThan(0);
  }

  // TC-4, half two: the page-content link set (served HTML minus the DocsLayout
  // header/footer chrome) is exactly { '/', '/components' }.
  const pageContent = themingHtml
    .replace(/<header\b[\s\S]*?<\/header>/g, '')
    .replace(/<footer\b[\s\S]*?<\/footer>/g, '');
  const pageHrefs = [...new Set(internalAnchorHrefs(pageContent).map(normalizeHref))].sort();
  expect(pageHrefs, 'page-content internal href set must be exactly {/, /components}').toEqual([
    '/',
    '/components',
  ]);

  // The contracted /components target really exists on disk.
  const componentsIndex = join(DIST_ROOT, 'components/index.html');
  expect(
    existsSync(componentsIndex) && statSync(componentsIndex).size > 0,
    'apps/docs/dist/components/index.html must exist with size > 0 bytes',
  ).toBe(true);
});
