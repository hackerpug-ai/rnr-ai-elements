import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, test } from '@playwright/test';
import { oneLineDescription } from '../../apps/docs/src/lib/one-line-description';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * ORI-AST-007 — filter the generated registry ledger and copy the selected
 * engine's command (FLOW-GEND-07-registry-ledger-controls).
 *
 * Four AC-addressable browser proofs over the REAL built docs preview on
 * localhost:4321, each greppable under the locked flow token:
 *
 *   AC-1 — category totals 56/39/11/6, category + text filtering, zero-match
 *          feedback, full recovery of the ledger and the original component grid.
 *   AC-2 — the displayed engine command equals the real clipboard after
 *          selection; row counts stay fixed; shared engine state agrees through
 *          real navigation (rnr-engine storage + root data-engine).
 *   AC-3 — conversation, item and stack-trace-parser Docs links each return
 *          HTTP 200 at their real reference URL with matching substantive content.
 *   AC-4 — the JavaScript-disabled document exposes all 56 rows and both labeled
 *          engine commands, resolves the representative Docs links, and exposes
 *          no inert filter controls.
 *
 * Nothing is mocked: rows are read through Chromium locators, the clipboard is
 * the real navigator.clipboard API in an explicitly JavaScript-enabled context
 * with granted permissions, storage is the browser's actual localStorage, and
 * the no-JS clauses run in an explicitly JavaScript-disabled context. Each test
 * creates its own explicit context so the identical code path runs in every
 * project. Expected item identities and counts derive from the generated
 * dataset — never typed literals — except the AC-pinned totals 56/39/11/6,
 * which the dataset sanity check re-derives before asserting.
 */

declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  engines: string[];
  expoGo: boolean;
}

const items = JSON.parse(
  readFileSync(join(repoRoot, 'apps/docs/src/data/registry-items.json'), 'utf8'),
) as Item[];

const components = items.filter((item) => item.type === 'registry:component');
const uiItems = items.filter((item) => item.type === 'registry:ui');
const libItems = items.filter((item) => item.type === 'registry:lib');

const TOTALS = {
  all: items.length,
  component: components.length,
  ui: uiItems.length,
  lib: libItems.length,
};

// Dataset sanity: the AC-pinned totals hold for the generated dataset.
expect(TOTALS.all, 'generated dataset has 56 items').toBe(56);
expect(TOTALS.component, 'generated dataset has 39 components').toBe(39);
expect(TOTALS.ui, 'generated dataset has 11 ui items').toBe(11);
expect(TOTALS.lib, 'generated dataset has 6 lib items').toBe(6);

function categoryOf(type: string): string {
  return type.replace('registry:', '');
}

/** The join the ledger bakes into each row's data-filter-text. */
function ledgerFilterText(item: Item): string {
  return [item.name, item.title, oneLineDescription(item.description), categoryOf(item.type)]
    .join(' ')
    .toLowerCase();
}

/** The join the /components grid bakes into each card (ComponentCard.astro). */
function gridFilterText(item: Item): string {
  return [item.title, oneLineDescription(item.description), categoryOf(item.type)]
    .join(' ')
    .toLowerCase();
}

const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${name}.json`;

/** A run-specific query guaranteed to match no ledger item and no grid card. */
function noMatchQuery(): string {
  let candidate = '';
  do {
    candidate = `zzq-nonexistent-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  } while (
    items.some((item) => ledgerFilterText(item).includes(candidate)) ||
    components.some((item) => gridFilterText(item).includes(candidate))
  );
  return candidate;
}

const INPUT = 'rnr-ledger-filter input';
const CATEGORY = (id: string): string => `[data-category-filter="${id}"]`;
const ROW = (name: string): string => `tr[id="row-${name}"]`;
const COMMAND = (name: string, engine: string): string =>
  `tr[id="row-${name}"] [data-engine-command="${engine}"]`;

async function visibleRowNames(page: Page): Promise<string[]> {
  return page.locator('tr[data-filter-text]:visible th[scope="row"]').allTextContents();
}

// ---------------------------------------------------------------------------
// AC-1: filter categories and text; recover the table and existing grid
// ---------------------------------------------------------------------------
test('FLOW-GEND-07-registry-ledger-controls AC-1: category totals, category/text filtering, recovery of ledger and grid', async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page);
  // Primary gate: the ledger exposes the four category controls.
  expect(
    await page.locator('[data-category-filter]').count(),
    'the ledger exposes All/component/ui/lib category controls',
  ).toBe(4);

  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  const readTotal = async (id: string): Promise<string> =>
    ((await page.locator(`${CATEGORY(id)} [data-category-count]`).textContent()) ?? '').trim();
  soft(await readTotal('all'), 'All category total is 56').toBe(String(TOTALS.all));
  soft(await readTotal('component'), 'component category total is 39').toBe(
    String(TOTALS.component),
  );
  soft(await readTotal('ui'), 'ui category total is 11').toBe(String(TOTALS.ui));
  soft(await readTotal('lib'), 'lib category total is 6').toBe(String(TOTALS.lib));

  // Category filter: component shows 39 rows; text narrows; clear restores.
  await page.locator(CATEGORY('component')).click();
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'component category shows 39 rows',
  ).toBe(TOTALS.component);

  await page.fill(INPUT, 'conversation');
  const expectedComponentMatches = components
    .filter((item) => ledgerFilterText(item).includes('conversation'))
    .map((item) => item.name)
    .sort();
  soft(
    (await visibleRowNames(page)).map((n) => n.trim()).sort(),
    'text filter narrows to the dataset-derived conversation matches',
  ).toEqual(expectedComponentMatches);
  soft(
    await page.locator(ROW('conversation')).isVisible(),
    'the filtered component set includes conversation',
  ).toBe(true);
  soft(
    expectedComponentMatches.length < TOTALS.component,
    'the query excludes at least one nonmatching component',
  ).toBe(true);

  await page.fill(INPUT, '');
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'clearing restores 39 component rows',
  ).toBe(TOTALS.component);

  // No-match on All: 0 rows + 1 empty message; clearing restores 56 + hides it.
  const noMatch = noMatchQuery();
  await page.locator(CATEGORY('all')).click();
  await page.fill(INPUT, noMatch);
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'a no-match query shows 0 item rows',
  ).toBe(0);
  soft(
    await page.locator('[data-no-results]').isVisible(),
    'one empty-result message appears',
  ).toBe(true);
  await page.fill(INPUT, '');
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'clearing restores all 56 item rows',
  ).toBe(TOTALS.all);
  soft(await page.locator('[data-no-results]').isVisible(), 'empty-result message hides').toBe(
    false,
  );

  // The existing component grid retains its own filtering contract.
  await navigateLocalhost(page, '/components');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
  soft(await page.locator('a[data-card]').count(), 'the grid serves all 39 cards').toBe(
    TOTALS.component,
  );
  await page.fill(INPUT, 'conversation');
  const expectedGridMatches = components.filter((item) =>
    gridFilterText(item).includes('conversation'),
  ).length;
  soft(
    await page.locator('a[data-card]:visible').count(),
    'grid filters to the conversation matches',
  ).toBe(expectedGridMatches);
  await page.fill(INPUT, noMatch);
  soft(await page.locator('a[data-card]:visible').count(), 'grid no-match shows 0 cards').toBe(0);
  await page.fill(INPUT, '');
  soft(await page.locator('a[data-card]:visible').count(), 'grid clearing restores 39 cards').toBe(
    TOTALS.component,
  );

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-2: copy the displayed engine command and preserve shared selection
// ---------------------------------------------------------------------------
test('FLOW-GEND-07-registry-ledger-controls AC-2: displayed engine command equals the real clipboard, shared state survives navigation', async ({
  browser,
}) => {
  test.setTimeout(300_000);
  const soft = expect.soft;

  const context = await browser.newContext({ javaScriptEnabled: true });
  await grantClipboardPermissions(context);
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page);
  // Primary gate: the ledger exposes the shared engine selector.
  expect(
    await page.locator('rnr-ledger-filter rnr-tab-group [role="tab"]').count(),
    'the ledger exposes nativewind + uniwind engine tabs',
  ).toBe(2);

  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  await page.locator(CATEGORY('component')).click();
  soft(await page.locator('tr[data-filter-text]:visible').count(), '39 rows before filtering').toBe(
    TOTALS.component,
  );
  await page.locator('rnr-ledger-filter rnr-tab-group [role="tab"][data-engine="uniwind"]').click();
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'engine selection preserves 39 component rows',
  ).toBe(TOTALS.component);

  await page.fill(INPUT, 'conversation');
  const matchedBefore = await page.locator('tr[data-filter-text]:visible').count();
  soft(matchedBefore, 'conversation filter yields a nonzero matching-row count').toBeGreaterThan(0);

  // Displayed uniwind command + real clipboard.
  const uniwindCell = page.locator(COMMAND('conversation', 'uniwind'));
  await expect(uniwindCell, 'uniwind command is displayed after selection').toBeVisible();
  const uniwindDisplayed = (
    (await uniwindCell.locator('rnr-copy-button code').textContent()) ?? ''
  ).trim();
  soft(uniwindDisplayed, 'displayed uniwind conversation command').toBe(
    commandFor('uniwind', 'conversation'),
  );
  await uniwindCell.locator('rnr-copy-button button').click();
  const uniwindClipboard = await page.evaluate(() => navigator.clipboard.readText());
  soft(uniwindClipboard, 'clipboard equals the uniwind command').toBe(
    commandFor('uniwind', 'conversation'),
  );

  // Switch to nativewind: row count unchanged, command and clipboard flip.
  await page
    .locator('rnr-ledger-filter rnr-tab-group [role="tab"][data-engine="nativewind"]')
    .click();
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'switching engines preserves the matching-row count',
  ).toBe(matchedBefore);
  const nativewindCell = page.locator(COMMAND('conversation', 'nativewind'));
  await expect(nativewindCell, 'nativewind command is displayed after switching').toBeVisible();
  const nativewindDisplayed = (
    (await nativewindCell.locator('rnr-copy-button code').textContent()) ?? ''
  ).trim();
  soft(nativewindDisplayed, 'displayed nativewind conversation command').toBe(
    commandFor('nativewind', 'conversation'),
  );
  await nativewindCell.locator('rnr-copy-button button').click();
  const nativewindClipboard = await page.evaluate(() => navigator.clipboard.readText());
  soft(nativewindClipboard, 'clipboard equals the nativewind command').toBe(
    commandFor('nativewind', 'conversation'),
  );

  // Shared state through real navigation: select nativewind via the ledger
  // engine control, follow the conversation Docs link, choose uniwind on the
  // authored panel, then return to Registry and observe agreement.
  await page
    .locator('rnr-ledger-filter rnr-tab-group [role="tab"][data-engine="nativewind"]')
    .click();
  await page.locator(`${ROW('conversation')} a[data-docs-link]`).click();
  await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
  await page
    .locator('main section[data-section="install"] [role="tab"][data-engine="uniwind"]')
    .click();
  // Return to Registry through a real navigation (a full page load — the
  // strongest persistence proof: localStorage must survive it).
  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
  const state = await page.evaluate(() => {
    const g = globalThis as unknown as {
      document: { documentElement: { getAttribute(name: string): string | null } };
      localStorage: { getItem(key: string): string | null };
    };
    return {
      rootEngine: g.document.documentElement.getAttribute('data-engine'),
      rnrEngine: g.localStorage.getItem('rnr-engine'),
    };
  });
  soft(state.rootEngine, 'root data-engine agrees with the authored panel selection').toBe(
    'uniwind',
  );
  soft(state.rnrEngine, 'rnr-engine storage agrees').toBe('uniwind');
  await expect(
    page.locator('rnr-ledger-filter rnr-tab-group [role="tab"][data-engine="uniwind"]'),
    'the ledger engine control reflects the shared selection',
  ).toHaveAttribute('aria-selected', 'true');

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-3: follow substantive component, ui and lib references
// ---------------------------------------------------------------------------
test('FLOW-GEND-07-registry-ledger-controls AC-3: conversation, item and stack-trace-parser Docs links reach real references', async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page);
  // Primary gate: ui/lib Docs links point at real reference destinations
  // (the pre-implementation ledger self-anchors them at #row-{name}).
  const itemHref = await page.locator(`${ROW('item')} a[data-docs-link]`).getAttribute('href');
  expect(itemHref, 'item Docs link is a real destination, not a self-anchor').toBe(
    '/components/item',
  );

  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  const cases: { name: string; category: string }[] = [
    { name: 'conversation', category: 'component' },
    { name: 'item', category: 'ui' },
    { name: 'stack-trace-parser', category: 'lib' },
  ];

  for (const c of cases) {
    const item = items.find((entry) => entry.name === c.name);
    if (!item) throw new Error(`dataset sanity: ${c.name} missing`);

    await page.locator(CATEGORY(c.category)).click();
    await page.fill(INPUT, c.name);
    const rowLink = page.locator(`${ROW(c.name)} a[data-docs-link]`);
    soft(await rowLink.getAttribute('href'), `${c.name}: Docs link is a real destination`).toBe(
      `/components/${c.name}`,
    );

    const response = await context.request.get(new URL(`/components/${c.name}`, PREVIEW_URL).href);
    soft(response.status(), `${c.name}: destination returns HTTP 200`).toBe(200);

    await navigateLocalhost(page, `/components/${c.name}`);
    const title = (await page.locator('main h1').textContent()) ?? '';
    soft(title, `${c.name}: h1 equals the dataset title`).toBe(item.title);
    const description = (await page.locator('main .item-description').textContent()) ?? '';
    soft(description, `${c.name}: description equals the dataset description`).toBe(
      item.description,
    );
    const installSection = await page.locator('main section[data-section="install"]').textContent();
    soft(
      installSection?.includes(commandFor('nativewind', c.name)),
      `${c.name}: nativewind install command present`,
    ).toBe(true);
    soft(
      installSection?.includes(commandFor('uniwind', c.name)),
      `${c.name}: uniwind install command present`,
    ).toBe(true);

    // Return to Registry for the next category.
    await navigateLocalhost(page, '/registry');
    await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
    await page.fill(INPUT, '');
    await page.locator(CATEGORY('all')).click();
  }

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-4: read the complete ledger and both commands without JavaScript
// ---------------------------------------------------------------------------
test('FLOW-GEND-07-registry-ledger-controls AC-4: 56 rows, both labeled commands, no inert controls, working Docs links without JavaScript', async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const nojsContext = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojsContext.newPage();

  await navigateLocalhost(nojsPage, '/registry');
  await nojsPage.waitForLoadState('load');
  // Primary gate: the no-JS document serves exactly 56 item rows.
  expect(
    await nojsPage.locator('tr[data-filter-text]').count(),
    'the no-JS table contains exactly 56 item rows',
  ).toBe(TOTALS.all);

  // Every row carries both labeled engine commands.
  let missingNativewind = 0;
  let missingUniwind = 0;
  const rows = nojsPage.locator('tr[data-filter-text]');
  const rowCount = await rows.count();
  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    if ((await row.locator('[data-engine-command="nativewind"]').count()) === 0) {
      missingNativewind += 1;
    }
    if ((await row.locator('[data-engine-command="uniwind"]').count()) === 0) {
      missingUniwind += 1;
    }
  }
  soft(missingNativewind, 'no row omits its nativewind command').toBe(0);
  soft(missingUniwind, 'no row omits its uniwind command').toBe(0);

  // Conversation exposes both complete commands, both readable.
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const code = nojsPage.locator(`${COMMAND('conversation', engine)} rnr-copy-button code`);
    soft(await code.count(), `conversation ${engine} command present`).toBe(1);
    await soft(code.first()).toBeVisible();
    soft(((await code.first().textContent()) ?? '').trim(), `conversation ${engine} command`).toBe(
      commandFor(engine, 'conversation'),
    );
  }

  // No inert filter controls are exposed: the un-upgraded island stays off-screen.
  soft(
    await nojsPage.locator('rnr-ledger-filter').isVisible(),
    'no functional filter control is on screen without JS',
  ).toBe(false);
  soft(
    await nojsPage.locator('rnr-ledger-filter input').isDisabled(),
    'the served filter input is inert without JS',
  ).toBe(true);

  // Representative Docs links reach their real destinations.
  for (const name of ['conversation', 'item', 'stack-trace-parser'] as const) {
    const href = await nojsPage.locator(`${ROW(name)} a[data-docs-link]`).getAttribute('href');
    soft(href, `${name}: no-JS Docs link is a real destination`).toBe(`/components/${name}`);
    const response = await nojsPage.request.get(new URL(`/components/${name}`, PREVIEW_URL).href);
    soft(response.status(), `${name}: no-JS destination returns HTTP 200`).toBe(200);
  }

  await nojsContext.close();
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls',
);

const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls';

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
  const runIdentity = `ori-ast-007-${Date.now()}`;
  mkdirSync(FLOW_EVIDENCE_DIR, { recursive: true });
  const runJson = {
    runIdentity,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      registryPage: hashFile('apps/docs/src/pages/registry.astro'),
      ledgerTable: hashFile('apps/docs/src/components/LedgerTable.astro'),
      dataTable: hashFile('apps/docs/src/components/DataTable.astro'),
      ledgerFilter: hashFile('apps/docs/src/components/islands/LedgerFilter.astro'),
      ledgerFilterScript: hashFile('apps/docs/src/scripts/ledger-filter.ts'),
      testFile: hashFile('tests/sprint-05-orient-search/registry-ledger-controls.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      distRegistry: hashFile('apps/docs/dist/registry/index.html'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-007/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red',
      'tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.red',
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
