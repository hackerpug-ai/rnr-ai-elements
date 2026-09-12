import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * FLOW-SHELL-02 — first visit, zero storage: the pre-paint script resolves the
 * theme from the OS color scheme (stored `rnr-theme` > `prefers-color-scheme:
 * light` > dark) BEFORE the first frame, so a dark-scheme visitor never sees a
 * light flash and a light-scheme visitor is never forced dark.
 *
 * Browser-level lane over the BUILT dist (the runner serves `astro preview` —
 * never `astro dev`). This replaces the superseded dark-first-ignoring-scheme
 * draft: SHELL-003's landed contract is scheme-respecting, so the observables
 * here pin the SCHEME-RESOLVED class at domContentLoaded, not "always dark".
 *
 * First-frame discipline: every case creates a brand-new context (colorScheme
 * set at creation, zero storage, no bfcache), installs the recorder init script
 * before any page script, and navigates cold. The init script samples the root
 * theme class at domContentLoaded — after the parser ran DocsLayout's
 * is:inline pre-paint script, before first paint. A post-load read would
 * launder a flash, so no assertion here uses one for the first frame.
 *
 * Theme observables (never URL state): root theme class (dark = no `light`
 * class — the pre-paint script never writes a `dark` class), computed body
 * background-color (dark `oklch(0.145 0 0)`, light `oklch(1 0 0)`), and the
 * absence of any localStorage key on a fresh visit.
 *
 * page.evaluate calls use string expressions: the repo tsconfig carries no DOM
 * lib (same precedent as the sprint-01 ledger spec).
 *
 * On the green path the spec writes its DECLARED flow artifact
 * (.tmp/sprint-02-shell-hero/e2e-evidence/FLOW-SHELL-02-first-visit-prefers-
 * dark-no-flash.json) with the real observed values (home-hero convention).
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

// Installed before ANY page script: records the root class at domContentLoaded.
const THEME_DCL_RECORDER = `(() => {
  var sample = { atDomContentLoaded: null };
  window.__rnrThemeSample = sample;
  document.addEventListener('DOMContentLoaded', function () {
    sample.atDomContentLoaded = document.documentElement.className;
  });
})();`;

const READ_DCL_SAMPLE = 'window.__rnrThemeSample.atDomContentLoaded';
const READ_BODY_BG = 'getComputedStyle(document.body).backgroundColor';
const READ_STORAGE =
  'JSON.stringify({ theme: localStorage.getItem("rnr-theme"), keys: Object.keys(localStorage).sort() })';

const DARK_BG = 'oklch(0.145 0 0)';
const LIGHT_BG = 'oklch(1 0 0)';

test('FLOW-SHELL-02-first-visit-prefers-dark-no-flash', async ({ browser }, testInfo) => {
  // The DCL recorder is itself JS — under the runner's zero-JS project the
  // first frame cannot be sampled; the zero-JS rendering contract is
  // FLOW-SHELL-01's dedicated javaScriptEnabled:false case.
  test.skip(
    projectHasNoJs(testInfo),
    'the domContentLoaded sampler needs JS; zero-JS rendering is covered by the theme-toggle spec no-JS case',
  );

  // CASE 1 — every locked cold-boot route renders dark from the first frame.
  // One SEPARATE fresh context per route, and each route's literal sits on its
  // navigation AND assertion lines so the governed surface lint observes the
  // product target inside an assertion window (a shared route array would sit
  // outside every observation window and read as PRODUCT_TARGET_MISSING).

  // CASE 1a — /docs/theming
  const themingContext = await browser.newContext({ colorScheme: 'dark' });
  await themingContext.addInitScript(THEME_DCL_RECORDER);
  const themingPage = await themingContext.newPage();
  const themingResponse = await navigateLocalhost(themingPage, '/docs/theming');
  expect(themingResponse?.status(), '/docs/theming must answer 200 from the built preview').toBe(
    200,
  );

  const themingDclClass: unknown = await themingPage.evaluate(READ_DCL_SAMPLE);
  expect(
    themeStateOf(themingDclClass),
    `/docs/theming must already carry the dark theme at domContentLoaded (got root class ${String(
      themingDclClass,
    )}) — a light sample there is the light-flash signature`,
  ).toBe('dark');
  const themingBackground = await themingPage.evaluate(READ_BODY_BG);
  expect(themingBackground, '/docs/theming must paint the dark canvas on the first frame').toBe(
    DARK_BG,
  );
  const themingStoredTheme = JSON.parse(await themingPage.evaluate(READ_STORAGE)).theme;
  expect(
    themingStoredTheme,
    '/docs/theming: a fresh first visit must have no pre-existing rnr-theme — the pre-paint script only reads it',
  ).toBeNull();

  await testInfo.attach('flow-shell-02-dark-first-frame-docs-theming', {
    body: await themingPage.screenshot(),
    contentType: 'image/png',
  });
  await themingContext.close();

  // CASE 1b — /
  const homeContext = await browser.newContext({ colorScheme: 'dark' });
  await homeContext.addInitScript(THEME_DCL_RECORDER);
  const homePage = await homeContext.newPage();
  const homeResponse = await navigateLocalhost(homePage, '/');
  expect(homeResponse?.status(), '/ must answer 200 from the built preview').toBe(200);

  const homeDclClass: unknown = await homePage.evaluate(READ_DCL_SAMPLE);
  expect(
    themeStateOf(homeDclClass),
    `/ must already carry the dark theme at domContentLoaded (got root class ${String(
      homeDclClass,
    )}) — a light sample there is the light-flash signature`,
  ).toBe('dark');
  const homeBackground = await homePage.evaluate(READ_BODY_BG);
  expect(homeBackground, '/ must paint the dark canvas on the first frame').toBe(DARK_BG);
  const homeStoredTheme = JSON.parse(await homePage.evaluate(READ_STORAGE)).theme;
  expect(
    homeStoredTheme,
    '/: a fresh first visit must have no pre-existing rnr-theme — the pre-paint script only reads it',
  ).toBeNull();

  await testInfo.attach('flow-shell-02-dark-first-frame-home', {
    body: await homePage.screenshot(),
    contentType: 'image/png',
  });
  await homeContext.close();

  // CASE 1c — /components/message
  const messageContext = await browser.newContext({ colorScheme: 'dark' });
  await messageContext.addInitScript(THEME_DCL_RECORDER);
  const messagePage = await messageContext.newPage();
  const messageResponse = await navigateLocalhost(messagePage, '/components/message');
  expect(
    messageResponse?.status(),
    '/components/message must answer 200 from the built preview',
  ).toBe(200);

  const messageDclClass: unknown = await messagePage.evaluate(READ_DCL_SAMPLE);
  expect(
    themeStateOf(messageDclClass),
    `/components/message must already carry the dark theme at domContentLoaded (got root class ${String(
      messageDclClass,
    )}) — a light sample there is the light-flash signature`,
  ).toBe('dark');
  const messageBackground = await messagePage.evaluate(READ_BODY_BG);
  expect(
    messageBackground,
    '/components/message must paint the dark canvas on the first frame',
  ).toBe(DARK_BG);
  const messageStoredTheme = JSON.parse(await messagePage.evaluate(READ_STORAGE)).theme;
  expect(
    messageStoredTheme,
    '/components/message: a fresh first visit must have no pre-existing rnr-theme — the pre-paint script only reads it',
  ).toBeNull();

  await testInfo.attach('flow-shell-02-dark-first-frame-components-message', {
    body: await messagePage.screenshot(),
    contentType: 'image/png',
  });
  await messageContext.close();

  // CASE 2 — a fresh light-scheme visitor must get light, not a forced dark.
  const lightContext = await browser.newContext({ colorScheme: 'light' });
  await lightContext.addInitScript(THEME_DCL_RECORDER);
  const lightPage = await lightContext.newPage();
  const lightResponse = await navigateLocalhost(lightPage, '/');
  expect(lightResponse?.status(), '/ must answer 200 from the built preview').toBe(200);
  const lightDclClass: unknown = await lightPage.evaluate(READ_DCL_SAMPLE);
  expect(
    themeStateOf(lightDclClass),
    `a light-scheme fresh visitor must already be light at domContentLoaded (got root class ${String(
      lightDclClass,
    )}) — forcing dark ignores the scheme`,
  ).toBe('light');
  const lightBackground = await lightPage.evaluate(READ_BODY_BG);
  expect(lightBackground, 'the light-scheme canvas must resolve the light token').toBe(LIGHT_BG);
  await testInfo.attach('flow-shell-02-light-first-frame-home', {
    body: await lightPage.screenshot(),
    contentType: 'image/png',
  });
  await lightContext.close();

  writeEvidence('FLOW-SHELL-02-first-visit-prefers-dark-no-flash', {
    darkSchemeColdBoots: {
      '/docs/theming': {
        dclRootClass: themingDclClass,
        bodyBackground: themingBackground,
        storedTheme: themingStoredTheme,
      },
      '/': {
        dclRootClass: homeDclClass,
        bodyBackground: homeBackground,
        storedTheme: homeStoredTheme,
      },
      '/components/message': {
        dclRootClass: messageDclClass,
        bodyBackground: messageBackground,
        storedTheme: messageStoredTheme,
      },
    },
    lightSchemeColdBoot: {
      dclRootClass: lightDclClass,
      bodyBackground: lightBackground,
    },
  });
});
