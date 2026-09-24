// Throwaway probe: does the REAL index carry hidden-panel, prop and verdict content?
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:4321/components/conversation');
const out = await page.evaluate(async () => {
  const pf = await import('/pagefind/pagefind.js');
  const run = async (q) => {
    const res = await pf.search(q);
    const urls = [];
    for (const r of res.results.slice(0, 5)) urls.push((await r.data()).url);
    return { count: res.results.length, urls };
  };
  return {
    uniwind: await run('uniwind'),
    nativewindCommand: await run('r/uniwind/conversation'),
    nearBottomThreshold: await run('nearBottomThreshold'),
    verdict: await run('runs in Expo Go'),
    streamdown: await run('streamdown'),
    renderMarkdown: await run('renderMarkdown'),
    devClient: await run('dev client'),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
