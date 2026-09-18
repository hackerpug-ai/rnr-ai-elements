/**
 * ORI-RN-005 — the independent NativeWind live-chat proof driver.
 *
 * This file is both the exported driver ORI-AI-002's six-target matrix calls
 * (`runNativewindLiveExampleProof`) and the CLI the task VERIFY commands run:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts \
 *     --platforms ios,android,web
 *   pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts \
 *     --case ORI-RN-005-install-exact-source
 *
 * Real surfaces only: a fresh NativeWind/Tailwind v3 consumer materialized OUTSIDE the
 * monorepo from ORI-RN-001's committed template, the literal public recipe (real
 * `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/…`
 * installs), the five canonical app sources copied byte-identical, the consumer's own
 * TypeScript compiler, `expo-doctor`, real Metro + Expo Go 57.0.9 on the reserved iOS
 * simulator and Android emulator, a real `expo export` web build served same-origin in
 * Chromium, the ORI-AI-001 owned backend, and the official OpenAI Responses endpoint
 * (gpt-4.1-mini-2025-04-14). No mocked HTTP, no stub hook, no declaration shims, no
 * copied registry components, no Uniwind engine wiring.
 *
 * The live interaction oracles (record-gated turns, the coordinate stop hot path on
 * Android, the innermost-match transcript count, the iOS keyboard dismissal tap, the
 * DOWN-direction scrollUntilVisible) are ported from ORI-RN-004's hardened driver
 * (support/live-example-proof.test.ts) — that file's helpers are module-private and
 * outside this task's write scope, so the proven logic is carried over with this
 * provenance note. The two engine drivers execute the same live interactions over the
 * same typed backend contract.
 *
 * Fail-closed contract (AC-4): source hashes are validated against the manifest BEFORE
 * anything launches (a mismatch prints the mapped path plus expected/actual hashes and
 * exits nonzero); device reservations are validated before the consumer is built (an
 * absent requested target names its exact selector, never a replacement); every exit
 * path stops only recorded owned children, removes only owned adb reverses, restores
 * the captured pre-run appearance, and writes teardown.json beside the evidence.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
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
  installExpoGoAndroid,
  installExpoGoIos,
  type MetroHandle,
  type Platform as NativePlatform,
  openExpoGo,
  REPO_ROOT,
  reserveDevices,
  run as runShell,
  setAppearance,
  sha256,
  startMetro,
  stopMetro,
} from './native-session';
import { readResolvedVersions, resolveCliVersion } from './quickstart-consumer';

const TEMPLATE_DIR = join(REPO_ROOT, 'packages/docs-snippets/nativewind');
const RECIPE_SCRIPT = join(REPO_ROOT, 'packages/docs-snippets/commands/nativewind.sh');
const EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-005');
const MANIFEST_PATH = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
);

const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');

const ANDROID_SDK =
  process.env.ANDROID_HOME ?? join(process.env.HOME ?? '', 'Library', 'Android', 'sdk');
const ADB = join(ANDROID_SDK, 'platform-tools', 'adb');

/** Owned ports — distinct from ORI-RN-004's 4000/8095/8406 so both drivers can coexist. */
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4010;
const METRO_PORT = 8097;
const WEB_PORT = 8408;

const EXPO_GO_ANDROID_APK = join(
  process.env.HOME ?? '',
  '.cache',
  'agent-scratch',
  'opencode',
  'ori-rn-003',
  'Expo-Go-57.0.9.apk',
);

/** The ORI-RN-001 committed template files copied into the fresh consumer. */
const TEMPLATE_FILES = [
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
];

type Platform = 'ios' | 'android' | 'web';
type LegStatus = 'passed' | 'failed' | 'blocked';

type LegOutcome = {
  platform: Platform;
  status: LegStatus;
  diagnostic?: string;
  evidence: Record<string, unknown>;
};

type SourceMapping = {
  source: string;
  target: string;
  expected_source_sha256: string;
};

type SourceManifest = {
  mappings: SourceMapping[];
  consumer?: Record<string, unknown>;
};

type ProofOptions = {
  engine: 'nativewind';
  platforms: Platform[];
  runId: string;
  /** SHA-256 of apps/example/app/live-chat.tsx when a caller passes it (source identity). */
  sourceSha?: string;
  outputDir?: string;
  /** Real owned-backend lifecycle handle (created by the CLI when omitted). */
  backend?: OwnedBackendHandle;
  /** Manifest to validate against (defaults to the committed one). */
  manifestPath?: string;
};

type ProofResult = {
  runId: string;
  legs: LegOutcome[];
  completed: boolean;
  consumer?: ConsumerReceipt | null;
  blockedReason?: string;
};

export type ConsumerReceipt = {
  root: string;
  scriptExit: number;
  installLog: string;
  cliVersion: string;
  copyPairs: {
    source: string;
    target: string;
    sourceSha: string;
    targetSha: string;
    match: boolean;
  }[];
  resolvedVersions: Record<string, string>;
  tsc: { exit: number; output: string };
  expoDoctor: { exit: number; output: string };
};

/* ------------------------------------------------------------- utilities -- */

function nowIso(): string {
  return new Date().toISOString();
}

function gitHead(): string {
  const res = runShell('git rev-parse HEAD', REPO_ROOT, 30_000);
  return res.exit === 0 ? res.output.trim() : `unknown (${res.output.trim()})`;
}

function markerFor(runId: string, platform: Platform): string {
  return `ORI-RN-005:${runId}:${platform}`;
}

function seedPromptFor(marker: string): string {
  return `Remember the marker ${marker}. Repeat it and give three short facts about rain.`;
}

const FOLLOW_UP_PROMPT = 'What marker did I ask you to remember?';
// The explicit length demand matters: with only "ten substantial paragraphs" the
// model occasionally answered in ~400 tokens (~5s), finishing the stream before the
// stop control could be exercised (ORI-RN-004 cycle-4 finding).
const LONG_PROMPT =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning. The essay must be at least 1200 words across at least ten substantial paragraphs. Do not summarize, do not decline, and do not stop early.';
/** The fresh nonsecret probe turn the endpoint-loss/retry leg submits (AC-3). */
const RETRY_PROBE_PROMPT = 'Reply with the single word pineapple.';

function sha256File(p: string): string {
  return sha256(readFileSync(p, 'utf8'));
}

/* --------------------------------------------------- credential hygiene -- */

/**
 * Provider credentials must never reach the installs, the compiler, Metro, the CLI or
 * the browser (CRITICAL CONSTRAINT). Same temporary-mutation pattern as ORI-RN-004's
 * driver: Node snapshots process.env at each spawn, so removing credential-shaped keys
 * immediately before the call and restoring them immediately after keeps every other
 * child unaffected — in particular the trusted backend, which is always launched (and
 * so has already captured its own env snapshot) before this window ever opens.
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

/** Runs a credential-free command, capturing exit + combined output. Never throws. */
function runClean(command: string, cwd: string, timeoutMs = 600_000) {
  const removed = stripCredentialEnv();
  try {
    return runShell(command, cwd, timeoutMs);
  } finally {
    restoreCredentialEnv(removed);
  }
}

/* --------------------------------------------------- source validation -- */

function loadManifest(path: string): SourceManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as SourceManifest;
}

export type HashMismatch = { source: string; expected: string; actual: string };

/**
 * AC-4 case 1: every manifest mapping's repo source must hash to the recorded
 * expected_source_sha256. Any drift is reported with the mapped path and both hashes so
 * the caller can fail closed before anything launches.
 */
export function validateManifestSources(manifest: SourceManifest): HashMismatch[] {
  const mismatches: HashMismatch[] = [];
  for (const mapping of manifest.mappings) {
    const sourcePath = join(REPO_ROOT, mapping.source);
    if (!existsSync(sourcePath)) {
      mismatches.push({
        source: mapping.source,
        expected: mapping.expected_source_sha256,
        actual: 'missing',
      });
      continue;
    }
    const actual = sha256File(sourcePath);
    if (actual !== mapping.expected_source_sha256) {
      mismatches.push({
        source: mapping.source,
        expected: mapping.expected_source_sha256,
        actual,
      });
    }
  }
  return mismatches;
}

function formatMismatches(mismatches: HashMismatch[]): string {
  return mismatches
    .map((m) => `hash mismatch: ${m.source} expected sha256 ${m.expected} but found ${m.actual}`)
    .join('\n');
}

/* -------------------------------------------------------- consumer build -- */

/**
 * AC-1: materialize the fresh NativeWind consumer OUTSIDE the monorepo — copy the
 * committed ORI-RN-001 template (whose package.json carries the exact live-hook pins
 * ai@7.0.89 + @ai-sdk/react@4.0.92), copy the five canonical app sources byte-identical
 * into their mapped targets, then run the committed verbatim public recipe (pnpm
 * install, npx expo install, the literal `npx @react-native-reusables/cli@latest add
 * https://rnraielements.com/r/nativewind/…` commands, expo install --check, doctor,
 * tsc, expo-doctor) and capture every receipt. The single recipe tsc covers the full
 * overlaid graph because the sources are in place before it runs.
 */
export function buildNativeWindConsumer(manifest: SourceManifest): ConsumerReceipt {
  const root = join(
    tmpdir(),
    `ori-rn-005-nativewind-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  );
  mkdirSync(root, { recursive: true });

  for (const rel of TEMPLATE_FILES) {
    const src = join(TEMPLATE_DIR, rel);
    if (!existsSync(src)) {
      throw new Error(`template file missing: ${src}`);
    }
    const dst = join(root, rel);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
  }

  // The five canonical app sources — byte-identical copies into their mapped targets.
  const copyPairs: ConsumerReceipt['copyPairs'] = [];
  for (const mapping of manifest.mappings) {
    const src = join(REPO_ROOT, mapping.source);
    const dst = join(root, mapping.target);
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    const sourceSha = sha256File(src);
    copyPairs.push({
      source: mapping.source,
      target: mapping.target,
      sourceSha,
      targetSha: sha256File(dst),
      match: sourceSha === sha256File(dst),
    });
  }

  // The verbatim public recipe — real pnpm/expo/RNR-CLI/registry/tsc/expo-doctor runs.
  const script = runClean(`bash "${RECIPE_SCRIPT}"`, root, 30 * 60_000);
  const tsc = runClean('pnpm exec tsc --noEmit', root, 300_000);
  const expoDoctor = runClean('pnpm exec expo-doctor', root, 300_000);

  return {
    root,
    scriptExit: script.exit,
    installLog: script.output,
    cliVersion: resolveCliVersion(),
    copyPairs,
    resolvedVersions: readResolvedVersions(root),
    tsc,
    expoDoctor,
  };
}

/** Public registry hashes for the installed items, recorded as provenance (AC-1). */
export function publicRegistryHashes(): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const item of ['conversation', 'message', 'prompt-input', 'item', 'sheet']) {
    const local = join(REPO_ROOT, 'public/r/nativewind', `${item}.json`);
    hashes[`https://rnraielements.com/r/nativewind/${item}.json`] = existsSync(local)
      ? sha256File(local)
      : 'missing';
  }
  return hashes;
}

/* ------------------------------------------------------- owned backend -- */

function assertBackendReady(backend: OwnedBackendHandle): void {
  if (!backend.started) {
    throw new Error(`backend did not start: ${backend.stderrText().slice(-2000)}`);
  }
}

/**
 * Tracks the owned backend across the endpoint-loss/restart cycles the AC-3 retry leg
 * drives. `restart()` returns a NEW handle (the old child is gone, and its parsed
 * records with it), so the session keeps every handle so the manifest/correlation retain
 * the full sanitized record set, and exposes the live handle the legs should talk to.
 * Ported from ORI-RN-004's driver.
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

async function ensureBackend(options: ProofOptions): Promise<OwnedBackendHandle> {
  if (options.backend) return options.backend;
  // maxOutputTokens 4096 keeps the stop-leg essay alive well past the stop tap (the
  // 1024 default lets it hit the token cap in ~2s — ORI-RN-004 cycle-4 finding).
  return launchOwnedBackend({
    host: BACKEND_HOST,
    port: BACKEND_PORT,
    model: DEFAULT_MODEL,
    maxOutputTokens: 4096,
  });
}

/* ------------------------------------------------------- android helpers -- */

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

function imeShown(serial: string): boolean {
  const inputMethod = adbExec(serial, ['shell', 'dumpsys', 'input_method']);
  const windowDump = adbExec(serial, ['shell', 'dumpsys', 'window']);
  return /\bmInputShown=true\b/.test(inputMethod) || /\bmIsImeShowing=true\b/.test(windowDump);
}

/** Dismisses the soft keyboard ONLY when an IME is actually shown (BACK with no IME up
 * would navigate the activity off /live-chat). */
function hideKeyboard(serial: string): void {
  if (!imeShown(serial)) return;
  adbExec(serial, ['shell', 'input', 'keyevent', '4']);
  spawnSync('sleep', ['1']);
}

/** Dismisses stale Android system dialogs (ANR/notification) that overlay Expo Go. */
function dismissAndroidSystemDialogs(serial: string): void {
  adbExec(serial, ['shell', 'am', 'broadcast', '-a', 'android.intent.action.CLOSE_SYSTEM_DIALOGS']);
  adbExec(serial, ['shell', 'input', 'keyevent', '4']);
}

function reversePort(serial: string, port: number): void {
  spawnSync(ADB, ['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`], {
    encoding: 'utf8',
    timeout: 30_000,
  });
}

function removeReverse(port: number): void {
  spawnSync(ADB, ['reverse', '--remove', `tcp:${port}`], {
    encoding: 'utf8',
    timeout: 30_000,
  });
}

/** The adb reverse mappings this run created (teardown proof: none remain after). */
function reverseList(): string {
  const res = spawnSync(ADB, ['reverse', '--list'], { encoding: 'utf8', timeout: 30_000 });
  return `${res.stdout ?? ''}`.trim();
}

/* ------------------------------------------------------------ maestro -- */

type MaestroResult = { exit: number; output: string };

function runOneOffMaestroFlow(
  deviceId: string,
  flowBody: string,
  timeoutMs = 120_000,
): MaestroResult {
  const flowPath = join(tmpdir(), `ori-rn-005-flow-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(flowPath, `appId: host.exp.Exponent\n---\n${flowBody}`);
  const res = spawnSync(MAESTRO_BIN, ['--udid', deviceId, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { exit: res.status ?? -1, output: `${res.stdout ?? ''}${res.stderr ?? ''}` };
}

/**
 * Taps an element via Maestro's accessibility-based `tapOn` (which dispatches to the
 * element's accessibility node, so it lands even when a raw `adb input tap` at the same
 * coordinates is intercepted by the RN LogBox overlay). `selector` is a Maestro text
 * regex, e.g. `Message.*`, `Send message`, `Stop generating`, `Dismiss`.
 */
function maestroTap(deviceId: string, selector: string): boolean {
  return runOneOffMaestroFlow(deviceId, `- tapOn: ${JSON.stringify(selector)}`, 60_000).exit === 0;
}

/** Types one turn into the composer and sends it through a one-off Maestro flow. */
function maestroTypeAndSend(deviceId: string, text: string): boolean {
  const res = runOneOffMaestroFlow(
    deviceId,
    [
      '- tapOn: "Message.*"',
      `- inputText: ${JSON.stringify(text)}`,
      '- tapOn: "Send message"',
    ].join('\n'),
  );
  return res.exit === 0;
}

/** Full-height finger-up swipe inside the transcript region (reveals the newest turns). */
function swipeTowardLatest(platform: 'ios' | 'android', deviceId: string): void {
  if (platform === 'android') {
    adbExec(deviceId, ['shell', 'input', 'swipe', '540', '1600', '540', '500', '250']);
    return;
  }
  runOneOffMaestroFlow(
    deviceId,
    ['- swipe:', '    start: "50%, 65%"', '    end: "50%, 15%"'].join('\n'),
    60_000,
  );
}

/** Short finger-up swipe: keeps the revealed element mounted while the content just
 * below it (where a duplicate would render) also mounts. */
function nudgeSwipe(platform: 'ios' | 'android', deviceId: string): void {
  if (platform === 'android') {
    adbExec(deviceId, ['shell', 'input', 'swipe', '540', '1500', '540', '1150', '200']);
    return;
  }
  runOneOffMaestroFlow(
    deviceId,
    ['- swipe:', '    start: "50%, 45%"', '    end: "50%, 32%"'].join('\n'),
    60_000,
  );
}

/**
 * Maestro's own verified scroll: repeats real scroll gestures (direction DOWN =
 * toward the visually-lower, newer turns — CONTENT direction per Maestro's docs, not
 * the finger's physical swipe) until the element matching `text` is visible. Ported
 * from ORI-RN-004 with its two passing Android runs.
 */
function maestroScrollUntilVisible(deviceId: string, text: string, timeoutMs = 90_000): boolean {
  const body = [
    '- scrollUntilVisible:',
    '    element:',
    `      text: ${JSON.stringify(text)}`,
    '    direction: DOWN',
    `    timeout: ${timeoutMs}`,
    '    visibilityPercentage: 40',
  ].join('\n');
  return runOneOffMaestroFlow(deviceId, body, timeoutMs + 90_000).exit === 0;
}

/**
 * Dismisses the iOS soft keyboard with a coordinate tap on the transcript region: the
 * composer keeps focus — and the keyboard — after the failed probe send, and Maestro's
 * own `hideKeyboard` command does NOT dismiss it. A tap at 30% height lands on the
 * transcript where no child handles it, and the Conversation's
 * `keyboardShouldPersistTaps="handled"` then resigns the responder (pixel-verified on
 * the reserved simulator by ORI-RN-004).
 */
function dismissIosKeyboardByTap(deviceId: string): void {
  runOneOffMaestroFlow(deviceId, ['- tapOn:', '    point: "50%, 30%"'].join('\n'), 60_000);
}

/* ------------------------------------------------------ ui hierarchy -- */

type UiElement = {
  accessibilityText: string;
  text: string;
  bounds: string;
  enabled: string;
  focused: string;
};

/** Flattens a `maestro hierarchy` JSON dump into its leaf attributes. The dump can
 * carry a non-JSON preamble, so the parse targets the outermost JSON object. */
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

function fieldFocused(serial: string): boolean {
  const els = parseUiHierarchy(captureHierarchy(serial));
  return els.find((e) => e.accessibilityText === 'Message')?.focused === 'true';
}

function sendEnabled(serial: string): boolean {
  const els = parseUiHierarchy(captureHierarchy(serial));
  return els.find((e) => e.accessibilityText === 'Send message')?.enabled === 'true';
}

/** The composer's send/stop control center, read while the app is IDLE (Android's
 * accessibility geometry goes stale mid-stream — ORI-RN-004 cycle-3/4 finding — but the
 * composer is layout-STABLE while the transcript grows, so the idle position equals
 * the mid-stream stop position). */
function sendButtonCenter(serial: string): { x: number; y: number } | null {
  const els = parseUiHierarchy(captureHierarchy(serial));
  const btn = els.find((e) => e.accessibilityText === 'Send message');
  if (!btn) return null;
  return centerOfBounds(btn.bounds);
}

function hierarchyContains(deviceId: string, needle: string): boolean {
  return captureHierarchy(deviceId).includes(needle);
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
 * user turn" oracle. Counts INNERMOST matches: RN aggregates descendant labels onto
 * container elements, so one rendered bubble can expose the string at BOTH the
 * list-cell wrapper and the inner Text (a naive element-flat count reads a phantom 2
 * on iOS); a nested aggregation collapses to 1, while two genuinely separate duplicate
 * bubbles are disjoint subtrees and still count 2. Ported from ORI-RN-004. */
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

function waitForText(deviceId: string, needle: string, timeoutMs: number): boolean {
  const deadline = Date.now() + timeoutMs;
  let found = hierarchyContains(deviceId, needle);
  while (!found && Date.now() < deadline) {
    spawnSync('sleep', ['1']);
    dismissLogBox(deviceId);
    found = hierarchyContains(deviceId, needle);
  }
  return found;
}

/** Dismisses whatever dev/system overlay covers the composer, in priority order: the
 * RN LogBox in BOTH forms (full overlay with "Dismiss", minimized "!" badge), then an
 * expanded notification shade (gated on its "Clear all" footer marker so the BACK can
 * never reach the activity). Ported from ORI-RN-004. */
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
      const tapped = hasDismiss ? maestroTap(serial, 'Dismiss') : maestroTap(serial, 'Minimize');
      if (!tapped && !hasMinimize) break;
      spawnSync('sleep', ['1']);
      continue;
    }
    if (banner) {
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

/** Dismisses the LogBox overlay, then taps the element via Maestro accessibility. */
function dismissThenTap(deviceId: string, selector: string): boolean {
  dismissLogBox(deviceId);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (maestroTap(deviceId, selector)) return true;
    dismissLogBox(deviceId);
    spawnSync('sleep', ['1']);
  }
  return false;
}

/** Taps the composer field, then polls until it actually reports `focused=true`. */
function focusField(serial: string): boolean {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    dismissLogBox(serial);
    maestroTap(serial, 'Message.*');
    spawnSync('sleep', ['2']);
    if (fieldFocused(serial)) return true;
  }
  return false;
}

/** One-line diagnostic of the composer state for a failed turn. */
function stateSummary(deviceId: string): string {
  const els = parseUiHierarchy(captureHierarchy(deviceId));
  const field = els.find((e) => e.accessibilityText === 'Message');
  const send = els.find((e) => e.accessibilityText === 'Send message');
  const stop = els.find((e) => e.accessibilityText === 'Stop generating');
  const texts = els
    .filter((e) => e.text.length > 0 || e.accessibilityText.length > 0)
    .slice(0, 12)
    .map((e) => (e.accessibilityText ? e.accessibilityText : e.text.slice(0, 40)))
    .join(' | ');
  return JSON.stringify({
    fieldText: field?.text ?? null,
    sendEnabled: send?.enabled ?? null,
    sendPresent: send !== undefined,
    stopPresent: stop !== undefined,
    screenTexts: texts,
  });
}

/**
 * Polls the live backend records until the record BEYOND `baseline` (the one this
 * turn's send produced) reaches `outcome`. The only reliable stream-completion signal
 * on Android (the control's content-desc never flips during streaming — RN Fabric
 * accessibility bug, ORI-RN-004 cycle-3) and the gate that keeps the next turn's send
 * from racing an in-flight stream. Async by necessity: the backend parses its child's
 * stdout via 'data' events, so a synchronous poll loop starves the event loop.
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

/**
 * AC-2 growth sampler: while a turn streams, samples the longest visible text in the
 * accessibility tree (the growing assistant bubble) every ~1.5s until the backend
 * record reaches a terminal outcome. Retains every distinct nonempty length — the
 * "at least 2 distinct nonempty assistant text lengths before completion" oracle.
 */
async function sampleAssistantTextGrowth(
  deviceId: string,
  backend: OwnedBackendHandle,
  baseline: number,
  timeoutMs: number,
): Promise<{ lengths: number[]; terminalSeen: boolean }> {
  const lengths: number[] = [];
  const deadline = Date.now() + timeoutMs;
  let terminalSeen = false;
  while (Date.now() < deadline) {
    const records = backend.records();
    const record = records.length > baseline ? records[records.length - 1] : null;
    if (record && (record.outcome === 'completed' || record.outcome === 'aborted')) {
      terminalSeen = true;
    }
    const els = parseUiHierarchy(captureHierarchy(deviceId));
    const maxText = els.reduce(
      (max, e) => Math.max(max, e.text.length, e.accessibilityText.length),
      0,
    );
    if (maxText > 0 && lengths[lengths.length - 1] !== maxText) lengths.push(maxText);
    if (terminalSeen) break;
    await new Promise((resolveTick) => setTimeout(resolveTick, 1500));
  }
  return { lengths, terminalSeen };
}

/**
 * macOS Vision OCR of a screenshot — the pixel channel, used only as the documented
 * fallback when the accessibility tree reads 0 after verified scrolling. The screenshot
 * and the final hierarchy dump are retained beside the count so the channel switch is
 * provable evidence, not an assertion. Ported from ORI-RN-004.
 */
function ocrCount(screenshotPath: string, needle: string): number {
  const scriptPath = join(tmpdir(), `ori-rn-005-ocr-${process.pid}.swift`);
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
 * The AC-3 "exactly 1 user turn" transcript oracle, hardened for the virtualized
 * inverted Conversation (ported from ORI-RN-004 — see its README for the cycle-3/5
 * RED history this shape answers). Channels, in order — every one only REVEALS
 * occurrences, never hides them, so the count stays a strengthening oracle:
 *  1. Maestro `scrollUntilVisible` to the probe turn (direction DOWN) + a short nudge
 *     past it, then the accessibility-tree count.
 *  2. Swipe crawl — batches of full-height finger-up swipes with a count after each.
 *  3. The app's own public `Scroll to latest message` affordance.
 *  4. Pixels: the retained capture, Vision OCR, and the final hierarchy dump.
 * Pre-step (both platforms): clear the screen-level obstructions first — iOS's
 * still-focused composer keyboard and Android's notification shade.
 */
// fallow-ignore-next-line complexity
function transcriptProbeCount(
  platform: 'ios' | 'android',
  deviceId: string,
  needle: string,
  legDir: string,
): { count: number; channel: string; artifacts: string[] } {
  const artifacts: string[] = [];
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

  const screenshotPath = join(legDir, 'retry-state.png');
  spawnSync('sleep', ['2']); // let the post-retry layout settle first
  if (platform === 'ios') dismissIosKeyboardByTap(deviceId);
  collapseShade();
  dismissLogBox(deviceId);

  // Channel 1 — Maestro's verified scroll to the probe turn, then a short nudge past it
  // (a duplicated retained turn renders immediately after the original; the count must
  // see that region mounted too). On iOS Maestro's text matcher cannot see RN Fabric
  // Text nodes without explicit labels, so this channel no-ops and channel 2 drives.
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

  // Channel 2 — swipe crawl: 5 full-height finger-up swipes per batch, 4 batches.
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

  // Channel 3 — the app's own `Scroll to latest message` affordance (scrollToOffset(0)).
  // Kept LAST: a mis-aimed tap can re-focus the composer and re-raise the keyboard.
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

  // Channel 4 — pixels: retained capture, Vision OCR, and the final tree dump.
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

/* ----------------------------------------------------- native leg flows -- */

/**
 * Drives the whole Android turn sequence with real adb input + hierarchy asserts:
 * empty state → marker → real streamed seed reply → contextual follow-up → active
 * Stop → endpoint-loss + Retry. EVERY turn gates on a NEW backend provider record —
 * the only non-vacuous stream signal on Android. The stop turn uses the coordinate
 * hot path (send + stop tap with ZERO device reads in between) because one hierarchy
 * capture costs ~9s and the essay can finish inside that window. Ported from
 * ORI-RN-004's runAndroidInputFlow, with the AC-2 growth sampler on the seed turn.
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
): Promise<{ result: MaestroResult; growth: number[] }> {
  const logs: string[] = [];
  let growth: number[] = [];
  const fail = (msg: string): MaestroResult => {
    logs.push(`FAIL: ${msg}`);
    return { exit: 1, output: logs.join('\n') };
  };
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
  const runTurn = async (
    label: string,
    text: string,
    gate: { outcome: 'completed' | 'aborted'; timeoutMs: number } | null,
    sample: boolean = false,
  ): Promise<MaestroResult | null> => {
    const prep = prepareTurn(label, text);
    if (prep) return prep;
    const baseline = session.current.records().length;
    if (!dismissThenTap(serial, 'Send message')) {
      return fail(`could not tap "Send message" (${label}) ${stateSummary(serial)}`);
    }
    if (sample) {
      const sampled = await sampleAssistantTextGrowth(serial, session.current, baseline, 120_000);
      growth = sampled.lengths;
      if (!sampled.terminalSeen) return fail(`${label} turn never reached a terminal record`);
      return null;
    }
    if (
      gate &&
      !(await waitForRecordOutcome(session.current, baseline, gate.outcome, gate.timeoutMs))
    ) {
      return fail(`${label} turn never produced a ${gate.outcome} provider record`);
    }
    return null;
  };

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
  if (!ready) return { result: fail('"Live chat" never appeared (60s)'), growth };
  if (!waitForText(serial, 'Start a conversation', 30_000)) {
    return { result: fail('empty transcript state never appeared'), growth };
  }
  logs.push('OK: composer ready, transcript empty');

  let turn = await runTurn('marker', marker, { outcome: 'completed', timeoutMs: 90_000 });
  if (turn) return { result: turn, growth };
  if (!waitForText(serial, marker, 30_000)) {
    return {
      result: fail(`marker did not land in the transcript ${stateSummary(serial)}`),
      growth,
    };
  }
  logs.push('OK: marker submitted, echoed, and its reply completed');

  turn = await runTurn('seed', seedPrompt, null, true);
  if (turn) return { result: turn, growth };
  logs.push(
    `OK: seed reply streamed to a completed provider record (growth samples: ${growth.join(', ') || 'none'})`,
  );

  turn = await runTurn('follow-up', followUp, { outcome: 'completed', timeoutMs: 120_000 });
  if (turn) return { result: turn, growth };
  if (!waitForText(serial, marker, 60_000)) {
    return {
      result: fail(`follow-up answer never recalled the marker ${stateSummary(serial)}`),
      growth,
    };
  }
  logs.push('OK: follow-up streamed and recalled the marker');

  // Turn 4 — active Stop: submit a long prompt and stop mid-stream. On Android the
  // button's accessibility text does NOT flip to "Stop generating" (RN Fabric bug),
  // but the SAME fixed slot morphs from Send to Stop the moment the hook's status
  // leaves 'ready', so a coordinate tap on that slot is the stop control whenever a
  // stream is running.
  let stopExercised = false;
  for (let stopAttempt = 0; stopAttempt < 2 && !stopExercised; stopAttempt += 1) {
    const prep = prepareTurn('long', longPrompt);
    if (prep) return { result: prep, growth };
    dismissLogBox(serial);
    const stopCenter = sendButtonCenter(serial);
    if (!stopCenter)
      return {
        result: fail(`could not locate the send/stop button ${stateSummary(serial)}`),
        growth,
      };
    const baseline = session.current.records().length;
    // HOT PATH — coordinate send, then coordinate stop tap, nothing in between.
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    spawnSync('sleep', ['2']); // let the status flip morph the control into Stop
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    logs.push(`OK: coordinate send + stop tap at ${stopCenter.x},${stopCenter.y}`);
    stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
    for (let tapAttempt = 0; tapAttempt < 3 && !stopExercised; tapAttempt += 1) {
      const records = session.current.records();
      if (records.length > baseline && records[records.length - 1].outcome !== 'aborted') {
        break; // the essay ended before any stop landed — retry the whole turn
      }
      dismissLogBox(serial);
      const fieldTextNow = parseUiHierarchy(captureHierarchy(serial)).find(
        (e) => e.accessibilityText === 'Message',
      )?.text;
      if (fieldTextNow !== undefined && fieldTextNow.length > 60) {
        logs.push('WARN: coordinate send never landed (field holds the prompt) — maestro resend');
        if (!dismissThenTap(serial, 'Send message')) {
          return {
            result: fail(`could not tap "Send message" (long resend) ${stateSummary(serial)}`),
            growth,
          };
        }
        spawnSync('sleep', ['2']);
      }
      adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
      logs.push(`OK: fallback stop tap ${tapAttempt + 1} at ${stopCenter.x},${stopCenter.y}`);
      stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
    }
  }
  if (!stopExercised) {
    return { result: fail(`active stop did not abort the stream ${stateSummary(serial)}`), growth };
  }
  logs.push('OK: active stop aborted the stream (aborted provider record)');

  // Turn 5 — endpoint loss + retry (AC-3 case 2): stop the OWNED backend, submit a
  // fresh nonsecret probe turn, observe the sanitized error + accessible Retry,
  // restart the endpoint, retry, gate on a NEW completed record — leaving exactly ONE
  // user turn for the failed submission.
  const retryPrep = prepareTurn('retry probe', RETRY_PROBE_PROMPT);
  if (retryPrep) return { result: retryPrep, growth };
  await session.stop();
  if (!dismissThenTap(serial, 'Send message')) {
    return {
      result: fail(`could not tap "Send message" (retry probe) ${stateSummary(serial)}`),
      growth,
    };
  }
  if (!waitForText(serial, 'Retry', 60_000)) {
    return {
      result: fail(`no accessible Retry control after endpoint loss ${stateSummary(serial)}`),
      growth,
    };
  }
  if (hierarchyContains(serial, 'sk-') || hierarchyContains(serial, 'OPENAI_API_KEY')) {
    return { result: fail('endpoint-loss error surface leaked credential material'), growth };
  }
  logs.push('OK: endpoint loss surfaced a sanitized error with an accessible Retry');
  await session.restart();
  assertBackendReady(session.current);
  if (!dismissThenTap(serial, 'Retry')) {
    return { result: fail(`could not tap "Retry" ${stateSummary(serial)}`), growth };
  }
  if (!(await waitForRecordOutcome(session.current, 0, 'completed', 120_000))) {
    return {
      result: fail(
        `retry never produced a completed provider record — observed: ${JSON.stringify(
          session.current.records(),
        )} stderr: ${session.current.stderrText().slice(-1000)}`,
      ),
      growth,
    };
  }
  const probe = transcriptProbeCount('android', serial, RETRY_PROBE_PROMPT, legDir);
  if (probe.count !== 1) {
    return {
      result: fail(
        `retry probe appears ${probe.count}x in the transcript (expected exactly 1; oracle channel: ${probe.channel}${probe.artifacts.length > 0 ? `; artifacts: ${probe.artifacts.join(', ')}` : ''}) ${stateSummary(serial)}`,
      ),
      growth,
    };
  }
  logs.push(
    `OK: retry completed on a new request (${session.current.records()[0]?.requestId ?? 'n/a'}) with exactly 1 retained user turn (oracle channel: ${probe.channel})`,
  );

  return { result: { exit: 0, output: logs.join('\n') }, growth };
}

/**
 * iOS turn sequence — per-turn one-off Maestro flows (the proven maestroTypeAndSend
 * channel) so each turn can be gated on its own NEW backend record and sampled for
 * AC-2 text growth between the send and the completion, then the same active Stop,
 * endpoint-loss + Retry phases. Same interactions as the Android leg and as
 * ORI-RN-004's big-yaml flow, with per-turn observability the single blocking flow
 * cannot provide.
 */
// fallow-ignore-next-line complexity
async function runIosInputFlow(
  deviceId: string,
  session: BackendSession,
  marker: string,
  seedPrompt: string,
  followUp: string,
  legDir: string,
): Promise<{ result: MaestroResult; growth: number[] }> {
  const logs: string[] = [];
  let growth: number[] = [];
  const fail = (msg: string): MaestroResult => {
    logs.push(`FAIL: ${msg}`);
    return { exit: 1, output: logs.join('\n') };
  };

  const composerDeadline = Date.now() + 90_000;
  let ready = false;
  while (Date.now() < composerDeadline) {
    dismissLogBox(deviceId);
    if (hierarchyContains(deviceId, 'Live chat')) {
      ready = true;
      break;
    }
    spawnSync('sleep', ['2']);
  }
  if (!ready) return { result: fail('"Live chat" never appeared (90s)'), growth };
  if (!waitForText(deviceId, 'Start a conversation', 30_000)) {
    return { result: fail('empty transcript state never appeared'), growth };
  }
  logs.push('OK: composer ready, transcript empty');

  const sendTurn = async (label: string, text: string): Promise<MaestroResult | null> => {
    dismissLogBox(deviceId);
    if (!maestroTypeAndSend(deviceId, text)) {
      return fail(`could not type + send the ${label} turn (maestro flow failed)`);
    }
    return null;
  };
  const awaitTurn = async (label: string, sample: boolean): Promise<MaestroResult | null> => {
    const baseline = session.current.records().length;
    if (sample) {
      const sampled = await sampleAssistantTextGrowth(deviceId, session.current, baseline, 120_000);
      growth = sampled.lengths;
      if (!sampled.terminalSeen) return fail(`${label} turn never reached a terminal record`);
      return null;
    }
    if (!(await waitForRecordOutcome(session.current, baseline, 'completed', 120_000))) {
      return fail(`${label} turn never produced a completed provider record`);
    }
    return null;
  };

  let turn = await sendTurn('marker', marker);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('marker', false);
  if (turn) return { result: turn, growth };
  if (!waitForText(deviceId, marker, 30_000)) {
    return { result: fail('marker did not land in the transcript'), growth };
  }
  logs.push('OK: marker submitted, echoed, and its reply completed');

  turn = await sendTurn('seed', seedPrompt);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('seed', true);
  if (turn) return { result: turn, growth };
  logs.push(
    `OK: seed reply streamed to a completed provider record (growth samples: ${growth.join(', ') || 'none'})`,
  );

  turn = await sendTurn('follow-up', followUp);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('follow-up', false);
  if (turn) return { result: turn, growth };
  if (!waitForText(deviceId, marker, 60_000)) {
    return { result: fail('follow-up answer never recalled the marker'), growth };
  }
  logs.push('OK: follow-up streamed and recalled the marker');

  // Active Stop: send the long prompt, poll for the Stop control while the stream is
  // live, tap it, and gate on an aborted provider record.
  turn = await sendTurn('long', LONG_PROMPT);
  if (turn) return { result: turn, growth };
  const baseline = session.current.records().length;
  let stopSeen = false;
  const stopDeadline = Date.now() + 30_000;
  while (Date.now() < stopDeadline) {
    const records = session.current.records();
    if (records.length > baseline && records[records.length - 1].outcome !== 'aborted') break;
    if (hierarchyContains(deviceId, 'Stop generating')) {
      stopSeen = true;
      break;
    }
    await new Promise((resolveTick) => setTimeout(resolveTick, 1000));
  }
  if (!stopSeen) return { result: fail('"Stop generating" never appeared mid-stream'), growth };
  if (!dismissThenTap(deviceId, 'Stop generating')) {
    return { result: fail('could not tap "Stop generating"'), growth };
  }
  if (!(await waitForRecordOutcome(session.current, baseline, 'aborted', 30_000))) {
    return { result: fail('active stop did not abort the stream'), growth };
  }
  logs.push('OK: active stop aborted the stream (aborted provider record)');

  // Endpoint loss + retry (AC-3 case 2).
  dismissLogBox(deviceId);
  await session.stop();
  if (!maestroTypeAndSend(deviceId, RETRY_PROBE_PROMPT)) {
    return { result: fail('could not type + send the retry probe (maestro flow failed)'), growth };
  }
  if (!waitForText(deviceId, 'Retry', 60_000)) {
    return { result: fail('no accessible Retry control after endpoint loss'), growth };
  }
  if (hierarchyContains(deviceId, 'sk-') || hierarchyContains(deviceId, 'OPENAI_API_KEY')) {
    return { result: fail('endpoint-loss error surface leaked credential material'), growth };
  }
  logs.push('OK: endpoint loss surfaced a sanitized error with an accessible Retry');
  await session.restart();
  assertBackendReady(session.current);
  if (!dismissThenTap(deviceId, 'Retry')) {
    return { result: fail('could not tap "Retry"'), growth };
  }
  if (!(await waitForRecordOutcome(session.current, 0, 'completed', 120_000))) {
    return {
      result: fail(
        `retry never produced a completed provider record — observed: ${JSON.stringify(
          session.current.records(),
        )} stderr: ${session.current.stderrText().slice(-1000)}`,
      ),
      growth,
    };
  }
  let probe: { count: number; channel: string; artifacts: string[] };
  try {
    probe = transcriptProbeCount('ios', deviceId, RETRY_PROBE_PROMPT, legDir);
  } catch (e) {
    return {
      result: fail(
        `retry-state pixel oracle failed: ${e instanceof Error ? e.message : String(e)}`,
      ),
      growth,
    };
  }
  if (probe.count !== 1) {
    return {
      result: fail(
        `retry probe appears ${probe.count}x in the transcript (expected exactly 1; oracle channel: ${probe.channel}${probe.artifacts.length > 0 ? `; artifacts: ${probe.artifacts.join(', ')}` : ''})`,
      ),
      growth,
    };
  }
  logs.push(
    `OK: retry completed on a new request (${session.current.records()[0]?.requestId ?? 'n/a'}) with exactly 1 retained user turn (oracle channel: ${probe.channel})`,
  );

  return { result: { exit: 0, output: logs.join('\n') }, growth };
}

/* ------------------------------------------------------------ web export -- */

/** Real `expo export --platform web` of the CONSUMER into an owned temp dir, with the
 * backend reachable same-origin through the serving proxy (EXPO_PUBLIC_* is inlined at
 * bundle time, so the value is placed in the export child's inherited environment). */
function exportConsumerWeb(consumerRoot: string): {
  exit: number;
  output: string;
  distDir: string;
} {
  const distDir = join(tmpdir(), `ori-rn-005-web-dist-${Date.now()}`);
  mkdirSync(distDir, { recursive: true });
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = `http://127.0.0.1:${WEB_PORT}`;
  const removedCreds = stripCredentialEnv();
  try {
    const res = runShell(
      `npx expo export --platform web --output-dir "${distDir}"`,
      consumerRoot,
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

/* ----------------------------------------------------------- web driver -- */

type WebLegResult = {
  emptyStateVisible: boolean;
  markerSubmitted: boolean;
  inputCleared: boolean;
  assistantResponded: boolean;
  growthSamples: number[];
  followUpRecallVisible: boolean;
  stopControlVisible: boolean;
  retryControlVisible: boolean;
  retryErrorSanitized: boolean;
  retryCompleted: boolean;
  retrySingleUserTurn: boolean;
  error?: string;
};

async function launchChromiumBrowser(): Promise<Browser> {
  const removedCreds = stripCredentialEnv();
  try {
    return await chromium.launch({ headless: true });
  } finally {
    restoreCredentialEnv(removedCreds);
  }
}

/**
 * Drives the served web export through the real live-chat flow — same interactions as
 * the native legs: empty state, submit a marker, submit the seed prompt and observe its
 * real streamed assistant reply (sampled for AC-2 text growth), submit a contextual
 * follow-up, activate Stop during an active request, then endpoint loss + Retry with
 * the exactly-one-retained-turn count. Returns discrete observed booleans, never an
 * authored success flag.
 */
// fallow-ignore-next-line complexity
async function driveLiveWeb(
  browser: Browser,
  url: string,
  marker: string,
  seedPrompt: string,
  followUp: string,
  session: BackendSession,
  legDir: string,
): Promise<WebLegResult> {
  const result: WebLegResult = {
    emptyStateVisible: false,
    markerSubmitted: false,
    inputCleared: false,
    assistantResponded: false,
    growthSamples: [],
    followUpRecallVisible: false,
    stopControlVisible: false,
    retryControlVisible: false,
    retryErrorSanitized: false,
    retryCompleted: false,
    retrySingleUserTurn: false,
  };

  const transcriptLength = `(() => {
    const texts = [...document.querySelectorAll('div,span,p')].map((n) => n.textContent ?? '');
    return texts.reduce((max, t) => Math.max(max, t.length), 0);
  })()`;

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
    const send = page.getByLabel('Send message', { exact: true });
    const cleared = `document.querySelector('textarea[aria-label="Message"]')?.value === ''`;

    await textarea.click().catch(() => {});
    await textarea.fill(marker);
    await send.click().catch(() => {});
    await page.waitForFunction(cleared, { timeout: 15_000 }).catch(() => {});
    result.inputCleared = (await textarea.inputValue().catch(() => marker)) === '';
    result.markerSubmitted = await page
      .getByText(marker, { exact: true })
      .isVisible()
      .catch(() => false);

    // Seed turn — submit the SAME seed prompt the native legs submit, sample the
    // transcript's text growth while it streams, then await the rain reply.
    const baseline = session.current.records().length;
    await textarea.fill(seedPrompt);
    await send.click().catch(() => {});
    const sampleDeadline = Date.now() + 90_000;
    while (Date.now() < sampleDeadline) {
      const records = session.current.records();
      const record = records.length > baseline ? records[records.length - 1] : null;
      const length = (await page.evaluate(transcriptLength).catch(() => 0)) as number;
      if (length > 0 && result.growthSamples[result.growthSamples.length - 1] !== length) {
        result.growthSamples.push(length);
      }
      if (record && record.outcome !== undefined && record.outcome !== 'aborted') break;
      await page.waitForTimeout(500);
    }
    result.assistantResponded = await page
      .getByText(/rain/i)
      .first()
      .isVisible()
      .catch(() => false);

    // Contextual follow-up (marker is NOT repeated in the prompt).
    await textarea.fill(followUp);
    await send.click().catch(() => {});
    await page.waitForFunction(cleared, { timeout: 15_000 }).catch(() => {});
    result.followUpRecallVisible = await page
      .waitForFunction(
        `[...document.querySelectorAll('div')].some(d => d.textContent && d.textContent.includes(${JSON.stringify(marker)}))`,
        { timeout: 90_000 },
      )
      .then(() => true)
      .catch(() => false);

    // Active stop: submit a long prompt and catch the stop control mid-stream.
    await textarea.fill(LONG_PROMPT);
    await send.click().catch(() => {});
    const stop = page.getByLabel('Stop generating', { exact: true });
    await stop.waitFor({ timeout: 30_000 }).catch(() => {});
    result.stopControlVisible = await stop.isVisible().catch(() => false);
    await stop.click().catch(() => {});
    await page
      .getByLabel('Send message', { exact: true })
      .waitFor({ timeout: 30_000 })
      .catch(() => {});

    // Endpoint loss + retry (AC-3 case 2).
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
    assertBackendReady(session.current);
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
    // Retain the observed web state as a real capture — in both outcomes, so a failed
    // leg still leaves THIS run's screenshot, not a stale earlier run's.
    await page.screenshot({ path: join(legDir, 'final-state.png') }).catch(() => {});
    await context.close().catch(() => {});
  }
  return result;
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
  return WEB_LEG_FLAGS.every((key) => result[key] === true) && result.growthSamples.length >= 2;
}

async function runWebLeg(
  consumerRoot: string,
  session: BackendSession,
  runId: string,
  outputDir: string,
): Promise<LegOutcome> {
  const marker = markerFor(runId, 'web');
  const legDir = join(outputDir, 'web');
  mkdirSync(legDir, { recursive: true });

  const exported = exportConsumerWeb(consumerRoot);
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
        legDir,
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

/* --------------------------------------------------------- metro + legs -- */

/**
 * Starts Metro for the independent consumer with the backend reachable at
 * `EXPO_PUBLIC_API_BASE_URL` (inlined at bundle time, so the value is placed in the
 * Metro child's inherited environment before it starts). Credentials stay out of the
 * Metro child (CRITICAL CONSTRAINT).
 */
function startLiveMetro(consumerRoot: string, apiBaseUrl: string, logPath: string): MetroHandle {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;
  const removedCreds = stripCredentialEnv();
  try {
    return startMetro(consumerRoot, METRO_PORT, logPath);
  } finally {
    restoreCredentialEnv(removedCreds);
    if (previous === undefined) {
      delete process.env.EXPO_PUBLIC_API_BASE_URL;
    } else {
      process.env.EXPO_PUBLIC_API_BASE_URL = previous;
    }
  }
}

/** The deep link that lands Expo Go on the consumer's separate /live-chat route. */
function liveChatOpenUrl(metro: MetroHandle): string {
  return `exp://127.0.0.1:${metro.port}/--/live-chat`;
}

/** Reads the CURRENT appearance of a reserved device (restored by teardown). */
function readAppearance(platform: 'ios' | 'android', deviceId: string): Appearance {
  if (platform === 'android') {
    const raw = adbExec(deviceId, ['shell', 'cmd', 'uimode', 'night']);
    return /night:yes|^\s*2\b/.test(raw.trim()) ? 'dark' : 'light';
  }
  const res = spawnSync(
    'xcrun',
    ['simctl', 'spawn', deviceId, 'defaults', 'read', 'AppleGlobalDomain', 'AppleInterfaceStyle'],
    { encoding: 'utf8', timeout: 30_000 },
  );
  return `${res.stdout ?? ''}`.trim().toLowerCase() === 'dark' ? 'dark' : 'light';
}

/**
 * One native appearance leg: set appearance, open a fresh Expo Go session on the
 * consumer's /live-chat deep link, drive the full interaction sequence, and capture
 * the observed state (screenshot + hierarchy) in BOTH outcomes.
 */
// fallow-ignore-next-line complexity
async function runNativeAppearance(
  platform: 'ios' | 'android',
  deviceId: string,
  appearance: Appearance,
  metro: MetroHandle,
  session: BackendSession,
  runId: string,
  outputDir: string,
): Promise<LegOutcome> {
  const marker = markerFor(runId, platform);
  const legDir = join(outputDir, platform, appearance);
  mkdirSync(legDir, { recursive: true });

  try {
    setAppearance(platform, deviceId, appearance);
    openExpoGo(platform, deviceId, liveChatOpenUrl(metro));
    if (platform === 'android') dismissAndroidSystemDialogs(deviceId);

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
        : await runIosInputFlow(
            deviceId,
            session,
            marker,
            seedPromptFor(marker),
            FOLLOW_UP_PROMPT,
            legDir,
          );
    const screenshotPath = join(legDir, 'screenshot.png');
    captureScreenshot(platform, deviceId, screenshotPath);
    const hierarchy = captureHierarchy(deviceId);
    const growthOk = flow.growth.filter((n) => n > 0).length >= 2;

    return {
      platform,
      status: flow.result.exit === 0 && growthOk ? 'passed' : 'failed',
      diagnostic:
        flow.result.exit === 0
          ? growthOk
            ? undefined
            : `assistant text growth showed only ${flow.growth.join(', ') || 'nothing'} distinct nonempty lengths (need >= 2)`
          : flow.result.output.slice(-3000),
      evidence: {
        marker,
        appearance,
        flow_exit: flow.result.exit,
        flow_output: flow.result.output.slice(-4000),
        assistant_text_growth: flow.growth,
        screenshot: screenshotPath,
        hierarchy: hierarchy.slice(0, 4000),
        hierarchy_has_marker: hierarchy.includes(marker),
        latest_backend_record: session.allRecords()[session.allRecords().length - 1] ?? null,
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

async function runNativeLeg(
  platform: 'ios' | 'android',
  deviceId: string,
  metro: MetroHandle,
  session: BackendSession,
  runId: string,
  outputDir: string,
): Promise<LegOutcome[]> {
  const outcomes: LegOutcome[] = [];
  for (const appearance of ['light', 'dark'] as Appearance[]) {
    outcomes.push(
      await runNativeAppearance(platform, deviceId, appearance, metro, session, runId, outputDir),
    );
  }
  return outcomes;
}

/* ----------------------------------------------------------- orchestrator -- */

function validateOptions(options: ProofOptions): void {
  const manifest = loadManifest(options.manifestPath ?? MANIFEST_PATH);
  const mismatches = validateManifestSources(manifest);
  if (mismatches.length > 0) {
    throw new Error(
      `source validation failed (${mismatches.length} mismatch(es)):\n${formatMismatches(mismatches)}`,
    );
  }
  if (options.sourceSha !== undefined) {
    const actual = sha256File(join(REPO_ROOT, 'apps/example/app/live-chat.tsx'));
    if (options.sourceSha !== actual) {
      throw new Error(`source mismatch: app/live-chat.tsx hash ${options.sourceSha} != ${actual}`);
    }
  }
  if (options.platforms.length === 0) {
    throw new Error('no platforms requested');
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

/** Teardown record for one run — what was released, and proof nothing owned remains. */
type TeardownRecord = {
  run_id: string;
  finished_at: string;
  backend_stopped: boolean;
  metro_stopped: boolean;
  web_server_stopped: boolean;
  consumer_removed: boolean;
  consumer_root: string | null;
  adb_reverse_remaining: string;
  appearances_restored: { platform: string; device: string; from: string; to: string }[];
  reservations_released: boolean;
};

/**
 * The exported proof (ORI-AI-002's NativeWind legs). Order of phases is the AC-4
 * fail-closed contract: (1) source-hash validation (nonzero before anything launches),
 * (2) device reservation for requested native targets (nonzero naming the selector,
 * never a replacement), (3) the real consumer build + compile + expo-doctor, (4) the
 * live legs, (5) teardown that stops only recorded owned children, removes only owned
 * adb reverses, restores the captured appearance, removes the owned consumer, and
 * writes teardown.json beside the evidence.
 */
// fallow-ignore-next-line complexity
export async function runNativewindLiveExampleProof(options: ProofOptions): Promise<ProofResult> {
  const { runId } = options;
  validateOptions(options);
  const outputDir = options.outputDir ?? EVIDENCE_ROOT;
  mkdirSync(outputDir, { recursive: true });

  const backend = await ensureBackend(options);
  assertBackendReady(backend);
  const session = new BackendSession(backend);

  const manifest = loadManifest(options.manifestPath ?? MANIFEST_PATH);
  const hasNative = options.platforms.includes('ios') || options.platforms.includes('android');

  let metro: MetroHandle | null = null;
  let consumer: ConsumerReceipt | null = null;
  const legs: LegOutcome[] = [];
  let blockedReason: string | undefined;
  let reservationsReleased = false;
  let backendStopped = false;
  // runWebLeg closes its own proxy server in its own finally before returning.
  const webLegRan = options.platforms.includes('web');
  // Device reservation for the requested native targets — INSIDE the guarded region so
  // an absent target (which throws naming its exact selector) still tears the owned
  // backend down and writes teardown.json (AC-4 case 2).
  let reservations: ReturnType<typeof reserveDevices> | null = null;
  let appearancesBefore: {
    platform: NativePlatform;
    device: string;
    from: Appearance;
    to: string;
  }[] = [];

  try {
    if (hasNative) {
      const reserved = reserveDevices();
      reservations = reserved;
      appearancesBefore = (['ios', 'android'] as const).map((p) => ({
        platform: p,
        device: p === 'ios' ? reserved.ios.id : reserved.android.id,
        from: readAppearance(p, p === 'ios' ? reserved.ios.id : reserved.android.id),
        to: '',
      }));
    }

    // AC-1: the real install + byte-identical copies + clean-consumer compile.
    consumer = buildNativeWindConsumer(manifest);
    const compileFailed = consumer.tsc.exit !== 0;
    if (compileFailed || consumer.expoDoctor.exit !== 0) {
      blockedReason = compileFailed
        ? `the NativeWind consumer's compiler rejected the copied /live-chat graph (exit ${consumer.tsc.exit}):\n${consumer.tsc.output.slice(-3000)}`
        : `expo-doctor failed in the clean consumer (exit ${consumer.expoDoctor.exit}):\n${consumer.expoDoctor.output.slice(-2000)}`;
      for (const platform of options.platforms) {
        legs.push({
          platform,
          status: 'blocked',
          diagnostic: blockedReason,
          evidence: {
            marker: markerFor(runId, platform),
            script_exit: consumer.scriptExit,
            copy_pairs: consumer.copyPairs,
          },
        });
      }
      writeManifest(runId, legs, 0, false, session, consumer, outputDir);
      return { runId, legs, completed: false, consumer, blockedReason };
    }

    if (reservations) {
      installExpoGoIos(reservations.ios.id);
      installExpoGoAndroid(reservations.android.id, EXPO_GO_ANDROID_APK);
      reversePort(reservations.android.id, BACKEND_PORT);
      metro = startLiveMetro(
        consumer.root,
        `http://${BACKEND_HOST}:${BACKEND_PORT}`,
        join(outputDir, 'metro.log'),
      );
    }

    for (const platform of options.platforms) {
      if (platform === 'web') {
        legs.push(await runWebLeg(consumer.root, session, runId, outputDir));
      } else if (platform === 'ios') {
        if (!reservations) throw new Error('no iOS reservation');
        legs.push(
          ...(await runNativeLeg(
            'ios',
            reservations.ios.id,
            metro as MetroHandle,
            session,
            runId,
            outputDir,
          )),
        );
      } else {
        if (!reservations) throw new Error('no Android reservation');
        legs.push(
          ...(await runNativeLeg(
            'android',
            reservations.android.id,
            metro as MetroHandle,
            session,
            runId,
            outputDir,
          )),
        );
      }
    }
  } finally {
    // Teardown — every exit path. Stop only recorded owned children; remove only the
    // owned adb reverses; restore the captured pre-run appearances; remove the owned
    // consumer; retain the evidence.
    if (metro) stopMetro(metro);
    removeReverse(BACKEND_PORT);
    if (reservations) removeReverse(METRO_PORT);
    const appearancesRestored = appearancesBefore.map((entry) => {
      setAppearance(entry.platform, entry.device, entry.from);
      return { ...entry, to: readAppearance(entry.platform, entry.device) };
    });
    reservationsReleased = true;
    const teardown: TeardownRecord = {
      run_id: runId,
      finished_at: nowIso(),
      backend_stopped: false, // set below
      metro_stopped: metro !== null,
      web_server_stopped: webLegRan,
      consumer_removed: false,
      consumer_root: consumer?.root ?? null,
      adb_reverse_remaining: reverseList(),
      appearances_restored: appearancesRestored,
      reservations_released: reservationsReleased,
    };
    // Stop what we own: a caller-passed handle we never replaced stays theirs.
    if (!options.backend || session.current !== session.initial) {
      await session.stop();
      backendStopped = true;
    }
    teardown.backend_stopped = backendStopped;
    if (consumer) {
      rmSync(consumer.root, { recursive: true, force: true });
      teardown.consumer_removed = true;
    }
    mkdirSync(outputDir, { recursive: true });
    writeFileSync(join(outputDir, 'teardown.json'), `${JSON.stringify(teardown, null, 2)}\n`);
  }

  const { passed, completed } = countPlatformsPassed(legs);
  writeManifest(runId, legs, passed, completed, session, consumer, outputDir);

  return { runId, legs, completed, consumer, blockedReason };
}

function writeManifest(
  runId: string,
  legs: LegOutcome[],
  passed: number,
  completed: boolean,
  session: BackendSession,
  consumer: ConsumerReceipt | null,
  outputDir: string,
): void {
  const manifest = {
    task: 'ORI-RN-005',
    engine: 'nativewind',
    run_id: runId,
    candidate_head_sha: gitHead(),
    generated_at: nowIso(),
    commands: [
      'pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --platforms ios,android,web',
    ],
    source_manifest: 'tests/sprint-05-orient-search/nativewind-live-source-manifest.json',
    source_sha: Object.fromEntries(
      (consumer?.copyPairs ?? []).map((pair) => [pair.source, pair.sourceSha]),
    ),
    copy_pairs: consumer?.copyPairs ?? [],
    consumer: consumer
      ? {
          root_existed_outside_monorepo: !consumer.root.includes('rnr-ai-elements'),
          script_exit: consumer.scriptExit,
          cli_version: consumer.cliVersion,
          resolved_versions: consumer.resolvedVersions,
          tsc_exit: consumer.tsc.exit,
          expo_doctor_exit: consumer.expoDoctor.exit,
          public_registry_hashes: publicRegistryHashes(),
        }
      : null,
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
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const correlation = {
    run_id: runId,
    backend_records: session.allRecords().map((record) => ({
      requestId: record.requestId,
      provider: record.provider,
      providerModel: record.providerModel,
      responseId: record.responseId,
      outcome: record.outcome,
      deltaCount: record.deltaCount,
      inputTokens: record.inputTokens,
      outputTokens: record.outputTokens,
      textHash: record.textHash,
    })),
  };
  writeFileSync(
    join(outputDir, 'provider-correlation.json'),
    `${JSON.stringify(correlation, null, 2)}\n`,
  );
}

/* -------------------------------------------------------------------- CLI -- */

/**
 * The AC-1-only case: the real install + byte-identical copies + clean-consumer
 * compiler + expo-doctor, with no device reservation and no live legs. Writes the
 * receipts under the output dir and returns the observed result.
 */
export async function runInstallExactSource(
  outputDir: string,
  manifestPath?: string,
): Promise<Record<string, unknown>> {
  mkdirSync(outputDir, { recursive: true });
  const manifest = loadManifest(manifestPath ?? MANIFEST_PATH);
  const mismatches = validateManifestSources(manifest);
  if (mismatches.length > 0) {
    const result = {
      task: 'ORI-RN-005',
      case: 'ORI-RN-005-install-exact-source',
      passed: false,
      hash_mismatches: mismatches,
      diagnostic: formatMismatches(mismatches),
    };
    writeFileSync(
      join(outputDir, 'install-exact-source.json'),
      `${JSON.stringify(result, null, 2)}\n`,
    );
    return result;
  }

  const consumer = buildNativeWindConsumer(manifest);
  const pairsMatch = consumer.copyPairs.length === 5 && consumer.copyPairs.every((p) => p.match);
  const result = {
    task: 'ORI-RN-005',
    case: 'ORI-RN-005-install-exact-source',
    candidate_head_sha: gitHead(),
    generated_at: nowIso(),
    cli_version: consumer.cliVersion,
    script_exit: consumer.scriptExit,
    copy_pairs: consumer.copyPairs,
    five_pairs_match: pairsMatch,
    tsc: { exit: consumer.tsc.exit, output: consumer.tsc.output },
    expo_doctor: { exit: consumer.expoDoctor.exit, output: consumer.expoDoctor.output },
    resolved_versions: consumer.resolvedVersions,
    public_registry_hashes: publicRegistryHashes(),
    install_log_tail: consumer.installLog.slice(-4000),
    passed:
      pairsMatch &&
      consumer.scriptExit === 0 &&
      consumer.tsc.exit === 0 &&
      consumer.expoDoctor.exit === 0,
  };
  writeFileSync(
    join(outputDir, 'install-exact-source.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  writeFileSync(
    join(outputDir, 'install-log.txt'),
    `${consumer.installLog}\n--- tsc (exit ${consumer.tsc.exit}) ---\n${consumer.tsc.output}\n--- expo-doctor (exit ${consumer.expoDoctor.exit}) ---\n${consumer.expoDoctor.output}\n`,
  );
  rmSync(consumer.root, { recursive: true, force: true });
  return result;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  function flag(name: string): string | undefined {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  }

  const caseName = flag('--case');
  if (caseName === 'ORI-RN-005-install-exact-source') {
    const result = await runInstallExactSource(flag('--out') ?? EVIDENCE_ROOT, flag('--manifest'));
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) process.exitCode = 1;
    return;
  }

  const platforms = (flag('--platforms') ?? 'ios,android,web').split(',') as Platform[];
  const runId = flag('--run-id') ?? `ORI-RN-005-${Date.now()}`;
  const result = await runNativewindLiveExampleProof({
    engine: 'nativewind',
    platforms,
    runId,
    manifestPath: flag('--manifest'),
    outputDir: flag('--out'),
  });
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
