import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// The locked YAML parser (transitive via tsx/vite; root package.json is frozen, so the
// deep store path is the only way to import it). A store-layout change fails loudly here
// instead of silently weakening the parse proof.
import { parse } from '../../node_modules/.pnpm/yaml@2.9.0/node_modules/yaml/dist/index.js';

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

// -----------------------------------------------------------------------------
// FUSE-12 lane: the CI docs job invokes the docs package's public build verbatim,
// so the proof has two halves — the ordered build chain really runs green against
// the real repo (AC-1), and the workflow/script wiring is parse-provable from
// disk (AC-2). This lane stops after the astro build: Playwright coverage is
// FUSE-10's test above, so this lane never depends on FUSE-11 spec files.
// ORI-CI-003 superseded the docs-e2e CI job with the credential-free docs-build
// job (test/docs-e2e acceptance moved to ORI-CI-004's protected workflow).
// -----------------------------------------------------------------------------

interface StepResult {
  status: number;
  stdout: string;
  stderr: string;
}

/** Real child process; asserts exit 0 immediately so the chain fail-stops like `&&`. */
function runStep(command: string, args: string[], label: string): StepResult {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const evidence = `--- ${label}: stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}`;
  expect(result.error, `${label} failed to spawn: ${result.error?.message}`).toBeUndefined();
  expect(result.status, `${label} exited ${result.status}\n${evidence}`).toBe(0);
  return { status: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

/** Newest .json mtime under a directory tree; 0 when the tree is absent. */
function newestJsonMtime(dir: string): number {
  try {
    let newest = 0;
    for (const entry of readdirSync(dir, { recursive: true })) {
      const name = String(entry);
      if (name.endsWith('.json')) {
        newest = Math.max(newest, statSync(join(dir, name)).mtimeMs);
      }
    }
    return newest;
  } catch {
    return 0;
  }
}

describe('FLOW-DELIV-01 FUSE-12 lane', () => {
  it('FLOW-DELIV-01-ci-chain-order AC-1 ordered chain runs green and ships 112 dist JSONs', {
    timeout: 900_000,
  }, () => {
    acquireBuildLock();
    try {
      const engines = ['nativewind', 'uniwind'];
      const before = Object.fromEntries(
        engines.map((engine) => [engine, newestJsonMtime(join(repoRoot, 'public/r', engine))]),
      );
      const manifestPath = join(repoRoot, 'apps/docs/src/data/gallery-manifest.json');
      const manifestBefore = statSync(manifestPath, { throwIfNoEntry: false })?.mtimeMs ?? 0;

      // && semantics, stage by stage: each stage is asserted before the next spawn,
      // so a failure aborts the chain exactly like the root script's shell `&&` —
      // docs never get built over stale registry JSON.
      runStep('pnpm', ['registry:build'], 'registry:build');
      for (const engine of engines) {
        const dir = join(repoRoot, 'public/r', engine);
        const jsons = readdirSync(dir).filter((file) => file.endsWith('.json'));
        expect(jsons.length, `public/r/${engine} shipped no registry JSON`).toBeGreaterThan(0);
        expect(
          newestJsonMtime(dir),
          `public/r/${engine} was not regenerated by registry:build`,
        ).toBeGreaterThan(before[engine]);
      }

      runStep('pnpm', ['gallery:manifest'], 'gallery:manifest');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as unknown[];
      expect(Array.isArray(manifest), 'gallery manifest is not an array').toBe(true);
      expect(manifest, 'gallery manifest must carry the full 56-item registry').toHaveLength(56);
      expect(
        statSync(manifestPath).mtimeMs,
        'gallery manifest was not rewritten by gallery:manifest',
      ).toBeGreaterThan(manifestBefore);

      const docs = runStep('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], 'docs build');
      const docsLog = docs.stdout + docs.stderr;
      expect(docsLog, 'the docs prebuild did not report the 56-item dataset').toContain('56 items');
      expect(docsLog, "the docs prebuild did not resolve every component item's props").toContain(
        'props resolved for 39/39 component items',
      );

      expect(
        () => statSync(join(repoRoot, 'apps/docs/dist/r')),
        'apps/docs/dist/r is missing — the docs build produced no registry output',
      ).not.toThrow();

      // The gate's own observable, verbatim: find piped into wc. Reality: 57 files per
      // engine — the 56 items PLUS the names-only `registry.json` index the RNR CLI
      // resolves against — so the literal count is 114. The FUSE-12 contract's "112"
      // counts items only (56 x 2 engines); the same 57-per-engine shape is pinned by
      // the landed deliv-03 spec, so the index files are expected, not noise.
      const counted = runStep(
        'sh',
        ['-c', "find apps/docs/dist/r -name '*.json' | wc -l"],
        'dist JSON count',
      );
      expect(
        counted.stdout.trim(),
        'apps/docs/dist/r must ship 56 items + 1 registry index per engine (114)',
      ).toBe('114');
      for (const engine of engines) {
        const perEngine = readdirSync(join(repoRoot, 'apps/docs/dist/r', engine), {
          recursive: true,
        })
          .map(String)
          .filter((entry) => entry.endsWith('.json'));
        expect(perEngine, `apps/docs/dist/r/${engine} must ship 57 JSONs`).toHaveLength(57);
        expect(
          perEngine.filter((entry) => entry !== 'registry.json'),
          `apps/docs/dist/r/${engine} must ship exactly 56 item JSONs`,
        ).toHaveLength(56);
        expect(
          perEngine,
          `apps/docs/dist/r/${engine} is missing the registry.json index`,
        ).toContain('registry.json');
      }
    } finally {
      rmSync(lockDir, { recursive: true, force: true });
    }
  });

  it('FLOW-DELIV-01-ci-chain-order AC-2 ci.yml docs-build wiring and root chain order are parse-provable', () => {
    const workflow = parse(readFileSync(join(repoRoot, '.github/workflows/ci.yml'), 'utf8')) as {
      on: Record<string, unknown>;
      jobs: Record<string, { needs?: string[]; steps: Array<Record<string, unknown>> } | undefined>;
    };

    // ORI-CI-003 re-scoped this workflow to the four credential-free candidate
    // jobs (typecheck, lint, registry, docs-build). The complete test and
    // docs-e2e acceptance jobs live in ORI-CI-004's protected workflow, so
    // their names must NOT appear here.
    expect(Object.keys(workflow.jobs).sort()).toEqual([
      'docs-build',
      'lint',
      'registry',
      'typecheck',
    ]);

    const job = workflow.jobs['docs-build'];
    expect(job, 'ci.yml declares no docs-build job').toBeDefined();
    expect(job?.needs, 'docs-build must be ordered after all three prerequisites').toEqual([
      'typecheck',
      'lint',
      'registry',
    ]);

    const runs = job?.steps.filter((step) => typeof step.run === 'string') as Array<{
      run: string;
    }>;
    expect(
      runs.some((step) => step.run.includes('pnpm --filter @rnr-ai-elements/docs build')),
      'docs-build must invoke the public build verbatim, never a re-implemented chain',
    ).toBe(true);
    expect(
      runs.filter((step) => /gallery:manifest|playwright test|e2e:docs/.test(step.run)),
      'the chain must live only in the docs package build — no duplicated chain steps in ci.yml',
    ).toEqual([]);

    const uploads = job?.steps.filter(
      (step) =>
        typeof step.uses === 'string' && String(step.uses).startsWith('actions/upload-artifact@'),
    );
    expect(
      uploads?.some((step) =>
        String((step.with as { path?: string } | undefined)?.path).includes('docs-build.log'),
      ),
      'docs-build must upload its build log for evidence retention',
    ).toBe(true);

    // Root script: every stage joined by &&, in order, ahead of the Playwright
    // steps. ORI-CI-002 moved registry:build and gallery:manifest INTO the
    // docs package's public build (the ordered seven-stage content-gate
    // chain), so the root command is the public build plus the two Playwright
    // steps. Splitting on && and matching the exact segment list fails on
    // `;`, `||`, or any reordering in one assertion.
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as {
      scripts: Record<string, string | undefined>;
    };
    expect(pkg.scripts['e2e:docs'], 'root e2e:docs script is missing').toBeDefined();
    const segments = (pkg.scripts['e2e:docs'] ?? '').split('&&').map((segment) => segment.trim());
    expect(segments, 'the e2e:docs chain must &&-link every stage in order').toEqual([
      'pnpm --filter @rnr-ai-elements/docs build',
      'pnpm exec playwright install chromium',
      'pnpm exec playwright test',
    ]);
  });
});
