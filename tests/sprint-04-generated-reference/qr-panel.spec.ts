import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * REF-001 riding spec — T-GEND-017-qr-panel (describe token pinned so gate
 * step 1 and REF-005 grep it mechanically). RED-first against the absent QR
 * surface: every dataset-enumerated component page must carry exactly one
 * QrPanel — REF-005's <aside data-qr-panel> with one role=img element whose
 * accessible name follows the item-derived formula — so this spec exits 1
 * naming qr_panel_count expected 39 / received 0 until REF-005 (the panel)
 * and REF-009 (the assembly) land.
 *
 * Every expectation derives from the real dataset at module scope through the
 * ENOENT-bridged readJson pattern; the aria-label formula's item segment is
 * the dataset name, never a hand-typed list. Locators only (no
 * page.evaluate); UNGUARDED across chromium-desktop, chromium-mobile, and
 * chromium-nojs, retries 0; expect.soft accumulates the full diff; the writer
 * fires on a genuine full pass only, to the token's locked artifact path.
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
  '.tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-017-qr-panel.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        token: 'T-GEND-017-qr-panel',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('T-GEND-017-qr-panel', async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  let qrPanels = 0;
  let qrOk = true;
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    qrOk &&= response?.status() === 200;

    const aside = page.locator('aside[data-qr-panel]');
    const count = await aside.count();
    qrPanels += count;
    soft(count, `${item.name}: exactly one QrPanel aside`).toBe(1);
    qrOk &&= count === 1;

    if (count > 0) {
      // The accessible name follows REF-005's item-derived formula.
      const img = aside.locator('[role="img"]');
      const imgCount = await img.count();
      soft(imgCount, `${item.name}: one role=img QR surface`).toBe(1);
      qrOk &&= imgCount === 1;
      const label = await img.getAttribute('aria-label');
      const expectedLabel = `Open the ${item.name} gallery screen in Expo Go`;
      soft(label, `${item.name}: QR accessible name is item-derived`).toBe(expectedLabel);
      qrOk &&= label === expectedLabel;

      // Build-time inline SVG: the QR graphics render as a real <svg>, never
      // an img placeholder or canvas fallback.
      const svg = await aside.locator('svg').count();
      soft(svg, `${item.name}: inline SVG QR graphics`).toBeGreaterThanOrEqual(1);
      qrOk &&= svg >= 1;
    }
  }

  // The named RED counter: qr_panel_count expected 39 / received 0.
  soft(
    qrPanels,
    `qr_panel_count: QrPanel asides across the ${components.length} enumerated pages (expected ${components.length})`,
  ).toBe(components.length);
  qrOk &&= qrPanels === components.length;

  if (qrOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      qrPanelCount: qrPanels,
    });
  }
});
