import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-SHELL-14-tab-panels-in-initial-html, authored RED-first:
 * both engines' commands are already server-rendered into the raw pre-JS
 * HTML (sprint-02), so this spec's literal and stacked-render clauses hold
 * today and the run exits 1 through the shared sprint-04 anatomy preamble
 * until REF-009 lands the six-section page.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the six-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses over all 39 dataset-enumerated pages:
 *   1. the SERVED BYTES (request fixture — never a rendered or mocked read)
 *      contain BOTH literal engine URL strings, one per tab panel;
 *   2. with JavaScript disabled (a fresh javaScriptEnabled:false context,
 *      identical in every project) both panels render stacked and readable.
 *
 * Locators for DOM reads (no page.evaluate); UNGUARDED across
 * chromium-desktop, chromium-mobile, and chromium-nojs, retries 0;
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

/** The pinned INSTALL-command origin — Astro.site in apps/docs/astro.config.mjs. */
const SITE = 'https://rnraielements.com';
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
/** Both engines' literal URL prefixes that MUST appear in the served bytes. */
const LITERAL_NATIVEWIND = 'https://rnraielements.com/r/nativewind/';
const LITERAL_UNIWIND = 'https://rnraielements.com/r/uniwind/';

const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}${SITE}/r/${engine}/${name}.json`;

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
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-SHELL-14-tab-panels-in-initial-html.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-SHELL-14-tab-panels-in-initial-html',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-SHELL-14-tab-panels-in-initial-html', async ({ page, request, browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // The raw served bytes carry BOTH engines' literal URLs — a client-rendered
  // regression would drop one literal count to 0.
  let literalsOk = true;
  for (const item of components) {
    const response = await request.get(`${PREVIEW_URL}/components/${item.name}`);
    soft(response.status(), `${item.name}: initial HTML serves 200`).toBe(200);
    const html = await response.text();
    const nativewind = html.split(LITERAL_NATIVEWIND).length - 1;
    const uniwind = html.split(LITERAL_UNIWIND).length - 1;
    soft(
      nativewind,
      `${item.name}: literal ${LITERAL_NATIVEWIND} in the initial HTML`,
    ).toBeGreaterThanOrEqual(1);
    soft(
      uniwind,
      `${item.name}: literal ${LITERAL_UNIWIND} in the initial HTML`,
    ).toBeGreaterThanOrEqual(1);
    literalsOk &&= nativewind >= 1 && uniwind >= 1;

    // Both engines' panels are server-rendered into the raw HTML — never only
    // the active engine (the pages carry more than one tab group, so assert
    // each engine's panel id, not a page-wide count).
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const panelId = (html.match(new RegExp(`id="panel-${engine}"`, 'g')) ?? []).length;
      soft(
        panelId,
        `${item.name}: the ${engine} panel is server-rendered in the initial HTML`,
      ).toBeGreaterThanOrEqual(1);
      literalsOk &&= panelId >= 1;
    }
    const lines = html.split(CLI_PREFIX).length - 1;
    soft(lines, `${item.name}: both commands server-rendered`).toBe(2);
    literalsOk &&= lines === 2;
  }

  // No-JS form: with JavaScript disabled both panels render stacked and
  // readable (the :not(:defined) fallback) — identical probe context in every
  // project, and the natural state under chromium-nojs.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  let stackedOk = true;
  for (const item of components) {
    const response = await navigateLocalhost(noJsPage, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: no-JS navigation serves 200`).toBe(200);
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const code = noJsPage.locator(
        `${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"] rnr-copy-button code`,
      );
      const text = ((await code.textContent()) ?? '').trim();
      soft(text, `${item.name} ${engine}: stacked no-JS panel text readable`).toBe(
        commandFor(engine, item.name),
      );
      stackedOk &&= text === commandFor(engine, item.name);
    }
  }
  await noJsContext.close();

  if (anatomyOk && literalsOk && stackedOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesProbed: components.length,
      literals: [LITERAL_NATIVEWIND, LITERAL_UNIWIND],
    });
  }
});
