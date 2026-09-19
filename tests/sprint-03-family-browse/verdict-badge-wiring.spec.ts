import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FAM-005 gate-step-4 browser lane — the verdict vocabulary is LIVE on every
 * surface the manifest feeds: 39/39 item pages and 56/56 ledger rows render a
 * Badge whose exact text and tone match item.expoGo from registry-items.json
 * (0 mismatches), 0 retired short-string verdict texts, 0 dead docs anchors.
 *
 * BOUNDARY (recorded honestly): the served /r/nativewind/{item}.json carries
 * NO verdict field (keys: dependencies/description/files/name/
 * registryDependencies/title/type). The >=10 sampled fetches below anchor ITEM
 * IDENTITY only — they prove the page's item is the served artifact's item,
 * not verdict truth. The holistic served-JSON gate stays Sprint 09's
 * (T-GEND-019). Verdicts are read from registry-items.json alone.
 *
 * Navigation is navigateLocalhost-only (localhost:4321, the Playwright
 * webServer's preview); retries stay 0 per the global config. Every assertion
 * reads server-rendered DOM or same-origin API fetches, so the tests stay
 * UNGUARDED and chromium-nojs proves the zero-JS form.
 */

/** Read a spec fixture, bridging a short window if the file is transiently absent. */
function readJson<T>(relative: string): T {
  const url = new URL(relative, import.meta.url);
  const deadline = Date.now() + 15_000;
  for (;;) {
    try {
      return JSON.parse(readFileSync(url, 'utf8')) as T;
    } catch (error) {
      const retryable = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!retryable || Date.now() > deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

interface DatasetItem {
  name: string;
  type: string;
  expoGo: boolean;
}

const items = readJson<DatasetItem[]>('../../apps/docs/src/data/registry-items.json');
const components = items.filter((item) => item.type === 'registry:component');
const nonComponents = items.filter((item) => item.type !== 'registry:component');

/** The verdict text + tone class derived from the manifest — never literals. */
const verdictText = (expoGo: boolean): string =>
  expoGo ? 'runs in Expo Go' : 'requires a dev client';
const toneClass = (expoGo: boolean): string => (expoGo ? 'badge--expo-go' : 'badge--dev-client');
/** The retired vocabulary this lane proves absent from every verdict slot. */
const RETIRED = ['Expo Go', 'Dev client'];

const NATIVEWIND_BASE = 'https://rnraielements.com/r/nativewind';
const UNIWIND_BASE = 'https://rnraielements.com/r/uniwind';

// Evidence JSON under this task's own .tmp lane path (not the locked
// sprint-03 e2e-evidence dir — that belongs to FAM-001/FAM-003's flows).
const EVIDENCE_PATH = join(process.cwd(), '.tmp/FAM-005/gate-step-4/verdict-badge-wiring.json');

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(EVIDENCE_PATH, JSON.stringify(observed, null, 2));
}

test('FAM-005-item-pages-badge-wiring: all 39 item pages render the Badge verdict matching item.expoGo', async ({
  page,
}) => {
  expect(components.length, 'the dataset carries the 39 registry:component items').toBe(39);

  let badgeMatches = 0;
  const mismatches: string[] = [];

  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    expect(response?.status(), `/components/${item.name} must serve 200`).toBe(200);

    const chip = page.locator('li[data-chip="expo"]');
    expect(await chip.count(), `${item.name}: exactly one expo chip`).toBe(1);

    const badge = chip.locator('.badge');
    const badgeCount = await badge.count();
    const badgeText = badgeCount === 1 ? ((await badge.textContent()) ?? '').trim() : '';
    const badgeClass = badgeCount === 1 ? ((await badge.getAttribute('class')) ?? '') : '';
    const expectedText = verdictText(item.expoGo);
    const expectedTone = toneClass(item.expoGo);

    if (
      badgeCount === 1 &&
      badgeText === expectedText &&
      badgeClass.includes(expectedTone) &&
      RETIRED.every((retired) => badgeText !== retired)
    ) {
      badgeMatches += 1;
    } else {
      mismatches.push(
        `${item.name}: badge=${JSON.stringify(badgeText)} class=${JSON.stringify(badgeClass)} ` +
          `expected=${JSON.stringify(expectedText)}/${expectedTone}`,
      );
    }
  }

  expect(mismatches, `every item page badge matches item.expoGo from the manifest`).toEqual([]);
  expect(badgeMatches, 'item pages with a matching Badge verdict').toBe(components.length);
});

test('FAM-005-ledger-badge-wiring: 56 rows render the Badge verdict, row anchors resolve, affordances survive the retarget', async ({
  page,
}) => {
  expect(items.length, 'the dataset carries all 56 items').toBe(56);
  expect(nonComponents.length, 'the dataset carries the 17 non-component rows').toBe(17);

  const response = await navigateLocalhost(page, '/registry');
  expect(response?.status(), '/registry must serve 200').toBe(200);

  const rows = page.locator('tbody tr');
  expect(await rows.count(), 'the ledger renders one row per manifest entry').toBe(items.length);

  let verdictMatches = 0;
  let anchoredRows = 0;
  const mismatches: string[] = [];

  for (const [index, item] of items.entries()) {
    // The in-page row anchor: every tr carries id={`row-${item.name}`} — the
    // target the docsHref retarget points non-component rows at.
    const rowById = page.locator(`tbody tr#row-${item.name}`);
    const row = (await rowById.count()) === 1 ? rowById : rows.nth(index);
    if ((await rowById.count()) === 1) anchoredRows += 1;

    const verdict = row.locator('td.ledger-verdict .badge');
    const badgeCount = await verdict.count();
    const badgeText = badgeCount === 1 ? ((await verdict.textContent()) ?? '').trim() : '';
    const badgeClass = badgeCount === 1 ? ((await verdict.getAttribute('class')) ?? '') : '';
    const expectedText = verdictText(item.expoGo);
    const expectedTone = toneClass(item.expoGo);

    // The docs link: component rows keep /components/{item}; every other row
    // anchors its own row in-page (derived from the dataset, never literals).
    const docsHref =
      item.type === 'registry:component' ? `/components/${item.name}` : `#row-${item.name}`;
    const renderedHref = await row.locator('td.ledger-docs a').getAttribute('href');

    if (
      badgeCount === 1 &&
      badgeText === expectedText &&
      badgeClass.includes(expectedTone) &&
      renderedHref === docsHref
    ) {
      verdictMatches += 1;
    } else {
      mismatches.push(
        `${item.name}: verdict=${JSON.stringify(badgeText)} class=${JSON.stringify(badgeClass)} ` +
          `href=${JSON.stringify(renderedHref)} expected=${JSON.stringify(expectedText)}/` +
          `${expectedTone}/${docsHref}`,
      );
    }
  }

  expect(mismatches, 'every ledger verdict, tone, and docs href matches the manifest').toEqual([]);
  expect(verdictMatches, 'ledger rows with a matching Badge verdict').toBe(items.length);
  expect(anchoredRows, 'every row carries its in-page #row- anchor target').toBe(items.length);

  // 0 dead docs anchors: each non-component href names a tr that exists above.
  for (const item of nonComponents) {
    expect(
      await page.locator(`tbody tr#row-${item.name}`).count(),
      `#row-${item.name} anchor target exists`,
    ).toBe(1);
  }

  // The retarget survivors: both engine base URLs (rendered + copyable), the
  // generated-at-build note, and the per-row copy affordances.
  const bulkAdd = page.locator('section.ledger__bulk-add');
  await expect(bulkAdd.locator('code', { hasText: NATIVEWIND_BASE })).toBeVisible();
  await expect(bulkAdd.locator('code', { hasText: UNIWIND_BASE })).toBeVisible();
  await expect(bulkAdd.locator('rnr-copy-button button')).toHaveCount(2);
  const note = (await page.locator('p.ledger__note').textContent()) ?? '';
  expect(note, 'the generated-at-build note survives').toMatch(/generated at build/i);
  expect(note, 'the note still names public/r/').toContain('public/r/');
  expect(
    await page.locator('tbody tr rnr-copy-button button').count(),
    'the per-row copy affordance survives on all 56 rows',
  ).toBe(items.length);

  writeEvidence({
    lane: 'FAM-005-verdict-badge-wiring',
    capturedAt: new Date().toISOString(),
    itemPagesWithBadge: components.length,
    ledgerRowsWithBadge: verdictMatches,
    anchoredRows,
    nonComponentAnchors: nonComponents.length,
    verdictVocabulary: ['runs in Expo Go', 'requires a dev client'],
  });
});

test('FAM-005-served-registry-identity: >=10 sampled /r/nativewind/{item}.json serve 200 with a matching name', async ({
  page,
}) => {
  // Item-identity anchor ONLY — the served JSON carries no verdict field (see
  // the lane header boundary). Sampled every 4th component + the first
  // non-component, always >=10.
  const sampled = [
    ...components.filter((_, index) => index % 4 === 0).map((item) => item.name),
    nonComponents[0]?.name,
  ].filter((name): name is string => Boolean(name));
  expect(sampled.length, 'at least 10 sampled items').toBeGreaterThanOrEqual(10);

  for (const name of sampled) {
    const served = await page.request.get(`${PREVIEW_URL}/r/nativewind/${name}.json`);
    expect(served.status(), `/r/nativewind/${name}.json must serve 200`).toBe(200);
    const body = (await served.json()) as { name?: string; verdict?: unknown };
    expect(body.name, `${name}: the served artifact names its item`).toBe(name);
    expect('verdict' in body, 'boundary holds: the served JSON carries no verdict field').toBe(
      false,
    );
  }
});
