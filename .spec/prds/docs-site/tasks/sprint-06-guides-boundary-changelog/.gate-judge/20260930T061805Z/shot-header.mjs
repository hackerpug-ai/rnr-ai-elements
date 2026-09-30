import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 400 } });
await page.goto('http://localhost:4321/components', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'step5-header.png' });
console.log('header shot saved');
await browser.close();
