import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { grantClipboardPermissions, navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FLOW-GEND-02-hero-install-command-copy — AC-1 for FUSE-09 (CopyButton island).
 *
 * Verifies the copy island against the REAL built site served by the FUSE-10
 * runner (`pnpm e2e:docs`: ordered build chain, then astro preview over dist).
 *
 * The landed config runs every spec under chromium-desktop, chromium-mobile
 * AND chromium-nojs projects. The clipboard observable needs a JS-enabled
 * page, so the click test skips on JS-disabled projects; the zero-JS fallback
 * (200 + selectable full command text) stays as its own UNGUARDED test so the
 * nojs project genuinely proves it.
 *
 * Case 1 asserts clipboard CONTENT — never a success class — plus a visible
 * success state within 500 ms. Localhost is a secure context, so
 * navigator.clipboard works once permissions are granted.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const PAGE_URL = 'http://localhost:4321/islands/copy-button';
const CODE = 'rnr-copy-button code';
const TRIGGER = 'rnr-copy-button button';

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

test('FLOW-GEND-02-hero-install-command-copy', async ({ browser }, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS fallback has its own unguarded test',
  );

  // CASE 1 — one click puts the exact displayed command on the clipboard.
  const jsContext = await browser.newContext();
  await jsContext.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await jsContext.newPage();
  await page.goto(PAGE_URL);

  // The copy source is the displayed text itself, so it cannot drift from it.
  const displayed = (await page.locator(CODE).textContent())?.trim();
  expect(displayed).toBe(COMMAND);

  const trigger = page.locator(TRIGGER);
  await trigger.click();

  // Visible success state within 500 ms of the click (by value, not class name).
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
  await expect(trigger).toBeVisible();

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(COMMAND); // exact equality — catches trailing newline

  await testInfo.attach('copy-button-success', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await jsContext.close();
});

test('FLOW-GEND-02 zero-JS fallback serves 200 with the full command selectable', async ({
  browser,
}) => {
  // CASE 2 — javaScriptEnabled:false still shows the full command, selectable.
  // Unguarded on purpose: under the chromium-nojs project this doubles as the
  // project-level proof that nothing gates the command behind JS.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await noJsPage.goto(PAGE_URL);
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});

/*
 * FUSE-08 — the structural home block on /, below FUSE-09's landed island
 * proofs in this shared spec file (FUSE-09's gates grep this file too, so its
 * tests above stay untouched).
 *
 * FLOW-GEND-01: the hero states what the library is and is not, carries
 * build-computed counters (root package.json version + registry-items.json
 * type counts), and both CTAs resolve 200.
 * FLOW-GEND-02: the hero install command copies exactly and renders
 * selectable with zero JS (the sprint-01 nativewind subset).
 *
 * Expected values are computed from the REAL artifacts at run time — never
 * hand-copied literals — so a fixture edit moves the expectation with it.
 * Every home observable except the clipboard is server-rendered: FLOW-GEND-01
 * and the zero-JS case stay UNGUARDED so the chromium-nojs project proves
 * them; only the click test skips on JS-disabled projects.
 */

/**
 * Read the generated artifact, bridging a short window if it is transiently
 * absent: the lane's deliv-03 spec rmSyncs src/data WHOLESALE mid-run and its
 * registry-items.json only returns after its prebuild leg, so a module-scope
 * read must retry ENOENT, not fail the whole file. Same bounded pattern as
 * ledger.spec.ts / component-page.spec.ts.
 */
function readGeneratedDataset(): { type: string }[] {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      return JSON.parse(
        readFileSync(join(process.cwd(), 'apps/docs/src/data/registry-items.json'), 'utf8'),
      ) as { type: string }[];
    } catch (error) {
      const retryable = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!retryable || Date.now() > deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

// Build-time sources of truth, re-read in the spec: the rendered counters must
// equal these computed values, so hardcoding them on the page fails here.
function expectedCounters(): {
  version: string;
  total: number;
  ui: number;
  lib: number;
  component: number;
} {
  const version = (
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      version: string;
    }
  ).version;
  const items = readGeneratedDataset();
  return {
    version,
    total: items.length,
    component: items.filter((item) => item.type === 'registry:component').length,
    ui: items.filter((item) => item.type === 'registry:ui').length,
    lib: items.filter((item) => item.type === 'registry:lib').length,
  };
}

// Boundary contract regex (FUSE-06/FUSE-08): absolute-URL nativewind/uniwind form.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

const HERO = 'main.hero';
const HERO_COPY_CODE = 'main.hero rnr-copy-button code';
const HERO_COPY_TRIGGER = 'main.hero rnr-copy-button button';

// Optional screenshot evidence sink (RED/GREEN gate evidence under .tmp/).
const evidenceDir = process.env.FUSE08_EVIDENCE_DIR ?? null;
function evidenceShot(name: string): { path: string } | undefined {
  return evidenceDir ? { path: join(evidenceDir, name) } : undefined;
}

test('FLOW-GEND-01-home-hero-evaluation-contract: statement, NOT-an-npm-package, computed counters, resolving CTAs', async ({
  page,
}, testInfo) => {
  const expected = expectedCounters();

  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);

  const hero = page.locator(HERO);
  await expect(hero).toContainText('Universal AI chat and agent UI components for React Native');
  await expect(hero).toContainText('copy-paste registry');
  await expect(hero).toContainText('NOT an npm package');

  // Counters live inside the same hero element tree and equal the computed
  // values — a detached hardcoded literal (e.g. a stale `56`) fails here.
  const counterText = async (name: string): Promise<string | null> =>
    hero.locator(`[data-counter="${name}"]`).textContent();
  expect(await counterText('version')).toBe(expected.version);
  expect(await counterText('total')).toBe(String(expected.total));
  expect(await counterText('components')).toBe(String(expected.component));
  expect(await counterText('ui')).toBe(String(expected.ui));
  expect(await counterText('libs')).toBe(String(expected.lib));

  const getStarted = hero.getByRole('link', { name: 'Get started' });
  const browse = hero.getByRole('link', { name: 'Browse components' });
  await expect(getStarted).toHaveAttribute('href', '/registry');
  await expect(browse).toHaveAttribute('href', '/components');
  expect((await page.request.get(new URL('/registry', PREVIEW_URL).href)).status()).toBe(200);
  expect((await page.request.get(new URL('/components', PREVIEW_URL).href)).status()).toBe(200);

  const body = await page.screenshot({
    ...evidenceShot('flow-gend-01-home-hero.png'),
    fullPage: true,
  });
  await testInfo.attach('flow-gend-01-home-hero', { body, contentType: 'image/png' });
});

test('FLOW-GEND-02-hero-install-command-copy: one hero click yields the exact nativewind command', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS fallback has its own unguarded test',
  );

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);

  // The copy source is the displayed text itself, so clipboard and display
  // cannot drift apart (the hardcoded-echo negative control).
  const displayed = (await page.locator(HERO_COPY_CODE).textContent())?.trim();
  expect(displayed).toBe(COMMAND);

  await page.locator(HERO_COPY_TRIGGER).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(COMMAND); // exact equality — catches trailing newline
  expect(clipboard).toMatch(COMMAND_PATTERN);

  const body = await page.screenshot(evidenceShot('flow-gend-02-hero-copy.png'));
  await testInfo.attach('flow-gend-02-hero-copy', { body, contentType: 'image/png' });
  await context.close();
});

test('FLOW-GEND-02-hero-install-command-copy zero-JS: / renders the full command selectable on 200', async ({
  browser,
}) => {
  // Unguarded on purpose: under the chromium-nojs project this doubles as the
  // project-level proof that the hero command is never gated behind JS.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await navigateLocalhost(noJsPage, '/');
  expect(response?.status()).toBe(200);
  expect((await noJsPage.locator(HERO_COPY_CODE).textContent())?.trim()).toBe(COMMAND);
  await noJsContext.close();
});
