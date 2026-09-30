import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * FLOW-DOCS-03-five-guides-index (GBC-010) — the /guides section-index over
 * the REAL built docs preview on localhost:4321, all greppable under the
 * locked flow token. 15 tests: this task's own three ACs plus one test per
 * final early AC bound to the flow in its OWN task file — GBC-001/AC-1..AC-4,
 * GBC-002/AC-1..AC-2, GBC-009/AC-1, GBC-015/AC-1 and AC-3, GBC-016/AC-1, AC-3
 * and AC-4. The task files win on any wording difference; every claim below
 * encodes its AC's must_observe / must_not_observe as written there.
 *
 * GBC-001 spec-encoding guidance: expressive-code wraps code lines in spans,
 * so code blocks are read via <pre><code> textContent; goal sentences are
 * counted over the full main text INCLUDING the rendered description
 * (PageHeader renders each guide's description into its page body); the
 * rendermarkdown/textclasscontext anchors are the heading-derived ids the
 * markdown pipeline emits (github-slugger over the literal headings).
 */

const FLOW_ID = 'FLOW-DOCS-03-five-guides-index';
const SPEC_REL = 'tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts';
const GUIDES_ROUTE = '/guides';
const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

/** The five launch guides' published slugs — the spec's expected set (AC-3). */
const GUIDE_SLUGS = [
  're-theme',
  'update-installed-items',
  'preview-on-device',
  'customize-rendering',
  'troubleshooting',
] as const;

const GUIDE_HREFS = GUIDE_SLUGS.map((slug) => `/guides/${slug}`);
const EXPECTED_HREF_SET = [...GUIDE_HREFS].sort().join(',');

const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-06-guides-boundary-changelog/evidence',
  FLOW_ID,
);

const LOCKED_COMMAND = `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test ${SPEC_REL} --grep ${FLOW_ID}`;

/**
 * Per-test status files under gitignored scratch: each test's afterEach writes
 * one status file; afterAll aggregates the directory into run.json, so the
 * recorded exit reflects every test of the latest run — never just the last.
 */
const STATUS_DIR = join(
  repoRoot,
  `.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/${FLOW_ID}-statuses`,
);

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

// --- guide frontmatter through Astro's own parser (GBC-009/AC-1 h1 claim) ----

interface GuideFrontmatter {
  title: string;
  description: string;
}

/** Astro's own frontmatter parser, resolved through the astro install apps/docs owns. */
async function parseGuideFrontmatter(): Promise<Record<string, GuideFrontmatter>> {
  const requireFromDocs = createRequire(pathToFileURL(join(repoRoot, 'apps/docs/package.json')));
  const astroPackagePath = requireFromDocs.resolve('astro/package.json');
  const requireFromAstro = createRequire(astroPackagePath);
  const helperPath = requireFromAstro.resolve('@astrojs/internal-helpers/frontmatter');
  const { parseFrontmatter } = (await import(helperPath)) as {
    parseFrontmatter: (input: string) => { frontmatter: Record<string, unknown> };
  };
  const out: Record<string, GuideFrontmatter> = {};
  for (const slug of GUIDE_SLUGS) {
    const source = readFileSync(
      join(repoRoot, `apps/docs/src/content/docs/guides/${slug}.md`),
      'utf8',
    );
    const frontmatter = parseFrontmatter(source).frontmatter;
    out[slug] = {
      title: String(frontmatter.title),
      description: String(frontmatter.description),
    };
  }
  return out;
}

const guideFrontmatter = await parseGuideFrontmatter();

// --- shared helpers ----------------------------------------------------------

/**
 * Settle the page after load, EXCEPT in the no-JavaScript project: the harness
 * settle waits for the page's own astro:page-load event, which never fires
 * without JS. The authored pages are static HTML, so locators auto-wait on the
 * served DOM (page.evaluate still works — script-execution-disabled only stops
 * page scripts, not CDP evaluation).
 */
async function pageLoad(
  page: Parameters<typeof waitForAstroPageLoad>[0],
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.project.name === 'chromium-nojs') return;
  await waitForAstroPageLoad(page);
}

/** The guide/index body text: main.innerText keeps block boundaries as lines
 * (compressed HTML would glue them in textContent) and scopes out the sidebar
 * nav and the ToC rail, which live in asides outside <main>. */
async function mainText(page: Page): Promise<string> {
  return page.locator('main').innerText();
}

/** Exactly 1 sentence starting with the goal literal, over the full main text
 * including the rendered description (GBC-001 encoding guidance). */
function goalSentenceCount(text: string): number {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?]) /)
    .filter((sentence) => sentence.startsWith('This guide shows you how to')).length;
}

/** Sentence chunks for the AC-4 pairing check: line breaks AND [.!?:] all end a
 * chunk, so a colon-introduced bullet list never welds two claims together. */
function sentenceChunks(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?:])\s+/))
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);
}

const observations: Record<string, unknown> = {};

function record(testInfo: TestInfo, key: string, data: unknown): void {
  observations[`${testInfo.project.name}:${key}`] = data;
}

function statusKey(testInfo: TestInfo): string {
  const claim = /GBC-\d+\/AC-\d+|AC-\d+/.exec(testInfo.title)?.[0] ?? 'unknown';
  return `${testInfo.project.name}--${claim.toLowerCase().replace('/', '-')}`;
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
  const runIdentity = `gbc-010-${Date.now()}`;
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
      guidesIndexPage: hashFile('apps/docs/src/pages/guides/index.astro'),
      guidesRoute: hashFile('apps/docs/src/pages/guides/[slug].astro'),
      indexList: hashFile('apps/docs/src/components/IndexList.astro'),
      sectionIndexLayout: hashFile('apps/docs/src/layouts/SectionIndexLayout.astro'),
      docsNavigation: hashFile('apps/docs/src/lib/docs-navigation.ts'),
      testFile: hashFile(SPEC_REL),
      distGuidesIndex: hashFile('apps/docs/dist/guides/index.html'),
    },
    references: [`tests/sprint-06-guides-boundary-changelog/evidence/${FLOW_ID}/proof.red`],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});

// ---------------------------------------------------------------------------
// GBC-010's own three ACs
// ---------------------------------------------------------------------------

test(`${FLOW_ID} AC-1 the guides index responds 200 with exactly five rows whose titles equal their destinations' h1, under an All guides header counting 5 and no ToC rail`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), '/guides must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  const rows = page.locator('main [data-index-list-row]');
  expect(await rows.count(), 'exactly 5 [data-index-list-row] rows inside main').toBe(5);

  const sectionH2 = page.locator('.section-header h2');
  expect(await sectionH2.count(), 'exactly 1 SectionHeader h2').toBe(1);
  expect(
    ((await sectionH2.textContent()) ?? '').trim(),
    "the SectionHeader h2 reads 'All guides'",
  ).toBe('All guides');

  const chip = page.locator('.section-header .chip');
  expect(await chip.count(), 'the SectionHeader carries a count Chip').toBe(1);
  const chipText = ((await chip.textContent()) ?? '').trim();
  expect(chipText, 'the count Chip reads 5 (never a literal All guides (5) line)').toBe('5');

  expect(
    await page.locator("nav[aria-label='On this page']").count(),
    'no On this page ToC rail on the short index page',
  ).toBe(0);

  // Two passes: read EVERY row's title + href off /guides first — navigating
  // to a destination detaches these locators, so the reads must all precede
  // the first hop.
  const rowReads: { href: string; title: string }[] = [];
  for (let index = 0; index < 5; index += 1) {
    const titleAnchor = rows.nth(index).locator('a[data-index-list-title]');
    const title = ((await titleAnchor.textContent()) ?? '').trim();
    const href = await titleAnchor.getAttribute('href');
    expect(href, `row ${index + 1} carries a href`).toBeTruthy();
    rowReads.push({ href: href as string, title });
  }

  const rowFacts: { href: string; title: string; destinationH1: string }[] = [];
  for (const read of rowReads) {
    const destination = await navigateLocalhost(page, read.href);
    expect(destination?.status(), `row href ${read.href} responds 200`).toBe(200);
    const h1 = ((await page.locator('main h1').textContent()) ?? '').trim();
    expect(read.title, `row '${read.title}' title equals its destination page h1`).toBe(h1);
    rowFacts.push({ href: read.href, title: read.title, destinationH1: h1 });
  }
  expect(chipText, 'the Chip value stays connected to the rows it counts').toBe(
    String(rowFacts.length),
  );

  record(testInfo, 'ac-1', {
    status: 200,
    rows: 5,
    h2: 'All guides',
    chip: chipText,
    tocNavs: 0,
    rowFacts,
  });
});

test(`${FLOW_ID} AC-2 every guides-index row href is a distinct /guides/ path answering 200`, async ({
  page,
  request,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), '/guides must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  const titleAnchors = page.locator('main a[data-index-list-title]');
  expect(await titleAnchors.count(), '5 title anchors').toBe(5);

  const hrefs: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    const href = await titleAnchors.nth(index).getAttribute('href');
    expect(href, `row ${index + 1} carries a non-empty href`).toBeTruthy();
    expect((href as string).length, `row ${index + 1} href is not empty`).toBeGreaterThan(0);
    expect(
      (href as string).startsWith('/guides/'),
      `row ${index + 1} href ${href} starts with /guides/`,
    ).toBe(true);
    hrefs.push(href as string);
  }

  expect(new Set(hrefs).size, 'the 5 hrefs are 5 distinct paths').toBe(5);

  for (const href of hrefs) {
    const status = await request.get(new URL(href, PREVIEW_URL).href).then((r) => r.status());
    expect(status, `row href ${href} responds 200 from the preview`).toBe(200);
  }

  record(testInfo, 'ac-2', { status: 200, hrefs });
});

test(`${FLOW_ID} AC-3 the row href set is exactly the five launch guides with no porting, engine or theming row`, async ({
  page,
  request,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), '/guides must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  const titleAnchors = page.locator('main a[data-index-list-title]');
  const hrefs: string[] = [];
  for (let index = 0; index < (await titleAnchors.count()); index += 1) {
    hrefs.push((await titleAnchors.nth(index).getAttribute('href')) ?? '');
  }
  expect([...hrefs].sort().join(','), 'the row hrefs are exactly the five launch guides').toBe(
    EXPECTED_HREF_SET,
  );

  expect(
    hrefs.some((href) => href.endsWith('/theming')),
    'no row for the reserved theming slug',
  ).toBe(false);
  expect(
    hrefs.some((href) => href.includes('engine')),
    'no engine-choice row',
  ).toBe(false);
  expect(
    hrefs.some((href) => href === '/porting'),
    'no porting row',
  ).toBe(false);

  const theming = await request.get(new URL('/docs/theming', PREVIEW_URL).href);
  expect(theming.status(), '/docs/theming still answers 200 (static route owns it)').toBe(200);

  record(testInfo, 'ac-3', { status: 200, hrefs, themingStatus: theming.status() });
});

// ---------------------------------------------------------------------------
// GBC-001/AC-1..AC-4 — the four job how-to guides (their task file's wording)
// ---------------------------------------------------------------------------

test(`${FLOW_ID} GBC-001/AC-1 re-theme returns 200 with oklch and @theme, one goal sentence, a theming link out, and exactly one index anchor`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, '/guides/re-theme');
  expect(response?.status(), '/guides/re-theme must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  const text = await mainText(page);
  expect(
    (text.match(/oklch/g) ?? []).length,
    "'oklch' appears at least 1 time",
  ).toBeGreaterThanOrEqual(1);
  expect(
    (text.match(/@theme/g) ?? []).length,
    "'@theme' appears at least 1 time",
  ).toBeGreaterThanOrEqual(1);
  expect(goalSentenceCount(text), "exactly 1 sentence starts 'This guide shows you how to'").toBe(
    1,
  );
  expect(/coming soon/i.test(text), "no 'coming soon' in the guide body").toBe(false);
  expect(text.includes('TODO'), "no 'TODO' in the guide body").toBe(false);

  expect(
    await page.locator('main a[href="/docs/theming"]').count(),
    'at least 1 /docs/theming anchor (link out, token map not copied)',
  ).toBeGreaterThanOrEqual(1);

  await navigateLocalhost(page, GUIDES_ROUTE);
  expect(
    await page.locator('[data-index-list] a[href="/guides/re-theme"]').count(),
    'exactly 1 /guides/re-theme anchor inside [data-index-list] on /guides',
  ).toBe(1);

  record(testInfo, 'gbc-001-ac-1', { status: 200, oklch: true, theme: true, goalSentences: 1 });
});

test(`${FLOW_ID} GBC-001/AC-2 update-installed-items carries the literal absolute-URL add command, no short-name or relative adds`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, '/guides/update-installed-items');
  expect(response?.status(), '/guides/update-installed-items must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  // expressive-code wraps every code line in span-styled ec-line divs and its
  // serialized HTML carries NO newline text between them, so textContent fuses
  // the lines. Read the block's innerText instead: the ec-line divs are block
  // boxes, so innerText restores the line boundaries (and works without JS).
  const codeBlocks = await page.locator('main pre').allInnerTexts();
  const codeLines = codeBlocks
    .flatMap((block) => block.split('\n'))
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const addLines = codeLines.filter((line) =>
    line.includes('npx @react-native-reusables/cli@latest add'),
  );
  expect(
    addLines.length,
    'at least 1 code line carries the absolute-URL add command',
  ).toBeGreaterThanOrEqual(1);

  const ADD_LITERAL =
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/item.json';
  expect(
    addLines.some((line) => line === ADD_LITERAL || line === `${ADD_LITERAL} --overwrite`),
    'the exact no---yes add literal is present verbatim',
  ).toBe(true);

  // A bare short-name add (such as 'add button') or a relative URL fails this
  // exact-form match, so the pattern IS the short-name / relative prohibition.
  const urlPattern =
    /^https:\/\/rnraielements\.com\/r\/(?:nativewind|uniwind)\/[a-z0-9-]+\.json(?: --overwrite)?$/;
  for (const line of addLines) {
    const arg = line.slice(line.indexOf(' add ') + ' add '.length);
    expect(
      arg,
      `add argument is an absolute registry URL (no short name, no relative): ${line}`,
    ).toMatch(urlPattern);
    expect(arg.startsWith('/') || arg.startsWith('./'), `no relative add URL: ${line}`).toBe(false);
  }

  expect(goalSentenceCount(await mainText(page)), 'exactly 1 goal sentence').toBe(1);

  record(testInfo, 'gbc-001-ac-2', { status: 200, addLines });
});

test(`${FLOW_ID} GBC-001/AC-3 customize-rendering documents both seams once and the message page seam Callout links it, never the old theming anchors`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, '/guides/customize-rendering');
  expect(response?.status(), '/guides/customize-rendering must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  expect(
    await page.locator('#rendermarkdown').count(),
    "exactly 1 element with id 'rendermarkdown' (heading-derived id)",
  ).toBe(1);
  expect(
    await page.locator('#textclasscontext').count(),
    "exactly 1 element with id 'textclasscontext' (heading-derived id)",
  ).toBe(1);

  const text = await mainText(page);
  expect(text.includes('message'), "'message' named as a renderMarkdown call site").toBe(true);
  expect(text.includes('reasoning'), "'reasoning' named as a renderMarkdown call site").toBe(true);
  expect(goalSentenceCount(text), 'exactly 1 goal sentence').toBe(1);

  await navigateLocalhost(page, '/components/message');
  await pageLoad(page, testInfo);
  expect(
    await page.locator('a[href="/guides/customize-rendering#rendermarkdown"]').count(),
    'at least 1 anchor to /guides/customize-rendering#rendermarkdown',
  ).toBeGreaterThanOrEqual(1);
  expect(
    await page.locator('a[href="/docs/theming#rendermarkdown"]').count(),
    'no stale /docs/theming#rendermarkdown anchor',
  ).toBe(0);
  expect(
    await page.locator('a[href="/docs/theming#textclasscontext"]').count(),
    'no stale /docs/theming#textclasscontext anchor',
  ).toBe(0);

  record(testInfo, 'gbc-001-ac-3', { status: 200, ids: 2, seamAnchor: true, staleAnchors: 0 });
});

test(`${FLOW_ID} GBC-001/AC-4 preview-on-device opens from the index click, scopes Expo Go vs the four dev-client items, one goal sentence, no supported-in-Expo-Go pairing`, async ({
  page,
}, testInfo) => {
  await navigateLocalhost(page, GUIDES_ROUTE);
  const [navResponse] = await Promise.all([
    page.waitForResponse((r) => new URL(r.url()).pathname === '/guides/preview-on-device'),
    page.locator('[data-index-list] a[href="/guides/preview-on-device"]').click(),
  ]);
  expect(navResponse?.status(), 'the index click lands on a 200 page').toBe(200);
  await pageLoad(page, testInfo);

  const text = await mainText(page);
  expect(
    (text.match(/Expo Go/g) ?? []).length,
    "'Expo Go' appears at least 2 times",
  ).toBeGreaterThanOrEqual(2);

  for (const name of [
    'react-native-enriched-markdown',
    'react-native-streamdown',
    'expo-speech-recognition',
    'expo-audio',
  ]) {
    expect(text.includes(name), `'${name}' appears at least 1 time`).toBe(true);
  }

  expect(goalSentenceCount(text), 'exactly 1 goal sentence').toBe(1);

  const pairing = sentenceChunks(text).filter(
    (chunk) => chunk.includes('Expo Go') && chunk.includes('react-native-enriched-markdown'),
  );
  expect(
    pairing,
    "no sentence pairs 'Expo Go' with 'react-native-enriched-markdown' as supported",
  ).toEqual([]);

  record(testInfo, 'gbc-001-ac-4', {
    status: 200,
    expoGoMentions: (text.match(/Expo Go/g) ?? []).length,
    pairing,
  });
});

// ---------------------------------------------------------------------------
// GBC-002/AC-1..AC-2 — the troubleshooting guide and its inbound links
// ---------------------------------------------------------------------------

test(`${FLOW_ID} GBC-002/AC-1 troubleshooting has exactly four Symptom/Cause/Fix entries, no stubs, and exactly one index anchor`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, '/guides/troubleshooting');
  expect(response?.status(), '/guides/troubleshooting must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  // Entry headings are scoped to main: the three sidebar nav h2s ('Getting
  // started', 'Guides', 'Porting') live in an aside outside <main>.
  const main = page.locator('main');
  expect(await main.locator('h2').count(), 'exactly 4 level-2 entry headings').toBe(4);

  const lines = (await main.innerText()).split('\n').map((line) => line.trim());
  for (const label of ['Symptom', 'Cause', 'Fix']) {
    expect(lines.filter((line) => line === label).length, `exactly 4 '${label}' labels`).toBe(4);
  }
  const text = lines.join('\n');
  expect(/coming soon/i.test(text), "no 'coming soon' in the guide body").toBe(false);
  expect(/TODO/.test(text), "no 'TODO' in the guide body").toBe(false);

  await navigateLocalhost(page, GUIDES_ROUTE);
  expect(
    await page.locator('[data-index-list] a[href="/guides/troubleshooting"]').count(),
    'exactly 1 /guides/troubleshooting anchor inside [data-index-list] on /guides',
  ).toBe(1);

  record(testInfo, 'gbc-002-ac-1', {
    status: 200,
    entryH2s: 4,
    labels: { Symptom: 4, Cause: 4, Fix: 4 },
  });
});

test(`${FLOW_ID} GBC-002/AC-2 the dependency-panel footer Callout links troubleshooting and the registry, and installation links the guide`, async ({
  page,
  request,
}, testInfo) => {
  const response = await navigateLocalhost(page, '/components/message');
  expect(response?.status(), '/components/message must return HTTP 200').toBe(200);
  await pageLoad(page, testInfo);

  const callout = page.locator('main footer.deps-footer .callout');
  expect(await callout.count(), 'exactly 1 footer Callout in the dependency panel').toBe(1);
  expect(
    await callout.locator('a[href="/guides/troubleshooting"]').count(),
    "exactly 1 '/guides/troubleshooting' anchor in the footer Callout",
  ).toBe(1);
  expect(
    await callout.locator('a[href="/registry"]').count(),
    "exactly 1 '/registry' anchor still in that same Callout",
  ).toBe(1);

  await navigateLocalhost(page, '/docs/installation');
  expect(
    await page.locator('a[href="/guides/troubleshooting"]').count(),
    'at least 1 /guides/troubleshooting anchor on /docs/installation',
  ).toBeGreaterThanOrEqual(1);

  const guide = await request.get(new URL('/guides/troubleshooting', PREVIEW_URL).href);
  expect(guide.status(), 'GET /guides/troubleshooting responds 200').toBe(200);

  record(testInfo, 'gbc-002-ac-2', {
    calloutLinks: 2,
    installationAnchorsAtLeast: 1,
    guideStatus: 200,
  });
});

// ---------------------------------------------------------------------------
// GBC-009/AC-1 — section-aware routing
// ---------------------------------------------------------------------------

test(`${FLOW_ID} GBC-009/AC-1 the five guides publish at /guides/slug with h1 equal to frontmatter title, no /docs aliases, no /guides/guides hrefs`, async ({
  page,
  request,
}, testInfo) => {
  const statuses: Record<string, number> = {};
  for (const slug of GUIDE_SLUGS) {
    const guide = await navigateLocalhost(page, `/guides/${slug}`);
    expect(guide?.status(), `/guides/${slug} responds 200`).toBe(200);
    await pageLoad(page, testInfo);

    const h1 = ((await page.locator('main h1').textContent()) ?? '').trim();
    expect(h1, `/guides/${slug} h1 equals its frontmatter title`).toBe(
      guideFrontmatter[slug].title,
    );

    const anchors = page.locator('a[href]');
    const anchorCount = await anchors.count();
    const hrefs: string[] = [];
    for (let index = 0; index < anchorCount; index += 1) {
      hrefs.push((await anchors.nth(index).getAttribute('href')) ?? '');
    }
    expect(
      hrefs.some((href) => href.includes('/guides/guides/')),
      `no href contains /guides/guides/ on /guides/${slug}`,
    ).toBe(false);

    const flat = await request.get(new URL(`/docs/${slug}`, PREVIEW_URL).href);
    expect(flat.status(), `/docs/${slug} flat alias responds 404`).toBe(404);
    const nested = await request.get(new URL(`/docs/guides/${slug}`, PREVIEW_URL).href);
    expect(nested.status(), `/docs/guides/${slug} nested alias responds 404`).toBe(404);

    statuses[`/guides/${slug}`] = 200;
    statuses[`/docs/${slug}`] = 404;
    statuses[`/docs/guides/${slug}`] = 404;
  }

  record(testInfo, 'gbc-009-ac-1', { statuses });
});

// ---------------------------------------------------------------------------
// GBC-015/AC-1, AC-3 — the IndexList primitive's browser contract
// ---------------------------------------------------------------------------

test(`${FLOW_ID} GBC-015/AC-1 the single index list holds exactly the five destinations, each description equal to its destination meta description`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), 'GET /guides responds 200').toBe(200);
  await pageLoad(page, testInfo);

  expect(await page.locator('[data-index-list]').count(), 'exactly 1 [data-index-list]').toBe(1);
  const rows = page.locator('[data-index-list-row]');
  expect(await rows.count(), 'exactly 5 [data-index-list-row] elements').toBe(5);

  // Two passes: hrefs AND descriptions must ALL be read off /guides before the
  // first hop — navigating to a destination detaches these locators.
  const hrefs: string[] = [];
  const descriptions: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    const row = rows.nth(index);
    hrefs.push((await row.locator('a[data-index-list-title]').getAttribute('href')) ?? '');
    descriptions.push(
      ((await row.locator('[data-index-list-description]').textContent()) ?? '').trim(),
    );
  }
  expect([...hrefs].sort().join(','), 'the 5 title hrefs are exactly the five /guides/ paths').toBe(
    EXPECTED_HREF_SET,
  );

  for (let index = 0; index < 5; index += 1) {
    expect(
      descriptions[index].length,
      `row ${index + 1} description is non-empty`,
    ).toBeGreaterThanOrEqual(1);
    await navigateLocalhost(page, hrefs[index]);
    const meta = await page.locator('meta[name="description"]').getAttribute('content');
    expect(
      descriptions[index],
      `row ${index + 1} description equals ${hrefs[index]} meta description`,
    ).toBe((meta ?? '').trim());
  }

  record(testInfo, 'gbc-015-ac-1', { lists: 1, rows: 5, hrefs });
});

test(`${FLOW_ID} GBC-015/AC-3 the five rows are relative LI touch targets of 44px with an absolute stretch, and no nested anchors in the raw HTML`, async ({
  page,
  request,
}, testInfo) => {
  const raw = await request.get(new URL(GUIDES_ROUTE, PREVIEW_URL).href);
  expect(raw.status(), 'GET /guides responds 200').toBe(200);
  const html = await raw.text();

  const titleAnchors = html.match(/<a\b[^>]*data-index-list-title[^>]*>[\s\S]*?<\/a>/g) ?? [];
  expect(titleAnchors.length, '5 title anchors in the raw HTML').toBe(5);
  const nested = titleAnchors.filter((anchor) =>
    anchor.slice(anchor.indexOf('>') + 1, anchor.lastIndexOf('</a>')).includes('<a'),
  );
  expect(nested, '0 <a tokens between a data-index-list-title opening tag and its </a>').toEqual(
    [],
  );

  await navigateLocalhost(page, GUIDES_ROUTE);
  const rows = page.locator('[data-index-list-row]');
  expect(await rows.count(), 'exactly 5 rows').toBe(5);

  for (let index = 0; index < 5; index += 1) {
    const row = rows.nth(index);
    // The repo tsconfig has no DOM lib, so computed styles are read through
    // the element's own view (el.ownerDocument.defaultView) instead of the
    // getComputedStyle/document global identifiers tsc cannot resolve here.
    expect(await row.evaluate((el) => el.tagName), `row ${index + 1} tagName is LI`).toBe('LI');
    expect(
      await row.evaluate(
        (el) => el.ownerDocument.defaultView?.getComputedStyle(el).position ?? null,
      ),
      `row ${index + 1} computed position is relative`,
    ).toBe('relative');
    expect(
      await row.locator('a[data-index-list-title]').count(),
      `row ${index + 1} holds exactly 1 title anchor`,
    ).toBe(1);
    expect(
      await row.locator('[data-index-list-description]').count(),
      `row ${index + 1} holds exactly 1 description`,
    ).toBe(1);
    const titleAnchor = row.locator('a[data-index-list-title]');
    expect(
      await titleAnchor.evaluate(
        (el) => el.ownerDocument.defaultView?.getComputedStyle(el, '::after').position ?? null,
      ),
      `row ${index + 1} title anchor ::after is absolute (the row stretch)`,
    ).toBe('absolute');
    const box = await row.boundingBox();
    expect(box?.height ?? 0, `row ${index + 1} boundingBox height >= 44`).toBeGreaterThanOrEqual(
      44,
    );
  }

  record(testInfo, 'gbc-015-ac-3', {
    titleAnchors: titleAnchors.length,
    nested: nested.length,
    rows: 5,
  });
});

// ---------------------------------------------------------------------------
// GBC-016/AC-1, AC-3, AC-4 — the section-index shell
// ---------------------------------------------------------------------------

test(`${FLOW_ID} GBC-016/AC-1 the shell renders the Guides masthead, one All guides header whose chip equals the row count, and no ToC`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), 'GET /guides responds 200').toBe(200);
  await pageLoad(page, testInfo);

  const h1 = page.locator('h1.page-header__title');
  expect(await h1.count(), 'exactly 1 h1.page-header__title').toBe(1);
  expect(((await h1.textContent()) ?? '').trim(), "the masthead reads 'Guides'").toBe('Guides');

  const h2 = page.locator('.section-header h2');
  expect(await h2.count(), 'exactly 1 .section-header h2').toBe(1);
  expect(((await h2.textContent()) ?? '').trim(), "the section heading reads 'All guides'").toBe(
    'All guides',
  );

  const chip = page.locator('.section-header .chip');
  expect(await chip.count(), 'the section header has a chip child').toBe(1);
  const chipText = ((await chip.textContent()) ?? '').trim();

  const rowsInShell = page.locator('[data-section-index] [data-index-list-row]');
  const rowCount = await rowsInShell.count();
  expect(rowCount, 'exactly 5 rows inside [data-section-index]').toBe(5);
  expect(chipText, 'the chip text equals the row count').toBe(String(rowCount));

  expect(
    await page.locator("nav[aria-label='On this page']").count(),
    "0 nav[aria-label='On this page'] elements",
  ).toBe(0);
  expect(
    (await page.locator('body').innerText()).includes('All guides (5)'),
    "no literal text 'All guides (5)'",
  ).toBe(false);

  record(testInfo, 'gbc-016-ac-1', {
    h1: 'Guides',
    h2: 'All guides',
    chip: chipText,
    rows: rowCount,
    tocNavs: 0,
  });
});

test(`${FLOW_ID} GBC-016/AC-3 the short index serves the entry list with neither ToC form`, async ({
  page,
}, testInfo) => {
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), 'GET /guides responds 200').toBe(200);
  await pageLoad(page, testInfo);

  const rows = page.locator('[data-index-list-row]');
  expect(await rows.count(), 'exactly 5 rows (a populated body, not a blank page)').toBe(5);
  expect(
    await page.locator("nav[aria-label='On this page']").count(),
    "0 nav[aria-label='On this page']",
  ).toBe(0);
  expect(await page.locator('.toc__nav').count(), '0 .toc__nav elements').toBe(0);

  record(testInfo, 'gbc-016-ac-3', { rows: 5, tocNavs: 0, tocNavClass: 0 });
});

test(`${FLOW_ID} GBC-016/AC-4 at a 393px viewport the section index is single-track, the docs nav is a visible 44px touch surface, and nothing overflows`, async ({
  page,
}, testInfo) => {
  // This test sets its own Pixel 5 viewport so it asserts on all 3 projects
  // (chromium-desktop and chromium-nojs default to a desktop viewport).
  await page.setViewportSize({ width: 393, height: 851 });
  const response = await navigateLocalhost(page, GUIDES_ROUTE);
  expect(response?.status(), 'GET /guides responds 200').toBe(200);
  await pageLoad(page, testInfo);

  const columns = (await page
    .locator('[data-section-index]')
    .evaluate(
      (el) => el.ownerDocument.defaultView?.getComputedStyle(el).gridTemplateColumns ?? '',
    )) as string;
  expect(
    columns.trim().split(/\s+/).length,
    `[data-section-index] grid-template-columns is exactly 1 track at 393px, got '${columns}'`,
  ).toBe(1);

  const docsNav = page.locator('nav[data-docs-nav]');
  const navBox = await docsNav.boundingBox();
  expect(navBox?.width ?? 0, 'nav[data-docs-nav] has a boundingBox width > 0').toBeGreaterThan(0);

  const links = docsNav.locator('a');
  const linkCount = await links.count();
  expect(linkCount, 'the docs nav holds at least 1 link').toBeGreaterThanOrEqual(1);
  let tallLinks = 0;
  for (let index = 0; index < linkCount; index += 1) {
    const box = await links.nth(index).boundingBox();
    if ((box?.height ?? 0) >= 44) tallLinks += 1;
  }
  expect(tallLinks, 'at least 1 nav link with a boundingBox height >= 44').toBeGreaterThanOrEqual(
    1,
  );

  const overflow = (await page.evaluate(`(() => {
    const g = globalThis;
    return g.document.documentElement.scrollWidth - g.document.documentElement.clientWidth;
  })()`)) as number;
  expect(
    overflow,
    'documentElement scrollWidth - clientWidth equals 0 (no horizontal overflow)',
  ).toBe(0);

  record(testInfo, 'gbc-016-ac-4', { columns, navWidth: navBox?.width, tallLinks, overflow });
});
