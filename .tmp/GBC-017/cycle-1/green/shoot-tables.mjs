import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// GBC-017 visual verification: the built dist served by astro preview, shot
// through real Chromium. Desktop (1280x900) + mobile (390x844, under the 48rem
// media breakpoint) for the boundary and porting tables.
const OUT = new URL('.', import.meta.url).pathname;
const shots = [
  { name: 'boundary-desktop', url: 'http://localhost:4321/docs/owns-vs-does-not-own', viewport: { width: 1280, height: 900 }, tableIndex: 1 },
  { name: 'boundary-mobile', url: 'http://localhost:4321/docs/owns-vs-does-not-own', viewport: { width: 390, height: 844 }, tableIndex: 2 },
  { name: 'porting-desktop', url: 'http://localhost:4321/porting', viewport: { width: 1280, height: 900 }, tableIndex: 0 },
  { name: 'porting-mobile', url: 'http://localhost:4321/porting', viewport: { width: 390, height: 844 }, tableIndex: 0 },
];

const browser = await chromium.launch();
for (const shot of shots) {
  const page = await browser.newPage({ viewport: shot.viewport });
  const response = await page.goto(shot.url, { waitUntil: 'load' });
  if (!response || response.status() !== 200) throw new Error(`${shot.url} -> ${response?.status()}`);
  const table = page.locator('main .prose table').nth(shot.tableIndex);
  await table.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const metrics = await table.evaluate((el) => {
    const cs = getComputedStyle(el);
    const row = el.querySelector('tbody tr:nth-child(2) td');
    const rowCs = row ? getComputedStyle(row) : null;
    return {
      display: cs.display,
      overflowX: cs.overflowX,
      tableWidth: el.getBoundingClientRect().width,
      containerWidth: el.parentElement.getBoundingClientRect().width,
      zebraBackground: rowCs?.backgroundColor ?? null,
      cellCount: el.querySelectorAll('td, th').length,
      horizontalOverflow: el.scrollWidth > el.clientWidth,
    };
  });
  console.log(`${shot.name}: ${JSON.stringify(metrics)}`);
  await page.screenshot({ path: `${OUT}${shot.name}.png` });
  await page.close();
}
await browser.close();
mkdirSync(OUT, { recursive: true });
console.log('screenshots written');
