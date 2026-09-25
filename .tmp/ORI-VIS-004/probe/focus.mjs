import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto('http://localhost:4321/registry');
await page.waitForFunction(() => window.__rnrLedgerFilterRegistered);
const describe = () => page.evaluate(`(() => {
  const el = document.activeElement;
  if (!el) return 'none';
  return el.tagName + '|' + (el.getAttribute('data-category-filter') ?? el.getAttribute('data-engine') ?? el.getAttribute('type') ?? '') + '|' + (el.getAttribute('aria-selected') ?? el.getAttribute('aria-pressed') ?? '');
})()`);
const tops = await page.evaluate(`(() => {
  const box = (s) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top) + 'h' + Math.round(el.getBoundingClientRect().height) : 'missing'; };
  return {
    toolbar: box('[data-ledger-toolbar]'),
    categories: box('.ledger-filter__categories'),
    tablist: box('rnr-ledger-filter .tab-group__tabs'),
    panel: box('rnr-ledger-filter .tab-group__panel:not([hidden])'),
    input: box('rnr-ledger-filter input'),
  };
})()`);
console.log('geometry', JSON.stringify(tops));
for (let i = 0; i < 12; i++) { await page.keyboard.press('Tab'); console.log('tab', i, await describe()); }
await page.keyboard.press('Shift+Tab'); console.log('shift-tab ->', await describe());
await page.keyboard.press('ArrowRight'); console.log('arrow ->', await describe());
await browser.close();
