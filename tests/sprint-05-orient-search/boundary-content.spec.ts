import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-CONT-005 — author the real boundary explanation and missing-page
 * recovery copy. Four task-owned proofs over the real built dist on the
 * preview origin plus real repository source files:
 *
 *   AC-1  /docs/owns-vs-does-not-own serves substantive ownership prose that
 *         assigns AI UI composition to the library and all five model
 *         responsibilities (transcript state, transport, streaming client,
 *         provider calls, tool execution) to the consumer.
 *   AC-2  The renderer explanation matches the real MessageResponse and
 *         ReasoningContent sources (renderMarkdown prop, plain-Text fallback,
 *         no native-module import) and the real dev-client matrix (streamdown
 *         and enriched-markdown entries), and the visible prose explains the
 *         dev client consequence against the Expo Go-clean core.
 *   AC-3  The page's onward references resolve over the real preview: the
 *         Theming renderMarkdown anchor, the Message item destination, and a
 *         descriptive example-source link whose surrounding prose makes no
 *         live useChat claim; no placeholder hrefs.
 *   AC-4  apps/docs/src/content/system/not-found.md — parsed from the actual
 *         bytes in this Node worker — carries the missing-page title, the
 *         factual cause sentence, the Search documentation action label, and
 *         exactly the two direct recovery links, outside the docs collection.
 *
 * Nothing is mocked: page content is read through Chromium locators (the
 * no-JavaScript project reads the same static HTML), source oracles are the
 * real repository files, and the recovery source is parsed from disk. Each
 * test records its observed values as JSON under ORI_CONT_005_CAPTURE_DIR
 * (default .tmp/ORI-CONT-005/captures). UNGUARDED across chromium-desktop,
 * chromium-mobile, and chromium-nojs; retries 0.
 */

/** Repo-root-relative source oracles the tests read as real bytes. */
const MESSAGE_SOURCE = 'packages/registry/src/components/ai/message.tsx';
const REASONING_SOURCE = 'packages/registry/src/components/ai/reasoning.tsx';
const MATRIX_SOURCE = 'apps/docs/src/data/dev-client-matrix.json';
const RECOVERY_SOURCE = 'apps/docs/src/content/system/not-found.md';
const EXAMPLE_README = 'apps/example/README.md';
const EXAMPLE_APP_JSON = 'apps/example/app.json';
const BOUNDARY_ROUTE = '/docs/owns-vs-does-not-own';
const EXAMPLE_SOURCE_URL = 'https://github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example';

/** The five model responsibilities the consumer owns (task contract wording). */
const CONSUMER_RESPONSIBILITIES = [
  'transcript state',
  'transport',
  'streaming client',
  'provider calls',
  'tool execution',
] as const;

function repoFile(relative: string): string {
  // This spec lives at tests/sprint-05-orient-search/, so the repo root is
  // two levels up from this file's URL.
  const url = new URL(`../../${relative}`, import.meta.url);
  return decodeURIComponent(url.pathname);
}

/** Record one test's observed values for the content-review evidence file. */
function capture(testInfo: TestInfo, name: string, data: unknown): void {
  const dir = process.env.ORI_CONT_005_CAPTURE_DIR ?? '.tmp/ORI-CONT-005/captures';
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${testInfo.project.name}-${name}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/** Same capture for project-independent (filesystem-only) proofs. */
function captureShared(name: string, data: unknown): void {
  const dir = process.env.ORI_CONT_005_CAPTURE_DIR ?? '.tmp/ORI-CONT-005/captures';
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${name}.json`);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

/**
 * Settle the page after load, EXCEPT in the no-JavaScript project: the
 * harness settle runs page.evaluate, which cannot execute without JS. The
 * authored pages are static HTML, so locators auto-wait on the served DOM.
 */
async function pageLoad(
  page: Parameters<typeof waitForAstroPageLoad>[0],
  testInfo: TestInfo,
): Promise<void> {
  if (testInfo.project.name === 'chromium-nojs') return;
  await waitForAstroPageLoad(page);
}

test('ORI-CONT-005-AC-1', async ({ page }, testInfo) => {
  const response = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(response?.status(), `${BOUNDARY_ROUTE} must return HTTP 200`).toBe(200);
  await pageLoad(page, testInfo);

  const main = page.locator('main');

  // Scope paragraph first: audience + what the page covers.
  await expect(main.getByRole('heading', { name: 'What the library supplies' })).toBeVisible();
  await expect(main.getByRole('heading', { name: 'What your app supplies' })).toBeVisible();

  const body = (await main.innerText()).replace(/\s+/g, ' ');
  expect(body).toContain('AI UI compositions');
  expect(body).toContain('React Native Reusables');
  for (const responsibility of CONSUMER_RESPONSIBILITIES) {
    expect(body, `consumer responsibility: ${responsibility}`).toContain(responsibility);
  }

  // The library owns no model behavior — the explicit disclaimer must be
  // visible, and no placeholder shell may stand in for prose.
  expect(body).toContain('The library makes no provider calls and executes no tools.');
  expect(body).not.toContain('Coming soon');

  capture(testInfo, 'ac-1', {
    url: page.url(),
    status: response?.status() ?? null,
    libraryPhrases: ['AI UI compositions', 'React Native Reusables'],
    consumerResponsibilities: [...CONSUMER_RESPONSIBILITIES],
    disclaimer: 'The library makes no provider calls and executes no tools.',
  });
});

test('ORI-CONT-005-AC-2', async ({ page }, testInfo) => {
  // Source leg 1: the real renderMarkdown contract on both components.
  const messageSource = readFileSync(repoFile(MESSAGE_SOURCE), 'utf8');
  const reasoningSource = readFileSync(repoFile(REASONING_SOURCE), 'utf8');
  expect(messageSource).toMatch(/renderMarkdown\?: RenderMarkdown/);
  expect(reasoningSource).toMatch(/renderMarkdown\?: RenderMarkdown/);
  // The plain-Text fallback is real code, not prose: both components branch
  // to a <Text ...> render when the prop is omitted.
  expect(messageSource).toMatch(/return <Text/);
  expect(reasoningSource).toMatch(/<Text className="text-sm leading-5 text-muted-foreground">/);
  // Neither core IMPORTS the native markdown module — that is why the
  // plain-Text core stays runnable in Expo Go. (Comments may name the module;
  // the import graph must not carry it.)
  expect(messageSource).not.toMatch(/from ['"]react-native-enriched-markdown/);
  expect(reasoningSource).not.toMatch(/from ['"]react-native-enriched-markdown/);

  // Source leg 2: the real dev-client matrix entries (verdicts read, never
  // reauthored here).
  const matrix: { id: string; peers: { name: string }[] }[] = JSON.parse(
    readFileSync(repoFile(MATRIX_SOURCE), 'utf8'),
  );
  const streamdownEntry = matrix.find((entry) => entry.id === 'streamdown');
  const enrichedEntry = matrix.find((entry) => entry.id === 'enriched-markdown');
  expect(streamdownEntry, 'matrix must carry the streamdown entry').toBeDefined();
  expect(enrichedEntry, 'matrix must carry the enriched-markdown entry').toBeDefined();
  expect(streamdownEntry?.peers.map((peer) => peer.name)).toContain('react-native-streamdown');
  expect(enrichedEntry?.peers.map((peer) => peer.name)).toContain('react-native-enriched-markdown');

  // Browser leg: the built boundary route explains the choice in prose.
  const response = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(response?.status()).toBe(200);
  await pageLoad(page, testInfo);
  const main = page.locator('main');
  const body = (await main.innerText()).replace(/\s+/g, ' ');

  expect(body).toContain('MessageResponse');
  expect(body).toContain('ReasoningContent');
  expect(body).toContain('renderMarkdown');
  // The concrete prose example: omit vs supply.
  expect(body).toContain('Omit the prop and');
  expect(body).toContain('plain Text');
  // Dev client consequence against the Expo Go-clean core.
  expect(body).toContain('streamdown');
  expect(body).toContain('enriched-markdown');
  expect(body).toContain('dev client');
  expect(body).toContain('Expo Go');
  expect(body).toContain('runs in Expo Go with no extra dependency');

  capture(testInfo, 'ac-2', {
    sources: {
      message: MESSAGE_SOURCE,
      reasoning: REASONING_SOURCE,
      matrix: MATRIX_SOURCE,
    },
    matrixEntries: {
      streamdown: streamdownEntry?.peers.map((peer) => peer.name) ?? null,
      'enriched-markdown': enrichedEntry?.peers.map((peer) => peer.name) ?? null,
    },
    assertedProse: [
      'MessageResponse',
      'ReasoningContent',
      'renderMarkdown',
      'Omit the prop and',
      'plain Text',
      'streamdown',
      'enriched-markdown',
      'dev client',
      'Expo Go',
      'runs in Expo Go with no extra dependency',
    ],
  });
});

test('ORI-CONT-005-AC-3', async ({ page, request }, testInfo) => {
  const response = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(response?.status()).toBe(200);
  await pageLoad(page, testInfo);
  const main = page.locator('main');

  // No placeholder hrefs anywhere in the article.
  const hrefs = await main
    .getByRole('link')
    .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
  expect(hrefs.length, 'the article carries onward references').toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href, 'no empty placeholder href').not.toBe('#');
    expect(href, 'every href is present').not.toBeNull();
  }

  // Onward reference 1: the Theming renderMarkdown seam anchor.
  const themingLink = main.getByRole('link', { name: 'Theming: the renderMarkdown seam' });
  await expect(themingLink).toBeVisible();
  const themingResponse = await navigateLocalhost(page, '/docs/theming#rendermarkdown');
  expect(themingResponse?.status()).toBe(200);
  const seamAnchor = page.locator('#rendermarkdown');
  await expect(seamAnchor).toBeAttached();
  // The anchor sits ON the heading itself (the github-slugger id rides the
  // h2), so the heading text is the anchor's own text — 'renderMarkdown'.
  await expect(seamAnchor).toContainText('renderMarkdown');

  // Onward reference 2: the Message item destination — back on the boundary
  // page first (the Theming navigation left the article's DOM).
  const boundaryResponse = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(boundaryResponse?.status()).toBe(200);
  await pageLoad(page, testInfo);
  const messageLink = main.getByRole('link', { name: 'Message reference' });
  await expect(messageLink).toBeVisible();
  const messageResponse = await navigateLocalhost(page, '/components/message');
  expect(messageResponse?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Message');
  const backResponse = await navigateLocalhost(page, BOUNDARY_ROUTE);
  expect(backResponse?.status()).toBe(200);
  await pageLoad(page, testInfo);

  // The example-source link names the real repository source; the surrounding
  // prose describes source access without asserting live useChat behavior.
  expect(existsSync(repoFile(EXAMPLE_README)), 'apps/example/README.md exists').toBe(true);
  expect(existsSync(repoFile(EXAMPLE_APP_JSON)), 'apps/example/app.json exists').toBe(true);
  const exampleLink = main.getByRole('link', { name: /example app source/ });
  await expect(exampleLink).toBeVisible();
  expect(await exampleLink.getAttribute('href')).toBe(EXAMPLE_SOURCE_URL);
  const body = (await main.innerText()).replace(/\s+/g, ' ');
  // The example app SHIPPED its /live-chat route (the worked example), so the
  // old 'does not yet include' caveat is superseded by the current honest
  // phrasing: what the example composes, and what stays the app's own wiring.
  // FIX-GBC-003-1 / f042f5eb keeps AC1_TERMS (useChat) out of Callout prose —
  // the reviewed reword names "the AI SDK v7 chat hook" instead.
  expect(body).toContain('composes the same registry items around the AI SDK v7 chat hook');
  expect(body).toContain('the model-side wiring your app owns');

  // Both internal destinations were also fetched over the real preview HTTP.
  const themingFetch = await request.get(`${new URL('/', page.url()).origin}/docs/theming`);
  expect(themingFetch.status()).toBe(200);

  capture(testInfo, 'ac-3', {
    onwardReferences: ['/docs/theming#rendermarkdown', '/components/message'],
    statuses: {
      theming: themingResponse?.status() ?? null,
      message: messageResponse?.status() ?? null,
    },
    exampleSourceHref: EXAMPLE_SOURCE_URL,
    localExampleSource: [EXAMPLE_README, EXAMPLE_APP_JSON],
    honestProse: 'composes the same registry items around the AI SDK v7 chat hook',
    anchorTexts: await main.getByRole('link').evaluateAll((elements) =>
      elements.map((element) => ({
        text: element.textContent?.trim() ?? '',
        href: element.getAttribute('href'),
      })),
    ),
  });
});

test('ORI-CONT-005-AC-4', async () => {
  // The recovery source is consumed from the actual candidate filesystem in
  // this Node worker — never a substituted fixture string.
  const recoveryPath = repoFile(RECOVERY_SOURCE);
  expect(existsSync(recoveryPath), `${RECOVERY_SOURCE} must exist as a real file`).toBe(true);

  // It lives OUTSIDE the docs collection: no path under src/content/docs, and
  // no collection copy that would double-publish it.
  expect(recoveryPath).toContain('src/content/system');
  expect(recoveryPath).not.toContain('src/content/docs');
  expect(
    existsSync(repoFile('apps/docs/src/content/docs/not-found.md')),
    'no duplicate recovery source inside the docs collection',
  ).toBe(false);

  const source = readFileSync(recoveryPath, 'utf8');

  // Missing-page title.
  const titleMatch = source.match(/^# (.+)$/m);
  expect(titleMatch, 'an H1 missing-page title').not.toBeNull();
  const title = titleMatch?.[1] ?? '';

  // Factual cause sentence: the requested page could not be found.
  expect(source).toContain('could not be found');
  expect(source).not.toMatch(/\b(moved|deleted)\b/i);

  // The Search documentation action label.
  expect(source).toContain('Search documentation');

  // Exactly the two planned direct recovery links, no placeholders.
  const links = [...source.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({
    text: match[1],
    href: match[2],
  }));
  expect(links).toEqual([
    { text: 'Introduction', href: '/docs/introduction' },
    { text: 'Browse components', href: '/components' },
  ]);
  expect(source).not.toContain('](#');

  // The capture is project-independent: the same bytes parse in every
  // project, so one deterministic artifact suffices.
  captureShared('ac-4', {
    sourcePath: RECOVERY_SOURCE,
    title,
    causeSentence: 'could not be found',
    actionLabel: 'Search documentation',
    recoveryLinks: links,
    outsideDocsCollection: true,
  });
});
