import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * FAM-001 — FLOW-GEND-08-family-card-anatomy, authored RED-first: this spec
 * iterates every card on /components and fails verbatim (0 cards) until FAM-003
 * lands the grid composing FAM-002's ComponentCard.
 *
 * Per card, four anatomy fields assert against the real dataset read at module
 * scope — never copied literals: (1) the h3 title equals the item's title,
 * (2) the one-liner is non-empty, <=120 chars, and equals the item's
 * description or its word-boundary clamp with a trailing '…', (3) exactly one
 * category chip reading the item's registry type, (4) exactly one Expo Go
 * verdict badge whose text is exactly 'runs in Expo Go' (expoGo) or
 * 'requires a dev client' (!expoGo). The counter is the point:
 * cards_with_all_fields must equal the full registry:component set.
 *
 * Every assertion reads server-rendered DOM (no page JS), so the test stays
 * UNGUARDED and the chromium-nojs project proves the zero-JS form.
 * expect.soft accumulates every card's field diff into one failure report —
 * the RED proof's "cards_with_all_fields expected 39 / received 0" line.
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

/** TC-3: exactly the dataset description, or its word-boundary clamp + '…'. */
const DESCRIPTION_MAX = 120;

function isDescriptionOrClamp(text: string, description: string): boolean {
  if (text.length < 1 || text.length > DESCRIPTION_MAX) return false;
  if (text === description) return true;
  if (!text.endsWith('…')) return false;
  const stem = text.slice(0, -1);
  return (
    stem.length > 0 &&
    description.startsWith(stem) &&
    (stem.length === description.length || /\s/.test(description.charAt(stem.length)))
  );
}

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  expoGo: boolean;
}

const items = readJson<Item[]>('../../apps/docs/src/data/registry-items.json');
const components = items.filter((item) => item.type === 'registry:component');
const itemsByName = new Map(components.map((item) => [item.name, item]));

// Evidence JSON at the locked sprint-03 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-08-family-card-anatomy',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-08-family-card-anatomy', async ({ page }, testInfo) => {
  const soft = expect.soft;
  const response = await navigateLocalhost(page, '/components');
  soft(response?.status(), '/components must serve 200').toBe(200);

  const cards = page.locator('main a[data-card]');
  const totalCards = await cards.count();
  soft(
    totalCards,
    `cards_with_all_fields — total cards (lean-list start: 0, expected ${components.length})`,
  ).toBe(components.length);

  const seen = new Set<string>();
  let cardsWithAllFields = 0;

  for (const card of await cards.all()) {
    // A card's identity is its /components/{item} href slug.
    const href = (await card.getAttribute('href')) ?? '';
    const name = href.replace('/components/', '');
    const item = itemsByName.get(name);
    if (!item) {
      soft(false, `${href || '(no href)'} matches a registry:component`).toBe(true);
      continue;
    }
    seen.add(name);

    const title = ((await card.locator('h3').textContent()) ?? '').trim();
    const oneLiners = card.locator('p');
    const oneLinerCount = await oneLiners.count();
    const description = oneLinerCount === 1 ? ((await oneLiners.textContent()) ?? '').trim() : '';
    const chips = card.locator('.chip');
    const chipCount = await chips.count();
    const chipText = chipCount === 1 ? ((await chips.textContent()) ?? '').trim() : '';
    const badges = card.locator('.badge');
    const badgeCount = await badges.count();
    const badgeText = badgeCount === 1 ? ((await badges.textContent()) ?? '').trim() : '';

    const category = item.type.replace('registry:', '');
    const verdict = item.expoGo ? 'runs in Expo Go' : 'requires a dev client';

    const titleOk = title === item.title;
    const descriptionOk = isDescriptionOrClamp(description, item.description);
    const chipOk = chipCount === 1 && chipText === category;
    const badgeOk = badgeCount === 1 && badgeText === verdict;

    soft(titleOk, `${name}: h3 equals the dataset title`).toBe(true);
    soft(
      descriptionOk,
      `${name}: description equals the dataset field or its <=${DESCRIPTION_MAX}-char word-boundary clamp ('…')`,
    ).toBe(true);
    soft(chipCount, `${name}: exactly 1 category chip`).toBe(1);
    soft(chipText, `${name}: category chip reads ${category}`).toBe(category);
    soft(badgeCount, `${name}: exactly 1 verdict badge`).toBe(1);
    soft(badgeText, `${name}: badge reads the verdict for expoGo=${item.expoGo}`).toBe(verdict);

    if (titleOk && descriptionOk && chipOk && badgeOk) cardsWithAllFields += 1;
  }

  soft(seen.size, 'every registry:component renders exactly one card').toBe(components.length);
  soft(
    cardsWithAllFields,
    `cards_with_all_fields (lean-list start: 0, expected ${components.length})`,
  ).toBe(components.length);

  // The writer fires on a genuine full pass only — never a partial state.
  if (
    totalCards === components.length &&
    seen.size === components.length &&
    cardsWithAllFields === components.length
  ) {
    writeEvidence({
      project: testInfo.project.name,
      cards_with_all_fields: cardsWithAllFields,
      expected: components.length,
      distinctCardsSeen: seen.size,
      descriptionMaxChars: DESCRIPTION_MAX,
      verdictStrings: ['runs in Expo Go', 'requires a dev client'],
    });
  }
});
