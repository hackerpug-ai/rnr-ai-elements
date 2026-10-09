/**
 * ORI-RN-004 — the executable three-platform live chat proof and the strict
 * live-import-graph compiler proof.
 *
 * This file is both the exported driver ORI-CONT-004's locked Quickstart gate calls
 * (`runLiveExampleProof`) and the CLI the task VERIFY commands run:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
 *     --platforms ios,android,web
 *   pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts \
 *     --case ORI-RN-004-AC-5-live-import-graph-compiler
 *
 * Real surfaces only: the real apps/example app in Expo Go on iOS and Android and a
 * real served web export in Chromium, an ORI-AI-001 owned backend, and the official
 * OpenAI Responses endpoint (gpt-4.1-mini-2025-04-14). No mocked HTTP, no stub hook,
 * no injected messages, no canned streams, no test-only app routes.
 *
 * Every platform leg drives, on the real public controls: send, contextual
 * follow-up, active Stop, and AC-3 case 2's endpoint-loss + Retry (the owned
 * backend is stopped through its lifecycle handle, the retained turn surfaces a
 * sanitized error with an accessible Retry, and a restart + Retry completes a NEW
 * provider record without duplicating the failed user turn).
 *
 * Web reachability: the owned backend does not emit CORS headers, so the web leg
 * serves the static export AND forwards `/api/chat` to the real backend from the same
 * origin (a reverse proxy in the serving layer — real forwarding, never a mock).
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { type Browser, chromium } from '@playwright/test';
import {
  type BackendRecord,
  DEFAULT_MODEL,
  launchOwnedBackend,
  type OwnedBackendHandle,
} from './live-backend';
import {
  type Appearance,
  captureHierarchy,
  captureScreenshot,
  gitHead,
  installExpoGoAndroid,
  installExpoGoIos,
  type MetroHandle,
  openExpoGo,
  REPO_ROOT,
  reserveDevices,
  run as runShell,
  setAppearance,
  sha256,
  startMetro,
  stopMetro,
} from './native-session';

const EXAMPLE_ROOT = join(REPO_ROOT, 'apps/example');
const EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-004');

const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const MAESTRO_FLOW = join(REPO_ROOT, 'tests/sprint-05-orient-search/live-example.maestro.yaml');

const ANDROID_SDK =
  process.env.ANDROID_HOME ?? join(process.env.HOME ?? '', 'Library', 'Android', 'sdk');
const ADB = join(ANDROID_SDK, 'platform-tools', 'adb');

const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4000;
const METRO_PORT = 8095;
const WEB_PORT = 8406;

/**
 * FIX-ORI-RN-004-2 — per-wait bounds (ms): every lifecycle await in the leg
 * pipeline carries an explicit bound, so a stalled condition fails fast with a
 * named-step diagnostic instead of the silent, childless, manifest-less idle
 * observed in orchestrated run ORI-AI-002-1789929365070.
 */
const WAIT_BOUND_PROXY_LISTEN_MS = 30_000;
const WAIT_BOUND_PROXY_CLOSE_MS = 20_000;
const WAIT_BOUND_BROWSER_MS = 30_000;
const WAIT_BOUND_BACKEND_OP_MS = 120_000;
/**
 * FIX-ORI-RN-004-3 — per-segment bounds (ms) for every await between the
 * endpoint-loss `backend/stop/*` family and `backend/restarted`. Run
 * ORI-AI-002-1789975643876 stalled exactly in that window: the stop completed
 * through the caller's options.backend handle (heartbeat `backend/stop/start`
 * at 08:04:18) and the restart was never issued — no heartbeat, no driver-side
 * bound, and no diagnostic existed between them (the five post-stop Playwright
 * ops relied entirely on Playwright's own in-process timeout, invisible to this
 * driver's heartbeat log). Every segment in the window now emits its own
 * start/done heartbeat pair and carries an explicit bound. Caveat recorded in
 * FIX-ORI-RN-004-2's handoff and still true: a segment whose internals are
 * synchronous spawnSync calls blocks the event loop while it runs, so a bound
 * cannot fire mid-sync — the caller-handle harness's outer watchdog covers that
 * frozen-loop class; these bounds cover every yielding segment.
 */
const WAIT_BOUND_WEB_SEGMENT_MS = 60_000;
const WAIT_BOUND_NATIVE_SEGMENT_MS = 120_000;
/** Per-leg wall-clock budgets (ms) — a leg that exceeds its budget fails fast. */
const LEG_BUDGET_MS: Record<Platform, number> = {
  web: 840_000,
  ios: 2_400_000,
  android: 2_400_000,
};

type Platform = 'ios' | 'android' | 'web';
type LegStatus = 'passed' | 'failed' | 'blocked';

type LegOutcome = {
  platform: Platform;
  status: LegStatus;
  diagnostic?: string;
  evidence: Record<string, unknown>;
};

type ProofOptions = {
  engine?: 'uniwind';
  platforms: Platform[];
  runId: string;
  /** SHA-256 of app/live-chat.tsx when a caller passes it (source identity). */
  sourceSha?: string;
  outputDir?: string;
  /** Real owned-backend lifecycle handle (created by the CLI when omitted). */
  backend?: OwnedBackendHandle;
};

type ProofResult = {
  runId: string;
  legs: LegOutcome[];
  completed: boolean;
};

/* -------------------------------------------------------------- utilities -- */

function nowIso(): string {
  return new Date().toISOString();
}

function markerFor(runId: string, platform: Platform): string {
  return `ORI-RN-004:${runId}:${platform}`;
}

function seedPromptFor(marker: string): string {
  return `Remember the marker ${marker}. Repeat it and give three short facts about rain.`;
}

const FOLLOW_UP_PROMPT = 'What marker did I ask you to remember?';
// The explicit length demand matters: with only "ten substantial paragraphs" the
// model occasionally answered in ~400 tokens (~5s), finishing the stream before the
// stop control could be exercised (cycle-4 attempt 4: a 14-delta "essay").
const LONG_PROMPT =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';

function readSourceSha(): string {
  return sha256(readFileSync(join(EXAMPLE_ROOT, 'app/live-chat.tsx'), 'utf8'));
}

function run(cmd: string, cwd: string, timeoutMs = 600_000): { exit: number; output: string } {
  return runShell(cmd, cwd, timeoutMs);
}

/* ------------------------------------------- FIX-ORI-RN-004-2 heartbeats -- */

/**
 * One heartbeat record: emitted by the RUNNING driver at every leg phase and
 * phase transition, appended to the evidence log and the console. The run field
 * scopes entries to the runLiveExampleProof invocation that emitted them, so a
 * harness (or an orchestrator) can assert per-run coverage and ordering.
 */
export type HeartbeatEntry = {
  seq: number;
  ts: string;
  run: string;
  step: string;
  detail?: string;
};

const HEARTBEAT_LOG = join(EVIDENCE_ROOT, 'heartbeat.log');
const heartbeatEntries: HeartbeatEntry[] = [];
let heartbeatRun = 'none';

function heartbeat(step: string, detail?: string): void {
  const entry: HeartbeatEntry = {
    seq: heartbeatEntries.length + 1,
    ts: nowIso(),
    run: heartbeatRun,
    step,
  };
  if (detail !== undefined) entry.detail = detail;
  heartbeatEntries.push(entry);
  try {
    mkdirSync(EVIDENCE_ROOT, { recursive: true });
    appendFileSync(HEARTBEAT_LOG, `${JSON.stringify(entry)}\n`);
  } catch {
    /* evidence write is best-effort; the in-memory record still counts */
  }
  console.error(`[heartbeat ${entry.ts}] ${step}${detail !== undefined ? ` — ${detail}` : ''}`);
}

/** The heartbeat records emitted so far, in emission order. */
export function heartbeatRecords(): HeartbeatEntry[] {
  return [...heartbeatEntries];
}

function lastHeartbeatText(): string {
  const last = heartbeatEntries[heartbeatEntries.length - 1];
  return last === undefined ? 'none' : `${last.ts} ${last.step}`;
}

/** A stall diagnosed by a bounded wait — the message names step, port, last heartbeat. */
export class StallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StallError';
  }
}

/**
 * Races `start()` against an explicit bound. On expiry the waiter rejects with a
 * StallError whose diagnostic names the stalled step, the port, and the last
 * heartbeat timestamp — never a silent idle. `onExpiry` runs best-effort
 * force-teardown (e.g. destroying all server connections) before the rejection.
 */
async function boundWait<T>(
  step: string,
  port: number | null,
  boundMs: number,
  start: () => Promise<T>,
  onExpiry?: () => void,
): Promise<T> {
  heartbeat(`${step}/start`, port !== null ? `port=${port}` : undefined);
  const operation = start();
  // The race may be decided by the bound; never leave a dangling rejection.
  operation.catch(() => {});
  return await new Promise<T>((resolveOperation, rejectOperation) => {
    const timer = setTimeout(() => {
      const detail =
        `stalled await: step=${step}${port !== null ? ` port=${port}` : ''} boundMs=${boundMs} ` +
        `lastHeartbeat=${lastHeartbeatText()}`;
      heartbeat(`${step}/stalled`, detail);
      try {
        onExpiry?.();
      } catch {
        /* best-effort force */
      }
      rejectOperation(new StallError(detail));
    }, boundMs);
    operation.then(
      (value) => {
        clearTimeout(timer);
        heartbeat(`${step}/done`);
        resolveOperation(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        heartbeat(`${step}/error`, error instanceof Error ? error.message : String(error));
        rejectOperation(error);
      },
    );
  });
}

/**
 * Races a whole leg against its wall-clock budget. A leg that exceeds the budget
 * rejects with a StallError whose diagnostic names the platform, the budget, and
 * the last heartbeat — runAllLegs converts that to a failed outcome and the run
 * continues to the remaining legs and still writes its manifest.
 */
async function withLegBudget<T>(platform: Platform, legRun: () => Promise<T>): Promise<T> {
  const budgetMs = LEG_BUDGET_MS[platform];
  heartbeat(`leg/${platform}/budget-start`, `budgetMs=${budgetMs}`);
  const operation = legRun();
  operation.catch(() => {});
  return await new Promise<T>((resolveLeg, rejectLeg) => {
    const timer = setTimeout(() => {
      const detail =
        `leg budget exhausted: leg=${platform} budgetMs=${budgetMs} ` +
        `lastHeartbeat=${lastHeartbeatText()}`;
      heartbeat(`leg/${platform}/budget-exhausted`, detail);
      rejectLeg(new StallError(detail));
    }, budgetMs);
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolveLeg(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        rejectLeg(error);
      },
    );
  });
}

/* ------------------------------------------------------- owned backend -- */

async function ensureBackend(options: ProofOptions): Promise<OwnedBackendHandle> {
  if (options.backend) return options.backend;
  // The server's default maxOutputTokens (1024) lets the essay prompt hit the token
  // cap in ~2s, so the stop tap races an already-finished stream (cycle-4 RED: two
  // "passed" android legs with zero aborted records). 4096 keeps the essay alive
  // well past the +2s stop tap on every platform leg.
  return launchOwnedBackend({
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    model: DEFAULT_MODEL,
    maxOutputTokens: 4096,
  });
}

function assertBackendReady(backend: OwnedBackendHandle): void {
  if (!backend.started) {
    throw new Error(`backend did not start: ${backend.stderrText().slice(-2000)}`);
  }
}

/**
 * Tracks the owned backend across the endpoint-loss/restart cycles the AC-3 retry
 * leg drives. `OwnedBackendHandle.restart()` returns a NEW handle (the old child is
 * gone, and its parsed records with it), so the session keeps every handle so the
 * manifest/correlation retain the full sanitized record set, and exposes the live
 * handle the legs should talk to.
 */
export class BackendSession {
  private readonly handles: OwnedBackendHandle[];
  private currentHandle: OwnedBackendHandle;

  constructor(initial: OwnedBackendHandle) {
    this.currentHandle = initial;
    this.handles = [initial];
  }

  get current(): OwnedBackendHandle {
    return this.currentHandle;
  }

  /** The initial handle a caller may own (the CLI's self-launched one is ours). */
  get initial(): OwnedBackendHandle {
    return this.handles[0];
  }

  /**
   * Bounded stop: a CALLER-PROVIDED handle may be a cross-process adapter whose
   * stop can pend forever (the orchestrated-stall class). The bound turns that
   * into a StallError naming the step, the backend port, and the last heartbeat.
   */
  async stop(): Promise<void> {
    await boundWait('backend/stop', this.currentHandle.port, WAIT_BOUND_BACKEND_OP_MS, async () => {
      await this.currentHandle.stop();
    });
  }

  async restart(): Promise<void> {
    this.currentHandle = await boundWait(
      'backend/restart',
      this.currentHandle.port,
      WAIT_BOUND_BACKEND_OP_MS,
      async () => {
        const next = await this.currentHandle.restart();
        heartbeat('backend/restarted', `${next.host}:${next.port}`);
        return next;
      },
    );
    this.handles.push(this.currentHandle);
  }

  allRecords(): BackendRecord[] {
    return this.handles.flatMap((handle) => handle.records());
  }
}

/** The fresh nonsecret probe turn the endpoint-loss/retry leg submits (AC-3). */
const RETRY_PROBE_PROMPT = 'Reply with the single word pineapple.';

/* ------------------------------------------------------- android reverse -- */

function reverseBackendPort(backendPort: number): void {
  spawnSync(ADB, ['reverse', `tcp:${backendPort}`, `tcp:${backendPort}`], {
    encoding: 'utf8',
    timeout: 30_000,
  });
}

function removeBackendReverse(backendPort: number): void {
  spawnSync(ADB, ['reverse', '--remove', `tcp:${backendPort}`], {
    encoding: 'utf8',
    timeout: 30_000,
  });
}

/** Dismisses stale Android system dialogs (ANR/notification) that overlay Expo Go. */
function dismissAndroidSystemDialogs(): void {
  spawnSync(
    ADB,
    [
      '-s',
      process.env.RNR_S05_ANDROID_SERIAL ?? 'emulator-5554',
      'shell',
      'am',
      'broadcast',
      '-a',
      'android.intent.action.CLOSE_SYSTEM_DIALOGS',
    ],
    {
      encoding: 'utf8',
      timeout: 30_000,
    },
  );
  spawnSync(
    ADB,
    [
      '-s',
      process.env.RNR_S05_ANDROID_SERIAL ?? 'emulator-5554',
      'shell',
      'input',
      'keyevent',
      '4',
    ],
    {
      encoding: 'utf8',
      timeout: 30_000,
    },
  );
}

/* -------------------------------------------------------- metro + env -- */

/**
 * Provider credentials must never reach Metro, the compiler, or the browser
 * (CRITICAL CONSTRAINT). `startMetro` (native-session.ts), the `expo export`
 * child spawned through `run`/`runShell` (quickstart-consumer.ts) and
 * `chromium.launch()` (Playwright) all default to `process.env` because none
 * of those spawn calls is given an explicit `env` — and the two support files
 * that own those spawn call sites are outside this task's WRITE-ALLOWED list,
 * so they cannot be edited here (see the task handoff's blockers). Node takes
 * a fresh snapshot of `process.env` at the moment each spawn() actually
 * executes, so removing credential-shaped keys immediately before the call
 * and restoring them immediately after keeps every other child unaffected —
 * in particular the trusted backend, which is always launched (and so has
 * already captured its own env snapshot) before this window ever opens. Same
 * temporary-mutation pattern already used below for EXPO_PUBLIC_API_BASE_URL.
 */
const CREDENTIAL_ENV_PATTERN = /(API_KEY|SECRET|TOKEN|PASSWORD|CREDENTIAL)/i;

function stripCredentialEnv(): Record<string, string> {
  const removed: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    if (CREDENTIAL_ENV_PATTERN.test(key) && !key.startsWith('EXPO_PUBLIC_')) {
      removed[key] = process.env[key] as string;
      delete process.env[key];
    }
  }
  return removed;
}

function restoreCredentialEnv(removed: Record<string, string>): void {
  for (const [key, value] of Object.entries(removed)) {
    process.env[key] = value;
  }
}

/**
 * Starts Metro for the in-monorepo apps/example with the backend reachable at
 * `EXPO_PUBLIC_API_BASE_URL`. EXPO_PUBLIC_* is inlined at bundle time, so the value
 * is placed in the Metro child's inherited environment before it starts.
 */
function startLiveMetro(apiBaseUrl: string, logPath: string): MetroHandle {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;
  const removedCreds = stripCredentialEnv();
  try {
    return startMetro(EXAMPLE_ROOT, METRO_PORT, logPath);
  } finally {
    restoreCredentialEnv(removedCreds);
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = previous;
    }
  }
}

/** The deep link that lands Expo Go on the separate /live-chat route. */
function liveChatOpenUrl(metro: MetroHandle): string {
  return `exp://127.0.0.1:${metro.port}/--/live-chat`;
}

/* -------------------------------------------------------- maestro driver -- */

type MaestroResult = { exit: number; output: string };

function runLiveMaestro(deviceId: string, env: Record<string, string>): MaestroResult {
  const args = ['--udid', deviceId, 'test', '--no-ansi'];
  for (const [key, value] of Object.entries(env)) {
    args.push('-e', `${key}=${value}`);
  }
  args.push(MAESTRO_FLOW);
  const res = spawnSync(MAESTRO_BIN, args, {
    encoding: 'utf8',
    timeout: 300_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { exit: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/**
 * Taps an element via Maestro's accessibility-based `tapOn` (which dispatches to the
 * element's accessibility node, so it lands even when a raw `adb input tap` at the
 * same coordinates is intercepted by the RN LogBox overlay). `selector` is a Maestro
 * text regex, e.g. `Message.*`, `Send message`, `Stop generating`, `Dismiss`.
 * Writes a one-off flow to a temp file and runs it. Returns true on success.
 */
function maestroTap(deviceId: string, selector: string): boolean {
  const flowPath = join(tmpdir(), `ori-rn-004-tap-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(flowPath, `appId: host.exp.Exponent\n---\n- tapOn: ${JSON.stringify(selector)}\n`);
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status === 0;
}

/**
 * Types one turn into the composer and sends it through a one-off Maestro flow (iOS
 * IME input works; only the Android emulator's soft keyboard is absent). Used by the
 * endpoint-loss leg, which must submit AFTER the owned backend is stopped — the main
 * flow yaml cannot sequence a backend stop mid-flow.
 */
function maestroTypeAndSend(deviceId: string, text: string): boolean {
  const flowPath = join(tmpdir(), `ori-rn-004-type-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    [
      'appId: host.exp.Exponent',
      '---',
      '- tapOn: "Message.*"',
      `- inputText: ${JSON.stringify(text)}`,
      '- tapOn: "Send message"',
    ].join('\n'),
  );
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status === 0;
}

/* --------------------------------------------- android adb-driven input -- */

/**
 * The Android leg drives text through `adb shell input text` — real key events to
 * the focused EditText — instead of Maestro's IME-based `inputText`, which silently
 * fails on this emulator because its soft keyboard is not shown (`dumpsys
 * input_method` → `mIsImeShowing=false`, `mImeHeight=0`). Maestro's `inputText`
 * reports COMPLETED but the controlled TextInput reverts (no `onChangeText`), so
 * `Send message` stays `enabled: false`. adb key events DO fire `onChangeText`.
 */

function adbExec(serial: string, args: string[]): string {
  const res = spawnSync(ADB, ['-s', serial, ...args], {
    encoding: 'utf8',
    timeout: 30_000,
  });
  return `${res.stdout ?? ''}${res.stderr ?? ''}`;
}

/** Types into the focused field via real key events. `input text` uses `%s` for a space. */
function adbTypeText(serial: string, text: string): void {
  const encoded = text.replace(/%/g, '%25').replace(/ /g, '%s');
  adbExec(serial, ['shell', 'input', 'text', encoded]);
}

/** Whether the soft keyboard (IME) is currently shown. Reads `dumpsys input_method`
 * (mInputShown) and `dumpsys window` (mIsImeShowing) — both must agree the IME is up. */
function imeShown(serial: string): boolean {
  const inputMethod = adbExec(serial, ['shell', 'dumpsys', 'input_method']);
  const windowDump = adbExec(serial, ['shell', 'dumpsys', 'window']);
  return /\bmInputShown=true\b/.test(inputMethod) || /\bmIsImeShowing=true\b/.test(windowDump);
}

/** Dismisses the soft keyboard ONLY when an IME is actually shown. Sending BACK
 * with no IME up propagates to the Activity and navigates away from /live-chat. */
function hideKeyboard(serial: string): void {
  if (!imeShown(serial)) return;
  adbExec(serial, ['shell', 'input', 'keyevent', '4']);
  spawnSync('sleep', ['1']);
}

/** Whether the `Message` field currently reports `focused=true`. */
function fieldFocused(serial: string): boolean {
  const els = parseUiHierarchy(captureHierarchy(serial));
  const field = els.find((e) => e.accessibilityText === 'Message');
  return field?.focused === 'true';
}

/** Whether the `Send message` control currently reports `enabled=true` — AC-2's
 * literal "the typed text flips Send message to enabled" observation. */
function sendEnabled(serial: string): boolean {
  const els = parseUiHierarchy(captureHierarchy(serial));
  return els.find((e) => e.accessibilityText === 'Send message')?.enabled === 'true';
}

/**
 * Polls the live backend records until the record BEYOND `baseline` (the one this
 * turn's send produced) reaches `outcome`. This is the only reliable Android
 * stream-completion signal: the button's `content-desc` never flips during streaming
 * (RN Fabric accessibility bug, cycle-3), so any hierarchy-text wait is vacuous, and
 * the next turn's send tap must not race an in-flight stream — while generating the
 * same button is the (always-enabled) Stop control, so an early tap ABORTS the
 * previous reply instead of sending.
 *
 * The poll MUST be async: the backend handle parses the server child's stdout via
 * 'data' events, so a fully synchronous poll loop starves the event loop and the
 * record set never updates (proven on-emulator: both marker turns failed a sync
 * gate while their completed records sat unread in the pipe).
 */
async function waitForRecordOutcome(
  backend: OwnedBackendHandle,
  baseline: number,
  outcome: 'completed' | 'aborted',
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const records = backend.records();
    if (records.length > baseline && records[records.length - 1].outcome === outcome) {
      return true;
    }
    await new Promise((resolveTick) => setTimeout(resolveTick, 1000));
  }
  return false;
}

/** Taps the composer field, then polls until it actually reports `focused=true`
 * (re-dismissing the LogBox and re-tapping a bounded number of times). Returns
 * false with no focus after the retries — an intercepted tap is then a hard fail,
 * not an indistinguishable "typed text reverted". */
function focusField(serial: string): boolean {
  // Tap-first: tap the field via Maestro accessibility, settle, then assert focus.
  // A raw `adb input tap` is intercepted by the LogBox overlay, so the tap goes
  // through Maestro's accessibility `tapOn` instead.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    dismissLogBox(serial);
    maestroTap(serial, 'Message.*');
    spawnSync('sleep', ['2']);
    if (fieldFocused(serial)) return true;
  }
  return false;
}

type UiElement = {
  accessibilityText: string;
  text: string;
  bounds: string;
  enabled: string;
  focused: string;
};

/** Flattens a `maestro hierarchy` JSON dump into its leaf attributes. The dump can
 * carry a non-JSON preamble (an iOS `None:` line from maestro's own logging), so the
 * parse targets the outermost JSON object rather than the whole stream. */
function parseUiHierarchy(raw: string): UiElement[] {
  const out: UiElement[] = [];
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return out;
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return out;
  }
  // fallow-ignore-next-line complexity
  const walk = (node: unknown): void => {
    if (typeof node !== 'object' || node === null) return;
    const record = node as Record<string, unknown>;
    const attrs = (record.attributes ?? {}) as Record<string, unknown>;
    out.push({
      accessibilityText: String(attrs.accessibilityText ?? ''),
      text: String(attrs.text ?? ''),
      bounds: String(attrs.bounds ?? ''),
      enabled: String(attrs.enabled ?? ''),
      focused: String(attrs.focused ?? ''),
    });
    const kids = record.children;
    if (Array.isArray(kids)) for (const kid of kids) walk(kid);
  };
  walk(data);
  return out;
}

/** Center of a `[x1,y1][x2,y2]` bounds string, or null if unparseable. */
function centerOfBounds(bounds: string): { x: number; y: number } | null {
  const m = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!m) return null;
  return {
    x: Math.round((Number(m[1]) + Number(m[3])) / 2),
    y: Math.round((Number(m[2]) + Number(m[4])) / 2),
  };
}

/**
 * The composer's send/stop control center, read while the app is IDLE. On Android
 * the accessibility tree's geometry goes STALE during streaming (cycle-3 proved the
 * content-desc never flips; the cycle-4 probe additionally caught bounds collapsed
 * to a 27px sliver mid-screen while the real button sat elsewhere), so any
 * tree-derived tap issued mid-stream lands at the wrong coordinates. Reading the
 * center while idle is valid, and the composer is layout-STABLE while the
 * transcript grows (Conversation renders `{body}{children}` — the composer is a
 * sibling BELOW the scroll body, not inside it), so the idle position equals the
 * mid-stream stop position.
 */
function sendButtonCenter(serial: string): { x: number; y: number } | null {
  const els = parseUiHierarchy(captureHierarchy(serial));
  const btn = els.find((e) => e.accessibilityText === 'Send message');
  if (!btn) return null;
  return centerOfBounds(btn.bounds);
}

/** Dismisses the LogBox overlay, then taps the element via Maestro accessibility. */
function dismissThenTap(serial: string, selector: string): boolean {
  dismissLogBox(serial);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (maestroTap(serial, selector)) return true;
    dismissLogBox(serial);
    spawnSync('sleep', ['1']);
  }
  return false;
}

function hierarchyContains(serial: string, needle: string): boolean {
  return captureHierarchy(serial).includes(needle);
}

/** Occurrences of `needle` in a raw string, non-overlapping. */
function countOccurrences(raw: string, needle: string): number {
  let count = 0;
  let index = raw.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = raw.indexOf(needle, index + needle.length);
  }
  return count;
}

/** Number of rendered occurrences of `needle` in a hierarchy dump — the "exactly 1
 * user turn" oracle for the retry probe. Counts INNERMOST matches: RN aggregates
 * descendant labels onto container elements, so one rendered bubble can expose the
 * string at BOTH the list-cell wrapper and the inner Text (observed on iOS:
 * element-flat counting read 2 while the captured screen shows one bubble); a
 * nested aggregation collapses to 1, while two genuinely separate duplicate
 * bubbles are disjoint subtrees and still count 2. */
function hierarchyElementCount(raw: string, needle: string): number {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return 0;
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return 0;
  }
  let count = 0;
  const exposesText = (record: Record<string, unknown>): boolean => {
    const attrs = (record.attributes ?? {}) as Record<string, unknown>;
    return (
      String(attrs.accessibilityText ?? '').includes(needle) ||
      String(attrs.text ?? '').includes(needle)
    );
  };
  // Returns whether the subtree contains a match; counts only innermost matches.
  const visit = (node: unknown): boolean => {
    if (typeof node !== 'object' || node === null) return false;
    const record = node as Record<string, unknown>;
    const kids = Array.isArray(record.children) ? (record.children as unknown[]) : [];
    let childMatched = false;
    for (const kid of kids) {
      if (visit(kid)) childMatched = true;
    }
    if (childMatched) return true;
    if (exposesText(record)) {
      count += 1;
      return true;
    }
    return false;
  };
  visit(data);
  return count;
}

function waitForText(serial: string, needle: string, timeoutMs: number): boolean {
  const deadline = Date.now() + timeoutMs;
  let found = hierarchyContains(serial, needle);
  while (!found && Date.now() < deadline) {
    spawnSync('sleep', ['1']);
    dismissLogBox(serial);
    found = hierarchyContains(serial, needle);
  }
  return found;
}

/**
 * Dismisses the iOS soft keyboard with a coordinate tap on the transcript region.
 * The composer keeps focus — and the keyboard — after the failed probe send (and
 * Maestro's own `hideKeyboard` command does NOT dismiss it; live-proven with
 * pixel-verified captures). With the keyboard up the transcript viewport shrinks
 * behind the IME, every later scroll gesture starting below ~60% of the screen is
 * eaten by the keyboard, and the `Scroll to latest message` affordance's tap
 * target is covered. A tap at 30% height lands on the transcript where no child
 * handles it, and the Conversation's `keyboardShouldPersistTaps="handled"` then
 * resigns the responder — pixel-verified on the reserved simulator (keyboard key
 * rows vanish from the capture, full transcript exposed).
 */
function dismissIosKeyboardByTap(deviceId: string): void {
  const flowPath = join(tmpdir(), `ori-rn-004-kbtap-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    ['appId: host.exp.Exponent', '---', '- tapOn:', '    point: "50%, 30%"'].join('\n'),
  );
  spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Maestro's own verified scroll: repeats real scroll gestures (direction DOWN =
 * toward the visually-lower, newer turns) until the element matching `text` is
 * visible, re-resolving the accessibility tree between gestures, so lazily
 * mounted virtualized items are found the moment they render. Returns true when
 * the element became visible within the timeout. Works on the reserved Android
 * emulator for this app (both cycle-3 GREEN android legs won their probe count
 * through this channel); on iOS it cannot match the transcript's RN Fabric Text
 * nodes (verified on-device: `assertVisible` fails for text plainly on screen
 * while the hierarchy dump carries it — see transcriptProbeCount channel notes).
 */
function maestroScrollUntilVisible(deviceId: string, text: string, timeoutMs = 90_000): boolean {
  const flowPath = join(tmpdir(), `ori-rn-004-scroll-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    [
      'appId: host.exp.Exponent',
      '---',
      '- scrollUntilVisible:',
      '    element:',
      `      text: ${JSON.stringify(text)}`,
      // `direction` names the CONTENT direction (Maestro docs: DOWN "scrolls down
      // until an element ... is visible" — lower parts of the page come into
      // view), not the finger's physical swipe. DOWN therefore reveals the newer,
      // visually-lower turns — proven by both attempt-1 Android legs winning their
      // probe count through exactly this command. (A mid-session edit flipped this
      // to UP "because the finger swipes up"; that regression is what broke the
      // attempt-4 Android legs — reverted with the docs and the passing run.)
      '    direction: DOWN',
      `    timeout: ${timeoutMs}`,
      '    visibilityPercentage: 40',
    ].join('\n'),
  );
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: timeoutMs + 90_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return res.status === 0;
}

/** Full-height finger-up swipe inside the transcript region (reveals the newest
 * turns below the fold). Starts at 65% height — above the composer, inside the
 * list — never on the composer itself (a drag there is a text-selection gesture,
 * not a scroll) and never below ~60% when a keyboard is up (that region is IME). */
function swipeTowardLatest(platform: 'ios' | 'android', deviceId: string): void {
  if (platform === 'android') {
    adbExec(deviceId, ['shell', 'input', 'swipe', '540', '1600', '540', '500', '250']);
    return;
  }
  const flowPath = join(tmpdir(), `ori-rn-004-swipe-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    [
      'appId: host.exp.Exponent',
      '---',
      '- swipe:',
      '    start: "50%, 65%"',
      '    end: "50%, 15%"',
    ].join('\n'),
  );
  spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Short finger-up swipe: keeps the element just revealed mounted while the
 * content just below it (where a duplicate would render) also mounts. */
function nudgeSwipe(platform: 'ios' | 'android', deviceId: string): void {
  if (platform === 'android') {
    adbExec(deviceId, ['shell', 'input', 'swipe', '540', '1500', '540', '1150', '200']);
    return;
  }
  const flowPath = join(tmpdir(), `ori-rn-004-nudge-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(
    flowPath,
    [
      'appId: host.exp.Exponent',
      '---',
      '- swipe:',
      '    start: "50%, 45%"',
      '    end: "50%, 32%"',
    ].join('\n'),
  );
  spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * macOS Vision OCR of a screenshot — the pixel channel. Whitespace/case-normalized
 * substring count over the recognized lines. Used only as the documented fallback
 * when the accessibility tree reads 0 after verified scrolling; the screenshot and
 * the final hierarchy dump are both retained beside the count so the channel switch
 * is provable evidence, not an assertion.
 */
function ocrCount(screenshotPath: string, needle: string): number {
  const scriptPath = join(tmpdir(), `ori-rn-004-ocr-${process.pid}.swift`);
  writeFileSync(
    scriptPath,
    [
      'import Vision',
      'import AppKit',
      '',
      'let path = CommandLine.arguments[1]',
      'guard let img = NSImage(contentsOfFile: path),',
      '      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {',
      '    FileHandle.standardError.write("cannot load image\\n".data(using: .utf8)!); exit(2)',
      '}',
      'let req = VNRecognizeTextRequest()',
      'req.recognitionLevel = .accurate',
      'req.usesLanguageCorrection = false',
      'let handler = VNImageRequestHandler(cgImage: cg, options: [:])',
      'try handler.perform([req])',
      'let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }',
      'print(lines.joined(separator: "\\n"))',
    ].join('\n'),
  );
  const res = spawnSync('swift', [scriptPath, screenshotPath], {
    encoding: 'utf8',
    timeout: 180_000,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (res.status !== 0) {
    throw new Error(`Vision OCR failed (exit ${res.status}): ${(res.stderr ?? '').slice(0, 300)}`);
  }
  const normalize = (s: string): string => s.toLowerCase().replace(/\s+/g, ' ').trim();
  return countOccurrences(normalize(res.stdout ?? ''), normalize(needle));
}

/**
 * The AC-3 case-2 "exactly 1 user turn" transcript oracle, hardened for the
 * virtualized Conversation. Why driving the list is mandatory: the inverted
 * FlatList's stickiness releases on the first scroll-up and is never
 * auto-reclaimed, and by the retry phase the transcript spans several screens
 * (the aborted essay alone covers ~3), so a hierarchy count read wherever the
 * viewport happens to sit counts the WRONG window — cycle-3 RED: both native
 * platforms read the probe 0x with the viewport parked mid-transcript (iOS
 * showed the essay turn, Android the seed turns) while the backend already
 * held each leg's completed retry record.
 *
 * Channels, in order — every one only REVEALS occurrences, never hides them,
 * so the count stays a strengthening oracle:
 *  1. Maestro `scrollUntilVisible` to the probe turn (Android's proven channel)
 *     + a short nudge past it, then the accessibility-tree count.
 *  2. Swipe crawl — batches of full-height finger-up swipes inside the
 *     transcript with a count after each batch (iOS's proven driver; the
 *     transcript spans ~6 pages by this point).
 *  3. The app's own public `Scroll to latest message` affordance
 *     (scrollToOffset(0)), kept LAST because a mis-aimed tap can re-focus the
 *     composer and re-raise the keyboard the pre-step just cleared.
 *  4. Pixels: the retained capture, Vision OCR, and the final hierarchy dump
 *     (`retry-state-hierarchy.txt`) beside it.
 *
 * Pre-step (both platforms): clear the screen-level obstructions first — iOS's
 * still-focused composer keyboard (dismissed by an unhandled tap through
 * `keyboardShouldPersistTaps="handled"`; Maestro's own `hideKeyboard` command
 * does NOT dismiss it) and Android's notification shade.
 */
// fallow-ignore-next-line complexity
function transcriptProbeCount(
  platform: 'ios' | 'android',
  deviceId: string,
  needle: string,
  legDir: string,
): { count: number; channel: string; artifacts: string[] } {
  const artifacts: string[] = [];
  // An expanded notification shade ("Set a screen lock" etc.) swallows every app
  // gesture and read. `cmd statusbar collapse` is a no-op when already collapsed
  // and, unlike BACK, can never navigate the activity off /live-chat.
  const collapseShade = (): void => {
    if (platform !== 'android') return;
    adbExec(deviceId, ['shell', 'cmd', 'statusbar', 'collapse']);
    adbExec(deviceId, [
      'shell',
      'am',
      'broadcast',
      '-a',
      'android.intent.action.CLOSE_SYSTEM_DIALOGS',
    ]);
  };

  // PRE-STEP — clear the screen-level obstructions before ANY transcript driving.
  // On iOS the composer keeps focus (and its keyboard) after the failed probe
  // send: with the keyboard up the transcript viewport shrinks behind the IME,
  // gestures starting below ~60% of the screen are eaten, and the scroll
  // affordance's tap target is covered — pixel-proven on the reserved simulator
  // (see dismissIosKeyboardByTap). On Android an expanded notification shade
  // swallows gestures the same way.
  const screenshotPath = join(legDir, 'retry-state.png');
  spawnSync('sleep', ['2']); // let the post-retry layout settle first
  if (platform === 'ios') dismissIosKeyboardByTap(deviceId);
  collapseShade();
  dismissLogBox(deviceId);

  // Channel 1 — Maestro's verified scroll to the probe turn (the channel both
  // attempt-1 Android legs won through), then a short nudge past it, then the
  // accessibility-tree count. The nudge matters for duplication detection: a
  // duplicated retained turn renders immediately after the original, and the
  // count must see that region mounted too. iOS note: Maestro's text matcher
  // cannot see RN Fabric Text nodes without explicit labels (verified on-device:
  // assertVisible fails for text plainly on screen while the hierarchy dump
  // carries it), so on iOS this channel no-ops and channel 2 does the driving.
  if (maestroScrollUntilVisible(deviceId, needle)) {
    nudgeSwipe(platform, deviceId);
    spawnSync('sleep', ['2']);
    dismissLogBox(deviceId);
    const count = hierarchyElementCount(captureHierarchy(deviceId), needle);
    if (count > 0) {
      captureScreenshot(platform, deviceId, screenshotPath);
      artifacts.push(screenshotPath);
      return { count, channel: 'hierarchy-after-scrollUntilVisible', artifacts };
    }
  }

  // Channel 2 — swipe crawl: full-height finger-up swipes inside the transcript
  // region, in batches with a count after each batch. This is iOS's proven
  // driver (pixel-verified on the reserved simulator: keyboard dismissed, five
  // swipes traverse the multi-page transcript, probe turn + its answer land in
  // frame). 5 swipes per batch x 4 batches covers the ~6-page transcript.
  for (let round = 0; round < 4; round += 1) {
    collapseShade();
    dismissLogBox(deviceId);
    for (let swipe = 0; swipe < 5; swipe += 1) swipeTowardLatest(platform, deviceId);
    spawnSync('sleep', ['2']);
    dismissLogBox(deviceId);
    const count = hierarchyElementCount(captureHierarchy(deviceId), needle);
    if (count > 0) {
      captureScreenshot(platform, deviceId, screenshotPath);
      artifacts.push(screenshotPath);
      return { count, channel: 'hierarchy-after-swipe-crawl', artifacts };
    }
  }

  // Channel 3 — the app's own `Scroll to latest message` affordance (a labeled
  // Button whose onPress runs Keyboard.dismiss + scrollToOffset(0)). Kept LAST:
  // a tap dispatched at stale tree geometry can land on the composer and
  // re-focus it (observed in the attempt-4 captures — the keyboard returned
  // mid-channel), which is exactly the obstruction the pre-step cleared, so
  // tapping earlier would poison the channels that follow.
  if (hierarchyContains(deviceId, 'Scroll to latest message')) {
    dismissThenTap(deviceId, 'Scroll to latest message');
    captureScreenshot(platform, deviceId, screenshotPath);
    spawnSync('sleep', ['2']);
    dismissLogBox(deviceId);
    const count = hierarchyElementCount(captureHierarchy(deviceId), needle);
    if (count > 0) {
      artifacts.push(screenshotPath);
      return { count, channel: 'hierarchy-after-affordance', artifacts };
    }
  }

  // Channel 4 — pixels: the last capture (channel 3's instant post-tap shot when
  // one exists — it outruns any re-park race by construction; fresh otherwise),
  // Vision OCR, and the final tree dump retained beside it. OCR only ever READS
  // pixels; it cannot fabricate a match.
  if (!existsSync(screenshotPath)) captureScreenshot(platform, deviceId, screenshotPath);
  artifacts.push(screenshotPath);
  const hierarchyDumpPath = join(legDir, 'retry-state-hierarchy.txt');
  const finalHierarchy = captureHierarchy(deviceId);
  writeFileSync(hierarchyDumpPath, finalHierarchy);
  artifacts.push(hierarchyDumpPath);
  const fromDump = hierarchyElementCount(finalHierarchy, needle);
  if (fromDump > 0) return { count: fromDump, channel: 'hierarchy-final-dump', artifacts };
  const fromOcr = ocrCount(screenshotPath, needle);
  if (fromOcr > 0) return { count: fromOcr, channel: 'vision-ocr', artifacts };
  return { count: 0, channel: 'exhausted', artifacts };
}

/** One-line diagnostic of the composer state for a failed turn. */
function stateSummary(serial: string): string {
  const els = parseUiHierarchy(captureHierarchy(serial));
  const field = els.find((e) => e.accessibilityText === 'Message');
  const send = els.find((e) => e.accessibilityText === 'Send message');
  const stop = els.find((e) => e.accessibilityText === 'Stop generating');
  const texts = els
    .filter((e) => e.text.length > 0 || e.accessibilityText.length > 0)
    .slice(0, 12)
    .map((e) => (e.accessibilityText ? `${e.accessibilityText}` : e.text.slice(0, 40)))
    .join(' | ');
  return JSON.stringify({
    fieldText: field?.text ?? null,
    sendEnabled: send?.enabled ?? null,
    sendPresent: send !== undefined,
    stopPresent: stop !== undefined,
    screenTexts: texts,
  });
}

/** Dismisses whatever dev/system overlay covers the composer, in priority order:
 *  1. the RN LogBox (require-cycle / state-update warnings) in BOTH forms — the full
 *     overlay (tap "Dismiss"; one warning often reveals the next, hence the loop)
 *     and the MINIMIZED banner (a clickable "!" badge — tap it to expand, then
 *     "Dismiss");
 *  2. an expanded notification shade — a mid-run system notification ("Set a screen
 *     lock" etc.) can leave the shade covering the app, and its "Clear all" footer
 *     is the one marker that never appears in an app dump. BACK collapses it
 *     (live-proven); gated on that marker, the BACK can never reach the activity.
 * systemui nodes and heads-up notification texts DO appear in ordinary app dumps —
 * never key the shade branch on their presence. */
// fallow-ignore-next-line complexity
function dismissLogBox(serial: string): void {
  for (let i = 0; i < 12; i += 1) {
    const raw = captureHierarchy(serial);
    const els = parseUiHierarchy(raw);
    const hasDismiss = els.some((e) => e.accessibilityText === 'Dismiss');
    const hasMinimize = els.some((e) => e.accessibilityText === 'Minimize');
    const hasFullOverlay = els.some(
      (e) => e.text === 'Console Warning' || e.text === 'Console Error',
    );
    const banner = els.find((e) => e.accessibilityText.startsWith('!') || e.text === '!');
    if (hasFullOverlay || hasDismiss) {
      // The warning LIST view has "Dismiss"; the expanded DETAIL view only has
      // "Minimize" — collapse that back to the banner first, never break out
      // leaving the overlay up (a break strands every later tap on the overlay).
      const tapped = hasDismiss ? maestroTap(serial, 'Dismiss') : maestroTap(serial, 'Minimize');
      if (!tapped && !hasMinimize) break;
      spawnSync('sleep', ['1']);
      continue;
    }
    if (banner) {
      // Minimized badge: tap it to expand the LogBox, then dismiss on the next pass.
      const center = centerOfBounds(banner.bounds);
      if (!center) break;
      adbExec(serial, ['shell', 'input', 'tap', String(center.x), String(center.y)]);
      spawnSync('sleep', ['1']);
      continue;
    }
    if (raw.includes('Clear all')) {
      adbExec(serial, ['shell', 'input', 'keyevent', '4']);
      spawnSync('sleep', ['1']);
      continue;
    }
    break;
  }
}

/**
 * Drives the whole Android turn sequence with real adb input + hierarchy asserts:
 * empty state → marker → real streamed seed reply → contextual follow-up → active
 * Stop. EVERY turn gates on a NEW backend provider record (`completed` for the
 * three conversational turns, `aborted` for the stop turn) — the only non-vacuous
 * stream signal on Android, because the button's `content-desc` never flips during
 * streaming, and because while generating the same button is the always-enabled
 * Stop control, so a next-turn send tap that races an in-flight stream ABORTS it
 * instead of sending. Returns the maestro-style `{ exit, output }` result so the
 * leg outcome shape is unchanged.
 */
// fallow-ignore-next-line complexity
async function runAndroidInputFlow(
  serial: string,
  session: BackendSession,
  marker: string,
  seedPrompt: string,
  followUp: string,
  longPrompt: string,
  legDir: string,
): Promise<MaestroResult> {
  const logs: string[] = [];
  const fail = (msg: string): MaestroResult => {
    logs.push(`FAIL: ${msg}`);
    return { exit: 1, output: logs.join('\n') };
  };
  // Prepares one turn: focus → type → assert "Send message" enabled (AC-2's
  // literal observation) → hide the keyboard → dismiss overlays. Returns null on
  // success, or the failure result. Sending is the caller's job — the stop turn
  // must control exactly how and when the send happens.
  const prepareTurn = (label: string, text: string): MaestroResult | null => {
    if (!focusField(serial))
      return fail(`could not focus "Message" (${label}) ${stateSummary(serial)}`);
    adbTypeText(serial, text);
    spawnSync('sleep', ['1']);
    if (!sendEnabled(serial)) {
      return fail(`"Send message" not enabled after typing (${label}) ${stateSummary(serial)}`);
    }
    hideKeyboard(serial);
    dismissLogBox(serial);
    return null;
  };

  // One conversational turn: prepare → baseline the records → send → gate on the
  // turn's record outcome. Returns null on success, or the failure result.
  const runTurn = async (
    label: string,
    text: string,
    gate: { outcome: 'completed' | 'aborted'; timeoutMs: number } | null,
  ): Promise<MaestroResult | null> => {
    const prep = prepareTurn(label, text);
    if (prep) return prep;
    const baseline = session.current.records().length;
    if (!dismissThenTap(serial, 'Send message')) {
      return fail(`could not tap "Send message" (${label}) ${stateSummary(serial)}`);
    }
    if (
      gate &&
      !(await waitForRecordOutcome(session.current, baseline, gate.outcome, gate.timeoutMs))
    ) {
      return fail(`${label} turn never produced a ${gate.outcome} provider record`);
    }
    return null;
  };

  // Wait for the composer (dismissing the LogBox overlay as needed).
  const composerDeadline = Date.now() + 60_000;
  let ready = false;
  while (Date.now() < composerDeadline) {
    dismissLogBox(serial);
    if (hierarchyContains(serial, 'Live chat')) {
      ready = true;
      break;
    }
    spawnSync('sleep', ['1']);
  }
  if (!ready) return fail('"Live chat" never appeared (60s)');
  logs.push('OK: composer ready');

  // Turn 1 — marker (empty state → exactly one user message, echoed in the transcript).
  let turn = await runTurn('marker', marker, { outcome: 'completed', timeoutMs: 90_000 });
  if (turn) return turn;
  if (!waitForText(serial, marker, 30_000)) {
    return fail(`marker did not land in the transcript ${stateSummary(serial)}`);
  }
  logs.push('OK: marker submitted, echoed, and its reply completed');

  // Turn 2 — seed prompt (a real streamed reply must complete).
  turn = await runTurn('seed', seedPrompt, { outcome: 'completed', timeoutMs: 120_000 });
  if (turn) return turn;
  logs.push('OK: seed reply streamed to a completed provider record');

  // Turn 3 — contextual follow-up (the marker is NOT repeated in the prompt).
  turn = await runTurn('follow-up', followUp, { outcome: 'completed', timeoutMs: 120_000 });
  if (turn) return turn;
  logs.push('OK: follow-up streamed to a completed provider record');

  // Turn 4 — active Stop: submit a long prompt and stop mid-stream. On Android the
  // button's accessibility text does NOT flip to "Stop generating" (RN Fabric
  // accessibility bug, cycle-3), but the SAME fixed slot morphs from Send to Stop
  // the moment the hook's status leaves 'ready' — the render flips onPress to
  // `stop`. A coordinate tap on that slot is therefore the stop control whenever
  // a stream is running, and a harmless no-op on the disabled Send pose otherwise
  // (the field self-clears on submit).
  //
  // TIMING is the whole game (cycles 4-5 lost here): the essay (maxOutputTokens
  // 4096 + a 1200-word demand) streams for well over 20 s, but ONE maestro
  // hierarchy capture costs ~9 s and ONE maestro accessibility tap ~8 s — the
  // committed driver's send-then-verify-then-tap sequence put the first stop tap
  // ~25 s after the send, exactly at the essay's natural end (cycle-6 attempt 1:
  // both stop attempts watched 1138/1495-delta essays complete untapped). So the
  // hot path does the send AND the stop tap by coordinate with ZERO device reads
  // in between (~2 s send-to-stop), and only falls back to the slow verified
  // rounds (dismiss overlays, check whether the send even landed, maestro re-send)
  // when the fast taps produce no aborted record.
  let stopExercised = false;
  for (let stopAttempt = 0; stopAttempt < 2 && !stopExercised; stopAttempt += 1) {
    const prep = prepareTurn('long', longPrompt);
    if (prep) return prep;
    // Read the control's center in the EXACT state the coordinate send will happen
    // from: prompt typed, keyboard hidden, overlays dismissed. This is the state
    // the committed driver read its winning coordinate from (cycle-6 RED run:
    // both appearances aborted at 530/491 deltas).
    dismissLogBox(serial);
    const stopCenter = sendButtonCenter(serial);
    if (!stopCenter) return fail(`could not locate the send/stop button ${stateSummary(serial)}`);
    const baseline = session.current.records().length;
    // HOT PATH — coordinate send, then coordinate stop tap, nothing in between.
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    spawnSync('sleep', ['2']); // let the status flip morph the control into Stop
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    logs.push(`OK: coordinate send + stop tap at ${stopCenter.x},${stopCenter.y}`);
    stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
    // SLOW VERIFIED FALLBACK — only when the fast taps failed to abort anything.
    for (let tapAttempt = 0; tapAttempt < 3 && !stopExercised; tapAttempt += 1) {
      const records = session.current.records();
      // A completed essay finished before the stop landed — retry the whole turn.
      // An immediate provider error leaves the composer in the error pose (Send
      // stays disabled, Retry is the recovery). Retyping into that pose is what
      // the 2026-10-09 uniwind/android/light leg did: the field kept a partial
      // essay under the IME and Send never enabled. Tap Retry, then stop the
      // new stream, instead of calling prepareTurn again.
      const lastOutcome = records[records.length - 1]?.outcome;
      if (records.length > baseline && lastOutcome === 'error') {
        logs.push('WARN: long prompt generation errored — tap Retry, then stop the new stream');
        if (!dismissThenTap(serial, 'Retry')) {
          return fail(`could not tap Retry after the long prompt errored ${stateSummary(serial)}`);
        }
        const afterError = session.current.records().length;
        spawnSync('sleep', ['2']);
        const retryCenter = sendButtonCenter(serial);
        if (!retryCenter) {
          return fail(`could not locate the send/stop button after Retry ${stateSummary(serial)}`);
        }
        adbExec(serial, ['shell', 'input', 'tap', String(retryCenter.x), String(retryCenter.y)]);
        logs.push(`OK: stop tap after error Retry at ${retryCenter.x},${retryCenter.y}`);
        stopExercised = await waitForRecordOutcome(session.current, afterError, 'aborted', 20_000);
        if (stopExercised) break;
        return fail(
          `Retry of the errored long prompt did not abort the stream ${stateSummary(serial)}`,
        );
      }
      if (records.length > baseline && lastOutcome !== 'aborted' && lastOutcome !== undefined) {
        break;
      }
      // No terminal record at all: either the stream is still running (tap again)
      // or the coordinate send was eaten by an overlay (field still holds the
      // prompt). One capture distinguishes them; the prompt is ~240 chars, the
      // empty field shows a short placeholder.
      dismissLogBox(serial);
      const fieldTextNow = parseUiHierarchy(captureHierarchy(serial)).find(
        (e) => e.accessibilityText === 'Message',
      )?.text;
      if (fieldTextNow !== undefined && fieldTextNow.length > 60) {
        logs.push('WARN: coordinate send never landed (field holds the prompt) — maestro resend');
        if (!dismissThenTap(serial, 'Send message')) {
          return fail(`could not tap "Send message" (long resend) ${stateSummary(serial)}`);
        }
        spawnSync('sleep', ['2']);
      }
      adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
      logs.push(`OK: fallback stop tap ${tapAttempt + 1} at ${stopCenter.x},${stopCenter.y}`);
      stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
    }
  }
  if (!stopExercised) {
    return fail(`active stop did not abort the stream ${stateSummary(serial)}`);
  }
  logs.push('OK: active stop aborted the stream (aborted provider record)');

  // Turn 5 — endpoint loss + retry (AC-3 case 2). Stop the OWNED backend through
  // its lifecycle handle, submit a fresh nonsecret probe turn (which must land as
  // the retained user turn alongside a sanitized error and an accessible Retry
  // control), restart the same owned endpoint, retry the retained turn, and gate
  // on a NEW completed provider record — leaving exactly ONE user turn for the
  // failed submission (regenerate resends the history, it does not duplicate it).
  const retryPrep = prepareTurn('retry probe', RETRY_PROBE_PROMPT);
  if (retryPrep) return retryPrep;
  await session.stop();
  // FIX-ORI-RN-004-3: the post-stop decision segments (probe send, Retry wait,
  // Retry tap, retry record gate) are individually bounded and heartbeated
  // (`android/endpoint-loss/*`). Their internals are synchronous spawnSync /
  // deadline loops, so the bound bites at the next event-loop yield — the
  // frozen-loop class is the harness watchdog's job — but every segment now
  // leaves its own start/done heartbeat between `backend/stop/*` and
  // `backend/restarted`, so no gap in this window is silent.
  const sent = await boundWait(
    'android/endpoint-loss/probe-send',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => dismissThenTap(serial, 'Send message'),
  );
  if (!sent) {
    return fail(`could not tap "Send message" (retry probe) ${stateSummary(serial)}`);
  }
  const retryVisible = await boundWait(
    'android/endpoint-loss/retry-wait',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => waitForText(serial, 'Retry', 60_000),
  );
  if (!retryVisible) {
    return fail(`no accessible Retry control after endpoint loss ${stateSummary(serial)}`);
  }
  if (hierarchyContains(serial, 'sk-') || hierarchyContains(serial, 'OPENAI_API_KEY')) {
    return fail('endpoint-loss error surface leaked credential material');
  }
  logs.push('OK: endpoint loss surfaced a sanitized error with an accessible Retry');
  await session.restart();
  assertBackendReady(session.current);
  // The owner record file is NOT cleared on restart. Count from here, the same
  // way the web leg does, so an older completed row cannot satisfy the gate.
  let recordsBeforeRetry = session.current.records().length;
  const retryTapped = await boundWait(
    'android/endpoint-loss/retry-tap',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => dismissThenTap(serial, 'Retry'),
  );
  if (!retryTapped) {
    return fail(`could not tap "Retry" ${stateSummary(serial)}`);
  }
  let retryCompleted = await boundWait(
    'android/endpoint-loss/retry-record',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => waitForRecordOutcome(session.current, recordsBeforeRetry, 'completed', 120_000),
  );
  if (!retryCompleted) {
    const records = session.current.records();
    const last = records[records.length - 1];
    if (last !== undefined && last.outcome === 'error' && records.length > recordsBeforeRetry) {
      logs.push('WARN: first Retry produced a provider error — tap Retry once more');
      const again = await boundWait(
        'android/endpoint-loss/retry-tap-again',
        BACKEND_PORT,
        WAIT_BOUND_NATIVE_SEGMENT_MS,
        async () => dismissThenTap(serial, 'Retry'),
      );
      if (!again) {
        return fail(`could not tap "Retry" again ${stateSummary(serial)}`);
      }
      recordsBeforeRetry = records.length;
      retryCompleted = await boundWait(
        'android/endpoint-loss/retry-record-again',
        BACKEND_PORT,
        WAIT_BOUND_NATIVE_SEGMENT_MS,
        async () => waitForRecordOutcome(session.current, recordsBeforeRetry, 'completed', 120_000),
      );
    }
  }
  if (!retryCompleted) {
    return fail(
      `retry never produced a completed provider record — observed: ${JSON.stringify(
        session.current.records(),
      )} stderr: ${session.current.stderrText().slice(-1000)}`,
    );
  }
  const probe = transcriptProbeCount('android', serial, RETRY_PROBE_PROMPT, legDir);
  if (probe.count !== 1) {
    return fail(
      `retry probe appears ${probe.count}x in the transcript (expected exactly 1; oracle channel: ${probe.channel}${probe.artifacts.length > 0 ? `; artifacts: ${probe.artifacts.join(', ')}` : ''}) ${stateSummary(serial)}`,
    );
  }
  logs.push(
    `OK: retry completed on a new request (${session.current.records()[0]?.requestId ?? 'n/a'}) with exactly 1 retained user turn (oracle channel: ${probe.channel})`,
  );

  return { exit: 0, output: logs.join('\n') };
}

/* ------------------------------------------------------------ web export -- */

function exportExampleWeb(): { exit: number; output: string; distDir: string } {
  const distDir = join(tmpdir(), `ori-rn-004-web-dist-${Date.now()}`);
  mkdirSync(distDir, { recursive: true });
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  // Same-origin: the browser fetches the proxy origin, not the backend directly.
  process.env.EXPO_PUBLIC_API_BASE_URL = `http://127.0.0.1:${WEB_PORT}`;
  const removedCreds = stripCredentialEnv();
  try {
    const res = runShell(
      `npx expo export --platform web --output-dir "${distDir}"`,
      EXAMPLE_ROOT,
      30 * 60_000,
    );
    return { exit: res.exit, output: res.output, distDir };
  } finally {
    restoreCredentialEnv(removedCreds);
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = previous;
    }
  }
}

/* --------------------------------------------------------- web proxy serve -- */

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.txt': 'text/plain',
};

/**
 * Headers must arrive before this or the owned backend is treated as down.
 * A pooled keep-alive socket to a dead process would otherwise sit until the
 * driver's Retry wait (30s) expires. Cleared once headers arrive so a live
 * stream is not aborted mid-body.
 */
const UPSTREAM_HEADERS_BOUND_MS = 4_000;

async function fetchOwnedChatUpstream(url: string, body: Buffer): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_HEADERS_BOUND_MS);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: controller.signal,
    });
  } catch {
    // Any fetch failure, not only a dead upstream, is answered as unavailable (fail closed).
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function writeUpstreamUnavailable(res: ServerResponse): void {
  res.writeHead(502, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'upstream unavailable' }));
}

/**
 * Serves the static web export and forwards POST /api/chat to the real backend on the
 * same origin — the browser never crosses origins, so no CORS preflight is required.
 * The upstream SSE response is streamed back verbatim. A dead upstream is a fast
 * 502 JSON error, the same fail-closed shape as the teeing proxy, never a hang
 * and never a generic 404.
 */
export function serveWithChatProxy(
  distDir: string,
  port: number,
  session: BackendSession,
): Promise<{ server: Server; url: string; port: number }> {
  heartbeat('web/proxy-listen', `127.0.0.1:${port}`);
  return new Promise((resolveServe, reject) => {
    // fallow-ignore-next-line complexity
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
        if (url.pathname === '/api/chat' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
          }
          // Read the CURRENT handle per request: the retry leg restarts the owned
          // backend (same host:port), and the proxy must forward to the new child.
          const upstream = await fetchOwnedChatUpstream(
            `http://${session.current.host}:${session.current.port}/api/chat`,
            Buffer.concat(chunks),
          );
          if (upstream === null) {
            writeUpstreamUnavailable(res);
            return;
          }
          res.writeHead(upstream.status, {
            'content-type': upstream.headers.get('content-type') ?? 'text/event-stream',
          });
          if (upstream.body) {
            Readable.fromWeb(upstream.body as never).pipe(res);
          } else {
            res.end();
          }
          return;
        }

        let path = url.pathname;
        if (path === '/') path = '/index.html';
        let filePath = join(distDir, path);
        if (!existsSync(filePath) && !extname(path)) filePath = `${filePath}.html`;
        if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
        const body = readFileSync(filePath);
        res.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    const listenTimer = setTimeout(() => {
      const detail =
        `stalled await: step=web/proxy-listen port=${port} ` +
        `boundMs=${WAIT_BOUND_PROXY_LISTEN_MS} lastHeartbeat=${lastHeartbeatText()}`;
      heartbeat('web/proxy-listen/stalled', detail);
      server.closeAllConnections();
      server.close();
      reject(new StallError(detail));
    }, WAIT_BOUND_PROXY_LISTEN_MS);
    server.on('error', (error) => {
      clearTimeout(listenTimer);
      reject(error);
    });
    server.listen(port, '127.0.0.1', () => {
      clearTimeout(listenTimer);
      heartbeat('web/proxy-listening', `127.0.0.1:${port}`);
      resolveServe({ server, port, url: `http://127.0.0.1:${port}` });
    });
  });
}

/**
 * Bounded proxy shutdown. Node completes server.close()'s callback only after
 * EVERY connection to the proxy has ended — an idle keep-alive socket or an
 * open request whose body never completes blocks it forever, and pre-fix the
 * driver simply waited (the demonstrated unbounded await). Now: idle
 * connections are closed up front, and if the callback is still unresolved at
 * the bound, all connections are destroyed and the shutdown resolves with the
 * stall recorded as a heartbeat diagnostic naming the step and the port.
 */
export function stopServer(handle: { server: Server } | null): Promise<void> {
  if (!handle) return Promise.resolve();
  const address = handle.server.address();
  const port = typeof address === 'object' && address !== null ? address.port : null;
  heartbeat('web/proxy-close/start', port !== null ? `port=${port}` : undefined);
  return new Promise((resolveStop) => {
    let settled = false;
    const finish = (how: string): void => {
      if (settled) return;
      settled = true;
      clearTimeout(closeTimer);
      heartbeat('web/proxy-close/done', `${how}${port !== null ? ` port=${port}` : ''}`);
      resolveStop();
    };
    handle.server.closeIdleConnections();
    handle.server.close(() => finish('close-callback'));
    const closeTimer = setTimeout(() => {
      const detail =
        `stalled await: step=web/proxy-close port=${port ?? 'unknown'} ` +
        `boundMs=${WAIT_BOUND_PROXY_CLOSE_MS} lastHeartbeat=${lastHeartbeatText()}`;
      heartbeat('web/proxy-close/stalled', detail);
      handle.server.closeAllConnections();
      // Give the destroyed-connections close callback a short grace to fire
      // normally, then resolve regardless — the listener is closed and every
      // connection is destroyed; nothing may keep the pipeline waiting.
      setTimeout(() => finish('forced-close-all-connections'), 2_000);
    }, WAIT_BOUND_PROXY_CLOSE_MS);
  });
}

/* ---------------------------------------------------------- web driver -- */

type WebLegResult = {
  emptyStateVisible: boolean;
  markerSubmitted: boolean;
  inputCleared: boolean;
  assistantResponded: boolean;
  stopControlVisible: boolean;
  followUpRecallVisible: boolean;
  retryControlVisible: boolean;
  retryErrorSanitized: boolean;
  retryCompleted: boolean;
  retrySingleUserTurn: boolean;
  error?: string;
};

async function launchChromiumBrowser(): Promise<Browser> {
  const removedCreds = stripCredentialEnv();
  try {
    return await boundWait(
      'web/chromium-launch',
      null,
      60_000,
      async () => await chromium.launch({ headless: true }),
    );
  } finally {
    restoreCredentialEnv(removedCreds);
  }
}

/**
 * Drives the served web export through the real live-chat flow: empty state, submit a
 * marker, submit the seed prompt and observe its real streamed assistant reply (the
 * seed asks for rain facts, so the reply must mention rain), submit a contextual
 * follow-up, then activate Stop during an active request. Returns discrete booleans
 * for the driver to turn into a pass/fail verdict (never an authored success flag).
 */
async function driveLiveWeb(
  browser: Browser,
  url: string,
  marker: string,
  seedPrompt: string,
  followUp: string,
  session: BackendSession,
): Promise<WebLegResult> {
  const result: WebLegResult = {
    emptyStateVisible: false,
    markerSubmitted: false,
    inputCleared: false,
    assistantResponded: false,
    stopControlVisible: false,
    followUpRecallVisible: false,
    retryControlVisible: false,
    retryErrorSanitized: false,
    retryCompleted: false,
    retrySingleUserTurn: false,
  };

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    heartbeat('web/drive/start', url);
    await page.goto(`${url}/live-chat`, { waitUntil: 'networkidle', timeout: 60_000 });

    await page
      .getByText('Live chat', { exact: true })
      .waitFor({ timeout: 30_000 })
      .catch(() => {});
    result.emptyStateVisible = await page
      .getByText('Start a conversation', { exact: true })
      .isVisible()
      .catch(() => false);
    heartbeat('web/drive/empty-state-checked', `visible=${result.emptyStateVisible}`);

    const textarea = page.getByLabel('Message', { exact: true });
    await textarea.click().catch(() => {});
    await textarea.fill(marker);
    const send = page.getByLabel('Send message', { exact: true });
    await send.click().catch(() => {});
    await page
      .waitForFunction(`document.querySelector('textarea[aria-label="Message"]')?.value === ''`, {
        timeout: 15_000,
      })
      .catch(() => {});
    result.inputCleared = (await textarea.inputValue().catch(() => marker)) === '';
    result.markerSubmitted = await page
      .getByText(marker, { exact: true })
      .isVisible()
      .catch(() => false);
    heartbeat('web/drive/marker-turn-checked', `submitted=${result.markerSubmitted}`);

    // Seed turn: submit the SAME seed prompt the native legs submit (it asks for
    // "three short facts about rain"), then await its real streamed reply. The old
    // driver asserted rain from a reply to a prompt it never sent — the model's
    // answer to a bare marker does not mention rain, so assistantResponded was
    // deterministically false (the documented cycle-2/3 web false-negative).
    await textarea.fill(seedPrompt);
    await send.click().catch(() => {});
    await page
      .waitForFunction(`document.querySelector('textarea[aria-label="Message"]')?.value === ''`, {
        timeout: 15_000,
      })
      .catch(() => {});
    await page
      .waitForFunction(
        `[...document.querySelectorAll('div')].some(d => d.textContent && d.textContent.includes('rain'))`,
        { timeout: 90_000 },
      )
      .catch(() => {});
    result.assistantResponded = await page
      .getByText(/rain/i)
      .first()
      .isVisible()
      .catch(() => false);
    heartbeat('web/drive/seed-reply-checked', `responded=${result.assistantResponded}`);

    // Contextual follow-up (marker is NOT repeated in the prompt).
    await textarea.fill(followUp);
    await send.click().catch(() => {});
    await page
      .waitForFunction(`document.querySelector('textarea[aria-label="Message"]')?.value === ''`, {
        timeout: 15_000,
      })
      .catch(() => {});
    const recall = await page
      .waitForFunction(
        `[...document.querySelectorAll('div')].some(d => d.textContent && d.textContent.includes(${JSON.stringify(marker)}))`,
        { timeout: 90_000 },
      )
      .then(() => true)
      .catch(() => false);
    result.followUpRecallVisible = recall;
    heartbeat('web/drive/follow-up-checked', `recall=${recall}`);

    // Active stop: submit a long prompt and catch the stop control mid-stream.
    await textarea.fill(LONG_PROMPT);
    await send.click().catch(() => {});
    const stop = page.getByLabel('Stop generating', { exact: true });
    await stop.waitFor({ timeout: 30_000 }).catch(() => {});
    result.stopControlVisible = await stop.isVisible().catch(() => false);
    await stop.click().catch(() => {});
    // The aborted essay settles back to the idle composer before the retry probe.
    await page
      .getByLabel('Send message', { exact: true })
      .waitFor({ timeout: 30_000 })
      .catch(() => {});
    heartbeat('web/drive/stop-turn-checked', `stopControlVisible=${result.stopControlVisible}`);

    // Endpoint loss + retry (AC-3 case 2): stop the OWNED backend, submit a fresh
    // probe turn, observe the sanitized alert + accessible Retry, restart the same
    // owned endpoint, retry the retained turn, and gate on a NEW completed provider
    // record — the probe text must appear exactly once (regenerate does not
    // duplicate the retained user turn).
    //
    // FIX-ORI-RN-004-3: every segment between `session.stop()` completing and
    // `session.restart()` being issued (and the retry tap after it) is individually
    // bounded and heartbeated (`web/endpoint-loss/*`). Pre-fix this window was
    // silent: the fill/send/Retry-wait/alert-read awaits carried no driver-side
    // bound and emitted no heartbeat, so a segment that never returned left the
    // run parked after the `backend/stop/*` family with nothing firing — the
    // orchestrated run ORI-AI-002-1789975643876 stall. Each boundWait names its
    // segment, the backend port, its bound, and the last heartbeat; onExpiry
    // closes the page best-effort so a wedged op cannot outlive its bound.
    await session.stop();
    const forcePageClose = (): void => {
      page.close().catch(() => {});
    };
    await boundWait(
      'web/endpoint-loss/probe-fill',
      BACKEND_PORT,
      WAIT_BOUND_WEB_SEGMENT_MS,
      async () => {
        await textarea.fill(RETRY_PROBE_PROMPT);
      },
      forcePageClose,
    );
    await boundWait(
      'web/endpoint-loss/probe-send',
      BACKEND_PORT,
      WAIT_BOUND_WEB_SEGMENT_MS,
      async () => {
        await send.click().catch(() => {});
      },
      forcePageClose,
    );
    const retry = page.getByLabel('Retry', { exact: true });
    await boundWait(
      'web/endpoint-loss/retry-wait',
      BACKEND_PORT,
      WAIT_BOUND_WEB_SEGMENT_MS,
      async () => {
        await retry.waitFor({ timeout: 30_000 }).catch(() => {});
      },
      forcePageClose,
    );
    result.retryControlVisible = await retry.isVisible().catch(() => false);
    await boundWait(
      'web/endpoint-loss/alert-read',
      BACKEND_PORT,
      WAIT_BOUND_WEB_SEGMENT_MS,
      async () => {
        const alertText = await page
          .getByRole('alert')
          .first()
          .textContent()
          .catch(() => null);
        result.retryErrorSanitized =
          alertText !== null &&
          alertText.length > 0 &&
          !alertText.includes('sk-') &&
          !alertText.includes('OPENAI_API_KEY');
      },
      forcePageClose,
    );
    await session.restart();
    // A restarted handle may start empty (an owned child) or re-read every prior
    // record (an owner file), so count on the handle the retry is observed through:
    // after the restart, before the click. Nothing records between stop and restart.
    const recordsBeforeRetry = session.current.records().length;
    await boundWait(
      'web/endpoint-loss/retry-click',
      BACKEND_PORT,
      WAIT_BOUND_WEB_SEGMENT_MS,
      async () => {
        await retry.click().catch(() => {});
      },
      forcePageClose,
    );
    result.retryCompleted = await waitForRecordOutcome(
      session.current,
      recordsBeforeRetry,
      'completed',
      120_000,
    );
    result.retrySingleUserTurn =
      (await page
        .getByText(RETRY_PROBE_PROMPT, { exact: true })
        .count()
        .catch(() => 0)) === 1;
    heartbeat(
      'web/drive/retry-checked',
      `completed=${result.retryCompleted} singleUserTurn=${result.retrySingleUserTurn}`,
    );
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
    heartbeat('web/drive/error', result.error);
  } finally {
    await boundWait('web/context-close', null, WAIT_BOUND_BROWSER_MS, async () => {
      await context.close().catch(() => {});
    });
  }
  heartbeat('web/drive/end');
  return result;
}

/* ---------------------------------------------------------- native leg -- */

/**
 * iOS endpoint-loss + retry phase (AC-3 case 2) — the Android equivalent lives at
 * the end of runAndroidInputFlow. Stops the OWNED backend, submits the probe turn
 * through a real composer flow, observes the sanitized error + accessible Retry,
 * restarts the endpoint, retries, and gates on a NEW completed provider record with
 * exactly one retained user turn, counted by the hardened transcript oracle
 * (see transcriptProbeCount).
 */
// fallow-ignore-next-line complexity
async function runIosEndpointLossRetry(
  deviceId: string,
  session: BackendSession,
  legDir: string,
): Promise<{ ok: boolean; log: string }> {
  dismissLogBox(deviceId);
  await session.stop();
  // FIX-ORI-RN-004-3: bounded, heartbeated post-stop decision segments
  // (`ios/endpoint-loss/*`) between `backend/stop/*` and `backend/restarted` —
  // same rationale as the android/web windows; see WAIT_BOUND_WEB_SEGMENT_MS.
  const sent = await boundWait(
    'ios/endpoint-loss/probe-type-send',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => maestroTypeAndSend(deviceId, RETRY_PROBE_PROMPT),
  );
  if (!sent) {
    return { ok: false, log: 'could not type + send the retry probe (maestro flow failed)' };
  }
  const retryVisible = await boundWait(
    'ios/endpoint-loss/retry-wait',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => waitForText(deviceId, 'Retry', 60_000),
  );
  if (!retryVisible) {
    return { ok: false, log: 'no accessible Retry control after endpoint loss' };
  }
  if (hierarchyContains(deviceId, 'sk-') || hierarchyContains(deviceId, 'OPENAI_API_KEY')) {
    return { ok: false, log: 'endpoint-loss error surface leaked credential material' };
  }
  await session.restart();
  assertBackendReady(session.current);
  // The owner record file is NOT cleared on restart. Count from here, the same
  // way the web leg does, so an older completed row cannot satisfy the gate.
  let recordsBeforeRetry = session.current.records().length;
  const retryTapped = await boundWait(
    'ios/endpoint-loss/retry-tap',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => dismissThenTap(deviceId, 'Retry'),
  );
  if (!retryTapped) {
    return { ok: false, log: 'could not tap "Retry"' };
  }
  let retryCompleted = await boundWait(
    'ios/endpoint-loss/retry-record',
    BACKEND_PORT,
    WAIT_BOUND_NATIVE_SEGMENT_MS,
    async () => waitForRecordOutcome(session.current, recordsBeforeRetry, 'completed', 120_000),
  );
  if (!retryCompleted) {
    const records = session.current.records();
    const last = records[records.length - 1];
    if (last !== undefined && last.outcome === 'error' && records.length > recordsBeforeRetry) {
      const again = await boundWait(
        'ios/endpoint-loss/retry-tap-again',
        BACKEND_PORT,
        WAIT_BOUND_NATIVE_SEGMENT_MS,
        async () => dismissThenTap(deviceId, 'Retry'),
      );
      if (!again) {
        return { ok: false, log: 'could not tap "Retry" again after the provider error' };
      }
      recordsBeforeRetry = records.length;
      retryCompleted = await boundWait(
        'ios/endpoint-loss/retry-record-again',
        BACKEND_PORT,
        WAIT_BOUND_NATIVE_SEGMENT_MS,
        async () => waitForRecordOutcome(session.current, recordsBeforeRetry, 'completed', 120_000),
      );
    }
  }
  if (!retryCompleted) {
    return {
      ok: false,
      log: `retry never produced a completed provider record — observed: ${JSON.stringify(
        session.current.records(),
      )} stderr: ${session.current.stderrText().slice(-1000)}`,
    };
  }
  let probe: { count: number; channel: string; artifacts: string[] };
  try {
    probe = transcriptProbeCount('ios', deviceId, RETRY_PROBE_PROMPT, legDir);
  } catch (e) {
    return {
      ok: false,
      log: `retry-state pixel oracle failed: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (probe.count !== 1) {
    return {
      ok: false,
      log: `retry probe appears ${probe.count}x in the transcript (expected exactly 1; oracle channel: ${probe.channel}${probe.artifacts.length > 0 ? `; artifacts: ${probe.artifacts.join(', ')}` : ''})`,
    };
  }
  return {
    ok: true,
    log: `endpoint loss + retry OK (new request ${session.current.records()[0]?.requestId ?? 'n/a'}, exactly 1 retained user turn — oracle channel: ${probe.channel})`,
  };
}

async function runNativeLeg(
  platform: 'ios' | 'android',
  reservation: { id: string },
  metro: MetroHandle,
  session: BackendSession,
  runId: string,
): Promise<LegOutcome[]> {
  const outcomes: LegOutcome[] = [];
  for (const appearance of ['light', 'dark'] as Appearance[]) {
    outcomes.push(
      await runNativeAppearance(platform, reservation.id, appearance, metro, session, runId),
    );
  }
  return outcomes;
}

// fallow-ignore-next-line complexity
async function runNativeAppearance(
  platform: 'ios' | 'android',
  deviceId: string,
  appearance: Appearance,
  metro: MetroHandle,
  session: BackendSession,
  runId: string,
): Promise<LegOutcome> {
  const marker = markerFor(runId, platform);
  const legDir = join(EVIDENCE_ROOT, platform, appearance);
  mkdirSync(legDir, { recursive: true });

  try {
    setAppearance(platform, deviceId, appearance);
    openExpoGo(platform, deviceId, liveChatOpenUrl(metro));
    if (platform === 'android') {
      dismissAndroidSystemDialogs();
    }

    const flow =
      platform === 'android'
        ? await runAndroidInputFlow(
            deviceId,
            session,
            marker,
            seedPromptFor(marker),
            FOLLOW_UP_PROMPT,
            LONG_PROMPT,
            legDir,
          )
        : runLiveMaestro(deviceId, {
            MARKER: marker,
            SEED_PROMPT: seedPromptFor(marker),
            FOLLOW_UP_PROMPT: FOLLOW_UP_PROMPT,
            LONG_PROMPT,
          });
    // iOS: the endpoint-loss + retry phase runs around the main flow (the Android
    // flow drives its own — its input path is adb-based, not the yaml).
    let retryLog: string | null = null;
    let retryFailed = false;
    if (platform === 'ios' && flow.exit === 0) {
      const retry = await runIosEndpointLossRetry(deviceId, session, legDir);
      retryLog = retry.log;
      retryFailed = !retry.ok;
    }
    // Capture the observed UI state in BOTH outcomes — a failed retry phase must
    // still leave this run's screenshot/hierarchy, not a stale earlier run's.
    const screenshotPath = join(legDir, 'screenshot.png');
    captureScreenshot(platform, deviceId, screenshotPath);
    const hierarchy = captureHierarchy(deviceId);
    if (retryFailed) {
      return {
        platform,
        status: 'failed',
        diagnostic: `endpoint-loss/retry phase failed: ${retryLog}`,
        evidence: {
          marker,
          appearance,
          maestro_exit: flow.exit,
          maestro_output: flow.output.slice(-4000),
          retry_log: retryLog,
          screenshot: screenshotPath,
          hierarchy: hierarchy.slice(0, 4000),
          hierarchy_has_marker: hierarchy.includes(marker),
        },
      };
    }

    const records = session.allRecords();
    const latestRecord = records[records.length - 1] ?? null;

    return {
      platform,
      status: flow.exit === 0 ? 'passed' : 'failed',
      diagnostic: flow.exit === 0 ? undefined : `${flow.output.slice(-3000)}`,
      evidence: {
        marker,
        appearance,
        maestro_exit: flow.exit,
        maestro_output: flow.output.slice(-4000),
        retry_log: retryLog,
        screenshot: screenshotPath,
        hierarchy: hierarchy.slice(0, 4000),
        hierarchy_has_marker: hierarchy.includes(marker),
        latest_backend_record: latestRecord ?? null,
      },
    };
  } catch (e) {
    return {
      platform,
      status: 'failed',
      diagnostic: e instanceof Error ? e.message : String(e),
      evidence: {
        marker,
        appearance,
        error: e instanceof Error ? e.stack : String(e),
      },
    };
  }
}

/* --------------------------------------------------------- orchestrator -- */

function validateOptions(options: ProofOptions): void {
  if (options.sourceSha !== undefined && options.sourceSha !== readSourceSha()) {
    throw new Error(
      `source mismatch: app/live-chat.tsx hash ${options.sourceSha} != ${readSourceSha()}`,
    );
  }
  if (options.platforms.length === 0) {
    throw new Error('no platforms requested');
  }
}

// fallow-ignore-next-line complexity
async function runAllLegs(options: ProofOptions, session: BackendSession): Promise<LegOutcome[]> {
  const { platforms, runId } = options;
  const legs: LegOutcome[] = [];
  const hasNative = platforms.includes('ios') || platforms.includes('android');
  const reservations = hasNative ? reserveDevices() : null;

  let metro: MetroHandle | null = null;
  try {
    if (reservations) {
      heartbeat('legs/native-prep/start');
      installExpoGoIos(reservations.ios.id);
      installExpoGoAndroid(
        reservations.android.id,
        join(
          process.env.HOME ?? '',
          '.cache',
          'agent-scratch',
          'opencode',
          'ori-rn-003',
          'Expo-Go-57.0.9.apk',
        ),
      );
      reverseBackendPort(BACKEND_PORT);
      metro = startLiveMetro(
        `http://${BACKEND_HOST}:${BACKEND_PORT}`,
        join(EVIDENCE_ROOT, 'metro.log'),
      );
      heartbeat('legs/native-prep/end', `metroPort=${METRO_PORT}`);
    }

    for (const platform of platforms) {
      heartbeat(`legs/${platform}/start`);
      try {
        if (platform === 'web') {
          legs.push(await withLegBudget('web', () => runWebLeg(session, runId)));
        } else if (platform === 'ios') {
          if (!reservations) throw new Error('no iOS reservation');
          legs.push(
            ...(await withLegBudget('ios', () =>
              runNativeLeg(platform, reservations.ios, metro as MetroHandle, session, runId),
            )),
          );
        } else {
          if (!reservations) throw new Error('no Android reservation');
          legs.push(
            ...(await withLegBudget('android', () =>
              runNativeLeg(platform, reservations.android, metro as MetroHandle, session, runId),
            )),
          );
        }
      } catch (e) {
        if (e instanceof StallError) {
          // The leg budget fired: record the named-step failure and continue —
          // the remaining legs still run and the manifest is still written.
          legs.push({
            platform,
            status: 'failed',
            diagnostic: e.message,
            evidence: { stall: e.message, last_heartbeat: lastHeartbeatText() },
          });
        } else {
          throw e;
        }
      }
      heartbeat(`legs/${platform}/end`);
    }
  } finally {
    heartbeat('legs/teardown/start');
    if (metro) stopMetro(metro);
    if (reservations) removeBackendReverse(BACKEND_PORT);
    heartbeat('legs/teardown/end');
  }

  return legs;
}

/** Every observed web-drive flag except `error` (a diagnostic, not an oracle). */
const WEB_LEG_FLAGS: (keyof WebLegResult)[] = [
  'emptyStateVisible',
  'markerSubmitted',
  'inputCleared',
  'assistantResponded',
  'followUpRecallVisible',
  'stopControlVisible',
  'retryControlVisible',
  'retryErrorSanitized',
  'retryCompleted',
  'retrySingleUserTurn',
];

function webLegPassed(result: WebLegResult): boolean {
  return WEB_LEG_FLAGS.every((key) => result[key] === true);
}

async function runWebLeg(session: BackendSession, runId: string): Promise<LegOutcome> {
  const marker = markerFor(runId, 'web');
  const legDir = join(EVIDENCE_ROOT, 'web');
  mkdirSync(legDir, { recursive: true });
  heartbeat('web/leg/start', `runId=${runId}`);

  try {
    heartbeat('web/export/start');
    const exported = exportExampleWeb();
    heartbeat('web/export/end', `exit=${exported.exit}`);
    if (exported.exit !== 0) {
      return {
        platform: 'web',
        status: 'blocked',
        diagnostic: `expo export --platform web failed:\n${exported.output.slice(-3000)}`,
        evidence: { marker, export_exit: exported.exit, export_log: exported.output.slice(-4000) },
      };
    }

    const served = await serveWithChatProxy(exported.distDir, WEB_PORT, session);
    try {
      const browser = await launchChromiumBrowser();
      try {
        const result = await driveLiveWeb(
          browser,
          served.url,
          marker,
          seedPromptFor(marker),
          FOLLOW_UP_PROMPT,
          session,
        );
        const passed = webLegPassed(result);
        return {
          platform: 'web',
          status: passed ? 'passed' : 'failed',
          diagnostic: passed ? undefined : JSON.stringify(result),
          evidence: {
            marker,
            url: served.url,
            drive_result: result,
            backend_records: session.allRecords().slice(-5),
            retry_request_id: session.current.records()[0]?.requestId ?? null,
          },
        };
      } finally {
        await boundWait('web/browser-close', null, WAIT_BOUND_BROWSER_MS, async () => {
          await browser.close().catch(() => {});
        });
      }
    } finally {
      await stopServer(served);
    }
  } catch (e) {
    // A StallError is the bounded-wait diagnostic itself: surface it as the
    // leg's failure (naming the step, port, and last heartbeat) so the run
    // records the stall and still writes its manifest — never an idle hang.
    return {
      platform: 'web',
      status: 'failed',
      diagnostic: e instanceof Error ? e.message : String(e),
      evidence: {
        marker,
        stall: e instanceof StallError,
        last_heartbeat: lastHeartbeatText(),
      },
    };
  } finally {
    heartbeat('web/leg/end');
  }
}

function countPlatformsPassed(legs: LegOutcome[]): { passed: number; completed: boolean } {
  const byPlatform = new Map<string, LegOutcome[]>();
  for (const leg of legs) {
    const list = byPlatform.get(leg.platform) ?? [];
    list.push(leg);
    byPlatform.set(leg.platform, list);
  }
  const passed = [...byPlatform.values()].filter((list) =>
    list.every((o) => o.status === 'passed'),
  ).length;
  return { passed, completed: passed === 3 };
}

async function runLiveExampleProof(options: ProofOptions): Promise<ProofResult> {
  const { runId } = options;
  validateOptions(options);
  const outputDir = options.outputDir ?? EVIDENCE_ROOT;
  mkdirSync(outputDir, { recursive: true });
  const previousHeartbeatRun = heartbeatRun;
  heartbeatRun = runId;
  heartbeat(
    'pipeline/start',
    `platforms=${options.platforms.join(',')} backendPassed=${options.backend !== undefined}`,
  );

  try {
    const backend = await ensureBackend(options);
    assertBackendReady(backend);
    const session = new BackendSession(backend);

    let legs: LegOutcome[];
    try {
      legs = await runAllLegs(options, session);
    } finally {
      // Stop what we own: a caller-passed handle we never replaced stays theirs.
      // BOUNDED: with a caller-provided adapter handle this await previously had
      // no bound — an unconfirming stop stranded the run here AFTER every child
      // was already gone (no metro, no chromium, no manifest), the exact silent
      // idle of orchestrated run ORI-AI-002-1789929365070. Now it fails fast
      // with a named-step diagnostic and the manifest is still written.
      if (!options.backend || session.current !== session.initial) {
        try {
          await session.stop();
        } catch (e) {
          heartbeat(
            'pipeline/final-backend-stop/stalled',
            e instanceof Error ? e.message : String(e),
          );
        }
      }
    }

    const { passed, completed } = countPlatformsPassed(legs);
    writeManifest(runId, legs, passed, completed, session);
    heartbeat(
      'pipeline/manifest-written',
      `passed=${passed} completed=${completed} heartbeatEntries=${heartbeatEntries.length}`,
    );

    return { runId, legs, completed };
  } finally {
    heartbeat('pipeline/end');
    heartbeatRun = previousHeartbeatRun;
  }
}

function writeManifest(
  runId: string,
  legs: LegOutcome[],
  passed: number,
  completed: boolean,
  session: BackendSession,
): void {
  const manifest = {
    task: 'ORI-RN-004',
    run_id: runId,
    candidate_head_sha: gitHead(),
    generated_at: nowIso(),
    commands: [
      'pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web',
    ],
    source_sha: { 'app/live-chat.tsx': readSourceSha() },
    backend: {
      model: session.current.model,
      host: session.current.host,
      port: session.current.port,
      record_count: session.allRecords().length,
    },
    passed_platforms: passed,
    completed,
    legs,
  };
  mkdirSync(EVIDENCE_ROOT, { recursive: true });
  writeFileSync(join(EVIDENCE_ROOT, 'run-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const correlation = {
    run_id: runId,
    backend_records: session.allRecords().map((record) => ({
      requestId: record.requestId,
      provider: record.provider,
      providerModel: record.providerModel,
      responseId: record.responseId,
      outcome: record.outcome,
      deltaCount: record.deltaCount,
      textHash: record.textHash,
    })),
  };
  writeFileSync(
    join(EVIDENCE_ROOT, 'provider-correlation.json'),
    `${JSON.stringify(correlation, null, 2)}\n`,
  );
}

/* ------------------------------------------------------ compiler case -- */

/**
 * AC-5: run the actual TypeScript commands. The scoped live-import graph must compile
 * (exit 0) with the live route and its installed component imports in the program; the
 * whole-example diagnostic is retained separately with its full output and exit status.
 * A negative control proves the program-files assertion is a real compiler read, not a
 * static receipt.
 */
export async function runLiveImportGraphCompiler(
  outputDir: string,
): Promise<Record<string, unknown>> {
  mkdirSync(outputDir, { recursive: true });

  // The compiler must never see provider credentials (CRITICAL CONSTRAINT); see
  // stripCredentialEnv's doc comment above startLiveMetro.
  const removedCreds = stripCredentialEnv();
  let scoped: { exit: number; output: string };
  let files: { exit: number; output: string };
  let whole: { exit: number; output: string };
  let negativeFiles: { exit: number; output: string };
  try {
    scoped = run(`pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json`, REPO_ROOT);
    files = run(
      `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json --listFilesOnly`,
      REPO_ROOT,
    );
    whole = run(`pnpm --dir apps/example exec tsc --noEmit`, REPO_ROOT);

    // Negative control: a scoped config that omits the route must NOT list it. This
    // proves the program-includes assertion reads the real compiler program.
    const negativeConfig = join(tmpdir(), `ori-rn-004-negative-${Date.now()}.json`);
    writeFileSync(
      negativeConfig,
      JSON.stringify(
        {
          extends: join(EXAMPLE_ROOT, 'tsconfig.live-chat.json'),
          include: ['expo-env.d.ts', 'lib/live-chat-config.ts'],
        },
        null,
        2,
      ),
    );
    negativeFiles = run(
      `pnpm --dir apps/example exec tsc --noEmit -p ${negativeConfig} --listFilesOnly`,
      REPO_ROOT,
    );
  } finally {
    restoreCredentialEnv(removedCreds);
  }
  const routeAbsentFromNegative = !negativeFiles.output.includes('app/live-chat.tsx');

  const program = files.output;
  const programIncludes = {
    'app/live-chat.tsx': program.includes('app/live-chat.tsx'),
    'components/live-chat-screen.tsx': program.includes('components/live-chat-screen.tsx'),
    'components/live-chat-message.tsx': program.includes('components/live-chat-message.tsx'),
    'components/ai/conversation.tsx': program.includes('components/ai/conversation.tsx'),
    'components/ai/message.tsx': program.includes('components/ai/message.tsx'),
    'components/ai/prompt-input.tsx': program.includes('components/ai/prompt-input.tsx'),
  };

  const scopedPass = scoped.exit === 0;
  const liveRouteInProgram = programIncludes['app/live-chat.tsx'] === true;
  const screenInProgram = programIncludes['components/live-chat-screen.tsx'] === true;
  const messageInProgram = programIncludes['components/live-chat-message.tsx'] === true;
  const conversationInProgram = programIncludes['components/ai/conversation.tsx'] === true;

  const result = {
    task: 'ORI-RN-004',
    case: 'ORI-RN-004-AC-5-live-import-graph-compiler',
    candidate_head_sha: gitHead(),
    generated_at: nowIso(),
    source_sha: { 'app/live-chat.tsx': readSourceSha() },
    scoped: {
      command: 'pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json',
      exit: scoped.exit,
      program_includes: programIncludes,
    },
    whole_example: {
      command: 'pnpm --dir apps/example exec tsc --noEmit',
      exit: whole.exit,
    },
    negative_control: {
      route_absent_from_omit_config: routeAbsentFromNegative,
    },
    assertions: {
      scoped_compiler_exit_zero: scopedPass,
      live_route_in_program: liveRouteInProgram,
      screen_in_program: screenInProgram,
      message_in_program: messageInProgram,
      conversation_in_program: conversationInProgram,
      negative_control_holds: routeAbsentFromNegative,
    },
    passed:
      scopedPass &&
      liveRouteInProgram &&
      screenInProgram &&
      messageInProgram &&
      conversationInProgram &&
      routeAbsentFromNegative,
  };

  writeFileSync(
    join(outputDir, 'live-import-graph-typecheck.txt'),
    `${[
      `ORI-RN-004 AC-5 live-import-graph compiler — ${result.passed ? 'PASS' : 'FAIL'}`,
      `candidate HEAD: ${result.candidate_head_sha}`,
      `scoped command: ${result.scoped.command}`,
      `scoped exit: ${result.scoped.exit}`,
      `program includes: ${JSON.stringify(programIncludes, null, 2)}`,
      `negative control (omit route -> route absent): ${routeAbsentFromNegative}`,
      `--- scoped compiler output (verbatim) ---`,
      scoped.output,
      `--- end ---`,
    ].join('\n')}\n`,
  );

  writeFileSync(
    join(outputDir, 'example-package-typecheck.txt'),
    `${[
      'ORI-RN-004 whole-example diagnostic (retained separately, unsuppressed)',
      `candidate HEAD: ${result.candidate_head_sha}`,
      `command: ${result.whole_example.command}`,
      `exit: ${result.whole_example.exit}`,
      `--- whole-example compiler output (verbatim) ---`,
      whole.output,
      `--- end ---`,
    ].join('\n')}\n`,
  );

  return result;
}

/* ------------------------------------------------------------------ CLI -- */

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  function flag(name: string): string | undefined {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  }

  const caseName = flag('--case');
  if (caseName === 'ORI-RN-004-AC-5-live-import-graph-compiler') {
    const result = await runLiveImportGraphCompiler(EVIDENCE_ROOT);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
    return;
  }

  const platforms = (flag('--platforms') ?? 'ios,android,web').split(',') as Platform[];
  const runId = flag('--run-id') ?? `ORI-RN-004-${Date.now()}`;
  const result = await runLiveExampleProof({ platforms, runId });
  console.log(JSON.stringify({ runId: result.runId, completed: result.completed }, null, 2));
  if (!result.completed) process.exitCode = 1;
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

export { runLiveExampleProof };
