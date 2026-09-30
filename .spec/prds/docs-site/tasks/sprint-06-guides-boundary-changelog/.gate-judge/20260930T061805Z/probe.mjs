// Probe: per-guide ol/li counts + component-page callouts linking the guide.
import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';
const { writeFileSync } = await import('node:fs');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const out = {};

const guides = ['re-theme', 'update-installed-items', 'preview-on-device', 'customize-rendering', 'troubleshooting'];
out.guides = {};
for (const g of guides) {
  await page.goto(`http://localhost:4321/guides/${g}`, { waitUntil: 'networkidle' });
  out.guides[g] = await page.evaluate(() => {
    const article = document.querySelector('article') || document.body;
    const ols = Array.from(article.querySelectorAll('ol'));
    return {
      ol_count: ols.length,
      li_in_ols: ols.map(o => o.querySelectorAll(':scope > li').length),
      ordered_steps_total: ols.reduce((n, o) => n + o.querySelectorAll(':scope > li').length, 0),
      first_ol_first_li: ols[0] ? (ols[0].querySelector('li')?.innerText || '').slice(0, 90) : null,
    };
  });
}

// component pages: find callouts (aside / .callout-like blocks) linking /guides/customize-rendering
out.components = {};
for (const slug of ['message', 'reasoning']) {
  const url = `http://localhost:4321/docs/${slug}`;
  const resp = await page.goto(url, { waitUntil: 'networkidle' });
  const http = resp ? resp.status() : null;
  const info = await page.evaluate(() => {
    const asides = Array.from(document.querySelectorAll('aside, [class*="callout" i], .astro-callout, blockquote'));
    const hits = asides
      .filter(a => a.querySelector('a[href*="customize-rendering"]'))
      .map(a => ({ text: (a.innerText || '').replace(/\s+/g, ' ').slice(0, 260), href: a.querySelector('a[href*="customize-rendering"]')?.getAttribute('href') }));
    const anyLink = Array.from(document.querySelectorAll('a[href*="customize-rendering"]')).map(a => ({ href: a.getAttribute('href'), text: (a.innerText || '').trim().slice(0, 80), inAside: !!a.closest('aside, [class*="callout" i], blockquote') }));
    return { aside_candidates: asides.length, callout_hits: hits, all_customize_rendering_links: anyLink };
  });
  out.components[slug] = { url, http, ...info };
}
writeFileSync('step3-probe.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await page.screenshot({ path: 'step3-message-callout.png', fullPage: false });
await browser.close();
