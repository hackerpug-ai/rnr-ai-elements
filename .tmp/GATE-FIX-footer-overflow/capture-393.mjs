import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 851 } });
await page.goto('http://localhost:4321/guides', { waitUntil: 'networkidle' });

const overflow = await page.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);

const footer = page.locator('footer.site-footer');
await footer.scrollIntoViewIfNeeded();
const boxes = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), w: Math.round(r.width), y: Math.round(r.y), h: Math.round(r.height) };
  };
  return {
    brand: pick('.site-footer__brand'),
    nav: pick('.site-footer__nav'),
    note: pick('.site-footer__note'),
    navRowBreaks: (() => {
      const links = [...document.querySelectorAll('.site-footer__nav a')];
      const ys = [...new Set(links.map((a) => Math.round(a.getBoundingClientRect().y)))];
      return ys.length;
    })()
  };
});

console.log(JSON.stringify({ overflow, footerRows: boxes.navRowBreaks, boxes }, null, 2));
await page.screenshot({
  path: '.tmp/GATE-FIX-footer-overflow/chromium-393-footer.png',
  fullPage: true,
});
await browser.close();
