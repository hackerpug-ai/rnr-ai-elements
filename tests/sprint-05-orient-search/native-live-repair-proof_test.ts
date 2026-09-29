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
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Phase = 'ios' | 'disposition' | 'full' | 'audit';
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
const CHECKPOINT_SHA = 'f836d3665638efa16e877534ef17b5ecbdbfa182';
const DIAGNOSTIC_BASE_SHA = '713eee79f70a15bba4c04dfa796151d69e1e6093';
const TASK_AUDIT_BASE_SHA = '53ad890807079e0afdc256f602455bebaaf56949';
const WRAPPER_PATH = 'tests/sprint-05-orient-search/native-live-repair-proof_test.ts';
const ORIGINAL_EXECUTION_WRAPPER_SHA256 =
  'ea3d1e00babc1faf47d541c6080ba53eec3d46eddff2671f8d841c2c05991058';
const CHECKPOINT_WRAPPER_SHA256 =
  'ce8ea18507320ee31cafdfafe4f43ce7356b1aafb255acebab46e0c1d755ef05';
const IMMUTABLE_DIAGNOSTIC_SHA256 = {
  'not-reproduced.json': 'c9c787364311f07a4a3f98a4592efdc2eb5950e793b79fa4fe5d4c003b114e92',
  'cycle-2/ios-red/run.json': '319f3c5d5f93b381721d07155ed7081884144c4ed4c3c7d0938ede9c1da8a843',
  'cycle-3/ios-red/run.json': '96736ebf536a043725d1a8ce2c734bd5cb3e4050754f6da797ddaa85965bbfe4',
  'cycle-2/ios-red/driver-evidence/run-manifest.json':
    'fe8bf5f261ee1cd94544b8d3df42aac273d8db1e0500ff32abfc0173e0cd0055',
  'cycle-3/ios-red/driver-evidence/run-manifest.json':
    '6ce3dd09bdc6b2c9fd67d498473d3725716818c59494e7fd0121b125be228d05',
} as const;
const RUNTIME_ROOTS = [
  'tests/sprint-05-orient-search/evidence/ORI-RN-004',
  'tests/sprint-05-orient-search/evidence/ORI-RN-005',
  'tests/sprint-05-orient-search/evidence/ORI-AI-002',
] as const;
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
  if (phase !== 'ios' && phase !== 'disposition' && phase !== 'full' && phase !== 'audit') {
    throw new Error('--phase must be ios, disposition, full, or audit');
  }
  if ((phase === 'disposition' || phase === 'audit') && mode !== undefined) {
    throw new Error(`${phase} phase does not accept --mode`);
  }
  if ((phase === 'ios' || phase === 'full') && mode !== 'red' && mode !== 'green')
    throw new Error('--mode must be red or green for a live phase');
  if (phase === 'full' && mode !== 'green') throw new Error('full phase only accepts --mode green');
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

function gitObjectSha256(commit: string, path: string): string {
  const result = spawnSync('git', ['show', `${commit}:${path}`], {
    cwd: REPO_ROOT,
    encoding: null,
  });
  if (result.status !== 0)
    throw new Error(result.stderr.toString() || `git show ${commit}:${path} failed`);
  return sha256Bytes(result.stdout);
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
  const iosApps = commandOutput('xcrun', ['simctl', 'listapps', IOS_UDID]);
  const iosAppearance = commandOutput('xcrun', ['simctl', 'ui', IOS_UDID, 'appearance']);
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
  const iosCache = join(
    process.env.HOME ?? '',
    '.expo/ios-simulator-app-cache/Expo-Go-57.0.9.tar.app',
  );
  const androidAppearance = commandOutput('adb', [
    '-s',
    ANDROID_SERIAL,
    'shell',
    'cmd',
    'uimode',
    'night',
  ]);
  const androidReverse = commandOutput('adb', ['-s', ANDROID_SERIAL, 'reverse', '--list']);
  return {
    ios_reserved_booted: ios.exit === 0 && ios.stdout.includes(IOS_UDID),
    unrelated_ios_visible: ios.stdout.includes('9051A0C2-CCB5-4D0F-AAAC-F03F74719352'),
    ios_expo_go_57_0_9: iosApps.exit === 0 && iosApps.stdout.includes('57.0.9'),
    ios_expo_go_cache_path: iosCache,
    ios_expo_go_cache_exists: existsSync(iosCache),
    ios_appearance: iosAppearance.stdout,
    android_reserved_online: android.exit === 0 && android.stdout.includes(`${ANDROID_SERIAL} `),
    android_expo_go_57_0_9: expo.exit === 0 && expo.stdout.includes('versionName=57.0.9'),
    android_appearance: androidAppearance.stdout,
    android_reverse: androidReverse.stdout.split('\n').filter(Boolean),
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
  if (!devices.ios_expo_go_57_0_9 || !devices.ios_expo_go_cache_exists)
    throw new Error('Expo Go 57.0.9 or its cache is unavailable on reserved iOS');
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
    diagnostic_checkpoint: CHECKPOINT_SHA,
    diagnostic_base: DIAGNOSTIC_BASE_SHA,
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
  progressProbe?: () => string,
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
  let observedPhase = 'process-start';
  const recordHeartbeat = (event: string): void => {
    const probed = progressProbe?.();
    if (probed) observedPhase = probed;
    appendFileSync(
      heartbeatPath,
      `${JSON.stringify({ ts: new Date().toISOString(), event, observed_phase: observedPhase, child_pid: child.pid ?? null, process_group_id: pgid, last_child_output_at: lastOutputAt })}\n`,
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
    last_observed_phase: observedPhase,
    last_child_output_at: lastOutputAt,
    timeout_ms: timeoutMs,
    timed_out: timedOut,
    exit_code: termination.code,
    signal: termination.signal,
    log: relative(REPO_ROOT, logPath),
    heartbeat_log: relative(REPO_ROOT, heartbeatPath),
  };
}

// fallow-ignore-next-line complexity -- parses the last complete event from an append-only journal.
function callerPhase(callerDir: string): string {
  const journal = join(callerDir, 'server-events.jsonl');
  if (!existsSync(journal)) return 'caller-startup';
  const lines = readFileSync(journal, 'utf8').trim().split('\n').filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try {
      const event = JSON.parse(lines[index]) as {
        event?: string;
        engine?: string;
        phase?: string;
      };
      if (event.event === 'phase-start' || event.event === 'phase-end')
        return `${event.engine ?? 'unknown'}:${event.phase ?? 'unknown'}:${event.event}`;
      if (event.event === 'engine-start') return `${event.engine ?? 'unknown'}:engine-start`;
      if (event.event === 'matrix-start') return 'matrix-start';
    } catch {
      // An in-progress final line is ignored until the next heartbeat.
    }
  }
  return 'caller-startup';
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

function requireCondition(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function sameHashes(actual: Record<string, string>, expected: Record<string, string>): boolean {
  const actualEntries = Object.entries(actual).sort(([left], [right]) => left.localeCompare(right));
  const expectedEntries = Object.entries(expected).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  return JSON.stringify(actualEntries) === JSON.stringify(expectedEntries);
}

// fallow-ignore-next-line complexity -- fail-closed immutable attempt validation is intentionally linear.
function verifyAttempt(cycle: 'cycle-2' | 'cycle-3'): Record<string, unknown> {
  const attemptDir = join(EVIDENCE_ROOT, cycle, 'ios-red');
  const reportPath = join(attemptDir, 'run.json');
  const report = readJson<{
    task: string;
    phase: string;
    mode: string;
    run_id: string;
    executed_head: string;
    source_sha256: Record<string, string>;
    execution: {
      command: string[];
      timed_out: boolean;
      exit_code: number | null;
      signal: string | null;
    };
    driver_manifest: string;
    driver_evidence_sha256: Record<string, string>;
    verdict: {
      appearances: string[];
      exactly_light_dark: boolean;
      passed: boolean;
      actual_failure_count: number;
      inherited_completed_false: boolean;
    };
  }>(reportPath);
  const expectedRunId = `${TASK}-${cycle}-ios-red`;
  requireCondition(report.task === TASK, `${cycle}: task mismatch`);
  requireCondition(report.phase === 'ios' && report.mode === 'red', `${cycle}: phase mismatch`);
  requireCondition(report.run_id === expectedRunId, `${cycle}: run id mismatch`);
  requireCondition(report.executed_head === DIAGNOSTIC_BASE_SHA, `${cycle}: base mismatch`);
  requireCondition(
    JSON.stringify(report.execution.command) ===
      JSON.stringify([
        'pnpm',
        'exec',
        'tsx',
        'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
        '--platforms',
        'ios',
        '--run-id',
        expectedRunId,
      ]),
    `${cycle}: argv mismatch`,
  );
  requireCondition(
    report.execution.exit_code === 1 &&
      report.execution.signal === null &&
      report.execution.timed_out === false,
    `${cycle}: raw child termination mismatch`,
  );
  requireCondition(
    report.verdict.passed === true &&
      report.verdict.actual_failure_count === 0 &&
      report.verdict.exactly_light_dark === true &&
      report.verdict.inherited_completed_false === true &&
      JSON.stringify(report.verdict.appearances) === JSON.stringify(['light', 'dark']),
    `${cycle}: supervisor verdict mismatch`,
  );
  const snapshot = join(attemptDir, 'driver-evidence');
  const manifestPath = join(snapshot, 'run-manifest.json');
  requireCondition(
    report.driver_manifest === relative(REPO_ROOT, manifestPath),
    `${cycle}: manifest link mismatch`,
  );
  requireCondition(
    sameHashes(treeHashes(snapshot), report.driver_evidence_sha256),
    `${cycle}: driver evidence tree hash mismatch`,
  );
  const manifest = readJson<DriverManifest>(manifestPath);
  requireCondition(
    manifest.run_id === expectedRunId &&
      manifest.passed_platforms === 1 &&
      manifest.completed === false,
    `${cycle}: inherited manifest outcome mismatch`,
  );
  const legs = manifest.legs.filter((leg) => leg.platform === 'ios');
  requireCondition(legs.length === 2, `${cycle}: expected exactly two iOS legs`);
  const appearances = legs.map((leg) => String(leg.evidence?.appearance));
  requireCondition(
    JSON.stringify(appearances) === JSON.stringify(['light', 'dark']),
    `${cycle}: appearance order mismatch`,
  );
  const assertion = 'Assert that "' + '$' + '{MARKER}' + '" is visible... COMPLETED';
  const observations = legs.map((leg) => {
    const marker = String(leg.evidence?.marker ?? '');
    const maestroOutput = String(leg.evidence?.maestro_output ?? '');
    const assertionCount = maestroOutput.split(assertion).length - 1;
    requireCondition(leg.status === 'passed', `${cycle}/${marker}: leg did not pass`);
    requireCondition(
      Number(leg.evidence?.maestro_exit) === 0,
      `${cycle}/${marker}: Maestro did not exit 0`,
    );
    requireCondition(
      marker === `ORI-RN-004:${expectedRunId}:ios`,
      `${cycle}: submitted marker mismatch`,
    );
    requireCondition(assertionCount === 2, `${cycle}/${marker}: exact marker assertions mismatch`);
    return {
      appearance: leg.evidence?.appearance,
      submitted_marker: marker,
      exact_assert_visible_completed: assertionCount,
      final_screenshot: leg.evidence?.screenshot,
      final_screenshot_claim: 'Retry/composer end state only; not complete-marker proof',
    };
  });
  return {
    cycle,
    run_id: expectedRunId,
    report_sha256: sha256File(reportPath),
    manifest_sha256: sha256File(manifestPath),
    driver_evidence_tree_sha256: sha256Bytes(
      JSON.stringify(
        Object.entries(report.driver_evidence_sha256).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    ),
    executed_head: report.executed_head,
    raw_child_exit: report.execution.exit_code,
    timed_out: report.execution.timed_out,
    signal: report.execution.signal,
    passed_platforms: manifest.passed_platforms,
    completed: manifest.completed,
    actual_failure_count: report.verdict.actual_failure_count,
    observations,
    source_sha256: report.source_sha256,
  };
}

function verifyDiagnosticInputs(): {
  attempts: Record<string, unknown>[];
  currentSources: Record<string, string>;
  currentWrapperSha256: string;
} {
  for (const [artifact, expected] of Object.entries(IMMUTABLE_DIAGNOSTIC_SHA256)) {
    const path = join(EVIDENCE_ROOT, artifact);
    requireCondition(existsSync(path), `missing immutable diagnostic artifact: ${artifact}`);
    requireCondition(sha256File(path) === expected, `diagnostic artifact changed: ${artifact}`);
    const repoPath = relative(REPO_ROOT, path);
    requireCondition(
      gitObjectSha256(CHECKPOINT_SHA, repoPath) === expected,
      `checkpoint artifact mismatch: ${artifact}`,
    );
  }
  requireCondition(
    gitObjectSha256(CHECKPOINT_SHA, WRAPPER_PATH) === CHECKPOINT_WRAPPER_SHA256,
    'checkpoint wrapper hash mismatch',
  );
  const attempts = [verifyAttempt('cycle-2'), verifyAttempt('cycle-3')];
  const firstSources = attempts[0].source_sha256 as Record<string, string>;
  const secondSources = attempts[1].source_sha256 as Record<string, string>;
  requireCondition(sameHashes(firstSources, secondSources), 'attempt source manifests differ');
  requireCondition(
    firstSources[WRAPPER_PATH] === ORIGINAL_EXECUTION_WRAPPER_SHA256,
    'original execution wrapper hash mismatch',
  );
  const currentSources = sourceManifest();
  for (const [path, expected] of Object.entries(firstSources)) {
    if (path === WRAPPER_PATH) continue;
    requireCondition(currentSources[path] === expected, `behavioral source changed: ${path}`);
  }
  const currentWrapperSha256 = currentSources[WRAPPER_PATH];
  requireCondition(
    currentWrapperSha256 !== ORIGINAL_EXECUTION_WRAPPER_SHA256,
    'disposition requires the reviewed wrapper update to be distinct from execution bytes',
  );
  return { attempts, currentSources, currentWrapperSha256 };
}

function recordNoRepairDisposition(phaseDir: string): void {
  const verified = verifyDiagnosticInputs();
  const disposition = {
    task: TASK,
    phase: 'disposition',
    status: 'not_reproduced',
    no_repair: true,
    accepted: true,
    diagnostic_checkpoint: CHECKPOINT_SHA,
    diagnostic_base: DIAGNOSTIC_BASE_SHA,
    current_candidate: git('rev-parse', 'HEAD'),
    immutable_diagnostic_sha256: IMMUTABLE_DIAGNOSTIC_SHA256,
    attempts: verified.attempts,
    source_binding: {
      original_execution_wrapper_sha256: ORIGINAL_EXECUTION_WRAPPER_SHA256,
      checkpoint_wrapper_sha256: CHECKPOINT_WRAPPER_SHA256,
      current_wrapper_sha256: verified.currentWrapperSha256,
      current_source_sha256: verified.currentSources,
      behavioral_sources_unchanged: true,
      repair_paths_changed: [],
    },
    temporal_marker_observation:
      'Each real Maestro leg completed the exact submitted MARKER assertVisible operation twice.',
    final_screenshot_limitation:
      'Final screenshots prove the usable Retry/composer end state only. They do not independently prove that the complete marker remained visible; cycle-3 dark shows only its suffix.',
    copied_android_limitation:
      'The android/** files carried inside the old iOS snapshots are historical artifacts and are not current Android proof.',
    cleanup_limitation:
      'Preserved iOS attempts prove zero listeners on checked ports only. Current appearance, reverse mapping, reservation and descendant teardown must come from the fresh full run.',
    cycle_1_classification: 'prerequisite interruption; no runtime failure',
  };
  writeJson(join(phaseDir, 'disposition.json'), disposition);
  console.log(
    JSON.stringify(
      {
        passed: true,
        status: disposition.status,
        no_repair: disposition.no_repair,
        current_candidate: disposition.current_candidate,
      },
      null,
      2,
    ),
  );
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

type RuntimeBackup = {
  repoPath: string;
  absolute: string;
  backup: string;
  existed: boolean;
  beforeSha256: Record<string, string>;
};

function backupRuntimeRoots(scratch: string): RuntimeBackup[] {
  const backupRoot = join(scratch, 'runtime-before');
  mkdirSync(backupRoot, { recursive: true });
  return RUNTIME_ROOTS.map((repoPath, index) => {
    const absolute = join(REPO_ROOT, repoPath);
    const backup = join(backupRoot, String(index));
    const existed = existsSync(absolute);
    if (existed) cpSync(absolute, backup, { recursive: true, errorOnExist: true });
    return {
      repoPath,
      absolute,
      backup,
      existed,
      beforeSha256: existed ? treeHashes(absolute) : {},
    };
  });
}

function snapshotAndRestoreRuntimeRoots(
  backups: RuntimeBackup[],
  phaseDir: string,
): Record<string, unknown>[] {
  const snapshotRoot = join(phaseDir, 'runtime-artifacts');
  mkdirSync(snapshotRoot, { recursive: false });
  const mismatches: string[] = [];
  const results = backups.map((entry, index) => {
    const generatedExists = existsSync(entry.absolute);
    const generatedSha256 = generatedExists ? treeHashes(entry.absolute) : {};
    if (generatedExists)
      cpSync(entry.absolute, join(snapshotRoot, String(index)), {
        recursive: true,
        errorOnExist: true,
      });
    rmSync(entry.absolute, { recursive: true, force: true });
    if (entry.existed)
      cpSync(entry.backup, entry.absolute, { recursive: true, errorOnExist: true });
    const restoredSha256 = existsSync(entry.absolute) ? treeHashes(entry.absolute) : {};
    const restoredExactly = sameHashes(restoredSha256, entry.beforeSha256);
    if (!restoredExactly) mismatches.push(entry.repoPath);
    return {
      source: entry.repoPath,
      snapshot: generatedExists ? relative(REPO_ROOT, join(snapshotRoot, String(index))) : null,
      before_sha256: entry.beforeSha256,
      generated_sha256: generatedSha256,
      restored_sha256: restoredSha256,
      restored_exactly: restoredExactly,
    };
  });
  requireCondition(
    mismatches.length === 0,
    `runtime artifact restoration mismatch: ${mismatches.join(', ')}`,
  );
  return results;
}

function verifyDisposition(
  cycleDir: string,
  requireCurrentHead: boolean,
): {
  receipt: Record<string, unknown>;
  sha256: string;
} {
  const path = join(cycleDir, 'disposition', 'disposition.json');
  requireCondition(existsSync(path), 'full phase requires accepted disposition evidence');
  const receipt = readJson<Record<string, unknown>>(path);
  requireCondition(
    receipt.task === TASK &&
      receipt.phase === 'disposition' &&
      receipt.status === 'not_reproduced' &&
      receipt.no_repair === true &&
      receipt.accepted === true,
    'disposition outcome is not accepted',
  );
  requireCondition(
    typeof receipt.current_candidate === 'string',
    'disposition candidate is absent',
  );
  if (requireCurrentHead)
    requireCondition(
      receipt.current_candidate === git('rev-parse', 'HEAD'),
      'disposition candidate does not match full execution candidate',
    );
  const verified = verifyDiagnosticInputs();
  const sourceBinding = receipt.source_binding as Record<string, unknown>;
  requireCondition(
    sourceBinding.current_wrapper_sha256 === verified.currentWrapperSha256 &&
      sameHashes(
        sourceBinding.current_source_sha256 as Record<string, string>,
        verified.currentSources,
      ),
    'disposition source binding is stale',
  );
  return { receipt, sha256: sha256File(path) };
}

function processGroupMembers(processGroupId: unknown): string[] {
  if (typeof processGroupId !== 'number') return [];
  const result = commandOutput('pgrep', ['-g', String(processGroupId)]);
  return result.exit === 0 ? result.stdout.split('\n').filter(Boolean) : [];
}

// fallow-ignore-next-line complexity -- one linear full-caller proof writes a single immutable report.
async function runFull(cycle: string, phaseDir: string): Promise<void> {
  const cycleDir = dirname(phaseDir);
  const disposition = verifyDisposition(cycleDir, true);
  const preflight = assertPreflight(FULL_PORTS);
  const runId = `${TASK}-${cycle}-full`;
  const callerDir = join(phaseDir, 'caller');
  const scratch = mkdtempSync(join(tmpdir(), 'rnr4-'));
  const runtimeBackups = backupRuntimeRoots(scratch);
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
  const execution = await supervise('node', args, FULL_TIMEOUT_MS, phaseDir, env, () =>
    callerPhase(callerDir),
  );
  const runtimeArtifacts = snapshotAndRestoreRuntimeRoots(runtimeBackups, phaseDir);
  const validate = commandOutput('node', [
    'tests/sprint-05-orient-search/run-live-example-proof.mjs',
    '--validate',
    relative(REPO_ROOT, callerDir),
    '--expect-run-id',
    runId,
  ]);
  const postListeners = listeners(FULL_PORTS);
  const devicesAfter = deviceFacts();
  const processGroupMembersAfter = processGroupMembers(execution.process_group_id);
  const manifestPath = join(callerDir, 'manifest.json');
  const callerManifest = existsSync(manifestPath)
    ? readJson<{
        run_id?: string;
        exit_code?: number;
        validation?: { ok?: boolean; accepted_targets?: string[]; rejections?: string[] };
        targets?: Record<string, unknown>;
      }>(manifestPath)
    : null;
  const expectedTargets = [
    'nativewind-android',
    'nativewind-ios',
    'nativewind-web',
    'uniwind-android',
    'uniwind-ios',
    'uniwind-web',
  ];
  const actualTargets = Object.keys(callerManifest?.targets ?? {}).sort();
  const devicesBefore = preflight.devices as Record<string, unknown>;
  const appearancesRestored =
    devicesBefore.ios_appearance === devicesAfter.ios_appearance &&
    devicesBefore.android_appearance === devicesAfter.android_appearance;
  const reverseMappingsRestored =
    JSON.stringify(devicesBefore.android_reverse) === JSON.stringify(devicesAfter.android_reverse);
  const report = {
    task: TASK,
    phase: 'full',
    mode: 'green',
    run_id: runId,
    executed_head: git('rev-parse', 'HEAD'),
    source_sha256: sourceManifest(),
    disposition_sha256: disposition.sha256,
    preflight,
    execution,
    validate,
    caller_manifest: existsSync(manifestPath) ? relative(REPO_ROOT, manifestPath) : null,
    caller_outcome: {
      run_id: callerManifest?.run_id ?? null,
      exit_code: callerManifest?.exit_code ?? null,
      validation: callerManifest?.validation ?? null,
      targets: actualTargets,
    },
    caller_evidence_sha256: existsSync(callerDir) ? treeHashes(callerDir) : {},
    runtime_artifacts: runtimeArtifacts,
    phase_deadlines_ms: {
      full_caller: FULL_TIMEOUT_MS,
      nativewind_consumer_preparation: 3_600_000,
      device_metro_preparation: 300_000,
      each_native_leg: 2_400_000,
      web_leg: 900_000,
      backend_operation: 120_000,
      cleanup: 180_000,
    },
    teardown: {
      listeners_after: postListeners,
      zero_owned_listeners: postListeners.length === 0,
      process_group_members_after: processGroupMembersAfter,
      zero_process_group_members: processGroupMembersAfter.length === 0,
      appearances_restored: appearancesRestored,
      reverse_mappings_restored: reverseMappingsRestored,
      devices_after: devicesAfter,
    },
  };
  writeJson(join(phaseDir, 'run.json'), report);
  if (
    execution.exit_code !== 0 ||
    execution.signal !== null ||
    execution.timed_out ||
    validate.exit !== 0 ||
    postListeners.length > 0 ||
    processGroupMembersAfter.length > 0 ||
    !appearancesRestored ||
    !reverseMappingsRestored ||
    callerManifest?.run_id !== runId ||
    callerManifest.exit_code !== 0 ||
    callerManifest.validation?.ok !== true ||
    JSON.stringify(actualTargets) !== JSON.stringify(expectedTargets)
  ) {
    throw new Error('full six-target caller or its validate-only pass failed');
  }
  console.log(
    JSON.stringify({ passed: true, run_id: runId, validate_exit: validate.exit }, null, 2),
  );
}

function implementationCommitAllowed(path: string): boolean {
  return (
    path === 'tests/sprint-05-orient-search/live-example.maestro.yaml' ||
    path === 'tests/sprint-05-orient-search/support/live-example-proof.test.ts' ||
    path === WRAPPER_PATH ||
    path.startsWith('tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-4/')
  );
}

// fallow-ignore-next-line complexity -- read-only audit reports every evidence and scope invariant together.
function audit(cycleDir: string): void {
  requireCondition(existsSync(cycleDir), 'audit requires an existing cycle');
  requireCondition(existsSync(join(cycleDir, 'identity.json')), 'audit requires cycle identity');
  const expected = ['disposition/disposition.json', 'full-green/run.json'];
  const missing = expected.filter((path) => !existsSync(join(cycleDir, path)));
  if (missing.length > 0) throw new Error(`audit missing phase evidence: ${missing.join(', ')}`);
  const disposition = verifyDisposition(cycleDir, false);
  const full = readJson<{
    executed_head?: string;
    source_sha256?: Record<string, string>;
    disposition_sha256?: string;
    execution?: { exit_code?: number; signal?: string | null; timed_out?: boolean };
    validate?: { exit?: number };
    caller_evidence_sha256?: Record<string, string>;
    caller_manifest?: string;
    caller_outcome?: {
      run_id?: string;
      exit_code?: number;
      validation?: { ok?: boolean };
      targets?: string[];
    };
    teardown?: {
      zero_owned_listeners?: boolean;
      zero_process_group_members?: boolean;
      appearances_restored?: boolean;
      reverse_mappings_restored?: boolean;
    };
  }>(join(cycleDir, expected[1]));
  const identity = readJson<Record<string, unknown>>(join(cycleDir, 'identity.json'));
  const expectedRunId = `${TASK}-${String(identity.cycle)}-full`;
  const sourceBinding = disposition.receipt.source_binding as Record<string, unknown>;
  const expectedSources = sourceBinding.current_source_sha256 as Record<string, string>;
  const callerDir = join(cycleDir, 'full-green', 'caller');
  const expectedTargets = [
    'nativewind-android',
    'nativewind-ios',
    'nativewind-web',
    'uniwind-android',
    'uniwind-ios',
    'uniwind-web',
  ];
  requireCondition(full.executed_head === identity.base_head, 'full execution SHA mismatch');
  requireCondition(
    full.disposition_sha256 === disposition.sha256,
    'full disposition link mismatch',
  );
  requireCondition(
    full.source_sha256 !== undefined && sameHashes(full.source_sha256, expectedSources),
    'full source manifest differs from disposition',
  );
  requireCondition(
    full.execution?.exit_code === 0 &&
      full.execution.signal === null &&
      full.execution.timed_out === false &&
      full.validate?.exit === 0,
    'full process or validate-only result failed',
  );
  requireCondition(
    full.caller_outcome?.run_id === expectedRunId &&
      full.caller_outcome.exit_code === 0 &&
      full.caller_outcome.validation?.ok === true &&
      JSON.stringify(full.caller_outcome.targets) === JSON.stringify(expectedTargets),
    'full caller outcome or six-target set failed',
  );
  requireCondition(
    full.caller_manifest === relative(REPO_ROOT, join(callerDir, 'manifest.json')) &&
      full.caller_evidence_sha256 !== undefined &&
      sameHashes(treeHashes(callerDir), full.caller_evidence_sha256),
    'full caller evidence hash mismatch',
  );
  requireCondition(
    full.teardown?.zero_owned_listeners === true &&
      full.teardown.zero_process_group_members === true &&
      full.teardown.appearances_restored === true &&
      full.teardown.reverse_mappings_restored === true,
    'full cleanup evidence failed',
  );
  requireCondition(listeners(FULL_PORTS).length === 0, 'owned ports have current listeners');
  const committedPaths = git('diff', '--name-only', `${TASK_AUDIT_BASE_SHA}..HEAD`)
    .split('\n')
    .filter(Boolean);
  const committedOutsideAllowed = committedPaths.filter(
    (path) => !implementationCommitAllowed(path),
  );
  const stagedRuntimeArtifacts = git('diff', '--cached', '--name-only')
    .split('\n')
    .filter((path) => RUNTIME_ROOTS.some((root) => path === root || path.startsWith(`${root}/`)));
  requireCondition(
    committedOutsideAllowed.length === 0,
    `commit scope contains prohibited paths: ${committedOutsideAllowed.join(', ')}`,
  );
  requireCondition(
    stagedRuntimeArtifacts.length === 0,
    `runtime artifacts are staged: ${stagedRuntimeArtifacts.join(', ')}`,
  );
  const result = {
    task: TASK,
    phase: 'audit',
    passed: true,
    read_only: true,
    cycle_identity_sha256: sha256File(join(cycleDir, 'identity.json')),
    evidence_sha256: Object.fromEntries(
      expected.map((path) => [path, sha256File(join(cycleDir, path))]),
    ),
    disposition_verified: true,
    full_source_consistent: true,
    current_executable_hashes_match: true,
    caller_evidence_hashes_match: true,
    six_targets: expectedTargets,
    cleanup_verified: true,
    task_audit_base: TASK_AUDIT_BASE_SHA,
    committed_paths: committedPaths,
    committed_outside_allowed: committedOutsideAllowed,
    staged_runtime_artifacts: stagedRuntimeArtifacts,
  };
  console.log(JSON.stringify(result, null, 2));
}

async function main(): Promise<void> {
  const { phase, mode, cycle } = parseArgs();
  const cycleDir = join(EVIDENCE_ROOT, cycle);
  if (phase === 'audit') {
    audit(cycleDir);
    return;
  }
  ensureCycle(cycleDir, cycle);
  const phaseDir =
    phase === 'disposition' ? join(cycleDir, 'disposition') : join(cycleDir, `${phase}-${mode}`);
  mkdirSync(phaseDir, { recursive: false });
  if (phase === 'disposition') recordNoRepairDisposition(phaseDir);
  else if (phase === 'ios') await runIos(mode as Mode, cycle, phaseDir);
  else await runFull(cycle, phaseDir);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
