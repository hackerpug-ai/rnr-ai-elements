/**
 * ORI-CONT-002 — authored Theming reference and Dark mode explanation, verified
 * against the real files they describe.
 *
 * Every assertion reads the actual manuscripts and the actual theme/component
 * sources through normal filesystem APIs. The only parsers are the installed
 * stack the docs site itself uses: js-yaml (the YAML implementation behind
 * Astro's frontmatter pipeline) and github-slugger (the exact slugger
 * apps/docs/src/lib/docs-navigation.ts uses to derive heading ids). No mocked
 * modules and no canned interface lists: the renderMarkdown owners, the palette
 * literals, the @theme bytes, and the theme-resolution order are all derived
 * from the current sources at runtime. Every mutation control re-runs the same
 * contract over an isolated copy of the real manuscript.
 *
 * Four named selectors (one per AC), RED-first against the tree without the
 * manuscripts:
 *   - ORI-CONT-002-seam-anchors          (AC-1, integration)
 *   - ORI-CONT-002-token-boundary        (AC-2, integration)
 *   - ORI-CONT-002-engine-provenance     (AC-3, integration)
 *   - ORI-CONT-002-dark-mode-explanation (AC-4, integration)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const THEMING_REL = 'apps/docs/src/content/docs/theming.mdx';
const DARK_MODE_REL = 'apps/docs/src/content/docs/dark-mode.md';
/** Owned scratch root; each run records its mutation copies under a fresh dir. */
const RUN = process.env.ORI_CONT_002_RUN ?? new Date().toISOString().replace(/[:.]/g, '-');

// --- real installed parsers -------------------------------------------------
// js-yaml resolves from the workspace pnpm store (no workspace package declares
// it as a direct dependency); github-slugger resolves through the docs app,
// the same symlinked copy docs-navigation.ts imports.
const require_ = createRequire(import.meta.url);

function storeDir(prefix: string): string {
  const store = join(REPO_ROOT, 'node_modules', '.pnpm');
  const hits = readdirSyncSafe(store).filter((entry) => entry.startsWith(prefix));
  if (hits.length === 0) throw new Error(`pnpm store is missing ${prefix}*`);
  return join(store, hits.at(-1) as string);
}

function readdirSyncSafe(dir: string): string[] {
  try {
    return require_('node:fs').readdirSync(dir) as string[];
  } catch {
    throw new Error(`cannot read the pnpm store at ${dir}`);
  }
}

type YamlApi = { load: (text: string) => unknown };
const yaml = require_(join(storeDir('js-yaml@'), 'node_modules', 'js-yaml', 'index.js')) as YamlApi;
const { slug: githubSlug } = (await import(
  pathToFileURL(join(REPO_ROOT, 'apps/docs/node_modules/github-slugger/index.js')).href
)) as { slug: (text: string) => string };

// --- real sources under contract --------------------------------------------
function readRepoFile(rel: string): string {
  const path = join(REPO_ROOT, rel);
  if (!existsSync(path)) throw new Error(`[ORI-CONT-002] required file missing: ${rel}`);
  return readFileSync(path, 'utf8');
}

const SRC = {
  message: readRepoFile('packages/registry/src/components/ai/message.tsx'),
  reasoning: readRepoFile('packages/registry/src/components/ai/reasoning.tsx'),
  context: readRepoFile('packages/registry/src/components/ai/context.tsx'),
  textModule: readRepoFile('apps/example/components/ui/text.tsx'),
  docsCss: readRepoFile('apps/docs/src/styles/global.css'),
  exampleCss: readRepoFile('apps/example/global.css'),
  exampleTheme: readRepoFile('apps/example/lib/theme.ts'),
  nativewindConfig: readRepoFile('apps/harness-nativewind/tailwind.config.js'),
  themeToggle: readRepoFile('apps/docs/src/scripts/theme-toggle.ts'),
  docsLayout: readRepoFile('apps/docs/src/layouts/DocsLayout.astro'),
};

const SECTIONS = ['getting-started', 'guides', 'porting'] as const;

// --- manuscript parsing -----------------------------------------------------
interface Manuscript {
  fm: { title: string; description: string; section: string; order: number };
  body: string;
  /** Body with fenced code blocks removed — what MDX parses as prose/JSX. */
  prose: string;
  /** Fenced code block contents, in document order. */
  fences: string[];
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function toManuscript(rel: string, raw: string): Manuscript {
  const match = FRONTMATTER_RE.exec(raw);
  if (!match) throw new Error(`[ORI-CONT-002] ${rel} has no YAML frontmatter fence`);
  const fm = yaml.load(match[1]) as Manuscript['fm'];
  const body = raw.slice(match[0].length);
  const fences: string[] = [];
  const prose = body.replace(/```[^\n]*\n([\s\S]*?)```/g, (_all: string, code: string) => {
    fences.push(code);
    return '';
  });
  return { fm, body, prose, fences };
}

function parseManuscript(rel: string): Manuscript {
  return toManuscript(rel, readRepoFile(rel));
}

/** An isolated copy of the real manuscript with one change applied. The copy
 * lives in the owned scratch root and is read back from disk, so every
 * mutation is a real file, never an in-memory fiction. */
function mutatedManuscript(rel: string, transform: (text: string) => string): Manuscript {
  const dir = join(REPO_ROOT, '.tmp', 'ORI-CONT-002', RUN, 'mutations');
  mkdirSync(dir, { recursive: true });
  const path = join(
    dir,
    `${rel.split('/').pop() as string}-${Date.now()}-${Math.floor(Math.random() * 1e6)}.txt`,
  );
  writeFileSync(path, transform(readRepoFile(rel)));
  return toManuscript(rel, readFileSync(path, 'utf8'));
}

interface Heading {
  slug: string;
  start: number;
  end: number;
}

function headingsWithSlugs(prose: string): Heading[] {
  const re = /^(#{2,4})\s+(.+?)\s*$/gm;
  return [...prose.matchAll(re)].map((m) => ({
    slug: githubSlug(m[2]),
    start: m.index,
    end: m.index + m[0].length,
  }));
}

/** The prose region one heading owns: its line through the next heading (or EOF). */
function sectionFor(prose: string, slugValue: string): string {
  const headings = headingsWithSlugs(prose);
  const idx = headings.findIndex((heading) => heading.slug === slugValue);
  if (idx === -1) {
    throw new Error(`[ORI-CONT-002] manuscript has no heading with anchor #${slugValue}`);
  }
  const stop = idx + 1 < headings.length ? headings[idx + 1].start : prose.length;
  return prose.slice(headings[idx].end, stop);
}

// --- source-derived truth ---------------------------------------------------
/** The region of a source file declaring one Props type (up to the next member). */
function propsRegion(source: string, typeName: string): string {
  const start = source.indexOf(`type ${typeName}`);
  if (start === -1) throw new Error(`source no longer declares type ${typeName}`);
  const rest = source.slice(start);
  const next = rest.slice(1).search(/\n(type |function |export )/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

function exposesRenderMarkdown(source: string, typeName: string): boolean {
  return propsRegion(source, typeName).includes('renderMarkdown?');
}

/** The one @theme block of the consumer global.css, as current source bytes. */
function consumerThemeBlock(css: string): string {
  const start = css.indexOf('@theme {');
  if (start === -1) throw new Error('apps/example/global.css no longer declares an @theme block');
  const close = css.indexOf('\n}', start);
  return css.slice(start, close + 2);
}

// --- contract functions (the same code runs for real files and mutations) ----
function seamAnchorsContract(manuscript: Manuscript, rel: string): void {
  // AC-1: the preserved seam anchors resolve to real headings.
  for (const anchor of ['textclasscontext', 'rendermarkdown']) {
    const hits = headingsWithSlugs(manuscript.prose).filter((h) => h.slug === anchor);
    expect(
      hits,
      `${rel} must declare exactly one heading that anchors #${anchor} (github-slugger slug of the heading text)`,
    ).toHaveLength(1);
  }
  expect(
    /^#\s/m.test(manuscript.prose),
    `${rel} must not carry a body h1 (the page title comes from frontmatter)`,
  ).toBe(false);
  // AC-1: the copy-stable anchor phrases survive verbatim.
  for (const phrase of ['ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle']) {
    expect(manuscript.body, `${rel} must retain the copy-stable phrase "${phrase}"`).toContain(
      phrase,
    );
  }
  // AC-1: source truth — the renderMarkdown prop owners in the current sources.
  expect(
    exposesRenderMarkdown(SRC.message, 'MessageResponseProps'),
    'message.tsx source truth',
  ).toBe(true);
  expect(
    exposesRenderMarkdown(SRC.reasoning, 'ReasoningContentProps'),
    'reasoning.tsx source truth',
  ).toBe(true);
  expect(
    exposesRenderMarkdown(SRC.context, 'ContextProps'),
    'context.tsx source truth: ContextProps must not expose renderMarkdown',
  ).toBe(false);
  // AC-1: the text module really exports the TextClassContext provider.
  expect(SRC.textModule, 'text module source truth: TextClassContext is exported').toContain(
    'export { Text, TextClassContext }',
  );

  const tcSection = sectionFor(manuscript.prose, 'textclasscontext');
  expect(tcSection, '#textclasscontext must name the TextClassContext provider').toContain(
    'TextClassContext',
  );
  expect(
    tcSection,
    '#textclasscontext must state that React Native has no style cascade',
  ).toContain('no style cascade');

  const rmSection = sectionFor(manuscript.prose, 'rendermarkdown');
  for (const owner of ['MessageResponse', 'ReasoningContent']) {
    expect(
      rmSection,
      `#rendermarkdown must attribute renderMarkdown to the source-verified owner ${owner}`,
    ).toMatch(new RegExp(`${owner}[^.\\n]{0,80}takes a \`renderMarkdown\` prop`));
  }
  expect(
    rmSection,
    '#rendermarkdown must not repeat the removed claim that every output component takes the prop',
  ).not.toMatch(/Each takes a [`'"]?renderMarkdown/);
  expect(
    rmSection,
    '#rendermarkdown must not claim Context takes a renderMarkdown prop',
  ).not.toMatch(/Context[^.\n]{0,60}takes a [`'"]?renderMarkdown/);
}

function tokenBoundaryContract(manuscript: Manuscript, rel: string): void {
  // AC-2: exactly one TokenTable render binding in the MDX tree, declared
  // without an import (the route adapter binds the real component).
  const bindings = [...manuscript.prose.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map((m) => m[1]);
  expect(bindings, `${rel} must contain exactly one JSX render binding, named TokenTable`).toEqual([
    'TokenTable',
  ]);
  const imports = [
    ...manuscript.body.matchAll(/^import[\s\S]*?from\s+['"]([^'"]+)['"];?\s*$/gm),
  ].map((m) => m[1]);
  for (const specifier of imports) {
    if (!specifier.startsWith('.')) continue; // bare specifiers resolve from the docs app
    const target = join(REPO_ROOT, dirname(rel), specifier);
    expect(
      existsSync(target),
      `${rel} imports "${specifier}" but no component exists at that path`,
    ).toBe(true);
  }
  expect(
    manuscript.body,
    `${rel} must not import TokenTable (the route adapter binds it at render time)`,
  ).not.toMatch(/^import[\s\S]*TokenTable/m);

  // AC-2: no second literal numeric palette. The palette is the docs sheet
  // (oklch) plus the consumer's surface tokens (bare HSL triplets); none of
  // those literals may appear in the manuscript. The @theme status-scale
  // values quoted by the provenance-checked mapping example are not part of
  // that palette, so they stay legal.
  const forbidden = [
    ...new Set([
      ...(SRC.docsCss.match(/oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)/g) ?? []),
      ...(SRC.exampleCss.match(/hsl\(\s*[\d.]+/g) ?? []),
      ...(SRC.exampleTheme.match(/hsl\(\s*[\d.]+/g) ?? []),
    ]),
  ];
  for (const literal of forbidden) {
    expect(
      manuscript.body,
      `${rel} must not duplicate the palette literal ${literal} (the palette has one source)`,
    ).not.toContain(literal);
  }
  // AC-2: the honest palette boundary, in prose.
  expect(manuscript.body, `${rel} must distinguish the docs oklch values`).toContain('oklch');
  expect(manuscript.body, `${rel} must distinguish the consumer HSL values`).toContain('HSL');
  for (const token of ['code-background', 'code-foreground']) {
    expect(manuscript.body, `${rel} must name the docs-specific token --${token}`).toContain(
      `--${token}`,
    );
  }
  expect(
    manuscript.body,
    `${rel} must label --code-background/--code-foreground as docs-specific`,
  ).toContain('docs-specific');
}

function engineProvenanceContract(manuscript: Manuscript, rel: string): void {
  // AC-3: source truth — the engine configurations the prose describes.
  expect(SRC.exampleCss, 'example source truth: Uniwind import').toContain("@import 'uniwind'");
  expect(SRC.exampleCss, 'example source truth: @theme block').toContain('@theme {');
  expect(SRC.nativewindConfig, 'nativewind source truth: Tailwind v3 preset').toContain(
    "require('nativewind/preset')",
  );
  expect(SRC.nativewindConfig, 'nativewind source truth: class dark mode').toContain(
    "darkMode: 'class'",
  );

  // AC-3: the no-config claim is scoped to Uniwind, never global.
  expect(
    manuscript.body,
    `${rel} must scope "no tailwind.config.js" to Uniwind in the same sentence`,
  ).toMatch(/Uniwind[^.\n]{0,120}tailwind\.config\.js|tailwind\.config\.js[^.\n]{0,120}Uniwind/);
  expect(manuscript.body, `${rel} must pair Uniwind with Tailwind v4`).toMatch(
    /Uniwind[^.\n]{0,120}Tailwind v4/,
  );
  expect(manuscript.body, `${rel} must pair Uniwind with the CSS-first @theme block`).toContain(
    '@theme',
  );
  // AC-3: NativeWind 4 with Tailwind v3 and its real configuration path.
  expect(manuscript.body, `${rel} must identify NativeWind 4`).toContain('NativeWind 4');
  expect(manuscript.body, `${rel} must pair NativeWind 4 with Tailwind v3`).toMatch(
    /NativeWind 4[^.\n]{0,120}Tailwind v3/,
  );
  expect(
    manuscript.body,
    `${rel} must name the actual NativeWind configuration path apps/harness-nativewind/tailwind.config.js`,
  ).toContain('apps/harness-nativewind/tailwind.config.js');
  expect(manuscript.body, `${rel} must not mislabel NativeWind as version 3`).not.toContain(
    'NativeWind 3',
  );

  // AC-3: every example resolves to current source bytes; at least one lives
  // inside the consumer's @theme block.
  expect(manuscript.fences, `${rel} must carry a source-backed mapping example`).not.toHaveLength(
    0,
  );
  const themeBlock = consumerThemeBlock(SRC.exampleCss);
  for (const [i, fence] of manuscript.fences.entries()) {
    expect(fence.trim(), `example ${i + 1} in ${rel} must not be empty`).not.toBe('');
  }
  const inTheme = manuscript.fences.some(
    (fence) => SRC.exampleCss.includes(fence) && themeBlock.includes(fence),
  );
  expect(
    inTheme,
    `${rel} must include one fenced example copied verbatim from the consumer @theme block in apps/example/global.css`,
  ).toBe(true);
  for (const [i, fence] of manuscript.fences.entries()) {
    const resolved =
      SRC.exampleCss.includes(fence) ||
      SRC.docsCss.includes(fence) ||
      SRC.nativewindConfig.includes(fence);
    expect(resolved, `example ${i + 1} in ${rel} must match real source bytes`).toBe(true);
  }
  // AC-3: the example's provenance is named in prose.
  expect(
    manuscript.body,
    `${rel} must name apps/example/global.css as the mapping example's source`,
  ).toContain('apps/example/global.css');
}

function darkModeContract(manuscript: Manuscript, rel: string): void {
  // AC-4: frontmatter places the page in the Getting started section.
  expect(manuscript.fm.title, `${rel} title`).toBe('Dark mode');
  expect(
    manuscript.fm.section,
    `${rel} must be a Getting started page (the locked flow reads it from that navigation)`,
  ).toBe('getting-started');

  // AC-4: an explanation, not another tutorial — no numbered lesson.
  expect(manuscript.prose, `${rel} must contain no numbered setup steps`).not.toMatch(
    /(^|\n)\s*\d+\.\s/,
  );
  expect(manuscript.prose, `${rel} must not duplicate the Quickstart tutorial`).not.toMatch(
    /^##\s+Quickstart/m,
  );

  // AC-4: source truth — the site's actual resolution order and storage key.
  expect(SRC.docsLayout, 'DocsLayout source truth: reads stored rnr-theme').toContain(
    "localStorage.getItem('rnr-theme')",
  );
  expect(SRC.docsLayout, 'DocsLayout source truth: reads prefers-color-scheme').toContain(
    '(prefers-color-scheme: light)',
  );
  expect(SRC.themeToggle, 'theme-toggle source truth: persists rnr-theme').toContain(
    "localStorage.setItem('rnr-theme'",
  );

  // AC-4: the page separates application-owned theme state from the docs site's
  // stored choice, and describes the real resolution order in order.
  expect(manuscript.prose, `${rel} must state that your app owns its theme state`).toMatch(
    /your app[^.\n]{0,120}owns|application[^.\n]{0,80}state/,
  );
  expect(
    manuscript.prose,
    `${rel} must reference the real consumer theme map apps/example/lib/theme.ts`,
  ).toContain('apps/example/lib/theme.ts');
  const storedAt = manuscript.prose.indexOf('rnr-theme');
  const schemeAt = manuscript.prose.indexOf('prefers-color-scheme');
  expect(storedAt, `${rel} must describe the stored rnr-theme choice`).toBeGreaterThan(-1);
  expect(schemeAt, `${rel} must describe the prefers-color-scheme step`).toBeGreaterThan(-1);
  expect(
    manuscript.prose.indexOf('dark', schemeAt),
    `${rel} must describe the dark fallback after the scheme step`,
  ).toBeGreaterThan(storedAt);

  // AC-4: no unverified class behavior — the source flips the light class and
  // the Astro workstream owns any .dark/color-scheme correction, so the
  // manuscript claims neither.
  expect(manuscript.prose, `${rel} must not claim the site toggles a .dark class`).not.toMatch(
    /flips? (?:the )?[`'"]?\.?dark[`'"]? class/i,
  );
  expect(manuscript.prose, `${rel} must not claim color-scheme handling`).not.toContain(
    'color-scheme:',
  );
  // AC-4: no manuscript-only evidence presented as rendered proof.
  expect(manuscript.prose, `${rel} must not claim a rendered or first-paint proof`).not.toMatch(
    /rendered? (?:proof|screenshot)|first-paint proof|browser (?:proof|test)/i,
  );

  // AC-4: onward links to real destinations.
  for (const href of ['/docs/installation', '/docs/theming', '/docs/cli']) {
    expect(
      manuscript.body,
      `${rel} must link ${href} (engine setup references and the Theming reference)`,
    ).toContain(`](${href})`);
  }
}

// --- selectors ----------------------------------------------------------------

it('ORI-CONT-002-seam-anchors', () => {
  const manuscript = parseManuscript(THEMING_REL);
  expect(manuscript.fm.title, 'theming.mdx title').toBe('Theming');
  expect(
    SECTIONS.includes(manuscript.fm.section as (typeof SECTIONS)[number]),
    `theming.mdx section "${manuscript.fm.section}" must be one of ${SECTIONS.join('|')}`,
  ).toBe(true);
  expect(typeof manuscript.fm.order, 'theming.mdx order must be a number').toBe('number');

  seamAnchorsContract(manuscript, THEMING_REL);
  const tc = sectionFor(manuscript.prose, 'textclasscontext');
  const rm = sectionFor(manuscript.prose, 'rendermarkdown');
  console.log(
    `[ORI-CONT-002] seam anchors: #textclasscontext ${tc.length} chars, ` +
      `#rendermarkdown ${rm.length} chars; owners verified in message.tsx/reasoning.tsx`,
  );

  // Mutation control 1: removing the #rendermarkdown anchor in an isolated
  // copy of the real manuscript must fail, naming the anchor.
  let anchorMessage = '';
  try {
    seamAnchorsContract(
      mutatedManuscript(THEMING_REL, (text) =>
        text.replace('## renderMarkdown', '### markdown rendering'),
      ),
      THEMING_REL,
    );
  } catch (error) {
    anchorMessage = (error as Error).message;
  }
  expect(
    anchorMessage,
    'renaming the #rendermarkdown heading must fail the contract naming the anchor',
  ).toContain('rendermarkdown');

  // Mutation control 2: renaming MessageResponse in an isolated copy (as if
  // the interface drifted from the source) must fail, naming the interface.
  let renameMessage = '';
  try {
    seamAnchorsContract(
      mutatedManuscript(THEMING_REL, (text) => text.replaceAll('MessageResponse', 'MessageBody')),
      THEMING_REL,
    );
  } catch (error) {
    renameMessage = (error as Error).message;
  }
  expect(
    renameMessage,
    'renaming MessageResponse must fail the contract naming the interface',
  ).toContain('MessageResponse');
});

it('ORI-CONT-002-token-boundary', () => {
  const manuscript = parseManuscript(THEMING_REL);
  tokenBoundaryContract(manuscript, THEMING_REL);
  const bindings = [...manuscript.prose.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)].map((m) => m[1]);
  expect(bindings, 'observed render bindings').toEqual(['TokenTable']);
  console.log(
    `[ORI-CONT-002] token boundary: 1 TokenTable binding, ` +
      `${manuscript.fences.length} provenance-checked example(s), no duplicated palette literal`,
  );

  // Mutation: a second TokenTable binding in an isolated copy must fail.
  let duplicateMessage = '';
  try {
    tokenBoundaryContract(
      mutatedManuscript(THEMING_REL, (text) =>
        text.replace('<TokenTable />', '<TokenTable />\n\n<TokenTable />'),
      ),
      THEMING_REL,
    );
  } catch (error) {
    duplicateMessage = (error as Error).message;
  }
  expect(duplicateMessage, 'a second TokenTable binding must fail the contract').toContain(
    'TokenTable',
  );

  // Mutation: a copied palette (the docs --primary line, taken from the real
  // sheet at runtime) in an isolated copy must fail.
  const primaryMatch = SRC.docsCss.match(/^ *--primary: .*$/m);
  expect(primaryMatch, 'docs sheet source truth: --primary exists').toBeTruthy();
  const primaryLine = (primaryMatch as RegExpMatchArray)[0].trim();
  let paletteMessage = '';
  try {
    tokenBoundaryContract(
      mutatedManuscript(
        THEMING_REL,
        (text) => `${text}\n\nCopied palette:\n\n\`\`\`css\n${primaryLine}\n\`\`\`\n`,
      ),
      THEMING_REL,
    );
  } catch (error) {
    paletteMessage = (error as Error).message;
  }
  expect(paletteMessage, 'a copied --primary palette literal must fail the contract').toContain(
    'palette literal',
  );
});

it('ORI-CONT-002-engine-provenance', () => {
  const manuscript = parseManuscript(THEMING_REL);
  engineProvenanceContract(manuscript, THEMING_REL);
  const themeBlock = consumerThemeBlock(SRC.exampleCss);
  const provenanceFence = manuscript.fences.find(
    (fence) => SRC.exampleCss.includes(fence) && themeBlock.includes(fence),
  );
  expect(provenanceFence, 'the @theme provenance example exists').toBeTruthy();
  console.log(
    `[ORI-CONT-002] engine provenance: @theme example resolves byte-exact against ` +
      `apps/example/global.css (${(provenanceFence as string).length} bytes)`,
  );

  // Mutation: altering one byte of the example must break its provenance.
  const fence = provenanceFence as string;
  const altered = fence.replace(/(\d+)\.(\d{3})/, (_all, a: string, b: string) => {
    const last = b.endsWith('9') ? '8' : '9';
    return `${a}.${b.slice(0, -1)}${last}`;
  });
  expect(altered, 'the byte mutation must differ from the original example').not.toBe(fence);
  let byteMessage = '';
  try {
    engineProvenanceContract(
      mutatedManuscript(THEMING_REL, (text) => text.replace(fence, altered)),
      THEMING_REL,
    );
  } catch (error) {
    byteMessage = (error as Error).message;
  }
  expect(byteMessage, 'an altered example byte must fail the provenance check').toMatch(
    /verbatim|real source bytes/,
  );

  // Mutation: altering every mention of the named source path must fail the
  // provenance check.
  let pathMessage = '';
  try {
    engineProvenanceContract(
      mutatedManuscript(THEMING_REL, (text) =>
        text.replaceAll('apps/example/global.css', 'apps/example/theme.css'),
      ),
      THEMING_REL,
    );
  } catch (error) {
    pathMessage = (error as Error).message;
  }
  expect(pathMessage, 'an altered source reference must fail the contract').toContain(
    'apps/example/global.css',
  );
});

it('ORI-CONT-002-dark-mode-explanation', () => {
  const manuscript = parseManuscript(DARK_MODE_REL);
  darkModeContract(manuscript, DARK_MODE_REL);
  console.log(
    `[ORI-CONT-002] dark mode: ownership split stated, resolution order ` +
      `rnr-theme -> prefers-color-scheme -> dark, 3 onward links, no numbered lesson`,
  );

  // Mutation: an emptied copy must fail the ownership assertions.
  let emptyMessage = '';
  try {
    darkModeContract({ ...manuscript, body: '', prose: '', fences: [] }, DARK_MODE_REL);
  } catch (error) {
    emptyMessage = (error as Error).message;
  }
  expect(emptyMessage, 'an empty dark-mode body must fail the contract').toContain('your app');

  // Mutation: a disconnected storage key must fail against the real source key.
  let keyMessage = '';
  try {
    darkModeContract(
      mutatedManuscript(DARK_MODE_REL, (text) => text.replaceAll('rnr-theme', 'docs-theme')),
      DARK_MODE_REL,
    );
  } catch (error) {
    keyMessage = (error as Error).message;
  }
  expect(
    keyMessage,
    'renaming the storage key in the manuscript must fail the contract naming rnr-theme',
  ).toContain('rnr-theme');
});
