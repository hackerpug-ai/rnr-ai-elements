import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * FAM-005 — the source-contract lane for the site-wide verdict vocabulary.
 * One Badge, one VERDICTS map, one data path: registry-items.json's expoGo
 * field is the only verdict oracle, and every surface that renders a verdict
 * composes Badge with tone={item.expoGo ? 'expo-go' : 'dev-client'}.
 *
 * UNIT_TEST_JUSTIFIED: pure assertion logic over committed-file reads
 * (Badge.astro, [item].astro, registry.astro, the two sprint-01 specs, the
 * generated registry-items.json) — no rendering, no network, no DB. Rendered
 * proof rides the locked FLOW-GEND-08 spec (AC-6, secondary ownership) and
 * the verdict-badge-wiring playwright lane (gate-step-4 evidence).
 *
 * The retired vocabulary is the short strings 'Expo Go' / 'Dev client' (and
 * the bare 'dev-client' as a DISPLAY value); the locked state texts are
 * 'runs in Expo Go' / 'requires a dev client'.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

const BADGE = join(repoRoot, 'apps', 'docs', 'src', 'components', 'Badge.astro');
const ITEM_PAGE = join(repoRoot, 'apps', 'docs', 'src', 'pages', 'components', '[item].astro');
const REGISTRY_PAGE = join(repoRoot, 'apps', 'docs', 'src', 'pages', 'registry.astro');
const SPEC_ITEM_PAGE = join(
  repoRoot,
  'tests',
  'sprint-01-docs-spike-skeleton',
  'component-page.spec.ts',
);
const SPEC_LEDGER = join(repoRoot, 'tests', 'sprint-01-docs-spike-skeleton', 'ledger.spec.ts');
const REGISTRY_DATA = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

interface DatasetItem {
  name: string;
  type: string;
  expoGo: boolean;
}

expect(
  existsSync(REGISTRY_DATA),
  `registry-items.json exists at ${REGISTRY_DATA} (run the docs prebuild)`,
).toBe(true);
const dataset = JSON.parse(readFileSync(REGISTRY_DATA, 'utf8')) as DatasetItem[];
const componentItems = dataset.filter((item) => item.type === 'registry:component');
const nonComponentItems = dataset.filter((item) => item.type !== 'registry:component');

/** The locked verdict vocabulary — one map, keyed by tone, nowhere duplicated. */
const LOCKED_VERDICTS = {
  'expo-go': 'runs in Expo Go',
  'dev-client': 'requires a dev client',
} as const;

/** The tone binding every surface must derive from item.expoGo — never hand-set. */
const TONE_BINDING = "tone={item.expoGo ? 'expo-go' : 'dev-client'}";

/** Extract the VERDICTS record from Badge.astro source as a plain object. */
function extractVerdicts(source: string): Record<string, string> {
  const block = source.match(/const VERDICTS[^=]*=\s*\{([\s\S]*?)\}\s*;/);
  expect(block, 'Badge.astro declares the VERDICTS record').toBeTruthy();
  const record: Record<string, string> = {};
  for (const [, key, value] of block?.[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g) ?? []) {
    record[key] = value;
  }
  return record;
}

/** Slice an element region out of Astro source, failing loudly when absent. */
function elementRegion(source: string, open: string, close: string): string {
  const start = source.indexOf(open);
  expect(start, `source carries the element ${JSON.stringify(open.slice(0, 40))}`).toBeGreaterThan(
    -1,
  );
  const end = source.indexOf(close, start);
  expect(end, `the element ${JSON.stringify(open.slice(0, 40))} closes`).toBeGreaterThan(start);
  return source.slice(start, end);
}

it('FAM-005-badge-verdicts-map: VERDICTS equals exactly the two locked state texts keyed by tone; the BadgeTone union is unchanged', () => {
  expect(existsSync(BADGE), `Badge.astro exists at ${BADGE}`).toBe(true);
  const badge = readFileSync(BADGE, 'utf8');

  // The exact-map equality: two entries, both locked state texts, keyed by tone.
  const verdicts = extractVerdicts(badge);
  expect(Object.keys(verdicts), 'exactly the two locked tones, no third').toEqual([
    'expo-go',
    'dev-client',
  ]);
  expect(verdicts).toEqual(LOCKED_VERDICTS);

  // MUST_NOT, spelled out for the failure message: no retired short strings.
  expect(verdicts['expo-go'], "the expo-go state text is not the short 'Expo Go'").not.toBe(
    'Expo Go',
  );
  expect(verdicts['dev-client'], "the dev-client state text is not the bare 'dev-client'").not.toBe(
    'dev-client',
  );

  // The tone union survives untouched — the BadgeTone contract is sprint-02's.
  expect(badge, "BadgeTone stays exactly 'expo-go' | 'dev-client'").toMatch(
    /type BadgeTone = 'expo-go' \| 'dev-client';/,
  );

  // The rendered output still derives from the map (no literal bypass).
  expect(badge).toContain('{VERDICTS[tone]}');
});

it('FAM-005-item-page-badge-wiring: [item].astro imports Badge and renders it in the li[data-chip=expo] slot with tone from item.expoGo; the plain ternary is gone', () => {
  expect(existsSync(ITEM_PAGE), `the item page exists at ${ITEM_PAGE}`).toBe(true);
  const page = readFileSync(ITEM_PAGE, 'utf8');

  // 1 Badge import from the shared component.
  expect(page.match(/import Badge from/g)?.length, 'exactly one Badge import').toBe(1);
  expect(page).toMatch(/import Badge from '\.\.\/\.\.\/components\/Badge\.astro';/);

  // The Badge renders inside the li[data-chip=expo] slot with the tone binding.
  const expoChip = elementRegion(page, '<li data-chip="expo">', '</li>');
  expect(expoChip, 'the expo chip renders the Badge component').toContain('<Badge ');
  expect(expoChip, 'the Badge tone derives from item.expoGo').toContain(TONE_BINDING);

  // The one template builds all 39 registry:component pages — the count check
  // that makes this wiring site-wide rather than per-page.
  expect(componentItems.length, 'the dataset carries the 39 registry:component items').toBe(39);

  // MUST_NOT: the old plain-text ternary, and any per-page verdict string.
  expect(page, 'the plain ternary is deleted').not.toMatch(
    /item\.expoGo \? 'Expo Go' : 'Dev client'/,
  );
  expect(page, "no retired short-string literal 'Expo Go'").not.toContain("'Expo Go'");
  expect(page, "no retired short-string literal 'Dev client'").not.toContain("'Dev client'");
});

it('FAM-005-registry-badge-rows: every ledger row renders the Badge in td.ledger-verdict with tone from item.expoGo; verdictLabel is deleted', () => {
  expect(existsSync(REGISTRY_PAGE), `registry.astro exists at ${REGISTRY_PAGE}`).toBe(true);
  const page = readFileSync(REGISTRY_PAGE, 'utf8');

  // 1 Badge import.
  expect(page.match(/import Badge from/g)?.length, 'exactly one Badge import').toBe(1);
  expect(page).toMatch(/import Badge from '\.\.\/components\/Badge\.astro';/);

  // The single row template covers every manifest entry: the ledger IS the
  // dataset (no filter), and the tbody maps over it.
  expect(page).toContain('const ledger = items as LedgerItem[]');
  expect(page).not.toMatch(/const ledger = items[^;]*filter/);
  expect(page).toMatch(/ledger\.map\(\(item\)/);
  expect(dataset.length, 'the manifest carries all 56 entries at run time').toBe(56);

  // The verdict cell renders the Badge with the tone binding — and nothing else.
  const verdictCell = elementRegion(page, '<td class="ledger-verdict">', '</td>');
  expect(verdictCell, 'the verdict cell renders the Badge component').toContain('<Badge ');
  expect(verdictCell, 'the Badge tone derives from item.expoGo').toContain(TONE_BINDING);
  expect(
    verdictCell
      .replace('<td class="ledger-verdict">', '')
      .replace(/<Badge[^>]*\/>/, '')
      .trim(),
    'no plain text beside the Badge in the verdict cell',
  ).toBe('');

  // MUST_NOT: the second verdict path cannot reappear silently.
  expect(
    page.match(/verdictLabel/g)?.length ?? 0,
    '0 occurrences of the verdictLabel identifier',
  ).toBe(0);
});

it('FAM-005-registry-row-anchors: tr carries the row-{item.name} id, docsHref anchors non-component rows in-page, 0 legacy /components# hrefs, affordances survive', () => {
  expect(existsSync(REGISTRY_PAGE), `registry.astro exists at ${REGISTRY_PAGE}`).toBe(true);
  const page = readFileSync(REGISTRY_PAGE, 'utf8');

  // The docsHref shape: component rows keep their page; every other row
  // anchors itself in-page.
  expect(page, 'docsHref returns the in-page row anchor for non-component rows').toMatch(
    /const docsHref = \(item: LedgerItem\): string =>\s*item\.type === 'registry:component' \? `\/components\/\$\{item\.name\}` : `#row-\$\{item\.name\}`;/,
  );

  // The row template carries the id the anchor targets.
  expect(page, 'each tr carries the row id template').toContain(`<tr id={\`row-\${item.name}\`}>`);

  // The retargeted set, derived at run time: 17 non-component rows, each with
  // a unique anchor (component hrefs stay /components/{item}).
  expect(nonComponentItems.length, 'the manifest carries 17 non-component rows').toBe(17);
  expect(dataset.length - componentItems.length).toBe(nonComponentItems.length);
  const anchors = nonComponentItems.map((item) => `#row-${item.name}`);
  expect(new Set(anchors).size, 'every non-component anchor is unique').toBe(17);

  // MUST_NOT: no /components#ui, /components#lib, or any /components#{family}.
  expect(page.match(/\/components#/g)?.length ?? 0, '0 legacy /components#{family} hrefs').toBe(0);

  // The surgical-retarget survivors: both engine base URLs (rendered as links
  // AND copyable), the generated-at-build note, the per-row CopyButton.
  expect(page).toContain("const NATIVEWIND_BASE = 'https://rnraielements.com/r/nativewind'");
  expect(page).toContain("const UNIWIND_BASE = 'https://rnraielements.com/r/uniwind'");
  expect(
    page.match(/<a href=\{NATIVEWIND_BASE\}/g)?.length,
    'the nativewind base URL renders',
  ).toBe(1);
  expect(page.match(/<a href=\{UNIWIND_BASE\}/g)?.length, 'the uniwind base URL renders').toBe(1);
  expect(page.match(/<CopyButton command=\{NATIVEWIND_BASE\}/g)?.length).toBe(1);
  expect(page.match(/<CopyButton command=\{UNIWIND_BASE\}/g)?.length).toBe(1);
  expect(page, 'the generated-at-build note survives').toContain('Generated at build');
  expect(page, 'the per-row CopyButton survives').toMatch(
    /<CopyButton\s+command=\{installCommand\(item\.name\)\}/,
  );
});

it('FAM-005-sprint01-vocabulary-updated: both sprint-01 specs carry the new vocabulary, derive from the dataset, and pin 0 retired short strings', () => {
  expect(
    existsSync(SPEC_ITEM_PAGE),
    `the sprint-01 item-page spec exists at ${SPEC_ITEM_PAGE}`,
  ).toBe(true);
  expect(existsSync(SPEC_LEDGER), `the sprint-01 ledger spec exists at ${SPEC_LEDGER}`).toBe(true);
  const itemPageSpec = readFileSync(SPEC_ITEM_PAGE, 'utf8');
  const ledgerSpec = readFileSync(SPEC_LEDGER, 'utf8');

  // component-page.spec.ts — the expo-chip expectation references the new
  // vocabulary, derived from the dataset's expoGo field (data-equality shape).
  expect(itemPageSpec).toContain("'runs in Expo Go'");
  expect(itemPageSpec).toContain("'requires a dev client'");
  expect(itemPageSpec, 'the chip expectation derives from expoGo').toMatch(
    /li\[data-chip="expo"\].*expoGo \? 'runs in Expo Go' : 'requires a dev client'/s,
  );

  // ledger.spec.ts — the verdict expectations (helper + docsHref mirror)
  // reference the new vocabulary and the in-page anchors.
  expect(ledgerSpec).toContain("'runs in Expo Go'");
  expect(ledgerSpec).toContain("'requires a dev client'");
  expect(ledgerSpec, 'the verdict helper derives expected text from expoGo').toMatch(
    /const verdictLabel = \(expoGo: boolean\): string =>\s*expoGo \? 'runs in Expo Go' : 'requires a dev client';/,
  );
  expect(ledgerSpec, 'row verdicts flow through the dataset map').toContain(
    'ITEMS.map((item) => verdictLabel(item.expoGo))',
  );
  expect(ledgerSpec, 'the docsHref mirror anchors non-component rows in-page').toContain(
    `\`#row-\${item.name}\``,
  );

  // MUST_NOT: neither spec pins the retired short strings.
  expect(itemPageSpec, "component-page.spec.ts pins 0 'Expo Go' literals").not.toContain(
    "'Expo Go'",
  );
  expect(itemPageSpec, "component-page.spec.ts pins 0 'Dev client' literals").not.toContain(
    "'Dev client'",
  );
  expect(ledgerSpec, "ledger.spec.ts pins 0 'Expo Go' literals").not.toContain("'Expo Go'");
  expect(ledgerSpec, "ledger.spec.ts pins 0 'Dev client' literals").not.toContain("'Dev client'");
});
