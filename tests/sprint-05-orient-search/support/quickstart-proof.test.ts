/**
 * ORI-RN-003 — the executable six-target Quickstart proof.
 *
 * `runQuickstartProof` is the exported entrypoint ORI-CONT-004's locked browser flow
 * calls; the same file is the CLI the task VERIFY command runs:
 *
 *   pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts \
 *     --engines nativewind,uniwind --platforms ios,android,web
 *
 * It validates the displayed commands/source, awaits fresh execution of all six
 * engine/platform legs on REAL Expo Go (native) or a REAL served export (Web), runs the
 * callback-disconnection negative control, and aggregates a current-run `run-manifest.json`.
 *
 * Stale receipts (a prior runId), a missing matrix member, or a source-hash mismatch fail
 * with a concrete diagnostic; at five completed legs the promise stays pending and only
 * resolves after the sixth. No leg is ever skipped into a green matrix.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  type Appearance,
  type Consumer,
  canonicalHash,
  captureHierarchy,
  captureScreenshot,
  cleanupConsumerRoot,
  type Engine,
  gitHead,
  installExpoGoAndroid,
  installExpoGoIos,
  type MetroHandle,
  OLDER_SEED,
  openExpoGo,
  prepareConsumer,
  REPO_ROOT,
  readMetroLogTail,
  reserveDevices,
  runMaestroFlow,
  SEED_COUNT,
  setAppearance,
  startMetro,
  stopMetro,
} from './native-session';
import { readCommittedScript, sha256 } from './quickstart-consumer';
import {
  driveWeb,
  exportWeb,
  launchChromium,
  serveExport,
  stopServe,
  OLDER_SEED as WEB_OLDER_SEED,
} from './quickstart-web';

const EVIDENCE_ROOT = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/ORI-RN-003');
const MANIFEST_PATH = join(EVIDENCE_ROOT, 'run-manifest.json');

type Platform = 'ios' | 'android' | 'web';

type LegOutcome = {
  engine: Engine;
  platform: Platform;
  appearance?: Appearance;
  status: 'passed' | 'failed' | 'blocked';
  diagnostic?: string;
  marker?: string;
  evidence: Record<string, unknown>;
};

type ProofOptions = {
  engines: Engine[];
  platforms: Platform[];
  runId: string;
  /** SHA-256 of the displayed source, when the caller passes it from the built page. */
  sourceHash?: string;
  /** Displayed command text, when the caller passes it from the built page. */
  commands?: Record<Engine, string>;
};

type ProofResult = {
  runId: string;
  legs: LegOutcome[];
  negativeControl: Record<string, unknown>;
  manifestPath: string;
  completed: boolean;
};

/* --------------------------------------------------------- input validation -- */

function assertDisplayedSource(sourceHash?: string): void {
  const canonical = canonicalHash('quickstart-screen.tsx');
  if (sourceHash !== undefined && sourceHash !== canonical) {
    throw new Error(
      `source mismatch: displayed quickstart-screen.tsx hash ${sourceHash} != canonical ${canonical}`,
    );
  }
}

function assertDisplayedCommands(commands?: Record<Engine, string>): void {
  if (commands === undefined) return;
  for (const engine of Object.keys(commands) as Engine[]) {
    const committed = readCommittedScript(engine).trim();
    const displayed = (commands[engine] ?? '').trim();
    if (sha256(committed) !== sha256(displayed)) {
      throw new Error(
        `${engine} command mismatch: displayed recipe hash ${sha256(displayed)} != committed ${sha256(committed)}`,
      );
    }
  }
}

function assertFreshRun(runId: string): void {
  // A prior run's manifest with the same runId is stale evidence — reject it.
  try {
    const prior = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as { run_id?: string };
    if (prior.run_id === runId) {
      throw new Error(`stale runId: ${runId} already recorded in ${MANIFEST_PATH}`);
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith('stale runId')) throw e;
    // No prior manifest, or unreadable — a fresh run.
  }
}

/* -------------------------------------------------------------- marker -- */

function makeMarker(
  runId: string,
  engine: Engine,
  platform: Platform,
  appearance: Appearance | 'web',
  seq: number,
): string {
  return `ORI-RN-003:${runId}:${engine}:${platform}:${appearance}:${seq}`;
}

/* ---------------------------------------------------------- native leg -- */

function makeOutcome(
  engine: Engine,
  platform: 'ios' | 'android',
  appearance: Appearance,
  marker: string,
  passed: boolean,
  flow: { exit: number; output: string },
  metroLogTail: string,
  screenshotPath: string,
  hierarchy: string,
): LegOutcome {
  const hierarchyHasComposer =
    hierarchy.includes('Message What would you like to know?') || hierarchy.includes('Message');
  return {
    engine,
    platform,
    appearance,
    status: passed ? 'passed' : 'failed',
    diagnostic: passed
      ? undefined
      : `${flow.output.slice(-3000)}\n--- metro log ---\n${metroLogTail}`,
    marker,
    evidence: {
      marker,
      older_seed: OLDER_SEED,
      seed_count: SEED_COUNT,
      maestro_exit: flow.exit,
      maestro_output: flow.output.slice(-4000),
      metro_log: metroLogTail,
      screenshot: screenshotPath,
      hierarchy: hierarchy.slice(0, 4000),
      hierarchy_has_marker: hierarchy.includes(marker),
      composer_visible: hierarchyHasComposer,
      // The flow dismisses one known dev-only LogBox toast before composing. Record it.
      dev_error_toast_dismissed: /Tap on "Dismiss"\.\.\. COMPLETED/.test(flow.output),
    },
  };
}

async function runNativeAppearance(
  engine: Engine,
  platform: 'ios' | 'android',
  appearance: Appearance,
  metro: MetroHandle,
  deviceId: string,
  runId: string,
  sequence: number,
): Promise<LegOutcome> {
  const marker = makeMarker(runId, engine, platform, appearance, sequence);
  const legDir = join(EVIDENCE_ROOT, engine, platform, appearance);
  mkdirSync(legDir, { recursive: true });

  try {
    setAppearance(platform, deviceId, appearance);
    openExpoGo(platform, deviceId, metro.openUrl);

    const flow = runMaestroFlow(deviceId, marker, OLDER_SEED);
    const screenshotPath = join(legDir, 'screenshot.png');
    captureScreenshot(platform, deviceId, screenshotPath);
    const hierarchy = captureHierarchy(deviceId);

    return makeOutcome(
      engine,
      platform,
      appearance,
      marker,
      flow.exit === 0,
      flow,
      readMetroLogTail(metro.logPath),
      screenshotPath,
      hierarchy,
    );
  } catch (e) {
    return {
      engine,
      platform,
      appearance,
      status: 'failed',
      diagnostic: e instanceof Error ? e.message : String(e),
      marker,
      evidence: {
        marker,
        older_seed: OLDER_SEED,
        error: e instanceof Error ? e.stack : String(e),
      },
    };
  }
}

async function runNativeLeg(
  engine: Engine,
  platform: 'ios' | 'android',
  metro: MetroHandle,
  reservation: { id: string },
  runId: string,
): Promise<LegOutcome[]> {
  const outcomes: LegOutcome[] = [];
  for (const appearance of ['light', 'dark'] as Appearance[]) {
    outcomes.push(
      await runNativeAppearance(
        engine,
        platform,
        appearance,
        metro,
        reservation.id,
        runId,
        outcomes.length + 1,
      ),
    );
  }
  return outcomes;
}

/* ------------------------------------------------------------- web leg -- */

async function runWebLeg(engine: Engine, consumer: Consumer, runId: string): Promise<LegOutcome> {
  const legDir = join(EVIDENCE_ROOT, engine, 'web');
  mkdirSync(legDir, { recursive: true });
  const marker = makeMarker(runId, engine, 'web', 'web', 1);

  const exportReceipt = exportWeb(engine, consumer.root);
  if (exportReceipt.exportExit !== 0) {
    return {
      engine,
      platform: 'web',
      status: 'blocked',
      diagnostic: `expo export --platform web failed:\n${exportReceipt.exportLog.slice(-3000)}`,
      marker,
      evidence: {
        marker,
        export_exit: exportReceipt.exportExit,
        export_log: exportReceipt.exportLog.slice(-4000),
      },
    };
  }

  const port = 8400 + (engine === 'nativewind' ? 1 : 2);
  const serve = await serveExport(exportReceipt.distDir, port);
  try {
    const { browser } = await launchChromium();
    try {
      const result = await driveWeb(browser, serve.url, marker, WEB_OLDER_SEED);
      const passed =
        result.seedVisible &&
        result.olderSeedReached &&
        result.markerVisible &&
        result.inputCleared;
      return {
        engine,
        platform: 'web',
        status: passed ? 'passed' : 'failed',
        diagnostic: passed ? undefined : JSON.stringify(result),
        marker,
        evidence: {
          marker,
          older_seed: WEB_OLDER_SEED,
          seed_count: SEED_COUNT,
          url: serve.url,
          drive_result: result,
        },
      };
    } finally {
      await browser.close().catch(() => {});
    }
  } finally {
    await stopServe(serve);
  }
}

/* ------------------------------------------------------ negative control -- */

/**
 * AC-4: a separate disposable consumer whose ONLY mutation disconnects the submission
 * callback. A normal submission passes; the disconnected callback fails the real
 * new-message assertion (marker count 0); restoring the exact source bytes passes again.
 * Runs on Web (the fastest real leg) and mutates only the disposable consumer.
 */
async function runNegativeControl(
  runId: string,
  engine: Engine = 'uniwind',
): Promise<Record<string, unknown>> {
  const dir = join(EVIDENCE_ROOT, 'submission-negative-control');
  mkdirSync(dir, { recursive: true });

  const consumer = prepareConsumer(engine);
  const screenPath = join(consumer.root, 'shared', 'quickstart-screen.tsx');
  const original = readFileSyncScreen(screenPath);
  const originalHash = sha256(original);

  try {
    // 1. Normal submission (baseline).
    const baseline = await webSubmit(consumer, `${runId}:baseline`);

    // 2. Disconnect ONLY the submission callback.
    const mutated = original.replace('onSubmit={handleSubmit}', 'onSubmit={() => {}}');
    if (mutated === original)
      throw new Error('mutation did not change the source — callback marker not found');
    writeFileSync(screenPath, mutated);
    const mutatedHash = sha256(mutated);
    const disconnected = await webSubmit(consumer, `${runId}:disconnected`);

    // 3. Restore exact bytes and repeat.
    writeFileSync(screenPath, original);
    const restoredHash = sha256(original);
    const restored = await webSubmit(consumer, `${runId}:restored`);

    const evidence = {
      engine,
      run_id: runId,
      original_hash: originalHash,
      mutated_hash: mutatedHash,
      restored_hash: restoredHash,
      mutation_diff_only_callback:
        original.includes('onSubmit={handleSubmit}') && mutated.includes('onSubmit={() => {}}'),
      baseline_submission_passed: baseline.markerVisible,
      disconnected_marker_visible: disconnected.markerVisible,
      disconnected_failed_assertion: !disconnected.markerVisible,
      restored_marker_visible: restored.markerVisible,
      restored_equals_original: restoredHash === originalHash,
    };
    writeFileSync(join(dir, 'negative-control.json'), `${JSON.stringify(evidence, null, 2)}\n`);
    return evidence;
  } finally {
    cleanupConsumerRoot(consumer.root);
  }
}

function readFileSyncScreen(p: string): string {
  return readFileSync(p, 'utf8');
}

async function webSubmit(
  consumer: Consumer,
  tag: string,
): Promise<{ markerVisible: boolean; inputCleared: boolean; marker: string }> {
  const marker = `${tag}`;
  const exportReceipt = exportWeb(consumer.engine, consumer.root);
  if (exportReceipt.exportExit !== 0) {
    return { markerVisible: false, inputCleared: false, marker };
  }
  const serve = await serveExport(exportReceipt.distDir, 8500 + Math.floor(Math.random() * 400));
  try {
    const { browser } = await launchChromium();
    try {
      const result = await driveWeb(browser, serve.url, marker, WEB_OLDER_SEED);
      return { markerVisible: result.markerVisible, inputCleared: result.inputCleared, marker };
    } finally {
      await browser.close().catch(() => {});
    }
  } finally {
    await stopServe(serve);
  }
}

/* ------------------------------------------------------------ orchestrator -- */

function validateProofOptions(options: ProofOptions): void {
  assertFreshRun(options.runId);
  assertDisplayedSource(options.sourceHash);
  assertDisplayedCommands(options.commands);
  if (options.engines.length !== 2 || options.platforms.length !== 3) {
    throw new Error(
      `the proof requires the full matrix (nativewind,uniwind × ios,android,web); received engines=[${options.engines.join(',')}] platforms=[${options.platforms.join(',')}]`,
    );
  }
}

async function prepareInfrastructure(engines: Engine[], platforms: Platform[]) {
  const consumers = new Map<Engine, Consumer>();
  const metros = new Map<Engine, MetroHandle>();
  const reservations =
    platforms.includes('ios') || platforms.includes('android') ? reserveDevices() : null;

  if (reservations) {
    installExpoGoIos(reservations.ios.id);
    installExpoGoAndroid(
      reservations.android.id,
      join(
        process.env.HOME ?? '',
        '.cache',
        'agent-scratch',
        'opencode',
        'ori-rn-003',
        'Expo-Go-57.0.9.apk',
      ),
    );
  }

  for (const engine of engines) {
    const consumer = prepareConsumer(engine);
    consumers.set(engine, consumer);
    if (platforms.includes('ios') || platforms.includes('android')) {
      const port = engine === 'nativewind' ? 8093 : 8094;
      metros.set(engine, startMetro(consumer.root, port, join(EVIDENCE_ROOT, engine, 'metro.log')));
    }
  }
  return { consumers, metros, reservations };
}

async function runOneLeg(
  engine: Engine,
  platform: Platform,
  consumer: Consumer,
  metro: MetroHandle | undefined,
  reservations: { ios: { id: string }; android: { id: string } } | null,
  runId: string,
): Promise<LegOutcome[]> {
  if (platform === 'web') return [await runWebLeg(engine, consumer, runId)];
  if (!metro) throw new Error(`no Metro for ${engine}`);
  if (!reservations) throw new Error('native platforms requested but no device reservations');
  const reservation = platform === 'ios' ? reservations.ios : reservations.android;
  return runNativeLeg(engine, platform, metro, reservation, runId);
}

async function runAllLegs(
  engines: Engine[],
  platforms: Platform[],
  infra: Awaited<ReturnType<typeof prepareInfrastructure>>,
  runId: string,
): Promise<LegOutcome[]> {
  const legs: LegOutcome[] = [];
  for (const engine of engines) {
    const consumer = infra.consumers.get(engine);
    if (!consumer) throw new Error(`no consumer prepared for ${engine}`);
    for (const platform of platforms) {
      legs.push(
        ...(await runOneLeg(
          engine,
          platform,
          consumer,
          infra.metros.get(engine),
          infra.reservations,
          runId,
        )),
      );
    }
  }
  return legs;
}

function countPassedLegs(legs: LegOutcome[]): { passedLegs: number; completed: boolean } {
  const byLeg = new Map<string, LegOutcome[]>();
  for (const outcome of legs) {
    const key = `${outcome.engine}/${outcome.platform}`;
    const list = byLeg.get(key) ?? [];
    list.push(outcome);
    byLeg.set(key, list);
  }
  const passedLegs = [...byLeg.values()].filter((list) =>
    list.every((o) => o.status === 'passed'),
  ).length;
  return { passedLegs, completed: passedLegs === 6 };
}

function writeManifest(
  runId: string,
  t0: number,
  reservations: { ios: { id: string }; android: { id: string } } | null,
  legs: LegOutcome[],
  passedLegs: number,
  completed: boolean,
  negativeControl: Record<string, unknown>,
): void {
  const manifest: Record<string, unknown> = {
    task: 'ORI-RN-003',
    run_id: runId,
    candidate_head_sha: gitHead(),
    generated_at: new Date().toISOString(),
    wall_ms: Date.now() - t0,
    commands: [
      'pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web',
    ],
    canonical_source_hashes: {
      'quickstart-screen.tsx': canonicalHash('quickstart-screen.tsx'),
      'quickstart-messages.ts': canonicalHash('quickstart-messages.ts'),
    },
    reservations: reservations
      ? { ios: reservations.ios.id, android: reservations.android.id }
      : null,
    passed_legs: passedLegs,
    completed,
    dev_error_toast_dismissed_legs: legs.filter(
      (leg) => leg.evidence.dev_error_toast_dismissed === true,
    ).length,
    legs,
    negative_control: negativeControl,
  };
  mkdirSync(EVIDENCE_ROOT, { recursive: true });
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  // Materialize each leg's evidence as its own session.json under the allowlisted dirs.
  for (const outcome of legs) {
    const dir =
      outcome.platform === 'web'
        ? join(EVIDENCE_ROOT, outcome.engine, outcome.platform)
        : join(EVIDENCE_ROOT, outcome.engine, outcome.platform, outcome.appearance ?? 'light');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'session.json'), `${JSON.stringify(outcome, null, 2)}\n`);
  }
}

export async function runQuickstartProof(options: ProofOptions): Promise<ProofResult> {
  const { engines, platforms, runId } = options;
  const t0 = Date.now();

  validateProofOptions(options);

  const infra = await prepareInfrastructure(engines, platforms);
  let legs: LegOutcome[];
  try {
    legs = await runAllLegs(engines, platforms, infra, runId);
  } finally {
    for (const metro of infra.metros.values()) stopMetro(metro);
    for (const consumer of infra.consumers.values()) cleanupConsumerRoot(consumer.root);
  }

  // AC-4 negative control (only after all legs — it is a separate disposable consumer).
  const negativeControl = await runNegativeControl(runId);

  const { passedLegs, completed } = countPassedLegs(legs);
  writeManifest(runId, t0, infra.reservations, legs, passedLegs, completed, negativeControl);

  return { runId, legs, negativeControl, manifestPath: MANIFEST_PATH, completed };
}

/* ---------------------------------------------------------------- CLI -- */

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  function flag(name: string): string | undefined {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  }
  const engines = (flag('--engines') ?? 'nativewind,uniwind').split(',') as Engine[];
  const platforms = (flag('--platforms') ?? 'ios,android,web').split(',') as Platform[];
  const runId = flag('--run-id') ?? `ORI-RN-003-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  const result = await runQuickstartProof({ engines, platforms, runId });
  console.log(
    JSON.stringify(
      { runId: result.runId, completed: result.completed, manifestPath: result.manifestPath },
      null,
      2,
    ),
  );
  if (!result.completed) process.exitCode = 1;
}

const isMain =
  process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.stack : String(e));
    process.exit(2);
  });
}
