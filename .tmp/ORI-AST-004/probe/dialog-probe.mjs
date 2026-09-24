import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 200)));
page.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 300)));
page.on('requestfailed', (r) => console.log('REQFAIL', r.url()));
await page.goto('http://localhost:4321/docs/introduction');
await page.waitForTimeout(1500);
const state = await page.evaluate(() => ({
  defined: customElements.get('rnr-search-dialog')?.name ?? null,
  triggerCount: document.querySelectorAll('[data-search-slot] button').length,
  slotHidden: document.querySelector('[data-search-slot]')?.hasAttribute('hidden'),
}));
console.log('STATE', JSON.stringify(state));
await page.locator('[data-search-slot] button').click();
await page.waitForTimeout(2500);
const after = await page.evaluate(() => ({
  dialogOpen: document.querySelector('dialog')?.hasAttribute('open'),
  ready: globalThis.__rnrSearchReady,
  loadingHidden: document.querySelector('[data-search-loading]')?.hidden,
  errorHidden: document.querySelector('[data-search-error]')?.hidden,
  pagefindReqs: performance.getEntriesByType('resource').filter((r) => r.name.includes('/pagefind/')).map((r) => r.name).slice(0, 6),
}));
console.log('AFTER', JSON.stringify(after, null, 1));
await browser.close();
