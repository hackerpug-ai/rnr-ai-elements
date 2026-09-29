import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * GBC-016 — source-contract scan over the section-index shell in the REAL
 * apps/docs/src tree: SectionIndexLayout.astro (NEW), DocsNav.astro (NEW) and
 * MarkdownLayout.astro (MODIFIED to consume the DocsNav extraction).
 *
 * UNIT_TEST_JUSTIFIED: AC-6 is a pure source-contract scan that only reads
 * three .astro files from the real working tree (no runtime, no service) —
 * the same real-file-read pattern as the landed
 * tests/sprint-06-guides-boundary-changelog/index-list-source.test.ts. It is
 * this early task's only proof that can pass at its own close: every rendered
 * claim (/guides, /changelog, the no-Toc rail, the 393px single column, the
 * docs-section nav) runs in a Playwright spec that GBC-010 or GBC-008 writes
 * later, and those specs' pages (apps/docs/src/pages/**) are outside this
 * task's write_allowed.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SECTION_INDEX_LAYOUT = join(repoRoot, 'apps/docs/src/layouts/SectionIndexLayout.astro');
const DOCS_NAV = join(repoRoot, 'apps/docs/src/components/DocsNav.astro');
const MARKDOWN_LAYOUT = join(repoRoot, 'apps/docs/src/layouts/MarkdownLayout.astro');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
/** A grid-template-columns value with 2+ space-separated tracks. */
const TWO_TRACK = /grid-template-columns:\s*(?:var\([^)]+\)|[^\s;]+)\s+[^\s;]/;

function ruleFor(style: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = style.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `style carries a ${selector} rule`).toBeTruthy();
  return match?.[1] ?? '';
}

function readSource(path: string, label: string): string {
  expect(existsSync(path), `${label} exists at ${path}`).toBe(true);
  const source = readFileSync(path, 'utf8');
  expect(source.length, `${label} is not an empty stub`).toBeGreaterThan(0);
  return source;
}

function splitSource(source: string, label: string) {
  const open = source.indexOf('---');
  const close = source.indexOf('---', open + 3);
  const styleStart = source.indexOf('<style>');
  const styleEnd = source.lastIndexOf('</style>');
  expect(open, `${label}: frontmatter fences exist`).toBeGreaterThanOrEqual(0);
  expect(close, `${label}: the frontmatter closes`).toBeGreaterThan(open);
  expect(styleStart, `${label}: a scoped style block exists`).toBeGreaterThan(close);
  expect(styleEnd, `${label}: the style block closes`).toBeGreaterThan(styleStart);
  return {
    frontmatter: source.slice(open + 3, close),
    template: source.slice(close + 3, styleStart),
    style: source.slice(styleStart + '<style>'.length, styleEnd),
  };
}

/** The full text of one `@media (...)` block, brace-counted through nesting. */
function mediaBlock(style: string, query: string): string {
  const start = style.indexOf(query);
  expect(start, `the style declares ${query}`).toBeGreaterThanOrEqual(0);
  const open = style.indexOf('{', start);
  expect(open, `${query} opens a block`).toBeGreaterThan(start);
  let depth = 0;
  for (let i = open; i < style.length; i++) {
    if (style[i] === '{') depth++;
    else if (style[i] === '}') {
      depth--;
      if (depth === 0) return style.slice(start, i + 1);
    }
  }
  return style.slice(start);
}

// One named source-contract selector (AC-6); its assertions are the contract
// verbatim, so the block is intentionally wide rather than split across
// artificial seams — the same shape as the landed sprint-03/05/06 contract
// tests.
// fallow-ignore-next-line complexity
it('GBC-016-section-index-layout-source-contract: DocsLayout+PageHeader+SectionHeader+DocsNav composition, one default slot, no Toc, a 1fr/96rem/1.5rem grid whose 2-track form lives only inside min-width:64rem, DocsNav carrying the shared nav, and MarkdownLayout consuming the extraction', () => {
  const layoutSource = readSource(SECTION_INDEX_LAYOUT, 'SectionIndexLayout.astro');
  const navSource = readSource(DOCS_NAV, 'DocsNav.astro');
  const markdownSource = readSource(MARKDOWN_LAYOUT, 'MarkdownLayout.astro');
  const layout = splitSource(layoutSource, 'SectionIndexLayout.astro');
  const nav = splitSource(navSource, 'DocsNav.astro');
  const markdown = splitSource(markdownSource, 'MarkdownLayout.astro');

  // --- SectionIndexLayout: the composition contract.
  for (const importLine of [
    "import DocsLayout from './DocsLayout.astro'",
    "import PageHeader from '../components/PageHeader.astro'",
    "import SectionHeader from '../components/SectionHeader.astro'",
    "import DocsNav from '../components/DocsNav.astro'",
  ]) {
    expect(layout.frontmatter, `frontmatter holds: ${importLine}`).toContain(importLine);
  }
  for (const tag of ['<DocsLayout', '<PageHeader', '<SectionHeader', '<DocsNav']) {
    expect(layout.template, `the template composes ${tag}`).toContain(tag);
  }

  // Exactly ONE slot — the default slot that carries the IndexList (the pages
  // compose <IndexList rows={...} /> into it; IndexList itself has no slot).
  expect(layout.template.match(/<slot/g)?.length ?? 0, 'exactly 1 slot (the default)').toBe(1);

  // Reading order: the docs nav precedes the body; PageHeader, then
  // SectionHeader, then the slot.
  const navAt = layout.template.indexOf('<DocsNav');
  const mainAt = layout.template.indexOf('<main');
  const pageHeaderAt = layout.template.indexOf('<PageHeader');
  const sectionHeaderAt = layout.template.indexOf('<SectionHeader');
  const slotAt = layout.template.indexOf('<slot');
  expect(navAt, 'the docs nav precedes the body').toBeLessThan(mainAt);
  expect(pageHeaderAt, 'PageHeader precedes SectionHeader').toBeLessThan(sectionHeaderAt);
  expect(sectionHeaderAt, 'SectionHeader precedes the slot').toBeLessThan(slotAt);

  // The root element carries data-section-index and IS the grid: the same
  // element carries the grid class, whose rule declares the contract values.
  const rootOpen = layout.template.match(/<div[^>]*data-section-index[^>]*>/)?.[0] ?? '';
  expect(rootOpen, 'a root element carries data-section-index').toBeTruthy();
  expect(rootOpen, 'the data attribute rides the grid class element').toMatch(
    /class="[^"]*\bsection-index\b/,
  );
  const rootRule = ruleFor(layout.style, '.section-index');
  expect(rootRule, 'the root is a grid').toContain('display: grid');
  expect(rootRule, 'single column by default').toContain('grid-template-columns: 1fr');
  expect(rootRule, 'the /components + /registry measure').toContain('max-width: 96rem');
  expect(rootRule, 'the shared page padding').toContain('padding: 1.5rem');

  // The 2-track grid exists ONLY inside the lg media query — and never a
  // third track (no 80rem query, no ToC rail column).
  const lgBlock = mediaBlock(layout.style, '@media (min-width: 64rem)');
  const outsideLg = layout.style.replace(lgBlock, '');
  expect(lgBlock, 'the lg query sets the 2-track grid').toMatch(TWO_TRACK);
  expect(lgBlock, 'the sidebar track is the layout token').toContain(
    'grid-template-columns: var(--layout-sidebar-w) minmax(0, 1fr)',
  );
  expect(outsideLg.match(TWO_TRACK), 'no 2-track grid outside the lg query').toBeNull();
  expect(layout.style, 'no xl/80rem third track (no ToC column)').not.toContain('80rem');

  // --- DocsNav: the ONE docs-section nav implementation.
  expect(navSource, 'DocsNav carries the data hook').toContain('data-docs-nav');
  expect(navSource, 'DocsNav carries the accessible name').toContain('aria-label="Documentation"');
  expect(ruleFor(nav.style, '.docs-nav__list'), 'the list styles live here').toContain(
    'list-style: none',
  );
  expect(ruleFor(nav.style, '.docs-nav__list a'), 'the 44px touch target lives here').toContain(
    'min-height: 44px',
  );
  expect(
    ruleFor(nav.style, '.docs-nav__section-title'),
    'the section title rides the muted token',
  ).toContain('color: var(--muted-foreground)');
  expect(
    ruleFor(nav.style, '.docs-nav__list a:hover'),
    'hover fills with the accent token',
  ).toContain('background: var(--accent)');

  // --- MarkdownLayout: consumer #1 of the extraction.
  expect(markdownSource, 'MarkdownLayout imports the extraction').toContain(
    "import DocsNav from '../components/DocsNav.astro'",
  );
  expect(markdown.template, 'MarkdownLayout composes DocsNav').toContain('<DocsNav');
  expect(markdown.template, 'the nav groups still flow from the publication contract').toMatch(
    /<DocsNav\s+nav=\{nav\}/,
  );
  expect(markdown.template, 'the current id still drives aria-current').toContain('currentId={id}');
  expect(
    markdownSource.split('docs-nav__list').length - 1,
    '0 docs-nav__list literals left in MarkdownLayout',
  ).toBe(0);
  expect(markdownSource.match(/docs-nav__/g)?.length ?? 0, '0 docs-nav CSS left behind').toBe(0);
  expect(markdownSource, 'the nav markup moved out (not duplicated)').not.toContain(
    'data-docs-nav',
  );

  // --- MUST_NOT, on both new files: no Toc, no scripts, no raw colors.
  expect(layoutSource, 'no Toc.astro import in the section-index layout').not.toContain(
    'Toc.astro',
  );
  expect(layout.template, 'no Toc composition').not.toContain('<Toc');
  for (const [label, source] of [
    ['SectionIndexLayout.astro', layoutSource],
    ['DocsNav.astro', navSource],
  ] as const) {
    expect(source.match(/<script/g)?.length ?? 0, `${label}: 0 script tags`).toBe(0);
    expect(source.match(HEX_LITERAL), `${label}: no hex color literals`).toBeNull();
    for (const colorFunction of ['rgb(', 'hsl(', 'oklch(']) {
      expect(source, `${label}: no raw ${colorFunction} color function`).not.toContain(
        colorFunction,
      );
    }
  }

  // Seeded evidence on stdout, not just exit 0.
  console.log(
    'GBC-016 source contract: SectionIndexLayout composes DocsLayout + PageHeader + ' +
      'SectionHeader + DocsNav with exactly 1 default slot, 0 Toc imports, 0 scripts; ' +
      `grid 1fr / max-width 96rem / padding 1.5rem with the 2-track only inside ` +
      `@media (min-width: 64rem); DocsNav holds data-docs-nav + aria-label="Documentation" + ` +
      `the .docs-nav__list styles (44px targets); MarkdownLayout imports DocsNav with ` +
      `${markdownSource.split('docs-nav__list').length - 1} docs-nav__list literals remaining.`,
  );
});
