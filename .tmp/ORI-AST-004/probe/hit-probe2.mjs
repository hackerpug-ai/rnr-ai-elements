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
  const stack = document.elementsFromPoint(cx, cy).map((el) => {
    const er = el.getBoundingClientRect();
    return `${el.tagName}.${(el.className || '').toString().slice(0, 30)} top=${Math.round(er.top)} h=${Math.round(er.height)} href=${el instanceof HTMLAnchorElement ? el.getAttribute('href') : ''}`;
  });
  const parent = link.parentElement;
  return {
    stack,
    linkParentTag: parent?.tagName,
    linkParentClass: parent?.className,
    linkOffsetParent: link.offsetParent?.tagName,
    siblings: parent ? parent.children.length : 0,
    linkText: link.textContent.slice(0, 60),
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
