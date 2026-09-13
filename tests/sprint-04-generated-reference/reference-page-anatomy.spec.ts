import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-14-reference-page-anatomy, authored RED-first: this spec
 * is the locked lane for the TR-07 component-detail anatomy and fails verbatim
 * (expected five sections / received sprint-start remainder) until REF-009
 * lands the props/theming/usage regions.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every page enumerated from the REAL dataset at module scope:
 *   1. top-level section[data-section] order install, source, props, theming,
 *      usage (the five-region TR-07 anatomy),
 *   2. 0 preview-panel elements while imagery is null (T-GEND-021 — omitted,
 *      never a placeholder),
 *   3. the family pager's prev/next targets stay in-family.
 *
 * Every expectation derives from the real committed data through the
 * ENOENT-bridged readJson pattern — never hand-typed names or counts. Every
 * assertion reads server-rendered DOM via locators (no page.evaluate), so the
 * test stays UNGUARDED across chromium-desktop, chromium-mobile (the TR-07
 * mobile-frame anatomy at ~390px), and chromium-nojs with retries 0. expect.soft
 * accumulates the full shape diff into one failure report — the RED proof's
 * expected-vs-received lines. The evidence writer fires on a genuine full pass
 * only, to the locked human-flows.json artifact path.
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

interface ItemEntry {
  name: string;
  title: string;
  type: string;
  engines: string[];
  expoGo: boolean;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');
const { version: VERSION } = readJson<{ version: string }>('../../package.json');

const components = items.filter((item) => item.type === 'registry:component');
const familyOf = new Map<string, Family>();
for (const family of families) {
  for (const name of family.itemNames) familyOf.set(name, family);
}

/** The five-region TR-07 anatomy every component page must render, in order. */
const EXPECTED_SECTIONS = ['install', 'source', 'props', 'theming', 'usage'];
/** Imagery is null this sprint: the preview panel is omitted, never placeholder. */
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';

/**
 * The shared sprint-04 anatomy preamble across all 39 dataset-enumerated pages.
 * Returns true only when every clause held (the writer gates on it).
 */
async function sprint04AnatomyPreamble(page: Page, soft: typeof expect.soft): Promise<boolean> {
  let ok = true;
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= response?.status() === 200;

    // The five-section order — the sprint-04 anatomy this lane pins (RED until
    // REF-009: the sprint-start DOM renders the install/source remainder only).
    const sectionLocators = page.locator('main > section[data-section]');
    const sectionCount = await sectionLocators.count();
    const sections: string[] = [];
    for (let index = 0; index < sectionCount; index++) {
      sections.push((await sectionLocators.nth(index).getAttribute('data-section')) ?? '');
    }
    soft(
      sections,
      `${item.name}: top-level section[data-section] order — expected ${JSON.stringify(
        EXPECTED_SECTIONS,
      )}`,
    ).toEqual(EXPECTED_SECTIONS);
    ok =
      ok &&
      sections.length === EXPECTED_SECTIONS.length &&
      EXPECTED_SECTIONS.every((section, index) => sections[index] === section);

    // 0 preview-panel elements while imagery is null.
    const previewPanels = await page.locator(PREVIEW_PANEL_SELECTOR).count();
    soft(previewPanels, `${item.name}: preview-panel elements (omitted, never a placeholder)`).toBe(
      0,
    );
    ok &&= previewPanels === 0;

    // The pager stays in-family.
    const family = familyOf.get(item.name);
    for (const rel of ['prev', 'next'] as const) {
      const href = await page.locator(`nav.pager a[rel="${rel}"]`).getAttribute('href');
      const target = familyOf.get((href ?? '').replace('/components/', ''));
      soft(
        target ?? undefined,
        `${item.name}: ${rel} pager target is a dataset family member`,
      ).toBeTruthy();
      soft(target === family, `${item.name}: ${rel} pager stays in-family`).toBe(true);
      ok &&= target !== undefined && target === family;
    }
  }
  return ok;
}

// Evidence JSON at the locked sprint-04 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-14-reference-page-anatomy',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-14-reference-page-anatomy', async ({ page }, testInfo) => {
  // 39 cold navigations x section/pager reads per page, under every project.
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // Page-header facts on every page: h1 title, description, and the
  // version/category/engine/verdict chip row — dataset-derived, never typed.
  let chipsOk = true;
  const first = components[0];
  for (const item of components) {
    await navigateLocalhost(page, `/components/${item.name}`);
    const h1 = (await page.locator('main h1').textContent()) ?? '';
    soft(h1.trim(), `${item.name}: h1 is the dataset title`).toBe(item.title);
    chipsOk &&= h1.trim() === item.title;

    const chips = page.locator('main [data-chip]');
    const chipCount = await chips.count();
    const expectedChipCount = 3 + item.engines.length; // version + category + expo badge + engines
    soft(chipCount, `${item.name}: chip count (version, category, engines)`).toBe(
      expectedChipCount,
    );
    chipsOk &&= chipCount === expectedChipCount;

    const versionChip = ((await page.locator('[data-chip="version"]').textContent()) ?? '').trim();
    soft(versionChip, `${item.name}: version chip`).toBe(`v${VERSION}`);
    chipsOk &&= versionChip === `v${VERSION}`;

    const categoryChip = (
      (await page.locator('[data-chip="category"]').textContent()) ?? ''
    ).trim();
    soft(categoryChip, `${item.name}: category chip`).toBe(item.type.replace('registry:', ''));
    chipsOk &&= categoryChip === item.type.replace('registry:', '');

    const engineChips = (await page.locator('[data-chip="engine"]').allTextContents()).map((text) =>
      text.trim(),
    );
    soft(engineChips, `${item.name}: engine chips`).toEqual(item.engines);
    chipsOk &&= JSON.stringify(engineChips) === JSON.stringify(item.engines);

    // The expo chip hosts the site-wide Badge: the verdict text derives from
    // the dataset's expoGo flag, never a hand-copied string.
    const verdict = ((await page.locator('[data-chip="expo"] .badge').textContent()) ?? '').trim();
    const expectedVerdict = item.expoGo ? 'runs in Expo Go' : 'requires a dev client';
    soft(verdict, `${item.name}: verdict badge`).toBe(expectedVerdict);
    chipsOk &&= verdict === expectedVerdict;
  }
  if (!first) throw new Error('registry-items.json has no registry:component entries');

  // The source region is Code-alone: no Preview|Code tab chrome in it (the
  // never-a-placeholder contract keeps the region tab-free this sprint).
  let sourceOk = true;
  for (const item of components) {
    await navigateLocalhost(page, `/components/${item.name}`);
    const source = page.locator('main > section[data-section="source"]');
    const sourceText = (await source.textContent()) ?? '';
    soft(sourceText.trim().length > 0, `${item.name}: source region renders content`).toBe(true);
    sourceOk &&= sourceText.trim().length > 0;
    const tabChrome = await source.locator('rnr-tab-group').count();
    soft(tabChrome, `${item.name}: source region carries no tab chrome`).toBe(0);
    sourceOk &&= tabChrome === 0;
  }

  // The writer fires on a genuine full pass only — never a partial state.
  if (anatomyOk && chipsOk && sourceOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      expectedSections: EXPECTED_SECTIONS,
    });
  }
});
