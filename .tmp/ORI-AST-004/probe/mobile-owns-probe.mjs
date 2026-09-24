import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 5'] });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/introduction');
await page.locator('[data-search-slot] button').click();
await page.waitForTimeout(1200);
await page.locator('dialog input[type="search"]').fill('what the library owns');
await page.waitForTimeout(1500);
// Replicate activateResult: ArrowDown until /docs/introduction/ is active.
for (let i = 0; i < 21; i += 1) {
  const activeHref = await page.evaluate(() =>
    document.querySelector('dialog a[data-search-result][data-active="true"]')?.getAttribute('href'),
  );
  if (activeHref === '/docs/owns-vs-does-not-own/') break;
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(60);
}
const info = await page.evaluate(() => {
  const link = document.querySelector('dialog a[data-search-result][data-active="true"]');
  const r = link.getBoundingClientRect();
  const scroll = document.querySelector('.search-dialog__scroll');
  const sr = scroll.getBoundingClientRect();
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return {
    href: link.getAttribute('href'),
    linkTop: Math.round(r.top),
    linkBottom: Math.round(r.bottom),
    linkLeft: Math.round(r.left),
    linkRight: Math.round(r.right),
    linkHeight: Math.round(r.height),
    scrollTopEdge: Math.round(sr.top),
    scrollBottomEdge: Math.round(sr.bottom),
    scrollTop: scroll.scrollTop,
    hitTag: hit?.tagName,
    hitClass: (hit?.className || '').toString().slice(0, 40),
    status: document.querySelector('[data-search-status]')?.textContent,
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
