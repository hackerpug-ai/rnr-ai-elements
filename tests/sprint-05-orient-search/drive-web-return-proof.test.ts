/**
 * FIX-ORI-RN-003-3 — driveWeb must fulfill on the real quickstart web legs.
 *
 * CLI (real export, serve, and Chromium — never under vitest):
 *   pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
 *   pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
 *
 * RED races one pre-fix driveWeb call for 180000 ms. A settle is not rewritten into a hang.
 * GREEN runs nativewind seed, then the uniwind baseline, disconnected, and restored serves.
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
} from './support/quickstart-web';

const WATCHDOG_MS = 180_000;
const GREEN_BUDGET_MS = 150 * 60_000;
const NEWEST_SEED = 'Seed turn 24: Ready for your message.';
const SUBMIT_CALLBACK = 'onSubmit={handleSubmit}';
const DISCONNECTED_CALLBACK = 'onSubmit={() => {}}';
const TASK = 'FIX-ORI-RN-003-3';
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
  elapsed_ms: number;
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
  elapsed_ms: number;
  browser_connected_at_observe: boolean;
  page_open_at_observe: boolean;
  booleans: WebBooleans | null;
  drive_error: string | null;
};

type Watch = {
  started: number;
  settled: boolean;
  result?: WebLegResult;
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

function envHygiene(): void {
  delete process.env.NODE_ENV;
  const scratch = '/tmp/fix-ori-rn-003-3-scratch';
  mkdirSync(scratch, { recursive: true });
  process.env.TMPDIR = scratch;
}

function gitHead(): string {
  const res = run('git rev-parse HEAD', REPO_ROOT, 30_000);
  if (res.exit !== 0) return 'unknown';
  return res.output.trim();
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

function mergeRun(patch: Record<string, unknown>): void {
  const path = join(cycleDir(), 'run.json');
  writeJson(path, { ...readJson(path), ...patch, task: TASK, candidate_sha: gitHead() });
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
  const receipt = prepareConsumer(engine);
  assertInstalled(receipt);
  overlayQuickstart(engine, receipt.root);
  return receipt;
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
    settled: false,
    elapsed: () => Date.now() - started,
  };
  void driveWeb(browser, url, marker, OLDER_SEED).then(
    (value) => {
      watch.settled = true;
      watch.result = value;
    },
    () => {
      watch.settled = true;
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
  return {
    settled_before_close: settled && browser.isConnected(),
    elapsed_ms: watch.elapsed(),
    browser_connected_at_observe: browser.isConnected(),
    page_open_at_observe: pageStillOpen(browser),
    booleans: booleansOf(watch.result),
    drive_error: errorOf(watch.result),
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
    elapsed_ms: core.elapsed_ms,
    browser_connected_at_observe: core.browser_connected_at_observe,
    page_open_at_observe: core.page_open_at_observe,
    harness_closed_browser_before_settle: false,
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
  const serve = await serveExport(receipt.distDir, port);
  logPhase(`drive ${phase} ${serve.url}`);
  const launched = await launchChromium();
  try {
    const core = await observeDrive(launched.browser, serve.url, marker);
    return tagLeg(core, phase, engine, serve.url, port, marker, receipt.exportExit);
  } finally {
    await launched.browser.close().catch(() => {});
    await stopServe(serve);
  }
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

function redBody(
  leg: LegRecord,
  started: number,
  prior: LegRecord | null,
): Record<string, unknown> {
  return {
    task: TASK,
    mode: 'red',
    candidate_sha: gitHead(),
    drive_web_sha256: sha256(readFileSync(driveWebPath(), 'utf8')),
    phase: leg.phase,
    serve_url: leg.serve_url,
    exportExit: leg.exportExit,
    settled_before_close: leg.settled_before_close,
    elapsed_ms: leg.elapsed_ms,
    browser_connected_at_observe: leg.browser_connected_at_observe,
    page_open_at_observe: leg.page_open_at_observe,
    harness_closed_browser_before_settle: false,
    marker: leg.marker,
    booleans: leg.booleans,
    drive_error: leg.drive_error,
    seed_text: leg.seed_text,
    older_seed: leg.older_seed,
    harness_elapsed_ms: Date.now() - started,
    prior,
    note: 'Closing the browser after the watchdog is cleanup, not a voluntary return.',
  };
}

function finishRed(leg: LegRecord, started: number, prior: LegRecord | null): void {
  const body = redBody(leg, started, prior);
  writeJson(join(cycleDir(), 'red.json'), body);
  console.log(JSON.stringify(body, null, 2));
  if (leg.settled_before_close) {
    console.error('RED_ALL_SETTLED');
    process.exitCode = 2;
    return;
  }
  console.log('RED_PENDING');
}

function assertRedAbsent(): void {
  const path = join(cycleDir(), 'red.json');
  if (!existsSync(path)) return;
  throw new Error(`red.json already recorded at ${path}; refusing to overwrite`);
}

async function redSecond(
  consumer: ConsumerReceipt,
  baseline: LegRecord,
  started: number,
): Promise<void> {
  const screen = join(consumer.root, 'shared/quickstart-screen.tsx');
  writeFileSync(screen, singleSwap(readFileSync(screen, 'utf8')));
  const disconnected = await exportAndWatch(
    consumer,
    'uniwind-disconnected',
    markerFor('red-disconnected'),
  );
  finishRed(disconnected, started, baseline);
}

async function redLegs(consumer: ConsumerReceipt, started: number): Promise<void> {
  const baseline = await exportAndWatch(consumer, 'uniwind-baseline', markerFor('red-baseline'));
  if (!baseline.settled_before_close) {
    finishRed(baseline, started, null);
    return;
  }
  await redSecond(consumer, baseline, started);
}

async function runRed(): Promise<void> {
  envHygiene();
  assertRedAbsent();
  const started = Date.now();
  const consumer = prepareReady('uniwind');
  try {
    await redLegs(consumer, started);
  } finally {
    cleanupConsumer(consumer.root);
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
  return hiddenMarker(booleans) && booleans.seedVisible && booleans.olderSeedReached;
}

function markerCleared(leg: LegRecord): boolean {
  const booleans = leg.booleans;
  if (!booleans) return false;
  return booleans.markerVisible && booleans.inputCleared;
}

function restoredOk(leg: LegRecord, note: HashNote): boolean {
  if (!markerCleared(leg)) return false;
  if (note.restoredSha !== note.originalSha) return false;
  return note.onlyCallback;
}

function assertSettled(leg: LegRecord): void {
  if (leg.settled_before_close && leg.elapsed_ms < WATCHDOG_MS) return;
  throw new Error(
    `unsettled ${leg.phase} elapsed ${leg.elapsed_ms} settled ${String(leg.settled_before_close)}`,
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
  const disconnected = await exportAndWatch(
    consumer,
    'uniwind-disconnected',
    markerFor('uniwind-disconnected'),
  );
  calls.push(disconnected);
  assertSettled(disconnected);
  assertDisconnected(disconnected);
  writeFileSync(screen, original);
  note.restoredSha = sha256(readFileSync(screen, 'utf8'));
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

function writeGreen(calls: LegRecord[], note: HashNote, started: number): void {
  const elapsed = Date.now() - started;
  writeJson(join(cycleDir(), 'green.json'), {
    task: TASK,
    mode: 'green',
    candidate_sha: gitHead(),
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

async function runGreen(): Promise<void> {
  envHygiene();
  const started = Date.now();
  const calls: LegRecord[] = [];
  try {
    const note = await collectGreen(calls);
    writeGreen(calls, note, started);
    mergeRun({
      mode: 'green',
      green_elapsed_ms: Date.now() - started,
      green_exit: 0,
      within_budget: Date.now() - started < GREEN_BUDGET_MS,
    });
    console.log(JSON.stringify({ green: true, elapsed_ms: Date.now() - started }));
  } catch (error) {
    mergeRun({
      mode: 'green',
      green_elapsed_ms: Date.now() - started,
      green_exit: 1,
      green_error: errorText(error),
      partial_calls: calls,
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
    await runRed();
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

function hasZeroTimeout(source: string): boolean {
  if (/setDefaultTimeout\(\s*0\s*\)/.test(source)) return true;
  return /timeout:\s*0\b/.test(source);
}

function timeoutInRange(item: string): boolean {
  const value = Number(item.replace(/[^\d]/g, ''));
  return value >= 10_000 && value <= 30_000;
}

function countActionTimeouts(source: string): number {
  const matches = source.match(/setDefaultTimeout\(\s*([0-9][0-9_]*)\s*\)/g);
  if (!matches) return 0;
  return matches.filter((item) => timeoutInRange(item)).length;
}

function finiteActionTimeout(source: string): number {
  if (hasZeroTimeout(source)) return 0;
  return countActionTimeouts(source);
}

function hasCheckAssignments(source: string): boolean {
  if (!source.includes(NEWEST_SEED)) return false;
  return CHECK_ASSIGNMENTS.every((name) => source.includes(name));
}

function pathFromPorcelain(line: string): string {
  return line.slice(3).trim();
}

function porcelainPaths(): string[] {
  const res = spawnSync('git', ['status', '--porcelain'], { cwd: REPO_ROOT, encoding: 'utf8' });
  if (res.status !== 0) return ['git-status-failed'];
  return res.stdout
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map(pathFromPorcelain);
}

function outsideAllowlist(paths: string[]): string[] {
  return paths.filter((item) => !ALLOWED.has(item));
}

function allowlistClean(): boolean {
  return outsideAllowlist(porcelainPaths()).length === 0;
}

if (!directInvocation(process.argv[1])) {
  describe('driveWeb action timeout', () => {
    it('driveWebActionTimeoutStaysFinite', () => {
      const source = readFileSync(driveWebPath(), 'utf8');
      expect(finiteActionTimeout(source)).toBe(1);
      expect(hasCheckAssignments(source)).toBe(true);
      expect(directInvocation(process.argv[1])).toBe(false);
      expect(allowlistClean()).toBe(true);
    });
  });
}
