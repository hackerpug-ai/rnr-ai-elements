import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, test } from '@playwright/test';
import { oneLineDescription } from '../../apps/docs/src/lib/one-line-description';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * ORI-VIS-004 — the Registry ledger's toolbar and shared table presentation
 * (DESIGN supplement over ORI-AST-007's FLOW-GEND-07 mechanics).
 *
 * Four AC-addressable browser proofs over the REAL built docs preview on
 * localhost:4321, each greppable under the task token:
 *
 *   AC-1 — the filtered conversation row keeps its verdict, its complete
 *          uniwind command (real clipboard) and its Docs destination.
 *   AC-2 — All + clear restores all 56 generated rows with the category
 *          totals, the generated note and both engine base URLs; a no-match
 *          query shows the genuine no-results state and recovers.
 *   AC-3 — mobile horizontal scrolling stays inside the ledger wrapper with
 *          the sticky identifying column, sticky header, --muted zebra bands
 *          and --font-mono engine labels (the shared DataTable presentation).
 *   AC-4 — the no-JavaScript document serves the complete ledger and both
 *          base URLs; keyboard focus stays visible on every reached toolbar
 *          and copy control, and the selected engine control is visibly
 *          distinct through the token treatment.
 *
 * Nothing is mocked: rows, clipboard, navigation, focus and computed styles
 * are read through real Chromium. Expected identities derive from the
 * generated dataset — never typed literals — except the AC-pinned totals
 * 56/39/11/6, re-derived by the module-scope sanity check below.
 *
 * Browser-side expressions are STRING evaluates typed through casts (this
 * workspace's tsconfig ships no DOM lib) — the same convention the
 * reading-presentation and token-presentation lanes use. The observation
 * probes (a detached span resolving var(--muted)/var(--font-mono)) never
 * touch product state and remove themselves after each read.
 */

declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  engines: string[];
  expoGo: boolean;
}

const items = JSON.parse(
  readFileSync(join(repoRoot, 'apps/docs/src/data/registry-items.json'), 'utf8'),
) as Item[];

const components = items.filter((item) => item.type === 'registry:component');
const uiItems = items.filter((item) => item.type === 'registry:ui');
const libItems = items.filter((item) => item.type === 'registry:lib');

const TOTALS = {
  all: items.length,
  component: components.length,
  ui: uiItems.length,
  lib: libItems.length,
};

// Dataset sanity: the AC-pinned totals hold for the generated dataset.
expect(TOTALS.all, 'generated dataset has 56 items').toBe(56);
expect(TOTALS.component, 'generated dataset has 39 components').toBe(39);
expect(TOTALS.ui, 'generated dataset has 11 ui items').toBe(11);
expect(TOTALS.lib, 'generated dataset has 6 lib items').toBe(6);

const conversation = items.find((item) => item.name === 'conversation');
expect(conversation, 'dataset sanity: conversation exists').toBeDefined();
expect(conversation?.type, 'dataset sanity: conversation is a component').toBe(
  'registry:component',
);
expect(conversation?.engines, 'dataset sanity: conversation ships both engines').toEqual([
  'nativewind',
  'uniwind',
]);

const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${name}.json`;

const NATIVEWIND_BASE = 'https://rnraielements.com/r/nativewind';
const UNIWIND_BASE = 'https://rnraielements.com/r/uniwind';

// The Badge component's verdict strings (Badge.astro): the dataset's expoGo
// boolean selects between exactly these two labels.
const verdictFor = (expoGo: boolean): string =>
  expoGo ? 'runs in Expo Go' : 'requires a dev client';

/** The join the ledger bakes into each row's data-filter-text (LedgerTable). */
function ledgerFilterText(item: Item): string {
  return [
    item.name,
    item.title,
    oneLineDescription(item.description),
    item.type.replace('registry:', ''),
  ]
    .join(' ')
    .toLowerCase();
}

/** The real substring filter's matches for 'conversation', per category scope
 * — the dataset pins these sets (checkpoint's and empty's descriptions also
 * name the conversation), so "the conversation row" is asserted as a member
 * of exactly the derived set, never a typed count. */
const conversationMatchesIn = (scope: Item[]): string[] =>
  scope
    .filter((item) => ledgerFilterText(item).includes('conversation'))
    .map((item) => item.name)
    .sort();
const expectedConversationMatches = conversationMatchesIn(components);
const expectedAllConversationMatches = conversationMatchesIn(items);
expect(
  expectedConversationMatches,
  'dataset sanity: conversation is among its own filter matches',
).toContain('conversation');
expect(
  expectedAllConversationMatches,
  'dataset sanity: the all-scope set covers the component set',
).toEqual(expect.arrayContaining(expectedConversationMatches));

const INPUT = 'rnr-ledger-filter input';
const CATEGORY = (id: string): string => `[data-category-filter="${id}"]`;
const ENGINE_TAB = (engine: string): string =>
  `rnr-ledger-filter rnr-tab-group [role="tab"][data-engine="${engine}"]`;
const ROW = (name: string): string => `tr[id="row-${name}"]`;
const WRAPPER = '.ledger-table__scroll';

async function visibleRowNames(page: Page): Promise<string[]> {
  return page.locator('tr[data-filter-text]:visible th[scope="row"]').allTextContents();
}

/** Filter to the AC-1 pin: component category, uniwind engine, conversation text. */
async function filterToConversationUniwind(page: Page): Promise<void> {
  await page.locator(CATEGORY('component')).click();
  await page.locator(ENGINE_TAB('uniwind')).click();
  await page.fill(INPUT, 'conversation');
}

// ---------------------------------------------------------------------------
// Evidence plumbing — the VIS-002 phase pattern: every capture lands under the
// run's phase directory (.tmp/ORI-VIS-004/cycle-1/<phase>/screenshots), and
// the green run additionally commits the canonical named captures + JSON
// records under tests/sprint-05-orient-search/evidence/ledger/.
// ---------------------------------------------------------------------------
const EVIDENCE_DIR = join(repoRoot, 'tests/sprint-05-orient-search/evidence/ledger');
const PHASE = process.env.ORI_VIS004_PHASE ?? 'green';
const PHASE_ROOT = join(repoRoot, `.tmp/ORI-VIS-004/cycle-1/${PHASE}`);

function evidenceEnabled(): boolean {
  return PHASE === 'green';
}

function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  return join(EVIDENCE_DIR, name);
}

function phasePath(name: string): string {
  const path = join(PHASE_ROOT, name);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

/** Screenshot sink: always the phase dir; the evidence dir only in green and
 * only from the capture's canonical project (one writer per named file). */
async function capture(
  page: Page,
  options: { fullPage?: boolean },
  project: string,
  name: string,
  canonicalProject: string,
): Promise<void> {
  const primary = phasePath(join('screenshots', `${project}-${name.replace(/\.png$/, '')}.png`));
  await page.screenshot({ ...options, path: primary });
  if (evidenceEnabled() && project === canonicalProject) copyFileSync(primary, evidencePath(name));
}

/** Merge one observation into the committed assertions.json record. */
function mergeAssertions(section: string, observed: Record<string, unknown>): void {
  if (!evidenceEnabled()) return;
  const path = evidencePath('assertions.json');
  let record: Record<string, unknown> = {};
  try {
    record = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    record = {};
  }
  record[section] = { capturedAt: new Date().toISOString(), ...observed };
  writeFileSync(path, JSON.stringify(record, null, 2));
}

/** Run/source/lockfile/dist/test/policy identity for evidence binding. */
function runIdentity(): Record<string, unknown> {
  const sha256 = (path: string): string =>
    createHash('sha256').update(readFileSync(path)).digest('hex');
  const distCssDir = join(repoRoot, 'apps/docs/dist/_astro');
  const distCss = readdirSync(distCssDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({ name, sha256: sha256(join(distCssDir, name)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    task: 'ORI-VIS-004',
    phase: PHASE,
    capturedAt: new Date().toISOString(),
    sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot }).toString().trim(),
    lockfileSha256: sha256(join(repoRoot, 'pnpm-lock.yaml')),
    registryPageSha256: sha256(join(repoRoot, 'apps/docs/src/pages/registry.astro')),
    ledgerTableSha256: sha256(join(repoRoot, 'apps/docs/src/components/LedgerTable.astro')),
    ledgerFilterSha256: sha256(
      join(repoRoot, 'apps/docs/src/components/islands/LedgerFilter.astro'),
    ),
    dataTableSha256: sha256(join(repoRoot, 'apps/docs/src/components/DataTable.astro')),
    specSha256: sha256(fileURLToPath(import.meta.url)),
    policySha256: sha256(join(repoRoot, '.spec/e2e-policy/surface.json')),
    distRegistrySha256: sha256(join(repoRoot, 'apps/docs/dist/registry/index.html')),
    distCss,
  };
}

interface Box {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

interface ToolbarGeometry {
  toolbar: Box | null;
  categories: Box | null;
  tablist: Box | null;
  input: Box | null;
}

interface FocusObservation {
  kind: string;
  outlineWidth: string;
  outlineStyle: string;
}

/** Resolve the theme's --muted surface, --font-mono stack and --primary color
 * off a detached probe — the site's own sheet is the only palette this spec
 * ever compares against (never a typed literal). */
async function readTokenProbes(
  page: Page,
): Promise<{ muted: string; fontMono: string; primary: string }> {
  return (await page.evaluate(`(() => {
    const probe = document.createElement('span');
    probe.style.cssText =
      'position:absolute;visibility:hidden;background:var(--muted);font-family:var(--font-mono);color:var(--primary)';
    document.body.appendChild(probe);
    const cs = getComputedStyle(probe);
    const out = { muted: cs.backgroundColor, fontMono: cs.fontFamily, primary: cs.color };
    probe.remove();
    return out;
  })()`)) as { muted: string; fontMono: string; primary: string };
}

/** The toolbar's grouping geometry: the three control boxes (category facets,
 * engine tablist, text input) relative to the toolbar's own box. */
async function readToolbarGeometry(page: Page): Promise<ToolbarGeometry> {
  return (await page.evaluate(`(() => {
    const box = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom };
    };
    return {
      toolbar: box(document.querySelector('[data-ledger-toolbar]')),
      categories: box(document.querySelector('.ledger-filter__categories')),
      tablist: box(document.querySelector('rnr-ledger-filter .tab-group__tabs')),
      input: box(document.querySelector('rnr-ledger-filter input')),
    };
  })()`)) as ToolbarGeometry;
}

/** Tab forward, recording every ledger control the moment it is focused (its
 * live focus indicator), until the raw-JS predicate over document.activeElement
 * holds. Each kind is recorded once — at its first focused observation. */
async function tabUntil(
  page: Page,
  predicateSrc: string,
  maxPresses: number,
  reached: FocusObservation[],
): Promise<boolean> {
  for (let press = 0; press < maxPresses; press += 1) {
    await page.keyboard.press('Tab');
    const state = (await page.evaluate(`(() => {
      const el = document.activeElement;
      if (!el) return null;
      const kind = el.getAttribute('data-category-filter') !== null
        ? 'category:' + el.getAttribute('data-category-filter')
        : el.getAttribute('role') === 'tab'
          ? 'tab:' + el.getAttribute('data-engine')
          : el.matches('input')
            ? 'input'
            : el.matches('button[data-state]')
              ? 'copy'
              : '';
      if (!el.closest('main.ledger')) return { kind, stop: !!(${predicateSrc}) };
      const cs = getComputedStyle(el);
      return { kind, outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle, stop: !!(${predicateSrc}) };
    })()`)) as null | {
      kind: string;
      outlineWidth?: string;
      outlineStyle?: string;
      stop: boolean;
    };
    if (!state) continue;
    if (
      state.kind &&
      state.outlineWidth !== undefined &&
      !reached.some((seen) => seen.kind === state.kind)
    ) {
      reached.push({
        kind: state.kind,
        outlineWidth: state.outlineWidth ?? '',
        outlineStyle: state.outlineStyle ?? 'none',
      });
    }
    if (state.stop) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// AC-1: the filtered row keeps verdict, complete command and Docs action
// ---------------------------------------------------------------------------
// Each AC body is a sequential browser proof — every soft assertion is a
// step, not branching product logic (the suite-wide convention).
// fallow-ignore-next-line complexity
test('ORI-VIS-004-AC-1: filtered conversation row keeps verdict, complete uniwind command and Docs link', async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  const soft = expect.soft;
  const project = testInfo.project.name;

  const context = await browser.newContext({ javaScriptEnabled: true });
  await grantClipboardPermissions(context);
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  // The toolbar presents the three controls as one grouped row: on wide
  // viewports they share a top edge with each other inside the toolbar's box.
  const toolbar = await readToolbarGeometry(page);
  soft(toolbar.toolbar, 'the ledger toolbar exists').not.toBeNull();
  if (toolbar.toolbar && toolbar.categories && (page.viewportSize()?.width ?? 0) >= 1024) {
    for (const [label, control] of [
      ['engine tablist', toolbar.tablist],
      ['text input', toolbar.input],
    ] as const) {
      soft(control, `the ${label} render inside the toolbar`).not.toBeNull();
      if (control) {
        soft(
          Math.abs(control.top - toolbar.categories.top) < 8,
          `the ${label} shares the category facets' top edge on a wide viewport`,
        ).toBe(true);
      }
    }
  }

  await filterToConversationUniwind(page);

  // The filtered set is the dataset-derived conversation match set (the real
  // substring filter also matches checkpoint, whose description names the
  // conversation — the AC's "exactly 1" phrasing is asserted as "exactly the
  // derived set, conversation among it"; the filter and data are not this
  // task's to change).
  const names = (await visibleRowNames(page)).map((name) => name.trim());
  soft(names.sort(), 'the filtered set is exactly the dataset-derived matches').toEqual(
    expectedConversationMatches,
  );
  soft(names, 'the conversation row is among the matches').toContain('conversation');

  // The row retains its generated Expo Go verdict.
  const verdict = (
    (await page.locator(`${ROW('conversation')} .badge`).textContent()) ?? ''
  ).trim();
  soft(verdict, 'the row keeps its generated verdict').toBe(
    verdictFor(conversation?.expoGo ?? true),
  );

  // Selected uniwind state: the row shows the uniwind command block only.
  soft(
    await page.locator(`${ROW('conversation')} [data-engine-command="uniwind"]`).isVisible(),
    'the uniwind command block is on screen',
  ).toBe(true);
  soft(
    await page.locator(`${ROW('conversation')} [data-engine-command="nativewind"]`).isVisible(),
    'the nativewind block yields to the selected engine',
  ).toBe(false);
  soft(
    await page.locator(ENGINE_TAB('uniwind')).getAttribute('aria-selected'),
    'the uniwind tab exposes its actual selected state',
  ).toBe('true');

  await capture(page, { fullPage: true }, project, 'filtered-uniwind.png', 'chromium-desktop');

  // The copy control puts the COMPLETE uniwind command on the real clipboard.
  const displayed = (
    (await page
      .locator(`${ROW('conversation')} [data-engine-command="uniwind"] rnr-copy-button code`)
      .textContent()) ?? ''
  ).trim();
  soft(displayed, 'the displayed command is complete').toBe(commandFor('uniwind', 'conversation'));
  await page
    .locator(`${ROW('conversation')} [data-engine-command="uniwind"] rnr-copy-button button`)
    .click();
  const clipboard = (await page.evaluate('navigator.clipboard.readText()')) as string;
  soft(clipboard, 'the real clipboard equals the complete uniwind command').toBe(
    commandFor('uniwind', 'conversation'),
  );

  // The Docs action reaches the real reference page.
  await page.locator(`${ROW('conversation')} a[data-docs-link]`).click();
  await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
  soft(page.url(), 'the Docs action reaches the conversation reference').toBe(
    `${PREVIEW_URL}/components/conversation`,
  );
  const heading = ((await page.locator('main h1').textContent()) ?? '').trim();
  soft(heading, 'the destination carries the conversation heading').toBe(conversation?.title ?? '');

  mergeAssertions(`AC-1/${project}`, {
    matches: names,
    verdict,
    displayedCommand: displayed,
    clipboardCommand: clipboard,
    docsUrl: page.url(),
    docsHeading: heading,
  });

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-2: full restoration, the generated note, both base URLs, the genuine
// no-results state and its recovery
// ---------------------------------------------------------------------------
test('ORI-VIS-004-AC-2: All + clear restores all rows; the real no-results state appears and recovers', async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  const soft = expect.soft;
  const project = testInfo.project.name;

  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  // Filter down to the dataset-derived conversation match set first.
  await filterToConversationUniwind(page);
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'filtered to the dataset-derived conversation matches',
  ).toBe(expectedConversationMatches.length);

  // All + clear restores the generated set with its category totals.
  await page.locator(CATEGORY('all')).click();
  await page.fill(INPUT, '');
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'all 56 generated rows return',
  ).toBe(TOTALS.all);

  const readTotal = (id: string): Promise<string> =>
    page
      .locator(`${CATEGORY(id)} [data-category-count]`)
      .textContent()
      .then((text) => (text ?? '').trim());
  soft(await readTotal('all'), 'the All total reads 56').toBe(String(TOTALS.all));
  soft(await readTotal('component'), 'the component total reads 39').toBe(String(TOTALS.component));
  soft(await readTotal('ui'), 'the ui total reads 11').toBe(String(TOTALS.ui));
  soft(await readTotal('lib'), 'the lib total reads 6').toBe(String(TOTALS.lib));

  // The generated note and both engine base URLs stay readable.
  const note = ((await page.locator('p.ledger__note').textContent()) ?? '').trim();
  soft(note, 'the note names its generated source').toContain(
    'Generated at build from public/r/*.json',
  );
  for (const base of [NATIVEWIND_BASE, UNIWIND_BASE]) {
    soft(
      await page.locator('section.ledger__bulk-add li > code', { hasText: base }).isVisible(),
      `${base} stays readable`,
    ).toBe(true);
  }

  await capture(page, { fullPage: false }, project, 'restored-rows.png', 'chromium-desktop');

  // The genuine no-results state: 0 rows + the real message, then recovery.
  await page.fill(INPUT, 's05-no-ledger-match-zzzz');
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'the unmatched query matches 0 rows',
  ).toBe(0);
  const noResults = page.locator('[data-no-results]');
  soft(await noResults.isVisible(), 'the genuine no-results message is visible').toBe(true);
  const noResultsText = ((await noResults.textContent()) ?? '').trim();
  soft(noResultsText.length, 'the no-results message is nonempty').toBeGreaterThan(0);

  await capture(page, { fullPage: false }, project, 'no-results.png', 'chromium-desktop');

  await page.fill(INPUT, 'conversation');
  soft(
    await page.locator('tr[data-filter-text]:visible').count(),
    'replacing the query restores the conversation matches (the All scope)',
  ).toBe(expectedAllConversationMatches.length);
  soft(
    (await visibleRowNames(page)).some((name) => name.trim() === 'conversation'),
    'the conversation row returns',
  ).toBe(true);
  soft(await noResults.isVisible(), 'the no-results presentation withdraws').toBe(false);

  mergeAssertions(`AC-2/${project}`, {
    restoredRows: TOTALS.all,
    note,
    bases: [NATIVEWIND_BASE, UNIWIND_BASE],
    noResultsText,
  });

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-3: mobile containment, sticky identification and the shared table tokens
// ---------------------------------------------------------------------------
// Each AC body is a sequential browser proof — every soft assertion is a
// step, not branching product logic (the suite-wide convention).
// fallow-ignore-next-line complexity
test('ORI-VIS-004-AC-3: mobile scroll stays in the wrapper; sticky column, header, zebra and mono tokens hold', async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);
  const soft = expect.soft;
  const project = testInfo.project.name;

  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  // All selected, no text query — the full unfiltered ledger.
  await page.locator(CATEGORY('all')).click();
  await page.fill(INPUT, '');

  const probes = await readTokenProbes(page);

  // Shared-token presentation: sticky header, --muted zebra bands, --font-mono
  // engine labels — read off real cells against the probe-resolved tokens.
  const cellStyles = (await page.evaluate(`(() => {
    const wrapper = document.querySelector('${WRAPPER}');
    const head = wrapper ? wrapper.querySelector('thead th') : null;
    const evenRow = wrapper ? wrapper.querySelector('tbody tr:nth-child(even)') : null;
    const evenCell = evenRow ? evenRow.querySelector('td') : null;
    const engineLabel = wrapper ? wrapper.querySelector('.ledger-engine') : null;
    return {
      wrapperExists: !!wrapper,
      headPosition: head ? getComputedStyle(head).position : '',
      zebra: evenCell ? getComputedStyle(evenCell).backgroundColor : '',
      engineFont: engineLabel ? getComputedStyle(engineLabel).fontFamily : '',
    };
  })()`)) as { wrapperExists: boolean; headPosition: string; zebra: string; engineFont: string };
  soft(cellStyles.wrapperExists, 'the shared scroll wrapper carries the ledger table').toBe(true);
  soft(cellStyles.headPosition, 'header cells are sticky').toBe('sticky');
  soft(cellStyles.zebra, 'alternating row surfaces resolve from --muted').toBe(probes.muted);
  soft(cellStyles.engineFont, 'engine labels resolve from --font-mono').toBe(probes.fontMono);

  if ((page.viewportSize()?.width ?? 0) <= 768) {
    // Containment: the WRAPPER scrolls while the page does not.
    const containment = (await page.evaluate(`(() => {
      const wrapper = document.querySelector('${WRAPPER}');
      if (!wrapper) return { wrapperOverflow: -1, pageOverflow: -1 };
      return {
        wrapperOverflow: wrapper.scrollWidth - wrapper.clientWidth,
        pageOverflow:
          document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    })()`)) as { wrapperOverflow: number; pageOverflow: number };
    soft(containment.wrapperOverflow, 'the ledger wrapper scrolls horizontally').toBeGreaterThan(0);
    soft(containment.pageOverflow, 'the page itself does not overflow').toBe(0);

    // The toolbar keeps its reading order when it wraps.
    const toolbar = await readToolbarGeometry(page);
    if (toolbar.toolbar && toolbar.categories && toolbar.tablist && toolbar.input) {
      soft(
        toolbar.categories.top <= toolbar.tablist.top && toolbar.tablist.top <= toolbar.input.top,
        'categories, engine and text controls wrap in reading order',
      ).toBe(true);
    }

    // Scroll the real table to its right edge; the identifying column stays
    // pinned inside the wrapper's visible bounds and the complete controls
    // remain reachable.
    const scrolled = (await page.evaluate(`(() => {
      const wrapper = document.querySelector('${WRAPPER}');
      const cell = document.querySelector('${ROW('conversation')} th[scope="row"]');
      const docs = document.querySelector('${ROW('conversation')} a[data-docs-link]');
      if (!wrapper || !cell || !docs) return { ok: false };
      wrapper.scrollLeft = wrapper.scrollWidth;
      const wr = wrapper.getBoundingClientRect();
      const cr = cell.getBoundingClientRect();
      const dr = docs.getBoundingClientRect();
      return {
        ok: true,
        cellPosition: getComputedStyle(cell).position,
        cellLeft: cr.left,
        cellRight: cr.right,
        wrapperLeft: wr.left,
        wrapperRight: wr.right,
        docsLeft: dr.left,
        docsRight: dr.right,
        scrollLeft: wrapper.scrollLeft,
      };
    })()`)) as {
      ok: boolean;
      cellPosition: string;
      cellLeft: number;
      cellRight: number;
      wrapperLeft: number;
      wrapperRight: number;
      docsLeft: number;
      docsRight: number;
      scrollLeft: number;
    };
    soft(scrolled.ok, 'the conversation row and its controls exist').toBe(true);
    soft(scrolled.scrollLeft, 'the wrapper actually scrolled').toBeGreaterThan(0);
    soft(scrolled.cellPosition, 'the identifying column is sticky').toBe('sticky');
    soft(
      scrolled.cellLeft >= scrolled.wrapperLeft - 1 &&
        scrolled.cellRight <= scrolled.wrapperLeft + 200,
      'the identifying cell stays pinned inside the visible bounds',
    ).toBe(true);
    soft(
      scrolled.docsRight > scrolled.wrapperLeft && scrolled.docsLeft < scrolled.wrapperRight,
      'the Docs control stays reachable inside the wrapper',
    ).toBe(true);

    await capture(page, { fullPage: false }, project, 'mobile-scroll.png', 'chromium-mobile');
  } else {
    // Wide viewport: the toolbar reads as one row and the page stays put.
    const toolbar = await readToolbarGeometry(page);
    if (toolbar.toolbar && toolbar.categories && toolbar.input) {
      soft(
        Math.abs(toolbar.categories.top - toolbar.input.top) < 8,
        'the toolbar controls share one row on the wide viewport',
      ).toBe(true);
    }
    const pageOverflow = (await page.evaluate(
      'document.documentElement.scrollWidth - document.documentElement.clientWidth',
    )) as number;
    soft(pageOverflow, 'the wide page does not overflow').toBe(0);

    await capture(page, { fullPage: false }, project, 'wide-toolbar.png', 'chromium-desktop');
  }

  mergeAssertions(`AC-3/${project}`, { ...cellStyles, probes });

  await context.close();
});

// ---------------------------------------------------------------------------
// AC-4: the complete no-JavaScript ledger; visible keyboard focus and the
// selected engine treatment
// ---------------------------------------------------------------------------
// Each AC body is a sequential browser proof — every soft assertion is a
// step, not branching product logic (the suite-wide convention).
// fallow-ignore-next-line complexity
test('ORI-VIS-004-AC-4: no-JS serves the full ledger and both base URLs; keyboard focus stays visible', async ({
  browser,
}, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;
  const project = testInfo.project.name;

  if (testInfo.project.use.javaScriptEnabled === false) {
    // The no-JavaScript clause: the complete server-rendered ledger, the
    // generated note and both selectable base URLs — read off the served
    // document before any client execution.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    await navigateLocalhost(page, '/registry');
    await page.waitForLoadState('load');

    soft(
      await page.locator('tr[data-filter-text]').count(),
      'the no-JS table contains all 56 server-rendered rows',
    ).toBe(TOTALS.all);
    const note = ((await page.locator('p.ledger__note').textContent()) ?? '').trim();
    soft(note, 'the generated-at-build note is served').toContain(
      'Generated at build from public/r/*.json',
    );

    for (const base of [NATIVEWIND_BASE, UNIWIND_BASE]) {
      const code = page.locator('section.ledger__bulk-add li > code', { hasText: base });
      soft(await code.count(), `${base} is served as selectable text`).toBe(1);
      soft(await code.isVisible(), `${base} is visible`).toBe(true);
      soft(((await code.textContent()) ?? '').trim(), `${base} text is complete`).toBe(base);
      const truncation = (await page.evaluate(`(() => {
        const codes = [...document.querySelectorAll('section.ledger__bulk-add li > code')];
        const el = codes.find((c) => (c.textContent ?? '').trim() === '${base}');
        return el ? el.scrollWidth - el.clientWidth : -1;
      })()`)) as number;
      soft(truncation, `${base} is not truncated`).toBe(0);
    }

    await capture(page, { fullPage: true }, project, 'nojs-full-table.png', 'chromium-nojs');

    mergeAssertions(`AC-4/${project}`, { rows: TOTALS.all, note });

    await context.close();
    return;
  }

  // The keyboard clause: Tab through the real toolbar and copy controls.
  const context = await browser.newContext({ javaScriptEnabled: true });
  const page = await context.newPage();

  await navigateLocalhost(page, '/registry');
  await waitForAstroPageLoad(page, '__rnrLedgerFilterRegistered');

  // Bring the conversation row into the tab order's reach.
  await page.locator(ROW('conversation')).scrollIntoViewIfNeeded();

  // Category facets, the selected engine tab, the text filter — and the two
  // bulk-add copy controls that precede the toolbar in DOM order. (The
  // UNSELECTED engine tab carries tabindex=-1 by the roving-tabindex contract;
  // keyboard reaches it below through the tablist's arrow-key roving.)
  const toolbarWalk: FocusObservation[] = [];
  const hitInput = await tabUntil(
    page,
    `document.activeElement && document.activeElement.matches('rnr-ledger-filter input')`,
    60,
    toolbarWalk,
  );
  soft(hitInput, 'keyboard focus reaches every toolbar control and the text filter').toBe(true);
  const toolbarKinds = toolbarWalk.map((r) => r.kind);
  for (const expected of [
    'category:all',
    'category:component',
    'category:ui',
    'category:lib',
    'tab:nativewind',
    'input',
  ]) {
    soft(toolbarKinds, `Tab reached the ${expected} control`).toContain(expected);
  }
  soft(toolbarKinds, 'Tab reached the bulk-add copy controls').toContain('copy');
  for (const reached of toolbarWalk) {
    soft(
      Number.parseFloat(reached.outlineWidth) > 0 && reached.outlineStyle !== 'none',
      `the ${reached.kind} control shows a visible focus indicator while focused`,
    ).toBe(true);
  }

  // Keyboard-select uniwind through the real roving tablist: Shift+Tab from
  // the input first stops on the visible tabpanel (the ARIA pattern makes
  // panels focus stops), one more Shift+Tab reaches the SELECTED tab, then
  // ArrowRight moves focus AND activates — the control exposes its selected
  // state with a visibly distinct, token-backed treatment while it carries
  // keyboard focus.
  await page.keyboard.press('Shift+Tab');
  const focusOnPanel = (await page.evaluate(
    `document.activeElement !== null && document.activeElement.getAttribute('role') === 'tabpanel'`,
  )) as boolean;
  soft(focusOnPanel, 'Shift+Tab stops on the visible tabpanel first').toBe(true);
  if (focusOnPanel) {
    const panelOutline = (await page.evaluate(`(() => {
      const el = document.activeElement;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { kind: 'tabpanel', outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle };
    })()`)) as FocusObservation | null;
    if (panelOutline) {
      soft(
        Number.parseFloat(panelOutline.outlineWidth) > 0 && panelOutline.outlineStyle !== 'none',
        'the tabpanel control shows a visible focus indicator while focused',
      ).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
  }
  const focusOnSelectedTab = (await page.evaluate(
    `document.activeElement !== null && document.activeElement.getAttribute('role') === 'tab' && document.activeElement.getAttribute('aria-selected') === 'true'`,
  )) as boolean;
  soft(focusOnSelectedTab, 'Shift+Tab returns keyboard focus to the selected engine tab').toBe(
    true,
  );
  await page.keyboard.press('ArrowRight');
  const focusIsUniwind = (await page.evaluate(
    `document.activeElement !== null && document.activeElement.getAttribute('data-engine') === 'uniwind'`,
  )) as boolean;
  soft(focusIsUniwind, 'ArrowRight moves keyboard focus onto the uniwind control').toBe(true);
  soft(
    await page.locator(ENGINE_TAB('uniwind')).getAttribute('aria-selected'),
    'the uniwind control exposes its actual selected state',
  ).toBe('true');
  const engineStyles = (await page.evaluate(`(() => {
    const read = (engine) => {
      const el = document.querySelector('rnr-ledger-filter [role="tab"][data-engine="' + engine + '"]');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { background: cs.backgroundColor, color: cs.color };
    };
    return { uniwind: read('uniwind'), nativewind: read('nativewind') };
  })()`)) as {
    uniwind: { background: string; color: string } | null;
    nativewind: { background: string; color: string } | null;
  };
  soft(engineStyles.uniwind, 'the selected uniwind control renders').not.toBeNull();
  soft(engineStyles.nativewind, 'the unselected nativewind control renders').not.toBeNull();
  if (engineStyles.uniwind && engineStyles.nativewind) {
    soft(
      engineStyles.uniwind.background !== engineStyles.nativewind.background,
      'the selected uniwind control is visibly distinct from the unselected one',
    ).toBe(true);
  }
  const probes = await readTokenProbes(page);
  soft(engineStyles.uniwind?.background, 'the selected treatment is token-backed').toBe(
    probes.primary,
  );

  await capture(page, { fullPage: false }, project, 'focused-controls.png', 'chromium-desktop');

  // A row copy control keeps its visible focus indicator too.
  const copyWalk: FocusObservation[] = [];
  const hitCopy = await tabUntil(
    page,
    `document.activeElement !== null &&
      document.activeElement.closest('${ROW('conversation')}') !== null &&
      document.activeElement.matches('button[data-state]')`,
    3 * TOTALS.all + 60,
    copyWalk,
  );
  soft(hitCopy, 'keyboard focus reaches the conversation copy control').toBe(true);
  // The walk stops the moment the conversation copy trigger is focused — read
  // ITS live indicator, not an earlier row's.
  const copyFocus = (await page.evaluate(`(() => {
    const el = document.activeElement;
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { kind: 'copy', outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle };
  })()`)) as FocusObservation | null;
  soft(copyFocus, 'the copy control was observed focused').toBeDefined();
  if (copyFocus) {
    soft(
      Number.parseFloat(copyFocus.outlineWidth) > 0 && copyFocus.outlineStyle !== 'none',
      'the copy control shows a visible focus indicator while focused',
    ).toBe(true);
  }

  mergeAssertions(`AC-4/${project}`, {
    toolbarWalk,
    copyWalk,
    engineStyles,
    probes,
  });

  await context.close();
});

// ---------------------------------------------------------------------------
// Evidence identity — bound to this candidate source after the green run.
// ---------------------------------------------------------------------------
test.afterAll(() => {
  if (!evidenceEnabled()) return;
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, 'run-identity.json'),
    `${JSON.stringify(runIdentity(), null, 2)}\n`,
  );
});
