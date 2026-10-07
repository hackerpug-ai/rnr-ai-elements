import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { grantClipboardPermissions, navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * FUSE-06 TC-1..TC-5 — the generated /registry ledger on the real built site
 * served by the FUSE-10 runner (`pnpm e2e:docs`: ordered build chain, then
 * `astro preview` over dist).
 *
 * TC-1: exactly 56 rows split 39 registry:component / 11 registry:ui /
 *       6 registry:lib, matching registry-items.json name-for-name.
 * TC-2: both engine base URLs above the table with copy, bulk-add instructions
 *       before the table in DOM order, generated-at-build note naming public/r/.
 * TC-3: all 56 row docs links resolve; every row links its /components/{item}
 *       reference page (ORI-AST-008 retarget — all 56 registry items carry
 *       one); every row shows the Badge verdict (FAM-005 vocabulary).
 * TC-4: all 56 rows carry BOTH engine copy buttons (112 affordances); sampled
 *       nativewind copies match the absolute-URL command regex and equal the
 *       row's displayed text character-for-character.
 * TC-5: with javaScriptEnabled:false the full unfiltered table, both base URLs,
 *       and the note render on a 200 response.
 *
 * The landed runner contract runs EVERY spec under chromium-desktop,
 * chromium-mobile AND chromium-nojs. Click/clipboard tests skip on JS-disabled
 * projects (FUSE-09's established pattern); the zero-JS observables stay as
 * their own UNGUARDED tests that force a javaScriptEnabled:false context, so
 * the nojs project genuinely proves the fallback.
 *
 * The expected row set is computed from the REAL generated artifact
 * (apps/docs/src/data/registry-items.json, FUSE-05) — read at run time, never
 * a hand-copied fixture, so a stale or drifted build fails here.
 */
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

type LedgerItem = {
  name: string;
  type: string;
  engines: string[];
  expoGo: boolean;
  family: string;
};

/**
 * Read the generated artifact, bridging a short window if it is transiently
 * absent: Playwright imports spec FILES lazily per worker, and the lane's
 * deliv-03 spec rmSyncs src/data WHOLESALE mid-run (its registry-items.json
 * only returns after its prebuild leg — a ~20-30s window), so a module-scope
 * read landing in that window must retry, not ENOENT the whole file. Retry is
 * ENOENT-only and bounded; a genuinely missing artifact still fails after the
 * deadline. Same pattern component-page.spec.ts (FUSE-07) uses, with a
 * deadline sized to deliv-03's measured delete->regenerate window.
 */
function readGeneratedDataset(): LedgerItem[] {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      return JSON.parse(
        readFileSync(join(process.cwd(), 'apps/docs/src/data/registry-items.json'), 'utf8'),
      ) as LedgerItem[];
    } catch (error) {
      const retryable = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!retryable || Date.now() > deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

const ITEMS = readGeneratedDataset();
const COMPONENT_ITEMS = ITEMS.filter((item) => item.type === 'registry:component');
const UI_ITEMS = ITEMS.filter((item) => item.type === 'registry:ui');
const LIB_ITEMS = ITEMS.filter((item) => item.type === 'registry:lib');

const NATIVEWIND_BASE = 'https://rnraielements.com/r/nativewind';
const UNIWIND_BASE = 'https://rnraielements.com/r/uniwind';
// Boundary contract regex (FUSE-06): every install command is absolute-URL.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;
// Sprint-01 subset: rows render the nativewind form.
const installCommand = (name: string): string =>
  `npx @react-native-reusables/cli@latest add ${NATIVEWIND_BASE}/${name}.json`;
// The Badge vocabulary (FAM-005): expected verdict text derived from the
// dataset's expoGo field at run time — the data-equality shape.
const verdictLabel = (expoGo: boolean): string =>
  expoGo ? 'runs in Expo Go' : 'requires a dev client';

// Row surface — the ORI-AST-007/ORI-VIS-004 LedgerTable composed through the
// shared DataTable: the row header th, then td cells 2..6 (Category, Engines,
// Expo Go verdict, Install, Docs). The old per-cell ledger-* classes are gone;
// the Docs link carries the stable data-docs-link hook, and each row hosts
// BOTH engine command blocks ([data-engine-command]) with one CopyButton each.
const ROWS = 'tbody tr';
const NOTE = 'p.ledger__note';
const BULK_ADD = 'section.ledger__bulk-add';
const TABLE = 'main table.data-table';
const ROW_TYPE = 'td:nth-child(2)';
const ROW_VERDICT = 'td:nth-child(4) .badge';
const ROW_DOCS_LINK = 'a[data-docs-link]';
// One copy affordance per engine block; the lane's nativewind-form sampling
// scopes to the nativewind block (the served default engine panel).
const NATIVEWIND_BLOCK = '[data-engine-command="nativewind"]';
const ROW_COPY_TRIGGER = `${NATIVEWIND_BLOCK} rnr-copy-button button`;
const ROW_COPY_CODE = `${NATIVEWIND_BLOCK} rnr-copy-button code`;
// The bulk-add base URLs render as a plain <code> next to a CopyButton whose
// inner code duplicates the same URL; the plain text is the unclassed code.
const BULK_ADD_PLAIN_CODE = 'code:not(.copy-button__command)';
// ORI-AST-008 retarget: every row's Docs link is now a real reference page
// (/components/{name} exists for all 56 registry items), not an in-page anchor.
const docsHref = (item: LedgerItem): string => `/components/${item.name}`;
// The Category cell shows the stripped type (ORI-AST-007): registry:component
// -> component.
const categoryOf = (type: string): string => type.replace('registry:', '');

// Optional screenshot evidence sink (RED/GREEN gate evidence under .tmp/).
const evidenceDir = process.env.FUSE06_EVIDENCE_DIR ?? null;
function evidenceShot(name: string): { path: string } | undefined {
  return evidenceDir ? { path: join(evidenceDir, name) } : undefined;
}

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

test('FLOW-GEND-40-ledger-56-rows-and-base-urls: 56 generated rows name-for-name with verdicts, note, base URLs, bulk-add before the table', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'the compareDocumentPosition DOM-order probe needs a JS-enabled project; the zero-JS render has its own unguarded test',
  );

  const context = await browser.newContext();
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/registry');
  expect(response?.status(), 'GET /registry must return 200').toBe(200);

  // TC-1 — exactly 56 rows, name-for-name with the generated artifact.
  const rowCount = await page.locator(ROWS).count();
  expect(rowCount, 'ledger row count').toBe(ITEMS.length);
  expect(rowCount, 'ledger row count').toBe(56);
  const renderedNames = await page.locator(`${ROWS} th`).allTextContents();
  expect(renderedNames.map((name) => name.trim())).toEqual(ITEMS.map((item) => item.name));

  // The Category cell shows the STRIPPED type name (ORI-AST-007): component /
  // ui / lib, name-for-name with the generated artifact's types.
  const renderedTypes = await page.locator(`${ROWS} ${ROW_TYPE}`).allTextContents();
  expect(renderedTypes.map((type) => type.trim())).toEqual(
    ITEMS.map((item) => categoryOf(item.type)),
  );
  expect(renderedTypes.filter((type) => type === 'component')).toHaveLength(COMPONENT_ITEMS.length);
  expect(renderedTypes.filter((type) => type === 'component')).toHaveLength(39);
  expect(renderedTypes.filter((type) => type === 'ui')).toHaveLength(UI_ITEMS.length);
  expect(renderedTypes.filter((type) => type === 'ui')).toHaveLength(11);
  expect(renderedTypes.filter((type) => type === 'lib')).toHaveLength(LIB_ITEMS.length);
  expect(renderedTypes.filter((type) => type === 'lib')).toHaveLength(6);

  // Every row shows the Badge verdict value, name-for-name with the dataset.
  const renderedVerdicts = await page.locator(`${ROWS} ${ROW_VERDICT}`).allTextContents();
  expect(renderedVerdicts.map((verdict) => verdict.trim())).toEqual(
    ITEMS.map((item) => verdictLabel(item.expoGo)),
  );

  // TC-2 — the generated-at-build note names public/r/.
  const note = await page.locator(NOTE).textContent();
  expect(note ?? '', 'note must match /generated at build/i').toMatch(/generated at build/i);
  expect(note ?? '', 'note must mention public/r/').toContain('public/r/');

  // Both engine base URLs above the table as selectable text with copy buttons.
  const bulkAdd = page.locator(BULK_ADD);
  await expect(bulkAdd.locator(BULK_ADD_PLAIN_CODE, { hasText: NATIVEWIND_BASE })).toBeVisible();
  await expect(bulkAdd.locator(BULK_ADD_PLAIN_CODE, { hasText: UNIWIND_BASE })).toBeVisible();
  await expect(bulkAdd.locator('rnr-copy-button button')).toHaveCount(2);

  // Bulk-add instructions precede the <table> in DOM order
  // (bulkAdd.compareDocumentPosition(table) & DOCUMENT_POSITION_FOLLOWING !== 0).
  // String expression: the repo tsconfig carries no DOM lib.
  const bulkAddPrecedesTable = await page.evaluate(
    `(() => {
      const bulkAdd = document.querySelector('${BULK_ADD}');
      const table = document.querySelector('${TABLE}');
      if (!bulkAdd || !table) return false;
      return bulkAdd.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING;
    })()`,
  );
  expect(bulkAddPrecedesTable, 'bulk-add block must precede the table in DOM order').toBeTruthy();

  await testInfo.attach('ledger-full', {
    body: await page.screenshot({ ...evidenceShot('ledger-full.png'), fullPage: true }),
    contentType: 'image/png',
  });
  await context.close();
});

test('FLOW-GEND-40-ledger-56-rows-and-base-urls zero-JS: full unfiltered table, base URLs, and note render on a 200 response', async ({
  browser,
}) => {
  // TC-5 — unguarded on purpose: under the chromium-nojs project this doubles
  // as the project-level proof that nothing gates the ledger behind JS.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await navigateLocalhost(noJsPage, '/registry');
  expect(response?.status(), 'GET /registry must return 200 without JS').toBe(200);
  expect(await noJsPage.locator(ROWS).count(), 'unfiltered row count without JS').toBe(
    ITEMS.length,
  );
  await expect(
    noJsPage.locator(`${BULK_ADD} ${BULK_ADD_PLAIN_CODE}`, { hasText: NATIVEWIND_BASE }),
  ).toBeVisible();
  await expect(
    noJsPage.locator(`${BULK_ADD} ${BULK_ADD_PLAIN_CODE}`, { hasText: UNIWIND_BASE }),
  ).toBeVisible();
  const note = await noJsPage.locator(NOTE).textContent();
  expect(note ?? '').toMatch(/generated at build/i);
  expect(note ?? '').toContain('public/r/');
  await noJsContext.close();
});

test('FLOW-GEND-40-ledger-56-rows-and-base-urls: all 56 row docs links resolve 200; component rows link /components/{item}', async ({
  browser,
  request,
}) => {
  // Reading hrefs needs only the DOM, not page JS, so this stays unguarded.
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  const response = await navigateLocalhost(noJsPage, '/registry');
  expect(response?.status()).toBe(200);

  const rowCount = await noJsPage.locator(ROWS).count();
  expect(rowCount).toBe(ITEMS.length);
  const hrefs: string[] = [];
  for (let index = 0; index < rowCount; index += 1) {
    const href = await noJsPage
      .locator(ROWS)
      .nth(index)
      .locator(ROW_DOCS_LINK)
      .getAttribute('href');
    expect(href, `row ${index} docs href`).not.toBeNull();
    hrefs.push(href as string);
  }
  await noJsContext.close();

  // ORI-AST-008 retarget: EVERY row links its /components/{item} reference
  // page (all 56 registry items carry one) — name-for-name with the dataset.
  expect(hrefs).toEqual(ITEMS.map((item) => docsHref(item)));
  expect(hrefs.filter((href) => href.startsWith('/components/'))).toHaveLength(ITEMS.length);

  // Every one of the 56 links must resolve on the served site with a real
  // reference page — a dead destination fails here by name.
  const seen = new Set<string>();
  for (let index = 0; index < hrefs.length; index += 1) {
    const href = hrefs[index];
    const linkResponse = await request.get(`${PREVIEW_URL}${href}`);
    expect(linkResponse.status(), `row ${index} (${ITEMS[index].name}) -> ${href}`).toBe(200);
    seen.add(href);
  }
  expect(seen.size).toBe(ITEMS.length);
});

test('FLOW-GEND-40-ledger-56-rows-and-base-urls: nativewind base-URL copy places the URL on the clipboard', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS render has its own unguarded test',
  );

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();
  await navigateLocalhost(page, '/registry');

  // The nativewind base URL is displayed as selectable text; copying it must
  // put exactly that URL (no trailing slash, no newline) on the clipboard.
  const nativewindRow = page.locator(`${BULK_ADD} li`, { hasText: NATIVEWIND_BASE });
  const displayed = (await nativewindRow.locator(BULK_ADD_PLAIN_CODE).textContent())?.trim();
  expect(displayed).toBe(NATIVEWIND_BASE);
  // The bulk-add li hosts its own single CopyButton (the per-engine blocks
  // live in the table rows, not here).
  await nativewindRow.locator('rnr-copy-button button').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(NATIVEWIND_BASE);

  await testInfo.attach('ledger-base-url-copy', {
    body: await page.screenshot(evidenceShot('ledger-base-url-copy.png')),
    contentType: 'image/png',
  });
  await context.close();
});

test('FLOW-GEND-41-ledger-filter-and-row-copy: copy button on all 56 rows; sampled copies equal the displayed absolute-URL command', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS render has its own unguarded test',
  );

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();
  const response = await navigateLocalhost(page, '/registry');
  expect(response?.status()).toBe(200);

  // TC-4 — every row carries BOTH engine copy buttons (ORI-AST-007's two
  // labeled command blocks per row); the nativewind block alone counts 56.
  const rows = page.locator(ROWS);
  const rowCount = await rows.count();
  expect(rowCount).toBe(56);
  const triggers = page.locator(`${ROWS} ${ROW_COPY_TRIGGER}`);
  await expect(triggers).toHaveCount(56);
  await expect(page.locator(`${ROWS} rnr-copy-button button`)).toHaveCount(112);

  // Sample first, last, one registry:ui, one registry:lib (indices computed
  // from the generated dataset, never assumed).
  const sampleIndices = [
    0,
    rowCount - 1,
    ITEMS.findIndex((item) => item.type === 'registry:ui'),
    ITEMS.findIndex((item) => item.type === 'registry:lib'),
  ];
  expect(new Set(sampleIndices).size, 'sampled rows must be distinct').toBe(sampleIndices.length);

  for (const index of sampleIndices) {
    const item = ITEMS[index];
    const row = rows.nth(index);
    const displayed = (await row.locator(ROW_COPY_CODE).textContent())?.trim();
    // Exact expected form, derived from the same generated dataset.
    expect(displayed, `row ${index} (${item.name}) displayed command`).toBe(
      installCommand(item.name),
    );
    expect(displayed ?? '', `row ${index} displayed command must be absolute-URL`).toMatch(
      COMMAND_PATTERN,
    );

    await row.locator(ROW_COPY_TRIGGER).click();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard, `row ${index} (${item.name}) clipboard`).toBe(displayed);
    expect(clipboard, `row ${index} (${item.name}) clipboard must be absolute-URL`).toMatch(
      COMMAND_PATTERN,
    );
    // NEVER forms: short name or relative path can never match the regex above.
  }

  await testInfo.attach('ledger-row-copy', {
    body: await page.screenshot(evidenceShot('ledger-row-copy.png')),
    contentType: 'image/png',
  });
  await context.close();
});
