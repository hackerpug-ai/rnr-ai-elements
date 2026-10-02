import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-AST-010 AC-4 — FLOW-SHELL-08: Pagefind loads only on first open and
 * no-JavaScript navigation makes zero Pagefind requests. The complete journey
 * against the real built dist: a five-second wait, real navigation-link hover
 * and real ClientRouter soft navigation produce zero /pagefind/ requests; the
 * first open loads the same-origin module and real index resources; an
 * unchanged-query reopen adds zero more; and the JavaScript-disabled context
 * navigates everywhere without a single Pagefind request.
 */

const FLOW_TOKEN = 'FLOW-SHELL-08-pagefind-lazy-load-on-first-open';
const CAPTURE_DIR = '.tmp/ORI-AST-010/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open';

const SEARCH_TRIGGER = '[data-search-slot] button[aria-haspopup="dialog"]';
const SEARCH_DIALOG = 'dialog[aria-modal="true"]';
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const PAGEFIND_URL = /\/pagefind\//;

interface RequestLog {
  urls: { url: string; at: number }[];
  pagefind: { url: string; at: number }[];
}

/** Observation-only request capture. Attach BEFORE the first navigation. */
function trackRequests(page: Page): RequestLog {
  const log: RequestLog = { urls: [], pagefind: [] };
  page.on('request', (request) => {
    const url = request.url();
    const at = Date.now();
    log.urls.push({ url, at });
    if (PAGEFIND_URL.test(url)) log.pagefind.push({ url, at });
  });
  return log;
}

function isNoJs(testInfo: { project: { name: string } }): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

function capture(testInfo: { project: { name: string } }, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
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

/** Hover a real navigation control, whichever form the viewport shows. */
async function hoverSiteNav(page: Page): Promise<void> {
  const desktopLink = page.locator('.site-header__nav-link').first();
  if (await desktopLink.isVisible()) {
    await desktopLink.hover();
  } else {
    await page.locator('.site-drawer__toggle').hover();
  }
}

/** Follow one site nav label through a real link (desktop nav or drawer). */
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

test(`${FLOW_TOKEN}`, async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;
  const log = trackRequests(page);

  if (isNoJs(testInfo)) {
    // -- JavaScript-disabled journey: links work, zero Pagefind requests -----
    const intro = await navigateLocalhost(page, '/docs/introduction');
    expect(
      intro?.status(),
      'the integrated candidate must serve /docs/introduction with HTTP 200',
    ).toBe(200);
    const introText = (
      await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })
    ).replace(/\s+/g, ' ');
    soft(introText.length, 'no-JS introduction renders readable content').toBeGreaterThan(200);

    const installLink = page.locator('a[href="/docs/installation"]').first();
    soft(await installLink.isVisible(), 'a real link to /docs/installation is present').toBe(true);
    await installLink.click({ timeout: 10_000 });
    await page.waitForLoadState('load');
    soft(
      (await page.locator('[data-pagefind-body]').innerText({ timeout: 10_000 })).length,
      'no-JS installation renders readable destination content',
    ).toBeGreaterThan(200);

    const registryLink = page.locator('a[href="/registry"]').first();
    soft(await registryLink.isVisible(), 'a real link to /registry is present').toBe(true);
    await registryLink.click({ timeout: 10_000 });
    await page.waitForLoadState('load');
    soft(page.url(), 'no-JS navigation reaches /registry').toContain('/registry');
    soft(
      await page
        .locator('[data-ledger]')
        .innerText()
        .then((t) => t.length),
      'no-JS /registry renders readable content',
    ).toBeGreaterThan(200);

    soft(
      log.pagefind,
      `the complete no-JavaScript request log records zero Pagefind requests; saw ${JSON.stringify(
        log.pagefind,
      )}`,
    ).toEqual([]);
    capture(testInfo, FLOW_TOKEN, { journey: 'nojs', pagefindRequests: log.pagefind });
    return;
  }

  // -- Phase 1: browse WITHOUT opening search --------------------------------
  const phaseBoundary = Date.now();
  const intro = await navigateLocalhost(page, '/docs/introduction');
  soft(intro?.status(), '/docs/introduction responds 200').toBe(200);
  await waitForAstroPageLoad(page);
  await page.waitForTimeout(5_000);
  await hoverSiteNav(page);
  await page.getByRole('link', { name: 'Installation' }).first().click();
  await page.waitForURL(/\/docs\/installation\/?$/);
  await followSiteNav(page, 'Registry', /\/registry\/?$/);
  await waitForAstroPageLoad(page);
  const preOpenPagefind = log.pagefind;
  soft(
    preOpenPagefind,
    `before opening search the complete request log has zero /pagefind/ requests after a 5s wait, hover and soft navigation; saw ${JSON.stringify(
      preOpenPagefind,
    )}`,
  ).toEqual([]);

  // -- Phase 2: FIRST open — module + real index resources -------------------
  const firstOpenAt = Date.now();
  await page.locator(SEARCH_TRIGGER).click();
  await page.locator(`${SEARCH_DIALOG}[open]`).waitFor({ state: 'visible', timeout: 5_000 });
  await awaitPagefindReady(page);
  await page.locator(SEARCH_INPUT).fill('streamdown');
  await expect
    .poll(async () =>
      page.evaluate(() =>
        (
          (globalThis as unknown as { __rnrSearchSettledQueries?: string[] })
            .__rnrSearchSettledQueries ?? []
        ).includes('streamdown'),
      ),
    )
    .toBe(true);
  const results = await page.locator(SEARCH_RESULT_LINK).count();
  soft(results, 'the first open serves real results from the real index').toBeGreaterThan(0);

  const firstOpenPagefind = log.pagefind.filter((entry) => entry.at >= firstOpenAt);
  const moduleRequests = firstOpenPagefind.filter((entry) =>
    entry.url.includes('/pagefind/pagefind.js'),
  );
  soft(moduleRequests.length, 'first open requests the Pagefind module exactly once').toBe(1);
  soft(
    moduleRequests[0]?.url.startsWith(`${PREVIEW_URL}/pagefind/`) ?? false,
    'the Pagefind module is same-origin',
  ).toBe(true);
  const indexResources = firstOpenPagefind.filter(
    (entry) => !entry.url.includes('/pagefind/pagefind.js'),
  );
  soft(
    indexResources.length,
    `first open loads at least 1 real index resource; saw ${JSON.stringify(indexResources)}`,
  ).toBeGreaterThanOrEqual(1);

  // -- Phase 3: close, reopen unchanged — zero additional requests -----------
  const closeAt = Date.now();
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
  const reopenAt = Date.now();
  await page.locator(SEARCH_TRIGGER).click();
  await page.locator(`${SEARCH_DIALOG}[open]`).waitFor({ state: 'visible', timeout: 5_000 });
  await expect(page.locator(SEARCH_INPUT)).toHaveValue('streamdown');
  await expect(page.locator(SEARCH_RESULT_LINK).first()).toBeVisible();
  const reopenPagefind = log.pagefind.filter((entry) => entry.at >= closeAt);
  soft(
    reopenPagefind,
    `closing and reopening with an unchanged query adds zero Pagefind requests; saw ${JSON.stringify(
      reopenPagefind,
    )}`,
  ).toEqual([]);

  capture(testInfo, FLOW_TOKEN, {
    phaseBoundaries: { phaseBoundary, firstOpenAt, closeAt, reopenAt },
    preOpenPagefindRequests: preOpenPagefind.length,
    firstOpenModuleRequests: moduleRequests.map((entry) => entry.url),
    firstOpenIndexResources: indexResources.map((entry) => entry.url),
    reopenPagefindRequests: reopenPagefind.length,
    streamdownResultCount: results,
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
    runIdentity: `ori-ast-010-flow-shell-08-${Date.now()}`,
    flowToken: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      searchDialogIsland: hashFile('apps/docs/src/components/islands/SearchDialog.astro'),
      searchDialogScript: hashFile('apps/docs/src/scripts/search-dialog.ts'),
      testFile: hashFile('tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      driver: hashFile('tests/harness/docs-preview.ts'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-010/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
