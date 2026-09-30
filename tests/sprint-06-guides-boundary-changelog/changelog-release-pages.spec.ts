import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { changelogSchema, compareReleaseDesc } from '../../apps/docs/src/lib/changelog-schema';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * FLOW-DOCS-06-changelog-release-pages (GBC-008) — /changelog is the changelog
 * section index (newest-first rows with date chips and touched-component
 * links), and /changelog/[version] is one release page per entry carrying the
 * release date and the entry's Added/Changed/Fixed body.
 *
 * Twelve browser/CLI proofs over the REAL built docs preview on localhost:4321,
 * each greppable under the locked flow token — GBC-008's own AC-1..AC-3 plus
 * the nine other-task claims bound to this flow, asserted as written in their
 * task files:
 *
 *   GBC-005/AC-1  — /changelog 200 with exactly one title anchor per release,
 *                   hrefs in git-tag-derived DOM order, newest first/last texts.
 *   GBC-005/AC-2  — the newest release page: 200, the date literal inside the
 *                   article, article h2s exactly Added/Changed/Fixed.
 *   GBC-005/AC-3  — the real prebuild exits 0 printing the gate line, the index
 *                   holds exactly that many title anchors, and the phantom
 *                   routes (/changelog/0.3.0, /changelog/v0.2.1) 404.
 *   GBC-007/AC-1  — the same real prebuild: exit 0, exactly one success line,
 *                   its tag figure equal to run-time `git tag --list 'v*'`.
 *   GBC-005/AC-4  — every /components/ anchor in all 3 release articles
 *                   resolves 200 at a 56-item-ledger slug.
 *   GBC-015/AC-2  — exactly 3 rows newest-first, one date chip each reading the
 *                   entry's UTC calendar day.
 *   GBC-015/AC-4  — touched-component anchors inside rows match the slug shape,
 *                   resolve 200, and never nest inside the title anchor.
 *   GBC-016/AC-2  — the section-index shell: one 'Changelog' page-header h1,
 *                   one 'Releases' section-header h2, one [data-section-index]
 *                   holding the ordered rows, zero on-this-page rails.
 *   GBC-016/AC-5  — one docs-section nav whose section titles are exactly
 *                   Getting started / Guides / Porting, each group linking >= 1.
 *   GBC-008/AC-1  — index newest-first and the newest release page complete
 *                   (200, date, three headings, resolvable touched links).
 *   GBC-008/AC-2  — every release page 200 with its UTC date and three headings.
 *   GBC-008/AC-3  — the newest release's row and article link the same slugs,
 *                   each landing on a page whose h1 is the ledger title.
 *
 * Nothing is mocked: the expected order and dates are derived at run time from
 * `git tag --list 'v*'` and the entry frontmatter (parsed with Astro's own
 * parser and normalized through the shared changelogSchema), sorting uses the
 * shared compareReleaseDesc comparator, and every route check is a real HTTP
 * request against the preview origin. UNGUARDED across chromium-desktop,
 * chromium-mobile, and chromium-nojs (the no-JS project re-reads the same
 * static HTML); retries 0.
 */

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

const INDEX_ROUTE = '/changelog';
const ENTRY_DIR = 'apps/docs/src/content/changelog';
const LEDGER_PATH = 'apps/docs/src/data/registry-items.json';
const ARTICLE_H2S = ['Added', 'Changed', 'Fixed'];
const SECTION_TITLES = ['Getting started', 'Guides', 'Porting'];
const GATE_LINE_PREFIX = '[docs-data] changelog:';

const releaseRoute = (version: string): string => `/changelog/${version}`;

// --- the releases: git tags + entry frontmatter, never the rendered page -----

/** The real v* tags read through the git CLI at run time. */
const releaseTags = execFileSync('/usr/bin/git', ['tag', '--list', 'v*'], {
  cwd: repoRoot,
  encoding: 'utf8',
})
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);
expect(releaseTags.length, 'the repository tags at least one v* release').toBeGreaterThan(0);

interface ReleaseFrontmatter {
  version: string;
  date: string | Date;
}

/** Astro's own frontmatter parser, resolved through the astro install apps/docs owns. */
async function parseEntryFrontmatter(version: string): Promise<ReleaseFrontmatter> {
  const requireFromDocs = createRequire(pathToFileURL(join(repoRoot, 'apps/docs/package.json')));
  const astroPackagePath = requireFromDocs.resolve('astro/package.json');
  const helperPath = createRequire(astroPackagePath).resolve(
    '@astrojs/internal-helpers/frontmatter',
  );
  const { parseFrontmatter } = (await import(helperPath)) as {
    parseFrontmatter: (input: string) => { frontmatter: Record<string, unknown> };
  };
  const source = readFileSync(join(repoRoot, ENTRY_DIR, `${version}.md`), 'utf8');
  return parseFrontmatter(source).frontmatter as unknown as ReleaseFrontmatter;
}

interface ExpectedRelease {
  version: string;
  date: Date;
}

const tagVersions = releaseTags.map((tag) => {
  expect(tag, `release tag ${tag} is v-prefixed`).toMatch(/^v[0-9]/);
  return tag.slice(1);
});
const parsedReleases = await Promise.all(
  tagVersions.map(async (version) => {
    const frontmatter = await parseEntryFrontmatter(version);
    // The shared schema normalizes the authored quoted date to one Date.
    return changelogSchema.parse(frontmatter) as ExpectedRelease;
  }),
);
// The shared comparator (date DESC, then semver DESC) — never re-derived here.
const expectedReleases = parsedReleases.sort(compareReleaseDesc);
const expectedVersions = expectedReleases.map((release) => release.version);
const expectedDates = new Map(
  expectedReleases.map((release) => [release.version, release.date.toISOString().slice(0, 10)]),
);

// --- the ledger: real generated bytes the locked build guarantees ------------
expect(
  existsSync(join(repoRoot, LEDGER_PATH)),
  'the generated 56-item ledger exists before the lane runs (the locked run_cmd builds first)',
).toBe(true);
const ledgerItems = JSON.parse(readFileSync(join(repoRoot, LEDGER_PATH), 'utf8')) as {
  name: string;
  title: string;
}[];
expect(ledgerItems.length, 'the ledger is the 56-item set').toBe(56);
const ledgerNames = new Set(ledgerItems.map((item) => item.name.toLowerCase()));
const ledgerBySlug = new Map(ledgerItems.map((item) => [item.name.toLowerCase(), item]));

// --- the real prebuild (GBC-007's gate) spawned from the repo root -----------

function runPrebuild(): { code: number; stdout: string } {
  try {
    return {
      code: 0,
      stdout: execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'run', 'prebuild'], {
        cwd: repoRoot,
        encoding: 'utf8',
      }),
    };
  } catch (error) {
    const err = error as { status?: number | null; stdout?: string | Buffer };
    return {
      code: err.status ?? 1,
      stdout: typeof err.stdout === 'string' ? err.stdout : String(err.stdout ?? ''),
    };
  }
}

function gateLines(stdout: string): string[] {
  return stdout.split('\n').filter((line) => line.includes(GATE_LINE_PREFIX));
}

// --- shared locators and page helpers ----------------------------------------

/**
 * Settle the page after load, EXCEPT in the no-JavaScript project: the harness
 * settle runs page.evaluate, which cannot execute without JS. The changelog
 * pages are static HTML, so locators auto-wait on the served DOM.
 */
async function pageLoad(
  page: Parameters<typeof waitForAstroPageLoad>[0],
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.project.name === 'chromium-nojs') return;
  await waitForAstroPageLoad(page);
}

/** Open /changelog, assert 200, and return the index rows. */
async function openIndex(page: Page, testInfo: TestInfo): Promise<ReturnType<Page['locator']>> {
  const response = await navigateLocalhost(page, INDEX_ROUTE);
  expect(response?.status(), `${INDEX_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  return page.locator('[data-index-list-row]');
}

/** The title-anchor hrefs of the given rows, in DOM order. */
async function rowTitleHrefs(rows: Locator): Promise<string[]> {
  const hrefs: string[] = [];
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const href = await rows.nth(i).locator('a[data-index-list-title]').getAttribute('href');
    expect(href, `row ${i} carries a title href`).not.toBeNull();
    hrefs.push(href as string);
  }
  return hrefs;
}

/** The /components/ hrefs inside the given scope, in DOM order. */
async function componentHrefs(scope: Locator): Promise<string[]> {
  const links = scope.locator('a[href^="/components/"]');
  const hrefs: string[] = [];
  const count = await links.count();
  for (let i = 0; i < count; i++) {
    hrefs.push((await links.nth(i).getAttribute('href')) ?? '');
  }
  return hrefs;
}

/** The release article: exactly one <article> on a release page. */
async function releaseArticle(page: Page): Promise<Locator> {
  const articles = page.locator('article');
  expect(await articles.count(), 'exactly one article carries the release body').toBe(1);
  return articles;
}

/** The h2 texts inside the article body, in DOM order. */
async function articleH2Texts(article: Locator): Promise<string[]> {
  const headings = article.locator('h2');
  const texts: string[] = [];
  const count = await headings.count();
  for (let i = 0; i < count; i++) {
    texts.push(((await headings.nth(i).textContent()) ?? '').trim());
  }
  return texts;
}

// --- screenshot evidence ------------------------------------------------------

const SCREEN_DIR_REL =
  '.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/FLOW-DOCS-06-changelog-release-pages-screens';

async function capture(page: Page, testInfo: TestInfo, slug: string): Promise<string> {
  const relative = `${SCREEN_DIR_REL}/${testInfo.project.name}--${slug}.png`;
  mkdirSync(join(repoRoot, SCREEN_DIR_REL), { recursive: true });
  await page.screenshot({ path: join(repoRoot, relative), fullPage: true });
  return relative;
}

// --- flow evidence — the run.json artifact the locked flow fingerprints -------

const observations: Record<string, unknown> = {};
function record(key: string, data: unknown): void {
  observations[key] = data;
}

// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  const statusDir = join(
    repoRoot,
    '.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/FLOW-DOCS-06-changelog-release-pages-statuses',
  );
  mkdirSync(statusDir, { recursive: true });
  const claim = /GBC-\d+-AC-\d+/.exec(testInfo.title)?.[0]?.toLowerCase() ?? 'unknown';
  writeFileSync(
    join(statusDir, `${testInfo.project.name}--${claim}.json`),
    `${JSON.stringify(
      { status: testInfo.status, at: new Date().toISOString(), observations: { ...observations } },
      null,
      2,
    )}\n`,
  );
});

const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-06-changelog-release-pages',
);

const LOCKED_COMMAND =
  'pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts --grep FLOW-DOCS-06-changelog-release-pages';

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

test.afterAll(() => {
  const runIdentity = `gbc-008-${Date.now()}`;
  const statusDir = join(
    repoRoot,
    '.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/FLOW-DOCS-06-changelog-release-pages-statuses',
  );
  const testStatuses: Record<string, { status: string | null; observations: unknown }> = {};
  let failed = 0;
  mkdirSync(statusDir, { recursive: true });
  for (const name of readdirSync(statusDir)) {
    if (!name.endsWith('.json')) continue;
    try {
      const entry = JSON.parse(readFileSync(join(statusDir, name), 'utf8')) as {
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
    derived: {
      releaseTags,
      expectedVersions,
      expectedDates: Object.fromEntries(expectedDates),
    },
    sourceHashes: {
      ledger: hashFile(LEDGER_PATH),
      registry: hashFile('packages/registry/registry.json'),
      changelogIndex: hashFile('apps/docs/src/pages/changelog/index.astro'),
      changelogVersion: hashFile('apps/docs/src/pages/changelog/[version].astro'),
      changelogLib: hashFile('apps/docs/src/lib/changelog.ts'),
      testFile: hashFile(
        'tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts',
      ),
      distChangelogIndex: hashFile('apps/docs/dist/changelog/index.html'),
    },
    references: [
      'tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-06-changelog-release-pages/proof.red',
      `${SCREEN_DIR_REL}/`,
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});

// ---------------------------------------------------------------------------
// The nine other-task claims bound to FLOW-DOCS-06, asserted as written.
// ---------------------------------------------------------------------------

test('FLOW-DOCS-06-changelog-release-pages GBC-005-AC-1 index title anchors reverse-chronological', async ({
  page,
}, testInfo) => {
  const rows = await openIndex(page, testInfo);
  const titles = page.locator('[data-index-list] a[data-index-list-title]');
  expect(
    await titles.count(),
    'exactly one title anchor inside [data-index-list] per tagged release',
  ).toBe(expectedVersions.length);
  const hrefs = await rowTitleHrefs(rows);
  expect(hrefs, 'title hrefs in DOM order equal the git-tag-derived order').toEqual(
    expectedVersions.map(releaseRoute),
  );
  const firstText = await titles.first().innerText();
  const lastText = await titles.nth(expectedVersions.length - 1).innerText();
  expect(firstText, 'the first title names the newest release').toContain(expectedVersions[0]);
  expect(lastText, 'the last title names the oldest release').toContain(
    expectedVersions[expectedVersions.length - 1],
  );
  record('gbc-005-ac-1', { hrefs });
  record('screenshot', await capture(page, testInfo, 'ac1-index'));
});

test('FLOW-DOCS-06-changelog-release-pages GBC-005-AC-2 newest release page date and three headings', async ({
  page,
}, testInfo) => {
  const newest = expectedVersions[0];
  const response = await navigateLocalhost(page, releaseRoute(newest));
  expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  const article = await releaseArticle(page);
  const articleText = await article.innerText();
  const expectedDate = expectedDates.get(newest);
  expect(
    articleText.split(expectedDate ?? '').length - 1,
    `the literal ${expectedDate} appears at least once in the article`,
  ).toBeGreaterThanOrEqual(1);
  const h2Texts = await articleH2Texts(article);
  expect(h2Texts, 'article h2 texts exactly Added/Changed/Fixed in DOM order').toEqual(ARTICLE_H2S);
  record('gbc-005-ac-2', { route: releaseRoute(newest), h2Texts });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-005-AC-3 prebuild gate anchor count phantom routes 404', async ({
  page,
  request,
}, testInfo) => {
  const run = runPrebuild();
  expect(run.code, 'the real prebuild exits 0').toBe(0);
  const lines = gateLines(run.stdout);
  expect(lines, 'exactly one changelog gate line (the success line)').toHaveLength(1);
  expect(lines[0], 'the literal one-to-one success line').toBe(
    `[docs-data] changelog: ${expectedVersions.length} tags, ${expectedVersions.length} entries — one-to-one, reverse-chronological`,
  );
  await openIndex(page, testInfo);
  const titles = page.locator('[data-index-list] a[data-index-list-title]');
  expect(
    await titles.count(),
    'exactly one title anchor inside [data-index-list] per tagged release',
  ).toBe(expectedVersions.length);
  const phantom = await request.get(new URL('/changelog/0.3.0', PREVIEW_URL).href);
  expect(phantom.status(), '/changelog/0.3.0 must return HTTP 404').toBe(404);
  const vPrefixed = await request.get(
    new URL(releaseRoute(`v${expectedVersions[0]}`), PREVIEW_URL).href,
  );
  expect(
    vPrefixed.status(),
    `${releaseRoute(`v${expectedVersions[0]}`)} must return HTTP 404`,
  ).toBe(404);
  record('gbc-005-ac-3', { gateLine: lines[0], phantom: 404, vPrefixed: 404 });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-007-AC-1 prebuild gate one-to-one with run-time git tags', async () => {
  const run = runPrebuild();
  expect(run.code, 'the real prebuild exits 0').toBe(0);
  const lines = gateLines(run.stdout);
  expect(lines, 'exactly one changelog gate line (never a violation line)').toHaveLength(1);
  expect(lines[0], 'the literal success line').toBe(
    '[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological',
  );
  const tagFigure = Number(/(\d+) tags/.exec(lines[0])?.[1]);
  expect(tagFigure, "the line's tag figure equals the run-time `git tag --list 'v*'` count").toBe(
    releaseTags.length,
  );
  record('gbc-007-ac-1', { gateLine: lines[0], releaseTags: releaseTags.length });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-005-AC-4 every release article component link resolves in the ledger', async ({
  page,
  request,
}, testInfo) => {
  const newest = expectedVersions[0];
  let newestLinks = 0;
  const statuses: Record<string, number> = {};
  for (const version of expectedVersions) {
    const response = await navigateLocalhost(page, releaseRoute(version));
    expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
    await pageLoad(page, testInfo);
    const hrefs = await componentHrefs(await releaseArticle(page));
    if (version === newest) newestLinks = hrefs.length;
    for (const href of hrefs) {
      const slug = href.replace(/^\/components\//, '').toLowerCase();
      expect(ledgerNames.has(slug), `${slug} is one of the 56 ledger names`).toBe(true);
      const status = await request.get(new URL(href, PREVIEW_URL).href);
      statuses[href] = status.status();
      expect(status.status(), `${href} must return HTTP 200`).toBe(200);
    }
  }
  expect(
    newestLinks,
    'at least 1 /components/ anchor on the newest release page',
  ).toBeGreaterThanOrEqual(1);
  record('gbc-005-ac-4', { newestLinks, destinations: statuses });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-015-AC-2 rows newest-first with one date chip each', async ({
  page,
}, testInfo) => {
  const rows = await openIndex(page, testInfo);
  expect(await rows.count(), 'exactly one row per tagged release').toBe(expectedVersions.length);
  expect(await rowTitleHrefs(rows), 'row title hrefs newest-first').toEqual(
    expectedVersions.map(releaseRoute),
  );
  const chipDates: string[] = [];
  for (let i = 0; i < expectedVersions.length; i++) {
    const row = rows.nth(i);
    const titleText = await row.locator('a[data-index-list-title]').innerText();
    expect(titleText, `row title contains ${expectedVersions[i]}`).toContain(expectedVersions[i]);
    const chips = row.locator('.chip');
    expect(await chips.count(), `row ${expectedVersions[i]} holds exactly 1 date chip`).toBe(1);
    chipDates.push((await chips.first().innerText()).trim());
  }
  expect(chipDates, 'chip texts in DOM order are the entries UTC calendar days').toEqual(
    expectedVersions.map((version) => expectedDates.get(version)),
  );
  record('gbc-015-ac-2', { chipDates });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-015-AC-4 touched anchors are row-title siblings that resolve', async ({
  page,
  request,
}, testInfo) => {
  await openIndex(page, testInfo);
  const links = page.locator('[data-index-list-row] a[href^="/components/"]');
  const count = await links.count();
  expect(count, 'at least 1 touched-component anchor inside the rows').toBeGreaterThanOrEqual(1);
  for (let i = 0; i < count; i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');
    expect(href ?? '', 'href matches the /components/{slug} shape').toMatch(
      /^\/components\/[a-z0-9-]+$/,
    );
    const nested = await link.evaluate((el) => el.closest('a[data-index-list-title]') !== null);
    expect(nested, 'the anchor is a sibling of the title, never nested inside it').toBe(false);
    const status = await request.get(new URL(href ?? '', PREVIEW_URL).href);
    expect(status.status(), `${href} must return HTTP 200`).toBe(200);
  }
  record('gbc-015-ac-4', { touchedAnchors: count });
});

test('FLOW-DOCS-06-changelog-release-pages GBC-016-AC-2 section-index shell Changelog Releases no rail', async ({
  page,
}, testInfo) => {
  await openIndex(page, testInfo);
  const h1s = page.locator('h1.page-header__title');
  expect(await h1s.count(), 'exactly one page-header title').toBe(1);
  expect((await h1s.first().innerText()).trim(), 'the page-header h1 reads Changelog').toBe(
    'Changelog',
  );
  const sectionH2 = page.locator('.section-header h2');
  expect(await sectionH2.count(), 'exactly one section-header h2').toBe(1);
  expect((await sectionH2.first().innerText()).trim(), 'the section h2 reads Releases').toBe(
    'Releases',
  );
  const shells = page.locator('[data-section-index]');
  expect(await shells.count(), 'exactly one [data-section-index]').toBe(1);
  const shellRows = shells.first().locator('[data-index-list-row]');
  expect(await shellRows.count(), 'the shell holds one row per tagged release').toBe(
    expectedVersions.length,
  );
  expect(await rowTitleHrefs(shellRows), 'the shell rows stay newest-first').toEqual(
    expectedVersions.map(releaseRoute),
  );
  expect(
    await page.locator("nav[aria-label='On this page']").count(),
    'zero on-this-page rails on /changelog',
  ).toBe(0);
  record('gbc-016-ac-2', { h1: 'Changelog', h2: 'Releases' });
  record('screenshot', await capture(page, testInfo, 'ac2-index-shell'));
});

test('FLOW-DOCS-06-changelog-release-pages GBC-016-AC-5 docs-section nav carries the three groups', async ({
  page,
}, testInfo) => {
  await openIndex(page, testInfo);
  const nav = page.locator("nav[data-docs-nav][aria-label='Documentation']");
  expect(await nav.count(), 'exactly one docs-section nav').toBe(1);
  // textContent, not innerText: DocsNav renders `text-transform: uppercase`,
  // and the claim reads the source labels ('Getting started'), not the painted ones.
  const titleLocators = nav.first().locator('.docs-nav__section-title');
  const groupTitles: string[] = [];
  const titleCount = await titleLocators.count();
  for (let i = 0; i < titleCount; i++) {
    groupTitles.push(((await titleLocators.nth(i).textContent()) ?? '').trim());
  }
  expect(groupTitles, 'section titles exactly Getting started / Guides / Porting').toEqual(
    SECTION_TITLES,
  );
  const lists = nav.first().locator('.docs-nav__list');
  expect(await lists.count(), 'one list per section group').toBe(SECTION_TITLES.length);
  for (let i = 0; i < SECTION_TITLES.length; i++) {
    expect(
      await lists.nth(i).locator('a').count(),
      `the ${SECTION_TITLES[i]} group holds at least 1 link`,
    ).toBeGreaterThanOrEqual(1);
  }
  record('gbc-016-ac-5', { groupTitles });
});

// ---------------------------------------------------------------------------
// GBC-008's own acceptance criteria.
// ---------------------------------------------------------------------------

test('FLOW-DOCS-06-changelog-release-pages GBC-008-AC-1 index newest-first and newest release page complete', async ({
  page,
  request,
}, testInfo) => {
  await openIndex(page, testInfo);
  const h1s = page.locator('h1.page-header__title');
  expect(await h1s.count(), '/changelog carries one page-header h1').toBe(1);
  expect((await h1s.first().innerText()).trim(), 'the index h1 reads Changelog').toBe('Changelog');
  expect(
    await rowTitleHrefs(page.locator('[data-index-list-row]')),
    'index rows newest-first per the git-tag-derived order',
  ).toEqual(expectedVersions.map(releaseRoute));

  const newest = expectedVersions[0];
  const response = await navigateLocalhost(page, releaseRoute(newest));
  expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  const article = await releaseArticle(page);
  expect(await article.innerText(), 'the article shows the literal release date').toContain(
    expectedDates.get(newest),
  );
  expect(await articleH2Texts(article), 'the article h2s are Added/Changed/Fixed in order').toEqual(
    ARTICLE_H2S,
  );
  const hrefs = await componentHrefs(article);
  expect(
    hrefs.length,
    'at least 1 touched-component link on the release page',
  ).toBeGreaterThanOrEqual(1);
  for (const href of hrefs) {
    const status = await request.get(new URL(href, PREVIEW_URL).href);
    expect(status.status(), `${href} must return HTTP 200`).toBe(200);
  }
  record('gbc-008-ac-1', { route: releaseRoute(newest), hrefs });
  record('screenshot', await capture(page, testInfo, 'ac1-release-page'));
});

test('FLOW-DOCS-06-changelog-release-pages GBC-008-AC-2 every release page 200 with UTC date and three headings', async ({
  page,
}, testInfo) => {
  const visited: { route: string; date: string; h2s: string[] }[] = [];
  for (const version of expectedVersions) {
    const response = await navigateLocalhost(page, releaseRoute(version));
    expect(response?.status(), `${releaseRoute(version)} must return HTTP 200`).toBe(200);
    await pageLoad(page, testInfo);
    const article = await releaseArticle(page);
    const date = expectedDates.get(version) ?? '';
    expect(await article.innerText(), `${releaseRoute(version)} shows its UTC date`).toContain(
      date,
    );
    const h2s = await articleH2Texts(article);
    expect(h2s, `${releaseRoute(version)} carries the three headings in order`).toEqual(
      ARTICLE_H2S,
    );
    visited.push({ route: releaseRoute(version), date, h2s });
  }
  record('gbc-008-ac-2', { visited });
  record('screenshot', await capture(page, testInfo, 'ac2-release-pages'));
});

test('FLOW-DOCS-06-changelog-release-pages GBC-008-AC-3 newest release row and article link the same titled slugs', async ({
  page,
}, testInfo) => {
  const newest = expectedVersions[0];
  await openIndex(page, testInfo);
  const rows = page.locator('[data-index-list-row]');
  const rowHrefs = await componentHrefs(rows.first());
  expect(
    rowHrefs.length,
    'the newest release row carries its touched-component links',
  ).toBeGreaterThanOrEqual(1);

  const response = await navigateLocalhost(page, releaseRoute(newest));
  expect(response?.status(), `${releaseRoute(newest)} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);
  const articleHrefs = await componentHrefs(await releaseArticle(page));
  expect(articleHrefs.length, 'the article carries the same links').toBeGreaterThanOrEqual(1);

  const rowSlugs = rowHrefs.map((href) => href.replace(/^\/components\//, '')).sort();
  const articleSlugs = articleHrefs.map((href) => href.replace(/^\/components\//, '')).sort();
  expect(articleSlugs, 'the row and article slug sets are equal').toEqual(rowSlugs);

  for (const href of rowHrefs) {
    const slug = href.replace(/^\/components\//, '').toLowerCase();
    expect(ledgerNames.has(slug), `${slug} is one of the 56 ledger names`).toBe(true);
    const destination = await navigateLocalhost(page, href);
    expect(destination?.status(), `${href} must return HTTP 200`).toBe(200);
    await pageLoad(page, testInfo);
    const h1 = (await page.locator('main h1').first().innerText()).trim();
    expect(h1, `${href} h1 equals the ledger title`).toBe(ledgerBySlug.get(slug)?.title);
  }
  record('gbc-008-ac-3', { rowSlugs, articleSlugs });
});
