// Blind-judge driver: goto, wait, fullpage screenshot, dump body text + links.
// usage: node drive.mjs <url> <out.png> <out.txt> [linksFile]
import { chromium } from '/Users/justinrich/Projects/rnr-ai-elements/node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/index.mjs';

const [url, png, txt, linksFile] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
const status = resp ? resp.status() : null;
await page.waitForTimeout(500);
await page.screenshot({ path: png, fullPage: true });
const text = await page.evaluate(() => document.body.innerText);
const { writeFileSync } = await import('node:fs');
writeFileSync(txt, `URL: ${url}\nHTTP_STATUS: ${status}\nTITLE: ${await page.title()}\n----BODY-TEXT----\n${text}\n`);
if (linksFile) {
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a')).map(a => ({
      text: (a.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80),
      href: a.getAttribute('href'),
    }))
  );
  writeFileSync(linksFile, JSON.stringify(links, null, 1));
}
console.log(`status=${status} title=${await page.title()}`);
await browser.close();
