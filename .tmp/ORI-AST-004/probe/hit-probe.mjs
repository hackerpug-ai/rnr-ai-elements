import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 5'] });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/introduction');
await page.locator('[data-search-slot] button').click();
await page.waitForTimeout(1000);
await page.locator('dialog input[type="search"]').fill('what the library owns');
await page.waitForTimeout(1500);
const info = await page.evaluate(() => {
  const link = document.querySelector('a[data-search-result][data-active="true"]');
  const r = link.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const chain = [];
  let hit = document.elementFromPoint(cx, cy);
  while (hit && chain.length < 6) {
    chain.push(`${hit.tagName}.${(hit.className || '').toString().slice(0, 40)} rect=${JSON.stringify(hit.getBoundingClientRect().toJSON())}`);
    hit = hit.parentElement;
  }
  return { chain };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
