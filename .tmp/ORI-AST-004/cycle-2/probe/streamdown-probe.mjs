import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/docs/introduction');
await page.locator('[data-search-slot] button').click();
await page.waitForFunction(() => globalThis.__rnrSearchReady === true, undefined, { timeout: 20000 });
await page.locator('dialog input[type="search"]').fill('streamdown');
await page.waitForFunction(() => (globalThis.__rnrSearchSettledQueries ?? []).includes('streamdown'), undefined, { timeout: 15000 });
const out = await page.evaluate(() => ({
  hrefs: [...document.querySelectorAll('dialog a[data-search-result]')].map((a) => a.getAttribute('href')),
  categories: [...document.querySelectorAll('dialog a[data-search-result]')].map((a) => a.getAttribute('data-category')),
}));
console.log(JSON.stringify(out));
await browser.close();
