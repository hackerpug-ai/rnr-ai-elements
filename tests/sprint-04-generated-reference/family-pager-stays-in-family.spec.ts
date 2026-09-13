import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-15-family-pager-stays-in-family, authored RED-first:
 * the within-family pager already ships (sprint-02/03), so this spec's pager
 * walk derives its whole oracle from families.json and exits 1 through the
 * shared sprint-04 anatomy preamble until REF-009 lands the five-section page.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the five-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses: per all-component family, the set of pages reachable
 * through prev/next equals the family's member set, and every pager href
 * resolves 200 in the built dist — both derived from families.json at module
 * scope, never hand-typed. Locators only (no page.evaluate); UNGUARDED across
 * chromium-desktop, chromium-mobile, and chromium-nojs, retries 0; expect.soft
 * accumulates the full diff; the writer fires on a genuine full pass only.
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
const componentNames = new Set(components.map((item) => item.name));
/** The families whose members are ALL registry:component items, in committed order. */
const componentFamilies = families
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)))
  .sort((a, b) => a.order - b.order);
const familyOf = new Map<string, Family>();
for (const family of componentFamilies) {
  for (const name of family.itemNames) familyOf.set(name, family);
}

const EXPECTED_SECTIONS = ['install', 'source', 'props', 'theming', 'usage'];
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';

/**
 * The shared sprint-04 anatomy preamble across all 39 dataset-enumerated pages.
 * Also collects every pager href seen (the family walk's raw material).
 * Returns true only when every clause held (the writer gates on it).
 */
async function sprint04AnatomyPreamble(
  page: Page,
  soft: typeof expect.soft,
  hrefsByFamily: Map<string, Set<string>>,
): Promise<boolean> {
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
      if (href && family) hrefsByFamily.get(family.id)?.add(href.replace('/components/', ''));
    }
  }
  return ok;
}

// Evidence JSON at the locked sprint-04 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-15-family-pager-stays-in-family.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-15-family-pager-stays-in-family',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-15-family-pager-stays-in-family', async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // The preamble's 39-page walk attributes every prev/next href to its family.
  const hrefsByFamily = new Map<string, Set<string>>();
  for (const family of componentFamilies) hrefsByFamily.set(family.id, new Set());
  const anatomyOk = await sprint04AnatomyPreamble(page, soft, hrefsByFamily);

  // Per family: set(pages reachable via prev/next) == set(family members).

  let walkOk = true;
  for (const family of componentFamilies) {
    const reachable = [...(hrefsByFamily.get(family.id) ?? [])].sort();
    const members = [...family.itemNames].sort();
    soft(
      reachable,
      `family ${family.id}: pages reachable via the pager (${family.itemNames.length} members)`,
    ).toEqual(members);
    walkOk &&= JSON.stringify(reachable) === JSON.stringify(members);
  }
  soft(
    componentFamilies.length,
    `component families walked (committed counts ${componentFamilies
      .map((family) => family.itemNames.length)
      .join('/')})`,
  ).toBe(componentFamilies.length);
  walkOk &&= componentFamilies.length > 0;

  // Every pager href resolves 200 in the built dist.
  const pagerHrefs = new Set<string>();
  for (const seen of hrefsByFamily.values()) {
    for (const href of seen) pagerHrefs.add(`/components/${href}`);
  }
  let hrefsOk = true;
  const non200: string[] = [];
  for (const href of pagerHrefs) {
    if (!href.startsWith('/')) {
      soft(false, `pager href must be root-relative: ${href || '(empty)'}`).toBe(true);
      hrefsOk = false;
      continue;
    }
    const status = (await request.get(new URL(href, PREVIEW_URL).href)).status();
    if (status !== 200) non200.push(`${href} -> ${status}`);
  }
  soft(non200.length, 'pager hrefs NOT returning 200').toBe(0);
  hrefsOk &&= non200.length === 0;

  if (anatomyOk && walkOk && hrefsOk) {
    writeEvidence({
      project: testInfo.project.name,
      familiesWalked: componentFamilies.map((family) => ({
        id: family.id,
        members: family.itemNames.length,
      })),
      pagerHrefsProbed: pagerHrefs.size,
      non200: non200.length,
    });
  }
});
