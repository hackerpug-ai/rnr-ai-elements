/**
 * FIX-ORI-RN-004-4 — external supervisor for the real native live proof.
 *
 * This is intentionally a process wrapper, not another UI driver. It executes the
 * existing proof in its own process group, preserves the driver's immutable output,
 * and interprets an iOS-only run from its two real appearance outcomes rather than
 * from the inherited three-platform `completed` flag.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Phase = 'ios' | 'full' | 'audit';
type Mode = 'red' | 'green';

type Leg = {
  platform: string;
  status: string;
  diagnostic?: string;
  evidence?: Record<string, unknown>;
};

type DriverManifest = {
  run_id: string;
  candidate_head_sha: string;
  passed_platforms: number;
  completed: boolean;
  legs: Leg[];
};

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const TASK = 'FIX-ORI-RN-004-4';
const EVIDENCE_ROOT = join(HERE, 'evidence', TASK);
const DRIVER_EVIDENCE = join(HERE, 'evidence', 'ORI-RN-004');
const IOS_UDID = '81487B1E-A4D1-45AE-9BCE-D675802BACD1';
const ANDROID_SERIAL = 'emulator-5554';
const IOS_TIMEOUT_MS = 2_700_000;
const FULL_TIMEOUT_MS = 14_400_000;
const HEARTBEAT_MS = 25_000;
const IOS_PORTS = [4000, 8095, 8406];
const FULL_PORTS = [...IOS_PORTS, 4010, 8097, 8408];
const SOURCE_PATHS = [
  'tests/sprint-05-orient-search/live-example.maestro.yaml',
  'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
  'tests/sprint-05-orient-search/native-live-repair-proof_test.ts',
  'tests/sprint-05-orient-search/live-example-proof.ts',
  'tests/sprint-05-orient-search/run-live-example-proof.mjs',
  'apps/example/app/live-chat.tsx',
  'apps/example/components/live-chat-screen.tsx',
  'apps/example/lib/use-live-chat.ts',
  'tests/sprint-05-orient-search/support/live-backend.ts',
  'pnpm-lock.yaml',
] as const;

function flag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

// fallow-ignore-next-line complexity -- strict CLI combinations fail closed here.
function parseArgs(): { phase: Phase; mode?: Mode; cycle: string } {
  const phase = flag('--phase');
  const mode = flag('--mode');
  const cycle = flag('--cycle');
  if (phase !== 'ios' && phase !== 'full' && phase !== 'audit') {
    throw new Error('--phase must be ios, full, or audit');
  }
  if (phase !== 'audit' && mode !== 'red' && mode !== 'green') {
    throw new Error('--mode must be red or green for a live phase');
  }
  if (phase === 'full' && mode !== 'green') throw new Error('full phase only accepts --mode green');
  if (phase === 'audit' && mode !== undefined)
    throw new Error('audit phase does not accept --mode');
  if (!cycle || !/^cycle-[1-9][0-9]*$/.test(cycle)) {
    throw new Error('--cycle must match cycle-N');
  }
  return { phase, mode: mode as Mode | undefined, cycle };
}

function sha256Bytes(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex');
}

function sha256File(path: string): string {
  return sha256Bytes(readFileSync(path));
}

function git(...args: string[]): string {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `git ${args.join(' ')} failed`);
  return result.stdout.trim();
}

function sourceManifest(): Record<string, string> {
  return Object.fromEntries(
    SOURCE_PATHS.map((path) => {
      const absolute = join(REPO_ROOT, path);
      return [path, existsSync(absolute) ? sha256File(absolute) : 'absent'];
    }),
  );
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function commandOutput(command: string, args: string[]): { exit: number; stdout: string } {
  const result = spawnSync(command, args, { cwd: REPO_ROOT, encoding: 'utf8' });
  return { exit: result.status ?? 1, stdout: `${result.stdout}${result.stderr}`.trim() };
}

function listeners(ports: number[]): Array<{ port: number; output: string }> {
  return ports.flatMap((port) => {
    const result = commandOutput('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN']);
    return result.exit === 0 ? [{ port, output: result.stdout }] : [];
  });
}

function deviceFacts(): Record<string, unknown> {
  const ios = commandOutput('xcrun', ['simctl', 'list', 'devices', 'booted']);
  const android = commandOutput('adb', ['devices', '-l']);
  const expo = commandOutput('adb', [
    '-s',
    ANDROID_SERIAL,
    'shell',
    'dumpsys',
    'package',
    'host.exp.exponent',
  ]);
  const apk = join(
    process.env.HOME ?? '',
    '.cache/agent-scratch/opencode/ori-rn-003/Expo-Go-57.0.9.apk',
  );
  return {
    ios_reserved_booted: ios.exit === 0 && ios.stdout.includes(IOS_UDID),
    unrelated_ios_visible: ios.stdout.includes('9051A0C2-CCB5-4D0F-AAAC-F03F74719352'),
    android_reserved_online: android.exit === 0 && android.stdout.includes(`${ANDROID_SERIAL} `),
    android_expo_go_57_0_9: expo.exit === 0 && expo.stdout.includes('versionName=57.0.9'),
    apk_path: apk,
    apk_exists: existsSync(apk),
    apk_sha256: existsSync(apk) ? sha256File(apk) : null,
  };
}

function assertPreflight(ports: number[]): Record<string, unknown> {
  const devices = deviceFacts();
  const busy = listeners(ports);
  if (!devices.ios_reserved_booted)
    throw new Error(`reserved iOS simulator is not booted: ${IOS_UDID}`);
  if (!devices.android_reserved_online)
    throw new Error(`reserved Android emulator is not online: ${ANDROID_SERIAL}`);
  if (!devices.android_expo_go_57_0_9)
    throw new Error('Expo Go 57.0.9 is not installed on the reserved Android emulator');
  if (
    !devices.apk_exists ||
    devices.apk_sha256 !== '14c18828a3d04e43922245920bd941b978fd1c7a5aec88a0188032f0bb4972ce'
  ) {
    throw new Error('the required real Expo Go 57.0.9 APK is missing or has the wrong digest');
  }
  if (busy.length > 0)
    throw new Error(`reserved ports already have listeners: ${JSON.stringify(busy)}`);
  return { devices, ports, listeners_before: busy };
}

function ensureCycle(cycleDir: string, cycle: string): Record<string, unknown> {
  const identityPath = join(cycleDir, 'identity.json');
  const expected = {
    task: TASK,
    cycle,
    base_head: git('rev-parse', 'HEAD'),
    parent: relative(REPO_ROOT, EVIDENCE_ROOT),
    ios_udid: IOS_UDID,
    android_serial: ANDROID_SERIAL,
  };
  if (!existsSync(cycleDir)) {
    mkdirSync(cycleDir, { recursive: true });
    writeJson(identityPath, expected);
    return expected;
  }
  if (!existsSync(identityPath)) throw new Error(`existing cycle has no identity: ${cycleDir}`);
  const actual = JSON.parse(readFileSync(identityPath, 'utf8')) as Record<string, unknown>;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`cycle identity mismatch: ${JSON.stringify({ expected, actual })}`);
  }
  return actual;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

function iosVerdict(manifest: DriverManifest): Record<string, unknown> {
  const legs = manifest.legs.filter((leg) => leg.platform === 'ios');
  const appearances = legs.map((leg) => String(leg.evidence?.appearance ?? 'unknown'));
  const markerToken = '$' + '{MARKER}';
  const passed = legs.length === 2 && legs.every((leg) => leg.status === 'passed');
  const actualFailures = legs.filter(
    (leg) => leg.status !== 'passed' || Number(leg.evidence?.maestro_exit ?? 1) !== 0,
  );
  const markersVisible = legs.every((leg) => {
    const evidence = leg.evidence ?? {};
    const marker = String(evidence.marker ?? '');
    const output = String(evidence.maestro_output ?? '');
    return (
      marker.length > 0 &&
      evidence.hierarchy_has_marker === true &&
      output.includes(`Assert that "${markerToken}" is visible... COMPLETED`) &&
      typeof evidence.screenshot === 'string' &&
      existsSync(String(evidence.screenshot))
    );
  });
  const activeStop = legs.every((leg) => {
    const output = String(leg.evidence?.maestro_output ?? '');
    return (
      output.includes('Assert that "Stop generating" is visible... COMPLETED') &&
      output.includes('Tap on "Stop generating"... COMPLETED')
    );
  });
  const retries = legs.every((leg) =>
    String(leg.evidence?.retry_log ?? '').includes('exactly 1 retained user turn'),
  );
  return {
    appearances,
    exactly_light_dark:
      appearances.length === 2 &&
      new Set(appearances).size === 2 &&
      appearances.includes('light') &&
      appearances.includes('dark'),
    passed,
    actual_failure_count: actualFailures.length,
    actual_failures: actualFailures,
    markers_visible: markersVisible,
    active_stop: activeStop,
    retries,
    inherited_completed_false: manifest.completed === false,
  };
}

// fallow-ignore-next-line complexity -- one linear child lifecycle keeps the raw process ledger coherent.
async function supervise(
  command: string,
  args: string[],
  timeoutMs: number,
  phaseDir: string,
  env: NodeJS.ProcessEnv,
): Promise<Record<string, unknown>> {
  const logPath = join(phaseDir, 'child.log');
  const heartbeatPath = join(phaseDir, 'supervisor-heartbeat.jsonl');
  const startedAt = new Date().toISOString();
  let lastOutputAt = startedAt;
  const child = spawn(command, args, {
    cwd: REPO_ROOT,
    env,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const pgid = child.pid ?? null;
  const recordHeartbeat = (event: string): void => {
    appendFileSync(
      heartbeatPath,
      `${JSON.stringify({ ts: new Date().toISOString(), event, child_pid: child.pid ?? null, process_group_id: pgid, last_child_output_at: lastOutputAt })}\n`,
    );
  };
  const writeChunk = (chunk: Buffer): void => {
    lastOutputAt = new Date().toISOString();
    appendFileSync(logPath, chunk);
    process.stdout.write(chunk);
  };
  child.stdout?.on('data', writeChunk);
  child.stderr?.on('data', writeChunk);
  recordHeartbeat('child-started');
  const heartbeat = setInterval(() => recordHeartbeat('supervisor-heartbeat'), HEARTBEAT_MS);
  heartbeat.unref();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    recordHeartbeat('timeout');
    if (pgid !== null) {
      try {
        process.kill(-pgid, 'SIGTERM');
      } catch {
        // The process group may already have exited between the timeout and signal.
      }
    }
  }, timeoutMs);
  timer.unref();
  const termination = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>(
    (resolvePromise) => {
      child.once('exit', (code, signal) => resolvePromise({ code, signal }));
      child.once('error', () => resolvePromise({ code: null, signal: null }));
    },
  );
  clearTimeout(timer);
  clearInterval(heartbeat);
  recordHeartbeat('child-exited');
  return {
    command: [command, ...args],
    started_at: startedAt,
    ended_at: new Date().toISOString(),
    child_pid: child.pid ?? null,
    process_group_id: pgid,
    last_child_output_at: lastOutputAt,
    timeout_ms: timeoutMs,
    timed_out: timedOut,
    exit_code: termination.code,
    signal: termination.signal,
    log: relative(REPO_ROOT, logPath),
    heartbeat_log: relative(REPO_ROOT, heartbeatPath),
  };
}

function snapshotDriverEvidence(phaseDir: string): string {
  if (!existsSync(DRIVER_EVIDENCE))
    throw new Error('real driver did not create ORI-RN-004 evidence');
  const snapshot = join(phaseDir, 'driver-evidence');
  cpSync(DRIVER_EVIDENCE, snapshot, { recursive: true, errorOnExist: true });
  return snapshot;
}

function treeHashes(root: string): Record<string, string> {
  const result: Record<string, string> = {};
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) visit(path);
      else result[relative(root, path)] = sha256File(path);
    }
  };
  visit(root);
  return result;
}

// fallow-ignore-next-line complexity -- one linear real-service proof writes a single immutable report.
async function runIos(mode: Mode, cycle: string, phaseDir: string): Promise<void> {
  const runId = `${TASK}-${cycle}-ios-${mode}`;
  const preflight = assertPreflight(IOS_PORTS);
  const scratch = mkdtempSync(join(tmpdir(), 'rnr4-'));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    RNR_S05_IOS_UDID: IOS_UDID,
    RNR_S05_ANDROID_SERIAL: ANDROID_SERIAL,
    TMPDIR: scratch,
  };
  delete env.NODE_ENV;
  const execution = await supervise(
    'pnpm',
    [
      'exec',
      'tsx',
      'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
      '--platforms',
      'ios',
      '--run-id',
      runId,
    ],
    IOS_TIMEOUT_MS,
    phaseDir,
    env,
  );
  const snapshot = snapshotDriverEvidence(phaseDir);
  const manifest = readJson<DriverManifest>(join(snapshot, 'run-manifest.json'));
  if (manifest.run_id !== runId) throw new Error(`manifest run id mismatch: ${manifest.run_id}`);
  const verdict = iosVerdict(manifest);
  const postListeners = listeners(IOS_PORTS);
  const report = {
    task: TASK,
    phase: 'ios',
    mode,
    run_id: runId,
    executed_head: git('rev-parse', 'HEAD'),
    source_sha256: sourceManifest(),
    preflight,
    execution,
    driver_manifest: relative(REPO_ROOT, join(snapshot, 'run-manifest.json')),
    driver_evidence_sha256: treeHashes(snapshot),
    verdict,
    teardown: {
      listeners_after: postListeners,
      zero_owned_listeners: postListeners.length === 0,
      devices_after: deviceFacts(),
    },
  };
  writeJson(join(phaseDir, mode === 'red' ? 'red.json' : 'green.json'), report);
  writeJson(join(phaseDir, 'run.json'), report);
  const valid =
    execution.timed_out === false &&
    execution.exit_code === 1 &&
    execution.signal === null &&
    verdict.exactly_light_dark === true &&
    verdict.inherited_completed_false === true &&
    postListeners.length === 0;
  if (mode === 'red') {
    if (!valid || Number(verdict.actual_failure_count) < 1)
      throw new Error('RED did not capture a real failed iOS appearance');
  } else if (
    !valid ||
    verdict.passed !== true ||
    verdict.markers_visible !== true ||
    verdict.active_stop !== true ||
    verdict.retries !== true
  ) {
    throw new Error('GREEN did not satisfy both real iOS appearances');
  }
  console.log(JSON.stringify({ passed: true, mode, run_id: runId, verdict }, null, 2));
}

// fallow-ignore-next-line complexity -- one linear full-caller proof writes a single immutable report.
async function runFull(cycle: string, phaseDir: string): Promise<void> {
  const iosGreen = join(dirname(phaseDir), 'ios-green', 'green.json');
  if (!existsSync(iosGreen)) throw new Error('full phase requires completed ios-green evidence');
  const greenHash = sha256File(iosGreen);
  const preflight = assertPreflight(FULL_PORTS);
  const runId = `${TASK}-${cycle}-full`;
  const callerDir = join(phaseDir, 'caller');
  const scratch = mkdtempSync(join(tmpdir(), 'rnr4-'));
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    RNR_S05_IOS_UDID: IOS_UDID,
    RNR_S05_ANDROID_SERIAL: ANDROID_SERIAL,
    TMPDIR: scratch,
  };
  delete env.NODE_ENV;
  const args = [
    'tests/sprint-05-orient-search/run-live-example-proof.mjs',
    '--engines',
    'uniwind,nativewind',
    '--platforms',
    'ios,android,web',
    '--output',
    relative(REPO_ROOT, callerDir),
    '--run-id',
    runId,
    '--ios-udid',
    IOS_UDID,
    '--android-serial',
    ANDROID_SERIAL,
  ];
  const execution = await supervise('node', args, FULL_TIMEOUT_MS, phaseDir, env);
  const validate = commandOutput('node', [
    'tests/sprint-05-orient-search/run-live-example-proof.mjs',
    '--validate',
    relative(REPO_ROOT, callerDir),
    '--expect-run-id',
    runId,
  ]);
  const postListeners = listeners(FULL_PORTS);
  const report = {
    task: TASK,
    phase: 'full',
    mode: 'green',
    run_id: runId,
    executed_head: git('rev-parse', 'HEAD'),
    source_sha256: sourceManifest(),
    ios_green_sha256: greenHash,
    preflight,
    execution,
    validate,
    caller_evidence_sha256: existsSync(callerDir) ? treeHashes(callerDir) : {},
    teardown: {
      listeners_after: postListeners,
      zero_owned_listeners: postListeners.length === 0,
      devices_after: deviceFacts(),
    },
  };
  writeJson(join(phaseDir, 'run.json'), report);
  if (
    execution.exit_code !== 0 ||
    execution.signal !== null ||
    execution.timed_out ||
    validate.exit !== 0 ||
    postListeners.length > 0
  ) {
    throw new Error('full six-target caller or its validate-only pass failed');
  }
  console.log(
    JSON.stringify({ passed: true, run_id: runId, validate_exit: validate.exit }, null, 2),
  );
}

function audit(cycleDir: string): void {
  const expected = ['ios-red/red.json', 'ios-green/green.json', 'full-green/run.json'];
  const missing = expected.filter((path) => !existsSync(join(cycleDir, path)));
  if (missing.length > 0) throw new Error(`audit missing phase evidence: ${missing.join(', ')}`);
  const red = readJson<Record<string, unknown>>(join(cycleDir, expected[0]));
  const green = readJson<Record<string, unknown>>(join(cycleDir, expected[1]));
  const full = readJson<Record<string, unknown>>(join(cycleDir, expected[2]));
  const result = {
    task: TASK,
    phase: 'audit',
    passed: true,
    read_only: true,
    cycle_identity_sha256: sha256File(join(cycleDir, 'identity.json')),
    evidence_sha256: Object.fromEntries(
      expected.map((path) => [path, sha256File(join(cycleDir, path))]),
    ),
    source_consistent: JSON.stringify(red.source_sha256) === JSON.stringify(green.source_sha256),
    full_source_manifest_present:
      typeof full.source_sha256 === 'object' && full.source_sha256 !== null,
  };
  if (!result.source_consistent || !result.full_source_manifest_present)
    throw new Error('audit source binding failed');
  console.log(JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const { phase, mode, cycle } = parseArgs();
  const cycleDir = join(EVIDENCE_ROOT, cycle);
  ensureCycle(cycleDir, cycle);
  if (phase === 'audit') {
    audit(cycleDir);
    return;
  }
  const phaseDir = join(cycleDir, `${phase}-${mode}`);
  mkdirSync(phaseDir, { recursive: false });
  if (phase === 'ios') await runIos(mode as Mode, cycle, phaseDir);
  else await runFull(cycle, phaseDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
