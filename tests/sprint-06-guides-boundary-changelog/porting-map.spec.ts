import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * FLOW-DOCS-05-porting-map-and-prior-art (GBC-009) — /porting is the single
 * destination of the porting-section manuscript, with no /docs alias, carrying
 * the mapping table, the not-ported list, and the prior-art credits.
 *
 * Six browser proofs over the REAL built docs preview on localhost:4321, each
 * greppable under the locked flow token:
 *
 *   AC-2 (primary) — /porting returns 200 with the h1 equal to porting.md's
 *          frontmatter title and the mapping table (a Deviations th, >=5 body
 *          rows); /docs/porting returns 404.
 *   GBC-004/AC-1 — exactly 1 table under the #mapping heading with exactly 1 th
 *          'Deviations', >=5 tbody rows, 0 empty Deviations cells, exactly 1
 *          /components/{slug} anchor per row with every slug in the 56-item
 *          ledger; chromium-nojs repeats the table proof.
 *   GBC-004/AC-3 — exactly 1 anchor each to elements.ai-sdk.dev and
 *          muratcakmak/expo-ai-elements, exactly 1 #why-differs heading whose
 *          paragraph names both engines; chromium-nojs repeats the anchors.
 *   GBC-006/AC-3 — the boundary page holds the tool-executor tables; /porting
 *          holds none of the boundary copy; exactly 1 Deviations table on
 *          /porting; /boundary and /docs/boundary are 404.
 *   GBC-012/AC-1 — every mapping slug is one of the 56 registry names;
 *          mapping rows + not-ported entries == porting.md's upstream length;
 *          0 not-ported entries name a shipped item.
 *   GBC-017/AC-2 — exactly 1 .prose table with a /deviation/i thead th and
 *          >=5 tbody tr; the not-ported list holds >=1 item; both prior-art
 *          anchors resolve.
 *
 * Nothing is mocked: page content is read through Chromium locators (the
 * no-JavaScript project reads the same static HTML), porting.md frontmatter is
 * parsed with Astro's own parser resolved through the docs install, and every
 * route check is a real HTTP request against the preview origin. UNGUARDED
 * across chromium-desktop, chromium-mobile, and chromium-nojs; retries 0.
 */

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

const PORTING_ROUTE = '/porting';
const PORTING_DOCS_ALIAS = '/docs/porting';
const BOUNDARY_ROUTE = '/docs/owns-vs-does-not-own';
const PHANTOM_ROUTES = ['/boundary', '/docs/boundary'];
const PORTING_SOURCE = 'apps/docs/src/content/docs/porting.md';

// --- the ledger and the registry: real generated/tracked bytes ---------------
expect(
  existsSync(join(repoRoot, 'apps/docs/src/data/registry-items.json')),
  'the generated 56-item ledger exists before the lane runs',
).toBe(true);
const ledgerItems = JSON.parse(
  readFileSync(join(repoRoot, 'apps/docs/src/data/registry-items.json'), 'utf8'),
) as { name: string }[];
expect(ledgerItems.length, 'the ledger is the 56-item set').toBe(56);
const ledgerNames = ledgerItems.map((item) => item.name.toLowerCase());

const registry = JSON.parse(
  readFileSync(join(repoRoot, 'packages/registry/registry.json'), 'utf8'),
) as { items: { name: string }[] };
const registryNames = registry.items.map((item) => item.name.toLowerCase());

// --- porting.md frontmatter through Astro's own parser ------------------------
interface PortingFrontmatter {
  title: string;
  mapping?: { upstream: string; item: string }[];
  notPorted?: string[];
  upstream?: string[];
}

/** Astro's own frontmatter parser, resolved through the astro install apps/docs owns. */
async function parsePortingFrontmatter(): Promise<PortingFrontmatter> {
  const requireFromDocs = createRequire(pathToFileURL(join(repoRoot, 'apps/docs/package.json')));
  const astroPackagePath = requireFromDocs.resolve('astro/package.json');
  const requireFromAstro = createRequire(astroPackagePath);
  const helperPath = requireFromAstro.resolve('@astrojs/internal-helpers/frontmatter');
  const { parseFrontmatter } = (await import(helperPath)) as {
    parseFrontmatter: (input: string) => { frontmatter: Record<string, unknown> };
  };
  const source = readFileSync(join(repoRoot, PORTING_SOURCE), 'utf8');
  return parseFrontmatter(source).frontmatter as unknown as PortingFrontmatter;
}

const portingFrontmatter = await parsePortingFrontmatter();
const portingTitle = portingFrontmatter.title;
const upstreamLength = portingFrontmatter.upstream?.length ?? 0;
const notPortedEntries = portingFrontmatter.notPorted ?? [];
const mappingItems = portingFrontmatter.mapping ?? [];

/**
 * Settle the page after load, EXCEPT in the no-JavaScript project: the harness
 * settle runs page.evaluate, which cannot execute without JS. The authored
 * pages are static HTML, so locators auto-wait on the served DOM.
 */
async function pageLoad(
  page: Parameters<typeof waitForAstroPageLoad>[0],
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.project.name === 'chromium-nojs') return;
  await waitForAstroPageLoad(page);
}

/** The single table inside the #mapping section: its immediately-preceding h2
 * sibling is the mapping heading (the port-side table sits under a later h2). */
const MAPPING_TABLE_XPATH = "xpath=//main//table[preceding-sibling::h2[1][@id='mapping']]";

async function expectPortingRouteSplit(
  page: Page,
  request: import('@playwright/test').APIRequestContext,
): Promise<void> {
  const response = await navigateLocalhost(page, PORTING_ROUTE);
  expect(response?.status(), `${PORTING_ROUTE} must return HTTP 200`).toBe(200);
  const alias = await request.get(new URL(PORTING_DOCS_ALIAS, PREVIEW_URL).href);
  expect(alias.status(), `${PORTING_DOCS_ALIAS} must return HTTP 404 (no alias)`).toBe(404);
}

const observations: Record<string, unknown> = {};

function record(testInfo: TestInfo, key: string, data: unknown): void {
  observations[`${testInfo.project.name}:${key}`] = data;
}

test('FLOW-DOCS-05-porting-map-and-prior-art AC-2 porting publishes at /porting with the mapping table and no docs alias', async ({
  page,
  request,
}, testInfo) => {
  await expectPortingRouteSplit(page, request);
  await pageLoad(page, testInfo);

  // The h1 equals the manuscript's frontmatter title, read at run time.
  const h1 = ((await page.locator('main h1').textContent()) ?? '').trim();
  expect(h1, 'the /porting h1 equals porting.md frontmatter title').toBe(portingTitle);

  // The mapping table: a Deviations th and at least 5 body rows.
  const mappingTable = page.locator(MAPPING_TABLE_XPATH);
  const deviationTh = mappingTable.locator('thead th').filter({ hasText: /^Deviations?$/i });
  expect(await deviationTh.count(), 'the mapping table has a Deviations th').toBe(1);
  const bodyRows = await mappingTable.locator('tbody tr').count();
  expect(bodyRows, 'the mapping table has at least 5 tbody rows').toBeGreaterThanOrEqual(5);

  record(testInfo, 'ac-2', {
    portingStatus: 200,
    aliasStatus: 404,
    h1,
    deviationTh: await deviationTh.count(),
    bodyRows,
  });
});

test('FLOW-DOCS-05-porting-map-and-prior-art GBC-004-AC-1 mapping table anatomy resolves the 56-item ledger', async ({
  page,
  request,
}, testInfo) => {
  await expectPortingRouteSplit(page, request);
  await pageLoad(page, testInfo);

  // Exactly 1 table under the heading with id 'mapping'.
  const mappingTables = page.locator(MAPPING_TABLE_XPATH);
  expect(await mappingTables.count(), 'exactly 1 table under the #mapping heading').toBe(1);
  const table = mappingTables.first();

  // Exactly 1 th whose text is 'Deviations'.
  const deviationTh = table.locator('thead th').filter({ hasText: /^Deviations$/ });
  expect(await deviationTh.count(), "exactly 1 th reads 'Deviations'").toBe(1);

  // Every body row: a non-empty Deviations cell and exactly 1 /components/ link
  // whose slug is one of the 56 ledger names.
  const rows = table.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount, 'at least 5 tbody rows').toBeGreaterThanOrEqual(5);
  const rowFacts: { slug: string; deviations: string; inLedger: boolean }[] = [];
  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    const cells = row.locator('td');
    const deviations = ((await cells.nth(2).textContent()) ?? '').trim();
    expect(deviations, `row ${index + 1} has a non-empty Deviations cell`).not.toBe('');
    const componentLinks = row.locator("a[href^='/components/']");
    expect(
      await componentLinks.count(),
      `row ${index + 1} carries exactly 1 /components/ anchor`,
    ).toBe(1);
    const href = await componentLinks.first().getAttribute('href');
    const slug = (href ?? '').replace('/components/', '').replace(/\/$/, '').toLowerCase();
    expect(ledgerNames, `row ${index + 1} slug '${slug}' is in the 56-item ledger`).toContain(slug);
    rowFacts.push({ slug, deviations, inLedger: true });
  }

  record(testInfo, 'gbc-004-ac-1', {
    tableCount: 1,
    deviationTh: 1,
    rowCount,
    rows: rowFacts,
  });
});

test('FLOW-DOCS-05-porting-map-and-prior-art GBC-004-AC-3 prior-art credits and the why-differs statement', async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, PORTING_ROUTE);
  expect(response?.status(), `${PORTING_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);

  // Exactly 1 anchor to each prior-art project, with matching link text.
  const upstream = page.locator('main a[href="https://elements.ai-sdk.dev"]');
  expect(await upstream.count(), 'exactly 1 anchor to elements.ai-sdk.dev').toBe(1);
  const upstreamText = (await upstream.first().textContent()) ?? '';
  expect(upstreamText, 'the upstream anchor text names elements.ai-sdk.dev').toContain(
    'elements.ai-sdk.dev',
  );
  const prior = page.locator('main a[href="https://github.com/muratcakmak/expo-ai-elements"]');
  expect(await prior.count(), 'exactly 1 anchor to muratcakmak/expo-ai-elements').toBe(1);
  const priorText = (await prior.first().textContent()) ?? '';
  expect(priorText, 'the prior-port anchor text names muratcakmak/expo-ai-elements').toContain(
    'muratcakmak/expo-ai-elements',
  );

  // Exactly 1 #why-differs heading, whose paragraph names both engines.
  const whyHeading = page.locator('main h3#why-differs');
  expect(await whyHeading.count(), "exactly 1 heading with id 'why-differs'").toBe(1);
  const whyParagraph = (
    (await page.locator('main h3#why-differs ~ p').first().textContent()) ?? ''
  ).trim();
  expect(whyParagraph, "the why-differs paragraph names 'nativewind'").toContain('nativewind');
  expect(whyParagraph, "the why-differs paragraph names 'uniwind'").toContain('uniwind');

  record(testInfo, 'gbc-004-ac-3', {
    upstreamCount: 1,
    priorCount: 1,
    whyHeadingCount: 1,
    whyParagraph,
  });
});

test('FLOW-DOCS-05-porting-map-and-prior-art GBC-006-AC-3 boundary stays on the boundary page and the phantoms stay 404', async ({
  page,
  request,
}, testInfo) => {
  // The boundary page holds at least 1 table containing 'tool executor'.
  const boundaryResponse = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(boundaryResponse?.status(), `${BOUNDARY_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  const boundaryToolTables = await page
    .locator('main table')
    .filter({ hasText: /tool executor/i })
    .count();
  expect(
    boundaryToolTables,
    "at least 1 table containing 'tool executor' on the boundary page",
  ).toBeGreaterThanOrEqual(1);

  // /porting holds no boundary copy and exactly 1 Deviations table.
  const portingResponse = await navigateLocalhost(page, PORTING_ROUTE);
  expect(portingResponse?.status(), `${PORTING_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  const portingBoundaryTables = await page
    .locator('main table')
    .filter({ hasText: /tool executor|streaming client|useChat/i })
    .count();
  expect(
    portingBoundaryTables,
    "0 tables on /porting contain 'tool executor', 'streaming client' or 'useChat'",
  ).toBe(0);
  const deviationTables = page.locator('main table').filter({
    has: page.locator('thead th').filter({ hasText: /^Deviations$/i }),
  });
  expect(await deviationTables.count(), 'exactly 1 table on /porting has a Deviations th').toBe(1);

  // The boundary aliases stay 404.
  const phantomStatuses: Record<string, number> = {};
  for (const route of PHANTOM_ROUTES) {
    const phantom = await request.get(new URL(route, PREVIEW_URL).href);
    phantomStatuses[route] = phantom.status();
    expect(phantom.status(), `${route} must not become a boundary alias`).toBe(404);
  }

  record(testInfo, 'gbc-006-ac-3', {
    boundaryToolTables,
    portingBoundaryTables,
    deviationTables: 1,
    phantomStatuses,
  });
});

test('FLOW-DOCS-05-porting-map-and-prior-art GBC-012-AC-1 mapping and not-ported close over the registry upstream set', async ({
  page,
  request,
}, testInfo) => {
  await expectPortingRouteSplit(page, request);
  await pageLoad(page, testInfo);

  // The mapping table: a /deviation/i th and >= 5 body rows.
  const table = page.locator(MAPPING_TABLE_XPATH);
  const deviationTh = table.locator('thead th').filter({ hasText: /deviation/i });
  expect(await deviationTh.count(), 'the mapping table has a /deviation/i th').toBe(1);
  const rows = table.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount, 'at least 5 mapping body rows').toBeGreaterThanOrEqual(5);

  // 0 mapping slugs outside the 56 registry names.
  const rowSlugs: string[] = [];
  for (let index = 0; index < rowCount; index += 1) {
    const href = await rows
      .nth(index)
      .locator("a[href^='/components/']")
      .first()
      .getAttribute('href');
    rowSlugs.push((href ?? '').replace('/components/', '').replace(/\/$/, '').toLowerCase());
  }
  const outside = rowSlugs.filter((slug) => !registryNames.includes(slug));
  expect(outside, '0 mapping slugs outside the registry names').toEqual([]);

  // mapping rows + not-ported entries == the frontmatter upstream length, and
  // 0 not-ported entries name a shipped registry item.
  expect(
    rowCount + notPortedEntries.length,
    'mapping rows + not-ported entries equal the upstream array length',
  ).toBe(upstreamLength);
  const notPortedInRegistry = notPortedEntries.filter((name) => registryNames.includes(name));
  expect(notPortedInRegistry, '0 not-ported entries equal a registry name').toEqual([]);

  record(testInfo, 'gbc-012-ac-1', {
    rowCount,
    rowSlugs,
    outside,
    notPortedCount: notPortedEntries.length,
    upstreamLength,
    mappingFrontmatterCount: mappingItems.length,
  });
});

test('FLOW-DOCS-05-porting-map-and-prior-art GBC-017-AC-2 the scannable prose presentation', async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, PORTING_ROUTE);
  expect(response?.status(), `${PORTING_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);

  // Exactly 1 .prose table with a /deviation/i thead th, holding >= 5 tbody tr.
  const proseDeviationTables = page.locator('.prose table').filter({
    has: page.locator('thead th').filter({ hasText: /deviation/i }),
  });
  expect(
    await proseDeviationTables.count(),
    'exactly 1 .prose table has a /deviation/i thead th',
  ).toBe(1);
  const proseRows = await proseDeviationTables.first().locator('tbody tr').count();
  expect(proseRows, 'the .prose mapping table holds at least 5 tbody tr').toBeGreaterThanOrEqual(5);

  // The list after the /not ported/i heading holds at least 1 item.
  const notPortedItems = page.locator('main h2#not-ported ~ ul').first().locator('li');
  expect(
    await notPortedItems.count(),
    'the not-ported list holds at least 1 item',
  ).toBeGreaterThanOrEqual(1);

  // Both prior-art anchors resolve on the page.
  const upstreamAnchors = page.locator('main a[href*="elements.ai-sdk.dev"]');
  expect(
    await upstreamAnchors.count(),
    'at least 1 anchor to elements.ai-sdk.dev',
  ).toBeGreaterThanOrEqual(1);
  const priorAnchors = page.locator('main a[href*="muratcakmak/expo-ai-elements"]');
  expect(
    await priorAnchors.count(),
    'at least 1 anchor to muratcakmak/expo-ai-elements',
  ).toBeGreaterThanOrEqual(1);

  record(testInfo, 'gbc-017-ac-2', {
    proseDeviationTables: 1,
    proseRows,
    notPortedItems: await notPortedItems.count(),
    upstreamAnchors: await upstreamAnchors.count(),
    priorAnchors: await priorAnchors.count(),
  });
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art',
);

const LOCKED_COMMAND =
  'pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts --grep FLOW-DOCS-05-porting-map-and-prior-art';

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

/**
 * Per-test status files under gitignored scratch: Playwright re-evaluates this
 * module per test, so module-level accumulation cannot carry results between
 * tests. Each test's afterEach writes one status file; afterAll aggregates the
 * directory into run.json, so the recorded exit reflects every test of the
 * latest run — never just the last one.
 */
const STATUS_DIR = join(
  repoRoot,
  '.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/FLOW-DOCS-05-porting-map-and-prior-art-statuses',
);

function statusKey(testInfo: TestInfo): string {
  const claim = /AC-\d+|GBC-\d+-AC-\d+/.exec(testInfo.title)?.[0]?.toLowerCase() ?? 'unknown';
  return `${testInfo.project.name}--${claim}`;
}

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  mkdirSync(STATUS_DIR, { recursive: true });
  writeFileSync(
    join(STATUS_DIR, `${statusKey(testInfo)}.json`),
    `${JSON.stringify(
      { status: testInfo.status, at: new Date().toISOString(), observations: { ...observations } },
      null,
      2,
    )}\n`,
  );
});

test.afterAll(() => {
  const runIdentity = `gbc-009-${Date.now()}`;
  const testStatuses: Record<string, { status: string | null; observations: unknown }> = {};
  let failed = 0;
  mkdirSync(STATUS_DIR, { recursive: true });
  for (const name of readdirSync(STATUS_DIR)) {
    if (!name.endsWith('.json')) continue;
    try {
      const entry = JSON.parse(readFileSync(join(STATUS_DIR, name), 'utf8')) as {
        status: string | null;
        observations: unknown;
      };
      testStatuses[name.replace(/\.json$/, '')] = {
        status: entry.status ?? null,
        observations: entry.observations,
      };
      if (entry.status !== 'passed') failed += 1;
    } catch {
      // An unreadable status file must never fabricate a pass; count it failed.
      testStatuses[name.replace(/\.json$/, '')] = { status: null, observations: null };
      failed += 1;
    }
  }
  mkdirSync(FLOW_EVIDENCE_DIR, { recursive: true });
  const runJson = {
    runIdentity,
    command: LOCKED_COMMAND,
    exit: failed > 0 ? 1 : 0,
    testStatuses,
    sourceHashes: {
      portingManuscript: hashFile(PORTING_SOURCE),
      boundaryManuscript: hashFile('apps/docs/src/content/docs/owns-vs-does-not-own.mdx'),
      ledger: hashFile('apps/docs/src/data/registry-items.json'),
      registry: hashFile('packages/registry/registry.json'),
      testFile: hashFile('tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts'),
      distPortingPage: hashFile('apps/docs/dist/porting/index.html'),
    },
    references: [
      'tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art/proof.red',
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
