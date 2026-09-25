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
const ctx = await browser.newContext({ viewport: { width: 393, height: 851 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto('http://localhost:4321/docs/theming');
const info = await page.evaluate(`(() => {
  const grid = document.querySelector('.markdown-doc');
  const gridStyle = getComputedStyle(grid);
  const suspects = [];
  for (const el of document.querySelectorAll('.markdown-doc__body *')) {
    const cs = getComputedStyle(el);
    if (cs.minWidth !== 'auto' && cs.minWidth !== '0px') {
      suspects.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), minWidth: cs.minWidth, width: cs.width });
    }
  }
  // which elements are wider than the viewport column
  const wide = [];
  for (const el of document.querySelectorAll('.markdown-doc__body, .markdown-doc__body *')) {
    const r = el.getBoundingClientRect();
    if (r.width > 400) wide.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 50), w: Math.round(r.width), mw: getComputedStyle(el).maxWidth });
  }
  return {
    gridTemplateColumns: gridStyle.gridTemplateColumns,
    docScrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    minWidthSuspects: suspects.slice(0, 8),
    wideElements: wide.slice(0, 12),
  };
})()`);
console.log(JSON.stringify(info, null, 1));
await browser.close();
if (server) server.kill();
