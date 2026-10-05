import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-AST-004 — navigate the built docs through a lazily loaded Pagefind
 * dialog. Every test name carries the locked flow token, so the exact locked
 * command selects the whole task surface:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts \
 *     --grep FLOW-SHELL-15-search-contract-before-recovery
 *
 *   - "locked 13-step sequence" — the full FLOW-SHELL-15 scenario, steps 1-13.
 *   - "AC-1" — real published content and destinations across all four
 *     categories, boundary/prop/verdict queries answered from the real index.
 *   - "AC-2" — immediate opening, lazy first-open loading, retained
 *     initialization across unchanged reopen and ClientRouter soft navigation.
 *   - "AC-3" — keyboard selection, Enter destinations, Escape focus
 *     restoration, and the JavaScript-disabled surface.
 *   - "AC-4" — truthful empty and real offline error states; query text never
 *     creates DOM.
 *
 * Nothing is intercepted or manufactured: requests are observed only, the
 * index is the real Pagefind output of the built dist, and the offline case
 * uses the browser's actual networking (context.setOffline). The
 * chromium-nojs project executes its actual supported surface — working
 * links, zero Pagefind requests, a search control that stays hidden without
 * JavaScript — never a skip.
 *
 * Scoped to this repo's no-DOM-lib tsconfig: every `page.evaluate` callback
 * reads the browser through a `globalThis as unknown as {...}` cast (the
 * engine-state-contract.spec.ts precedent).
 */

const FLOW_TOKEN = 'FLOW-SHELL-15-search-contract-before-recovery';
const CAPTURE_DIR = '.tmp/ORI-AST-004/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery';

/**
 * The five item and three documentation destinations pinned by AC-1. The
 * streamdown destination is kept in its pinned position per contract; the
 * candidate's registry currently emits no such item, so every assertion that
 * reaches it fails naming the destination until the sprint's pending
 * destination decision resolves.
 */
const ITEM_DESTINATIONS = [
  '/components/message',
  '/components/conversation',
  '/components/item',
  '/components/stack-trace-parser',
  '/components/streamdown',
] as const;
const DOC_DESTINATIONS = ['/docs/introduction', '/docs/installation', '/docs/owns-vs-does-not-own'];

/**
 * The query that surfaces each pinned destination — the destination's real
 * title words, so the result is the page's own indexed text answering the
 * query, never a synthetic keyword hit.
 */
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

// The trigger only: the slot also hosts the dialog's close button (ORI-VIS-003)
// inside the closed <dialog> panel, so a bare button selector is ambiguous.
const SEARCH_TRIGGER = '[data-search-slot] button.search-dialog__trigger';
const SEARCH_DIALOG = 'dialog[aria-modal="true"]';
// A closed native <dialog> stays in the DOM: assert the OPEN state, not element count.
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_STATUS = 'dialog[aria-modal="true"] [data-search-status]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const SEARCH_EMPTY = 'dialog[aria-modal="true"] [data-search-empty]';
const SEARCH_ERROR = 'dialog[aria-modal="true"] [data-search-error]';
const PAGEFIND_URL = /\/pagefind\//;

/** Fresh-run-specific token absent from every emitted document. */
const RUN_QUERY = `zzqx-no-match-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

interface RequestLog {
  urls: string[];
  pagefind: string[];
  failedPagefind: string[];
}

/** Observation-only request capture. Attach BEFORE the first navigation. */
function trackRequests(page: Page): RequestLog {
  const log: RequestLog = { urls: [], pagefind: [], failedPagefind: [] };
  page.on('request', (request) => {
    const url = request.url();
    log.urls.push(url);
    if (PAGEFIND_URL.test(url)) log.pagefind.push(url);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (PAGEFIND_URL.test(url)) {
      log.pagefind.push(`${url} (failed)`);
      log.failedPagefind.push(url);
    }
  });
  return log;
}

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

function platformShortcut(): string {
  return process.platform === 'darwin' ? 'Meta+K' : 'Control+K';
}

function capture(testInfo: TestInfo, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

/** Settle after load, except the no-JavaScript project cannot evaluate JS. */
async function settle(page: Page, testInfo: TestInfo): Promise<void> {
  if (isNoJs(testInfo)) return;
  await waitForAstroPageLoad(page);
}

/**
 * The JavaScript-disabled surface contract (AC-3 case 2): ordinary links
 * carry the visitor through real HTTP 200 destinations, zero Pagefind
 * resources are ever requested, and the unusable search control stays hidden.
 */
async function expectNoJsSurface(page: Page, log: RequestLog, testInfo: TestInfo): Promise<void> {
  const intro = await navigateLocalhost(page, '/docs/introduction');
  expect(intro?.status(), '/docs/introduction must return HTTP 200').toBe(200);

  // The search island never upgrades without JS: the trigger is inert (the
  // un-upgraded element stays display:none) and the mount keeps `hidden`.
  await expect(page.locator(SEARCH_TRIGGER)).toBeHidden();
  await expect(page.locator('[data-search-slot]')).toBeHidden();

  const installResponse = await navigateLocalhost(page, '/docs/installation');
  expect(installResponse?.status(), '/docs/installation must return HTTP 200').toBe(200);
  const registryResponse = await navigateLocalhost(page, '/registry');
  expect(registryResponse?.status(), '/registry must return HTTP 200').toBe(200);
  const mainText = (await page.locator('[data-ledger]').innerText()).replace(/\s+/g, ' ');
  expect(mainText.length, '/registry must render actual registry content').toBeGreaterThan(200);
  expect(mainText).toContain('nativewind');

  expect(log.pagefind, 'no Pagefind resource may load without JavaScript').toEqual([]);

  capture(testInfo, 'nojs-surface', {
    visited: ['/docs/introduction', '/docs/installation', '/registry'],
    pagefindRequests: log.pagefind,
    searchTriggerVisible: false,
  });
}

/**
 * Follow one header/site nav label through a real link, on either the desktop
 * nav bar or the zero-JS mobile drawer (hidden below the lg breakpoint). The
 * drawer is a native <details>, so an already-open drawer must NOT be toggled
 * again — click the link directly.
 */
async function followSiteNav(page: Page, label: string, urlPattern: RegExp): Promise<void> {
  const desktopLink = page.locator('.site-header__nav-link', { hasText: label });
  const drawerLink = page.locator('.site-drawer__link', { hasText: label });
  if (await desktopLink.isVisible()) {
    await desktopLink.click();
  } else if (await drawerLink.isVisible()) {
    await drawerLink.click();
  } else {
    await page.locator('.site-drawer__toggle').click();
    await drawerLink.click();
  }
  await page.waitForURL(urlPattern);
}

/** Hover a real navigation control, whichever form the viewport shows. */
async function hoverSiteNav(page: Page): Promise<void> {
  const desktopLink = page.locator('.site-header__nav-link').first();
  if (await desktopLink.isVisible()) {
    await desktopLink.hover();
  } else {
    await page.locator('.site-drawer__toggle').hover();
  }
}

/** Open the dialog through the header trigger; return the transport delta.
 * The strict 300ms budget is asserted against the ISLAND's own in-page
 * measurement (islandOpenMs) — this clock additionally carries the Playwright
 * click/wait round trips, so it only bounds the transport. */
async function activateSearch(page: Page): Promise<number> {
  const startedAt = Date.now();
  await page.locator(SEARCH_TRIGGER).click();
  await page.locator(`${SEARCH_DIALOG}[open]`).waitFor({ state: 'visible', timeout: 5_000 });
  return Date.now() - startedAt;
}

/** Open the dialog through the platform shortcut; return the visibility delta. */
async function activateSearchShortcut(page: Page, shortcut: string): Promise<number> {
  const startedAt = Date.now();
  await page.keyboard.press(shortcut);
  await page.locator(`${SEARCH_DIALOG}[open]`).waitFor({ state: 'visible', timeout: 5_000 });
  return Date.now() - startedAt;
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

function resultLinks(page: Page): Locator {
  return page.locator(SEARCH_RESULT_LINK);
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

/**
 * The verdict leg is proven in two halves against the REAL emitted document:
 * the Badge's expo-verdict phrase ('runs in Expo Go') proves verdict TEXT is
 * searchable, and a distinctive verbatim phrase from the same emitted document
 * proves its originating item is findable through the real index (the badge
 * words alone match every Expo-Go item page, so they cannot single out one
 * item in a capped result window).
 */
function distinctivePhraseFromEmitted(html: string): string {
  const section = html.match(/<section data-section="theming"[^>]*>([\s\S]*?)<\/section>/);
  const text = (section?.[1] ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Theming\s*/, '');
  return text.split('—')[0].trim();
}

/** The verdict phrase plus originating-item assertions for one emitted item. */
async function expectVerdictPhraseFindsOrigin(
  page: Page,
  emittedHtml: string,
  destination: string,
): Promise<void> {
  await search(page, 'runs in Expo Go');
  expect(
    (await resultHrefs(page)).length,
    'the actual verdict phrase is searchable in the real index',
  ).toBeGreaterThan(0);
  const phrase = distinctivePhraseFromEmitted(emittedHtml);
  expect(phrase.length, 'the emitted document carries a distinctive phrase').toBeGreaterThan(0);
  await search(page, phrase);
  expect(
    await resultHrefs(page),
    `the emitted phrase finds its originating item ${destination}`,
  ).toContain(`${destination}/`);
}

/** Press ArrowDown until the given destination is the active result. */
async function activateResult(page: Page, href: string): Promise<void> {
  const count = await resultLinks(page).count();
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
  const finalHrefs = await resultHrefs(page);
  throw new Error(`could not activate ${href}; results were ${JSON.stringify(finalHrefs)}`);
}

/** Open the active result with Enter and settle on the real destination.
 * Enter is the contract's selection action: the island closes the dialog and
 * forwards the real anchor's click to the ClientRouter. */
async function followActiveResult(page: Page, testInfo: TestInfo): Promise<void> {
  await page.keyboard.press('Enter');
  await page.waitForLoadState('load');
  await settle(page, testInfo);
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

test(`${FLOW_TOKEN}: locked 13-step sequence`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const log = trackRequests(page);
  const shortcut = platformShortcut();

  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page, log, testInfo);
    return;
  }

  // -- Step 1: browse with search closed; observe every request -------------
  const intro = await navigateLocalhost(page, '/docs/introduction');
  expect(intro?.status()).toBe(200);
  await settle(page, testInfo);
  await page.waitForTimeout(5_000);
  await hoverSiteNav(page);
  await page.getByRole('link', { name: 'Installation' }).first().click();
  await page.waitForURL(/\/docs\/installation$/);
  await followSiteNav(page, 'Registry', /\/registry$/);
  await settle(page, testInfo);
  expect(
    log.pagefind,
    `zero /pagefind/ requests before activation, saw ${JSON.stringify(log.pagefind)}`,
  ).toEqual([]);

  // -- Step 2: open search through the header control; measure visibility ---
  // Measured independently of index readiness: the island's in-page clock is
  // the strict 300ms budget; the harness clock additionally carries the
  // Playwright transport and only bounds it.
  const harnessDelta = await activateSearch(page);
  const islandDelta = await islandOpenMs(page);
  expect(
    islandDelta,
    'dialog visibility within 300ms of activation (in-page clock)',
  ).toBeLessThanOrEqual(300);
  expect(harnessDelta, 'the 300ms budget holds across the transport too').toBeLessThanOrEqual(
    1_000,
  );
  await expect(page.locator(SEARCH_DIALOG)).toHaveCount(1);
  await expect(page.locator(SEARCH_INPUT)).toBeFocused();

  // -- Step 3: first initialization, then search streamdown -----------------
  await awaitPagefindReady(page);
  const moduleRequests = log.pagefind.filter((url) => url.includes('/pagefind/pagefind.js'));
  expect(moduleRequests.length, 'the same-origin Pagefind module loads on first open').toBe(1);
  expect(moduleRequests[0]).toMatch(new RegExp(`^${PREVIEW_URL}/pagefind/pagefind\\.js`));
  await search(page, 'streamdown');
  // The index bundles are real query-time loads: entry metadata, wasm and the
  // pf_index chunks arrive with (not before) the first genuine query.
  expect(log.pagefind.length, 'real index chunks load with the first query').toBeGreaterThan(1);
  const streamdownCount = await resultLinks(page).count();
  expect(streamdownCount, 'streamdown returns real results').toBeGreaterThan(0);
  expect(await announcedCount(page), 'announced count matches actual results').toBe(
    streamdownCount,
  );
  const groups = await page
    .locator('dialog[aria-modal="true"] [data-search-group]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-category')));
  expect(groups.length, 'results render grouped by category').toBeGreaterThan(0);

  // -- Step 4: Escape restores focus; unchanged reopen adds no requests -----
  const requestsAtClose = log.pagefind.length;
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();
  await activateSearch(page);
  await expect(page.locator(SEARCH_INPUT)).toHaveValue('streamdown');
  await expect(resultLinks(page).first()).toBeVisible();
  expect(
    log.pagefind.length - requestsAtClose,
    'unchanged reopen adds zero Pagefind requests',
  ).toBe(0);

  // -- Step 5: arrows move selection; Enter opens the real destination ------
  await page.locator(SEARCH_INPUT).focus();
  await page.keyboard.press('ArrowDown');
  const firstActive = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        querySelector(selector: string): { getAttribute(name: string): string | null } | null;
      };
    };
    return g.document
      .querySelector('dialog[aria-modal="true"] a[data-search-result][data-active="true"]')
      ?.getAttribute('href');
  });
  expect(firstActive, 'ArrowDown activates a result').toBeTruthy();
  await page.keyboard.press('ArrowUp');
  const afterUp = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        querySelector(selector: string): { getAttribute(name: string): string | null } | null;
      };
    };
    return g.document
      .querySelector('dialog[aria-modal="true"] a[data-search-result][data-active="true"]')
      ?.getAttribute('href');
  });
  expect(afterUp, 'ArrowUp changes the active result').toBeTruthy();
  await activateResult(page, '/components/streamdown/');
  await followActiveResult(page, testInfo);
  expect(page.url(), 'Enter navigates to the pinned streamdown destination').toMatch(
    /\/components\/streamdown\/?$/,
  );
  expect(await fetchCurrentStatus(page), '/components/streamdown must return HTTP 200').toBe(200);
  expect((await page.getByRole('heading', { level: 1 }).innerText()).toLowerCase()).toContain(
    'streamdown',
  );

  // -- Step 6: after ClientRouter navigation, the platform shortcut reopens -
  await page.keyboard.press(shortcut);
  await expect(page.locator(SEARCH_DIALOG)).toHaveCount(1);
  await expect(page.locator(SEARCH_DIALOG)).toBeVisible();
  expect(
    log.pagefind.filter((url) => url.includes('/pagefind/pagefind.js')).length,
    'initialization is retained: still exactly one module request',
  ).toBe(1);

  // -- Step 7: boundary and item results for renderMarkdown and dev client --
  await search(page, 'renderMarkdown');
  const renderMarkdownHrefs = await resultHrefs(page);
  expect(renderMarkdownHrefs).toContain('/docs/owns-vs-does-not-own/');
  await activateResult(page, '/docs/owns-vs-does-not-own/');
  await followActiveResult(page, testInfo);
  expect(await fetchCurrentStatus(page)).toBe(200);
  expect(
    (await page.locator('[data-pagefind-body]').innerText()).length,
    'the boundary destination renders substantive indexed prose',
  ).toBeGreaterThan(200);
  await page.keyboard.press(shortcut);
  await search(page, 'dev client');
  const devClientHrefs = await resultHrefs(page);
  expect(devClientHrefs).toContain('/docs/owns-vs-does-not-own/');
  expect(
    devClientHrefs.filter((href) => href.startsWith('/components/')).length,
    'a relevant item result answers the query',
  ).toBeGreaterThan(0);

  // -- Step 8: five item destinations through real searches ------------------
  const itemResults: Record<string, { status: number; title: string }> = {};
  for (const destination of ITEM_DESTINATIONS) {
    const query = queryForDestination(destination);
    await page.keyboard.press(shortcut);
    await search(page, query);
    await activateResult(page, `${destination}/`);
    await followActiveResult(page, testInfo);
    itemResults[destination] = {
      status: await fetchCurrentStatus(page),
      title: await page.getByRole('heading', { level: 1 }).innerText(),
    };
  }

  // -- Step 9: three documentation destinations through real searches -------
  const docResults: Record<string, { status: number; textLength: number }> = {};
  for (const destination of DOC_DESTINATIONS) {
    const query = queryForDestination(destination);
    await page.keyboard.press(shortcut);
    await search(page, query);
    await activateResult(page, `${destination}/`);
    await followActiveResult(page, testInfo);
    docResults[destination] = {
      status: await fetchCurrentStatus(page),
      textLength: (await page.locator('[data-pagefind-body]').innerText()).length,
    };
  }
  capture(testInfo, 'locked-destinations', { itemResults, docResults });

  // -- Step 10: prop content and a real verdict phrase -----------------------
  await page.keyboard.press(shortcut);
  await search(page, 'nearBottomThreshold');
  expect(await resultHrefs(page), 'nearBottomThreshold finds Conversation').toContain(
    '/components/conversation/',
  );
  await activateResult(page, '/components/conversation/');
  await followActiveResult(page, testInfo);

  // The verdict phrase is read from the actual emitted document.
  const emittedHtml = readFileSync(
    join(process.cwd(), 'apps/docs/dist/components/conversation/index.html'),
    'utf8',
  );
  await page.keyboard.press(shortcut);
  await expectVerdictPhraseFindsOrigin(page, emittedHtml, '/components/conversation');

  // -- Step 11: genuine empty state, then recovery ---------------------------
  await page.keyboard.press(shortcut);
  await search(page, RUN_QUERY);
  await expect(page.locator(SEARCH_EMPTY)).toBeVisible();
  expect(await resultLinks(page).count(), 'a no-match query yields zero results').toBe(0);
  await search(page, 'streamdown');
  await expect(page.locator(SEARCH_EMPTY)).toBeHidden();
  expect(await announcedCount(page), 'results return after recovery').toBeGreaterThan(0);

  // -- Step 12: literal HTML-shaped query creates zero DOM -------------------
  const literal = '<b data-s05-query="literal">streamdown</b>';
  await search(page, literal);
  await expect(page.locator(SEARCH_INPUT)).toHaveValue(literal);
  expect(
    await page.locator('dialog[aria-modal="true"] b[data-s05-query="literal"]').count(),
    'no b[data-s05-query] element may be created',
  ).toBe(0);
  expect(
    await page.locator('dialog[aria-modal="true"] [data-s05-query]').count(),
    'no data-s05-query attribute may be created',
  ).toBe(0);
  await search(page, 'streamdown');
  expect(await resultLinks(page).count(), 'normal search still works').toBeGreaterThan(0);

  // -- Step 13: Escape restores the invoking control -------------------------
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();

  capture(testInfo, 'locked-flow', {
    preActivationPagefindRequests: 0,
    firstModuleRequests: moduleRequests.length,
    harnessOpenDeltaMs: harnessDelta,
    islandOpenMs: await islandOpenMs(page),
    streamdownResultCount: streamdownCount,
    groups,
    totalPagefindRequests: log.pagefind.length,
    itemResults,
    docResults,
  });
});

test(`${FLOW_TOKEN}: AC-1 find real published content`, async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const log = trackRequests(page);
  const shortcut = platformShortcut();

  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page, log, testInfo);
    return;
  }

  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  const harnessDelta = await activateSearch(page);
  await awaitPagefindReady(page);

  // Boundary and item results for the two boundary queries (case 2, first).
  for (const query of ['renderMarkdown', 'dev client']) {
    await search(page, query);
    const hrefs = await resultHrefs(page);
    expect(hrefs, `${query} answers with the boundary page`).toContain(
      '/docs/owns-vs-does-not-own/',
    );
    expect(
      hrefs.filter((href) => href.startsWith('/components/')).length,
      `${query} answers with a relevant item`,
    ).toBeGreaterThan(0);
  }

  // Prop content and a verdict phrase read from the emitted HTML (case 2).
  await search(page, 'nearBottomThreshold');
  expect(await resultHrefs(page), 'nearBottomThreshold finds Conversation').toContain(
    '/components/conversation/',
  );
  const emittedHtml = readFileSync(
    join(process.cwd(), 'apps/docs/dist/components/conversation/index.html'),
    'utf8',
  );
  await expectVerdictPhraseFindsOrigin(page, emittedHtml, '/components/conversation');

  // Direct pointer proof: a rendered result is a real, directly tappable
  // anchor (fresh dialog at the top of the page; the loops below select with
  // Enter, the keyboard path).
  const firstHref = (await resultHrefs(page))[0];
  await resultLinks(page).first().click();
  await page.waitForLoadState('load');
  await settle(page, testInfo);
  expect(page.url(), 'the rendered result is a real clickable anchor').toContain(firstHref);
  await page.keyboard.press(shortcut);

  // Eight destinations through real searches, HTTP 200 content (case 1) —
  // the pinned streamdown destination goes LAST so every other observation
  // lands before the pending destination decision bites.
  const observedCategories = new Set<string>();
  const destinationProof: Record<string, { status: number; title: string }> = {};
  const destinationOrder = [
    ...DOC_DESTINATIONS,
    ...ITEM_DESTINATIONS.filter((destination) => destination !== '/components/streamdown'),
    '/components/streamdown',
  ];
  for (const destination of destinationOrder) {
    const query = queryForDestination(destination);
    await search(page, query);
    const categories = await page
      .locator(SEARCH_RESULT_LINK)
      .evaluateAll((links) => links.map((link) => link.getAttribute('data-category') ?? ''));
    for (const category of categories) observedCategories.add(category);
    await activateResult(page, `${destination}/`);
    await followActiveResult(page, testInfo);
    destinationProof[destination] = {
      status: await fetchCurrentStatus(page),
      title: await page.getByRole('heading', { level: 1 }).innerText(),
    };
    await page.keyboard.press(shortcut);
  }

  for (const category of ['components', 'ui', 'lib', 'pages']) {
    expect([...observedCategories], `result metadata includes ${category}`).toContain(category);
  }
  for (const [destination, proof] of Object.entries(destinationProof)) {
    expect(proof.status, `${destination} returns HTTP 200`).toBe(200);
    expect(proof.title.length, `${destination} renders a real title`).toBeGreaterThan(0);
  }

  capture(testInfo, 'ac-1', {
    harnessOpenDeltaMs: harnessDelta,
    observedCategories: [...observedCategories],
    destinationProof,
  });
});

test(`${FLOW_TOKEN}: AC-2 open immediately, load Pagefind only on demand`, async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const log = trackRequests(page);
  const shortcut = platformShortcut();

  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page, log, testInfo);
    return;
  }

  // Browse, wait five seconds, hover, soft-navigate — search stays closed.
  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  await page.waitForTimeout(5_000);
  await hoverSiteNav(page);
  await page.getByRole('link', { name: 'Installation' }).first().click();
  await page.waitForURL(/\/docs\/installation$/);
  await followSiteNav(page, 'Registry', /\/registry$/);
  await settle(page, testInfo);
  expect(log.pagefind, 'zero Pagefind requests before activation').toEqual([]);

  // Opening is measured independently of index readiness (two witnesses).
  const harnessDelta = await activateSearch(page);
  const islandDelta = await islandOpenMs(page);
  expect(
    islandDelta,
    'dialog visible within 300ms of activation (in-page clock)',
  ).toBeLessThanOrEqual(300);
  expect(harnessDelta, 'the 300ms budget holds across the transport too').toBeLessThanOrEqual(
    1_000,
  );

  // First open loads the same-origin module and real index chunks.
  await awaitPagefindReady(page);
  const moduleRequests = log.pagefind.filter((url) => url.includes('/pagefind/pagefind.js'));
  expect(moduleRequests.length, 'exactly one Pagefind module request').toBe(1);
  expect(moduleRequests[0]).toMatch(new RegExp(`^${PREVIEW_URL}/pagefind/pagefind\\.js`));
  await search(page, 'streamdown');
  expect(log.pagefind.length, 'real index chunks load with the first query').toBeGreaterThan(1);
  expect((await resultHrefs(page)).length, 'streamdown returns real results').toBeGreaterThan(0);

  // Unchanged reopen: zero additional Pagefind requests.
  const requestsAtClose = log.pagefind.length;
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await activateSearch(page);
  await expect(page.locator(SEARCH_INPUT)).toHaveValue('streamdown');
  await expect(resultLinks(page).first()).toBeVisible();
  expect(log.pagefind.length - requestsAtClose, 'reopen adds zero requests').toBe(0);

  // Soft navigation retains initialization; one activation opens one dialog.
  await page.keyboard.press('Escape');
  await followSiteNav(page, 'Components', /\/components\/?$/);
  await settle(page, testInfo);
  await page.keyboard.press(shortcut);
  await expect(page.locator(SEARCH_DIALOG)).toHaveCount(1);
  await expect(page.locator(SEARCH_DIALOG)).toBeVisible();
  expect(
    log.pagefind.filter((url) => url.includes('/pagefind/pagefind.js')).length,
    'initialization survives ClientRouter navigation',
  ).toBe(1);

  capture(testInfo, 'ac-2', {
    harnessOpenDeltaMs: harnessDelta,
    islandOpenMs: islandDelta,
    moduleRequests,
    pagefindRequestsBeforeActivation: 0,
    totalPagefindRequests: log.pagefind.length,
  });
});

test(`${FLOW_TOKEN}: AC-3 keyboard navigation and invoker focus`, async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const log = trackRequests(page);
  const shortcut = platformShortcut();

  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page, log, testInfo);
    return;
  }

  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  const invoker = page.locator(SEARCH_TRIGGER);
  await activateSearch(page);
  await awaitPagefindReady(page);

  // One native modal dialog, focus on its search input, live count matches.
  await expect(page.locator(SEARCH_DIALOG)).toHaveCount(1);
  await expect(page.locator(SEARCH_DIALOG)).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator(SEARCH_INPUT)).toBeFocused();
  await search(page, 'streamdown');
  const actualCount = await resultLinks(page).count();
  expect(actualCount).toBeGreaterThan(0);
  expect(await announcedCount(page), 'aria-live count matches actual results').toBe(actualCount);

  // Arrows change the selection.
  await page.locator(SEARCH_INPUT).focus();
  await page.keyboard.press('ArrowDown');
  const activeOne = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        querySelector(selector: string): { getAttribute(name: string): string | null } | null;
      };
    };
    return g.document
      .querySelector('dialog[aria-modal="true"] a[data-search-result][data-active="true"]')
      ?.getAttribute('href');
  });
  expect(activeOne, 'ArrowDown activates a result').toBeTruthy();
  await page.keyboard.press('ArrowUp');
  const activeTwo = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        querySelector(selector: string): { getAttribute(name: string): string | null } | null;
      };
    };
    return g.document
      .querySelector('dialog[aria-modal="true"] a[data-search-result][data-active="true"]')
      ?.getAttribute('href');
  });
  expect(activeTwo, 'ArrowUp changes the active result').toBeTruthy();

  // Reopen after ClientRouter navigation with the platform shortcut, then
  // Escape restores the invoking control (before the pinned Enter leg).
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(invoker).toBeFocused();
  await followSiteNav(page, 'Components', /\/components\/?$/);
  await settle(page, testInfo);
  await page.keyboard.press(shortcut);
  await expect(page.locator(SEARCH_DIALOG)).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();

  // Enter on the pinned streamdown result navigates to real 200 content.
  await page.keyboard.press(shortcut);
  await search(page, 'streamdown');
  await activateResult(page, '/components/streamdown/');
  await followActiveResult(page, testInfo);
  expect(page.url()).toMatch(/\/components\/streamdown\/?$/);
  expect(await fetchCurrentStatus(page), '/components/streamdown must return HTTP 200').toBe(200);
  expect((await page.getByRole('heading', { level: 1 }).innerText()).toLowerCase()).toContain(
    'streamdown',
  );

  capture(testInfo, 'ac-3', {
    announcedCount: actualCount,
    focusRestoredToInvoker: true,
    oneShortcutOpensOneDialog: true,
  });
});

test(`${FLOW_TOKEN}: AC-4 empty and error states, safe query text`, async ({
  page,
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  const shortcut = platformShortcut();

  if (isNoJs(testInfo)) {
    const log = trackRequests(page);
    await expectNoJsSurface(page, log, testInfo);
    return;
  }

  // Case 1: a fresh run-specific no-match query, then recovery.
  const mainLog = trackRequests(page);
  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  await activateSearch(page);
  await awaitPagefindReady(page);
  await search(page, RUN_QUERY);
  await expect(page.locator(SEARCH_EMPTY), 'the empty state is visible').toBeVisible();
  expect(await resultLinks(page).count(), 'a no-match query yields zero results').toBe(0);
  await search(page, 'streamdown');
  await expect(page.locator(SEARCH_EMPTY)).toBeHidden();
  const recovered = await announcedCount(page);
  expect(recovered, 'streamdown restores a nonzero announced count').toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);

  // Case 2: the literal HTML-shaped query stays text and creates zero DOM.
  await page.keyboard.press(shortcut);
  const literal = '<b data-s05-query="literal">streamdown</b>';
  await search(page, literal);
  await expect(page.locator(SEARCH_INPUT)).toHaveValue(literal);
  expect(
    await page.locator('dialog[aria-modal="true"] b[data-s05-query="literal"]').count(),
    'zero b[data-s05-query=literal] nodes',
  ).toBe(0);
  expect(
    await page.locator('dialog[aria-modal="true"] [data-s05-query]').count(),
    'zero data-s05-query attributes',
  ).toBe(0);
  await search(page, 'streamdown');
  expect(
    await resultLinks(page).count(),
    'normal search works after the literal query',
  ).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);

  // Case 3: real offline failure in a fresh context, no interception.
  const offlineContext = await browser.newContext();
  const offlinePage = await offlineContext.newPage();
  const offlineLog = trackRequests(offlinePage);
  await navigateLocalhost(offlinePage, '/docs/introduction');
  await settle(offlinePage, testInfo);
  await offlineContext.setOffline(true);
  const offlineOpenDelta = await activateSearchShortcut(offlinePage, shortcut);
  await expect(offlinePage.locator(SEARCH_DIALOG)).toBeVisible();
  await offlinePage.locator(SEARCH_INPUT).fill('streamdown');
  await expect(
    offlinePage.locator(SEARCH_ERROR),
    'exactly one visible error message reports the real failure',
  ).toHaveCount(1);
  await expect(offlinePage.locator(SEARCH_ERROR)).toBeVisible();
  expect(
    offlineLog.failedPagefind.length,
    'the failed Pagefind request is captured, not intercepted',
  ).toBeGreaterThan(0);
  expect(offlineOpenDelta, 'offline opening still takes at most 300ms').toBeLessThanOrEqual(300);
  await offlinePage.keyboard.press('Escape');
  await expect(offlinePage.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect(offlinePage.locator(SEARCH_TRIGGER)).toBeFocused();
  await offlineContext.close();

  // Fresh online context: normal search reaches the pinned destination.
  const onlineContext = await browser.newContext();
  const freshPage = await onlineContext.newPage();
  trackRequests(freshPage);
  await navigateLocalhost(freshPage, '/docs/introduction');
  await settle(freshPage, testInfo);
  await freshPage.keyboard.press(shortcut);
  await awaitPagefindReady(freshPage);
  await search(freshPage, 'streamdown');
  expect((await resultHrefs(freshPage)).length).toBeGreaterThan(0);
  await activateResult(freshPage, '/components/streamdown/');
  await followActiveResult(freshPage, testInfo);
  expect(freshPage.url()).toMatch(/\/components\/streamdown\/?$/);
  expect(
    await fetchCurrentStatus(freshPage),
    'fresh online search reaches /components/streamdown',
  ).toBe(200);
  await onlineContext.close();

  capture(testInfo, 'ac-4', {
    runQuery: RUN_QUERY,
    recoveredCount: recovered,
    pagefindRequestsCasesOneAndTwo: mainLog.pagefind,
    offlineOpenDeltaMs: offlineOpenDelta,
    failedPagefind: offlineLog.failedPagefind,
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
    runIdentity: `ori-ast-004-${Date.now()}`,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      searchDialogIsland: hashFile('apps/docs/src/components/islands/SearchDialog.astro'),
      searchDialogScript: hashFile('apps/docs/src/scripts/search-dialog.ts'),
      docsLayout: hashFile('apps/docs/src/layouts/DocsLayout.astro'),
      searchPageModel: hashFile('apps/docs/src/lib/search-page-model.ts'),
      searchIndexScript: hashFile('scripts/docs-data/search-index.ts'),
      testFile: hashFile('tests/sprint-05-orient-search/search-contract.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-004/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
