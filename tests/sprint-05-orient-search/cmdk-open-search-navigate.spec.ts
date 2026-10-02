import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-AST-010 AC-3 — FLOW-SHELL-07: complete search navigation, indexing,
 * focus and 404 recovery. The full post-integration journey: keyboard search
 * opens BEFORE any Pagefind request (structural ordering on the page's own
 * clock — an island that gates opening on the index fails by construction),
 * real grouped
 * results reach boundary and item destinations, indexed props and verdict
 * literals are searchable, the real custom 404 recovers through the shared
 * search AND through plain links without JavaScript.
 */

const FLOW_TOKEN = 'FLOW-SHELL-07-cmdk-open-search-navigate';
const CAPTURE_DIR = '.tmp/ORI-AST-010/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate';

const SEARCH_TRIGGER = '[data-search-slot] button[aria-haspopup="dialog"]';
const RECOVERY_TRIGGER = '[data-recovery-search]';
const SEARCH_DIALOG = 'dialog[aria-modal="true"]';
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_STATUS = 'dialog[aria-modal="true"] [data-search-status]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const PAGEFIND_URL = /\/pagefind\//;

const ITEM_DESTINATIONS = [
  '/components/message',
  '/components/conversation',
  '/components/item',
  '/components/stack-trace-parser',
  '/components/streamdown',
] as const;
const DOC_DESTINATIONS = ['/docs/introduction', '/docs/installation', '/docs/owns-vs-does-not-own'];
const DESTINATION_QUERIES: Record<string, string> = {
  '/components/message': 'message',
  '/components/conversation': 'conversation',
  '/components/item': 'item',
  '/components/stack-trace-parser': 'stack trace parser',
  '/components/streamdown': 'streamdown',
  '/docs/introduction': 'introduction',
  '/docs/installation': 'installation',
  '/docs/owns-vs-does-not-own': 'what the library owns',
};

function queryForDestination(destination: string): string {
  return DESTINATION_QUERIES[destination] ?? destination.split('/').pop() ?? destination;
}

interface RequestLog {
  urls: string[];
  pagefind: string[];
}

/** Observation-only request capture. Attach BEFORE the first navigation. */
function trackRequests(page: Page): RequestLog {
  const log: RequestLog = { urls: [], pagefind: [] };
  page.on('request', (request) => {
    const url = request.url();
    log.urls.push(url);
    if (PAGEFIND_URL.test(url)) log.pagefind.push(url);
  });
  return log;
}

function platformShortcut(): string {
  return process.platform === 'darwin' ? 'Meta+K' : 'Control+K';
}

function capture(testInfo: { project: { name: string } }, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

/** The island's own activation-to-visible measurement (independent witness). */
async function islandOpenMs(page: Page): Promise<number> {
  return page.evaluate(
    () => (globalThis as unknown as { __rnrSearchLastOpenMs?: number }).__rnrSearchLastOpenMs ?? -1,
  );
}

/** Wait for the real Pagefind module to finish initializing in the page. */
async function awaitPagefindReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (globalThis as unknown as { __rnrSearchReady?: boolean }).__rnrSearchReady === true,
    undefined,
    { timeout: 20_000 },
  );
}

/** Type a query and wait for the island to settle that exact query. */
async function search(page: Page, query: string): Promise<void> {
  await page.locator(SEARCH_INPUT).fill(query);
  await expect
    .poll(async () =>
      page.evaluate(() => [
        ...((globalThis as unknown as { __rnrSearchSettledQueries?: string[] })
          .__rnrSearchSettledQueries ?? []),
      ]),
    )
    .toContain(query);
}

async function resultHrefs(page: Page): Promise<string[]> {
  return page
    .locator(SEARCH_RESULT_LINK)
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
}

async function announcedCount(page: Page): Promise<number> {
  const text = (await page.locator(SEARCH_STATUS).innerText()) ?? '';
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : -1;
}

/** Press ArrowDown until the given destination is the active result. */
async function activateResult(page: Page, href: string): Promise<void> {
  const links: Locator = page.locator(SEARCH_RESULT_LINK);
  const count = await links.count();
  expect(count, `a result for ${href} must exist among the search results`).toBeGreaterThan(0);
  for (let attempt = 0; attempt < count + 1; attempt += 1) {
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
    if (activeHref === href) return;
    await page.keyboard.press('ArrowDown');
  }
  throw new Error(
    `could not activate ${href}; results were ${JSON.stringify(await resultHrefs(page))}`,
  );
}

/** Open the active result with Enter and settle on the real destination. */
async function followActiveResult(page: Page): Promise<void> {
  await page.keyboard.press('Enter');
  await page.waitForLoadState('load');
  await waitForAstroPageLoad(page);
}

/** The document's own HTTP status, read inside the real page. */
async function fetchCurrentStatus(page: Page): Promise<number> {
  return page.evaluate(() =>
    (
      globalThis as unknown as {
        fetch(url: string): Promise<{ status: number }>;
        location: { href: string };
      }
    )
      .fetch((globalThis as unknown as { location: { href: string } }).location.href)
      .then((response) => response.status),
  );
}

/** A run-specific unknown /docs/ path no route ever serves. */
function unknownPath(): string {
  return `/docs/not-found-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

test(`${FLOW_TOKEN}`, async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const soft = expect.soft;
  const log = trackRequests(page);
  const shortcut = platformShortcut();
  const observedCategories = new Set<string>();

  if (testInfo.project.name === 'chromium-nojs') {
    // -- JavaScript-disabled journey: links and real 404 recovery only -------
    const intro = await navigateLocalhost(page, '/docs/introduction');
    soft(intro?.status(), 'no-JS /docs/introduction responds 200').toBe(200);
    const introText = (
      await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })
    ).replace(/\s+/g, ' ');
    soft(introText.length, 'no-JS introduction renders readable content').toBeGreaterThan(200);

    // Follow actual documentation links.
    const navLink = page.locator('a[href="/docs/installation"]').first();
    soft(await navLink.isVisible(), 'a real documentation link to Installation is present').toBe(
      true,
    );
    await navLink.click();
    await page.waitForLoadState('load');
    soft(
      page.url().includes('/docs/installation'),
      'no-JS documentation link reaches /docs/installation',
    ).toBe(true);
    soft(
      (await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })).length,
      'no-JS installation renders readable content',
    ).toBeGreaterThan(200);

    // Fresh unknown path: the real custom 404, then recovery links.
    const response = await navigateLocalhost(page, unknownPath());
    soft(response?.status(), 'the fresh unknown path serves the real 404').toBe(404);
    const recoveryLinks = page.locator(
      'main a[href="/components"], main a[href="/components/message"]',
    );
    soft(await recoveryLinks.count(), 'the real 404 carries usable recovery links').toBeGreaterThan(
      0,
    );
    await page.locator('main a[href="/components"]').first().click({ timeout: 10_000 });
    await page.waitForLoadState('load');
    const componentsStatus = await fetchCurrentStatus(page);
    soft(componentsStatus, 'no-JS recovery navigates through real links').toBe(200);
    await page.locator('a[href="/components/message"]').first().click();
    await page.waitForLoadState('load');
    soft(page.url().includes('/components/message'), 'no-JS recovery reaches Message').toBe(true);
    soft(await fetchCurrentStatus(page), 'the recovered Message destination responds 200').toBe(
      200,
    );
    const messageText = (await page.locator('[data-pagefind-body]').innerText()).replace(
      /\s+/g,
      ' ',
    );
    soft(messageText.length, 'the recovered Message surface is readable').toBeGreaterThan(200);
    soft(
      log.pagefind,
      'the complete no-JavaScript journey requests zero Pagefind resources',
    ).toEqual([]);
    capture(testInfo, FLOW_TOKEN, { journey: 'nojs', pagefindRequests: log.pagefind });
    return;
  }

  // -- Step 1: open /docs/introduction; platform shortcut opens search -------
  // Structural ordering witness: stamp the page's own clock the moment the
  // dialog first gains [open] (MutationObserver microtask runs before the
  // island's next task, so the stamp precedes any fetch the island starts
  // AFTER opening). The first /pagefind/ resource startTime is read from the
  // same performance timeline. A gating mutant — showModal deferred until the
  // Pagefind module resolves — inverts the order and fails this assertion;
  // a self-reported duration cannot be moved to hide it.
  const openStart = Date.now();
  await page.addInitScript(() => {
    const g = globalThis as unknown as {
      document: { querySelector(selector: string): { open: boolean } | null };
      MutationObserver: new (
        callback: () => void,
      ) => { observe(target: unknown, options: unknown): void };
      performance: { now(): number };
    };
    const stamp = (): void => {
      const dialog = g.document.querySelector('dialog[aria-modal="true"]');
      if (dialog?.open) {
        (globalThis as unknown as { __s05DialogOpenAt?: number }).__s05DialogOpenAt =
          g.performance.now();
      }
    };
    new g.MutationObserver(stamp).observe(g.document, {
      subtree: true,
      attributes: true,
      attributeFilter: ['open'],
    });
  });
  const intro = await navigateLocalhost(page, '/docs/introduction');
  expect(
    intro?.status(),
    'the integrated candidate must serve /docs/introduction with HTTP 200',
  ).toBe(200);
  await waitForAstroPageLoad(page);
  await page.keyboard.press(shortcut);
  await page.locator(`${OPEN_SEARCH_DIALOG}`).waitFor({ state: 'visible', timeout: 5_000 });
  const harnessDelta = Date.now() - openStart;
  const islandDelta = await islandOpenMs(page);
  soft(await page.locator(SEARCH_DIALOG).getAttribute('aria-modal'), 'native modal dialog').toBe(
    'true',
  );
  // Focus is asserted BEFORE the index-ready await: the dialog focuses its
  // input on its own activation clock, never gated on Pagefind.
  await expect(page.locator(SEARCH_INPUT)).toBeFocused();
  await awaitPagefindReady(page);
  const ordering = await page.evaluate(() => {
    const g = globalThis as unknown as {
      performance: {
        getEntriesByType(type: string): ArrayLike<{ name: string; startTime: number }>;
      };
    };
    let pagefindStart = -1;
    for (const entry of Array.from(g.performance.getEntriesByType('resource'))) {
      if (entry.name.includes('/pagefind/')) {
        pagefindStart = entry.startTime;
        break;
      }
    }
    return {
      openAt: (globalThis as unknown as { __s05DialogOpenAt?: number }).__s05DialogOpenAt ?? -1,
      pagefindStart,
    };
  });
  soft(
    ordering.openAt,
    'the in-page witness recorded the dialog reaching [open]',
  ).toBeGreaterThanOrEqual(0);
  soft(
    ordering.pagefindStart,
    'the page recorded a real /pagefind/ resource on its own timeline',
  ).toBeGreaterThanOrEqual(0);
  soft(
    ordering.openAt < ordering.pagefindStart,
    `STRUCTURAL ORDERING: dialog [open] at ${ordering.openAt.toFixed(1)}ms must precede the first /pagefind/ request at ${ordering.pagefindStart.toFixed(1)}ms — opening may never be gated on the index`,
  ).toBe(true);

  // -- Step 2: streamdown — grouped results, announced count, Enter -----------
  await search(page, 'streamdown');
  const streamdownCount = await page.locator(SEARCH_RESULT_LINK).count();
  soft(streamdownCount, 'streamdown returns real results').toBeGreaterThan(0);
  soft(await announcedCount(page), 'aria-live count equals the rendered result count').toBe(
    streamdownCount,
  );
  const groupIdentifiers = await page
    .locator('dialog[aria-modal="true"] [data-search-group]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-category') ?? ''));
  for (const category of groupIdentifiers) observedCategories.add(category);
  const streamdownHrefs = await resultHrefs(page);
  soft(
    streamdownHrefs.some((href) => href.startsWith('/components/')),
    'streamdown results carry the components group identity',
  ).toBe(true);
  await activateResult(page, '/components/streamdown/');
  await followActiveResult(page);
  soft(page.url(), 'Enter navigates the highlighted result').toMatch(
    /\/components\/streamdown\/?$/,
  );
  soft(await fetchCurrentStatus(page), 'the streamdown destination responds 200').toBe(200);
  soft(
    (await page.getByRole('heading', { level: 1 }).innerText()).toLowerCase(),
    'the streamdown destination carries relevant text',
  ).toContain('streamdown');

  // -- Step 3: renderMarkdown — boundary + applicable item --------------------
  await page.keyboard.press(shortcut);
  await search(page, 'renderMarkdown');
  const renderMarkdownHrefs = await resultHrefs(page);
  soft(renderMarkdownHrefs, 'renderMarkdown answers with the boundary page').toContain(
    '/docs/owns-vs-does-not-own/',
  );
  soft(
    renderMarkdownHrefs.filter((href) => href.startsWith('/components/')).length,
    'renderMarkdown answers with an applicable item result',
  ).toBeGreaterThan(0);
  await activateResult(page, '/docs/owns-vs-does-not-own/');
  await followActiveResult(page);
  soft(await fetchCurrentStatus(page), 'the boundary destination responds 200').toBe(200);
  const boundaryText = (await page.locator('[data-pagefind-body]').innerText()).replace(
    /\s+/g,
    ' ',
  );
  soft(boundaryText, 'the boundary destination carries the renderMarkdown prose').toContain(
    'renderMarkdown',
  );
  soft(boundaryText.length, 'the boundary destination renders substantive prose').toBeGreaterThan(
    200,
  );

  // -- Step 4: dev client — boundary + applicable item ------------------------
  await page.keyboard.press(shortcut);
  await search(page, 'dev client');
  const devClientHrefs = await resultHrefs(page);
  soft(devClientHrefs, 'dev client answers with the boundary page').toContain(
    '/docs/owns-vs-does-not-own/',
  );
  soft(
    devClientHrefs.filter((href) => href.startsWith('/components/')).length,
    'dev client answers with an applicable item result',
  ).toBeGreaterThan(0);
  const devClientItem = devClientHrefs.find((href) => href.startsWith('/components/'));
  if (devClientItem) {
    await activateResult(page, devClientItem);
    await followActiveResult(page);
    soft(await fetchCurrentStatus(page), `the dev-client item ${devClientItem} responds 200`).toBe(
      200,
    );
    soft(
      (await page.locator('[data-pagefind-body]').innerText()).replace(/\s+/g, ' '),
      'the dev-client item destination carries relevant text',
    ).toContain('dev client');
  } else {
    soft(devClientItem, 'a dev-client item destination exists').toBeTruthy();
  }

  // -- Step 5: five item and three documentation destinations ----------------
  const destinationProof: Record<string, { status: number; title: string }> = {};
  for (const destination of [...ITEM_DESTINATIONS, ...DOC_DESTINATIONS]) {
    await page.keyboard.press(shortcut);
    await search(page, queryForDestination(destination));
    const categories = await page
      .locator(SEARCH_RESULT_LINK)
      .evaluateAll((links) => links.map((link) => link.getAttribute('data-category') ?? ''));
    for (const category of categories) observedCategories.add(category);
    await activateResult(page, `${destination}/`);
    await followActiveResult(page);
    destinationProof[destination] = {
      status: await fetchCurrentStatus(page),
      title: await page.getByRole('heading', { level: 1 }).innerText(),
    };
  }
  for (const category of ['components', 'ui', 'lib', 'pages']) {
    soft(
      [...observedCategories],
      `real index results represent the ${category} group identity`,
    ).toContain(category);
  }
  for (const [destination, proof] of Object.entries(destinationProof)) {
    soft(proof.status, `${destination} responds 200 through its real search result`).toBe(200);
    soft(proof.title.length, `${destination} renders a real title`).toBeGreaterThan(0);
  }

  // -- Step 6: indexed props and verdict literals -----------------------------
  await page.keyboard.press(shortcut);
  await search(page, 'nearBottomThreshold');
  soft(await resultHrefs(page), 'the nearBottomThreshold prop is searchable').toContain(
    '/components/conversation/',
  );
  await search(page, 'runs in Expo Go');
  soft(
    (await resultHrefs(page)).length,
    'the actual verdict literal is searchable in the production index',
  ).toBeGreaterThan(0);

  // -- Step 7: fresh unknown path, custom 404, search recovery to Message -----
  const notFoundResponse = await navigateLocalhost(page, unknownPath());
  soft(notFoundResponse?.status(), 'a fresh unknown path returns the real custom 404').toBe(404);
  await page.locator(RECOVERY_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  await awaitPagefindReady(page);
  await search(page, 'message');
  await activateResult(page, '/components/message/');
  await followActiveResult(page);
  soft(page.url(), 'the 404 recovery search reaches Message').toMatch(/\/components\/message\/?$/);
  soft(await fetchCurrentStatus(page), 'the recovered Message destination responds 200').toBe(200);

  // -- Step 8: Escape dismisses the reopened dialog; focus returns ------------
  await page.locator(SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();

  capture(testInfo, FLOW_TOKEN, {
    shortcut,
    harnessOpenDeltaMs: harnessDelta,
    islandOpenMs: islandDelta,
    dialogOpenAtMs: ordering.openAt,
    pagefindResourceStartMs: ordering.pagefindStart,
    streamdownCount,
    groupIdentifiers,
    observedCategories: [...observedCategories],
    destinationProof,
    pagefindRequests: log.pagefind.length,
  });
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

let anyFailure = false;

// Playwright requires the fixtures object destructuring pattern in hook
// callbacks; the empty pattern is the only form that needs no fixture.
// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-ast-010-flow-shell-07-${Date.now()}`,
    flowToken: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      searchDialogIsland: hashFile('apps/docs/src/components/islands/SearchDialog.astro'),
      searchDialogScript: hashFile('apps/docs/src/scripts/search-dialog.ts'),
      recoverySurface: hashFile('apps/docs/src/pages/404.astro'),
      searchIndexScript: hashFile('scripts/docs-data/search-index.ts'),
      testFile: hashFile('tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      driver: hashFile('tests/harness/docs-preview.ts'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-010/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
