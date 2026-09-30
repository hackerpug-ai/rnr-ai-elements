import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';
const { writeFileSync } = await import('node:fs');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const out = {};
for (const slug of ['message', 'reasoning']) {
  const url = `http://localhost:4321/components/${slug}`;
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  const info = await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll('aside, blockquote, div, section'));
    const hits = blocks
      .filter(b => b.querySelector('a[href*="customize-rendering"]') && b.innerText && b.innerText.length < 600 && b.querySelector('a[href*="customize-rendering"]'))
      .slice(0, 4)
      .map(b => ({ text: (b.innerText || '').replace(/\s+/g, ' ').slice(0, 300), href: b.querySelector('a[href*="customize-rendering"]')?.getAttribute('href') }));
    return { customize_links: Array.from(document.querySelectorAll('a[href*="customize-rendering"]')).map(a => ({ href: a.getAttribute('href'), text: (a.innerText || '').trim().slice(0, 90) })), blocks_with_link: hits.length, sample_blocks: hits };
  });
  out[slug] = { url, http: resp ? resp.status() : null, ...info };
}
writeFileSync('step3-callouts.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
