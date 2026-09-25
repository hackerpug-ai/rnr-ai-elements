import { chromium } from '@playwright/test';
const ROW = (name) => `tr[id="row-${name}"]`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/registry');
try {
  const out = await page.evaluate(`(() => {
    const cell = document.querySelector('${ROW('conversation')} th[scope="row"]');
    return cell ? 'found' : 'null';
  })()`);
  console.log('result:', out);
} catch (e) {
  console.log('ERROR:', e.message.split('\n')[0]);
}
await browser.close();
