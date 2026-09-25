import { chromium } from '@playwright/test';
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
const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/installation');
const info = await page.evaluate(() => {
  const out = [];
  for (const sel of ['rnr-copy-button', '.copy-button', '.copy-button__command', '.copy-button__trigger', '.tab-group__panel']) {
    for (const el of [...document.querySelectorAll(sel)].slice(0, 3)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.push({ sel, top: Math.round(r.top + window.scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color });
    }
  }
  return out;
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
if (server) server.kill();
