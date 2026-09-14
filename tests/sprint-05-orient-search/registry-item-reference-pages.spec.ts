import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * ORI-AST-008 — publish reference destinations for the remaining 17 UI and
 * library items, authored RED-first against the sprint-04 template that fans
 * only the 39 registry:component entries. Five task-owned browser proofs over
 * the real built dist on the preview origin:
 *
 *   1. destinations          — all 17 UI/lib routes serve real dataset content,
 *                              omit the entire null Props section, and page
 *                              through their own ordered families.
 *   2. engine-copy           — real clipboard install commands (both engines,
 *                              kbd + mono), the dependency forms, and the
 *                              JavaScript-disabled read/navigate path.
 *   3. source-bytes          — every added Source view byte-equals the served
 *                              /r/nativewind/{item}.json files[].content, file
 *                              order included, before and after a uniwind
 *                              install selection.
 *   4. component-regression  — 56 destinations coexist with the exact 39-card,
 *                              7-family browse index and the landed component
 *                              reference guarantees (sampled conversation,
 *                              message, tool).
 *   5. search-metadata       — all 56 item documents carry the Pagefind body
 *                              region and a data-derived category attribute;
 *                              props and verdict text stay indexable.
 *
 * Nothing is mocked: page content is read through Chromium locators, the
 * clipboard is read through the real navigator.clipboard API in an explicitly
 * JavaScript-enabled context, source oracles are fetched live from the served
 * /r/nativewind JSON, and the no-JS clauses run in an explicitly
 * JavaScript-disabled context. UNGUARDED across chromium-desktop,
 * chromium-mobile, and chromium-nojs (the fresh explicit contexts carry their
 * own JS flag, so the identical code path runs in every project); retries 0;
 * expect.soft accumulates the full diff; the evidence writer fires on a
 * genuine full pass only.
 */

// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard read needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

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

interface PropRow {
  name: string;
  type: string;
  default: string | null;
  description: string | null;
}

interface ItemEntry {
  name: string;
  title: string;
  description: string;
  type: string;
  engines: string[];
  expoGo: boolean;
  registryDependencies: string[] | null;
  dependencies: string[];
  sourceFiles: { filename: string; text: string }[];
  props: PropRow[] | null;
  usageSnippet: string;
  themingNote: string;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

/** The files[] entry the registry serves at /r/{engine}/{item}.json. */
interface ServedFile {
  path: string;
  content: string;
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');

/** The 17 real UI/library records the task adds destinations for. */
const uiLibItems = items.filter(
  (item) => item.type === 'registry:ui' || item.type === 'registry:lib',
);
const componentItems = items.filter((item) => item.type === 'registry:component');
const familyOf = new Map<string, Family>();
for (const family of families) {
  for (const name of family.itemNames) familyOf.set(name, family);
}
/** Circular in-family pager targets, computed exactly as the template must. */
function pagerTargets(name: string): { prev: string; next: string } {
  const family = familyOf.get(name);
  if (!family) throw new Error(`dataset sanity: ${name} has no family`);
  const index = family.itemNames.indexOf(name);
  const length = family.itemNames.length;
  return {
    prev: `/components/${family.itemNames[(index - 1 + length) % length]}`,
    next: `/components/${family.itemNames[(index + 1) % length]}`,
  };
}

/** The Pagefind category follows the registry type — never the route text. */
function pagefindCategory(type: string): string {
  return type === 'registry:component' ? 'components' : type.replace('registry:', '');
}

const VERDICTS: Record<string, string> = {
  'expo-go': 'runs in Expo Go',
  'dev-client': 'requires a dev client',
};
const verdictFor = (item: ItemEntry): string => VERDICTS[item.expoGo ? 'expo-go' : 'dev-client'];

/** The pinned INSTALL-command origin — Astro.site in apps/docs/astro.config.mjs. */
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${name}.json`;

const PROPS_SECTION = 'main > section[data-section="props"]';
const SOURCE_SECTION = 'main > section[data-section="source"]';
const INSTALL_SECTION = 'main > section[data-section="install"]';
const USAGE_CODE = 'main > section[data-section="usage"] rnr-copy-button code';
const EXPECTED_COMPONENT_SECTIONS = [
  'install',
  'dependencies',
  'source',
  'props',
  'theming',
  'usage',
];

/** Evidence JSON under the task's owned scratch root. */
const EVIDENCE_DIR = join(process.cwd(), '.tmp/ORI-AST-008/e2e-evidence');

function writeEvidence(name: string, observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, `${name}.json`),
    JSON.stringify({ test: name, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

/** Fetch the live served nativewind artifact for one item — the byte oracle. */
async function fetchServedFiles(
  request: Page['request'],
  name: string,
  soft: typeof expect.soft,
): Promise<ServedFile[]> {
  const response = await request.get(`${PREVIEW_URL}/r/nativewind/${name}.json`);
  soft(response.status(), `${name}: served /r/nativewind JSON responds 200`).toBe(200);
  // Product-surface anchor: the byte oracle is served from the product's own
  // registry route — never a proxy, mirror, or fixture.
  expect(response.url(), `${name}: live /r/nativewind oracle`).toContain('/r/nativewind/');
  const served = (await response.json()) as { files: ServedFile[] };
  return served.files;
}

/**
 * Byte-compare one page's Source region against served files[]: one figure per
 * file, served order, captions equal the served basenames, and every code
 * surface's textContent EQUALS files[].content with zero normalization.
 */
async function assertSourceBytes(
  page: Page,
  name: string,
  servedFiles: ServedFile[],
  soft: typeof expect.soft,
): Promise<boolean> {
  let ok = true;
  const figures = page.locator(`${SOURCE_SECTION} figure`);
  const figureCount = await figures.count();
  soft(
    figureCount,
    `${name}: one source figure per served file (${servedFiles.length} served)`,
  ).toBe(servedFiles.length);
  ok &&= figureCount === servedFiles.length;

  for (let index = 0; index < Math.min(figureCount, servedFiles.length); index += 1) {
    const caption = ((await figures.nth(index).locator('figcaption').textContent()) ?? '').trim();
    const servedBase = servedFiles[index].path.split('/').pop() ?? '';
    soft(caption, `${name} figure ${index}: caption equals the served basename`).toBe(servedBase);
    ok &&= caption === servedBase;

    const codeText = (await figures.nth(index).locator('rnr-copy-button code').textContent()) ?? '';
    // BYTE compare — no normalization: whitespace and trailing newlines included.
    soft(
      codeText === servedFiles[index].content,
      `${name} figure ${index} (${servedFiles[index].path}): code byte-identical to served files[].content`,
    ).toBe(true);
    ok &&= codeText === servedFiles[index].content;
  }
  return ok;
}

// Enumerative e2e check over 17 routes — complexity is inherent dataset iteration.
// fallow-ignore-next-line complexity
test('ORI-AST-008-destinations', async ({ page }) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // Dataset sanity: the 17 real UI/lib records (11 ui + 6 lib) this task adds.
  soft(
    uiLibItems.filter((item) => item.type === 'registry:ui').length,
    'dataset sanity: 11 ui records',
  ).toBe(11);
  soft(
    uiLibItems.filter((item) => item.type === 'registry:lib').length,
    'dataset sanity: 6 lib records',
  ).toBe(6);
  soft(
    uiLibItems.every((item) => item.props === null),
    'dataset sanity: every UI/lib record carries null props',
  ).toBe(true);

  let ok = true;
  const nextHrefs = new Map<string, string>();
  for (const item of uiLibItems) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= response?.status() === 200;
    // A missing route is already a recorded failure; the DOM reads below are
    // meaningful only on the item's own page.
    if (response?.status() !== 200) continue;

    const title = (await page.locator('main h1').textContent()) ?? '';
    soft(title, `${item.name}: h1 equals the dataset title`).toBe(item.title);
    ok &&= title === item.title;

    const description = (await page.locator('main .item-description').textContent()) ?? '';
    soft(description, `${item.name}: description equals the dataset description`).toBe(
      item.description,
    );
    ok &&= description === item.description;

    const usage = (await page.locator(USAGE_CODE).textContent()) ?? '';
    soft(usage, `${item.name}: usage snippet equals the dataset usage`).toBe(item.usageSnippet);
    ok &&= usage === item.usageSnippet;

    const chip = (await page.locator('main li[data-chip="category"]').textContent()) ?? '';
    const expectedChip = item.type.replace('registry:', '');
    soft(chip, `${item.name}: category chip equals the dataset type`).toBe(expectedChip);
    ok &&= chip === expectedChip;

    // The entire null-props section is omitted — never a fabricated table.
    const propsSections = await page.locator(PROPS_SECTION).count();
    soft(propsSections, `${item.name}: props section count (null props omitted entirely)`).toBe(0);
    ok &&= propsSections === 0;

    const targets = pagerTargets(item.name);
    for (const rel of ['prev', 'next'] as const) {
      const href = await page.locator(`nav.pager a[rel="${rel}"]`).getAttribute('href');
      soft(href, `${item.name}: ${rel} pager target matches the ordered family`).toBe(targets[rel]);
      ok &&= href === targets[rel];
    }
    nextHrefs.set(item.name, targets.next);
  }

  // The scenario's recorded anchors: kbd pages to breadcrumb, mono to markdown.
  soft(nextHrefs.get('kbd'), 'kbd next pager target is /components/breadcrumb').toBe(
    '/components/breadcrumb',
  );
  ok &&= nextHrefs.get('kbd') === '/components/breadcrumb';
  soft(nextHrefs.get('mono'), 'mono next pager target is /components/markdown').toBe(
    '/components/markdown',
  );
  ok &&= nextHrefs.get('mono') === '/components/markdown';

  if (ok) {
    writeEvidence('ORI-AST-008-destinations', {
      uiLibRoutes: uiLibItems.map((item) => item.name),
      kbdNext: nextHrefs.get('kbd'),
      monoNext: nextHrefs.get('mono'),
    });
  }
});

// Enumerative e2e check (real clipboard + no-JS) — complexity is inherent dataset iteration.
// fallow-ignore-next-line complexity
test('ORI-AST-008-engine-copy', async ({ browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const samples = ['kbd', 'mono'];
  const EXPECTED_DEP: Record<string, string> = {
    kbd: 'https://reactnativereusables.com/r/{engine}/text.json',
  };

  // JavaScript-enabled context: real engine-tab clicks and real clipboard reads.
  // The explicit flag is load-bearing (the identical unguarded code path runs
  // in EVERY project, including chromium-nojs).
  const jsContext = await browser.newContext({ javaScriptEnabled: true });
  await grantClipboardPermissions(jsContext);
  const jsPage = await jsContext.newPage();

  let ok = true;
  const clipboardValues: string[] = [];
  for (const name of samples) {
    const pageResponse = await navigateLocalhost(jsPage, `/components/${name}`);
    if (pageResponse?.status() !== 200) {
      soft(pageResponse?.status(), `${name}: serves 200 for the install controls`).toBe(200);
      ok = false;
      continue;
    }
    await waitForAstroPageLoad(jsPage, '__rnrTabGroupRegistered');

    for (const engine of ['nativewind', 'uniwind'] as const) {
      // Activation is the only path to an un-hidden panel.
      await jsPage.locator(`${INSTALL_SECTION} [role="tab"][data-engine="${engine}"]`).click();
      const panel = jsPage.locator(`${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"]`);
      const displayed = ((await panel.locator('rnr-copy-button code').textContent()) ?? '').trim();
      soft(displayed, `${name} ${engine}: displayed command`).toBe(commandFor(engine, name));
      ok &&= displayed === commandFor(engine, name);

      const trigger = panel.locator('rnr-copy-button button');
      await trigger.click();
      // Success shows by VALUE within 500 ms of the click — never a class name.
      await soft(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
      const clipboard = await jsPage.evaluate(() => navigator.clipboard.readText());
      soft(clipboard, `${name} ${engine}: real clipboard equals the displayed command`).toBe(
        commandFor(engine, name),
      );
      ok &&= clipboard === commandFor(engine, name);
      clipboardValues.push(clipboard);
    }

    // Dependency forms against the real data: kbd resolves the text.json
    // registry dependency per engine; mono's arrays are empty (no rows).
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const depRows = jsPage.locator(
        `main > section[data-section="dependencies"] [role="tabpanel"][data-engine="${engine}"] [data-engine-urls="${engine}"] code`,
      );
      const expectedDep = EXPECTED_DEP[name]?.replace('{engine}', engine);
      if (expectedDep) {
        const depCount = await depRows.count();
        soft(depCount, `${name} ${engine}: registry dependency row renders`).toBe(1);
        ok &&= depCount === 1;
        const depText = depCount > 0 ? ((await depRows.first().textContent()) ?? '') : '';
        soft(depText, `${name} ${engine}: dependency carries the resolved registry URL`).toBe(
          expectedDep,
        );
        ok &&= depText === expectedDep;
      } else {
        const depCount = await depRows.count();
        soft(
          depCount,
          `${name} ${engine}: no invented registry dependency rows (dataset is empty)`,
        ).toBe(0);
        ok &&= depCount === 0;
      }
    }

    // The empty npm-dependency presentation: both samples carry empty
    // dependencies[], so the explicit empty state shows and no package list.
    soft(
      await jsPage.locator('main [data-deps-empty]').count(),
      `${name}: explicit empty-dependency state`,
    ).toBe(1);
    ok &&= (await jsPage.locator('main [data-deps-empty]').count()) === 1;
    soft(
      await jsPage.locator('main [data-deps-packages]').count(),
      `${name}: no fabricated npm package list`,
    ).toBe(0);
    ok &&= (await jsPage.locator('main [data-deps-packages]').count()) === 0;
  }
  soft(clipboardValues.length, 'one clipboard read per engine per sampled page (2 x 2)').toBe(4);
  ok &&= clipboardValues.length === 4;
  await jsContext.close();

  // JavaScript-disabled context: both engine commands are served in full and
  // readable (the un-upgraded tab group keeps every panel in the page), and the
  // next pager anchor navigates to the recorded in-family destination.
  const nojsContext = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojsContext.newPage();
  const NEXT_ROUTES: Record<string, string> = {
    kbd: '/components/breadcrumb',
    mono: '/components/markdown',
  };
  for (const name of samples) {
    const response = await navigateLocalhost(nojsPage, `/components/${name}`);
    soft(response?.status(), `${name} (no-JS): serves 200`).toBe(200);
    ok &&= response?.status() === 200;
    if (response?.status() !== 200) continue;

    for (const engine of ['nativewind', 'uniwind'] as const) {
      const panel = nojsPage.locator(
        `${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"]`,
      );
      const code = panel.locator('rnr-copy-button code');
      soft(await code.count(), `${name} ${engine} (no-JS): engine command panel present`).toBe(1);
      ok &&= (await code.count()) === 1;
      await soft(code.first()).toBeVisible();
      const text = ((await code.first().textContent()) ?? '').trim();
      soft(text, `${name} ${engine} (no-JS): full engine command readable`).toBe(
        commandFor(engine, name),
      );
      ok &&= text === commandFor(engine, name);
    }

    const nextRoute = NEXT_ROUTES[name];
    await nojsPage.locator('nav.pager a[rel="next"]').click();
    await nojsPage.waitForURL(new URL(nextRoute, PREVIEW_URL).href);
    soft(nojsPage.url(), `${name} (no-JS): next pager landed on ${nextRoute}`).toBe(
      new URL(nextRoute, PREVIEW_URL).href,
    );
    const landed = await nojsPage.request.get(new URL(nextRoute, PREVIEW_URL).href);
    soft(landed.status(), `${name} (no-JS): ${nextRoute} returns HTTP 200`).toBe(200);
    ok &&= landed.status() === 200;
  }
  await nojsContext.close();

  if (ok) {
    writeEvidence('ORI-AST-008-engine-copy', {
      project: testInfo.project.name,
      clipboardValues,
      kbdNextRoute: NEXT_ROUTES.kbd,
      monoNextRoute: NEXT_ROUTES.mono,
    });
  }
});

// Enumerative e2e byte-compare over 17 served artifacts — complexity is inherent dataset iteration.
// fallow-ignore-next-line complexity
test('ORI-AST-008-source-bytes', async ({ page, request, browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  let ok = true;
  for (const item of uiLibItems) {
    const servedFiles = await fetchServedFiles(request, item.name, soft);

    // Served file order equals the dataset's sourceFiles order (basenames).
    const servedNames = servedFiles.map((file) => file.path.split('/').pop() ?? '');
    const datasetNames = item.sourceFiles.map((file) => file.filename);
    soft(servedNames, `${item.name}: served files[] order equals the dataset sourceFiles`).toEqual(
      datasetNames,
    );
    ok &&= JSON.stringify(servedNames) === JSON.stringify(datasetNames);

    const pageResponse = await navigateLocalhost(page, `/components/${item.name}`);
    soft(pageResponse?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= pageResponse?.status() === 200;
    if (pageResponse?.status() !== 200) continue;
    const bytesOk = await assertSourceBytes(page, item.name, servedFiles, soft);
    ok &&= bytesOk;
  }

  // uniwind install selection on kbd and mono: the Source region is the
  // nativewind form regardless of the chosen install engine.
  const jsContext = await browser.newContext({ javaScriptEnabled: true });
  const jsPage = await jsContext.newPage();
  for (const name of ['kbd', 'mono']) {
    const servedFiles = await fetchServedFiles(request, name, soft);
    const pageResponse = await navigateLocalhost(jsPage, `/components/${name}`);
    if (pageResponse?.status() !== 200) {
      soft(pageResponse?.status(), `${name}: serves 200 for the engine selection`).toBe(200);
      ok = false;
      continue;
    }
    await waitForAstroPageLoad(jsPage, '__rnrTabGroupRegistered');
    await jsPage.locator(`${INSTALL_SECTION} [role="tab"][data-engine="uniwind"]`).click();
    await soft(
      jsPage.locator(`${INSTALL_SECTION} [role="tab"][data-engine="uniwind"]`),
    ).toHaveAttribute('aria-selected', 'true');
    const bytesOk = await assertSourceBytes(
      jsPage,
      `${name} (uniwind selected)`,
      servedFiles,
      soft,
    );
    ok &&= bytesOk;
    // The install-engine choice is independent of the source view: after
    // selecting uniwind, the source region still renders the nativewind form —
    // never the uniwind import path. (The byte-compare above against the served
    // nativewind files[] is the stronger oracle; this anchors the direction of
    // the {engine} substitution so an uniwind leak cannot hide behind it.)
    const sourceText = (await jsPage.locator(SOURCE_SECTION).textContent()) ?? '';
    soft(
      sourceText.includes('@/registry/uniwind/'),
      `${name}: source region contains no uniwind import path after uniwind install selection`,
    ).toBe(false);
    ok &&= sourceText.includes('@/registry/uniwind/') === false;
  }
  await jsContext.close();

  if (ok) {
    writeEvidence('ORI-AST-008-source-bytes', {
      project: testInfo.project.name,
      comparedItems: uiLibItems.map((item) => item.name),
    });
  }
});

// Enumerative e2e check over 56 destinations + sampled references — complexity is inherent dataset iteration.
// fallow-ignore-next-line complexity
test('ORI-AST-008-component-regression', async ({ page, request }, testInfo) => {
  test.setTimeout(300_000);
  const soft = expect.soft;

  let ok = true;

  // All 56 reference destinations answer on the preview origin.
  let routes200 = 0;
  for (const item of items) {
    const response = await request.get(new URL(`/components/${item.name}`, PREVIEW_URL).href);
    soft(response.status(), `${item.name}: destination serves 200`).toBe(200);
    ok &&= response.status() === 200;
    if (response.status() === 200) routes200 += 1;
  }
  soft(routes200, 'all 56 registry destinations answer 200').toBe(items.length);
  ok &&= routes200 === items.length;

  // The browse index keeps exactly the 39 registry:component cards in 7
  // component families — never 56, never the UI/lib names.
  await navigateLocalhost(page, '/components');
  const cards = page.locator('main a[data-card]');
  const cardCount = await cards.count();
  soft(cardCount, 'browse cards: exactly the 39 registry:component items').toBe(39);
  ok &&= cardCount === 39;

  const sectionLocators = page.locator('main.components-index > section[id]');
  const sectionCount = await sectionLocators.count();
  const componentFamilyIds = families
    .filter((family) =>
      family.itemNames.every((name) => componentItems.some((i) => i.name === name)),
    )
    .sort((a, b) => a.order - b.order)
    .map((family) => family.id);
  soft(sectionCount, 'family sections on the browse index').toBe(componentFamilyIds.length);
  ok &&= sectionCount === componentFamilyIds.length;
  let sectionCards = 0;
  const sectionIds: string[] = [];
  for (let index = 0; index < sectionCount; index += 1) {
    sectionIds.push((await sectionLocators.nth(index).getAttribute('id')) ?? '');
    sectionCards += await sectionLocators.nth(index).locator('a[data-card]').count();
  }
  soft(sectionIds, 'family section ids in families.json order').toEqual(componentFamilyIds);
  ok &&= JSON.stringify(sectionIds) === JSON.stringify(componentFamilyIds);
  soft(sectionCards, 'cards summed across the family sections').toBe(39);
  ok &&= sectionCards === 39;
  for (const uiLib of uiLibItems.slice(0, 3)) {
    soft(
      await page.locator(`main a[data-card][href="/components/${uiLib.name}"]`).count(),
      `no browse card for the UI/lib item ${uiLib.name}`,
    ).toBe(0);
    ok &&=
      (await page.locator(`main a[data-card][href="/components/${uiLib.name}"]`).count()) === 0;
  }

  // Sampled component references keep the landed anatomy and data fidelity.
  const sampled = ['conversation', 'message', 'tool'];
  for (const name of sampled) {
    const item = items.find((entry) => entry.name === name);
    if (!item) throw new Error(`dataset sanity: sampled ${name} missing`);

    await navigateLocalhost(page, `/components/${name}`);
    const sectionLocators2 = page.locator('main > section[data-section]');
    const sections: string[] = [];
    const count = await sectionLocators2.count();
    for (let index = 0; index < count; index += 1) {
      sections.push((await sectionLocators2.nth(index).getAttribute('data-section')) ?? '');
    }
    soft(sections, `${name}: top-level section[data-section] order preserved`).toEqual(
      EXPECTED_COMPONENT_SECTIONS,
    );
    ok = ok && JSON.stringify(sections) === JSON.stringify(EXPECTED_COMPONENT_SECTIONS);

    const propsRows = await page.locator(`${PROPS_SECTION} tbody tr`).count();
    soft(propsRows, `${name}: props rows equal the dataset props`).toBe(item.props?.length ?? 0);
    ok &&= propsRows === (item.props?.length ?? 0);

    const usage = (await page.locator(USAGE_CODE).textContent()) ?? '';
    soft(usage, `${name}: usage snippet equals the dataset usage`).toBe(item.usageSnippet);
    ok &&= usage === item.usageSnippet;

    const theming =
      (await page.locator('main > section[data-section="theming"]').textContent()) ?? '';
    soft(
      theming.includes(item.themingNote),
      `${name}: theming section carries the dataset note`,
    ).toBe(true);
    ok &&= theming.includes(item.themingNote);

    const qr = page.locator('main aside[data-qr-panel]');
    soft(await qr.count(), `${name}: QR panel renders`).toBe(1);
    ok &&= (await qr.count()) === 1;
    // The accessible name lives on the inner role="img" surface (QrPanel.astro),
    // not the <aside data-qr-panel> root.
    const qrLabel = (await qr.locator('[role="img"]').getAttribute('aria-label')) ?? '';
    soft(qrLabel, `${name}: QR aria-label names the item`).toContain(item.name);

    const targets = pagerTargets(name);
    for (const rel of ['prev', 'next'] as const) {
      const href = await page.locator(`nav.pager a[rel="${rel}"]`).getAttribute('href');
      soft(href, `${name}: ${rel} pager stays in-family`).toBe(targets[rel]);
      ok &&= href === targets[rel];
    }

    const servedFiles = await fetchServedFiles(request, name, soft);
    const bytesOk = await assertSourceBytes(page, name, servedFiles, soft);
    ok &&= bytesOk;
  }

  // The landed seam guarantee: message keeps its renderMarkdown seam link.
  await navigateLocalhost(page, '/components/message');
  const seamLinks = await page.locator('main a[href="/docs/theming#rendermarkdown"]').count();
  soft(seamLinks, 'message: renderMarkdown seam link preserved').toBe(1);
  ok &&= seamLinks === 1;

  if (ok) {
    writeEvidence('ORI-AST-008-component-regression', {
      project: testInfo.project.name,
      destinations: items.length,
      browseCards: cardCount,
      familySections: sectionIds,
      sampled,
    });
  }
});

// Enumerative e2e check over 56 Pagefind documents — complexity is inherent dataset iteration.
// fallow-ignore-next-line complexity
test('ORI-AST-008-search-metadata', async ({ page }) => {
  test.setTimeout(300_000);
  const soft = expect.soft;

  let ok = true;
  const counts: Record<string, number> = {};
  const categories: Record<string, string> = {};
  for (const item of items) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= response?.status() === 200;
    if (response?.status() !== 200) continue;

    // The Pagefind body region exists exactly once per item document.
    const bodies = await page.locator('main[data-pagefind-body]').count();
    soft(bodies, `${item.name}: one data-pagefind-body document region`).toBe(1);
    ok &&= bodies === 1;

    // The category attribute derives from the registry type, not route text.
    const meta =
      (await page.locator('main[data-pagefind-body]').getAttribute('data-pagefind-meta')) ?? '';
    const category = meta.startsWith('category:') ? meta.slice('category:'.length) : '';
    soft(category, `${item.name}: Pagefind category follows item.type`).toBe(
      pagefindCategory(item.type),
    );
    ok &&= category === pagefindCategory(item.type);
    counts[category] = (counts[category] ?? 0) + 1;
    categories[item.name] = category;

    // The Expo Go verdict stays inside the indexed body and matches the data.
    const badge = (await page.locator('main .chips .badge').textContent()) ?? '';
    soft(badge, `${item.name}: verdict badge matches the dataset expoGo fact`).toBe(
      verdictFor(item),
    );
    ok &&= badge === verdictFor(item);

    // Nothing inside the indexed body opts out of the index — props and
    // verdict text must stay searchable.
    const ignored = await page.locator('main [data-pagefind-ignore]').count();
    soft(ignored, `${item.name}: 0 data-pagefind-ignore exclusions inside the body`).toBe(0);
    ok &&= ignored === 0;

    // Applicable props remain indexable rows inside the body region.
    if (item.type === 'registry:component') {
      const propsRows = await page.locator(`${PROPS_SECTION} tbody tr`).count();
      soft(propsRows, `${item.name}: props rows present inside the indexed body`).toBe(
        item.props?.length ?? 0,
      );
      ok &&= propsRows === (item.props?.length ?? 0);
    }
  }

  soft(counts, 'category counts across the 56 documents').toEqual({
    components: 39,
    ui: 11,
    lib: 6,
  });
  ok &&= counts.components === 39 && counts.ui === 11 && counts.lib === 6;
  soft(categories.kbd, 'kbd category is ui').toBe('ui');
  soft(categories.mono, 'mono category is lib').toBe('lib');
  soft(categories.message, 'message category is components').toBe('components');

  // The message body carries searchable renderMarkdown content (props and the
  // seam callout both mention the seam).
  await navigateLocalhost(page, '/components/message');
  const bodyText = (await page.locator('main[data-pagefind-body]').textContent()) ?? '';
  soft(
    bodyText.includes('renderMarkdown'),
    'message: renderMarkdown stays searchable inside the indexed body',
  ).toBe(true);
  ok &&= bodyText.includes('renderMarkdown');

  if (ok) {
    writeEvidence('ORI-AST-008-search-metadata', {
      counts,
      kbd: categories.kbd,
      mono: categories.mono,
      message: categories.message,
    });
  }
});
