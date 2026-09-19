import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { oneLineDescription } from '../../apps/docs/src/lib/one-line-description';

/**
 * FAM-003 — the source-contract lane for the /components seven-family card
 * grid. AC-3 pins the superseded FUSE-07 block in the sprint-01 spec: the
 * block must assert the dataset-derived surface (7 sections / 39 cards /
 * 200-resolving links / 0 ui/lib entries), no stale 56-name oracle may remain
 * anywhere in the file, and the GEND-14 + GEND-15 sibling bodies must stay
 * byte-identical to the REF-009 five-region re-pin (sha256 over their exact
 * source regions). AC-4
 * pins the committed page source: families.json-derived jump nav, exactly one
 * empty plain mount slot above the grid, data-filter-text coverage for all 39
 * cards, 0 ui/lib family ids in the section join, 0 URL-param writes.
 *
 * UNIT_TEST_JUSTIFIED: pure assertion logic over committed-file reads (page
 * source, spec source, ComponentCard source, the real families.json +
 * registry-items.json) — no runtime I/O beyond those reads; rendered-DOM proof
 * rides the verification gates (FUSE-07-components-index and
 * FAM-003-family-grid-extras playwright greps) and the human gate.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PAGE = join(repoRoot, 'apps', 'docs', 'src', 'pages', 'components', 'index.astro');
const SPEC = join(repoRoot, 'tests', 'sprint-01-docs-spike-skeleton', 'component-page.spec.ts');
const CARD = join(repoRoot, 'apps', 'docs', 'src', 'components', 'ComponentCard.astro');
const FAMILIES = join(repoRoot, 'apps', 'docs', 'src', 'data', 'families.json');
const REGISTRY = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  family: string;
}

interface Family {
  id: string;
  title: string;
  order: number;
  itemNames: string[];
}

expect(existsSync(REGISTRY), `registry-items.json exists at ${REGISTRY} (run the docs build)`).toBe(
  true,
);
const items = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Item[];
const families = JSON.parse(readFileSync(FAMILIES, 'utf8')) as Family[];

const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
/** The families the grid renders — every member a registry:component, in order. */
const componentFamilies = [...families]
  .sort((a, b) => a.order - b.order)
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)));
const uiLibFamilies = families
  .filter((family) => !componentFamilies.includes(family))
  .map((family) => family.id);

/** sha256 over an exact source region — the byte-identity oracle. */
const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

/** Slice between two exact markers, failing loudly when either goes missing. */
function region(text: string, startMarker: string, endMarker: string): string {
  const start = text.indexOf(startMarker);
  expect(
    start,
    `spec carries the start marker ${JSON.stringify(startMarker.slice(0, 40))}`,
  ).toBeGreaterThan(-1);
  const end = text.indexOf(endMarker, start);
  expect(
    end,
    `spec carries the end marker ${JSON.stringify(endMarker.slice(0, 40))}`,
  ).toBeGreaterThan(start);
  return text.slice(start, end);
}

it('FAM-003-supersede-contract: FUSE-07 block asserts the 7-section/39-card grid, no 56-name oracle remains, GEND-14/GEND-15 bodies byte-identical', () => {
  expect(existsSync(SPEC), `the sprint-01 spec exists at ${SPEC}`).toBe(true);
  const spec = readFileSync(SPEC, 'utf8');

  // 0 diffs to the sibling bodies: their exact source regions, re-pinned by
  // REF-009 to the extended five-region anatomy, must stay byte-identical to
  // that pin (any drift after REF-009's commit fails here).
  const gend14 = region(
    spec,
    "test('FLOW-GEND-14-reference-page-anatomy",
    "test.describe('FLOW-GEND-15-family-pager-stays-in-family'",
  );
  const gend15 = region(
    spec,
    "test('family pager walks each component family exactly",
    "test('FUSE-07-components-index",
  );
  expect(sha256(gend14), 'FLOW-GEND-14 body byte-identical to the REF-009 re-pin').toBe(
    'fbc0d8c450ee8643ffb570feb4a065649db7a3f64afa121f58d16a14c4e7c810',
  );
  expect(sha256(gend15), 'FLOW-GEND-15 body byte-identical to the REF-009 re-pin').toBe(
    'a202c924464a8855e87a40e6920f6c19002a47683126f2430bfe3bdfe76a6344',
  );

  // The superseded block: from its title to its own close (the first 2-space
  // `});` after the marker — the body itself indents 4+ everywhere).
  const fuseStart = spec.indexOf("test('FUSE-07-components-index");
  expect(fuseStart, 'the FUSE-07-components-index test survives the supersede').toBeGreaterThan(-1);
  const fuseEnd = spec.indexOf('\n  });', fuseStart);
  expect(fuseEnd, 'the FUSE-07 block closes').toBeGreaterThan(fuseStart);
  const fuse07 = spec.slice(fuseStart, fuseEnd);

  // The block asserts the DERIVED surface — counts reference the dataset join,
  // never literals, so a dataset change moves the oracle instead of passing it.
  expect(fuse07, 'sections derived from the all-component family join').toContain(
    'componentFamilies.length',
  );
  expect(fuse07, 'cards derived from the registry:component set').toContain('components.length');
  expect(fuse07, 'cards keyed on the card anchor, not anchor rows').toContain('a[data-card]');
  expect(fuse07, 'every card href is probed').toContain('request.get');
  expect(fuse07, 'card hrefs must resolve 200').toContain('toBe(200)');
  expect(fuse07, 'ui/lib entries asserted absent via the dataset split').toContain(
    "type !== 'registry:component'",
  );
  expect(fuse07, 'no stale 56 anywhere in the superseded block').not.toContain('56');

  // No stale 56-name oracle survives anywhere in the file (block, comment,
  // or title — the start signature is gone).
  expect(spec.match(/56 names|all 56|56 registry names/g)?.length ?? 0).toBe(0);
});

it('FAM-003-page-contract-extras: families.json-derived jump nav, one empty mount slot, data-filter-text on the 39-card join, zero ui/lib ids, zero URL writes', () => {
  expect(existsSync(PAGE), `the components index exists at ${PAGE}`).toBe(true);
  const page = readFileSync(PAGE, 'utf8');

  // The join is derived: order sort + the all-component family filter, and the
  // real dataset resolves it to exactly the seven component families — the ui
  // and lib families never enter the section join.
  expect(page, 'sections ordered by the families order field').toContain(
    '.sort((a, b) => a.order - b.order)',
  );
  expect(page, 'sections filtered to all-component families').toContain(
    '.every((name) => componentNames.has(name))',
  );
  expect(
    componentFamilies.map((family) => family.id),
    'the join yields exactly the 7 component families in order',
  ).toEqual([
    'conversation',
    'message',
    'prompt-input',
    'reasoning',
    'sources',
    'suggestion',
    'tool',
  ]);
  for (const id of uiLibFamilies) {
    expect(page, `no ${id} family literal in the page source`).not.toContain(`'${id}'`);
  }
  for (const family of families) {
    expect(page, `family id ${family.id} is derived, never hardcoded`).not.toContain(
      `'${family.id}'`,
    );
  }

  // R1 jump nav: anchors generated from the componentFamilies join (7 anchors
  // in the rendered page), each binding #${family.id}.
  const navStart = page.indexOf('<nav class="family-jump"');
  const navEnd = page.indexOf('</nav>', navStart);
  expect(navStart, 'the family jump nav exists').toBeGreaterThan(-1);
  expect(navEnd, 'the jump nav closes').toBeGreaterThan(navStart);
  const nav = page.slice(navStart, navEnd);
  expect(nav, 'jump anchors map the component families').toContain('componentFamilies.map');
  expect(nav.match(/href=\{`#\$\{family\.id\}`\}/g)?.length, 'one derived anchor binding').toBe(1);

  // The mount slot: exactly one plain, EMPTY div, directly above the grid's
  // first section — structural only, no stub UI for FAM-004 to fight.
  const SLOT = '<div class="family-grid-slot"></div>';
  expect(page.match(/<div class="family-grid-slot"/g)?.length, 'exactly one mount slot').toBe(1);
  const slotAt = page.indexOf(SLOT);
  expect(slotAt, 'the slot div is the one plain empty wrapper').toBeGreaterThan(-1);
  const firstSectionAt = page.indexOf('<section');
  expect(slotAt, 'the slot sits above the grid sections').toBeLessThan(firstSectionAt);

  // data-filter-text: the page composes ComponentCard, whose locked contract
  // emits the attribute from title + one-liner + category — name and
  // description proven over the real dataset below; the family dimension rides
  // the card's section ancestor (section id={family.id} wraps the card map).
  expect(page, 'the page composes ComponentCard').toContain('<ComponentCard');
  const cardSource = readFileSync(CARD, 'utf8');
  expect(cardSource, 'ComponentCard emits the filter text attribute').toContain(
    'data-filter-text={filterText}',
  );
  expect(cardSource, 'filter text joins title + one-liner + category').toContain(
    "const filterText = [title, oneLiner, category].join(' ')",
  );
  expect(page, 'cards render inside the family section map').toMatch(/<section id=\{family\.id\}/);
  expect(components.length, 'the dataset carries the 39 registry:component items').toBe(39);
  for (const item of components) {
    const filterText = [
      item.title,
      oneLineDescription(item.description),
      item.type.replace('registry:', ''),
    ].join(' ');
    expect(
      filterText.trim().length,
      `${item.name}: filter text covers name + description + category`,
    ).toBeGreaterThan(0);
  }

  // Zero JS, zero URL state (TR-10): no script, no island, no param/hash write.
  expect(page).not.toMatch(/<script/i);
  expect(page).not.toContain('client:');
  expect(page).not.toMatch(/location\.|searchParams|URLSearchParams|history\.(push|replace)/);
});
