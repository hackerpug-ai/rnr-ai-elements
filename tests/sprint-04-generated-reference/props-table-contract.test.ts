import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * REF-002 — source-contract scan over the authored PropsTable.astro in the
 * REAL apps/docs/src/components tree, grounded in the real sprint-01 prebuild
 * dataset (apps/docs/src/data/registry-items.json).
 *
 * UNIT_TEST_JUSTIFIED: pure static source-contract scan over an authored
 * .astro file plus a real registry JSON read — file reads only, no rendering,
 * no network, no DB (the landed primitives.test.ts pattern). The rendered
 * table proof (FLOW-GEND-34, 39 tables; the 390px stacked-card frame) is
 * REF-009's assembly lane, outside this task's write_allowed.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const COMPONENT = join(repoRoot, 'apps', 'docs', 'src', 'components', 'PropsTable.astro');
const DATASET = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

interface PropRow {
  name: string;
  type: string;
  default: string | null;
  description: string | null;
}

interface RegistryItem {
  type: string;
  name: string;
  props?: PropRow[];
}

/** RED anchor: names the absent component when PropsTable.astro is missing. */
function readComponent(): string {
  expect(
    existsSync(COMPONENT),
    `RED anchor: PropsTable.astro is absent — author the component at ${COMPONENT} (REF-002)`,
  ).toBe(true);
  return readFileSync(COMPONENT, 'utf8');
}

function loadComponents(): RegistryItem[] {
  expect(
    existsSync(DATASET),
    `real dataset absent at ${DATASET} — run pnpm exec tsx scripts/docs-data/prebuild.ts`,
  ).toBe(true);
  const items = JSON.parse(readFileSync(DATASET, 'utf8')) as RegistryItem[];
  return items.filter((item) => item.type === 'registry:component');
}

function styleBlockOf(source: string): string {
  const match = source.match(/<style>([\s\S]*?)<\/style>/);
  expect(match, 'PropsTable.astro carries a scoped <style> block').toBeTruthy();
  return match?.[1] ?? '';
}

function templateOf(source: string): string {
  return source.replace(/<style>[\s\S]*?<\/style>/, '');
}

/** Split a CSS chunk into per-rule fragments (selector + declarations). */
function rulesOf(css: string): string[] {
  return css
    .split('}')
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0);
}

/** Extract every @media block (header + brace-balanced body). */
function mediaQueries(css: string): Array<{ header: string; body: string }> {
  const queries: Array<{ header: string; body: string }> = [];
  const re = /@media[^{]*\{/g;
  let match: RegExpExecArray | null = re.exec(css);
  while (match !== null) {
    const start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
      i += 1;
    }
    queries.push({ header: match[0], body: css.slice(start, i - 1) });
    re.lastIndex = i;
    match = re.exec(css);
  }
  return queries;
}

it('REF-002-props-table-anatomy: 4-column table driven by the generated props[] dataset', () => {
  const source = readComponent();
  const template = templateOf(source);
  const style = styleBlockOf(source);

  // Exactly 1 <table>, thead of exactly 4 <th> in order.
  expect(template.match(/<table[\s>]/g) ?? [], 'exactly 1 <table>').toHaveLength(1);
  const thead = template.match(/<thead>([\s\S]*?)<\/thead>/);
  expect(thead, 'thead present').toBeTruthy();
  const thLabels = [...(thead?.[1].matchAll(/<th[^>]*>([^<]*)<\/th>/g) ?? [])].map((m) =>
    m[1].trim(),
  );
  expect(thLabels, '4 columns in order').toEqual(['Name', 'Type', 'Default', 'Description']);

  // Exactly 1 rows-driven loop emitting 1 <tr> (4 <td>) per prop entry.
  expect(template.match(/rows\.map\(/g) ?? [], 'exactly 1 rows.map loop').toHaveLength(1);
  const loopBody = template.slice(template.indexOf('rows.map('), template.indexOf('</tbody>'));
  expect(loopBody.match(/<tr[\s>]/g) ?? [], '1 <tr> per prop entry').toHaveLength(1);
  expect(loopBody.match(/<td[\s>]/g) ?? [], '4 <td> per row').toHaveLength(4);

  // Token typography: mono names, muted types, exactly 1 var(--muted) zebra.
  const rules = rulesOf(style);
  const nameRule = rules.find((rule) => rule.includes('.props-table__name'));
  expect(nameRule, 'prop-name cell rule exists').toContain('font-family: var(--font-mono)');
  const typeRule = rules.find((rule) => rule.includes('.props-table__type'));
  expect(typeRule, 'type cell rule exists').toContain('color: var(--muted-foreground)');
  const zebra = rules.filter((rule) => rule.includes('nth-child(even)'));
  expect(zebra, 'exactly 1 zebra rule').toHaveLength(1);
  expect(zebra[0], 'zebra consumes var(--muted)').toContain('var(--muted)');

  // Zero JS, zero hex, zero hardcoded prop rows.
  expect(source, '0 <script> tags').not.toContain('<script');
  expect(source, '0 customElements.define calls').not.toContain('customElements.define');
  expect(source.match(HEX_LITERAL), '0 hex color literals').toBeNull();
  expect(source, '0 hardcoded prop rows (dataset drives rows)').not.toContain(
    'nearBottomThreshold',
  );

  // Dataset grounding: 39/39 non-empty props[], 180 rows, conversation 5 rows.
  const components = loadComponents();
  const withProps = components.filter((item) => (item.props?.length ?? 0) > 0);
  const totalRows = withProps.reduce((count, item) => count + (item.props?.length ?? 0), 0);
  const conversation = components.find((item) => item.name === 'conversation');
  const nearBottom = conversation?.props?.find((prop) => prop.name === 'nearBottomThreshold');
  console.log(
    `[REF-002 anatomy] th columns: ${thLabels.join('/')} | td per row: 4 | scripts: 0 | hex: 0 | hardcoded rows: 0`,
  );
  console.log(
    `[REF-002 anatomy] dataset: ${withProps.length}/${components.length} non-empty props[] · ${totalRows} rows · conversation ${conversation?.props?.length} rows · nearBottomThreshold default ${JSON.stringify(nearBottom?.default)}`,
  );
  expect(components, '39 registry:component items').toHaveLength(39);
  expect(withProps, '39/39 carry non-empty props[]').toHaveLength(39);
  expect(totalRows, '180 prop rows total').toBe(180);
  expect(conversation?.props, 'conversation carries 5 rows').toHaveLength(5);
  expect(nearBottom?.default, "nearBottomThreshold default '50'").toBe('50');
});

it('REF-002-props-table-full-fidelity-types: mega types wrap in place, never truncated', () => {
  const source = readComponent();
  const style = styleBlockOf(source);
  const rules = rulesOf(style);

  // Type and description cells wrap in place.
  const typeRule = rules.find((rule) => rule.includes('.props-table__type'));
  expect(typeRule, 'type cell rule exists').toContain('overflow-wrap: anywhere');
  const descriptionRule = rules.find((rule) => rule.includes('.props-table__description'));
  expect(descriptionRule, 'description cell rule exists').toContain('overflow-wrap: anywhere');

  // Nothing anywhere in the style block can clip or truncate a cell.
  expect(style, '0 max-height declarations').not.toContain('max-height');
  expect(style, '0 line-clamp declarations').not.toContain('line-clamp');
  expect(style, '0 text-overflow declarations').not.toContain('text-overflow');
  expect(style, '0 white-space: nowrap on cells').not.toContain('nowrap');
  expect(style, '0 overflow: hidden on cells').not.toContain('overflow: hidden');

  // Dataset grounding: 83-char longest type, 2 rows embedding newlines.
  const props = loadComponents().flatMap((item) => item.props ?? []);
  const longest = props.reduce(
    (acc, prop) => (prop.type.length > acc.length ? prop.type : acc),
    '',
  );
  const newlineRows = props.filter(
    (prop) => prop.type.includes('\n') || prop.description?.includes('\n') === true,
  ).length;
  console.log(
    `[REF-002 fidelity] longest type ${longest.length} chars · ${newlineRows} newline-carrying rows · wrap: overflow-wrap: anywhere`,
  );
  expect(longest.length, 'longest type is 83 chars').toBe(83);
  expect(newlineRows, '2 rows embed newlines').toBe(2);
});

it('REF-002-props-table-mobile-card-mode: CSS-only stacked cards keyed on data-label', () => {
  const source = readComponent();
  const template = templateOf(source);
  const style = styleBlockOf(source);

  // Exactly 1 max-width media query; no print rules, no second query.
  const queries = mediaQueries(style);
  const maxWidth = queries.filter((query) => query.header.includes('max-width'));
  expect(maxWidth, 'exactly 1 max-width media query').toHaveLength(1);
  expect(queries, 'exactly 1 @media block total').toHaveLength(1);
  expect(style, '0 @media print rules (sprint-11 scope)').not.toContain('print');

  const queryRules = rulesOf(maxWidth[0]?.body ?? '');
  const theadRules = queryRules.filter((rule) => rule.includes('thead'));
  expect(theadRules, 'exactly 1 thead rule inside the query').toHaveLength(1);
  expect(theadRules[0], 'thead hidden inside the query').toContain('display: none');
  const beforeRules = queryRules.filter((rule) => rule.includes('::before'));
  expect(beforeRules, 'exactly 1 td::before rule inside the query').toHaveLength(1);
  expect(beforeRules[0], 'label restored from attr(data-label)').toContain(
    'content: attr(data-label)',
  );
  expect(
    queryRules.some((rule) => rule.includes('td') && rule.includes('display: block')),
    'cells stack (td display: block) inside the query',
  ).toBe(true);

  // Every td binds data-label to its column — 4 distinct values.
  const labels = [...template.matchAll(/data-label="([^"]*)"/g)].map((m) => m[1]);
  expect(labels, '4 data-label bindings').toHaveLength(4);
  expect(new Set(labels), '4 distinct column labels').toEqual(
    new Set(['Name', 'Type', 'Default', 'Description']),
  );
  console.log(
    `[REF-002 mobile] media queries: 1 (max-width) | data-labels: ${[...new Set(labels)].sort().join('/')} | scripts: 0 | print rules: 0`,
  );

  // Card mode is CSS-only.
  expect(source, '0 <script> tags').not.toContain('<script');
  expect(source, '0 customElements.define calls').not.toContain('customElements.define');
});

it('REF-002-props-table-null-em-dash-cells: null default/description render explicit em-dash cells', () => {
  const source = readComponent();
  const template = templateOf(source);

  // Null-coalescing em-dash paths on the default and description cells.
  expect(template, 'default cell null-coalesces to the em-dash').toMatch(
    /prop\.default\s*\?\?\s*'—'/,
  );
  expect(template, 'description cell null-coalesces to the em-dash').toMatch(
    /prop\.description\s*\?\?\s*'—'/,
  );

  // The row loop body emits all 4 <td> unconditionally — no guards, no skips.
  const loopBody = template.slice(template.indexOf('rows.map('), template.indexOf('</tbody>'));
  expect(loopBody.match(/<td[\s>]/g) ?? [], '4 <td> per row, unconditionally').toHaveLength(4);
  expect(loopBody, '0 conditional cell-omission guards (no &&)').not.toContain('&&');
  expect(loopBody, '0 cell-skipping ternaries').not.toContain('? (');

  // Dataset grounding: the em-dash path runs on real nulls.
  const props = loadComponents().flatMap((item) => item.props ?? []);
  const nullDefaults = props.filter((prop) => prop.default === null).length;
  const nullDescriptions = props.filter((prop) => prop.description === null).length;
  console.log(
    `[REF-002 null-cells] ${nullDefaults}/${props.length} null defaults · ${nullDescriptions}/${props.length} null descriptions — em-dash path exercised`,
  );
  expect(props, '180 prop rows').toHaveLength(180);
  expect(nullDefaults, '133 null defaults').toBe(133);
  expect(nullDescriptions, '107 null descriptions').toBe(107);
});
