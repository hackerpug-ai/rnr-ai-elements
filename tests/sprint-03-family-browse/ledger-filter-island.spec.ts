import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, test } from '@playwright/test';
import { oneLineDescription } from '../../apps/docs/src/lib/one-line-description';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * FAM-004 — the browser lane for the rnr-ledger-filter island over the REAL
 * built site served by astro preview (gate-step-5 proof).
 *
 * The oracle is the real dataset read at module scope — never typed literals:
 * the narrowing query is the first card's own title, and the expected visible
 * card/section counts derive from matching that query against every card's
 * data-filter-text join (title + one-liner + category) across all seven
 * families, exactly as the page renders it. A dataset change moves this spec;
 * a filter that matches by hardcoded names fails it.
 *
 * FAM-004-nojs-full-grid stays UNGUARDED on purpose: under the chromium-nojs
 * project it proves the zero-JS form (full grid, input inert) rather than
 * skipping it. The typing-dependent tests skip on JS-disabled projects —
 * a disabled input cannot receive text, and that inertness is itself
 * asserted by the unguarded test.
 *
 * TR-10: every test re-reads page.url() after interacting and expects the
 * exact pre-interaction URL — the filter never touches the address bar.
 */

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

/** Read a spec fixture from the real dataset (same precedent as FAM-001). */
function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(join(repoRoot, relative), 'utf8')) as T;
}

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

const items = readJson<Item[]>('apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('apps/docs/src/data/families.json');
const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
const componentFamilies = families
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)))
  .sort((a, b) => a.order - b.order);

/** The join the page bakes into each card's data-filter-text (FAM-003). */
function filterTextFor(item: Item): string {
  return [item.title, oneLineDescription(item.description), item.type.replace('registry:', '')]
    .join(' ')
    .toLowerCase();
}

const itemsByName = new Map(components.map((item) => [item.name, item]));

/**
 * The narrowing query: the first card of the first family, by its own title.
 * Expected visibility derives from the same join the page renders.
 */
const firstFamily = componentFamilies[0];
const firstItemName = firstFamily.itemNames[0];
const firstItem = itemsByName.get(firstItemName);
if (!firstItem) throw new Error(`family ${firstFamily.id} names unknown item ${firstItemName}`);
const QUERY = firstItem.title.toLowerCase();

/** Cards matching the query, and how many families stay on screen. */
const matchingNames = new Set(
  components.filter((item) => filterTextFor(item).includes(QUERY)).map((item) => item.name),
);
const expectedVisibleCards = matchingNames.size;
const expectedVisibleSections = componentFamilies.filter((family) =>
  family.itemNames.some((name) => matchingNames.has(name)),
).length;

// The dataset must give the narrowing case teeth: the query matches something,
// hides something, and empties at least one whole family.
expect(QUERY.trim().length, 'the derived query is non-empty').toBeGreaterThan(0);
expect(expectedVisibleCards, 'the query matches at least one card').toBeGreaterThanOrEqual(1);
expect(expectedVisibleCards, 'the query hides at least one card').toBeLessThan(components.length);
expect(expectedVisibleSections, 'the query empties at least one family section').toBeLessThan(
  componentFamilies.length,
);

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

const INPUT = 'rnr-ledger-filter input';

async function visibleCardCount(page: Page): Promise<number> {
  return page.locator('main a[data-card]:visible').count();
}

async function visibleSectionCount(page: Page): Promise<number> {
  return page.locator('main section[id]:visible').count();
}

test('FAM-004-filter-narrows-and-clears', async ({ page }, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'typing needs a JS-enabled project; the zero-JS form has its own unguarded test',
  );
  await navigateLocalhost(page, '/components');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  // Served baseline: all 39 cards in all 7 sections, input live.
  expect(await visibleCardCount(page), 'the served grid shows all 39 cards').toBe(
    components.length,
  );
  expect(await visibleSectionCount(page), 'all 7 family sections start visible').toBe(
    componentFamilies.length,
  );

  // Narrow: type the first card's own title. Visibility must equal the
  // dataset-derived oracle — nothing more, nothing less.
  const urlBefore = page.url();
  await page.fill(INPUT, QUERY);
  expect(await visibleCardCount(page), `cards visible for "${QUERY}"`).toBe(expectedVisibleCards);
  expect(await visibleSectionCount(page), 'sections still showing matches').toBe(
    expectedVisibleSections,
  );
  expect(page.url(), 'narrowing never touches the URL (TR-10)').toBe(urlBefore);

  // Clear: the full grid comes back — every card, every section, no row.
  await page.fill(INPUT, '');
  expect(await visibleCardCount(page), 'clearing restores all 39 cards').toBe(components.length);
  expect(await visibleSectionCount(page), 'clearing restores all 7 sections').toBe(
    componentFamilies.length,
  );
  expect(await page.locator('[data-no-results]').isVisible(), 'no-results row stays hidden').toBe(
    false,
  );
  expect(page.url(), 'clearing never touches the URL (TR-10)').toBe(urlBefore);
});

test('FAM-004-no-results-url-stability', async ({ page }, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'typing needs a JS-enabled project; the zero-JS form has its own unguarded test',
  );
  await navigateLocalhost(page, '/components');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  const urlBefore = page.url();
  await page.fill(INPUT, 'zzqx no such component exists');
  expect(await visibleCardCount(page), 'a matchless query shows 0 cards').toBe(0);
  expect(await visibleSectionCount(page), 'every emptied section hides with its header').toBe(0);
  const noResults = page.locator('[data-no-results]');
  await expect(noResults, 'the one muted no-results row appears').toBeVisible();
  expect(
    ((await noResults.textContent()) ?? '').trim().length,
    'the row explains the state',
  ).toBeGreaterThan(0);
  expect(page.url(), 'the URL is byte-identical after filtering (TR-10)').toBe(urlBefore);

  // Clearing out of the zero-match state brings the full grid back.
  await page.fill(INPUT, '');
  expect(await visibleCardCount(page), 'clearing restores all 39 cards').toBe(components.length);
  expect(await noResults.isVisible(), 'the no-results row hides again').toBe(false);
  expect(page.url(), 'still the exact pre-interaction URL').toBe(urlBefore);
});

test('FAM-004-nojs-full-grid', async ({ page }, testInfo) => {
  // Unguarded on purpose: the chromium-nojs project proves the zero-JS form —
  // the full grid renders and the input is inert — while JS-enabled projects
  // prove the same grid with the input upgraded live. The post-load settle is
  // JS-only: page.evaluate cannot run in the nojs project, and the served DOM
  // is already complete there.
  await navigateLocalhost(page, '/components');
  if (!projectHasNoJs(testInfo)) await waitForAstroPageLoad(page);

  const sections = page.locator('main section[id]');
  expect(await sections.count(), 'all 7 family sections render without JS').toBe(
    componentFamilies.length,
  );
  const cards = page.locator('main a[data-card]');
  expect(await cards.count(), 'all 39 cards render without JS').toBe(components.length);
  expect(await visibleCardCount(page), 'the island hides nothing on a fresh load').toBe(
    components.length,
  );

  // The input: inert (disabled, and the un-upgraded element display:none) with
  // no JS; upgraded live (enabled, visible) with JS.
  const input = page.locator(INPUT);
  if (projectHasNoJs(testInfo)) {
    expect(await input.isVisible(), 'no functional input is on screen without JS').toBe(false);
    expect(await input.isDisabled(), 'the served input is inert without JS').toBe(true);
  } else {
    await expect(input, 'the upgrade enables the input').toBeEnabled();
    await expect(input, 'the upgraded control is visible').toBeVisible();
  }
});

test('FAM-004-a11y-and-init', async ({ page }, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'the upgrade-time observables need a JS-enabled project; the unguarded test covers zero-JS',
  );
  await navigateLocalhost(page, '/components');

  // Init: the island registered exactly once via its window guard.
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');
  expect(await page.locator('rnr-ledger-filter').count(), 'exactly one island on the page').toBe(1);

  // WAI-ARIA search-box pattern: one named input inside one search landmark.
  // The site-wide search dialog (sprint-05 FLOW-SHELL-15) is a second,
  // separately labeled role=search landmark; the filter island's landmark is
  // the rnr-ledger-filter host itself.
  const input = page.locator(INPUT);
  const ariaLabel = await input.getAttribute('aria-label');
  expect(ariaLabel?.trim().length ?? 0, 'the input announces an accessible name').toBeGreaterThan(
    0,
  );
  expect(
    await page.locator('rnr-ledger-filter[role="search"]').count(),
    'one role=search landmark on the filter island',
  ).toBe(1);
  await expect(input, 'the live input is enabled').toBeEnabled();

  // Focus ring: a text input focused via keyboard always matches
  // :focus-visible; the global contract paints the 2px --ring outline.
  await input.focus();
  const focusState = await input.evaluate((element) => {
    // Browser-context callback typed structurally through globalThis: this
    // repo's tsconfig carries no DOM lib (same precedent as the harness).
    const el = element as { matches(query: string): boolean };
    const style = (
      globalThis as unknown as {
        getComputedStyle(el: { matches(query: string): boolean }): {
          outlineWidth: string;
          outlineStyle: string;
        };
      }
    ).getComputedStyle(el);
    return {
      focusVisible: el.matches(':focus-visible'),
      outlineWidth: style.outlineWidth,
      outlineStyle: style.outlineStyle,
    };
  });
  expect(focusState.focusVisible, 'keyboard focus lands on the input').toBe(true);
  expect(focusState.outlineStyle, 'the focus ring paints a solid outline').toBe('solid');
  expect(focusState.outlineWidth, 'the focus ring is the 2px contract').toBe('2px');
});
