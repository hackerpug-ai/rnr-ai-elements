import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FAM-006 — FAM-006-home-family-teaser, authored RED-first: the home R9 lane
 * proving the teaser renders below the sprint-02 hero. Until FAM-006 lands the
 * grid this fails verbatim (0 sections / 0 cards under #families).
 *
 * The oracle is the real dataset read at module scope — never typed literals:
 * the seven all-component families, their per-family card counts, the 39-name
 * multiset, the badge verdict text/tone per item.expoGo (FAM-005 vocabulary),
 * and the hero counters all derive from registry-items.json + families.json +
 * the root package.json through the ENOENT-bridged readJson pattern. A dataset
 * change moves this spec; a hand-written page fails it.
 *
 * Every assertion reads server-rendered DOM (attribute/count/text reads only —
 * no page.evaluate, no page JS), so the test stays UNGUARDED and the
 * chromium-nojs project proves the zero-JS teaser form. expect.soft accumulates
 * the full shape diff into one failure report — the RED proof's lines.
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
  expoGo: boolean;
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

/** The FAM-005 verdict vocabulary — Badge's VERDICTS map, mirrored for the oracle. */
const verdictText = (expoGo: boolean): string =>
  expoGo ? 'runs in Expo Go' : 'requires a dev client';
const toneClass = (expoGo: boolean): string => (expoGo ? 'badge--expo-go' : 'badge--dev-client');

/** Hero counters re-derived from the real artifacts — never hand-copied literals. */
function expectedHeroCounters(): Record<string, string> {
  const version = (
    JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string }
  ).version;
  return {
    version,
    total: String(items.length),
    components: String(components.length),
    ui: String(items.filter((item) => item.type === 'registry:ui').length),
    libs: String(items.filter((item) => item.type === 'registry:lib').length),
  };
}

// Evidence JSON at the sprint-03 e2e-evidence path (gate-step artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-03-family-browse/e2e-evidence/FAM-006-home-family-teaser.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FAM-006-home-family-teaser',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FAM-006-home-family-teaser: seven anchored family sections below the intact hero, 39 verdict-badged cards, computed hero counters', async ({
  page,
  request,
}, testInfo) => {
  const soft = expect.soft;
  const response = await navigateLocalhost(page, '/');
  soft(response?.status(), '/ must serve 200').toBe(200);

  // The sprint-02 hero stays intact ABOVE the teaser: all five counters equal
  // the run-time-computed values (a detached hardcoded literal fails here).
  const hero = page.locator('main.hero');
  const expectedCounters = expectedHeroCounters();
  const observedCounters: Record<string, string> = {};
  for (const [name, value] of Object.entries(expectedCounters)) {
    const text = await hero.locator(`[data-counter="${name}"]`).textContent();
    soft(text, `hero counter ${name}`).toBe(value);
    observedCounters[name] = text ?? '';
  }

  // The teaser landmark: exactly one #families, labeled, fully below the hero.
  const teaser = page.locator('section#families');
  soft(await teaser.count(), 'exactly one #families landmark').toBe(1);
  soft(await teaser.getAttribute('aria-label'), 'the landmark carries its label').toBe(
    'Component families',
  );
  const heroBox = await hero.boundingBox();
  const teaserBox = await teaser.boundingBox();
  if (heroBox && teaserBox) {
    soft(
      heroBox.y + heroBox.height,
      'the hero sits fully above the teaser (hero bottom <= teaser top)',
    ).toBeLessThanOrEqual(teaserBox.y);
  }

  // Exactly the component families, in committed families.json order.
  const sections = teaser.locator('section[id]');
  const sectionCount = await sections.count();
  soft(sectionCount, `exactly ${componentFamilies.length} family sections`).toBe(
    componentFamilies.length,
  );
  const sectionIds: string[] = [];
  for (let index = 0; index < sectionCount; index++) {
    sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
  }
  soft(sectionIds, 'teaser sections render in committed families.json order').toEqual(
    componentFamilies.map((family) => family.id),
  );

  // Per family: the card count equals the family's member count and the
  // SectionHeader count chip reads that number (counter-less Chip form).
  const hrefs: string[] = [];
  let cardCount = 0;
  let familiesOk = true;
  for (const family of componentFamilies) {
    const section = teaser.locator(`section[id="${family.id}"]`);
    const expected = family.itemNames.length;
    const cards = section.locator('a[data-card]');
    const observed = await cards.count();
    cardCount += observed;
    soft(observed, `family ${family.id} renders ${expected} cards`).toBe(expected);

    const chipValues = (await section.locator('.section-header .chip').allTextContents()).map(
      (text) => text.trim(),
    );
    const countChips = chipValues.filter((value) => value === String(expected)).length;
    soft(countChips, `family ${family.id} count chip reads ${expected}`).toBe(1);
    familiesOk &&= observed === expected && countChips === 1;

    for (const card of await cards.all()) {
      hrefs.push((await card.getAttribute('href')) ?? '');
    }
  }

  // The 39-name multiset: every registry:component name exactly once.
  const slugs = hrefs.map((href) => href.replace('/components/', ''));
  soft(cardCount, `total teaser cards`).toBe(components.length);
  soft(slugs.sort(), 'card names equal the registry:component names, each exactly once').toEqual(
    components.map((item) => item.name).sort(),
  );

  // Every card's badge matches its item's expoGo verdict — text AND tone class
  // from the dataset (FAM-005 vocabulary through ComponentCard's Badge).
  const itemsByName = new Map(components.map((item) => [item.name, item]));
  const badgeTexts = new Set<string>();
  let badgesOk = true;
  const badgeMismatches: string[] = [];
  for (let index = 0; index < hrefs.length; index++) {
    const slug = hrefs[index].replace('/components/', '');
    const item = itemsByName.get(slug);
    const badge = teaser.locator('a[data-card]').nth(index).locator('.badge');
    const text = ((await badge.textContent()) ?? '').trim();
    const className = (await badge.getAttribute('class')) ?? '';
    badgeTexts.add(text);
    if (!item || text !== verdictText(item.expoGo) || !className.includes(toneClass(item.expoGo))) {
      badgesOk = false;
      badgeMismatches.push(`${slug}: '${text}' / '${className}'`);
    }
  }
  soft(badgeMismatches, 'every card badge matches item.expoGo (text + tone)').toEqual([]);
  soft(
    [...badgeTexts].every((text) => text === 'runs in Expo Go' || text === 'requires a dev client'),
    'the rendered verdict vocabulary stays within the two-state set',
  ).toBe(true);

  // Every card href resolves to a real page (root-relative only).
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

  await testInfo.attach('fam-006-home-family-teaser-fullpage', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });

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
  if (sectionsOk && familiesOk && slugsOk && hrefsOk && badgesOk) {
    writeEvidence({
      project: testInfo.project.name,
      heroCounters: observedCounters,
      sections: sectionIds,
      expectedOrder: componentFamilies.map((family) => family.id),
      cardsPerFamily: componentFamilies.map((family) => family.itemNames.length),
      totalCards: cardCount,
      badgeTexts: [...badgeTexts],
      probedHrefs: statuses.length,
      non200: statuses.filter((status) => status !== 200).length,
    });
  }
});
