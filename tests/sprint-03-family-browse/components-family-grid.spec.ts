import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FAM-001 — FLOW-GEND-07-components-page-39-in-7-families, authored RED-first:
 * this spec is the locked lane for the /components seven-family card grid and
 * fails verbatim (9 sections / 0 cards) until FAM-003 lands the grid.
 *
 * The oracle is the real dataset read at module scope — never typed literals:
 * the seven all-component families, their per-family card counts, the 39-name
 * multiset, and the /components/{item} href set all derive from
 * registry-items.json + families.json through the ENOENT-bridged readJson
 * pattern. A dataset change moves this spec; a hand-written page fails it.
 *
 * Every assertion reads server-rendered DOM (attribute/count/text reads only —
 * no page.evaluate, no page JS), so the test stays UNGUARDED and the
 * chromium-nojs project proves the zero-JS form. expect.soft accumulates the
 * full shape diff (7 sections / 39 cards vs 9 sections / 0 cards) into one
 * failure report — the RED proof's "expected 7 / received 9" line.
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

interface Item {
  name: string;
  type: string;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

const items = readJson<Item[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');

const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
/** The families whose members are ALL registry:component items, in committed order. */
const componentFamilies = families
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)))
  .sort((a, b) => a.order - b.order);

// Evidence JSON at the locked sprint-03 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-07-components-page-39-in-7-families.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-07-components-page-39-in-7-families',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-07-components-page-39-in-7-families', async ({ page, request }, testInfo) => {
  const soft = expect.soft;
  const response = await navigateLocalhost(page, '/components');
  soft(response?.status(), '/components must serve 200').toBe(200);

  // Exactly the component families, in committed families.json order.
  const sections = page.locator('main section[id]');
  const sectionCount = await sections.count();
  soft(
    sectionCount,
    `exactly ${componentFamilies.length} family sections (lean-list start renders ${families.length})`,
  ).toBe(componentFamilies.length);
  const sectionIds: string[] = [];
  for (let index = 0; index < sectionCount; index++) {
    sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
  }
  soft(sectionIds, 'sections render in committed families.json order').toEqual(
    componentFamilies.map((family) => family.id),
  );

  // Per family: the card count equals the family's member count, and the
  // SectionHeader count chip reads that number. The chip's value lives in a
  // <data> element in both Chip forms; card category chips never read as a
  // bare number, so the exact-text match isolates the count chip.
  const hrefs: string[] = [];
  let cardCount = 0;
  let familiesOk = true;
  for (const family of componentFamilies) {
    const section = page.locator(`main section[id="${family.id}"]`);
    const expected = family.itemNames.length;
    const cards = section.locator('a[data-card]');
    const observed = await cards.count();
    cardCount += observed;
    soft(observed, `family ${family.id} renders ${expected} cards (lean list: 0)`).toBe(expected);

    const chipValues = (await section.locator('data').allTextContents()).map((text) => text.trim());
    const countChips = chipValues.filter((value) => value === String(expected)).length;
    soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
    familiesOk &&= observed === expected && countChips === 1;

    for (const card of await cards.all()) {
      hrefs.push((await card.getAttribute('href')) ?? '');
    }
  }

  // The 39-name multiset: a card's identity is its /components/{item} href
  // slug — every registry:component name exactly once, none missing, none
  // duplicated, nothing outside the dataset.
  const slugs = hrefs.map((href) => href.replace('/components/', ''));
  soft(cardCount, `total cards (lean-list start: 0)`).toBe(components.length);
  soft(
    [...slugs].sort(),
    'card names equal the registry:component names, each exactly once',
  ).toEqual(components.map((item) => item.name).sort());

  // Every card href resolves to a real page (root-relative only — a foreign
  // href is a test bug, not a navigation).
  const statuses: number[] = [];
  for (const href of hrefs) {
    if (!href.startsWith('/')) {
      soft(false, `card href must be root-relative: ${href || '(empty)'}`).toBe(true);
      continue;
    }
    statuses.push((await request.get(new URL(href, PREVIEW_URL).href)).status());
  }
  soft(statuses.length, 'every card href probed').toBe(components.length);
  soft(statuses.filter((status) => status !== 200).length, 'card hrefs NOT returning 200').toBe(0);

  // The writer fires on a genuine full pass only — never a partial state.
  const sectionsOk =
    sectionCount === componentFamilies.length &&
    sectionIds.join('\n') === componentFamilies.map((family) => family.id).join('\n');
  const slugsOk =
    slugs.length === components.length &&
    slugs.every((slug) => componentNames.has(slug)) &&
    new Set(slugs).size === components.length;
  const hrefsOk =
    statuses.length === components.length && statuses.every((status) => status === 200);
  if (sectionsOk && familiesOk && slugsOk && hrefsOk) {
    writeEvidence({
      project: testInfo.project.name,
      sections: sectionIds,
      expectedOrder: componentFamilies.map((family) => family.id),
      cardsPerFamily: componentFamilies.map((family) => family.itemNames.length),
      totalCards: cardCount,
      probedHrefs: statuses.length,
      non200: statuses.filter((status) => status !== 200).length,
    });
  }
});
