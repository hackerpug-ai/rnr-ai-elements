import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-SHELL-13-engine-tab-persists-across-pages, authored
 * RED-first: the engine tab group under storage-key rnr-engine is already
 * green from sprint-02, so this spec's persistence clauses hold today and the
 * run exits 1 through the shared sprint-04 anatomy preamble — the clause set
 * extends beyond the sprint-02 behavior precisely through that preamble —
 * until REF-009 lands the six-section page.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the six-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses: a REAL uniwind tab click (never state injection)
 * persists across a follow-on navigation and a hard load — the next page's
 * island reads the storage and renders uniwind active — with 0 engine state
 * in any URL (exact href, no query, no hash). The interaction context is
 * created fresh from the browser fixture so the identical code path runs in
 * EVERY project, including chromium-nojs, with no project guard anywhere.
 * Locators only (no page.evaluate); retries 0; expect.soft accumulates the
 * full diff; the writer fires on a genuine full pass only.
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
  type: string;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');

const components = items.filter((item) => item.type === 'registry:component');
const familyOf = new Map<string, Family>();
for (const family of families) {
  for (const name of family.itemNames) familyOf.set(name, family);
}

const EXPECTED_SECTIONS = ['install', 'dependencies', 'source', 'props', 'theming', 'usage'];
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';
const INSTALL_SECTION = 'main > section[data-section="install"]';

async function sprint04AnatomyPreamble(page: Page, soft: typeof expect.soft): Promise<boolean> {
  let ok = true;
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= response?.status() === 200;

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

    const previewPanels = await page.locator(PREVIEW_PANEL_SELECTOR).count();
    soft(previewPanels, `${item.name}: preview-panel elements (omitted, never a placeholder)`).toBe(
      0,
    );
    ok &&= previewPanels === 0;

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

/** Asserts the uniwind tab is the persisted-active one on the current page. */
async function assertUniwindActive(
  page: Page,
  soft: typeof expect.soft,
  label: string,
): Promise<boolean> {
  const tabGroup = page.locator(`${INSTALL_SECTION} rnr-tab-group[storage-key="rnr-engine"]`);
  soft(await tabGroup.count(), `${label}: the tab group binds storage-key rnr-engine`).toBe(1);
  const activeTab = page.locator(`${INSTALL_SECTION} button[role="tab"][aria-selected="true"]`);
  soft(await activeTab.count(), `${label}: exactly one active tab`).toBe(1);
  const engine = await activeTab.getAttribute('data-engine');
  soft(engine, `${label}: persisted engine renders uniwind active`).toBe('uniwind');
  const panelText = await page
    .locator(`${INSTALL_SECTION} [role="tabpanel"][data-engine="uniwind"]`)
    .getAttribute('hidden');
  soft(panelText, `${label}: the uniwind panel is the un-hidden one`).toBe(null);
  return (
    (await tabGroup.count()) === 1 &&
    (await activeTab.count()) === 1 &&
    engine === 'uniwind' &&
    panelText === null
  );
}

// Evidence JSON at the locked sprint-04 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-SHELL-13-engine-tab-persists-across-pages.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-SHELL-13-engine-tab-persists-across-pages',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-SHELL-13-engine-tab-persists-across-pages', async ({ page, browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // The persistence walk: start item and follow-on items derive from the
  // dataset's first family (>=2 members), never hand-picked names.
  const firstFamilyItems = components.filter(
    (item) => familyOf.get(item.name) === familyOf.get(components[0]?.name ?? ''),
  );
  if (firstFamilyItems.length < 3) {
    throw new Error('dataset sanity: the first family needs >=3 members for the walk');
  }
  const [startName, softNavName, hardLoadName] = firstFamilyItems.map((item) => item.name);

  // Fresh explicitly-JS-enabled context in EVERY project — identical code
  // under chromium-desktop, chromium-mobile, and chromium-nojs alike. The
  // explicit flag is load-bearing: a context created bare inside the nojs
  // project half-inherits the disabled-JS emulation and its in-page timers
  // never fire (the island-upgrade wait would hang).
  const context = await browser.newContext({ javaScriptEnabled: true });
  const walkPage = await context.newPage();

  let persistOk = true;
  await navigateLocalhost(walkPage, `/components/${startName}`);
  await waitForAstroPageLoad(walkPage, '__rnrTabGroupRegistered');

  // A REAL click selects uniwind — the island, not the test, writes storage.
  await walkPage.locator(`${INSTALL_SECTION} button[role="tab"][data-engine="uniwind"]`).click();
  const clicked = await assertUniwindActive(walkPage, soft, `${startName} after click`);
  persistOk &&= clicked;

  // Follow-on navigation (the pager link): the next page's island reads the
  // storage and renders uniwind active before any interaction.
  await walkPage.locator('nav.pager a[rel="next"]').click();
  await waitForAstroPageLoad(walkPage, '__rnrTabGroupRegistered');
  soft(walkPage.url(), `pager navigation landed on ${softNavName}`).toBe(
    `${PREVIEW_URL}/components/${softNavName}`,
  );
  persistOk &&= walkPage.url() === `${PREVIEW_URL}/components/${softNavName}`;
  const afterSoft = await assertUniwindActive(walkPage, soft, `${softNavName} after navigation`);
  persistOk &&= afterSoft;

  // Hard load: a cold goto re-reads the persisted engine.
  await navigateLocalhost(walkPage, `/components/${hardLoadName}`);
  await waitForAstroPageLoad(walkPage, '__rnrTabGroupRegistered');
  const afterHard = await assertUniwindActive(walkPage, soft, `${hardLoadName} after hard load`);
  persistOk &&= afterHard;

  // URL purity: engine state never enters any URL — the walk asserted exact
  // hrefs per step; the cold page adds no query and no hash either.
  const finalUrl = new URL(walkPage.url());
  soft(finalUrl.search, `${hardLoadName}: no query string`).toBe('');
  soft(finalUrl.hash, `${hardLoadName}: no hash fragment`).toBe('');
  persistOk &&= finalUrl.search === '' && finalUrl.hash === '';

  await context.close();

  if (anatomyOk && persistOk) {
    writeEvidence({
      project: testInfo.project.name,
      persistedEngine: 'uniwind',
      walk: [startName, softNavName, hardLoadName],
      finalUrl: walkPage.url(),
    });
  }
});
