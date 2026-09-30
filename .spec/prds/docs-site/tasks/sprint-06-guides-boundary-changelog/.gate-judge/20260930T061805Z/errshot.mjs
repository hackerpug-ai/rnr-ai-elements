import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';
const { readFileSync } = await import('node:fs');
const log = readFileSync('step6-build.log', 'utf8');
const tail = log.slice(-1800);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
await page.setContent(`<body style="background:#111;color:#eee;font:12px/1.5 monospace;padding:16px">
<h3 style="color:#f66">FIRST-CONTACT BUILD FAILED — rendering of step6-build.log (verbatim tail)</h3>
<pre style="white-space:pre-wrap">${tail.replace(/</g,'&lt;')}</pre></body>`);
await page.screenshot({ path: 'step6-build-error.png' });
await browser.close();
console.log('error evidence png written');
