#!/usr/bin/env node
// fallow-ignore-file complexity
// ORI-CI-004 acceptance session runner — the local twin of
// .github/workflows/sprint-05-acceptance.yml.
// (fallow: spawned CLI entry point; tests and the evidence-gate command execute
// it as a process, invisible to the static import graph. Its CRAP estimates
// punish the linear phase pipeline and its refusal branches — the same shape
// and rationale as candidate-preflight.mjs.)
//
//   node run-acceptance.mjs --candidate <40-hex-sha> --run-id <session-id> \
//     --output <evidence-dir> [--phases preflight,prepare,test,docs-e2e] \
//     [--ios-udid <udid>] [--android-serial <serial>] [--label <session-label>]
//
// Phases (documented in tests/sprint-05-orient-search/acceptance-runner.md):
//   preflight  identity (HEAD == candidate [--github-sha]), explicit device
//              reservations, port 4321 occupancy, credential scoping policy.
//   prepare    fresh owner proof: the six-target Quickstart matrix and the
//              six-target live-example matrix on the reserved real devices and
//              the real provider backend.
//   test       the generated-data chain, then the complete `pnpm test` suite.
//   docs-e2e   orphan-preview sweep, then the verbatim `pnpm e2e:docs` suite.
//
// Refusals (identity mismatch, unavailable/foreign device, occupied-unowned
// port 4321, foreign run-id in the output dir) write runner-preflight.json with
// outcome 'refused' and exit nonzero — an absent prerequisite is never success.
// Teardown runs in finally on success, failure, and cancellation; it terminates
// only recorded owned children and writes teardown.json.
//
// Exit codes: 0 = every requested phase green; 1 = a phase command failed
// (propagated) or a resource gate refused; 2 = identity/usage error.
//
// OPENAI_API_KEY enters ONLY this trusted launcher process and the single AI
// owner launcher child; every other child environment has it stripped. The
// secret value is never read into evidence — only presence booleans and
// occurrence counts are recorded.

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(new URL(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_PATH, '../../../..');
const TASK = 'ORI-CI-004';
const PLANNING_SOURCE_SHA = '38034e972490945b684f5bd5a706bca0479dc659';
const HEX40 = /^[0-9a-f]{40}$/;
const PREVIEW_PORT = 4321;
const PREVIEW_ORIGIN = 'http://localhost:4321';
const ALL_PHASES = ['preflight', 'prepare', 'test', 'docs-e2e'];
const QUICKSTART_OWNER_DIR = join(
  REPO_ROOT,
  'tests/sprint-05-orient-search/evidence/ORI-RN-003',
);
const QUICKSTART_OWNER_MANIFEST = join(QUICKSTART_OWNER_DIR, 'run-manifest.json');
const QUICKSTART_CLI = [
  'tests/sprint-05-orient-search/support/quickstart-proof.test.ts',
];
const LIVE_LAUNCHER = 'tests/sprint-05-orient-search/run-live-example-proof.mjs';
// Owner evidence roots the live drivers rewrite in passing; restored after
// fresh copies land under this session's evidence dir.
const ORI_AI_OWNER_DIR = 'tests/sprint-05-orient-search/evidence';
const E2E_JUNIT = join(
  REPO_ROOT,
  'apps/docs/playwright-report/junit.xml',
);

function usage() {
  const lines = [
    'usage: run-acceptance.mjs --candidate <40-hex-sha> --run-id <id> --output <dir>',
    '  [--phases preflight,prepare,test,docs-e2e] [--ios-udid <udid>] [--android-serial <serial>]',
    '  [--label <label>] [--continue-on-phase-failure] [--github-sha <sha>]',
  ];
  for (const line of lines) console.error(line);
}

function parseArgs(argv) {
  const out = { phases: null };
  const BOOLEAN_FLAGS = new Set(['--continue-on-phase-failure']);
  let i = 0;
  while (i < argv.length) {
    const flag = argv[i];
    if (BOOLEAN_FLAGS.has(flag)) {
      out.continueOnPhaseFailure = true;
      i += 1;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined) {
      usage();
      throw new Error(`missing value for ${flag}`);
    }
    if (flag === '--candidate') out.candidate = value;
    else if (flag === '--run-id') out.runId = value;
    else if (flag === '--output') out.output = value;
    else if (flag === '--phases') out.phases = value;
    else if (flag === '--ios-udid') out.iosUdid = value;
    else if (flag === '--android-serial') out.androidSerial = value;
    else if (flag === '--label') out.label = value;
    else if (flag === '--github-sha') out.githubSha = value;
    else {
      usage();
      throw new Error(`unknown flag ${flag}`);
    }
    i += 2;
  }
  return out;
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function sha256Buffer(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 1)}\n`);
}

function run(cwd, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'buffer',
    timeout: options.timeoutMs ?? 120_000,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    command: [command, ...args].join(' '),
    exit: result.status,
    signal: result.signal,
    stdout: result.stdout ? result.stdout.toString('utf8') : '',
    stderr: result.stderr ? result.stderr.toString('utf8') : '',
  };
}

function gitHead(root) {
  const result = run(root, 'git', ['rev-parse', 'HEAD']);
  if (result.exit !== 0) throw new Error(`git rev-parse HEAD failed: ${result.stderr}`);
  return result.stdout.trim();
}

function gitParents(root, sha) {
  const result = run(root, 'git', ['rev-parse', `${sha}^@`]);
  if (result.exit !== 0) return [];
  return result.stdout.trim().split('\n').filter(Boolean);
}

function descendedFrom(root, sha, ancestor) {
  const result = run(root, 'git', ['merge-base', '--is-ancestor', ancestor, sha]);
  return result.exit === 0;
}

class RefusalError extends Error {
  constructor(reason, detail, exitCode = 2) {
    super(detail);
    this.reason = reason;
    this.exitCode = exitCode;
  }
}

/** Session state carried across phases; persisted for teardown on any exit. */
class AcceptanceSession {
  constructor(options) {
    this.runId = options.runId;
    this.candidate = options.candidate;
    this.outputDir = resolve(REPO_ROOT, options.output);
    this.label = options.label ?? 'acceptance';
    this.children = []; // { pid, role, command, startedAt }
    this.ports = [PREVIEW_PORT];
    this.terminatedPids = [];
    this.exitedPids = [];
    this.teardownPromise = null;
    this.phases = [];
    this.reservations = null;
    this.preRunAppearance = null;
    this.cancelled = false;
  }

  manifestPath() {
    return join(this.outputDir, 'manifest.json');
  }

  loadOrCreateManifest() {
    mkdirSync(this.outputDir, { recursive: true });
    const path = this.manifestPath();
    let existing = null;
    if (existsSync(path)) {
      existing = JSON.parse(readFileSync(path, 'utf8'));
      if (existing.run_id !== this.runId) {
        throw new RefusalError(
          'foreign-session-dir',
          `output dir holds evidence for run_id '${existing.run_id}'; refusing to overwrite it with run_id '${this.runId}' (never overwrite another session's evidence)`,
        );
      }
      // A continued session re-binds to the tree it runs against NOW: the
      // digests recorded by an earlier preflight of the same run-id are
      // refreshed so the final manifest always describes the current bytes,
      // and any completion marker from the earlier invocation is cleared —
      // completion belongs to THIS invocation's requested phases only. Prior
      // phase records carry forward: a continued session APPENDS, never
      // replaces, the recorded history of its run-id.
      existing.source_digests = sourceDigests();
      existing.completed = false;
      delete existing.completedPhases;
      delete existing.failures;
    }
    // Prior phases of this run-id carry into this invocation's record; on
    // later in-session saves the disk already holds this array (same
    // reference), so the assignment is a no-op — never a duplication.
    if (Array.isArray(existing?.phases)) this.phases = existing.phases;
    const manifest = {
      schema: `${TASK}-manifest/1`,
      task: TASK,
      run_id: this.runId,
      label: this.label,
      planning_source_sha: PLANNING_SOURCE_SHA,
      created_at: existing?.created_at ?? new Date().toISOString(),
      source_digests: existing?.source_digests ?? sourceDigests(),
      phases: existing?.phases ?? this.phases,
    };
    writeJson(path, manifest);
    return manifest;
  }

  /** Snapshot of untracked files under a directory, for owner-dir hygiene. */
  listUntracked(dir) {
    const result = run(REPO_ROOT, 'git', ['status', '--porcelain', '--', dir]);
    return result.stdout
      .split('\n')
      .filter((line) => line.startsWith('??'))
      .map((line) => line.slice(3).trim());
  }

  /** Remove only the untracked owner files THIS session created. */
  cleanCreatedUntracked(dir, before) {
    const beforeSet = new Set(before);
    const ownPrefix = relative(REPO_ROOT, this.outputDir);
    for (const entry of this.listUntracked(dir)) {
      if (entry.startsWith(ownPrefix)) continue; // never touch this session's own evidence
      if (!beforeSet.has(entry)) {
        rmSync(join(REPO_ROOT, entry), { force: true, recursive: true });
      }
    }
  }

  saveManifest() {
    // this.phases already carries the full run-id history (loaded at session
    // start, appended per phase), so the write is the merged record.
    this.loadOrCreateManifest();
  }

  recordPhase(phase) {
    this.phases.push(phase);
    this.saveManifest();
  }

  spawnChild(role, command, args, options = {}) {
    const env = { ...process.env };
    if (role !== 'trusted-launcher') {
      delete env.OPENAI_API_KEY;
    }
    // Vitest exports NODE_ENV=test into its process tree, and Expo's
    // dev-middleware refuses to boot Metro under it (the ORI-RN-005 cycle-2
    // finding; run-live-example-proof.mjs strips it for the same reason).
    delete env.NODE_ENV;
    env.CI = 'true';
    if (options.env) Object.assign(env, options.env);
    const logPath = options.logPath ? resolve(this.outputDir, options.logPath) : null;
    if (logPath) {
      mkdirSync(resolve(logPath, '..'), { recursive: true });
      // The empty file at spawn marks "this phase's child really started" —
      // owner CLIs can run for their whole duration before first output.
      writeFileSync(logPath, '');
    }
    const child = spawn(command, args, {
      cwd: REPO_ROOT,
      env,
      stdio: ['ignore', logPath ? 'pipe' : 'ignore', 'pipe'],
      detached: role !== 'sweeper',
    });
    this.children.push({
      pid: child.pid,
      role,
      command: [command, ...args].join(' '),
      detached: role !== 'sweeper',
      receivedOpenAiKey: role === 'trusted-launcher',
    });
    let log = '';
    let errLog = '';
    child.stdout?.on('data', (chunk) => {
      const text = chunk.toString('utf8');
      log += text;
      if (logPath) writeFileSync(logPath, log + errLog);
    });
    child.stderr?.on('data', (chunk) => {
      const text = chunk.toString('utf8');
      errLog += text;
      if (logPath) writeFileSync(logPath, log + errLog);
    });
    return { child, env };
  }

  isAlive(pid) {
    if (pid === undefined || pid === null) return false;
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return error.code === 'EPERM';
    }
  }

  async teardown(trigger) {
    // Single-flight: concurrent callers (signal handler + finally) await the
    // SAME teardown; the first invocation writes the one immutable record.
    if (this.teardownPromise) return this.teardownPromise;
    this.teardownPromise = this.teardownOnce(trigger);
    return this.teardownPromise;
  }

  async teardownOnce(trigger) {
    const records = [];
    for (const entry of this.children) {
      if (this.isAlive(entry.pid)) {
        const signalTarget = (target) => {
          // Detached children own a process group; the negative group id
          // terminates the whole recorded tree, not just the direct child.
          if (entry.detached) {
            try {
              process.kill(-target, 'SIGTERM');
            } catch {
              process.kill(target, 'SIGTERM');
            }
          } else {
            process.kill(target, 'SIGTERM');
          }
        };
        try {
          signalTarget(entry.pid);
        } catch {
          /* already gone */
        }
        await new Promise((r) => setTimeout(r, 1500));
        if (this.isAlive(entry.pid)) {
          try {
            process.kill(entry.detached ? -entry.pid : entry.pid, 'SIGKILL');
            process.kill(entry.pid, 'SIGKILL');
          } catch {
            /* already gone */
          }
        }
        this.terminatedPids.push(entry.pid);
        records.push({ ...entry, disposition: 'terminated' });
      } else {
        this.exitedPids.push(entry.pid);
        records.push({ ...entry, disposition: 'exited-before-teardown' });
      }
    }
    // Owned listener inventory after teardown: every recorded port must be free
    // of OUR PIDs (any remaining listener must belong to someone else). Probes
    // are bounded — a hung lsof must never stall cleanup.
    const listenerCheck = this.ports.map((port) => {
      const probe = run(REPO_ROOT, 'lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-F', 'p'], {
        timeoutMs: 15_000,
      });
      const pids = probe.stdout
        .split('\n')
        .map((line) => line.replace(/^p/, '').trim())
        .filter(Boolean);
      const owned = pids.filter((pid) =>
        this.children.some((child) => String(child.pid) === String(pid)),
      );
      return { port, listenerPids: pids.length, residualOwnedPids: owned.length };
    });
    // Device appearance: restore the captured pre-run appearance when a phase
    // changed it, and record the observed post-run value either way.
    let appearance = null;
    if (this.reservations?.ios?.udid && this.preRunAppearance) {
      const observed = simctlAppearance(this.reservations.ios.udid, 15_000);
      if (observed.ok && observed.appearance !== this.preRunAppearance) {
        run(
          REPO_ROOT,
          'xcrun',
          ['simctl', 'ui', this.reservations.ios.udid, 'appearance', this.preRunAppearance],
          { timeoutMs: 15_000 },
        );
        appearance = {
          preRun: this.preRunAppearance,
          postRun: observed.appearance,
          restoredTo: this.preRunAppearance,
        };
      } else {
        appearance = { preRun: this.preRunAppearance, postRun: observed.appearance, restoredTo: null };
      }
    }
    const teardown = {
      schema: `${TASK}-teardown/1`,
      run_id: this.runId,
      trigger,
      cancelled: this.cancelled,
      recordedChildren: records,
      terminatedOwnedPids: this.terminatedPids,
      exitedOwnedPids: this.exitedPids,
      residualOwnedLivePids: this.children.filter((child) => this.isAlive(child.pid)).length,
      ownedListeners: listenerCheck,
      residualOwnedListeners: listenerCheck.reduce((sum, check) => sum + check.residualOwnedPids, 0),
      residualReservations: 0, // reservations are advisory locks in the manifest; nothing OS-level persists
      androidMappingsRemoved: 0, // owner runners own their adb mappings; this session creates none itself
      deviceAppearance: appearance,
      finishedAt: new Date().toISOString(),
    };
    writeJson(join(this.outputDir, 'teardown.json'), teardown);
    return teardown;
  }
}

function simctlAppearance(udid, timeoutMs = 30_000) {
  const result = run(REPO_ROOT, 'xcrun', ['simctl', 'ui', udid, 'appearance'], { timeoutMs });
  if (result.exit !== 0) return { ok: false, appearance: null };
  const appearance = result.stdout.trim().toLowerCase();
  return { ok: appearance === 'light' || appearance === 'dark', appearance };
}

function listSimulators() {
  const result = run(REPO_ROOT, 'xcrun', ['simctl', 'list', 'devices', '-j']);
  if (result.exit !== 0) {
    throw new RefusalError('simctl-unavailable', `xcrun simctl list failed: ${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function findSimulator(devicesJson, udid) {
  for (const runtime of Object.values(devicesJson.devices)) {
    for (const device of runtime) {
      if (device.udid === udid) return device;
    }
  }
  return null;
}

function listAndroidDevices() {
  const result = run(REPO_ROOT, 'adb', ['devices']);
  if (result.exit !== 0) {
    throw new RefusalError('adb-unavailable', `adb devices failed: ${result.stderr}`);
  }
  return result.stdout
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.endsWith('\tdevice'))
    .map((line) => line.split('\t')[0]);
}

function portListeners(port) {
  const result = run(REPO_ROOT, 'lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-F', 'pl']);
  if (result.stdout.trim() === '') return [];
  const listeners = [];
  let currentPid = null;
  for (const line of result.stdout.split('\n')) {
    if (line.startsWith('p')) currentPid = line.slice(1);
    else if (line.startsWith('l')) {
      listeners.push({ pid: currentPid, listen: line.slice(1) });
    }
  }
  return listeners.filter((listener) => listener.pid !== null);
}

function processCwd(pid) {
  // Machine-parsed lsof: -d cwd -Fn prints `p<pid>` then `n<cwd-path>` — the
  // plain-column regex form breaks on macOS device numbers ("1,18"), which
  // would misclassify every listener as foreign.
  const result = run(REPO_ROOT, 'lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-F', 'n'], {
    timeoutMs: 15_000,
  });
  const match = result.stdout.match(/^n(.+)$/m);
  return match ? match[1] : null;
}

function credentialScopingReport(secretValue, scanDirs) {
  const policy = {
    receivingRoles: ['trusted-launcher', 'backend'],
    prohibitedGroups: ['installs', 'metro', 'compilers', 'browsers', 'client-artifacts'],
    note: 'the secret value is never printed or hashed into evidence; only counts',
  };
  const groups = {
    installs: 0,
    metro: 0,
    compilers: 0,
    browsers: 0,
    'client-artifacts': 0,
  };
  if (secretValue) {
    const needle = Buffer.from(secretValue, 'utf8');
    for (const dir of scanDirs) {
      if (!existsSync(dir)) continue;
      for (const entry of readdirSync(dir, { recursive: true })) {
        const path = join(dir, entry);
        let stat;
        try {
          stat = statSync(path);
        } catch {
          continue;
        }
        if (!stat.isFile() || stat.size > 200 * 1024 * 1024) continue;
        let bytes;
        try {
          bytes = readFileSync(path);
        } catch {
          continue;
        }
        if (bytes.includes(needle)) groups['client-artifacts'] += 1;
      }
    }
  }
  return { policy, prohibitedGroupOccurrences: groups };
}

function identityCheck(session, githubSha) {
  const head = gitHead(REPO_ROOT);
  const parents = gitParents(REPO_ROOT, head);
  const record = {
    head,
    declaredCandidate: session.candidate,
    githubSha: githubSha ?? process.env.GITHUB_SHA ?? null,
    descendedFromPlanningSource: descendedFrom(REPO_ROOT, head, PLANNING_SOURCE_SHA),
  };
  if (!HEX40.test(session.candidate)) {
    throw new RefusalError(
      'identity-mismatch',
      `declared candidate '${session.candidate}' is not a 40-hex SHA`,
    );
  }
  if (head !== session.candidate) {
    throw new RefusalError(
      'identity-mismatch',
      `supplied candidate ${session.candidate} != observed HEAD ${head}; git rev-parse HEAD, candidate_sha and GITHUB_SHA must agree`,
    );
  }
  if (record.githubSha && record.githubSha !== session.candidate) {
    throw new RefusalError(
      'identity-mismatch',
      `supplied candidate ${session.candidate} != GITHUB_SHA ${record.githubSha}`,
    );
  }
  record.ok = true;
  return record;
}

function reserveDevices(session, iosUdid, androidSerial) {
  if (!iosUdid || !androidSerial) {
    throw new RefusalError(
      'missing-reservation',
      'explicit device reservations are required: --ios-udid/RNR_S05_IOS_UDID and --android-serial/RNR_S05_ANDROID_SERIAL; never select the first booted device',
    );
  }
  const sims = listSimulators();
  const simulator = findSimulator(sims, iosUdid);
  if (!simulator) {
    throw new RefusalError(
      'device-unavailable',
      `reserved iOS UDID ${iosUdid} is not an available simulator; refusing to fall back to an arbitrary booted device`,
    );
  }
  const android = listAndroidDevices();
  if (!android.includes(androidSerial)) {
    throw new RefusalError(
      'device-unavailable',
      `reserved Android serial ${androidSerial} is not an attached device (adb: ${android.join(', ') || 'none'}); refusing to fall back`,
    );
  }
  let booted = simulator.state === 'Booted';
  if (!booted) {
    const boot = run(REPO_ROOT, 'xcrun', ['simctl', 'boot', iosUdid]);
    if (boot.exit !== 0) {
      throw new RefusalError('device-unavailable', `failed to boot reserved UDID ${iosUdid}: ${boot.stderr}`);
    }
    booted = true;
  }
  const appearance = simctlAppearance(iosUdid);
  session.preRunAppearance = appearance.ok ? appearance.appearance : null;
  const reservations = {
    ios: { udid: iosUdid, name: simulator.name, state: simulator.state, bootedNow: booted },
    android: { serial: androidSerial },
    appearancePreRun: session.preRunAppearance,
  };
  session.reservations = reservations;
  return reservations;
}

function checkPreviewPort(session, { sweepOwnOrphans }) {
  const listeners = portListeners(PREVIEW_PORT);
  if (listeners.length === 0) {
    return { port: PREVIEW_PORT, status: 'free', sweptOrphanPids: [] };
  }
  if (!sweepOwnOrphans) {
    const described = listeners
      .map((listener) => `${listener.pid} (${listener.listen})`)
      .join(', ');
    throw new RefusalError(
      'port-occupied',
      `localhost:${PREVIEW_PORT} is already listening (PIDs ${described}); refusing to shift ports or reuse an unowned server — localhost:${PREVIEW_PORT} is the strict preview contract`,
      1,
    );
  }
  const swept = [];
  for (const listener of listeners) {
    const cwd = processCwd(listener.pid);
    if (cwd && cwd.startsWith(REPO_ROOT)) {
      try {
        process.kill(Number(listener.pid), 'SIGTERM');
      } catch {
        /* already gone */
      }
      swept.push({ pid: listener.pid, cwd });
    } else {
      const described = listeners.map((l) => `${l.pid} (${l.cwd ?? '?'})`).join(', ');
      throw new RefusalError(
        'port-occupied',
        `localhost:${PREVIEW_PORT} is held by an unowned listener (PID ${listener.pid}, cwd ${cwd ?? 'unknown'}; all: ${described}); refusing to reuse or shift`,
        1,
      );
    }
  }
  return { port: PREVIEW_PORT, status: 'swept-own-orphans', sweptOrphanPids: swept };
}

function sourceDigests() {
  const paths = [
    'pnpm-lock.yaml',
    '.spec/e2e-policy/surface.json',
    '.spec/e2e-policy/coldboot.json',
    'tests/sprint-05-orient-search/support/quickstart-proof.test.ts',
    'tests/sprint-05-orient-search/support/live-example-proof.test.ts',
    'tests/sprint-05-orient-search/support/nativewind-live-example.ts',
    'tests/sprint-05-orient-search/support/native-session.ts',
    'tests/sprint-05-orient-search/run-live-example-proof.mjs',
    'tests/sprint-05-orient-search/acceptance-evidence.test.ts',
    'tests/sprint-05-orient-search/support/run-acceptance.mjs',
    'tests/sprint-05-orient-search/support/verify-acceptance.mjs',
    '.github/workflows/sprint-05-acceptance.yml',
    '.github/workflows/ci.yml',
  ];
  const digests = {};
  for (const path of paths) {
    const absolute = join(REPO_ROOT, path);
    digests[path] = existsSync(absolute) ? sha256File(absolute) : null;
  }
  return digests;
}

async function runPreparationPhase(session) {
  const prepDir = join(session.outputDir, 'test/preparation');
  mkdirSync(prepDir, { recursive: true });
  const commands = [];

  // --- Quickstart matrix (owner command, verbatim) -------------------------
  const ownerManifestBefore = existsSync(QUICKSTART_OWNER_MANIFEST)
    ? sha256File(QUICKSTART_OWNER_MANIFEST)
    : null;
  const quickstartLog = 'test/preparation/quickstart/pnpm-exec-quickstart.log';
  const quickstart = session.spawnChild(
    'owner-quickstart',
    'pnpm',
    ['exec', 'tsx', ...QUICKSTART_CLI, '--engines', 'nativewind,uniwind', '--platforms', 'ios,android,web'],
    { logPath: quickstartLog, timeoutMs: 90 * 60_000 },
  );
  const quickstartExit = await waitForExit(quickstart.child, 90 * 60_000);
  commands.push({
    role: 'owner-quickstart',
    command: `pnpm exec tsx ${QUICKSTART_CLI.join(' ')} --engines nativewind,uniwind --platforms ios,android,web`,
    exit: quickstartExit,
    receivedOpenAiKey: false,
  });
  // Copy the fresh owner manifest + its referenced captures into this session's
  // evidence dir — even on failure, the receipts of a failed matrix are real
  // evidence and the verifier judges completeness — then restore the owner's
  // committed evidence bytes and remove the untracked files this run created
  // there; owner outputs stay owned by their task. An owner CLI that died
  // before writing its manifest records the absence honestly instead of
  // crashing the session (the wedge-mode failure shape).
  const quickstartCopyDir = join(prepDir, 'quickstart');
  mkdirSync(quickstartCopyDir, { recursive: true });
  if (!existsSync(QUICKSTART_OWNER_MANIFEST)) {
    writeJson(join(quickstartCopyDir, 'owner-manifest-absent.json'), {
      schema: `${TASK}-quickstart-absent/1`,
      note: 'the Quickstart owner CLI exited without writing its run-manifest.json; no fresh matrix exists for this session',
      exit: quickstartExit,
      recordedAt: new Date().toISOString(),
    });
    commands.push({
      role: 'owner-evidence-restore',
      command: `git checkout -- ${QUICKSTART_OWNER_DIR} (no untracked run outputs to remove: manifest absent)`,
      exit: 0,
      note: 'owner manifest was never written; nothing to restore or copy',
      receivedOpenAiKey: false,
    });
    return {
      ok: false,
      commands,
      failed: 'quickstart-owner-manifest-absent',
      liveExit: null,
    };
  }
  const freshManifestBytes = readFileSync(QUICKSTART_OWNER_MANIFEST);
  writeFileSync(join(quickstartCopyDir, 'run-manifest.json'), freshManifestBytes);
  const freshManifest = JSON.parse(freshManifestBytes.toString('utf8'));
  const capturesInventory = [];
  const captureRoot = join(quickstartCopyDir, 'captures');
  for (const leg of freshManifest.legs ?? []) {
    // The owner schema records per-leg capture FILES as absolute screenshot
    // paths (native legs; web legs carry inline evidence only).
    const shot = leg.evidence?.screenshot;
    if (typeof shot === 'string' && shot.startsWith('/') && existsSync(shot)) {
      const copyRel = shot.replace(/^.*evidence\/ORI-RN-003\//, '');
      const destination = join(captureRoot, copyRel);
      mkdirSync(resolve(destination, '..'), { recursive: true });
      copyFileSync(shot, destination);
      capturesInventory.push({
        leg: `${leg.engine}-${leg.platform}`,
        name: copyRel.split('/').pop(),
        path: shot,
        copyRel,
        sha256: sha256File(destination),
      });
    }
  }
  writeJson(join(quickstartCopyDir, 'captures-inventory.json'), {
    schema: `${TASK}-quickstart-captures/1`,
    captures: capturesInventory,
  });
  const ownerUntrackedBefore = session.listUntracked(QUICKSTART_OWNER_DIR);
  const ownerPaths = run(REPO_ROOT, 'git', ['status', '--porcelain', '--', QUICKSTART_OWNER_DIR]);
  if (ownerPaths.stdout.trim() !== '') {
    run(REPO_ROOT, 'git', ['checkout', '--', QUICKSTART_OWNER_DIR]);
  }
  session.cleanCreatedUntracked(QUICKSTART_OWNER_DIR, ownerUntrackedBefore);
  commands.push({
    role: 'owner-evidence-restore',
    command: `git checkout -- ${QUICKSTART_OWNER_DIR} (+ untracked run outputs removed)`,
    exit: 0,
    note: 'owner evidence bytes restored; fresh copies live under test/preparation/quickstart',
    receivedOpenAiKey: false,
  });

  // --- Live-example matrix (owner launcher, verbatim, per engine) ----------
  // One invocation per engine — the owner's sanctioned accumulation contract
  // (<output>/<engine>/manifest.json + targets per invocation). The launcher
  // child is the trusted launcher: it keeps the provider key and passes the
  // server's required nonsecret configuration through.
  const liveUntrackedBefore = session.listUntracked(ORI_AI_OWNER_DIR);
  const liveExits = [];
  for (const engine of ['uniwind', 'nativewind']) {
    const live = session.spawnChild(
      'trusted-launcher',
      'node',
      [
        LIVE_LAUNCHER,
        '--engines',
        engine,
        '--platforms',
        'ios,android,web',
        '--output',
        join(session.outputDir, 'test/preparation/live-example'),
        '--run-id',
        `${session.runId}-live`,
      ],
      {
        logPath: `test/preparation/live-example/${engine}/launcher.log`,
        timeoutMs: 60 * 60_000,
        env: {
          RNR_S05_IOS_UDID: session.reservations.ios.udid,
          RNR_S05_ANDROID_SERIAL: session.reservations.android.serial,
          RNR_S05_CANDIDATE_SHA: session.candidate,
          RNR_S05_RUN_ID: session.runId,
          EXAMPLE_CHAT_MODEL: 'gpt-4.1-mini-2025-04-14',
          EXAMPLE_CHAT_WEB_ORIGIN: 'http://localhost:8081',
        },
      },
    );
    const liveExit = await waitForExit(live.child, 45 * 60_000, true);
    liveExits.push(liveExit);
    commands.push({
      role: 'trusted-launcher',
      command: `node ${LIVE_LAUNCHER} --engines ${engine} --platforms ios,android,web --output test/preparation/live-example --run-id ${session.runId}-live`,
      exit: liveExit,
      receivedOpenAiKey: true,
    });
    // Best-effort fresh-artifact capture: whatever this invocation produced —
    // the owner orchestrator's engine manifest when it reaches matrix-end, its
    // event journal, and the engine's driver manifest (the driver task's own
    // canonical output) — is copied into this session's evidence before owner
    // bytes are restored. A failed or hung invocation still records its real
    // receipts; the verifier judges completeness.
    const engineDir = join(session.outputDir, `test/preparation/live-example/${engine}`);
    mkdirSync(engineDir, { recursive: true });
    const driverCanonical =
      engine === 'uniwind'
        ? join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-004/run-manifest.json')
        : join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-005/manifest.json');
    for (const [source, name] of [
      [join(prepDir, `live-example/${engine}/manifest.json`), 'manifest.json'],
      [join(prepDir, `live-example/${engine}/server-events.jsonl`), 'server-events.jsonl'],
      [driverCanonical, 'driver-run-manifest.json'],
    ]) {
      if (existsSync(source) && !existsSync(join(engineDir, name))) {
        copyFileSync(source, join(engineDir, name));
      }
    }
  }
  // The owner drivers also rewrite their canonical scratch/evidence paths
  // (evidence/ORI-RN-005, ORI-AI-001, FLOW-DOCS-02, .tmp/ORI-RN-005, ...);
  // those bytes belong to their tasks — restore tracked owner evidence and
  // remove the untracked files this session created there. The acceptance
  // copies live under test/preparation/live-example/.
  const ownerDrift = run(REPO_ROOT, 'git', ['status', '--porcelain', '--', ORI_AI_OWNER_DIR]);
  if (ownerDrift.stdout.trim() !== '') {
    run(REPO_ROOT, 'git', ['checkout', '--', ORI_AI_OWNER_DIR]);
  }
  session.cleanCreatedUntracked(ORI_AI_OWNER_DIR, liveUntrackedBefore);
  commands.push({
    role: 'owner-evidence-restore',
    command: `git checkout -- ${ORI_AI_OWNER_DIR} (+ untracked run outputs removed)`,
    exit: 0,
    note: 'owner evidence bytes restored; fresh copies live under test/preparation/live-example',
    receivedOpenAiKey: false,
  });
  const ok = quickstartExit === 0 && liveExits.every((exit) => exit === 0);
  return { ok, commands, failed: ok ? null : 'prepare-matrices', liveExit: 0 };
}

function waitForExit(child, timeoutMs, killGroupOnTimeout = false) {
  return new Promise((resolvePromise) => {
    if (child.exitCode !== null) {
      resolvePromise(child.exitCode);
      return;
    }
    const timer = setTimeout(() => {
      cleanup();
      try {
        if (killGroupOnTimeout) process.kill(-child.pid, 'SIGKILL');
        child.kill('SIGKILL');
      } catch {
        /* already gone */
      }
      resolvePromise(null);
    }, timeoutMs);
    const onExit = (code) => {
      cleanup();
      resolvePromise(code);
    };
    const cleanup = () => {
      clearTimeout(timer);
      child.off('exit', onExit);
    };
    child.on('exit', onExit);
  });
}

function runGeneratedDataChain(session) {
  const commands = [];
  const chain = [
    ['registry:build', ['pnpm', ['registry:build']]],
    ['gallery:manifest', ['pnpm', ['gallery:manifest']]],
    ['docs-prebuild', ['pnpm', ['exec', 'tsx', 'scripts/docs-data/prebuild.ts']]],
  ];
  for (const [name, [command, args]] of chain) {
    const result = run(REPO_ROOT, command, args, { timeoutMs: 10 * 60_000 });
    commands.push({
      role: 'compilers',
      command: [command, ...args].join(' '),
      exit: result.exit,
      receivedOpenAiKey: false,
    });
    if (result.exit !== 0) {
      return { ok: false, commands, failed: name };
    }
  }
  return { ok: true, commands };
}

async function runTestPhase(session) {
  const chain = runGeneratedDataChain(session);
  if (!chain.ok) {
    return { ok: false, commands: chain.commands, failed: chain.failed, suite: null };
  }
  const suite = session.spawnChild('compilers', 'pnpm', ['test'], {
    logPath: 'test/pnpm-test.log',
    timeoutMs: 60 * 60_000,
  });
  const suiteExit = await waitForExit(suite.child, 60 * 60_000);
  const identity = run(REPO_ROOT, 'pnpm', ['exec', 'vitest', 'list'], { timeoutMs: 10 * 60_000 });
  mkdirSync(join(session.outputDir, 'test'), { recursive: true });
  writeFileSync(join(session.outputDir, 'test/vitest-list.txt'), identity.stdout);
  const commands = [
    ...chain.commands,
    {
      role: 'compilers',
      command: 'pnpm test',
      exit: suiteExit,
      receivedOpenAiKey: false,
    },
    {
      role: 'compilers',
      command: 'pnpm exec vitest list',
      exit: identity.exit,
      receivedOpenAiKey: false,
      note: 'suite identity enumeration; the suite itself ran verbatim above',
    },
  ];
  return { ok: suiteExit === 0, commands, failed: suiteExit === 0 ? null : 'pnpm-test', suite: suiteExit };
}

async function runDocsE2ePhase(session) {
  const sweep = checkPreviewPort(session, { sweepOwnOrphans: true });
  const commands = [];
  // Known suite hazard (documented environment note): the vitest lane's
  // destructive drill cases delete tracked generated-data files when a run is
  // killed mid-wipe. The docs build's own gate names the remedy — restore the
  // two named tracked files when absent so the verbatim suite runs against
  // the candidate's committed data.
  const drillVulnerable = [
    'apps/docs/src/data/dev-client-matrix.json',
    'apps/docs/src/data/token-usage.json',
  ];
  const missing = drillVulnerable.filter((path) => !existsSync(join(REPO_ROOT, path)));
  if (missing.length > 0) {
    const restore = run(REPO_ROOT, 'git', ['checkout', '--', ...missing]);
    commands.push({
      role: 'compilers',
      command: `git checkout -- ${missing.join(' ')} (restored the suite drill's known wipe victims)`,
      exit: restore.status,
      receivedOpenAiKey: false,
    });
  }
  const suite = session.spawnChild('browsers', 'pnpm', ['e2e:docs'], {
    logPath: 'docs-e2e/pnpm-e2e-docs.log',
    timeoutMs: 90 * 60_000,
  });
  const suiteExit = await waitForExit(suite.child, 90 * 60_000);
  const record = {
    phase: 'docs-e2e',
    sweep,
    commands: [
      ...commands,
      {
        role: 'browsers',
        command: 'pnpm e2e:docs',
        exit: suiteExit,
        env: { CI: 'true' },
        previewOrigin: PREVIEW_ORIGIN,
        receivedOpenAiKey: false,
      },
    ],
  };
  const docsDir = join(session.outputDir, 'docs-e2e');
  mkdirSync(docsDir, { recursive: true });
  if (existsSync(E2E_JUNIT)) {
    copyFileSync(E2E_JUNIT, join(docsDir, 'junit.xml'));
    record.junit = parseJunitSummary(readFileSync(join(docsDir, 'junit.xml'), 'utf8'));
  }
  record.ok = suiteExit === 0;
  return record;
}

function parseJunitSummary(xml) {
  const summary = { tests: 0, failures: 0, errors: 0, skipped: 0, testcases: [] };
  for (const match of xml.matchAll(/<testcase[^>]*name="([^"]*)"[^>]*>/g)) {
    summary.tests += 1;
    summary.testcases.push(match[1]);
  }
  summary.failures = (xml.match(/<failure\b/g) ?? []).length;
  summary.errors = (xml.match(/<error\b/g) ?? []).length;
  summary.skipped = (xml.match(/<skipped\b/g) ?? []).length;
  return summary;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.candidate || !options.runId || !options.output) {
    usage();
    process.exit(2);
  }
  const phases = options.phases
    ? options.phases.split(',').map((phase) => phase.trim())
    : ALL_PHASES;
  for (const phase of phases) {
    if (!ALL_PHASES.includes(phase)) {
      console.error(`unknown phase '${phase}' (allowed: ${ALL_PHASES.join(', ')})`);
      process.exit(2);
    }
  }
  const session = new AcceptanceSession(options);
  const teardownTriggers = [];
  const onSignal = (signal) => {
    session.cancelled = true;
    teardownTriggers.push(signal);
    // Teardown is bounded on the cancellation path: cleanup gets 30 seconds,
    // then the session terminates 130 regardless — a hung probe must never
    // leave a cancelled session alive.
    const deadline = setTimeout(() => process.exit(130), 30_000);
    session
      .teardown(`signal:${signal}`)
      .then(() => {
        clearTimeout(deadline);
        process.exit(130);
      })
      .catch(() => {
        clearTimeout(deadline);
        process.exit(130);
      });
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);

  let preflight;
  const failures = [];
  const continueOnFailure = Boolean(options.continueOnPhaseFailure);
  let refused = false;
  // Both refusal paths (manifest-load and preflight) record the same refused
  // preflight shape — one helper, never two copies of the record.
  const recordRefusal = (error) => {
    mkdirSync(session.outputDir, { recursive: true });
    writeJson(join(session.outputDir, 'runner-preflight.json'), {
      schema: `${TASK}-preflight/1`,
      run_id: session.runId,
      label: session.label,
      outcome: 'refused',
      reason: error.reason,
      detail: error.message,
      recordedAt: new Date().toISOString(),
    });
    console.error(`[ORI-CI-004] refused: ${error.message}`);
  };
  try {
    session.loadOrCreateManifest();
  } catch (error) {
    if (error instanceof RefusalError) {
      recordRefusal(error);
      process.exit(error.exitCode);
    }
    throw error;
  }

  try {
    // ---------------- preflight ----------------
    if (phases.includes('preflight')) {
      try {
        const identity = identityCheck(session, options.githubSha);
        const iosUdid = options.iosUdid ?? process.env.RNR_S05_IOS_UDID;
        const androidSerial = options.androidSerial ?? process.env.RNR_S05_ANDROID_SERIAL;
        const reservations = reserveDevices(session, iosUdid, androidSerial);
        const port = checkPreviewPort(session, { sweepOwnOrphans: true });
        preflight = {
          schema: `${TASK}-preflight/1`,
          run_id: session.runId,
          label: session.label,
          outcome: 'ok',
          identity,
          runner: {
            mode: process.env.GITHUB_SHA ? 'hosted' : 'local-owner',
            expectedLabels: ['self-hosted', 'macOS', 'ARM64', 'rnr-s05-native'],
            environment: 'sprint-05-real-proof',
            note:
              'local owner runs use the same commands for development/review but never impersonate hosted checks',
          },
          reservations,
          previewPort: port,
          credentials: {
            openAiKeyPresent: Boolean(process.env.OPENAI_API_KEY),
            receivingRoles: ['trusted-launcher', 'backend'],
          },
          toolchain: {
            node: process.version,
            pnpm: run(REPO_ROOT, 'pnpm', ['--version']).stdout.trim(),
          },
          recordedAt: new Date().toISOString(),
        };
        writeJson(join(session.outputDir, 'runner-preflight.json'), preflight);
        session.recordPhase({ phase: 'preflight', outcome: 'ok', identity: identity.head });
      } catch (error) {
        if (error instanceof RefusalError) {
          recordRefusal(error);
          failures.push(error);
          refused = true;
          throw error;
        }
        throw error;
      }
    }

    // ---------------- prepare ----------------
    if (phases.includes('prepare')) {
      const prep = await runPreparationPhase(session);
      const scoping = credentialScopingReport(process.env.OPENAI_API_KEY, [
        join(session.outputDir, 'test/preparation'),
      ]);
      session.recordPhase({
        phase: 'prepare',
        outcome: prep.ok ? 'ok' : 'failed',
        commands: prep.commands,
        credentialScoping: scoping,
      });
      if (!prep.ok) {
        failures.push(new Error(`prepare phase failed at ${prep.failed}`));
        if (!continueOnFailure) throw failures[failures.length - 1];
      }
    }

    // ---------------- test ----------------
    if (phases.includes('test')) {
      const test = await runTestPhase(session);
      session.recordPhase({
        phase: 'test',
        outcome: test.ok ? 'ok' : 'failed',
        commands: test.commands,
      });
      if (!test.ok) {
        failures.push(new RefusalError('test-phase-failed', `pnpm test exited ${test.suite}`, 1));
        if (!continueOnFailure) throw failures[failures.length - 1];
      }
    }

    // ---------------- docs-e2e ----------------
    if (phases.includes('docs-e2e')) {
      const docs = await runDocsE2ePhase(session);
      session.recordPhase(docs.ok ? { ...docs, outcome: 'ok' } : { ...docs, outcome: 'failed' });
      if (!docs.ok) {
        const suiteExit = docs.commands.find((command) => command.command === 'pnpm e2e:docs')?.exit;
        failures.push(
          new RefusalError(
            'docs-e2e-phase-failed',
            `pnpm e2e:docs exited ${suiteExit} (${docs.junit?.failures ?? '?'} junit failures); acceptance gate fails — no port shifting, no retry`,
            1,
          ),
        );
        if (!continueOnFailure) throw failures[failures.length - 1];
      }
    }
  } catch (error) {
    if (!(error instanceof RefusalError) && !(error instanceof Error)) {
      failures.push(new Error(String(error)));
    } else if (!failures.includes(error)) {
      failures.push(error);
    }
  } finally {
    // A cancellation is fully handled by the signal handler (teardown written
    // once, exit 130); the finally path never rewrites or re-marks anything.
    if (session.cancelled) {
      await session.teardown(`signal:${teardownTriggers[0]}`).catch(() => undefined);
      process.exit(130);
    }
    const trigger = 'completion';
    const teardown = await session.teardown(trigger);
    // Mark the session complete for its requested phases so post-session gates
    // can distinguish "phases attempted and recorded" from "session aborted
    // mid-phase" — a refused preflight never reaches this marker.
    const manifest = existsSync(session.manifestPath())
      ? JSON.parse(readFileSync(session.manifestPath(), 'utf8'))
      : null;
    if (manifest && !refused) {
      manifest.completed = true;
      manifest.completedPhases = phases;
      manifest.failures = failures.map((failure) => ({
        reason: failure instanceof RefusalError ? failure.reason : 'error',
        detail: failure.message,
      }));
      writeJson(session.manifestPath(), manifest);
    }
    if (session.cancelled) {
      process.exit(130);
    }
    if (failures.length > 0) {
      for (const failure of failures) console.error(`[ORI-CI-004] ${failure.message}`);
      process.exit(1);
    }
    console.error(
      `[ORI-CI-004] session ${session.runId} complete: phases [${phases.join(', ')}] green; teardown terminated ${teardown.terminatedOwnedPids.length} owned child PID(s)`,
    );
    process.exit(0);
  }
}

main().catch((error) => {
  console.error(`[ORI-CI-004] unexpected failure: ${error.stack ?? error.message}`);
  process.exit(1);
});
