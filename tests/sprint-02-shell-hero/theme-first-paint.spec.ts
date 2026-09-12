import { expect, test } from '@playwright/test';

/**
 * FLOW-SHELL-02 — first visit, no stored theme choice, OS preference ignored by CSS:
 * the site paints DARK on the very first frame, and the html light class is the ONLY
 * mechanism that can make it light.
 *
 * Browser-level lane over the BUILT dist (the runner serves `astro preview` — never
 * `astro dev`). Dependencies staged by the sprint plan:
 * - SHELL-002 must land DocsLayout importing global.css (and the
 *   build.inlineStylesheets:'never' emission) so served pages resolve the tokens;
 * - SHELL-003 lands the pre-paint script that SETS the light class from storage.
 * Until then this spec is the lane's contract: it goes green exactly when the class
 * flip is the single theme mechanism — and it fails loudly if anyone reintroduces a
 * prefers-color-scheme media query, because the context emulates colorScheme:'light'
 * while the site must still paint dark.
 *
 * page.evaluate callbacks are string expressions: the repo tsconfig carries no DOM lib
 * (same pattern as the sprint-01 ledger spec).
 */

test.use({ colorScheme: 'light' });

test('FLOW-SHELL-02-first-visit-prefers-dark-no-flash', async ({ page }) => {
  await page.goto('/');

  // First visit: no stored choice, no class on the html element.
  const html = page.locator('html');
  await expect(html).not.toHaveClass(/(?:^|\s)light(?:\s|$)/);

  // OS prefers LIGHT here (colorScheme:'light' above) — the site still paints the
  // dark canvas because global.css has no media query: dark-first, no light flash.
  const darkCanvas = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(darkCanvas, 'first paint must resolve the dark --background token').toMatch(
    /^oklch\((?:0\.145|14\.5%)/,
  );

  // The class flip is the single light mechanism: adding html.light re-resolves
  // every token in place, no reload, no second mechanism.
  await page.evaluate("document.documentElement.classList.add('light')");
  const lightCanvas = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(lightCanvas, 'html.light must resolve the light --background token').toMatch(
    /^oklch\((?:1 |100%)/,
  );

  // Removing the class returns the dark column — the flip is reversible and owns
  // the theme end to end.
  await page.evaluate("document.documentElement.classList.remove('light')");
  const backToDark = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(backToDark).toMatch(/^oklch\((?:0\.145|14\.5%)/);
});
