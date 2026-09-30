import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * journeys/docs-themer-arc (GBC-014) — the post-integration themer journey
 * over the REAL built docs preview on localhost:4321, chromium-desktop only.
 * Two tests, both greppable under the locked journey token:
 *
 *   AC-3 — read the /docs/theming token map, flip the theme with the header
 *     toggle once, watch the background swatch flip live without a reload,
 *     reload and read the FIRST recorded animation frame (already dark, no
 *     flash), then follow the header's Guides link to the index and the
 *     index's re-theme row (both 200, html still dark, guide carrying
 *     '@theme' and 'oklch').
 *   AC-4 — from /components/message, follow each seam Callout link; both land
 *     on /guides/customize-rendering with 200 and the matching section id.
 *
 * Encoding guidance carried from the sprint handoffs: in-page reads that
 * touch document/localStorage use string-expression IIFEs (no DOM lib in
 * tsconfig, the sprint-05 theme-toggle precedent); computed styles are read
 * through string expressions for the same reason; MPA/soft-nav link clicks
 * land with waitForResponse + toHaveURL, never an immediate url() read; this
 * journey does not re-declare FLOW-DOCS-03's early-AC observations.
 */

const JOURNEY_ID = 'journeys/docs-themer-arc';
const SPEC_REL = 'tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts';
const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

const LOCKED_COMMAND = `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test ${SPEC_REL} --grep ${JOURNEY_ID} --project=chromium-desktop`;

const FLOW_EVIDENCE_DIR = join(
  repoRoot,
  'tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-themer-arc',
);

const STATUS_DIR = join(
  repoRoot,
  `.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/${JOURNEY_ID}-statuses`,
);

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

/** The html class list at the first animation frame of each document — the
 * pre-paint script runs during head parse, before any rAF, so the first
 * recorded frame is the first PAINTED state. */
const FRAME_RECORDER = `(() => {
  const holder = globalThis;
  holder.__rnrArcFrames = [];
  requestAnimationFrame(() => {
    holder.__rnrArcFrames.push(holder.document.documentElement.className);
  });
})()`;

const FIRST_FRAME_READ = `(() => (globalThis.__rnrArcFrames ?? [])[0] ?? null)()`;

const READ_THEME_STORAGE = `(() => {
  try { return localStorage.getItem('rnr-theme'); } catch (e) { return null; }
})()`;

const READ_ROOT_CLASS = `(() => document.documentElement.className)()`;

/** The background row's live swatch resolves var(--background), so its
 * computed backgroundColor is the token's used value under the active theme. */
const READ_BACKGROUND_SWATCH = `(() => {
  const swatch = document.querySelector('tr[data-token="background"] [data-swatch]');
  return swatch ? getComputedStyle(swatch).backgroundColor : null;
})()`;

// --- shared helpers ----------------------------------------------------------

async function readFirstFrame(page: Page): Promise<string | null> {
  return (await page.evaluate(FIRST_FRAME_READ)) as string | null;
}

async function readSwatch(page: Page): Promise<string | null> {
  return (await page.evaluate(READ_BACKGROUND_SWATCH)) as string | null;
}

const observations: Record<string, unknown> = {};

function record(testInfo: TestInfo, key: string, data: unknown): void {
  observations[`${testInfo.project.name}:${key}`] = data;
}

function statusKey(testInfo: TestInfo): string {
  const claim = /AC-\d+/.exec(testInfo.title)?.[0] ?? 'unknown';
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
      docsLayout: hashFile('apps/docs/src/layouts/DocsLayout.astro'),
      themeToggle: hashFile('apps/docs/src/scripts/theme-toggle.ts'),
      tokenTable: hashFile('apps/docs/src/components/TokenTable.astro'),
      seamMap: hashFile('apps/docs/src/lib/seam-map.ts'),
      itemPage: hashFile('apps/docs/src/pages/components/[item].astro'),
      testFile: hashFile(SPEC_REL),
    },
    references: [
      'tests/sprint-06-guides-boundary-changelog/evidence/journeys/docs-themer-arc/proof.red',
    ],
  };
  writeFileSync(join(FLOW_EVIDENCE_DIR, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});

// The journey's GIVEN: a fresh context with colorScheme light and no stored
// theme, so the page starts light (stored rnr-theme > system scheme > dark).
test.use({ colorScheme: 'light' });

// ---------------------------------------------------------------------------
// AC-3: token map -> live toggle -> first-frame dark -> the re-theme guide
// ---------------------------------------------------------------------------

test(`${JOURNEY_ID} AC-3 themer arc: the swatch flips live, the reload's first frame is dark, and the header's Guides link reaches the re-theme guide`, async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'the themer arc is a chromium-desktop claim',
  );
  test.setTimeout(240_000);

  await page.context().addInitScript(FRAME_RECORDER);

  const main = page.locator('main');

  // 1. The token map: 200, at least 10 semantic rows, light swatch value.
  const theming = await navigateLocalhost(page, '/docs/theming');
  const themingStatus = theming?.status() ?? null;
  await waitForAstroPageLoad(page);
  const tokenRowCount = await page.locator('tr[data-token]').count();
  const swatchBefore = await readSwatch(page);

  // 2. ONE toggle click: swatch flips live (no reload in between), html goes
  // dark, storage persists the choice.
  await page.locator('button[aria-label="Toggle dark and light theme"]').click();
  const swatchAfter = await readSwatch(page);
  const rootClassAfter = (await page.evaluate(READ_ROOT_CLASS)) as string;
  const storedTheme = (await page.evaluate(READ_THEME_STORAGE)) as string | null;

  // 3. Reload: the FIRST recorded animation frame already carries dark.
  await page.reload();
  await waitForAstroPageLoad(page);
  const firstFrameAfterReload = await readFirstFrame(page);

  // 4. The header's Guides link, then the index row to the re-theme guide.
  const guidesNav = page.waitForResponse(
    (candidate) => new URL(candidate.url()).pathname === '/guides',
  );
  await page.locator('.site-header__nav a[href="/guides"]').click();
  const guidesResponse = await guidesNav;
  await expect(page).toHaveURL(new URL('/guides', PREVIEW_URL).href);
  await waitForAstroPageLoad(page);
  const guidesRootClass = (await page.evaluate(READ_ROOT_CLASS)) as string;

  const reThemeNav = page.waitForResponse(
    (candidate) => new URL(candidate.url()).pathname === '/guides/re-theme',
  );
  await page.locator('[data-index-list] a[href="/guides/re-theme"]').click();
  const reThemeResponse = await reThemeNav;
  await expect(page).toHaveURL(new URL('/guides/re-theme', PREVIEW_URL).href);
  await waitForAstroPageLoad(page);
  const reThemeRootClass = (await page.evaluate(READ_ROOT_CLASS)) as string;
  const guideText = await main.innerText();

  // --- MUST_OBSERVE ----------------------------------------------------------
  expect(themingStatus, '/docs/theming must return HTTP 200').toBe(200);
  expect(
    tokenRowCount,
    'at least 10 tr[data-token] rows (a populated TokenTable)',
  ).toBeGreaterThanOrEqual(10);
  expect(
    swatchBefore,
    'the background swatch computes to light oklch(1 0 0) before the toggle',
  ).toBe('oklch(1 0 0)');
  expect(
    swatchAfter,
    'the background swatch computes to dark oklch(0.145 0 0) after 1 click, no reload',
  ).toBe('oklch(0.145 0 0)');
  expect(rootClassAfter.includes('dark'), "after the click, html carries class 'dark'").toBe(true);
  expect(storedTheme, "after the click, localStorage 'rnr-theme' equals 'dark'").toBe('dark');
  expect(
    firstFrameAfterReload?.includes('dark') ?? false,
    "the first recorded frame after the reload already carries class 'dark' (no flash)",
  ).toBe(true);
  expect(guidesResponse?.status(), 'the header Guides link lands on a 200 /guides').toBe(200);
  expect(reThemeResponse?.status(), 'the index row lands on a 200 /guides/re-theme').toBe(200);
  expect(guidesRootClass.includes('dark'), 'html still carries dark on /guides').toBe(true);
  expect(reThemeRootClass.includes('dark'), 'html still carries dark on /guides/re-theme').toBe(
    true,
  );
  expect(guideText.includes('@theme'), "the /guides/re-theme guide text contains '@theme'").toBe(
    true,
  );
  expect(guideText.includes('oklch'), "the /guides/re-theme guide text contains 'oklch'").toBe(
    true,
  );

  record(testInfo, 'ac-3', {
    themingStatus,
    tokenRowCount,
    swatchBefore,
    swatchAfter,
    rootClassAfter,
    storedTheme,
    reloadsBetweenReads: 0,
    firstFrameAfterReload,
    guidesStatus: guidesResponse?.status() ?? null,
    reThemeStatus: reThemeResponse?.status() ?? null,
    guidesRootClass,
    reThemeRootClass,
    guideCarriesThemeLiterals: {
      atTheme: guideText.includes('@theme'),
      oklch: guideText.includes('oklch'),
    },
  });
});

// ---------------------------------------------------------------------------
// AC-4: both seam Callout links on /components/message reach the guide sections
// ---------------------------------------------------------------------------

test(`${JOURNEY_ID} AC-4 both seam Callout links on /components/message land on the customize-rendering guide's matching sections`, async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium-desktop',
    'the themer arc is a chromium-desktop claim',
  );
  test.setTimeout(240_000);

  const message = await navigateLocalhost(page, '/components/message');
  const messageStatus = message?.status() ?? null;
  await waitForAstroPageLoad(page);

  const renderMarkdownLink = page.locator(
    'aside.callout a[href="/guides/customize-rendering#rendermarkdown"]',
  );
  const textClassContextLink = page.locator(
    'aside.callout a[href="/guides/customize-rendering#textclasscontext"]',
  );
  const staleRenderMarkdownLinks = page.locator(
    'aside.callout a[href="/docs/theming#rendermarkdown"]',
  );
  const staleTextClassContextLinks = page.locator(
    'aside.callout a[href="/docs/theming#textclasscontext"]',
  );
  const renderMarkdownCount = await renderMarkdownLink.count();
  const textClassContextCount = await textClassContextLink.count();
  const staleRenderMarkdownCount = await staleRenderMarkdownLinks.count();
  const staleTextClassContextCount = await staleTextClassContextLinks.count();

  // The counts are asserted BEFORE any click (the AC's action order): a
  // reverted or emptied seam map fails here, never as a click timeout.
  expect(messageStatus, '/components/message must return HTTP 200').toBe(200);
  expect(
    renderMarkdownCount,
    "exactly 1 aside.callout anchor with href '/guides/customize-rendering#rendermarkdown'",
  ).toBe(1);
  expect(
    textClassContextCount,
    "exactly 1 aside.callout anchor with href '/guides/customize-rendering#textclasscontext'",
  ).toBe(1);
  expect(staleRenderMarkdownCount, 'no stale /docs/theming#rendermarkdown callout link').toBe(0);
  expect(staleTextClassContextCount, 'no stale /docs/theming#textclasscontext callout link').toBe(
    0,
  );

  const guideHref = '/guides/customize-rendering';
  const guideStatus = await request
    .get(new URL(guideHref, PREVIEW_URL).href)
    .then((response) => response.status());

  // Click 1: the renderMarkdown seam link. The landed URL keeps the section
  // fragment, so the URL assertion accepts exactly the two seam fragments.
  const guideUrlPattern = new RegExp(
    `^${(new URL(guideHref, PREVIEW_URL).href).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(#rendermarkdown|#textclasscontext)?$`,
  );
  const renderMarkdownNav = page.waitForResponse(
    (candidate) => new URL(candidate.url()).pathname === guideHref,
  );
  await renderMarkdownLink.click();
  const renderMarkdownResponse = await renderMarkdownNav;
  await expect(page).toHaveURL(guideUrlPattern);
  await waitForAstroPageLoad(page);
  const renderMarkdownLandedPath = new URL(page.url()).pathname;
  const renderMarkdownIdCount = await page.locator('#rendermarkdown').count();
  const textClassContextIdCount = await page.locator('#textclasscontext').count();

  // Back to the component page, then click 2: the TextClassContext seam link.
  await navigateLocalhost(page, '/components/message');
  await waitForAstroPageLoad(page);
  const textClassNav = page.waitForResponse(
    (candidate) => new URL(candidate.url()).pathname === guideHref,
  );
  await textClassContextLink.click();
  const textClassResponse = await textClassNav;
  await expect(page).toHaveURL(guideUrlPattern);
  await waitForAstroPageLoad(page);
  const textClassLandedPath = new URL(page.url()).pathname;
  const textClassIdCountAfterSecond = await page.locator('#textclasscontext').count();

  // --- MUST_OBSERVE (landing claims; the link-count claims were asserted
  // before the clicks, in the AC's action order) -----------------------------
  expect(renderMarkdownResponse?.status(), 'the renderMarkdown seam click lands on a 200').toBe(
    200,
  );
  expect(
    renderMarkdownLandedPath,
    'the renderMarkdown seam click lands on /guides/customize-rendering',
  ).toBe(guideHref);
  expect(guideStatus, `GET ${guideHref} answers 200 to page.request.get`).toBe(200);
  expect(renderMarkdownIdCount, "exactly 1 element with id 'rendermarkdown' on the guide").toBe(1);
  expect(textClassContextIdCount, "exactly 1 element with id 'textclasscontext' on the guide").toBe(
    1,
  );
  expect(textClassResponse?.status(), 'the TextClassContext seam click lands on a 200').toBe(200);
  expect(
    textClassLandedPath,
    'the TextClassContext seam click lands on /guides/customize-rendering',
  ).toBe(guideHref);
  expect(
    textClassIdCountAfterSecond,
    "exactly 1 element with id 'textclasscontext' after the second landing",
  ).toBe(1);

  record(testInfo, 'ac-4', {
    messageStatus,
    calloutLinks: { renderMarkdown: renderMarkdownCount, textClassContext: textClassContextCount },
    staleLinks: {
      renderMarkdown: staleRenderMarkdownCount,
      textClassContext: staleTextClassContextCount,
    },
    guideStatus,
    firstClick: {
      status: renderMarkdownResponse?.status() ?? null,
      landedPath: renderMarkdownLandedPath,
      renderMarkdownIdCount,
      textClassContextIdCount,
    },
    secondClick: {
      status: textClassResponse?.status() ?? null,
      landedPath: textClassLandedPath,
      textClassContextIdCount: textClassIdCountAfterSecond,
    },
  });
});
