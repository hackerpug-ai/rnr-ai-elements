/**
 * ORI-AI-002 — the composed worked example proven against the real provider on six
 * live targets (uniwind/nativewind x ios/android/web).
 *
 * Every test here spawns the REAL matrix runner
 * (tests/sprint-05-orient-search/run-live-example-proof.mjs -> tsx ->
 * live-example-proof.ts -> the ORI-RN-004 `runLiveExampleProof` and ORI-RN-005
 * `runNativewindLiveExampleProof` driver exports) and asserts on the fresh evidence
 * it produces in THIS invocation: the real owned backend, the official OpenAI
 * Responses endpoint (gpt-4.1-mini-2025-04-14 — plus a real rejected-provider phase
 * on `rnr-s05-nonexistent-<runId>`), the reserved iOS/Android devices and a real
 * Chromium web session. No mocked HTTP, no stub providers, no canned streams, no
 * reads of earlier runs' manifests.
 *
 * The four named tests share ONE runner invocation (a module-level singleton
 * promise): the first test to await it starts and awaits the real matrix; the rest
 * assert against the same fresh artifacts.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');
const RUNNER = join(REPO_ROOT, 'tests/sprint-05-orient-search/run-live-example-proof.mjs');
const EVIDENCE = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-AI-002');
const SCRATCH = join(REPO_ROOT, '.tmp/ORI-AI-002');

const PRIMARY_MODEL = 'gpt-4.1-mini-2025-04-14';
const TARGETS = [
  'uniwind-ios',
  'uniwind-android',
  'uniwind-web',
  'nativewind-ios',
  'nativewind-android',
  'nativewind-web',
] as const;
type TargetId = (typeof TARGETS)[number];

const TARGET_FILES = [
  'result.json',
  'stream.jsonl',
  'screen-recording.mp4',
  'streaming.png',
  'recovered.png',
];

/** The reserved proof-owned device selectors. NODE_ENV is explicitly cleared:
 * Vitest exports NODE_ENV=test into this process and the runner's children (Metro,
 * Expo dev servers) refuse to boot under it — the ORI-RN-005 cycle-2 finding. */
const RESERVED_ENV: NodeJS.ProcessEnv = {
  ...process.env,
  RNR_S05_IOS_UDID: '81487B1E-A4D1-45AE-9BCE-D675802BACD1',
  RNR_S05_ANDROID_SERIAL: 'emulator-5554',
};
delete RESERVED_ENV.NODE_ENV;

function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

type RunnerRun = { exit: number; output: string };

function spawnRunner(args: string[], timeoutMs: number): RunnerRun {
  const res = spawnSync(process.execPath, [RUNNER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env: RESERVED_ENV,
  });
  return { exit: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/**
 * The one shared real matrix invocation. A full two-engine three-platform proof
 * (reject phase + live phase + web self-session per engine) measures ~1-2h, so the
 * timeout must exceed it. Like ORI-RN-005's driver harness, a run is retried ONCE
 * only when its teardown.json is absent (the signature of an external kill with no
 * concluded teardown); a CONCLUDED failed run never retries — a real red stays red.
 */
let matrixPromise: Promise<RunnerRun> | null = null;
function runMatrixOnce(): Promise<RunnerRun> {
  matrixPromise ??= Promise.resolve().then(() => {
    let last: RunnerRun = { exit: -1, output: 'matrix runner was never spawned' };
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const startedAt = Date.now();
      last = spawnRunner(
        [
          '--engines',
          'uniwind,nativewind',
          '--platforms',
          'ios,android,web',
          '--output',
          'tests/sprint-05-orient-search/evidence/ORI-AI-002',
        ],
        240 * 60_000,
      );
      const teardownPath = join(EVIDENCE, 'teardown.json');
      if (last.exit === 0) return last;
      if (!existsSync(teardownPath)) continue; // killed before ANY teardown could exist
      let finishedAt = 0;
      try {
        finishedAt = new Date(
          readJson<{ finished_at: string }>(teardownPath).finished_at,
        ).getTime();
      } catch {
        continue; // unreadable = do not trust; retry
      }
      if (Number.isFinite(finishedAt) && finishedAt >= startedAt - 2000) return last; // concluded
    }
    return last;
  });
  return matrixPromise;
}

/* ------------------------------------------------------------ evidence types -- */

type StreamLine = {
  ts: string;
  kind: 'prefix' | 'dom-sample' | 'final' | 'correlation';
  text?: string;
  length?: number;
  request_id?: string;
  text_hash?: string;
};

type RetryEntry = {
  trigger: 'endpoint-loss' | 'stop' | 'provider-rejection';
  new_request_completed: boolean;
  single_user_turn: boolean;
  request_id: string | null;
};

type TargetResult = {
  task: 'ORI-AI-002';
  run_id: string;
  engine: 'uniwind' | 'nativewind';
  platform: 'ios' | 'android' | 'web';
  native: boolean;
  device: string;
  api_origin: string;
  nonce_first: string;
  streaming: { distinct_prefix_count: number };
  context: {
    followup_answer_contains_nonce: boolean;
    latest_user_message_nonce_occurrences: number;
    prior_exchange_count: number;
  };
  correlation: {
    completed_request_ids: string[];
    response_ids: string[];
    model: string;
    positive_usage: boolean;
    text_hashes_recorded: string[];
    web_raw_text_hash_match: boolean | null;
  };
  stop_proof: {
    aborted_request_id: string | null;
    delta_count_at_abort: number;
    completed_before_stop: boolean;
    source: 'driver-flow' | 'web-self';
  };
  retry_after_failure: RetryEntry[];
  endpoint_loss: {
    visible_error: boolean;
    sanitized: boolean;
    retry_completed: boolean;
    single_user_turn: boolean;
  };
  provider_rejection: {
    model: string;
    rejected_request_ids: string[];
    sanitized: boolean;
    visible_error_screenshot: string;
    restore_completed_request_ids: string[];
  };
};

type Manifest = {
  task: 'ORI-AI-002';
  run_id: string;
  generated_at: string;
  commands: { matrix: string };
  source_digests: Record<string, string>;
  api_origin: string;
  devices: { ios_udid: string; android_serial: string; web_browser: string };
  targets: Record<
    string,
    { engine: string; platform: string; native: boolean; artifacts: Record<string, string> }
  >;
};

type Teardown = {
  run_id: string;
  finished_at: string;
  model_restored: boolean;
  final_model: string;
  appearances_restored: { platform: string; from: string; to: string }[];
  reservations_released: boolean;
  owned_listeners_remaining: string[];
  adb_reverse_remaining: string;
};

/* ---------------------------------------------------------------- shared load -- */

function loadTargets(): Map<TargetId, TargetResult> {
  const map = new Map<TargetId, TargetResult>();
  for (const id of TARGETS) {
    const path = join(EVIDENCE, id, 'result.json');
    expect(existsSync(path), `${id}/result.json exists`).toBe(true);
    const result = readJson<TargetResult>(path);
    expect(result.task).toBe('ORI-AI-002');
    expect(result.engine, `${id} engine identity`).toBe(id.split('-')[0]);
    expect(result.platform, `${id} platform identity`).toBe(id.split('-')[1]);
    map.set(id, result);
  }
  return map;
}

function loadStreamLines(id: TargetId): StreamLine[] {
  const path = join(EVIDENCE, id, 'stream.jsonl');
  expect(existsSync(path), `${id}/stream.jsonl exists`).toBe(true);
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as StreamLine);
}

/* --------------------------------------------------------------------- tests -- */

it('ORI-AI-002-AC-1-stream-history: six targets stream incrementally and retain context', {
  timeout: 250 * 60_000,
}, async () => {
  const run = await runMatrixOnce();
  expect(
    run.exit,
    `the real matrix runner must succeed (tail of output):\n${run.output.slice(-4000)}`,
  ).toBe(0);

  const manifest = readJson<Manifest>(join(EVIDENCE, 'manifest.json'));
  const targets = loadTargets();

  for (const id of TARGETS) {
    const result = targets.get(id) as TargetResult;

    // At least 2 distinct timestamped nonempty text prefixes before completion.
    const lines = loadStreamLines(id);
    const prefixes = lines.filter(
      (line) =>
        line.kind === 'prefix' && typeof line.text === 'string' && (line.text ?? '').length > 0,
    );
    expect(
      prefixes.length,
      `${id} must record timestamped text-prefix samples in stream.jsonl`,
    ).toBeGreaterThanOrEqual(2);
    const distinctTexts = new Set(prefixes.map((line) => line.text ?? ''));
    expect(distinctTexts.size, `${id} prefixes must be distinct`).toBeGreaterThanOrEqual(2);
    for (const line of prefixes) {
      const ts = Date.parse(line.ts);
      expect(Number.isFinite(ts), `${id} prefix ts must be a real timestamp`).toBe(true);
    }
    expect(result.streaming.distinct_prefix_count).toBe(distinctTexts.size);

    // Contextual follow-up: the answer recalls the first nonce; the latest user
    // message does not repeat it; a prior exchange existed in server history.
    expect(
      result.context.followup_answer_contains_nonce,
      `${id} follow-up answer must contain the exact first nonce`,
    ).toBe(true);
    expect(result.nonce_first.length, `${id} first nonce must be recorded`).toBeGreaterThan(0);
    expect(
      result.context.latest_user_message_nonce_occurrences,
      `${id} latest user message must contain 0 occurrences of the first nonce`,
    ).toBe(0);
    expect(
      result.context.prior_exchange_count,
      `${id} server history must include a prior user/assistant exchange`,
    ).toBeGreaterThanOrEqual(1);

    // Provider correlation: real request + provider response id + model + usage.
    expect(
      result.correlation.completed_request_ids.length,
      `${id} must record completed request ids`,
    ).toBeGreaterThanOrEqual(1);
    expect(
      result.correlation.response_ids.every((rid) => rid.startsWith('resp_')),
      `${id} provider response ids must be OpenAI Responses ids`,
    ).toBe(true);
    expect(result.correlation.model).toBe(PRIMARY_MODEL);
    expect(result.correlation.positive_usage, `${id} usage must be positive`).toBe(true);
    expect(
      result.correlation.text_hashes_recorded.every((h) => /^[0-9a-f]{64}$/.test(h)),
      `${id} server text hashes must be 64-hex digests`,
    ).toBe(true);
    // Completed text hashes match server text hashes (exact raw capture on web).
    if (id.endsWith('-web')) {
      expect(
        result.correlation.web_raw_text_hash_match,
        `${id} captured raw stream text hash must equal the server record hash`,
      ).toBe(true);
    }
    expect(result.api_origin).toBe(manifest.api_origin);
    expect(result.run_id.startsWith(manifest.run_id)).toBe(true);
  }
});

it('ORI-AI-002-AC-2-stop-retry: six targets abort unfinished requests and retry without duplicating the user turn', {
  timeout: 10 * 60_000,
}, async () => {
  await runMatrixOnce();
  const targets = loadTargets();

  for (const id of TARGETS) {
    const result = targets.get(id) as TargetResult;

    // Stop correlated with an active request abort and NO preceding completion.
    expect(
      result.stop_proof.aborted_request_id,
      `${id} must correlate Stop with an aborted provider request`,
    ).not.toBeNull();
    expect(
      result.stop_proof.delta_count_at_abort,
      `${id} aborted request must have streamed deltas before the Stop`,
    ).toBeGreaterThan(0);
    expect(
      result.stop_proof.completed_before_stop,
      `${id} completion-before-Stop must never be presented as abort proof`,
    ).toBe(false);

    // Retry creates a NEW real request + completed provider response while keeping
    // exactly 1 copy of the interrupted user turn.
    const completedRetries = result.retry_after_failure.filter(
      (entry) => entry.new_request_completed && entry.single_user_turn,
    );
    expect(
      completedRetries.length,
      `${id} must have at least one Retry that completes a new real request with exactly 1 retained user turn (observed: ${JSON.stringify(result.retry_after_failure)})`,
    ).toBeGreaterThanOrEqual(1);
    for (const entry of completedRetries) {
      expect(entry.request_id, `${id} retry must name its new request id`).not.toBeNull();
    }
    // The web target proves post-abort recovery IN ONE SESSION: after the Stop, a
    // later request completes on a new request id. (The composed screen exposes its
    // Retry control only on error states — there is no post-Stop Retry control in
    // apps/example's real UI; see the task assumptions.)
    if (id.endsWith('-web')) {
      expect(result.stop_proof.source, `${id} web session must prove the stop itself`).toBe(
        'web-self',
      );
    }
  }
});

it('ORI-AI-002-AC-3-error-recovery: six targets show real endpoint loss and provider rejection, then recover', {
  timeout: 10 * 60_000,
}, async () => {
  await runMatrixOnce();
  const manifest = readJson<Manifest>(join(EVIDENCE, 'manifest.json'));
  const targets = loadTargets();

  for (const id of TARGETS) {
    const result = targets.get(id) as TargetResult;

    // Case 1 — actual endpoint loss, then recovery through a real request.
    expect(
      result.endpoint_loss.visible_error,
      `${id} must show a visible network-failure state`,
    ).toBe(true);
    expect(result.endpoint_loss.sanitized, `${id} endpoint-loss error must be sanitized`).toBe(
      true,
    );
    expect(
      result.endpoint_loss.retry_completed,
      `${id} retry after endpoint loss must complete`,
    ).toBe(true);
    expect(result.endpoint_loss.single_user_turn, `${id} exactly 1 failed user turn retained`).toBe(
      true,
    );

    // Case 2 — actual provider rejection on a nonexistent model, sanitized, then
    // restored-model recovery.
    const rejection = result.provider_rejection;
    expect(rejection.model, `${id} rejection phase must use the rnr-s05-nonexistent model`).toMatch(
      new RegExp(`^rnr-s05-nonexistent-${manifest.run_id}`),
    );
    expect(
      rejection.rejected_request_ids.length,
      `${id} must record actually rejected provider requests`,
    ).toBeGreaterThanOrEqual(1);
    expect(rejection.sanitized, `${id} provider rejection must be sanitized`).toBe(true);
    expect(
      existsSync(join(EVIDENCE, id, rejection.visible_error_screenshot)),
      `${id} must retain the visible provider-error screenshot`,
    ).toBe(true);
    expect(
      rejection.restore_completed_request_ids.length,
      `${id} must record completed requests on the restored primary model`,
    ).toBeGreaterThanOrEqual(1);
    expect(
      existsSync(join(EVIDENCE, id, 'recovered.png')),
      `${id} must retain the recovered state screenshot`,
    ).toBe(true);

    // The web target proves the same-session rejection -> restore -> Retry path.
    if (id === 'uniwind-web' || id === 'nativewind-web') {
      expect(
        result.retry_after_failure.some(
          (entry) =>
            entry.trigger === 'provider-rejection' &&
            entry.new_request_completed &&
            entry.single_user_turn,
        ),
        `${id} web session must recover the provider-rejected turn through Retry`,
      ).toBe(true);
    }
  }

  // No credentials anywhere in the evidence tree.
  const key = process.env.OPENAI_API_KEY ?? '';
  for (const id of TARGETS) {
    const resultJson = readFileSync(join(EVIDENCE, id, 'result.json'), 'utf8');
    expect(
      resultJson.includes('OPENAI_API_KEY'),
      `${id} result.json must not name credentials`,
    ).toBe(false);
    if (key.length > 0) {
      expect(resultJson.includes(key), `${id} result.json must not leak the key value`).toBe(false);
    }
  }
});

it('ORI-AI-002-AC-4-evidence-lifecycle: only complete correlated evidence passes and owned resources are released', {
  timeout: 15 * 60_000,
}, async () => {
  await runMatrixOnce();
  const manifest = readJson<Manifest>(join(EVIDENCE, 'manifest.json'));

  // Case 1 — exactly 6 current-run target records with the full artifact set.
  for (const id of TARGETS) {
    for (const file of TARGET_FILES) {
      const path = join(EVIDENCE, id, file);
      expect(existsSync(path), `${id}/${file} exists`).toBe(true);
      expect(readFileSync(path).length, `${id}/${file} must be nonempty`).toBeGreaterThan(0);
    }
    const recorded = manifest.targets[id]?.artifacts ?? {};
    for (const [file, digest] of Object.entries(recorded)) {
      expect(digest, `${id} ${file} digest is 64-hex`).toMatch(/^[0-9a-f]{64}$/);
      const recomputed = sha256(readFileSync(join(EVIDENCE, id, file)));
      expect(
        digest === recomputed,
        `${id} manifest digest for ${file} must equal the recomputed artifact digest`,
      ).toBe(true);
    }
  }

  // Source/lockfile/registry/driver/policy digests: 64-char and equal to
  // independently recomputed digests of the current tree.
  expect(Object.keys(manifest.source_digests).length).toBeGreaterThanOrEqual(8);
  for (const [file, digest] of Object.entries(manifest.source_digests)) {
    expect(digest, `${file} digest is 64-hex`).toMatch(/^[0-9a-f]{64}$/);
    const recomputed = sha256(readFileSync(join(REPO_ROOT, file)));
    expect(
      digest === recomputed,
      `${file} manifest digest must equal the recomputed source digest`,
    ).toBe(true);
  }

  // Teardown: restored model/appearance, released reservations, 0 owned listeners.
  const teardown = readJson<Teardown>(join(EVIDENCE, 'teardown.json'));
  expect(teardown.run_id).toBe(manifest.run_id);
  expect(teardown.model_restored, 'model restored to the primary pin').toBe(true);
  expect(teardown.final_model).toBe(PRIMARY_MODEL);
  expect(teardown.reservations_released).toBe(true);
  expect(teardown.owned_listeners_remaining, 'no owned listeners remain').toHaveLength(0);
  expect(teardown.adb_reverse_remaining).not.toContain('4000');
  expect(teardown.adb_reverse_remaining).not.toContain('4010');
  for (const restored of teardown.appearances_restored) {
    expect(restored.to, `${restored.platform} appearance restored`).toBe(restored.from);
  }

  // Case 2 — bounded tampered COPIES: each must fail with a diagnostic naming the
  // exact removed target or altered field; the intact copy exits 0. Originals stay
  // untouched.
  const cases: { name: string; tamper: (dir: string) => void; expectInOutput: string }[] = [
    {
      name: 'missing-target',
      tamper: (dir) => rmSync(join(dir, 'uniwind-ios'), { recursive: true, force: true }),
      expectInOutput: 'uniwind-ios',
    },
    {
      name: 'stale-run-id',
      tamper: (dir) => {
        const m = readJson<Manifest>(join(dir, 'manifest.json'));
        m.run_id = 'tampered-run-id';
        writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(m, null, 2)}\n`);
      },
      expectInOutput: 'runId',
    },
    {
      name: 'source-hash-mismatch',
      tamper: (dir) => {
        const m = readJson<Manifest>(join(dir, 'manifest.json'));
        m.source_digests['pnpm-lock.yaml'] = m.source_digests['pnpm-lock.yaml'].replace(/^./, '0');
        writeFileSync(join(dir, 'manifest.json'), `${JSON.stringify(m, null, 2)}\n`);
      },
      expectInOutput: 'pnpm-lock.yaml',
    },
    {
      name: 'engine-identity-mismatch',
      tamper: (dir) => {
        const p = join(dir, 'uniwind-android', 'result.json');
        const r = readJson<TargetResult>(p);
        r.engine = 'nativewind';
        writeFileSync(p, `${JSON.stringify(r, null, 2)}\n`);
      },
      expectInOutput: 'uniwind-android',
    },
    {
      name: 'altered-artifact-byte',
      tamper: (dir) => {
        const p = join(dir, 'nativewind-web', 'streaming.png');
        writeFileSync(p, `${readFileSync(p)}tampered`);
      },
      expectInOutput: 'streaming.png',
    },
  ];

  const caseRoot = join(SCRATCH, 'validate-cases');
  rmSync(caseRoot, { recursive: true, force: true });
  mkdirSync(caseRoot, { recursive: true });
  for (const testCase of cases) {
    const copy = join(caseRoot, testCase.name);
    cpSync(EVIDENCE, copy, { recursive: true });
    testCase.tamper(copy);
    const run = spawnRunner(['--validate', copy, '--expect-run-id', manifest.run_id], 5 * 60_000);
    expect(run.exit, `${testCase.name} must exit nonzero`).not.toBe(0);
    expect(
      run.output.includes(testCase.expectInOutput),
      `${testCase.name} diagnostic must name ${testCase.expectInOutput} (output: ${run.output.slice(-500)})`,
    ).toBe(true);
  }

  const intact = join(caseRoot, 'intact');
  cpSync(EVIDENCE, intact, { recursive: true });
  const intactRun = spawnRunner(
    ['--validate', intact, '--expect-run-id', manifest.run_id],
    5 * 60_000,
  );
  expect(
    intactRun.exit,
    `the intact current-run matrix must validate (output: ${intactRun.output.slice(-800)})`,
  ).toBe(0);
  expect(intactRun.output).toContain('6');
});
