/**
 * FIX-ORI-RN-004-3 — the caller-backend restart proof harness.
 *
 * Reproduces the seam ORI-AI-002's runner exercises — a caller-provided
 * `options.backend` handle over record/status/command files — against the REAL
 * Uniwind live-proof driver, and proves the post-stop restart path can no longer
 * idle silently:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts
 *   pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --matrix ios,android,web
 *   pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts --mode red
 *
 * The adapter (task-owned, built from the shape documented in ORI-AI-002's
 * cycle-3 blocked report; never imported from its write-prohibited runner)
 * spawns the REAL backend server child itself, journals stop/restart into a
 * command file, status into a status file, and provider records into a records
 * file — the adapter, not the driver, owns the initial child, and its dispose()
 * (not stop()) reaps it, matching the documented ownership split where the
 * driver stops only its own restart children.
 *
 * Modes:
 *  - default (GREEN): (1) a forced-stall child whose adapter performs its real
 *    stop but never confirms — the documented cross-process adapter-hang class —
 *    proving the driver's `backend/stop` bound fires <= 120 s with the named
 *    step/port/boundMs/lastHeartbeat diagnostic while still writing its
 *    manifest; then (2) a full caller-handle web leg with one REAL mid-stream
 *    client abort injected against the adapter's backend (the web proxy does
 *    not propagate client aborts upstream), proving the stop -> per-segment
 *    chain -> restart completion end to end.
 *  - --mode red (pre-fix): freezes the child process at the `backend/stop/*`
 *    heartbeat — the observed stalled state of run ORI-AI-002-1789975643876
 *    (alive, no further heartbeats, no restart command, no manifest) — and
 *    captures the silent-gap signature under the watchdog. Run against the
 *    PRE-FIX driver; exits nonzero by design.
 *  - --matrix ios,android,web: the full exact three-platform matrix through the
 *    caller handle on the reserved devices.
 *
 * Real services only: the real apps/example server child, real OpenAI
 * Responses, real expo export, real same-origin proxy, real headless Chromium
 * (and, for --matrix, real Expo Go on the reserved simulator/emulator). The
 * only intervention is process state (SIGSTOP/SIGKILL) reproducing the observed
 * stalled-process class — never a mocked server, browser, or stream.
 *
 * Architecture note: every driver invocation runs in a CHILD process (the
 * mini-runner below) spawned by this harness, exactly like ORI-AI-002's runner
 * spawns its orchestrator. The `options.backend` object cannot cross a process
 * boundary, so the child builds the adapter itself over file paths the parent
 * also reads; the parent's watchdog is therefore genuinely OUTER — it observes
 * the child's heartbeats from outside and bounds even a child whose event loop
 * has stopped advancing (the class no in-process bound can catch, recorded in
 * FIX-ORI-RN-004-2's handoff).
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { connect as netConnect } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type BackendLaunchOptions,
  type BackendRecord,
  DEFAULT_MODEL,
  launchOwnedBackend,
  type OwnedBackendHandle,
} from './support/live-backend';
import { runLiveExampleProof } from './support/live-example-proof.test';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');
const TASK_TMP = join(REPO_ROOT, '.tmp', 'FIX-ORI-RN-004-3');
const EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-004');
const HEARTBEAT_LOG = join(EVIDENCE_ROOT, 'heartbeat.log');
const TSX_CLI = join(REPO_ROOT, 'node_modules/tsx/dist/cli.mjs');
const HARNESS_SELF = join(HERE, 'caller-backend-restart-proof.test.ts');

const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4000;

/** Charter watchdog budget for a caller-handle web-leg replay (<= 900 s). */
const WATCHDOG_WEB_MS = 900_000;
/**
 * Matrix watchdog: the driver's own per-leg budgets are 2400 s (ios) + 2400 s
 * (android) + 840 s (web); native prep (Expo Go installs, Metro) and the export
 * need headroom, so the outer budget is the budget sum plus 50 %.
 */
const WATCHDOG_MATRIX_MS = Math.round((2_400_000 + 2_400_000 + 840_000) * 1.5);
/** How long the red-mode freeze observes silence (> every 120 s segment bound). */
const WEDGE_OBSERVE_MS = 180_000;
/** Deadline for a web-leg child to REACH the endpoint-loss stop heartbeat. */
const REACH_STOP_WINDOW_MS = 600_000;
/** Tolerance over a 120 s bound before the stall diagnostic must have fired. */
const STALL_DIAGNOSTIC_TOLERANCE_MS = 5_000;

const LITERAL_COMMAND =
  'pnpm exec tsx tests/sprint-05-orient-search/caller-backend-restart-proof.test.ts';

/** A long, compliant prompt so the real provider stream outlives the abort probe. */
const PROBE_ESSAY_PROMPT =
  'Write an extremely detailed history of computing hardware from the Pascaline to modern tensor processors. The essay must be at least 4000 words across at least twenty substantial paragraphs. Do not summarize, do not decline, and do not stop early.';

type HeartbeatEntry = { seq: number; ts: string; run: string; step: string; detail?: string };

type Platform = 'ios' | 'android' | 'web';

type ChildRunConfig = {
  runId: string;
  platforms: Platform[];
  adapterDir: string;
  /** Adapter performs its real stop but never confirms (the adapter-hang class). */
  hangStop?: boolean;
  /** Inject one real mid-stream client abort against the adapter's backend. */
  abortInject?: boolean;
};

type ChildResult = {
  run_id: string;
  options_backend_not_null: boolean;
  platforms: Platform[];
  legs: { platform: string; status: string }[];
  all_legs_passed: boolean;
  abort_probe: { performed: boolean; aborted_record: boolean; request_path: string } | null;
  adapter: { dir: string; cmd_file: string; status_file: string; records_file: string };
  error?: string;
};

/* --------------------------------------------------------------- utilities -- */

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function gitHeadSha(): string {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : `unknown (${res.stderr.trim().slice(0, 120)})`;
}

function readHeartbeats(run?: string): HeartbeatEntry[] {
  if (!existsSync(HEARTBEAT_LOG)) return [];
  const entries: HeartbeatEntry[] = [];
  for (const line of readFileSync(HEARTBEAT_LOG, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      const entry = JSON.parse(trimmed) as HeartbeatEntry;
      if (run === undefined || entry.run === run) entries.push(entry);
    } catch {
      /* skip malformed tail line */
    }
  }
  return entries;
}

function timestampsOrdered(entries: HeartbeatEntry[]): boolean {
  return entries.every(
    (entry, index) => index === 0 || Date.parse(entry.ts) >= Date.parse(entries[index - 1].ts),
  );
}

/** Direct children of a pid (pgrep), best-effort. */
function childPidsOf(pid: number): number[] {
  const res = spawnSync('pgrep', ['-P', String(pid)], { encoding: 'utf8' });
  if (res.status !== 0 || res.stdout.trim() === '') return [];
  return res.stdout
    .trim()
    .split('\n')
    .map((line) => Number(line))
    .filter((n) => Number.isFinite(n));
}

/** All descendant pids of `pid` (excluding `pid`), depth-first. */
function descendantPids(pid: number): number[] {
  const out: number[] = [];
  const walk = (current: number): void => {
    for (const child of childPidsOf(current)) {
      out.push(child);
      walk(child);
    }
  };
  walk(pid);
  return out;
}

function killTree(pid: number): void {
  for (const descendant of descendantPids(pid)) {
    try {
      process.kill(descendant, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    /* already gone */
  }
}

async function portFree(port: number): Promise<boolean> {
  return await new Promise((resolveFree) => {
    const sock = netConnect({ host: BACKEND_HOST, port });
    sock.setTimeout(1_500);
    sock.once('connect', () => {
      sock.destroy();
      resolveFree(false);
    });
    sock.once('error', () => resolveFree(true));
    sock.once('timeout', () => {
      sock.destroy();
      resolveFree(true);
    });
  });
}

async function waitForPortFree(port: number, timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portFree(port)) return true;
    await sleep(500);
  }
  return await portFree(port);
}

/* ------------------------------------- the minimal caller-handle adapter -- */

type AdapterCommand = { id: number; op: 'stop' | 'restart'; model: string; ts: string };
type AdapterStatus = { ts: string; kind: 'listening' | 'stopped'; model: string };

function adapterFiles(dir: string): Record<'cmd' | 'status' | 'records', string> {
  return {
    cmd: join(dir, 'backend-cmd.jsonl'),
    status: join(dir, 'backend-status.jsonl'),
    records: join(dir, 'backend-records.jsonl'),
  };
}

/**
 * The OwnedBackendHandle the harness passes as `options.backend`: a file/command
 * adapter over the REAL backend server child (spawned via launchOwnedBackend —
 * real server code, real provider traffic). The adapter — not the driver — owns
 * the initial child: stop() appends the stop command, performs the real stop,
 * and appends the stopped status; restart() appends the restart command,
 * relaunches the real server, and appends the listening status. dispose() (the
 * harness's teardown, never called by the driver) reaps whatever inner child
 * remains — the documented ownership split.
 *
 * Each restart generation parses the records file from the line offset where
 * the previous generation ended, so the driver's session.allRecords()
 * (a flatMap over generations) sees the full history exactly once.
 */
class CallerFileBackend implements OwnedBackendHandle {
  private cmdSeq = 0;
  private seenInnerRecords = 0;
  private readonly fileStartLines: number;

  constructor(
    private inner: OwnedBackendHandle,
    private readonly dir: string,
    private readonly hangStop: boolean,
    fileStartLines: number,
  ) {
    this.fileStartLines = fileStartLines;
  }

  get launchIdentity(): string {
    return `fix-ori-rn-004-3-caller-adapter/${this.inner.launchIdentity}`;
  }
  get origin(): string {
    return this.inner.origin;
  }
  get host(): string {
    return this.inner.host;
  }
  get port(): number {
    return this.inner.port;
  }
  get model(): string {
    return this.inner.model;
  }
  get pid(): number | null {
    return this.inner.pid;
  }
  get started(): boolean {
    return this.inner.started;
  }
  get exitCode(): number | null {
    return this.inner.exitCode;
  }
  get exitSignal(): string | null {
    return this.inner.exitSignal;
  }
  stderrText(): string {
    return this.inner.stderrText();
  }
  stdoutText(): string {
    return this.inner.stdoutText();
  }

  private recordLineCount(): number {
    const files = adapterFiles(this.dir);
    if (!existsSync(files.records)) return 0;
    return readFileSync(files.records, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '').length;
  }

  /** Tails the inner handle's parsed real records into the records file. */
  private syncRecords(): void {
    const files = adapterFiles(this.dir);
    const all = this.inner.records();
    for (; this.seenInnerRecords < all.length; this.seenInnerRecords += 1) {
      appendFileSync(files.records, `${JSON.stringify(all[this.seenInnerRecords])}\n`);
    }
  }

  records(): BackendRecord[] {
    this.syncRecords();
    const files = adapterFiles(this.dir);
    if (!existsSync(files.records)) return [];
    const lines = readFileSync(files.records, 'utf8')
      .split('\n')
      .filter((line) => line.trim() !== '');
    return lines.slice(this.fileStartLines).map((line) => JSON.parse(line) as BackendRecord);
  }

  async waitForRecord(requestId: string, timeoutMs: number): Promise<BackendRecord | null> {
    const found = await this.inner.waitForRecord(requestId, timeoutMs);
    this.syncRecords();
    return found;
  }

  private appendCommand(op: 'stop' | 'restart', model: string): void {
    this.cmdSeq += 1;
    const command: AdapterCommand = { id: this.cmdSeq, op, model, ts: new Date().toISOString() };
    appendFileSync(adapterFiles(this.dir).cmd, `${JSON.stringify(command)}\n`);
  }

  private appendStatus(kind: 'listening' | 'stopped'): void {
    const status: AdapterStatus = { ts: new Date().toISOString(), kind, model: this.inner.model };
    appendFileSync(adapterFiles(this.dir).status, `${JSON.stringify(status)}\n`);
  }

  async stop(): Promise<void> {
    if (this.inner.exitCode !== null || this.inner.exitSignal !== null) return;
    this.syncRecords(); // persist the real records observed up to the stop
    this.appendCommand('stop', this.inner.model);
    await this.inner.stop(); // real: SIGTERM -> SIGKILL the real server child
    this.appendStatus('stopped');
    if (this.hangStop) {
      // The documented cross-process adapter-hang class: the real stop work is
      // done (server child dead, files updated) but the confirmation never
      // returns to the driver. FIX-ORI-RN-004-2's bound here was "proven by
      // construction ... not by a live adapter hang" — this makes it live.
      await new Promise<void>(() => {});
    }
  }

  async restart(options: BackendLaunchOptions = {}): Promise<OwnedBackendHandle> {
    const nextModel = options.model ?? this.inner.model;
    this.appendCommand('restart', nextModel);
    this.syncRecords();
    const next = await this.inner.restart(options); // real new server child, listening-confirmed
    this.appendStatus('listening');
    return new CallerFileBackend(next, this.dir, this.hangStop, this.recordLineCount());
  }

  async selectModel(model: string): Promise<OwnedBackendHandle> {
    return await this.restart({ model });
  }

  /** Harness teardown only: reap the adapter's own remaining inner child. */
  async dispose(): Promise<void> {
    this.syncRecords();
    await this.inner.stop();
  }
}

/** One REAL mid-stream client abort directly against the adapter's backend. */
async function abortOneRealStream(adapter: CallerFileBackend): Promise<boolean> {
  const baseline = adapter.records().length;
  const envelope = JSON.stringify({
    id: `fix-ori-rn-004-3-abort-${Date.now()}`,
    messages: [
      { id: 'abort-m1', role: 'user', parts: [{ type: 'text', text: PROBE_ESSAY_PROMPT }] },
    ],
  });
  await new Promise<void>((resolveAbortProbe) => {
    const req = httpRequest(
      {
        host: BACKEND_HOST,
        port: BACKEND_PORT,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(envelope),
        },
      },
      (response) => {
        response.once('data', () => {
          setTimeout(() => {
            req.destroy();
            resolveAbortProbe();
          }, 1_500);
        });
        response.once('aborted', () => resolveAbortProbe());
        response.once('end', () => resolveAbortProbe());
        response.on('error', () => resolveAbortProbe());
      },
    );
    req.on('error', () => resolveAbortProbe());
    req.end(envelope);
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    // adapter.records() also syncs the real aborted record into the records file.
    const records = adapter.records();
    if (records.length > baseline && records[records.length - 1].outcome === 'aborted') return true;
    await sleep(500);
  }
  return false;
}

/* ------------------------------------------------- mini-runner child mode -- */

/**
 * The child process entry: builds the adapter over the REAL server, optionally
 * injects the abort probe, invokes the real runLiveExampleProof with the caller
 * handle, disposes the adapter, and writes the child result. Exits 0 only when
 * every requested leg passed — a stalled-or-failed run exits nonzero.
 */
// fallow-ignore-next-line complexity
async function childRun(configPath: string): Promise<void> {
  const config = JSON.parse(readFileSync(configPath, 'utf8')) as ChildRunConfig;
  const adapterDir = config.adapterDir;
  mkdirSync(adapterDir, { recursive: true });
  const files = adapterFiles(adapterDir);
  for (const path of [files.cmd, files.status, files.records]) {
    if (!existsSync(path)) writeFileSync(path, '');
  }

  let exitCode = 0;
  try {
    const inner = await launchOwnedBackend({
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      model: DEFAULT_MODEL,
      // The fixture's proven value: a higher cap widens the Stop-control window.
      maxOutputTokens: 16_384,
    });
    writeFileSync(
      join(adapterDir, 'owner.json'),
      `${JSON.stringify({ harness_child_pid: process.pid, server_child_pid: inner.pid ?? null })}\n`,
    );
    if (!inner.started) {
      throw new Error(`adapter backend did not start: ${inner.stderrText().slice(-2000)}`);
    }
    const adapter = new CallerFileBackend(inner, adapterDir, config.hangStop === true, 0);

    let abortProbe: ChildResult['abort_probe'] = null;
    if (config.abortInject === true) {
      const aborted = await abortOneRealStream(adapter);
      abortProbe = {
        performed: true,
        aborted_record: aborted,
        request_path: `http://${BACKEND_HOST}:${BACKEND_PORT}/api/chat`,
      };
    }

    const proof = await runLiveExampleProof({
      engine: 'uniwind',
      platforms: config.platforms,
      runId: config.runId,
      backend: adapter,
    });

    await adapter.dispose();

    const legs = proof.legs.map((leg) => ({ platform: leg.platform, status: leg.status }));
    const allPassed = proof.legs.length > 0 && proof.legs.every((leg) => leg.status === 'passed');
    const result: ChildResult = {
      run_id: config.runId,
      options_backend_not_null: adapter !== null && typeof adapter === 'object',
      platforms: config.platforms,
      legs,
      all_legs_passed: allPassed,
      abort_probe: abortProbe,
      adapter: {
        dir: adapterDir,
        cmd_file: files.cmd,
        status_file: files.status,
        records_file: files.records,
      },
    };
    writeFileSync(join(adapterDir, 'child-result.json'), `${JSON.stringify(result, null, 2)}\n`);
    exitCode = allPassed ? 0 : 1;
  } catch (e) {
    const result: ChildResult = {
      run_id: config.runId,
      options_backend_not_null: false,
      platforms: config.platforms,
      legs: [],
      all_legs_passed: false,
      abort_probe: null,
      adapter: {
        dir: adapterDir,
        cmd_file: files.cmd,
        status_file: files.status,
        records_file: files.records,
      },
      error: e instanceof Error ? e.stack : String(e),
    };
    writeFileSync(join(adapterDir, 'child-result.json'), `${JSON.stringify(result, null, 2)}\n`);
    exitCode = 2;
  }
  process.exit(exitCode);
}

/* ------------------------------------------------------- parent watchdog -- */

type ChildOutcome = {
  code: number | null;
  signal: string | null;
  watchdog_fired: boolean;
  log_path: string;
};

/**
 * Spawns the mini-runner child with an OUTER watchdog: if the child (whose own
 * in-process bounds are dead in the frozen-loop class) idles past `watchdogMs`,
 * the tree is killed and the outcome records the watchdog firing. The child's
 * stdout/stderr (including every driver heartbeat line) tee into `logPath`.
 */
function spawnChildRun(
  config: ChildRunConfig,
  watchdogMs: number,
): { outcome: Promise<ChildOutcome>; child: ChildProcess } {
  const configPath = join(config.adapterDir, 'child-config.json');
  const logPath = join(config.adapterDir, 'child-stdio.log');
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.NODE_ENV; // Metro refuses NODE_ENV=test (ORI-RN-005 cycle-2 finding)

  const child = spawn(process.execPath, [TSX_CLI, HARNESS_SELF, '--child-run', configPath], {
    cwd: REPO_ROOT,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let watchdogFired = false;
  const outcome = new Promise<ChildOutcome>((resolveOutcome) => {
    const chunks: string[] = [];
    child.stdout?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      chunks.push(text);
      process.stdout.write(`[child] ${text}`);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf8');
      chunks.push(text);
      process.stderr.write(`[child] ${text}`);
    });
    const watchdog = setTimeout(() => {
      watchdogFired = true;
      console.error(
        `[watchdog] child run ${config.runId} exceeded ${watchdogMs} ms — killing the tree`,
      );
      killTree(child.pid ?? -1);
    }, watchdogMs);
    child.once('exit', (code, signal) => {
      clearTimeout(watchdog);
      writeFileSync(logPath, chunks.join(''));
      resolveOutcome({ code, signal, watchdog_fired: watchdogFired, log_path: logPath });
    });
  });
  return { outcome, child };
}

function parseCommandFile(path: string): AdapterCommand[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as AdapterCommand);
}

function readChildResult(adapterDir: string): ChildResult | null {
  const path = join(adapterDir, 'child-result.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as ChildResult;
}

function readManifest(): Record<string, unknown> | null {
  const path = join(EVIDENCE_ROOT, 'run-manifest.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function readCorrelation(): { run_id: string; backend_records: { outcome: string }[] } | null {
  const path = join(EVIDENCE_ROOT, 'provider-correlation.json');
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8')) as {
    run_id: string;
    backend_records: { outcome: string }[];
  };
}

function assertPortFreeOrFail(label: string): void {
  const busy = spawnSync('lsof', ['-i', `:${BACKEND_PORT}`, '-sTCP:LISTEN'], { encoding: 'utf8' });
  if (busy.status === 0 && busy.stdout.trim() !== '') {
    throw new Error(
      `port ${BACKEND_PORT} still listening before ${label} — refusing to run against an unknown holder`,
    );
  }
}

/* ------------------------------------------------------------- RED mode -- */

/**
 * Pre-fix RED: freeze the driver child at the `backend/stop/*` heartbeat and
 * capture the orchestrated stall's signature — the process alive, zero further
 * heartbeats past every 120 s segment bound, zero restart commands, no restart
 * heartbeat, and (on kill) no manifest. Exits nonzero BY DESIGN (the RED proof
 * fails); run against the PRE-FIX driver.
 */
// fallow-ignore-next-line complexity
async function runRedMode(): Promise<number> {
  const runId = `FIX-ORI-RN-004-3-RED-${Date.now()}`;
  const adapterDir = join(TASK_TMP, `adapter-red-${Date.now()}`);
  mkdirSync(adapterDir, { recursive: true });
  assertPortFreeOrFail('red');

  const config: ChildRunConfig = { runId, platforms: ['web'], adapterDir };
  const { outcome, child } = spawnChildRun(config, WATCHDOG_WEB_MS);
  const childPid = child.pid ?? -1;
  let childExited = false;
  child.once('exit', () => {
    childExited = true;
  });

  const startedAt = new Date().toISOString();
  let frozeAt: number | null = null;
  let stopSeenAt: number | null = null;
  let stopSeenStep: string | null = null;
  const reachDeadline = Date.now() + REACH_STOP_WINDOW_MS;
  while (Date.now() < reachDeadline) {
    // Trigger on ANY heartbeat of the backend/stop/* family (attempt 1 raced a
    // warm-cache leg that reaches the stop in ~13 s): the earliest sighting wins.
    const stopHeartbeat = readHeartbeats(runId).find((entry) =>
      entry.step.startsWith('backend/stop/'),
    );
    if (stopHeartbeat !== undefined) {
      stopSeenAt = Date.parse(stopHeartbeat.ts);
      stopSeenStep = stopHeartbeat.step;
      frozeAt = Date.now();
      // Freeze the WHOLE tree, not just the spawned pid: tsx's CLI re-spawns
      // node as a child, so the driver runs in a grandchild (attempt 1 froze
      // only the supervisor and the driver kept heartbeating). Freezing every
      // descendant reproduces the observed stalled-process state: alive, event
      // loop not advancing, no further heartbeats, no restart, no manifest.
      const tree = [childPid, ...descendantPids(childPid)];
      for (const pid of tree) {
        try {
          process.kill(pid, 'SIGSTOP');
        } catch {
          /* already gone */
        }
      }
      break;
    }
    if (childExited) break;
    await sleep(20);
  }

  let silenceMs: number | null = null;
  let heartbeatsAfterFreeze = 0;
  let restartCommands = 0;
  let stopCommands = 0;
  let restartedEntries = 0;
  if (frozeAt !== null) {
    const observeDeadline = frozeAt + WEDGE_OBSERVE_MS;
    while (Date.now() < observeDeadline) {
      await sleep(1_000);
      const entries = readHeartbeats(runId);
      heartbeatsAfterFreeze = entries.filter((entry) => Date.parse(entry.ts) >= frozeAt).length;
      if (heartbeatsAfterFreeze > 0) break;
    }
    silenceMs = Date.now() - frozeAt;
    const commands = parseCommandFile(adapterFiles(adapterDir).cmd);
    stopCommands = commands.filter((c) => c.op === 'stop').length;
    restartCommands = commands.filter((c) => c.op === 'restart').length;
    restartedEntries = readHeartbeats(runId).filter(
      (entry) => entry.step === 'backend/restarted',
    ).length;
  }

  killTree(childPid);
  await waitForPortFree(BACKEND_PORT, 15_000);
  const finalOutcome = await outcome;
  const manifestWritten = (() => {
    const manifest = readManifest();
    return manifest !== null && manifest.run_id === runId;
  })();

  const stallCaptured =
    frozeAt !== null &&
    heartbeatsAfterFreeze === 0 &&
    restartCommands === 0 &&
    restartedEntries === 0 &&
    !manifestWritten;

  const evidence = {
    command: `${LITERAL_COMMAND} --mode red`,
    mode: 'red',
    candidate_head_sha: gitHeadSha(),
    run_id: runId,
    watchdog_budget_ms: WATCHDOG_WEB_MS,
    wedge_observe_ms: WEDGE_OBSERVE_MS,
    divergence_note:
      'The live 30-minute stall of run ORI-AI-002-1789975643876 did not reproduce in a healthy event loop (isolation probes: a frozen or killed browser child makes every Playwright op reject within its 30 s in-process timeout, and every boundWait/leg-budget timer fires), so the RED reproduces the observed PROCESS STATE over the real driver code with the real adapter: the child frozen at the backend/stop/start heartbeat — alive, silent past every 120 s segment bound, no restart issued, no manifest — which is the only signature consistent with all observations of the orchestrated run.',
    freeze: {
      froze_at: frozeAt !== null ? new Date(frozeAt).toISOString() : null,
      stop_heartbeat_seen_at: stopSeenAt !== null ? new Date(stopSeenAt).toISOString() : null,
      stop_heartbeat_seen_step: stopSeenStep,
      observed_silence_ms: silenceMs,
      heartbeats_after_freeze: heartbeatsAfterFreeze,
    },
    adapter: {
      dir: adapterDir,
      stop_commands: stopCommands,
      restart_commands: restartCommands,
      cmd_file: adapterFiles(adapterDir).cmd,
      status_file: adapterFiles(adapterDir).status,
      records_file: adapterFiles(adapterDir).records,
    },
    backend_restarted_entries: restartedEntries,
    manifest_written_for_run: manifestWritten,
    child: {
      exit_code: finalOutcome.code,
      signal: finalOutcome.signal,
      watchdog_fired: finalOutcome.watchdog_fired,
      log_path: finalOutcome.log_path,
    },
    stall_captured: stallCaptured,
    started_at: startedAt,
    ended_at: new Date().toISOString(),
  };
  mkdirSync(TASK_TMP, { recursive: true });
  writeFileSync(join(TASK_TMP, 'red.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(JSON.stringify(evidence, null, 2));

  if (frozeAt === null) {
    console.error(
      'RED invalid: the child never reached the backend/stop/start heartbeat within the window — see child log',
    );
    return 2;
  }
  return stallCaptured ? 1 : 2;
}

/* ---------------------------------------------------------- GREEN mode -- */

type ModeReport = {
  label: string;
  run_id: string;
  child_exit_code: number | null;
  assertions: Record<string, boolean>;
  failures: string[];
};

/** The forced-stall proof: adapter hangs its (real) stop confirmation. */
// fallow-ignore-next-line complexity
async function runForcedStallChild(): Promise<ModeReport> {
  const runId = `FIX-ORI-RN-004-3-STALL-${Date.now()}`;
  const adapterDir = join(TASK_TMP, `adapter-stall-${Date.now()}`);
  mkdirSync(adapterDir, { recursive: true });
  assertPortFreeOrFail('forced-stall');
  const config: ChildRunConfig = { runId, platforms: ['web'], adapterDir, hangStop: true };
  const { outcome } = spawnChildRun(config, WATCHDOG_WEB_MS);
  const finalOutcome = await outcome;
  await waitForPortFree(BACKEND_PORT, 15_000);

  const failures: string[] = [];
  const assertions: Record<string, boolean> = {};
  const entries = readHeartbeats(runId);
  const stopStart = entries.find((entry) => entry.step === 'backend/stop/start');
  const stopStalled = entries.find((entry) => entry.step === 'backend/stop/stalled');

  assertions.child_exited_nonzero = finalOutcome.code !== null && finalOutcome.code !== 0;
  assertions.stop_stalled_diagnostic_fired = stopStalled !== undefined;
  if (stopStart !== undefined && stopStalled !== undefined) {
    const elapsed = Date.parse(stopStalled.ts) - Date.parse(stopStart.ts);
    assertions.stall_bounded_within_120s =
      elapsed >= 0 && elapsed <= 120_000 + STALL_DIAGNOSTIC_TOLERANCE_MS;
    assertions.diagnostic_names_step_port_bound_last_heartbeat =
      stopStalled.detail?.includes('step=backend/stop') === true &&
      stopStalled.detail?.includes('port=4000') === true &&
      stopStalled.detail?.includes('boundMs=120000') === true &&
      stopStalled.detail?.includes('lastHeartbeat=') === true;
    if (!assertions.stall_bounded_within_120s) {
      failures.push(`forced stall not bounded within 120 s (observed ${elapsed} ms)`);
    }
    if (!assertions.diagnostic_names_step_port_bound_last_heartbeat) {
      failures.push(`stall diagnostic missing named values: ${stopStalled.detail ?? '(none)'}`);
    }
  } else {
    failures.push(
      `expected backend/stop/start + backend/stop/stalled heartbeats, observed steps: ${entries
        .map((entry) => entry.step)
        .join(', ')}`,
    );
  }
  const manifest = readManifest();
  assertions.manifest_still_written = manifest !== null && manifest.run_id === runId;
  if (!assertions.manifest_still_written) {
    failures.push('manifest not written for the forced-stall run (fail-fast must not be a crash)');
  }
  const commands = parseCommandFile(adapterFiles(adapterDir).cmd);
  assertions.adapter_stop_commanded = commands.some((c) => c.op === 'stop');
  assertions.no_watchdog_fire = !finalOutcome.watchdog_fired;
  for (const [name, ok] of Object.entries(assertions)) {
    if (!ok)
      failures.push(
        `${name} failed (child exit ${finalOutcome.code}, signal ${finalOutcome.signal})`,
      );
  }

  return {
    label: 'forced-stall',
    run_id: runId,
    child_exit_code: finalOutcome.code,
    assertions,
    failures,
  };
}

/** The GREEN caller-handle web leg through the adapter, with the abort probe. */
// fallow-ignore-next-line complexity
async function runGreenWebChild(): Promise<{
  report: ModeReport;
  runId: string;
  childResult: ChildResult | null;
  heartbeat: HeartbeatEntry[];
}> {
  const runId = `FIX-ORI-RN-004-3-GREEN-${Date.now()}`;
  const adapterDir = join(TASK_TMP, `adapter-green-${Date.now()}`);
  mkdirSync(adapterDir, { recursive: true });
  assertPortFreeOrFail('green');
  const config: ChildRunConfig = { runId, platforms: ['web'], adapterDir, abortInject: true };
  const { outcome } = spawnChildRun(config, WATCHDOG_WEB_MS);
  const finalOutcome = await outcome;
  await waitForPortFree(BACKEND_PORT, 15_000);

  const failures: string[] = [];
  const assertions: Record<string, boolean> = {};
  const childResult = readChildResult(adapterDir);
  const entries = readHeartbeats(runId);

  const commands = parseCommandFile(adapterFiles(adapterDir).cmd);
  assertions.adapter_stop_commanded = commands.some((c) => c.op === 'stop');
  assertions.adapter_restart_commanded = commands.some((c) => c.op === 'restart');

  const idxStopStart = entries.findIndex((entry) => entry.step === 'backend/stop/start');
  const idxStopDone = entries.findIndex((entry) => entry.step === 'backend/stop/done');
  const idxSegment = entries.findIndex((entry) => entry.step.startsWith('web/endpoint-loss/'));
  const idxRestarted = entries.findIndex((entry) => entry.step === 'backend/restarted');
  assertions.heartbeat_stop_start_present = idxStopStart !== -1;
  assertions.heartbeat_stop_done_present = idxStopDone !== -1;
  assertions.heartbeat_segment_entries_present = idxSegment !== -1;
  assertions.heartbeat_backend_restarted_present = idxRestarted !== -1;
  assertions.heartbeat_chain_ordered =
    idxStopStart !== -1 &&
    idxStopStart < idxStopDone &&
    idxStopDone < idxSegment &&
    idxSegment < idxRestarted;
  assertions.heartbeat_timestamps_ordered = timestampsOrdered(entries);
  const windowEntries = entries.slice(
    idxStopStart !== -1 ? idxStopStart : 0,
    idxRestarted !== -1 ? idxRestarted + 1 : entries.length,
  );
  assertions.heartbeat_window_entry_count_gte_3 = windowEntries.length >= 3;
  let maxGapMs = 0;
  for (let i = 1; i < windowEntries.length; i += 1) {
    maxGapMs = Math.max(
      maxGapMs,
      Date.parse(windowEntries[i].ts) - Date.parse(windowEntries[i - 1].ts),
    );
  }
  assertions.heartbeat_no_silent_gap_over_bound = maxGapMs <= 130_000;

  const manifest = readManifest();
  const manifestLegs = (manifest?.legs ?? []) as { platform: string; status: string }[];
  const webLeg = manifestLegs.find((leg) => leg.platform === 'web');
  assertions.manifest_run_id_matches = manifest !== null && manifest.run_id === runId;
  assertions.manifest_web_leg_passed = webLeg !== undefined && webLeg.status === 'passed';

  const correlation = readCorrelation();
  const records = correlation?.backend_records ?? [];
  assertions.correlation_run_id_matches = correlation !== null && correlation.run_id === runId;
  assertions.correlation_records =
    records.length >= 4 &&
    records.filter((r) => r.outcome === 'completed').length >= 3 &&
    records.filter((r) => r.outcome === 'aborted').length >= 1;
  assertions.child_exit_zero = finalOutcome.code === 0;
  assertions.child_result_backend_not_null = childResult?.options_backend_not_null === true;
  assertions.abort_probe_recorded = childResult?.abort_probe?.aborted_record === true;
  assertions.no_watchdog_fire = !finalOutcome.watchdog_fired;

  for (const [name, ok] of Object.entries(assertions)) {
    if (!ok) failures.push(`${name} failed`);
  }

  return {
    report: {
      label: 'green-web-leg',
      run_id: runId,
      child_exit_code: finalOutcome.code,
      assertions,
      failures,
    },
    runId,
    childResult,
    heartbeat: entries,
  };
}

/** The full three-platform matrix through the caller handle. */
// fallow-ignore-next-line complexity
async function runMatrixChild(platforms: Platform[]): Promise<{
  report: ModeReport;
  runId: string;
  childResult: ChildResult | null;
}> {
  const runId = `FIX-ORI-RN-004-3-MATRIX-${Date.now()}`;
  const adapterDir = join(TASK_TMP, `adapter-matrix-${Date.now()}`);
  mkdirSync(adapterDir, { recursive: true });
  assertPortFreeOrFail('matrix');
  const config: ChildRunConfig = { runId, platforms, adapterDir, abortInject: true };
  const { outcome } = spawnChildRun(config, WATCHDOG_MATRIX_MS);
  const finalOutcome = await outcome;
  await waitForPortFree(BACKEND_PORT, 15_000);

  const failures: string[] = [];
  const assertions: Record<string, boolean> = {};
  const childResult = readChildResult(adapterDir);
  const entries = readHeartbeats(runId);
  const commands = parseCommandFile(adapterFiles(adapterDir).cmd);
  const manifest = readManifest();
  const manifestLegs = (manifest?.legs ?? []) as { platform: string; status: string }[];

  assertions.child_exit_zero = finalOutcome.code === 0;
  assertions.manifest_run_id_matches = manifest !== null && manifest.run_id === runId;
  assertions.all_three_platforms_passed = platforms.every((platform) =>
    manifestLegs.filter((leg) => leg.platform === platform).every((leg) => leg.status === 'passed'),
  );
  const endpointLossLegs = platforms.length; // each platform leg drives one stop->restart cycle
  assertions.adapter_restart_commands_gte_legs =
    commands.filter((c) => c.op === 'restart').length >= endpointLossLegs;
  assertions.adapter_stop_commanded = commands.some((c) => c.op === 'stop');
  assertions.heartbeat_backend_restarted_entries_gte_legs =
    entries.filter((entry) => entry.step === 'backend/restarted').length >= endpointLossLegs;
  assertions.heartbeat_timestamps_ordered = timestampsOrdered(entries);
  assertions.child_result_backend_not_null = childResult?.options_backend_not_null === true;
  assertions.no_watchdog_fire = !finalOutcome.watchdog_fired;

  for (const [name, ok] of Object.entries(assertions)) {
    if (!ok) failures.push(`${name} failed`);
  }

  return {
    report: {
      label: `matrix-${platforms.join(',')}`,
      run_id: runId,
      child_exit_code: finalOutcome.code,
      assertions,
      failures,
    },
    runId,
    childResult,
  };
}

/* ------------------------------------------------------------------ main -- */

// fallow-ignore-next-line complexity
async function main(): Promise<void> {
  const argv = process.argv.slice(2);

  const childConfigPath = argv[argv.indexOf('--child-run') + 1];
  if (argv.includes('--child-run') && childConfigPath !== undefined) {
    await childRun(childConfigPath);
    return;
  }

  const modeIndex = argv.indexOf('--mode');
  // --matrix selects the matrix mode outright (it is not a --mode value; the
  // green branch returns before the matrix branch could ever run otherwise).
  const mode = argv.includes('--matrix')
    ? 'matrix'
    : modeIndex >= 0
      ? (argv[modeIndex + 1] ?? 'green')
      : 'green';
  mkdirSync(TASK_TMP, { recursive: true });

  if (mode === 'red') {
    process.exitCode = await runRedMode();
    return;
  }

  if (mode === 'green') {
    const stall = await runForcedStallChild();
    console.log(`[forced-stall] ${JSON.stringify(stall.assertions)}`);
    if (stall.failures.length > 0) {
      console.error(`[forced-stall] failures: ${stall.failures.join('; ')}`);
    }
    const green = await runGreenWebChild();
    console.log(`[green-web-leg] ${JSON.stringify(green.report.assertions)}`);
    const allFailures = [...stall.failures, ...green.report.failures];

    const evidence = {
      command: LITERAL_COMMAND,
      harness_exit_code: allFailures.length > 0 ? 1 : 0,
      candidate_head_sha: gitHeadSha(),
      watchdog_budget_ms: WATCHDOG_WEB_MS,
      generated_at: new Date().toISOString(),
      forced_stall: stall,
      green: {
        run_id: green.runId,
        options_backend_not_null: green.childResult?.options_backend_not_null === true,
        child_exit_code: green.report.child_exit_code,
        abort_probe: green.childResult?.abort_probe ?? null,
        adapter: green.childResult?.adapter ?? null,
        assertions: green.report.assertions,
        heartbeat_slice: green.heartbeat,
        heartbeat_window_max_gap_ms: (() => {
          const idxStopStart = green.heartbeat.findIndex((e) => e.step === 'backend/stop/start');
          const idxRestarted = green.heartbeat.findIndex((e) => e.step === 'backend/restarted');
          const window = green.heartbeat.slice(
            idxStopStart !== -1 ? idxStopStart : 0,
            idxRestarted !== -1 ? idxRestarted + 1 : green.heartbeat.length,
          );
          let maxGapMs = 0;
          for (let i = 1; i < window.length; i += 1) {
            maxGapMs = Math.max(maxGapMs, Date.parse(window[i].ts) - Date.parse(window[i - 1].ts));
          }
          return maxGapMs;
        })(),
      },
      failures: allFailures,
    };
    writeFileSync(join(TASK_TMP, 'green.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    writeFileSync(
      join(TASK_TMP, 'run.json'),
      `${JSON.stringify(
        {
          command: LITERAL_COMMAND,
          candidate_head_sha: gitHeadSha(),
          generated_at: new Date().toISOString(),
          runs: [
            { label: 'forced-stall', run_id: stall.run_id, exit_code: stall.child_exit_code },
            {
              label: 'green-web-leg',
              run_id: green.runId,
              exit_code: green.report.child_exit_code,
            },
          ],
          watchdog_budgets_ms: { web: WATCHDOG_WEB_MS },
        },
        null,
        2,
      )}\n`,
    );
    console.log(JSON.stringify(evidence, null, 2));
    process.exitCode = allFailures.length > 0 ? 1 : 0;
    return;
  }

  if (mode === 'matrix') {
    const matrixIndex = argv.indexOf('--matrix');
    const platformsArg = matrixIndex >= 0 ? argv[matrixIndex + 1] : undefined;
    const platforms = (platformsArg ?? 'ios,android,web')
      .split(',')
      .map((p) => p.trim()) as Platform[];
    const missing: string[] = [];
    if (platforms.includes('ios') && (process.env.RNR_S05_IOS_UDID ?? '') === '') {
      missing.push('RNR_S05_IOS_UDID');
    }
    if (platforms.includes('android') && (process.env.RNR_S05_ANDROID_SERIAL ?? '') === '') {
      missing.push('RNR_S05_ANDROID_SERIAL');
    }
    if (missing.length > 0) {
      console.error(`matrix blocked: missing required device variables: ${missing.join(', ')}`);
      process.exitCode = 3;
      return;
    }
    const matrix = await runMatrixChild(platforms);
    console.log(`[matrix] ${JSON.stringify(matrix.report.assertions)}`);
    // Merge into the existing green.json/run.json (written by the default mode)
    // so the AC-2 web-leg record survives alongside the AC-3 matrix record.
    const mergeJson = (path: string, patch: Record<string, unknown>): Record<string, unknown> => {
      let existing: Record<string, unknown> = {};
      if (existsSync(path)) {
        try {
          existing = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
        } catch {
          existing = {};
        }
      }
      const merged = { ...existing, ...patch };
      writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
      return merged;
    };
    const evidence = mergeJson(join(TASK_TMP, 'green.json'), {
      matrix_command: `${LITERAL_COMMAND} --matrix ${platforms.join(',')}`,
      matrix_harness_exit_code: matrix.report.failures.length > 0 ? 1 : 0,
      matrix_watchdog_budget_ms: WATCHDOG_MATRIX_MS,
      matrix: {
        run_id: matrix.runId,
        platforms,
        child_exit_code: matrix.report.child_exit_code,
        options_backend_not_null: matrix.childResult?.options_backend_not_null === true,
        adapter: matrix.childResult?.adapter ?? null,
        assertions: matrix.report.assertions,
      },
      matrix_failures: matrix.report.failures,
    });
    const runBinding = mergeJson(join(TASK_TMP, 'run.json'), {});
    const priorRuns = Array.isArray(runBinding.runs)
      ? (runBinding.runs as { label: string; run_id: string; exit_code: number | null }[])
      : [];
    priorRuns.push({
      label: 'matrix',
      run_id: matrix.runId,
      exit_code: matrix.report.child_exit_code,
    });
    mergeJson(join(TASK_TMP, 'run.json'), {
      matrix_command: `${LITERAL_COMMAND} --matrix ${platforms.join(',')}`,
      runs: priorRuns,
      watchdog_budgets_ms: {
        web: WATCHDOG_WEB_MS,
        matrix: WATCHDOG_MATRIX_MS,
      },
    });
    console.log(JSON.stringify(evidence, null, 2));
    process.exitCode = matrix.report.failures.length > 0 ? 1 : 0;
    return;
  }

  console.error(`unknown mode: ${mode}`);
  process.exitCode = 2;
}

/**
 * The exported proof entry (the task's TEST_FUNCTION): runs the default mode —
 * the forced-stall proof plus the caller-handle green web leg — and records the
 * evidence under .tmp/FIX-ORI-RN-004-3/.
 */
async function runCallerBackendRestartProof(): Promise<void> {
  await main();
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  main().catch((e: unknown) => {
    console.error(e instanceof Error ? e.stack : String(e));
    process.exit(2);
  });
}

export { runCallerBackendRestartProof };
