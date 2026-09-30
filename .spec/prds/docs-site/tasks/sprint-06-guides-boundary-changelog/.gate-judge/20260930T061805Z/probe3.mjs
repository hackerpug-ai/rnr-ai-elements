import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
// anchors on the guide page
await page.goto('http://localhost:4321/guides/customize-rendering', { waitUntil: 'networkidle' });
const anchors = await page.evaluate(() => ({
  rendermarkdown: !!document.getElementById('rendermarkdown'),
  textclasscontext: !!document.getElementById('textclasscontext'),
}));
console.log('guide anchors:', JSON.stringify(anchors));
// screenshot callout block on /components/message
await page.goto('http://localhost:4321/components/message', { waitUntil: 'networkidle' });
const el = await page.evaluate(() => {
  const asides = Array.from(document.querySelectorAll('aside, blockquote, div')).filter(b => b.innerText && b.innerText.includes('renderMarkdown seam') && b.querySelector('a[href*="customize-rendering"]') && b.innerText.length < 400);
  const target = asides[asides.length - 1];
  if (!target) return null;
  const r = target.getBoundingClientRect();
  return { x: Math.max(0, r.x), y: Math.max(0, r.y + window.scrollY - 20), w: r.width, h: r.height + 40 };
});
if (el) {
  await page.evaluate(y => window.scrollTo(0, y - 100), el.y);
  await page.waitForTimeout(300);
}
await page.screenshot({ path: 'step3-message-callout.png' });
// troubleshooting full page screenshot already exists (step3-troubleshooting.png)
await browser.close();
