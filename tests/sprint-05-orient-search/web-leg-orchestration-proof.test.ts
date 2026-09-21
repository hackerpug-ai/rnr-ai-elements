/**
 * FIX-ORI-RN-004-2 — the web-leg orchestration proof harness.
 *
 * Reproduces ORI-AI-002's invocation shape against the real Uniwind live-proof
 * driver, in one process, under an explicit watchdog:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/web-leg-orchestration-proof.test.ts
 *
 * Phase A (in-vitro lifecycle isolation) exercises the REAL serveWithChatProxy +
 * stopServer code from the driver over a REAL owned backend (support/live-backend.ts)
 * and a REAL provider SSE stream, holding one real open connection while the proxy
 * server close is awaited — the class of unbounded, childless await that stalled run
 * ORI-AI-002-1789929365070. Pre-fix, the close wait has no driver-side bound: it
 * completes only when the peer departs.
 *
 * Phase B (live orchestration seam) invokes the real `runLiveExampleProof` exactly as
 * ORI-AI-002's runner does: a caller-created owned-backend handle, platforms ['web'],
 * engine uniwind, a fresh run identity, and a bounded output directory — then asserts
 * the web leg completes and a fresh run-manifest.json plus provider-correlation.json
 * are written for that run identity.
 *
 * Real services only: real expo export, real same-origin chat proxy, real headless
 * Chromium, real owned backend, real OpenAI Responses. No mocks, no stubs.
 *
 * Watchdog caveat (recorded): the watchdog is an in-process timer, so it covers the
 * observed stall class (idle event loop awaiting an unresolved promise) but cannot
 * fire while a synchronous spawnSync call blocks the loop. ORI-AI-002's runner runs
 * this driver as a child process, so its outer watchdog covers that case too.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { request as httpRequest, type IncomingMessage } from 'node:http';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_MODEL, launchOwnedBackend, type OwnedBackendHandle } from './support/live-backend';
import {
  BackendSession,
  runLiveExampleProof,
  serveWithChatProxy,
  stopServer,
} from './support/live-example-proof.test';

const REPO_ROOT = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DRIVER_EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-004');
const TASK_TMP = join(REPO_ROOT, '.tmp', 'FIX-ORI-RN-004-2');

const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = 4000;
/** The driver's WEB_PORT — the same-origin proxy the web leg serves on. */
const PROXY_PORT = 8406;

/** Explicit watchdog budget per leg (charter bound: <= 900 s). */
const WATCHDOG_BUDGET_MS = 900_000;
/** How long the in-vitro probe observes the close wait before declaring it unbounded. */
const IN_VITRO_OBSERVE_MS = 70_000;
/** The RED criterion: an unresolved close wait at >= 60 s is an unbounded await. */
const IN_VITRO_UNBOUNDED_THRESHOLD_MS = 60_000;

const LITERAL_COMMAND =
  'pnpm exec tsx tests/sprint-05-orient-search/web-leg-orchestration-proof.test.ts';

/** A long, compliant prompt so the real provider stream outlives the observation window. */
const PROBE_ESSAY_PROMPT =
  'Write an extremely detailed history of mathematics from Babylonian clay tablets to modern category theory. The essay must be at least 4000 words across at least twenty substantial paragraphs. Do not summarize, do not decline, and do not stop early.';

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function gitHeadSha(): string {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT, encoding: 'utf8' });
  return res.status === 0 ? res.stdout.trim() : `unknown (${res.stderr.trim()})`;
}

type HeartbeatEntry = { seq: number; ts: string; run: string; step: string; detail?: string };

function readDriverHeartbeats(): { path: string; entries: HeartbeatEntry[] } {
  const path = join(DRIVER_EVIDENCE_ROOT, 'heartbeat.log');
  if (!existsSync(path)) return { path, entries: [] };
  const entries: HeartbeatEntry[] = [];
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '') continue;
    try {
      entries.push(JSON.parse(trimmed) as HeartbeatEntry);
    } catch {
      /* skip malformed tail line */
    }
  }
  return { path, entries };
}

/* ------------------------------------------------------- phase A: in-vitro -- */

type InVitroResult = {
  serve_url: string;
  proxy_port: number;
  sse_first_chunk_ms: number | null;
  close_unresolved_after_ms: number | null;
  close_resolved_ms: number | null;
  close_resolution:
    | 'within-observation'
    | 'peer-departure'
    | 'unresolved-even-after-peer-departure';
  started_at: string;
  ended_at: string;
};

/**
 * Serves through the REAL driver proxy code, opens ONE real streaming chat request
 * through it against the REAL backend and provider, then awaits the REAL stopServer
 * while that connection's response is still streaming.
 */
async function runInVitroLifecycleProbe(backend: OwnedBackendHandle): Promise<InVitroResult> {
  const startedAt = new Date().toISOString();
  const distDir = join(TASK_TMP, 'invitro-dist');
  mkdirSync(distDir, { recursive: true });
  // The probed path is POST /api/chat (proxied upstream SSE); the static tree is
  // never read by the probe. A real file keeps the served root a real directory.
  if (!existsSync(join(distDir, 'index.html'))) {
    writeFileSync(join(distDir, 'index.html'), '<!doctype html><title>lifecycle probe</title>\n');
  }

  const session = new BackendSession(backend);
  const served = await serveWithChatProxy(distDir, PROXY_PORT, session);

  const envelope = JSON.stringify({
    id: `fix-ori-rn-004-2-invitro-${Date.now()}`,
    messages: [
      { id: 'probe-m1', role: 'user', parts: [{ type: 'text', text: PROBE_ESSAY_PROMPT }] },
    ],
  });

  const requestStartedAt = Date.now();
  let firstChunkMs: number | null = null;
  const response = await new Promise<IncomingMessage>((resolveResponse, rejectResponse) => {
    const req = httpRequest(
      {
        host: BACKEND_HOST,
        port: PROXY_PORT,
        path: '/api/chat',
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(envelope),
        },
      },
      resolveResponse,
    );
    req.on('error', rejectResponse);
    req.end(envelope);
  });
  const clientSocket = response.socket;
  await new Promise<void>((resolveStreaming) => {
    response.once('data', () => {
      firstChunkMs = Date.now() - requestStartedAt;
      resolveStreaming();
    });
    response.once('aborted', () => resolveStreaming());
    response.once('end', () => resolveStreaming());
    setTimeout(resolveStreaming, 30_000).ref();
  });

  const closeStartedAt = Date.now();
  let closeResolvedMs: number | null = null;
  const closing = stopServer(served);
  closing.then(
    () => {
      closeResolvedMs = Date.now() - closeStartedAt;
    },
    () => {
      closeResolvedMs = Date.now() - closeStartedAt;
    },
  );
  let unresolvedAfterMs: number | null = null;
  while (Date.now() - closeStartedAt < IN_VITRO_OBSERVE_MS) {
    if (closeResolvedMs !== null) break;
    await sleep(1000);
  }
  let resolution: InVitroResult['close_resolution'];
  if (closeResolvedMs !== null) {
    resolution = 'within-observation';
  } else {
    unresolvedAfterMs = Date.now() - closeStartedAt;
    // Pre-fix, close completes ONLY when the peer departs: end the probe's own
    // connection to release the run and record that fact. Post-fix the bound +
    // forced connection destruction has normally already resolved the wait.
    clientSocket.destroy();
    await Promise.race([closing.finally(() => {}), sleep(30_000)]);
    if (closeResolvedMs !== null) {
      resolution = 'peer-departure';
    } else {
      resolution = 'unresolved-even-after-peer-departure';
    }
  }

  return {
    serve_url: served.url,
    proxy_port: served.port,
    sse_first_chunk_ms: firstChunkMs,
    close_unresolved_after_ms: unresolvedAfterMs,
    close_resolved_ms: closeResolvedMs,
    close_resolution: resolution,
    started_at: startedAt,
    ended_at: new Date().toISOString(),
  };
}

/* -------------------------------------------------- phase B: live web leg -- */

type LiveSeamResult = {
  run_id: string;
  options_backend_not_null: boolean;
  web_leg_status: string | null;
  all_run_platform_legs_passed: boolean;
  manifest: {
    path: string;
    run_id_matches: boolean;
    key_set_frozen: boolean;
    web_leg_status: string | null;
    passed_platforms: number | null;
    completed_field: boolean | null;
  };
  correlation: {
    path: string;
    run_id_matches: boolean;
    record_count: number;
    completed_count: number;
    aborted_count: number;
  };
  heartbeat: {
    source_path: string;
    copied_path: string;
    run_entry_count: number;
    web_step_entry_count: number;
    timestamps_ordered: boolean;
    first_steps: string[];
    last_steps: string[];
  };
  diagnostic: string | null;
};

const FROZEN_MANIFEST_KEYS = [
  'task',
  'run_id',
  'candidate_head_sha',
  'generated_at',
  'commands',
  'source_sha',
  'backend',
  'passed_platforms',
  'completed',
  'legs',
];

// fallow-ignore-next-line complexity
async function runLiveOrchestrationSeam(
  backend: OwnedBackendHandle,
): Promise<{ result: LiveSeamResult; completed: boolean }> {
  const runId = `FIX-ORI-RN-004-2-${Date.now()}`;
  const outputDir = join(TASK_TMP, 'out', runId);
  const sourceSha = createHash('sha256')
    .update(readFileSync(join(REPO_ROOT, 'apps/example/app/live-chat.tsx'), 'utf8'))
    .digest('hex');

  const proof = await runLiveExampleProof({
    engine: 'uniwind',
    platforms: ['web'],
    runId,
    sourceSha,
    outputDir,
    backend,
  });

  const webLeg = proof.legs.find((leg) => leg.platform === 'web') ?? null;

  const manifestPath = join(DRIVER_EVIDENCE_ROOT, 'run-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
  const manifestKeys = Object.keys(manifest).sort().join(',');
  const manifestWebLeg = (manifest.legs as Array<{ platform: string; status: string }>).find(
    (leg) => leg.platform === 'web',
  );

  const correlationPath = join(DRIVER_EVIDENCE_ROOT, 'provider-correlation.json');
  const correlation = JSON.parse(readFileSync(correlationPath, 'utf8')) as {
    run_id: string;
    backend_records: Array<{ outcome: string }>;
  };

  const heartbeatSource = readDriverHeartbeats();
  const runEntries = heartbeatSource.entries.filter((entry) => entry.run === runId);
  const webEntries = runEntries.filter((entry) => entry.step.startsWith('web/'));
  const timestampsOrdered = runEntries.every(
    (entry, index) => index === 0 || Date.parse(entry.ts) >= Date.parse(runEntries[index - 1].ts),
  );
  const heartbeatCopyPath = join(TASK_TMP, 'heartbeat.log');
  writeFileSync(
    heartbeatCopyPath,
    `${runEntries.map((entry) => JSON.stringify(entry)).join('\n')}${runEntries.length > 0 ? '\n' : ''}`,
  );

  const completed = proof.legs.length > 0 && proof.legs.every((leg) => leg.status === 'passed');

  return {
    completed,
    result: {
      run_id: runId,
      options_backend_not_null: true,
      web_leg_status: webLeg?.status ?? null,
      all_run_platform_legs_passed: completed,
      manifest: {
        path: manifestPath,
        run_id_matches: manifest.run_id === runId,
        key_set_frozen: manifestKeys === FROZEN_MANIFEST_KEYS.slice().sort().join(','),
        web_leg_status: manifestWebLeg?.status ?? null,
        passed_platforms: (manifest.passed_platforms as number) ?? null,
        completed_field: (manifest.completed as boolean) ?? null,
      },
      correlation: {
        path: correlationPath,
        run_id_matches: correlation.run_id === runId,
        record_count: correlation.backend_records.length,
        completed_count: correlation.backend_records.filter((r) => r.outcome === 'completed')
          .length,
        aborted_count: correlation.backend_records.filter((r) => r.outcome === 'aborted').length,
      },
      heartbeat: {
        source_path: heartbeatSource.path,
        copied_path: heartbeatCopyPath,
        run_entry_count: runEntries.length,
        web_step_entry_count: webEntries.length,
        timestamps_ordered: timestampsOrdered,
        first_steps: runEntries.slice(0, 5).map((entry) => entry.step),
        last_steps: runEntries.slice(-5).map((entry) => entry.step),
      },
      diagnostic: webLeg?.diagnostic ?? null,
    },
  };
}

/* ------------------------------------------------------------------ main -- */

// fallow-ignore-next-line complexity
async function runWebLegOrchestrationProof(): Promise<{
  exit_code: number;
  assertions: Record<string, boolean>;
  failures: string[];
}> {
  const failures: string[] = [];
  const assertions: Record<string, boolean> = {};

  let backend: OwnedBackendHandle | null = null;
  const ownedChildren: { label: string; pid: number | null }[] = [];

  // The watchdog: bounded budget, fires on the idle-loop stall class, stops only
  // the children this harness recorded, exits nonzero with the last heartbeat.
  const watchdog = setTimeout(() => {
    const { entries } = readDriverHeartbeats();
    const last = entries[entries.length - 1];
    console.error(
      `[watchdog] budget of ${WATCHDOG_BUDGET_MS} ms exhausted — aborting. ` +
        `Last heartbeat: ${last ? `${last.ts} ${last.step}` : 'none'}`,
    );
    for (const child of ownedChildren) {
      if (child.pid !== null) {
        try {
          process.kill(child.pid, 'SIGKILL');
        } catch {
          /* already gone */
        }
      }
    }
    process.exit(70);
  }, WATCHDOG_BUDGET_MS);

  let inVitro: InVitroResult | null = null;
  let live: LiveSeamResult | null = null;
  try {
    backend = await launchOwnedBackend({
      host: BACKEND_HOST,
      port: BACKEND_PORT,
      model: DEFAULT_MODEL,
      // A generous cap keeps the probe's real essay stream alive well past the
      // observation window and gives the live leg's Stop control a comfortable
      // mid-stream window.
      maxOutputTokens: 16384,
    });
    ownedChildren.push({ label: 'owned-backend', pid: backend.pid });
    if (!backend.started) {
      throw new Error(`owned backend did not start: ${backend.stderrText().slice(-2000)}`);
    }

    inVitro = await runInVitroLifecycleProbe(backend);
    console.log(`[phase-a] in-vitro lifecycle probe: ${JSON.stringify(inVitro)}`);

    const liveRun = await runLiveOrchestrationSeam(backend);
    live = liveRun.result;
    console.log(`[phase-b] live orchestration seam: ${JSON.stringify(live)}`);

    // AC-1: the in-vitro close wait is bounded by the driver (or demonstrated unbounded pre-fix).
    assertions.in_vitro_close_bounded =
      inVitro.close_unresolved_after_ms === null &&
      inVitro.close_resolved_ms !== null &&
      inVitro.close_resolved_ms <= 120_000;
    if (!assertions.in_vitro_close_bounded) {
      failures.push(
        `in-vitro proxy close wait unbounded: unresolved after ${inVitro.close_unresolved_after_ms} ms ` +
          `(threshold ${IN_VITRO_UNBOUNDED_THRESHOLD_MS} ms) — the pre-fix stopServer awaits ` +
          `server.close() with no bound on port ${PROXY_PORT}; it completes only when the peer departs`,
      );
    }

    // AC-2: the web leg completes under the orchestration seam.
    assertions.web_leg_passed = live.web_leg_status === 'passed';
    assertions.all_run_platform_legs_passed = live.all_run_platform_legs_passed;
    assertions.manifest_fresh_for_run = live.manifest.run_id_matches;
    assertions.manifest_key_set_frozen = live.manifest.key_set_frozen;
    assertions.correlation_fresh_for_run = live.correlation.run_id_matches;
    assertions.correlation_records =
      live.correlation.record_count >= 4 &&
      live.correlation.completed_count >= 3 &&
      live.correlation.aborted_count >= 1;
    for (const [name, ok] of Object.entries({
      web_leg_passed: assertions.web_leg_passed,
      all_run_platform_legs_passed: assertions.all_run_platform_legs_passed,
      manifest_fresh_for_run: assertions.manifest_fresh_for_run,
      manifest_key_set_frozen: assertions.manifest_key_set_frozen,
      correlation_fresh_for_run: assertions.correlation_fresh_for_run,
      correlation_records: assertions.correlation_records,
    })) {
      if (!ok) failures.push(`${name} failed (observed: ${JSON.stringify(live)})`);
    }

    // AC-1: heartbeat coverage — >= 8 ordered web-leg entries emitted by the driver.
    assertions.heartbeat_at_least_8_ordered =
      live.heartbeat.web_step_entry_count >= 8 && live.heartbeat.timestamps_ordered;
    if (!assertions.heartbeat_at_least_8_ordered) {
      failures.push(
        `heartbeat coverage insufficient: ${live.heartbeat.web_step_entry_count} web entries, ` +
          `ordered=${live.heartbeat.timestamps_ordered} (need >= 8 ordered, emitted by the running driver)`,
      );
    }
  } finally {
    // Stop only the children this harness recorded (the caller-owned backend).
    // The driver stops every handle it spawned itself (its restart children).
    if (backend !== null) {
      await backend.stop();
    }
    clearTimeout(watchdog);
  }

  const exitCode = failures.length > 0 ? 1 : 0;

  const evidence = {
    command: LITERAL_COMMAND,
    candidate_head_sha: gitHeadSha(),
    watchdog_budget_ms: WATCHDOG_BUDGET_MS,
    in_vitro_unbounded_threshold_ms: IN_VITRO_UNBOUNDED_THRESHOLD_MS,
    generated_at: new Date().toISOString(),
    assertions,
    failures,
    in_vitro: inVitro,
    live,
    expected_exit_code: exitCode,
  };
  mkdirSync(TASK_TMP, { recursive: true });
  writeFileSync(join(TASK_TMP, 'harness-run.json'), `${JSON.stringify(evidence, null, 2)}\n`);

  console.log(JSON.stringify(evidence, null, 2));
  return { exit_code: exitCode, assertions, failures };
}

const isMain =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isMain) {
  runWebLegOrchestrationProof()
    .then((outcome) => {
      process.exitCode = outcome.exit_code;
    })
    .catch((e: unknown) => {
      console.error(e instanceof Error ? e.stack : String(e));
      process.exitCode = 2;
    });
}

export { runWebLegOrchestrationProof };
