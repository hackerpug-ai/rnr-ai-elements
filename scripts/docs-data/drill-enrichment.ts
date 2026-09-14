/**
 * REF-011 enrichment drill — drill-item-count.ts grown from one arm to four.
 *
 * Each arm mutates a REAL repo fixture, runs the REAL gates CLI (or the REAL
 * docs build) over the mutated tree, then byte-exact-restores the captured
 * bytes in a finally block — the restore runs on every path, including
 * expectation failure — and re-runs the real command over the restored tree.
 * The gate expectation is captured from the CLEAN pre-mutation tree (the
 * drill-item-count.ts law), never from a mutated source.
 *
 *   (a) props  — an unresolved props type injected into the real shimmer.tsx
 *       source fails the props gate naming shimmer; the restored run exits 0.
 *   (b) matrix — streamdown's peers[] blanked in REF-007's real
 *       dev-client-matrix.json fails the matrix gate naming streamdown.
 *   (c) imagery — the flag pair (T-GEND-022): imagery injected into every
 *       registry.json entry EXCEPT the pinned holdout. Flag ON exits 1 naming
 *       exactly the holdout; the default (flag off) exits 0 over the same
 *       mutated tree. The single violation proves the injected imagery is
 *       attributed — a failed injection names all 56.
 *   (d) derivation — one new optional prop in the real conversation.tsx moves
 *       the props-table region AND the Code-view region of dist together
 *       (T-GEND-026 single-source derivation), then restores + rebuilds.
 *
 * Prints a JSON report on stdout: arms[] (4 spawn records with real integer
 * exit codes and captured outputs, per-arm sha256 before/after pairs, a
 * per-arm expectationsHeld) plus the aggregate. Exits 0 only when every arm
 * held. Refuses to run over a dirty tree (the count-drill precheck law).
 * Real processes, real filesystem, no mocks, no synthetic fixture trees.
 *
 * A CLI like drill-item-count.ts: spawned by the lane test via tsx, never
 * imported (hence the fallow-ignore-file unused-file directive below).
 */
// fallow-ignore-file unused-file
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveKindFamilies, EXPECTED_ITEM_COUNT, type Expectation } from './gates';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SHIMMER_SRC = join(ROOT, 'packages/registry/src/components/ai/shimmer.tsx');
const CONVERSATION_SRC = join(ROOT, 'packages/registry/src/components/ai/conversation.tsx');
const REGISTRY_JSON = join(ROOT, 'packages/registry/registry.json');
const MATRIX_JSON = join(ROOT, 'apps/docs/src/data/dev-client-matrix.json');
const MANIFEST_JSON = join(ROOT, 'apps/docs/src/data/gallery-manifest.json');
const DIST_HTML = join(ROOT, 'apps/docs/dist/components/conversation/index.html');

/** Arm (a) item — the FUSE-04 drill precedent item. */
const PROPS_ITEM = 'shimmer';
/** Arm (b) entry — the pinned streamdown matrix entry. */
const MATRIX_ENTRY = 'streamdown';
/** Arm (c) holdout — the one entry left WITHOUT injected imagery, so the
 * flag-ON run names exactly it. */
const IMAGERY_HOLDOUT = 'prompt-input';
/** Arm (d) item — the human gate's named page with a non-empty props table. */
const DERIVATION_ITEM = 'conversation';
/** The one new optional prop arm (d) adds to the conversation source. */
const DERIVATION_PROP = 'drillProbeRef011';
const DERIVATION_EDIT_LINE = `${DERIVATION_PROP}?: boolean;`;

const SHIMMER_ANCHOR = '  active?: boolean;\n};';
const SHIMMER_REPLACEMENT = '  active?: boolean;\n  tone: NonexistentFlavorTone;\n};';
const CONVERSATION_ANCHOR = '  emptyState?: ConversationEmptyStateProps;\n};';
const CONVERSATION_REPLACEMENT = `  emptyState?: ConversationEmptyStateProps;\n  ${DERIVATION_EDIT_LINE}\n};`;

const GATE_TIMEOUT_MS = 240_000;
const BUILD_TIMEOUT_MS = 420_000;
const NAMES_MATCH = `${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT} names match`;

type RunResult = { exitCode: number; stdout: string; stderr: string };
type ShaPair = { before: string; after: string; bytesIdentical: boolean };

type ArmCommon = {
  label: string;
  item: string;
  mutatedPath: string;
  sha256: ShaPair;
  expectationsHeld: boolean;
};
type PropsArm = ArmCommon & {
  arm: 'props';
  runs: { mutated: RunResult; restored: RunResult };
};
type MatrixArm = ArmCommon & {
  arm: 'matrix';
  runs: { mutated: RunResult; restored: RunResult };
};
type ImageryArm = ArmCommon & {
  arm: 'imagery';
  runs: { on: RunResult; default: RunResult };
  onImageryViolationCount: number;
};
type DerivationArm = ArmCommon & {
  arm: 'derivation';
  runs: { mutatedBuild: RunResult; restoredBuild: RunResult };
  prop: string;
  editLine: string;
  distPath: string;
  mutatedDist: { propsRegionHasProp: boolean; sourceRegionHasEdit: boolean };
  restoredDist: { propOccurrences: number; editOccurrences: number };
};
type Arm = PropsArm | MatrixArm | ImageryArm | DerivationArm;

type Report = {
  arms: Arm[];
  mutatedPaths: { path: string; sha256: ShaPair }[];
  expectationsHeld: boolean;
};

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');
const rel = (absolute: string): string => relative(ROOT, absolute);
const notRun = (): RunResult => ({ exitCode: -1, stdout: '', stderr: 'not run' });
const combined = (run: RunResult): string => `${run.stdout}\n${run.stderr}`;
/** A passing gate run: exit 0 AND the pinned 56-of-56 names-match line. */
const gatesPassed = (run: RunResult): boolean =>
  run.exitCode === 0 && run.stdout.includes(NAMES_MATCH);
/** A failing gate run whose output carries the pinned violation shape. */
const failedNaming = (run: RunResult, violation: RegExp): boolean =>
  run.exitCode !== 0 && violation.test(combined(run));
/** Every check must hold — a declarative chain, so a dropped check is visible. */
const allHeld = (checks: boolean[]): boolean => checks.every(Boolean);
const countOccurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;

/** The sha256 before/after pair for a mutated path after its finally restore. */
function restoredShaPair(preBytes: Buffer, path: string): ShaPair {
  const postBytes = readFileSync(path);
  return {
    before: sha256(preBytes),
    after: sha256(postBytes),
    bytesIdentical: postBytes.equals(preBytes),
  };
}

/** The [start, end) slice of an HTML document between two markers. */
function region(html: string, start: string, end: string): string {
  const i = html.indexOf(start);
  if (i < 0) return '';
  const j = html.indexOf(end, i);
  return j > i ? html.slice(i, j) : html.slice(i);
}

function spawnCaptured(
  command: string,
  args: string[],
  timeout: number,
  flagOn = false,
): RunResult {
  const env = { ...process.env } as NodeJS.ProcessEnv;
  delete env.DOCS_GATE_IMAGERY;
  if (flagOn) env.DOCS_GATE_IMAGERY = '1';
  const proc = spawnSync(command, args, { encoding: 'utf8', cwd: ROOT, env, timeout });
  if (proc.error) {
    return { exitCode: -1, stdout: '', stderr: proc.error.message };
  }
  return { exitCode: proc.status ?? -1, stdout: proc.stdout, stderr: proc.stderr };
}

/** The real gates CLI over the real tree; flagOn controls DOCS_GATE_IMAGERY. */
function runGate(expectationPath: string, flagOn = false): RunResult {
  return spawnCaptured(
    join(ROOT, 'node_modules/.bin/tsx'),
    [join(ROOT, 'scripts/docs-data/gates.ts'), '--expectation', expectationPath],
    GATE_TIMEOUT_MS,
    flagOn,
  );
}

/** The real docs build (prebuild gates + registry fan-out + astro dist). The
 * imagery flag is explicitly cleared so the embedded prebuild runs default. */
function runDocsBuild(): RunResult {
  return spawnCaptured('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], BUILD_TIMEOUT_MS);
}

function assertAnchorOnce(source: string, anchor: string, what: string): void {
  const count = countOccurrences(source, anchor);
  if (count !== 1) {
    throw new Error(`[drill] splice anchor for ${what} found ${count} times, expected exactly 1`);
  }
}

/** Arm (a) mutation: inject a prop typed with an unresolved type. */
function mutateShimmer(preBytes: Buffer): void {
  const source = preBytes.toString('utf8');
  writeFileSync(SHIMMER_SRC, source.replace(SHIMMER_ANCHOR, SHIMMER_REPLACEMENT));
}

/** Arm (b) mutation: blank streamdown's peers[] in the committed matrix. */
function blankStreamdownPeers(preBytes: Buffer): void {
  const doc = JSON.parse(preBytes.toString('utf8')) as { id: string; peers: unknown[] }[];
  const entry = doc.find((e) => e.id === MATRIX_ENTRY);
  if (!entry) throw new Error(`[drill] matrix entry "${MATRIX_ENTRY}" not found pre-mutation`);
  entry.peers = [];
  writeFileSync(MATRIX_JSON, `${JSON.stringify(doc, null, 2)}\n`);
}

/** Arm (c) mutation: imagery on every registry entry except the holdout. */
function injectImageryExceptHoldout(preBytes: Buffer): void {
  const doc = JSON.parse(preBytes.toString('utf8')) as { items: { name: string }[] };
  const mutated = {
    ...doc,
    items: doc.items.map((item) =>
      item.name === IMAGERY_HOLDOUT ? item : { ...item, imagery: { matrix: {}, darkStrip: {} } },
    ),
  };
  writeFileSync(REGISTRY_JSON, `${JSON.stringify(mutated, null, 2)}\n`);
}

/** Arm (d) mutation: one new optional prop in the conversation source. */
function insertDrillProbeProp(preBytes: Buffer): void {
  const source = preBytes.toString('utf8');
  writeFileSync(CONVERSATION_SRC, source.replace(CONVERSATION_ANCHOR, CONVERSATION_REPLACEMENT));
}

/** The dist regions arm (d) asserts moved together: the new prop inside the
 * props-table region AND the edited source line inside the Code-view region. */
function readMutatedDistRegions(): DerivationArm['mutatedDist'] {
  if (!existsSync(DIST_HTML)) {
    return { propsRegionHasProp: false, sourceRegionHasEdit: false };
  }
  const html = readFileSync(DIST_HTML, 'utf8');
  return {
    propsRegionHasProp: region(html, 'data-section="props"', 'data-section="theming"').includes(
      DERIVATION_PROP,
    ),
    sourceRegionHasEdit: region(html, 'data-section="source"', 'data-section="props"').includes(
      DERIVATION_EDIT_LINE,
    ),
  };
}

/** Whole-file occurrence counts in the restored dist — both must be 0. */
function readRestoredDistCounts(): DerivationArm['restoredDist'] {
  if (!existsSync(DIST_HTML)) {
    return { propOccurrences: -1, editOccurrences: -1 };
  }
  const html = readFileSync(DIST_HTML, 'utf8');
  return {
    propOccurrences: countOccurrences(html, DERIVATION_PROP),
    editOccurrences: countOccurrences(html, DERIVATION_EDIT_LINE),
  };
}

/** Clean-tree registry checks + the gate expectation captured from it. */
function precheckRegistry(expectationPath: string): void {
  const doc = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8')) as {
    items: { name: string; type: string }[];
  };
  if (doc.items.length !== EXPECTED_ITEM_COUNT) {
    throw new Error(
      `[drill] expected a clean ${EXPECTED_ITEM_COUNT}-item registry, found ${doc.items.length} — refusing to drill a dirty tree`,
    );
  }
  const components = doc.items.filter((i) => i.type === 'registry:component');
  if (components.length !== 39) {
    throw new Error(`[drill] expected 39 registry:component items, found ${components.length}`);
  }
  if (!doc.items.some((i) => i.name === IMAGERY_HOLDOUT)) {
    throw new Error(`[drill] imagery holdout "${IMAGERY_HOLDOUT}" absent from the clean registry`);
  }
  const expectation: Expectation = {
    expectedNames: doc.items.map((i) => i.name),
    families: deriveKindFamilies(doc.items),
  };
  writeFileSync(expectationPath, JSON.stringify(expectation));
}

function precheckMatrix(): void {
  const matrix = JSON.parse(readFileSync(MATRIX_JSON, 'utf8')) as { id: string }[];
  if (matrix.length !== 4 || !matrix.some((e) => e.id === MATRIX_ENTRY)) {
    throw new Error(
      `[drill] expected the committed 4-entry dev-client matrix with a "${MATRIX_ENTRY}" entry`,
    );
  }
}

function precheckBuildInputs(): void {
  if (!existsSync(join(ROOT, 'public/r')) || !existsSync(MANIFEST_JSON)) {
    throw new Error(
      '[drill] generated dataset absent — run `pnpm registry:build && pnpm gallery:manifest` first',
    );
  }
}

/**
 * The refusal law: verify the CLEAN tree before any mutation — 56 items / 39
 * components, the committed 4-entry matrix, both splice anchors, and the
 * generated dataset the docs build consumes. Throws (before mutating
 * anything) when the tree is dirty.
 */
function precheck(expectationPath: string): void {
  precheckRegistry(expectationPath);
  precheckMatrix();
  precheckBuildInputs();
  assertAnchorOnce(readFileSync(SHIMMER_SRC, 'utf8'), SHIMMER_ANCHOR, `arm (a) ${PROPS_ITEM}.tsx`);
  assertAnchorOnce(
    readFileSync(CONVERSATION_SRC, 'utf8'),
    CONVERSATION_ANCHOR,
    `arm (d) ${DERIVATION_ITEM}.tsx`,
  );
}

/** Arm (a): unresolved props type in the real shimmer source. */
function armProps(expectationPath: string): PropsArm {
  const preBytes = readFileSync(SHIMMER_SRC);
  let mutated = notRun();
  try {
    mutateShimmer(preBytes);
    mutated = runGate(expectationPath);
  } finally {
    writeFileSync(SHIMMER_SRC, preBytes);
  }
  const restored = runGate(expectationPath);
  const sha = restoredShaPair(preBytes, SHIMMER_SRC);
  return {
    arm: 'props',
    label: `unresolved props type in ${PROPS_ITEM}.tsx fails the props gate, then restores`,
    item: PROPS_ITEM,
    mutatedPath: rel(SHIMMER_SRC),
    runs: { mutated, restored },
    sha256: sha,

    expectationsHeld: allHeld([
      failedNaming(
        mutated,
        new RegExp(`\\[docs-data\\] props: item "${PROPS_ITEM}".*unresolved type`),
      ),
      gatesPassed(restored),
      sha.bytesIdentical,
    ]),
  };
}

/** Arm (b): streamdown's peers[] blanked in the real dev-client matrix. */
function armMatrix(expectationPath: string): MatrixArm {
  const preBytes = readFileSync(MATRIX_JSON);
  let mutated = notRun();
  try {
    blankStreamdownPeers(preBytes);
    mutated = runGate(expectationPath);
  } finally {
    writeFileSync(MATRIX_JSON, preBytes);
  }
  const restored = runGate(expectationPath);
  const sha = restoredShaPair(preBytes, MATRIX_JSON);
  return {
    arm: 'matrix',
    label: `blanked peers[] on "${MATRIX_ENTRY}" fails the matrix gate, then restores`,
    item: MATRIX_ENTRY,
    mutatedPath: rel(MATRIX_JSON),
    runs: { mutated, restored },
    sha256: sha,

    expectationsHeld: allHeld([
      failedNaming(
        mutated,
        new RegExp(`\\[docs-data\\] matrix: item "${MATRIX_ENTRY}" has empty peers`),
      ),
      gatesPassed(restored),
      sha.bytesIdentical,
    ]),
  };
}

/** Arm (c): the imagery-flag pair over imagery injected into registry.json. */
function armImagery(expectationPath: string): ImageryArm {
  const preBytes = readFileSync(REGISTRY_JSON);
  let on = notRun();
  let defaultRun = notRun();
  let onImageryViolationCount = -1;
  try {
    injectImageryExceptHoldout(preBytes);
    on = runGate(expectationPath, true);
    onImageryViolationCount = countOccurrences(combined(on), '[docs-data] imagery: item "');
    defaultRun = runGate(expectationPath);
  } finally {
    writeFileSync(REGISTRY_JSON, preBytes);
  }
  const sha = restoredShaPair(preBytes, REGISTRY_JSON);
  return {
    arm: 'imagery',
    label: `imagery injected on every entry except "${IMAGERY_HOLDOUT}": flag ON fails naming only it, default passes`,
    item: IMAGERY_HOLDOUT,
    mutatedPath: rel(REGISTRY_JSON),
    runs: { on, default: defaultRun },
    onImageryViolationCount,
    sha256: sha,

    expectationsHeld: allHeld([
      failedNaming(
        on,
        new RegExp(`\\[docs-data\\] imagery: item "${IMAGERY_HOLDOUT}" missing imagery`),
      ),
      onImageryViolationCount === 1,
      gatesPassed(defaultRun),
      sha.bytesIdentical,
    ]),
  };
}

/** Arm (d): one source edit moves the props table and Code view together. */
function armDerivation(): DerivationArm {
  const preBytes = readFileSync(CONVERSATION_SRC);
  let mutatedBuild = notRun();
  let mutatedDist = { propsRegionHasProp: false, sourceRegionHasEdit: false };
  try {
    insertDrillProbeProp(preBytes);
    mutatedBuild = runDocsBuild();
    mutatedDist = readMutatedDistRegions();
  } finally {
    writeFileSync(CONVERSATION_SRC, preBytes);
  }
  // The restored build re-runs over the byte-restored tree so dist matches it.
  const restoredBuild = runDocsBuild();
  const restoredDist = readRestoredDistCounts();
  const sha = restoredShaPair(preBytes, CONVERSATION_SRC);
  return {
    arm: 'derivation',
    label: `one optional prop in ${DERIVATION_ITEM}.tsx moves the props table and Code view together in dist`,
    item: DERIVATION_ITEM,
    mutatedPath: rel(CONVERSATION_SRC),
    runs: { mutatedBuild, restoredBuild },
    prop: DERIVATION_PROP,
    editLine: DERIVATION_EDIT_LINE,
    distPath: rel(DIST_HTML),
    mutatedDist,
    restoredDist,
    sha256: sha,

    expectationsHeld: allHeld([
      mutatedBuild.exitCode === 0,
      restoredBuild.exitCode === 0,
      mutatedDist.propsRegionHasProp,
      mutatedDist.sourceRegionHasEdit,
      restoredDist.propOccurrences === 0,
      restoredDist.editOccurrences === 0,
      sha.bytesIdentical,
    ]),
  };
}

/** Runs all four arms; the per-arm finally blocks have already restored the
 * tree by the time this returns, on every path including expectation failure. */
function runDrill(): Report {
  const report: Report = { arms: [], mutatedPaths: [], expectationsHeld: false };
  const dir = mkdtempSync(join(tmpdir(), 'ref011-drill-'));
  try {
    const expectationPath = join(dir, 'expectation.json');
    precheck(expectationPath);
    // Arm order pinned: props, matrix, imagery, derivation.
    report.arms = [
      armProps(expectationPath),
      armMatrix(expectationPath),
      armImagery(expectationPath),
      armDerivation(),
    ];
    report.mutatedPaths = report.arms.map((arm) => ({
      path: arm.mutatedPath,
      sha256: arm.sha256,
    }));
    report.expectationsHeld = allHeld([
      report.arms.length === 4,
      ...report.arms.map((arm) => arm.expectationsHeld),
      ...report.mutatedPaths.map((p) => p.sha256.bytesIdentical),
    ]);
  } catch (err) {
    console.error(`[drill] ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return report;
}

function main(): void {
  const report = runDrill();
  // All four arms ran and held, every mutated path byte-identical — else 1.
  process.exitCode = report.arms.length === 4 && report.expectationsHeld ? 0 : 1;
  console.log(JSON.stringify(report, null, 2));
}

main();
