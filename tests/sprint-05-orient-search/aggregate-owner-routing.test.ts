import { execFileSync } from 'node:child_process';
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

it('FIX-ORI-SUITE-2-1-owner-routing: every aggregate failure has an owner and the residual is not widened', () => {
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

  for (const path of [
    ...FOUR,
    '.spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md',
  ]) {
    execFileSync(
      'git',
      [
        'diff',
        '--exit-code',
        '8ee4282f24474eb8824e5a92685063f1070a12d6',
        'f9d30b09eadf06350a691cc9bd39a667ee2a8e52',
        '--',
        path,
      ],
      {
        cwd: ROOT,
        stdio: 'pipe',
      },
    );
  }
});
