/**
 * APX-031 — dist-side deploy preflight integration lane.
 *
 * Drives the real `scripts/docs-deploy/preflight-dist.ts` against the real
 * built apps/docs/dist, root public/r at HEAD, and GIT_INDEX_FILE temp
 * indexes. Mutations happen only in os.tmpdir() copies; apps/docs/dist and
 * the repository's real git index are never written.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { expect, test } from '@playwright/test';

const REPO_ROOT = process.cwd();
const SCRIPT = join(REPO_ROOT, 'scripts', 'docs-deploy', 'preflight-dist.ts');
const REAL_DIST = join(REPO_ROOT, 'apps', 'docs', 'dist');
const OK_LINE =
  '[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)';

interface RunResult {
  exit: number;
  stdout: string;
  stderr: string;
  combined: string;
}

function runPreflight(args: string[] = [], env: NodeJS.ProcessEnv = process.env): RunResult {
  const result = spawnSync('pnpm', ['exec', 'tsx', SCRIPT, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env,
  });
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  return { exit: result.status ?? -1, stdout, stderr, combined: `${stdout}\n${stderr}` };
}

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(relative(dir, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** Hash every file under dist/r plus dist/_headers (the 115-file contract set). */
function hashContractFiles(dist: string): Record<string, string> {
  const hashes: Record<string, string> = {};
  const rDir = join(dist, 'r');
  if (existsSync(rDir)) {
    for (const rel of walkFiles(rDir)) {
      hashes[`r/${rel}`] = sha256File(join(rDir, rel));
    }
  }
  const headers = join(dist, '_headers');
  if (existsSync(headers)) {
    hashes._headers = sha256File(headers);
  }
  return hashes;
}

function ownedTemp(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

function copyDist(): { dir: string; dist: string } {
  const dir = ownedTemp('apx-031-');
  const dist = join(dir, 'dist');
  cpSync(REAL_DIST, dist, { recursive: true });
  return { dir, dist };
}

function assertRealDistPresent(): void {
  expect(
    existsSync(join(REAL_DIST, '_headers')),
    'apps/docs/dist/_headers must exist — run docs build first',
  ).toBe(true);
  expect(
    existsSync(join(REAL_DIST, 'r', 'nativewind', 'conversation.json')),
    'apps/docs/dist/r must hold registry items — run docs build first',
  ).toBe(true);
}

test('APX-031-AC1: real dist passes with the literal ok line', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();

  const before = hashContractFiles(REAL_DIST);
  expect(Object.keys(before).length, 'contract set is 114 r files + _headers').toBe(115);

  const result = runPreflight();
  expect(result.exit, `exit=${result.exit}\n${result.combined}`).toBe(0);
  expect(result.stdout).toContain(OK_LINE);
  expect(result.combined).not.toContain('preflight FAILED');
  expect(result.combined).not.toContain('0/56 items');

  const after = hashContractFiles(REAL_DIST);
  expect(Object.keys(after).length).toBe(115);
  for (const [rel, hash] of Object.entries(before)) {
    expect(after[rel], `${rel} must be unchanged`).toBe(hash);
  }
});

test('APX-031-AC2: missing registry item is refused by name', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();

  const { dir, dist } = copyDist();
  try {
    rmSync(join(dist, 'r', 'uniwind', 'tool.json'), { force: true });
    const result = runPreflight(['--dist', dist]);
    expect(result.exit, result.combined).toBe(1);
    expect(result.stdout).toContain('uniwind 55/56 items');
    expect(result.stdout).toContain('nativewind 56/56 items');
    expect(result.stdout).toContain('missing r/uniwind/tool.json');
    expect(result.combined).not.toContain('preflight ok');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('APX-031-AC3: fabricated extra file is refused', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();

  const { dir, dist } = copyDist();
  try {
    writeFileSync(
      join(dist, 'r', 'nativewind', 'not-an-item.json'),
      `${JSON.stringify({ name: 'not-an-item' })}\n`,
    );
    const result = runPreflight(['--dist', dist]);
    expect(result.exit, result.combined).toBe(1);
    expect(result.stdout).toContain('extra r/nativewind/not-an-item.json');
    expect(result.stdout).toContain('nativewind 56/56 items');
    expect(result.combined).not.toContain('preflight ok');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('APX-031-AC4: byte drift or missing registry index is refused', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();

  const drift = copyDist();
  const missing = copyDist();
  try {
    appendFileSync(join(drift.dist, 'r', 'nativewind', 'conversation.json'), '\n');
    const driftResult = runPreflight(['--dist', drift.dist]);
    expect(driftResult.exit, driftResult.combined).toBe(1);
    expect(driftResult.stdout).toContain('differs r/nativewind/conversation.json');
    expect(driftResult.combined).not.toContain('preflight ok');

    rmSync(join(missing.dist, 'r', 'uniwind', 'registry.json'), { force: true });
    const missingResult = runPreflight(['--dist', missing.dist]);
    expect(missingResult.exit, missingResult.combined).toBe(1);
    expect(missingResult.stdout).toContain('missing r/uniwind/registry.json');
    expect(missingResult.combined).not.toContain('preflight ok');
  } finally {
    rmSync(drift.dir, { recursive: true, force: true });
    rmSync(missing.dir, { recursive: true, force: true });
  }
});

test('APX-031-AC5: missing or drifted _headers is refused', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();

  const missing = copyDist();
  const drift = copyDist();
  try {
    rmSync(join(missing.dist, '_headers'), { force: true });
    const missingResult = runPreflight(['--dist', missing.dist]);
    expect(missingResult.exit, missingResult.combined).toBe(1);
    expect(missingResult.stdout).toContain('missing _headers');
    expect(missingResult.combined).not.toContain('preflight ok');

    appendFileSync(join(drift.dist, '_headers'), '  X-Drift: 1\n');
    const driftResult = runPreflight(['--dist', drift.dist]);
    expect(driftResult.exit, driftResult.combined).toBe(1);
    expect(driftResult.stdout).toContain('differs _headers');
    expect(driftResult.combined).not.toContain('preflight ok');
  } finally {
    rmSync(missing.dir, { recursive: true, force: true });
    rmSync(drift.dir, { recursive: true, force: true });
  }
});

function seedTempIndex(dir: string): string {
  const indexPath = join(dir, 'index');
  const read = spawnSync('git', ['read-tree', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, GIT_INDEX_FILE: indexPath },
  });
  expect(read.status, `git read-tree failed\n${read.stderr}`).toBe(0);
  return indexPath;
}

function gitWithIndex(indexPath: string, args: string[]) {
  return spawnSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, GIT_INDEX_FILE: indexPath },
  });
}

function assertAc6UntrackedHeaders(): void {
  const dir = ownedTemp('apx-031-idx-untracked-');
  try {
    const indexPath = seedTempIndex(dir);
    const rmCached = gitWithIndex(indexPath, [
      'rm',
      '--cached',
      '--quiet',
      'apps/docs/public/_headers',
    ]);
    expect(rmCached.status, `git rm --cached failed\n${rmCached.stderr}`).toBe(0);
    const result = runPreflight([], { ...process.env, GIT_INDEX_FILE: indexPath });
    expect(result.exit, result.combined).toBe(1);
    expect(result.stdout).toContain('untracked apps/docs/public/_headers');
    expect(result.combined).not.toContain('preflight ok');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function assertAc6DirtyPublicR(): void {
  const dir = ownedTemp('apx-031-idx-dirty-');
  try {
    const indexPath = seedTempIndex(dir);
    const blob = gitWithIndex(indexPath, ['rev-parse', ':public/r/uniwind/conversation.json']);
    expect(blob.status, `rev-parse blob failed\n${blob.stderr}`).toBe(0);
    const uniwindBlob = blob.stdout.trim();
    expect(uniwindBlob).toMatch(/^[0-9a-f]{40}$/);
    const update = gitWithIndex(indexPath, [
      'update-index',
      '--cacheinfo',
      `100644,${uniwindBlob},public/r/nativewind/conversation.json`,
    ]);
    expect(update.status, `update-index failed\n${update.stderr}`).toBe(0);
    const result = runPreflight([], { ...process.env, GIT_INDEX_FILE: indexPath });
    expect(result.exit, result.combined).toBe(1);
    expect(result.stdout).toContain('public/r differs from HEAD');
    expect(result.combined).not.toContain('preflight ok');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('APX-031-AC6: untracked source or dirty public/r is refused', () => {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem lane check runs once, on chromium-desktop',
  );
  assertRealDistPresent();
  assertAc6UntrackedHeaders();
  assertAc6DirtyPublicR();
});
