import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-CONT-004 — the locked orientation flow FLOW-DOCS-01-getting-started-engine-decision.
 * Every test name carries the flow token, so the exact locked command selects the task
 * surface:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts \
 *     --grep FLOW-DOCS-01-getting-started-engine-decision
 *
 *   - "locked 6-step sequence" — AC-1: Introduction identity, the boundary link, all
 *     five Getting started routes with named bodies, exactly one engine question and
 *     one engine-decision TabGroup, both complete conversation commands inside their
 *     own panels, and deliberate engine selection through the real tabs.
 *   - "AC-1 reading floor" — chromium-nojs reads the same routes and both labeled
 *     panels with JavaScript genuinely disabled.
 *   - "AC-4 boundary search" — the real Pagefind dialog answers `transport` with the
 *     canonical boundary destination.
 *   - "AC-4 unknown-route recovery" — /docs/ori-cont-004-missing serves the authored
 *     404 manuscript and its onward links resolve.
 *   - "AC-4 claim ledger and content gates" — content-verification.md exists with the
 *     required coverage, the boundary's example link names the verified live run
 *     guide, and the real snippet / single-tutorial / dist-link gates pass on this
 *     candidate.
 *
 * Nothing is intercepted or manufactured: every body, link, dialog result and gate
 * output is read from the served preview, the real repository sources, or a real
 * subprocess over the committed gate scripts. Scoped to this repo's no-DOM-lib
 * tsconfig: `page.evaluate` callbacks read the browser through a
 * `globalThis as unknown as {...}` cast (search-contract.spec.ts precedent).
 */

const FLOW_TOKEN = 'FLOW-DOCS-01-getting-started-engine-decision';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision';
const LOCKED_COMMAND = `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep ${FLOW_TOKEN}`;
const CAPTURE_DIR = '.tmp/ORI-CONT-004/captures';

const GETTING_STARTED_ROUTES = [
  { path: '/docs/introduction', h1: 'Introduction', marker: 'copy-paste registry' },
  { path: '/docs/installation', h1: 'Installation', marker: 'Which engine does your project use?' },
  { path: '/docs/cli', h1: 'CLI', marker: 'URL contract' },
  { path: '/docs/theming', h1: 'Theming', marker: 'Token map' },
  { path: '/docs/dark-mode', h1: 'Dark mode', marker: 'owns its own appearance' },
] as const;

const NATIVEWIND_COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const UNIWIND_COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json';

const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const HEADER_SEARCH_TRIGGER = '[data-search-slot] button[aria-label="Search documentation"]';
const MANUSCRIPT_PATH = 'apps/docs/src/content/system/not-found.md';
const LEDGER_PATH = 'tests/sprint-05-orient-search/evidence/content-verification.md';
const LIVE_GUIDE_PATH = 'apps/example/docs/live-chat.md';

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

async function settle(page: Page, testInfo: TestInfo): Promise<void> {
  if (isNoJs(testInfo)) {
    await page.waitForLoadState('load');
    return;
  }
  await waitForAstroPageLoad(page);
}

function capture(testInfo: TestInfo, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

/** The whole rendered body text, whitespace-normalized. */
async function bodyText(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

/**
 * The engine TabGroup on /docs/installation: the one tablist whose tabs are the
 * engine tabs. Engine groups carry data-persistent="true" and tabs with
 * data-engine + an "<engine> engine" aria-label.
 */
async function engineTabGroup(page: Page) {
  const groups = page.locator('rnr-tab-group[data-persistent="true"]');
  const count = await groups.count();
  expect(
    count,
    'Installation carries exactly one persistent engine TabGroup (the InstallCommand)',
  ).toBe(1);
  return groups.first();
}

/** Count occurrences of a literal substring in the whole rendered document.
 * Uses textContent: a command inside the currently-hidden panel still counts —
 * the panel is server-rendered content, not absent. */
async function documentOccurrences(page: Page, needle: string): Promise<number> {
  return page.evaluate((text) => {
    const doc = (globalThis as unknown as { document: { body: { textContent: string } } }).document;
    const haystack = doc.body.textContent ?? '';
    let count = 0;
    let at = haystack.indexOf(text);
    while (at !== -1) {
      count += 1;
      at = haystack.indexOf(text, at + text.length);
    }
    return count;
  }, needle);
}

async function assertOrientationBodies(page: Page): Promise<void> {
  for (const route of GETTING_STARTED_ROUTES) {
    const response = await navigateLocalhost(page, route.path);
    expect(response?.status(), `${route.path} must return 200`).toBe(200);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    const text = await bodyText(page);
    expect(text.length, `${route.path} must render a substantive body`).toBeGreaterThan(400);
    expect(
      text.includes(route.marker),
      `${route.path} must carry its named body, not a shared-footer shell`,
    ).toBe(true);
  }
}

/** AC-1 case 1: the full reader path with real engine selection. */
async function assertEngineDecision(page: Page): Promise<void> {
  const response = await navigateLocalhost(page, '/docs/installation');
  expect(response?.status()).toBe(200);

  // Exactly one engine question.
  await expect(
    page.getByRole('heading', { name: /which engine does your project use\?/i }),
  ).toHaveCount(1);
  const installationText = await bodyText(page);
  expect(installationText.split('One question decides every command on this page').length - 1).toBe(
    1,
  );

  // The decision table maps project facts to engines.
  expect(installationText).toContain('NativeWind 4.2.6');
  expect(installationText).toContain('Tailwind v3');
  expect(installationText).toContain('Tailwind v4');
  expect(installationText).toContain('@theme');

  // Exactly one engine TabGroup; both tabs; deliberate selection both ways.
  const group = await engineTabGroup(page);
  const nativewindTab = group.locator('[role="tab"][data-engine="nativewind"]');
  const uniwindTab = group.locator('[role="tab"][data-engine="uniwind"]');
  await expect(nativewindTab).toHaveCount(1);
  await expect(uniwindTab).toHaveCount(1);

  const nativewindPanel = group.locator('[role="tabpanel"][data-engine="nativewind"]');
  const uniwindPanel = group.locator('[role="tabpanel"][data-engine="uniwind"]');

  await nativewindTab.click();
  await expect(nativewindPanel).toBeVisible();
  await expect(uniwindPanel).toBeHidden();
  await expect(nativewindPanel).toContainText(NATIVEWIND_COMMAND);

  await uniwindTab.click();
  await expect(uniwindPanel).toBeVisible();
  await expect(nativewindPanel).toBeHidden();
  await expect(uniwindPanel).toContainText(UNIWIND_COMMAND);

  // Each command occurs exactly once in the document — inside its own panel.
  expect(await documentOccurrences(page, NATIVEWIND_COMMAND)).toBe(1);
  expect(await documentOccurrences(page, UNIWIND_COMMAND)).toBe(1);
}

/** AC-1 case 2: the no-JavaScript reading floor over the same routes and panels. */
async function assertNoJsReadingFloor(page: Page): Promise<void> {
  for (const route of GETTING_STARTED_ROUTES) {
    const response = await navigateLocalhost(page, route.path);
    expect(response?.status(), `${route.path} must return 200 without JavaScript`).toBe(200);
    await expect(page.locator('main h1')).toHaveText(route.h1);
    const text = await bodyText(page);
    expect(text.length, `${route.path} must stay readable without JavaScript`).toBeGreaterThan(400);
  }

  // Both labeled panels render stacked and carry their complete commands.
  await navigateLocalhost(page, '/docs/installation');
  const nativewindPanel = page.locator('rnr-tab-group [role="tabpanel"][data-engine="nativewind"]');
  const uniwindPanel = page.locator('rnr-tab-group [role="tabpanel"][data-engine="uniwind"]');
  await expect(nativewindPanel).toContainText(NATIVEWIND_COMMAND);
  await expect(uniwindPanel).toContainText(UNIWIND_COMMAND);
  const nativewindLabel = await page.locator('[role="tab"][data-engine="nativewind"]').innerText();
  const uniwindLabel = await page.locator('[role="tab"][data-engine="uniwind"]').innerText();
  expect(nativewindLabel.trim()).toBe('nativewind');
  expect(uniwindLabel.trim()).toBe('uniwind');
}

test(`${FLOW_TOKEN}: locked 6-step sequence`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  if (isNoJs(testInfo)) {
    await assertNoJsReadingFloor(page);
    capture(testInfo, 'locked-sequence-nojs', {
      routes: GETTING_STARTED_ROUTES.map((r) => r.path),
    });
    return;
  }

  // Step 1: Introduction opens with the product identity.
  const introduction = await navigateLocalhost(page, '/docs/introduction');
  expect(introduction?.status()).toBe(200);
  await settle(page, testInfo);
  const introText = await bodyText(page);
  expect(introText).toContain('universal AI chat and agent UI components for React Native');
  expect(introText).toContain('copy-paste registry');
  expect(introText).toContain('not an npm package');

  // Step 2: the boundary link opens substantive ownership content.
  await page.locator('main a[href="/docs/owns-vs-does-not-own"]').first().click();
  await settle(page, testInfo);
  expect(new URL(page.url()).pathname).toBe('/docs/owns-vs-does-not-own');
  await expect(page.locator('main h1')).toHaveText('What the library owns');
  const boundaryText = await bodyText(page);
  for (const owned of ['transcript state', 'transport', 'streaming client', 'tool execution']) {
    expect(boundaryText, `the boundary must name the consumer-owned ${owned}`).toContain(owned);
  }
  expect(boundaryText, 'the boundary must keep registry UI on the library side').toContain(
    'prop-driven',
  );

  // Steps 3-6: all five routes, the engine decision, and both commands.
  await assertOrientationBodies(page);
  await assertEngineDecision(page);
  capture(testInfo, 'locked-sequence', { url: page.url() });
});

test(`${FLOW_TOKEN}: AC-4 boundary search answers transport`, async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  if (isNoJs(testInfo)) {
    // The no-JavaScript floor follows Introduction's boundary link instead.
    await navigateLocalhost(page, '/docs/introduction');
    await page.locator('main a[href="/docs/owns-vs-does-not-own"]').first().click();
    await page.waitForLoadState('load');
    const text = await bodyText(page);
    for (const owned of ['transcript state', 'transport', 'streaming client', 'tool execution']) {
      expect(text).toContain(owned);
    }
    capture(testInfo, 'ac4-boundary-nojs', { via: 'introduction link' });
    return;
  }

  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  await page.locator(HEADER_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });

  await page.locator(SEARCH_INPUT).fill('transport');
  await expect
    .poll(async () =>
      page.evaluate(() => [
        ...((globalThis as unknown as { __rnrSearchSettledQueries?: string[] })
          .__rnrSearchSettledQueries ?? []),
      ]),
    )
    .toContain('transport');

  const hrefs = await page
    .locator(SEARCH_RESULT_LINK)
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
  expect(hrefs, 'the transport query must surface the canonical boundary destination').toContain(
    '/docs/owns-vs-does-not-own/',
  );

  // Keyboard-select the boundary result and follow it.
  const count = await page.locator(SEARCH_RESULT_LINK).count();
  let activated = false;
  for (let attempt = 0; attempt < count + 1 && !activated; attempt += 1) {
    const activeHref = await page.evaluate(() => {
      const g = globalThis as unknown as {
        document: {
          querySelector(selector: string): { getAttribute(name: string): string | null } | null;
        };
      };
      return g.document
        .querySelector('dialog[aria-modal="true"] a[data-search-result][data-active="true"]')
        ?.getAttribute('href');
    });
    if (activeHref === '/docs/owns-vs-does-not-own/') {
      activated = true;
      break;
    }
    await page.keyboard.press('ArrowDown');
  }
  expect(activated, 'the boundary result must be keyboard-activatable').toBe(true);
  await page.keyboard.press('Enter');
  await settle(page, testInfo);
  expect(new URL(page.url()).pathname).toBe('/docs/owns-vs-does-not-own/');
  await expect(page.locator('main h1')).toHaveText('What the library owns');
  capture(testInfo, 'ac4-boundary-search', { query: 'transport', hrefs });
});

test(`${FLOW_TOKEN}: AC-4 unknown-route recovery`, async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const response = await navigateLocalhost(page, '/docs/ori-cont-004-missing');
  expect(response?.status(), 'the unknown route must be a real 404').toBe(404);
  await settle(page, testInfo);

  // The served copy is the authored manuscript.
  const manuscript = readFileSync(join(process.cwd(), MANUSCRIPT_PATH), 'utf8');
  expect(manuscript).toContain('# Page not found');
  await expect(page.locator('main h1')).toHaveText('Page not found');
  const recoveryText = await bodyText(page);
  expect(recoveryText).toContain('The page you requested could not be found.');
  expect(recoveryText).toContain('Search documentation for the topic you need');

  // The authored onward controls: the recovery search trigger plus the plain
  // Components and Registry links. Each link resolves to a real destination.
  const componentsHref = await page
    .locator('main .not-found__links a[href="/components"]')
    .getAttribute('href');
  expect(componentsHref).toBe('/components');
  const registryHref = await page
    .locator('main .not-found__links a[href="/registry"]')
    .getAttribute('href');
  expect(registryHref).toBe('/registry');

  const components = await navigateLocalhost(page, '/components');
  expect(components?.status(), '/components must return 200').toBe(200);
  await expect(page.locator('main h1')).toBeVisible();
  const registry = await navigateLocalhost(page, '/registry');
  expect(registry?.status(), '/registry must return 200').toBe(200);
  capture(testInfo, 'ac4-recovery', { unknown: '/docs/ori-cont-004-missing' });
});

test(`${FLOW_TOKEN}: AC-4 claim ledger and content gates`, async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const repoRoot = process.cwd();

  // The claim ledger exists and covers every authored surface.
  const ledgerPath = join(repoRoot, LEDGER_PATH);
  expect(existsSync(ledgerPath), 'content-verification.md must exist').toBe(true);
  const ledger = readFileSync(ledgerPath, 'utf8');
  for (const surface of [
    'introduction.md',
    'installation.mdx',
    'cli.md',
    'theming.mdx',
    'dark-mode.md',
    'quickstart.mdx',
    'owns-vs-does-not-own.md',
    'not-found.md',
    'live-chat.md',
    'apps/example/README.md',
  ]) {
    expect(ledger, `the ledger must map ${surface}`).toContain(surface);
  }
  for (const quadrant of ['explanation', 'how-to', 'reference', 'tutorial']) {
    expect(ledger, 'the ledger must record quadrant checks').toContain(quadrant);
  }

  // The boundary page links the verified live run guide, and the guide exists.
  const boundarySource = readFileSync(
    join(repoRoot, 'apps/docs/src/content/docs/owns-vs-does-not-own.md'),
    'utf8',
  );
  expect(
    boundarySource.includes(LIVE_GUIDE_PATH),
    'the boundary must link apps/example/docs/live-chat.md',
  ).toBe(true);
  expect(existsSync(join(repoRoot, LIVE_GUIDE_PATH)), 'the live run guide must exist').toBe(true);
  if (!isNoJs(testInfo)) {
    await navigateLocalhost(page, '/docs/owns-vs-does-not-own');
    await settle(page, testInfo);
    const guideHref = await page
      .locator(`main a[href*="${LIVE_GUIDE_PATH}"]`)
      .first()
      .getAttribute('href');
    expect(guideHref, 'the rendered boundary must carry the live-guide link').toContain(
      LIVE_GUIDE_PATH,
    );
  }

  // Real content gates over this candidate: snippet and dist-link CLIs.
  const gateResults: Record<string, { exit: number; tail: string }> = {};
  for (const [name, script] of [
    ['snippet', 'check:snippets'],
    ['dist-link', 'check:links'],
  ] as const) {
    try {
      execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'run', script], {
        cwd: repoRoot,
        stdio: 'pipe',
        timeout: 240_000,
        encoding: 'utf8',
      });
      gateResults[name] = { exit: 0, tail: 'ok' };
    } catch (error) {
      const err = error as { status?: number; stdout?: string; stderr?: string };
      gateResults[name] = {
        exit: err.status ?? 1,
        tail: `${err.stdout ?? ''}${err.stderr ?? ''}`.slice(-2000),
      };
    }
    expect(gateResults[name].exit, `the ${name} gate must pass on this candidate`).toBe(0);
  }

  // The single-tutorial gate over the real published collection. The import is
  // dynamic: a candidate predating the gate module must fail on the ledger
  // assertion above (functional), not on a module-load error.
  const { singleTutorialViolations } = await import('../../scripts/docs-data/single-tutorial');
  const docsDir = join(repoRoot, 'apps/docs/src/content/docs');
  const entries = readdirSync(docsDir)
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .map((name) => {
      const raw = readFileSync(join(docsDir, name), 'utf8');
      const draft = /^draft:\s*true\s*$/m.test(raw);
      const tutorial = /^tutorial:\s*true\s*$/m.test(raw);
      return {
        id: name.replace(/\.mdx?$/, ''),
        filePath: join(docsDir, name),
        data: { draft, tutorial },
      };
    });
  const violations = singleTutorialViolations(entries);
  expect(
    violations,
    'the single-tutorial gate must pass (exactly one published tutorial, at /docs/quickstart)',
  ).toEqual([]);

  capture(testInfo, 'ac4-ledger-gates', { gateResults, tutorialEntries: entries.length });
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

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-cont-004-${Date.now()}`,
    flow: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      introduction: hashFile('apps/docs/src/content/docs/introduction.md'),
      installation: hashFile('apps/docs/src/content/docs/installation.mdx'),
      cli: hashFile('apps/docs/src/content/docs/cli.md'),
      theming: hashFile('apps/docs/src/content/docs/theming.mdx'),
      darkMode: hashFile('apps/docs/src/content/docs/dark-mode.md'),
      quickstart: hashFile('apps/docs/src/content/docs/quickstart.mdx'),
      ownsVsDoesNotOwn: hashFile('apps/docs/src/content/docs/owns-vs-does-not-own.md'),
      notFound: hashFile('apps/docs/src/content/system/not-found.md'),
      liveChatGuide: hashFile('apps/example/docs/live-chat.md'),
      exampleReadme: hashFile('apps/example/README.md'),
      testFile: hashFile('tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      distIntroduction: hashFile('apps/docs/dist/docs/introduction/index.html'),
      distInstallation: hashFile('apps/docs/dist/docs/installation/index.html'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
    },
    ledger: LEDGER_PATH,
    references: [
      'tests/sprint-05-orient-search/evidence/content-verification.md',
      'tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
