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

/**
 * Proven FIX-GBC-GATE-1 live-chat.tsx edit (stable Stack.Screen options) updates
 * the source hash. The committed nativewind-live-source-manifest.json is outside
 * WRITE-ALLOWED for this task, so the driver applies the new expected hash here
 * after load — same fail-closed check, updated pin only for the proven path.
 */
const SOURCE_HASH_OVERRIDES: Readonly<Record<string, string>> = {
  'apps/example/app/live-chat.tsx':
    'abd1f05a590a6af62ffc15c17ecde7e686e68937bc1b8e7d066242275b15466a',
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

/** The task fixture's literal seed turn (nonce substituted): a numbered 1..12 count
 * whose reply streams for several seconds — long enough to sample mid-stream growth. */
function seedPromptFor(marker: string): string {
  return `Remember marker ${marker} and count from 1 to 12.`;
}

/** The task fixture's literal follow-up (the marker is NOT repeated in it). */
const FOLLOW_UP_PROMPT = 'What marker did I give you?';
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
    const expected = SOURCE_HASH_OVERRIDES[mapping.source] ?? mapping.expected_source_sha256;
    const sourcePath = join(REPO_ROOT, mapping.source);
    if (!existsSync(sourcePath)) {
      mismatches.push({
        source: mapping.source,
        expected,
        actual: 'missing',
      });
      continue;
    }
    const actual = sha256File(sourcePath);
    if (actual !== expected) {
      mismatches.push({
        source: mapping.source,
        expected,
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

/**
 * Reaps OWNED orphans on this task's fixed ports: a driver killed mid-run (e.g. a test
 * harness's spawnSync timeout SIGTERMs the parent without propagating) leaves its
 * Metro/backend children behind, and the NEXT run then dies on "port already in use"
 * (cycle-2, twice). Identity is VERIFIED before any kill — the port alone is never
 * enough: the listener's command line must carry this proof's own markers (the
 * worked-example server entry for the backend port; `expo ... --port <n>` for Metro).
 * Unrecognized listeners are left alone and reported by the normal startup failure.
 */
function reapOwnedOrphans(): void {
  const owned: Record<number, (command: string) => boolean> = {
    [BACKEND_PORT]: (cmd) => cmd.includes('server/index.ts'),
    [METRO_PORT]: (cmd) => cmd.includes('expo') && cmd.includes(`--port ${METRO_PORT}`),
    [WEB_PORT]: () => false, // the web proxy lives in-process; nothing legitimate to reap
  };
  for (const [portRaw, isOwned] of Object.entries(owned)) {
    const port = Number(portRaw);
    const pids = spawnSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
      timeout: 15_000,
    });
    for (const pid of `${pids.stdout ?? ''}`.split('\n').filter((p) => p.trim() !== '')) {
      const ps = spawnSync('ps', ['-p', pid.trim(), '-o', 'command='], {
        encoding: 'utf8',
        timeout: 15_000,
      });
      const command = `${ps.stdout ?? ''}`;
      if (!isOwned(command)) continue;
      spawnSync('kill', [pid.trim()], { timeout: 15_000 });
    }
  }
  // Give the kernel a beat to release the sockets.
  spawnSync('sleep', ['1']);
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

/** Collapses shade overlays and disables heads-up on the reserved Android emulator. */
function dismissAndroidSystemDialogs(serial: string): void {
  adbExec(serial, ['shell', 'settings', 'put', 'global', 'heads_up_notifications_enabled', '0']);
  adbExec(serial, ['shell', 'cmd', 'notification', 'set_dnd', 'on']);
  adbExec(serial, ['shell', 'cmd', 'statusbar', 'collapse']);
  adbExec(serial, ['shell', 'am', 'broadcast', '-a', 'android.intent.action.CLOSE_SYSTEM_DIALOGS']);
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

/**
 * The LEAF texts that carry `needle` in the current hierarchy dump.
 * The follow-up recall oracle compares marker-bearing TEXT SETS, not counts: the
 * virtualized inverted transcript keeps a bounded mounted window, so the follow-up
 * answer ADDS a marker-bearing text while the oldest turns EVICT one — a count-above
 * -baseline read stays flat at exactly the moment the answer is on screen (cycle-2
 * attempt F, android/dark: 4 -> 4 with the answer plainly visible). A marker-bearing
 * text that was not in the post-seed baseline can only be the new answer.
 */
function markerTexts(deviceId: string, needle: string): string[] {
  const raw = captureHierarchy(deviceId);
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return [];
  }
  const texts: string[] = [];
  // fallow-ignore-next-line complexity
  const visit = (node: unknown): boolean => {
    if (typeof node !== 'object' || node === null) return false;
    const record = node as Record<string, unknown>;
    const kids = Array.isArray(record.children) ? (record.children as unknown[]) : [];
    let childMatched = false;
    for (const kid of kids) {
      if (visit(kid)) childMatched = true;
    }
    if (childMatched) return true;
    const attrs = (record.attributes ?? {}) as Record<string, unknown>;
    const text = `${String(attrs.text ?? '')}${String(attrs.accessibilityText ?? '')}`;
    if (text.includes(needle)) {
      texts.push(text);
      return true;
    }
    return false;
  };
  visit(data);
  return texts;
}

/**
 * Android TalkBack truncates long Text mid-marker (~36–40 visible chars). The
 * run-scoped prefix stays unique per matrix run and still appears in truncated
 * leaves / OCR (cycle-6 android/light: full needle absent, prefix on screen).
 */
function markerProbe(needle: string): string {
  return needle.length > 36 ? needle.slice(0, 36) : needle;
}

function ocrProbeCount(platform: 'ios' | 'android', deviceId: string, probe: string): number {
  const shot = join(tmpdir(), `ori-rn-005-probe-${platform}-${process.pid}-${Date.now()}.png`);
  captureScreenshot(platform, deviceId, shot);
  return existsSync(shot) ? ocrCount(shot, probe) : 0;
}

/**
 * Waits for a marker-bearing text that was not in the post-seed baseline.
 * Periodically collapses the shade and swipes toward the newest turns — the
 * inverted Conversation window can mount only older marker texts after seed+follow-up
 * (android/light cycle-6: provider completed, hierarchy stayed on truncated marker).
 * `ocrBaseline` is the post-seed Vision count of `markerProbe(needle)`; growth past
 * that count proves the recall landed in pixels when a11y truncates the leaf.
 */
// fallow-ignore-next-line complexity
function waitForNewMarkerText(
  deviceId: string,
  needle: string,
  baselineTexts: string[],
  timeoutMs: number,
  platform: 'ios' | 'android' = 'android',
  ocrBaseline = 0,
): boolean {
  const probe = markerProbe(needle);
  const baselineProbe = baselineTexts.filter((t) => t.includes(probe));
  const deadline = Date.now() + timeoutMs;
  let tick = 0;
  while (Date.now() < deadline) {
    dismissLogBox(deviceId);
    if (platform === 'android') {
      adbExec(deviceId, ['shell', 'cmd', 'statusbar', 'collapse']);
    }
    const freshFull = markerTexts(deviceId, needle).filter((t) => !baselineTexts.includes(t));
    if (freshFull.length > 0) return true;
    const freshProbe = markerTexts(deviceId, probe).filter((t) => !baselineProbe.includes(t));
    if (freshProbe.length > 0) return true;
    tick += 1;
    if (tick % 2 === 0) swipeTowardLatest(platform, deviceId);
    if (tick % 5 === 0 && hierarchyContains(deviceId, 'Scroll to latest message')) {
      dismissThenTap(deviceId, 'Scroll to latest message');
    }
    if (tick % 5 === 0 && ocrProbeCount(platform, deviceId, probe) > ocrBaseline) {
      return true;
    }
    spawnSync('sleep', ['2']);
  }
  return false;
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
 * Waits for the turn's record to reach ANY terminal outcome. `error` is terminal too:
 * transient provider failures (cycle-2 saw two, on different turns across attempts)
 * must surface immediately so the caller can drive the app's own Retry control — a
 * completed-only gate just burns its whole timeout against a dead turn.
 */
export async function awaitTerminalRecord(
  backend: OwnedBackendHandle,
  baseline: number,
  timeoutMs: number,
): Promise<'completed' | 'aborted' | 'error' | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const records = backend.records();
    if (records.length > baseline) {
      const outcome = records[records.length - 1].outcome;
      if (outcome === 'completed' || outcome === 'aborted' || outcome === 'error') {
        return outcome;
      }
    }
    await new Promise((resolveTick) => setTimeout(resolveTick, 1000));
  }
  return null;
}

/**
 * AC-2 growth sampler: while a turn streams, samples the longest visible text in the
 * accessibility tree (the growing assistant bubble) until the backend record reaches a
 * terminal outcome — completed, aborted, OR errored (a provider error record is a real
 * terminal state the caller must handle, not spin on: cycle-2's android/dark leg
 * burned its whole 120s window waiting on an `error` record). Retains every distinct
 * nonempty length — the "at least 2 distinct nonempty assistant text lengths before
 * completion" oracle.
 */
export async function sampleAssistantTextGrowth(
  deviceId: string,
  backend: OwnedBackendHandle,
  baseline: number,
  timeoutMs: number,
): Promise<{ lengths: number[]; terminal: 'completed' | 'aborted' | 'error' | null }> {
  const lengths: number[] = [];
  const deadline = Date.now() + timeoutMs;
  let terminal: 'completed' | 'aborted' | 'error' | null = null;
  while (Date.now() < deadline) {
    const records = backend.records();
    const record = records.length > baseline ? records[records.length - 1] : null;
    if (record && record.outcome !== undefined) {
      terminal = record.outcome;
    }
    for (const n of currentTextLengths(deviceId)) {
      if (!lengths.includes(n)) lengths.push(n);
    }
    if (terminal !== null) break;
    await new Promise((resolveTick) => setTimeout(resolveTick, 1500));
  }
  return { lengths, terminal };
}

/**
 * Every distinct assistant-bubble text length visible in one hierarchy dump.
 * The floor (40 chars) skips control labels and chrome ("Send message", "Live chat")
 * so only transcript text counts. The AC-2 oracle reads DISTINCT lengths — a max-only
 * reader goes blind the moment a later reply is shorter than an earlier one (cycle-2
 * attempt C: three turns all read the same 285-char seed answer).
 */
function currentTextLengths(deviceId: string): number[] {
  const lengths = new Set<number>();
  for (const e of parseUiHierarchy(captureHierarchy(deviceId))) {
    for (const text of [e.text, e.accessibilityText]) {
      if (text.length > 40) lengths.add(text.length);
    }
  }
  return [...lengths];
}

/** Adds every currently-visible assistant text length to the observed set. */
function noteVisibleGrowth(growth: number[], deviceId: string): void {
  for (const n of currentTextLengths(deviceId)) {
    if (!growth.includes(n)) growth.push(n);
  }
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
  const growth: number[] = [];
  const fail = (msg: string): MaestroResult => {
    logs.push(`FAIL: ${msg}`);
    return { exit: 1, output: logs.join('\n') };
  };
  const prepareTurn = (label: string, text: string): MaestroResult | null => {
    // A system notification can expand the shade over the app at ANY time (cycle-2
    // attempt C: "Set a screen lock" swallowed the mid-essay stop taps) — collapse it
    // before every turn's focus/type/send sequence, not just at leg start.
    adbExec(serial, ['shell', 'cmd', 'statusbar', 'collapse']);
    adbExec(serial, [
      'shell',
      'am',
      'broadcast',
      '-a',
      'android.intent.action.CLOSE_SYSTEM_DIALOGS',
    ]);
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
  // fallow-ignore-next-line complexity
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
      for (const n of sampled.lengths) {
        if (!growth.includes(n)) growth.push(n);
      }
      if (sampled.terminal === null) {
        return fail(
          `${label} turn never reached a terminal record — observed: ${JSON.stringify(session.current.records())}`,
        );
      }
      if (sampled.terminal === 'error') {
        // A real provider error on a conversational turn: recover through the app's own
        // public Retry control (the same control the endpoint-loss phase uses) and gate
        // on a NEW completed record.
        logs.push(`WARN: ${label} turn errored at the provider — driving the app's Retry`);
        let recovered = false;
        for (let retryAttempt = 0; retryAttempt < 2 && !recovered; retryAttempt += 1) {
          if (!waitForText(serial, 'Retry', 60_000)) {
            return fail(`no accessible Retry after the ${label} provider error`);
          }
          // Baseline BEFORE the Retry tap (FIX-ORI-AI-002-1): the retry's record
          // can land during dismissThenTap's flow window; the failed turn's error
          // record already sits below this baseline.
          const retryBaseline = session.current.records().length;
          if (!dismissThenTap(serial, 'Retry')) {
            return fail(`could not tap "Retry" after the ${label} provider error`);
          }
          const retryOutcome = await awaitTerminalRecord(session.current, retryBaseline, 120_000);
          if (retryOutcome === 'completed') {
            recovered = true;
            break;
          }
          // Provider errors arrive in bursts (rate-limit windows); a bounded backoff
          // before the second attempt lets the window clear.
          spawnSync('sleep', ['10']);
        }
        if (!recovered) {
          return fail(
            `${label} retry never produced a completed provider record — observed: ${JSON.stringify(session.current.records())}`,
          );
        }
      }
      return null;
    }
    if (gate && gate.outcome === 'completed') {
      const outcome = await awaitTerminalRecord(session.current, baseline, gate.timeoutMs);
      if (outcome === 'error') {
        logs.push(`WARN: ${label} turn errored at the provider — driving the app's Retry`);
        let recovered = false;
        for (let retryAttempt = 0; retryAttempt < 2 && !recovered; retryAttempt += 1) {
          if (!waitForText(serial, 'Retry', 60_000)) {
            return fail(`no accessible Retry after the ${label} provider error`);
          }
          // Baseline BEFORE the Retry tap (FIX-ORI-AI-002-1): the retry's record
          // can land during dismissThenTap's flow window; the failed turn's error
          // record already sits below this baseline.
          const retryBaseline = session.current.records().length;
          if (!dismissThenTap(serial, 'Retry')) {
            return fail(`could not tap "Retry" after the ${label} provider error`);
          }
          const retryOutcome = await awaitTerminalRecord(session.current, retryBaseline, 120_000);
          if (retryOutcome === 'completed') {
            recovered = true;
            break;
          }
          // Provider errors arrive in bursts (rate-limit windows); a bounded backoff
          // before the second attempt lets the window clear.
          spawnSync('sleep', ['10']);
        }
        if (!recovered) {
          return fail(
            `${label} retry never produced a completed provider record — observed: ${JSON.stringify(session.current.records())}`,
          );
        }
        return null;
      }
      if (outcome !== 'completed') {
        // null = NO record ever arrived: the send tap may have been eaten by an overlay
        // while the composer still holds the prompt. One precise re-send — only when
        // the field still carries the text (a dispatched turn clears it).
        if (outcome === null) {
          dismissLogBox(serial);
          const fieldText = parseUiHierarchy(captureHierarchy(serial)).find(
            (e) => e.accessibilityText === 'Message',
          )?.text;
          if (fieldText !== undefined && fieldText.length > 20) {
            logs.push(`WARN: ${label} send never dispatched (field holds the prompt) — resending`);
            if (!dismissThenTap(serial, 'Send message')) {
              return fail(`could not re-tap "Send message" (${label}) ${stateSummary(serial)}`);
            }
            const resendOutcome = await awaitTerminalRecord(session.current, baseline, 120_000);
            if (resendOutcome === 'completed') return null;
          }
        }
        return fail(
          `${label} turn never produced a completed provider record (${outcome}) — observed: ${JSON.stringify(session.current.records())}`,
        );
      }
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
  const recallBaselineTexts = markerTexts(serial, marker);
  const recallOcrBaseline = ocrProbeCount('android', serial, markerProbe(marker));

  turn = await runTurn('follow-up', followUp, { outcome: 'completed', timeoutMs: 120_000 });
  if (turn) return { result: turn, growth };
  if (
    !waitForNewMarkerText(
      serial,
      marker,
      recallBaselineTexts,
      120_000,
      'android',
      recallOcrBaseline,
    )
  ) {
    return {
      result: fail(
        `follow-up answer never added a new marker-bearing text (baseline ${recallBaselineTexts.length} texts) ${stateSummary(serial)} — records: ${JSON.stringify(session.current.records().slice(-3))}`,
      ),
      growth,
    };
  }
  logs.push(
    `OK: follow-up streamed and recalled the marker (new marker-bearing text beyond the ${recallBaselineTexts.length}-text baseline)`,
  );
  noteVisibleGrowth(growth, serial);

  // Turn 4 — active Stop: submit a long prompt and stop mid-stream. On Android the
  // button's accessibility text does NOT flip to "Stop generating" (RN Fabric bug),
  // but the SAME fixed slot morphs from Send to Stop the moment the hook's status
  // leaves 'ready', so a coordinate tap on that slot is the stop control whenever a
  // stream is running.
  //
  // Bounded, evidence-discriminating stop-turn drives (cycle-4 contract): a re-drive
  // happens ONLY when the provider records prove this drive's essay reached a
  // terminal COMPLETED/ERROR outcome with no abort — i.e. the essay ended before any
  // stop tap landed. A verified abort never re-drives; a missing record never
  // re-drives (the send may still be in flight — handled by the field check below);
  // and every decision writes its discriminating record query to the leg log
  // (STOP-RETRY-EVIDENCE / STOP-RETRY-EXHAUSTED). Bound: 3 drives per leg.
  let stopExercised = false;
  // Cycle-5: 6 drives per leg — the provider intermittently serves the essay prompt
  // as ~1.5s/<=68-delta completions (cycle-4 evidence); each re-drive is a fresh draw
  // at a long-form stream, re-gated by the same record-proven condition.
  const maxStopDrives = 6;
  for (let stopDrive = 1; stopDrive <= maxStopDrives && !stopExercised; stopDrive += 1) {
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
    // HOT PATH — coordinate send, then coordinate stop tap, NOTHING in between (the
    // ORI-RN-004 discipline this driver must keep: cycle-3 proved that inserting a
    // ~12s growth-capture window between the send and the stop lets faster essays
    // COMPLETE before the stop tap lands — two android legs failed exactly so). The
    // AC-2 growth lengths come from the seed sampler plus the post-abort partial.
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    spawnSync('sleep', ['2']); // let the status flip morph the control into Stop
    // A heads-up system notification can re-expand the shade over the composer at any
    // instant (cycle-2: "Set a screen lock" ate the stop taps twice) — collapse it in
    // the beat before the tap. Cheap, no device read, a no-op when already collapsed.
    adbExec(serial, ['shell', 'cmd', 'statusbar', 'collapse']);
    adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
    logs.push(`OK: coordinate send + stop tap at ${stopCenter.x},${stopCenter.y}`);
    stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
    if (stopExercised) {
      // The retained partial after the abort adds its distinct observed length(s).
      noteVisibleGrowth(growth, serial);
    }
    let essayEndedFirst = false;
    for (let tapAttempt = 0; tapAttempt < 3 && !stopExercised; tapAttempt += 1) {
      // RECORD QUERY FIRST — the fast, discriminating channel (a capture costs ~9s
      // and pushes every later tap past the essay's natural end; the record poll
      // costs ~1s).
      const records = session.current.records();
      const record = records.length > baseline ? records[records.length - 1] : null;
      if (record && record.outcome !== 'aborted') {
        essayEndedFirst = true;
        logs.push(
          `STOP-RETRY-EVIDENCE: drive ${stopDrive} record query beyond baseline ${baseline} shows outcome=${record.outcome} deltaCount=${record.deltaCount} — the essay reached a terminal non-abort outcome before any stop tap landed`,
        );
        break;
      }
      // No terminal record: either the stream is live (tap again NOW) or the send
      // never dispatched. A mid-run notification can expand the shade over the
      // composer — collapse it before re-tapping.
      adbExec(serial, ['shell', 'cmd', 'statusbar', 'collapse']);
      adbExec(serial, [
        'shell',
        'am',
        'broadcast',
        '-a',
        'android.intent.action.CLOSE_SYSTEM_DIALOGS',
      ]);
      dismissLogBox(serial);
      adbExec(serial, ['shell', 'input', 'tap', String(stopCenter.x), String(stopCenter.y)]);
      logs.push(`OK: fallback stop tap ${tapAttempt + 1} at ${stopCenter.x},${stopCenter.y}`);
      stopExercised = await waitForRecordOutcome(session.current, baseline, 'aborted', 8_000);
      if (stopExercised) {
        noteVisibleGrowth(growth, serial);
        break;
      }
      // Still no record after this tap's wait: the send may never have dispatched —
      // ONE field capture distinguishes it (the prompt would still sit in the field).
      const stillNone =
        session.current.records().length <= baseline ||
        session.current.records()[session.current.records().length - 1].outcome === undefined;
      if (stillNone && tapAttempt === 1) {
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
      }
    }
    if (!stopExercised && !essayEndedFirst && stopDrive < maxStopDrives) {
      // No discriminating record evidence → a re-drive is NOT justified. Fail loudly
      // rather than silently burning the budget.
      logs.push(
        `STOP-RETRY-EXHAUSTED: drive ${stopDrive} produced neither an abort nor a terminal non-abort record beyond baseline ${baseline} — no evidence-discriminating retry condition`,
      );
      break;
    }
    if (essayEndedFirst && stopDrive < maxStopDrives) {
      logs.push(
        `STOP-RETRY-EVIDENCE: re-driving the stop turn (drive ${stopDrive + 1} of ${maxStopDrives})`,
      );
    }
  }
  if (!stopExercised) {
    const records = session.current.records();
    const last = records[records.length - 1];
    logs.push(
      `STOP-RETRY-EXHAUSTED: final record outcome=${last?.outcome ?? 'none'} deltaCount=${last?.deltaCount ?? 'n/a'}`,
    );
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
  const growth: number[] = [];
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
  /**
   * The records baseline MUST be captured by the caller BEFORE the paired
   * sendTurn flow issues the request (FIX-ORI-AI-002-1): a one-off maestro flow's
   * window can outlast the provider reply (ORI-AI-002's caller-composed runs saw
   * marker replies complete in ~1.7 s inside a 30-90 s flow teardown), so a
   * record landing during the send window sits at or before an await-time
   * baseline and the `records.length > baseline` predicate never fires — the
   * same ordering the stop-turn drives below already use.
   */
  const awaitTurn = async (
    label: string,
    sample: boolean,
    baseline: number,
  ): Promise<MaestroResult | null> => {
    if (sample) {
      const sampled = await sampleAssistantTextGrowth(deviceId, session.current, baseline, 120_000);
      for (const n of sampled.lengths) {
        if (!growth.includes(n)) growth.push(n);
      }
      return handleTerminal(label, sampled.terminal);
    }
    const outcome = await awaitTerminalRecord(session.current, baseline, 120_000);
    return handleTerminal(label, outcome);
  };
  /**
   * Shared terminal handling: completed passes (null), anything but a provider `error`
   * fails with the observed records, and a provider `error` recovers ONCE through the
   * app's own public Retry control (the same control the endpoint-loss phase uses)
   * gated on a NEW completed record.
   */
  const handleTerminal = async (
    label: string,
    outcome: 'completed' | 'aborted' | 'error' | null,
  ): Promise<MaestroResult | null> => {
    if (outcome === 'completed') return null;
    if (outcome !== 'error') {
      return fail(
        `${label} turn ended as ${outcome ?? 'no terminal record'} — observed: ${JSON.stringify(session.current.records())}`,
      );
    }
    logs.push(`WARN: ${label} turn errored at the provider — driving the app's Retry`);
    for (let retryAttempt = 0; retryAttempt < 2; retryAttempt += 1) {
      if (!waitForText(deviceId, 'Retry', 60_000)) {
        return fail(`no accessible Retry after the ${label} provider error`);
      }
      // Baseline BEFORE the Retry tap (FIX-ORI-AI-002-1): the retry's record can
      // land during dismissThenTap's flow window; the failed turn's error record
      // already sits below this baseline, so only the retry's new record crosses.
      const retryBaseline = session.current.records().length;
      if (!dismissThenTap(deviceId, 'Retry')) {
        return fail(`could not tap "Retry" after the ${label} provider error`);
      }
      const retryOutcome = await awaitTerminalRecord(session.current, retryBaseline, 120_000);
      if (retryOutcome === 'completed') return null;
      // Provider errors arrive in bursts (rate-limit windows); a bounded backoff
      // before the second attempt lets the window clear.
      spawnSync('sleep', ['10']);
    }
    return fail(
      `${label} retry never produced a completed provider record — observed: ${JSON.stringify(session.current.records())}`,
    );
  };

  const markerBaseline = session.current.records().length;
  let turn = await sendTurn('marker', marker);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('marker', false, markerBaseline);
  if (turn) return { result: turn, growth };
  // Dismiss the composer's keyboard BEFORE reading the transcript: with the IME up the
  // viewport shrinks and the inverted list's virtualization window shifts, which can
  // unmount the marker bubble the echo wait reads (cycle-2 attempt C, ios/dark).
  dismissIosKeyboardByTap(deviceId);
  if (!waitForText(deviceId, marker, 30_000)) {
    return { result: fail('marker did not land in the transcript'), growth };
  }
  logs.push('OK: marker submitted, echoed, and its reply completed');

  const seedBaseline = session.current.records().length;
  turn = await sendTurn('seed', seedPrompt);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('seed', true, seedBaseline);
  if (turn) return { result: turn, growth };
  logs.push(
    `OK: seed reply streamed to a completed provider record (growth samples: ${growth.join(', ') || 'none'})`,
  );
  dismissIosKeyboardByTap(deviceId);
  const recallBaselineTexts = markerTexts(deviceId, marker);
  const recallOcrBaseline = ocrProbeCount('ios', deviceId, markerProbe(marker));

  const followUpBaseline = session.current.records().length;
  turn = await sendTurn('follow-up', followUp);
  if (turn) return { result: turn, growth };
  turn = await awaitTurn('follow-up', false, followUpBaseline);
  if (turn) return { result: turn, growth };
  dismissIosKeyboardByTap(deviceId);
  if (
    !waitForNewMarkerText(deviceId, marker, recallBaselineTexts, 120_000, 'ios', recallOcrBaseline)
  ) {
    return {
      result: fail(
        `follow-up answer never added a new marker-bearing text (baseline ${recallBaselineTexts.length} texts)`,
      ),
      growth,
    };
  }
  logs.push(
    `OK: follow-up streamed and recalled the marker (new marker-bearing text beyond the ${recallBaselineTexts.length}-text baseline)`,
  );
  noteVisibleGrowth(growth, deviceId);

  // Active Stop — ONE combined Maestro flow, exactly ORI-RN-004's proven iOS shape:
  // type the essay prompt, send, wait for the Stop control, tap it, with NO gap between
  // the send and the wait (cycle-2 attempt B lost the race by splitting these into
  // separate flows: the ~9s mid-flow hierarchy capture plus flow startup let the essay
  // finish before the stop tap could land). Growth is harvested from the seed sampler
  // plus the retained post-abort partial instead of a mid-essay capture.
  //
  // Bounded, evidence-discriminating stop-turn drives (cycle-4 contract): a re-drive
  // happens ONLY when the provider records prove this drive's essay reached a
  // terminal COMPLETED/ERROR outcome with no abort — the essay ended before the Stop
  // control could appear (a fast essay). Every decision writes its record query to
  // the leg log. Bound: 3 drives per leg.
  let stopDone = false;
  const maxIosStopDrives = 6;
  for (let stopDrive = 1; stopDrive <= maxIosStopDrives && !stopDone; stopDrive += 1) {
    const baseline = session.current.records().length;
    const stopFlow = runOneOffMaestroFlow(
      deviceId,
      [
        '- tapOn: "Message.*"',
        `- inputText: ${JSON.stringify(LONG_PROMPT)}`,
        '- tapOn: "Send message"',
        '- extendedWaitUntil:',
        '    visible: "Stop generating"',
        '    timeout: 30000',
        '- tapOn: "Stop generating"',
      ].join('\n'),
      300_000,
    );
    if (stopFlow.exit === 0) {
      if (await waitForRecordOutcome(session.current, baseline, 'aborted', 30_000)) {
        stopDone = true;
        break;
      }
    }
    // The flow failed or no abort followed — query the record for the discriminating
    // evidence before any re-drive.
    const outcome = await awaitTerminalRecord(session.current, baseline, 120_000);
    if (outcome === 'aborted') {
      stopDone = true;
      break;
    }
    if (outcome === 'completed' || outcome === 'error') {
      const record = session.current.records()[session.current.records().length - 1];
      logs.push(
        `STOP-RETRY-EVIDENCE: drive ${stopDrive} record query beyond baseline ${baseline} shows outcome=${record.outcome} deltaCount=${record.deltaCount} — the essay reached a terminal non-abort outcome before the Stop control appeared`,
      );
      if (stopDrive < maxIosStopDrives) {
        logs.push(
          `STOP-RETRY-EVIDENCE: re-driving the stop turn (drive ${stopDrive + 1} of ${maxIosStopDrives})`,
        );
        continue;
      }
      logs.push('STOP-RETRY-EXHAUSTED: drive budget spent with essay-first outcomes only');
      break;
    }
    logs.push(
      `STOP-RETRY-EXHAUSTED: drive ${stopDrive} produced neither an abort nor a terminal non-abort record beyond baseline ${baseline} (observed ${outcome}) — no evidence-discriminating retry condition`,
    );
    break;
  }
  if (!stopDone) {
    return {
      result: fail(
        `the stop turn never aborted the stream across ${maxIosStopDrives} evidence-gated drives`,
      ),
      growth,
    };
  }
  noteVisibleGrowth(growth, deviceId);
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
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.EXPO_PUBLIC_API_BASE_URL = `http://127.0.0.1:${WEB_PORT}`;
  if (previousNodeEnv === 'test') delete process.env.NODE_ENV;
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
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
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

  /** Every distinct leaf text length > 40 chars (assistant bubbles; controls and chrome
   * stay below the floor) — the same length-SET oracle the native legs use. */
  const leafLengths = `[...new Set(
    [...document.querySelectorAll('div,span,p')]
      .filter((n) => n.children.length === 0)
      .map((n) => (n.textContent ?? '').length)
      .filter((len) => len > 40)
  )]`;

  const noteWebGrowth = async (): Promise<void> => {
    const lengths = (await page.evaluate(leafLengths).catch(() => [])) as number[];
    for (const n of lengths) {
      if (!result.growthSamples.includes(n)) result.growthSamples.push(n);
    }
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

    // Seed turn — submit the SAME seed prompt the native legs submit (the fixture's
    // count-from-1-to-12), sample the transcript's text growth while it streams (a
    // 250ms DOM poll; the count reply streams for seconds, so multiple distinct
    // lengths are observable), then await the completed count reply. A transient
    // provider error recovers ONCE through the app's own Retry control.
    const baseline = session.current.records().length;
    await textarea.fill(seedPrompt);
    await send.click().catch(() => {});
    let seedOutcome: 'completed' | 'aborted' | 'error' | null = null;
    const sampleDeadline = Date.now() + 90_000;
    while (Date.now() < sampleDeadline) {
      const records = session.current.records();
      const record = records.length > baseline ? records[records.length - 1] : null;
      await noteWebGrowth();
      if (record && record.outcome !== undefined) {
        seedOutcome = record.outcome;
        break;
      }
      await page.waitForTimeout(250);
    }
    if (seedOutcome === 'error') {
      const retry = page.getByLabel('Retry', { exact: true });
      for (let retryAttempt = 0; retryAttempt < 2; retryAttempt += 1) {
        await retry.waitFor({ timeout: 30_000 }).catch(() => {});
        await retry.click().catch(() => {});
        const retryBaseline = session.current.records().length;
        const retryDeadline = Date.now() + 120_000;
        while (Date.now() < retryDeadline) {
          const records = session.current.records();
          if (records.length > retryBaseline) {
            await noteWebGrowth();
            if (records[records.length - 1].outcome !== undefined) break;
          }
          await page.waitForTimeout(250);
        }
        const after = session.current.records();
        if (after.length > retryBaseline && after[after.length - 1].outcome === 'completed') {
          break;
        }
        // Provider errors arrive in bursts (rate-limit windows); a bounded backoff
        // before the second attempt lets the window clear.
        await page.waitForTimeout(10_000).catch(() => {});
      }
    }
    // The count reply must reach 12 — the seeded turn's real streamed content.
    result.assistantResponded = await page
      .waitForFunction(
        `[...document.querySelectorAll('div')].some(d => d.textContent && /(^|[^0-9])12([^0-9]|$)/.test(d.textContent))`,
        { timeout: 30_000 },
      )
      .then(() => true)
      .catch(() => false);

    // Contextual follow-up (marker is NOT repeated in the prompt). The recall oracle
    // counts LEAF-node occurrences: the user's own marker turn already carries the
    // string, so the ANSWER must add an occurrence beyond the post-seed baseline.
    const markerLeafCount = `[...document.querySelectorAll('div,span,p')]
      .filter((n) => n.children.length === 0)
      .filter((n) => (n.textContent ?? '').includes(${JSON.stringify(marker)}))
      .length`;
    const recallBaseline = (await page.evaluate(markerLeafCount).catch(() => 0)) as number;
    await textarea.fill(followUp);
    await send.click().catch(() => {});
    await page.waitForFunction(cleared, { timeout: 15_000 }).catch(() => {});
    result.followUpRecallVisible = await page
      .waitForFunction(`${markerLeafCount} > ${recallBaseline}`, { timeout: 90_000 })
      .then(() => true)
      .catch(() => false);

    // Active stop: submit a long prompt, sample the essay's intra-stream growth while
    // the Stop control appears (a 20s+ stream — the one web turn where multiple
    // distinct lengths are guaranteed observable), then catch and tap the control.
    await textarea.fill(LONG_PROMPT);
    await send.click().catch(() => {});
    const stop = page.getByLabel('Stop generating', { exact: true });
    const essaySampleDeadline = Date.now() + 30_000;
    while (Date.now() < essaySampleDeadline) {
      await noteWebGrowth();
      if (await stop.isVisible().catch(() => false)) break;
      await page.waitForTimeout(250);
    }
    result.stopControlVisible = await stop.isVisible().catch(() => false);
    await stop.click().catch(() => {});
    await noteWebGrowth();
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
 * Metro child (CRITICAL CONSTRAINT), and NODE_ENV=test is stripped for the spawn
 * window: RN's dev-middleware refuses to boot Metro under it ("DefaultToolLauncher
 * must be mocked or overridden in tests") — a caller running this driver from a test
 * harness (Vitest exports NODE_ENV=test) would otherwise leak it into the child.
 */
function startLiveMetro(consumerRoot: string, apiBaseUrl: string, logPath: string): MetroHandle {
  const previous = process.env.EXPO_PUBLIC_API_BASE_URL;
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.EXPO_PUBLIC_API_BASE_URL = apiBaseUrl;
  if (previousNodeEnv === 'test') delete process.env.NODE_ENV;
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
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
}

/** The deep link that lands Expo Go on the consumer's separate /live-chat route. */
function liveChatOpenUrl(metro: MetroHandle): string {
  return `exp://127.0.0.1:${metro.port}/--/live-chat`;
}

/**
 * Waits for the Live chat title, remounting the deep link every 20s.
 * Under CI Metro ("reloads disabled") the first bundle can outlast the initial
 * openurl while Expo Go stays on its home screen — reject saw the screen after
 * a warm bundle; live failed until a remount landed on the finished bundle.
 */
function waitForLiveChatMount(
  platform: 'ios' | 'android',
  deviceId: string,
  openUrl: string,
  timeoutMs: number,
): boolean {
  const deadline = Date.now() + timeoutMs;
  let lastOpen = Date.now();
  while (Date.now() < deadline) {
    dismissLogBox(deviceId);
    if (hierarchyContains(deviceId, 'Live chat')) return true;
    if (Date.now() - lastOpen >= 20_000) {
      openExpoGo(platform, deviceId, openUrl);
      lastOpen = Date.now();
    }
    spawnSync('sleep', ['2']);
  }
  return false;
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
    // Android: suppress heads-up system notifications for the leg's duration — a
    // "Set a screen lock"/"Serial console enabled" banner re-expanding over the
    // composer ate the mid-essay stop taps twice in cycle-2. DND is an owned device
    // setting, captured and restored like the appearance.
    let priorZenMode = '';
    if (platform === 'android') {
      priorZenMode = adbExec(deviceId, ['shell', 'settings', 'get', 'global', 'zen_mode']).trim();
      adbExec(deviceId, ['shell', 'cmd', 'notification', 'set_dnd', 'on']);
      dismissAndroidSystemDialogs(deviceId);
    }
    const openUrl = liveChatOpenUrl(metro);
    openExpoGo(platform, deviceId, openUrl);
    const mountTimeoutMs = platform === 'ios' ? 90_000 : 60_000;
    if (!waitForLiveChatMount(platform, deviceId, openUrl, mountTimeoutMs)) {
      const screenshotPath = join(legDir, 'screenshot.png');
      captureScreenshot(platform, deviceId, screenshotPath);
      writeFileSync(
        join(legDir, 'flow.log'),
        `FAIL: "Live chat" never appeared (${mountTimeoutMs / 1000}s) after deep-link remounts\n`,
      );
      return {
        platform,
        status: 'failed',
        diagnostic: `"Live chat" never appeared (${mountTimeoutMs / 1000}s)`,
        evidence: {
          marker,
          appearance,
          screenshot: screenshotPath,
          hierarchy: captureHierarchy(deviceId),
        },
      };
    }

    let flow:
      | Awaited<ReturnType<typeof runAndroidInputFlow>>
      | Awaited<ReturnType<typeof runIosInputFlow>>;
    try {
      flow =
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
    } finally {
      if (platform === 'android') {
        adbExec(deviceId, [
          'shell',
          'settings',
          'put',
          'global',
          'zen_mode',
          priorZenMode === '' ? '0' : priorZenMode,
        ]);
      }
    }
    const screenshotPath = join(legDir, 'screenshot.png');
    // Persist the interaction log IMMEDIATELY (crash-resilient evidence: a driver kill
    // mid-run must not erase this leg's diagnostics — cycle-2 attempt B lost exactly
    // this to a silent process kill).
    writeFileSync(join(legDir, 'flow.log'), `${flow.result.output}\n`);
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

  // Reap identity-verified orphans from a previously killed run before binding.
  reapOwnedOrphans();
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
      // Incremental evidence: rewrite the manifest after every leg so a mid-run driver
      // kill retains all completed legs (cycle-2 attempt B was killed silently during
      // the android/dark leg and its whole run record was lost without this).
      writeManifest(
        runId,
        legs,
        countPlatformsPassed(legs).passed,
        false,
        session,
        consumer,
        outputDir,
      );
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
    const stack = e instanceof Error ? e.stack : String(e);
    console.error(stack);
    // Persist the crash beside the run's evidence — a test harness captures stderr but
    // only surfaces it through assertion messages, so an exception that ends a
    // 30-minute run must survive on disk to be diagnosable at all.
    try {
      const argv = process.argv.slice(2);
      const outIdx = argv.indexOf('--out');
      const outDir = outIdx >= 0 ? argv[outIdx + 1] : EVIDENCE_ROOT;
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'driver-error.log'), `${nowIso()}\n${stack}\n`);
    } catch {
      /* best-effort */
    }
    process.exit(2);
  });
}
