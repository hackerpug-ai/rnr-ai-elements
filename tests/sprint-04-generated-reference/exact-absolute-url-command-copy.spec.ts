import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-20-exact-absolute-url-command-copy, authored RED-first:
 * the engine-tabbed install block already ships (sprint-02), so this spec's
 * clipboard and served-byte clauses hold today and the run exits 1 through the
 * shared sprint-04 anatomy preamble until REF-009 lands the five-section page.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the five-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses over all 39 dataset-enumerated pages:
 *   1. served bytes: exactly two command lines (one per engine tab), both
 *      absolute-URL forms, no relative add form, no un-tabbed duplicates;
 *   2. per engine tab, one click copies exactly the locked regex shape with
 *      the displayed text equal to the granted real clipboard (success by
 *      VALUE within 500 ms) — the clipboard context is created fresh from the
 *      browser fixture so the identical code path runs in EVERY project,
 *      including chromium-nojs, with no project guard anywhere.
 *
 * Locators for all DOM reads; the only page.evaluate is the sanctioned
 * navigator.clipboard.readText (the harness's clipboard contract). expect.soft
 * accumulates the full diff; the writer fires on a genuine full pass only.
 */

// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard read needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

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

const EXPECTED_SECTIONS = ['install', 'source', 'props', 'theming', 'usage'];
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';
const INSTALL_SECTION = 'main > section[data-section="install"]';

/** The pinned INSTALL-command origin — Astro.site in apps/docs/astro.config.mjs. */
const SITE = 'https://rnraielements.com';
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';

const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}${SITE}/r/${engine}/${name}.json`;

// The locked command shape (human-flows.json): absolute-URL, engine in the
// path, never a short-name or relative form.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

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
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-20-exact-absolute-url-command-copy.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        flow: 'FLOW-GEND-20-exact-absolute-url-command-copy',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-20-exact-absolute-url-command-copy', async ({ page, browser }, testInfo) => {
  // 39 cold navigations x 2 engine tabs x (tab click + copy + value asserts +
  // clipboard read) per project legitimately exceeds the 30 s default — a
  // budget for the contracted enumeration, never a retry.
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // Served bytes on every page: exactly two tabbed command lines, no relative
  // or un-tabbed duplicate forms, the storage key bound.
  let bytesOk = true;
  for (const item of components) {
    const response = await page.goto(`${PREVIEW_URL}/components/${item.name}`);
    expect(response?.status(), item.name).toBe(200);
    const html = (await response?.text()) ?? '';
    const lines = html.split(CLI_PREFIX).length - 1;
    soft(lines, `${item.name}: command-line count (one per engine tab)`).toBe(2);
    bytesOk &&= lines === 2;
    const keyed = html.includes('storage-key="rnr-engine"');
    soft(keyed, `${item.name}: tab group carries storage-key rnr-engine`).toBe(true);
    bytesOk &&= keyed;
    const relative = html.includes('add /r/');
    soft(relative, `${item.name}: 0 relative add forms`).toBe(false);
    bytesOk &&= !relative;
    const untabbed = html.includes('install-row');
    soft(untabbed, `${item.name}: 0 un-tabbed duplicate forms`).toBe(false);
    bytesOk &&= !untabbed;
  }

  // Clipboard proof on EVERY enumerated page, per engine tab: the fresh
  // explicitly-JS-enabled context runs the identical unguarded code path under
  // chromium-desktop, chromium-mobile, and chromium-nojs alike. The explicit
  // flag is load-bearing: a context created bare inside the nojs project
  // half-inherits the disabled-JS emulation and its in-page timers never fire.
  const clipboardContext = await browser.newContext({ javaScriptEnabled: true });
  await grantClipboardPermissions(clipboardContext);
  const clipboardPage = await clipboardContext.newPage();

  let copied = 0;
  let clipboardOk = true;
  const sample: Record<string, string> = {};
  for (const item of components) {
    const response = await navigateLocalhost(clipboardPage, `/components/${item.name}`);
    expect(response?.status(), `${item.name} must serve 200`).toBe(200);
    await waitForAstroPageLoad(clipboardPage, '__rnrTabGroupRegistered');

    for (const engine of ['nativewind', 'uniwind'] as const) {
      // Activation is the only path to an un-hidden panel.
      await clipboardPage
        .locator(`${INSTALL_SECTION} [role="tab"][data-engine="${engine}"]`)
        .click();
      const panel = clipboardPage.locator(
        `${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"]`,
      );
      const displayed = ((await panel.locator('rnr-copy-button code').textContent()) ?? '').trim();
      soft(displayed, `${item.name} ${engine} displayed command`).toBe(
        commandFor(engine, item.name),
      );
      clipboardOk &&= displayed === commandFor(engine, item.name);

      const trigger = panel.locator('rnr-copy-button button');
      await trigger.click();
      // Success shows by VALUE within 500 ms of the click — never a class name.
      await soft(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
      clipboardOk &&= (await trigger.getAttribute('data-state')) === 'copied';

      // Clipboard CONTENT is the oracle: displayed equality plus the locked
      // shape regex (no trailing newline, no short-name or relative form).
      const clipboard = await clipboardPage.evaluate(() => navigator.clipboard.readText());
      soft(clipboard, `${item.name} ${engine} clipboard equals displayed panel text`).toBe(
        displayed,
      );
      clipboardOk &&= clipboard === displayed;
      soft(clipboard, `${item.name} ${engine} clipboard shape`).toMatch(COMMAND_PATTERN);
      clipboardOk &&= COMMAND_PATTERN.test(clipboard);
      copied += 1;
      if (item.name === 'shimmer') sample[engine] = clipboard;
    }
  }
  soft(
    copied,
    `one clipboard read per engine per enumerated page (${components.length} pages x 2)`,
  ).toBe(components.length * 2);
  clipboardOk &&= copied === components.length * 2;
  await clipboardContext.close();

  if (anatomyOk && bytesOk && clipboardOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      clipboardReads: copied,
      shimmerSample: sample,
    });
  }
});
