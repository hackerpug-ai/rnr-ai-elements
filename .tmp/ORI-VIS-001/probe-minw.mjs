import { chromium, devices } from '@playwright/test';
import net from 'node:net';
import { spawn } from 'node:child_process';
function checkPort(port) {
  return new Promise((resolve) => {
    const s = net.connect(port, '127.0.0.1', () => { s.destroy(); resolve(true); });
    s.on('error', () => resolve(false));
  });
}
const busy = await checkPort(4321);
let server = null;
if (!busy) {
  server = spawn('pnpm', ['--filter', '@rnr-ai-elements/docs', 'exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', '4321', '--ignore-lock'], { cwd: process.cwd(), env: { ...process.env, ASTRO_PREVIEW_BACKGROUND: '1' }, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 3500));
}
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['Pixel 5'] });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/theming');
const MEASURE = "(() => { const g = getComputedStyle(document.querySelector('.markdown-doc')); return { track: g.gridTemplateColumns, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }; })()";
console.log('before:', JSON.stringify(await page.evaluate(MEASURE)));
await page.addStyleTag({ content: '.markdown-doc__body{min-width:0}.markdown-doc__toc{min-width:0}' });
console.log('after min-width:', JSON.stringify(await page.evaluate(MEASURE)));
// who is the widest inner element now?
const WIDE = "(() => { let worst = null; for (const el of document.querySelectorAll('.markdown-doc__body *')) { const r = el.getBoundingClientRect(); if (!worst || r.width > worst.w) worst = { tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), w: Math.round(r.width) }; } return worst; })()";
console.log('widest inside body after fix:', JSON.stringify(await page.evaluate(WIDE)));
await browser.close();
if (server) server.kill();
