// FIX-ORI-RN-003-2 — disposable-consumer native proof driver (throwaway, not committed).
//
// Drives ONE engine/platform/appearance leg of the focused-composer proof against a
// REAL Expo Go session on the reserved device. Real surfaces only: owned Metro on an
// owned port, real `simctl`/`adb`, real Maestro 2.5.1, real screenshots + hierarchy.
//
//   node focus-driver.mjs --engine nativewind --platform ios --appearance dark \
//     --mode green --consumer <root> --source <input-group.tsx> --outdir <dir>
//
//   --mode   red   : installs --source (pre-fix), expects the flow to FAIL (send gone)
//   --mode   green : installs --source (fixed), expects the flow to PASS (send tappable)
//   --source : path to the input-group.tsx to write into <consumer>/components/ui/ (already
//              alias-rewritten to @/components/...). If omitted, the consumer's installed
//              copy is used as-is (the RED baseline).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, openSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

const MAESTRO_BIN = join(homedir(), '.maestro', 'bin', 'maestro');
const ADB = join(homedir(), 'Library', 'Android', 'sdk', 'platform-tools', 'adb');
const FLOW = new URL('./focus-flow.maestro.yaml', import.meta.url).pathname;

const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : def;
};
const engine = flag('--engine', 'nativewind');
const platform = flag('--platform', 'ios');
const appearance = flag('--appearance', 'light');
const mode = flag('--mode', 'red');
const consumer = flag('--consumer', null);
const source = flag('--source', null);
const outdir = flag('--outdir', null);
const port = Number(flag('--port', engine === 'nativewind' ? '8093' : '8094'));

if (!consumer) { console.error('missing --consumer'); process.exit(2); }
if (!outdir) { console.error('missing --outdir'); process.exit(2); }
mkdirSync(outdir, { recursive: true });

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: opts.timeout ?? 300_000, maxBuffer: 64 * 1024 * 1024, ...opts });
  return { exit: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}`, timedOut: (r.error?.code) === 'ETIMEDOUT' };
};

function marker() {
  return `FIX-ORI-RN-003-2:${engine}:${platform}:${appearance}:${Date.now()}`;
}

function overwriteInputGroup(srcPath) {
  const dst = join(consumer, 'components', 'ui', 'input-group.tsx');
  copyFileSync(srcPath, dst);
  return dst;
}

function startMetro() {
  const logPath = join(outdir, 'metro.log');
  const logFd = openSync(logPath, 'a');
  const child = spawn('npx', ['expo', 'start', '--port', String(port)], {
    cwd: consumer,
    detached: true,
    stdio: ['ignore', logFd, logFd],
  });
  child.unref();
  // Wait for packager status.
  const deadline = Date.now() + 120_000;
  let ready = false;
  while (Date.now() < deadline) {
    const r = run('curl', ['-s', '--max-time', '3', `http://127.0.0.1:${port}/status`], { timeout: 10_000 });
    if (r.out.includes('packager-status:running')) { ready = true; break; }
    spawnSync('sleep', ['1']);
  }
  if (!ready) throw new Error(`Metro not ready on ${port}`);
  // Route Android emulator localhost.
  if (platform === 'android') run(ADB, ['reverse', `tcp:${port}`, `tcp:${port}`], { timeout: 30_000 });
  return { port, pid: child.pid ?? -1, logPath, openUrl: `exp://127.0.0.1:${port}` };
}

function stopMetro(handle) {
  if (!handle) return;
  try { process.kill(-handle.pid, 'SIGTERM'); } catch { try { process.kill(handle.pid, 'SIGTERM'); } catch {} }
  if (platform === 'android') run(ADB, ['reverse', '--remove', `tcp:${handle.port}`], { timeout: 30_000 });
}

function setAppearance(deviceId) {
  if (platform === 'ios') {
    run('xcrun', ['simctl', 'ui', deviceId, 'appearance', appearance], { timeout: 30_000 });
  } else {
    run(ADB, ['-s', deviceId, 'shell', 'cmd', 'uimode', 'night', appearance === 'dark' ? 'yes' : 'no'], { timeout: 30_000 });
  }
}

function openExpoGo(deviceId, openUrl) {
  if (platform === 'ios') {
    run('xcrun', ['simctl', 'terminate', deviceId, 'host.exp.Exponent'], { timeout: 30_000 });
    run('xcrun', ['simctl', 'launch', deviceId, 'host.exp.Exponent'], { timeout: 30_000 });
    run('xcrun', ['simctl', 'openurl', deviceId, openUrl], { timeout: 30_000 });
  } else {
    run(ADB, ['-s', deviceId, 'shell', 'am', 'force-stop', 'host.exp.exponent'], { timeout: 30_000 });
    spawnSync('sleep', ['2']);
    run(ADB, ['-s', deviceId, 'shell', 'am', 'start', '-a', 'android.intent.action.VIEW', '-d', openUrl, 'host.exp.exponent'], { timeout: 30_000 });
  }
}

function captureScreenshot(deviceId, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  if (platform === 'ios') {
    run('xcrun', ['simctl', 'io', deviceId, 'screenshot', outPath], { timeout: 60_000 });
  } else {
    const r = run(ADB, ['-s', deviceId, 'exec-out', 'screencap', '-p'], { timeout: 60_000, encoding: null });
    if (r.out) writeFileSync(outPath, r.out);
  }
}

function captureHierarchy(deviceId) {
  const r = run(MAESTRO_BIN, ['--udid', deviceId, 'hierarchy', '--no-ansi'], { timeout: 120_000 });
  return r.out;
}

function readMetroLogTail(logPath, chars = 6000) {
  try { return readFileSync(logPath, 'utf8').slice(-chars); } catch { return '(no metro log)'; }
}

function runFlow(deviceId, m, focusShot) {
  const args = [
    '--udid', deviceId, 'test', '--no-ansi',
    '-e', `MARKER=${m}`,
    '-e', `FOCUS_SCREENSHOT=${focusShot}`,
    FLOW,
  ];
  const r = run(MAESTRO_BIN, args, { timeout: 300_000 });
  return r;
}

/* ----------------------------------------------------------------- main -- */

const deviceId = platform === 'ios' ? '81487B1E-A4D1-45AE-9BCE-D675802BACD1' : 'emulator-5554';

// 1. Install the source under test (RED = pre-fix baseline; GREEN = fixed).
if (source) {
  const dst = overwriteInputGroup(source);
  console.log(`[driver] wrote ${mode} input-group.tsx -> ${dst}`);
} else {
  console.log('[driver] using the consumer-installed input-group.tsx as-is (RED baseline)');
}

const m = marker();
const focusShot = join(outdir, `${engine}-${platform}-${appearance}-focused.png`);

const metro = startMetro();
console.log(`[driver] metro on port ${metro.port} (pid ${metro.pid})`);
try {
  setAppearance(deviceId);
  openExpoGo(deviceId, metro.openUrl);
  console.log('[driver] opened Expo Go; waiting for bundle...');
  spawnSync('sleep', ['16']);

  const flow = runFlow(deviceId, m, focusShot);
  console.log(`[driver] maestro exit=${flow.exit}`);
  console.log(flow.out.slice(-2500));

  // Post-flow evidence: final screenshot + hierarchy + metro log tail.
  captureScreenshot(deviceId, join(outdir, `${engine}-${platform}-${appearance}-final.png`));
  const hierarchy = captureHierarchy(deviceId);
  const metroTail = readMetroLogTail(metro.logPath);

  const navError = /Couldn't find a navigation context/i.test(metroTail) || /Couldn't find a navigation context/i.test(flow.out);
  const sendVisible = hierarchy.includes('Send message') || flow.out.includes('Send message');

  const evidence = {
    engine, platform, appearance, mode, marker: m,
    device_id: deviceId,
    consumer_root: consumer,
    metro_port: metro.port,
    source_installed: source ?? '(consumer-installed baseline)',
    maestro_exit: flow.exit,
    expected: mode === 'red' ? 'FAIL (send vanishes)' : 'PASS (send tappable)',
    passed: mode === 'green' ? flow.exit === 0 : flow.exit !== 0,
    navigation_context_error_present: navError,
    send_message_in_hierarchy: sendVisible,
    focused_screenshot: existsSync(focusShot) ? focusShot : '(not captured — flow failed before focus screenshot)',
    final_screenshot: `${engine}-${platform}-${appearance}-final.png`,
    metro_log_tail: metroTail.slice(-6000),
    maestro_output_tail: flow.out.slice(-4000),
    hierarchy: hierarchy.slice(0, 6000),
  };
  writeFileSync(join(outdir, `session-${engine}-${platform}-${appearance}.json`), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`[driver] evidence -> ${join(outdir, `session-${engine}-${platform}-${appearance}.json`)}`);

  if (mode === 'green' && flow.exit !== 0) process.exitCode = 1;
  if (mode === 'red' && flow.exit === 0) process.exitCode = 1;
} finally {
  stopMetro(metro);
}
