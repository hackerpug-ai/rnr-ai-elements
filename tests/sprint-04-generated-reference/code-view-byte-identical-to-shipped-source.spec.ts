import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-35-code-view-byte-identical-to-shipped-source, authored
 * RED-first: pages render bare source sections today with no Code view (no
 * copy-composed code surface), so this spec exits 1 naming code_views
 * expected/received 0 for the sampled multi-file items until REF-003/REF-009
 * land the Code-alone region.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the six-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses over EVERY multi-file item (26 of 39 in the real
 * dataset — well past the >=5 sampling floor): the source region renders one
 * Code view per served file, in served order, and each view's text
 * BYTE-EQUALS the files[].content served at /r/nativewind/{item}.json — zero
 * normalization (no trim/replace), the reference-never-contradicts-the-
 * artifact invariant. The served JSON is fetched live from the preview
 * origin; nothing is mocked. Locators only (no page.evaluate); UNGUARDED
 * across chromium-desktop, chromium-mobile, and chromium-nojs, retries 0;
 * expect.soft accumulates the full diff; the writer fires on a genuine full
 * pass only.
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
  sourceFiles: { filename: string; text: string }[];
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

/** The files[] entry the registry serves at /r/{engine}/{item}.json. */
interface ServedFile {
  path: string;
  content: string;
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
const SOURCE_SECTION = 'main > section[data-section="source"]';
/** A Code view: the CodeBlock-composed copy surface carrying the file text. */
const CODE_VIEW_SELECTOR = `${SOURCE_SECTION} rnr-copy-button code`;

const multiFileItems = components.filter((item) => item.sourceFiles.length > 1);

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

// Evidence JSON at the locked sprint-04 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-35-code-view-byte-identical-to-shipped-source.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-35-code-view-byte-identical-to-shipped-source',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-35-code-view-byte-identical-to-shipped-source', async ({
  page,
  request,
}, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // The sampling floor is dataset-derived: every multi-file item is sampled,
  // and the dataset must commit well past the contracted >=5.
  soft(
    multiFileItems.length,
    'dataset sanity: multi-file items sampled (contract floor: >=5)',
  ).toBeGreaterThanOrEqual(5);

  let codeViews = 0;
  let viewsOk = true;
  let bytesOk = true;
  const byteDiffSamples: Record<string, string> = {};
  for (const item of multiFileItems) {
    const response = await request.get(`${PREVIEW_URL}/r/nativewind/${item.name}.json`);
    soft(response.status(), `${item.name}: served /r/nativewind JSON responds 200`).toBe(200);
    // Product-surface anchor: the byte oracle is served from the product's own
    // registry route — never a proxy, mirror, or fixture.
    expect(response.url(), `${item.name}: live /r/nativewind oracle`).toContain('/r/nativewind/');
    const served = (await response.json()) as { files: ServedFile[] };

    // Served file order equals the dataset's sourceFiles order (basenames).
    const servedNames = served.files.map((file) => file.path.split('/').pop() ?? '');
    const datasetNames = item.sourceFiles.map((file) => file.filename);
    soft(servedNames, `${item.name}: served files[] order equals the dataset sourceFiles`).toEqual(
      datasetNames,
    );
    viewsOk &&= JSON.stringify(servedNames) === JSON.stringify(datasetNames);

    await navigateLocalhost(page, `/components/${item.name}`);
    const views = page.locator(CODE_VIEW_SELECTOR);
    const viewCount = await views.count();
    codeViews += viewCount;
    soft(
      viewCount,
      `${item.name}: one Code view per served file (${served.files.length} served)`,
    ).toBe(served.files.length);
    viewsOk &&= viewCount === served.files.length;

    // BYTE compare — no normalization: the view's text content against the
    // served content, exactly, whitespace and trailing newlines included.
    for (let index = 0; index < Math.min(viewCount, served.files.length); index++) {
      const viewText = (await views.nth(index).textContent()) ?? '';
      soft(
        viewText === served.files[index].content,
        `${item.name} file ${index} (${served.files[index].path}): Code view byte-identical to served files[].content`,
      ).toBe(true);
      bytesOk &&= viewText === served.files[index].content;
      if (viewText !== served.files[index].content && !byteDiffSamples[item.name]) {
        byteDiffSamples[item.name] = `view ${viewText.length} chars / served ${
          served.files[index].content.length
        } chars`;
      }
    }
  }

  // The named RED counter: the sampled items' Code views (received 0 at
  // sprint start — the bare source region composes no copy surface yet).
  const expectedViews = multiFileItems.reduce((sum, item) => sum + item.sourceFiles.length, 0);
  soft(
    codeViews,
    `code_views: Code views across the ${multiFileItems.length} sampled multi-file items (expected ${expectedViews})`,
  ).toBe(expectedViews);
  viewsOk &&= codeViews === expectedViews;

  if (anatomyOk && viewsOk && bytesOk) {
    writeEvidence({
      project: testInfo.project.name,
      sampledMultiFileItems: multiFileItems.map((item) => item.name),
      codeViews: codeViews,
      byteDiffs: Object.keys(byteDiffSamples).length,
    });
  }
});
