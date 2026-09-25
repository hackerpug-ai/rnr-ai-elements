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
// Replay the test sequence: nav clicks through the four pages, then hard goto theming.
await page.goto('http://localhost:4321/docs/introduction');
for (const dest of ['/docs/installation', '/docs/cli', '/docs/theming', '/docs/dark-mode']) {
  await page.locator(`nav[data-docs-nav] a[href="${dest}"]`).click();
  await page.waitForURL(`**${dest}`);
}
await page.goto('http://localhost:4321/docs/theming');
try {
  await page.locator('.toc a[href="#textclasscontext"]').click({ timeout: 8000 });
  console.log('CLICK OK, url =', page.url());
} catch (e) {
  console.log('CLICK FAILED:', e.message.split('\n').slice(0, 6).join(' | '));
  const info = await page.evaluate(`(() => {
    const link = document.querySelector('.toc a[href="#textclasscontext"]');
    const r = link.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const top = document.elementFromPoint(cx, cy);
    return {
      innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth,
      linkRect: { top: Math.round(r.top), h: Math.round(r.height) },
      point: { cx: Math.round(cx), cy: Math.round(cy) },
      topElement: top ? top.tagName + ' | ' + (top.textContent || '').slice(0, 40) : null,
      htmlClass: document.documentElement.className,
    };
  })()`);
  console.log(JSON.stringify(info, null, 1));
}
await browser.close();
if (server) server.kill();
