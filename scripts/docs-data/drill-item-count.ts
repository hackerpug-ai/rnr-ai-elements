/**
 * FUSE-04 count drill — the automation of human gate step 10 (ROADMAP).
 *
 * Deletes item "shimmer" from the REAL packages/registry/registry.json,
 * rebuilds public/r with the real `pnpm registry:build`, runs the gate CLI
 * over the mutated tree, then — in a finally block — byte-exact-restores the
 * registry bytes and re-runs the real build, leaving the tree clean even when
 * expectations fail. The expectation (56 names + kind families) is captured
 * from the CLEAN pre-mutation tree, never from the mutated source, and the
 * count gate checks it against the pinned 56.
 *
 * Prints a JSON report on stdout (both runs' real exit codes, captured
 * stdout/stderr, registry sha256 pair, public/r file counts) and exits 0 only
 * when every expectation held. Real processes, real filesystem, no mocks.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveKindFamilies, EXPECTED_ITEM_COUNT, type Expectation } from './gates';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REGISTRY_PATH = join(ROOT, 'packages/registry/registry.json');
const DRILL_ITEM = 'shimmer';

type RunResult = { exitCode: number; stdout: string; stderr: string };
type Report = {
  mutated: RunResult;
  restored: RunResult;
  registryBuilds: { mutated: number; restored: number };
  publicR: { pre: number; postMutation: number; postRestore: number };
  registryJson: { bytesIdentical: boolean; preSha256: string; postSha256: string };
  expectationsHeld: boolean;
};

function runGate(expectationPath: string): RunResult {
  const proc = spawnSync(
    join(ROOT, 'node_modules/.bin/tsx'),
    [join(ROOT, 'scripts/docs-data/gates.ts'), '--expectation', expectationPath],
    { encoding: 'utf8', cwd: ROOT, timeout: 240_000 },
  );
  if (proc.error) {
    return { exitCode: -1, stdout: '', stderr: proc.error.message };
  }
  return { exitCode: proc.status ?? -1, stdout: proc.stdout, stderr: proc.stderr };
}

function runRegistryBuild(): number {
  const proc = spawnSync('pnpm', ['registry:build'], {
    encoding: 'utf8',
    cwd: ROOT,
    timeout: 120_000,
  });
  if (proc.error) {
    console.error(`[drill] registry:build failed to spawn: ${proc.error.message}`);
    return -1;
  }
  return proc.status ?? -1;
}

function countPublicR(): number {
  let count = 0;
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name));
      else count++;
    }
  };
  walk(join(ROOT, 'public/r'));
  return count;
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');

function main(): void {
  const preBytes = readFileSync(REGISTRY_PATH);
  const preDoc = JSON.parse(preBytes.toString('utf8')) as {
    items: { name: string; type: string }[];
  };
  const report: Report = {
    mutated: { exitCode: -1, stdout: '', stderr: 'not run' },
    restored: { exitCode: -1, stdout: '', stderr: 'not run' },
    registryBuilds: { mutated: -1, restored: -1 },
    publicR: { pre: countPublicR(), postMutation: -1, postRestore: -1 },
    registryJson: { bytesIdentical: false, preSha256: sha256(preBytes), postSha256: '' },
    expectationsHeld: false,
  };
  const dir = mkdtempSync(join(tmpdir(), 'fuse04-drill-'));
  try {
    if (preDoc.items.length !== EXPECTED_ITEM_COUNT) {
      throw new Error(
        `[drill] expected a clean ${EXPECTED_ITEM_COUNT}-item registry, found ${preDoc.items.length} — refusing to drill a dirty tree`,
      );
    }
    // Expectation captured from the CLEAN tree, pre-mutation — real capture.
    const expectation: Expectation = {
      expectedNames: preDoc.items.map((i) => i.name),
      families: deriveKindFamilies(preDoc.items),
    };
    const expectationPath = join(dir, 'expectation.json');
    writeFileSync(expectationPath, JSON.stringify(expectation));
    try {
      const mutatedDoc = { ...preDoc, items: preDoc.items.filter((i) => i.name !== DRILL_ITEM) };
      if (mutatedDoc.items.length !== EXPECTED_ITEM_COUNT - 1) {
        throw new Error(`[drill] item "${DRILL_ITEM}" not found in the clean registry`);
      }
      writeFileSync(REGISTRY_PATH, `${JSON.stringify(mutatedDoc, null, 2)}\n`);
      report.registryBuilds.mutated = runRegistryBuild();
      report.publicR.postMutation = countPublicR();
      report.mutated = runGate(expectationPath);
    } finally {
      // Restore-after: byte-exact write-back + real rebuild, always.
      writeFileSync(REGISTRY_PATH, preBytes);
      report.registryBuilds.restored = runRegistryBuild();
      report.publicR.postRestore = countPublicR();
    }
    report.restored = runGate(expectationPath);
    const postBytes = readFileSync(REGISTRY_PATH);
    report.registryJson.postSha256 = sha256(postBytes);
    report.registryJson.bytesIdentical = postBytes.equals(preBytes);

    const mutatedOut = `${report.mutated.stdout}\n${report.mutated.stderr}`;
    report.expectationsHeld =
      report.mutated.exitCode === 1 &&
      mutatedOut.includes(DRILL_ITEM) &&
      new RegExp(
        `\\[docs-data\\] count: item "${DRILL_ITEM}" missing; observed ${EXPECTED_ITEM_COUNT - 1} versus ${EXPECTED_ITEM_COUNT}`,
      ).test(mutatedOut) &&
      report.restored.exitCode === 0 &&
      report.restored.stdout.includes(
        `${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT} names match`,
      ) &&
      report.registryJson.bytesIdentical &&
      report.registryBuilds.mutated === 0 &&
      report.registryBuilds.restored === 0 &&
      report.publicR.postRestore === report.publicR.pre;
    process.exitCode = report.expectationsHeld ? 0 : 1;
  } catch (err) {
    console.error(`[drill] ${err instanceof Error ? err.message : String(err)}`);
    process.exitCode = 1;
  } finally {
    console.log(JSON.stringify(report, null, 2));
    rmSync(dir, { recursive: true, force: true });
  }
}

main();
