import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * SHELL-011 — the sprint-02 hero lane, registered by widening the turnkey
 * FUSE-10 runner's testDir to tests/ (both lanes serialize under workers:1).
 *
 * FLOW-GEND-01 (one-screen evaluation contract): at a per-test 1440x900
 * viewport every hero region — statement, NOT-an-npm-package phrase, counters
 * row, tabbed install block, both CTAs — lies fully inside the first 900px
 * (y >= 0 and y + height <= 900), the counters equal run-time-computed
 * expectations, and both CTA targets return 200.
 * FLOW-GEND-02 (engine-following copy): one copy click yields the exact
 * ACTIVE-panel command (default and uniwind tabs), success shows by value
 * within 500 ms, engine state never reaches the URL, the persisted
 * rnr-engine survives a cold reload (click-path and pre-seeded), and zero
 * JS keeps BOTH engine commands selectable.
 *
 * Expected values are computed from the REAL artifacts at run time — never
 * hand-copied literals — so a fixture edit moves the expectation with it.
 * The viewport override comes from an explicit browser.newContext, so the
 * geometry proof is independent of which project runs the file. Helpers are
 * duplicated from home.spec.ts on purpose (same precedent as
 * island-budget.test.ts): importing a sibling spec would double-register
 * its tests.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

// Evidence JSON per flow, under the sprint's e2e-evidence directory.
const EVIDENCE_DIR = join(process.cwd(), '.tmp/sprint-02-shell-hero/e2e-evidence');

function writeEvidence(flow: string, observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, `${flow}.json`),
    JSON.stringify({ flow, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

const HERO = 'main.hero';
const ACTIVE_PANEL = `${HERO} div[role=tabpanel]:not([hidden])`;
const ACTIVE_CODE = `${ACTIVE_PANEL} rnr-copy-button code`;
const ACTIVE_TRIGGER = `${ACTIVE_PANEL} rnr-copy-button button`;
const UNIWIND_TAB = `${HERO} [role="tab"][data-engine="uniwind"]`;
const NATIVEWIND_TAB = `${HERO} [role="tab"][data-engine="nativewind"]`;

const ENGINE_COMMANDS = {
  nativewind:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json',
  uniwind:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json',
} as const;

// Boundary contract regex (FUSE-06/FUSE-08): absolute-URL nativewind/uniwind form.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

/** Same ENOENT-bridging read as home.spec.ts: the deliv-03 lane rmSyncs src/data mid-run. */
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

/** Counters re-derived from the real artifacts so a fixture edit moves the expectation. */
function expectedCounters(): Record<'version' | 'total' | 'components' | 'ui' | 'libs', string> {
  const version = (
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      version: string;
    }
  ).version;
  const items = readGeneratedDataset();
  return {
    version,
    total: String(items.length),
    components: String(items.filter((item) => item.type === 'registry:component').length),
    ui: String(items.filter((item) => item.type === 'registry:ui').length),
    libs: String(items.filter((item) => item.type === 'registry:lib').length),
  };
}

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

test('FLOW-GEND-01-home-hero-evaluation-contract: one-screen 1440x900 fold — statement, NOT-an-npm-package, computed counters, tabbed install, 200 CTAs', async ({
  browser,
}, testInfo) => {
  const expected = expectedCounters();

  // Per-test viewport override (never a new project): every project runs this
  // geometry proof at the contracted 1440x900 evaluation surface.
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);

  // The hero states what the library is and is not.
  const hero = page.locator(HERO);
  await expect(hero).toContainText('Universal AI chat and agent UI components for React Native');
  await expect(hero).toContainText('copy-paste registry');
  await expect(hero).toContainText('NOT an npm package');

  // Counters live inside the hero tree and equal the computed values — a
  // detached hardcoded literal (e.g. a stale `56`) fails here.
  const observedCounters: Record<string, string> = {};
  for (const [name, value] of Object.entries(expected)) {
    const text = await hero.locator(`[data-counter="${name}"]`).textContent();
    expect(text, `counter ${name}`).toBe(value);
    observedCounters[name] = text ?? '';
  }

  // Geometric fold proof: EVERY hero element's bounding box (viewport-relative,
  // so the sticky header in flow above is accounted for by construction) sits
  // fully inside 0..900 — no hero region may require scrolling. A null box is a
  // display:none subtree (no geometry to overflow), not a selector failure.
  let maxBottom = 0;
  let minTop = Number.POSITIVE_INFINITY;
  let measured = 0;
  let index = 0;
  for (const element of await hero.locator('*').all()) {
    const box = await element.boundingBox();
    if (box === null) continue; // display:none subtree — no geometry to overflow
    expect(box.y, `hero element #${index} top must stay >= 0`).toBeGreaterThanOrEqual(0);
    expect(
      box.y + box.height,
      `hero element #${index} bottom edge must stay inside 900px`,
    ).toBeLessThanOrEqual(900);
    measured += 1;
    minTop = Math.min(minTop, box.y);
    maxBottom = Math.max(maxBottom, box.y + box.height);
    index += 1;
  }
  expect(measured, 'the hero tree must expose measurable geometry').toBeGreaterThan(0);

  // Tabbed install is part of the one-screen contract: both engine panels are
  // served and exactly one is active.
  await expect(page.locator(`${HERO} div[role=tabpanel][data-engine]`)).toHaveCount(2);
  await expect(page.locator(ACTIVE_CODE)).toHaveCount(1);

  // Both CTA targets are real routes.
  const getStarted = hero.getByRole('link', { name: 'Get started' });
  const browse = hero.getByRole('link', { name: 'Browse components' });
  await expect(getStarted).toHaveAttribute('href', '/registry');
  await expect(browse).toHaveAttribute('href', '/components');
  const registryStatus = (await page.request.get(new URL('/registry', PREVIEW_URL).href)).status();
  const componentsStatus = (
    await page.request.get(new URL('/components', PREVIEW_URL).href)
  ).status();
  expect(registryStatus).toBe(200);
  expect(componentsStatus).toBe(200);

  await testInfo.attach('flow-gend-01-hero-fold-1440x900', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-01-home-hero-evaluation-contract', {
    viewport: '1440x900',
    counters: observedCounters,
    heroElementsMeasured: measured,
    heroTopPx: minTop,
    heroBottomPx: maxBottom,
    ctaTargets: { '/registry': registryStatus, '/components': componentsStatus },
  });
  await context.close();
});

test('FLOW-GEND-02-hero-install-command-copy: default-tab copy is the exact displayed command, success within 500 ms, URL stays clean', async ({
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
  await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');

  // Served default tab: the active panel carries the nativewind command, and
  // the active-panel scope keeps the read single-match while BOTH panels stay
  // in the served DOM.
  const activeCode = page.locator(ACTIVE_CODE);
  await expect(activeCode).toHaveCount(1);
  const displayed = (await activeCode.textContent())?.trim();
  expect(displayed).toBe(ENGINE_COMMANDS.nativewind);

  const trigger = page.locator(ACTIVE_TRIGGER);
  await trigger.click();

  // Success shows by VALUE within 500 ms of the click — never a class name.
  await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });

  // The copy source is the displayed text itself, so clipboard and display
  // cannot drift (the hardcoded-echo negative control). Exact equality catches
  // any trailing newline/wrap artifact.
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(displayed);
  expect(clipboard).toBe(ENGINE_COMMANDS.nativewind);
  expect(clipboard).toMatch(COMMAND_PATTERN);

  // The copy never mutates the URL: no query, no hash, no engine state.
  expect(page.url()).toBe('http://localhost:4321/');

  await testInfo.attach('flow-gend-02-default-tab-copy', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-02-default-tab-copy', {
    displayed,
    clipboard,
    triggerState: await trigger.getAttribute('data-state'),
    url: page.url(),
  });
  await context.close();
});

test('FLOW-GEND-02-hero-install-command-copy: uniwind tab copy + rnr-engine persistence across a cold reload (click-path and pre-seeded)', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'tab interaction and clipboard assertions need a JS-enabled project',
  );

  // Path A — follow the engine by clicking: the active-panel scope moves with
  // the selection and the copy is the NEW active command.
  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);
  await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');

  await expect(page.locator(`${HERO} div[role=tabpanel][data-engine]`)).toHaveCount(2);
  await page.locator(UNIWIND_TAB).click();

  const activeCode = page.locator(ACTIVE_CODE);
  await expect(activeCode).toHaveCount(1);
  const displayed = (await activeCode.textContent())?.trim();
  expect(displayed, 'the displayed active-panel engine segment moved to uniwind').toBe(
    ENGINE_COMMANDS.uniwind,
  );

  await page.locator(ACTIVE_TRIGGER).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(displayed); // copy source is the displayed panel text
  expect(clipboard).toBe(ENGINE_COMMANDS.uniwind); // exact — no newline/wrap artifact
  expect(clipboard).toMatch(COMMAND_PATTERN);
  expect(page.url(), 'engine state never reaches the URL').toBe('http://localhost:4321/');

  // Persistence via the click: a COLD reload (full goto, not soft navigation)
  // keeps the uniwind tab active and its command displayed.
  await navigateLocalhost(page, '/');
  await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
  await expect(page.locator(UNIWIND_TAB)).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator(NATIVEWIND_TAB)).toHaveAttribute('aria-selected', 'false');
  await expect(activeCode).toHaveText(ENGINE_COMMANDS.uniwind);

  await testInfo.attach('flow-gend-02-uniwind-click-persistence', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await context.close();

  // Path B — pre-seeded persistence (uniwind_persisted_context): the storage
  // write runs BEFORE any page script (addInitScript), so the island's first
  // activation reads uniwind as the persisted engine with zero interaction.
  const seeded = await browser.newContext();
  await grantClipboardPermissions(seeded);
  await seeded.addInitScript(() => {
    // Browser-context callback, typed through globalThis: this repo's tsconfig
    // carries no DOM lib (it is a React Native workspace).
    (
      globalThis as unknown as {
        localStorage: { setItem(key: string, value: string): void };
      }
    ).localStorage.setItem('rnr-engine', 'uniwind');
  });
  const seededPage = await seeded.newPage();
  const seededResponse = await navigateLocalhost(seededPage, '/');
  expect(seededResponse?.status()).toBe(200);
  await waitForAstroPageLoad(seededPage, '__rnrTabGroupRegistered');

  // FIRST read, no interaction: uniwind is selected, nativewind is not —
  // persistence broken would show nativewind aria-selected="true" here.
  await expect(seededPage.locator(UNIWIND_TAB)).toHaveAttribute('aria-selected', 'true');
  await expect(seededPage.locator(NATIVEWIND_TAB)).toHaveAttribute('aria-selected', 'false');
  const seededCode = seededPage.locator(ACTIVE_CODE);
  await expect(seededCode).toHaveText(ENGINE_COMMANDS.uniwind);

  await seededPage.locator(ACTIVE_TRIGGER).click();
  const seededClipboard = await seededPage.evaluate(() => navigator.clipboard.readText());
  expect(seededClipboard).toBe(ENGINE_COMMANDS.uniwind);
  expect(seededClipboard).toMatch(COMMAND_PATTERN);
  expect(seededPage.url(), 'engine state never reaches the URL').toBe('http://localhost:4321/');

  await testInfo.attach('flow-gend-02-uniwind-preseeded', {
    body: await seededPage.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-02-hero-install-command-copy', {
    clickPathClipboard: clipboard,
    preSeededClipboard: seededClipboard,
    persistedTab: 'uniwind',
    url: seededPage.url(),
  });
  await seeded.close();
});

test('FLOW-GEND-02-hero-install-command-copy zero-JS: BOTH engine commands selectable on 200', async ({
  browser,
}) => {
  // Unguarded on purpose: under the chromium-nojs project this doubles as the
  // project-level proof that the hero commands are never gated behind JS. The
  // explicit no-JS context keeps the stacked-panels observable identical in
  // every project (TabGroup's :not(:defined) fallback un-hides both panels).
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await navigateLocalhost(noJsPage, '/');
  expect(response?.status()).toBe(200);
  const selectable: string[] = [];
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panelCode = noJsPage.locator(`${HERO} div[role=tabpanel][data-engine="${engine}"] code`);
    await expect(panelCode).toHaveCount(1);
    await expect(panelCode).toBeVisible();
    const text = (await panelCode.textContent())?.trim() ?? '';
    expect(text).toBe(ENGINE_COMMANDS[engine]);
    selectable.push(text);
  }
  writeEvidence('FLOW-GEND-02-zero-js', {
    status: response?.status(),
    selectableCommands: selectable,
  });
  await noJsContext.close();
});
