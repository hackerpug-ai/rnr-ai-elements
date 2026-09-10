import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

// The integration files in this lane each execute the full docs build chain. Vitest may
// run them in parallel workers, and two concurrent chains would race on dist/ —
// serialize them with a filesystem lock under node_modules (never committed).
const lockDir = join(repoRoot, 'node_modules/.cache/FUSE-01-docs-build.lock');
const LOCK_TIMEOUT_MS = 15 * 60_000;

function acquireBuildLock(): void {
  mkdirSync(join(repoRoot, 'node_modules/.cache'), { recursive: true });
  const startedAt = Date.now();
  for (;;) {
    try {
      mkdirSync(lockDir);
      return;
    } catch {
      if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
        throw new Error(`timed out waiting for docs build lock at ${lockDir}`);
      }
      try {
        // Steal a lock abandoned by a crashed run.
        if (Date.now() - statSync(lockDir).mtimeMs > LOCK_TIMEOUT_MS) {
          rmSync(lockDir, { recursive: true, force: true });
        }
      } catch {
        // Lock vanished between mkdir and stat — retry the acquire.
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

function runDocsBuild(): { status: number | null; stdout: string; stderr: string } {
  acquireBuildLock();
  try {
    const result = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

function countHtmlFiles(dir: string): number {
  let count = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.html')) count += 1;
    }
  }
  return count;
}

describe('FLOW-DELIV-01', () => {
  it('FLOW-DELIV-01-ci-chain-order', { timeout: 300_000 }, () => {
    const build = runDocsBuild();
    const evidence = `--- stdout ---\n${build.stdout}\n--- stderr ---\n${build.stderr}`;

    expect(build.status, `docs build exited ${build.status}\n${evidence}`).toBe(0);
    expect(
      build.stdout + build.stderr,
      'the product surface is built dist — astro dev must never run',
    ).not.toContain('astro dev');

    // Step-completion markers emitted by the real scripts. Deliberately distinct from
    // pnpm's echoed script header, which prints all three step names on one line
    // before any of them has run.
    const registryDone = build.stdout.indexOf('registry built');
    const galleryDone = build.stdout.indexOf('gallery manifest');
    const astroDone = build.stdout.indexOf('Complete!');
    expect(
      registryDone,
      'registry:build produced no completion output\n' + evidence,
    ).toBeGreaterThan(-1);
    expect(
      galleryDone,
      'gallery:manifest produced no completion output\n' + evidence,
    ).toBeGreaterThan(-1);
    expect(astroDone, 'astro build produced no completion output\n' + evidence).toBeGreaterThan(-1);
    expect(registryDone, 'registry:build must complete before gallery:manifest').toBeLessThan(
      galleryDone,
    );
    expect(galleryDone, 'gallery:manifest must complete before the astro build step').toBeLessThan(
      astroDone,
    );

    const distIndex = join(repoRoot, 'apps/docs/dist/index.html');
    const indexStat = statSync(distIndex);
    expect(indexStat.isFile(), `${distIndex} is not a real file`).toBe(true);
    expect(indexStat.size, 'apps/docs/dist/index.html is empty').toBeGreaterThan(0);
    expect(
      countHtmlFiles(join(repoRoot, 'apps/docs/dist')),
      'no HTML files under apps/docs/dist',
    ).toBeGreaterThan(0);
  });
});
