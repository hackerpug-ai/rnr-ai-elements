import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * journeys/docs-integrator-arc (GBC-014) — the post-integration integrator
 * journey over the REAL built docs preview on localhost:4321. Three tests,
 * all greppable under the locked journey token:
 *
 *   AC-1 desktop — pick uniwind once on /docs/installation, walk
 *     /docs/quickstart, copy the conversation command on /registry, read the
 *     boundary page's example-app section, and use the header's five section
 *     links (each answering 200). Every install command shown or copied names
 *     an absolute https://rnraielements.com/r/ URL.
 *   AC-1 mobile — the same walk on the Pixel 5 project through the zero-JS
 *     drawer, whose five section links answer 200.
 *   AC-2 (both projects) — the one pick never leaks into a URL and never
 *     resets: rnr-engine storage, root data-engine and the selected tab stay
 *     'uniwind' across five pages with zero further clicks.
 *
 * This journey does NOT re-declare the 12 early-AC observations already
 * carried by guides-index.spec.ts (FLOW-DOCS-03 owns them); it only asserts
 * its own ACs as written in GBC-014's task file.
 *
 * Encoding guidance carried from the sprint handoffs: expressive-code wraps
 * code lines in spans and compressHTML fuses them, so command code is read
 * from CopyButton's own code.copy-button__command (a plain server-rendered
 * code element, byte-for-byte the copied text); browser reads that touch
 * document/localStorage use string-expression IIFEs (no DOM lib in tsconfig);
 * the repo tsconfig precedent for clipboard is the bare navigator.clipboard
 * read (registry-ledger-controls.spec.ts).
 */

const JOURNEY_ID = 'journeys/docs-integrator-arc';
const SPEC_REL = 'tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts';
const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

const LOCKED_COMMAND = `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test ${SPEC_REL} --grep ${JOURNEY_ID} --project=chromium-desktop --project=chromium-mobile`;

const COMMAND_PREFIX = 'npx @react-native-reusables/cli';
const CONVERSATION_COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json';

/** The five-section nav in the locked order (GBC-013's SECTION_LINKS set). */
const SECTION_LINKS = [
  { href: '/components', label: 'Components' },
  { href: '/registry', label: 'Registry' },
  { href: '/guides', label: 'Guides' },
  { href: '/porting', label: 'Porting' },
  { href: '/changelog', label: 'Changelog' },
] as const;
const SECTION_HREFS = SECTION_LINKS.map((link) => link.href);
const SECTION_LABELS = SECTION_LINKS.map((link) => link.label);

const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-integrator-arc',
);

/** Per-test status files under gitignored scratch; afterAll aggregates. */
const STATUS_DIR = join(
  repoRoot,
  `.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/${JOURNEY_ID}-statuses`,
);

/** Real negative-control records land here (mutation runs in isolated source
 * copies); afterAll embeds whatever exists — never fabricates a run. */
const NC_DIR = join(repoRoot, `.tmp/sprint-06-guides-boundary-changelog/e2e-nc/${JOURNEY_ID}`);

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

// --- in-page reads (string IIFEs; no DOM lib in this repo's tsconfig) --------

const READ_ENGINE_STORAGE = `(() => {
  try { return localStorage.getItem('rnr-engine'); } catch (e) { return null; }
})()`;

const READ_ROOT_ENGINE = `(() => document.documentElement.dataset.engine ?? null)()`;

// --- shared helpers ----------------------------------------------------------

/** Install commands are CopyButton code elements: byte-for-byte the copied
 * text, so display and clipboard cannot drift. */
async function collectInstallCommands(page: Page): Promise<string[]> {
  const codes = await page.locator('main code').allTextContents();
  return codes.filter((text) => text.startsWith(COMMAND_PREFIX));
}

/** Every token after 'add' must be an absolute registry URL ending .json —
 * a short name or a relative path fails this exact-form match. */
function addArgumentsOf(command: string): string[] {
  const addIndex = command.indexOf(' add ');
  if (addIndex < 0) return [];
  return command
    .slice(addIndex + ' add '.length)
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/** getAttribute returns null for a missing href — kept in the type on purpose:
 * a null href fails the toEqual order assertions loudly. */
async function linkHrefs(links: ReturnType<Page['locator']>): Promise<(string | null)[]> {
  const handles = await links.all();
  return Promise.all(handles.map((handle) => handle.getAttribute('href')));
}

async function linkTexts(links: ReturnType<Page['locator']>): Promise<string[]> {
  return (await links.allTextContents()).map((text) => text.trim());
}

const observations: Record<string, unknown> = {};

function record(testInfo: TestInfo, key: string, data: unknown): void {
  observations[`${testInfo.project.name}:${key}`] = data;
}

function statusKey(testInfo: TestInfo): string {
  const claim = /AC-\d+[-a-z]*/.exec(testInfo.title)?.[0] ?? 'unknown';
  return `${testInfo.project.name}--${claim.toLowerCase()}`;
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

// The guides-index.spec.ts evidence convention verbatim — unreadable status
// files count as failed, never pass.
// fallow-ignore-next-line complexity
test.afterAll(() => {
  const runIdentity = `gbc-014-${Date.now()}`;
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

  const negativeControls: unknown[] = [];
  if (existsSync(NC_DIR)) {
    for (const name of readdirSync(NC_DIR).sort()) {
      if (!name.endsWith('.json')) continue;
      try {
        negativeControls.push(JSON.parse(readFileSync(join(NC_DIR, name), 'utf8')));
      } catch {
        negativeControls.push({ record: name, error: 'unreadable negative-control record' });
      }
    }
  }

  mkdirSync(FLOW_EVIDENCE_DIR, { recursive: true });
  const runJson = {
    runIdentity,
    command: LOCKED_COMMAND,
    exit: failed > 0 ? 1 : 0,
    testStatuses,
    negativeControls,
    sourceHashes: {
      header: hashFile('apps/docs/src/components/Header.astro'),
      tabGroup: hashFile('apps/docs/src/scripts/tab-group.ts'),
      docsLayout: hashFile('apps/docs/src/layouts/DocsLayout.astro'),
      ledgerTable: hashFile('apps/docs/src/components/LedgerTable.astro'),
      testFile: hashFile(SPEC_REL),
    },
    references: [
      'tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-integrator-arc/proof.red',
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});

// ---------------------------------------------------------------------------
// AC-1 desktop: the integrator arc through the desktop header's section links
// ---------------------------------------------------------------------------

// One sequential visitor walk; the AC's ordered steps are the shape, not an
// extraction boundary.
// fallow-ignore-next-line complexity
test(`${JOURNEY_ID} AC-1 desktop arc: engine pick, quickstart command, registry copy, boundary example-app, and the header's five section links answer 200`, async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'the desktop case is a chromium-desktop claim',
  );
  test.setTimeout(300_000);

  await grantClipboardPermissions(page.context());
  const headerLinks = page.locator('.site-header__nav a');
  const pageStatuses: Record<string, number | null> = {};
  const installCommands: { page: string; commands: string[] }[] = [];

  // 1. /docs/installation — pick uniwind once.
  const installation = await navigateLocalhost(page, '/docs/installation');
  pageStatuses['/docs/installation'] = installation?.status() ?? null;
  await waitForAstroPageLoad(page);
  const uniwindTab = page.locator('main rnr-tab-group [role="tab"][data-engine="uniwind"]').first();
  await uniwindTab.click();
  installCommands.push({
    page: '/docs/installation',
    commands: await collectInstallCommands(page),
  });

  // 2. /docs/quickstart — the first uniwind install panel names the absolute
  // conversation URL (the pick held across real navigation, 0 further clicks).
  const quickstart = await navigateLocalhost(page, '/docs/quickstart');
  pageStatuses['/docs/quickstart'] = quickstart?.status() ?? null;
  await waitForAstroPageLoad(page);
  const firstUniwindPanel = page
    .locator('main [role="tabpanel"][data-engine="uniwind"]')
    .first()
    .locator('code.copy-button__command');
  const quickstartCommand = ((await firstUniwindPanel.textContent()) ?? '').trim();
  installCommands.push({
    page: '/docs/quickstart',
    commands: await collectInstallCommands(page),
  });

  // 3. /registry — 56 rows, the uniwind copy in row-conversation lands on the
  // clipboard byte-for-byte.
  const registry = await navigateLocalhost(page, '/registry');
  pageStatuses['/registry'] = registry?.status() ?? null;
  await waitForAstroPageLoad(page);
  const ledgerRows = page.locator('tr[data-filter-text]');
  const ledgerRowCount = await ledgerRows.count();
  const conversationCopy = page.locator('#row-conversation [data-engine-command="uniwind"] button');
  await conversationCopy.click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  installCommands.push({ page: '/registry', commands: await collectInstallCommands(page) });

  // 4. /docs/owns-vs-does-not-own — 'useChat' inside a td, exactly 1
  // example-app anchor pointing at apps/example.
  const boundary = await navigateLocalhost(page, '/docs/owns-vs-does-not-own');
  pageStatuses['/docs/owns-vs-does-not-own'] = boundary?.status() ?? null;
  await waitForAstroPageLoad(page);
  const tdTexts = await page.locator('td').allTextContents();
  const useChatTds = tdTexts.filter((text) => text.includes('useChat')).length;
  const exampleAnchors = page.locator('main a', { hasText: /example app/i });
  const exampleAnchorCount = await exampleAnchors.count();
  const exampleHref =
    exampleAnchorCount === 1 ? await exampleAnchors.first().getAttribute('href') : null;
  installCommands.push({
    page: '/docs/owns-vs-does-not-own',
    commands: await collectInstallCommands(page),
  });

  // 5. The header carries the five section links, each answering 200.
  const headerCount = await headerLinks.count();
  const headerTexts = await linkTexts(headerLinks);
  const headerHrefs = await linkHrefs(headerLinks);
  const headerStatuses: Record<string, number | null> = {};
  for (const href of SECTION_HREFS) {
    headerStatuses[href] = await request
      .get(new URL(href, PREVIEW_URL).href)
      .then((response) => response.status());
  }

  // --- MUST_OBSERVE ----------------------------------------------------------
  for (const [path, status] of Object.entries(pageStatuses)) {
    expect(status, `${path} must return HTTP 200`).toBe(200);
  }
  expect(
    quickstartCommand,
    'the first uniwind panel on /docs/quickstart shows the absolute conversation command',
  ).toBe(CONVERSATION_COMMAND);
  expect(ledgerRowCount, 'exactly 56 tr[data-filter-text] rows on /registry').toBe(56);
  expect(
    clipboard,
    'the clipboard equals the absolute conversation command after the uniwind pick',
  ).toBe(CONVERSATION_COMMAND);
  expect(useChatTds, "'useChat' appears inside a td on the boundary page").toBeGreaterThanOrEqual(
    1,
  );
  expect(exampleAnchorCount, 'exactly 1 anchor matching /example app/i').toBe(1);
  expect(
    exampleHref ?? '',
    'the example-app anchor href names apps/example (never a # placeholder)',
  ).toContain('apps/example');
  const allCommands = installCommands.flatMap((entry) => entry.commands);
  expect(allCommands.length, 'install commands were collected on all 4 pages').toBeGreaterThan(0);
  for (const command of allCommands) {
    // The family form names EVERY member after 'add'; each token must be an
    // absolute registry URL ending .json (a short name or relative path fails).
    const args = addArgumentsOf(command);
    expect(
      args.length,
      `every collected command names its target after 'add': ${command}`,
    ).toBeGreaterThan(0);
    for (const arg of addArgumentsOf(command)) {
      expect(
        arg.startsWith('https://rnraielements.com/r/'),
        `every add argument is an absolute registry URL: ${command}`,
      ).toBe(true);
      expect(arg.endsWith('.json'), `every add argument ends .json: ${command}`).toBe(true);
    }
  }
  expect(headerCount, 'exactly 5 anchors in .site-header__nav').toBe(5);
  expect(headerTexts, 'header link text order').toEqual(SECTION_LABELS);
  expect(headerHrefs, 'header href order').toEqual(SECTION_HREFS);
  for (const [href, status] of Object.entries(headerStatuses)) {
    expect(status, `header href ${href} answers 200 to page.request.get`).toBe(200);
  }

  record(testInfo, 'ac-1-desktop', {
    pageStatuses,
    quickstartCommand,
    ledgerRowCount,
    clipboard,
    useChatTds,
    exampleAnchor: { count: exampleAnchorCount, href: exampleHref },
    installCommandCount: allCommands.length,
    installCommands,
    header: {
      count: headerCount,
      texts: headerTexts,
      hrefs: headerHrefs,
      statuses: headerStatuses,
    },
  });
});

// ---------------------------------------------------------------------------
// AC-1 mobile: the same arc through the zero-JS drawer's five section links
// ---------------------------------------------------------------------------

test(`${JOURNEY_ID} AC-1 mobile arc: the same walk through the drawer, whose five section links answer 200`, async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-mobile',
    'the mobile case is a chromium-mobile claim',
  );
  test.setTimeout(300_000);

  await grantClipboardPermissions(page.context());
  const desktopNav = page.locator('.site-header__nav');
  const drawerToggle = page.locator('summary.site-drawer__toggle');
  const drawerLinks = page.locator('.site-drawer__nav a');
  const pageStatuses: Record<string, number | null> = {};

  const installation = await navigateLocalhost(page, '/docs/installation');
  pageStatuses['/docs/installation'] = installation?.status() ?? null;
  await waitForAstroPageLoad(page);
  await page.locator('main rnr-tab-group [role="tab"][data-engine="uniwind"]').first().click();

  const quickstart = await navigateLocalhost(page, '/docs/quickstart');
  pageStatuses['/docs/quickstart'] = quickstart?.status() ?? null;
  await waitForAstroPageLoad(page);
  const quickstartCommand = (
    (await page
      .locator('main [role="tabpanel"][data-engine="uniwind"]')
      .first()
      .locator('code.copy-button__command')
      .textContent()) ?? ''
  ).trim();

  const registry = await navigateLocalhost(page, '/registry');
  pageStatuses['/registry'] = registry?.status() ?? null;
  await waitForAstroPageLoad(page);
  const ledgerRowCount = await page.locator('tr[data-filter-text]').count();
  await page.locator('#row-conversation [data-engine-command="uniwind"] button').click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());

  const boundary = await navigateLocalhost(page, '/docs/owns-vs-does-not-own');
  pageStatuses['/docs/owns-vs-does-not-own'] = boundary?.status() ?? null;
  await waitForAstroPageLoad(page);

  // Below 64rem the desktop nav is hidden; the <details> drawer takes over.
  await expect(desktopNav, '.site-header__nav is hidden at the Pixel 5 viewport').toBeHidden();
  await drawerToggle.click();
  const drawerCount = await drawerLinks.count();
  const drawerTexts = await linkTexts(drawerLinks);
  const drawerHrefs = await linkHrefs(drawerLinks);
  const drawerStatuses: Record<string, number | null> = {};
  for (const href of SECTION_HREFS) {
    drawerStatuses[href] = await request
      .get(new URL(href, PREVIEW_URL).href)
      .then((response) => response.status());
  }

  // --- MUST_OBSERVE ----------------------------------------------------------
  for (const [path, status] of Object.entries(pageStatuses)) {
    expect(status, `${path} must return HTTP 200`).toBe(200);
  }
  expect(
    quickstartCommand,
    'the first uniwind panel shows the absolute conversation command on mobile too',
  ).toBe(CONVERSATION_COMMAND);
  expect(ledgerRowCount, 'exactly 56 ledger rows on mobile').toBe(56);
  expect(clipboard, 'the clipboard equals the absolute conversation command').toBe(
    CONVERSATION_COMMAND,
  );
  expect(drawerCount, 'exactly 5 anchors in .site-drawer__nav').toBe(5);
  expect(drawerTexts, 'drawer link text order').toEqual(SECTION_LABELS);
  expect(drawerHrefs, 'drawer href order').toEqual(SECTION_HREFS);
  for (const [href, status] of Object.entries(drawerStatuses)) {
    expect(status, `drawer href ${href} answers 200`).toBe(200);
  }

  record(testInfo, 'ac-1-mobile', {
    pageStatuses,
    quickstartCommand,
    ledgerRowCount,
    clipboard,
    drawer: {
      count: drawerCount,
      texts: drawerTexts,
      hrefs: drawerHrefs,
      statuses: drawerStatuses,
    },
  });
});

// ---------------------------------------------------------------------------
// AC-2: the pick never leaks into a URL and never resets across five pages
// ---------------------------------------------------------------------------

// The five-page walk is one ordered journey; per-page reads stay inline so
// the evidence mirrors the AC.
// fallow-ignore-next-line complexity
test(`${JOURNEY_ID} AC-2 one uniwind pick holds engine state across five pages and never reaches a URL`, async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === 'chromium-nojs',
    'the pick needs a real click; the no-JS project is out of the journey scope',
  );
  test.setTimeout(300_000);

  await navigateLocalhost(page, '/docs/installation');
  await waitForAstroPageLoad(page);

  // Before any click: storage empty, root at the documented nativewind default.
  const beforeStorage = (await page.evaluate(READ_ENGINE_STORAGE)) as string | null;
  const beforeEngine = (await page.evaluate(READ_ROOT_ENGINE)) as string | null;

  // The ONE pick.
  await page.locator('main rnr-tab-group [role="tab"][data-engine="uniwind"]').first().click();

  // The walk: installation (post-click), then four further pages in order.
  const walkPaths = [
    '/docs/installation',
    '/docs/quickstart',
    '/registry',
    '/docs/owns-vs-does-not-own',
    '/guides',
  ] as const;
  const records: {
    path: string;
    url: string;
    storage: string | null;
    dataEngine: string | null;
    uniwindTabSelected: string | null | false;
  }[] = [];
  for (const path of walkPaths) {
    if (path !== '/docs/installation') {
      await navigateLocalhost(page, path);
      await waitForAstroPageLoad(page);
    }
    const tab = page.locator('main [role="tab"][data-engine="uniwind"]').first();
    const tabCount = await tab.count();
    records.push({
      path,
      url: page.url(),
      storage: (await page.evaluate(READ_ENGINE_STORAGE)) as string | null,
      dataEngine: (await page.evaluate(READ_ROOT_ENGINE)) as string | null,
      uniwindTabSelected:
        tabCount > 0 ? ((await tab.getAttribute('aria-selected')) ?? null) : false,
    });
  }

  // --- MUST_OBSERVE ----------------------------------------------------------
  expect(beforeStorage, "before the click, 'rnr-engine' is null").toBeNull();
  expect(beforeEngine, "before the click, html data-engine is 'nativewind'").toBe('nativewind');
  expect(records.length, '5 pages recorded').toBe(5);
  for (const entry of records) {
    expect(entry.storage, `localStorage 'rnr-engine' equals 'uniwind' on ${entry.path}`).toBe(
      'uniwind',
    );
    expect(entry.dataEngine, `html data-engine equals 'uniwind' on ${entry.path}`).toBe('uniwind');
    expect(
      /engine|uniwind|nativewind/i.test(entry.url),
      `no engine state in the URL on ${entry.path}: ${entry.url}`,
    ).toBe(false);
  }
  const quickstartRecord = records.find((entry) => entry.path === '/docs/quickstart');
  const registryRecord = records.find((entry) => entry.path === '/registry');
  expect(
    quickstartRecord?.uniwindTabSelected,
    "the first uniwind tab has aria-selected 'true' on /docs/quickstart with 0 further clicks",
  ).toBe('true');
  expect(
    registryRecord?.uniwindTabSelected,
    "the first uniwind tab has aria-selected 'true' on /registry with 0 further clicks",
  ).toBe('true');

  record(testInfo, 'ac-2', { beforeStorage, beforeEngine, records });
});
