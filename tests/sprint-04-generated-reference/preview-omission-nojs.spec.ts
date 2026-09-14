import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 riding spec — T-GEND-021-preview-omission-nojs (describe token
 * pinned so gate step 1 and later tasks grep it mechanically). The imagery
 * registry is null this sprint: the preview panel is OMITTED on every
 * dataset-enumerated component page — never a placeholder, never a coming-soon
 * stub — and the rest of the page stays intact and readable with JavaScript
 * disabled. The omission clauses hold at sprint start and stay green as the
 * sprint-04 regions land; the loop keeps them from regressing.
 *
 * The page set and the intact-section expectations derive from the real
 * dataset at module scope through the ENOENT-bridged readJson pattern. The
 * no-JS probe runs in a fresh javaScriptEnabled:false context — identical in
 * every project, the natural state under chromium-nojs — with no project
 * guard anywhere. Locators only (no page.evaluate); retries 0; expect.soft
 * accumulates the full diff; the writer fires on a genuine full pass only, to
 * the token's locked artifact path.
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

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const components = items.filter((item) => item.type === 'registry:component');

// Evidence JSON at the locked sprint-04 riding-spec path.
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-021-preview-omission-nojs.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        token: 'T-GEND-021-preview-omission-nojs',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('T-GEND-021-preview-omission-nojs', async ({ page, request, browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // Omission + intactness on every page, in the project's own context.
  let omissionOk = true;
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    omissionOk &&= response?.status() === 200;

    const served = await request.get(`${PREVIEW_URL}/components/${item.name}`);
    const html = (await served.text()) ?? '';
    const previewPanels = await page.locator('[data-preview-panel], .preview-panel').count();
    soft(previewPanels, `${item.name}: 0 preview-panel elements`).toBe(0);
    omissionOk &&= previewPanels === 0;

    // Stub phrases a placeholder panel would carry — words verified absent
    // from the real dataset (source listings legitimately contain
    // "placeholder"/"TODO", so those two are covered structurally by the
    // 0-element count above, not by string probes).
    for (const stub of ['coming soon', 'lorem ipsum']) {
      const present = html.toLowerCase().includes(stub);
      soft(present, `${item.name}: 0 "${stub}" stub text in the served bytes`).toBe(false);
      omissionOk &&= !present;
    }

    // Other sections stay intact: the install and source regions render, and
    // the source content is real (never an empty stub).
    const installText =
      (await page.locator('main > section[data-section="install"]').textContent()) ?? '';
    soft(installText.trim().length > 0, `${item.name}: install section intact`).toBe(true);
    omissionOk &&= installText.trim().length > 0;
    const sourceText =
      (await page.locator('main > section[data-section="source"]').textContent()) ?? '';
    soft(sourceText.trim().length > 0, `${item.name}: source section intact and non-empty`).toBe(
      true,
    );
    omissionOk &&= sourceText.trim().length > 0;
  }

  // The no-JS form: with JavaScript disabled the same pages render intact and
  // readable — the omission never degrades the zero-JS reading path.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  let noJsOk = true;
  for (const item of components) {
    const response = await navigateLocalhost(noJsPage, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: no-JS navigation serves 200`).toBe(200);
    noJsOk &&= response?.status() === 200;

    const previewPanels = await noJsPage.locator('[data-preview-panel], .preview-panel').count();
    soft(previewPanels, `${item.name}: 0 preview-panel elements under no JS`).toBe(0);
    noJsOk &&= previewPanels === 0;

    const bodyText = (await noJsPage.locator('main').textContent()) ?? '';
    soft(bodyText.trim().length > 0, `${item.name}: main content readable under no JS`).toBe(true);
    noJsOk &&= bodyText.trim().length > 0;
  }
  await noJsContext.close();

  if (omissionOk && noJsOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesProbed: components.length,
      previewPanels: 0,
    });
  }
});
