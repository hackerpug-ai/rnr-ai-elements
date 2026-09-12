import { expect, test } from '@playwright/test';

/**
 * FLOW-SHELL-01 — the theme toggle: click to flip, persist across reload, and
 * paint the stored choice on the first frame with no flash.
 *
 * Browser-level lane over the BUILT dist (the runner serves `astro preview` —
 * never `astro dev`). Staged by the sprint plan:
 * - SHELL-002 lands the sticky header with its inert [data-theme-slot] mount
 *   and the DocsLayout head slot the pre-paint script fills;
 * - SHELL-003 lands the ThemeToggle island inside that mount plus the
 *   pre-paint class flip.
 * Until SHELL-003 lands, this spec is the lane's contract (the same pattern as
 * theme-first-paint.spec.ts): it goes green exactly when a real toggle renders
 * in the slot, flips html.light, persists the choice in storage, and the
 * stored choice paints immediately after reload — and it pins the sticky
 * header at scrollY=1000, which the authored CSS must keep true.
 *
 * page.evaluate callbacks are string expressions: the repo tsconfig carries no
 * DOM lib (same pattern as the sprint-01 ledger spec).
 */

test('FLOW-SHELL-01-theme-toggle-persisted-flash-free', async ({ page }) => {
  await page.goto('/registry');

  // The mount SHELL-002 provides; the ThemeToggle island SHELL-003 renders
  // inside it. An empty mount fails loudly here — that is the contract.
  const mount = page.locator('header [data-theme-slot]');
  await expect(mount).toBeAttached();
  const toggle = mount.getByRole('button');
  await expect(
    toggle,
    'SHELL-003 must mount the ThemeToggle island inside the header theme slot',
  ).toBeVisible();

  // Sticky shell (R1): at scrollY=1000 the header bar is still pinned at the
  // viewport top, exactly --layout-header-h tall.
  await page.evaluate('window.scrollTo(0, 1000)');
  const headerBox = await page.locator('header.site-header').boundingBox();
  expect(headerBox, 'the sticky site header must render').toBeTruthy();
  expect(
    Math.abs(headerBox?.y ?? -1),
    'the header must still be pinned at scrollY=1000',
  ).toBeLessThan(1);
  await page.evaluate('window.scrollTo(0, 0)');

  // First visit paints the dark canvas (dark-first, class flip is the only mechanism).
  const darkCanvas = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(darkCanvas, 'the unflipped canvas must resolve the dark --background token').toMatch(
    /^oklch\((?:0\.145|14\.5%)/,
  );

  // Clicking the toggle flips html.light and re-resolves the canvas in place.
  await toggle.click();
  await expect(page.locator('html')).toHaveClass(/(?:^|\s)light(?:\s|$)/);
  const lightCanvas = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(lightCanvas, 'the flipped canvas must resolve the light --background token').toMatch(
    /^oklch\((?:1 |100%)/,
  );

  // The choice persists across reload and paints on the FIRST frame — no dark flash.
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/(?:^|\s)light(?:\s|$)/);
  const persistedPaint = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(
    persistedPaint,
    'the stored choice must paint immediately after reload — a flash means the pre-paint script is missing or late',
  ).toMatch(/^oklch\((?:1 |100%)/);

  // Toggling back returns the dark column.
  await toggle.click();
  const backToDark = await page.evaluate('getComputedStyle(document.body).backgroundColor');
  expect(backToDark).toMatch(/^oklch\((?:0\.145|14\.5%)/);
});
