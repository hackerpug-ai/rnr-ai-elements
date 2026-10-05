import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-AST-009 — recover from unknown documentation URLs through the real site
 * search. Every test name carries the locked flow token, so the exact locked
 * command selects the whole task surface:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts \
 *     --grep FLOW-SHELL-16-not-found-search-recovery
 *
 *   - "locked 8-step sequence" — the full FLOW-SHELL-16 scenario, steps 1-8.
 *   - "AC-1" — Search the site opens the shared focused dialog within 300ms
 *     (visibility never waits on the index) and selecting the real Message
 *     result reaches /components/message at HTTP 200 with substantive content.
 *   - "AC-2" — the emitted 404.html serves the system manuscript and retains
 *     the shell, both selected themes, header and footer, without creating a
 *     docs-collection or docs-navigation entry.
 *   - "AC-3" — Escape restores the recovery trigger's focus; ordinary and
 *     recovery searches share the production Pagefind resources; completed
 *     manuscript queries exclude every recovery URL.
 *   - "AC-4" — the recovery page stays readable and the plain Components and
 *     Registry links reach real destinations, exercised on every project and
 *     canonically without JavaScript.
 *
 * Nothing is intercepted or manufactured: the recovery copy is read from the
 * actual system manuscript at apps/docs/src/content/system/not-found.md and
 * compared against SERVED and EMITTED bytes, the dialog is the existing
 * SearchDialog island opened through the page's Search the site control, the
 * index is the real Pagefind output of the built dist, and the unknown /docs/
 * URLs are generated fresh from each run's ID with no route or page created
 * for them. Requests are observed only. The chromium-nojs project executes its
 * actual supported surface — readable manuscript, plain-link recovery, zero
 * Pagefind requests, an inert search control — never a skip.
 *
 * Scoped to this repo's no-DOM-lib tsconfig: every `page.evaluate` callback
 * reads the browser through a `globalThis as unknown as {...}` cast (the
 * search-contract.spec.ts precedent).
 */

const FLOW_TOKEN = 'FLOW-SHELL-16-not-found-search-recovery';
const CAPTURE_DIR = '.tmp/ORI-AST-009/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery';
const MANUSCRIPT_PATH = 'apps/docs/src/content/system/not-found.md';
const DIST_404_PATH = 'apps/docs/dist/404.html';
const DOCS_COLLECTION_DIR = 'apps/docs/src/content/docs';

/**
 * The manuscript parsed the same way the route parses it: the first `# `
 * block is the title, the next two non-empty blocks are the explanation and
 * the search hint. The test reads the REAL file so copy drift fails loudly.
 */
function manuscriptParts(): { title: string; explanation: string; hint: string } {
  const raw = readFileSync(join(process.cwd(), MANUSCRIPT_PATH), 'utf8');
  const blocks = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
  if (blocks.length < 3 || !blocks[0].startsWith('# ')) {
    throw new Error(`${MANUSCRIPT_PATH} must carry a # title plus explanation and hint blocks`);
  }
  return { title: blocks[0].replace(/^#\s+/, ''), explanation: blocks[1], hint: blocks[2] };
}

/** A distinctive verbatim phrase from the current manuscript for exclusion queries. */
function manuscriptHintPhrase(parts: { hint: string }): string {
  const phrase = parts.hint.replace(/[:.]\s*$/, '').trim();
  expect(phrase.length, 'the manuscript hint must carry a distinctive phrase').toBeGreaterThan(10);
  return phrase;
}

const RECOVERY_SEARCH_TRIGGER = '[data-recovery-search]';
// The trigger only: the slot also hosts the dialog's close button (ORI-VIS-003)
// inside the closed <dialog> panel, so a bare button selector is ambiguous.
const HEADER_SEARCH_TRIGGER = '[data-search-slot] button.search-dialog__trigger';
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const PAGEFIND_URL = /\/pagefind\//;
const HEADER = '.site-header';
const FOOTER = '.site-footer';
const THEME_TRIGGER = '.theme-toggle__trigger';
const DOCS_NAV = '[data-docs-nav]';

/**
 * Fresh-run-specific unknown /docs/ path factory — every path is unique to
 * this run and no route or page is ever created for one.
 */
function makeUnknownPaths(runId: string): { next: () => string; all: () => string[] } {
  const used: string[] = [];
  return {
    next: () => {
      const path = `/docs/not-found-${runId}-${used.length + 1}`;
      used.push(path);
      return path;
    },
    all: () => [...used],
  };
}

interface RequestLog {
  pagefind: string[];
}

/** Observation-only request capture. Attach BEFORE the first navigation. */
function trackRequests(page: Page): RequestLog {
  const log: RequestLog = { pagefind: [] };
  page.on('request', (request) => {
    const url = request.url();
    if (PAGEFIND_URL.test(url)) log.pagefind.push(url);
  });
  return log;
}

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

/** Settle after load, except the no-JavaScript project cannot evaluate JS. */
async function settle(page: Page, testInfo: TestInfo): Promise<void> {
  if (isNoJs(testInfo)) return;
  await waitForAstroPageLoad(page);
}

/**
 * The recovery-surface contract shared by every AC: the SERVED document at a
 * fresh unknown URL equals the REAL system manuscript (title, explanation,
 * search hint) and the shared shell — header, footer, and the plain
 * Components and Registry recovery links — is present and readable.
 */
async function expectRecoveryContent(
  page: Page,
  parts: { title: string; explanation: string; hint: string },
): Promise<void> {
  await expect(
    page.getByRole('heading', { level: 1 }),
    'the served title must equal the manuscript title',
  ).toHaveText(parts.title, { timeout: 5_000 });
  await expect(
    page.locator('.page-header__description'),
    'the manuscript explanation must be served as the page description',
  ).toHaveText(parts.explanation, { timeout: 5_000 });
  await expect(
    page.locator('.callout__title'),
    'the manuscript search hint must be served as the callout title',
  ).toHaveText(parts.hint, { timeout: 5_000 });
  await expect(page.locator(HEADER), 'the shared header must remain').toBeVisible();
  await expect(page.locator(FOOTER), 'the shared footer must remain').toBeVisible();
  await expect(
    page.locator('main a[href="/components"]'),
    'the plain Components recovery link must be visible',
  ).toBeVisible();
  await expect(
    page.locator('main a[href="/registry"]'),
    'the plain Registry recovery link must be visible',
  ).toBeVisible();
}

/**
 * The JavaScript-disabled surface contract: the manuscript and shell stay
 * readable, the JS-only search controls stay hidden (never dead controls),
 * and zero Pagefind resources are ever requested.
 */
async function expectNoJsRecoverySurface(
  page: Page,
  log: RequestLog,
  testInfo: TestInfo,
  parts: { title: string; explanation: string; hint: string },
  unknownPath: string,
): Promise<void> {
  const response = await navigateLocalhost(page, unknownPath);
  expect(response?.status(), 'the local preview must serve the unknown URL with HTTP 404').toBe(
    404,
  );
  await expectRecoveryContent(page, parts);
  await expect(
    page.locator(RECOVERY_SEARCH_TRIGGER),
    'the JS-only search action stays hidden without JavaScript',
  ).toBeHidden();
  await expect(
    page.locator(HEADER_SEARCH_TRIGGER),
    'the header search trigger stays hidden without JavaScript',
  ).toBeHidden();
  await expect(
    page.locator(OPEN_SEARCH_DIALOG),
    'no search dialog may present without JavaScript',
  ).toBeHidden();
  expect(log.pagefind, 'no Pagefind resource may load without JavaScript').toEqual([]);
  capture(testInfo, 'nojs-recovery-surface', {
    unknownPath,
    servedStatus: response?.status(),
    pagefindRequests: log.pagefind,
  });
}

/**
 * Flip the site to the target theme through the real ThemeToggle control
 * ONLY — the test never writes theme state directly. The stored `rnr-theme`
 * value is written by the control and asserted here as the retention witness.
 */
async function setTheme(page: Page, target: 'dark' | 'light'): Promise<void> {
  const flipped = async (): Promise<boolean> =>
    page.evaluate(
      (wanted) =>
        (
          globalThis as unknown as {
            document: { documentElement: { classList: { contains(name: string): boolean } } };
          }
        ).document.documentElement.classList.contains(wanted),
      target,
    );
  if (!(await flipped())) {
    await page.locator(THEME_TRIGGER).click();
    await expect.poll(flipped, `the real toggle must flip the site to ${target}`).toBe(true);
  }
  await expect
    .poll(
      async () =>
        page.evaluate(() =>
          (
            globalThis as unknown as { localStorage: { getItem(key: string): string | null } }
          ).localStorage.getItem('rnr-theme'),
        ),
      'the real theme control must persist its own selection',
    )
    .toBe(target);
}

async function themeIs(page: Page, target: 'dark' | 'light'): Promise<boolean> {
  return page.evaluate(
    (wanted) =>
      (
        globalThis as unknown as {
          document: { documentElement: { classList: { contains(name: string): boolean } } };
        }
      ).document.documentElement.classList.contains(wanted),
    target,
  );
}

/** Open the dialog through the recovery page's Search the site control. */
async function openRecoverySearch(page: Page): Promise<void> {
  await page.locator(RECOVERY_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
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

/** Type a query and wait for the island to settle that exact query (real completion). */
async function searchFor(page: Page, query: string): Promise<void> {
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

/** Press ArrowDown until the given destination is the active result. */
async function activateResult(page: Page, href: string): Promise<void> {
  const count = await page.locator(SEARCH_RESULT_LINK).count();
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

/** Open the active result with Enter and settle on the real destination. */
async function followActiveResult(
  page: Page,
  testInfo: TestInfo,
  destination: RegExp,
): Promise<void> {
  await page.keyboard.press('Enter');
  await page.waitForURL(destination);
  await page.waitForLoadState('load');
  await settle(page, testInfo);
}

/** The current document's own HTTP status, read inside the real page. */
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

/**
 * The focused element is the open dialog's search input (in-page
 * observation). The selector is INLINED: Playwright serializes evaluate
 * callbacks without their closure, so module constants are unreachable here.
 */
async function inputIsFocused(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { activeElement: unknown; querySelector(selector: string): unknown };
    };
    const input = g.document.querySelector('dialog[aria-modal="true"] input[type="search"]');
    return input != null && g.document.activeElement === input;
  });
}

/**
 * The focused element is the recovery page's Search the site control. The
 * selector is inlined for the same serialization reason as inputIsFocused.
 */
async function recoveryTriggerIsFocused(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { activeElement: unknown; querySelector(selector: string): unknown };
    };
    const trigger = g.document.querySelector('[data-recovery-search]');
    return trigger != null && g.document.activeElement === trigger;
  });
}

/** The recovery URL exclusion rule for completed searches (AC-3). */
function recoveryUrlRule(unknownPaths: string[]): (href: string) => boolean {
  return (href: string) =>
    /^\/404(\.html)?$/.test(href) ||
    unknownPaths.some((path) => href === path || href === `${path}/`);
}

test(`${FLOW_TOKEN}: locked 8-step sequence`, async ({ page }, testInfo) => {
  test.setTimeout(420_000);
  const parts = manuscriptParts();
  const unknowns = makeUnknownPaths(`ori-ast-009-${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  const log = trackRequests(page);

  // -- No-JavaScript journey (steps 1 and 8) --------------------------------
  if (isNoJs(testInfo)) {
    await expectNoJsRecoverySurface(page, log, testInfo, parts, unknowns.next());
    // Step 8: the plain links carry the visitor to real matching content.
    await page.locator('main a[href="/components"]').click();
    await page.waitForURL(/\/components\/?$/);
    expect(await fetchCurrentStatus(page), '/components must be HTTP 200').toBe(200);
    await expect(page.locator('main h1')).toHaveText(/components/i);
    const familyTexts = await page.locator('.family-grid').allInnerTexts();
    expect(
      familyTexts.length,
      '/components must render the component families',
    ).toBeGreaterThanOrEqual(5);
    expect(
      familyTexts.join(' ').replace(/\s+/g, ' ').length,
      '/components must render component-family content',
    ).toBeGreaterThan(200);
    await expectNoJsRecoverySurface(page, log, testInfo, parts, unknowns.next());
    await page.locator('main a[href="/registry"]').click();
    await page.waitForURL(/\/registry\/?$/);
    expect(await fetchCurrentStatus(page), '/registry must be HTTP 200').toBe(200);
    const ledgerText = (await page.locator('[data-ledger]').innerText()).replace(/\s+/g, ' ');
    expect(ledgerText.length, '/registry must render the real ledger').toBeGreaterThan(200);
    expect(ledgerText).toContain('nativewind');
    expect(log.pagefind, 'still zero Pagefind requests').toEqual([]);
    capture(testInfo, 'locked-nojs', { steps: [1, 8], pagefindRequests: log.pagefind });
    return;
  }

  // -- Step 1: fresh unknown URL serves the real manuscript -----------------
  const step1 = await navigateLocalhost(page, unknowns.next());
  expect(step1?.status(), 'the local preview marks the unknown URL with HTTP 404').toBe(404);
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);

  // -- Step 2: emitted 404.html identity + collection exclusion -------------
  const distPath = join(process.cwd(), DIST_404_PATH);
  expect(existsSync(distPath), 'the build must emit apps/docs/dist/404.html').toBe(true);
  const emitted = readFileSync(distPath, 'utf8');
  expect(emitted).toContain(parts.title);
  expect(emitted).toContain(parts.explanation);
  expect(emitted).toContain(parts.hint);
  expect(
    readdirSync(join(process.cwd(), DOCS_COLLECTION_DIR)).some((entry) =>
      entry.startsWith('not-found'),
    ),
    'the system manuscript must stay outside the docs collection',
  ).toBe(false);

  // -- Step 3: activate Search the site; time visibility independently ------
  const startedAt = Date.now();
  await page.locator(RECOVERY_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  const transportMs = Date.now() - startedAt;
  const islandMs = await islandOpenMs(page);
  expect(islandMs, 'the island must have measured this activation').toBeGreaterThan(0);
  expect(
    islandMs,
    'the dialog must be visible within 300ms on the island clock',
  ).toBeLessThanOrEqual(300);
  expect(transportMs, 'the transport bound stays loose; the 300ms budget is in-page').toBeLessThan(
    5_000,
  );

  await expect
    .poll(async () => inputIsFocused(page), 'the dialog input must take focus')
    .toBe(true);

  // -- Step 4: real index, search message, keyboard-select Message ----------
  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  await activateResult(page, '/components/message/');
  await followActiveResult(page, testInfo, /\/components\/message\/$/);
  expect(new URL(page.url()).pathname, 'selecting Message must leave the unknown URL').toBe(
    '/components/message/',
  );
  expect(await fetchCurrentStatus(page), '/components/message must be HTTP 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText(/message/i);
  const messageText = (
    await page.locator('main section[data-section="usage"]').innerText()
  ).replace(/\s+/g, ' ');
  expect(
    messageText.length,
    'the Message usage section must render substantive reference content',
  ).toBeGreaterThan(200);

  // -- Step 5: fresh unknown URL, Escape restores the recovery trigger ------
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await openRecoverySearch(page);
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect
    .poll(
      async () => recoveryTriggerIsFocused(page),
      'Escape must restore focus to the Search the site control',
    )
    .toBe(true);

  // -- Step 6: same production index; recovery URLs excluded ----------------
  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  const ordinaryBefore = log.pagefind.length;
  await page.locator(HEADER_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  const ordinaryHrefs = await resultHrefs(page);
  const ordinaryPagefind = log.pagefind.slice(ordinaryBefore);
  expect(ordinaryHrefs, 'the ordinary search must reach Message').toContain('/components/message/');
  await searchFor(page, parts.title);
  const titleHrefs = await resultHrefs(page);
  await searchFor(page, manuscriptHintPhrase(parts));
  const phraseHrefs = await resultHrefs(page);
  const forbidden = recoveryUrlRule(unknowns.all());
  for (const [label, hrefs] of [
    ['missing-page title', titleHrefs],
    ['manuscript phrase', phraseHrefs],
  ] as const) {
    expect(
      hrefs.filter(forbidden),
      `the completed ${label} query must exclude every recovery URL (got ${JSON.stringify(hrefs)})`,
    ).toEqual([]);
  }

  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  const recoveryBefore = log.pagefind.length;
  await openRecoverySearch(page);
  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  const recoveryHrefs = await resultHrefs(page);
  const recoveryPagefind = log.pagefind.slice(recoveryBefore);
  expect(recoveryHrefs, 'the recovery search must reach the same Message destination').toContain(
    '/components/message/',
  );
  for (const [label, set] of [
    ['ordinary', ordinaryPagefind],
    ['recovery', recoveryPagefind],
  ] as const) {
    expect(set, `the ${label} search must load real Pagefind resources`).not.toHaveLength(0);
    expect(
      set.some((url) => url.includes('/pagefind/pagefind.js')),
      `the ${label} search must load the same production Pagefind module`,
    ).toBe(true);
  }

  // Dismiss the open dialog: a modal top layer would block the theme
  // control's click in step 7.
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);

  // -- Step 7: theme retention through the real control ---------------------
  await setTheme(page, 'dark');
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);
  expect(await themeIs(page, 'dark'), 'the dark selection must survive recovery navigation').toBe(
    true,
  );
  await setTheme(page, 'light');
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);
  expect(await themeIs(page, 'light'), 'the light selection must survive recovery navigation').toBe(
    true,
  );
  capture(testInfo, 'locked-sequence', {
    unknowns: unknowns.all(),
    islandMs,
    transportMs,
    ordinaryPagefind,
    recoveryPagefind,
    titleQueryCount: titleHrefs.length,
    phraseQueryCount: phraseHrefs.length,
  });
});

test(`${FLOW_TOKEN}: AC-1 recover to Message through shared search`, async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const parts = manuscriptParts();
  const unknowns = makeUnknownPaths(`ac1-${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  const log = trackRequests(page);

  if (isNoJs(testInfo)) {
    await expectNoJsRecoverySurface(page, log, testInfo, parts, unknowns.next());
    return;
  }

  const unknownPath = unknowns.next();
  const response = await navigateLocalhost(page, unknownPath);
  expect(response?.status(), 'the local preview marks the unknown URL with HTTP 404').toBe(404);
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);

  await page.locator(RECOVERY_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  const islandMs = await islandOpenMs(page);
  expect(islandMs, 'the island must have measured this activation').toBeGreaterThan(0);
  expect(islandMs, 'the dialog must be visible within 300ms').toBeLessThanOrEqual(300);

  await expect
    .poll(async () => inputIsFocused(page), 'the dialog input must take focus')
    .toBe(true);

  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  await activateResult(page, '/components/message/');
  await followActiveResult(page, testInfo, /\/components\/message\/$/);
  expect(new URL(page.url()).pathname, 'the unknown URL must be replaced').toBe(
    '/components/message/',
  );
  expect(await fetchCurrentStatus(page), '/components/message must be HTTP 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText(/message/i);
  const messageText = (
    await page.locator('main section[data-section="usage"]').innerText()
  ).replace(/\s+/g, ' ');
  expect(
    messageText.length,
    'the Message usage section must render substantive reference content',
  ).toBeGreaterThan(200);
  capture(testInfo, 'ac1-recover-to-message', {
    unknownPath,
    islandMs,
    destination: '/components/message/',
  });
});

test(`${FLOW_TOKEN}: AC-2 manuscript-backed recovery document and retained shell`, async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const parts = manuscriptParts();
  const unknowns = makeUnknownPaths(`ac2-${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  const log = trackRequests(page);

  // Emitted identity + collection exclusion run on EVERY project: they read
  // the real build output and the real docs collection sources.
  const distPath = join(process.cwd(), DIST_404_PATH);
  expect(existsSync(distPath), 'the build must emit apps/docs/dist/404.html').toBe(true);
  const emitted = readFileSync(distPath, 'utf8');
  expect(emitted).toContain(parts.title);
  expect(emitted).toContain(parts.explanation);
  expect(emitted).toContain(parts.hint);
  expect(existsSync(join(process.cwd(), MANUSCRIPT_PATH)), 'the system manuscript is real').toBe(
    true,
  );
  expect(
    readdirSync(join(process.cwd(), DOCS_COLLECTION_DIR)).some((entry) =>
      entry.startsWith('not-found'),
    ),
    'the system manuscript must stay outside the docs collection',
  ).toBe(false);

  if (isNoJs(testInfo)) {
    await expectNoJsRecoverySurface(page, log, testInfo, parts, unknowns.next());
    return;
  }

  // Served equality at a fresh unknown URL.
  const response = await navigateLocalhost(page, unknowns.next());
  expect(response?.status(), 'the local preview marks the unknown URL with HTTP 404').toBe(404);
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);

  // Ordinary docs navigation must not carry a not-found entry.
  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  const navText = (await page.locator(DOCS_NAV).innerText()).replace(/\s+/g, ' ');
  expect(navText, 'ordinary docs navigation must not list the recovery page').not.toContain(
    parts.title,
  );

  // Theme retention through the real control — dark AND light.
  await setTheme(page, 'dark');
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);
  expect(await themeIs(page, 'dark'), 'the dark theme must remain on the recovery page').toBe(true);

  await setTheme(page, 'light');
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await expectRecoveryContent(page, parts);
  expect(await themeIs(page, 'light'), 'the light theme must remain on the recovery page').toBe(
    true,
  );
  capture(testInfo, 'ac2-manuscript-and-shell', {
    unknowns: unknowns.all(),
    emitted404Sha256: createHash('sha256').update(emitted).digest('hex'),
  });
});

test(`${FLOW_TOKEN}: AC-3 focus restoration and index exclusion`, async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  const parts = manuscriptParts();
  const unknowns = makeUnknownPaths(`ac3-${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  const log = trackRequests(page);

  if (isNoJs(testInfo)) {
    await expectNoJsRecoverySurface(page, log, testInfo, parts, unknowns.next());
    return;
  }

  // Leg 1: Escape closes recovery search and restores the trigger's focus.
  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  await openRecoverySearch(page);
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  await expect
    .poll(
      async () => recoveryTriggerIsFocused(page),
      'Escape must restore focus to the Search the site control',
    )
    .toBe(true);

  // Leg 2: ordinary vs recovery searches share the production index.
  await navigateLocalhost(page, '/docs/introduction');
  await settle(page, testInfo);
  const ordinaryBefore = log.pagefind.length;
  await page.locator(HEADER_SEARCH_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  const ordinaryHrefs = await resultHrefs(page);
  const ordinaryPagefind = log.pagefind.slice(ordinaryBefore);
  expect(ordinaryHrefs, 'the ordinary search must reach Message').toContain('/components/message/');
  expect(
    ordinaryPagefind.some((url) => url.includes('/pagefind/pagefind.js')),
    'the ordinary search loads the production Pagefind module',
  ).toBe(true);

  await navigateLocalhost(page, unknowns.next());
  await settle(page, testInfo);
  const recoveryBefore = log.pagefind.length;
  await openRecoverySearch(page);
  await awaitPagefindReady(page);
  await searchFor(page, 'message');
  const recoveryHrefs = await resultHrefs(page);
  const recoveryPagefind = log.pagefind.slice(recoveryBefore);
  expect(recoveryHrefs, 'the recovery search must reach the same Message destination').toContain(
    '/components/message/',
  );
  expect(
    recoveryPagefind.some((url) => url.includes('/pagefind/pagefind.js')),
    'the recovery search loads the same production Pagefind module',
  ).toBe(true);

  // Leg 3: completed manuscript queries exclude every recovery URL.
  await searchFor(page, parts.title);
  const titleHrefs = await resultHrefs(page);
  await searchFor(page, manuscriptHintPhrase(parts));
  const phraseHrefs = await resultHrefs(page);
  const forbidden = recoveryUrlRule(unknowns.all());
  for (const [label, hrefs] of [
    ['missing-page title', titleHrefs],
    ['manuscript phrase', phraseHrefs],
  ] as const) {
    expect(
      hrefs.filter(forbidden),
      `the completed ${label} query must exclude every recovery URL (got ${JSON.stringify(hrefs)})`,
    ).toEqual([]);
  }
  capture(testInfo, 'ac3-focus-and-index', {
    unknowns: unknowns.all(),
    ordinaryPagefind,
    recoveryPagefind,
    titleQueryCount: titleHrefs.length,
    phraseQueryCount: phraseHrefs.length,
  });
});

test(`${FLOW_TOKEN}: AC-4 recover through ordinary links without JavaScript`, async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const parts = manuscriptParts();
  const unknowns = makeUnknownPaths(`ac4-${Date.now()}-${Math.floor(Math.random() * 1e9)}`);
  const log = trackRequests(page);

  const firstUnknown = unknowns.next();
  const response = await navigateLocalhost(page, firstUnknown);
  expect(response?.status(), 'the local preview marks the unknown URL with HTTP 404').toBe(404);
  await expectRecoveryContent(page, parts);

  if (isNoJs(testInfo)) {
    expect(log.pagefind, 'no Pagefind resource may load without JavaScript').toEqual([]);
  }

  // Plain Components link → /components with real family content.
  await page.locator('main a[href="/components"]').click();
  await page.waitForURL(/\/components\/?$/);
  await page.waitForLoadState('load');
  expect(
    new URL(page.url()).pathname.replace(/\/$/, ''),
    'the Components link must leave the unknown URL',
  ).toBe('/components');
  expect(await fetchCurrentStatus(page), '/components must be HTTP 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText(/components/i);
  const familyTexts = await page.locator('.family-grid').allInnerTexts();
  expect(
    familyTexts.length,
    '/components must render the component families',
  ).toBeGreaterThanOrEqual(5);
  expect(
    familyTexts.join(' ').replace(/\s+/g, ' ').length,
    '/components must render component-family content',
  ).toBeGreaterThan(200);

  // Fresh unknown URL, then the plain Registry link → /registry with the ledger.
  await navigateLocalhost(page, unknowns.next());
  await expectRecoveryContent(page, parts);
  await page.locator('main a[href="/registry"]').click();
  await page.waitForURL(/\/registry\/?$/);
  await page.waitForLoadState('load');
  expect(
    new URL(page.url()).pathname.replace(/\/$/, ''),
    'the Registry link must leave the unknown URL',
  ).toBe('/registry');
  expect(await fetchCurrentStatus(page), '/registry must be HTTP 200').toBe(200);
  const ledgerText = (await page.locator('[data-ledger]').innerText()).replace(/\s+/g, ' ');
  expect(ledgerText.length, '/registry must render the real ledger').toBeGreaterThan(200);
  expect(ledgerText).toContain('nativewind');
  if (isNoJs(testInfo)) {
    expect(log.pagefind, 'still zero Pagefind requests').toEqual([]);
  }
  capture(testInfo, 'ac4-plain-links', {
    unknowns: unknowns.all(),
    nojs: isNoJs(testInfo),
    pagefindRequests: log.pagefind,
  });
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();

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

let anyFailure = false;

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

// The declared flow artifact must be (re)written by the playback itself:
// run_flow fingerprints it before/after the run to prove this gate replay
// produced fresh, current evidence (search-contract.spec.ts precedent).
test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-ast-009-${Date.now()}`,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      page404: hashFile('apps/docs/src/pages/404.astro'),
      systemManuscript: hashFile('apps/docs/src/content/system/not-found.md'),
      searchDialogScript: hashFile('apps/docs/src/scripts/search-dialog.ts'),
      searchDialogIsland: hashFile('apps/docs/src/components/islands/SearchDialog.astro'),
      docsLayout: hashFile('apps/docs/src/layouts/DocsLayout.astro'),
      testFile: hashFile('tests/sprint-05-orient-search/not-found-search-recovery.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      dist404: hashFile('apps/docs/dist/404.html'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-009/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
