import { expect, test } from '@playwright/test';

// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

/**
 * FLOW-GEND-02-hero-install-command-copy — AC-1 for FUSE-09 (CopyButton island).
 *
 * Verifies the copy island against the REAL built site served by
 * `astro preview` at http://localhost:4321 (localhost is a secure context, so
 * navigator.clipboard works once permissions are granted). Case 1 asserts
 * clipboard CONTENT — never a success class — plus a visible success state
 * within 500 ms. Case 2 asserts the zero-JS fallback: javaScriptEnabled:false
 * still serves HTTP 200 with the full command as selectable text.
 *
 * Runner note: @playwright/test arrives as a repo dependency with FUSE-10's
 * playwright.config.ts. Until that lands, run with a locally installed runner:
 *
 *   pnpm --filter @rnr-ai-elements/docs build
 *   pnpm --filter @rnr-ai-elements/docs exec astro preview   # http://localhost:4321
 *   pnpm playwright test tests/sprint-01-docs-spike-skeleton/home.spec.ts --grep FLOW-GEND-02-hero-install-command-copy
 */
const COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const PAGE_URL = 'http://localhost:4321/islands/copy-button';
const CODE = 'rnr-copy-button code';
const TRIGGER = 'rnr-copy-button button';

test('FLOW-GEND-02-hero-install-command-copy', async ({ browser }, testInfo) => {
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

  // CASE 2 — javaScriptEnabled:false still shows the full command, selectable.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await noJsPage.goto(PAGE_URL);
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});
