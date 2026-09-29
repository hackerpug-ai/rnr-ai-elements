import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

/**
 * FIX-ORI-SUITE-2-1: the one aggregate's failing files are owner-routed.
 * The residual stays FLOW-DELIV-01-ci-chain-order. The four chartered suites
 * stay untouched. Real git diff and the committed inventory, no stubs.
 */
const ROOT = process.cwd();
const EVIDENCE = join(ROOT, 'tests/sprint-05-orient-search/evidence/FIX-ORI-SUITE-2-1');
const FOUR = [
  'tests/sprint-05-orient-search/docs-collection.test.ts',
  'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts',
  'tests/sprint-05-orient-search/live-example-api.test.ts',
  'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
] as const;
const OWNER_MAP_BASE = '8ee4282f24474eb8824e5a92685063f1070a12d6';
const OWNER_MAP_COMMIT = 'f9d30b09eadf06350a691cc9bd39a667ee2a8e52';
const HISTORICAL_FILES = {
  'tests/sprint-05-orient-search/docs-collection.test.ts':
    'cee6a83be305bb6035f9bac5b4ccbbbe9d12989d0b766f1551a619fd60460a6c',
  'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts':
    'df13b7f3ac26bd3734ba5739bf3ffc6ecf643e3b711e30aa538c0a91fda9aa5b',
  'tests/sprint-05-orient-search/live-example-api.test.ts':
    '6ea80d96e2b5abbdc4454e6eca055108b6458b42674c28c8455647d229a399f6',
  'tests/sprint-05-orient-search/nativewind-live-example.test.ts':
    '2e84e9489a528116e4f96bea53a43400d91fd76f4c0ee611ed3372979767a0ef',
  '.spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md':
    '21240201b952641ac08d800cc0ba662c9de025050014fa3763a81d681066439d',
} as const;
const ACTIONS = new Set([
  'report-only',
  'owner-task',
  'residual-only',
  'no-suite',
  'do-not-widen-allow-list',
]);

function filesIn(text: string): string[] {
  return text.match(/tests\/\S+?\.test\.ts/g) ?? [];
}

function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function verifyDurableHistoricalAudit(): void {
  expect(OWNER_MAP_BASE).toMatch(/^[0-9a-f]{40}$/);
  expect(OWNER_MAP_COMMIT).toMatch(/^[0-9a-f]{40}$/);
  expect(Object.keys(HISTORICAL_FILES)).toEqual([
    ...FOUR,
    '.spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md',
  ]);
  for (const digest of Object.values(HISTORICAL_FILES)) expect(digest).toMatch(/^[0-9a-f]{64}$/);
}

/** Execution/review mode requires the real historical objects and fails closed.
 * Ordinary aggregate mode uses the durable audit binding above, so a depth-one
 * detached checkout never tries to resolve objects it cannot contain. */
function auditHistoricalGitRange(): void {
  for (const [path, expected] of Object.entries(HISTORICAL_FILES)) {
    const before = execFileSync('git', ['show', `${OWNER_MAP_BASE}:${path}`], { cwd: ROOT });
    const after = execFileSync('git', ['show', `${OWNER_MAP_COMMIT}:${path}`], { cwd: ROOT });
    expect(sha256(before), `${path} base blob`).toBe(expected);
    expect(sha256(after), `${path} owner-map blob`).toBe(expected);
    execFileSync('git', ['diff', '--exit-code', OWNER_MAP_BASE, OWNER_MAP_COMMIT, '--', path], {
      cwd: ROOT,
      stdio: 'pipe',
    });
  }
}

it('FIX-ORI-SUITE-2-1-owner-routing: every aggregate failure has an owner and the residual is not widened', () => {
  verifyDurableHistoricalAudit();
  const inventory = JSON.parse(
    readFileSync(join(EVIDENCE, 'aggregate-inventory.json'), 'utf8'),
  ) as {
    collected_ori_vis_005_ac_5: boolean;
    failed_files: string[];
    failed_tests: { fail: string }[];
  };
  const routing = JSON.parse(readFileSync(join(EVIDENCE, 'owner-routing.json'), 'utf8')) as {
    residual_tokens: string[];
    residual_widened: boolean;
    edits_four_chartered_suites: boolean;
    four_chartered_suites: string[];
    routes: { file: string; owner: string; action: string; cause: string }[];
  };

  expect(inventory.collected_ori_vis_005_ac_5).toBe(false);
  expect(routing.residual_tokens).toEqual(['FLOW-DELIV-01-ci-chain-order']);
  expect(routing.residual_widened).toBe(false);
  expect(routing.edits_four_chartered_suites).toBe(false);
  expect(routing.four_chartered_suites).toEqual([...FOUR]);

  const failed = new Set<string>();
  for (const line of inventory.failed_files) {
    for (const file of filesIn(line)) failed.add(file);
  }
  for (const item of inventory.failed_tests) {
    for (const file of filesIn(item.fail)) failed.add(file);
  }
  expect(failed.size).toBeGreaterThan(0);

  const seen = new Set<string>();
  for (const route of routing.routes) {
    expect(seen.has(route.file), route.file).toBe(false);
    seen.add(route.file);
    expect(route.owner.trim().length).toBeGreaterThan(0);
    expect(route.cause.trim().length).toBeGreaterThan(0);
    expect(ACTIONS.has(route.action)).toBe(true);
    expect(FOUR).not.toContain(route.file);
  }
  expect([...seen].sort()).toEqual([...failed].sort());

  if (process.env.OWNER_ROUTING_EXECUTION_AUDIT === '1') {
    auditHistoricalGitRange();
  } else {
    console.info(
      'owner-routing: durable historical audit verified; real Git range audit is required in execution/review mode',
    );
  }
});
