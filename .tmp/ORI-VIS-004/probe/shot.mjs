import { chromium, devices } from '@playwright/test';
const browser = await chromium.launch();
for (const [name, ctxOpts] of [['desktop', {}], ['mobile', { ...devices['Pixel 5'] }]]) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/registry');
  await page.waitForLoadState('load');
  await page.evaluate(() => window.__rnrLedgerFilterRegistered);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `.tmp/ORI-VIS-004/probe/current-${name}.png`, fullPage: name === 'desktop' ? false : true });
  // toolbar geometry: how do the three controls stack?
  if (name === 'desktop') {
    const geo = await page.evaluate(() => {
      const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; };
      return {
        categories: pick('.ledger-filter__categories'),
        tablist: pick('.ledger-filter .tab-group__tabs'),
        panel: pick('.ledger-filter .tab-group__panel'),
        input: pick('.ledger-filter__input'),
        table: pick('.data-table__scroll'),
        docScroll: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
        wrapScroll: (() => { const el = document.querySelector('.data-table__scroll'); return el ? [el.scrollWidth, el.clientWidth] : null; })(),
      };
    });
    console.log(name, JSON.stringify(geo, null, 1));
  } else {
    const m = await page.evaluate(() => {
      const el = document.querySelector('.data-table__scroll');
      return { wrapScroll: el ? [el.scrollWidth, el.clientWidth] : null, doc: [document.documentElement.scrollWidth, document.documentElement.clientWidth] };
    });
    console.log(name, JSON.stringify(m));
  }
  await ctx.close();
}
await browser.close();
