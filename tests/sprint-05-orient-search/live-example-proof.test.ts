/**
 * ORI-AI-002 — the composed worked example proven against the real provider on six
 * live targets (uniwind/nativewind x ios/android/web).
 *
 * Cycle-6 revised proof contract (task Amendments, 2026-09-24): the six-target
 * proof is composed as FRESH PER-ENGINE invocations within one cycle — the runner
 * is invoked once per engine (real drivers, real owned backend, official OpenAI
 * Responses, reserved devices) and partitions each set under
 * evidence/ORI-AI-002/<engine>/. This suite validates the cycle's ACCUMULATED
 * evidence set on disk: both per-engine sets complete and correlated, identical
 * source digests across both manifests (one candidate SHA), every target's real
 * artifacts and provider correlation, and the deterministic tamper-rejection
 * cases through the real validator. It deliberately does NOT spawn a matrix —
 * the seeding invocations must be fresh and current-cycle, and this suite fails
 * closed on absent, stale, mismatched or tampered evidence.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, it } from 'vitest';

const REPO_ROOT = join(__dirname, '..', '..');
const RUNNER = join(REPO_ROOT, 'tests/sprint-05-orient-search/run-live-example-proof.mjs');
const EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-AI-002');
const ENGINE_SET_DIRS = {
  uniwind: join(EVIDENCE_ROOT, 'uniwind'),
  nativewind: join(EVIDENCE_ROOT, 'nativewind'),
} as const;
type EngineId = keyof typeof ENGINE_SET_DIRS;

const SCRATCH = join(REPO_ROOT, '.tmp/ORI-AI-002');

const PRIMARY_MODEL = 'gpt-4.1-mini-2025-04-14';
const RESERVED_IOS_UDID = '81487B1E-A4D1-45AE-9BCE-D675802BACD1';
const RESERVED_ANDROID_SERIAL = 'emulator-5554';
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

/** The manifest digests pin these source files; the suite recomputes them. */
const PINNED_SOURCE_FILES = [
  'apps/example/app/live-chat.tsx',
  'pnpm-lock.yaml',
  'packages/registry/registry.json',
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
  'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
  'tests/sprint-05-orient-search/support/nativewind-live-example.ts',
  'tests/sprint-05-orient-search/support/live-backend.ts',
  'tests/sprint-05-orient-search/support/native-session.ts',
  '.spec/e2e-policy/surface.json',
] as const;

function sha256(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

type RunnerRun = { exit: number; output: string };

function spawnValidator(args: string[], timeoutMs: number): RunnerRun {
  const res = spawnSync(process.execPath, [RUNNER, ...args], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, TMPDIR: '/tmp/ori-ai-002-scratch' },
  });
  return { exit: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/* ------------------------------------------------------------ evidence types -- */

type StreamLine = {
  ts: string;
  kind: 'prefix' | 'dom-sample' | 'final' | 'correlation';
  text?: string;
  texts?: string[];
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
  engines: string[];
  commands: { matrix: string };
  exit_code?: number;
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

/* ------------------------------------------------------- accumulated loader -- */

type EngineSet = {
  engine: EngineId;
  dir: string;
  manifest: Manifest;
  teardown: Teardown;
};

/** The cycle's accumulated evidence set: one complete set per engine. */
function loadEngineSets(): Map<EngineId, EngineSet> {
  const sets = new Map<EngineId, EngineSet>();
  for (const engine of Object.keys(ENGINE_SET_DIRS) as EngineId[]) {
    const dir = ENGINE_SET_DIRS[engine];
    const manifestPath = join(dir, 'manifest.json');
    expect(
      existsSync(manifestPath),
      `${engine} set manifest.json exists (fresh current-cycle seed invocation required)`,
    ).toBe(true);
    const manifest = readJson<Manifest>(manifestPath);
    expect(manifest.task, `${engine} manifest task`).toBe('ORI-AI-002');
    expect(manifest.engines, `${engine} manifest declares exactly its engine`).toEqual([engine]);
    const teardownPath = join(dir, 'teardown.json');
    expect(existsSync(teardownPath), `${engine} teardown.json exists`).toBe(true);
    const teardown = readJson<Teardown>(teardownPath);
    expect(teardown.run_id, `${engine} teardown run identity`).toBe(manifest.run_id);
    sets.set(engine, { engine, dir, manifest, teardown });
  }
  // One candidate SHA binds the whole cycle: identical source digests across
  // every manifest in the set, and both invocations recorded distinct runs.
  const uniwind = sets.get('uniwind');
  const nativewind = sets.get('nativewind');
  if (uniwind === undefined || nativewind === undefined) {
    throw new Error('both per-engine sets must be present');
  }
  expect(
    uniwind.manifest.run_id === nativewind.manifest.run_id,
    'the two engine invocations must be distinct fresh runs',
  ).toBe(false);
  expect(
    JSON.stringify(uniwind.manifest.source_digests),
    'identical source_digests across both manifests (one candidate SHA)',
  ).toBe(JSON.stringify(nativewind.manifest.source_digests));
  expect(
    uniwind.manifest.api_origin === nativewind.manifest.api_origin,
    'identical API origin across both manifests',
  ).toBe(true);
  for (const engine of ['uniwind', 'nativewind'] as const) {
    const set = sets.get(engine);
    if (set === undefined) {
      throw new Error(`${engine} set missing`);
    }
    expect(set.manifest.devices.ios_udid, `${engine} reserved iOS identity`).toBe(
      RESERVED_IOS_UDID,
    );
    expect(set.manifest.devices.android_serial, `${engine} reserved Android identity`).toBe(
      RESERVED_ANDROID_SERIAL,
    );
    expect(set.manifest.commands.matrix, `${engine} command identity`).toContain(
      `--engines ${engine} --platforms ios,android,web`,
    );
  }
  return sets;
}

function setOf(sets: Map<EngineId, EngineSet>, engine: EngineId): EngineSet {
  const set = sets.get(engine);
  if (set === undefined) {
    throw new Error(`${engine} evidence set missing`);
  }
  return set;
}

function targetDirOf(sets: Map<EngineId, EngineSet>, id: TargetId): string {
  return join(ENGINE_SET_DIRS[id.split('-')[0] as EngineId], id);
}

function loadTarget(sets: Map<EngineId, EngineSet>, id: TargetId): TargetResult {
  const dir = targetDirOf(sets, id);
  const path = join(dir, 'result.json');
  expect(existsSync(path), `${id}/result.json exists`).toBe(true);
  const result = readJson<TargetResult>(path);
  expect(result.task).toBe('ORI-AI-002');
  expect(result.engine, `${id} engine identity`).toBe(id.split('-')[0]);
  expect(result.platform, `${id} platform identity`).toBe(id.split('-')[1]);
  expect(
    result.run_id.startsWith(sets.get(id.split('-')[0] as EngineId)!.manifest.run_id),
    `${id} run identity bound to its own invoking run`,
  ).toBe(true);
  return result;
}

function loadStreamLines(sets: Map<EngineId, EngineSet>, id: TargetId): StreamLine[] {
  const path = join(targetDirOf(sets, id), 'stream.jsonl');
  expect(existsSync(path), `${id}/stream.jsonl exists`).toBe(true);
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as StreamLine);
}

/* --------------------------------------------------------------------- tests -- */

it('ORI-AI-002-AC-1-stream-history: six targets stream incrementally and retain context', {
  timeout: 5 * 60_000,
}, () => {
  const sets = loadEngineSets();

  for (const id of TARGETS) {
    const result = loadTarget(sets, id);

    // At least 2 distinct timestamped nonempty text prefixes before completion.
    const lines = loadStreamLines(sets, id);
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
    // Native targets persist every observed prefix (exact equality); the web
    // tee's stream.jsonl keeps a bounded every-3rd sample of the raw prefixes,
    // so its recorded full count can only exceed the sampled file's distinct
    // count.
    if (id.endsWith('-web')) {
      expect(result.streaming.distinct_prefix_count).toBeGreaterThanOrEqual(distinctTexts.size);
    } else {
      expect(result.streaming.distinct_prefix_count).toBe(distinctTexts.size);
    }

    // Contextual follow-up: the answer recalls the first nonce; the latest user
    // message does not repeat it; a prior exchange existed in server history.
    // For native targets the two context oracles are RE-DERIVED from the
    // committed stream's own OCR samples — they must discriminate against the
    // real evidence, not pass on a synthesizer constant:
    //   - recall: an ANSWER-LEAD line (declarative wording the models emit:
    //     "gave me the marker", "identifier you provided", "asked me to
    //     remember") carrying an OCR-tolerant engine-tagged marker fragment —
    //     the user prompt's imperative "Remember the marker" never matches;
    //   - latest user message: the drivers' literal "What marker …" bubble,
    //     OBSERVED in the samples, contains 0 occurrences of the first nonce.
    if (!id.endsWith('-web')) {
      const sampleTexts = lines
        .filter((line) => line.kind === 'dom-sample')
        .map((line) => line.texts ?? []);
      const ANSWER_LEAD =
        /(gave|give) me the marker|asked me to remember|identifier (you )?(provided|is)|with identifier|marker (you|vou) (gave|aave)/i;
      const ENGINE_TAG = /OR[I1l|][^\w]{0,2}RN/i;
      expect(
        sampleTexts.some((texts) =>
          texts.some((text, i) => {
            if (!ANSWER_LEAD.test(text)) return false;
            // The lead and the marker fragment can wrap onto adjacent OCR lines.
            return [texts[i - 1] ?? '', text, texts[i + 1] ?? ''].some((t) => ENGINE_TAG.test(t));
          }),
        ),
        `${id} committed stream must show the follow-up ANSWER rendering the marker (answer-lead + engine tag)`,
      ).toBe(true);
      const domTexts = sampleTexts.flat();
      const bubbles = domTexts.filter((text) => text.startsWith('What marker'));
      expect(
        bubbles.length,
        `${id} committed stream must observe the "What marker …" follow-up user bubble`,
      ).toBeGreaterThanOrEqual(1);
      const fullest = bubbles.sort((a, b) => b.length - a.length)[0] ?? '';
      expect(
        fullest.split(result.nonce_first).length - 1,
        `${id} observed follow-up user bubble must contain 0 occurrences of the first nonce`,
      ).toBe(0);
    }
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
    const set = sets.get(id.split('-')[0] as EngineId)!;
    expect(result.api_origin).toBe(set.manifest.api_origin);
  }
});

it('ORI-AI-002-AC-2-stop-retry: targets abort unfinished requests and retry without duplicating the user turn', {
  timeout: 5 * 60_000,
}, () => {
  const sets = loadEngineSets();

  for (const id of TARGETS) {
    const result = loadTarget(sets, id);

    // The 4 native targets correlate Stop with an aborted provider record for
    // an active unfinished request and no preceding completion. The 2 web
    // targets stop a client-aborted active request (documented proxy
    // semantics: the upstream record lands as a delayed completed response —
    // this orchestrator's proxy propagates the abort, so the web-self session
    // records the aborted request id of its own stopped turn).
    expect(
      result.stop_proof.aborted_request_id,
      `${id} must correlate Stop with the aborted active request`,
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
    // The web targets prove post-abort recovery IN ONE SESSION: after the Stop, a
    // later request completes on a new request id.
    if (id.endsWith('-web')) {
      expect(result.stop_proof.source, `${id} web session must prove the stop itself`).toBe(
        'web-self',
      );
    }
  }
});

it('ORI-AI-002-AC-3-error-recovery: six targets show real endpoint loss and provider rejection, then recover', {
  timeout: 5 * 60_000,
}, () => {
  const sets = loadEngineSets();

  for (const id of TARGETS) {
    const result = loadTarget(sets, id);
    const set = sets.get(id.split('-')[0] as EngineId)!;

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
      new RegExp(`^rnr-s05-nonexistent-${set.manifest.run_id}`),
    );
    expect(
      rejection.rejected_request_ids.length,
      `${id} must record actually rejected provider requests`,
    ).toBeGreaterThanOrEqual(1);
    expect(rejection.sanitized, `${id} provider rejection must be sanitized`).toBe(true);
    expect(
      existsSync(join(targetDirOf(sets, id), rejection.visible_error_screenshot)),
      `${id} must retain the visible provider-error screenshot`,
    ).toBe(true);
    expect(
      rejection.restore_completed_request_ids.length,
      `${id} must record completed requests on the restored primary model`,
    ).toBeGreaterThanOrEqual(1);
    expect(
      existsSync(join(targetDirOf(sets, id), 'recovered.png')),
      `${id} must retain the recovered state screenshot`,
    ).toBe(true);

    // The web targets prove the same-session rejection -> restore -> Retry path.
    if (id.endsWith('-web')) {
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

  // No credentials anywhere in either engine's evidence tree.
  const key = process.env.OPENAI_API_KEY ?? '';
  for (const id of TARGETS) {
    const resultJson = readFileSync(join(targetDirOf(sets, id), 'result.json'), 'utf8');
    expect(
      resultJson.includes('OPENAI_API_KEY'),
      `${id} result.json must not name credentials`,
    ).toBe(false);
    if (key.length > 0) {
      expect(resultJson.includes(key), `${id} result.json must not leak the key value`).toBe(false);
    }
  }
});

/* ---------------------------------------------------- AC-4 helper functions -- */

/** Case 1: the union's 6 target records, each complete and digest-pinned. */
function assertUnionArtifacts(sets: Map<EngineId, EngineSet>): void {
  for (const id of TARGETS) {
    for (const file of TARGET_FILES) {
      const path = join(targetDirOf(sets, id), file);
      expect(existsSync(path), `${id}/${file} exists`).toBe(true);
      expect(readFileSync(path).length, `${id}/${file} must be nonempty`).toBeGreaterThan(0);
    }
    const set = setOf(sets, id.split('-')[0] as EngineId);
    const recorded = set.manifest.targets[id]?.artifacts ?? {};
    for (const [file, digest] of Object.entries(recorded)) {
      expect(digest, `${id} ${file} digest is 64-hex`).toMatch(/^[0-9a-f]{64}$/);
      const recomputed = sha256(readFileSync(join(targetDirOf(sets, id), file)));
      expect(
        digest === recomputed,
        `${id} manifest digest for ${file} must equal the recomputed artifact digest`,
      ).toBe(true);
    }
  }
}

/** Per-engine set identity: pinned source digests equal the tree, exit 0, clean teardown. */
function assertEngineSetIntegrity(sets: Map<EngineId, EngineSet>, engine: EngineId): void {
  const set = setOf(sets, engine);
  const sourceDigests = set.manifest.source_digests;
  expect(Object.keys(sourceDigests).length).toBeGreaterThanOrEqual(PINNED_SOURCE_FILES.length);
  for (const file of PINNED_SOURCE_FILES) {
    expect(sourceDigests[file], `${engine} pins ${file}`).toMatch(/^[0-9a-f]{64}$/);
    expect(
      sourceDigests[file] === sha256(readFileSync(join(REPO_ROOT, file))),
      `${engine} ${file} manifest digest must equal the recomputed source digest`,
    ).toBe(true);
  }
  expect(set.manifest.exit_code, `${engine} invocation recorded its own exit code`).toBe(0);
  const teardown = set.teardown;
  expect(teardown.model_restored, `${engine} model restored to the primary pin`).toBe(true);
  expect(teardown.final_model).toBe(PRIMARY_MODEL);
  expect(teardown.reservations_released, `${engine} reservations released`).toBe(true);
  expect(teardown.owned_listeners_remaining, `${engine} no owned listeners remain`).toHaveLength(0);
  expect(
    teardown.adb_reverse_remaining,
    `${engine} no backend reverse mapping remains`,
  ).not.toContain(String(engine === 'uniwind' ? 4000 : 4010));
  for (const restored of teardown.appearances_restored) {
    expect(restored.to, `${engine} ${restored.platform} appearance restored`).toBe(restored.from);
  }
}

/** Case 2: bounded tampered copies of the real uniwind set — each rejection
 * names the exact removed target or altered field through the real validator. */
function assertTamperRejections(sets: Map<EngineId, EngineSet>): string {
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
        const p = join(dir, 'uniwind-web', 'streaming.png');
        writeFileSync(p, `${readFileSync(p)}tampered`);
      },
      expectInOutput: 'streaming.png',
    },
  ];
  const caseRoot = join(SCRATCH, 'cycle-6', 'validate-cases');
  rmSync(caseRoot, { recursive: true, force: true });
  mkdirSync(caseRoot, { recursive: true });
  for (const testCase of cases) {
    const copy = join(caseRoot, testCase.name);
    cpSync(ENGINE_SET_DIRS.uniwind, copy, { recursive: true });
    testCase.tamper(copy);
    const run = spawnValidator(
      ['--validate', copy, '--expect-run-id', setOf(sets, 'uniwind').manifest.run_id],
      5 * 60_000,
    );
    expect(run.exit, `${testCase.name} must exit nonzero`).not.toBe(0);
    expect(
      run.output.includes(testCase.expectInOutput),
      `${testCase.name} diagnostic must name ${testCase.expectInOutput} (output: ${run.output.slice(-500)})`,
    ).toBe(true);
  }
  return caseRoot;
}

/** Each intact per-engine set validates through the real validator; the
 * accumulated cycle set carries exactly 6 accepted target records. */
function assertIntactSetsValidate(sets: Map<EngineId, EngineSet>, caseRoot: string): void {
  for (const engine of ['uniwind', 'nativewind'] as const) {
    const set = setOf(sets, engine);
    const intact = join(caseRoot, `intact-${engine}`);
    cpSync(ENGINE_SET_DIRS[engine], intact, { recursive: true });
    const intactRun = spawnValidator(
      ['--validate', intact, '--expect-run-id', set.manifest.run_id],
      5 * 60_000,
    );
    expect(
      intactRun.exit,
      `the intact ${engine} set must validate (output: ${intactRun.output.slice(-800)})`,
    ).toBe(0);
    expect(intactRun.output).toContain('3 accepted target records');
    const onDisk = spawnValidator(
      ['--validate', ENGINE_SET_DIRS[engine], '--expect-run-id', set.manifest.run_id],
      5 * 60_000,
    );
    expect(onDisk.exit, `the on-disk ${engine} set must validate`).toBe(0);
    expect(
      Object.keys(set.manifest.targets).sort(),
      `${engine} manifest carries exactly its 3 targets`,
    ).toEqual([`${engine}-ios`, `${engine}-android`, `${engine}-web`].sort());
  }
  const union = [...TARGETS].filter((id) => existsSync(join(targetDirOf(sets, id), 'result.json')));
  expect(union.length, 'the accumulated cycle set carries exactly 6 targets').toBe(6);
  expect(union.sort()).toEqual([...TARGETS].sort());
}

it('ORI-AI-002-AC-4-evidence-lifecycle: only complete correlated evidence passes and owned resources are released', {
  timeout: 15 * 60_000,
}, () => {
  const sets = loadEngineSets();
  assertUnionArtifacts(sets);
  for (const engine of ['uniwind', 'nativewind'] as const) {
    assertEngineSetIntegrity(sets, engine);
  }
  const caseRoot = assertTamperRejections(sets);
  assertIntactSetsValidate(sets, caseRoot);
});
