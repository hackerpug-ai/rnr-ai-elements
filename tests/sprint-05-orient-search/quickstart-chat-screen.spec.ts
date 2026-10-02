import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * ORI-CONT-004 — the locked Quickstart flow FLOW-DOCS-02-quickstart-chat-screen.
 * The exact locked command selects the whole task surface:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts \
 *     --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop
 *
 *   - "locked tutorial reading" — the page returns 200, names the scrolling
 *     seeded message list and the working Expo Go composer before step 1, states each
 *     step's expected result, and displays complete source plus every
 *     engine-varying block for nativewind and uniwind with both public
 *     conversation commands unchanged.
 *   - "seed and live matrices" — the heavyweight proof, awaited IN THIS
 *     INVOCATION exactly once in chromium-desktop: the RN-owned runQuickstartProof
 *     driver (fresh public installs, all six seed legs, callback-disconnection
 *     negative control) followed by the AI-owned live-example runner per engine
 *     (six live targets, provider correlation, active abort, real recovery).
 *     The drivers are consumed unchanged through their declared interfaces.
 *
 *   - "ORI-CONT-004-quickstart-reading-floor" — the explicit mobile / no-JavaScript
 *     content cases, selected by the Evidence Gates command:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts \
 *     --grep ORI-CONT-004-quickstart-reading-floor --project=chromium-mobile --project=chromium-nojs
 *
 * The displayed source is read from the served page (the copy-button code child),
 * hashed, and handed to the seed driver, which rejects a mismatch against the
 * committed canonical source. Nothing is intercepted, injected or canned.
 */

const FLOW_TOKEN = 'FLOW-DOCS-02-quickstart-chat-screen';
const READING_FLOOR_TOKEN = 'ORI-CONT-004-quickstart-reading-floor';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen';
const LOCKED_COMMAND = `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep ${FLOW_TOKEN} --project=chromium-desktop`;
const CAPTURE_DIR = '.tmp/ORI-CONT-004/captures';

const NATIVEWIND_CONVERSATION =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const UNIWIND_CONVERSATION =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json';
const SCREEN_SOURCE_LABEL = 'Copy quickstart-screen.tsx';
const MESSAGES_SOURCE_LABEL = 'Copy quickstart-messages.ts';
const SEED_MANIFEST_PATH = 'tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json';
const LIVE_EVIDENCE_ROOT = 'tests/sprint-05-orient-search/evidence/ORI-AI-002';
const LIVE_RUNNER = 'tests/sprint-05-orient-search/run-live-example-proof.mjs';
/** Machine fact from the ORI-AI-002 handoff: worktree paths overflow tsx IPC pipes. */
const SHORT_TMPDIR = '/tmp/ori-ai-002-scratch';

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

function capture(testInfo: TestInfo, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

async function settle(page: { waitForLoadState: (s: 'load') => Promise<void> }) {
  await page.waitForLoadState('load');
}

interface QuickstartReading {
  status: number;
  bodyText: string;
  documentText: string;
  screenSource: string;
  messagesSource: string;
  entrypointNativewind: string;
  entrypointUniwind: string;
}

/** Read the tutorial exactly as a learner sees it, from the served page. */
async function readQuickstart(page: import('@playwright/test').Page): Promise<QuickstartReading> {
  const response = await navigateLocalhost(page, '/docs/quickstart');
  const status = response?.status() ?? 0;
  if (status !== 200) {
    return {
      status,
      bodyText: '',
      documentText: '',
      screenSource: '',
      messagesSource: '',
      entrypointNativewind: '',
      entrypointUniwind: '',
    };
  }

  const bodyText = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
  // textContent keeps hidden engine panels' bytes: the inactive tab's command and
  // source are server-rendered document content (revealed by tab selection, and
  // fully readable with JavaScript disabled) — innerText would drop them.
  const documentText = await page.evaluate(() => {
    const doc = (globalThis as unknown as { document: { body: { textContent: string } } }).document;
    return (doc.body.textContent ?? '').replace(/\s+/g, ' ');
  });

  const sourceFor = async (label: string): Promise<string> => {
    const code = page
      .locator(`rnr-copy-button:has(button[aria-label="${label}"]) code.copy-button__command`)
      .first();
    // Raw textContent, no trim: the bytes must hash equal to the committed
    // canonical source, trailing newline included.
    return (await code.textContent()) ?? '';
  };

  return {
    status,
    bodyText,
    documentText,
    screenSource: await sourceFor(SCREEN_SOURCE_LABEL),
    messagesSource: await sourceFor(MESSAGES_SOURCE_LABEL),
    entrypointNativewind: await sourceFor('Copy app/index.tsx (nativewind)'),
    entrypointUniwind: await sourceFor('Copy app/index.tsx (uniwind)'),
  };
}

/** The tutorial-content contract shared by every project (AC-3 case 1, reading). */
function assertTutorialContent(reading: QuickstartReading): void {
  expect(reading.status, '/docs/quickstart must return 200').toBe(200);

  // The end state is named before step 1.
  const beforeStep1 = reading.bodyText.split('1. We install')[0] ?? '';
  expect(beforeStep1, 'the intro must name the scrolling seed list before step 1').toContain(
    'scrolling message list',
  );
  expect(beforeStep1).toContain('working prompt input');
  expect(beforeStep1).toContain('Expo Go');

  // Each step states its expected result.
  expect(
    reading.bodyText.split('You should see').length - 1,
    'every tutorial step must state its expected result',
  ).toBeGreaterThanOrEqual(6);

  // Complete source for both engines.
  expect(reading.screenSource.length, 'the screen source must be complete').toBeGreaterThan(1000);
  expect(reading.messagesSource).toContain('Seed turn 01');
  expect(reading.messagesSource).toContain('Seed turn 24');
  expect(reading.entrypointNativewind.length).toBeGreaterThan(50);
  expect(reading.entrypointUniwind.length).toBeGreaterThan(50);
  expect(reading.entrypointNativewind).not.toBe(reading.entrypointUniwind);

  // Both public conversation commands, hostname unchanged — in the served
  // document (the inactive panel's command is revealed by its tab). The path
  // fragments carry the engine trees; the full literals follow.
  expect(reading.documentText).toContain('r/nativewind/conversation.json');
  expect(reading.documentText).toContain('r/uniwind/conversation.json');
  expect(reading.documentText).toContain(NATIVEWIND_CONVERSATION);
  expect(reading.documentText).toContain(UNIWIND_CONVERSATION);

  // The conclusion reaches the worked example.
  expect(reading.bodyText).toContain('apps/example');
  expect(reading.bodyText).toContain('useChat');
}

test(`${FLOW_TOKEN}: locked tutorial reading`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await settle(page);
  const reading = await readQuickstart(page);
  assertTutorialContent(reading);
  capture(testInfo, 'tutorial-reading', { status: reading.status });
});

test(`${READING_FLOOR_TOKEN}: engine panels readable without enhanced interaction`, async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  const response = await navigateLocalhost(page, '/docs/quickstart');
  expect(response?.status()).toBe(200);
  await settle(page);

  // Both labeled engine panels carry the complete commands.
  const nativewindPanels = page.locator(
    'rnr-tab-group [role="tabpanel"][data-engine="nativewind"]',
  );
  const uniwindPanels = page.locator('rnr-tab-group [role="tabpanel"][data-engine="uniwind"]');
  const nativewindCommands = await nativewindPanels
    .filter({ hasText: 'rnraielements.com' })
    .count();
  const uniwindCommands = await uniwindPanels.filter({ hasText: 'rnraielements.com' }).count();
  expect(nativewindCommands, 'the nativewind panels must carry install commands').toBeGreaterThan(
    0,
  );
  expect(uniwindCommands, 'the uniwind panels must carry install commands').toBeGreaterThan(0);

  // The displayed screen source stays readable on the reading floor.
  const reading = await readQuickstart(page);
  assertTutorialContent(reading);
  capture(testInfo, 'reading-floor', { nojs: isNoJs(testInfo) });
});

// fallow-ignore-next-line complexity
test(`${FLOW_TOKEN}: seed and live matrices awaited in this invocation`, async ({
  page,
}, testInfo) => {
  // The heavyweight matrix runs exactly once, in chromium-desktop (the locked
  // command's project). Other projects never select this grep.
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'the six-target matrices run once in chromium-desktop per the locked command',
  );
  // Hours: two engine live matrices plus the seed matrix.
  test.setTimeout(4 * 60 * 60 * 1000);

  const repoRoot = process.cwd();
  const runId = `ORI-CONT-004-${new Date().toISOString().replace(/[:.]/g, '-')}`;

  // Read the tutorial first: the displayed source binds the proof to this page,
  // and a candidate lacking the tutorial fails HERE — a functional assertion
  // failure, never a driver precondition.
  await settle(page);
  const reading = await readQuickstart(page);
  assertTutorialContent(reading);
  const sourceHash = createHash('sha256').update(reading.screenSource).digest('hex');

  // Fail closed on missing required dependencies — never a reduced matrix.
  const requiredEnv = ['RNR_S05_IOS_UDID', 'RNR_S05_ANDROID_SERIAL', 'OPENAI_API_KEY'];
  for (const name of requiredEnv) {
    expect(
      (process.env[name] ?? '').length,
      `${name} must be provided; the proof refuses a reduced target matrix`,
    ).toBeGreaterThan(0);
  }

  // --- Seed matrix: the RN-owned driver, consumed through its declared interface.
  // Env hygiene the owning tasks established for driver children (the ORI-RN-005
  // cycle-2 finding and the ORI-AI-002 handoff): the Playwright worker exports
  // NODE_ENV=test into the process, and Expo's dev middleware refuses to serve
  // a loadable bundle to Expo Go under it; mkdtempSync(tmpdir()) would otherwise
  // land consumer roots in the reaper-watched agent-scratch TMPDIR, which deletes
  // mid-run dists. Same remedy run-live-example-proof.mjs applies to its child.
  delete process.env.NODE_ENV;
  process.env.TMPDIR = SHORT_TMPDIR;
  mkdirSync(SHORT_TMPDIR, { recursive: true });
  // Process boundary, not an in-process import: executing runQuickstartProof inside
  // the Playwright worker stalls deterministically in the negative-control
  // disconnected round (cycle-5 attempts 2026-10-01 20:05 and 21:43 — worker idle in
  // kevent, the round's chromium and serve socket left hanging, while the identical
  // standalone drive completes; the committed Sep-28 green run used the driver's own
  // tsx CLI). The driver runs unchanged in a fresh child; the spec binds to the same
  // manifest it writes and asserts exactly what the in-process call asserted.
  const seedChild = spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--input-type=module',
      '-e',
      [
        'const { runQuickstartProof } = await import("./tests/sprint-05-orient-search/support/quickstart-proof.test.ts");',
        'const result = await runQuickstartProof({',
        '  engines: ["nativewind", "uniwind"],',
        '  platforms: ["ios", "android", "web"],',
        '  runId: process.env.SEED_RUN_ID,',
        '  sourceHash: process.env.SEED_SOURCE_HASH,',
        '});',
        'console.log(JSON.stringify({ runId: result.runId, completed: result.completed }));',
        'process.exitCode = result.completed ? 0 : 1;',
      ].join('\n'),
    ],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        TMPDIR: SHORT_TMPDIR,
        SEED_RUN_ID: runId,
        SEED_SOURCE_HASH: sourceHash,
        RNR_S05_IOS_UDID: process.env.RNR_S05_IOS_UDID ?? '',
        RNR_S05_ANDROID_SERIAL: process.env.RNR_S05_ANDROID_SERIAL ?? '',
      },
      encoding: 'utf8',
      timeout: 90 * 60 * 1000,
      maxBuffer: 1024 * 1024 * 64,
    },
  );
  expect(
    seedChild.status,
    `the seed matrix must complete in a fresh child process (exit ${seedChild.status}; the driver fails closed on any missing leg)\n${`${seedChild.stdout ?? ''}${seedChild.stderr ?? ''}`.slice(-4000)}`,
  ).toBe(0);
  const seedManifest = JSON.parse(readFileSync(join(repoRoot, SEED_MANIFEST_PATH), 'utf8'));
  const seed = {
    legs: seedManifest.legs ?? [],
    completed: seedManifest.completed,
    negativeControl: seedManifest.negative_control,
  };
  const passedLegs = seed.legs.filter((leg: { status?: string }) => leg.status === 'passed');
  expect(
    seed.completed,
    `all six seed legs must pass in this invocation (got ${passedLegs.length}/12 appearance+web records; failures: ${JSON.stringify(seed.legs.filter((l: { status?: string }) => l.status !== 'passed').map((l: { engine?: string; platform?: string; appearance?: string; diagnostic?: string }) => `${l.engine}/${l.platform}/${l.appearance ?? 'web'}: ${l.diagnostic?.slice(0, 200)}`))})`,
  ).toBe(true);
  expect(seed.negativeControl).toMatchObject({
    baseline_submission_passed: true,
    disconnected_failed_assertion: true,
    restored_marker_visible: true,
    restored_equals_original: true,
  });
  expect(seedManifest.run_id).toBe(runId);
  capture(testInfo, 'seed-matrix', {
    runId,
    manifestPath: SEED_MANIFEST_PATH,
    legs: seed.legs.map(
      (leg: { engine?: string; platform?: string; appearance?: string; status?: string }) => ({
        engine: leg.engine,
        platform: leg.platform,
        appearance: leg.appearance,
        status: leg.status,
      }),
    ),
  });

  // --- Live matrices: the AI-owned runner, one invocation per engine.
  mkdirSync(SHORT_TMPDIR, { recursive: true });
  const liveRuns: Record<string, Record<string, unknown>> = {};
  for (const engine of ['uniwind', 'nativewind'] as const) {
    const liveRunId = `${runId}-live-${engine}`;
    const result = spawnSync(
      process.execPath,
      [
        join(repoRoot, LIVE_RUNNER),
        '--engines',
        engine,
        '--platforms',
        'ios,android,web',
        '--output',
        LIVE_EVIDENCE_ROOT,
        '--run-id',
        liveRunId,
      ],
      {
        cwd: repoRoot,
        // The machine facts from the owning handoffs: short reaper-free TMPDIR for
        // children; device reservations and the provider credential pass through.
        env: {
          ...process.env,
          TMPDIR: SHORT_TMPDIR,
          RNR_S05_IOS_UDID: process.env.RNR_S05_IOS_UDID ?? '',
          RNR_S05_ANDROID_SERIAL: process.env.RNR_S05_ANDROID_SERIAL ?? '',
        },
        stdio: 'ignore',
        timeout: 2 * 60 * 60 * 1000,
        maxBuffer: 1024 * 1024 * 64,
      },
    );
    expect(
      result.status,
      `the ${engine} live matrix must complete and validate (exit ${result.status}); the runner exits nonzero on any missing or mismatched receipt`,
    ).toBe(0);

    const manifestPath = join(repoRoot, LIVE_EVIDENCE_ROOT, engine, 'manifest.json');
    expect(existsSync(manifestPath), `the ${engine} live manifest must exist`).toBe(true);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    expect(manifest.run_id).toBe(liveRunId);
    liveRuns[engine] = {
      run_id: manifest.run_id,
      manifest_sha256: createHash('sha256')
        .update(readFileSync(manifestPath, 'utf8'))
        .digest('hex'),
      repo_head: manifest.repo_head,
      devices: manifest.devices,
      targets: manifest.targets,
    };
    capture(testInfo, `live-matrix-${engine}`, liveRuns[engine]);
  }
  flowRecord = { ...flowRecord, live: liveRuns };
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
function sha256Text(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256Text(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

const repoRoot = process.cwd();

let anyFailure = false;
let flowRecord: Record<string, unknown> = {};

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const seedManifestPath = join(repoRoot, SEED_MANIFEST_PATH);
  const seedManifest = existsSync(seedManifestPath)
    ? (JSON.parse(readFileSync(seedManifestPath, 'utf8')) as Record<string, unknown>)
    : {};
  const runJson = {
    runIdentity: `ori-cont-004-${Date.now()}`,
    flow: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    seed: {
      manifestPath: SEED_MANIFEST_PATH,
      run_id: seedManifest.run_id ?? null,
      completed: seedManifest.completed ?? null,
      canonical_source_hashes: seedManifest.canonical_source_hashes ?? null,
      manifest_sha256: existsSync(seedManifestPath)
        ? sha256Text(readFileSync(seedManifestPath, 'utf8'))
        : 'absent',
    },
    live: flowRecord.live ?? null,
    sourceHashes: {
      quickstartManuscript: hashFile('apps/docs/src/content/docs/quickstart.mdx'),
      seedDriver: hashFile('tests/sprint-05-orient-search/support/quickstart-proof.test.ts'),
      nativeSession: hashFile('tests/sprint-05-orient-search/support/native-session.ts'),
      quickstartConsumer: hashFile('tests/sprint-05-orient-search/support/quickstart-consumer.ts'),
      liveRunner: hashFile(LIVE_RUNNER),
      liveOrchestrator: hashFile('tests/sprint-05-orient-search/live-example-proof.ts'),
      liveBackend: hashFile('tests/sprint-05-orient-search/support/live-backend.ts'),
      registryJson: hashFile('packages/registry/registry.json'),
      lockfile: hashFile('pnpm-lock.yaml'),
      distQuickstart: hashFile('apps/docs/dist/docs/quickstart/index.html'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
      testFile: hashFile('tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
