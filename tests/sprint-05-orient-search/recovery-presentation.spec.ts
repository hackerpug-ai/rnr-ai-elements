import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BrowserContext, Page, TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-VIS-005 — the branded missing-page search recovery SURFACE, presented
 * over ORI-AST-009's proven mechanics. Five named tests, one per AC, observed
 * on the BUILT dist served by the owned preview at http://localhost:4321:
 *
 *   - ORI-VIS-005-ac-1  both run-bound absent URLs (root and /docs/ level)
 *                       return HTTP 404 with the branded six-region shell;
 *                       recovery copy renders ONCE (no duplicated manuscript
 *                       text) and the R5 action row carries the three CTAs
 *                       (Search the site + Components + Registry); both
 *                       ordinary links reach their real HTTP 200 pages.
 *   - ORI-VIS-005-ac-2  the revealed recovery action opens exactly 1 shared
 *                       SearchDialog (aria-modal, focused input), and the real
 *                       renderMarkdown result navigates to the canonical
 *                       boundary page; chromium-nojs proves 0 dead search
 *                       controls and the ordinary Components fallback.
 *   - ORI-VIS-005-ac-3  JavaScript-disabled navigation (the chromium-nojs
 *                       project, plus an explicitly disabled context on the
 *                       JS projects) keeps readable server-rendered recovery
 *                       and both ordinary links; nojs-links.png is captured.
 *   - ORI-VIS-005-ac-4  light and dark through the REAL theme control, at
 *                       desktop and mobile viewports: single content column,
 *                       0 clipped actions, and the 2px/2px --ring focus
 *                       outline on the keyboard-focused recovery actions;
 *                       unknown-path-light.png / unknown-path-dark.png.
 *   - ORI-VIS-005-ac-5  the deployment owner's public-origin probe against
 *                       https://rnraielements.com; an origin not serving the
 *                       reviewed candidate is a FAILED PREREQUISITE, never a
 *                       skip and never replaced by a localhost capture.
 *
 * Nothing is intercepted or manufactured: the recovery copy is read from the
 * real system manuscript, the dialog is the existing SearchDialog island
 * opened through the page's own Search the site control, the index is the
 * real Pagefind output of the built dist, and the unknown URLs are generated
 * fresh per run with no route created for them. Requests are observed only.
 *
 * Scoped to this repo's no-DOM-lib tsconfig: browser-side expressions are
 * STRING evaluates (search-presentation.spec.ts precedent) and the
 * chromium-nojs project sticks to locator/protocol APIs except for the
 * in-page status fetch ORI-AST-009 already runs on that project.
 */

const RECOVERY_TRIGGER = '[data-recovery-search]';
const HEADER_SEARCH_TRIGGER = '[data-search-slot] button';
const OPEN_SEARCH_DIALOG = 'dialog[aria-modal="true"][open]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const ACTION_ROW = 'main .not-found__links';
const HEADER = '.site-header';
const FOOTER = '.site-footer';
const THEME_TRIGGER = '.theme-toggle__trigger';
const MANUSCRIPT_PATH = 'apps/docs/src/content/system/not-found.md';
const BOUNDARY_PATH = '/docs/owns-vs-does-not-own';
const PUBLIC_ORIGIN = 'https://rnraielements.com';

const REPO_ROOT = process.cwd();
const EVIDENCE_RECOVERY = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/recovery');
const PHASE_ROOT = join(
  REPO_ROOT,
  `.tmp/ORI-VIS-005/cycle-1/${process.env.ORI_VIS_PHASE ?? 'green'}`,
);

/** This playback's fresh run identity — every unknown path is bound to it. */
const RUN_ID = `ori-vis-005-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function sha256File(relative: string): string {
  try {
    return sha256Text(readFileSync(join(REPO_ROOT, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

/** Run/source/lockfile/dist/index/test/policy identity for evidence binding. */
function runIdentity(): Record<string, unknown> {
  return {
    runId: RUN_ID,
    capturedAt: new Date().toISOString(),
    gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT }).toString().trim(),
    sourceHashes: {
      page404: sha256File('apps/docs/src/pages/404.astro'),
      systemManuscript: sha256File(MANUSCRIPT_PATH),
      docsLayout: sha256File('apps/docs/src/layouts/DocsLayout.astro'),
      searchDialogIsland: sha256File('apps/docs/src/components/islands/SearchDialog.astro'),
      searchDialogScript: sha256File('apps/docs/src/scripts/search-dialog.ts'),
      spec: sha256File('tests/sprint-05-orient-search/recovery-presentation.spec.ts'),
      lockfile: sha256File('pnpm-lock.yaml'),
      dist404: sha256File('apps/docs/dist/404.html'),
      pagefindEntry: sha256File('apps/docs/dist/pagefind/pagefind-entry.json'),
      surfacePolicy: sha256File('.spec/e2e-policy/surface.json'),
      coldbootPolicy: sha256File('.spec/e2e-policy/coldboot.json'),
    },
  };
}

/** Phase capture: observed values for this test, under the cycle phase root. */
function capture(testInfo: TestInfo, name: string, observed: Record<string, unknown>): void {
  const dir = join(PHASE_ROOT, 'captures');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    JSON.stringify(
      {
        runId: RUN_ID,
        project: testInfo.project.name,
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

/** Run-bound screenshots live under evidence/recovery/runs/<runId>/. */
function runShotPath(testInfo: TestInfo, name: string): string {
  const dir = join(EVIDENCE_RECOVERY, 'runs', RUN_ID);
  mkdirSync(dir, { recursive: true });
  return join(dir, `${testInfo.project.name}-${name}.png`);
}

/** The four contract evidence artifacts land at their exact allowed paths. */
function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_RECOVERY, { recursive: true });
  return join(EVIDENCE_RECOVERY, name);
}

/** Read-merge-write for the shared recovery manifest record. */
function mergeManifest(fields: Record<string, unknown>): void {
  const path = evidencePath('manifest.json');
  let record: Record<string, unknown> = {};
  try {
    record = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    record = {};
  }
  writeFileSync(path, JSON.stringify({ ...record, ...fields }, null, 2));
}

/**
 * The manuscript parsed the same way the route parses it (ORI-AST-009): the
 * first `# ` block is the title, the next two non-empty blocks are the
 * explanation and the search hint. Reading the REAL file makes copy drift
 * fail loudly instead of laundering authored wording into the assertions.
 */
function manuscriptParts(): { title: string; explanation: string; hint: string } {
  const raw = readFileSync(join(REPO_ROOT, MANUSCRIPT_PATH), 'utf8');
  const blocks = raw
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
  if (blocks.length < 3 || !blocks[0].startsWith('# ')) {
    throw new Error(`${MANUSCRIPT_PATH} must carry a # title plus explanation and hint blocks`);
  }
  return { title: blocks[0].replace(/^#\s+/, ''), explanation: blocks[1], hint: blocks[2] };
}

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

/** Settle after load, except the no-JavaScript project evaluates nothing. */
async function settle(page: Page, testInfo: TestInfo): Promise<void> {
  if (isNoJs(testInfo)) return;
  await waitForAstroPageLoad(page);
}

/**
 * Fresh-run unknown paths per the built_recovery fixture: one root-level path
 * and one /docs/-level path, unique to this run, with no route ever created.
 */
function runUnknownPaths(): { root: string; docs: string; extra: (n: number) => string } {
  return {
    root: `/ori-vis-005-missing-${RUN_ID}`,
    docs: `/docs/ori-vis-005-missing-${RUN_ID}`,
    extra: (n: number) => `/docs/ori-vis-005-missing-${RUN_ID}-${n}`,
  };
}

/** The current document's own HTTP status, read inside the real page. */
async function fetchCurrentStatus(page: Page): Promise<number> {
  return (await page.evaluate(`(() => {
    const g = globalThis;
    return g.fetch(g.location.href).then((r) => r.status);
  })()`)) as number;
}

/** Computed focus ring of a recovery action, plus the live-resolved --ring. */
async function actionRing(
  page: Page,
  selector: string,
): Promise<{
  outlineWidth: string;
  outlineStyle: string;
  outlineOffset: string;
  outlineColor: string;
  ringTokenColor: string;
} | null> {
  return (await page.evaluate(`(() => {
    const g = globalThis;
    const el = g.document.querySelector('${selector}');
    if (!el) return null;
    const probe = g.document.createElement('span');
    probe.style.cssText = 'color:var(--ring);position:absolute;visibility:hidden;';
    g.document.body.appendChild(probe);
    const ringTokenColor = g.getComputedStyle(probe).color;
    probe.remove();
    const cs = g.getComputedStyle(el);
    return {
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineOffset: cs.outlineOffset,
      outlineColor: cs.outlineColor,
      ringTokenColor,
    };
  })()`)) as {
    outlineWidth: string;
    outlineStyle: string;
    outlineOffset: string;
    outlineColor: string;
    ringTokenColor: string;
  } | null;
}

function expectRing(
  ring: {
    outlineWidth: string;
    outlineStyle: string;
    outlineOffset: string;
    outlineColor: string;
    ringTokenColor: string;
  } | null,
  what: string,
): void {
  expect(ring, `${what} exposes computed outline properties`).not.toBeNull();
  if (!ring) return;
  expect.soft(ring.outlineWidth, `${what} ring is 2px wide`).toBe('2px');
  expect.soft(ring.outlineStyle, `${what} ring is solid`).toBe('solid');
  expect.soft(ring.outlineOffset, `${what} ring offset is 2px`).toBe('2px');
  expect
    .soft(ring.outlineColor, `${what} ring resolves the --ring token color`)
    .toBe(ring.ringTokenColor);
}

/** Keyboard-focus a recovery action with real Tab presses (:focus-visible).
 * Zero-arg IIFE string with the selector INLINED (values do not serialize
 * into string evaluates; only their literal text does). */
async function tabUntilFocused(page: Page, selector: string, maxTabs = 40): Promise<boolean> {
  for (let i = 0; i < maxTabs; i += 1) {
    const focused = (await page.evaluate(`(() => {
      const el = globalThis.document.activeElement;
      return !!el && el.matches('${selector}');
    })()`)) as boolean;
    if (focused) return true;
    await page.keyboard.press('Tab');
  }
  return false;
}

/** Single-column + no-overflow geometry of the recovery surface (JS pages). */
async function recoveryGeometry(page: Page): Promise<{
  gridTemplateColumns: string | null;
  columnTracks: number;
  scrollWidth: number;
  clientWidth: number;
  viewportWidth: number;
  actionBounds: Record<string, { left: number; right: number; top: number; bottom: number } | null>;
  actionsFullyInside: boolean;
} | null> {
  return (await page.evaluate(`(() => {
    const g = globalThis;
    const main = g.document.querySelector('main.not-found');
    if (!main) return null;
    const de = g.document.documentElement;
    const cols = g.getComputedStyle(main).gridTemplateColumns;
    const vw = g.innerWidth;
    const vh = g.innerHeight;
    const sels = ['[data-recovery-search]', 'main a[href="/components"]', 'main a[href="/registry"]'];
    const actionBounds = {};
    let actionsFullyInside = true;
    for (const sel of sels) {
      const el = g.document.querySelector(sel);
      if (!el || el.offsetParent === null) { actionBounds[sel] = null; continue; }
      const r = el.getBoundingClientRect();
      actionBounds[sel] = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) actionsFullyInside = false;
    }
    return {
      gridTemplateColumns: cols,
      columnTracks: !cols || cols === 'none' ? 1 : cols.trim().split(/\\s+/).length,
      scrollWidth: de.scrollWidth,
      clientWidth: de.clientWidth,
      viewportWidth: vw,
      actionBounds,
      actionsFullyInside,
    };
  })()`)) as {
    gridTemplateColumns: string | null;
    columnTracks: number;
    scrollWidth: number;
    clientWidth: number;
    viewportWidth: number;
    actionBounds: Record<
      string,
      { left: number; right: number; top: number; bottom: number } | null
    >;
    actionsFullyInside: boolean;
  } | null;
}

/**
 * Flip the site to the target theme through the real ThemeToggle control
 * ONLY (ORI-AST-009's helper): the stored rnr-theme value is written by the
 * control and asserted here as the retention witness. A fresh context can
 * already sit in the target theme WITHOUT ever having written storage (the
 * pre-paint default) — then the control is toggled away and back so the
 * witness is always earned by real clicks.
 */
async function setTheme(page: Page, target: 'dark' | 'light'): Promise<void> {
  const flipped = async (): Promise<boolean> =>
    (await page.evaluate(`(() => {
      return globalThis.document.documentElement.classList.contains('${target}');
    })()`)) as boolean;
  const stored = async (): Promise<string | null> =>
    (await page.evaluate(`(() => {
      return globalThis.localStorage.getItem('rnr-theme');
    })()`)) as string | null;
  if ((await flipped()) && (await stored()) !== target) {
    await page.locator(THEME_TRIGGER).click();
    await expect.poll(flipped, `the real toggle must leave ${target} first`).toBe(false);
  }
  if (!(await flipped())) {
    await page.locator(THEME_TRIGGER).click();
    await expect.poll(flipped, `the real toggle must flip the site to ${target}`).toBe(true);
  }
  await expect.poll(stored, 'the real theme control must persist its own selection').toBe(target);
}

/**
 * Single-content-column oracle, valid with and without JavaScript: every
 * direct region of the recovery main shares the first region's left edge
 * (one grid/flex column, independent of main's own padding) and none is
 * clipped to zero width.
 */
async function expectSingleColumn(page: Page, what: string): Promise<void> {
  const regions = page.locator('main.not-found > *');
  const count = await regions.count();
  expect(count, `${what} composes recovery regions`).toBeGreaterThan(0);
  const firstX = (await regions.first().boundingBox())?.x ?? 0;
  for (let i = 0; i < count; i += 1) {
    const box = await regions.nth(i).boundingBox();
    expect(
      Math.abs((box?.x ?? 0) - firstX),
      `${what}: every recovery region shares the single content column`,
    ).toBeLessThanOrEqual(2);
    expect(box?.width ?? 0, `${what}: no recovery region is clipped away`).toBeGreaterThan(0);
  }
}

/** Wait for the real Pagefind module to finish initializing in the page. */
async function awaitPagefindReady(page: Page): Promise<void> {
  await page.waitForFunction(`(window.__rnrSearchReady === true)`, undefined, {
    timeout: 20_000,
  });
}

/** Type a query through the real input and wait for the island to settle it. */
async function searchFor(page: Page, query: string): Promise<void> {
  await page.locator(SEARCH_INPUT).fill(query);
  await expect
    .poll(async () => page.evaluate(`(window.__rnrSearchSettledQueries ?? [])`))
    .toContain(query);
}

/** Press ArrowDown until the given destination is the active result. */
async function activateResult(page: Page, href: string): Promise<void> {
  const count = await page.locator(SEARCH_RESULT_LINK).count();
  expect(count, `a result for ${href} must exist among the search results`).toBeGreaterThan(0);
  for (let attempt = 0; attempt < count + 1; attempt += 1) {
    const activeHref = (await page.evaluate(`(() => {
      const active = globalThis.document.querySelector(
        'dialog[aria-modal="true"] a[data-search-result][data-active="true"]',
      );
      return active ? active.getAttribute('href') : null;
    })()`)) as string | null;
    if (activeHref === href) return;
    await page.keyboard.press('ArrowDown');
  }
  throw new Error(`could not activate ${href} with the keyboard`);
}

// ---------------------------------------------------------------------------
// AC-1 — unknown-path composition and ordinary destinations
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-1: unknown-path composition and ordinary destinations', async ({
  page,
}, testInfo) => {
  test.setTimeout(300_000);
  const parts = manuscriptParts();
  const unknowns = runUnknownPaths();
  const observed: Record<string, unknown>[] = [];

  for (const unknownPath of [unknowns.root, unknowns.docs]) {
    const response = await navigateLocalhost(page, unknownPath);
    const status = response?.status();
    expect(status, `${unknownPath} must be served with HTTP 404`).toBe(404);
    await settle(page, testInfo);

    // The branded six-region shell: R1 header, R2 title block, R4 hint, R6
    // footer — with the manuscript served byte-equal (ORI-AST-009's pins).
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
    await expect(page.locator('.page-header__description')).toHaveText(parts.explanation);
    await expect(page.locator('.callout__title')).toHaveText(parts.hint);
    await expect(page.locator(HEADER)).toBeVisible();
    await expect(page.locator(FOOTER)).toBeVisible();

    // Presentation: the approved explanation renders ONCE in the recovery
    // document — a duplicated manuscript paragraph is a composition defect.
    expect(
      await page.getByText(parts.explanation, { exact: true }).count(),
      'the approved explanation must accompany the title exactly once',
    ).toBe(1);

    // Presentation: R5 is THE action row — the three recovery CTAs (primary
    // Search the site + the two ordinary outline links) compose one row, and
    // the search CTA does not ride the R4 callout.
    const row = page.locator(ACTION_ROW);
    await expect(row, 'the R5 recovery action row must exist').toBeVisible();
    expect(await row.locator(':scope > *').count(), 'the action row carries 3 CTAs').toBe(3);
    expect(await row.locator(':scope > [data-recovery-search]').count()).toBe(1);
    expect(await row.locator(':scope > a[href="/components"]').count()).toBe(1);
    expect(await row.locator(':scope > a[href="/registry"]').count()).toBe(1);
    expect(
      await page.locator(`.callout ${RECOVERY_TRIGGER}`).count(),
      'the search CTA belongs to the R5 action row, not the R4 callout',
    ).toBe(0);

    // One content column: every recovery region aligns to the same left edge
    // (protocol-level geometry, valid with and without JavaScript).
    await expectSingleColumn(page, `the recovery surface at ${unknownPath}`);

    observed.push({ unknownPath, status, title: parts.title });
    await page.screenshot({
      path: runShotPath(testInfo, `ac1-recovery-${unknownPath.replace(/\//g, '-')}`),
      fullPage: true,
    });

    // Follow the ordinary Components link to its real page.
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
    expect(familyTexts.length, '/components renders the real families').toBeGreaterThanOrEqual(5);
    await page.screenshot({ path: runShotPath(testInfo, 'ac1-components'), fullPage: true });

    // Return to the SAME missing URL and follow the Registry link.
    await navigateLocalhost(page, unknownPath);
    await settle(page, testInfo);
    await page.locator('main a[href="/registry"]').click();
    await page.waitForURL(/\/registry\/?$/);
    await page.waitForLoadState('load');
    expect(
      new URL(page.url()).pathname.replace(/\/$/, ''),
      'the Registry link must leave the unknown URL',
    ).toBe('/registry');
    expect(await fetchCurrentStatus(page), '/registry must be HTTP 200').toBe(200);
    await expect(page.locator('main h1')).toHaveText(/registry/i);
    const ledgerText = (await page.locator('[data-ledger]').innerText()).replace(/\s+/g, ' ');
    expect(ledgerText.length, '/registry renders the real ledger').toBeGreaterThan(200);
    expect(ledgerText).toContain('nativewind');
    await page.screenshot({ path: runShotPath(testInfo, 'ac1-registry'), fullPage: true });

    observed.push({
      destinations: {
        components: { url: '/components', status: 200 },
        registry: { url: '/registry', status: 200 },
      },
    });
  }

  capture(testInfo, 'ac1-unknown-paths', { observed, ...runIdentity() });
});

// ---------------------------------------------------------------------------
// AC-2 — shared search recovers to canonical content
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-2: shared search recovers to canonical content', async ({
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  const parts = manuscriptParts();
  const unknowns = runUnknownPaths();
  const unknownPath = unknowns.docs;

  // The JavaScript-disabled project proves its real supported surface: 0
  // exposed or focusable dead recovery search controls, ordinary fallback.
  if (isNoJs(testInfo)) {
    const response = await navigateLocalhost(page, unknownPath);
    expect(response?.status(), 'the unknown URL is served with HTTP 404').toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
    await expect(page.locator(RECOVERY_TRIGGER), 'no dead recovery search button').toBeHidden();
    await expect(page.locator(HEADER_SEARCH_TRIGGER), 'no dead header search button').toBeHidden();
    await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveCount(0);
    await page.locator('main a[href="/components"]').click();
    await page.waitForURL(/\/components\/?$/);
    expect(await fetchCurrentStatus(page), '/components must be HTTP 200').toBe(200);
    capture(testInfo, 'ac2-nojs-fallback', { unknownPath, deadSearchControls: 0 });
    return;
  }

  await navigateLocalhost(page, unknownPath);
  await settle(page, testInfo);

  // The revealed recovery action opens the ONE shared dialog.
  await page.locator(RECOVERY_TRIGGER).click();
  await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  expect(
    await page.locator(OPEN_SEARCH_DIALOG).count(),
    'exactly 1 shared SearchDialog opens',
  ).toBe(1);
  await expect(page.locator(OPEN_SEARCH_DIALOG)).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator(SEARCH_INPUT)).toBeFocused();

  // Real index, real query, real boundary destination.
  await awaitPagefindReady(page);
  await searchFor(page, 'renderMarkdown');
  await activateResult(page, `${BOUNDARY_PATH}/`);
  await page.keyboard.press('Enter');
  await page.waitForURL(/\/owns-vs-does-not-own\/?$/);
  await page.waitForLoadState('load');
  await settle(page, testInfo);
  expect(
    new URL(page.url()).pathname.replace(/\/$/, ''),
    'the boundary result must replace the unknown URL',
  ).toBe(BOUNDARY_PATH);
  expect(await fetchCurrentStatus(page), 'the boundary page must be HTTP 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText('What the library owns');
  const boundaryText = (await page.locator('main').textContent()) ?? '';
  expect(boundaryText.includes('renderMarkdown'), 'the boundary page explains renderMarkdown').toBe(
    true,
  );
  await page.screenshot({ path: runShotPath(testInfo, 'ac2-boundary'), fullPage: true });
  capture(testInfo, 'ac2-search-recovery', {
    unknownPath,
    dialogCount: 1,
    destination: BOUNDARY_PATH,
    destinationStatus: 200,
    ...runIdentity(),
  });
});

// ---------------------------------------------------------------------------
// AC-3 — no-JavaScript recovery remains useful
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-3: no-JavaScript recovery remains useful', async ({
  browser,
  page,
}, testInfo) => {
  test.setTimeout(240_000);
  const parts = manuscriptParts();
  const unknowns = runUnknownPaths();
  const project = testInfo.project.name;

  // The canonical nojs-links.png comes from the chromium-nojs project; the
  // JS projects repeat the same proof in an explicitly disabled context at
  // their own viewport (the nojs_recovery fixture's second seeding option).
  let npage: Page = page;
  let context: BrowserContext | null = null;
  if (!isNoJs(testInfo)) {
    context = await browser.newContext({ ...testInfo.project.use, javaScriptEnabled: false });
    npage = await context.newPage();
  }

  const response = await navigateLocalhost(npage, unknowns.root);
  expect(response?.status(), 'the unknown URL is served with HTTP 404').toBe(404);
  const html = (await response?.text()) ?? '';
  expect(html, 'the server HTML carries the approved title').toContain(parts.title);
  expect(html, 'the server HTML carries the approved explanation').toContain(parts.explanation);
  expect(html, 'the server HTML carries the approved hint').toContain(parts.hint);
  expect(html, 'the server HTML carries the Components href').toContain('href="/components"');
  expect(html, 'the server HTML carries the Registry href').toContain('href="/registry"');

  // Readable server-rendered recovery, in one column, no dead search control.
  await expect(npage.getByRole('heading', { level: 1 })).toHaveText(parts.title);
  await expect(npage.locator('.page-header__description')).toHaveText(parts.explanation);
  await expect(npage.locator('.callout__title')).toHaveText(parts.hint);
  await expect(npage.locator('main a[href="/components"]')).toBeVisible();
  await expect(npage.locator('main a[href="/registry"]')).toBeVisible();
  await expect(npage.locator(RECOVERY_TRIGGER), 'no dead recovery search button').toBeHidden();
  await expect(npage.locator(HEADER_SEARCH_TRIGGER), 'no dead header search button').toBeHidden();

  await expectSingleColumn(npage, 'no-JavaScript recovery');
  const links = npage.locator('main a[href="/components"], main a[href="/registry"]');
  for (let i = 0; i < (await links.count()); i += 1) {
    const box = await links.nth(i).boundingBox();
    expect(box?.width ?? 0, 'recovery links are rendered, not clipped away').toBeGreaterThan(0);
  }

  // nojs-links.png — the ordinary-links recovery surface, before following.
  const nojsShot = isNoJs(testInfo)
    ? evidencePath('nojs-links.png')
    : runShotPath(testInfo, 'ac3-disabled-context');
  await npage.screenshot({ path: nojsShot, fullPage: true });

  // Both ordinary links navigate without JavaScript.
  await npage.locator('main a[href="/components"]').click();
  await npage.waitForURL(/\/components\/?$/);
  await npage.waitForLoadState('load');
  expect(new URL(npage.url()).pathname.replace(/\/$/, '')).toBe('/components');
  await expect(npage.locator('main h1')).toHaveText(/components/i);

  await navigateLocalhost(npage, unknowns.docs);
  await npage.locator('main a[href="/registry"]').click();
  await npage.waitForURL(/\/registry\/?$/);
  await npage.waitForLoadState('load');
  expect(new URL(npage.url()).pathname.replace(/\/$/, '')).toBe('/registry');
  await expect(npage.locator('main h1')).toHaveText(/registry/i);

  capture(testInfo, 'ac3-nojs-recovery', {
    javaScriptEnabled: false,
    context: isNoJs(testInfo) ? 'chromium-nojs project' : 'explicitly disabled context',
    unknownPaths: [unknowns.root, unknowns.docs],
    responseHtmlSha256: sha256Text(html),
    nojsLinksShot: nojsShot,
    ...runIdentity(),
  });
  if (isNoJs(testInfo)) {
    mergeManifest({
      nojsLinks: { file: 'nojs-links.png', project, runId: RUN_ID, url: unknowns.root },
    });
  }
  if (context) await context.close();
});

// ---------------------------------------------------------------------------
// AC-4 — theme and mobile presentation
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-4: theme and mobile presentation', async ({ page }, testInfo) => {
  test.setTimeout(300_000);
  const parts = manuscriptParts();
  const unknowns = runUnknownPaths();
  const project = testInfo.project.name;

  // The no-JavaScript case: server-rendered theme, readable single column.
  if (isNoJs(testInfo)) {
    await navigateLocalhost(page, unknowns.root);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
    await expect(page.locator('main a[href="/components"]')).toBeVisible();
    await expect(page.locator('main a[href="/registry"]')).toBeVisible();
    const htmlClass = await page.locator('html').getAttribute('class');
    await expectSingleColumn(page, 'no-JavaScript recovery');
    await page.screenshot({ path: runShotPath(testInfo, 'ac4-nojs'), fullPage: true });
    capture(testInfo, 'ac4-nojs-presentation', {
      htmlClass,
      viewport: testInfo.project.use.viewport ?? null,
    });
    return;
  }

  await navigateLocalhost(page, unknowns.root);
  await settle(page, testInfo);

  for (const theme of ['light', 'dark'] as const) {
    await setTheme(page, theme);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
    await expect(page.locator('.callout__title')).toHaveText(parts.hint);
    await expect(page.locator('main a[href="/components"]')).toBeVisible();
    await expect(page.locator('main a[href="/registry"]')).toBeVisible();
    await expect(page.locator(RECOVERY_TRIGGER)).toBeVisible();

    const geometry = await recoveryGeometry(page);
    expect(geometry, 'the recovery surface exposes geometry').not.toBeNull();
    if (geometry) {
      expect.soft(geometry.columnTracks, `${theme}: one content column`).toBe(1);
      expect
        .soft(
          geometry.scrollWidth <= geometry.clientWidth + 1,
          `${theme}: no horizontal page overflow`,
        )
        .toBe(true);
      expect.soft(geometry.actionsFullyInside, `${theme}: 0 clipped recovery actions`).toBe(true);
    }

    // unknown-path-light.png / unknown-path-dark.png are the desktop contract
    // captures; the mobile project records its own run-bound inspection.
    const shot =
      project === 'chromium-desktop'
        ? evidencePath(`unknown-path-${theme}.png`)
        : runShotPath(testInfo, `ac4-${theme}`);
    await page.screenshot({ path: shot, fullPage: true });
    if (project === 'chromium-desktop') {
      mergeManifest({
        [`unknownPath${theme === 'light' ? 'Light' : 'Dark'}`]: {
          file: `unknown-path-${theme}.png`,
          project,
          runId: RUN_ID,
          theme,
          viewport: geometry?.viewportWidth ?? null,
        },
      });
    }
    capture(testInfo, `ac4-${theme}`, { shot, geometry, theme });
  }

  // The keyboard-focused recovery actions carry the shared focus indicator:
  // 2px outline, 2px offset, in the resolved --ring color (probe-measured).
  // Each ring is read WHILE that action holds focus.
  const rings: Record<string, unknown> = {};
  for (const selector of ['main a[href="/components"]', RECOVERY_TRIGGER]) {
    const focused = await tabUntilFocused(page, selector);
    expect(focused, `${selector} must be reachable by keyboard Tab`).toBe(true);
    const ring = await actionRing(page, selector);
    expectRing(ring, `the focused ${selector}`);
    rings[selector] = ring;
  }
  capture(testInfo, 'ac4-focus-rings', { rings, ...runIdentity() });
});

// ---------------------------------------------------------------------------
// AC-5 — public-origin presentation handoff (deployment-owner prerequisite)
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-005-ac-5: public-origin presentation handoff', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const parts = manuscriptParts();
  const url = `${PUBLIC_ORIGIN}/ori-vis-005-missing-${RUN_ID}`;
  const project = testInfo.project.name;

  // Direct navigation to the literal public HTTPS origin — ordinary public
  // DNS and trusted TLS or the goto itself fails (observed, never bypassed).
  const response = await page.goto(url, { timeout: 30_000 });
  const status = response?.status();
  const security = await response?.securityDetails();
  const html = (await response?.text()) ?? '';
  const componentsStatus = await page.request.get(`${PUBLIC_ORIGIN}/components`);
  const registryStatus = await page.request.get(`${PUBLIC_ORIGIN}/registry`);

  // The public capture is taken from THIS public browser session before any
  // verdict, bound to the actual URL and the observed response identity.
  if (project === 'chromium-desktop') {
    await page.screenshot({ path: evidencePath('public-unknown-path.png'), fullPage: true });
    mergeManifest({
      publicUnknownPath: {
        file: 'public-unknown-path.png',
        project,
        runId: RUN_ID,
        url,
        servedStatus: status ?? null,
        servedHtmlSha256: sha256Text(html),
        tlsProtocol: security?.protocol ?? null,
        localCandidateDist404: sha256File('apps/docs/dist/404.html'),
      },
    });
  }
  capture(testInfo, 'ac5-public-probe', {
    url,
    servedStatus: status ?? null,
    servedHtmlSha256: sha256Text(html),
    servedHtmlBytes: html.length,
    tls: security ? { protocol: security.protocol, issuer: security.issuer } : null,
    publicComponentsStatus: componentsStatus.status(),
    publicRegistryStatus: registryStatus.status(),
    localDist404: sha256File('apps/docs/dist/404.html'),
    ...runIdentity(),
  });

  // The prerequisite gate: the public origin must serve the reviewed
  // candidate's branded 404. A stale/default/empty public error body is a
  // FAILED PREREQUISITE — the deployment owner must publish the matching
  // candidate; no localhost capture or skip may stand in for it.
  const branded =
    status === 404 &&
    html.includes(parts.title) &&
    html.includes(parts.explanation) &&
    html.includes('href="/components"');
  if (!branded) {
    throw new Error(
      `PUBLIC PREREQUISITE unmet for ${url}: observed status=${status ?? 'none'}, ` +
        `bodyBytes=${html.length}, title=${html.includes(parts.title) ? 'present' : 'absent'}. ` +
        'The deployment owner must publish the reviewed candidate at the public origin ' +
        '(ORI-DEP-002/003) before this AC can pass; the capture above records the ' +
        'currently published reality.',
    );
  }

  // Matching-candidate assertions: the same branded surface and links, plus
  // the available shared search on JavaScript-enabled projects.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(parts.title);
  await expect(page.locator('main a[href="/components"]')).toBeVisible();
  await expect(page.locator('main a[href="/registry"]')).toBeVisible();
  expect(componentsStatus.status(), 'public /components must be HTTP 200').toBe(200);
  expect(registryStatus.status(), 'public /registry must be HTTP 200').toBe(200);
  if (!isNoJs(testInfo)) {
    await expect(page.locator(RECOVERY_TRIGGER)).toBeVisible();
    await page.locator(RECOVERY_TRIGGER).click();
    await page.locator(OPEN_SEARCH_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
    await expect(page.locator(SEARCH_INPUT)).toBeFocused();
    await page.keyboard.press('Escape');
  } else {
    await expect(page.locator(RECOVERY_TRIGGER), 'no dead public search control').toBeHidden();
  }
});
