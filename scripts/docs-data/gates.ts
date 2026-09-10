/**
 * Fail-closed docs-data gates (FUSE-04). Five pure checks over the enriched
 * dataset plus the real FUSE-03 props extractor, so a silently-degraded docs
 * dataset is impossible: exact-56 count naming the mismatching item, non-empty
 * files, props resolved (extractor throw = violation; [] is legal), exact
 * family coverage, verdict present.
 *
 * - Every violation renders as '[docs-data] <gate>: item "<name>" ...' — the
 *   build failure always names the offending item.
 * - The expected count is the PINNED EXPECTED_ITEM_COUNT plus the passed-in
 *   expected-names list — never derived from the dataset under test, so a
 *   hand-shortened 55-item registry cannot pass against itself.
 * - Gates never write output files (FUSE-05 owns writing). runAllGates
 *   aggregates ALL violations into one GateError instead of first-throw.
 * - CLI: `tsx scripts/docs-data/gates.ts --expectation <json>` over the real
 *   tree (registry.json items joined with the FUSE-02 verdict dataset);
 *   exits 1 with the violation list on stderr, 0 with a success line on
 *   stdout. Pre-FUSE-05 the expectation is captured from a trusted clean tree
 *   (see drill-item-count.ts); post-FUSE-05 it is families.json.
 */
import { readFileSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Project } from 'ts-morph';
import { createDocsProject, extractPropsForItem, type RegistryItem } from './props';

/** The registry pin: the docs dataset contains exactly this many items. */
export const EXPECTED_ITEM_COUNT = 56;

export type GateName = 'count' | 'files' | 'props' | 'family' | 'verdict';

/** One failed check. `item` is the offending dataset item (quoted when rendered). */
export type Violation = {
  gate: GateName;
  item: string;
  detail: string;
  /** Present on count violations: the pinned observed-versus-expected pair. */
  observed?: number;
  expected?: number;
};

/** The trusted outside source the dataset is checked AGAINST — never the dataset itself. */
export type Expectation = {
  expectedNames: string[];
  families: Record<string, string[]>;
};

/** The enriched-entry shape the gates operate on: a registry item plus its verdict. */
export type EnrichedItem = RegistryItem & { expoGo?: boolean };

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * The pinned violation renderer. Exactly '[docs-data] <gate>: item "<name>"
 * <detail>' with an optional '; observed <n> versus <m>' suffix — the shape
 * the drill greps for and AC-3 pins.
 */
export function formatViolation(v: Violation): string {
  const counts =
    v.observed !== undefined && v.expected !== undefined
      ? `; observed ${v.observed} versus ${v.expected}`
      : '';
  return `[docs-data] ${v.gate}: item "${v.item}" ${v.detail}${counts}`;
}

/** Aggregate of every violation from a runAllGates pass — one throw, all items listed. */
export class GateError extends Error {
  readonly violations: Violation[];

  constructor(violations: Violation[]) {
    super(violations.map(formatViolation).join('\n'));
    this.name = 'GateError';
    this.violations = violations;
  }
}

export function gateCount(dataset: EnrichedItem[], expectation: Expectation): Violation[] {
  const observed = dataset.map((i) => i.name);
  const expected = expectation.expectedNames;
  const counts = { observed: observed.length, expected: EXPECTED_ITEM_COUNT };
  const violations: Violation[] = [];
  for (const name of expected.filter((n) => !observed.includes(n))) {
    violations.push({ gate: 'count', item: name, detail: 'missing', ...counts });
  }
  for (const name of observed.filter((n) => !expected.includes(n))) {
    violations.push({
      gate: 'count',
      item: name,
      detail: 'unexpected (absent from expected names)',
      ...counts,
    });
  }
  for (const name of new Set(observed.filter((n, i) => observed.indexOf(n) !== i))) {
    violations.push({ gate: 'count', item: name, detail: 'duplicated in dataset', ...counts });
  }
  // The pin itself: an expectation whose name list is not the pinned 56 is a
  // malformed expectation, flagged even when the name diff is otherwise clean.
  if (expected.length !== EXPECTED_ITEM_COUNT) {
    violations.push({
      gate: 'count',
      item: '<expectation>',
      detail: `expected-names list has ${expected.length} names; pinned expected count is ${EXPECTED_ITEM_COUNT}`,
      ...counts,
    });
  }
  return violations;
}

export function gateFiles(dataset: EnrichedItem[], root: string = REPO_ROOT): Violation[] {
  const violations: Violation[] = [];
  for (const item of dataset) {
    if (item.files.length === 0) {
      violations.push({ gate: 'files', item: item.name, detail: 'has no files' });
      continue;
    }
    for (const file of item.files) {
      const path = isAbsolute(file.path) ? file.path : join(root, file.path);
      let size = -1;
      try {
        size = statSync(path).size;
      } catch {
        // missing file — size stays -1
      }
      if (!file.path || size <= 0) {
        violations.push({
          gate: 'files',
          item: item.name,
          detail: `references missing/empty file ${path}`,
        });
      }
    }
  }
  return violations;
}

/**
 * Props-resolved gate: runs the REAL FUSE-03 extractor per registry:component
 * item. An empty-resolved [] is legal (no declared props surface); only an
 * extractor throw — an unresolved type — is a violation, carried verbatim so
 * the prop is named.
 */
export function gateProps(
  dataset: EnrichedItem[],
  project: Project = createDocsProject(),
): Violation[] {
  const violations: Violation[] = [];
  for (const item of dataset) {
    if (item.type !== 'registry:component') continue; // ui/lib items are null by contract
    try {
      extractPropsForItem(item, project);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      violations.push({
        gate: 'props',
        item: item.name,
        detail: message.replace(/^\[docs-data\] props: item "[^"]*" /, '') || 'extractor threw',
      });
    }
  }
  return violations;
}

export function gateFamily(
  dataset: EnrichedItem[],
  families: Record<string, string[]>,
): Violation[] {
  const datasetNames = new Set(dataset.map((i) => i.name));
  const assignments = new Map<string, string[]>();
  const violations: Violation[] = [];
  for (const [family, names] of Object.entries(families)) {
    for (const name of names) {
      if (!datasetNames.has(name)) {
        violations.push({
          gate: 'family',
          item: name,
          detail: `referenced by family "${family}" but absent from dataset`,
        });
        continue;
      }
      const list = assignments.get(name) ?? [];
      list.push(family);
      assignments.set(name, list);
    }
  }
  for (const item of dataset) {
    const fams = assignments.get(item.name) ?? [];
    if (fams.length === 0) {
      violations.push({ gate: 'family', item: item.name, detail: 'not covered by any family' });
    } else if (fams.length > 1) {
      violations.push({
        gate: 'family',
        item: item.name,
        detail: `assigned to ${fams.length} families (${fams.slice().sort().join(', ')})`,
      });
    }
  }
  return violations;
}

export function gateVerdict(dataset: EnrichedItem[]): Violation[] {
  return dataset
    .filter((item) => typeof item.expoGo !== 'boolean')
    .map((item) => ({
      gate: 'verdict' as const,
      item: item.name,
      detail: 'missing expoGo verdict',
    }));
}

/**
 * Runs all five gates and throws ONE GateError listing every offending item
 * (never first-throw — one build failure beats five CI runs). Returns [] on a
 * clean dataset. Pass a shared ts-morph Project to amortize extractor setup.
 */
export function runAllGates(
  dataset: EnrichedItem[],
  expectation: Expectation,
  project?: Project,
): Violation[] {
  const violations = [
    ...gateCount(dataset, expectation),
    ...gateFiles(dataset),
    ...gateProps(dataset, project),
    ...gateFamily(dataset, expectation.families),
    ...gateVerdict(dataset),
  ];
  if (violations.length > 0) throw new GateError(violations);
  return violations;
}

/**
 * Expectation-source helper for the pre-FUSE-05 era: families keyed by item
 * kind, captured from a TRUSTED clean tree (the drill's pre-mutation capture).
 * Never call this on the dataset under test — that is the self-derived
 * expectation the count gate exists to reject. FUSE-05 replaces this with a
 * committed families.json.
 */
export function deriveKindFamilies(
  items: { name: string; type: string }[],
): Record<string, string[]> {
  const families: Record<string, string[]> = {};
  for (const item of items) {
    const kind = item.type.replace('registry:', '');
    const list = families[kind] ?? [];
    list.push(item.name);
    families[kind] = list;
  }
  return families;
}

/**
 * The CLI's default dataset: real registry.json items joined with the FUSE-02
 * verdict dataset (gallery-manifest.json) — the expoGo boolean per name is
 * consumed, never recomputed here. An item absent from the manifest joins
 * with expoGo undefined and fails the verdict gate.
 */
export function loadDefaultDataset(root: string = REPO_ROOT): EnrichedItem[] {
  const registry = JSON.parse(
    readFileSync(join(root, 'packages/registry/registry.json'), 'utf8'),
  ) as { items: RegistryItem[] };
  const manifestPath = join(root, 'apps/docs/src/data/gallery-manifest.json');
  let verdicts: Map<string, boolean>;
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      name: string;
      expoGo: boolean;
    }[];
    verdicts = new Map(manifest.map((m) => [m.name, m.expoGo]));
  } catch (err) {
    throw new Error(
      `[docs-data] gates: verdict dataset ${manifestPath} unreadable — run \`pnpm gallery:manifest\` ` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
  return registry.items.map((item) => ({ ...item, expoGo: verdicts.get(item.name) }));
}

// CLI: gate the real tree. Violations go to stderr and the process exits 1;
// success prints the names-match line on stdout and exits 0.
function main(argv: string[] = process.argv.slice(2)): void {
  const expectationPath = readArg(argv, '--expectation');
  if (!expectationPath) {
    console.error(
      'usage: tsx scripts/docs-data/gates.ts --expectation <json: { expectedNames: string[]; families: Record<string, string[]> }>',
    );
    process.exit(2);
  }
  let expectation: Expectation | undefined;
  try {
    expectation = JSON.parse(readFileSync(expectationPath, 'utf8')) as Expectation;
  } catch (err) {
    console.error(
      `[docs-data] gates: expectation file ${expectationPath} unreadable (${err instanceof Error ? err.message : String(err)})`,
    );
    process.exit(2);
  }
  const dataset = loadDefaultDataset();
  try {
    runAllGates(dataset, expectation);
  } catch (err) {
    if (err instanceof GateError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }
  console.log(
    `[docs-data] gates: ${dataset.length} of ${EXPECTED_ITEM_COUNT} names match expectation; count, files, props, family, verdict gates pass`,
  );
}

function readArg(argv: string[], flag: string): string | undefined {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
