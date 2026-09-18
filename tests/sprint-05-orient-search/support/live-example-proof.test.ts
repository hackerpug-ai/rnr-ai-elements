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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
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
class BackendSession {
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

  async stop(): Promise<void> {
    await this.currentHandle.stop();
  }

  async restart(): Promise<void> {
    this.currentHandle = await this.currentHandle.restart();
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
 * Starts Metro for the in-monorepo apps/example with the backend reachable at
 * `EXPO_PUBLIC_API_BASE_URL`. EXPO_PUBLIC_* is inlined at bundle time, so the value
 * is placed in the Metro child's inherited environment before it starts.
 */
function startLiveMetro(apiBaseUrl: string, logPath: string): MetroHandle {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;
  try {
    return startMetro(EXAMPLE_ROOT, METRO_PORT, logPath);
  } finally {
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

/** Flattens a `maestro hierarchy` JSON dump into its leaf attributes. */
function parseUiHierarchy(raw: string): UiElement[] {
  const out: UiElement[] = [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
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

/** Occurrences of `needle` in the raw hierarchy dump — the "exactly 1 user turn"
 * oracle for the retry probe (the transcript renders the retained user Text once). */
function hierarchyCount(deviceId: string, needle: string): number {
  const raw = captureHierarchy(deviceId);
  let count = 0;
  let index = raw.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = raw.indexOf(needle, index + needle.length);
  }
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
      // A terminal record that is not aborted means the essay ended (completed or
      // errored) before any stop landed — retry the whole turn with a fresh send.
      if (records.length > baseline && records[records.length - 1].outcome !== 'aborted') {
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
  if (!dismissThenTap(serial, 'Send message')) {
    return fail(`could not tap "Send message" (retry probe) ${stateSummary(serial)}`);
  }
  if (!waitForText(serial, 'Retry', 60_000)) {
    return fail(`no accessible Retry control after endpoint loss ${stateSummary(serial)}`);
  }
  if (hierarchyContains(serial, 'sk-') || hierarchyContains(serial, 'OPENAI_API_KEY')) {
    return fail('endpoint-loss error surface leaked credential material');
  }
  logs.push('OK: endpoint loss surfaced a sanitized error with an accessible Retry');
  await session.restart();
  assertBackendReady(session.current);
  if (!dismissThenTap(serial, 'Retry')) {
    return fail(`could not tap "Retry" ${stateSummary(serial)}`);
  }
  if (!(await waitForRecordOutcome(session.current, 0, 'completed', 120_000))) {
    return fail(
      `retry never produced a completed provider record — observed: ${JSON.stringify(
        session.current.records(),
      )} stderr: ${session.current.stderrText().slice(-1000)}`,
    );
  }
  const probeOccurrences = hierarchyCount(serial, RETRY_PROBE_PROMPT);
  if (probeOccurrences !== 1) {
    return fail(
      `retry probe appears ${probeOccurrences}x in the transcript (expected exactly 1) ${stateSummary(serial)}`,
    );
  }
  logs.push(
    `OK: retry completed on a new request (${session.current.records()[0]?.requestId ?? 'n/a'}) with exactly 1 retained user turn`,
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
  try {
    const res = runShell(
      `npx expo export --platform web --output-dir "${distDir}"`,
      EXAMPLE_ROOT,
      30 * 60_000,
    );
    return { exit: res.exit, output: res.output, distDir };
  } finally {
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
 * Serves the static web export and forwards POST /api/chat to the real backend on the
 * same origin — the browser never crosses origins, so no CORS preflight is required.
 * The upstream SSE response is streamed back verbatim.
 */
function serveWithChatProxy(
  distDir: string,
  port: number,
  session: BackendSession,
): Promise<{ server: Server; url: string; port: number }> {
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
          const upstream = await fetch(
            `http://${session.current.host}:${session.current.port}/api/chat`,
            {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: Buffer.concat(chunks),
            },
          );
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
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolveServe({ server, port, url: `http://127.0.0.1:${port}` });
    });
  });
}

function stopServer(handle: { server: Server } | null): Promise<void> {
  return new Promise((resolveStop) => {
    if (!handle) return resolveStop();
    handle.server.close(() => resolveStop());
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
  return chromium.launch({ headless: true });
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
    await page.goto(`${url}/live-chat`, { waitUntil: 'networkidle', timeout: 60_000 });

    await page
      .getByText('Live chat', { exact: true })
      .waitFor({ timeout: 30_000 })
      .catch(() => {});
    result.emptyStateVisible = await page
      .getByText('Start a conversation', { exact: true })
      .isVisible()
      .catch(() => false);

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

    // Endpoint loss + retry (AC-3 case 2): stop the OWNED backend, submit a fresh
    // probe turn, observe the sanitized alert + accessible Retry, restart the same
    // owned endpoint, retry the retained turn, and gate on a NEW completed provider
    // record — the probe text must appear exactly once (regenerate does not
    // duplicate the retained user turn).
    await session.stop();
    await textarea.fill(RETRY_PROBE_PROMPT);
    await send.click().catch(() => {});
    const retry = page.getByLabel('Retry', { exact: true });
    await retry.waitFor({ timeout: 30_000 }).catch(() => {});
    result.retryControlVisible = await retry.isVisible().catch(() => false);
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
    await session.restart();
    await retry.click().catch(() => {});
    result.retryCompleted = await waitForRecordOutcome(session.current, 0, 'completed', 120_000);
    result.retrySingleUserTurn =
      (await page
        .getByText(RETRY_PROBE_PROMPT, { exact: true })
        .count()
        .catch(() => 0)) === 1;
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  } finally {
    await context.close().catch(() => {});
  }
  return result;
}

/* ---------------------------------------------------------- native leg -- */

/**
 * iOS endpoint-loss + retry phase (AC-3 case 2) — the Android equivalent lives at
 * the end of runAndroidInputFlow. Stops the OWNED backend, submits the probe turn
 * through a real composer flow, observes the sanitized error + accessible Retry,
 * restarts the endpoint, retries, and gates on a NEW completed provider record with
 * exactly one retained user turn.
 */
// fallow-ignore-next-line complexity
async function runIosEndpointLossRetry(
  deviceId: string,
  session: BackendSession,
): Promise<{ ok: boolean; log: string }> {
  dismissLogBox(deviceId);
  await session.stop();
  if (!maestroTypeAndSend(deviceId, RETRY_PROBE_PROMPT)) {
    return { ok: false, log: 'could not type + send the retry probe (maestro flow failed)' };
  }
  if (!waitForText(deviceId, 'Retry', 60_000)) {
    return { ok: false, log: 'no accessible Retry control after endpoint loss' };
  }
  if (hierarchyContains(deviceId, 'sk-') || hierarchyContains(deviceId, 'OPENAI_API_KEY')) {
    return { ok: false, log: 'endpoint-loss error surface leaked credential material' };
  }
  await session.restart();
  assertBackendReady(session.current);
  if (!dismissThenTap(deviceId, 'Retry')) {
    return { ok: false, log: 'could not tap "Retry"' };
  }
  if (!(await waitForRecordOutcome(session.current, 0, 'completed', 120_000))) {
    return {
      ok: false,
      log: `retry never produced a completed provider record — observed: ${JSON.stringify(
        session.current.records(),
      )} stderr: ${session.current.stderrText().slice(-1000)}`,
    };
  }
  const occurrences = hierarchyCount(deviceId, RETRY_PROBE_PROMPT);
  if (occurrences !== 1) {
    return {
      ok: false,
      log: `retry probe appears ${occurrences}x in the transcript (expected exactly 1)`,
    };
  }
  return {
    ok: true,
    log: `endpoint loss + retry OK (new request ${session.current.records()[0]?.requestId ?? 'n/a'}, exactly 1 retained user turn)`,
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
      const retry = await runIosEndpointLossRetry(deviceId, session);
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
    }

    for (const platform of platforms) {
      if (platform === 'web') {
        legs.push(await runWebLeg(session, runId));
      } else if (platform === 'ios') {
        if (!reservations) throw new Error('no iOS reservation');
        legs.push(
          ...(await runNativeLeg(platform, reservations.ios, metro as MetroHandle, session, runId)),
        );
      } else {
        if (!reservations) throw new Error('no Android reservation');
        legs.push(
          ...(await runNativeLeg(
            platform,
            reservations.android,
            metro as MetroHandle,
            session,
            runId,
          )),
        );
      }
    }
  } finally {
    if (metro) stopMetro(metro);
    if (reservations) removeBackendReverse(BACKEND_PORT);
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

  const exported = exportExampleWeb();
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
      await browser.close().catch(() => {});
    }
  } finally {
    await stopServer(served);
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

  const backend = await ensureBackend(options);
  assertBackendReady(backend);
  const session = new BackendSession(backend);

  let legs: LegOutcome[];
  try {
    legs = await runAllLegs(options, session);
  } finally {
    // Stop what we own: a caller-passed handle we never replaced stays theirs.
    if (!options.backend || session.current !== session.initial) {
      await session.stop();
    }
  }

  const { passed, completed } = countPlatformsPassed(legs);
  writeManifest(runId, legs, passed, completed, session);

  return { runId, legs, completed };
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

  const scoped = run(
    `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json`,
    REPO_ROOT,
  );
  const files = run(
    `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json --listFilesOnly`,
    REPO_ROOT,
  );
  const whole = run(`pnpm --dir apps/example exec tsc --noEmit`, REPO_ROOT);

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
  const negativeFiles = run(
    `pnpm --dir apps/example exec tsc --noEmit -p ${negativeConfig} --listFilesOnly`,
    REPO_ROOT,
  );
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
