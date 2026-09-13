import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * REF-001 riding spec — T-GEND-020-dev-client-matrix (describe token pinned
 * so gate step 1, REF-007, and REF-010 grep it mechanically). RED-first on
 * the absent matrix surface: /components must render the dev-client matrix
 * from REF-007's dev-client-matrix.json — every entry's label, each peer, and
 * each permission string rendered — so this spec exits 1 until REF-007
 * (the dataset) and REF-010 (DevClientMatrix on the page) land. The dataset
 * read is the ENOENT-bridged pattern: until REF-007 authors the file the run
 * names exactly that absent input.
 *
 * Every expectation derives from the real authored dataset at module scope —
 * the 4-entry ids/labels/peers/permissions are read, never hand-typed.
 * Locators only (no page.evaluate); UNGUARDED across chromium-desktop,
 * chromium-mobile, and chromium-nojs, retries 0; expect.soft accumulates the
 * full diff; the writer fires on a genuine full pass only, to the token's
 * locked artifact path.
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

interface MatrixEntry {
  id: string;
  label: string;
  peers: { name: string; range: string }[];
  permissions: { ios: string[]; android: string[] };
}

const matrix = readJson<MatrixEntry[]>('../../apps/docs/src/data/dev-client-matrix.json');

// Evidence JSON at the locked sprint-04 riding-spec path.
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-020-dev-client-matrix.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        token: 'T-GEND-020-dev-client-matrix',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('T-GEND-020-dev-client-matrix', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  const soft = expect.soft;

  const response = await navigateLocalhost(page, '/components');
  soft(response?.status(), '/components serves 200').toBe(200);

  // The matrix renders every authored entry: label, every peer, and every
  // permission string readable on the page — derived from the dataset, never
  // a canned sample.
  const mainText = (await page.locator('main').textContent()) ?? '';
  let matrixOk = true;
  for (const entry of matrix) {
    const labelListed = mainText.includes(entry.label);
    soft(labelListed, `matrix lists ${entry.id} (label "${entry.label}")`).toBe(true);
    matrixOk &&= labelListed;

    for (const peer of entry.peers) {
      const peerListed = mainText.includes(peer.name);
      soft(peerListed, `matrix lists ${entry.id} peer ${peer.name}`).toBe(true);
      matrixOk &&= peerListed;
    }

    for (const permission of [...entry.permissions.ios, ...entry.permissions.android]) {
      const permissionListed = mainText.includes(permission);
      soft(permissionListed, `matrix lists ${entry.id} permission ${permission}`).toBe(true);
      matrixOk &&= permissionListed;
    }
  }

  soft(matrix.length, 'matrix entries rendered from dev-client-matrix.json (contract: 4)').toBe(4);
  matrixOk &&= matrix.length === 4;

  if (matrixOk) {
    writeEvidence({
      project: testInfo.project.name,
      entriesRendered: matrix.map((entry) => entry.id),
      peersChecked: matrix.reduce((sum, entry) => sum + entry.peers.length, 0),
    });
  }
});
