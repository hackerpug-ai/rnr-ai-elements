import { chromium } from '@playwright/test';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/components/conversation');
const out = await page.evaluate(async () => {
  const pf = await import('/pagefind/pagefind.js');
  const sample = async (q) => {
    const res = await pf.search(q);
    const first = res.results[0] ? await res.results[0].data() : null;
    return first ? { url: first.url, meta: first.meta, excerpt: first.excerpt.slice(0, 120) } : null;
  };
  return {
    item: await sample('item'),
    stackParser: await sample('stack-trace-parser'),
    docs: await sample('introduction'),
    conversationWords: (await pf.search('conversation')).results.length,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
