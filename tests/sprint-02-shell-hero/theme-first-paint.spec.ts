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
 */

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

// The locked cold-boot routes: the theming doc page, the site root, and a
// component item page — one SEPARATE fresh context per route.
const DARK_ROUTES = ['/docs/theming', '/', '/components/message'];

test('FLOW-SHELL-02-first-visit-prefers-dark-no-flash', async ({ browser }, testInfo) => {
  // The DCL recorder is itself JS — under the runner's zero-JS project the
  // first frame cannot be sampled; the zero-JS rendering contract is
  // FLOW-SHELL-01's dedicated javaScriptEnabled:false case.
  test.skip(
    projectHasNoJs(testInfo),
    'the domContentLoaded sampler needs JS; zero-JS rendering is covered by the theme-toggle spec no-JS case',
  );

  // CASE 1 — every cold-boot route renders dark from the first frame in a
  // brand-new dark-scheme context.
  for (const route of DARK_ROUTES) {
    const context = await browser.newContext({ colorScheme: 'dark' });
    await context.addInitScript(THEME_DCL_RECORDER);
    const page = await context.newPage();
    const response = await navigateLocalhost(page, route);
    expect(response?.status(), `${route} must answer 200 from the built preview`).toBe(200);

    const dclClass: unknown = await page.evaluate(READ_DCL_SAMPLE);
    expect(
      themeStateOf(dclClass),
      `${route} must already carry the dark theme at domContentLoaded (got root class ${String(
        dclClass,
      )}) — a light sample there is the light-flash signature`,
    ).toBe('dark');
    expect(
      await page.evaluate(READ_BODY_BG),
      `${route} must paint the dark canvas on the first frame`,
    ).toBe(DARK_BG);
    expect(
      JSON.parse(await page.evaluate(READ_STORAGE)).theme,
      `${route}: a fresh first visit must have no pre-existing rnr-theme — the pre-paint script only reads it`,
    ).toBeNull();

    const evidenceName = route === '/' ? 'home' : route.replaceAll('/', '-').slice(1);
    await testInfo.attach(`flow-shell-02-dark-first-frame-${evidenceName}`, {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
    await context.close();
  }

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
  expect(await lightPage.evaluate(READ_BODY_BG)).toBe(LIGHT_BG);
  await testInfo.attach('flow-shell-02-light-first-frame-home', {
    body: await lightPage.screenshot(),
    contentType: 'image/png',
  });
  await lightContext.close();
});
