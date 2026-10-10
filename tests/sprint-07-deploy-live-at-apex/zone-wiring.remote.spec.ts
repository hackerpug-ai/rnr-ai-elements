/**
 * APX-002 — zone-wiring integration lane.
 *
 * Drives the real `scripts/docs-deploy/zone-wiring.ts` against the real
 * Cloudflare API (invalid token only) and real HTTPS/DNS hosts. Never mutates
 * the live zone: --apply is exercised only with an unauthorized token.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const REPO_ROOT = process.cwd();
const SCRIPT = join(REPO_ROOT, 'scripts', 'docs-deploy', 'zone-wiring.ts');
const RUNBOOK = join(REPO_ROOT, 'scripts', 'docs-deploy', 'EDGE-RUNBOOK.md');
const INVALID_TOKEN = 'invalid-token-apx002';
const PERM_DNS = 'Zone > DNS > Edit';
const PERM_REDIRECT = 'Zone > Single Redirect > Edit';

interface RunResult {
  exit: number;
  stdout: string;
  stderr: string;
  combined: string;
}

function runWiring(args: string[], envExtra: Record<string, string> = {}): RunResult {
  const result = spawnSync('pnpm', ['exec', 'tsx', SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...envExtra },
  });
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  return { exit: result.status ?? -1, stdout, stderr, combined: `${stdout}\n${stderr}` };
}

function classificationToken(output: string): string {
  const match = output.match(/\b(redirect-ok|served-directly|wrong-target|unresolved)\b/);
  if (!match?.[1]) {
    throw new Error(`no classification token in output:\n${output}`);
  }
  return match[1];
}

function assertAuthFailure(result: RunResult, mode: string): void {
  expect(result.exit, `${mode} exit\n${result.combined}`).toBe(3);
  expect(result.combined, `${mode} names DNS permission`).toContain(PERM_DNS);
  expect(result.combined, `${mode} names Single Redirect permission`).toContain(PERM_REDIRECT);
  expect(result.combined, `${mode} must not echo token`).not.toContain(INVALID_TOKEN);
}

test.describe('APX-002 zone-wiring', () => {
  test('APX-002-loud-failure', () => {
    test.setTimeout(120_000);
    expect(existsSync(SCRIPT), 'zone-wiring.ts must exist').toBe(true);

    const before = runWiring(['--probe-www']);
    const beforeClass = classificationToken(before.combined);

    const check = runWiring(['--check'], { CLOUDFLARE_API_TOKEN: INVALID_TOKEN });
    assertAuthFailure(check, '--check');

    const apply = runWiring(['--apply'], { CLOUDFLARE_API_TOKEN: INVALID_TOKEN });
    assertAuthFailure(apply, '--apply');

    const after = runWiring(['--probe-www']);
    const afterClass = classificationToken(after.combined);
    expect(afterClass, 'probe classification must be unchanged by failed --apply').toBe(
      beforeClass,
    );
  });

  test('APX-002-probe-classifies', () => {
    test.setTimeout(120_000);
    expect(existsSync(SCRIPT), 'zone-wiring.ts must exist').toBe(true);

    const direct = runWiring(['--probe-www', '--host', 'rnraielements.com']);
    expect(direct.combined, 'apex host classification').toContain('served-directly');
    expect(direct.exit, `apex exit\n${direct.combined}`).toBe(4);
    expect(direct.combined).not.toContain('redirect-ok');

    const missing = runWiring(['--probe-www', '--host', 'no-such-host-apx002.rnraielements.com']);
    expect(missing.combined, 'missing host classification').toContain('unresolved');
    expect(missing.exit, `missing exit\n${missing.combined}`).toBe(4);
    expect(missing.combined).not.toContain('redirect-ok');
  });

  test('APX-002-runbook-matches-script', () => {
    test.setTimeout(60_000);
    expect(existsSync(SCRIPT), 'zone-wiring.ts must exist').toBe(true);
    expect(existsSync(RUNBOOK), 'EDGE-RUNBOOK.md must exist').toBe(true);

    const runbook = readFileSync(RUNBOOK, 'utf8');
    const fenceBlocks = [...runbook.matchAll(/```(?:bash|sh|shell)?\n([\s\S]*?)```/g)].map(
      (m) => m[1] ?? '',
    );
    const flags = new Set<string>();
    for (const block of fenceBlocks) {
      if (!block.includes('zone-wiring.ts')) continue;
      for (const match of block.matchAll(/--[a-z0-9-]+/g)) {
        flags.add(match[0] ?? '');
      }
    }
    expect(
      [...flags].length,
      'runbook must document at least one zone-wiring flag',
    ).toBeGreaterThan(0);

    const help = runWiring(['--help']);
    expect(help.exit, `help exit\n${help.combined}`).toBe(0);
    for (const flag of flags) {
      expect(help.combined, `help must document ${flag}`).toContain(flag);
    }
    for (const required of ['--check', '--apply', '--probe-www'] as const) {
      expect(runbook, `runbook must mention ${required}`).toContain(required);
      expect(help.combined, `help must mention ${required}`).toContain(required);
    }
    expect(runbook).toContain(PERM_DNS);
    expect(runbook).toContain(PERM_REDIRECT);
    expect(runbook).toMatch(/HSTS[\s\S]*redirect-ok|redirect-ok[\s\S]*HSTS/i);
  });
});
