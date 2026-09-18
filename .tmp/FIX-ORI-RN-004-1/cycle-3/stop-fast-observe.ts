/**
 * Throwaway diagnostic (NOT committed): does the send button's content-desc become
 * "Stop generating" during a real long-prompt stream on Android — and for how long?
 *
 * Replicates the proof driver's warm-up (marker + seed) so the submit path is warm,
 * then drives the LONG prompt and fast-polls `uiautomator dump` (~2s) instead of the
 * slow `maestro hierarchy` (~7-8s) so a brief streaming window cannot be missed.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { DEFAULT_MODEL, launchOwnedBackend, type OwnedBackendHandle } from '../../../tests/sprint-05-orient-search/support/live-backend';
import {
  type MetroHandle,
  openExpoGo,
  setAppearance,
  startMetro,
  stopMetro,
} from '../../../tests/sprint-05-orient-search/support/native-session';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../../..');

const EXAMPLE_ROOT = join(REPO_ROOT, 'apps/example');
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4000;
const METRO_PORT = 8095;
const ANDROID_SERIAL = 'emulator-5554';
const MAESTRO_BIN = join(process.env.HOME ?? '', '.maestro', 'bin', 'maestro');
const ANDROID_SDK = process.env.ANDROID_HOME ?? join(process.env.HOME ?? '', 'Library', 'Android', 'sdk');
const ADB = join(ANDROID_SDK, 'platform-tools', 'adb');

const LONG_PROMPT =
  'Write a detailed essay on the history of computing, from the abacus to modern machine learning, in at least ten substantial paragraphs.';

function adb(args: string[]): string {
  const r = spawnSync(ADB, ['-s', ANDROID_SERIAL, ...args], { encoding: 'utf8', timeout: 30_000 });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

function tap(selector: string): boolean {
  const flowPath = join(tmpdir(), `fast-observe-tap-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(flowPath, `appId: host.exp.Exponent\n---\n- tapOn: ${JSON.stringify(selector)}\n`);
  const r = spawnSync(MAESTRO_BIN, ['--udid', ANDROID_SERIAL, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024,
  });
  return r.status === 0;
}

/** Fast content-desc dump: uiautomator dump to /dev/tty, ~2s. */
function uiDump(): string {
  return adb(['exec-out', 'uiautomator', 'dump', '/dev/tty']);
}

function contentDescs(dump: string): string[] {
  const out: string[] = [];
  const re = /content-desc="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(dump)) !== null) if (m[1]) out.push(m[1]);
  return out;
}

function maestroHierarchy(): string {
  const r = spawnSync(MAESTRO_BIN, ['--udid', ANDROID_SERIAL, 'hierarchy', '--no-ansi'], {
    encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024,
  });
  return `${r.stdout ?? ''}${r.stderr ?? ''}`;
}

function hasText(needle: string): boolean {
  return maestroHierarchy().includes(needle);
}

function typeText(text: string): void {
  adb(['shell', 'input', 'text', text.replace(/%/g, '%25').replace(/ /g, '%s')]);
}

function imeShown(): boolean {
  const im = adb(['shell', 'dumpsys', 'input_method']);
  const wd = adb(['shell', 'dumpsys', 'window']);
  return /\bmInputShown=true\b/.test(im) || /\bmIsImeShowing=true\b/.test(wd);
}
function hideKeyboard(): void {
  if (imeShown()) { adb(['shell', 'input', 'keyevent', '4']); spawnSync('sleep', ['1']); }
}

/** Taps the field, waits for focus via maestro hierarchy (driver-proven). */
function focusField(): boolean {
  for (let i = 0; i < 4; i += 1) {
    tap('Message.*');
    spawnSync('sleep', ['2']);
    if (/\"accessibilityText\"\s*:\s*\"Message\"[^}]*?\"focused\"\s*:\s*\"true\"/s.test(maestroHierarchy())) return true;
  }
  return false;
}

function doTurn(text: string): boolean {
  if (!focusField()) return false;
  typeText(text);
  spawnSync('sleep', ['1']);
  hideKeyboard();
  return tap('Send message');
}

async function main(): Promise<void> {
  let backend: OwnedBackendHandle | null = null;
  let metro: MetroHandle | null = null;
  const out: string[] = [];
  const log = (...s: string[]) => { out.push(s.join(' ')); console.log(s.join(' ')); };

  try {
    backend = await launchOwnedBackend({ host: BACKEND_HOST, port: BACKEND_PORT, model: DEFAULT_MODEL });
    spawnSync(ADB, ['-s', ANDROID_SERIAL, 'reverse', `tcp:${BACKEND_PORT}`, `tcp:${BACKEND_PORT}`]);
    process.env.EXPO_PUBLIC_API_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
    metro = startMetro(EXAMPLE_ROOT, METRO_PORT, join(REPO_ROOT, '.tmp/FIX-ORI-RN-004-1/cycle-3/fast-observe-metro.log'));

    setAppearance('android', ANDROID_SERIAL, 'light');
    // dismiss stale system dialogs
    adb(['shell', 'am', 'broadcast', '-a', 'android.intent.action.CLOSE_SYSTEM_DIALOGS']);
    adb(['shell', 'input', 'keyevent', '4']);
    openExpoGo('android', ANDROID_SERIAL, `exp://127.0.0.1:${METRO_PORT}/--/live-chat`);

    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) { if (hasText('Live chat')) break; spawnSync('sleep', ['1']); }
    log('composer ready');

    const marker = 'FAST-OBSERVE-MARKER';
    log('warm-up marker turn:', doTurn(marker));
    spawnSync('sleep', ['5']);
    log('warm-up seed turn:', doTurn('Tell me a one-sentence fact about rain.'));
    spawnSync('sleep', ['8']);

    // Long turn
    if (!focusField()) { log('focus failed'); return finish(out); }
    typeText(LONG_PROMPT);
    spawnSync('sleep', ['1']);
    hideKeyboard();
    log('send tap:', tap('Send message'));

    // fast-poll uiautomator dump for 'Stop generating'
    const t0 = Date.now();
    const pollDeadline = t0 + 40_000;
    let sawStop = false; let firstAt = -1; let lastAt = -1;
    while (Date.now() < pollDeadline) {
      const t = Date.now() - t0;
      const descs = contentDescs(uiDump());
      const hasStop = descs.includes('Stop generating');
      const hasSend = descs.includes('Send message');
      if (hasStop) { if (!sawStop) { sawStop = true; firstAt = t; } lastAt = t; }
      log(`t=${t}ms stop=${hasStop} send=${hasSend}`);
      if (sawStop && !hasStop && lastAt > 0 && t - lastAt > 3000) break; // saw it and it's gone
    }
    log(`RESULT sawStop=${sawStop} firstAt=${firstAt}ms lastAt=${lastAt}ms`);
    const records = backend.records();
    log(`backend_records=${records.length} last=${JSON.stringify(records[records.length - 1] ?? null)}`);
  } finally {
    if (metro) stopMetro(metro);
    if (backend) await backend.stop();
    spawnSync(ADB, ['-s', ANDROID_SERIAL, 'reverse', '--remove', `tcp:${BACKEND_PORT}`]);
    finish(out);
  }
}

function finish(out: string[]): void {
  writeFileSync(join(REPO_ROOT, '.tmp/FIX-ORI-RN-004-1/cycle-3/fast-observe.out'), out.join('\n'));
  console.log(out.join('\n'));
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
