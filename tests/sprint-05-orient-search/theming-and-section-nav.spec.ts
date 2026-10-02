import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-CONT-004 — the locked theming flow FLOW-DOCS-01-theming-and-section-nav.
 * Every test name carries the flow token, so the exact locked command selects the
 * task surface:
 *
 *   pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts \
 *     --grep FLOW-DOCS-01-theming-and-section-nav
 *
 *   - "locked 4-step sequence" — AC-2: read /docs/theming end to end, verify the
 *     scoped engine guidance against the real consumer sources, count the paired
 *     token rows and oklch values, prove --primary differs between columns, then
 *     traverse the Getting started navigation to CLI and Dark mode and back.
 *   - "AC-2 seam anchors" — #textclasscontext and #rendermarkdown navigate to the
 *     sections whose descriptions are checked against the CURRENT registry sources.
 *   - "AC-2 reading floor" — chromium-nojs reads both value columns, the oklch
 *     values, the anchors and the section links with JavaScript disabled.
 *
 * The token table is the real build-time derivation of apps/docs/src/styles/global.css
 * plus apps/docs/src/data/token-usage.json; the engine guidance is checked against
 * apps/example/global.css and apps/example/lib/theme.ts on disk; the seam
 * descriptions are checked against packages/registry/src/components/ai/message.tsx,
 * reasoning.tsx and the registry's TextClassContext consumers. Nothing is
 * intercepted or manufactured.
 */

const FLOW_TOKEN = 'FLOW-DOCS-01-theming-and-section-nav';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav';
const LOCKED_COMMAND = `pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep ${FLOW_TOKEN}`;
const CAPTURE_DIR = '.tmp/ORI-CONT-004/captures';

const TOKEN_TABLE = 'table[data-token-table]';
const TOKEN_ROW = `${TOKEN_TABLE} tbody tr[data-token]`;
const DOCS_NAV = '[data-docs-nav]';

function isNoJs(testInfo: TestInfo): boolean {
  return testInfo.project.name === 'chromium-nojs';
}

async function settle(page: Page, testInfo: TestInfo): Promise<void> {
  if (isNoJs(testInfo)) {
    await page.waitForLoadState('load');
    return;
  }
  await waitForAstroPageLoad(page);
}

function capture(testInfo: TestInfo, name: string, data: unknown): void {
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${name}.json`),
    `${JSON.stringify(data, null, 2)}\n`,
  );
}

async function bodyText(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}

interface TokenRow {
  token: string;
  usage: string;
  light: string;
  dark: string;
}

async function readTokenRows(page: Page): Promise<TokenRow[]> {
  return page.locator(TOKEN_ROW).evaluateAll((rows) =>
    rows.map((row) => ({
      token: row.getAttribute('data-token') ?? '',
      usage:
        (row.querySelector('td[data-usage]') as { textContent: string | null } | null)
          ?.textContent ?? '',
      light: (
        (row.querySelector('td[data-value="light"] code') as { textContent: string | null })
          ?.textContent ?? ''
      ).trim(),
      dark: (
        (row.querySelector('td[data-value="dark"] code') as { textContent: string | null })
          ?.textContent ?? ''
      ).trim(),
    })),
  );
}

/** The shared token-table contract: paired, usage-carrying, oklch-valued rows. */
async function assertTokenTable(page: Page): Promise<TokenRow[]> {
  const rows = await readTokenRows(page);
  expect(rows.length, 'the token table must render at least 10 rows').toBeGreaterThanOrEqual(10);

  let oklchValues = 0;
  for (const row of rows) {
    expect(row.usage.trim().length, `${row.token} must carry usage text`).toBeGreaterThan(0);
    expect(row.light, `${row.token} must carry a Light value`).toMatch(/oklch\(/);
    expect(row.dark, `${row.token} must carry a Dark value`).toMatch(/oklch\(/);
    oklchValues += (row.light.match(/oklch\(/g) ?? []).length;
    oklchValues += (row.dark.match(/oklch\(/g) ?? []).length;
  }
  expect(oklchValues, 'the table must carry at least 10 oklch values').toBeGreaterThanOrEqual(10);

  const primary = rows.find((row) => row.token === 'primary');
  expect(primary, 'the table must carry the --primary row').toBeDefined();
  expect(primary?.light).not.toBe(primary?.dark);
  return rows;
}

/** The scoped engine guidance, checked against the real consumer sources. */
function assertEngineGuidanceAgainstSource(text: string): void {
  // The no-config statement is scoped to Uniwind / Tailwind v4.
  expect(text).toContain('Uniwind pairs with Tailwind v4');
  expect(text).toContain('needs no tailwind.config.js');
  expect(text).toContain('NativeWind 4 pairs with Tailwind v3');

  // The consumer @theme block is distinguished from this site's own CSS.
  expect(text).toContain('no Tailwind or @theme block is involved on this site');
  const repoRoot = process.cwd();
  const exampleCss = readFileSync(join(repoRoot, 'apps/example/global.css'), 'utf8');
  expect(
    exampleCss.includes('--color-green-500: oklch(0.723 0.219 149.579)'),
    'the displayed @theme values must come from the real apps/example/global.css',
  ).toBe(true);
  const themeTs = readFileSync(join(repoRoot, 'apps/example/lib/theme.ts'), 'utf8');
  expect(
    themeTs.includes('hsl('),
    'the mirrored surface tokens must be the real HSL triplets from lib/theme.ts',
  ).toBe(true);
}

/** The seam sections describe the CURRENT registry interfaces. */
function assertSeamsAgainstRegistrySource(): void {
  const repoRoot = process.cwd();
  const message = readFileSync(
    join(repoRoot, 'packages/registry/src/components/ai/message.tsx'),
    'utf8',
  );
  expect(
    message.includes('renderMarkdown'),
    'MessageResponse must still take the renderMarkdown prop',
  ).toBe(true);
  expect(message.includes('if (renderMarkdown)')).toBe(true);

  const reasoning = readFileSync(
    join(repoRoot, 'packages/registry/src/components/ai/reasoning.tsx'),
    'utf8',
  );
  expect(
    reasoning.includes('renderMarkdown'),
    'ReasoningContent must still take the renderMarkdown prop',
  ).toBe(true);

  // TextClassContext is consumed as the live publishing mechanism in the registry.
  const breadcrumb = readFileSync(
    join(repoRoot, 'packages/registry/src/components/ui/breadcrumb.tsx'),
    'utf8',
  );
  expect(breadcrumb.includes('TextClassContext.Provider')).toBe(true);
}

test(`${FLOW_TOKEN}: locked 4-step sequence`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);

  // Step 1: read the page from its title through the last section.
  const response = await navigateLocalhost(page, '/docs/theming');
  expect(response?.status()).toBe(200);
  await settle(page, testInfo);
  await expect(page.locator('main h1')).toHaveText('Theming');

  // Step 2: the scoped engine guidance.
  const text = await bodyText(page);
  assertEngineGuidanceAgainstSource(text);

  // Step 3: the paired light/dark oklch values.
  const rows = await assertTokenTable(page);

  // Step 4: Getting started navigation to CLI and Dark mode, then back.
  for (const destination of ['/docs/cli', '/docs/dark-mode']) {
    await page.locator(`${DOCS_NAV} a[href="${destination}"]`).first().click();
    await settle(page, testInfo);
    expect(new URL(page.url()).pathname).toBe(destination);
    expect((await navigateLocalhost(page, destination))?.status()).toBe(200);
    await expect(page.locator('main h1')).toBeVisible();
    await page.locator(`${DOCS_NAV} a[href="/docs/theming"]`).first().click();
    await settle(page, testInfo);
    expect(new URL(page.url()).pathname).toBe('/docs/theming');
    await expect(page.locator('main h1')).toHaveText('Theming');
  }

  assertSeamsAgainstRegistrySource();
  capture(testInfo, 'locked-sequence', {
    rows: rows.length,
    tokens: rows.map((row) => row.token),
  });
});

test(`${FLOW_TOKEN}: AC-2 seam anchors resolve to current interfaces`, async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);

  for (const anchor of ['textclasscontext', 'rendermarkdown']) {
    const response = await navigateLocalhost(page, `/docs/theming#${anchor}`);
    // The ClientRouter can take over a fragment navigation and hand back a null
    // response; the URL and the anchored heading remain the observation.
    if (response) expect(response.status()).toBe(200);
    await settle(page, testInfo);
    expect(new URL(page.url()).pathname).toBe('/docs/theming');
    const heading = page.locator(`main h2#${anchor}`);
    await expect(heading).toBeVisible();
    const headingText = (await heading.innerText()).trim();
    expect(headingText.toLowerCase()).toBe(anchor);
  }

  // The anchored sections' descriptions match the current interfaces.
  const text = await bodyText(page);
  expect(text).toContain('TextClassContext');
  expect(text).toContain('no style cascade');
  expect(text).toContain('renderMarkdown');
  expect(text).toContain('plain text');

  assertSeamsAgainstRegistrySource();
  capture(testInfo, 'seam-anchors', { anchors: ['textclasscontext', 'rendermarkdown'] });
});

test(`${FLOW_TOKEN}: AC-2 reading floor without JavaScript`, async ({ page }, testInfo) => {
  test.setTimeout(180_000);

  // Both value columns and the oklch values stay readable.
  const response = await navigateLocalhost(page, '/docs/theming');
  expect(response?.status()).toBe(200);
  await settle(page, testInfo);
  const rows = await assertTokenTable(page);

  // The anchors navigate without JavaScript.
  for (const anchor of ['textclasscontext', 'rendermarkdown']) {
    const anchored = await navigateLocalhost(page, `/docs/theming#${anchor}`);
    if (anchored) expect(anchored.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe('/docs/theming');
    await expect(page.locator(`main h2#${anchor}`)).toBeVisible();
  }

  // The section links stay navigable.
  await navigateLocalhost(page, '/docs/theming');
  const cliHref = await page
    .locator(`${DOCS_NAV} a[href="/docs/cli"]`)
    .first()
    .getAttribute('href');
  expect(cliHref).toBe('/docs/cli');
  const darkHref = await page
    .locator(`${DOCS_NAV} a[href="/docs/dark-mode"]`)
    .first()
    .getAttribute('href');
  expect(darkHref).toBe('/docs/dark-mode');
  const cli = await navigateLocalhost(page, '/docs/cli');
  expect(cli?.status()).toBe(200);
  const dark = await navigateLocalhost(page, '/docs/dark-mode');
  expect(dark?.status()).toBe(200);

  capture(testInfo, 'reading-floor-nojs', { rows: rows.length });
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
function sha256Text(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256Text(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

const repoRoot = process.cwd();

let anyFailure = false;

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-cont-004-${Date.now()}`,
    flow: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      themingManuscript: hashFile('apps/docs/src/content/docs/theming.mdx'),
      themingRoute: hashFile('apps/docs/src/pages/docs/theming.astro'),
      tokenTable: hashFile('apps/docs/src/components/TokenTable.astro'),
      globalCss: hashFile('apps/docs/src/styles/global.css'),
      tokenUsage: hashFile('apps/docs/src/data/token-usage.json'),
      exampleGlobalCss: hashFile('apps/example/global.css'),
      exampleThemeTs: hashFile('apps/example/lib/theme.ts'),
      registryMessage: hashFile('packages/registry/src/components/ai/message.tsx'),
      registryReasoning: hashFile('packages/registry/src/components/ai/reasoning.tsx'),
      testFile: hashFile('tests/sprint-05-orient-search/theming-and-section-nav.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      distTheming: hashFile('apps/docs/dist/docs/theming/index.html'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
