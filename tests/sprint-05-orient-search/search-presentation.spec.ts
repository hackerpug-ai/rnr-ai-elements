import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-VIS-003 — presentation proofs over ORI-AST-004's REAL search dialog:
 * grouped results, live count, keyboard-visible selection, focus rings,
 * genuine loading/empty states, and mobile control geometry. Four named
 * tests, one per AC, all observed on the BUILT dist served by the owned
 * preview at http://localhost:4321:
 *
 *   - ORI-VIS-003-AC-1  focus ring on the real input; genuine first-open
 *                       loading leaves input and close action reachable
 *   - ORI-VIS-003-AC-2  real streamdown / renderMarkdown / dev client result
 *                       groups, titles, snippets, announced count
 *   - ORI-VIS-003-AC-3  arrow selection visibly distinct in light AND dark
 *                       (real header theme control); Escape restores a ringed
 *                       invoking control
 *   - ORI-VIS-003-AC-4  mobile scroll keeps input and close fully inside the
 *                       viewport; reduced motion runs 0 entrance animations
 *
 * Presentation-only observations: computed styles, geometry and screenshots
 * of the REAL dialog, its REAL input, results and invoking control — never a
 * body/root oracle, never intercepted or manufactured data (queries go
 * through the real input; requests are only observed). Loading is sampled
 * as-is on first open, never delayed. The chromium-nojs project (full lane)
 * executes its actual supported surface — the search control stays hidden —
 * and never calls page.evaluate.
 *
 * Scoped to this repo's no-DOM-lib tsconfig: browser-side expressions are
 * STRING evaluates typed through casts (reading-presentation.spec.ts
 * precedent).
 */

const SEARCH_TRIGGER = '[data-search-slot] button.search-dialog__trigger';
const DIALOG = 'dialog[aria-modal="true"]';
const OPEN_DIALOG = 'dialog[aria-modal="true"][open]';
const INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const STATUS = 'dialog[aria-modal="true"] [data-search-status]';
const CLOSE = 'dialog[aria-modal="true"] [data-search-close]';
const LOADING = 'dialog[aria-modal="true"] [data-search-loading]';
const RESULT_LINK = 'dialog[aria-modal="true"] a[data-search-result]';
const GROUP = 'dialog[aria-modal="true"] [data-search-group]';
const THEME_TRIGGER = '.theme-toggle__trigger';

const REPO_ROOT = process.cwd();
const EVIDENCE_SEARCH = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/search');
const PHASE_ROOT = join(
  REPO_ROOT,
  `.tmp/ORI-VIS-003/cycle-1/${process.env.ORI_VIS_PHASE ?? 'green'}`,
);

function capture(project: string, name: string, observed: Record<string, unknown>): void {
  const path = join(PHASE_ROOT, 'captures', `${project}-${name}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({ project, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

function screenshotPath(project: string, name: string): string {
  const path = join(PHASE_ROOT, 'screenshots', `${project}-${name}.png`);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

/** The contract evidence artifacts land under tests/.../evidence/search/. */
function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_SEARCH, { recursive: true });
  return join(EVIDENCE_SEARCH, name);
}

/** Read-merge-write for the shared focus-and-status.json record. */
function mergeEvidence(name: string, fields: Record<string, unknown>): void {
  const path = evidencePath(name);
  let record: Record<string, unknown> = {};
  try {
    record = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    record = {};
  }
  writeFileSync(path, JSON.stringify({ ...record, ...fields }, null, 2));
}

/** Run/source/lockfile/dist/index/test/policy identity for evidence binding. */
function runIdentity(): Record<string, unknown> {
  const sha256 = (path: string): string =>
    createHash('sha256').update(readFileSync(path, 'utf8')).digest('hex');
  const distCssDir = join(REPO_ROOT, 'apps/docs/dist/_astro');
  const distCss = readdirSync(distCssDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({ name, sha256: sha256(join(distCssDir, name)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    capturedAt: new Date().toISOString(),
    gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT }).toString().trim(),
    sourceHashes: {
      searchDialogIsland: sha256(
        join(REPO_ROOT, 'apps/docs/src/components/islands/SearchDialog.astro'),
      ),
      header: sha256(join(REPO_ROOT, 'apps/docs/src/components/Header.astro')),
      searchDialogScript: sha256(join(REPO_ROOT, 'apps/docs/src/scripts/search-dialog.ts')),
      lockfile: sha256(join(REPO_ROOT, 'pnpm-lock.yaml')),
      pagefindEntry: sha256(join(REPO_ROOT, 'apps/docs/dist/pagefind/pagefind-entry.json')),
      spec: sha256(fileURLToPath(import.meta.url)),
      policy: sha256(join(REPO_ROOT, '.spec/e2e-policy/surface.json')),
    },
    distCss,
  };
}

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

function platformShortcut(): string {
  return process.platform === 'darwin' ? 'Meta+K' : 'Control+K';
}

/** The no-JavaScript surface: the search control stays hidden (islands never
 * upgrade); locators only — page.evaluate hangs with JS disabled. */
async function expectNoJsSurface(page: Page): Promise<void> {
  await navigateLocalhost(page, '/docs/introduction');
  await expect(page.locator(SEARCH_TRIGGER)).toBeHidden();
  await expect(page.locator('[data-search-slot]')).toBeHidden();
}

async function openViaShortcut(page: Page, shortcut: string): Promise<void> {
  await page.keyboard.press(shortcut);
  await page.locator(OPEN_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
}

async function openViaTrigger(page: Page): Promise<void> {
  await page.locator(SEARCH_TRIGGER).click();
  await page.locator(OPEN_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
}

async function awaitPagefindReady(page: Page): Promise<void> {
  await page.waitForFunction(`(window.__rnrSearchReady === true)`, undefined, {
    timeout: 20_000,
  });
}

/** Type a query through the real input and wait for the island to settle it. */
async function search(page: Page, query: string): Promise<void> {
  await page.locator(INPUT).fill(query);
  await expect
    .poll(async () => page.evaluate(`(window.__rnrSearchSettledQueries ?? [])`))
    .toContain(query);
}

async function announcedCount(page: Page): Promise<number> {
  const text = (await page.locator(STATUS).innerText()) ?? '';
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : -1;
}

/** The resolved theme class — the flip's one observable output. */
async function resolvedTheme(page: Page): Promise<'light' | 'dark' | null> {
  return (await page.evaluate(`(() => {
    const root = document.documentElement;
    if (root.classList.contains('light')) return 'light';
    if (root.classList.contains('dark')) return 'dark';
    return null;
  })()`)) as 'light' | 'dark' | null;
}

interface FocusRing {
  outlineWidth: string;
  outlineStyle: string;
  outlineOffset: string;
  outlineColor: string;
}

function expectRing(ring: FocusRing | null, what: string): void {
  expect(ring, `${what} exposes computed outline properties`).not.toBeNull();
  if (!ring) return;
  expect.soft(ring.outlineWidth, `${what} ring is 2px wide`).toBe('2px');
  expect.soft(ring.outlineStyle, `${what} ring is solid`).toBe('solid');
  expect.soft(ring.outlineOffset, `${what} ring offset is 2px`).toBe('2px');
}

/** Computed focus ring of the real search input. */
async function inputRing(page: Page): Promise<FocusRing | null> {
  return (await page.evaluate(`(() => {
    const input = document.querySelector('dialog[aria-modal="true"] input[type="search"]');
    if (!input) return null;
    const cs = getComputedStyle(input);
    return {
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineOffset: cs.outlineOffset,
      outlineColor: cs.outlineColor,
    };
  })()`)) as FocusRing | null;
}

/** Computed focus ring of the invoking header control. */
async function triggerRing(page: Page): Promise<FocusRing | null> {
  return (await page.evaluate(`(() => {
    const trigger = document.querySelector('[data-search-slot] button.search-dialog__trigger');
    if (!trigger) return null;
    const cs = getComputedStyle(trigger);
    return {
      outlineWidth: cs.outlineWidth,
      outlineStyle: cs.outlineStyle,
      outlineOffset: cs.outlineOffset,
      outlineColor: cs.outlineColor,
    };
  })()`)) as FocusRing | null;
}

async function activeHref(page: Page): Promise<string | null> {
  return (await page.evaluate(`(() => {
    const active = document.querySelector(
      'dialog[aria-modal="true"] a[data-search-result][data-active="true"]',
    );
    return active ? active.getAttribute('href') : null;
  })()`)) as string | null;
}

interface ActiveStyle {
  activeBackground: string;
  activeOutlineWidth: string;
  activeOutlineStyle: string;
  activeOutlineColor: string;
  inactiveBackground: string | null;
  inactiveOutlineStyle: string | null;
}

async function activeStyle(page: Page): Promise<ActiveStyle | null> {
  return (await page.evaluate(`(() => {
    const active = document.querySelector(
      'dialog[aria-modal="true"] a[data-search-result][data-active="true"]',
    );
    const inactive = document.querySelector(
      'dialog[aria-modal="true"] a[data-search-result]:not([data-active="true"])',
    );
    if (!active) return null;
    const a = getComputedStyle(active);
    const i = inactive ? getComputedStyle(inactive) : null;
    return {
      activeBackground: a.backgroundColor,
      activeOutlineWidth: a.outlineWidth,
      activeOutlineStyle: a.outlineStyle,
      activeOutlineColor: a.outlineColor,
      inactiveBackground: i ? i.backgroundColor : null,
      inactiveOutlineStyle: i ? i.outlineStyle : null,
    };
  })()`)) as ActiveStyle | null;
}

function expectActiveIndicator(style: ActiveStyle | null, theme: string): void {
  expect(style, `an active result exists in the ${theme} theme`).not.toBeNull();
  if (!style) return;
  expect.soft(style.activeOutlineStyle, `${theme} active result has a solid outline`).toBe('solid');
  expect.soft(style.activeOutlineWidth, `${theme} active result outline is 2px`).toBe('2px');
  if (style.inactiveBackground !== null) {
    expect
      .soft(
        style.activeBackground !== style.inactiveBackground,
        `${theme} active background differs`,
      )
      .toBe(true);
  }
  if (style.inactiveOutlineStyle !== null) {
    expect
      .soft(style.inactiveOutlineStyle, `${theme} inactive results carry no outline`)
      .toBe('none');
  }
}

interface ResultTypography {
  titleWeight: string;
  titleSize: string;
  excerptWeight: string;
  excerptSize: string;
  labelTransform: string;
  labelSize: string;
  labelMargin: string;
  kindSize: string | null;
}

async function resultTypography(page: Page): Promise<ResultTypography | null> {
  return (await page.evaluate(`(() => {
    const title = document.querySelector(
      'dialog[aria-modal="true"] .search-dialog__result-title',
    );
    const excerpt = document.querySelector(
      'dialog[aria-modal="true"] .search-dialog__result-excerpt',
    );
    const kind = document.querySelector('dialog[aria-modal="true"] .search-dialog__result-kind');
    const label = document.querySelector('dialog[aria-modal="true"] .search-dialog__group-label');
    if (!title || !excerpt || !label) return null;
    const t = getComputedStyle(title);
    const e = getComputedStyle(excerpt);
    const k = kind ? getComputedStyle(kind) : null;
    const l = getComputedStyle(label);
    return {
      titleWeight: t.fontWeight,
      titleSize: t.fontSize,
      excerptWeight: e.fontWeight,
      excerptSize: e.fontSize,
      labelTransform: l.textTransform,
      labelSize: l.fontSize,
      labelMargin: l.margin,
      kindSize: k ? k.fontSize : null,
    };
  })()`)) as ResultTypography | null;
}

interface ControlGeometry {
  viewportWidth: number;
  viewportHeight: number;
  inputFullyInside: boolean | null;
  closeFullyInside: boolean | null;
  panelFullyInside: boolean | null;
  input: { top: number; right: number; bottom: number; left: number } | null;
  close: { top: number; right: number; bottom: number; left: number } | null;
  panel: { top: number; right: number; bottom: number; left: number } | null;
}

async function controlGeometry(page: Page): Promise<ControlGeometry | null> {
  return (await page.evaluate(`(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
    };
    const inside = (r) => r !== null && r.top >= 0 && r.left >= 0 && r.right <= vw + 1 && r.bottom <= vh + 1;
    const input = rect('dialog[aria-modal="true"] input[type="search"]');
    const close = rect('dialog[aria-modal="true"] [data-search-close]');
    const panel = rect('dialog[aria-modal="true"]');
    return {
      viewportWidth: vw,
      viewportHeight: vh,
      inputFullyInside: input === null ? null : inside(input),
      closeFullyInside: close === null ? null : inside(close),
      panelFullyInside: panel === null ? null : inside(panel),
      input, close, panel,
    };
  })()`)) as ControlGeometry | null;
}

interface ScrollState {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  scrollable: boolean;
}

async function scrollState(page: Page): Promise<ScrollState | null> {
  return (await page.evaluate(`(() => {
    const scroll = document.querySelector('.search-dialog__scroll');
    if (!scroll) return null;
    return {
      scrollTop: scroll.scrollTop,
      scrollHeight: scroll.scrollHeight,
      clientHeight: scroll.clientHeight,
      scrollable: scroll.scrollHeight > scroll.clientHeight,
    };
  })()`)) as ScrollState | null;
}

/** Entrance-animation audit of the open dialog and every descendant. */
async function animationAudit(page: Page): Promise<{ animatedCount: number; animated: unknown[] }> {
  return (await page.evaluate(`(() => {
    const dialog = document.querySelector('dialog[aria-modal="true"]');
    if (!dialog) return { animatedCount: -1, animated: [] };
    const animated = [];
    for (const el of [dialog, ...dialog.querySelectorAll('*')]) {
      const cs = getComputedStyle(el);
      if (cs.animationName !== 'none' || parseFloat(cs.transitionDuration) > 0) {
        animated.push({
          what: (el.className && el.className.toString().slice(0, 40)) || el.tagName,
          animationName: cs.animationName,
          transitionDuration: cs.transitionDuration,
        });
      }
    }
    return { animatedCount: animated.length, animated: animated.slice(0, 5) };
  })()`)) as { animatedCount: number; animated: unknown[] };
}

// ---------------------------------------------------------------------------
// AC-1 — visible input focus; genuine loading keeps controls reachable
// ---------------------------------------------------------------------------
// The AC callbacks ARE the observable surface: one end-to-end story per AC.
// fallow-ignore-next-line complexity
test('ORI-VIS-003-AC-1', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page);
    return;
  }
  const project = testInfo.project.name;
  await page.emulateMedia({ colorScheme: 'light' });
  await navigateLocalhost(page, '/docs/introduction');
  await waitForAstroPageLoad(page);

  // Open through the platform shortcut and observe the REAL first
  // initialization: the sample below is taken immediately, no delay imposed.
  await openViaShortcut(page, platformShortcut());
  await expect(page.locator(DIALOG)).toHaveAttribute('aria-modal', 'true');
  await expect(page.locator(INPUT)).toBeFocused();

  const ring = await inputRing(page);
  expectRing(ring, 'the focused search input');

  // Observe the genuine first-initialization window by SAMPLING the real
  // state as fast as the transport allows — nothing delays the product; the
  // loop only watches what the island actually does until its ready flag.
  let loadingSeen = false;
  let controlsVisibleWhileLoading: boolean | null = null;
  const deadline = Date.now() + 10_000;
  for (;;) {
    const sample = (await page.evaluate(`(() => {
      const loading = document.querySelector('dialog [data-search-loading]');
      const loadingVisible =
        loading !== null && !loading.hidden && getComputedStyle(loading).display !== 'none';
      const input = document.querySelector('dialog input[type="search"]');
      const close = document.querySelector('dialog [data-search-close]');
      return {
        ready: window.__rnrSearchReady === true,
        loadingVisible,
        controlsVisible:
          input !== null && close !== null &&
          getComputedStyle(input).display !== 'none' && getComputedStyle(close).display !== 'none',
      };
    })()`)) as {
      ready: boolean;
      loadingVisible: boolean;
      controlsVisible: boolean;
    };
    if (sample.loadingVisible) {
      loadingSeen = true;
      controlsVisibleWhileLoading = sample.controlsVisible;
    }
    if (sample.ready || Date.now() > deadline) break;
  }
  if (loadingSeen) {
    expect
      .soft(controlsVisibleWhileLoading, 'input and close stay visible during genuine loading')
      .toBe(true);
  }
  await awaitPagefindReady(page);
  await expect(page.locator(LOADING), 'genuine loading ends with initialization').toBeHidden();
  const statusAfterReady = (await page.locator(STATUS).innerText()) ?? '';

  // The close action is a real, reachable control: fully inside the viewport
  // and its activation closes the native dialog (method="dialog" path).
  const geometry = await controlGeometry(page);
  expect(geometry?.closeFullyInside, 'the close action is fully inside the viewport').toBe(true);
  expect(geometry?.inputFullyInside, 'the search input is fully inside the viewport').toBe(true);
  await page.locator(CLOSE).click();
  await expect(page.locator(OPEN_DIALOG)).toHaveCount(0);

  await page.screenshot({ path: screenshotPath(project, 'ac1-closed') });
  capture(project, 'ac1', {
    inputRing: ring,
    loadingSeen,
    controlsVisibleWhileLoading,
    statusAfterReady,
    geometry,
  });
  if (project === 'chromium-desktop') {
    mergeEvidence('focus-and-status.json', {
      ac1: {
        inputRing: ring,
        loadingSeen,
        controlsVisibleWhileLoading,
        statusAfterReady,
        controlGeometry: geometry,
      },
      runIdentity: runIdentity(),
    });
  }
});

// ---------------------------------------------------------------------------
// AC-2 — real grouped results, titles, snippets, announced count
// ---------------------------------------------------------------------------
// The AC callbacks ARE the observable surface: one end-to-end story per AC.
// fallow-ignore-next-line complexity
test('ORI-VIS-003-AC-2', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page);
    return;
  }
  const project = testInfo.project.name;
  await page.emulateMedia({ colorScheme: 'light' });
  await navigateLocalhost(page, '/docs/introduction');
  await waitForAstroPageLoad(page);
  await openViaShortcut(page, platformShortcut());
  await awaitPagefindReady(page);

  // Case 1: streamdown — real groups, titles, snippets, announced count.
  await search(page, 'streamdown');
  const hrefs = (await page
    .locator(RESULT_LINK)
    .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))) as string[];
  expect(hrefs.length, 'streamdown returns real results').toBeGreaterThan(0);
  expect(hrefs, 'the streamdown destination is among the results').toContain(
    '/components/streamdown/',
  );
  expect(await announcedCount(page), 'aria-live count matches actual results').toBe(hrefs.length);

  const groupLabels = (await page
    .locator(`${GROUP} .search-dialog__group-label`)
    .evaluateAll((labels) => labels.map((label) => (label.textContent ?? '').trim()))) as string[];
  expect(groupLabels.length, 'results render under real group labels').toBeGreaterThan(0);
  expect.soft(groupLabels, 'group labels are real category names').toContain('Components');

  const titles = (await page
    .locator(`${RESULT_LINK} .search-dialog__result-title`)
    .evaluateAll((nodes) => nodes.map((node) => (node.textContent ?? '').trim()))) as string[];
  expect(titles.length).toBe(hrefs.length);
  for (const title of titles) {
    expect.soft(title.length, 'every result carries a real title').toBeGreaterThan(0);
  }
  const excerpts = (await page
    .locator(`${RESULT_LINK} .search-dialog__result-excerpt`)
    .evaluateAll((nodes) => nodes.map((node) => (node.textContent ?? '').trim()))) as string[];
  expect(
    excerpts.filter((text) => text.length > 0).length,
    'real Pagefind snippets render as text',
  ).toBeGreaterThan(0);

  // Readable presentation: titles, snippets and group labels are
  // typographically distinct (the presentation this task owns).
  const typography = await resultTypography(page);
  expect(typography, 'result typography is observable').not.toBeNull();
  if (typography) {
    expect.soft(typography.titleWeight, 'result titles are semibold').toBe('600');
    expect.soft(typography.excerptWeight, 'snippets are regular weight').toBe('400');
    expect.soft(parseFloat(typography.excerptSize) < parseFloat(typography.titleSize)).toBe(true);
    expect.soft(typography.labelTransform, 'group labels are uppercase').toBe('uppercase');
    expect.soft(parseFloat(typography.labelSize) < parseFloat(typography.titleSize)).toBe(true);
    expect.soft(typography.labelMargin, 'group label margins are authored').toBe('0px');
  }

  await page.locator(DIALOG).screenshot({ path: screenshotPath(project, 'ac2-results') });
  capture(project, 'ac2-streamdown', {
    hrefs,
    groupLabels,
    titles,
    excerptCount: excerpts.filter((text) => text.length > 0).length,
    announcedCount: hrefs.length,
    typography,
  });

  // Case 2: renderMarkdown and dev client answer from the boundary page.
  for (const query of ['renderMarkdown', 'dev client']) {
    await search(page, query);
    const queryHrefs = (await page
      .locator(RESULT_LINK)
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''))) as string[];
    expect(queryHrefs, `${query} answers with the boundary page`).toContain(
      '/docs/owns-vs-does-not-own/',
    );
    expect(
      queryHrefs.filter((href) => href.startsWith('/components/')).length,
      `${query} answers with an applicable item result`,
    ).toBeGreaterThan(0);
  }

  // Follow the canonical boundary result (a real anchor) and read the answer.
  await search(page, 'renderMarkdown');
  await page.locator(`${RESULT_LINK}[href="/docs/owns-vs-does-not-own/"]`).first().click();
  await page.waitForURL('**/docs/owns-vs-does-not-own/');
  await waitForAstroPageLoad(page);
  const boundaryText = (await page.locator('main').textContent()) ?? '';
  expect
    .soft(boundaryText.includes('renderMarkdown'), 'boundary explains renderMarkdown')
    .toBe(true);
  expect.soft(boundaryText.includes('dev client'), 'boundary explains the dev client').toBe(true);
  capture(project, 'ac2-boundary', {
    boundaryExplainsRenderMarkdown: boundaryText.includes('renderMarkdown'),
    boundaryExplainsDevClient: boundaryText.includes('dev client'),
  });
});

// ---------------------------------------------------------------------------
// AC-3 — arrow selection visibly distinct in both themes; Escape restores
// a ringed invoking control
// ---------------------------------------------------------------------------
// The AC callbacks ARE the observable surface: one end-to-end story per AC.
// fallow-ignore-next-line complexity
test('ORI-VIS-003-AC-3', async ({ page }, testInfo) => {
  test.setTimeout(150_000);
  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page);
    return;
  }
  const project = testInfo.project.name;
  await page.emulateMedia({ colorScheme: 'light' });
  await navigateLocalhost(page, '/docs/introduction');
  await waitForAstroPageLoad(page);

  // Light column: open through the header trigger (the invoking control).
  await openViaTrigger(page);
  await awaitPagefindReady(page);
  await search(page, 'streamdown');
  const before = await activeHref(page);
  expect(before, 'a result is active before any keypress').toBeTruthy();
  let lightStyle = await activeStyle(page);
  expectActiveIndicator(lightStyle, 'light');

  await page.keyboard.press('ArrowDown');
  const afterDown = await activeHref(page);
  expect(afterDown, 'ArrowDown moves the selection').not.toBe(before);
  lightStyle = await activeStyle(page);
  expectActiveIndicator(lightStyle, 'light');
  await page.keyboard.press('ArrowUp');
  const afterUp = await activeHref(page);
  expect(afterUp, 'ArrowUp moves the selection back').toBe(before);

  if (project === 'chromium-desktop') {
    await page.locator(DIALOG).screenshot({ path: evidencePath('results-light.png') });
  }
  await page.locator(DIALOG).screenshot({ path: screenshotPath(project, 'ac3-light') });

  // Escape restores focus — with a ring — to the invoking header control.
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();
  const lightRestoreRing = await triggerRing(page);
  expectRing(lightRestoreRing, 'the restored invoking control');

  // Dark column through the REAL header theme control, then repeat.
  await page.locator(THEME_TRIGGER).click();
  expect(await resolvedTheme(page), 'the header control flipped to dark').toBe('dark');
  await openViaTrigger(page);
  await search(page, 'streamdown');
  await page.keyboard.press('ArrowDown');
  const darkStyle = await activeStyle(page);
  expectActiveIndicator(darkStyle, 'dark');
  if (project === 'chromium-desktop') {
    await page.locator(DIALOG).screenshot({ path: evidencePath('results-dark.png') });
  }
  await page.locator(DIALOG).screenshot({ path: screenshotPath(project, 'ac3-dark') });
  await page.keyboard.press('Escape');
  await expect(page.locator(OPEN_DIALOG)).toHaveCount(0);
  await expect(page.locator(SEARCH_TRIGGER)).toBeFocused();
  const darkRestoreRing = await triggerRing(page);
  expectRing(darkRestoreRing, 'the restored invoking control (dark)');

  capture(project, 'ac3', {
    before,
    afterDown,
    lightStyle,
    darkStyle,
    lightRestoreRing,
    darkRestoreRing,
  });
  if (project === 'chromium-desktop') {
    mergeEvidence('focus-and-status.json', {
      ac3: {
        selectionBeforeArrows: before,
        selectionAfterArrowDown: afterDown,
        lightActiveStyle: lightStyle,
        darkActiveStyle: darkStyle,
        restoredInvokerRing: lightRestoreRing,
      },
    });
  }
});

// ---------------------------------------------------------------------------
// AC-4 — mobile scroll keeps controls reachable; reduced motion has 0
// entrance animations
// ---------------------------------------------------------------------------
// The AC callbacks ARE the observable surface: one end-to-end story per AC.
// fallow-ignore-next-line complexity
test('ORI-VIS-003-AC-4', async ({ page, browser }, testInfo) => {
  test.setTimeout(150_000);
  if (isNoJs(testInfo)) {
    await expectNoJsSurface(page);
    return;
  }
  const project = testInfo.project.name;
  await page.emulateMedia({ colorScheme: 'light' });
  await navigateLocalhost(page, '/docs/introduction');
  await waitForAstroPageLoad(page);
  await openViaTrigger(page);
  await awaitPagefindReady(page);

  // streamdown first: its result stays readable inside the scrolling region.
  await search(page, 'streamdown');
  const streamdownResult = page.locator(`${RESULT_LINK}[href="/components/streamdown/"]`).first();
  await expect(streamdownResult, 'the streamdown result is readable').toBeVisible();

  // A broad REAL query guarantees a genuinely overflowing list to scroll.
  await search(page, 'install');
  const beforeScroll = await scrollState(page);
  const scrollBox = await page.locator('.search-dialog__scroll').boundingBox();
  expect(scrollBox, 'the results region exists').not.toBeNull();
  if (scrollBox) {
    await page.mouse.move(scrollBox.x + scrollBox.width / 2, scrollBox.y + scrollBox.height / 2);
    await page.mouse.wheel(0, 1200);
  }
  const afterScroll = await scrollState(page);
  expect(afterScroll?.scrollTop ?? 0, 'the real results region scrolled').toBeGreaterThan(0);

  // Controls stay fully inside the viewport after scrolling.
  const geometry = await controlGeometry(page);
  expect(geometry?.inputFullyInside, 'the search input is 100% inside the viewport').toBe(true);
  expect(geometry?.closeFullyInside, 'the close action is 100% inside the viewport').toBe(true);
  expect(geometry?.panelFullyInside, 'the dialog stays inside the viewport').toBe(true);

  if (project === 'chromium-mobile') {
    await search(page, 'streamdown');
    await page.locator(DIALOG).screenshot({ path: evidencePath('results-mobile.png') });
  }
  await page.locator(DIALOG).screenshot({ path: screenshotPath(project, 'ac4-mobile') });
  capture(project, 'ac4-scroll', { beforeScroll, afterScroll, geometry });

  // Reduced motion in a fresh real browser context: 0 entrance animations.
  const reducedContext = await browser.newContext({
    ...testInfo.project.use,
    reducedMotion: 'reduce',
    colorScheme: 'light',
  });
  const reducedPage = await reducedContext.newPage();
  await navigateLocalhost(reducedPage, '/docs/introduction');
  await waitForAstroPageLoad(reducedPage);
  await reducedPage.locator(SEARCH_TRIGGER).click();
  await reducedPage.locator(OPEN_DIALOG).waitFor({ state: 'visible', timeout: 5_000 });
  const audit = await animationAudit(reducedPage);
  expect.soft(audit.animatedCount, 'no entrance animations under reduced motion').toBe(0);
  await reducedPage.locator(INPUT).fill('streamdown');
  await reducedContext.close();
  capture(project, 'ac4-reduced-motion', audit);
});
