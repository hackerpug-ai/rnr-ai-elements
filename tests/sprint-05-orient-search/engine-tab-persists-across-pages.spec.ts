import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-AST-010 AC-1 — FLOW-SHELL-13: shared engine state across all five
 * surfaces. The complete post-integration journey over the real built docs:
 * Installation, Quickstart, the generated Message page, home and Components
 * agree on the selected engine through the real <rnr-tab-group> island, real
 * localStorage, the root data-engine attribute and the ClientRouter — with no
 * engine state ever encoded in a URL.
 *
 * Nothing is seeded: engine state changes ONLY through real tab activation and
 * real keyboard operation, and every observation is read back through the DOM,
 * storage and the location bar.
 */

const FLOW_TOKEN = 'FLOW-SHELL-13-engine-tab-persists-across-pages';
const CAPTURE_DIR = '.tmp/ORI-AST-010/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages';

/** The locked install-command shape (InstallCommand.astro). */
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, item: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${item}.json`;

/** A browser-DOM element facade — this repo's tsconfig has no DOM lib. */
interface DomEl {
  id: string;
  tabIndex: number;
  textContent: string;
  getAttribute(name: string): string | null;
  hasAttribute(name: string): boolean;
  querySelectorAll(selector: string): ArrayLike<DomEl>;
}

interface GroupState {
  persistent: string | null;
  selected: (string | null)[];
  visible: (string | null)[];
  labels: string[];
  tabIds: string[];
  panelIds: string[];
  ownershipOk: boolean;
  labelledByOk: boolean;
}

interface PageState {
  rootEngine: string | null;
  rnrEngine: string | null;
  url: string;
  query: string;
  fragment: string;
  groups: GroupState[];
}

/** Read the settled engine state of every group through the real DOM. */
function readState(page: Page): Promise<PageState> {
  return page.evaluate(() => {
    const g = globalThis as unknown as {
      document: {
        documentElement: DomEl;
        querySelectorAll(selector: string): ArrayLike<DomEl>;
      };
      localStorage: { getItem(key: string): string | null };
      location: { pathname: string; search: string; hash: string };
    };
    const root = g.document.documentElement;
    const groups = Array.from(
      g.document.querySelectorAll('main rnr-tab-group[data-persistent="true"]'),
    ).map((group) => {
      const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
      const panels = Array.from(group.querySelectorAll('[role="tabpanel"]'));
      const panelIds = new Set(panels.map((panel) => panel.id));
      const tabIds = new Set(tabs.map((tab) => tab.id));
      return {
        persistent: group.getAttribute('data-persistent'),
        selected: tabs
          .filter((tab) => tab.getAttribute('aria-selected') === 'true')
          .map((tab) => tab.getAttribute('data-engine')),
        visible: panels
          .filter((panel) => !panel.hasAttribute('hidden'))
          .map((panel) => panel.getAttribute('data-engine')),
        labels: tabs.map((tab) => tab.getAttribute('aria-label') ?? tab.textContent ?? ''),
        tabIds: tabs.map((tab) => tab.id),
        panelIds: panels.map((panel) => panel.id),
        ownershipOk:
          tabs.every((tab) => panelIds.has(tab.getAttribute('aria-controls') ?? '')) &&
          panels.every((panel) => tabIds.has(panel.getAttribute('aria-labelledby') ?? '')),
        labelledByOk: panels.every((panel) =>
          tabIds.has(panel.getAttribute('aria-labelledby') ?? ''),
        ),
      };
    });
    return {
      rootEngine: root.getAttribute('data-engine'),
      rnrEngine: g.localStorage.getItem('rnr-engine'),
      url: g.location.pathname,
      query: g.location.search,
      fragment: g.location.hash,
      groups,
    };
  });
}

/** Wait for the tab-group island to upgrade on a JavaScript-enabled page.
 * The explicit timeout bounds a pre-implementation or broken build: the
 * journey must fail on its assertions, not drown in the test timeout. */
async function awaitTabIsland(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (globalThis as { __rnrTabGroupRegistered?: boolean }).__rnrTabGroupRegistered === true,
    undefined,
    { timeout: 15_000 },
  );
}

/** Storage agreement for one leg: post-selection legs require the value to
 * exist and agree; a fresh context legitimately carries NO rnr-engine entry
 * (the island restores the documented default without writing storage). */
function storageProblems(
  state: PageState,
  engine: 'nativewind' | 'uniwind',
  surface: string,
  expectStorage: boolean,
): string[] {
  if (expectStorage && state.rnrEngine !== engine) {
    return [`${surface}: rnr-engine storage is ${state.rnrEngine}, expected ${engine}`];
  }
  if (!expectStorage && state.rnrEngine !== null && state.rnrEngine !== engine) {
    return [
      `${surface}: fresh rnr-engine storage is ${state.rnrEngine}, expected absent or default`,
    ];
  }
  return [];
}

/** Per-group agreement: selection, visible panel, ARIA ownership, unique IDs. */
function groupProblems(
  state: PageState,
  engine: 'nativewind' | 'uniwind',
  surface: string,
): string[] {
  const problems: string[] = [];
  for (const [index, group] of state.groups.entries()) {
    const selected = JSON.stringify(group.selected);
    if (group.selected.length !== 1 || group.selected[0] !== engine) {
      problems.push(`${surface}: group ${index} selected ${selected}, expected ["${engine}"]`);
    }
    if (group.visible.length !== 1 || group.visible[0] !== engine) {
      problems.push(`${surface}: group ${index} visible ${JSON.stringify(group.visible)}`);
    }
    if (!group.ownershipOk) {
      problems.push(`${surface}: group ${index} ARIA ownership crosses groups`);
    }
    const idCount = group.tabIds.length + group.panelIds.length;
    if (new Set([...group.tabIds, ...group.panelIds]).size !== idCount) {
      problems.push(`${surface}: group ${index} carries duplicate tab/panel IDs`);
    }
  }
  return problems;
}

function isEngineConsistent(
  state: PageState,
  engine: 'nativewind' | 'uniwind',
  surface: string,
  expectStorage = true,
): string[] {
  const problems: string[] = [];
  if (state.rootEngine !== engine) {
    problems.push(`${surface}: root data-engine is ${state.rootEngine}, expected ${engine}`);
  }
  problems.push(...storageProblems(state, engine, surface, expectStorage));
  problems.push(...groupProblems(state, engine, surface));
  return problems;
}

test(`${FLOW_TOKEN}`, async ({ browser }, testInfo) => {
  test.setTimeout(300_000);
  const soft = expect.soft;
  const problems: string[] = [];
  const visitedUrls: string[] = [];

  // Fresh real browser context: empty localStorage, no loaded Pagefind.
  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  // -- Step 1: open /docs/installation; verify the documented fresh default --
  const installation = await navigateLocalhost(page, '/docs/installation');
  expect(
    installation?.status(),
    'the integrated candidate must serve /docs/installation with HTTP 200',
  ).toBe(200);
  await awaitTabIsland(page);
  await waitForAstroPageLoad(page);
  // The documented default is nativewind: the served pre-paint contract itself
  // declares it, and a fresh context must resolve to exactly that engine.
  const prePaint = await page.evaluate(() =>
    Array.from(
      (
        globalThis as unknown as {
          document: { querySelectorAll(selector: string): ArrayLike<{ textContent: string }> };
        }
      ).document.querySelectorAll('script:not([src])'),
    )
      .map((script) => script.textContent ?? '')
      .some((text) => text.includes('nativewind engine default')),
  );
  soft(prePaint, 'the served pre-paint contract documents the nativewind fresh default').toBe(true);
  let state = await readState(page);
  visitedUrls.push(page.url());
  soft(state.url, 'the installation surface is /docs/installation').toBe('/docs/installation');
  problems.push(...isEngineConsistent(state, 'nativewind', 'installation-fresh', false));
  soft(state.groups.length, 'the installation surface exposes an engine tab group').toBeGreaterThan(
    0,
  );

  // -- Step 2: click the uniwind tab; inspect its complete command -----------
  const firstGroup = 'main rnr-tab-group';
  await page
    .locator(`${firstGroup} [role="tab"][data-engine="uniwind"]`)
    .first()
    .click({ timeout: 15_000 });
  const uniwindCommand = await page
    .locator(`${firstGroup} [role="tabpanel"][data-engine="uniwind"] code`)
    .first()
    .textContent();
  soft(uniwindCommand, 'the uniwind panel carries the complete uniwind registry command').toBe(
    commandFor('uniwind', 'conversation'),
  );

  // -- Step 3: storage and root dataset agree --------------------------------
  state = await readState(page);
  soft(state.rnrEngine, "localStorage 'rnr-engine' is 'uniwind' after selection").toBe('uniwind');
  soft(state.rootEngine, "root 'data-engine' is 'uniwind' after selection").toBe('uniwind');
  problems.push(...isEngineConsistent(state, 'uniwind', 'installation-selected'));

  // -- Step 4: follow the actual Quickstart link through ClientRouter --------
  await page.evaluate(() => {
    (globalThis as { __s05SoftProbe?: boolean }).__s05SoftProbe = true;
  });
  await page.getByRole('link', { name: 'Quickstart' }).first().click();
  await page.waitForURL(/\/docs\/quickstart\/?$/);
  await awaitTabIsland(page);
  await waitForAstroPageLoad(page);
  const softProbe = await page.evaluate(
    () => (globalThis as { __s05SoftProbe?: boolean }).__s05SoftProbe === true,
  );
  soft(softProbe, 'the Quickstart leg ran through the ClientRouter (soft navigation)').toBe(true);
  state = await readState(page);
  visitedUrls.push(page.url());
  soft(state.url, 'the second surface is /docs/quickstart').toBe('/docs/quickstart');
  problems.push(...isEngineConsistent(state, 'uniwind', 'quickstart-soft'));
  soft(state.groups.length, 'Quickstart renders multiple engine tabbed blocks').toBeGreaterThan(1);

  // -- Step 5: hard-load /components/message ---------------------------------
  await navigateLocalhost(page, '/components/message');
  await awaitTabIsland(page);
  await waitForAstroPageLoad(page);
  state = await readState(page);
  visitedUrls.push(page.url());
  soft(state.url, 'the third surface is /components/message').toBe('/components/message');
  problems.push(...isEngineConsistent(state, 'uniwind', 'message-hardload'));

  // -- Step 6: return to Quickstart; select nativewind in a LATER block ------
  await navigateLocalhost(page, '/docs/quickstart');
  await awaitTabIsland(page);
  await waitForAstroPageLoad(page);
  const groupCount = await page.locator('main rnr-tab-group[data-persistent="true"]').count();
  soft(
    groupCount,
    'Quickstart exposes several engine groups for the later-block switch',
  ).toBeGreaterThan(1);
  const laterGroup = `main rnr-tab-group[data-persistent="true"] >> nth=${groupCount - 1}`;
  await page
    .locator(`${laterGroup} >> [role="tab"][data-engine="nativewind"]`)
    .click({ timeout: 15_000 });
  state = await readState(page);
  visitedUrls.push(page.url());
  problems.push(...isEngineConsistent(state, 'nativewind', 'quickstart-later-block'));
  soft(state.groups.length, 'the later-block selection synchronized every Quickstart group').toBe(
    groupCount,
  );

  // -- Step 7: keyboard operation selects the matching panel -----------------
  await page
    .locator(`${laterGroup} >> [role="tab"][data-engine="nativewind"]`)
    .focus({ timeout: 15_000 });
  await page.keyboard.press('ArrowRight');
  state = await readState(page);
  problems.push(...isEngineConsistent(state, 'uniwind', 'quickstart-keyboard-right'));
  await page.keyboard.press('ArrowLeft');
  state = await readState(page);
  problems.push(...isEngineConsistent(state, 'nativewind', 'quickstart-keyboard-left'));
  const rovingState = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { querySelectorAll(selector: string): ArrayLike<DomEl> };
    };
    return Array.from(g.document.querySelectorAll('main rnr-tab-group')).map((group) => {
      const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
      return tabs.filter((tab) => tab.tabIndex === 0).map((tab) => tab.getAttribute('data-engine'));
    });
  });
  for (const [index, roving] of rovingState.entries()) {
    soft(roving, `group ${index} keeps one keyboard-reachable (tabindex=0) tab`).toHaveLength(1);
  }

  // -- Step 8: home and Components complete the five consistent surfaces ----
  await navigateLocalhost(page, '/');
  await awaitTabIsland(page);
  await waitForAstroPageLoad(page);
  state = await readState(page);
  visitedUrls.push(page.url());
  problems.push(...isEngineConsistent(state, 'nativewind', 'home'));

  await navigateLocalhost(page, '/components');
  await waitForAstroPageLoad(page);
  state = await readState(page);
  visitedUrls.push(page.url());
  problems.push(...isEngineConsistent(state, 'nativewind', 'components'));

  // Five page surfaces observed in total.
  const surfaces = new Set(
    visitedUrls.map((url) => new URL(url).pathname.replace(/\/$/, '') || '/'),
  );
  soft(
    ['/docs/installation', '/docs/quickstart', '/components/message', '/', '/components'].every(
      (surface) => surfaces.has(surface),
    ),
    `all five surfaces visited: ${[...surfaces].join(', ')}`,
  ).toBe(true);

  // -- Step 9: engine state never enters any visited URL ---------------------
  for (const url of visitedUrls) {
    const parsed = new URL(url);
    soft(
      parsed.search + parsed.hash,
      `no engine-state query or fragment encoding on ${parsed.pathname}`,
    ).toBe('');
  }

  // Every collected consistency problem fails the journey with its surface.
  soft(problems, 'engine state agrees across panels, storage and root on every surface').toEqual(
    [],
  );

  const capture = {
    visitedUrls,
    surfaces: [...surfaces],
    consistencyProblems: problems,
    finalRootEngine: state.rootEngine,
    finalStorage: state.rnrEngine,
  };
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${FLOW_TOKEN}.json`),
    `${JSON.stringify(capture, null, 2)}\n`,
  );
  await context.close();
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

let anyFailure = false;

// Playwright requires the fixtures object destructuring pattern in hook
// callbacks; the empty pattern is the only form that needs no fixture.
// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-ast-010-flow-shell-13-${Date.now()}`,
    flowToken: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      tabGroupIsland: hashFile('apps/docs/src/components/islands/TabGroup.astro'),
      tabGroupScript: hashFile('apps/docs/src/scripts/tab-group.ts'),
      installCommand: hashFile('apps/docs/src/components/InstallCommand.astro'),
      testFile: hashFile('tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      driver: hashFile('tests/harness/docs-preview.ts'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
      pagefindEntry: hashFile('apps/docs/dist/pagefind/pagefind-entry.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-010/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
