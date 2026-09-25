import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-VIS-002 — the paired token-value and live theme-demo presentation over
 * ORI-AST-003's TokenTable machinery. Four named tests, one per AC, all
 * observed on the BUILT dist served by the owned preview at localhost:4321:
 *
 *   - ORI-VIS-002-AC-1  Token names + paired Light/Dark reference values stay
 *                       separately identifiable (desktop/mobile/no-JS)
 *   - ORI-VIS-002-AC-2  The live --background swatch follows the real header
 *                       toggle through light→dark→light (desktop/mobile)
 *   - ORI-VIS-002-AC-3  Real code surfaces follow the theme; both code tokens
 *                       keep their DOCS-ONLY labels (desktop/mobile)
 *   - ORI-VIS-002-AC-4  Static values read without JavaScript; the wide table
 *                       scrolls inside its container with the identifying
 *                       column pinned (desktop/mobile/no-JS)
 *
 * Presentation proofs over the real built page: computed token values, the
 * real EC frame's computed colors, geometry, and screenshots — never a
 * body/root success oracle. The chromium-nojs project never calls
 * page.evaluate (it hangs with JavaScript disabled — ORI-CONT-005 finding);
 * no-JS assertions read DOM state through locators only. AC-2 and AC-3 are
 * interaction cases: in the enabled projects they drive the real header
 * control; in the no-JS project they register the actual fallback (the static
 * paired references and labels, readable without any script).
 *
 * Evidence artifacts under tests/sprint-05-orient-search/evidence/tokens/ are
 * written only when ORI_VIS002_PHASE=green — a red-phase run observes the
 * pre-candidate trunk and must never deposit its screenshots as candidate
 * evidence. Phase captures always land under .tmp/ORI-VIS-002/cycle-1/.
 */

const ROUTE = '/docs/theming';

/** The fixed contract values (TR-07): expected observations, never a second
 * product palette — the site's own sheet is the only palette. */
const CONTRACT = {
  backgroundLight: 'oklch(1 0 0)',
  backgroundDark: 'oklch(0.145 0 0)',
  codeBackgroundLight: 'oklch(0.97 0 0)',
  codeBackgroundDark: 'oklch(0.235 0 0)',
  primaryLight: 'oklch(0.205 0 0)',
  primaryDark: 'oklch(0.922 0 0)',
  ecLightSurface: 'rgb(255, 255, 255)',
} as const;

const TOGGLE = 'button[aria-label="Toggle dark and light theme"]';

const REPO_ROOT = process.cwd();
const EVIDENCE_TOKENS = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/tokens');
const PHASE = process.env.ORI_VIS002_PHASE ?? 'green';
const PHASE_ROOT = join(REPO_ROOT, `.tmp/ORI-VIS-002/cycle-1/${PHASE}`);

/** Committed evidence (theming-light/dark.png, computed-values.json) is a
 * green-phase artifact only; the red run observes the trunk candidate. */
function evidenceEnabled(): boolean {
  return PHASE === 'green';
}

function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_TOKENS, { recursive: true });
  return join(EVIDENCE_TOKENS, name);
}

function phasePath(name: string): string {
  const path = join(PHASE_ROOT, name);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

function screenshotPaths(project: string, name: string): string[] {
  const paths = [phasePath(join('screenshots', `${project}-${name}.png`))];
  return paths;
}

/** Merge one observation into the committed computed-values.json record. */
function mergeComputed(section: string, observed: Record<string, unknown>): void {
  if (!evidenceEnabled()) return;
  const path = evidencePath('computed-values.json');
  mkdirSync(EVIDENCE_TOKENS, { recursive: true });
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
  const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: REPO_ROOT })
    .toString()
    .trim();
  const distCssDir = join(REPO_ROOT, 'apps/docs/dist/_astro');
  const distCss = readdirSync(distCssDir)
    .filter((name) => name.endsWith('.css'))
    .map((name) => ({ name, sha256: sha256(join(distCssDir, name)) }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    capturedAt: new Date().toISOString(),
    sourceSha,
    lockfileSha256: sha256(join(REPO_ROOT, 'pnpm-lock.yaml')),
    specSha256: sha256(fileURLToPath(import.meta.url)),
    policySha256: sha256(join(REPO_ROOT, '.spec/e2e-policy/surface.json')),
    distCss,
  };
}

/** Navigate and require 200 — every proof below rides a real served page. */
async function requireOk(page: import('@playwright/test').Page, path = ROUTE): Promise<void> {
  const response = await navigateLocalhost(page, path);
  expect(response?.status() ?? 0, `${path} must serve HTTP 200`).toBe(200);
}

/**
 * Browser-side expressions are STRING evaluates typed through casts — this
 * workspace's tsconfig ships no DOM lib (it is a React Native workspace), the
 * same convention the reading-presentation and theme-toggle lanes use.
 */

/** One token row's observable presentation, read from the real DOM. */
interface RowState {
  light: string;
  dark: string;
  usage: string;
  docsOnly: string;
  swatch: string;
  current: string;
}

async function readRow(
  page: import('@playwright/test').Page,
  name: string,
): Promise<RowState | null> {
  return page.evaluate(`(() => {
    const row = document.querySelector('tr[data-token="${name}"]');
    if (!row) return null;
    const text = (s) => (row.querySelector(s)?.textContent ?? '').trim();
    const swatch = row.querySelector('[data-swatch]');
    return {
      light: text('[data-value="light"]'),
      dark: text('[data-value="dark"]'),
      usage: text('[data-usage]'),
      docsOnly: text('[data-docs-only]'),
      swatch: swatch ? getComputedStyle(swatch).backgroundColor : '',
      current: text('[data-token-current]'),
    };
  })()`) as Promise<RowState | null>;
}

/** Wait until the theme-toggle island has filled the live-value cells. */
async function waitForTokenIsland(page: import('@playwright/test').Page): Promise<void> {
  await waitForAstroPageLoad(page, '__rnrThemeToggleRegistered');
  await page.waitForFunction(
    `() => (document.querySelector('tr[data-token="background"] [data-token-current]')?.textContent ?? '').trim().length > 0`,
    { timeout: 10_000 },
  );
}

/** Count rows whose paired references are nonempty oklch strings. */
async function countPairedRows(page: import('@playwright/test').Page): Promise<number> {
  const rows = page.locator('tr[data-token]');
  const total = await rows.count();
  let paired = 0;
  for (let index = 0; index < total; index++) {
    const light = (
      (await rows.nth(index).locator('[data-value="light"]').textContent()) ?? ''
    ).trim();
    const dark = (
      (await rows.nth(index).locator('[data-value="dark"]').textContent()) ?? ''
    ).trim();
    if (/^oklch\(/.test(light) && /^oklch\(/.test(dark)) paired++;
  }
  return paired;
}

// ---------------------------------------------------------------------------
// AC-1 — Token names and paired Light/Dark reference values stay separately
//        identifiable (desktop, mobile, and without JavaScript)
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-002-AC-1', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  await requireOk(page);

  await expect(page.locator('main h1')).toHaveText('Theming');

  // The real token table binds once, with its column headers readable.
  expect.soft(await page.locator('[data-token-table]').count(), 'one token table binds').toBe(1);
  for (const header of ['Token', 'Usage', 'Light', 'Dark', 'Swatch', 'Current']) {
    expect
      .soft(
        await page.locator(`[data-token-table] thead th[scope="col"]`, { hasText: header }).count(),
        `the ${header} column header is present`,
      )
      .toBeGreaterThanOrEqual(1);
  }

  // At least ten rows show BOTH a Light and a Dark oklch reference.
  const total = await page.locator('tr[data-token]').count();
  const paired = await countPairedRows(page);
  expect.soft(total, 'the table carries its semantic rows').toBeGreaterThanOrEqual(20);
  expect
    .soft(paired, 'at least 10 rows show paired Light and Dark oklch values')
    .toBeGreaterThanOrEqual(10);

  // The --primary row: readable name, distinct paired values, usage label.
  const primaryRow = page.locator('tr[data-token="primary"]');
  await expect(primaryRow).toBeVisible();
  const primaryName = ((await primaryRow.locator('th[scope="row"]').textContent()) ?? '').trim();
  expect.soft(primaryName.startsWith('--primary'), 'the --primary name is readable').toBe(true);
  const primaryLight = (
    (await primaryRow.locator('[data-value="light"] code').textContent()) ?? ''
  ).trim();
  const primaryDark = (
    (await primaryRow.locator('[data-value="dark"] code').textContent()) ?? ''
  ).trim();
  expect
    .soft(primaryLight, '--primary Light reference is the fixed contract value')
    .toBe(CONTRACT.primaryLight);
  expect
    .soft(primaryDark, '--primary Dark reference is the fixed contract value')
    .toBe(CONTRACT.primaryDark);
  expect.soft(primaryLight !== primaryDark, '--primary carries distinct paired values').toBe(true);
  expect
    .soft(
      ((await primaryRow.locator('[data-usage]').textContent()) ?? '').trim().length,
      'usage labels the row',
    )
    .toBeGreaterThan(0);

  // Both code tokens sit in the same table with their DOCS-ONLY badges.
  const docsOnly = page.locator('[data-docs-only]');
  expect.soft(await docsOnly.count(), 'exactly the two code tokens carry DOCS-ONLY').toBe(2);
  for (const name of ['code-background', 'code-foreground']) {
    const badge = page.locator(`tr[data-token="${name}"] [data-docs-only]`);
    await expect(badge).toBeVisible();
    expect
      .soft(((await badge.textContent()) ?? '').trim(), `--${name} label reads DOCS-ONLY`)
      .toBe('DOCS-ONLY');
  }

  // Without JavaScript the references are the served static bytes — no shell
  // waiting on a script to fill the values.
  if (nojs) {
    const html = (await (await navigateLocalhost(page, ROUTE))?.text()) ?? '';
    expect
      .soft(html.includes(CONTRACT.primaryLight), 'static bytes carry --primary Light')
      .toBe(true);
    expect
      .soft(html.includes(CONTRACT.primaryDark), 'static bytes carry --primary Dark')
      .toBe(true);
    expect.soft(html.includes('DOCS-ONLY'), 'static bytes carry the DOCS-ONLY labels').toBe(true);
  }

  for (const path of screenshotPaths(project, 'ac1')) {
    await page.screenshot({ path, fullPage: true });
  }
  mergeComputed(`${project}-ac1`, {
    total,
    paired,
    primaryName,
    primaryLight,
    primaryDark,
    docsOnlyCount: await docsOnly.count(),
  });
});

// ---------------------------------------------------------------------------
// AC-2 — The live --background swatch follows the real header toggle through
//        light → dark → light while both reference columns stay readable
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-002-AC-2', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';

  // Fresh light-preference context: the pre-paint flip resolves light.
  await page.emulateMedia({ colorScheme: 'light' });
  await requireOk(page);

  if (nojs) {
    // Fallback (no script can run): the live column cannot toggle, and the
    // presentation must still read — every reference column present, the
    // swatch chip rendered, no empty reference cells.
    const backgroundRow = page.locator('tr[data-token="background"]');
    await expect(backgroundRow.locator('[data-value="light"]')).toBeVisible();
    await expect(backgroundRow.locator('[data-value="dark"]')).toBeVisible();
    expect
      .soft(
        ((await backgroundRow.locator('[data-value="light"] code').textContent()) ?? '').trim(),
        'no-JS Light reference stays the static contract value',
      )
      .toBe(CONTRACT.backgroundLight);
    expect
      .soft(
        ((await backgroundRow.locator('[data-value="dark"] code').textContent()) ?? '').trim(),
        'no-JS Dark reference stays the static contract value',
      )
      .toBe(CONTRACT.backgroundDark);
    await expect(backgroundRow.locator('[data-swatch]')).toBeVisible();
    for (const path of screenshotPaths(project, 'ac2-nojs')) {
      await page.screenshot({ path, fullPage: true });
    }
    if (evidenceEnabled()) {
      await page.screenshot({ path: evidencePath('theming-nojs.png'), fullPage: true });
    }
    mergeComputed(`${project}-ac2`, {
      fallback: 'static references readable without JavaScript',
      backgroundLight: CONTRACT.backgroundLight,
      backgroundDark: CONTRACT.backgroundDark,
    });
    return;
  }

  await waitForTokenIsland(page);

  // Observation 1 — fresh light: the swatch resolves the live token.
  const light1 = await readRow(page, 'background');
  expect(light1, 'the --background row is observable').not.toBeNull();
  expect
    .soft(light1?.swatch, 'fresh light: the live swatch is the light canvas')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft(light1?.current, 'fresh light: the live-value cell is the light canvas')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft((light1?.current ?? '').length, 'the live-value cell is not empty')
    .toBeGreaterThan(0);

  // Both reference columns stay readable before any toggle.
  expect
    .soft(light1?.light, 'Light reference readable in light theme')
    .toBe(CONTRACT.backgroundLight);
  expect.soft(light1?.dark, 'Dark reference readable in light theme').toBe(CONTRACT.backgroundDark);

  // Real toggle 1 — dark through the production header control.
  await page.locator(TOGGLE).click();
  await page.waitForFunction(
    `() => (document.querySelector('tr[data-token="background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.backgroundDark}'`,
    { timeout: 10_000 },
  );
  const dark = await readRow(page, 'background');
  expect
    .soft(dark?.swatch, 'dark selection: the swatch follows to the dark canvas')
    .toBe(CONTRACT.backgroundDark);
  expect
    .soft(dark?.current, 'dark selection: the live-value cell is the dark canvas')
    .toBe(CONTRACT.backgroundDark);
  // References are untouched static text — still readable after the flip.
  expect
    .soft(dark?.light, 'Light reference still readable after dark selection')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft(dark?.dark, 'Dark reference still readable after dark selection')
    .toBe(CONTRACT.backgroundDark);

  // Real toggle 2 — back to light through the same control.
  await page.locator(TOGGLE).click();
  await page.waitForFunction(
    `() => (document.querySelector('tr[data-token="background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.backgroundLight}'`,
    { timeout: 10_000 },
  );
  const light2 = await readRow(page, 'background');
  expect
    .soft(light2?.swatch, 'return to light: the swatch follows back')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft(light2?.current, 'return to light: the live-value cell follows back')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft(light2?.light, 'Light reference still readable after the round trip')
    .toBe(CONTRACT.backgroundLight);
  expect
    .soft(light2?.dark, 'Dark reference still readable after the round trip')
    .toBe(CONTRACT.backgroundDark);

  // Exactly 2 observed swatch transitions: light → dark → light.
  const observations = [light1?.swatch, dark?.swatch, light2?.swatch];
  const transitions = observations.slice(1).filter((value, index) => value !== observations[index]);
  expect.soft(transitions.length, 'the swatch made 2 observed color transitions').toBe(2);

  // Contract evidence: the full theming surface in both themes (desktop).
  if (project === 'chromium-desktop') {
    await page.locator(TOGGLE).click();
    await page.waitForFunction(
      `() => (document.querySelector('tr[data-token="background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.backgroundDark}'`,
      { timeout: 10_000 },
    );
    if (evidenceEnabled()) {
      await page.screenshot({ path: evidencePath('theming-dark.png'), fullPage: true });
    }
    for (const path of screenshotPaths(project, 'ac2-dark')) {
      await page.screenshot({ path, fullPage: true });
    }
    await page.locator(TOGGLE).click();
    await page.waitForFunction(
      `() => (document.querySelector('tr[data-token="background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.backgroundLight}'`,
      { timeout: 10_000 },
    );
    if (evidenceEnabled()) {
      await page.screenshot({ path: evidencePath('theming-light.png'), fullPage: true });
    }
  }
  for (const path of screenshotPaths(project, 'ac2')) {
    await page.screenshot({ path, fullPage: true });
  }
  mergeComputed(`${project}-ac2`, {
    observations,
    transitions: transitions.length,
    lightReferencesAfterEachToggle: [light1?.light, dark?.light, light2?.light],
    darkReferencesAfterEachToggle: [light1?.dark, dark?.dark, light2?.dark],
  });
});

// ---------------------------------------------------------------------------
// AC-3 — Real code surfaces follow the theme; both code tokens keep DOCS-ONLY
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-002-AC-3', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';

  await page.emulateMedia({ colorScheme: 'light' });
  await requireOk(page);

  if (nojs) {
    // Fallback (no script can run): the code-token rows and their labels are
    // fully static, and the EC frame renders its no-JS dark-default surface.
    for (const name of ['code-background', 'code-foreground']) {
      const row = page.locator(`tr[data-token="${name}"]`);
      await expect(row.locator('[data-value="light"]')).toBeVisible();
      await expect(row.locator('[data-value="dark"]')).toBeVisible();
      await expect(row.locator('[data-docs-only]')).toBeVisible();
    }
    expect
      .soft(await page.locator('[data-docs-only]').count(), 'both DOCS-ONLY labels without JS')
      .toBe(2);
    await expect(page.locator('.expressive-code pre').first()).toBeVisible();
    for (const path of screenshotPaths(project, 'ac3-nojs')) {
      await page.screenshot({ path, fullPage: true });
    }
    mergeComputed(`${project}-ac3`, {
      fallback: 'static code-token rows and labels readable without JavaScript',
      docsOnlyCount: 2,
    });
    return;
  }

  await waitForTokenIsland(page);

  // Light: the code-token rows show their light references and live values.
  const lightBack = await readRow(page, 'code-background');
  expect
    .soft(lightBack?.light, '--code-background Light reference')
    .toBe(CONTRACT.codeBackgroundLight);
  expect
    .soft(lightBack?.current, 'light: live --code-background is the light frame')
    .toBe(CONTRACT.codeBackgroundLight);
  expect
    .soft(lightBack?.swatch, 'light: the code swatch resolves the light frame')
    .toBe(CONTRACT.codeBackgroundLight);

  // The real EC frame in light: its computed surface is the light surface.
  const lightEc = (await page.evaluate(
    `getComputedStyle(document.querySelector('.expressive-code pre')).backgroundColor`,
  )) as string;
  expect.soft(lightEc, 'the EC frame paints its light surface').toBe(CONTRACT.ecLightSurface);

  // Real toggle — dark through the production header control.
  await page.locator(TOGGLE).click();
  await page.waitForFunction(
    `() => (document.querySelector('tr[data-token="code-background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.codeBackgroundDark}'`,
    { timeout: 10_000 },
  );
  const darkBack = await readRow(page, 'code-background');
  expect
    .soft(darkBack?.current, 'dark: live --code-background is the dark frame')
    .toBe(CONTRACT.codeBackgroundDark);
  expect
    .soft(darkBack?.swatch, 'dark: the code swatch resolves the dark frame')
    .toBe(CONTRACT.codeBackgroundDark);
  expect
    .soft(darkBack?.light !== darkBack?.current, 'the live value left the Light reference behind')
    .toBe(true);

  // The EC frame followed: its computed surface changed off the light value —
  // a static light code surface after dark selection is the excluded state.
  const darkEc = (await page.evaluate(
    `getComputedStyle(document.querySelector('.expressive-code pre')).backgroundColor`,
  )) as string;
  expect.soft(darkEc !== lightEc, 'the EC frame re-paints on dark selection').toBe(true);
  expect
    .soft(darkEc !== CONTRACT.ecLightSurface, 'no static light code surface after dark selection')
    .toBe(true);

  // Both code tokens retain DOCS-ONLY in the dark theme too.
  const docsOnlyDark = await page.locator('[data-docs-only]').allTextContents();
  expect.soft(docsOnlyDark.length, 'both DOCS-ONLY labels persist in dark').toBe(2);
  for (const label of docsOnlyDark) {
    expect.soft(label.trim(), 'the label still reads DOCS-ONLY').toBe('DOCS-ONLY');
  }

  // Real toggle — back to light: the frame and live value return.
  await page.locator(TOGGLE).click();
  await page.waitForFunction(
    `() => (document.querySelector('tr[data-token="code-background"] [data-token-current]')?.textContent ?? '').trim() === '${CONTRACT.codeBackgroundLight}'`,
    { timeout: 10_000 },
  );
  const back = await readRow(page, 'code-background');
  expect
    .soft(back?.current, 'return to light: live --code-background returns')
    .toBe(CONTRACT.codeBackgroundLight);
  const backEc = (await page.evaluate(
    `getComputedStyle(document.querySelector('.expressive-code pre')).backgroundColor`,
  )) as string;
  expect.soft(backEc, 'the EC frame returns to its light surface').toBe(CONTRACT.ecLightSurface);

  for (const path of screenshotPaths(project, 'ac3')) {
    await page.screenshot({ path, fullPage: true });
  }
  mergeComputed(`${project}-ac3`, {
    codeBackgroundLightLive: lightBack?.current,
    codeBackgroundDarkLive: darkBack?.current,
    ecLightSurface: lightEc,
    ecDarkSurface: darkEc,
    docsOnlyDark,
  });
});

// ---------------------------------------------------------------------------
// AC-4 — Static values without JavaScript; the wide table scrolls inside its
//        container with the identifying column pinned (all three projects)
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-002-AC-4', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  const mobile = project === 'chromium-mobile';

  await requireOk(page);

  // Static paired values and both DOCS-ONLY labels read at every width and
  // with or without scripts — the no-JS case is the pure static read.
  const primaryRow = page.locator('tr[data-token="primary"]');
  await expect(primaryRow.locator('[data-value="light"]')).toBeVisible();
  await expect(primaryRow.locator('[data-value="dark"]')).toBeVisible();
  expect
    .soft(
      ((await primaryRow.locator('[data-value="light"] code').textContent()) ?? '').trim(),
      '--primary Light value readable',
    )
    .toBe(CONTRACT.primaryLight);
  expect
    .soft(
      ((await primaryRow.locator('[data-value="dark"] code').textContent()) ?? '').trim(),
      '--primary Dark value readable',
    )
    .toBe(CONTRACT.primaryDark);
  for (const name of ['code-background', 'code-foreground']) {
    await expect(page.locator(`tr[data-token="${name}"] [data-docs-only]`)).toBeVisible();
  }

  if (nojs) {
    // Page-wide overflow without evaluate: the reading surfaces' boxes stay
    // inside the viewport. (The exact 0px scrollWidth check needs evaluate,
    // which hangs with JavaScript disabled — ORI-CONT-005; the JS-enabled
    // projects assert the exact number.)
    const viewport = page.viewportSize();
    const tableWrapper = page.locator('.token-table__scroll');
    const wrapperBox = await tableWrapper.boundingBox();
    expect.soft(wrapperBox, 'the table container is observable').not.toBeNull();
    if (wrapperBox && viewport) {
      expect
        .soft(
          Math.round(wrapperBox.x + wrapperBox.width) <= viewport.width + 1,
          'no-JS table container stays inside the viewport',
        )
        .toBe(true);
    }
    const proseBox = await page.locator('main').boundingBox();
    if (proseBox && viewport) {
      expect
        .soft(proseBox.width <= viewport.width + 1, 'no page-wide overflow from the table')
        .toBe(true);
    }
    // Diagnostic (both phases): the observed numbers behind the assertions.
    writeFileSync(
      phasePath('nojs-ac4-diagnostic.json'),
      JSON.stringify({ viewport, wrapperBox, proseBox }, null, 2),
    );
    for (const path of screenshotPaths(project, 'ac4-nojs')) {
      await page.screenshot({ path, fullPage: true });
    }
    if (evidenceEnabled()) {
      await page.screenshot({ path: evidencePath('theming-nojs.png'), fullPage: true });
    }
    mergeComputed(`${project}-ac4`, {
      fallback: 'static references and labels readable without JavaScript',
      primaryLight: CONTRACT.primaryLight,
      primaryDark: CONTRACT.primaryDark,
      wrapperBox,
    });
    return;
  }

  // The shared table presentation: headers stay on screen, and on the mobile
  // viewport the wide table scrolls INSIDE its container while the sticky
  // identifying column keeps the token name in view.
  const headerBox = await page.locator('[data-token-table] thead th').first().boundingBox();
  expect.soft(headerBox, 'the table header stays rendered').not.toBeNull();

  const geometry = (await page.evaluate(`(() => {
    const scroll = document.querySelector('.token-table__scroll');
    const table = document.querySelector('[data-token-table]');
    const name = document.querySelector('tr[data-token="primary"] th[scope="row"]');
    if (!scroll || !table || !name) return null;
    const before = {
      scrollWidth: scroll.scrollWidth,
      clientWidth: scroll.clientWidth,
      scrollLeft: scroll.scrollLeft,
    };
    // Scroll the container fully right, then read the pinned name cell.
    scroll.scrollLeft = scroll.scrollWidth;
    const nameRect = name.getBoundingClientRect();
    const wrapperRect = scroll.getBoundingClientRect();
    return {
      before,
      tableWiderThanWrapper: table.scrollWidth > scroll.clientWidth,
      pageOverflowPx: Math.max(
        0,
        document.documentElement.scrollWidth - window.innerWidth,
      ),
      afterScrollLeft: scroll.scrollLeft,
      nameLeft: nameRect.left,
      wrapperLeft: wrapperRect.left,
      wrapperRight: wrapperRect.right,
      namePinnedInside:
        nameRect.left >= wrapperRect.left - 0.5 && nameRect.right <= wrapperRect.right + 0.5,
      viewportWidth: window.innerWidth,
    };
  })()`)) as {
    before: { scrollWidth: number; clientWidth: number; scrollLeft: number };
    tableWiderThanWrapper: boolean;
    pageOverflowPx: number;
    afterScrollLeft: number;
    nameLeft: number;
    wrapperLeft: number;
    wrapperRight: number;
    namePinnedInside: boolean;
    viewportWidth: number;
  } | null;
  expect.soft(geometry, 'table containment geometry is observable').not.toBeNull();
  if (geometry) {
    expect
      .soft(geometry.pageOverflowPx, 'page-wide horizontal overflow is exactly 0 pixels')
      .toBe(0);
    if (mobile) {
      // The six-column map is wider than a phone: the container scrolls, the
      // identifying --primary cell stays pinned inside the visible container
      // bounds, and the scroll happened inside the container (not the page).
      expect
        .soft(geometry.tableWiderThanWrapper, 'the mobile table is wider than its container')
        .toBe(true);
      expect
        .soft(geometry.afterScrollLeft, 'the container actually scrolled horizontally')
        .toBeGreaterThan(0);
      expect
        .soft(geometry.namePinnedInside, 'the --primary identifying cell stays pinned in bounds')
        .toBe(true);
    } else {
      expect
        .soft(
          geometry.wrapperRight <= geometry.viewportWidth + 1,
          'the container stays in the viewport',
        )
        .toBe(true);
    }
  }

  if (mobile) {
    for (const path of screenshotPaths(project, 'ac4-mobile')) {
      await page.screenshot({ path, fullPage: true });
    }
    if (evidenceEnabled()) {
      await page.screenshot({ path: evidencePath('theming-mobile-dark.png'), fullPage: true });
    }
  }
  for (const path of screenshotPaths(project, 'ac4')) {
    await page.screenshot({ path, fullPage: true });
  }
  mergeComputed(`${project}-ac4`, { geometry });

  // The desktop project binds the run identity to the committed evidence.
  if (project === 'chromium-desktop' && evidenceEnabled()) {
    mergeComputed('identity', runIdentity());
  }
});
