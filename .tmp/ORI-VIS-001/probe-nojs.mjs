import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import net from 'node:net';

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
const boxes = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('.code-block, .tab-group__tabs, [role="tabpanel"]')) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out.push({
      cls: el.className,
      engine: el.getAttribute('data-engine'),
      top: Math.round(r.top + window.scrollY),
      left: Math.round(r.left),
      width: Math.round(r.width),
      height: Math.round(r.height),
      bg: cs.backgroundColor,
      text: (el.textContent ?? '').slice(0, 60).replace(/\s+/g, ' '),
    });
  }
  return out;
});
console.log(JSON.stringify(boxes, null, 1));
await browser.close();
if (server) server.kill();
