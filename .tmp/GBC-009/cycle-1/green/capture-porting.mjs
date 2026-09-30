// GBC-009 cycle-1 GREEN evidence: real Chromium screenshots of /porting (and
// the /docs/porting 404 status) over the built preview on 127.0.0.1:4321.
// Run AFTER `astro preview` owns the port:  node capture-porting.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const requireFromRoot = createRequire(new URL('../../../../package.json', import.meta.url));
const { chromium, devices } = requireFromRoot('@playwright/test');

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'screenshots');
const BASE = 'http://127.0.0.1:4321';
mkdirSync(OUT, { recursive: true });

const observations = {};

async function shoot(name, deviceName, javaScriptEnabled) {
  const device = devices[deviceName];
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...device,
    javaScriptEnabled,
    baseURL: BASE,
  });
  const page = await context.newPage();
  const response = await page.goto(new URL('/porting', BASE).href);
  await page.waitForLoadState('load');
  await page.screenshot({ path: join(OUT, `${name}-porting.png`), fullPage: false });
  const alias = await context.request.get(new URL('/docs/porting', BASE).href);
  observations[name] = {
    portingStatus: response.status(),
    docsPortingAliasStatus: alias.status(),
    h1: ((await page.locator('main h1').textContent()) ?? '').trim(),
    device: deviceName,
    javaScriptEnabled,
  };
  await browser.close();
}

await shoot('chromium-desktop', 'Desktop Chrome', true);
await shoot('chromium-mobile', 'Pixel 5', true);
await shoot('chromium-nojs', 'Desktop Chrome', false);

writeFileSync(join(HERE, 'porting-captures.json'), `${JSON.stringify(observations, null, 2)}\n`);
console.log(JSON.stringify(observations, null, 2));
