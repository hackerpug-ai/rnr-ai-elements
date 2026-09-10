import { expect, test } from '@playwright/test';

/**
 * FLOW-GEND-02-hero-install-command-copy — AC-1 for FUSE-09 (CopyButton island).
 *
 * Verifies the copy island against the REAL built site served by the FUSE-10
 * runner (`pnpm e2e:docs`: ordered build chain, then astro preview over dist).
 *
 * The landed config runs every spec under chromium-desktop, chromium-mobile
 * AND chromium-nojs projects. The clipboard observable needs a JS-enabled
 * page, so the click test skips on JS-disabled projects; the zero-JS fallback
 * (200 + selectable full command text) stays as its own UNGUARDED test so the
 * nojs project genuinely proves it.
 *
 * Case 1 asserts clipboard CONTENT — never a success class — plus a visible
 * success state within 500 ms. Localhost is a secure context, so
 * navigator.clipboard works once permissions are granted.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const PAGE_URL = 'http://localhost:4321/islands/copy-button';
const CODE = 'rnr-copy-button code';
const TRIGGER = 'rnr-copy-button button';

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

test('FLOW-GEND-02-hero-install-command-copy', async ({ browser }, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS fallback has its own unguarded test',
  );

  // CASE 1 — one click puts the exact displayed command on the clipboard.
  const jsContext = await browser.newContext();
  await jsContext.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await jsContext.newPage();
  await page.goto(PAGE_URL);

  // The copy source is the displayed text itself, so it cannot drift from it.
  const displayed = (await page.locator(CODE).textContent())?.trim();
  expect(displayed).toBe(COMMAND);

  const trigger = page.locator(TRIGGER);
  await trigger.click();

  // Visible success state within 500 ms of the click (by value, not class name).
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
  await expect(trigger).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(COMMAND); // exact equality — catches trailing newline

  await testInfo.attach('copy-button-success', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await jsContext.close();
});

test('FLOW-GEND-02 zero-JS fallback serves 200 with the full command selectable', async ({
  browser,
}) => {
  // CASE 2 — javaScriptEnabled:false still shows the full command, selectable.
  // Unguarded on purpose: under the chromium-nojs project this doubles as the
  // project-level proof that nothing gates the command behind JS.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await noJsPage.goto(PAGE_URL);
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});
