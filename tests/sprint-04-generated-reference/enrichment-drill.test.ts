import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { EXPECTED_ITEM_COUNT } from '../../scripts/docs-data/gates';

/**
 * REF-011 lane test — the four-arm enrichment drill as a real child process
 * (drill-item-count.ts precedent, one arm grown to four). The drill spawns the
 * REAL gates CLI and the REAL docs build over the REAL tree:
 *
 *   (a) an unresolved props type injected into shimmer.tsx fails the props
 *       gate naming shimmer; restore exits 0;
 *   (b) streamdown's peers[] blanked in dev-client-matrix.json fails the
 *       matrix gate naming streamdown; restore exits 0;
 *   (c) the imagery-flag pair — imagery injected into every registry entry
 *       except the pinned holdout: flag ON exits 1 naming exactly the holdout,
 *       the default (flag off) exits 0 over the same mutated tree;
 *   (d) one optional prop added to conversation.tsx moves the props table AND
 *       the Code view together in dist (T-GEND-026), then restores + rebuilds.
 *
 * Every mutated path is byte-exact-restored in a finally block inside the
 * drill; this lane additionally compares the bytes from the test side and
 * checks git cleanliness over the mutated paths (enrichment-gates.test.ts
 * precedent). One drill spawn is shared by the five test functions — the
 * beforeAll only runs when at least one of them is selected, so every
 * `-t REF-011-<token>` verify command still executes the real drill.
 */
const ROOT = process.cwd();

type RunResult = { exitCode: number; stdout: string; stderr: string };
type ShaPair = { before: string; after: string; bytesIdentical: boolean };

type ArmCommon = {
  label: string;
  item: string;
  mutatedPath: string;
  sha256: ShaPair;
  expectationsHeld: boolean;
};
type Arm =
  | (ArmCommon & { arm: 'props'; runs: { mutated: RunResult; restored: RunResult } })
  | (ArmCommon & { arm: 'matrix'; runs: { mutated: RunResult; restored: RunResult } })
  | (ArmCommon & {
      arm: 'imagery';
      runs: { on: RunResult; default: RunResult };
      onImageryViolationCount: number;
    })
  | (ArmCommon & {
      arm: 'derivation';
      runs: { mutatedBuild: RunResult; restoredBuild: RunResult };
      prop: string;
      editLine: string;
      distPath: string;
      mutatedDist: { propsRegionHasProp: boolean; sourceRegionHasEdit: boolean };
      restoredDist: { propOccurrences: number; editOccurrences: number };
    });

type Report = {
  arms: Arm[];
  mutatedPaths: { path: string; sha256: ShaPair }[];
  expectationsHeld: boolean;
};

/** The four pinned REAL mutation targets — a synthetic path here fails AC-1. */
const PINNED_PATHS = [
  'packages/registry/src/components/ai/shimmer.tsx',
  'apps/docs/src/data/dev-client-matrix.json',
  'packages/registry/registry.json',
  'packages/registry/src/components/ai/conversation.tsx',
] as const;

type PreBytes = { shimmer: Buffer; matrix: Buffer; registry: Buffer; conversation: Buffer };

/** Test-side capture of the four fixtures BEFORE the drill runs. */
function readPreBytes(): PreBytes {
  return {
    shimmer: readFileSync(join(ROOT, PINNED_PATHS[0])),
    matrix: readFileSync(join(ROOT, PINNED_PATHS[1])),
    registry: readFileSync(join(ROOT, PINNED_PATHS[2])),
    conversation: readFileSync(join(ROOT, PINNED_PATHS[3])),
  };
}

/** Spawns the real drill subprocess and parses its JSON report (AC-1). */
function spawnDrill(): Report {
  const proc = spawnSync(
    join(ROOT, 'node_modules/.bin/tsx'),
    [join(ROOT, 'scripts/docs-data/drill-enrichment.ts')],
    { encoding: 'utf8', cwd: ROOT, timeout: 560_000 },
  );
  expect(proc.error, `drill failed to spawn: ${proc.error ?? ''}`).toBeUndefined();
  expect(proc.status, `drill stdout:\n${proc.stdout}\ndrill stderr:\n${proc.stderr}`).toBe(0);
  const report = JSON.parse(proc.stdout) as Report;
  expect(report.expectationsHeld).toBe(true);
  return report;
}

/** AC-1: exactly 4 arms, integer exit codes, the two anchored exit-code pairs,
 * and captured real output behind every success field. */
function assertArmsShape(report: Report): void {
  expect(report.arms).toHaveLength(4);
  expect(report.arms.map((a) => a.arm)).toEqual(['props', 'matrix', 'imagery', 'derivation']);
  for (const arm of report.arms) {
    expect(arm.expectationsHeld, `${arm.arm} arm held its expectations`).toBe(true);
  }
  const propsArm = report.arms[0] as Extract<Arm, { arm: 'props' }>;
  const matrixArm = report.arms[1] as Extract<Arm, { arm: 'matrix' }>;
  const imageryArm = report.arms[2] as Extract<Arm, { arm: 'imagery' }>;
  const derivationArm = report.arms[3] as Extract<Arm, { arm: 'derivation' }>;
  const allRuns = [
    propsArm.runs.mutated,
    propsArm.runs.restored,
    matrixArm.runs.mutated,
    matrixArm.runs.restored,
    imageryArm.runs.on,
    imageryArm.runs.default,
    derivationArm.runs.mutatedBuild,
    derivationArm.runs.restoredBuild,
  ];
  for (const run of allRuns) {
    expect(Number.isInteger(run.exitCode), 'exitCode must be an integer').toBe(true);
  }
  // The two anchored pairs: props mutated 1 / restored 0; imagery ON != 0 / default 0.
  expect(propsArm.runs.mutated.exitCode).toBe(1);
  expect(propsArm.runs.restored.exitCode).toBe(0);
  expect(imageryArm.runs.on.exitCode).not.toBe(0);
  expect(imageryArm.runs.default.exitCode).toBe(0);
  // The failing runs carry captured real output, not bare success fields.
  expect(propsArm.runs.mutated.stderr.length).toBeGreaterThan(0);
  expect(imageryArm.runs.on.stderr.length).toBeGreaterThan(0);
}

/** AC-1: >=4 mutated REAL paths — exactly the pinned four, each byte-identical
 * before/after, each present on disk (no synthetic fixture trees). */
function assertMutatedPaths(report: Report): void {
  expect(report.mutatedPaths.length).toBeGreaterThanOrEqual(4);
  expect(report.mutatedPaths.map((p) => p.path).sort()).toEqual([...PINNED_PATHS].sort());
  for (const mutated of report.mutatedPaths) {
    expect(mutated.sha256.before).toBe(mutated.sha256.after);
    expect(mutated.sha256.bytesIdentical).toBe(true);
    expect(existsSync(join(ROOT, mutated.path)), `${mutated.path} is a real repo file`).toBe(true);
  }
}

/** TC-6: the drill left every mutated path byte-exact (test-side compare) and
 * git-clean over its blast radius (dist output is gitignored; public/r is
 * tracked and re-fanned by the derivation builds). */
function assertTreeRestored(preBytes: PreBytes): void {
  expect(readFileSync(join(ROOT, PINNED_PATHS[0]))).toEqual(preBytes.shimmer);
  expect(readFileSync(join(ROOT, PINNED_PATHS[1]))).toEqual(preBytes.matrix);
  expect(readFileSync(join(ROOT, PINNED_PATHS[2]))).toEqual(preBytes.registry);
  expect(readFileSync(join(ROOT, PINNED_PATHS[3]))).toEqual(preBytes.conversation);
  const git = spawnSync(
    'git',
    ['status', '--porcelain', 'packages/registry', 'apps/docs/src/data', 'public/r'],
    { encoding: 'utf8', cwd: ROOT },
  );
  expect(git.status).toBe(0);
  expect(git.stdout, `leftover mutation:\n${git.stdout}`).toBe('');
}

/** Shared sha-pair + byte-exact restore assertion for one arm. */
function assertShaRestored(
  report: Report,
  armIndex: number,
  pinnedPath: string,
  pre: Buffer,
): void {
  const arm = report.arms[armIndex] as ArmCommon;
  expect(arm.mutatedPath).toBe(pinnedPath);
  expect(arm.sha256.before).toBe(arm.sha256.after);
  expect(arm.sha256.bytesIdentical).toBe(true);
  expect(readFileSync(join(ROOT, pinnedPath))).toEqual(pre);
}

describe('REF-011 enrichment drill', () => {
  const preBytes = readPreBytes();
  let report: Report;

  beforeAll(() => {
    report = spawnDrill();
  }, 600_000);

  /** AC-1 + TC-6: honest four-arm report, sha pairs, clean tree after the run. */
  it('REF-011-drill-report', { timeout: 600_000 }, () => {
    assertArmsShape(report);
    assertMutatedPaths(report);
    assertTreeRestored(preBytes);
  });

  /** AC-2 + TC-2: unresolved props type fails the props gate naming shimmer. */
  it('REF-011-unresolved-props-drill', { timeout: 600_000 }, () => {
    const arm = report.arms[0] as Extract<Arm, { arm: 'props' }>;
    expect(arm.item).toBe('shimmer');
    const mutatedOut = `${arm.runs.mutated.stdout}\n${arm.runs.mutated.stderr}`;
    expect(arm.runs.mutated.exitCode, `mutated gate output:\n${mutatedOut}`).toBe(1);
    expect(mutatedOut).toMatch(/\[docs-data\] props: item "shimmer".*unresolved type/);
    // Restored run exits 0 with the 56-of-56 names-match line.
    expect(arm.runs.restored.exitCode, `restored stdout:\n${arm.runs.restored.stdout}`).toBe(0);
    expect(arm.runs.restored.stdout).toContain(
      `${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT} names match`,
    );
    assertShaRestored(report, 0, PINNED_PATHS[0], preBytes.shimmer);
  });

  /** AC-3 + TC-3: blanked streamdown peers[] fails the matrix gate naming it. */
  it('REF-011-matrix-drill', { timeout: 600_000 }, () => {
    const arm = report.arms[1] as Extract<Arm, { arm: 'matrix' }>;
    expect(arm.item).toBe('streamdown');
    const mutatedOut = `${arm.runs.mutated.stdout}\n${arm.runs.mutated.stderr}`;
    expect(arm.runs.mutated.exitCode, `mutated gate output:\n${mutatedOut}`).toBe(1);
    expect(mutatedOut).toMatch(/\[docs-data\] matrix: item "streamdown" has empty peers/);
    expect(arm.runs.restored.exitCode, `restored stdout:\n${arm.runs.restored.stdout}`).toBe(0);
    expect(arm.runs.restored.stdout).toContain(
      `${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT} names match`,
    );
    assertShaRestored(report, 1, PINNED_PATHS[1], preBytes.matrix);
  });

  /** AC-4 + TC-4: imagery flag ON fails naming the holdout; default passes. */
  it('REF-011-imagery-flag-pair', { timeout: 600_000 }, () => {
    const arm = report.arms[2] as Extract<Arm, { arm: 'imagery' }>;
    const onOut = `${arm.runs.on.stdout}\n${arm.runs.on.stderr}`;
    // The pair differentiates over the SAME mutated tree.
    expect(arm.runs.on.exitCode, `flag-on output:\n${onOut}`).not.toBe(0);
    expect(arm.runs.default.exitCode, `default output:\n${arm.runs.default.stdout}`).toBe(0);
    expect(arm.runs.on.exitCode).not.toBe(arm.runs.default.exitCode);
    // The named item is the pinned holdout, and it is the ONLY imagery
    // violation — the injected imagery on the other 55 entries is attributed
    // (a failed injection names all 56 and this count assertion fails).
    expect(onOut).toMatch(
      new RegExp(`\\[docs-data\\] imagery: item "${arm.item}" missing imagery`),
    );
    expect(arm.onImageryViolationCount).toBe(1);
    expect(arm.runs.default.stdout).not.toContain('[docs-data] imagery:');
    assertShaRestored(report, 2, PINNED_PATHS[2], preBytes.registry);
  });

  /** AC-5 + TC-5: one source edit moves props table AND Code view together. */
  it('REF-011-single-source-derivation', { timeout: 600_000 }, () => {
    const arm = report.arms[3] as Extract<Arm, { arm: 'derivation' }>;
    expect(arm.item).toBe('conversation');
    expect(arm.prop.length).toBeGreaterThan(0);
    expect(arm.editLine).toContain(arm.prop);
    expect(arm.distPath).toBe('apps/docs/dist/components/conversation/index.html');
    // Both real docs builds exited 0.
    expect(arm.runs.mutatedBuild.exitCode, `mutated build:\n${arm.runs.mutatedBuild.stdout}`).toBe(
      0,
    );
    expect(
      arm.runs.restoredBuild.exitCode,
      `restored build:\n${arm.runs.restoredBuild.stdout}`,
    ).toBe(0);
    // Mutated dist: BOTH regions moved together — the new prop inside the
    // props-table region AND the edited source text inside the Code-view
    // region. One without the other is a second-source derivation and fails.
    expect(arm.mutatedDist.propsRegionHasProp).toBe(true);
    expect(arm.mutatedDist.sourceRegionHasEdit).toBe(true);
    // Restored dist: neither the prop name nor the edited text occurs at all.
    expect(arm.restoredDist.propOccurrences).toBe(0);
    expect(arm.restoredDist.editOccurrences).toBe(0);
    assertShaRestored(report, 3, PINNED_PATHS[3], preBytes.conversation);
  });
});
