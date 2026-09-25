import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 200)));
page.on('pageerror', (e) => console.log('PAGEERROR', String(e).slice(0, 200)));
await page.goto('http://localhost:4321/docs/introduction');
await page.evaluate(() => {
  const d = document.querySelector('dialog');
  d.addEventListener('cancel', () => console.log('CANCEL EVENT FIRED'));
  d.addEventListener('close', () => console.log('CLOSE EVENT FIRED'));
});
await page.locator('[data-search-slot] button').click();
await page.waitForTimeout(800);
await page.locator('dialog input[type="search"]').fill('streamdown');
await page.waitForTimeout(800);
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
const state = await page.evaluate(() => ({
  open: document.querySelector('dialog')?.hasAttribute('open'),
  focused: document.activeElement?.tagName,
  activeInDialog: document.activeElement?.closest?.('dialog') !== null,
}));
console.log('AFTER ESCAPE', JSON.stringify(state));
await browser.close();
