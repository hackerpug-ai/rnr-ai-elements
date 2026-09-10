import { expect, test } from '@playwright/test';

/**
 * FUSE-09 TC-1 / TC-2 — per-test-criterion split of the CopyButton island
 * behaviors on the spike proof route /islands/copy-button, served by the real
 * `astro preview` over dist via `pnpm e2e:docs`.
 *
 * TC-1: one click places the exact trimmed command on the clipboard.
 * TC-2: visible success state within 500 ms, and javaScriptEnabled:false still
 *       serves HTTP 200 with the full command as selectable text.
 *
 * The landed config runs every spec under chromium-desktop, chromium-mobile
 * AND chromium-nojs projects. The click-dependent tests skip on JS-disabled
 * projects; the zero-JS fallback stays as its own UNGUARDED test so the nojs
 * project genuinely proves the fallback (200 + selectable full command text).
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

test('FUSE-09 TC-1 copy places the exact command on the clipboard', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS fallback has its own unguarded test',
  );

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

test('FUSE-09 TC-2 success state becomes copied within 500ms of the click', async ({
  browser,
}, testInfo) => {
  test.skip(projectHasNoJs(testInfo), 'the click-to-copy state change needs a JS-enabled project');

  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  await page.goto(PAGE_URL);

  const trigger = page.locator(TRIGGER);
  await trigger.click();
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
  await context.close();
});

test('FUSE-09 TC-2 zero-JS fallback serves 200 with the full command selectable', async ({
  browser,
}) => {
  // Unguarded on purpose: under the chromium-nojs project this doubles as the
  // project-level proof that nothing gates the command behind JS.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await noJsPage.goto(PAGE_URL);
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});
