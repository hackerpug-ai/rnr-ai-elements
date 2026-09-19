import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * FAM-004 — source-contract lane for the rnr-ledger-filter island over the
 * REAL authored sources on disk: ledger-filter.ts, LedgerFilter.astro, and
 * FAM-003's components/index.astro mount surface.
 *
 * UNIT_TEST_JUSTIFIED: pure assertion logic over committed-file reads — no
 * runtime I/O beyond those reads, no rendering, no network. Behavioral proof
 * (narrowing, 39-restore, no-results, URL stability, nojs full grid, focus
 * ring) rides the sibling ledger-filter-island.spec.ts playwright lane and the
 * human gate.
 *
 * The scans read the island's real files directly — never a fixture copy — so
 * a stub island (markup with no define), a hardcoded card list, or a
 * DOMContentLoaded-only init all fail here before any browser runs.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const SCRIPT = join(repoRoot, 'apps', 'docs', 'src', 'scripts', 'ledger-filter.ts');
const ISLAND = join(repoRoot, 'apps', 'docs', 'src', 'components', 'islands', 'LedgerFilter.astro');
const PAGE = join(repoRoot, 'apps', 'docs', 'src', 'pages', 'components', 'index.astro');

/** Any write (or read) that moves filter state into the URL — banned by TR-10. */
const URL_STATE =
  /pushState|replaceState|location\.hash|location\.search|searchParams|URLSearchParams|history\.(push|replace)/;
/** querySelectorAll spelling, tolerating a TS generic between the call and selector. */
const FILTER_QUERY = /querySelectorAll(?:<[^>]*>)?\('\[data-filter-text\]'\)/;

function inputTag(source: string): string {
  const match = source.match(/<input[\s\S]*?>/);
  expect(match, 'LedgerFilter.astro renders exactly one input element').toBeTruthy();
  return match?.[0] ?? '';
}

it('FAM-004-contract-filter-wiring: exactly 1 rnr-ledger-filter define, astro:page-load init, target-attribute-driven data-filter-text reads, island mounted at the FAM-003 slot', () => {
  expect(existsSync(SCRIPT), `the island script exists at ${SCRIPT}`).toBe(true);
  expect(existsSync(ISLAND), `the island component exists at ${ISLAND}`).toBe(true);
  const script = readFileSync(SCRIPT, 'utf8');
  const page = readFileSync(PAGE, 'utf8');

  // Exactly one registration — the island budget pins the tag by source scan,
  // and a second define would throw at runtime anyway.
  const defines = script.match(/customElements\.define\('rnr-ledger-filter'/g) ?? [];
  expect(defines.length, 'exactly 1 customElements.define for rnr-ledger-filter').toBe(1);

  // Init rides astro:page-load (the router lifecycle), never DOMContentLoaded,
  // which is dead after a ClientRouter soft navigation.
  const pageLoads = script.match(/document\.addEventListener\('astro:page-load'/g) ?? [];
  expect(pageLoads.length, 'exactly 1 astro:page-load init listener').toBe(1);
  expect(script, 'init is not DOMContentLoaded-only (dead after transitions)').not.toContain(
    'DOMContentLoaded',
  );

  // Generalized input: the container comes from the target attribute, and the
  // cards are selected as [data-filter-text] inside it — never a hardcoded
  // card list.
  expect(script, 'the container selector is read from the target attribute').toContain(
    "getAttribute('target')",
  );
  expect(
    script.match(FILTER_QUERY),
    'cards are read as [data-filter-text] in the container',
  ).toBeTruthy();

  // Mount: the page composes the island exactly once, at FAM-003's reserved
  // slot position — after the slot div, before the first grid section.
  expect(page, 'the page imports the island component').toContain('import LedgerFilter from');
  const usages = page.match(/<LedgerFilter/g) ?? [];
  expect(usages.length, 'exactly 1 <LedgerFilter mount in index.astro').toBe(1);
  const slotAt = page.indexOf('family-grid-slot');
  const usageAt = page.indexOf('<LedgerFilter');
  const firstSectionAt = page.indexOf('<section');
  expect(slotAt, 'the FAM-003 slot div is present').toBeGreaterThan(-1);
  expect(usageAt, 'the island mounts after the slot div').toBeGreaterThan(slotAt);
  expect(usageAt, 'the island mounts before the first grid section').toBeLessThan(firstSectionAt);

  console.log(
    'FAM-004 wiring: 1 define, 1 astro:page-load init, target-attribute container, ' +
      'mounted at the family-grid-slot position in index.astro',
  );
});

it('FAM-004-contract-no-url-writes: 0 URL/history state in the script, exactly 1 muted no-results row, an input-clear branch restoring all cards', () => {
  expect(existsSync(SCRIPT), `the island script exists at ${SCRIPT}`).toBe(true);
  expect(existsSync(ISLAND), `the island component exists at ${ISLAND}`).toBe(true);
  const script = readFileSync(SCRIPT, 'utf8');
  const island = readFileSync(ISLAND, 'utf8');

  // TR-10: filter state lives in client DOM only — the canonical URL never
  // changes. Zero matches for every URL-state spelling.
  const urlWrites = script.match(URL_STATE) ?? [];
  expect(urlWrites, '0 pushState/replaceState/hash/search references in the script').toEqual([]);

  // The zero-match state is ONE muted server-rendered row in the component
  // markup — not a client-side removal, not a stack of rows.
  const noResults = island.match(/data-no-results/g) ?? [];
  expect(noResults.length, 'exactly 1 no-results row element in the component').toBe(1);
  const rowTag = island.match(/<p[^>]*data-no-results[^>]*>/) ?? [];
  expect(rowTag.length, 'the no-results row is a single <p>').toBe(1);
  expect(rowTag[0], 'the no-results row starts hidden').toContain('hidden');
  expect(island, 'the no-results row is muted').toContain('ledger-filter__no-results');

  // The clear path: an empty query restores every card and section (the
  // browser lane proves 39 visible after clear).
  expect(script, 'the apply path branches on the empty query').toMatch(/query === ''/);
  expect(script, 'the clear branch un-hides cards (hidden = false)').toContain('hidden = false');

  console.log(
    'FAM-004 URL stability: 0 URL-state references; 1 muted no-results row; clear branch present',
  );
});

it('FAM-004-contract-nojs-fallback: the 39-card grid is static page template markup, the input is inert until upgrade, 0 client-side grid construction', () => {
  expect(existsSync(SCRIPT), `the island script exists at ${SCRIPT}`).toBe(true);
  expect(existsSync(ISLAND), `the island component exists at ${ISLAND}`).toBe(true);
  const script = readFileSync(SCRIPT, 'utf8');
  const island = readFileSync(ISLAND, 'utf8');
  const page = readFileSync(PAGE, 'utf8');

  // The grid is server-rendered by index.astro's static template loop — the
  // island's JS never builds it.
  expect(page, 'the card grid loop is static template markup in index.astro').toContain(
    'family.itemNames.map((name)',
  );
  expect(page, 'the page composes ComponentCard for the 39 cards').toContain('<ComponentCard');
  expect(script, 'no innerHTML grid injection in the script').not.toContain('innerHTML');
  expect(script, 'no DOM grid construction in the script').not.toContain('document.createElement');

  // The input ships inert in static markup: disabled until the element
  // upgrades, and the un-upgraded element is display:none — with JS disabled
  // there is no functional control on the page and the grid is untouched.
  const inputs = island.match(/<input[\s\S]*?>/g) ?? [];
  expect(inputs.length, 'exactly 1 input in the component markup').toBe(1);
  expect(inputTag(island), 'the static input is disabled until upgrade').toContain('disabled');
  expect(script, 'the upgrade enables the input').toContain('disabled = false');
  expect(island, 'the un-upgraded element renders nothing (:not(:defined) hidden)').toMatch(
    /rnr-ledger-filter:not\(:defined\)\s*\{[^}]*display:\s*none/,
  );

  console.log(
    'FAM-004 nojs: static grid loop in the page; 1 input, disabled until upgrade; 0 client grid construction',
  );
});

it('FAM-004-contract-a11y: the input carries a resolvable accessible name, a :focus-visible ring rule targets it, one role="search" landmark', () => {
  expect(existsSync(ISLAND), `the island component exists at ${ISLAND}`).toBe(true);
  const island = readFileSync(ISLAND, 'utf8');

  // WAI-ARIA search-box pattern: exactly one input, named by aria-label (a
  // placeholder alone is never the accessible name).
  const inputs = island.match(/<input[\s\S]*?>/g) ?? [];
  expect(inputs.length, 'exactly 1 input in the component markup').toBe(1);
  const input = inputTag(island);
  const ariaLabel = input.match(/aria-label="([^"]+)"/);
  expect(ariaLabel, 'the input has an aria-label accessible name').toBeTruthy();
  expect(ariaLabel?.[1].trim().length ?? 0, 'the accessible name is non-empty').toBeGreaterThan(0);
  expect(input, 'the input is not placeholder-named only').toContain('aria-label');

  // One search landmark on the component (the search-box pattern role).
  const searchRoles = island.match(/role="search"/g) ?? [];
  expect(searchRoles.length, 'exactly 1 role="search" landmark on the component').toBe(1);

  // The focus ring: at least one :focus-visible rule targeting the input
  // (scoped here via the global 2px --ring contract, as the siblings do).
  const style = island.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '';
  expect(style, 'the component carries a scoped style block').toBeTruthy();
  expect(
    style.match(/ledger-filter__input:focus-visible/g) ?? [],
    'at least 1 :focus-visible rule targets the input',
  ).toHaveLength(1);

  console.log('FAM-004 a11y: 1 named input, 1 role=search landmark, 1 :focus-visible ring rule');
});
