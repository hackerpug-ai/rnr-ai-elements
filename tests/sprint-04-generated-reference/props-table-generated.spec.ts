import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-34-props-table-generated, authored RED-first: no page
 * renders a props region yet while all 39 dataset entries carry non-empty
 * props[], so this spec exits 1 naming props_tables expected 39 / received 0
 * until REF-002 (the primitive) and REF-009 (the region) land.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the five-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses on every page: exactly one props table inside
 * section[data-section="props"] with the Name/Type/Default/Description header
 * row, one row per dataset prop, and name/type/default cells equal to the
 * dataset's resolved text (never any/unknown placeholders, em-dash for null).
 * Every expectation derives from the real dataset at module scope. Locators
 * only (no page.evaluate); UNGUARDED across chromium-desktop, chromium-mobile,
 * and chromium-nojs, retries 0; expect.soft accumulates the full diff; the
 * writer fires on a genuine full pass only.
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

interface PropEntry {
  name: string;
  type: string;
  default: string | null;
  description: string | null;
}

interface ItemEntry {
  name: string;
  type: string;
  props: PropEntry[];
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

const EXPECTED_SECTIONS = ['install', 'source', 'props', 'theming', 'usage'];
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';
const PROPS_SECTION = 'main > section[data-section="props"]';
const EXPECTED_HEADERS = ['Name', 'Type', 'Default', 'Description'];
/** The null cell form REF-002's PropsTable pins (never an empty or 'unknown' cell). */
const NULL_CELL = '—';

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
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-34-props-table-generated.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-34-props-table-generated',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-34-props-table-generated', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // Every dataset entry carries non-empty props[] — the expectation cannot
  // collapse to a vacuous pass over 0 tables.
  soft(
    components.filter((item) => item.props.length > 0).length,
    'dataset sanity: every registry:component carries >=1 prop',
  ).toBe(components.length);

  // The named RED counter: one generated table per page, 39 expected.
  let propsTables = 0;
  let tablesOk = true;
  for (const item of components) {
    await navigateLocalhost(page, `/components/${item.name}`);
    const section = page.locator(PROPS_SECTION);
    const tables = await section.locator('table').count();
    propsTables += tables;
    soft(tables, `${item.name}: exactly one props table`).toBe(1);
    tablesOk &&= tables === 1;

    const headers = (await section.locator('thead th').allTextContents()).map((text) =>
      text.trim(),
    );
    soft(headers, `${item.name}: props table headers`).toEqual(EXPECTED_HEADERS);
    tablesOk &&= JSON.stringify(headers) === JSON.stringify(EXPECTED_HEADERS);

    const rows = section.locator('tbody tr');
    const rowCount = await rows.count();
    soft(rowCount, `${item.name}: one row per dataset prop`).toBe(item.props.length);
    tablesOk &&= rowCount === item.props.length;

    for (let index = 0; index < Math.min(rowCount, item.props.length); index++) {
      const cells = rows.nth(index).locator('td');
      const name = ((await cells.nth(0).textContent()) ?? '').trim();
      const type = ((await cells.nth(1).textContent()) ?? '').trim();
      const fallback = ((await cells.nth(2).textContent()) ?? '').trim();
      const prop = item.props[index];
      soft(name, `${item.name} prop ${index}: name cell equals the dataset`).toBe(prop.name);
      tablesOk &&= name === prop.name;
      soft(type, `${item.name} prop ${index}: type cell is the dataset's resolved text`).toBe(
        prop.type,
      );
      tablesOk &&= type === prop.type;
      // Resolved text, never placeholders.
      tablesOk &&= type !== '' && type !== 'any' && type !== 'unknown';
      soft(
        fallback,
        `${item.name} prop ${index}: default cell equals the dataset value or the em-dash`,
      ).toBe(prop.default ?? NULL_CELL);
      tablesOk &&= fallback === (prop.default ?? NULL_CELL);
    }
  }

  // conversation pins the row oracle: 5 dataset props, 5 rendered rows.
  const conversation = components.find((item) => item.name === 'conversation');
  if (!conversation) throw new Error('registry-items.json has no `conversation` entry');
  soft(conversation.props.length, 'conversation: dataset prop count').toBe(5);

  soft(
    propsTables,
    `props_tables: rendered props tables across the ${components.length} enumerated pages (expected ${components.length})`,
  ).toBe(components.length);
  tablesOk &&= propsTables === components.length;

  if (anatomyOk && tablesOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      propsTables: propsTables,
      conversationRows: conversation.props.length,
    });
  }
});
