/**
 * APX-004 — edge-config preflight integration lane.
 *
 * Drives the real `scripts/docs-deploy/preflight-edge.ts` against the real
 * wrangler.jsonc, a real built dist, owned os.tmpdir() mutation copies, and
 * real HTTPS/DNS for the www gate. No mocks, no fixture servers.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const REPO_ROOT = process.cwd();
const SCRIPT = join(REPO_ROOT, 'scripts', 'docs-deploy', 'preflight-edge.ts');
const REAL_CONFIG = join(REPO_ROOT, 'apps', 'docs', 'wrangler.jsonc');
const REAL_DIST = join(REPO_ROOT, 'apps', 'docs', 'dist');
const OK_LINE =
  '[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present';

interface RunResult {
  exit: number;
  stdout: string;
  stderr: string;
  combined: string;
}

function runPreflight(args: string[]): RunResult {
  const result = spawnSync('pnpm', ['exec', 'tsx', SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
  });
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  return { exit: result.status ?? -1, stdout, stderr, combined: `${stdout}\n${stderr}` };
}

function ownedTemp(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function stripTrailingComma(jsonLike: string): string {
  return jsonLike.replace(/,\s*([}\]])/g, '$1');
}

function parseJsoncObject(raw: string): Record<string, unknown> {
  const noBlock = raw.replace(/\/\*[\s\S]*?\*\//g, '');
  const noLine = noBlock.replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(stripTrailingComma(noLine)) as Record<string, unknown>;
}

function writeMutatedConfig(dir: string, mutate: (cfg: Record<string, unknown>) => void): string {
  const cfg = parseJsoncObject(readFileSync(REAL_CONFIG, 'utf8'));
  mutate(cfg);
  const path = join(dir, 'wrangler.jsonc');
  writeFileSync(path, `${JSON.stringify(cfg, null, 2)}\n`);
  return path;
}

function copyDist(dir: string): string {
  const dest = join(dir, 'dist');
  cpSync(REAL_DIST, dest, { recursive: true });
  return dest;
}

function expectFailNaming(result: RunResult, token: string): void {
  expect(result.exit, result.combined).toBe(1);
  expect(result.combined).toContain(token);
}

function assertRealArtifactsPresent(): void {
  expect(existsSync(REAL_CONFIG), 'apps/docs/wrangler.jsonc must exist').toBe(true);
  expect(
    existsSync(join(REAL_DIST, '404.html')),
    'apps/docs/dist/404.html must exist — run docs build first',
  ).toBe(true);
}

function assertRealConfigPasses(): void {
  const result = runPreflight(['--dist', REAL_DIST, '--config', REAL_CONFIG]);
  expect(result.exit, `exit=${result.exit}\n${result.combined}`).toBe(0);
  const lines = result.stdout
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  expect(lines).toContain(OK_LINE);
}

function assertRefusesBindings(): void {
  const kvDir = ownedTemp('apx-004-kv-');
  const mainDir = ownedTemp('apx-004-main-');
  try {
    const kvConfig = writeMutatedConfig(kvDir, (cfg) => {
      cfg.kv_namespaces = [{ binding: 'K', id: 'x' }];
    });
    const mainConfig = writeMutatedConfig(mainDir, (cfg) => {
      cfg.main = 'src/worker.ts';
    });
    expectFailNaming(runPreflight(['--dist', REAL_DIST, '--config', kvConfig]), 'kv_namespaces');
    expectFailNaming(runPreflight(['--dist', REAL_DIST, '--config', mainConfig]), 'main');
  } finally {
    rmSync(kvDir, { recursive: true, force: true });
    rmSync(mainDir, { recursive: true, force: true });
  }
}

function assertRefusesMissing404(): void {
  const missingDir = ownedTemp('apx-004-404-missing-');
  const emptyDir = ownedTemp('apx-004-404-empty-');
  try {
    const missingDist = copyDist(missingDir);
    rmSync(join(missingDist, '404.html'), { force: true });
    expectFailNaming(runPreflight(['--dist', missingDist, '--config', REAL_CONFIG]), '404.html');

    const emptyDist = copyDist(emptyDir);
    writeFileSync(join(emptyDist, '404.html'), '');
    expectFailNaming(runPreflight(['--dist', emptyDist, '--config', REAL_CONFIG]), '404.html');
  } finally {
    rmSync(missingDir, { recursive: true, force: true });
    rmSync(emptyDir, { recursive: true, force: true });
  }
}

function wwwBaseArgs(): string[] {
  return ['--dist', REAL_DIST, '--config', REAL_CONFIG, '--require-www-redirect'];
}

function assertWwwGate(): void {
  const base = wwwBaseArgs();
  expectFailNaming(
    runPreflight([...base, '--www-host', 'rnraielements.com', '--apex-host', 'rnraielements.com']),
    'served-directly',
  );
  expectFailNaming(
    runPreflight([
      ...base,
      '--www-host',
      'no-such-host-apx004.rnraielements.com',
      '--apex-host',
      'rnraielements.com',
    ]),
    'unresolved',
  );

  const redirectOk = runPreflight([
    ...base,
    '--www-host',
    'www.github.com',
    '--apex-host',
    'github.com',
  ]);
  expect(redirectOk.exit, redirectOk.combined).toBe(0);
  expect(redirectOk.combined).toContain('redirect-ok');
  expect(redirectOk.stdout).toContain(`${OK_LINE}; www redirect-ok`);

  expectFailNaming(
    runPreflight([...base, '--www-host', 'www.github.com', '--apex-host', 'rnraielements.com']),
    'wrong-target',
  );
}

test.describe('APX-004 preflight-edge', () => {
  test.beforeAll(assertRealArtifactsPresent);
  test('APX-004-real-config-passes', assertRealConfigPasses);
  test('APX-004-refuses-bindings', assertRefusesBindings);
  test('APX-004-refuses-missing-404', assertRefusesMissing404);
  test('APX-004-www-gate', assertWwwGate);
});
