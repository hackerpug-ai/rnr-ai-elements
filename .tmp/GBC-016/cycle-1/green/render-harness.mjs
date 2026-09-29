// GBC-016 real-render harness (scratch — not committed).
//
// The docs build never compiles an orphan layout, so this renders
// apps/docs/src/layouts/SectionIndexLayout.astro through the REAL Astro
// compiler + SSR (vite dev server with Astro's own plugin chain, then the
// experimental AstroContainer) — including the full DocsLayout shell,
// Header, islands and the DocsNav extraction — with the REAL IndexList
// rendered first and fed in as the default slot, exactly how GBC-010's
// /guides page will compose it. Asserts the rendered contract the
// GBC-008/GBC-010 specs key on. Run with cwd = apps/docs. Exits non-zero on
// the first failed assertion.

import assert from 'node:assert/strict';

const DOCS = new URL('../../../../apps/docs/', import.meta.url).pathname;
// vite is not a direct dep of apps/docs (pnpm isolated linker) — resolve the
// instance astro itself uses, via astro's REAL .pnpm location (realpath, so
// dependency resolution finds astro's own node_modules).
const { createRequire } = await import('node:module');
const { realpathSync } = await import('node:fs');
const astroReal = realpathSync(`${DOCS}/node_modules/astro`);
const astroRequire = createRequire(`${astroReal}/package.json`);
const vitePath = astroRequire.resolve('vite');
const { createServer } = await import(`file://${vitePath}`);
const { getViteConfig } = await import(`file://${DOCS}/node_modules/astro/dist/config/index.js`);
const { experimental_AstroContainer: AstroContainer } = await import(
  `file://${DOCS}/node_modules/astro/dist/container/index.js`
);

// Boot vite with Astro's own plugin chain (the same factory astro docs ship
// for vitest), then compile the components through it.
const factory = getViteConfig({});
const astroVite = await factory({ mode: 'development', command: 'serve' });
const server = await createServer({
  ...astroVite,
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
const { default: IndexList } = await server.ssrLoadModule('/src/components/IndexList.astro');
const { default: SectionIndexLayout } = await server.ssrLoadModule(
  '/src/layouts/SectionIndexLayout.astro'
);

// The REAL IndexList rendered first — its html becomes the layout's default
// slot content, the same composition <SectionIndexLayout><IndexList .../></...>
// performs. Rows cover both section-index forms (guide + release).
const GUIDE_ROW = {
  href: '/guides/re-theme',
  title: 'Re-theme every primitive',
  description: 'Point the token sheet at your palette and flip both themes.',
};
const RELEASE_ROW = {
  id: 'r021',
  href: '/changelog/0.2.1',
  title: '0.2.1',
  meta: '2026-09-08',
};
const container = await AstroContainer.create();
const indexListHtml = await container.renderToString(IndexList, {
  props: { rows: [GUIDE_ROW, RELEASE_ROW] },
});

// The publication navigation, in the shape docs-navigation.sectionNavigation
// emits (the lib carries its own landed tests; here it is prop data).
const entry = (id, title, section, order) => ({
  id,
  title,
  description: '',
  section,
  order,
  href: `/docs/${id}`,
  sourcePath: `apps/docs/src/content/docs/${id}.md`,
});
const nav = [
  { section: 'getting-started', entries: [entry('introduction', 'Introduction', 'getting-started', 1)] },
  { section: 'guides', entries: [entry('re-theme', 'Re-theme every primitive', 'guides', 1)] },
  { section: 'porting', entries: [entry('mapping', 'Porting mapping', 'porting', 1)] },
];

const html = await container.renderToString(SectionIndexLayout, {
  props: {
    title: 'Guides',
    description: 'Do one how-to job with the registry.',
    sectionTitle: 'All guides',
    anchor: 'all-guides',
    count: 2,
    nav,
  },
  slots: { default: indexListHtml },
});

console.log('--- rendered SectionIndexLayout HTML (length ' + html.length + ') ---');
const gridAt = html.indexOf('data-section-index');
console.log(html.slice(Math.max(0, gridAt - 200), gridAt + 2400));
console.log('--- end excerpt ---');

// The document shell came through the REAL DocsLayout.
assert.ok(html.includes('<title>Guides — RNR AI Elements</title>'), 'DocsLayout masthead title');

// Exactly one section-index grid root.
const gridOpens = html.match(/<div[^>]*data-section-index[^>]*>/g) ?? [];
assert.equal(gridOpens.length, 1, 'exactly one data-section-index root');
assert.ok(gridOpens[0].includes('class="section-index"'), 'the root carries the grid class');

// PageHeader: exactly one h1 with the page title + the description.
const h1s = html.match(/<h1[^>]*>/g) ?? [];
assert.equal(h1s.length, 1, 'exactly one h1 (the PageHeader title)');
const h1Match = html.match(/<h1[^>]*class="[^"]*page-header__title[^"]*"[^>]*>([\s\S]*?)<\/h1>/);
assert.ok(h1Match, 'the h1 is the page-header title');
assert.equal(h1Match[1].trim(), 'Guides', 'h1 text');
assert.ok(html.includes('Do one how-to job with the registry.'), 'description renders');

// SectionHeader: anchored h2 + a SEPARATE sibling count chip whose value
// equals the row count; the literal "(count)" string never exists.
const h2Match = html.match(
  /<h2[^>]*id="all-guides"[^>]*>([\s\S]*?)<\/h2>/,
);
assert.ok(h2Match, 'the anchored section h2 renders');
assert.equal(h2Match[1].trim(), 'All guides', 'h2 text');
const sectionHeaderAt = html.indexOf('<div class="section-header');
assert.ok(sectionHeaderAt >= 0, 'the section-header block renders');
const sectionHeaderChunk = html.slice(sectionHeaderAt, sectionHeaderAt + 600);
const chipMatch = sectionHeaderChunk.match(/<span[^>]*class="[^"]*\bchip\b[^"]*"[^>]*>([\s\S]*?)<\/span>/);
assert.ok(chipMatch, 'a chip sibling of the h2 renders');
assert.equal(chipMatch[1].trim(), '2', 'chip text equals the row count');
assert.ok(!html.includes('All guides (2)'), 'no literal count-in-title string');

// DocsNav: the ONE docs-section nav, three groups in order, each with links.
const navOpens = html.match(/<nav[^>]*data-docs-nav[^>]*>/g) ?? [];
assert.equal(navOpens.length, 1, 'exactly one docs nav (no second sidebar)');
assert.ok(navOpens[0].includes('aria-label="Documentation"'), 'nav accessible name');
const navChunk = html.slice(html.indexOf('data-docs-nav'));
const titles = [...navChunk.matchAll(/class="[^"]*docs-nav__section-title[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)].map(
  (m) => m[1].trim()
);
assert.deepEqual(titles, ['Getting started', 'Guides', 'Porting'], 'group titles in order');
const lists = navChunk.match(/class="[^"]*docs-nav__list[^"]*"/g) ?? [];
assert.equal(lists.length, 3, 'three group lists');
for (const list of lists) {
  void list; // each list's link presence is asserted by the 3-link count below
}
const navLinks = navChunk.match(/<a [^>]*href="\/docs\//g) ?? [];
assert.equal(navLinks.length, 3, 'each group holds a link');
assert.ok(!navChunk.includes('aria-current'), 'no current entry marked on a section index');

// The slotted IndexList rides INSIDE the section-index grid.
const rowOpens = html.match(/<li[^>]*data-index-list-row[^>]*>/g) ?? [];
assert.equal(rowOpens.length, 2, 'both slotted rows render');
const firstRowAt = html.indexOf('data-index-list-row');
assert.ok(firstRowAt > gridAt, 'rows sit inside the data-section-index grid');
assert.ok(html.includes('href="/guides/re-theme"'), 'guide row href slotted through');
assert.ok(html.includes('href="/changelog/0.2.1"'), 'release row href slotted through');

// No ToC rail of any form.
assert.ok(!html.includes('On this page'), 'no ToC rail label');
assert.ok(!html.includes('toc__nav'), 'no toc__nav element');

// The scoped stylesheets: the container renders partials without <style>
// tags, so fetch the CLIENT transform of each component's style module —
// the exact CSS a browser loads for it.
const layoutCss =
  (
    await server.transformRequest('/src/layouts/SectionIndexLayout.astro?astro&type=style&index=0&lang.css', {
      ssr: false,
    })
  )?.code ?? '';
assert.ok(layoutCss.length > 0, 'the layout emits a compiled stylesheet');
assert.ok(layoutCss.includes('data-astro-cid'), 'stylesheet is scoped');
assert.match(layoutCss, /grid-template-columns:\s*1fr/, 'single-column track');
assert.match(layoutCss, /max-width:\s*96rem/, 'the 96rem measure');
assert.match(layoutCss, /padding:\s*1\.5rem/, 'the 1.5rem page padding');
// The dev client transform modernizes the query to range syntax
// ((width >= 64rem)); accept either the authored or the modernized form.
const lgMatch = layoutCss.match(/@media \((?:min-width: 64rem|width >= 64rem)\)/);
assert.ok(lgMatch, 'the lg media query exists');
const lgAt = lgMatch.index;
assert.match(
  layoutCss.slice(lgAt),
  /grid-template-columns:\s*var\(--layout-sidebar-w\)\s*minmax\(0,\s*1fr\)/,
  'the 2-track grid inside the lg query'
);
const beforeLg = layoutCss.slice(0, lgAt);
assert.doesNotMatch(
  beforeLg,
  /grid-template-columns:\s*(?:var\([^)]+\)|[^\s;}])+\s+[^\s;}]/,
  'no 2-track grid outside the lg query'
);
assert.ok(!layoutCss.includes('80rem'), 'no xl third track');

const navCss =
  (
    await server.transformRequest('/src/components/DocsNav.astro?astro&type=style&index=0&lang.css', {
      ssr: false,
    })
  )?.code ?? '';
assert.ok(navCss.length > 0, 'DocsNav emits a compiled stylesheet');
assert.ok(navCss.includes('docs-nav__list'), 'the docs-nav__list styles live here');
assert.match(navCss, /min-height:\s*44px/, '44px touch targets');
for (const token of ['var(--muted-foreground)', 'var(--accent)', 'var(--radius-md)']) {
  assert.ok(navCss.includes(token), `${token} rides the DocsNav stylesheet`);
}
for (const css of [layoutCss, navCss]) {
  assert.equal(css.match(/#[0-9a-fA-F]{3,8}/), null, 'no hex literal in the rendered css');
}

console.log(
  'GBC-016 render harness: PASS — SectionIndexLayout rendered through the real Astro compiler+SSR ' +
    '(full DocsLayout shell): 1 data-section-index grid, h1 Guides, anchored h2 All guides + chip 2 ' +
    '(no literal "(2)"), 1 docs nav with 3 groups x links, 2 slotted IndexList rows inside the grid, ' +
    '0 ToC rails; compiled stylesheets carry 1fr/96rem/1.5rem + lg-only 2-track + 44px nav targets, ' +
    '0 hex literals.'
);
await server.close();
