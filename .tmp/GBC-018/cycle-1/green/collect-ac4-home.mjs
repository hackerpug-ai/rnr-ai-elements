/**
 * GBC-018 evidence driver — collects exactly the observations GBC-003's
 * locked AC-4 reads on the home and Introduction routes, over the real
 * built preview at localhost:4321 (chromium-desktop + chromium-nojs
 * equivalents). Not a spec: GBC-003 authors the spec; this only records
 * the counts its home-teaser segment asserts.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('../../../../node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core');
const { devices } = require('@playwright/test');

const BASE = 'http://localhost:4321';
const report = { startedAt: new Date().toISOString(), base: BASE, projects: {} };

async function collect(browser, projectName, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const observations = {};
  for (const route of ['/', '/docs/introduction']) {
    const response = await page.goto(new URL(route, BASE).href, { waitUntil: 'load' });
    observations[route] = {
      status: response ? response.status() : null,
      mainTeaserAnchors: await page
        .locator('main a[href="/docs/owns-vs-does-not-own"]')
        .count(),
      wholePageTeaserAnchors: await page
        .locator('a[href="/docs/owns-vs-does-not-own"]')
        .count(),
      mainToolExecutorTables: await page
        .locator('main table')
        .filter({ hasText: /tool executor/i })
        .count(),
    };
  }
  await context.close();
  return observations;
}

const browser = await chromium.launch();
report.projects['chromium-desktop'] = await collect(browser, 'chromium-desktop', {
  ...devices['Desktop Chrome'],
});
report.projects['chromium-nojs'] = await collect(browser, 'chromium-nojs', {
  ...devices['Desktop Chrome'],
  javaScriptEnabled: false,
});
await browser.close();
report.finishedAt = new Date().toISOString();

const { writeFileSync } = await import('node:fs');
writeFileSync(new URL('./ac4-home-observations.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.projects, null, 2));
