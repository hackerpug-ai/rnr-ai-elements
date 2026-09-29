import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * GBC-015 — source-contract scan over IndexList.astro in the REAL
 * apps/docs/src tree, plus the components/ listing.
 *
 * UNIT_TEST_JUSTIFIED: AC-5 is a pure source-contract scan that only reads
 * IndexList.astro and its directory listing from the real working tree (no
 * runtime, no service) — the same real-file-read pattern as the landed
 * tests/sprint-03-family-browse/component-contract.test.ts. It is this early
 * task's only proof that can pass at its own close: every rendered claim
 * (5 rows on /guides, newest-first /changelog, row anatomy, touched-component
 * links) runs in a Playwright spec that GBC-010 or GBC-008 writes later, and
 * those specs' pages (apps/docs/src/pages/**) are outside this task's
 * write_allowed.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentsDir = join(repoRoot, 'apps', 'docs', 'src', 'components');
const INDEX_LIST = join(componentsDir, 'IndexList.astro');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
const REQUIRED_TOKENS = [
  'var(--foreground)',
  'var(--muted-foreground)',
  'var(--border)',
  'var(--accent)',
  'var(--radius-md)',
] as const;

function ruleFor(style: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = style.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `style carries a ${selector} rule`).toBeTruthy();
  return match?.[1] ?? '';
}

// One named source-contract selector (AC-5); its assertions are the contract
// verbatim, so the block is intentionally wide rather than split across
// artificial seams — the same shape as the landed sprint-03/05 contract tests.
// fallow-ignore-next-line complexity
it('GBC-015-index-list-source-contract: one li row markup with the data-index-list hooks, 44px min-height, token-only styles, 0 scripts, Chip reuse, no per-variant sibling', () => {
  expect(existsSync(INDEX_LIST), `IndexList exists at ${INDEX_LIST}`).toBe(true);
  const source = readFileSync(INDEX_LIST, 'utf8');
  expect(source.length, 'the file is not an empty stub').toBeGreaterThan(0);

  // Split the frontmatter, the template and the <style> block.
  const open = source.indexOf('---');
  const close = source.indexOf('---', open + 3);
  const styleStart = source.indexOf('<style>');
  const styleEnd = source.lastIndexOf('</style>');
  expect(open, 'frontmatter fences exist').toBeGreaterThanOrEqual(0);
  expect(close, 'the frontmatter closes').toBeGreaterThan(open);
  expect(styleStart, 'a scoped style block exists').toBeGreaterThan(close);
  expect(styleEnd, 'the style block closes').toBeGreaterThan(styleStart);
  const frontmatter = source.slice(open + 3, close);
  const template = source.slice(close + 3, styleStart);
  const style = source.slice(styleStart + '<style>'.length, styleEnd);

  // ONE row markup: exactly 1 <li> carrying data-index-list-row, inside a
  // <ul> carrying data-index-list.
  const liTags = template.match(/<li[\s>]/g) ?? [];
  expect(liTags.length, 'exactly 1 li row markup in the template').toBe(1);
  const liOpen = template.match(/<li[^>]*>/)?.[0] ?? '';
  expect(liOpen, 'the li carries data-index-list-row').toContain('data-index-list-row');
  const ulOpen = template.match(/<ul[^>]*>/)?.[0] ?? '';
  expect(ulOpen, 'the list root is a ul carrying data-index-list').toContain('data-index-list');
  expect(template.indexOf('<li'), 'the li sits inside the ul').toBeGreaterThan(
    template.indexOf('<ul'),
  );

  // The data hooks: title anchor + description element.
  const titleAnchors = template.match(/<a[^>]*data-index-list-title[^>]*>/g) ?? [];
  expect(titleAnchors.length, 'exactly 1 title anchor markup').toBe(1);
  const titleOpen = titleAnchors[0] ?? '';
  expect(titleOpen, 'the title hook rides an anchor with an href binding').toMatch(
    /href=\{row\.href\}/,
  );
  const descriptionOpens = template.match(/<p[^>]*data-index-list-description[^>]*>/g) ?? [];
  expect(descriptionOpens.length, 'exactly 1 description element markup').toBe(1);

  // The never-nested-anchor rule, at the source: the title anchor's content
  // is ONLY the title expression — no anchor, no Chip, no element ever opens
  // inside it (AC-3's raw-HTML check reads the rendered form of exactly this).
  const afterTitle = template.slice(template.indexOf(titleOpen) + titleOpen.length);
  const titleClose = afterTitle.indexOf('</a>');
  expect(titleClose, 'the title anchor closes').toBeGreaterThanOrEqual(0);
  expect(afterTitle.slice(0, titleClose).trim(), 'the title anchor holds only the title').toBe(
    '{row.title}',
  );

  // ONE composition model: rows arrive as the typed rows prop — no slot form.
  expect(frontmatter, 'the rows prop is required and typed').toMatch(
    /rows: readonly IndexListRow\[\]/,
  );
  expect(template, 'the template iterates the rows prop').toMatch(/rows\.map\(/);
  expect(template, 'no slot form — one composition model only').not.toContain('<slot');

  // The Chip reuse: imported in the frontmatter, composed counter-less.
  expect(frontmatter).toContain("import Chip from './Chip.astro'");
  expect(template, 'exactly one Chip composition per row markup').toMatch(
    /<Chip value=\{row\.meta\}/,
  );
  expect(template, 'the row Chip is counter-less').not.toContain('counter=');

  // Sibling anchors: touched-component links render inside the li, outside
  // the title anchor, and ride above the stretched ::after so they stay
  // clickable — the rendered specs GET their hrefs but never click, so this
  // source rule is what actually keeps them operable.
  const linkRule = ruleFor(style, '.index-list__link');
  expect(linkRule).toContain('position: relative');
  expect(linkRule).toContain('z-index: 1');

  // The 44px touch target and the ::after stretch.
  expect(style, 'the 44px min-height is declared').toContain('min-height: 44px');
  const rowRule = ruleFor(style, '.index-list__row');
  expect(rowRule, 'the row is the positioned containing block for the stretch').toContain(
    'position: relative',
  );
  const afterRule = ruleFor(style, '.index-list__title::after');
  expect(afterRule, 'the stretch is absolutely positioned').toContain('position: absolute');
  expect(afterRule, 'the stretch covers the whole row').toContain('inset: 0');

  // Anchor jumps stop clear of the sticky Header.
  expect(style).toContain('scroll-margin-block-start: calc(var(--layout-header-h) + 1rem)');

  // The token surface: every required token at least once, and the row's
  // color/divider/hover roles land where the contract pins them.
  for (const token of REQUIRED_TOKENS) {
    const refs = style.split(token).length - 1;
    expect(refs, `${token} is referenced at least once`).toBeGreaterThanOrEqual(1);
  }
  expect(ruleFor(style, '.index-list__title')).toContain('color: var(--foreground)');
  expect(ruleFor(style, '.index-list__description')).toContain('color: var(--muted-foreground)');
  expect(rowRule).toContain('border-block-end: 1px solid var(--border)');
  expect(ruleFor(style, '.index-list__row:hover')).toContain('background: var(--accent)');
  expect(rowRule).toContain('border-radius: var(--radius-md)');

  // MUST_NOT: no color literal, no island, no per-variant sibling.
  expect(style.match(HEX_LITERAL), 'no hex color literals in the style block').toBeNull();
  for (const colorFunction of ['rgb(', 'hsl(', 'oklch(']) {
    expect(source, `no raw ${colorFunction} color function in the file`).not.toContain(
      colorFunction,
    );
  }
  expect(source.match(/<script/g)?.length ?? 0, '0 script tags').toBe(0);
  const indexListFiles = readdirSync(componentsDir).filter((name) => name.startsWith('IndexList'));
  expect(indexListFiles, 'exactly one IndexList file, no per-variant fork').toEqual([
    'IndexList.astro',
  ]);
  expect(indexListFiles, 'no IndexListGuides.astro sibling').not.toContain('IndexListGuides.astro');
  expect(indexListFiles, 'no IndexListChangelog.astro sibling').not.toContain(
    'IndexListChangelog.astro',
  );

  // Seeded evidence on stdout, not just exit 0.
  console.log(
    `GBC-015 source contract: ${liTags.length} li row markup with the data-index-list hooks, ` +
      `44px min-height + ::after stretch + scroll-margin present, ` +
      `${REQUIRED_TOKENS.length}/${REQUIRED_TOKENS.length} required tokens referenced, ` +
      `1 counter-less Chip composition, 0 script tags, 0 raw color functions, ` +
      `components/ holds exactly ${indexListFiles.length} IndexList file (${indexListFiles.join(', ')})`,
  );
});
