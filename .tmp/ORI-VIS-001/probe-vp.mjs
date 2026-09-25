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
const VP = "(() => ({ innerWidth: window.innerWidth, visualWidth: window.visualViewport ? Math.round(window.visualViewport.width) : null, visualScale: window.visualViewport ? window.visualViewport.scale : null, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, dpr: window.devicePixelRatio }))()";
console.log('viewportSize:', JSON.stringify(page.viewportSize()));
console.log(JSON.stringify(await page.evaluate(VP)));
const link = page.locator('.toc a[href="#textclasscontext"]');
try {
  await link.click({ timeout: 5000 });
  console.log('direct click OK');
} catch {
  const DURING = "(() => { const link = document.querySelector('.toc a[href=' + JSON.stringify('#textclasscontext') + ']'); const r = link.getBoundingClientRect(); return { top: Math.round(r.top), scrollY: Math.round(window.scrollY) }; })()";
  console.log('click failed; during:', JSON.stringify(await page.evaluate(DURING)));
}
await link.focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(400);
console.log('keyboard url:', page.url());
await browser.close();
if (server) server.kill();
