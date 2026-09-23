/**
 * FIX-ORI-AI-002-1 — the NativeWind baseline-ordering proof harness.
 *
 * Reproduces ORI-AI-002's exact invocation shape at this task's dependency
 * position — a caller-created owned-backend handle over the REAL server, the REAL
 * `runNativewindLiveExampleProof` through the repository tsx runtime, engine
 * nativewind, platforms ['ios'], a fresh run identity, a bounded task-owned
 * output directory, an explicit watchdog — and proves the records-baseline
 * ordering defect pre-fix and its absence post-fix:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts
 *   pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web
 *
 * Why the caller backend is served IN-PROCESS by the mini-runner child: the
 * driver reaps identity-verified orphans on its backend port (4010) BEFORE
 * honoring `options.backend`, and a `launchOwnedBackend`-spawned server child
 * carries `server/index.ts` on its command line — the driver's own reap marker —
 * so a spawned caller backend is killed before the first leg. ORI-AI-002's
 * committed runner solved this with a dedicated owner process whose command line
 * does not match the heuristic; this harness's mini-runner child serves the same
 * REAL server module (`createChatServer` from apps/example/server) in-process,
 * so the 4010 listener IS the child and survives the reap. Real server code,
 * real OpenAI Responses traffic, real records — no mocked backend anywhere.
 *
 * Outcome classification (the invocation is IDENTICAL in RED and GREEN):
 *  - both iOS appearance legs 'passed' + source inspection clean -> GREEN
 *    (green.json, exit 0);
 *  - an iOS leg fails `marker turn ended as no terminal record` WHILE the same
 *    run's records contain the marker turn's completed record (the leg's own
 *    flow.log observed dump and/or provider-correlation.json) -> the pre-fix
 *    defect signature (red.json, exit 1);
 *  - legs pass but the source still captures a conversational baseline after
 *    its issuing flow (the live race did not reproduce in the window) -> the
 *    recorded in-vitro fallback: the REAL predicates (additively exported) are
 *    driven with a controlled records seam under both baseline orderings and
 *    the divergence is recorded (red.json, mode in-vitro-fallback, exit 1);
 *  - any other failure -> a plain failure record in run.json, no red/green
 *    claim (a different defect — the task's Ask First boundary).
 *
 * --matrix ios,android,web: the driver's exact canonical three-platform CLI
 * invocation as a child under an outer watchdog; asserts exit 0, completed ==
 * true, every leg 'passed', and the manifest run_id bound to the child's own
 * reported run identity. Refreshes evidence/ORI-RN-005/ in place as the
 * driver's own side effects.
 *
 * Real services only for the live lanes: real Expo Go on the reserved iOS
 * simulator, real maestro flows, real Metro/consumer build, the real backend
 * server, real OpenAI Responses (gpt-4.1-mini-2025-04-14). The controlled
 * records seam exists ONLY in the unit-justified in-vitro fallback lane over
 * the real predicate code and never replaces the live lane.
 */
import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { Server } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadServerEnv } from '../../apps/example/server/env';
import {
  type BackendLaunchOptions,
  type BackendRecord,
  DEFAULT_MODEL,
  type OwnedBackendHandle,
} from './support/live-backend';
import {
  awaitTerminalRecord,
  runNativewindLiveExampleProof,
  sampleAssistantTextGrowth,
} from './support/nativewind-live-example';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const TASK_TMP = join(REPO_ROOT, '.tmp', 'FIX-ORI-AI-002-1');
const DRIVER_PATH = join(HERE, 'support', 'nativewind-live-example.ts');
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const HARNESS_SELF = join(HERE, 'nativewind-baseline-ordering-proof.test.ts');

/** Mirrors the driver's BACKEND_PORT (its owned port — the app talks to 4010). */
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4010;

/** Charter watchdog budget for the ios-only harness run (two iOS appearance legs). */
const WATCHDOG_IOS_MS = 3_600_000;
/**
 * Matrix watchdog: two native appearances per platform plus the web export; the
 * sibling harness's budget formula for the same-shaped matrix was the per-leg
 * budget sum plus 50% (~8460 s). This driver has no single per-leg budget cap,
 * so a flat 3 h outer bound is used and recorded.
 */
const WATCHDOG_MATRIX_MS = 10_800_000;

/** The literal record-line prefix live-backend.ts parses from the server child. */
const RECORD_PREFIX = 'ORI_AI_001_RECORD ';

/** Graceful backend close bound — must stay under the driver's 120s backend-op bound. */
const GRACEFUL_CLOSE_BOUND_MS = 55_000;

/** In-vitro lane: how long a post-send baseline burns before returning null. */
const IN_VITRO_TIMEOUT_MS = 3_000;

const LITERAL_SELECTOR =
  'pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts';
const LITERAL_MATRIX_SELECTOR =
  'pnpm exec tsx tests/sprint-05-orient-search/nativewind-baseline-ordering-proof.test.ts --matrix ios,android,web';

type Platform = 'ios' | 'android' | 'web';

type ManifestLeg = {
  platform: string;
  status: string;
  diagnostic?: string;
  evidence?: Record<string, unknown>;
};

type RunManifest = {
  run_id: string;
  completed: boolean;
  passed_platforms: number;
  legs: ManifestLeg[];
};

type ChildRunConfig = {
  runId: string;
  outputDir: string;
  heartbeatPath: string;
};

type ChildResult = {
  run_id: string;
  options_backend_not_null: boolean;
  platforms: Platform[];
  legs: { platform: string; status: string; diagnostic: string | null; growth: number[] | null }[];
  all_legs_passed: boolean;
  manifest_path: string;
  provider_correlation_path: string;
  error?: string;
};

export type ProofOutcome = {
  ok: boolean;
  kind: 'green' | 'red-live' | 'red-in-vitro' | 'failure' | 'matrix';
  run_id: string;
  detail: string;
};

/* --------------------------------------------------------------- utilities -- */

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function gitHeadSha(): string {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : `unknown (${res.stderr.trim().slice(0, 120)})`;
}

function bounded(text: string, chars = 2000): string {
  return text.length > chars ? `...${text.slice(-chars)}` : text;
}

/** Direct children of a pid (pgrep), best-effort. */
function childPidsOf(pid: number): number[] {
  const res = spawnSync('pgrep', ['-P', String(pid)], { encoding: 'utf8' });
  if (res.status !== 0 || res.stdout.trim() === '') return [];
  return res.stdout
    .trim()
    .split('\n')
    .map((line) => Number(line))
    .filter((n) => Number.isFinite(n));
}

/** All descendant pids of `pid` (excluding `pid`), depth-first. */
function descendantPids(pid: number): number[] {
  const out: number[] = [];
  const walk = (current: number): void => {
    for (const child of childPidsOf(current)) {
      out.push(child);
      walk(child);
    }
  };
  walk(pid);
  return out;
}

function killTree(pid: number): void {
  for (const descendant of descendantPids(pid)) {
    try {
      process.kill(descendant, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    /* already gone */
  }
}

function portListener(port: number): { free: boolean; info: string } {
  const pids = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN'], {
    encoding: 'utf8',
    timeout: 15_000,
  });
  const out = `${pids.stdout ?? ''}${pids.stderr ?? ''}`.trim();
  return { free: out === '', info: out };
}

function appendRunRecord(record: Record<string, unknown>): void {
  mkdirSync(TASK_TMP, { recursive: true });
  appendFileSync(
    join(TASK_TMP, 'run.json'),
    `${JSON.stringify({ ...record, candidate_head_sha: gitHeadSha(), ts: new Date().toISOString() })}\n`,
  );
}

/* ---------------------------------------------------------- prerequisites -- */

/**
 * Expo Go prerequisite, matching the driver's own fail-closed check exactly:
 * installExpoGoIos/installExpoGoAndroid throw on a MISSING FILE before they
 * check installation, so both pinned caches must exist on disk even for an
 * ios-only invocation. The pinned APK restores from the official
 * expo/expo-go-releases GitHub release (tag Expo-Go-57.0.9) — ORI-RN-005's
 * evidence README documents that exact path.
 */
function expoGoCachesReady(): { ok: boolean; problems: string[] } {
  const problems: string[] = [];
  const iosApp = join(
    process.env.HOME ?? '',
    '.expo',
    'ios-simulator-app-cache',
    'Expo-Go-57.0.9.tar.app',
  );
  if (!existsSync(iosApp)) problems.push(`Expo Go iOS client missing at ${iosApp}`);
  const apk = join(
    process.env.HOME ?? '',
    '.cache',
    'agent-scratch',
    'opencode',
    'ori-rn-003',
    'Expo-Go-57.0.9.apk',
  );
  if (!existsSync(apk)) {
    problems.push(
      `pinned Expo Go APK missing at ${apk} (restore from the expo/expo-go-releases GitHub release, tag Expo-Go-57.0.9)`,
    );
  }
  return { ok: problems.length === 0, problems };
}

/**
 * Fail-closed prerequisite check. The shared reserveDevices (imported by the
 * driver) throws when either reserved-device variable is missing — even for an
 * ios-only invocation — so both are required here too.
 */
function checkPrerequisites(): string[] {
  const problems: string[] = [];
  if (!process.env.RNR_S05_IOS_UDID) problems.push('RNR_S05_IOS_UDID is not set');
  if (!process.env.RNR_S05_ANDROID_SERIAL) problems.push('RNR_S05_ANDROID_SERIAL is not set');
  if (!process.env.OPENAI_API_KEY) problems.push('OPENAI_API_KEY is not set');
  const caches = expoGoCachesReady();
  problems.push(...caches.problems);
  const listener = portListener(BACKEND_PORT);
  if (!listener.free) {
    problems.push(
      `port ${BACKEND_PORT} already has a listener — clear it before relaunching:\n${listener.info}`,
    );
  }
  return problems;
}

/** The minimal explicit child env (ORI-AI-002's finding: inherited shell envs poison children). */
function minimalChildEnv(): NodeJS.ProcessEnv {
  return {
    PATH: process.env.PATH ?? '',
    HOME: process.env.HOME ?? '',
    TMPDIR: process.env.TMPDIR ?? '/tmp',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    RNR_S05_IOS_UDID: process.env.RNR_S05_IOS_UDID ?? '',
    RNR_S05_ANDROID_SERIAL: process.env.RNR_S05_ANDROID_SERIAL ?? '',
  };
}

/* ------------------------------------------------------- source inspection -- */

export type SourceInspection = {
  clean: boolean;
  pre_flow_conversational_captures: number;
  checks: { name: string; ok: boolean; detail: string }[];
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Literal-count source inspection (AC-1 must_observe): exactly 6 conversational
 * baseline captures sit before their issuing flows — the 3 iOS pairs (marker,
 * seed, follow-up) and all 3 Retry recoveries (the iOS handleTerminal baseline
 * plus the 2 Android retry baselines); 0 await-time captures remain in
 * awaitTurn; the already-correct captures (Android runTurn send baseline, both
 * stop-turn drive baselines) stay in place; and the literal
 * `records.length > baseline` guard stays intact inside both predicates.
 */
// fallow-ignore-next-line complexity
export function inspectDriverSource(): SourceInspection {
  const src = readFileSync(DRIVER_PATH, 'utf8');
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  const add = (name: string, ok: boolean, detail = ''): void => {
    checks.push({ name, ok, detail });
  };

  const awaitTurnStart = src.indexOf('const awaitTurn = async (');
  const handleTerminalStart = src.indexOf('const handleTerminal = async (');
  const hasAwaitTurnRegions = awaitTurnStart >= 0 && handleTerminalStart > awaitTurnStart;
  const awaitTurnRegion = hasAwaitTurnRegions ? src.slice(awaitTurnStart, handleTerminalStart) : '';
  add(
    'awaitTurn has no await-time records().length capture',
    hasAwaitTurnRegions && !awaitTurnRegion.includes('records().length'),
    hasAwaitTurnRegions ? '' : 'awaitTurn/handleTerminal regions not found',
  );
  add('awaitTurn receives the baseline argument', awaitTurnRegion.includes('baseline: number,'));

  const conversational = [
    { label: 'marker', send: "sendTurn('marker', marker);", sample: 'false' },
    { label: 'seed', send: "sendTurn('seed', seedPrompt);", sample: 'true' },
    { label: 'follow-up', send: "sendTurn('follow-up', followUp);", sample: 'false' },
  ];
  let iosPairs = 0;
  for (const turn of conversational) {
    const capturedBeforeSend = new RegExp(
      `const \\w+ = session\\.current\\.records\\(\\)\\.length;\\s*(?:let )?turn = await ${escapeRegExp(turn.send)}`,
    ).test(src);
    const baselineArg = new RegExp(
      `turn = await awaitTurn\\('${turn.label}', ${turn.sample}, \\w+\\);`,
    ).test(src);
    if (capturedBeforeSend && baselineArg) iosPairs += 1;
    add(
      `iOS ${turn.label} baseline captured before sendTurn and passed to awaitTurn`,
      capturedBeforeSend && baselineArg,
      `capture-before-send=${capturedBeforeSend} baseline-arg=${baselineArg}`,
    );
  }

  const iosRetry =
    /const retryBaseline = session\.current\.records\(\)\.length;\s*if \(!dismissThenTap\(deviceId, 'Retry'\)\)/.test(
      src,
    );
  add('iOS handleTerminal retry baseline captured before the Retry tap', iosRetry);

  const androidRetryMatches =
    src.match(
      /const retryBaseline = session\.current\.records\(\)\.length;\s*if \(!dismissThenTap\(serial, 'Retry'\)\)/g,
    ) ?? [];
  add(
    'both Android retry baselines captured before their Retry tap',
    androidRetryMatches.length === 2,
    `matches=${androidRetryMatches.length} (need exactly 2)`,
  );

  const androidSendBaseline =
    /const baseline = session\.current\.records\(\)\.length;\s*if \(!dismissThenTap\(serial, 'Send message'\)\)/.test(
      src,
    );
  add('Android runTurn send baseline still captured before the send tap', androidSendBaseline);

  const androidStopBaseline =
    /const baseline = session\.current\.records\(\)\.length;\s*\/\/ HOT PATH/.test(src);
  const iosStopBaseline =
    /const baseline = session\.current\.records\(\)\.length;\s*const stopFlow = runOneOffMaestroFlow/.test(
      src,
    );
  add(
    'both stop-turn drive baselines still precede their flows',
    androidStopBaseline && iosStopBaseline,
    `android=${androidStopBaseline} ios=${iosStopBaseline}`,
  );

  const termStart = src.indexOf('export async function awaitTerminalRecord');
  const samplerStart = src.indexOf('export async function sampleAssistantTextGrowth');
  const lengthsStart = src.indexOf('function currentTextLengths');
  const terminalRegion =
    termStart >= 0 && samplerStart > termStart ? src.slice(termStart, samplerStart) : '';
  const samplerRegion =
    samplerStart >= 0 && lengthsStart > samplerStart ? src.slice(samplerStart, lengthsStart) : '';
  add(
    'terminal predicate keeps the records.length > baseline guard',
    terminalRegion !== '' && terminalRegion.includes('if (records.length > baseline) {'),
  );
  add(
    'growth sampler keeps its records.length > baseline guard',
    samplerRegion !== '' &&
      samplerRegion.includes('records.length > baseline ? records[records.length - 1] : null'),
  );

  const preFlow = iosPairs + (iosRetry ? 1 : 0) + androidRetryMatches.length;
  return { clean: checks.every((c) => c.ok), pre_flow_conversational_captures: preFlow, checks };
}

/* ---------------------------------------------------------- in-vitro lane -- */

function seamRecord(requestId: string, outcome: BackendRecord['outcome']): BackendRecord {
  return {
    requestId,
    provider: 'openai',
    providerModel: DEFAULT_MODEL,
    responseId: null,
    callId: null,
    outcome,
    deltaCount: outcome === 'completed' ? 12 : 0,
    inputTokens: 10,
    outputTokens: outcome === 'completed' ? 12 : undefined,
    totalTokens: 22,
    textHash: `seam-${requestId}`,
    durationMs: 1700,
    errorText: outcome === 'error' ? 'seam scripted error' : null,
    activeGenerations: 0,
  };
}

/**
 * The controlled records seam for the unit-justified in-vitro fallback lane:
 * drives the REAL exported predicates (awaitTerminalRecord /
 * sampleAssistantTextGrowth) with a scripted records timeline under both
 * baseline orderings. Pure data — zero I/O — and never a substitute for the
 * live lane (the harness records the live divergence explicitly when used).
 */
class SeamBackend implements OwnedBackendHandle {
  readonly launchIdentity = `fix-ori-ai-002-1-seam-${Date.now()}`;
  readonly origin = 'in-vitro-controlled-records-seam';
  readonly host = BACKEND_HOST;
  readonly port = BACKEND_PORT;
  readonly model = DEFAULT_MODEL;
  private items: BackendRecord[] = [
    seamRecord('seam-pre-1', 'completed'),
    seamRecord('seam-pre-2', 'error'),
  ];
  private revealed = false;

  get pid(): number | null {
    return null;
  }
  get started(): boolean {
    return true;
  }
  get exitCode(): number | null {
    return null;
  }
  get exitSignal(): string | null {
    return null;
  }
  stderrText(): string {
    return '(in-vitro seam)';
  }
  stdoutText(): string {
    return '(in-vitro seam)';
  }
  records(): BackendRecord[] {
    return [...this.items];
  }
  /** The provider record completing DURING the send window (the race condition). */
  reveal(): void {
    if (this.revealed) return;
    this.revealed = true;
    this.items.push(seamRecord('seam-marker', 'completed'));
  }
  async waitForRecord(_requestId: string, _timeoutMs: number): Promise<BackendRecord | null> {
    return null;
  }
  async stop(): Promise<void> {}
  async restart(_options?: BackendLaunchOptions): Promise<OwnedBackendHandle> {
    return this;
  }
  async selectModel(_model: string): Promise<OwnedBackendHandle> {
    return this;
  }
}

export type InVitroDivergence = {
  pre_send: { terminal_record: string; growth_terminal: string };
  post_send: { terminal_record: string; growth_terminal: string };
  divergence_proven: boolean;
  device_id: string;
};

/**
 * The recorded in-vitro fallback: a post-send baseline cannot see a record that
 * landed during the send; a pre-send baseline returns its outcome immediately.
 */
export async function runInVitroLane(deviceId: string): Promise<InVitroDivergence> {
  // Pre-send ordering (the fix): baseline captured before the send window.
  const preSendSeam = new SeamBackend();
  const preBaseline = preSendSeam.records().length;
  await sleep(50); // the send flow's window — the record completes inside it
  preSendSeam.reveal();
  const preTerminal = await awaitTerminalRecord(preSendSeam, preBaseline, IN_VITRO_TIMEOUT_MS);
  const preGrowth = await sampleAssistantTextGrowth(
    deviceId,
    preSendSeam,
    preBaseline,
    IN_VITRO_TIMEOUT_MS,
  );

  // Post-send ordering (the defect): baseline captured at await time, after the
  // record already landed during the send window.
  const postSendSeam = new SeamBackend();
  await sleep(50);
  postSendSeam.reveal();
  const postBaseline = postSendSeam.records().length;
  const postTerminal = await awaitTerminalRecord(postSendSeam, postBaseline, IN_VITRO_TIMEOUT_MS);
  const postGrowth = await sampleAssistantTextGrowth(
    deviceId,
    postSendSeam,
    postBaseline,
    IN_VITRO_TIMEOUT_MS,
  );

  const asText = (value: string | null): string => value ?? 'null (no terminal record)';
  return {
    pre_send: {
      terminal_record: asText(preTerminal),
      growth_terminal: asText(preGrowth.terminal),
    },
    post_send: {
      terminal_record: asText(postTerminal),
      growth_terminal: asText(postGrowth.terminal),
    },
    divergence_proven: preTerminal === 'completed' && postTerminal === null,
    device_id: deviceId,
  };
}

/* ------------------------------------- in-process owned backend (mini-runner) -- */

let currentGenerationRecords: BackendRecord[] = [];
let heartbeatPath = '';
let lastHeartbeatAt = 0;

function heartbeat(detail: string): void {
  if (heartbeatPath === '') return;
  const now = Date.now();
  if (now - lastHeartbeatAt < 5_000) return;
  lastHeartbeatAt = now;
  appendFileSync(heartbeatPath, `${JSON.stringify({ ts: new Date().toISOString(), detail })}\n`);
}

const capturedStdout: string[] = [];
const capturedStderr: string[] = [];

/**
 * Tee's the server's stdout RECORD lines into the current generation's records
 * array (the literal prefix live-backend.ts parses on its spawned child) while
 * passing every byte through to the real stdout.
 */
function installStdoutTee(): void {
  const originalWrite = process.stdout.write.bind(process.stdout);
  const write = (
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((error?: Error | null) => void),
    cb?: (error?: Error | null) => void,
  ): boolean => {
    const text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    capturedStdout.push(text);
    if (capturedStdout.length > 400) capturedStdout.shift();
    for (const line of text.split('\n')) {
      if (line.startsWith(RECORD_PREFIX)) {
        try {
          currentGenerationRecords.push(
            JSON.parse(line.slice(RECORD_PREFIX.length)) as BackendRecord,
          );
        } catch {
          // partial line — dropped, never fabricated
        }
      }
    }
    if (typeof encoding === 'function') return originalWrite(chunk, encoding);
    return cb === undefined
      ? originalWrite(chunk, encoding as BufferEncoding)
      : originalWrite(chunk, encoding as BufferEncoding, cb);
  };
  process.stdout.write = write as typeof process.stdout.write;

  const originalErrWrite = process.stderr.write.bind(process.stderr);
  const errWrite = (
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((error?: Error | null) => void),
    cb?: (error?: Error | null) => void,
  ): boolean => {
    const text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8');
    capturedStderr.push(text);
    if (capturedStderr.length > 400) capturedStderr.shift();
    if (typeof encoding === 'function') return originalErrWrite(chunk, encoding);
    return cb === undefined
      ? originalErrWrite(chunk, encoding as BufferEncoding)
      : originalErrWrite(chunk, encoding as BufferEncoding, cb);
  };
  process.stderr.write = errWrite as typeof process.stderr.write;
}

/** Graceful, bounded close (server.close lets SSE responses finish; force under bound). */
function closeGracefully(closing: Server): Promise<void> {
  return new Promise((resolveClose) => {
    let settled = false;
    const finish = (): void => {
      if (settled) return;
      settled = true;
      clearTimeout(forceTimer);
      resolveClose();
    };
    const forceTimer = setTimeout(() => {
      closing.closeAllConnections();
      finish();
    }, GRACEFUL_CLOSE_BOUND_MS);
    closing.close(() => finish());
  });
}

type ServerModule = typeof import('../../apps/example/server/index');

/**
 * Loads the REAL server module with its unguarded import-time `main()` neutered:
 * apps/example/server/index.ts calls main() at module scope, so the credential
 * is hidden for the duration of the dynamic import — loadServerEnv fails, main()
 * returns without listening, and the exitCode it set is cleared. The credential
 * is restored before the first serve().
 */
async function loadServerModule(): Promise<ServerModule> {
  const key = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    return await import('../../apps/example/server/index');
  } finally {
    if (key !== undefined) process.env.OPENAI_API_KEY = key;
    process.exitCode = 0; // main()'s import-time failure path set 1
  }
}

/**
 * The OwnedBackendHandle the mini-runner passes as `options.backend`: the REAL
 * server (createChatServer from apps/example/server — the exact module
 * server/index.ts runs) hosted IN-PROCESS so the driver's entry-reap heuristic
 * does not match the listener. Record lines the server writes to stdout are
 * tee'd into the current generation's array — the same parsing live-backend.ts
 * performs on its spawned child. restart() re-serves and returns a NEW handle
 * with a fresh array (BackendSession flatMaps generations for allRecords).
 */
class InProcessOwnedBackend implements OwnedBackendHandle {
  readonly launchIdentity =
    `fix-ori-ai-002-1-owner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  readonly origin = 'in-process:createChatServer(apps/example/server)';
  readonly host = BACKEND_HOST;
  readonly port = BACKEND_PORT;
  readonly model: string;
  private readonly generation: BackendRecord[];
  private readonly serverModule: ServerModule;
  private server: Server | null = null;
  private startedFlag = false;

  constructor(model: string, generation: BackendRecord[], serverModule: ServerModule) {
    this.model = model;
    this.generation = generation;
    this.serverModule = serverModule;
  }

  get pid(): number | null {
    return process.pid;
  }
  get started(): boolean {
    return this.startedFlag;
  }
  get exitCode(): number | null {
    return null;
  }
  get exitSignal(): string | null {
    return null;
  }
  stderrText(): string {
    return bounded(capturedStderr.join(''), 4000);
  }
  stdoutText(): string {
    return bounded(capturedStdout.join(''), 4000);
  }
  records(): BackendRecord[] {
    heartbeat(`records n=${this.generation.length}`);
    return [...this.generation];
  }
  async waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = this.generation.find((record) => record.requestId === requestId);
      if (found) return found;
      await sleep(200);
    }
    return null;
  }
  async stop(): Promise<void> {
    const server = this.server;
    if (server === null) return;
    this.server = null;
    this.startedFlag = false;
    await closeGracefully(server);
  }
  async restart(options: BackendLaunchOptions = {}): Promise<OwnedBackendHandle> {
    await this.stop();
    const next = new InProcessOwnedBackend(options.model ?? this.model, [], this.serverModule);
    await next.serve();
    return next;
  }
  async selectModel(model: string): Promise<OwnedBackendHandle> {
    return await this.restart({ model });
  }

  /** Serves the real server on the owned port; resolves once listening. */
  async serve(): Promise<void> {
    process.env.EXAMPLE_CHAT_MODEL = this.model;
    process.env.EXAMPLE_CHAT_HOST = BACKEND_HOST;
    process.env.EXAMPLE_CHAT_PORT = String(BACKEND_PORT);
    process.env.EXAMPLE_CHAT_WEB_ORIGIN = 'http://localhost:8081';
    // The fixture's proven value: a higher cap widens the Stop-control window
    // (16384 versus the driver's 4096 default).
    process.env.EXAMPLE_CHAT_MAX_OUTPUT_TOKENS = '16384';
    const loaded = loadServerEnv(process.env);
    if (!loaded.ok) {
      throw new Error(`in-process backend env rejected: ${loaded.diagnostic}`);
    }
    const server = this.serverModule.createChatServer(loaded.config);
    await new Promise<void>((resolveListen, rejectListen) => {
      server.once('error', (error: Error) => {
        this.startedFlag = false;
        rejectListen(error);
      });
      server.listen(BACKEND_PORT, BACKEND_HOST, () => {
        this.startedFlag = true;
        resolveListen();
      });
    });
    this.server = server;
    currentGenerationRecords = this.generation;
  }

  /** Harness teardown: stop the current server if still open. */
  async dispose(): Promise<void> {
    await this.stop();
  }
}

/* ------------------------------------------------- mini-runner child mode -- */

// fallow-ignore-next-line complexity
async function childRun(configPath: string): Promise<void> {
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as ChildRunConfig;
  mkdirSync(config.outputDir, { recursive: true });
  heartbeatPath = config.heartbeatPath;
  writeFileSync(heartbeatPath, '');
  installStdoutTee();
  heartbeat('child-start');

  let backend: InProcessOwnedBackend | null = null;
  let exitCode = 0;
  try {
    const serverModule = await loadServerModule();
    backend = new InProcessOwnedBackend(DEFAULT_MODEL, [], serverModule);
    await backend.serve();
    writeFileSync(
      join(config.outputDir, 'owner.json'),
      `${JSON.stringify({ harness_child_pid: process.pid, backend: 'in-process:createChatServer', port: BACKEND_PORT })}\n`,
    );
    heartbeat('backend-listening');

    const proof = await runNativewindLiveExampleProof({
      engine: 'nativewind',
      platforms: ['ios'],
      runId: config.runId,
      backend,
      outputDir: config.outputDir,
    });
    heartbeat('driver-returned');

    const legs = proof.legs.map((leg) => ({
      platform: leg.platform,
      status: leg.status,
      diagnostic: leg.diagnostic ? bounded(leg.diagnostic, 3000) : null,
      growth: Array.isArray(leg.evidence?.assistant_text_growth)
        ? (leg.evidence?.assistant_text_growth as number[])
        : null,
    }));
    const result: ChildResult = {
      run_id: config.runId,
      options_backend_not_null: true,
      platforms: ['ios'],
      legs,
      all_legs_passed: proof.legs.length > 0 && proof.legs.every((leg) => leg.status === 'passed'),
      manifest_path: join(config.outputDir, 'manifest.json'),
      provider_correlation_path: join(config.outputDir, 'provider-correlation.json'),
    };
    writeFileSync(
      join(config.outputDir, 'child-result.json'),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    exitCode = result.all_legs_passed ? 0 : 1;
  } catch (e) {
    const result: ChildResult = {
      run_id: config.runId,
      options_backend_not_null: false,
      platforms: ['ios'],
      legs: [],
      all_legs_passed: false,
      manifest_path: join(config.outputDir, 'manifest.json'),
      provider_correlation_path: join(config.outputDir, 'provider-correlation.json'),
      error: e instanceof Error ? bounded(e.stack ?? e.message, 4000) : String(e),
    };
    writeFileSync(
      join(config.outputDir, 'child-result.json'),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    exitCode = 2;
  } finally {
    if (backend !== null) await backend.dispose();
    heartbeat('child-exit');
  }
  process.exit(exitCode);
}

/* ------------------------------------------------------- parent watchdog -- */

type ChildOutcome = {
  code: number | null;
  signal: string | null;
  watchdog_fired: boolean;
  log_path: string;
};

function spawnWithWatchdog(
  command: string,
  args: string[],
  logPath: string,
  watchdogMs: number,
  label: string,
): Promise<ChildOutcome> {
  return new Promise((resolveOutcome) => {
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      env: minimalChildEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const chunks: string[] = [];
    let watchdogFired = false;
    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      chunks.push(text);
      process.stdout.write(`[${label}] ${text}`);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      chunks.push(text);
      process.stderr.write(`[${label}] ${text}`);
    });
    const watchdog = setTimeout(() => {
      watchdogFired = true;
      console.error(`[watchdog] ${label} exceeded ${watchdogMs} ms — killing the tree`);
      killTree(child.pid ?? -1);
    }, watchdogMs);
    child.once('exit', (code, signal) => {
      clearTimeout(watchdog);
      writeFileSync(logPath, chunks.join(''));
      resolveOutcome({ code, signal, watchdog_fired: watchdogFired, log_path: logPath });
    });
  });
}

function readJson<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

/* --------------------------------------------------- RED/GREEN evaluation -- */

type MarkerSignature = {
  failed_legs_with_signature: number;
  completed_record_channel: 'flow-log-observed-dump' | 'provider-correlation' | 'none';
  completed_record_present: boolean;
};

/**
 * The pre-fix defect signature: an iOS leg failed `marker turn ended as no
 * terminal record` WHILE the marker turn's completed record is present in the
 * same run's records. The marker turn is the leg's FIRST conversational send,
 * so any completed record in the leg's own observed dump at failure time is
 * the marker's; provider-correlation.json (complete, driver-written) is the
 * second channel.
 */
// fallow-ignore-next-line complexity
function detectMarkerSignature(manifest: RunManifest | null, outputDir: string): MarkerSignature {
  const signatureText = 'marker turn ended as no terminal record';
  let failedLegs = 0;
  let flowLogProven = false;
  for (const leg of manifest?.legs ?? []) {
    if (leg.platform !== 'ios') continue;
    const diagnostic = leg.diagnostic ?? '';
    if (!diagnostic.includes(signatureText)) continue;
    failedLegs += 1;
    // evidence.screenshot is the leg dir's absolute screenshot path; the
    // UNTRUNCATED flow.log sits beside it.
    const legDir = dirname(String(leg.evidence?.screenshot ?? ''));
    const flowLog = legDir !== '' ? join(legDir, 'flow.log') : '';
    if (existsSync(flowLog)) {
      const log = readFileSync(flowLog, 'utf8');
      const match = log.match(
        /marker turn ended as no terminal record — observed: (\[[\s\S]*?\])\n/,
      );
      if (match) {
        try {
          const observed = JSON.parse(match[1]) as { outcome?: string }[];
          if (observed.some((record) => record.outcome === 'completed')) flowLogProven = true;
        } catch {
          // unparseable dump — fall through to the correlation channel
        }
      }
    }
  }
  const correlation = readJson<{ backend_records: { outcome: string }[] }>(
    join(outputDir, 'provider-correlation.json'),
  );
  const correlationProven =
    failedLegs > 0 && (correlation?.backend_records ?? []).some((r) => r.outcome === 'completed');
  return {
    failed_legs_with_signature: failedLegs,
    completed_record_channel: flowLogProven
      ? 'flow-log-observed-dump'
      : correlationProven
        ? 'provider-correlation'
        : 'none',
    completed_record_present: (flowLogProven || correlationProven) === true,
  };
}

// fallow-ignore-next-line complexity
async function runDefaultLane(): Promise<ProofOutcome> {
  const problems = checkPrerequisites();
  if (problems.length > 0) {
    appendRunRecord({ mode: 'default', command: LITERAL_SELECTOR, exit: 1, blocked: problems });
    return {
      ok: false,
      kind: 'failure',
      run_id: 'n/a',
      detail: `prerequisites failed (fail closed): ${problems.join('; ')}`,
    };
  }

  const runId = `FIX-ORI-AI-002-1-${Date.now()}`;
  const outputDir = join(TASK_TMP, 'live', runId);
  mkdirSync(outputDir, { recursive: true });
  const config: ChildRunConfig = {
    runId,
    outputDir,
    heartbeatPath: join(outputDir, 'heartbeat.jsonl'),
  };
  const configPath = join(outputDir, 'child-config.json');
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  console.log(`[harness] caller-composed ios-only run ${runId} (watchdog ${WATCHDOG_IOS_MS} ms)`);
  const outcome = await spawnWithWatchdog(
    process.execPath,
    [TSX_CLI, HARNESS_SELF, '--child-run', configPath],
    join(outputDir, 'child-stdio.log'),
    WATCHDOG_IOS_MS,
    'child',
  );

  const childResult = readJson<ChildResult>(join(outputDir, 'child-result.json'));
  const manifest = readJson<RunManifest>(join(outputDir, 'manifest.json'));
  const inspection = inspectDriverSource();
  const signature = detectMarkerSignature(manifest, outputDir);
  const iosLegs = (manifest?.legs ?? []).filter((leg) => leg.platform === 'ios');
  const legsPassed = iosLegs.filter((leg) => leg.status === 'passed').length;

  const base = {
    mode: 'default',
    command: LITERAL_SELECTOR,
    run_id: runId,
    watchdog_ms: WATCHDOG_IOS_MS,
    child: {
      code: outcome.code,
      signal: outcome.signal,
      watchdog_fired: outcome.watchdog_fired,
      log: outcome.log_path,
    },
    manifest_run_id: manifest?.run_id ?? null,
    manifest_run_id_matches: manifest?.run_id === runId,
    options_backend_not_null: childResult?.options_backend_not_null ?? false,
    ios_legs_passed: legsPassed,
    marker_signature: signature,
    source_inspection: inspection,
    child_error: childResult?.error ?? null,
    growth_samples: Object.fromEntries(
      (childResult?.legs ?? []).map((leg) => [leg.platform, leg.growth ?? []]),
    ),
  };

  if (outcome.watchdog_fired) {
    appendRunRecord({ ...base, exit: 1, blocked: ['watchdog fired'] });
    return { ok: false, kind: 'failure', run_id: runId, detail: 'watchdog fired — run aborted' };
  }

  if (legsPassed === 2 && inspection.clean) {
    writeFileSync(
      join(TASK_TMP, 'green.json'),
      `${JSON.stringify(
        {
          ...base,
          exit: 0,
          kind: 'green',
          manifest_completed: manifest?.completed ?? null,
          note: 'manifest.completed may legitimately be false for an ios-only run — assertions key on legs[].status',
        },
        null,
        2,
      )}\n`,
    );
    appendRunRecord({ ...base, exit: 0, kind: 'green' });
    return {
      ok: true,
      kind: 'green',
      run_id: runId,
      detail: 'both iOS appearance legs passed with pre-send baselines (source inspection clean)',
    };
  }

  if (signature.failed_legs_with_signature > 0 && signature.completed_record_present) {
    writeFileSync(
      join(TASK_TMP, 'red.json'),
      `${JSON.stringify(
        {
          ...base,
          exit: 1,
          kind: 'red-live',
          root_cause:
            'await-time baseline capture after a synchronous send flow: the marker turn record completed during the maestro send window lands at index <= the await-time baseline, so the records.length > baseline terminal predicate never fires',
        },
        null,
        2,
      )}\n`,
    );
    appendRunRecord({ ...base, exit: 1, kind: 'red-live' });
    return {
      ok: false,
      kind: 'red-live',
      run_id: runId,
      detail:
        'pre-fix defect signature: marker turn failed as no terminal record while its completed record is present in the same run',
    };
  }

  if (legsPassed === 2 && !inspection.clean) {
    // The live race did not reproduce in the window — the recorded in-vitro lane.
    const inVitro = await runInVitroLane(process.env.RNR_S05_IOS_UDID ?? '');
    writeFileSync(
      join(TASK_TMP, 'red.json'),
      `${JSON.stringify(
        {
          ...base,
          exit: 1,
          kind: 'red-in-vitro',
          live_divergence:
            'live legs passed but the source still captures a conversational baseline after its issuing flow — the race window did not trigger this run',
          in_vitro: inVitro,
        },
        null,
        2,
      )}\n`,
    );
    appendRunRecord({ ...base, exit: 1, kind: 'red-in-vitro' });
    return {
      ok: false,
      kind: 'red-in-vitro',
      run_id: runId,
      detail: `live race not reproduced; in-vitro divergence over the real predicates proven=${inVitro.divergence_proven}`,
    };
  }

  appendRunRecord({ ...base, exit: 1, kind: 'failure' });
  return {
    ok: false,
    kind: 'failure',
    run_id: runId,
    detail: `run failed without the defect signature (different defect — Ask First): ${
      childResult?.error ??
      (iosLegs.map((leg) => `${leg.platform}:${leg.status}`).join(', ') || 'no manifest')
    }`,
  };
}

/* ------------------------------------------------------------ matrix mode -- */

// fallow-ignore-next-line complexity
async function runMatrixMode(): Promise<ProofOutcome> {
  const problems = checkPrerequisites();
  if (problems.length > 0) {
    appendRunRecord({
      mode: 'matrix',
      command: LITERAL_MATRIX_SELECTOR,
      exit: 1,
      blocked: problems,
    });
    return {
      ok: false,
      kind: 'matrix',
      run_id: 'n/a',
      detail: `prerequisites failed (fail closed): ${problems.join('; ')}`,
    };
  }

  const logPath = join(TASK_TMP, 'matrix-child-stdio.log');
  console.log(`[harness] canonical three-platform matrix (watchdog ${WATCHDOG_MATRIX_MS} ms)`);
  const outcome = await spawnWithWatchdog(
    process.execPath,
    [TSX_CLI, DRIVER_PATH, '--platforms', 'ios,android,web'],
    logPath,
    WATCHDOG_MATRIX_MS,
    'matrix',
  );

  // The CLI's final stdout is its run identity (pretty-printed):
  // {\n  "runId": "...",\n  "completed": true\n}
  const log = existsSync(logPath) ? readFileSync(logPath, 'utf8') : '';
  const runIdMatches = [...log.matchAll(/"runId": "([^"]+)"/g)];
  const completedMatches = [...log.matchAll(/"completed": (true|false)/g)];
  const reported =
    runIdMatches.length > 0 && completedMatches.length > 0
      ? {
          runId: runIdMatches[runIdMatches.length - 1][1],
          completed: completedMatches[completedMatches.length - 1][1] === 'true',
        }
      : null;
  const evidenceRoot = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-005');
  const manifest = readJson<RunManifest>(join(evidenceRoot, 'manifest.json'));
  const correlation = readJson<{ run_id: string; backend_records: unknown[] }>(
    join(evidenceRoot, 'provider-correlation.json'),
  );
  const legs = manifest?.legs ?? [];
  const record = {
    mode: 'matrix',
    command: LITERAL_MATRIX_SELECTOR,
    child_command:
      'pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --platforms ios,android,web',
    exit: null as number | null,
    watchdog_ms: WATCHDOG_MATRIX_MS,
    child: {
      code: outcome.code,
      signal: outcome.signal,
      watchdog_fired: outcome.watchdog_fired,
      log: logPath,
    },
    child_reported: reported,
    manifest: manifest
      ? {
          run_id: manifest.run_id,
          completed: manifest.completed,
          passed_platforms: manifest.passed_platforms,
          legs: legs.map((leg) => ({ platform: leg.platform, status: leg.status })),
          run_id_matches_child: manifest.run_id === reported?.runId,
        }
      : null,
    provider_correlation_records: correlation?.backend_records.length ?? null,
  };

  const gateProblems: string[] = [];
  if (outcome.watchdog_fired) gateProblems.push('watchdog fired');
  if (outcome.code !== 0) gateProblems.push(`child exit ${outcome.code}`);
  if (manifest === null) gateProblems.push('manifest.json missing');
  if (reported === null) gateProblems.push('child run identity not reported');
  if (manifest !== null && manifest.run_id !== reported?.runId) {
    gateProblems.push('manifest run_id does not match the child-reported run identity');
  }
  if (manifest?.completed !== true) gateProblems.push('manifest.completed is not true');
  if (manifest?.passed_platforms !== 3) gateProblems.push('passed_platforms is not 3');
  // 5 legs: two appearances per native platform plus the single web leg.
  if (legs.length !== 5 || !legs.every((leg) => leg.status === 'passed')) {
    gateProblems.push('not every leg passed (need 5 passed legs: ios x2, android x2, web)');
  }
  const ok = gateProblems.length === 0;
  appendRunRecord({ ...record, exit: ok ? 0 : 1, problems: ok ? undefined : gateProblems });
  return {
    ok,
    kind: 'matrix',
    run_id: manifest?.run_id ?? 'n/a',
    detail: ok
      ? 'canonical three-platform matrix: exit 0, completed true, every leg passed, run identity bound'
      : `matrix gate failed: ${gateProblems.join('; ')}`,
  };
}

/* -------------------------------------------------------------------- CLI -- */

export async function runNativewindBaselineOrderingProof(
  mode: 'default' | 'matrix' = 'default',
): Promise<ProofOutcome> {
  mkdirSync(TASK_TMP, { recursive: true });
  return mode === 'matrix' ? await runMatrixMode() : await runDefaultLane();
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const childRunIdx = argv.indexOf('--child-run');
  if (childRunIdx >= 0 && argv[childRunIdx + 1] !== undefined) {
    await childRun(argv[childRunIdx + 1]);
    return;
  }
  const matrixIdx = argv.indexOf('--matrix');
  const mode = matrixIdx >= 0 && argv[matrixIdx + 1] === 'ios,android,web' ? 'matrix' : 'default';
  const result = await runNativewindBaselineOrderingProof(mode);
  console.log(`\n[harness] ${result.kind}: ${result.detail}`);
  if (!result.ok) process.exitCode = 1;
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.stack : String(e));
    process.exit(2);
  });
}
