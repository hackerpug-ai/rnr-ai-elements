import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { grantClipboardPermissions, navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * SHELL-007 — the hero fold proofs (non-primary rendered references for
 * AC-4/TC-4/TC-5), authored here because the lane's testDir is still pinned to
 * sprint-01 (SHELL-011 widens it and registers this spec file).
 *
 * FLOW-GEND-01 (geometry): in a 1440x900 viewport every hero region —
 * statement, counters row, install block, both CTAs — lies fully inside the
 * first 900px with the sticky header in flow above, counters equal the
 * run-time-computed expectations, and both CTA targets return 200.
 * FLOW-GEND-02 (engine-following): clicking the uniwind tab re-scopes the
 * active panel, one copy click yields the exact uniwind command, and the
 * persisted rnr-engine survives a cold reload keeping uniwind active.
 *
 * The viewport override comes from an explicit browser.newContext, so the
 * geometry proof is independent of which project runs the file. Expected
 * values are computed from the REAL artifacts at run time — never hand-copied
 * literals. Helpers are duplicated from home.spec.ts on purpose (same
 * precedent as island-budget.test.ts): importing a sibling spec would
 * double-register its tests.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const HERO = 'main.hero';
const ACTIVE_PANEL = `${HERO} div[role=tabpanel]:not([hidden])`;
const ACTIVE_CODE = `${ACTIVE_PANEL} rnr-copy-button code`;
const ACTIVE_TRIGGER = `${ACTIVE_PANEL} rnr-copy-button button`;

const ENGINE_COMMANDS = {
  nativewind:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json',
  uniwind:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json',
} as const;

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

test('FLOW-GEND-01-home-hero-evaluation-contract fold: every hero box inside the first 900px at 1440x900, computed counters, 200 CTAs', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);

  const hero = page.locator(HERO);
  for (const [name, value] of Object.entries(expectedCounters())) {
    expect(await hero.locator(`[data-counter="${name}"]`).textContent(), `counter ${name}`).toBe(
      value,
    );
  }

  // Geometric fold proof: bounding boxes are viewport-relative, so the sticky
  // header (in flow above the hero at var(--layout-header-h)) is accounted
  // for by construction. Failure here is geometry, not selectors.
  const getStarted = hero.getByRole('link', { name: 'Get started' });
  const browse = hero.getByRole('link', { name: 'Browse components' });
  const regions: [string, ReturnType<typeof hero.locator>][] = [
    ['statement heading', hero.locator('h1')],
    ['statement paragraph', hero.locator('.hero__statement')],
    ['counters row', hero.locator('.hero__chips')],
    ['install block', hero.locator('.hero__install')],
    ['Get started CTA', getStarted],
    ['Browse components CTA', browse],
  ];
  for (const [label, region] of regions) {
    const box = await region.boundingBox();
    if (box === null) {
      throw new Error(`${label}: no box to measure — selector failure, not geometry`);
    }
    expect(box.y + box.height, `${label}: bottom edge must stay inside 900px`).toBeLessThanOrEqual(
      900,
    );
  }

  expect((await page.request.get(new URL('/registry', PREVIEW_URL).href)).status()).toBe(200);
  expect((await page.request.get(new URL('/components', PREVIEW_URL).href)).status()).toBe(200);

  await testInfo.attach('flow-gend-01-hero-fold-1440x900', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await context.close();
});

test('FLOW-GEND-02-hero-install-command-copy engine-following: uniwind copy exact + rnr-engine persistence across a cold reload', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'tab interaction and clipboard assertions need a JS-enabled project',
  );

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/');
  expect(response?.status()).toBe(200);

  const activeCode = page.locator(ACTIVE_CODE);
  await expect(activeCode).toHaveCount(1);
  await expect(activeCode).toHaveText(ENGINE_COMMANDS.nativewind); // served default

  // Follow the engine: the active-panel scope moves with the selection.
  await page.locator(`${HERO} [role="tab"][data-engine="uniwind"]`).click();
  const displayed = (await activeCode.textContent())?.trim();
  expect(displayed).toBe(ENGINE_COMMANDS.uniwind);

  await page.locator(ACTIVE_TRIGGER).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(displayed); // copy source is the displayed panel text
  expect(clipboard).toBe(ENGINE_COMMANDS.uniwind); // exact equality — no newline/wrap artifact
  expect(clipboard).toMatch(COMMAND_PATTERN);

  // Persistence: rnr-engine=uniwind survives a cold reload (full goto, not a
  // soft navigation) keeping the uniwind tab active.
  await navigateLocalhost(page, '/');
  await expect(page.locator(`${HERO} [role="tab"][data-engine="uniwind"]`)).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(activeCode).toHaveText(ENGINE_COMMANDS.uniwind);

  await testInfo.attach('flow-gend-02-engine-following', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await context.close();
});
