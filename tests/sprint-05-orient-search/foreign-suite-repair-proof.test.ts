/**
 * FIX-ORI-SUITE-2-2 — the foreign-suite repair proof harness.
 *
 * Fresh proof spawns the REAL preserved per-suite selectors as child processes
 * and asserts on their exit codes and exact executed-test tallies. Later
 * aggregate runs re-read the committed, embedded raw receipt bytes and verify
 * their hashes and semantics without replaying device work. The three drifted
 * vitest suites, immutable owner-routing token, and two NativeWind marathon
 * tokens each run as the exact `pnpm exec vitest run ...` command the charter
 * preserves, with per-child timeouts sized to their real envelopes.
 *
 * Modes:
 *  - FOREIGN_SUITE_REPAIR_CAPTURE=red  — pre-change capture: spawn the three
 *    drifted selectors, REQUIRE each to fail with its chartered signature, and
 *    write .tmp/FIX-ORI-SUITE-2-2/red.json bound to the candidate SHA. Refuses to
 *    run once the repairs have landed (a red authored after the fix is a lie).
 *  - default (green) — when no GREEN exists, or force is explicit, verify port 4321 is free (the
 *    docs-collection Playwright-class token must own it), spawn all six
 *    selectors requiring exit 0, verify the marathon manifests/teardowns are
 *    fresh and complete, run `pnpm typecheck` and the scoped Biome command,
 *    assert the tracked-file diff boundary, and write green.json + run.json.
 *    When committed GREEN exists, verify its embedded receipts and all current
 *    executable/input bytes without resolving historical Git objects.
 *
 * This harness NEVER spawns the aggregate `pnpm test` — a vitest child spawning
 * the vitest aggregate would re-run every drill and this harness (unbounded
 * recursion). The aggregate is a preserved command the implementer runs exactly
 * once under a stable TMPDIR and records in run.json's `aggregate` section,
 * which this harness preserves verbatim when it rewrites the file.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EVIDENCE_ROOT = join(REPO_ROOT, '.tmp', 'FIX-ORI-SUITE-2-2');
const RED_DIR = join(EVIDENCE_ROOT, 'red');
const GREEN_DIR = join(EVIDENCE_ROOT, 'green');
const MARATHON_SCRATCH = join(REPO_ROOT, '.tmp', 'ORI-RN-005');
const NATIVE_SOURCE_MANIFEST = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
);
const NATIVE_INPUTS = [
  'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
  'tests/sprint-05-orient-search/support/nativewind-live-example.ts',
  'tests/sprint-05-orient-search/support/live-backend.ts',
  'tests/sprint-05-orient-search/support/native-session.ts',
  'tests/sprint-05-orient-search/support/quickstart-consumer.ts',
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
  'packages/docs-snippets/commands/nativewind.sh',
  'pnpm-lock.yaml',
] as const;
const NATIVE_TEMPLATE_FILES = [
  'package.json',
  'app.json',
  'components.json',
  'tsconfig.json',
  'metro.config.js',
  'babel.config.js',
  'tailwind.config.js',
  'global.css',
  'nativewind-env.d.ts',
  'app/_layout.tsx',
  'lib/theme.ts',
  'lib/utils.ts',
] as const;

/** A stable TMPDIR outside the agent-session scratch, shared by every child so
 * the reaper cascade that killed the recorded aggregate's collections cannot
 * launder a kill into a suite failure here. */
const CHILD_TMPDIR = join(tmpdir(), 'fix-ori-suite-2-2');
const TASK_BASE_COMMIT = '5856cc641cac5faab0a4db8b1ba49cc3e3fc7198';

const MINUTE = 60_000;

/** The six preserved selectors and their real envelopes (the marathon pair may
 * double through runDriverWithKillRetry's one external-kill retry). */
interface SelectorSpec {
  name: string;
  args: string[];
  timeoutMs: number;
  expectedPasses: number;
  expectedSkips: number;
  /** Extra env for this child only. */
  env?: Record<string, string>;
  /** The chartered failure signature RED mode must observe (drifted trio only). */
  redSignature?: { failedAtLeast: number; outputContains: string[] };
}

const DRIFTED_SELECTORS: SelectorSpec[] = [
  {
    name: 'docs-collection',
    args: ['exec', 'vitest', 'run', 'tests/sprint-05-orient-search/docs-collection.test.ts'],
    timeoutMs: 45 * MINUTE,
    expectedPasses: 4,
    expectedSkips: 0,
    env: { CI: '1' },
    redSignature: {
      failedAtLeast: 2,
      outputContains: ['valid build exits 0', 'expected 1 to be +0'],
    },
  },
  {
    name: 'docs-data-prebuild',
    args: [
      'exec',
      'vitest',
      'run',
      'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts',
    ],
    timeoutMs: 25 * MINUTE,
    expectedPasses: 4,
    expectedSkips: 0,
    redSignature: {
      failedAtLeast: 1,
      outputContains: ['copies public r generated-only and byte-identical'],
    },
  },
  {
    name: 'live-example-api-ac4',
    args: [
      'exec',
      'vitest',
      'run',
      'tests/sprint-05-orient-search/live-example-api.test.ts',
      '-t',
      'AC-4',
    ],
    timeoutMs: 10 * MINUTE,
    expectedPasses: 1,
    expectedSkips: 3,
    redSignature: {
      failedAtLeast: 1,
      outputContains: ["from 'expo/fetch'"],
    },
  },
];

const MARATHON_SELECTORS: SelectorSpec[] = [
  {
    name: 'nativewind-abort-error-retry',
    args: [
      'exec',
      'vitest',
      'run',
      'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
      '-t',
      'ORI-RN-005-abort-error-retry',
    ],
    timeoutMs: 165 * MINUTE,
    expectedPasses: 1,
    expectedSkips: 3,
  },
  {
    name: 'nativewind-fail-closed-cleanup',
    args: [
      'exec',
      'vitest',
      'run',
      'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
      '-t',
      'ORI-RN-005-fail-closed-cleanup',
    ],
    timeoutMs: 165 * MINUTE,
    expectedPasses: 1,
    expectedSkips: 3,
  },
];

const ROUTING_SELECTOR: SelectorSpec = {
  name: 'immutable-owner-routing',
  args: ['exec', 'vitest', 'run', 'tests/sprint-05-orient-search/aggregate-owner-routing.test.ts'],
  timeoutMs: 5 * MINUTE,
  expectedPasses: 1,
  expectedSkips: 0,
  env: { OWNER_ROUTING_EXECUTION_AUDIT: '1' },
};

const ALL_SELECTORS = [...DRIFTED_SELECTORS, ROUTING_SELECTOR, ...MARATHON_SELECTORS];

const SCOPED_BIOME_TARGETS = [
  'tests/sprint-05-orient-search/docs-collection.test.ts',
  'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts',
  'tests/sprint-05-orient-search/live-example-api.test.ts',
  'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
  'tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts',
  'tests/sprint-05-orient-search/aggregate-owner-routing.test.ts',
];

const SUITE_FILES = [
  'tests/sprint-05-orient-search/docs-collection.test.ts',
  'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts',
  'tests/sprint-05-orient-search/live-example-api.test.ts',
  'tests/sprint-05-orient-search/nativewind-live-example.test.ts',
  'tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts',
  'tests/sprint-05-orient-search/aggregate-owner-routing.test.ts',
];

/** Files the task's write boundary allows to appear in `git status --porcelain`
 * (tracked modifications, drill-emitted evidence rewrites, and the new harness).
 * Everything else — and any path under apps/, packages/, or scripts/ — is a
 * boundary violation. */
const DIFF_ALLOWED = new Set([
  'tests/sprint-05-orient-search/docs-collection.test.ts',
  'tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts',
  'tests/sprint-05-orient-search/live-example-api.test.ts',
  'tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts',
  'tests/sprint-05-orient-search/aggregate-owner-routing.test.ts',
  'tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json',
  'tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json',
  '.tmp/FIX-ORI-SUITE-2/red.json',
  '.tmp/FIX-ORI-SUITE-2/green.json',
  '.tmp/FIX-ORI-SUITE-2/run.json',
  '.tmp/FIX-ORI-SUITE-2-2/red.json',
  '.tmp/FIX-ORI-SUITE-2-2/green.json',
  '.tmp/FIX-ORI-SUITE-2-2/run.json',
]);

type ChildResult = {
  exit: number;
  timedOut: boolean;
  output: string;
  durationMs: number;
};

function runChild(spec: SelectorSpec, logPath: string): ChildResult {
  const started = Date.now();
  const res = spawnSync('pnpm', spec.args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: spec.timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env: {
      ...process.env,
      TMPDIR: CHILD_TMPDIR,
      ...(spec.env ?? {}),
    },
  });
  const output = `${res.stdout ?? ''}${res.stderr ?? ''}`;
  const timedOut = res.status === null && (res.signal === 'SIGTERM' || res.signal === 'SIGKILL');
  const result: ChildResult = {
    exit: res.status ?? -1,
    timedOut,
    output,
    durationMs: Date.now() - started,
  };
  mkdirSync(dirname(logPath), { recursive: true });
  writeFileSync(logPath, `$ pnpm ${spec.args.join(' ')}\n\n${output}\n[exit ${result.exit}]\n`);
  return result;
}

function runPlain(
  command: string,
  args: string[],
  logPath: string,
  timeoutMs: number,
): ChildResult {
  return runChild({ name: command, args, timeoutMs, expectedPasses: 0, expectedSkips: 0 }, logPath);
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

type NativeSourceManifest = {
  consumer?: {
    hook_pins?: Record<string, string>;
    registry_items?: string[];
    root_lockfile_sha256?: string;
  };
  mappings?: { source: string }[];
};

type RegistryItem = {
  registryDependencies?: string[];
};

type NativeExecutionInputs = {
  sha256: Record<string, string>;
  registry_urls: string[];
  manifest_contract: NativeSourceManifest['consumer'] | null;
  runtime_versions: { node: string; pnpm: string };
};

function localRegistryPath(url: string): string | null {
  const match = url.match(/^https:\/\/rnraielements\.com\/r\/nativewind\/([^/]+\.json)$/);
  return match ? `public/r/nativewind/${match[1]}` : null;
}

/** Resolve the local portion of the exact registry dependency graph the public recipe
 * installs. External RNR primitive URLs have no local public/r bytes and remain bound
 * by the raw consumer receipt's resolved package versions. */
function registryClosure(startUrls: string[]): { paths: string[]; urls: string[] } {
  const pending = [...startUrls];
  const seenUrls = new Set<string>();
  const paths = new Set<string>();
  while (pending.length > 0) {
    const url = pending.shift() as string;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);
    const rel = localRegistryPath(url);
    if (rel === null) continue;
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) {
      throw new Error(`native execution input missing: ${rel}`);
    }
    paths.add(rel);
    const item = JSON.parse(readFileSync(abs, 'utf8')) as RegistryItem;
    for (const dependency of item.registryDependencies ?? []) pending.push(dependency);
  }
  return { paths: [...paths].sort(), urls: [...seenUrls].sort() };
}

function nativeInputPaths(manifest: NativeSourceManifest, registryPaths: string[]): string[] {
  const paths = new Set<string>(NATIVE_INPUTS);
  for (const mapping of manifest.mappings ?? []) paths.add(mapping.source);
  for (const rel of NATIVE_TEMPLATE_FILES) paths.add(`packages/docs-snippets/nativewind/${rel}`);
  for (const rel of registryPaths) paths.add(rel);
  return [...paths].sort();
}

function hashRepositoryInputs(paths: string[]): Record<string, string> {
  const sha256: Record<string, string> = {};
  for (const rel of paths) {
    const abs = join(REPO_ROOT, rel);
    if (!existsSync(abs)) throw new Error(`native execution input missing: ${rel}`);
    sha256[rel] = sha256File(abs);
  }
  return sha256;
}

function pnpmVersion(): string {
  const pnpm = spawnSync('pnpm', ['--version'], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (pnpm.status !== 0) throw new Error(`pnpm --version exited ${pnpm.status ?? -1}`);
  return (pnpm.stdout ?? '').trim();
}

/** Hash every repository input read by the native selector and bind the dependency
 * versions that the clean consumer resolves. This is captured from the final tree,
 * never reconstructed later from a summary receipt. */
function nativeExecutionInputs(): NativeExecutionInputs {
  const manifest = JSON.parse(readFileSync(NATIVE_SOURCE_MANIFEST, 'utf8')) as NativeSourceManifest;
  const registry = registryClosure(manifest.consumer?.registry_items ?? []);
  return {
    sha256: hashRepositoryInputs(nativeInputPaths(manifest, registry.paths)),
    registry_urls: registry.urls,
    manifest_contract: manifest.consumer ?? null,
    runtime_versions: {
      node: process.version,
      pnpm: pnpmVersion(),
    },
  };
}

function gitHead(): string {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return (res.stdout ?? '').trim();
}

function gitOutput(args: string[]): string {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} exited ${result.status ?? -1}: ${result.stderr ?? ''}`);
  }
  return (result.stdout ?? '').trim();
}

function gitFileSha256(commit: string, path: string): string {
  const result = spawnSync('git', ['show', `${commit}:${path}`], {
    cwd: REPO_ROOT,
    encoding: null,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`git show ${commit}:${path} exited ${result.status ?? -1}`);
  }
  return createHash('sha256')
    .update(result.stdout ?? Buffer.alloc(0))
    .digest('hex');
}

type CandidateScope = {
  base_commit: string;
  execution_candidate: string;
  changed_paths: string[];
  git_range_audit: {
    verified: true;
    changed_paths_sha256: string;
  };
};

function pathInventorySha256(paths: string[]): string {
  return createHash('sha256').update(paths.join('\0')).digest('hex');
}

/** Scope is immutable base -> recorded execution candidate. It never widens to a
 * later aggregate HEAD, whose unrelated reviewed commits are outside this task. */
function candidateScope(executionCandidate: string): CandidateScope {
  gitOutput(['cat-file', '-e', `${TASK_BASE_COMMIT}^{commit}`]);
  gitOutput(['cat-file', '-e', `${executionCandidate}^{commit}`]);
  const changedPaths = gitOutput([
    'diff',
    '--name-only',
    TASK_BASE_COMMIT,
    executionCandidate,
    '--',
  ])
    .split('\n')
    .filter(Boolean);
  const outside = changedPaths.filter((path) => !DIFF_ALLOWED.has(path));
  if (outside.length > 0) {
    throw new Error(
      `execution candidate ${executionCandidate} exceeds task scope from ${TASK_BASE_COMMIT}:\n` +
        outside.join('\n'),
    );
  }
  return {
    base_commit: TASK_BASE_COMMIT,
    execution_candidate: executionCandidate,
    changed_paths: changedPaths,
    git_range_audit: {
      verified: true,
      changed_paths_sha256: pathInventorySha256(changedPaths),
    },
  };
}

type TestTally = { failed: number; passed: number; skipped: number };

/** The vitest summary line: "Tests  3 failed | 1 passed (4)". */
function tallyOf(output: string): TestTally {
  // The summary's segment order varies: "3 failed | 1 passed (4)" after the
  // repairs, "1 failed | 3 skipped (4)" for a -t filtered selector, so parse
  // every "N failed/passed/skipped" segment rather than assuming one shape.
  const summary = output.match(/^\s*Tests\s+(.+)\(\d+\)\s*$/m)?.[1] ?? '';
  const counts: TestTally = { failed: 0, passed: 0, skipped: 0 };
  for (const segment of summary.split('|')) {
    const part = segment.match(/(\d+)\s+(failed|passed|skipped)/);
    if (part) counts[part[2] as keyof TestTally] = Number(part[1]);
  }
  if (
    counts.failed === 0 &&
    counts.passed === 0 &&
    counts.skipped === 0 &&
    !summary.includes('passed')
  ) {
    return { failed: -1, passed: -1, skipped: -1 };
  }
  return counts;
}

/** Verbatim failed-token names and assertion lines from real vitest output. */
function failedDetail(output: string): { names: string[]; assertions: string[] } {
  const names = [...output.matchAll(/^[ \t]*(?:×|✕|FAIL)[ \t]+(\S.*\S)[ \t]*$/gm)]
    .map((m) => m[1].replace(/\s*\d+m?s$/, '').trim())
    .filter((n) => !n.endsWith('.test.ts'));
  const assertions = output
    .split('\n')
    .filter((line) => /expected .+ to be|AssertionError|toEqual|toContain/.test(line))
    .slice(0, 20)
    .map((line) => line.trim());
  return { names, assertions };
}

/** True when a TCP listener already owns the port (the strict-preview guard's
 * probe, run harness-side so an occupied 4321 is NEVER recorded as a suite
 * failure — see the charter's port policy). */
function portOccupied(port: number): Promise<boolean> {
  return new Promise((resolvePromise) => {
    const socket = connect(port, '127.0.0.1');
    socket.once('connect', () => {
      socket.destroy();
      resolvePromise(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolvePromise(false);
    });
  });
}

function hashes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rel of SUITE_FILES) {
    const abs = join(REPO_ROOT, rel);
    out[rel] = existsSync(abs) ? sha256File(abs) : '(absent)';
  }
  return out;
}

/** The harness-observed record written into run.json, preserving any
 * implementer-recorded `aggregate` section verbatim. */
function writeRunRecord(record: Record<string, unknown>): void {
  const path = join(EVIDENCE_ROOT, 'run.json');
  let prior: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      prior = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
    } catch {
      prior = {};
    }
  }
  const merged = { ...prior, ...record };
  writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
}

/** RED capture: the three drifted selectors must fail with their chartered
 * signatures on the pre-change tree. */
async function captureRed(): Promise<void> {
  const staleLiteral = readFileSync(
    join(REPO_ROOT, 'tests/sprint-05-orient-search/live-example-api.test.ts'),
    'utf8',
  );
  if (
    !staleLiteral.includes("from 'expo/fetch'") ||
    staleLiteral.includes("await import('expo/fetch')")
  ) {
    throw new Error(
      'RED mode refused: live-example-api.test.ts no longer carries the stale static ' +
        'expo/fetch literal — the tree appears repaired, so a red capture now would be authored, ' +
        'not observed. RED must be captured on the pre-change candidate.',
    );
  }

  mkdirSync(RED_DIR, { recursive: true });
  mkdirSync(CHILD_TMPDIR, { recursive: true });
  const captured: unknown[] = [];
  for (const spec of DRIFTED_SELECTORS) {
    const result = runChild(spec, join(RED_DIR, `${spec.name}.log`));
    const tally = tallyOf(result.output);
    const detail = failedDetail(result.output);
    const signature = spec.redSignature as {
      failedAtLeast: number;
      outputContains: string[];
    };
    if (result.exit === 0) {
      throw new Error(
        `RED capture failed: ${spec.name} PASSED pre-change — the chartered drift is not ` +
          'present on this tree; refusing to record a red that was not observed.',
      );
    }
    if (result.timedOut) {
      throw new Error(
        `RED capture failed: ${spec.name} timed out instead of failing with its chartered signature.`,
      );
    }
    if (tally.failed < signature.failedAtLeast) {
      throw new Error(
        `RED capture failed: ${spec.name} failed ${tally.failed} tokens, expected at least ` +
          `${signature.failedAtLeast} (chartered signature).\n${result.output.slice(-2000)}`,
      );
    }
    for (const needle of signature.outputContains) {
      if (!result.output.includes(needle)) {
        throw new Error(
          `RED capture failed: ${spec.name} output lacks the chartered fragment "${needle}".\n` +
            result.output.slice(-2000),
        );
      }
    }
    captured.push({
      name: spec.name,
      command: `pnpm ${spec.args.join(' ')}`,
      exit: result.exit,
      failed_tokens: tally.failed,
      passed_tokens: tally.passed,
      failed_token_names: detail.names,
      failing_assertions: detail.assertions,
      duration_ms: result.durationMs,
      log: `.tmp/FIX-ORI-SUITE-2-2/red/${spec.name}.log`,
    });
  }
  writeFileSync(
    join(EVIDENCE_ROOT, 'red.json'),
    `${JSON.stringify(
      {
        task: 'FIX-ORI-SUITE-2-2',
        mode: 'red',
        captured_at: new Date().toISOString(),
        candidate_commit: gitHead(),
        selector_failures: captured.length,
        selectors: captured,
        suites_sha256: hashes(),
      },
      null,
      2,
    )}\n`,
  );
}

type MarathonName = 'nativewind-abort-error-retry' | 'nativewind-fail-closed-cleanup';

function marathonScratchDir(name: MarathonName): string {
  if (name === 'nativewind-abort-error-retry') {
    return join(MARATHON_SCRATCH, 'abort-error-retry');
  }
  return join(MARATHON_SCRATCH, 'fail-closed-cleanup');
}

function requireMarathonArtifacts(name: string, paths: string[]): void {
  for (const path of paths) {
    if (!existsSync(path)) {
      throw new Error(`marathon evidence missing for ${name}: ${path} absent`);
    }
  }
}

function timestampInsideChild(
  timestamp: string | undefined,
  childStartedAt: number,
  childFinishedAt: number,
): boolean {
  const observed = new Date(timestamp ?? 0).getTime();
  return (
    Number.isFinite(observed) &&
    observed >= childStartedAt - 2000 &&
    observed <= childFinishedAt + 2000
  );
}

function assertManifestCompleted(name: string, completed: boolean | undefined): void {
  if (completed !== true) {
    throw new Error(`${name}: manifest.completed is not true`);
  }
}

function assertTeardownFresh(name: string, fresh: boolean, finishedAt: string | undefined): void {
  if (!fresh) {
    throw new Error(
      `${name}: receipt timestamp ${finishedAt} falls outside the child execution window — ` +
        "a prior run's artifact cannot stand in for this run.",
    );
  }
}

function countOutcome(records: { outcome: string }[], outcome: string): number {
  return records.filter((entry) => entry.outcome === outcome).length;
}

function assertCorrelationCounts(name: string, aborted: number, completed: number): void {
  if (aborted < 3 || completed < 3) {
    throw new Error(
      `${name}: provider correlation carries ${aborted} aborted / ${completed} completed ` +
        'records — the suite oracle requires at least 3 of each.',
    );
  }
}

type MarathonManifest = {
  completed?: boolean;
  consumer?: { resolved_versions?: Record<string, string> };
  generated_at?: string;
  legs?: { platform?: string; status?: string; evidence?: { appearance?: string } }[];
  run_id?: string;
};

type MarathonTeardown = { finished_at?: string; run_id?: string };
type MarathonCorrelation = { backend_records?: { outcome: string }[]; run_id?: string };

function assertConsistentRunIds(name: string, runIds: (string | undefined)[]): void {
  if (runIds.some((runId) => !runId) || new Set(runIds).size !== 1) {
    throw new Error(
      `${name}: raw receipt run IDs are absent or inconsistent: ${runIds.join(', ')}`,
    );
  }
}

const EXPECTED_NATIVE_LEGS = [
  'android:dark',
  'android:light',
  'ios:dark',
  'ios:light',
  'web:default',
] as const;

function nativeLegIdentity(leg: NonNullable<MarathonManifest['legs']>[number]): string {
  return `${leg.platform ?? '(missing)'}:${leg.evidence?.appearance ?? 'default'}`;
}

function passedLegIdentities(name: string, manifest: MarathonManifest): string[] {
  const legs = manifest.legs ?? [];
  const identities = legs.map(nativeLegIdentity).sort();
  if (
    legs.some((leg) => leg.status !== 'passed') ||
    new Set(identities).size !== EXPECTED_NATIVE_LEGS.length ||
    JSON.stringify(identities) !== JSON.stringify(EXPECTED_NATIVE_LEGS)
  ) {
    throw new Error(
      `${name}: expected unique passed legs ${EXPECTED_NATIVE_LEGS.join(', ')}, observed ` +
        identities.join(', '),
    );
  }
  return identities;
}

type EmbeddedReceipt = {
  path: string;
  sha256: string;
  encoding: 'base64';
  content_base64: string;
};

type RawReceipts = Record<string, EmbeddedReceipt>;

const RECEIPT_NAMES = ['manifest', 'provider_correlation', 'selector_log', 'teardown'] as const;

function embeddedReceipt(path: string): EmbeddedReceipt {
  const bytes = readFileSync(path);
  return {
    path: path.startsWith(REPO_ROOT) ? path.slice(REPO_ROOT.length + 1) : path,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    encoding: 'base64',
    content_base64: bytes.toString('base64'),
  };
}

function rawReceiptEvidence(
  manifestPath: string,
  teardownPath: string,
  correlationPath: string,
  selectorLogPath: string,
): RawReceipts {
  return {
    manifest: embeddedReceipt(manifestPath),
    teardown: embeddedReceipt(teardownPath),
    provider_correlation: embeddedReceipt(correlationPath),
    selector_log: embeddedReceipt(selectorLogPath),
  };
}

function receiptBytes(name: string, receipt: EmbeddedReceipt): Buffer {
  assertSha256(`${name} receipt`, receipt.sha256);
  if (!receipt.path || receipt.path.trim().length === 0) {
    throw new Error(`${name} receipt path is absent`);
  }
  if (receipt.encoding !== 'base64' || receipt.content_base64.length === 0) {
    throw new Error(`${name} receipt lacks embedded base64 bytes`);
  }
  const bytes = Buffer.from(receipt.content_base64, 'base64');
  if (bytes.toString('base64') !== receipt.content_base64) {
    throw new Error(`${name} receipt base64 is not canonical`);
  }
  const observed = createHash('sha256').update(bytes).digest('hex');
  if (observed !== receipt.sha256) {
    throw new Error(`${name} receipt bytes do not match ${receipt.sha256}`);
  }
  return bytes;
}

function exactRawReceipts(name: string, receipts: RawReceipts): Record<string, Buffer> {
  const names = Object.keys(receipts).sort();
  if (JSON.stringify(names) !== JSON.stringify(RECEIPT_NAMES)) {
    throw new Error(`${name}: expected exact raw receipts ${RECEIPT_NAMES.join(', ')}`);
  }
  return Object.fromEntries(
    names.map((receiptName) => [receiptName, receiptBytes(receiptName, receipts[receiptName])]),
  );
}

type MarathonSummary = {
  runId: string;
  manifest: MarathonManifest;
  teardown: MarathonTeardown;
  aborted: number;
  completed: number;
  legIdentities: string[];
};

function validateMarathonReceipts(
  name: MarathonName,
  receipts: RawReceipts,
  childStartedAt: number,
  childFinishedAt: number,
): MarathonSummary {
  const bytes = exactRawReceipts(name, receipts);
  const manifest = JSON.parse(bytes.manifest.toString('utf8')) as MarathonManifest;
  const teardown = JSON.parse(bytes.teardown.toString('utf8')) as MarathonTeardown;
  const correlation = JSON.parse(
    bytes.provider_correlation.toString('utf8'),
  ) as MarathonCorrelation;
  const selectorTally = tallyOf(bytes.selector_log.toString('utf8'));
  assertConsistentRunIds(name, [manifest.run_id, teardown.run_id, correlation.run_id]);
  assertManifestCompleted(name, manifest.completed);
  assertTeardownFresh(
    name,
    timestampInsideChild(teardown.finished_at, childStartedAt, childFinishedAt),
    teardown.finished_at,
  );
  assertTeardownFresh(
    name,
    timestampInsideChild(manifest.generated_at, childStartedAt, childFinishedAt),
    manifest.generated_at,
  );
  if (selectorTally.passed !== 1 || selectorTally.failed !== 0 || selectorTally.skipped !== 3) {
    throw new Error(
      `${name}: embedded selector log does not prove exactly one passing selected test`,
    );
  }
  const records = correlation.backend_records ?? [];
  const aborted = countOutcome(records, 'aborted');
  const completed = countOutcome(records, 'completed');
  assertCorrelationCounts(name, aborted, completed);
  return {
    runId: manifest.run_id as string,
    manifest,
    teardown,
    aborted,
    completed,
    legIdentities: passedLegIdentities(name, manifest),
  };
}

/** Marathon post-conditions: fresh manifest completed=true, teardown inside the
 * child's window, raw receipt run IDs agree, all five legs passed, and provider
 * correlation proves both aborted and completed requests. */
function marathonEvidence(
  name: MarathonName,
  childStartedAt: number,
  childFinishedAt: number,
  selectorLogPath: string,
): Record<string, unknown> {
  const dir = marathonScratchDir(name);
  const manifestPath = join(dir, 'manifest.json');
  const teardownPath = join(dir, 'teardown.json');
  const correlationPath = join(dir, 'provider-correlation.json');
  requireMarathonArtifacts(name, [manifestPath, teardownPath, correlationPath, selectorLogPath]);
  const rawReceipts = rawReceiptEvidence(
    manifestPath,
    teardownPath,
    correlationPath,
    selectorLogPath,
  );
  const summary = validateMarathonReceipts(name, rawReceipts, childStartedAt, childFinishedAt);
  const record: Record<string, unknown> = {
    proof_mode: 'rerun',
    child_started_at_ms: childStartedAt,
    child_finished_at_ms: childFinishedAt,
    run_id: summary.runId,
    manifest_completed: summary.manifest.completed === true,
    manifest_generated_at: summary.manifest.generated_at ?? null,
    manifest_fresh: true,
    passed_legs: summary.legIdentities,
    teardown_finished_at: summary.teardown.finished_at ?? null,
    teardown_fresh: true,
    provider_aborted_records: summary.aborted,
    provider_completed_records: summary.completed,
    resolved_versions: summary.manifest.consumer?.resolved_versions ?? null,
    raw_receipts: rawReceipts,
  };
  return record;
}

type StaticGates = {
  typecheck: { exit: number };
  'scoped-biome-ci': { exit: number; targets: string[] };
};

/** Port policy: the docs-collection Playwright-class token must own 4321. */
async function assertPortFree(): Promise<void> {
  if (await portOccupied(4321)) {
    throw new Error(
      'port 4321 is OCCUPIED — a 4321-dependent child may never run against another ' +
        'listener (its failure would be misattributed). Free the port or reschedule; ' +
        'never kill an unowned listener.',
    );
  }
}

function assertSelectorGreen(spec: SelectorSpec, result: ChildResult, tally: TestTally): void {
  if (result.exit !== 0 || result.timedOut) {
    throw new Error(
      `selector ${spec.name} exited ${result.exit}${result.timedOut ? ' (timed out)' : ''} — ` +
        `green requires exit 0 for every preserved selector.\n${result.output.slice(-3000)}`,
    );
  }
  if (
    tally.failed !== 0 ||
    tally.skipped !== spec.expectedSkips ||
    tally.passed !== spec.expectedPasses
  ) {
    throw new Error(
      `selector ${spec.name} executed ${tally.passed} passed / ${tally.failed} failed / ` +
        `${tally.skipped} skipped tests; expected exactly ${spec.expectedPasses} passed, ` +
        `${spec.expectedSkips} filtered skips, and no failures.`,
    );
  }
}

function isMarathonSelector(name: string): name is MarathonName {
  if (name === 'nativewind-abort-error-retry') return true;
  if (name === 'nativewind-fail-closed-cleanup') return true;
  return false;
}

function runSelector(spec: SelectorSpec): Record<string, unknown> {
  const childStartedAt = Date.now();
  const selectorLogPath =
    spec.name === ROUTING_SELECTOR.name
      ? join(CHILD_TMPDIR, `${spec.name}.log`)
      : join(GREEN_DIR, `${spec.name}.log`);
  const result = runChild(spec, selectorLogPath);
  const childFinishedAt = Date.now();
  const tally = tallyOf(result.output);
  assertSelectorGreen(spec, result, tally);
  const record: Record<string, unknown> = {
    name: spec.name,
    command: `pnpm ${spec.args.join(' ')}`,
    exit: result.exit,
    passed_tokens: tally.passed,
    failed_tokens: tally.failed,
    skipped_tokens: tally.skipped,
    duration_ms: result.durationMs,
    log: selectorLogPath.startsWith(REPO_ROOT)
      ? selectorLogPath.slice(REPO_ROOT.length + 1)
      : selectorLogPath,
  };
  if (isMarathonSelector(spec.name)) {
    record.marathon = marathonEvidence(spec.name, childStartedAt, childFinishedAt, selectorLogPath);
  }
  return record;
}

function runSelectors(): Record<string, unknown>[] {
  const selectorRecords: Record<string, unknown>[] = [];
  for (const spec of ALL_SELECTORS) {
    selectorRecords.push(runSelector(spec));
  }
  return selectorRecords;
}

function assertGateExit(label: string, result: ChildResult): void {
  if (result.exit !== 0) {
    throw new Error(`${label} exited ${result.exit}.\n${result.output.slice(-3000)}`);
  }
}

/** Static gates: the real TypeScript compiler and the real scoped Biome run. */
function runStaticGates(): StaticGates {
  const typecheck = runPlain(
    'typecheck',
    ['typecheck'],
    join(GREEN_DIR, 'typecheck.log'),
    10 * MINUTE,
  );
  assertGateExit('pnpm typecheck', typecheck);
  const biome = runPlain(
    'biome',
    ['exec', 'biome', 'ci', ...SCOPED_BIOME_TARGETS],
    join(GREEN_DIR, 'biome.log'),
    5 * MINUTE,
  );
  assertGateExit('scoped biome ci', biome);
  return {
    typecheck: { exit: typecheck.exit },
    'scoped-biome-ci': { exit: biome.exit, targets: SCOPED_BIOME_TARGETS },
  };
}

function isProductSource(path: string): boolean {
  if (path.startsWith('apps/')) return true;
  if (path.startsWith('packages/')) return true;
  if (path.startsWith('scripts/')) return true;
  return false;
}

function isRuntimeArtifact(path: string): boolean {
  if (path === '.tmp/ORI-RN-005/mismatched-manifest.json') return true;
  for (const prefix of [
    '.tmp/ORI-RN-005/abort-error-retry/',
    '.tmp/ORI-RN-005/fail-closed-hash-mismatch/',
    '.tmp/ORI-RN-005/fail-closed-absent-target/',
    '.tmp/ORI-RN-005/fail-closed-cleanup/',
  ]) {
    if (path.startsWith(prefix)) return true;
  }
  return false;
}

function boundaryViolation(entry: string): string | null {
  // Keep the two status columns. Trimming first turns " M path" into "M path",
  // and slice(3) then drops the path's first character, so an allowed unstaged
  // file never matches DIFF_ALLOWED.
  const path = entry.slice(3).trim();
  if (isProductSource(path)) {
    return `product source changed: ${entry}`;
  }
  // Exact tracked driver outputs under gitignored .tmp/ still show in porcelain
  // while the real selectors run. Only the contract's bounded paths qualify.
  if (!DIFF_ALLOWED.has(path) && !isRuntimeArtifact(path)) {
    return `outside write boundary: ${entry}`;
  }
  return null;
}

function collectBoundary(entries: string[]): { violations: string[]; inventory: string[] } {
  const violations: string[] = [];
  const inventory: string[] = [];
  for (const entry of entries) {
    inventory.push(entry);
    const violation = boundaryViolation(entry);
    if (violation !== null) violations.push(violation);
  }
  return { violations, inventory };
}

/** Tracked-file diff boundary: porcelain entries must all be allowed, and no
 * product-source path may appear in any form. */
function assertDiffBoundary(): string[] {
  const status = spawnSync('git', ['status', '--porcelain'], { cwd: REPO_ROOT, encoding: 'utf8' });
  const entries = (status.stdout ?? '').split('\n').filter((line) => line.trim().length > 0);
  const { violations, inventory } = collectBoundary(entries);
  if (violations.length > 0) {
    throw new Error(
      `tracked-file diff boundary violated:\n${violations.join('\n')}\n` +
        `full porcelain inventory:\n${inventory.join('\n')}`,
    );
  }
  return inventory;
}

function writeGreenEvidence(
  selectorRecords: Record<string, unknown>[],
  staticGates: StaticGates,
  inventory: string[],
): void {
  const executionCandidate = gitHead();
  const harnessPath = fileURLToPath(import.meta.url);
  const candidateScopeRecord = candidateScope(executionCandidate);
  const suiteHashes = hashes();
  const nativeInputs = nativeExecutionInputs();
  assertGitAndCurrentHashes('suite', executionCandidate, suiteHashes);
  assertGitAndCurrentHashes('native execution input', executionCandidate, nativeInputs.sha256);
  const greenRecord = {
    task: 'FIX-ORI-SUITE-2-2',
    mode: 'green',
    captured_at: new Date().toISOString(),
    candidate_commit: executionCandidate,
    candidate_scope: candidateScopeRecord,
    harness_sha256: sha256File(harnessPath),
    suites_sha256: suiteHashes,
    selectors: selectorRecords,
    native_proof: {
      mode: 'rerun',
      selector_count: selectorRecords.filter((record) =>
        String(record.name).startsWith('nativewind-'),
      ).length,
      execution_inputs: nativeInputs,
    },
    static_gates: staticGates,
    diff_boundary: {
      porcelain_inventory: inventory,
      product_source_clean: true,
    },
    child_tmpdir: CHILD_TMPDIR,
  };
  writeFileSync(join(EVIDENCE_ROOT, 'green.json'), `${JSON.stringify(greenRecord, null, 2)}\n`);
  writeRunRecord({
    task: 'FIX-ORI-SUITE-2-2',
    candidate_commit: executionCandidate,
    candidate_scope: greenRecord.candidate_scope,
    harness_sha256: sha256File(harnessPath),
    suites_sha256: suiteHashes,
    selectors: selectorRecords,
    native_proof: greenRecord.native_proof,
    static_gates: greenRecord.static_gates,
    diff_boundary: greenRecord.diff_boundary,
    child_tmpdir: CHILD_TMPDIR,
    green_captured_at: greenRecord.captured_at,
  });
}

/** Green proof: all six selectors exit 0, static gates pass, diff holds. */
async function proveGreen(): Promise<void> {
  mkdirSync(GREEN_DIR, { recursive: true });
  mkdirSync(CHILD_TMPDIR, { recursive: true });
  await assertPortFree();
  const selectorRecords = runSelectors();
  const staticGates = runStaticGates();
  const inventory = assertDiffBoundary();
  writeGreenEvidence(selectorRecords, staticGates, inventory);
}

type RecordedGreen = {
  candidate_commit?: string;
  candidate_scope?: CandidateScope;
  harness_sha256?: string;
  mode?: string;
  native_proof?: {
    mode?: string;
    selector_count?: number;
    execution_inputs?: { sha256?: Record<string, string> };
  };
  selectors?: {
    command?: string;
    exit?: number;
    failed_tokens?: number;
    marathon?: {
      child_started_at_ms?: number;
      child_finished_at_ms?: number;
      manifest_completed?: boolean;
      passed_legs?: string[];
      provider_aborted_records?: number;
      provider_completed_records?: number;
      raw_receipts?: RawReceipts;
      run_id?: string;
      teardown_fresh?: boolean;
    };
    name?: string;
    passed_tokens?: number;
    skipped_tokens?: number;
  }[];
  static_gates?: StaticGates;
  suites_sha256?: Record<string, string>;
  task?: string;
};

function readRecordedGreen(): RecordedGreen {
  const greenPath = join(EVIDENCE_ROOT, 'green.json');
  return JSON.parse(readFileSync(greenPath, 'utf8')) as RecordedGreen;
}

function assertSha256(label: string, value: string | undefined): asserts value is string {
  if (!value || !/^[0-9a-f]{64}$/.test(value)) {
    throw new Error(`${label} is not a SHA-256 digest`);
  }
}

function assertGitAndCurrentHashes(
  label: string,
  candidate: string,
  hashesToVerify: Record<string, string>,
): void {
  for (const [path, expected] of Object.entries(hashesToVerify)) {
    assertSha256(`${label} ${path}`, expected);
    const candidateHash = gitFileSha256(candidate, path);
    if (candidateHash !== expected) {
      throw new Error(`${label} ${path} differs at recorded candidate ${candidate}`);
    }
    const currentHash = sha256File(join(REPO_ROOT, path));
    if (currentHash !== expected) {
      throw new Error(`${label} ${path} changed after recorded candidate ${candidate}`);
    }
  }
}

function assertCurrentHashes(
  root: string,
  label: string,
  hashesToVerify: Record<string, string>,
): void {
  for (const [path, expected] of Object.entries(hashesToVerify)) {
    assertSha256(`${label} ${path}`, expected);
    const absolutePath = join(root, path);
    if (!existsSync(absolutePath)) throw new Error(`${label} ${path} is absent`);
    if (sha256File(absolutePath) !== expected) {
      throw new Error(`${label} ${path} changed after the recorded proof`);
    }
  }
}

function recordedCandidateOf(evidence: RecordedGreen): string {
  if (evidence.task !== 'FIX-ORI-SUITE-2-2' || evidence.mode !== 'green') {
    throw new Error('recorded green evidence has the wrong task or mode');
  }
  const candidate = evidence.candidate_commit ?? '';
  if (!/^[0-9a-f]{40}$/.test(candidate)) {
    throw new Error('recorded green evidence lacks a full execution-candidate SHA');
  }
  return candidate;
}

function assertScopeHeader(scope: CandidateScope | undefined, candidate: string): CandidateScope {
  if (!scope) throw new Error('recorded candidate scope is absent');
  if (scope.base_commit !== TASK_BASE_COMMIT) {
    throw new Error('recorded candidate scope has the wrong immutable base');
  }
  if (scope.execution_candidate !== candidate) {
    throw new Error('recorded candidate scope has the wrong execution candidate');
  }
  if (scope.git_range_audit?.verified !== true) {
    throw new Error('recorded candidate scope lacks its execution-time Git audit');
  }
  return scope;
}

function assertRecordedScope(evidence: RecordedGreen, candidate: string): void {
  const scope = assertScopeHeader(evidence.candidate_scope, candidate);
  const paths = scope.changed_paths;
  if (paths.length === 0) throw new Error('recorded candidate scope path inventory is empty');
  if (new Set(paths).size !== paths.length)
    throw new Error('recorded candidate scope has duplicates');
  if (paths.some((path) => !DIFF_ALLOWED.has(path))) {
    throw new Error('recorded candidate scope contains an outside path');
  }
  if (scope.git_range_audit.changed_paths_sha256 !== pathInventorySha256(paths)) {
    throw new Error('recorded candidate scope path inventory is invalid');
  }
}

function assertRecordedHarness(evidence: RecordedGreen): void {
  assertSha256('recorded harness', evidence.harness_sha256);
  if (sha256File(fileURLToPath(import.meta.url)) !== evidence.harness_sha256) {
    throw new Error('current proof harness differs from the executed harness bytes');
  }
}

function assertRecordedSuites(evidence: RecordedGreen): void {
  const recordedSuites = evidence.suites_sha256 ?? {};
  const inventory = Object.keys(recordedSuites).sort();
  if (JSON.stringify(inventory) !== JSON.stringify([...SUITE_FILES].sort())) {
    throw new Error('recorded suite hash inventory is incomplete');
  }
  assertCurrentHashes(REPO_ROOT, 'suite', recordedSuites);
}

function assertRecordedNativeInputs(evidence: RecordedGreen): void {
  const recordedInputs = evidence.native_proof?.execution_inputs?.sha256 ?? {};
  const currentInputs = nativeExecutionInputs().sha256;
  if (JSON.stringify(currentInputs) !== JSON.stringify(recordedInputs)) {
    throw new Error('recorded native execution-input inventory differs from the current graph');
  }
  assertCurrentHashes(REPO_ROOT, 'native execution input', recordedInputs);
}

function assertNativeReceipts(selector: NonNullable<RecordedGreen['selectors']>[number]): void {
  const marathon = selector.marathon;
  const name = selector.name ?? '';
  if (!isMarathonSelector(name) || !marathon?.raw_receipts) {
    throw new Error(`${selector.name}: native selector lacks embedded raw receipts`);
  }
  const startedAt = marathon.child_started_at_ms;
  const finishedAt = marathon.child_finished_at_ms;
  if (!Number.isFinite(startedAt) || !Number.isFinite(finishedAt)) {
    throw new Error(`${selector.name}: native selector lacks its child execution window`);
  }
  const summary = validateMarathonReceipts(
    name,
    marathon.raw_receipts,
    startedAt as number,
    finishedAt as number,
  );
  const recordedSummary = {
    run_id: marathon.run_id,
    manifest_completed: marathon.manifest_completed,
    teardown_fresh: marathon.teardown_fresh,
    passed_legs: marathon.passed_legs,
    provider_aborted_records: marathon.provider_aborted_records,
    provider_completed_records: marathon.provider_completed_records,
  };
  const receiptSummary = {
    run_id: summary.runId,
    manifest_completed: true,
    teardown_fresh: true,
    passed_legs: summary.legIdentities,
    provider_aborted_records: summary.aborted,
    provider_completed_records: summary.completed,
  };
  if (JSON.stringify(recordedSummary) !== JSON.stringify(receiptSummary)) {
    throw new Error(`${selector.name}: native summary differs from its embedded raw receipts`);
  }
}

type RecordedSelector = NonNullable<RecordedGreen['selectors']>[number];

function assertSelectorInventory(selectors: RecordedSelector[]): Map<string, SelectorSpec> {
  const expectedByName = new Map(ALL_SELECTORS.map((spec) => [spec.name, spec]));
  const names = selectors.map((selector) => selector.name ?? '').sort();
  const expectedNames = [...expectedByName.keys()].sort();
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
    throw new Error('recorded proof must contain the exact six unique selector names');
  }
  return expectedByName;
}

function assertRecordedSelector(selector: RecordedSelector, spec: SelectorSpec): void {
  const expected = {
    command: `pnpm ${spec.args.join(' ')}`,
    exit: 0,
    passed_tokens: spec.expectedPasses,
    failed_tokens: 0,
    skipped_tokens: spec.expectedSkips,
  };
  const actual = {
    command: selector.command,
    exit: selector.exit,
    passed_tokens: selector.passed_tokens,
    failed_tokens: selector.failed_tokens,
    skipped_tokens: selector.skipped_tokens,
  };
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${selector.name}: recorded command or exact test tally is invalid`);
  }
}

function assertRecordedSelectors(evidence: RecordedGreen): void {
  const selectors = evidence.selectors ?? [];
  const expectedByName = assertSelectorInventory(selectors);
  for (const selector of selectors) {
    const spec = expectedByName.get(selector.name ?? '') as SelectorSpec;
    assertRecordedSelector(selector, spec);
  }
  const nativeSelectors = selectors.filter((record) => isMarathonSelector(record.name ?? ''));
  if (
    evidence.native_proof?.mode !== 'rerun' ||
    evidence.native_proof.selector_count !== nativeSelectors.length ||
    nativeSelectors.length !== MARATHON_SELECTORS.length
  ) {
    throw new Error('native proof must derive rerun mode from exactly both native selectors');
  }
  for (const selector of nativeSelectors) {
    assertNativeReceipts(selector);
  }
}

function assertRecordedStaticGates(evidence: RecordedGreen): void {
  const gates = evidence.static_gates;
  if (gates?.typecheck.exit !== 0 || gates?.['scoped-biome-ci'].exit !== 0) {
    throw new Error('recorded static gates are not green');
  }
}

/** Later aggregate runs validate the committed proof against its immutable execution
 * candidate and executable/input hashes. They never widen the scope range to later
 * HEAD and never replay the device proof just because unrelated commits landed. */
function verifyRecordedGreen(): void {
  const evidence = readRecordedGreen();
  const candidate = recordedCandidateOf(evidence);
  assertRecordedScope(evidence, candidate);
  assertRecordedHarness(evidence);
  assertRecordedSuites(evidence);
  assertRecordedNativeInputs(evidence);
  assertRecordedSelectors(evidence);
  assertRecordedStaticGates(evidence);
}

/** The task's single exported proof function (TEST_FUNCTION in the charter).
 * Never wipes the evidence root: red.json must survive the green run beside it. */
// biome-ignore lint/suspicious/noExportsInTest: task contract requires this named exported proof function
export async function runForeignSuiteRepairProof(): Promise<void> {
  mkdirSync(EVIDENCE_ROOT, { recursive: true });
  if (process.env.FOREIGN_SUITE_REPAIR_CAPTURE === 'red') {
    await captureRed();
    return;
  }
  if (
    existsSync(join(EVIDENCE_ROOT, 'green.json')) &&
    process.env.FOREIGN_SUITE_REPAIR_FORCE !== '1'
  ) {
    verifyRecordedGreen();
    return;
  }
  await proveGreen();
}

function writeVerifierReceiptFixture(root: string): {
  receipts: RawReceipts;
  startedAt: number;
  finishedAt: number;
} {
  const startedAt = Date.now() - 1000;
  const finishedAt = startedAt + 500;
  const runId = 'verifier-contract-fixture';
  const paths = {
    manifest: join(root, 'manifest.json'),
    teardown: join(root, 'teardown.json'),
    correlation: join(root, 'provider-correlation.json'),
    log: join(root, 'selector.log'),
  };
  writeFileSync(
    paths.manifest,
    JSON.stringify({
      run_id: runId,
      completed: true,
      generated_at: new Date(startedAt + 100).toISOString(),
      legs: EXPECTED_NATIVE_LEGS.map((identity) => {
        const [platform, appearance] = identity.split(':');
        return {
          platform,
          status: 'passed',
          evidence: appearance === 'default' ? {} : { appearance },
        };
      }),
    }),
  );
  writeFileSync(
    paths.teardown,
    JSON.stringify({ run_id: runId, finished_at: new Date(startedAt + 200).toISOString() }),
  );
  writeFileSync(
    paths.correlation,
    JSON.stringify({
      run_id: runId,
      backend_records: [
        { outcome: 'aborted' },
        { outcome: 'aborted' },
        { outcome: 'aborted' },
        { outcome: 'completed' },
        { outcome: 'completed' },
        { outcome: 'completed' },
      ],
    }),
  );
  writeFileSync(
    paths.log,
    ' Test Files  1 passed (1)\n Tests  1 passed | 3 skipped (4)\n[exit 0]\n',
  );
  return {
    receipts: rawReceiptEvidence(paths.manifest, paths.teardown, paths.correlation, paths.log),
    startedAt,
    finishedAt,
  };
}

test('FIX-ORI-SUITE-2-2 verifier-contract rejects skipped success and duplicate legs', () => {
  const skippedOutput = ' Test Files  1 skipped (1)\n Tests  4 skipped (4)\n';
  const tally = tallyOf(skippedOutput);
  expect(() =>
    assertSelectorGreen(
      DRIFTED_SELECTORS[0],
      { exit: 0, timedOut: false, output: skippedOutput, durationMs: 1 },
      tally,
    ),
  ).toThrow(/expected exactly 4 passed/);
  const duplicateLegs: MarathonManifest = {
    legs: Array.from({ length: 5 }, () => ({
      platform: 'ios',
      status: 'passed',
      evidence: { appearance: 'light' },
    })),
  };
  expect(() => passedLegIdentities('duplicate-leg-probe', duplicateLegs)).toThrow(
    /expected unique passed legs/,
  );
});

test('FIX-ORI-SUITE-2-2 verifier-contract reads embedded receipt bytes and rejects tampering', () => {
  const root = mkdtempSync(join(tmpdir(), 'fix-ori-suite-2-2-receipts-'));
  try {
    const fixture = writeVerifierReceiptFixture(root);
    const summary = validateMarathonReceipts(
      'nativewind-abort-error-retry',
      fixture.receipts,
      fixture.startedAt,
      fixture.finishedAt,
    );
    expect(summary.legIdentities).toEqual([...EXPECTED_NATIVE_LEGS]);
    const selector: RecordedSelector = {
      name: 'nativewind-abort-error-retry',
      marathon: {
        child_started_at_ms: fixture.startedAt,
        child_finished_at_ms: fixture.finishedAt,
        run_id: summary.runId,
        manifest_completed: true,
        teardown_fresh: true,
        passed_legs: summary.legIdentities,
        provider_aborted_records: summary.aborted,
        provider_completed_records: summary.completed,
        raw_receipts: fixture.receipts,
      },
    };
    expect(() => assertNativeReceipts(selector)).not.toThrow();

    const changedBytes = structuredClone(selector);
    const changedManifest = changedBytes.marathon?.raw_receipts?.manifest;
    if (!changedManifest) throw new Error('verifier fixture lost its embedded manifest');
    changedManifest.content_base64 = Buffer.from('{"tampered":true}').toString('base64');
    expect(() => assertNativeReceipts(changedBytes)).toThrow(/bytes do not match/);

    const missingReceipt = structuredClone(selector);
    const missingReceipts = missingReceipt.marathon?.raw_receipts;
    if (!missingReceipts) throw new Error('verifier fixture lost its raw receipt map');
    delete missingReceipts.selector_log;
    expect(() => assertNativeReceipts(missingReceipt)).toThrow(/expected exact raw receipts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('FIX-ORI-SUITE-2-2 verifier-contract rejects duplicate selector identities', () => {
  const duplicate = Array.from({ length: ALL_SELECTORS.length }, () => ({
    name: 'docs-collection',
    command: 'pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts',
    exit: 0,
    passed_tokens: 4,
    failed_tokens: 0,
    skipped_tokens: 0,
  }));
  expect(() =>
    assertRecordedSelectors({
      native_proof: { mode: 'rerun', selector_count: 2 },
      selectors: duplicate,
    }),
  ).toThrow(/exact six unique selector names/);
});

test('FIX-ORI-SUITE-2-2 verifier-contract passes in a real depth-one checkout and rejects drift', () => {
  const root = mkdtempSync(join(tmpdir(), 'fix-ori-suite-2-2-shallow-'));
  const source = join(root, 'source');
  const checkout = join(root, 'checkout');
  try {
    mkdirSync(source);
    const git = (cwd: string, args: string[]) =>
      spawnSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
    expect(git(source, ['init', '-q']).status).toBe(0);
    writeFileSync(join(source, 'bound.txt'), 'first\n');
    expect(git(source, ['add', 'bound.txt']).status).toBe(0);
    expect(
      git(source, [
        '-c',
        'user.name=Verifier',
        '-c',
        'user.email=verifier@example.invalid',
        'commit',
        '-qm',
        'first',
      ]).status,
    ).toBe(0);
    writeFileSync(join(source, 'bound.txt'), 'second\n');
    expect(git(source, ['add', 'bound.txt']).status).toBe(0);
    expect(
      git(source, [
        '-c',
        'user.name=Verifier',
        '-c',
        'user.email=verifier@example.invalid',
        'commit',
        '-qm',
        'second',
      ]).status,
    ).toBe(0);
    expect(
      spawnSync('git', ['clone', '-q', '--depth', '1', `file://${source}`, checkout], {
        encoding: 'utf8',
      }).status,
    ).toBe(0);
    expect(git(checkout, ['rev-parse', '--is-shallow-repository']).stdout.trim()).toBe('true');
    expect(git(checkout, ['cat-file', '-e', 'HEAD^']).status).not.toBe(0);

    const candidate = git(checkout, ['rev-parse', 'HEAD']).stdout.trim();
    const changedPaths = ['tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts'];
    const scope: CandidateScope = {
      base_commit: TASK_BASE_COMMIT,
      execution_candidate: candidate,
      changed_paths: changedPaths,
      git_range_audit: {
        verified: true,
        changed_paths_sha256: pathInventorySha256(changedPaths),
      },
    };
    expect(() => assertRecordedScope({ candidate_scope: scope }, candidate)).not.toThrow();
    const boundHash = sha256File(join(checkout, 'bound.txt'));
    expect(() =>
      assertCurrentHashes(checkout, 'shallow fixture', { 'bound.txt': boundHash }),
    ).not.toThrow();

    writeFileSync(join(checkout, 'bound.txt'), 'changed after proof\n');
    expect(() =>
      assertCurrentHashes(checkout, 'shallow fixture', { 'bound.txt': boundHash }),
    ).toThrow(/changed after the recorded proof/);
    const alteredScope = structuredClone(scope);
    alteredScope.git_range_audit.changed_paths_sha256 = '0'.repeat(64);
    expect(() => assertRecordedScope({ candidate_scope: alteredScope }, candidate)).toThrow(
      /path inventory is invalid/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('FIX-ORI-SUITE-2-2 foreign suite repair proof', { timeout: 8 * 60 * MINUTE }, () =>
  runForeignSuiteRepairProof(),
);
