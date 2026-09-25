import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 5'] });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/introduction');
await page.locator('[data-search-slot] button').click();
await page.waitForTimeout(1200);
await page.locator('dialog input[type="search"]').fill('what the library owns');
await page.waitForTimeout(1500);
for (let i = 0; i < 21; i += 1) {
  const activeHref = await page.evaluate(() =>
    document.querySelector('dialog a[data-search-result][data-active="true"]')?.getAttribute('href'),
  );
  if (activeHref === '/docs/owns-vs-does-not-own/') break;
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(60);
}
try {
  await page.locator('dialog a[data-search-result][data-active="true"]').click({ timeout: 3000 });
  console.log('CLICK OK');
} catch (e) {
  console.log('CLICK FAILED:', String(e).split('\n').slice(0, 12).join('\n'));
}
await page.screenshot({ path: '.tmp/ORI-AST-004/probe/mobile-dialog.png' });
const rects = await page.evaluate(() => {
  const link = document.querySelector('dialog a[data-search-result][data-active="true"]');
  const lr = link.getBoundingClientRect();
  const dialog = document.querySelector('dialog');
  const dr = dialog.getBoundingClientRect();
  const scroll = document.querySelector('.search-dialog__scroll');
  const sr = scroll.getBoundingClientRect();
  return { link: lr.toJSON(), dialog: dr.toJSON(), scroll: sr.toJSON(), visualViewport: JSON.stringify({ h: window.visualViewport.height, offsetTop: window.visualViewport.offsetTop, scale: window.visualViewport.scale }) };
});
console.log(JSON.stringify(rects, null, 1));
await browser.close();
