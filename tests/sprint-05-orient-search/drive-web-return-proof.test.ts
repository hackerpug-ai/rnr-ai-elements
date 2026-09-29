/**
 * FIX-ORI-RN-003-3 — driveWeb must fulfill on the real quickstart web legs.
 *
 * CLI (real export, serve, and Chromium — never under vitest):
 *   pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
 *   pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
 *
 * Diagnostic mode runs the unchanged uniwind baseline and disconnected serves.
 * The default mode runs nativewind seed, then uniwind baseline, disconnected, and restored.
 * The vitest guard only reads source. It does not launch a browser or export.
 */

import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  type Dirent,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Browser } from '@playwright/test';
import { describe, expect, it } from 'vitest';

import {
  type ConsumerReceipt,
  cleanupConsumer,
  type Engine,
  prepareConsumer,
  REPO_ROOT,
  run,
  sha256,
} from './support/quickstart-consumer';
import {
  driveWeb,
  exportWeb,
  launchChromium,
  OLDER_SEED,
  serveExport,
  stopServe,
  type WebExportReceipt,
  type WebLegResult,
  type WebServeHandle,
} from './support/quickstart-web';

const WATCHDOG_MS = 180_000;
const GREEN_BUDGET_MS = 150 * 60_000;
const NEWEST_SEED = 'Seed turn 24: Ready for your message.';
const SUBMIT_CALLBACK = 'onSubmit={handleSubmit}';
const DISCONNECTED_CALLBACK = 'onSubmit={() => {}}';
const TASK = 'FIX-ORI-RN-003-3';
const DISPOSITION = 'not_reproduced_no_driver_change';
const TASK_DIFF_BASE_SHA = '09123090d57f7747ac3760055a5932392b598351';
const TASK_DIFF_BASE_TREE_SHA = '770221ce4b3808fb1850206448b37ada5fdd748e';
const EXPECTED_DRIVER_SHA = '69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33';
const HISTORICAL_RED_SHA = 'fb844da4c2ecb882656f3fd2c987bf02a243ef7f31000b9fb08de35c603b6745';
const CYCLE_2_RED_SHA = 'f09d5bb8dc4138b1cb0900f32eb086c2989c0bdb423cc63ed4a77e8fb994a4e8';
const SHARED_FILES = ['quickstart-screen.tsx', 'quickstart-messages.ts'] as const;
const CHECK_ASSIGNMENTS = [
  'result.seedVisible',
  'result.olderSeedReached',
  'result.inputCleared',
  'result.markerVisible',
  'result.markerSubmitted',
] as const;
const ALLOWED = new Set([
  'tests/sprint-05-orient-search/support/quickstart-web.ts',
  'tests/sprint-05-orient-search/drive-web-return-proof.test.ts',
  'tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt',
  'tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt',
  '.tmp/FIX-ORI-RN-003-3/green.json',
  '.tmp/FIX-ORI-RN-003-3/run.json',
]);
const PRESERVED_HISTORICAL = new Set([
  '.tmp/FIX-ORI-RN-003-3/red.json',
  '.tmp/FIX-ORI-RN-003-3/cycle-2/red.json',
]);

type WebBooleans = {
  seedVisible: boolean;
  olderSeedReached: boolean;
  markerVisible: boolean;
  inputCleared: boolean;
  markerSubmitted: boolean;
};

type LegRecord = {
  phase: string;
  engine: Engine;
  marker: string;
  serve_url: string;
  port: number;
  exportExit: number;
  settled_before_close: boolean;
  settled_before_harness_cleanup: boolean;
  elapsed_ms: number;
  started_at: string;
  settled_at: string | null;
  harness_cleanup_started_at: string | null;
  harness_cleanup_finished_at: string | null;
  promise_outcome: 'pending' | 'fulfilled' | 'rejected';
  browser_connected_at_observe: boolean;
  page_open_at_observe: boolean;
  harness_closed_browser_before_settle: boolean;
  booleans: WebBooleans | null;
  drive_error: string | null;
  seed_text: string;
  older_seed: string;
};

type LegCore = {
  settled_before_close: boolean;
  settled_before_harness_cleanup: boolean;
  elapsed_ms: number;
  started_at: string;
  settled_at: string | null;
  promise_outcome: 'pending' | 'fulfilled' | 'rejected';
  browser_connected_at_observe: boolean;
  page_open_at_observe: boolean;
  booleans: WebBooleans | null;
  drive_error: string | null;
};

type Watch = {
  started: number;
  startedAt: string;
  settled: boolean;
  settledAt: string | null;
  outcome: 'pending' | 'fulfilled' | 'rejected';
  result?: WebLegResult;
  rejection?: string;
  elapsed: () => number;
};

type HashNote = {
  originalSha: string;
  mutatedSha: string;
  restoredSha: string;
  onlyCallback: boolean;
};

let markerSeq = 0;

function cycleDir(): string {
  return join(REPO_ROOT, '.tmp', TASK);
}

function driveWebPath(): string {
  return join(REPO_ROOT, 'tests/sprint-05-orient-search/support/quickstart-web.ts');
}

function harnessPath(): string {
  return fileURLToPath(import.meta.url);
}

function envHygiene(): void {
  delete process.env.NODE_ENV;
  const scratch = join(tmpdir(), 'fix-ori-rn-003-3-scratch');
  mkdirSync(scratch, { recursive: true });
  if (!existsSync(scratch)) throw new Error(`scratch root unavailable: ${scratch}`);
  process.env.TMPDIR = scratch;
}

function gitHead(): string {
  const res = run('git rev-parse HEAD', REPO_ROOT, 30_000);
  if (res.exit !== 0) return 'unknown';
  return res.output.trim();
}

function gitValue(args: string[], label: string): string {
  const res = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (res.status !== 0) throw new Error(`${label} failed: ${res.stderr.trim()}`);
  return res.stdout.trim();
}

function assertTaskDiffBase(candidate = 'HEAD'): void {
  const tree = gitValue(['rev-parse', `${TASK_DIFF_BASE_SHA}^{tree}`], 'task diff base');
  if (tree !== TASK_DIFF_BASE_TREE_SHA) throw new Error(`task diff base tree changed: ${tree}`);
  const ancestor = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', TASK_DIFF_BASE_SHA, candidate],
    { cwd: REPO_ROOT },
  );
  if (ancestor.status !== 0) throw new Error(`task diff base is not an ancestor of ${candidate}`);
}

function lines(value: string): string[] {
  return value.split('\n').filter((line) => line.length > 0);
}

function committedTaskPaths(candidate = 'HEAD'): string[] {
  return lines(
    gitValue(
      ['diff', '--name-only', `${TASK_DIFF_BASE_SHA}...${candidate}`],
      'committed task diff',
    ),
  );
}

function uniqueSorted(paths: string[]): string[] {
  return [...new Set(paths)].sort();
}

function preservedHistoricalPaths(paths: string[]): string[] {
  return paths.filter((path) => PRESERVED_HISTORICAL.has(path));
}

function logPhase(phase: string): void {
  console.log(`[drive-web] ${phase} ${new Date().toISOString()}`);
}

function markerFor(label: string): string {
  markerSeq += 1;
  return `${TASK} ${label} ${markerSeq} ${Date.now()}`;
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function asRecord(parsed: unknown): Record<string, unknown> {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  return parsed as Record<string, unknown>;
}

function objectJson(text: string): Record<string, unknown> {
  try {
    return asRecord(JSON.parse(text));
  } catch {
    return {};
  }
}

function readJson(path: string): Record<string, unknown> {
  if (!existsSync(path)) return {};
  return objectJson(readFileSync(path, 'utf8'));
}

function fileSha(path: string): string {
  return sha256(readFileSync(path, 'utf8'));
}

function sourceHashes(): Record<string, string> {
  return {
    drive_web_sha256: fileSha(driveWebPath()),
    proof_harness_sha256: fileSha(harnessPath()),
  };
}

function historicalHashes(): Record<string, string> {
  return {
    red_json_sha256: fileSha(join(cycleDir(), 'red.json')),
    cycle_2_red_json_sha256: fileSha(join(cycleDir(), 'cycle-2/red.json')),
  };
}

function historicalReceiptAudit(paths: string[]): Record<string, unknown> {
  return {
    paths: preservedHistoricalPaths(paths),
    treatment: 'immutable provenance inherited from earlier cycles; excluded from current writes',
    actual_hashes: historicalHashes(),
    expected_hashes: {
      red_json_sha256: HISTORICAL_RED_SHA,
      cycle_2_red_json_sha256: CYCLE_2_RED_SHA,
    },
  };
}

function stringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))
    throw new Error(`${label} is not a string array`);
  return value as string[];
}

function assertSamePaths(actual: string[], expected: string[], label: string): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return;
  throw new Error(`${label} changed: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
}

function recordedTaskDiffAudit(): Record<string, unknown> {
  return asRecord(readJson(join(cycleDir(), 'run.json')).task_diff_audit);
}

function assertRecordedTaskDiffAudit(): void {
  const audit = recordedTaskDiffAudit();
  if (audit.immutable_base_sha !== TASK_DIFF_BASE_SHA) throw new Error('recorded base sha changed');
  if (audit.immutable_base_tree_sha !== TASK_DIFF_BASE_TREE_SHA)
    throw new Error('recorded base tree changed');
  const executed = String(audit.executed_head_sha ?? '');
  assertTaskDiffBase(executed);
  const committed = committedTaskPaths(executed);
  const recordedCommitted = stringArray(
    audit.committed_paths_since_base,
    'recorded committed paths',
  );
  assertSamePaths(committed, recordedCommitted, 'recorded committed paths');
  const dirty = stringArray(audit.dirty_and_untracked_paths, 'recorded worktree paths');
  const relevant = uniqueSorted([...committed, ...dirty]);
  const recordedRelevant = stringArray(audit.relevant_paths, 'recorded relevant paths');
  assertSamePaths(relevant, recordedRelevant, 'recorded relevant paths');
  const currentScope = relevant.filter((path) => !PRESERVED_HISTORICAL.has(path));
  const outside = outsideAllowlist(currentScope);
  if (outside.length > 0)
    throw new Error(`recorded paths outside allowlist: ${outside.join(', ')}`);
}

function assertCurrentExecutableHashes(): void {
  const recorded = asRecord(readJson(join(cycleDir(), 'run.json')).source_hashes);
  const current = sourceHashes();
  if (recorded.drive_web_sha256 !== current.drive_web_sha256)
    throw new Error('current driver differs from executed evidence');
  if (recorded.proof_harness_sha256 !== current.proof_harness_sha256)
    throw new Error('current harness differs from executed evidence');
}

function laterMainPathsOutsideTaskScope(): string[] {
  assertTaskDiffBase('main');
  const currentScope = committedTaskPaths('main').filter((path) => !PRESERVED_HISTORICAL.has(path));
  return outsideAllowlist(currentScope);
}

function taskDiffAudit(): Record<string, unknown> {
  assertTaskDiffBase();
  const committed = committedTaskPaths();
  const worktree = porcelainPaths();
  const relevant = uniqueSorted([...committed, ...worktree]);
  const currentScope = relevant.filter((path) => !PRESERVED_HISTORICAL.has(path));
  const outside = outsideAllowlist(currentScope);
  const head = gitHead();
  return {
    immutable_base_sha: TASK_DIFF_BASE_SHA,
    immutable_base_tree_sha: TASK_DIFF_BASE_TREE_SHA,
    executed_head_sha: head,
    executed_head_tree_sha: gitValue(['rev-parse', `${head}^{tree}`], 'executed head tree'),
    committed_paths_since_base: committed,
    dirty_and_untracked_paths: worktree,
    relevant_paths: relevant,
    preserved_historical_receipts: historicalReceiptAudit(relevant),
    scope_paths_outside_allowlist: outside.length,
    outside_allowlist_paths: outside,
  };
}

function baseRunFields(): Record<string, unknown> {
  const diffAudit = taskDiffAudit();
  return {
    task: TASK,
    execution_head_sha: gitHead(),
    disposition: DISPOSITION,
    driver_changed: fileSha(driveWebPath()) !== EXPECTED_DRIVER_SHA,
    red_evidence_claimed: false,
    hang_reproduced: false,
    downstream_live_gate_status: 'open',
    watchdog_ms: WATCHDOG_MS,
    full_matrix_budget_ms: GREEN_BUDGET_MS,
    source_hashes: sourceHashes(),
    historical_receipt_hashes: historicalHashes(),
    expected_historical_receipt_hashes: {
      red_json_sha256: HISTORICAL_RED_SHA,
      cycle_2_red_json_sha256: CYCLE_2_RED_SHA,
    },
    task_diff_audit: diffAudit,
    committed_paths_since_task_base: diffAudit.committed_paths_since_base,
    changed_and_untracked_paths: diffAudit.dirty_and_untracked_paths,
    candidate_relevant_paths: diffAudit.relevant_paths,
    scope_paths_outside_allowlist: diffAudit.scope_paths_outside_allowlist,
    outside_allowlist_paths: diffAudit.outside_allowlist_paths,
  };
}

function mergeRun(patch: Record<string, unknown>): void {
  const path = join(cycleDir(), 'run.json');
  writeJson(path, { ...readJson(path), ...baseRunFields(), ...patch });
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.stack ?? error.message;
  return String(error);
}

function assertInstalled(receipt: ConsumerReceipt): void {
  if (receipt.scriptExit === 0) return;
  throw new Error(
    `prepareConsumer scriptExit ${receipt.scriptExit}: ${receipt.installLog.slice(-2000)}`,
  );
}

function templateIndex(engine: Engine): string {
  return join(REPO_ROOT, 'packages/docs-snippets', engine, 'app/index.tsx');
}

function overlayQuickstart(engine: Engine, root: string): void {
  copyFileSync(templateIndex(engine), join(root, 'app/index.tsx'));
  mkdirSync(join(root, 'shared'), { recursive: true });
  for (const name of SHARED_FILES) {
    const src = join(REPO_ROOT, 'packages/docs-snippets/shared', name);
    copyFileSync(src, join(root, 'shared', name));
  }
}

function prepareReady(engine: Engine): ConsumerReceipt {
  logPhase(`install ${engine}`);
  let receipt: ConsumerReceipt | undefined;
  try {
    receipt = prepareConsumer(engine);
    assertInstalled(receipt);
    overlayQuickstart(engine, receipt.root);
    return receipt;
  } catch (error) {
    if (receipt) cleanupConsumer(receipt.root);
    throw error;
  }
}

function textLike(name: string): boolean {
  return /\.(js|html|json|css|txt)$/.test(name);
}

function fileHasLiteral(path: string, literal: string): boolean {
  try {
    return readFileSync(path).includes(literal);
  } catch {
    return false;
  }
}

function distHasLiteral(dir: string, literal: string): boolean {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.some((entry) => entryHasLiteral(dir, entry, literal));
}

function entryHasLiteral(dir: string, entry: Dirent, literal: string): boolean {
  const path = join(dir, entry.name);
  if (entry.isDirectory()) return distHasLiteral(path, literal);
  if (!textLike(entry.name)) return false;
  return fileHasLiteral(path, literal);
}

function assertSeedInDist(distDir: string): void {
  if (!distHasLiteral(distDir, NEWEST_SEED))
    throw new Error(`export missing newest seed in ${distDir}`);
  if (!distHasLiteral(distDir, OLDER_SEED))
    throw new Error(`export missing older seed in ${distDir}`);
}

function assertExportOk(receipt: WebExportReceipt): void {
  if (receipt.exportExit === 0) return;
  throw new Error(`exportExit ${receipt.exportExit}: ${receipt.exportLog.slice(-2500)}`);
}

function portFrom(address: string | AddressInfo | null): number {
  if (typeof address === 'object' && address) return address.port;
  throw new Error('no port');
}

function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error('free port failed')));
    server.listen(0, '127.0.0.1', () => {
      const port = portFrom(server.address());
      server.close(() => resolvePort(port));
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

function booleansOf(result: WebLegResult | undefined): WebBooleans | null {
  if (!result) return null;
  return {
    seedVisible: result.seedVisible,
    olderSeedReached: result.olderSeedReached,
    markerVisible: result.markerVisible,
    inputCleared: result.inputCleared,
    markerSubmitted: result.markerSubmitted,
  };
}

function errorOf(result: WebLegResult | undefined): string | null {
  if (!result?.error) return null;
  return result.error;
}

function startWatch(browser: Browser, url: string, marker: string): Watch {
  const started = Date.now();
  const watch: Watch = {
    started,
    startedAt: new Date(started).toISOString(),
    settled: false,
    settledAt: null,
    outcome: 'pending',
    elapsed: () => Date.now() - started,
  };
  void driveWeb(browser, url, marker, OLDER_SEED).then(
    (value) => {
      watch.settled = true;
      watch.settledAt = new Date().toISOString();
      watch.outcome = 'fulfilled';
      watch.result = value;
    },
    (error: unknown) => {
      watch.settled = true;
      watch.settledAt = new Date().toISOString();
      watch.outcome = 'rejected';
      watch.rejection = errorText(error);
    },
  );
  return watch;
}

function pageStillOpen(browser: Browser): boolean {
  return browser.contexts().some((context) => context.pages().length > 0);
}

async function waitForSettle(watch: Watch): Promise<boolean> {
  const limit = watch.started + WATCHDOG_MS;
  let nextLog = watch.started + 30_000;
  while (Date.now() < limit) {
    if (watch.settled) return true;
    if (Date.now() >= nextLog) {
      logPhase(`still waiting ${watch.elapsed()}ms`);
      nextLog += 30_000;
    }
    await sleep(200);
  }
  return watch.settled;
}

async function observeDrive(browser: Browser, url: string, marker: string): Promise<LegCore> {
  const watch = startWatch(browser, url, marker);
  const settled = await waitForSettle(watch);
  const settledBeforeCleanup = settled && browser.isConnected();
  return {
    settled_before_close: settledBeforeCleanup,
    settled_before_harness_cleanup: settledBeforeCleanup,
    elapsed_ms: watch.elapsed(),
    started_at: watch.startedAt,
    settled_at: watch.settledAt,
    promise_outcome: watch.outcome,
    browser_connected_at_observe: browser.isConnected(),
    page_open_at_observe: pageStillOpen(browser),
    booleans: booleansOf(watch.result),
    drive_error: watch.rejection ?? errorOf(watch.result),
  };
}

function tagLeg(
  core: LegCore,
  phase: string,
  engine: Engine,
  url: string,
  port: number,
  marker: string,
  exportExit: number,
): LegRecord {
  return {
    phase,
    engine,
    marker,
    serve_url: url,
    port,
    exportExit,
    settled_before_close: core.settled_before_close,
    settled_before_harness_cleanup: core.settled_before_harness_cleanup,
    elapsed_ms: core.elapsed_ms,
    started_at: core.started_at,
    settled_at: core.settled_at,
    harness_cleanup_started_at: null,
    harness_cleanup_finished_at: null,
    promise_outcome: core.promise_outcome,
    browser_connected_at_observe: core.browser_connected_at_observe,
    page_open_at_observe: core.page_open_at_observe,
    harness_closed_browser_before_settle: !core.settled_before_harness_cleanup,
    booleans: core.booleans,
    drive_error: core.drive_error,
    seed_text: NEWEST_SEED,
    older_seed: OLDER_SEED,
  };
}

async function watchServed(
  receipt: WebExportReceipt,
  phase: string,
  marker: string,
  engine: Engine,
): Promise<LegRecord> {
  const port = await freePort();
  let serve: WebServeHandle | null = null;
  let browser: Browser | null = null;
  let leg: LegRecord | undefined;
  try {
    serve = await serveExport(receipt.distDir, port);
    logPhase(`drive ${phase} ${serve.url}`);
    browser = (await launchChromium()).browser;
    const core = await observeDrive(browser, serve.url, marker);
    leg = tagLeg(core, phase, engine, serve.url, port, marker, receipt.exportExit);
  } finally {
    const cleanupStarted = new Date().toISOString();
    if (leg) leg.harness_cleanup_started_at = cleanupStarted;
    await browser?.close().catch(() => {});
    await stopServe(serve);
    if (leg) leg.harness_cleanup_finished_at = new Date().toISOString();
  }
  if (!leg) throw new Error(`missing leg record for ${phase}`);
  return leg;
}

async function exportAndWatch(
  consumer: ConsumerReceipt,
  phase: string,
  marker: string,
): Promise<LegRecord> {
  logPhase(`export ${phase}`);
  const receipt = exportWeb(consumer.engine, consumer.root);
  try {
    assertExportOk(receipt);
    assertSeedInDist(receipt.distDir);
    return await watchServed(receipt, phase, marker, consumer.engine);
  } finally {
    rmSync(receipt.distDir, { recursive: true, force: true });
  }
}

function assertHistoricalReceipts(): void {
  const actual = historicalHashes();
  if (actual.red_json_sha256 !== HISTORICAL_RED_SHA) throw new Error('historical red changed');
  if (actual.cycle_2_red_json_sha256 !== CYCLE_2_RED_SHA) throw new Error('cycle-2 red changed');
}

function assertDriverUnchanged(): void {
  const actual = fileSha(driveWebPath());
  if (actual !== EXPECTED_DRIVER_SHA) throw new Error(`driver hash changed: ${actual}`);
}

function assertDistinctMarkers(calls: LegRecord[]): void {
  const markers = calls.map((call) => call.marker);
  if (markers.some((marker) => marker.length === 0)) throw new Error('empty marker');
  if (new Set(markers).size !== markers.length) throw new Error('duplicate marker');
}

async function collectDiagnostic(
  consumer: ConsumerReceipt,
  calls: LegRecord[],
  note: HashNote,
): Promise<void> {
  const screen = screenPath(consumer.root);
  const original = readFileSync(screen, 'utf8');
  note.originalSha = sha256(original);
  const baseline = await exportAndWatch(
    consumer,
    'diagnostic-uniwind-baseline',
    markerFor('diagnostic-baseline'),
  );
  calls.push(baseline);
  assertSettled(baseline);
  assertSeed(baseline);
  const mutated = singleSwap(original);
  note.mutatedSha = sha256(mutated);
  note.onlyCallback = onlyCallbackChanged(original, mutated);
  writeFileSync(screen, mutated);
  try {
    const disconnected = await exportAndWatch(
      consumer,
      'diagnostic-uniwind-disconnected',
      markerFor('diagnostic-disconnected'),
    );
    calls.push(disconnected);
    assertSettled(disconnected);
    assertDisconnected(disconnected);
  } finally {
    writeFileSync(screen, original);
    note.restoredSha = sha256(readFileSync(screen, 'utf8'));
  }
  if (note.restoredSha !== note.originalSha) throw new Error('diagnostic restoration failed');
  assertDistinctMarkers(calls);
}

function commandReceipt(exit: number): Record<string, unknown> {
  return {
    argv: process.argv.slice(1),
    exit,
    recorded_at: new Date().toISOString(),
  };
}

async function runDiagnostic(): Promise<void> {
  envHygiene();
  assertHistoricalReceipts();
  assertDriverUnchanged();
  const started = Date.now();
  const runId = `${TASK}-diagnostic-${started}`;
  const calls: LegRecord[] = [];
  const note: HashNote = { originalSha: '', mutatedSha: '', restoredSha: '', onlyCallback: false };
  try {
    const consumer = prepareReady('uniwind');
    try {
      await collectDiagnostic(consumer, calls, note);
    } finally {
      cleanupConsumer(consumer.root);
    }
    mergeRun({
      diagnostic: {
        run_id: runId,
        exit: 0,
        elapsed_ms: Date.now() - started,
        calls,
        restoration: note,
      },
      commands: { diagnostic: commandReceipt(0) },
    });
    console.log(JSON.stringify({ diagnostic: true, run_id: runId, calls }, null, 2));
  } catch (error) {
    mergeRun({
      hang_reproduced: calls.some((call) => call.promise_outcome === 'pending'),
      diagnostic: {
        run_id: runId,
        exit: 1,
        elapsed_ms: Date.now() - started,
        calls,
        restoration: note,
        error: errorText(error),
      },
      commands: { diagnostic: commandReceipt(1) },
    });
    throw error;
  }
}

function screenPath(root: string): string {
  return join(root, 'shared/quickstart-screen.tsx');
}

function singleSwap(source: string): string {
  const hits = source.split(SUBMIT_CALLBACK).length - 1;
  if (hits !== 1) throw new Error(`expected 1 callback, saw ${hits}`);
  return source.replace(SUBMIT_CALLBACK, DISCONNECTED_CALLBACK);
}

function onlyCallbackChanged(original: string, mutated: string): boolean {
  const restored = mutated.replace(DISCONNECTED_CALLBACK, SUBMIT_CALLBACK);
  return restored === original && mutated !== original;
}

function seedPair(booleans: WebBooleans): boolean {
  return booleans.seedVisible && booleans.olderSeedReached;
}

function submittedPair(booleans: WebBooleans): boolean {
  return booleans.markerVisible && booleans.inputCleared && booleans.markerSubmitted;
}

function fiveTrue(leg: LegRecord): boolean {
  const booleans = leg.booleans;
  if (!booleans) return false;
  return seedPair(booleans) && submittedPair(booleans);
}

function hiddenMarker(booleans: WebBooleans): boolean {
  return !booleans.markerVisible;
}

function disconnectedOk(leg: LegRecord): boolean {
  const booleans = leg.booleans;
  if (!booleans) return false;
  return (
    hiddenMarker(booleans) &&
    !booleans.markerSubmitted &&
    booleans.seedVisible &&
    booleans.olderSeedReached
  );
}

function restoredOk(leg: LegRecord, note: HashNote): boolean {
  if (!fiveTrue(leg)) return false;
  if (note.restoredSha !== note.originalSha) return false;
  return note.onlyCallback;
}

function assertSettled(leg: LegRecord): void {
  if (
    leg.settled_before_harness_cleanup &&
    leg.promise_outcome === 'fulfilled' &&
    leg.elapsed_ms < WATCHDOG_MS
  )
    return;
  throw new Error(
    `invalid settlement ${leg.phase} elapsed ${leg.elapsed_ms} outcome ${leg.promise_outcome}`,
  );
}

function assertSeed(leg: LegRecord): void {
  if (fiveTrue(leg)) return;
  throw new Error(`seed booleans failed ${leg.phase} ${JSON.stringify(leg.booleans)}`);
}

function assertDisconnected(leg: LegRecord): void {
  if (disconnectedOk(leg)) return;
  throw new Error(`disconnected check failed ${JSON.stringify(leg.booleans)}`);
}

function assertRestored(leg: LegRecord, note: HashNote): void {
  if (restoredOk(leg, note)) return;
  throw new Error(`restored check failed ${JSON.stringify(leg.booleans)} ${note.restoredSha}`);
}

async function collectUniwind(
  consumer: ConsumerReceipt,
  calls: LegRecord[],
  note: HashNote,
): Promise<void> {
  const screen = screenPath(consumer.root);
  const original = readFileSync(screen, 'utf8');
  note.originalSha = sha256(original);
  const baseline = await exportAndWatch(
    consumer,
    'uniwind-baseline',
    markerFor('uniwind-baseline'),
  );
  calls.push(baseline);
  assertSettled(baseline);
  assertSeed(baseline);
  const mutated = singleSwap(original);
  note.mutatedSha = sha256(mutated);
  note.onlyCallback = onlyCallbackChanged(original, mutated);
  writeFileSync(screen, mutated);
  try {
    const disconnected = await exportAndWatch(
      consumer,
      'uniwind-disconnected',
      markerFor('uniwind-disconnected'),
    );
    calls.push(disconnected);
    assertSettled(disconnected);
    assertDisconnected(disconnected);
  } finally {
    writeFileSync(screen, original);
    note.restoredSha = sha256(readFileSync(screen, 'utf8'));
  }
  const restored = await exportAndWatch(
    consumer,
    'uniwind-restored',
    markerFor('uniwind-restored'),
  );
  calls.push(restored);
  assertSettled(restored);
  assertRestored(restored, note);
}

async function collectNative(calls: LegRecord[]): Promise<void> {
  const consumer = prepareReady('nativewind');
  try {
    const leg = await exportAndWatch(consumer, 'nativewind-seed', markerFor('nativewind-seed'));
    calls.push(leg);
    assertSettled(leg);
    assertSeed(leg);
  } finally {
    cleanupConsumer(consumer.root);
  }
}

async function collectGreen(calls: LegRecord[]): Promise<HashNote> {
  await collectNative(calls);
  const note: HashNote = { originalSha: '', mutatedSha: '', restoredSha: '', onlyCallback: false };
  const consumer = prepareReady('uniwind');
  try {
    await collectUniwind(consumer, calls, note);
  } finally {
    cleanupConsumer(consumer.root);
  }
  assertDistinctMarkers(calls);
  return note;
}

function findCall(calls: LegRecord[], phase: string): LegRecord {
  const found = calls.find((call) => call.phase === phase);
  if (!found) throw new Error(`missing ${phase}`);
  return found;
}

function withRestore(leg: LegRecord, note: HashNote): Record<string, unknown> {
  return {
    ...leg,
    original_sha256: note.originalSha,
    mutated_sha256: note.mutatedSha,
    restored_sha256: note.restoredSha,
    restored_equals_original: note.restoredSha === note.originalSha,
    only_callback_change: note.onlyCallback,
    callback_count: 1,
    from_callback: SUBMIT_CALLBACK,
    to_callback: DISCONNECTED_CALLBACK,
  };
}

function writeGreen(calls: LegRecord[], note: HashNote, elapsed: number, runId: string): void {
  writeJson(join(cycleDir(), 'green.json'), {
    task: TASK,
    mode: 'verification',
    run_id: runId,
    execution_head_sha: gitHead(),
    disposition: DISPOSITION,
    hang_reproduced: false,
    driver_changed: false,
    red_evidence_claimed: false,
    downstream_live_gate_status: 'open',
    source_hashes: sourceHashes(),
    elapsed_ms: elapsed,
    within_budget: elapsed < GREEN_BUDGET_MS,
    seed_legs: [findCall(calls, 'nativewind-seed'), findCall(calls, 'uniwind-baseline')],
    negative_control: {
      baseline: findCall(calls, 'uniwind-baseline'),
      disconnected: findCall(calls, 'uniwind-disconnected'),
      restored: withRestore(findCall(calls, 'uniwind-restored'), note),
      original_sha256: note.originalSha,
      mutated_sha256: note.mutatedSha,
      restored_sha256: note.restoredSha,
      restored_equals_original: note.restoredSha === note.originalSha,
      only_callback_change: note.onlyCallback,
      callback_count: 1,
    },
    calls,
  });
}

function assertFullMatrixBudget(elapsed: number): void {
  if (elapsed < GREEN_BUDGET_MS) return;
  throw new Error(`full matrix exceeded ${GREEN_BUDGET_MS} ms budget: ${elapsed} ms`);
}

function mergedCommands(name: string, receipt: Record<string, unknown>): Record<string, unknown> {
  const prior = asRecord(readJson(join(cycleDir(), 'run.json')).commands);
  return { ...prior, [name]: receipt };
}

async function runGreen(): Promise<void> {
  envHygiene();
  assertHistoricalReceipts();
  assertDriverUnchanged();
  const started = Date.now();
  const runId = `${TASK}-full-${started}`;
  const calls: LegRecord[] = [];
  rmSync(join(cycleDir(), 'green.json'), { force: true });
  try {
    const note = await collectGreen(calls);
    const elapsed = Date.now() - started;
    assertFullMatrixBudget(elapsed);
    writeGreen(calls, note, elapsed, runId);
    mergeRun({
      full_matrix: {
        run_id: runId,
        exit: 0,
        elapsed_ms: elapsed,
        within_budget: true,
        calls,
        restoration: note,
      },
      commands: mergedCommands('full_matrix', commandReceipt(0)),
    });
    console.log(
      JSON.stringify({ verification: true, run_id: runId, elapsed_ms: Date.now() - started }),
    );
  } catch (error) {
    const elapsed = Date.now() - started;
    mergeRun({
      hang_reproduced: calls.some((call) => call.promise_outcome === 'pending'),
      full_matrix: {
        run_id: runId,
        exit: 1,
        elapsed_ms: elapsed,
        within_budget: elapsed < GREEN_BUDGET_MS,
        error: errorText(error),
        partial_calls: calls,
      },
      commands: mergedCommands('full_matrix', commandReceipt(1)),
    });
    throw error;
  }
}

function selectedEntry(argv: string[]): boolean {
  const index = argv.indexOf('--entry');
  if (index < 0) return false;
  return argv[index + 1] === 'runDriveWebReturnProof';
}

function selectedMode(argv: string[]): 'red' | 'green' {
  const index = argv.indexOf('--mode');
  if (index < 0) return 'green';
  if (argv[index + 1] === 'red') return 'red';
  return 'green';
}

function directInvocation(argv1: string | undefined): boolean {
  if (!argv1) return false;
  return resolve(argv1) === resolve(fileURLToPath(import.meta.url));
}

function cliRequested(): boolean {
  if (!directInvocation(process.argv[1])) return false;
  return selectedEntry(process.argv);
}

async function runDriveWebReturnProof(): Promise<void> {
  if (selectedMode(process.argv) === 'red') {
    await runDiagnostic();
    return;
  }
  await runGreen();
}

if (cliRequested()) {
  void runDriveWebReturnProof().catch((error: unknown) => {
    console.error(errorText(error));
    process.exit(1);
  });
}

export { runDriveWebReturnProof };

/* ------------------------------------------------- vitest guard (no browser) */

function hasCheckAssignments(source: string): boolean {
  if (!source.includes(NEWEST_SEED)) return false;
  return CHECK_ASSIGNMENTS.every((name) => source.includes(name));
}

function pathFromPorcelain(line: string): string {
  return line.slice(3).trim();
}

function porcelainPaths(): string[] {
  const res = spawnSync('git', ['status', '--porcelain', '--untracked-files=all'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
  });
  if (res.status !== 0) return ['git-status-failed'];
  return res.stdout
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map(pathFromPorcelain);
}

function outsideAllowlist(paths: string[]): string[] {
  return paths.filter((item) => !ALLOWED.has(item));
}

if (!directInvocation(process.argv[1])) {
  describe('driveWeb bounded diagnostic', () => {
    it('driveWebActionTimeoutStaysFinite', () => {
      const source = readFileSync(driveWebPath(), 'utf8');
      expect(sha256(source)).toBe(EXPECTED_DRIVER_SHA);
      expect(hasCheckAssignments(source)).toBe(true);
      expect(WATCHDOG_MS).toBe(180_000);
      expect(() => assertFullMatrixBudget(GREEN_BUDGET_MS - 1)).not.toThrow();
      expect(() => assertFullMatrixBudget(GREEN_BUDGET_MS)).toThrow(/exceeded/);
      expect(laterMainPathsOutsideTaskScope().length).toBeGreaterThan(0);
      expect(() => assertRecordedTaskDiffAudit()).not.toThrow();
      expect(() => assertCurrentExecutableHashes()).not.toThrow();
      expect(fileSha(join(cycleDir(), 'red.json'))).toBe(HISTORICAL_RED_SHA);
      expect(fileSha(join(cycleDir(), 'cycle-2/red.json'))).toBe(CYCLE_2_RED_SHA);
      expect(directInvocation(process.argv[1])).toBe(false);
    });
  });
}
