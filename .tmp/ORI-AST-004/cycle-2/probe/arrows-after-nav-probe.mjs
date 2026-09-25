import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 200)));
await page.goto('http://localhost:4321/docs/introduction');
await page.locator('[data-search-slot] button').click();
await page.waitForFunction(() => globalThis.__rnrSearchReady === true, undefined, { timeout: 20000 });
await page.locator('dialog input[type="search"]').fill('streamdown');
await page.waitForFunction(() => (globalThis.__rnrSearchSettledQueries ?? []).includes('streamdown'), undefined, { timeout: 15000 });
await page.keyboard.press('Enter');
await page.waitForURL(/\/components\/streamdown/);
await page.waitForLoadState('load');
await page.waitForTimeout(800);
await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
await page.waitForSelector('dialog[aria-modal="true"][open]');
await page.locator('dialog input[type="search"]').fill('renderMarkdown');
await page.waitForFunction(() => (globalThis.__rnrSearchSettledQueries ?? []).includes('renderMarkdown'), undefined, { timeout: 15000 });
const before = await page.evaluate(() => ({
  focused: document.activeElement?.tagName,
  links: [...document.querySelectorAll('dialog a[data-search-result]')].map((a) => a.getAttribute('href')),
  active: document.querySelector('dialog a[data-search-result][data-active="true"]')?.getAttribute('href'),
}));
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(150);
const after = await page.evaluate(() => ({
  active: document.querySelector('dialog a[data-search-result][data-active="true"]')?.getAttribute('href'),
  focused: document.activeElement?.tagName,
}));
console.log(JSON.stringify({ before, after }, null, 1));
await browser.close();
