import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FLOW-SHELL-01 — the persisted, flash-free theme toggle over the BUILT dist
 * (the runner serves `astro preview` — never `astro dev`).
 *
 * The landed SHELL-003 contract (DocsLayout pre-paint script + rnr-theme-toggle
 * island) is scheme-respecting: theme RESOLUTION is stored `rnr-theme` >
 * `prefers-color-scheme: light` > dark; the island only MUTATES the two things
 * the pre-paint script reads — the `html.light` class and localStorage. There
 * is exactly one theme mechanism (the class flip): no URL state, no inline
 * styles, no second stylesheet.
 *
 * Theme observables (never URL state, never a success class): the root theme
 * class, the computed body background-color (dark `oklch(0.145 0 0)`, light
 * `oklch(1 0 0)`), and localStorage `rnr-theme`. "Dark theme state" is the
 * absence of the `light` class — the pre-paint script never writes a `dark`
 * class; dark is the served default.
 *
 * Every case creates a brand-new context (colorScheme set at creation, zero
 * storage) and navigates cold. First-frame assertions sample the root class at
 * domContentLoaded through an init script installed before any page script —
 * never a post-load read, which a late island could launder.
 *
 * page.evaluate calls use string expressions: the repo tsconfig carries no DOM
 * lib (same precedent as the sprint-01 ledger spec). The root theme class is
 * read that way too — never locator('html'), a generic-root success oracle.
 *
 * On the green path the spec writes its DECLARED flow artifact
 * (.tmp/sprint-02-shell-hero/e2e-evidence/FLOW-SHELL-01-theme-toggle-persisted-
 * flash-free.json) with the real observed values (home-hero convention).
 */

// Evidence JSON per flow, under the sprint's e2e-evidence directory (the
// home-hero convention: written on the green path with real observed values,
// so the flow runner sees a fresh DECLARED artifact after every run).
const EVIDENCE_DIR = join(process.cwd(), '.tmp/sprint-02-shell-hero/e2e-evidence');

function writeEvidence(flow: string, observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, `${flow}.json`),
    JSON.stringify({ flow, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

// Dark = no `light` class on the root element; light = `light` present.
function themeStateOf(className: unknown): 'light' | 'dark' {
  return typeof className === 'string' && /(?:^|\s)light(?:\s|$)/.test(className)
    ? 'light'
    : 'dark';
}

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

// Installed before ANY page script: records the root class at domContentLoaded,
// i.e. after the parser has run the is:inline pre-paint script but before first
// paint. Reset per document, so a reload re-records its own sample.
const THEME_DCL_RECORDER = `(() => {
  var sample = { atDomContentLoaded: null };
  window.__rnrThemeSample = sample;
  document.addEventListener('DOMContentLoaded', function () {
    sample.atDomContentLoaded = document.documentElement.className;
  });
})();`;

// The root theme class comes back through a string-expression evaluate — never
// locator('html'), a generic-root success oracle the governed surface lint bans.
const READ_ROOT_CLASS = 'document.documentElement.className';
const READ_DCL_SAMPLE = 'window.__rnrThemeSample.atDomContentLoaded';
const READ_BODY_BG = 'getComputedStyle(document.body).backgroundColor';
const READ_STORAGE =
  'JSON.stringify({ theme: localStorage.getItem("rnr-theme"), keys: Object.keys(localStorage).sort() })';
// Zero-JS probe: the toggle element ships in the served HTML but must stay
// display:none (`:not(:defined)`) with JS disabled — no dead control on screen.
const READ_ZERO_JS_TOGGLE = `JSON.stringify((function () {
  var el = document.querySelector('rnr-theme-toggle');
  return {
    attached: !!el,
    offsetParent: el ? el.offsetParent : null,
    offsetWidth: el ? el.offsetWidth : -1,
    offsetHeight: el ? el.offsetHeight : -1,
    htmlClass: document.documentElement.className,
    bodyBackground: getComputedStyle(document.body).backgroundColor
  };
})())`;

const DARK_BG = 'oklch(0.145 0 0)';
const LIGHT_BG = 'oklch(1 0 0)';
const TOGGLE = 'header [data-theme-slot]';

test('FLOW-SHELL-01-theme-toggle-persisted-flash-free', async ({ browser }, testInfo) => {
  // The toggle flow drives a real island; the runner's zero-JS project context
  // cannot run it. The zero-JS contract below runs as its own explicit
  // javaScriptEnabled:false context instead of a duplicated no-op project run.
  test.skip(
    projectHasNoJs(testInfo),
    'the toggle is a JS island; the zero-JS contract is asserted in its own dedicated case below',
  );

  // --- CASE 1 — each flip: root class + computed background + storage, no URL state.
  const flipContext = await browser.newContext({ colorScheme: 'dark' });
  const flipPage = await flipContext.newPage();
  const firstVisit = await navigateLocalhost(flipPage, '/');
  expect(firstVisit?.status(), '/ must answer 200 from the built preview').toBe(200);

  // Cold first visit with a dark scheme preference: dark state, zero storage.
  const firstVisitRootClass = await flipPage.evaluate(READ_ROOT_CLASS);
  expect(
    themeStateOf(firstVisitRootClass),
    'a dark-scheme first visit must resolve dark (no light class)',
  ).toBe('dark');
  const firstVisitBackground = await flipPage.evaluate(READ_BODY_BG);
  expect(firstVisitBackground).toBe(DARK_BG);
  const firstVisitStoredTheme = JSON.parse(await flipPage.evaluate(READ_STORAGE)).theme;
  expect(
    firstVisitStoredTheme,
    'a cold first visit must have no pre-existing rnr-theme',
  ).toBeNull();

  const toggle = flipPage.locator(TOGGLE).getByRole('button');
  await expect(
    toggle,
    'SHELL-003 must mount the ThemeToggle island trigger inside the header theme slot',
  ).toBeVisible();

  // Other islands own their own keys (e.g. TabGroup's `rnr-engine` on this
  // page); the toggle's write surface is proven by the key-set DELTA across
  // its clicks: nothing new beyond `rnr-theme` may appear.
  const keysBeforeClicks: string[] = JSON.parse(await flipPage.evaluate(READ_STORAGE)).keys;

  // Flip 1: dark -> light. Class, computed canvas, and storage must all move.
  await toggle.click();
  const afterFlipOne = JSON.parse(await flipPage.evaluate(READ_STORAGE));
  const flipOneRootClass = await flipPage.evaluate(READ_ROOT_CLASS);
  expect(themeStateOf(flipOneRootClass)).toBe('light');
  const flipOneBackground = await flipPage.evaluate(READ_BODY_BG);
  expect(
    flipOneBackground,
    'the flipped canvas must re-resolve to the light --background token',
  ).toBe(LIGHT_BG);
  expect(afterFlipOne.theme).toBe('light');
  expect(
    afterFlipOne.keys.filter((key: string) => !keysBeforeClicks.includes(key)),
    'the toggle may write no storage key other than rnr-theme',
  ).toEqual(['rnr-theme']);

  // Flip 2: light -> dark restored.
  await toggle.click();
  const afterFlipTwo = JSON.parse(await flipPage.evaluate(READ_STORAGE));
  const flipTwoRootClass = await flipPage.evaluate(READ_ROOT_CLASS);
  expect(themeStateOf(flipTwoRootClass)).toBe('dark');
  const flipTwoBackground = await flipPage.evaluate(READ_BODY_BG);
  expect(flipTwoBackground).toBe(DARK_BG);
  expect(afterFlipTwo.theme).toBe('dark');
  expect(
    afterFlipTwo.keys.filter((key: string) => !keysBeforeClicks.includes(key)),
    'the toggle may write no storage key other than rnr-theme',
  ).toEqual(['rnr-theme']);

  // No theme state in the URL — the class flip + storage is the whole mechanism.
  expect(flipPage.url()).toBe(`${PREVIEW_URL}/`);
  await testInfo.attach('flow-shell-01-dark-restored', {
    body: await flipPage.screenshot(),
    contentType: 'image/png',
  });
  await flipContext.close();

  // --- CASE 2 — cold reload after choosing light: light already set at domContentLoaded.
  const reloadContext = await browser.newContext({ colorScheme: 'dark' });
  await reloadContext.addInitScript(THEME_DCL_RECORDER);
  const reloadPage = await reloadContext.newPage();
  await navigateLocalhost(reloadPage, '/');
  await reloadPage.locator(TOGGLE).getByRole('button').click();
  expect(await reloadPage.evaluate('localStorage.getItem("rnr-theme")')).toBe('light');

  // Cold reload: a fresh navigation in the same context (no bfcache). The init
  // script re-runs and samples the root class at the reload's domContentLoaded.
  await reloadPage.reload();
  const dclClass: unknown = await reloadPage.evaluate(READ_DCL_SAMPLE);
  expect(
    themeStateOf(dclClass),
    `the persisted light choice must already hold at domContentLoaded (got root class ${String(
      dclClass,
    )}) — a dark sample there is the wrong-theme flash signature`,
  ).toBe('light');
  const reloadBackground = await reloadPage.evaluate(READ_BODY_BG);
  expect(reloadBackground, 'after the reload the canvas must resolve the light token').toBe(
    LIGHT_BG,
  );
  const reloadedStoredTheme = await reloadPage.evaluate('localStorage.getItem("rnr-theme")');
  expect(reloadedStoredTheme, 'the reload must not reset the stored choice').toBe('light');
  await testInfo.attach('flow-shell-01-light-persisted-reload', {
    body: await reloadPage.screenshot(),
    contentType: 'image/png',
  });
  await reloadContext.close();

  // --- CASE 3 — sticky header at scrollY 1000, and the zero-JS contract.
  const stickyContext = await browser.newContext({ colorScheme: 'dark' });
  const stickyPage = await stickyContext.newPage();
  const messageResponse = await navigateLocalhost(stickyPage, '/components/message');
  expect(messageResponse?.status(), '/components/message must answer 200').toBe(200);
  await stickyPage.evaluate('window.scrollTo(0, 1000)');
  await stickyPage.waitForFunction('window.scrollY === 1000');
  const headerBox = await stickyPage.locator('header.site-header').boundingBox();
  expect(headerBox, 'the sticky site header must render').toBeTruthy();
  expect(
    Math.abs(headerBox?.y ?? -1),
    'the header must still be pinned at viewport top at scrollY=1000',
  ).toBeLessThan(1);
  await stickyContext.close();

  const noJsContext = await browser.newContext({
    colorScheme: 'dark',
    javaScriptEnabled: false,
  });
  const noJsPage = await noJsContext.newPage();
  const noJsResponse = await navigateLocalhost(noJsPage, '/components/message');
  expect(noJsResponse?.status(), 'the zero-JS page must still answer 200').toBe(200);
  const zeroJs = JSON.parse(await noJsPage.evaluate(READ_ZERO_JS_TOGGLE)) as {
    attached: boolean;
    offsetParent: unknown;
    offsetWidth: number;
    offsetHeight: number;
    htmlClass: unknown;
    bodyBackground: string;
  };
  expect(zeroJs.attached, 'the toggle element must ship in the served HTML').toBe(true);
  expect(zeroJs.offsetParent, 'zero-JS: the un-upgraded toggle must be hidden').toBeNull();
  expect(zeroJs.offsetWidth, 'zero-JS: the toggle must occupy zero width').toBe(0);
  expect(zeroJs.offsetHeight, 'zero-JS: the toggle must occupy zero height').toBe(0);
  expect(
    await noJsPage.locator('rnr-theme-toggle').boundingBox(),
    'zero-JS: the toggle must have no visible box',
  ).toBeNull();
  expect(
    themeStateOf(zeroJs.htmlClass),
    'zero-JS: no script runs, so the served dark-first default renders — the page stays readable, with no fake control',
  ).toBe('dark');
  expect(zeroJs.bodyBackground, 'zero-JS: the canvas must resolve the dark token').toBe(DARK_BG);
  await testInfo.attach('flow-shell-01-zero-js', {
    body: await noJsPage.screenshot(),
    contentType: 'image/png',
  });
  await noJsContext.close();

  writeEvidence('FLOW-SHELL-01-theme-toggle-persisted-flash-free', {
    previewOrigin: PREVIEW_URL,
    firstVisit: {
      rootClass: firstVisitRootClass,
      bodyBackground: firstVisitBackground,
      storedTheme: firstVisitStoredTheme,
      storageKeysBeforeClicks: keysBeforeClicks,
    },
    flipOne: {
      rootClass: flipOneRootClass,
      bodyBackground: flipOneBackground,
      storedTheme: afterFlipOne.theme,
      newStorageKeys: afterFlipOne.keys.filter((key: string) => !keysBeforeClicks.includes(key)),
    },
    flipTwo: {
      rootClass: flipTwoRootClass,
      bodyBackground: flipTwoBackground,
      storedTheme: afterFlipTwo.theme,
      newStorageKeys: afterFlipTwo.keys.filter((key: string) => !keysBeforeClicks.includes(key)),
    },
    persistedReload: {
      dclRootClass: dclClass,
      bodyBackground: reloadBackground,
      storedTheme: reloadedStoredTheme,
    },
    stickyHeader: { yAt1000: headerBox?.y ?? null },
    zeroJs: {
      toggleAttached: zeroJs.attached,
      htmlClass: zeroJs.htmlClass,
      bodyBackground: zeroJs.bodyBackground,
    },
  });
});
