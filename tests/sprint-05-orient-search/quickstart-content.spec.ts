import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { dirname, extname, join } from 'node:path';

import { chromium, expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';
import {
  type BackendRecord,
  launchOwnedBackend,
  type OwnedBackendHandle,
} from './support/live-backend';
import {
  compileConsumer,
  REPO_ROOT,
  run,
  runExpoDoctor,
  sha256,
} from './support/quickstart-consumer';

/**
 * ORI-CONT-003 — task-owned browser + real-service proofs over the single
 * seed-data Quickstart tutorial and its live-example run handoff. RED-first:
 * every test below ran against trunk 8c3cc30e (no quickstart.mdx, no
 * docs/live-chat.md) and failed on real content/service assertions before any
 * manuscript was authored.
 *
 *   - ORI-CONT-003-AC-1  exactly one tutorial: named Expo Go seed-data result
 *                        before step 1, every numbered step ending in its own
 *                        observable result (all three Playwright projects)
 *   - ORI-CONT-003-AC-2  engine panels only: the literal conversation command,
 *                        the separate Message and composed PromptInput installs,
 *                        and displayed source bytes equal to the RN-owned files
 *                        (all three projects; selection survival proven on the
 *                        JS projects, stacked panels on chromium-nojs)
 *   - ORI-CONT-003-AC-3  two independent clean Expo 57 Web consumers installed
 *                        through the DISPLAYED public commands, compiled, and
 *                        driven in a real browser: seed transcript, one marker
 *                        turn, cleared composer, empty-composer no-op
 *                        (chromium-desktop only — the real-service proof runs
 *                        once; per-project reruns would triple ~40 min of
 *                        public-registry installs for zero extra coverage)
 *   - ORI-CONT-003-AC-4  the useChat-adjacent conclusion link and README link
 *                        reach the real /live-chat screen through the run
 *                        guide's documented startup path: real provider
 *                        streaming with request/response/hash correlation,
 *                        contextual follow-up recall, endpoint loss and Retry
 *                        (chromium-desktop only — same single-run reasoning)
 *
 * Real services only: the public HTTPS registry, the RNR CLI, Expo's real
 * compiler/exporter, the implemented backend, and the official OpenAI
 * Responses endpoint at gpt-4.1-mini-2025-04-14. No mocks, no canned answers,
 * no test doubles. Credentials stay server-side: OPENAI_API_KEY is stripped
 * from every browser/build child's environment and never captured.
 */

const ROUTES = {
  installation: '/docs/installation',
  quickstart: '/docs/quickstart',
  cli: '/docs/cli',
} as const;

/** The locked panel command (InstallCommand contract — no --yes, absolute URL). */
const NATIVEWIND_CONVERSATION =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const UNIWIND_CONVERSATION =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json';

/** The RN-owned executable single source the panels must display byte-for-byte. */
const SHARED_DIR = join(REPO_ROOT, 'packages/docs-snippets/shared');
const TEMPLATE_DIR: Record<Engine, string> = {
  nativewind: join(REPO_ROOT, 'packages/docs-snippets/nativewind'),
  uniwind: join(REPO_ROOT, 'packages/docs-snippets/uniwind'),
};
const SOURCE_FILES = {
  messages: join(SHARED_DIR, 'quickstart-messages.ts'),
  screen: join(SHARED_DIR, 'quickstart-screen.tsx'),
  entrypoint: {
    nativewind: join(TEMPLATE_DIR.nativewind, 'app/index.tsx'),
    uniwind: join(TEMPLATE_DIR.uniwind, 'app/index.tsx'),
  },
} as const;

/** Committed setup template copied into each clean consumer (ORI-RN-001's list). */
const TEMPLATE_FILES: Record<Engine, string[]> = {
  nativewind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'babel.config.js',
    'tailwind.config.js',
    'global.css',
    'nativewind-env.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
  uniwind: [
    'package.json',
    'app.json',
    'components.json',
    'tsconfig.json',
    'metro.config.js',
    'global.css',
    'uniwind-types.d.ts',
    'app/_layout.tsx',
    'lib/theme.ts',
    'lib/utils.ts',
  ],
};

type Engine = 'nativewind' | 'uniwind';
const ENGINES: Engine[] = ['nativewind', 'uniwind'];

const EVIDENCE_ROOT = join(REPO_ROOT, '.tmp/ORI-CONT-003/cycle-1/green');

/** Fresh run identity — the marker every seed submission must carry exactly once. */
const RUN_TAG = `${Math.floor(Date.now() / 1000)}`;
const MARKER = `ORI-CONT-003-${RUN_TAG}`;

/** The named seed literals the transcript crawl reconciles against. */
const SEED_COUNT = 24;
const OLDEST_SEED = 'Seed turn 01: Plan a weekend walk.';
const NEWEST_SEED = 'Seed turn 24: Ready for your message.';

/**
 * Machine reaper + IPC safety (ORI-AI-002 machine finding): every long-lived
 * child runs under a short TMPDIR — the worktree path overflows tsx IPC pipes
 * and the agent-scratch reaper deletes mid-run dists. Set before anything spawns.
 */
const SCRATCH_ROOT = '/tmp/ori-cont-003-scratch';
mkdirSync(SCRATCH_ROOT, { recursive: true });
process.env.TMPDIR = SCRATCH_ROOT;

/** The example app root whose /live-chat route the run guide documents. */
const EXAMPLE_ROOT = join(REPO_ROOT, 'apps/example');
const BACKEND_PORT = 4000;

const EXAMPLE_README = join(EXAMPLE_ROOT, 'README.md');
const LIVE_CHAT_GUIDE = join(EXAMPLE_ROOT, 'docs/live-chat.md');
/** The worked-example destination the conclusion link resolves to. */
const EXAMPLE_TREE_URL = 'https://github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example';

function capture(name: string, observed: Record<string, unknown>): void {
  const path = join(EVIDENCE_ROOT, 'captures', `${name}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({ capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

/** Navigate and require 200 — the RED failure for the absent manuscript. */
async function requireOk(page: Page, path: string): Promise<string> {
  const response = await navigateLocalhost(page, path);
  const status = response?.status() ?? 0;
  expect(status, `${path} must serve HTTP 200`).toBe(200);
  if (status !== 200 || !response) return '';
  return await response.text();
}

function sourceText(path: string): string {
  return readFileSync(path, 'utf8');
}

/** The committed README at HEAD — the preservation baseline (git, not a copy). */
function readmeAtHead(): string {
  const res = spawnSync('git show HEAD:apps/example/README.md', {
    shell: true,
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 30_000,
  });
  expect(res.status, 'git show HEAD:apps/example/README.md must succeed').toBe(0);
  return res.stdout;
}

/** dist routes whose slug mentions quickstart — the "exactly one tutorial" bound. */
function distQuickstartRoutes(): string[] {
  const docsDir = join(REPO_ROOT, 'apps/docs/dist/docs');
  if (!existsSync(docsDir)) return [];
  return readdirSync(docsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.includes('quickstart'))
    .map((entry) => entry.name);
}

/** Every code text displayed inside one engine's panels, in document order. */
async function panelCodeTexts(page: Page, engine: Engine): Promise<string[]> {
  const panel = page.locator(`main [role="tabpanel"][data-engine="${engine}"]`);
  const codes = panel.locator('rnr-copy-button code');
  return await codes.evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
}

interface ClassifiedPanels {
  conversation: string;
  message: string;
  promptInput: string;
  messagesSource: string;
  screenSource: string;
  entrypointSource: string;
}

/** Classify the six displayed blocks of one engine by their content contract. */
function classifyPanels(texts: string[]): ClassifiedPanels {
  const byPredicate = (predicate: (text: string) => boolean): string => {
    const matches = texts.filter(predicate);
    expect(matches.length, `exactly one block matches the predicate`).toBe(1);
    return matches[0];
  };
  return {
    conversation: byPredicate((t) => / add https:\/\/\S+\/conversation\.json$/.test(t.trim())),
    message: byPredicate((t) => / add https:\/\/\S+\/message\.json$/.test(t.trim())),
    promptInput: byPredicate((t) => t.includes('/prompt-input.json')),
    messagesSource: byPredicate((t) => t.includes('export const SEED_MESSAGES')),
    screenSource: byPredicate((t) => t.includes('export function QuickstartScreen')),
    entrypointSource: byPredicate(
      (t) => t.includes('QuickstartScreen') && !t.includes('export function QuickstartScreen'),
    ),
  };
}

// ---------------------------------------------------------------------------
// AC-1 — one tutorial with a named result and step outcomes
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-CONT-003-AC-1', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  await requireOk(page, ROUTES.quickstart);

  await expect(page.locator('main h1')).toHaveText('Quickstart');

  // Exactly one published tutorial: one dist route mentioning quickstart, one
  // nav entry, and no second tutorial page anywhere in the built site.
  expect(distQuickstartRoutes(), 'exactly one quickstart dist route').toEqual(['quickstart']);
  const navLinks = await page
    .locator('nav[data-docs-nav] a')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));
  expect(
    navLinks.filter((href) => href === ROUTES.quickstart),
    'one nav link to the tutorial',
  ).toHaveLength(1);

  // The seed-data Expo Go result is named before step 1.
  const intro = page.locator('main .prose p').first();
  const introText = (await intro.textContent()) ?? '';
  expect.soft(introText.length, 'the named result is a substantive paragraph').toBeGreaterThan(80);
  for (const phrase of ['scrolling message list', 'prompt input', 'Expo Go', 'seed data']) {
    expect.soft(introText.includes(phrase), `intro names "${phrase}" before step 1`).toBe(true);
  }

  // Imperative "we" steps, each ending with its own observable result.
  const steps = page.locator('main ol > li');
  const stepCount = await steps.count();
  expect.soft(stepCount, 'at least one numbered step').toBeGreaterThanOrEqual(1);
  const stepTexts = await steps.allTextContents();
  for (const [index, text] of stepTexts.entries()) {
    expect.soft(/^\s*We\s+\w+/.test(text), `step ${index + 1} is an imperative we-step`).toBe(true);
    expect
      .soft(/you should see/i.test(text), `step ${index + 1} ends with an expected result`)
      .toBe(true);
  }

  // A tutorial composes real code but never a second lesson: the body is
  // substantive and carries a conclusion handing off to the worked example.
  const mainText = (await page.locator('main').textContent()) ?? '';
  expect.soft(mainText.length, 'tutorial body is substantive').toBeGreaterThan(600);

  capture(`${project}-ac1`, {
    introText,
    stepCount,
    stepTexts,
    distQuickstartRoutes: distQuickstartRoutes(),
  });
});

// ---------------------------------------------------------------------------
// AC-2 — complete engine panels import the executable source
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-CONT-003-AC-2', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';

  // The selection originates on the installation page's engine control.
  await requireOk(page, ROUTES.installation);

  let selected: Engine = 'nativewind';
  if (!nojs) {
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
    await page.locator('main [role="tab"][data-engine="nativewind"]').first().click();
  }

  await requireOk(page, ROUTES.quickstart);

  // Every code block belongs to engine panels: no fenced markdown code, and
  // every copy surface sits inside a tabpanel.
  expect.soft(await page.locator('main pre').count(), 'no un-tabbed fenced code').toBe(0);
  const unpaneled = await page
    .locator('main rnr-copy-button')
    .evaluateAll(
      (nodes) => nodes.filter((node) => node.closest('[role="tabpanel"]') === null).length,
    );
  expect.soft(unpaneled, 'every code block lives inside an engine panel').toBe(0);

  const tablists = await page.locator('main [role="tablist"]').count();
  expect.soft(tablists, 'the tutorial composes engine tab groups').toBeGreaterThanOrEqual(3);

  const verifyPanels = async (engine: Engine): Promise<ClassifiedPanels> => {
    const texts = await panelCodeTexts(page, engine);
    expect.soft(texts.length, `${engine} panel carries six complete blocks`).toBe(6);
    const panels = classifyPanels(texts);

    // The literal canonical conversation command, verbatim.
    const expectedConversation =
      engine === 'nativewind' ? NATIVEWIND_CONVERSATION : UNIWIND_CONVERSATION;
    expect
      .soft(panels.conversation.trim(), `${engine} conversation command is canonical`)
      .toBe(expectedConversation);

    // Separate Message install and composed PromptInput install (with the
    // Item and Sheet the installed prompt-input source imports).
    expect
      .soft(panels.message.trim().endsWith(`/${engine}/message.json`), `${engine} message install`)
      .toBe(true);
    for (const item of ['prompt-input.json', 'item.json', 'sheet.json']) {
      expect
        .soft(
          panels.promptInput.includes(`/${engine}/${item}`),
          `${engine} install includes ${item}`,
        )
        .toBe(true);
    }
    expect
      .soft(
        panels.message.includes('prompt-input.json'),
        'the Message install is separate from PromptInput',
      )
      .toBe(false);

    // Displayed source equals the RN-owned executable bytes.
    const fileHashes = {
      messages: sha256(sourceText(SOURCE_FILES.messages)),
      screen: sha256(sourceText(SOURCE_FILES.screen)),
      entrypoint: sha256(sourceText(SOURCE_FILES.entrypoint[engine])),
    };
    expect
      .soft(sha256(panels.messagesSource), `${engine} messages source hash matches`)
      .toBe(fileHashes.messages);
    expect
      .soft(sha256(panels.screenSource), `${engine} screen source hash matches`)
      .toBe(fileHashes.screen);
    expect
      .soft(sha256(panels.entrypointSource), `${engine} entrypoint source hash matches`)
      .toBe(fileHashes.entrypoint);

    // The composed PromptInput contract — never the string-callback index sample.
    for (const part of [
      'message: PromptInputMessage',
      'message.text',
      'PromptInputBody',
      'PromptInputTextarea',
      'PromptInputFooter',
      'PromptInputSubmit',
    ]) {
      expect
        .soft(panels.screenSource.includes(part), `${engine} screen composes ${part}`)
        .toBe(true);
    }
    expect
      .soft(
        panels.screenSource.includes('onSubmit={(text: string)'),
        `${engine} no string callback`,
      )
      .toBe(false);
    return panels;
  };

  const nativewindPanels = await verifyPanels('nativewind');
  const uniwindPanels = await verifyPanels('uniwind');

  // Wrong-engine content never crosses panels.
  expect
    .soft(
      uniwindPanels.conversation.includes('/r/nativewind/'),
      'no nativewind URL in uniwind panel',
    )
    .toBe(false);
  expect
    .soft(
      nativewindPanels.conversation.includes('/r/uniwind/'),
      'no uniwind URL in nativewind panel',
    )
    .toBe(false);

  if (!nojs) {
    // Selection survives navigation: the stored engine is what Quickstart shows.
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
    const selectedTabs = await page
      .locator('main [role="tab"][aria-selected="true"]')
      .evaluateAll((tabs) => tabs.map((tab) => tab.getAttribute('data-engine')));
    expect
      .soft(
        selectedTabs.length > 0 && selectedTabs.every((engine) => engine === selected),
        `every group shows the inherited ${selected} selection`,
      )
      .toBe(true);
    expect
      .soft(
        await page.locator(`main [role="tabpanel"][data-engine="${selected}"]`).first().isVisible(),
      )
      .toBe(true);

    // Deliberately switch engines, then leave and return.
    selected = 'uniwind';
    await page.locator('main [role="tab"][data-engine="uniwind"]').first().click();
    await expect(page.locator('main [role="tab"][data-engine="uniwind"]').first()).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      page.locator('main [role="tabpanel"][data-engine="nativewind"]').first(),
    ).toBeHidden();
    await requireOk(page, ROUTES.cli);
    await requireOk(page, ROUTES.quickstart);
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
    const afterReturn = await page
      .locator('main [role="tab"][aria-selected="true"]')
      .evaluateAll((tabs) => tabs.map((tab) => tab.getAttribute('data-engine')));
    expect
      .soft(
        afterReturn.length > 0 && afterReturn.every((engine) => engine === 'uniwind'),
        'uniwind selection survives navigation away and back',
      )
      .toBe(true);
    expect
      .soft(
        await page.locator('main [role="tabpanel"][data-engine="nativewind"]').first().isVisible(),
        'inactive nativewind panel stays hidden',
      )
      .toBe(false);
  } else {
    // Zero-JS: both engines' panels stack readable in the served HTML.
    for (const engine of ENGINES) {
      await expect(
        page.locator(`main [role="tabpanel"][data-engine="${engine}"]`).first(),
      ).toBeVisible();
    }
    const servedNativewind = classifyPanels(await panelCodeTexts(page, 'nativewind'));
    expect
      .soft(servedNativewind.conversation.trim(), 'no-JS nativewind command complete')
      .toBe(NATIVEWIND_CONVERSATION);
  }

  capture(`${project}-ac2`, {
    nativewind: {
      conversation: nativewindPanels.conversation.trim(),
      message: nativewindPanels.message.trim(),
      promptInput: nativewindPanels.promptInput.trim(),
      hashes: {
        messages: sha256(nativewindPanels.messagesSource),
        screen: sha256(nativewindPanels.screenSource),
        entrypoint: sha256(nativewindPanels.entrypointSource),
      },
    },
    uniwind: {
      command: uniwindPanels.conversation.trim(),
      message: uniwindPanels.message.trim(),
      promptInput: uniwindPanels.promptInput.trim(),
    },
    unpaneled,
    tablists,
  });
});

// ---------------------------------------------------------------------------
// AC-3 — the exact displayed lesson submits a real message in clean consumers
// ---------------------------------------------------------------------------

/** A slow crawl over the inverted FlatList: union of every visible turn text. */
async function crawlTurns(page: Page): Promise<string[]> {
  const collected = new Set<string>();
  const collect = async (): Promise<void> => {
    const texts = await page
      .locator('div, span, p')
      .evaluateAll((nodes) =>
        nodes.filter((n) => n.children.length === 0).map((n) => (n.textContent ?? '').trim()),
      );
    for (const text of texts) {
      if (/^Seed turn \d+:/.test(text) || text === MARKER) collected.add(text);
    }
  };
  await collect();
  // The inverted list parks newest-first; walk the scroll container to the top.
  for (let step = 0; step < 30; step += 1) {
    const atTop = await page.evaluate(
      `(() => { const el = [...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 40).pop(); if (!el) return true; el.scrollTop = Math.max(0, el.scrollTop - el.clientHeight * 0.8); return el.scrollTop === 0; })()`,
    );
    await page.waitForTimeout(250);
    await collect();
    if (atTop) break;
  }
  return [...collected];
}

/** Full scroll-container heights, used to prove the seed list stays scrollable. */
async function scrollHeights(
  page: Page,
): Promise<{ scrollHeight: number; clientHeight: number }[]> {
  return await page.evaluate(
    `[...document.querySelectorAll('div')].filter(d => d.scrollHeight > d.clientHeight + 40).map(d => ({scrollHeight: d.scrollHeight, clientHeight: d.clientHeight}))`,
  );
}

// fallow-ignore-next-line complexity
test('ORI-CONT-003-AC-3', async ({ page }, testInfo) => {
  test.setTimeout(60 * 60_000);
  if (testInfo.project.name !== 'chromium-desktop') return;
  const project = testInfo.project.name;

  // --- Gate: the built tutorial supplies the displayed contract. ---
  await requireOk(page, ROUTES.quickstart);

  const displayed: Record<Engine, ClassifiedPanels> = {
    nativewind: classifyPanels(await panelCodeTexts(page, 'nativewind')),
    uniwind: classifyPanels(await panelCodeTexts(page, 'uniwind')),
  };
  // The displayed source IS the committed RN-owned source before any consumer runs it.
  for (const engine of ENGINES) {
    expect(
      sha256(displayed[engine].screenSource),
      `${engine} displayed screen == source bytes`,
    ).toBe(sha256(sourceText(SOURCE_FILES.screen)));
    expect(
      sha256(displayed[engine].messagesSource),
      `${engine} displayed messages == source bytes`,
    ).toBe(sha256(sourceText(SOURCE_FILES.messages)));
    expect(
      sha256(displayed[engine].entrypointSource),
      `${engine} displayed entrypoint == source bytes`,
    ).toBe(sha256(sourceText(SOURCE_FILES.entrypoint[engine])));
  }

  const browser = await chromium.launch({ headless: true });
  const results: Record<string, unknown> = { engines: {} as Record<string, unknown> };
  const enginesOut = results.engines as Record<string, unknown>;

  try {
    for (const engine of ENGINES) {
      // --- Independent clean consumer, outside the monorepo. ---
      const root = join(SCRATCH_ROOT, 'consumers', `${engine}-${RUN_TAG}`);
      const distDir = join(SCRATCH_ROOT, 'dists', `${engine}-${RUN_TAG}`);
      const template = TEMPLATE_DIR[engine];
      for (const rel of TEMPLATE_FILES[engine]) {
        const dst = join(root, rel);
        mkdirSync(dirname(dst), { recursive: true });
        writeFileSync(dst, sourceText(join(template, rel)));
      }

      // --- The exact DISPLAYED public commands, verbatim. ---
      const scaffoldInstall = run('pnpm install', root, 15 * 60_000);
      expect(scaffoldInstall.exit, `${engine} scaffold pnpm install`).toBe(0);
      const expoInstall = run('npx expo install', root, 15 * 60_000);
      expect(expoInstall.exit, `${engine} expo install`).toBe(0);

      const panels = displayed[engine];
      const adds = [panels.conversation.trim(), panels.message.trim(), panels.promptInput.trim()];
      const installLogs: string[] = [];
      for (const command of adds) {
        const res = run(command, root, 15 * 60_000);
        installLogs.push(`$ ${command}\n${res.output}`);
        expect(
          res.exit,
          `${engine} displayed install must exit 0:\n${res.output.slice(-2000)}`,
        ).toBe(0);
      }
      const installLog = installLogs.join('\n');
      expect(
        installLog.includes('rnraielements.com'),
        `${engine} installs from the public registry`,
      ).toBe(true);

      // --- The exact displayed source, in the learner's order (after install). ---
      mkdirSync(join(root, 'shared'), { recursive: true });
      writeFileSync(join(root, 'shared/quickstart-messages.ts'), panels.messagesSource);
      writeFileSync(join(root, 'shared/quickstart-screen.tsx'), panels.screenSource);
      mkdirSync(join(root, 'app'), { recursive: true });
      writeFileSync(join(root, 'app/index.tsx'), panels.entrypointSource);

      const compile = compileConsumer(root);
      expect(
        compile.exit,
        `${engine} consumer compiles the displayed source:\n${compile.output}`,
      ).toBe(0);
      const doctor = runExpoDoctor(root);
      expect.soft(doctor.exit, `${engine} expo doctor passes`).toBe(0);

      // --- Real web export, served on an owned port. ---
      mkdirSync(distDir, { recursive: true });
      const exportRes = run(
        `npx expo export --platform web --output-dir "${distDir}"`,
        root,
        30 * 60_000,
      );
      expect(exportRes.exit, `${engine} web export:\n${exportRes.output.slice(-2000)}`).toBe(0);

      const serve = await serveStatic(distDir, 0);
      try {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const consumer = await context.newPage();

        // Case 1: seeded transcript + one fresh marker through PromptInput.
        await consumer.goto(serve.url, { waitUntil: 'networkidle', timeout: 90_000 });
        await expect(consumer.getByText(NEWEST_SEED, { exact: true })).toBeVisible({
          timeout: 30_000,
        });

        const beforeTurns = await crawlTurns(consumer);
        expect
          .soft(beforeTurns.length, `${engine} all 24 seed turns render across the crawl`)
          .toBe(SEED_COUNT);
        await expect(consumer.getByText(OLDEST_SEED, { exact: true })).toBeVisible();

        const textarea = consumer.getByLabel('Message', { exact: true });
        await textarea.click();
        await textarea.fill(MARKER);
        await consumer.getByLabel('Send message', { exact: true }).click();
        await consumer
          .waitForFunction(
            `document.querySelector('textarea[aria-label="Message"]')?.value === ''`,
            { timeout: 15_000 },
          )
          .catch(() => {});

        const markerCount = await consumer.getByText(MARKER, { exact: true }).count();
        expect(markerCount, `${engine} exactly one marker user turn`).toBe(1);
        const afterTurns = await crawlTurns(consumer);
        expect
          .soft(
            afterTurns.length,
            `${engine} N+1 turns after submission (got ${afterTurns.length})`,
          )
          .toBe(SEED_COUNT + 1);
        const unexpected = afterTurns.filter(
          (text) => !/^Seed turn \d+:/.test(text) && text !== MARKER,
        );
        expect(unexpected, `${engine} no synthesized turn text`).toEqual([]);
        const heights = await scrollHeights(consumer);
        expect
          .soft(
            heights.length > 0 && heights.every((h) => h.scrollHeight > h.clientHeight),
            `${engine} transcript remains scrollable`,
          )
          .toBe(true);

        await consumer.screenshot({
          path: join(EVIDENCE_ROOT, 'screenshots', `${engine}-seed-marker.png`),
          fullPage: false,
        });
        await context.close();

        // Case 2: the empty composer adds no blank turn. The send control is
        // inert while the composer is empty, so the attempt is dispatched at the
        // DOM level — a disabled control fires no handler, which IS the no-op
        // under proof (an actionability click would wait forever on it).
        const context2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
        const fresh = await context2.newPage();
        await fresh.goto(serve.url, { waitUntil: 'networkidle', timeout: 90_000 });
        await expect(fresh.getByText(NEWEST_SEED, { exact: true })).toBeVisible({
          timeout: 30_000,
        });
        await fresh
          .getByLabel('Send message', { exact: true })
          .dispatchEvent('click')
          .catch(() => {});
        await fresh.waitForTimeout(1500);
        const emptyTurns = await crawlTurns(fresh);
        expect(emptyTurns.length, `${engine} empty submit adds no turn`).toBe(SEED_COUNT);
        expect(
          await fresh.getByLabel('Message', { exact: true }).inputValue(),
          `${engine} composer stays empty`,
        ).toBe('');
        await context2.close();

        enginesOut[engine] = {
          root,
          commands: adds,
          installFromRegistry: installLog.includes('rnraielements.com'),
          compileExit: compile.exit,
          doctorExit: doctor.exit,
          exportExit: exportRes.exit,
          servedAt: serve.url,
          seedTurnsBefore: beforeTurns.length,
          turnsAfterSubmit: afterTurns.length,
          markerCount,
          inputCleared: true,
          emptySubmitTurns: emptyTurns.length,
          scrollable: heights.length > 0,
        };
      } finally {
        await new Promise<void>((resolve) => serve.server.close(() => resolve()));
      }
    }
  } finally {
    await browser.close();
  }

  capture(`${project}-ac3`, { runTag: RUN_TAG, marker: MARKER, ...results });
});

// ---------------------------------------------------------------------------
// AC-4 — the conclusion and run guide reach the real live example
// ---------------------------------------------------------------------------

interface Tee {
  envelopeId: string;
  status: number;
  text: string;
  chunks: number;
  /** True once the proxied response stream has ended. */
  done: boolean;
}

/**
 * The app reuses ONE chat id for every turn of a session, so the backend's
 * requestId cannot discriminate turns. The exact correlation the landed ORI-AI-002
 * runner proved: match the sha256 of the tee-captured stream text against the
 * record's textHash.
 */
async function recordForStreamText(
  backend: OwnedBackendHandle,
  streamText: string,
  timeoutMs: number,
): Promise<BackendRecord | null> {
  const hash = sha256(streamText);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const match = backend.records().find((record) => record.textHash === hash);
    if (match) return match;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

/** Waits until the teeing proxy has fully relayed the request at `baseline`. */
async function waitForTeeDone(
  requests: Tee[],
  baseline: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (requests[baseline]?.done === true) return true;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

/** Waits until the teeing proxy has begun the request at `baseline`. */
async function waitForTee(
  requests: Tee[],
  baseline: number,
  timeoutMs: number,
): Promise<Tee | null> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const tee = requests[baseline];
    if (tee !== undefined) return tee;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

/** Static export + same-origin /api/chat forwarding with an SSE tee. */
async function serveLiveChat(
  distDir: string,
  port: number,
  backendPort: number,
): Promise<{ server: Server; url: string; requests: Tee[] }> {
  const requests: Tee[] = [];
  const MIME: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
  };
  // fallow-ignore-next-line complexity
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      if (req.method === 'POST' && url.pathname === '/api/chat') {
        const chunks: Buffer[] = [];
        for await (const chunk of req)
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const body = Buffer.concat(chunks);
        let envelopeId = `unknown-${requests.length}`;
        try {
          envelopeId = (JSON.parse(body.toString('utf8')) as { id?: string }).id ?? envelopeId;
        } catch {
          // non-JSON body forwards untouched; id stays unknown
        }
        const tee: Tee = { envelopeId, status: 0, text: '', chunks: 0, done: false };
        requests.push(tee);
        let upstream: Response;
        try {
          upstream = await fetch(`http://127.0.0.1:${backendPort}/api/chat`, {
            method: 'POST',
            headers: { 'content-type': req.headers['content-type'] ?? 'application/json' },
            body,
          });
        } catch {
          // A dead backend must reach the page as a CONNECTION failure, never a
          // proxy-authored error body: destroy the socket so the browser's fetch
          // rejects exactly as it would against an origin nobody is serving.
          tee.done = true;
          res.destroy();
          return;
        }
        tee.status = upstream.status;
        res.writeHead(upstream.status, {
          'content-type': upstream.headers.get('content-type') ?? 'text/event-stream',
        });
        if (upstream.body === null) {
          res.end();
          tee.done = true;
          return;
        }
        const reader = upstream.body.getReader();
        let sseBuffer = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const buf = Buffer.from(value);
          res.write(buf);
          tee.chunks += 1;
          sseBuffer += buf.toString('utf8');
          let nl = sseBuffer.indexOf('\n');
          while (nl !== -1) {
            const line = sseBuffer.slice(0, nl).trim();
            sseBuffer = sseBuffer.slice(nl + 1);
            if (line.startsWith('data:')) {
              try {
                const frame = JSON.parse(line.slice(5).trim()) as {
                  type?: unknown;
                  delta?: unknown;
                };
                if (frame.type === 'text-delta' && typeof frame.delta === 'string') {
                  tee.text += frame.delta;
                }
              } catch {
                // keepalive frame — nothing to extract
              }
            }
            nl = sseBuffer.indexOf('\n');
          }
        }
        res.end();
        tee.done = true;
        return;
      }
      let path = url.pathname;
      if (path === '/') path = '/index.html';
      let filePath = join(distDir, path);
      if (!existsSync(filePath) && !extname(path)) filePath = `${filePath}.html`;
      if (!existsSync(filePath)) filePath = join(distDir, 'live-chat.html');
      if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
      const file = readFileSync(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(file);
    } catch {
      // Mid-stream failures must not attempt a second writeHead on a response
      // that already has headers — cut the socket instead.
      if (res.headersSent) {
        res.destroy();
      } else {
        res.writeHead(500);
        res.end('static serve error');
      }
    }
  });
  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));
  return { server, url: `http://127.0.0.1:${port}`, requests };
}

/** Binds an owned ephemeral port and returns it. */
async function freePort(): Promise<number> {
  const net = await import('node:net');
  return new Promise((resolve) => {
    const probe = net.createServer();
    probe.listen(0, '127.0.0.1', () => {
      const port = (probe.address() as { port: number }).port;
      probe.close(() => resolve(port));
    });
  });
}

// fallow-ignore-next-line complexity
test('ORI-CONT-003-AC-4', async ({ page }, testInfo) => {
  test.setTimeout(30 * 60_000);
  if (testInfo.project.name !== 'chromium-desktop') return;
  const project = testInfo.project.name;

  // --- Gate 1: the conclusion link beside useChat resolves. ---
  await requireOk(page, ROUTES.quickstart);

  const conclusion = page.locator('main a', { hasText: /example|live/i }).last();
  const conclusionLinks = await page.locator('main a').evaluateAll((anchors) =>
    anchors
      .filter((anchor) => (anchor.getAttribute('href') ?? '').includes('apps/example'))
      .map((anchor) => ({
        href: anchor.getAttribute('href') ?? '',
        text: anchor.textContent ?? '',
      })),
  );
  expect(conclusionLinks.length, 'a conclusion link reaches apps/example').toBeGreaterThanOrEqual(
    1,
  );
  const conclusionHref = conclusionLinks[0].href;
  expect(conclusionHref, 'the conclusion opens the worked example').toBe(EXAMPLE_TREE_URL);
  const linkResponse = await page.request.get(conclusionHref);
  expect(linkResponse.status(), 'the conclusion link resolves').toBe(200);
  const useChatAdjacent = await page
    .locator('main p')
    .evaluateAll(
      (nodes) =>
        nodes.filter(
          (node) => node.textContent?.includes('useChat') && node.querySelector('a') !== null,
        ).length,
    );
  expect(useChatAdjacent, 'the link sits beside useChat in the conclusion').toBeGreaterThanOrEqual(
    1,
  );
  await expect(conclusion).toBeVisible();

  // --- Gate 2: the README links the run guide and preserves its guidance. ---
  expect(existsSync(LIVE_CHAT_GUIDE), 'apps/example/docs/live-chat.md exists').toBe(true);
  const readme = sourceText(EXAMPLE_README);
  expect.soft(readme.includes('docs/live-chat.md'), 'README links the run guide').toBe(true);
  const readmeHead = readmeAtHead();
  const missingLines = readmeHead
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !readme.includes(line));
  expect.soft(missingLines, 'README preserves every original line').toEqual([]);
  expect
    .soft(/\/(offline|live-chat)/.test(readme), 'README distinguishes the offline and live routes')
    .toBe(true);

  const guide = sourceText(LIVE_CHAT_GUIDE);
  expect.soft(guide.includes('This guide shows you how to'), 'live-chat.md is a how-to').toBe(true);
  for (const variable of [
    'OPENAI_API_KEY',
    'EXAMPLE_CHAT_MODEL',
    'EXAMPLE_CHAT_WEB_ORIGIN',
    'EXPO_PUBLIC_API_BASE_URL',
  ]) {
    expect.soft(guide.includes(variable), `guide names ${variable} without values`).toBe(true);
  }
  expect.soft(guide.includes('gpt-4.1-mini-2025-04-14'), 'guide names the proof model').toBe(true);
  expect
    .soft(guide.includes('apps/example/server/index.ts'), 'guide documents the server entrypoint')
    .toBe(true);
  expect(guide.includes('sk-'), 'guide never carries a credential value').toBe(false);

  // --- Gate 3: the documented startup command runs, verbatim. ---
  const probePort = await freePort();
  const guideEnv: NodeJS.ProcessEnv = {
    ...process.env,
    TMPDIR: SCRATCH_ROOT,
    EXAMPLE_CHAT_MODEL: 'gpt-4.1-mini-2025-04-14',
    EXAMPLE_CHAT_PORT: String(probePort),
    EXAMPLE_CHAT_WEB_ORIGIN: 'http://127.0.0.1:8081',
  };
  const guideChild = spawn('pnpm exec tsx apps/example/server/index.ts', {
    shell: true,
    cwd: REPO_ROOT,
    detached: true,
    env: guideEnv,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let guideStdout = '';
  guideChild.stdout?.on('data', (chunk: Buffer) => {
    guideStdout += chunk.toString('utf8');
  });
  const guideListening = await new Promise<boolean>((resolve) => {
    const timeout = setTimeout(() => resolve(false), 30_000);
    const poll = setInterval(() => {
      if (guideStdout.includes('ORI_AI_001_LISTENING')) {
        cleanup();
        resolve(true);
      }
    }, 100);
    const onExit = (): void => {
      cleanup();
      resolve(guideStdout.includes('ORI_AI_001_LISTENING'));
    };
    const cleanup = (): void => {
      clearTimeout(timeout);
      clearInterval(poll);
      guideChild.off('exit', onExit);
    };
    guideChild.on('exit', onExit);
  });
  // The whole process group (pnpm -> tsx -> server) must die with the probe.
  try {
    if (guideChild.pid !== undefined) process.kill(-guideChild.pid, 'SIGTERM');
  } catch {
    // group already gone
  }
  await new Promise<void>((resolve) => {
    guideChild.on('exit', () => resolve());
    setTimeout(() => resolve(), 5000);
  });
  expect(guideListening, 'the documented backend command reaches listening').toBe(true);

  // --- The real proof: backend + web export + provider streaming. ---
  const portProbe = spawnSync(
    `node -e 'const n=require("node:net");const s=n.connect(${BACKEND_PORT},"127.0.0.1",()=>{console.error("owned-port-check: ${BACKEND_PORT} is already in use");s.destroy();process.exit(1)});s.on("error",()=>process.exit(0))'`,
    { shell: true, encoding: 'utf8', timeout: 10_000 },
  );
  expect(portProbe.status, `port ${BACKEND_PORT} must be free for the owned backend`).toBe(0);

  const webPort = await freePort();
  const distDir = join(SCRATCH_ROOT, 'live-dist', RUN_TAG);
  mkdirSync(distDir, { recursive: true });
  // Metro's transform cache does NOT key on EXPO_PUBLIC_* values: an export run
  // after a different port reuses the previous inlined base URL (observed: a
  // fresh 8411 export still serving the stale 56715 bake). A per-run TMPDIR
  // gives the export its own cache so the served bundle always inlines THIS
  // run's webPort — the same isolation-by-fresh-cache the fixed-port drivers
  // achieve by never changing ports.
  const metroCache = join(SCRATCH_ROOT, 'metro', RUN_TAG);
  mkdirSync(metroCache, { recursive: true });
  const exportEnv: NodeJS.ProcessEnv = {
    ...process.env,
    TMPDIR: metroCache,
    EXPO_PUBLIC_API_BASE_URL: `http://127.0.0.1:${webPort}`,
  };
  delete exportEnv.OPENAI_API_KEY;
  const webExport = spawnSync(`npx expo export --platform web --output-dir "${distDir}"`, {
    shell: true,
    cwd: EXAMPLE_ROOT,
    encoding: 'utf8',
    timeout: 30 * 60_000,
    env: exportEnv,
    maxBuffer: 64 * 1024 * 1024,
  });
  expect(
    webExport.status,
    `example web export:\n${(webExport.stdout + webExport.stderr).slice(-2000)}`,
  ).toBe(0);

  // rebound on restart(): each restart yields a NEW handle whose records are
  // the live server's — correlating against a stale handle reads an empty log.
  let backend = await launchOwnedBackend({
    port: BACKEND_PORT,
    model: 'gpt-4.1-mini-2025-04-14',
    webOrigin: `http://127.0.0.1:${webPort}`,
  });
  expect(backend.started, 'owned backend is listening').toBe(true);

  const serve = await serveLiveChat(distDir, webPort, BACKEND_PORT);
  const browserEnvKey = process.env.OPENAI_API_KEY;
  if (browserEnvKey !== undefined) delete process.env.OPENAI_API_KEY;
  const browser = await chromium.launch({ headless: true });
  if (browserEnvKey !== undefined) process.env.OPENAI_API_KEY = browserEnvKey;

  const observed: Record<string, unknown> = {};
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const live = await context.newPage();
    await live.goto(`${serve.url}/live-chat`, { waitUntil: 'networkidle', timeout: 90_000 });
    await live.getByText('Live chat', { exact: true }).waitFor({ timeout: 30_000 });
    await live.getByText('Start a conversation', { exact: true }).waitFor({ timeout: 15_000 });

    // Case 1: a nonce prompt streams incrementally with provider correlation.
    const noncePrompt = `Remember the marker ${MARKER}. Reply with three sentences about planning a walk.`;
    const domTexts = (): Promise<string[]> =>
      live
        .evaluate(
          `[...new Set([...document.querySelectorAll('div,span,p')].filter((n) => n.children.length === 0).map((n) => (n.textContent ?? '')).filter((t) => t.length > 25))]`,
        )
        .then((value) => value as string[])
        .catch(() => [] as string[]);

    const baseline = serve.requests.length;
    const textarea = live.getByLabel('Message', { exact: true });
    const send = live.getByLabel('Send message', { exact: true });
    await textarea.click();
    await textarea.fill(noncePrompt);
    await send.click();
    const firstTee = await waitForTee(serve.requests, baseline, 30_000);
    expect(firstTee, 'the first prompt reached the backend through the proxy').not.toBeNull();
    if (firstTee === null) return;

    const incrementalSamples: { ts: string; text: string }[] = [];
    const chunkArrivals = new Set<number>();
    const deadline = Date.now() + 180_000;
    while (Date.now() < deadline) {
      const texts = await domTexts();
      for (const text of texts) {
        if (!text.includes(noncePrompt) && !incrementalSamples.some((s) => s.text === text)) {
          incrementalSamples.push({ ts: new Date().toISOString(), text });
        }
      }
      chunkArrivals.add(firstTee.chunks);
      const record = await backend.waitForRecord(firstTee.envelopeId, 100);
      if (record?.outcome === 'completed') break;
      await live.waitForTimeout(150);
    }
    chunkArrivals.add(firstTee.chunks);

    const firstRecord = await recordForStreamText(backend, firstTee.text, 60_000);
    expect(firstRecord, 'the first provider turn produced a server record').not.toBeNull();
    if (firstRecord) {
      expect(firstRecord.outcome, 'first turn completed').toBe('completed');
      expect(firstRecord.responseId ?? '', 'provider response id captured').toContain('resp_');
      expect(firstRecord.deltaCount, 'server observed incremental deltas').toBeGreaterThanOrEqual(
        2,
      );
      expect(sha256(firstTee?.text ?? ''), 'stream text hash matches the server record').toBe(
        firstRecord.textHash,
      );
    }
    // Incremental observations before completion: distinct growing DOM texts
    // plus distinct proxy chunk arrivals (each chunk is one mid-stream network
    // event the page received before the turn completed).
    const incrementalObservations = incrementalSamples.length + Math.max(0, chunkArrivals.size - 1);
    expect(
      incrementalObservations,
      `at least 2 incremental observations before completion (dom=${incrementalSamples.length}, chunk-arrivals=${chunkArrivals.size})`,
    ).toBeGreaterThanOrEqual(2);
    await live.screenshot({ path: join(EVIDENCE_ROOT, 'screenshots', 'live-streaming.png') });

    // Case 1b: the contextual follow-up recovers the marker from history.
    const followupPrompt = 'What marker did I ask you to remember?';
    const followupBaseline = serve.requests.length;
    await textarea.fill(followupPrompt);
    await send.click();
    const followupTee = await waitForTee(serve.requests, followupBaseline, 30_000);
    expect(followupTee, 'the follow-up reached the backend').not.toBeNull();
    expect(
      await waitForTeeDone(serve.requests, followupBaseline, 180_000),
      'the follow-up stream completed',
    ).toBe(true);
    const followupRecord = followupTee
      ? await recordForStreamText(backend, followupTee.text, 60_000)
      : null;
    expect(followupRecord, 'follow-up produced a server record').not.toBeNull();
    expect(followupTee?.text ?? '', 'follow-up answer contains the nonce from history').toContain(
      MARKER,
    );
    expect(sha256(followupTee?.text ?? ''), 'follow-up hash matches the server record').toBe(
      followupRecord?.textHash,
    );

    // Case 2: endpoint loss surfaces a sanitized error; Retry completes fresh.
    const probePrompt = 'Reply with the single word pineapple.';
    await backend.stop();
    await textarea.fill(probePrompt);
    await send.click().catch(() => {});
    const retry = live.getByLabel('Retry', { exact: true });
    await retry.waitFor({ timeout: 30_000 });
    const alertText =
      (await live
        .getByRole('alert')
        .first()
        .textContent()
        .catch(() => null)) ?? '';
    expect(alertText.length, 'endpoint loss surfaces a visible error').toBeGreaterThan(0);
    expect(
      alertText.includes('sk-') || alertText.includes('OPENAI_API_KEY'),
      'error is sanitized',
    ).toBe(false);
    await live.screenshot({ path: join(EVIDENCE_ROOT, 'screenshots', 'live-endpoint-loss.png') });

    backend = await backend.restart({ model: 'gpt-4.1-mini-2025-04-14' });
    expect(backend.started, 'backend restarts through its lifecycle handle').toBe(true);
    const retryBaseline = serve.requests.length;
    await retry.click().catch(() => {});
    const retryTee = await waitForTee(serve.requests, retryBaseline, 30_000);
    expect(retryTee, 'the retry reached the restarted backend').not.toBeNull();
    expect(
      await waitForTeeDone(serve.requests, retryBaseline, 120_000),
      'the retry stream completed',
    ).toBe(true);
    const retryRecord = retryTee ? await recordForStreamText(backend, retryTee.text, 60_000) : null;
    expect(retryRecord, 'retry produced a fresh provider record').not.toBeNull();
    expect(retryRecord?.outcome, 'retry completed').toBe('completed');
    const pineappleCount = await live.getByText(probePrompt, { exact: true }).count();
    expect(pineappleCount, 'retry retains exactly one user turn').toBe(1);
    await live.screenshot({ path: join(EVIDENCE_ROOT, 'screenshots', 'live-recovered.png') });

    observed.conclusion = { href: conclusionHref, status: linkResponse.status(), useChatAdjacent };
    observed.firstTurn = {
      prompt: noncePrompt,
      envelopeId: firstTee?.envelopeId,
      responseId: firstRecord?.responseId,
      deltaCount: firstRecord?.deltaCount,
      textHash: firstRecord?.textHash,
      streamTextHash: sha256(firstTee?.text ?? ''),
      incrementalDomSamples: incrementalSamples.length,
      chunkArrivalObservations: chunkArrivals.size,
      incrementalObservations,
      usage: {
        inputTokens: firstRecord?.inputTokens,
        outputTokens: firstRecord?.outputTokens,
        totalTokens: firstRecord?.totalTokens,
      },
    };
    observed.followUp = {
      prompt: followupPrompt,
      envelopeId: followupTee?.envelopeId,
      answerContainsMarker: (followupTee?.text ?? '').includes(MARKER),
    };
    observed.endpointLoss = {
      probePrompt,
      alertText,
      sanitized: !alertText.includes('sk-') && !alertText.includes('OPENAI_API_KEY'),
      retryEnvelopeId: retryTee?.envelopeId,
      retryOutcome: retryRecord?.outcome,
      retainedUserTurns: pineappleCount,
    };
    observed.guide = {
      listeningLine: guideStdout.split('\n').find((l) => l.includes('LISTENING')) ?? '',
      probePort,
    };
    await context.close();
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => serve.server.close(() => resolve()));
    await backend.stop();
  }

  capture(`${project}-ac4`, { runTag: RUN_TAG, marker: MARKER, ...observed });
});

/** Minimal static serve for the seed consumers (no backend involved). */
async function serveStatic(
  distDir: string,
  port: number,
): Promise<{ server: Server; url: string }> {
  const MIME: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ttf': 'font/ttf',
  };
  const server = createServer((req, res) => {
    try {
      let path = (req.url ?? '/').split('?')[0];
      if (path === '/') path = '/index.html';
      let filePath = join(distDir, path);
      if (!existsSync(filePath) && !extname(path)) filePath = `${filePath}.html`;
      if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
      const body = readFileSync(filePath);
      res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  await new Promise<void>((resolve) => server.listen(port, '127.0.0.1', resolve));
  const actualPort = (server.address() as { port: number }).port;
  return { server, url: `http://127.0.0.1:${actualPort}` };
}
