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
for (const js of [true, false]) {
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/docs/installation');
  const styles = await page.evaluate(() => {
    const button = document.querySelector('.copy-button__trigger');
    const code = document.querySelector('.copy-button__command');
    const strip = document.querySelector('rnr-copy-button');
    const read = (el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, border: cs.border, font: cs.fontFamily, radius: cs.borderRadius, pad: cs.padding };
    };
    return { html: document.documentElement.className, button: button ? read(button) : null, code: code ? read(code) : null, strip: strip ? read(strip) : null };
  }).catch(() => null);
  console.log(js ? 'WITH JS:' : 'NO JS:', JSON.stringify(styles));
  await ctx.close();
}
await browser.close();
if (server) server.kill();
