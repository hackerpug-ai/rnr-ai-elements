/**
 * ORI-AST-002 — keep engine choices synchronized through prose and Astro
 * navigation.
 *
 * Five real-browser AC tests over the built docs preview on localhost:4321,
 * plus an OS-derived scratch Astro consumer for the generic-tab contract.
 * Nothing is mocked: engine selections drive the real `<rnr-tab-group>` island,
 * storage is the browser's actual localStorage (or a genuine Chromium-level
 * denial via `--disable-local-storage`), soft navigation follows real links
 * through the shared ClientRouter, the clipboard is the real navigator.clipboard
 * API in a JavaScript-enabled context, and raw HTTP bodies are read through
 * Playwright's request API before any client execution.
 *
 * Each test maps to one AC and is greppable by name (VERIFY --grep). Evidence
 * is written to the owned `.tmp/ORI-AST-002` scratch; the committed
 * manifest.json is authored separately from the observed values below.
 */

import { spawn, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect, type Page, test } from '@playwright/test';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

// The root tsconfig carries no DOM lib; the one browser global the in-page
// clipboard read needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS_DIR = join(REPO_ROOT, 'apps', 'docs');
const ASTRO_BIN = join(DOCS_DIR, 'node_modules', '.bin', 'astro');

/** The locked install-command shape (InstallCommand.astro). */
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, item: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${item}.json`;

/** A browser-DOM element facade — this repo's tsconfig has no DOM lib. */
interface DomEl {
  id: string;
  hidden: boolean;
  tabIndex: number;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  setAttribute(name: string, value: string): void;
  focus(): void;
  dataset: { engine?: string };
  querySelectorAll(selector: string): ArrayLike<DomEl>;
  classList: { contains(name: string): boolean };
}

interface GroupState {
  persistent: string | null;
  selected: (string | null)[];
  visible: (string | null)[];
  tabIds: string[];
  panelIds: string[];
  ownershipOk: boolean;
}

interface PageState {
  rootEngine: string | null;
  light: boolean;
  dark: boolean;
  rnrEngine: string | null;
  rnrTheme: string | null;
  url: string;
  groups: GroupState[];
}

interface FirstPaint {
  engine: string | null;
  light: boolean;
  dark: boolean;
}

/** Read the settled engine/theme/group state through the real DOM. */
function readState(page: Page): Promise<PageState> {
  return page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        documentElement: DomEl;
        querySelectorAll(selector: string): ArrayLike<DomEl>;
      };
      localStorage: { getItem(key: string): string | null };
      location: { pathname: string };
    };
    const root = g.document.documentElement;
    const groups = Array.from(g.document.querySelectorAll('main rnr-tab-group')).map((group) => {
      const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
      const panels = Array.from(group.querySelectorAll('[role="tabpanel"]'));
      const panelIds = new Set(panels.map((panel) => panel.id));
      return {
        persistent: group.getAttribute('data-persistent'),
        selected: tabs
          .filter((tab) => tab.getAttribute('aria-selected') === 'true')
          .map((tab) => tab.getAttribute('data-engine')),
        visible: panels
          .filter((panel) => !panel.hasAttribute('hidden'))
          .map((panel) => panel.getAttribute('data-engine')),
        tabIds: tabs.map((tab) => tab.id),
        panelIds: panels.map((panel) => panel.id),
        ownershipOk: tabs.every((tab) => panelIds.has(tab.getAttribute('aria-controls') ?? '')),
      };
    });
    // Storage may be genuinely denied (--disable-local-storage): reading the
    // property itself throws, so resolve the persisted values defensively.
    let rnrEngine: string | null = null;
    let rnrTheme: string | null = null;
    try {
      rnrEngine = g.localStorage.getItem('rnr-engine');
      rnrTheme = g.localStorage.getItem('rnr-theme');
    } catch {
      /* storage denied */
    }
    return {
      rootEngine: root.getAttribute('data-engine'),
      light: root.classList.contains('light'),
      dark: root.classList.contains('dark'),
      rnrEngine,
      rnrTheme,
      url: g.location.pathname,
      groups,
    };
  });
}

/** Capture the root engine/theme at the moment the pre-paint inline script
 * first sets data-engine (a MutationObserver records the first non-null value
 * during parse, before the deferred island scripts run). */
function captureFirstPaint(page: Page): void {
  void page.addInitScript(() => {
    const g = globalThis as unknown as {
      document: { documentElement: DomEl | null };
      MutationObserver: new (
        callback: () => void,
      ) => { observe(target: unknown, options: unknown): void };
    };
    const holder = globalThis as unknown as { __rnrFirstPaint: FirstPaint };
    const state: FirstPaint = { engine: null, light: false, dark: false };
    holder.__rnrFirstPaint = state;
    const capture = (): void => {
      const root = g.document.documentElement;
      if (!root) return;
      const engine = root.getAttribute('data-engine');
      if (state.engine === null && engine !== null) {
        state.engine = engine;
        state.light = root.classList.contains('light');
        state.dark = root.classList.contains('dark');
      }
    };
    // Observe the Document node (subtree: true) so the html element's
    // data-engine attribute change is caught — documentElement is null before
    // parsing begins, so it cannot be observed directly.
    new g.MutationObserver(capture).observe(g.document, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-engine'],
    });
  });
}

async function readFirstPaint(page: Page): Promise<FirstPaint> {
  return page.evaluate(
    () =>
      (globalThis as unknown as { __rnrFirstPaint: FirstPaint }).__rnrFirstPaint ?? {
        engine: null,
        light: false,
        dark: false,
      },
  );
}

/** The install section's tab group + its uniwind/nativewind tab. */
const INSTALL_GROUP = 'main > section[data-section="install"] rnr-tab-group';
const DEPENDENCIES_GROUP = 'main > section[data-section="dependencies"] rnr-tab-group';

// ---------------------------------------------------------------------------
// AC-1: synchronize engine groups and keyboard relationships
// ---------------------------------------------------------------------------
test('ORI-AST-002-AC-1', async ({ browser }) => {
  test.setTimeout(120_000);
  const soft = expect.soft;

  // Explicit JavaScript-enabled context so the identical path runs under the
  // chromium-nojs project too (interaction is JS-only).
  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/components/message');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );

  // Two engine groups on the message page: Install + Dependencies.
  soft(await page.locator('main rnr-tab-group').count(), 'two engine groups').toBe(2);

  // Fresh context: nativewind selected, root resolves to nativewind.
  let state = await readState(page);
  soft(state.rootEngine, 'fresh root data-engine is nativewind').toBe('nativewind');
  for (const group of state.groups) {
    soft(group.selected, 'fresh selection is nativewind').toEqual(['nativewind']);
    soft(group.visible, 'exactly one visible panel').toEqual(['nativewind']);
  }

  // 8 tab/panel IDs, all unique, every aria link resolves in its owning group.
  const idCount = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { querySelectorAll(s: string): ArrayLike<DomEl> };
    };
    const ids = Array.from(
      g.document.querySelectorAll('main [role="tab"], main [role="tabpanel"]'),
    ).map((el) => el.id);
    return ids.length;
  });
  soft(idCount, '8 tab/panel elements').toBe(8);
  const uniqueIds = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { querySelectorAll(s: string): ArrayLike<DomEl> };
    };
    const ids = Array.from(
      g.document.querySelectorAll('main [role="tab"], main [role="tabpanel"]'),
    ).map((el) => el.id);
    return new Set(ids).size;
  });
  soft(uniqueIds, 'all 8 IDs are unique').toBe(8);

  // Click uniwind in Dependencies: both groups, storage, and root agree.
  await page.locator(`${DEPENDENCIES_GROUP} [role="tab"][data-engine="uniwind"]`).click();
  state = await readState(page);
  soft(state.rootEngine, 'root data-engine is uniwind after Dependencies click').toBe('uniwind');
  soft(state.rnrEngine, 'rnr-engine storage is uniwind').toBe('uniwind');
  for (const group of state.groups) {
    soft(group.selected, 'both groups select uniwind').toEqual(['uniwind']);
    soft(group.visible, 'both groups show uniwind').toEqual(['uniwind']);
    soft(group.ownershipOk, 'aria-controls stays in its owning group').toBe(true);
  }
  soft(state.url, 'engine state never enters the URL').toBe('/components/message');

  // Install shows the uniwind command; dependencies match the uniwind tree.
  const installText = await page
    .locator(`${INSTALL_GROUP} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button code`)
    .textContent();
  soft(installText, 'Install shows the uniwind message command').toBe(
    commandFor('uniwind', 'message'),
  );
  const depUrls = await page
    .locator(
      `${DEPENDENCIES_GROUP} [role="tabpanel"][data-engine="uniwind"] [data-engine-urls="uniwind"] code`,
    )
    .allTextContents();
  soft(depUrls.length, 'uniwind dependency URLs render').toBeGreaterThan(0);
  for (const url of depUrls) {
    soft(url.includes('/uniwind/'), `dependency URL matches the uniwind tree: ${url}`).toBe(true);
  }

  // Keyboard: focus the later group's selected tab, ArrowRight wraps to
  // nativewind, ArrowLeft returns to uniwind — synchronized across groups.
  await page.locator(`${DEPENDENCIES_GROUP} [role="tab"][data-engine="uniwind"]`).focus();
  await page.keyboard.press('ArrowRight');
  state = await readState(page);
  for (const group of state.groups) {
    soft(group.selected, 'ArrowRight selects nativewind in both groups').toEqual(['nativewind']);
  }
  soft(state.rootEngine, 'root data-engine is nativewind after ArrowRight').toBe('nativewind');
  soft(state.rnrEngine, 'storage is nativewind after ArrowRight').toBe('nativewind');

  await page.keyboard.press('ArrowLeft');
  state = await readState(page);
  for (const group of state.groups) {
    soft(group.selected, 'ArrowLeft restores uniwind in both groups').toEqual(['uniwind']);
  }
  soft(state.rootEngine, 'root data-engine is uniwind after ArrowLeft').toBe('uniwind');
  // Keyboard focus follows the selected tab (one tabindex=0 per group, the
  // selected one).
  const focusState = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { querySelectorAll(s: string): ArrayLike<DomEl> };
    };
    return Array.from(g.document.querySelectorAll('main rnr-tab-group')).map((group) => {
      const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
      return {
        roving: tabs
          .filter((tab) => tab.tabIndex === 0)
          .map((tab) => tab.getAttribute('data-engine')),
        focused: group.querySelectorAll('[role="tab"]:focus').length,
      };
    });
  });
  for (const focus of focusState) {
    soft(focus.roving, 'exactly one tabindex=0 per group').toEqual(['uniwind']);
  }
  soft(state.url, 'URL still /components/message after keyboard navigation').toBe(
    '/components/message',
  );
  await context.close();
});

// ---------------------------------------------------------------------------
// AC-2: resolve storage inputs before paint and recover from denial
// ---------------------------------------------------------------------------
test('ORI-AST-002-AC-2', async ({ browser }) => {
  test.setTimeout(180_000);
  const soft = expect.soft;

  // Case persisted_inputs: valid values earned by UI selection, hard-loaded,
  // first-paint captured before the island upgrades.
  const context = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
  const page = await context.newPage();
  captureFirstPaint(page);

  // Select uniwind on the real home install tab, then hard-load the message page.
  await navigateLocalhost(page, '/');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  await page
    .locator('main .hero__install rnr-tab-group [role="tab"][data-engine="uniwind"]')
    .click();

  await navigateLocalhost(page, '/components/message');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  let firstPaint = await readFirstPaint(page);
  soft(firstPaint.engine, 'persisted uniwind resolves root data-engine before first paint').toBe(
    'uniwind',
  );
  const state = await readState(page);
  soft(state.rootEngine, 'root data-engine is uniwind after hard load').toBe('uniwind');
  for (const group of state.groups) {
    soft(group.selected, 'settled panels select uniwind').toEqual(['uniwind']);
    soft(group.visible, 'exactly one readable panel').toHaveLength(1);
  }

  // Repeat for nativewind.
  await navigateLocalhost(page, '/');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  await page
    .locator('main .hero__install rnr-tab-group [role="tab"][data-engine="nativewind"]')
    .click();
  await navigateLocalhost(page, '/components/message');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  firstPaint = await readFirstPaint(page);
  soft(firstPaint.engine, 'persisted nativewind resolves before first paint').toBe('nativewind');

  // Malformed inputs (bogus-engine, empty string) and absent input all resolve
  // to the documented nativewind default.
  for (const bad of ['bogus-engine', '']) {
    const badContext = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
    const badPage = await badContext.newPage();
    await badPage.addInitScript((value) => {
      (
        globalThis as unknown as { localStorage: { setItem(k: string, v: string): void } }
      ).localStorage.setItem('rnr-engine', value);
    }, bad);
    await navigateLocalhost(badPage, '/components/message');
    await badPage.waitForFunction(
      () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
    );
    const badState = await readState(badPage);
    soft(badState.rootEngine, `malformed input ${JSON.stringify(bad)} resolves to nativewind`).toBe(
      'nativewind',
    );
    soft(
      badState.rnrEngine === 'nativewind' || badState.rnrEngine === bad,
      'storage holds a value',
    ).toBe(true);
    // Selecting uniwind replaces malformed storage with uniwind.
    await badPage.locator(`${DEPENDENCIES_GROUP} [role="tab"][data-engine="uniwind"]`).click();
    const afterSelect = await readState(badPage);
    soft(
      afterSelect.rnrEngine,
      `selecting uniwind replaces malformed storage (${JSON.stringify(bad)})`,
    ).toBe('uniwind');
    await badContext.close();
  }

  // Absent input: fresh context resolves to nativewind.
  const freshContext = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
  const freshPage = await freshContext.newPage();
  await navigateLocalhost(freshPage, '/components/message');
  await freshPage.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  const freshState = await readState(freshPage);
  soft(freshState.rootEngine, 'absent input resolves to nativewind').toBe('nativewind');
  soft(freshState.rnrEngine, 'absent input leaves no storage entry').toBeNull();
  await freshContext.close();

  // Case storage_denied: a real Chromium-level denial (--disable-local-storage
  // disables the Web Storage API; localStorage is genuinely unavailable, not a
  // monkey-patched prototype or synthetic exception).
  const deniedBrowser = await chromium.launch({ args: ['--disable-local-storage'] });
  const deniedContext = await deniedBrowser.newContext({
    colorScheme: 'dark',
    javaScriptEnabled: true,
  });
  const deniedPage = await deniedContext.newPage();
  // Verify the denial is real before the case proceeds.
  const denial = await deniedPage.evaluate(() => {
    try {
      // Under --disable-local-storage, reading window.localStorage either
      // returns null or throws — both mean the store is genuinely denied.
      const ls = (globalThis as unknown as { localStorage: { getItem(k: string): string } | null })
        .localStorage;
      return ls == null ? 'null' : 'readable';
    } catch {
      return 'throws';
    }
  });
  expect(denial, 'Chromium denies localStorage before the case').not.toBe('readable');

  await navigateLocalhost(deniedPage, '/components/message');
  await deniedPage.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  const deniedState = await readState(deniedPage);
  soft(deniedState.rootEngine, 'denied storage resolves to nativewind').toBe('nativewind');
  for (const group of deniedState.groups) {
    soft(group.visible, 'one readable panel per group under denial').toHaveLength(1);
  }
  // Selecting uniwind still switches every group + root despite the denial.
  await deniedPage.locator(`${DEPENDENCIES_GROUP} [role="tab"][data-engine="uniwind"]`).click();
  const deniedAfter = await readState(deniedPage);
  soft(deniedAfter.rootEngine, 'root data-engine is uniwind despite storage denial').toBe(
    'uniwind',
  );
  for (const group of deniedAfter.groups) {
    soft(group.selected, 'both groups select uniwind under denial').toEqual(['uniwind']);
  }
  const installText = await deniedPage
    .locator(`${INSTALL_GROUP} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button code`)
    .textContent();
  soft(installText, 'Install shows the uniwind command under denial').toBe(
    commandFor('uniwind', 'message'),
  );
  await deniedContext.close();
  await deniedBrowser.close();

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-3: preserve engine, theme, and controls across real navigation
// ---------------------------------------------------------------------------
test('ORI-AST-002-AC-3', async ({ browser }) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const context = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
  await grantClipboardPermissions(context);
  const page = await context.newPage();

  // Home: select uniwind, choose light via the real ThemeToggle.
  await navigateLocalhost(page, '/');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  await page
    .locator('main .hero__install rnr-tab-group [role="tab"][data-engine="uniwind"]')
    .click();
  await page.locator('button[aria-label="Toggle dark and light theme"]').click();
  let state = await readState(page);
  soft(state.light, 'light theme chosen').toBe(true);
  soft(state.dark, 'dark marker is complementary false').toBe(false);

  // Prove soft navigation: a window flag survives a ClientRouter link click.
  await page.evaluate(() => {
    (globalThis as unknown as { __softProbe: boolean }).__softProbe = true;
  });

  // Follow Browse components, then the actual message link through ClientRouter.
  await page.locator('a.btn[href="/components"]').click();
  await waitForAstroPageLoad(page);
  soft(
    await page.evaluate(() => (globalThis as { __softProbe?: boolean }).__softProbe === true),
    'ClientRouter performed a soft navigation (window state survived)',
  ).toBe(true);

  await page.locator('a[data-card][href="/components/message"]').click();
  await waitForAstroPageLoad(page);

  state = await readState(page);
  soft(state.rootEngine, 'engine persists after soft navigation').toBe('uniwind');
  soft(state.rnrEngine, 'rnr-engine persists after soft navigation').toBe('uniwind');
  soft(state.light, 'light theme persists after soft navigation').toBe(true);
  soft(state.dark, 'dark marker stays complementary after soft navigation').toBe(false);
  const installText = await page
    .locator(`${INSTALL_GROUP} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button code`)
    .textContent();
  soft(installText, 'Install contains the uniwind message.json URL').toBe(
    commandFor('uniwind', 'message'),
  );

  // Copy the message command with the real clipboard.
  await page
    .locator(`${INSTALL_GROUP} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button button`)
    .click();
  await expect
    .soft(
      page.locator(
        `${INSTALL_GROUP} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button button`,
      ),
    )
    .toHaveAttribute('data-state', 'copied', { timeout: 500 });
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  soft(clipboard, 'clipboard equals the uniwind message command').toBe(
    commandFor('uniwind', 'message'),
  );

  // Filtering: follow the Components breadcrumb, filter for message, clear.
  await page.locator('main .breadcrumb a[href="/components"]').click();
  await waitForAstroPageLoad(page);
  await page.waitForFunction(
    () =>
      (globalThis as { __rnrLedgerFilterRegistered?: boolean }).__rnrLedgerFilterRegistered ===
      true,
  );

  const originalCount = await page.locator('a[data-card]').count();
  const filterInput = page.locator('rnr-ledger-filter input');
  await filterInput.fill('message');
  const messageCardVisible = await page.locator('a[href="/components/message"]').isVisible();
  soft(messageCardVisible, 'filtering message retains the real /components/message card').toBe(
    true,
  );
  // The filter hides the card's <li> wrapper, so count visible cards only.
  const filteredCount = await page.locator('a[data-card]:visible').count();
  soft(filteredCount, 'filtering reduces the visible card set').toBeLessThan(originalCount);

  await filterInput.fill('');
  const clearedCount = await page.locator('a[data-card]:visible').count();
  soft(clearedCount, 'clearing restores the original card count').toBe(originalCount);

  // Repeat the message/back cycle 3 times; controls still act once per click.
  for (let cycle = 0; cycle < 3; cycle += 1) {
    await page.locator('a[data-card][href="/components/message"]').click();
    await waitForAstroPageLoad(page);
    await page.locator('main .breadcrumb a[href="/components"]').click();
    await waitForAstroPageLoad(page);
  }
  // Final: click uniwind once → one consistent state (reconnection, no stale handlers).
  await page.locator('a[data-card][href="/components/message"]').click();
  await waitForAstroPageLoad(page);
  await page.locator(`${INSTALL_GROUP} [role="tab"][data-engine="nativewind"]`).click();
  state = await readState(page);
  soft(state.rootEngine, 'single click activates nativewind after repeated swaps').toBe(
    'nativewind',
  );
  soft(state.rnrEngine, 'single click persists nativewind').toBe('nativewind');
  for (const group of state.groups) {
    soft(group.selected, 'single click synchronizes both groups').toEqual(['nativewind']);
  }
  soft(state.url.includes('engine'), 'no engine state in the URL after every cycle').toBe(false);

  // Toggle dark, hard-load the message page, inspect complementary markers.
  await page.locator('button[aria-label="Toggle dark and light theme"]').click();
  state = await readState(page);
  soft(state.light, 'dark chosen → light marker false').toBe(false);
  soft(state.dark, 'dark chosen → dark marker true').toBe(true);

  await navigateLocalhost(page, '/components/message');
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  state = await readState(page);
  soft(state.light, 'hard load keeps dark → light false').toBe(false);
  soft(state.dark, 'hard load keeps dark → dark true').toBe(true);
  soft(state.rootEngine, 'hard load keeps nativewind engine').toBe('nativewind');

  // An ordinary fresh-tab (full-load) navigation resolves the same state.
  const freshTab = await context.newPage();
  await navigateLocalhost(freshTab, '/components/message');
  await freshTab.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  const freshState = await readState(freshTab);
  soft(freshState.rootEngine, 'fresh-tab link load resolves nativewind').toBe('nativewind');
  soft(freshState.dark, 'fresh-tab link load keeps the dark marker').toBe(true);

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-4: keep both panels in original HTML and without JavaScript
// ---------------------------------------------------------------------------
test('ORI-AST-002-AC-4', async ({ browser }) => {
  test.setTimeout(120_000);
  const soft = expect.soft;

  // Raw HTTP: both routes 200 with complete nativewind + uniwind panels.
  const context = await browser.newContext();
  const request = context.request;
  for (const [path, item] of [
    ['/', 'conversation'],
    ['/components/message', 'message'],
  ] as const) {
    const response = await request.get(`${PREVIEW_URL}${path}`);
    soft(response.status(), `${path} responds HTTP 200`).toBe(200);
    const body = await response.text();
    soft(
      body.includes(commandFor('nativewind', item)),
      `${path} carries the nativewind command`,
    ).toBe(true);
    soft(body.includes(commandFor('uniwind', item)), `${path} carries the uniwind command`).toBe(
      true,
    );
    soft(body.includes('rnr-tab-group'), `${path} renders the tab group island`).toBe(true);
  }

  // The message response carries 8 unique tab/panel IDs across 2 groups.
  const messageBody = await (await request.get(`${PREVIEW_URL}/components/message`)).text();
  const ids = Array.from(messageBody.matchAll(/id="([^"]*(?:tab|panel)-[^"]*)"/g)).map(
    (match) => match[1],
  );
  soft(ids.length, '8 tab/panel IDs in the raw message response').toBe(8);
  soft(new Set(ids).size, 'all 8 raw IDs are unique').toBe(8);

  // JavaScript-disabled context: both labeled panels are stacked and readable,
  // and ordinary links reach their destinations.
  const nojsContext = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojsContext.newPage();
  await navigateLocalhost(nojsPage, '/components/message');
  // Both engine commands are present and visible (the :not(:defined) fallback
  // un-hides the inactive panel when the island never upgrades).
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panel = nojsPage.locator(`${INSTALL_GROUP} [role="tabpanel"][data-engine="${engine}"]`);
    soft(await panel.count(), `no-JS ${engine} install panel is present`).toBe(1);
    const text = await panel.locator('rnr-copy-button code').textContent();
    soft(text, `no-JS ${engine} command is readable`).toBe(commandFor(engine, 'message'));
    soft(await panel.isVisible(), `no-JS ${engine} panel is visible (stacked)`).toBe(true);
  }
  // Follow a real Components link and a message link with JavaScript disabled.
  await nojsPage.locator('main .breadcrumb a[href="/components"]').click();
  await nojsPage.waitForLoadState('load');
  soft(nojsPage.url(), 'no-JS Components link reaches /components').toContain('/components');
  await nojsPage.locator('a[data-card][href="/components/message"]').click();
  await nojsPage.waitForLoadState('load');
  soft(nojsPage.url(), 'no-JS message link reaches /components/message').toContain(
    '/components/message',
  );
  await nojsContext.close();
  await context.close();
});

// ---------------------------------------------------------------------------
// AC-5: keep generic tabs independent of engine persistence
// ---------------------------------------------------------------------------
test('ORI-AST-002-AC-5', async ({ browser }) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // Build an OS-derived scratch Astro consumer from the candidate's actual
  // TabGroup.astro + tab-group.ts, then serve its real HTML on its own port.
  const consumer = await buildGenericConsumer();
  const consumerUrl = `http://localhost:${consumer.port}`;

  const context = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
  const page = await context.newPage();
  await page.goto(`${consumerUrl}/`);
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );

  // 3 groups, 12 unique tab/panel IDs, each control resolves in its own group.
  const idSummary = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { querySelectorAll(s: string): ArrayLike<DomEl> };
    };
    const groups = Array.from(g.document.querySelectorAll('main rnr-tab-group'));
    const ids = groups.flatMap((group) => [
      ...Array.from(group.querySelectorAll('[role="tab"]')).map((el) => el.id),
      ...Array.from(group.querySelectorAll('[role="tabpanel"]')).map((el) => el.id),
    ]);
    return { groups: groups.length, count: ids.length, unique: new Set(ids).size };
  });
  soft(idSummary.groups, '3 groups (2 engine + 1 generic)').toBe(3);
  soft(idSummary.count, '12 tab/panel IDs').toBe(12);
  soft(idSummary.unique, 'all 12 IDs are unique').toBe(12);

  // Select uniwind through the install engine control.
  await page
    .locator('main section[data-section="install"] [role="tab"][data-engine="uniwind"]')
    .click();
  let state = await readState(page);
  soft(state.rootEngine, 'engine selection resolves root to uniwind').toBe('uniwind');
  soft(state.rnrEngine, 'engine selection persists uniwind').toBe('uniwind');

  // Click pnpm in the generic group: generic shows pnpm, engine groups unchanged.
  await page
    .locator('main section[data-section="package-manager"] [role="tab"][data-engine="pnpm"]')
    .click();
  const genericPanel = await page
    .locator('main section[data-section="package-manager"] [role="tabpanel"][data-engine="pnpm"]')
    .textContent();
  soft(genericPanel, 'generic selection displays pnpm add example').toContain('pnpm add example');
  state = await readState(page);
  soft(state.rnrEngine, 'generic selection never writes rnr-engine').toBe('uniwind');
  soft(state.rootEngine, 'generic selection leaves root engine as uniwind').toBe('uniwind');
  const engineGroups = state.groups.filter((group) => group.persistent === 'true');
  for (const group of engineGroups) {
    soft(group.selected, 'engine groups remain on uniwind after generic click').toEqual([
      'uniwind',
    ]);
  }

  // Selecting nativewind in the later engine group synchronizes engine groups,
  // generic selection stays pnpm.
  await page
    .locator('main section[data-section="dependencies"] [role="tab"][data-engine="nativewind"]')
    .click();
  state = await readState(page);
  soft(state.rootEngine, 'nativewind selection resolves root').toBe('nativewind');
  const genericAfter = await page
    .locator('main section[data-section="package-manager"] [role="tabpanel"][data-engine="pnpm"]')
    .textContent();
  soft(genericAfter, 'generic group still displays pnpm after engine change').toContain(
    'pnpm add example',
  );

  // Reload: generic group returns to npm (nonpersistent), engine groups restore
  // nativewind (persisted).
  await page.reload();
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
  );
  state = await readState(page);
  soft(state.rootEngine, 'engine groups restore nativewind after reload').toBe('nativewind');
  const genericSelected = state.groups.find((group) => group.persistent === 'false');
  soft(genericSelected?.selected, 'nonpersistent group returns to npm after reload').toEqual([
    'npm',
  ]);
  const genericDefault = await page
    .locator('main section[data-section="package-manager"] [role="tabpanel"][data-engine="npm"]')
    .textContent();
  soft(genericDefault, 'generic group defaults to npm install example').toContain(
    'npm install example',
  );
  soft(state.rnrEngine, 'storage contains only an engine value').toBe('nativewind');

  await context.close();
  consumer.cleanup();
});

// ---------------------------------------------------------------------------
// Generic-consumer scratch build (AC-5 fixture)
// ---------------------------------------------------------------------------
interface ConsumerHandle {
  port: number;
  cleanup: () => void;
}

async function buildGenericConsumer(): Promise<ConsumerHandle> {
  const scratch = mkdtempSync(join(tmpdir(), 'ori-ast-002-consumer-'));
  const src = (rel: string) => join(scratch, rel);
  mkdirSync(src('src/components/islands'), { recursive: true });
  mkdirSync(src('src/scripts'), { recursive: true });
  mkdirSync(src('src/pages'), { recursive: true });

  cpSync(
    join(DOCS_DIR, 'src/components/islands/TabGroup.astro'),
    src('src/components/islands/TabGroup.astro'),
  );
  cpSync(join(DOCS_DIR, 'src/scripts/tab-group.ts'), src('src/scripts/tab-group.ts'));

  writeFileSync(
    src('package.json'),
    `${JSON.stringify({ name: 'generic-consumer', type: 'module', private: true }, null, 2)}\n`,
  );
  writeFileSync(
    src('astro.config.mjs'),
    "import { defineConfig } from 'astro/config';\nexport default defineConfig({ site: 'https://example.com' });\n",
  );
  writeFileSync(
    src('src/pages/index.astro'),
    `---
import TabGroup from '../components/islands/TabGroup.astro';
const ENGINES = [
  { engine: 'nativewind', label: 'nativewind' },
  { engine: 'uniwind', label: 'uniwind' },
];
const PACKAGE_MANAGERS = [
  { engine: 'npm', label: 'npm' },
  { engine: 'pnpm', label: 'pnpm' },
];
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>generic consumer</title></head>
  <body>
    <main>
      <section data-section="install">
        <TabGroup group="install" panels={ENGINES}>
          <Fragment slot="nativewind">install nativewind</Fragment>
          <Fragment slot="uniwind">install uniwind</Fragment>
        </TabGroup>
      </section>
      <section data-section="dependencies">
        <TabGroup group="dependencies" panels={ENGINES}>
          <Fragment slot="nativewind">dependencies nativewind</Fragment>
          <Fragment slot="uniwind">dependencies uniwind</Fragment>
        </TabGroup>
      </section>
      <section data-section="package-manager">
        <TabGroup group="package-manager" persistent={false} panels={PACKAGE_MANAGERS}>
          <Fragment slot="npm">npm install example</Fragment>
          <Fragment slot="pnpm">pnpm add example</Fragment>
        </TabGroup>
      </section>
    </main>
  </body>
</html>
`,
  );

  symlinkSync(join(DOCS_DIR, 'node_modules'), src('node_modules'), 'dir');
  const build = spawnSync(ASTRO_BIN, ['build'], {
    cwd: scratch,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  if (build.status !== 0) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error(`generic consumer build failed:\n${build.stdout}\n${build.stderr}`);
  }
  if (!existsSync(src('dist/index.html'))) {
    rmSync(scratch, { recursive: true, force: true });
    throw new Error(`generic consumer produced no dist/index.html`);
  }

  const port = 4323;
  const preview = spawn(
    ASTRO_BIN,
    ['preview', '--host', '127.0.0.1', '--port', String(port), '--ignore-lock'],
    { cwd: scratch, stdio: 'ignore', env: { ...process.env, ASTRO_PREVIEW_BACKGROUND: '1' } },
  );

  // Wait for the owned scratch preview to answer before the first request.
  const url = `http://localhost:${port}`;
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      const probe = await fetch(`${url}/`);
      if (probe.ok) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      try {
        preview.kill('SIGTERM');
      } catch {
        /* already gone */
      }
      rmSync(scratch, { recursive: true, force: true });
      throw new Error(`scratch consumer at ${url} did not become ready within 30s`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return {
    port,
    cleanup: () => {
      try {
        preview.kill('SIGTERM');
      } catch {
        /* already gone */
      }
      rmSync(scratch, { recursive: true, force: true });
    },
  };
}
