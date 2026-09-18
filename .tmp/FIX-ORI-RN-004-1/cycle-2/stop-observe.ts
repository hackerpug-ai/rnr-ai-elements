/**
 * Throwaway diagnostic (NOT committed): does `chat.status` ever flip to
 * submitted/streaming on Android — i.e. does the send button's accessibilityLabel
 * ever become "Stop generating" — during a real long-prompt stream?
 *
 * Reuses the same backend/metro/devices as the proof driver, but polls the Maestro
 * hierarchy TIGHTLY (every ~800ms) with NO LogBox dismissal inside the poll loop, so
 * a brief streaming window cannot be missed by dismissLogBox overhead.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// script lives at <repo>/.tmp/FIX-ORI-RN-004-1/cycle-2/ → repo root is 3 levels up
const REPO_ROOT = resolve(__dirname, '../../..');

import { DEFAULT_MODEL, launchOwnedBackend, type OwnedBackendHandle } from '../../../tests/sprint-05-orient-search/support/live-backend';
import {
  type MetroHandle,
  openExpoGo,
  setAppearance,
  startMetro,
  stopMetro,
} from '../../../tests/sprint-05-orient-search/support/native-session';

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

function maestro(args: string[]): { exit: number; out: string } {
  const r = spawnSync(MAESTRO_BIN, ['--udid', ANDROID_SERIAL, ...args], {
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { exit: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

function tap(selector: string): boolean {
  const flowPath = join(tmpdir(), `stop-observe-tap-${process.pid}-${Date.now()}.yaml`);
  writeFileSync(flowPath, `appId: host.exp.Exponent\n---\n- tapOn: ${JSON.stringify(selector)}\n`);
  const r = spawnSync(MAESTRO_BIN, ['--udid', ANDROID_SERIAL, 'test', '--no-ansi', flowPath], {
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return r.status === 0;
}

function hierarchy(): string {
  return maestro(['hierarchy', '--no-ansi']).out;
}

function contains(needle: string): boolean {
  return hierarchy().includes(needle);
}

function dismissLogBox(): void {
  for (let i = 0; i < 10; i += 1) {
    const h = hierarchy();
    const hasDismiss = h.includes('"accessibilityText" : "Dismiss"') || h.includes('"accessibilityText":"Dismiss"');
    const hasBanner = h.includes('"text" : "!"') || h.includes('"text":"!"') || /"accessibilityText"\s*:\s*"!/.test(h);
    if (hasDismiss) {
      tap('Dismiss');
      spawnSync('sleep', ['1']);
      continue;
    }
    if (hasBanner) {
      // tap the badge via coordinates is fiddly; just try tapping it by text
      tap('!');
      spawnSync('sleep', ['1']);
      continue;
    }
    break;
  }
}

function fieldFocused(): boolean {
  const h = hierarchy();
  const m = /"accessibilityText"\s*:\s*"Message"[^}]*?"focused"\s*:\s*"true"/s.exec(h);
  return m !== null;
}

function typeText(text: string): void {
  const encoded = text.replace(/%/g, '%25').replace(/ /g, '%s');
  adb(['shell', 'input', 'text', encoded]);
}

function imeShown(): boolean {
  const im = adb(['shell', 'dumpsys', 'input_method']);
  const wd = adb(['shell', 'dumpsys', 'window']);
  return /\bmInputShown=true\b/.test(im) || /\bmIsImeShowing=true\b/.test(wd);
}

function hideKeyboard(): void {
  if (!imeShown()) return;
  adb(['shell', 'input', 'keyevent', '4']);
  spawnSync('sleep', ['1']);
}

async function main(): Promise<void> {
  let backend: OwnedBackendHandle | null = null;
  let metro: MetroHandle | null = null;
  const out: string[] = [];

  try {
    backend = await launchOwnedBackend({ host: BACKEND_HOST, port: BACKEND_PORT, model: DEFAULT_MODEL });
    out.push(`backend up: ${backend.model}`);

    // reverse backend port into the emulator
    spawnSync(ADB, ['-s', ANDROID_SERIAL, 'reverse', `tcp:${BACKEND_PORT}`, `tcp:${BACKEND_PORT}`]);

    process.env.EXPO_PUBLIC_API_BASE_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
    const logPath = join(REPO_ROOT, '.tmp/FIX-ORI-RN-004-1/cycle-2/stop-observe-metro.log');
    metro = startMetro(EXAMPLE_ROOT, METRO_PORT, logPath);
    out.push(`metro up: ${metro.url}`);

    setAppearance('android', ANDROID_SERIAL, 'light');
    openExpoGo('android', ANDROID_SERIAL, `exp://127.0.0.1:${METRO_PORT}/--/live-chat`);
    out.push('opened /live-chat');

    // wait for composer
    const deadline = Date.now() + 60_000;
    let ready = false;
    while (Date.now() < deadline) {
      dismissLogBox();
      if (contains('Live chat')) { ready = true; break; }
      spawnSync('sleep', ['1']);
    }
    out.push(`composer ready: ${ready}`);
    if (!ready) return finish(out);

    // focus field
    let focused = false;
    for (let i = 0; i < 4 && !focused; i += 1) {
      dismissLogBox();
      tap('Message.*');
      spawnSync('sleep', ['2']);
      focused = fieldFocused();
    }
    out.push(`field focused: ${focused}`);
    if (!focused) return finish(out);

    typeText(LONG_PROMPT);
    spawnSync('sleep', ['2']);
    const afterType = hierarchy();
    out.push(`text_landed(abacus)=${afterType.includes('abacus')} text_landed(computing)=${afterType.includes('computing')}`);
    hideKeyboard();
    dismissLogBox();

    // what does the send button look like right now?
    const preSend = hierarchy();
    const sendEnabledPre = /"accessibilityText"\s*:\s*"Send message"/.test(preSend);
    out.push(`send_present_before_tap=${sendEnabledPre}`);

    out.push(`send tap: ${tap('Send message')}`);

    // TIGHT poll: every ~800ms for 75s, no dismissal inside the loop.
    const t0 = Date.now();
    const pollDeadline = t0 + 75_000;
    let sawStop = false;
    let stopFirstAt = -1;
    let stopLastAt = -1;
    while (Date.now() < pollDeadline) {
      const h = hierarchy();
      const t = Date.now() - t0;
      const hasStop = /"accessibilityText"\s*:\s*"Stop generating"/.test(h);
      const hasSend = /"accessibilityText"\s*:\s*"Send message"/.test(h);
      const hasReply = /text-\d+/.test(h) ? '?' : '';
      if (hasStop) {
        if (!sawStop) { sawStop = true; stopFirstAt = t; }
        stopLastAt = t;
      }
      out.push(`t=${t}ms stop=${hasStop} send=${hasSend}`);
      spawnSync('sleep', ['0.8']);
    }
    out.push(`RESULT sawStop=${sawStop} firstAt=${stopFirstAt}ms lastAt=${stopLastAt}ms`);

    // final provider correlation
    const records = backend.records();
    out.push(`backend_records=${records.length} last=${JSON.stringify(records[records.length - 1] ?? null)}`);
  } finally {
    if (metro) stopMetro(metro);
    if (backend) await backend.stop();
    spawnSync(ADB, ['-s', ANDROID_SERIAL, 'reverse', '--remove', `tcp:${BACKEND_PORT}`]);
    writeFileSync(
      join(REPO_ROOT, '.tmp/FIX-ORI-RN-004-1/cycle-2/stop-observe.out'),
      out.join('\n'),
    );
    console.log(out.join('\n'));
  }
}

function finish(out: string[]): void {
  writeFileSync(join(REPO_ROOT, '.tmp/FIX-ORI-RN-004-1/cycle-2/stop-observe.out'), out.join('\n'));
  console.log(out.join('\n'));
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(2);
});
