import { expect, test } from '@playwright/test';

// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

/**
 * FUSE-09 TC-1 / TC-2 — per-test-criterion split of the CopyButton island
 * behaviors on the spike proof route /islands/copy-button, served by the real
 * `astro preview` at http://localhost:4321 (secure context on localhost).
 *
 * TC-1: one click places the exact trimmed command on the clipboard.
 * TC-2: visible success state within 500 ms, and javaScriptEnabled:false still
 *       serves HTTP 200 with the full command as selectable text.
 *
 * Runner note: @playwright/test becomes a repo dependency with FUSE-10's
 * playwright.config.ts. Until then run against a local runner install (see
 * home.spec.ts header for the exact sequence).
 */
const COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const PAGE_URL = 'http://localhost:4321/islands/copy-button';
const CODE = 'rnr-copy-button code';
const TRIGGER = 'rnr-copy-button button';

test('FUSE-09 TC-1 copy places the exact command on the clipboard', async ({ browser }) => {
  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  await page.goto(PAGE_URL);

  const trigger = page.locator(TRIGGER);
  await trigger.click();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(COMMAND); // no trailing newline, no wrap artifact
  await context.close();
});

test('FUSE-09 TC-2 success state within 500ms and zero-JS selectable fallback', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  await page.goto(PAGE_URL);

  const trigger = page.locator(TRIGGER);
  await trigger.click();
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
  await context.close();

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await noJsPage.goto(PAGE_URL);
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});
