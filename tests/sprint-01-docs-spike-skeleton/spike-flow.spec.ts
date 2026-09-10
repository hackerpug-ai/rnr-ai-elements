import { expect, test } from '@playwright/test';
import { grantClipboardPermissions, navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FUSE-11 AC-3 / TC-4 — spike-walk: the automated spine of the human gate walk
 * (SPRINT.md step 2: open site → ledger → component page → copy command via its
 * button → fetch the command's URL as JSON):
 *
 *   /  →  /registry (56 rows)  →  /components/conversation
 *      →  click the install-command copy button  →  read the REAL clipboard
 *      →  rewrite the pinned live origin to the preview origin  →  GET the URL
 *      on the SAME origin  →  200 application/json naming `conversation`.
 *
 * The clipboard observable is real: permissions are granted via
 * tests/harness/docs-preview.ts on the secure localhost origin and the text is
 * read back through navigator.clipboard.readText() — reading the command from
 * page text instead would hide a broken copy button behind a passing assertion.
 *
 * Runs every spec project (chromium-desktop, chromium-mobile, chromium-nojs);
 * the click/clipboard observables need a JS-enabled page, so the test skips on
 * JS-disabled projects — FUSE-09/FUSE-06's established split, with the zero-JS
 * fallbacks owned by copy-button.spec.ts / ledger.spec.ts.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

// Boundary contract regex (FUSE-06/FUSE-07): every install command is absolute-URL.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;
const LIVE_ORIGIN = 'https://rnraielements.com';
const LEDGER_ROWS = 'tbody tr';
const INSTALL_SECTION = 'section[data-section="install"]';

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

test('spike-walk FLOW-DELIV-03-live-registry-round-trip AC-3 TC-4 — home, /registry (56 rows), /components/conversation, copy command, same-origin JSON fetch', async ({
  browser,
  request,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'the click-to-copy clipboard observable needs a JS-enabled project; zero-JS fallbacks are owned by copy-button.spec.ts / ledger.spec.ts',
  );

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();

  // 1. The site entry serves (the visitor's open site).
  const home = await navigateLocalhost(page, '/');
  expect(home?.status(), 'GET / must return 200').toBe(200);

  // 2. The ledger of exactly 56 items.
  const ledger = await navigateLocalhost(page, '/registry');
  expect(ledger?.status(), 'GET /registry must return 200').toBe(200);
  expect(await page.locator(LEDGER_ROWS).count(), 'ledger row count').toBe(56);

  // 3. The component page with its install block.
  const componentPage = await navigateLocalhost(page, '/components/conversation');
  expect(componentPage?.status(), 'GET /components/conversation must return 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText('Conversation');
  const install = page.locator(INSTALL_SECTION);
  await expect(install).toBeVisible();

  // 4. Click the nativewind install command's copy button; assert the visible
  // success state, then read the REAL clipboard (secure context).
  const nativewindRow = install.locator('.install-row', { hasText: 'nativewind' });
  const trigger = nativewindRow.locator('rnr-copy-button button');
  await trigger.click();
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
  await expect(trigger, 'visible success label').toHaveText('Copied');
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard, 'clipboard must not be empty').not.toBe('');
  expect(clipboard, 'clipboard command must be absolute-URL').toMatch(COMMAND_PATTERN);
  expect(clipboard, 'clipboard must equal the displayed command').toBe(
    (await nativewindRow.locator('rnr-copy-button code').textContent())?.trim(),
  );

  // 5. Same-origin round trip: the registry URL the command advertises is
  // rewritten onto the preview origin and fetched — the exact JSON the CLI
  // would consume.
  const advertised = clipboard.split(' ').at(-1) ?? '';
  expect(
    advertised.startsWith(LIVE_ORIGIN),
    'clipboard command must end in the live registry URL',
  ).toBe(true);
  const localUrl = `${PREVIEW_URL}${advertised.slice(LIVE_ORIGIN.length)}`;
  const fetched = await request.get(localUrl);
  expect(fetched.status(), `${localUrl} must return 200`).toBe(200);
  expect(fetched.headers()['content-type'] ?? '', 'fetched content-type').toContain(
    'application/json',
  );
  const json = (await fetched.json()) as { name: string };
  expect(json.name, 'fetched JSON .name').toBe('conversation');

  await context.close();
});
