import { chromium } from '@playwright/test';
import { statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const dir = 'tests/sprint-05-orient-search/evidence/ledger';
const files = ['filtered-uniwind.png','mobile-scroll.png','nojs-full-table.png','focused-controls.png','restored-rows.png','no-results.png','wide-toolbar.png'];
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage();
for (const f of files) {
  const abs = resolve(join(dir, f));
  const bytes = statSync(abs).size;
  await page.goto('file://' + abs);
  const info = await page.evaluate(async () => {
    const img = new Image();
    img.src = location.href;
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
    const c = document.createElement('canvas');
    const scale = Math.min(1, 1200 / img.naturalWidth);
    c.width = Math.max(1, Math.round(img.naturalWidth * scale));
    c.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 40) colors.add(`${data[i]},${data[i+1]},${data[i+2]}`);
    return { w: img.naturalWidth, h: img.naturalHeight, distinctColors: colors.size };
  }).catch((e) => ({ error: String(e).slice(0, 60) }));
  console.log(f, JSON.stringify({ bytes, ...info }));
}
await browser.close();
