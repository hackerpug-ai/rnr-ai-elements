import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
for (const [name, ctxOpts, width] of [['desktop', {}, 1280], ['mobile', { ...devices['Pixel 5'] }, 393]]) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/components');
  await page.waitForFunction(() => window.__rnrLedgerFilterRegistered);
  const geo = await page.evaluate(`(() => {
    const toolbar = document.querySelector('[data-ledger-toolbar]');
    const input = document.querySelector('rnr-ledger-filter input');
    const cs = toolbar ? getComputedStyle(toolbar) : null;
    const ir = input ? input.getBoundingClientRect() : null;
    const wrap = document.documentElement;
    return {
      toolbarExists: !!toolbar,
      toolbarBorder: cs ? cs.borderTopWidth + '/' + cs.backgroundColor : '',
      inputWidth: ir ? Math.round(ir.width) : 0,
      pageOverflow: wrap.scrollWidth - wrap.clientWidth,
    };
  })()`);
  console.log(name, JSON.stringify(geo));
  await ctx.close();
}
await browser.close();
