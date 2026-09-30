import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * GBC-017 — source-contract scan over Prose.astro in the REAL apps/docs/src
 * tree: the markdown-table chrome that makes the boundary and porting claims
 * scannable.
 *
 * UNIT_TEST_JUSTIFIED: AC-6 is a pure source-contract scan that only reads
 * Prose.astro from the real working tree (no runtime, no service) — the same
 * real-file-read pattern as the landed tests/sprint-06-guides-boundary-changelog/
 * index-list-source.test.ts. The rendered table claims ride the FLOW-DOCS-04
 * and FLOW-DOCS-05 Playwright specs (written by GBC-003 and GBC-009), which
 * this late task must leave green but may not edit.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PROSE = join(repoRoot, 'apps', 'docs', 'src', 'components', 'Prose.astro');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
const RAW_COLOR_FUNCTION = /(?:rgb|hsl|oklch)\(/i;

/** One rule's declaration list, or FAIL when absent. `selector` is a bodyless
 * regex fragment (`.prose :global(table)` arrives pre-escaped by the caller). */
function ruleFor(style: string, selector: string, what: string): string {
  const match = style.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
  expect(match, what).toBeTruthy();
  return match?.[1] ?? '';
}

/** The body of an @media block, brace-counted to its closing brace. */
function mediaBlock(style: string, query: string, what: string): string {
  const at = style.indexOf(query);
  expect(at, what).toBeGreaterThanOrEqual(0);
  const open = style.indexOf('{', at);
  let depth = 0;
  for (let index = open; index < style.length; index += 1) {
    if (style[index] === '{') depth += 1;
    if (style[index] === '}') {
      depth -= 1;
      if (depth === 0) return style.slice(open + 1, index);
    }
  }
  return '';
}

// One named source-contract selector (AC-6 / TC-6); its assertions are the
// contract verbatim, so the block is intentionally wide rather than split
// across artificial seams — the same shape as the landed sprint-06 contract
// tests.
// fallow-ignore-next-line complexity
it('GBC-017-prose-table-source-contract: block/scroll table, var(--muted) zebra, var(--border) dividers, anywhere-wrapping cells, media first-column max-width, DataTable twin comment, tokens only, 0 scripts, no sticky thead, no pinned column', () => {
  expect(existsSync(PROSE), `Prose exists at ${PROSE}`).toBe(true);
  const source = readFileSync(PROSE, 'utf8');
  expect(source.length, 'the file is not an empty stub').toBeGreaterThan(0);

  const styleStart = source.indexOf('<style>');
  const styleEnd = source.lastIndexOf('</style>');
  expect(styleStart, 'a scoped style block exists').toBeGreaterThanOrEqual(0);
  expect(styleEnd, 'the style block closes').toBeGreaterThan(styleStart);
  const style = source.slice(styleStart + '<style>'.length, styleEnd);

  // The table itself is its own horizontal scroller (the one native pattern —
  // no wrapper element, no rehype plugin).
  const tableRule = ruleFor(
    style,
    String.raw`\.prose :global\(table\)`,
    'style carries a .prose table rule',
  );
  expect(tableRule, 'the table rule declares display: block').toContain('display: block');
  expect(tableRule, 'the table rule declares overflow-x: auto').toContain('overflow-x: auto');

  // DataTable's zebra: even body rows band on var(--muted).
  const zebraRule = ruleFor(
    style,
    String.raw`:global\(tbody tr:nth-child\(even\) td\)`,
    'style carries a tbody tr:nth-child(even) cells rule',
  );
  expect(zebraRule, 'the zebra rule bands even rows on var(--muted)').toContain(
    'background: var(--muted)',
  );

  // DataTable's dividers: one var(--border) hairline atop every cell.
  const cellRule = ruleFor(
    style,
    String.raw`:global\(th\)[^{}]*:global\(td\)`,
    'style carries a th + td rule',
  );
  expect(cellRule, 'the th/td rule draws border-top on var(--border)').toContain(
    'border-top: 1px solid var(--border)',
  );
  // The standalone td rule (not the shared th/td chrome rule) carries the wrap.
  const tdRules = [...style.matchAll(/\.prose :global\(td\)\s*\{([^}]*)\}/g)].map(
    (match) => match[1] ?? '',
  );
  expect(
    tdRules.some((declarations) => declarations.includes('overflow-wrap: anywhere')),
    'a td rule declares overflow-wrap: anywhere',
  ).toBe(true);

  // Below 48rem the first column takes a capped width so sentence-length
  // deviation cells wrap instead of blowing the layout.
  const mobile = mediaBlock(
    style,
    '@media (max-width: 48rem)',
    'style carries a 48rem media block',
  );
  expect(mobile, 'the 48rem media block styles :first-child cells').toMatch(/:first-child/);
  expect(mobile, 'the 48rem media block sets a max-width').toMatch(/max-width:\s*[^;]+;/);

  // The twin declaration: a comment names DataTable.astro as the chrome kept
  // in lockstep.
  const comments = style.match(/\/\*[\s\S]*?\*\//g) ?? [];
  const twinComment = comments.find(
    (comment) => comment.includes('DataTable.astro') && comment.includes('lockstep'),
  );
  expect(twinComment, 'a style comment names DataTable.astro as the lockstep twin').toBeTruthy();

  // Tokens only, and zero JavaScript — the whole FILE, not just the style.
  expect(source.match(HEX_LITERAL) ?? [], 'no hex color literal in Prose.astro').toEqual([]);
  expect(
    source.match(RAW_COLOR_FUNCTION) ?? [],
    'no raw rgb(/hsl(/oklch( color function in Prose.astro',
  ).toEqual([]);
  expect(source.match(/<script/g) ?? [], 'no script tag in Prose.astro').toEqual([]);

  // The two cut divergences from DataTable's chrome: no pinned first column,
  // and no sticky thead (display:block + overflow-x:auto makes each table its
  // own scroll container, so a sticky header would pin inside the table and
  // never visibly stick below the site header).
  expect(
    /:first-child[^{]*\{[^}]*position:\s*sticky[^}]*left:\s*0/.test(source),
    'no :first-child cell rule pins with sticky + left: 0',
  ).toBe(false);
  expect(
    /thead[^{]*th[^{]*\{[^}]*position:\s*sticky/.test(source),
    'no thead th rule declares position: sticky',
  ).toBe(false);
});
