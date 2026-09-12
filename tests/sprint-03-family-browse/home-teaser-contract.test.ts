import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * FAM-006 — the source-contract lane for the home R9 family teaser grid:
 * one <section id="families"> landmark below the sprint-02 hero, deriving its
 * seven family blocks from the same families.json + registry-items.json join
 * as /components (FAM-003) through SectionHeader + ComponentCard composition.
 *
 * UNIT_TEST_JUSTIFIED: static source-contract scan over the authored page
 * source plus the real JSON data files — file reads only, no rendering, no
 * network, no DB (same pattern as the landed primitives.test.ts and
 * page-contract.test.ts). The rendered proof rides the home-family-teaser
 * playwright lane gate in verification_gates.
 *
 * RED at task start: index.astro still defers R9-R12 — 0 #families sections,
 * 0 SectionHeader/ComponentCard imports, stale deferral comment — while AC-3
 * (the hero protection baseline) already passes by design.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PAGE = join(repoRoot, 'apps', 'docs', 'src', 'pages', 'index.astro');
const CARD = join(repoRoot, 'apps', 'docs', 'src', 'components', 'ComponentCard.astro');
const FAMILIES = join(repoRoot, 'apps', 'docs', 'src', 'data', 'families.json');
const REGISTRY = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

/** The wrapping landmark literal — attribute order is part of the contract. */
const SECTION_ANCHOR = '<section id="families" aria-label="Component families">';
const HERO_OPEN = '<main class="hero">';
const LAYOUT_CLOSE = '</Layout>';

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  expoGo: boolean;
}

interface Family {
  id: string;
  title: string;
  order: number;
  itemNames: string[];
}

expect(
  existsSync(REGISTRY),
  `registry-items.json exists at ${REGISTRY} (run the docs prebuild)`,
).toBe(true);
const items = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Item[];
const families = JSON.parse(readFileSync(FAMILIES, 'utf8')) as Family[];

const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
/** The same join /components uses: all-component families, in committed order. */
const componentFamilies = [...families]
  .sort((a, b) => a.order - b.order)
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)));

function readPage(): string {
  expect(existsSync(PAGE), `index.astro exists at ${PAGE}`).toBe(true);
  return readFileSync(PAGE, 'utf8');
}

/** The post-hero teaser region: from the landmark to the layout close. */
function teaserRegion(page: string): string {
  const at = page.indexOf(SECTION_ANCHOR);
  expect(at, `the #families landmark exists (${SECTION_ANCHOR})`).toBeGreaterThan(-1);
  return page.slice(at, page.indexOf(LAYOUT_CLOSE, at));
}

/** The sprint-02 hero region: the main.hero element, write-prohibited. */
function heroRegion(page: string): string {
  const start = page.indexOf(HERO_OPEN);
  expect(start, `the hero region exists (${HERO_OPEN})`).toBeGreaterThan(-1);
  const end = page.indexOf('</main>', start);
  expect(end, 'the hero region closes').toBeGreaterThan(start);
  return page.slice(start, end);
}

it('FAM-006-teaser-seven-sections-39-cards: one #families landmark below the hero deriving 7 families / 39 registry:component items through SectionHeader + ComponentCard', () => {
  const page = readPage();

  // Seeded evidence over the real JSON — the join /components renders.
  expect(componentFamilies.length, 'families.json yields exactly 7 all-component families').toBe(7);
  expect(components.length, 'the registry carries 39 registry:component items').toBe(39);
  const counts = componentFamilies.map((family) => family.itemNames.length);
  expect(counts, 'per-family card counts').toEqual([3, 7, 6, 7, 4, 1, 11]);
  console.log(
    `FAM-006 teaser derivation: ${componentFamilies.length} families / ` +
      `${components.length} registry:component items / counts ${counts.join('/')} ` +
      `(ids ${componentFamilies.map((family) => family.id).join(',')})`,
  );

  // Exactly one landmark, in the post-hero region (document order after </main>).
  expect(page.split(SECTION_ANCHOR).length - 1, 'exactly one #families landmark').toBe(1);
  const heroEnd = page.indexOf('</main>');
  expect(heroEnd, 'the hero closes').toBeGreaterThan(-1);
  expect(page.indexOf(SECTION_ANCHOR), 'the teaser sits below the hero').toBeGreaterThan(heroEnd);

  // The derivation: both data files imported, the same join as /components,
  // items resolved only through the registry:component map.
  expect(page).toContain("import families from '../data/families.json'");
  expect(page).toContain("import items from '../data/registry-items.json'");
  expect(page, 'sections ordered by the families order field').toContain(
    '.sort((a, b) => a.order - b.order)',
  );
  expect(page, 'sections filtered to all-component families').toContain(
    '.every((name) => componentNames.has(name))',
  );
  const region = teaserRegion(page);
  expect(region, 'cards resolve through the registry:component-only map').toContain(
    'itemsByName.get(name)',
  );
  const registryComponentFilters = page.match(/'registry:component'/g)?.length ?? 0;
  expect(
    registryComponentFilters,
    'the derivation filters to registry:component (set + map)',
  ).toBeGreaterThanOrEqual(2);

  // The composition: SectionHeader per family, ComponentCard per item — one
  // invocation site each inside the region, generated by the loops.
  expect(page, 'SectionHeader imported from src/components').toContain(
    "import SectionHeader from '../components/SectionHeader.astro'",
  );
  expect(page, 'ComponentCard imported from src/components').toContain(
    "import ComponentCard from '../components/ComponentCard.astro'",
  );
  expect(
    page.match(/<SectionHeader/g)?.length ?? 0,
    'one SectionHeader site (7 via the loop)',
  ).toBe(1);
  expect(
    page.match(/<ComponentCard/g)?.length ?? 0,
    'one ComponentCard site (39 via the loop)',
  ).toBe(1);
  expect(region).toContain('componentFamilies.map((family)');
  expect(region).toContain('family.itemNames.map((name)');
  expect(region).toContain('<SectionHeader');
  expect(region).toContain('<ComponentCard');

  // MUST_NOT: hand-written family sections — every id/name is derived, never a
  // page literal (FAM-003 page-contract precedent; InstallCommand's
  // item="conversation" is double-quoted and stays outside this check).
  for (const family of families) {
    expect(page, `family id ${family.id} is derived, never hardcoded`).not.toContain(
      `'${family.id}'`,
    );
    expect(page, `no hardcoded section id ${family.id}`).not.toContain(`id="${family.id}"`);
  }
});

it('FAM-006-teaser-badge-vocabulary: every card binds item.expoGo and the verdict vocabulary reaches the teaser only through ComponentCard composition', () => {
  const page = readPage();
  const region = teaserRegion(page);

  // The one invocation site binds the item's expoGo field — 1 binding site
  // covering all 39 cards the loop generates.
  expect(region.match(/<ComponentCard/g)?.length ?? 0, 'exactly one card invocation site').toBe(1);
  expect(region.match(/expoGo=\{item\.expoGo\}/g)?.length ?? 0, 'the loop passes item.expoGo').toBe(
    1,
  );

  // The two-state vocabulary reaches the cards only via ComponentCard's Badge
  // composition (FAM-002 primitive, FAM-005 strings) — unmodified path.
  expect(page).toContain("import ComponentCard from '../components/ComponentCard.astro'");
  expect(existsSync(CARD), `ComponentCard exists at ${CARD}`).toBe(true);
  const card = readFileSync(CARD, 'utf8');
  expect(card, 'ComponentCard composes Badge with the expoGo-keyed tone').toMatch(
    /<Badge tone=\{expoGo \? 'expo-go' : 'dev-client'\}/,
  );

  // MUST_NOT: local verdict strings — the vocabulary never leaks into the page.
  for (const literal of ['runs in Expo Go', 'requires a dev client', 'Expo Go', 'dev-client']) {
    expect(page, `index.astro carries 0 local verdict strings ('${literal}')`).not.toContain(
      literal,
    );
  }
  // MUST_NOT: hand-rolled badge markup bypassing ComponentCard/Badge.
  expect(region.match(/class="badge/g)?.length ?? 0, 'no hand-rolled badge spans').toBe(0);
  expect(region.match(/badge--/g)?.length ?? 0, 'no hand-rolled badge tone classes').toBe(0);
});

it('FAM-006-hero-regions-intact: the sprint-02 hero keeps all anchors above the teaser — 5 counter hooks, 2 CTA hrefs, 1 InstallCommand, landed copy, zero teaser markup inside', () => {
  const page = readPage();
  const hero = heroRegion(page);

  // The 5 data-counter hook names survive inside the hero tree.
  for (const hook of ['version', 'total', 'components', 'ui', 'libs']) {
    expect(
      hero.match(new RegExp(`counter="${hook}"`, 'g'))?.length ?? 0,
      `counter hook ${hook}`,
    ).toBe(1);
  }

  // The CTA pair: label + href, both real routes.
  expect(hero).toMatch(/href="\/registry"\s*>\s*Get started\s*</);
  expect(hero).toMatch(/href="\/components"\s*>\s*Browse components\s*</);

  // The InstallCommand composition — exactly one, unchanged.
  expect(hero.match(/<InstallCommand /g)?.length ?? 0, 'one InstallCommand composition').toBe(1);

  // The landed SHELL-010 copy literals — 0 drift.
  expect(hero).toContain('Universal AI chat and agent UI components for React Native');
  expect(hero).toContain('copy-paste registry');
  expect(hero).toContain('NOT an npm package');

  // Document order: the hero closes above the teaser when the teaser exists.
  const familiesAt = page.indexOf(SECTION_ANCHOR);
  if (familiesAt !== -1) {
    expect(page.indexOf('</main>'), 'the hero region precedes #families').toBeLessThan(familiesAt);
  }

  // MUST_NOT: teaser markup inside the hero region.
  expect(hero).not.toContain('<ComponentCard');
  expect(hero).not.toContain('<SectionHeader');
  expect(hero).not.toContain('id="families"');
});

it('FAM-006-deferred-regions-and-zero-js: the header comment marks R9 shipped with R10-R12 deferred, and the #families region adds zero JS and zero deferred-region markers', () => {
  const page = readPage();
  const region = teaserRegion(page);

  // 1 header comment anchor: R9 shipped, R10-R12 still deferred.
  expect(page, 'the comment marks R9 shipped').toContain(
    'R9 (the family teaser grid below the hero) ships',
  );
  expect(page, 'the comment keeps R10-R12 deferred').toContain(
    'R10-R12 (quickstart strip, boundary teaser, QR) stay deferred',
  );
  expect(page, 'no stale R9-R12 deferral signature survives').not.toContain('R9-R12');

  // The region composes exactly the loop's two invocation sites — 0 hand-rolled
  // card markup (the 7/39 rendered counts are AC-1 + the lane gate).
  expect(region.match(/<SectionHeader/g)?.length ?? 0, 'one SectionHeader site').toBe(1);
  expect(region.match(/<ComponentCard/g)?.length ?? 0, 'one ComponentCard site').toBe(1);

  // MUST_NOT: JS inside the region — no script, no custom element, no island.
  expect(region.match(/<script/g)?.length ?? 0, '0 script elements').toBe(0);
  expect(region, 'no custom-element registrations').not.toContain('customElements.define');
  expect(region, 'no client directives').not.toContain('client:');
  // MUST_NOT: filter-island imports anywhere in the file.
  expect(page, 'no island imports anywhere in the file').not.toContain('islands/');
  expect(page, 'no LedgerFilter import').not.toContain('LedgerFilter');
  // MUST_NOT: R10-R12 region markers inside the teaser.
  for (const marker of ['QR', 'quickstart', 'Callout', 'right-rail']) {
    expect(region, `0 R10-R12 markers ('${marker}')`).not.toContain(marker);
  }
});
