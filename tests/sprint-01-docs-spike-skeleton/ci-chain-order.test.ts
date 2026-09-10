import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, statSync } from 'node:fs';
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

function runE2eDocs(extraArgs: string[] = []): {
  status: number | null;
  stdout: string;
  stderr: string;
} {
  acquireBuildLock();
  try {
    const result = spawnSync('pnpm', ['e2e:docs', ...extraArgs], {
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

describe('FLOW-DELIV-01', () => {
  // Two full runner invocations (unfiltered + grep) — each rebuilds the fixture and
  // drives Chromium, so this test needs a generous timeout.
  it('FLOW-DELIV-01-ci-chain-order', { timeout: 900_000 }, () => {
    // CASE 1: one command, ordered chain, real preview over built dist, green canary.
    const full = runE2eDocs();
    const log = full.stdout + full.stderr;
    const evidence = `--- stdout ---\n${full.stdout}\n--- stderr ---\n${full.stderr}`;

    expect(full.status, `pnpm e2e:docs exited ${full.status}\n${evidence}`).toBe(0);
    expect(log, 'astro dev must never run — the product surface is built dist').not.toContain(
      'astro dev',
    );

    // Step-completion markers emitted by the real scripts. Deliberately distinct from
    // pnpm's echoed script header, which prints all step names on one line before any
    // of them has run.
    const registryDone = log.indexOf('registry built');
    const galleryDone = log.indexOf('gallery manifest');
    const astroDone = log.indexOf('Complete!');
    const playwrightDone = log.indexOf('FUSE-10-runner-turnkey');
    expect(
      registryDone,
      `registry:build produced no completion output\n${evidence}`,
    ).toBeGreaterThan(-1);
    expect(
      galleryDone,
      `gallery:manifest produced no completion output\n${evidence}`,
    ).toBeGreaterThan(-1);
    expect(astroDone, `astro build produced no completion output\n${evidence}`).toBeGreaterThan(-1);
    expect(
      playwrightDone,
      `Playwright never reported the canary test name\n${evidence}`,
    ).toBeGreaterThan(-1);
    expect(registryDone, 'registry:build must complete before gallery:manifest').toBeLessThan(
      galleryDone,
    );
    expect(galleryDone, 'gallery:manifest must complete before the astro build step').toBeLessThan(
      astroDone,
    );
    expect(astroDone, 'the docs build must complete before Playwright').toBeLessThan(
      playwrightDone,
    );

    // Green canary, zero failures, zero retries (flake policy).
    const passed = log.match(/(\d+) passed/);
    expect(passed, `no Playwright pass summary in the log\n${evidence}`).not.toBeNull();
    expect(
      Number(passed?.[1]),
      'the canary must pass in all three projects',
    ).toBeGreaterThanOrEqual(3);
    expect(log, 'a Playwright test failed').not.toMatch(/\b\d+ failed\b/);
    expect(log, 'the flake policy forbids retries').not.toMatch(/\bretried\b/);

    // dist/ must be a real built surface, not an empty folder.
    const distIndex = statSync(join(repoRoot, 'apps/docs/dist/index.html'));
    expect(distIndex.isFile(), 'apps/docs/dist/index.html is not a real file').toBe(true);
    expect(distIndex.size, 'apps/docs/dist/index.html is empty').toBeGreaterThan(0);

    // CASE 2: pnpm forwards --grep to Playwright end to end.
    const matched = runE2eDocs(['--grep', 'FUSE-10-runner-turnkey']);
    const matchedLog = matched.stdout + matched.stderr;
    const matchedEvidence = `--- stdout ---\n${matched.stdout}\n--- stderr ---\n${matched.stderr}`;

    expect(matched.status, `grep run exited ${matched.status}\n${matchedEvidence}`).toBe(0);
    expect(matchedLog).toContain('FUSE-10-runner-turnkey');
    const matchedPassed = matchedLog.match(/(\d+) passed/);
    expect(
      matchedPassed,
      `no Playwright pass summary in the grep run\n${matchedEvidence}`,
    ).not.toBeNull();
    // Exactly one test definition matched the token, run across the three projects.
    expect(Number(matchedPassed?.[1]), 'the grep must match only the turnkey test').toBe(3);
    expect(matchedLog, 'the grep run must not execute the rest of the lane').not.toContain(
      'FLOW-DELIV-03-112-file-completeness',
    );
  });
});
