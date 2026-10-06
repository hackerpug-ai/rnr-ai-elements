import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-CONT-001 — task-local real-browser content proofs over the three
 * orientation manuscripts (introduction / installation / cli), authored
 * RED-first. Four named tests, one per AC:
 *
 *   - ORI-CONT-001-identity         (AC-1) opening identity + boundary link
 *   - ORI-CONT-001-engine-decision  (AC-2) one engine question, one TabGroup,
 *                                     both complete commands, desktop/mobile
 *                                     selection + no-JS stacked panels
 *   - ORI-CONT-001-cli-reference    (AC-3) absolute-URL contract, consumer
 *                                     destinations, source-backed example,
 *                                     authoritative upstream reference link
 *   - ORI-CONT-001-content-contract (AC-4) metadata, generated matrix,
 *                                     real onward links, provenance, quadrant
 *
 * Everything observes the built dist served by the owned preview at
 * http://localhost:4321. The chromium-nojs project never upgrades the
 * tab-group island, so panel reads there assert the served stacked panels
 * directly and never call waitForAstroPageLoad (its page.evaluate hangs with
 * JavaScript disabled — ORI-CONT-005 finding).
 */

const ROUTES = {
  introduction: '/docs/introduction',
  installation: '/docs/installation',
  cli: '/docs/cli',
  boundary: '/docs/owns-vs-does-not-own',
} as const;

/** The locked panel commands (InstallCommand contract — no --yes, absolute URL). */
const NATIVEWIND_COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';
const UNIWIND_COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json';

/** Every displayed command line must be this absolute shape — never a short name. */
const ABSOLUTE_COMMAND_PATTERN =
  /^npx .* add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

/** The committed ORI-RN-001 recipe carrying the verified source command (AC-3). */
const RECIPE_SCRIPT = new URL(
  '../../packages/docs-snippets/commands/nativewind.sh',
  import.meta.url,
);

/** The dataset DevClientMatrix renders from (AC-4 — dataset-derived rows). */
const DEV_CLIENT_MATRIX = new URL(
  '../../apps/docs/src/data/dev-client-matrix.json',
  import.meta.url,
);

const EVIDENCE_ROOT = join(process.cwd(), '.tmp/ORI-CONT-001/cycle-1/green');

interface DevClientEntry {
  id: string;
  label: string;
  peers: { name: string; range: string }[];
  permissions: { ios: string[]; android: string[] };
}

function readDevClientMatrix(): DevClientEntry[] {
  return JSON.parse(readFileSync(DEV_CLIENT_MATRIX, 'utf8')) as DevClientEntry[];
}

/** The verified nativewind conversation install line, read from the committed recipe. */
function verifiedSourceCommand(): string {
  const script = readFileSync(RECIPE_SCRIPT, 'utf8');
  const line = script
    .split('\n')
    .find(
      (candidate) =>
        candidate.startsWith('npx') &&
        candidate.includes('https://rnraielements.com/r/nativewind/conversation.json'),
    );
  if (!line) throw new Error(`verified source command missing from ${RECIPE_SCRIPT.pathname}`);
  return line.trim();
}

function capture(project: string, name: string, observed: Record<string, unknown>): void {
  const path = join(EVIDENCE_ROOT, 'captures', `${project}-${name}.json`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    JSON.stringify({ project, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

function screenshotPath(project: string, name: string): string {
  const path = join(EVIDENCE_ROOT, 'screenshots', `${project}-${name}.png`);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

/** Navigate and require 200 — the RED failure for every absent manuscript. */
async function requireOk(page: import('@playwright/test').Page, path: string): Promise<string> {
  const response = await navigateLocalhost(page, path);
  const status = response?.status() ?? 0;
  expect(status, `${path} must serve HTTP 200`).toBe(200);
  if (status !== 200 || !response) return '';
  return await response.text();
}

// ---------------------------------------------------------------------------
// AC-1 — opening identity and ownership destination
// ---------------------------------------------------------------------------
// Linear e2e content assertions — one test per AC, deliberately unmixed.
// fallow-ignore-next-line complexity
test('ORI-CONT-001-identity', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const html = await requireOk(page, ROUTES.introduction);
  if (!html) return;

  await expect(page.locator('main h1')).toHaveText('Introduction');

  // The opening paragraph carries the complete product identity.
  const opening = page.locator('main .prose p').first();
  const openingText = (await opening.textContent()) ?? '';
  const required = [
    'React Native',
    'AI chat',
    'agent UI',
    'copy-paste registry',
    'not an npm package',
  ];
  for (const phrase of required) {
    expect.soft(openingText.includes(phrase), `opening names "${phrase}"`).toBe(true);
  }
  // The contiguous identity phrase the shared lane reads in one pass.
  expect
    .soft(openingText.includes('universal AI chat and agent UI components for React Native'))
    .toBe(true);
  expect.soft(openingText.length, 'opening is a substantive paragraph').toBeGreaterThan(120);

  // The authored body is substantive — never an empty shared shell.
  const mainText = (await page.locator('main').textContent()) ?? '';
  expect.soft(mainText.length, 'introduction body is substantive').toBeGreaterThan(300);
  // An explanation page carries no executable markdown examples.
  expect.soft(await page.locator('main pre').count(), 'explanation carries no code fences').toBe(0);
  expect.soft(mainText.includes('npm install'), 'no npm runtime installation claim').toBe(false);

  // Scope and non-scope are stated on the page.
  expect.soft(mainText.includes('does not cover'), 'non-scope is stated').toBe(true);

  // Follow the ownership teaser link to the real boundary page.
  const teaser = page.locator(`main a[href="${ROUTES.boundary}"]`);
  const teaserCount = await teaser.count();
  expect.soft(teaserCount, 'exactly one ownership teaser link').toBe(1);
  await teaser.first().click();
  await page.waitForURL(`**${ROUTES.boundary}`);
  await expect(page.locator('main h1')).toHaveText('What the library owns');

  const boundaryText = (await page.locator('main').textContent()) ?? '';
  for (const phrase of ['transcript state', 'transport', 'tool execution']) {
    expect
      .soft(boundaryText.includes(phrase), `boundary assigns "${phrase}" to the consumer`)
      .toBe(true);
  }
  expect
    .soft(boundaryText.length, 'boundary body is substantive (no 404 shell)')
    .toBeGreaterThan(300);

  const identityOk =
    openingText.includes('React Native') &&
    openingText.includes('AI chat') &&
    openingText.includes('agent UI') &&
    openingText.includes('copy-paste registry') &&
    openingText.includes('not an npm package') &&
    teaserCount === 1 &&
    boundaryText.includes('transcript state') &&
    boundaryText.includes('transport') &&
    boundaryText.includes('tool execution');
  if (identityOk) {
    await page.screenshot({ path: screenshotPath(project, 'identity'), fullPage: true });
    capture(project, 'identity', {
      openingText,
      teaserHref: ROUTES.boundary,
      boundaryPhrases: ['transcript state', 'transport', 'tool execution'],
    });
  }
});

// ---------------------------------------------------------------------------
// AC-2 — one engine decision with complete commands
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-CONT-001-engine-decision', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  const html = await requireOk(page, ROUTES.installation);
  if (!html) return;

  await expect(page.locator('main h1')).toHaveText('Installation');

  // Exactly one engine question: one heading mentions the engine.
  const headings = await page.locator('main h1, main h2').allTextContents();
  const engineHeadings = headings.filter((text) => /engine/i.test(text));
  expect.soft(engineHeadings.length, 'exactly one engine-question heading').toBe(1);

  // Exactly one engine TabGroup — no second, nested, or split group.
  expect.soft(await page.locator('main [role="tablist"]').count(), 'one tablist').toBe(1);
  expect.soft(await page.locator('main rnr-tab-group').count(), 'one rnr-tab-group').toBe(1);

  // Served bytes: each engine command appears exactly once, inside its panel.
  expect.soft(html.split(NATIVEWIND_COMMAND).length - 1, 'nativewind command appears once').toBe(1);
  expect.soft(html.split(UNIWIND_COMMAND).length - 1, 'uniwind command appears once').toBe(1);

  // Decision table maps project facts to engines (both rows present).
  const nativewindRow = page.locator('main tr', { hasText: 'NativeWind 4.2.6' });
  expect.soft(await nativewindRow.count(), 'NativeWind 4.2.6 decision row').toBe(1);
  const nativewindRowText = (await nativewindRow.textContent()) ?? '';
  expect
    .soft(nativewindRowText.includes('Tailwind v3'), 'NativeWind 4.2.6 pairs with Tailwind v3')
    .toBe(true);
  expect
    .soft(nativewindRowText.includes('nativewind'), 'row maps to the nativewind engine')
    .toBe(true);

  const uniwindRow = page.locator('main tr', { hasText: '@theme' });
  expect.soft(await uniwindRow.count(), '@theme decision row').toBe(1);
  const uniwindRowText = (await uniwindRow.textContent()) ?? '';
  expect.soft(uniwindRowText.includes('Tailwind v4'), '@theme pairs with Tailwind v4').toBe(true);
  expect.soft(uniwindRowText.includes('uniwind'), 'row maps to the uniwind engine').toBe(true);

  // The stale PRD phrase never appears as the installed package version.
  const pageText = (await page.locator('main').textContent()) ?? '';
  expect
    .soft(/nativewind\s+v3/i.test(pageText), 'no "nativewind v3" package-version claim')
    .toBe(false);

  // Two labeled engine tabs.
  const tabs = page.locator('main [role="tab"]');
  expect.soft(await tabs.count(), 'exactly two engine tabs').toBe(2);
  await expect
    .soft(page.locator('main [role="tab"][data-engine="nativewind"]'))
    .toHaveText(/nativewind/);
  await expect.soft(page.locator('main [role="tab"][data-engine="uniwind"]')).toHaveText(/uniwind/);

  const nativewindPanel = page.locator('main [role="tabpanel"][data-engine="nativewind"]');
  const uniwindPanel = page.locator('main [role="tabpanel"][data-engine="uniwind"]');

  if (!nojs) {
    // Desktop + mobile: select each engine through the actual tab control.
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');

    await page.locator('main [role="tab"][data-engine="nativewind"]').click();
    await expect(nativewindPanel).toBeVisible();
    await expect(uniwindPanel).toBeHidden();
    const displayedNativewind =
      (await nativewindPanel.locator('rnr-copy-button code').textContent()) ?? '';
    expect
      .soft(displayedNativewind, 'nativewind panel shows the complete command')
      .toBe(NATIVEWIND_COMMAND);

    await page.locator('main [role="tab"][data-engine="uniwind"]').click();
    await expect(page.locator('main [role="tab"][data-engine="uniwind"]')).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(uniwindPanel).toBeVisible();
    await expect(nativewindPanel).toBeHidden();
    const displayedUniwind =
      (await uniwindPanel.locator('rnr-copy-button code').textContent()) ?? '';
    expect.soft(displayedUniwind, 'uniwind panel shows the complete command').toBe(UNIWIND_COMMAND);
    expect
      .soft(
        displayedUniwind.includes('rnraielements.com/r/nativewind/'),
        'no nativewind URL in the uniwind panel',
      )
      .toBe(false);

    await page.screenshot({
      path: screenshotPath(project, 'installation-uniwind'),
      fullPage: true,
    });
    capture(project, 'engine-decision', {
      selectedEngine: 'uniwind',
      displayedNativewind,
      displayedUniwind,
    });
    return;
  }

  // JavaScript disabled: both labeled panels stay readable, stacked, complete.
  await expect(nativewindPanel).toBeVisible();
  await expect(uniwindPanel).toBeVisible();
  const nojsNativewind =
    (await nativewindPanel.locator('rnr-copy-button code').textContent()) ?? '';
  const nojsUniwind = (await uniwindPanel.locator('rnr-copy-button code').textContent()) ?? '';
  expect
    .soft(nojsNativewind, 'no-JS nativewind panel keeps the complete command')
    .toBe(NATIVEWIND_COMMAND);
  expect.soft(nojsUniwind, 'no-JS uniwind panel keeps the complete command').toBe(UNIWIND_COMMAND);
  await page.screenshot({ path: screenshotPath(project, 'installation-nojs'), fullPage: true });
  capture(project, 'engine-decision', { nojsNativewind, nojsUniwind });
});

// ---------------------------------------------------------------------------
// AC-3 — registry-specific CLI reference
// ---------------------------------------------------------------------------
test('ORI-CONT-001-cli-reference', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const html = await requireOk(page, ROUTES.cli);
  if (!html) return;

  await expect(page.locator('main h1')).toHaveText('CLI');

  const mainText = (await page.locator('main').textContent()) ?? '';
  expect.soft(mainText.length, 'CLI body is substantive').toBeGreaterThan(300);

  // Engine trees and the absolute HTTPS URL form are both identified.
  expect
    .soft(mainText.includes('/r/nativewind/'), 'identifies the /r/nativewind/ engine tree')
    .toBe(true);
  expect
    .soft(mainText.includes('/r/uniwind/'), 'identifies the /r/uniwind/ engine tree')
    .toBe(true);
  expect
    .soft(
      mainText.includes('https://rnraielements.com/r/'),
      'absolute HTTPS registry-item URL form',
    )
    .toBe(true);

  // Destination contract: consumer ownership through components.json aliases.
  expect.soft(mainText.includes('components.json'), 'names components.json').toBe(true);
  expect.soft(mainText.includes('your'), 'addresses the reader as you').toBe(true);

  // The displayed example is byte-identical to ONE verified source command.
  const sourceCommand = verifiedSourceCommand();
  const blocks = await page.locator('main pre').allTextContents();
  const matching = blocks.filter((text) => text.trim() === sourceCommand);
  expect.soft(matching.length, 'exactly one example equals the verified source command').toBe(1);

  // Every displayed command line is the absolute-URL form — no short-name adds.
  const commandLines = blocks
    .flatMap((text) => text.split('\n'))
    .map((line) => line.trim())
    .filter((line) => line.startsWith('npx'));
  expect.soft(commandLines.length, 'the page displays at least one command').toBeGreaterThan(0);
  for (const line of commandLines) {
    expect
      .soft(ABSOLUTE_COMMAND_PATTERN.test(line), `command is absolute-URL form: ${line}`)
      .toBe(true);
  }

  // The authoritative upstream reference link — never a copied catalog.
  const upstream = page.locator('main a[href="https://reactnativereusables.com/docs/cli"]');
  expect.soft(await upstream.count(), 'links the authoritative RNR CLI reference').toBe(1);

  // Reference purity: no numbered instructions inside the reference page.
  expect.soft(await page.locator('main ol').count(), 'reference carries no step lists').toBe(0);

  capture(project, 'cli-reference', {
    sourceCommand,
    displayedExample: matching[0] ?? null,
    displayedCommandLines: commandLines,
    upstreamHref: 'https://reactnativereusables.com/docs/cli',
  });
});

// ---------------------------------------------------------------------------
// AC-4 — collection metadata, generated matrix and editorial contract
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-CONT-001-content-contract', async ({ page }, testInfo) => {
  const project = testInfo.project.name;

  const expectedTitles: Record<string, string> = {
    [ROUTES.introduction]: 'Introduction',
    [ROUTES.installation]: 'Installation',
    [ROUTES.cli]: 'CLI',
  };

  const internalLinks = new Set<string>();
  for (const route of [ROUTES.introduction, ROUTES.installation, ROUTES.cli]) {
    await requireOk(page, route);
    await expect(page.locator('main h1')).toHaveText(expectedTitles[route]);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect
      .soft(description && description.length > 0, `${route}: non-empty description`)
      .toBe(true);

    const bodyText = (await page.locator('main').textContent()) ?? '';
    expect.soft(bodyText.includes('does not cover'), `${route}: states a non-scope`).toBe(true);

    for (const href of await page
      .locator('main a, nav a')
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''))) {
      if (/^\/[a-z0-9-]/i.test(href)) internalLinks.add(href);
    }
  }

  // Navigation reflects the collection metadata under Getting started, in order.
  const navHrefs = await page
    .locator('nav[data-docs-nav] a')
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href') ?? ''));
  const expectedOrder = [ROUTES.introduction, ROUTES.installation, ROUTES.cli, '/docs/dark-mode'];
  const positions = expectedOrder.map((href) => navHrefs.indexOf(href));
  expect
    .soft(
      positions.every((position) => position >= 0),
      'nav lists all four pages',
    )
    .toBe(true);
  expect
    .soft(
      positions.every((position, index) => index === 0 || position > positions[index - 1]),
      'nav order is introduction, installation, CLI, Dark mode',
    )
    .toBe(true);

  // Required onward destinations exist among the authored links.
  expect
    .soft(internalLinks.has('/components/conversation'), 'links the real conversation item page')
    .toBe(true);
  expect.soft(internalLinks.has(ROUTES.boundary), 'links the boundary explanation').toBe(true);
  expect.soft(internalLinks.has('/docs/theming'), 'links Theming').toBe(true);
  expect.soft(internalLinks.has('/docs/dark-mode'), 'links Dark mode').toBe(true);
  const troubleshoot = [...internalLinks].filter((href) => /troubleshoot/i.test(href));
  // Sprint 06 (GBC-002) shipped the troubleshooting guide and the
  // installation page links it — the once-unimplemented destination is now a
  // required live link (the loop below asserts it resolves 200).
  expect
    .soft(troubleshoot.length, 'links the shipped troubleshooting guide (/guides/troubleshooting)')
    .toBeGreaterThan(0);
  expect
    .soft(troubleshoot, 'the troubleshooting link is the shipped guide')
    .toEqual(['/guides/troubleshooting']);

  // Every internal link resolves — no placeholder onward destinations.
  for (const href of internalLinks) {
    const response = await page.request.get(`${PREVIEW_URL}${href}`);
    expect.soft(response.status(), `${href} resolves`).toBe(200);
  }

  // Installation renders the dataset-derived dev-client matrix.
  await requireOk(page, ROUTES.installation);
  const matrix = readDevClientMatrix();
  const rows = page.locator('section.dev-client-matrix tbody tr');
  const matrixRowCount = await rows.count();
  expect.soft(matrixRowCount, 'matrix renders one row per dataset entry').toBe(matrix.length);
  for (const entry of matrix) {
    const row = page.locator('section.dev-client-matrix tbody tr', { hasText: entry.label });
    expect.soft(await row.count(), `matrix row for ${entry.label}`).toBe(1);
    const rowText = (await row.textContent()) ?? '';
    for (const peer of entry.peers) {
      expect
        .soft(
          rowText.includes(`${peer.name} ${peer.range}`),
          `${entry.label} lists ${peer.name} ${peer.range}`,
        )
        .toBe(true);
    }
    for (const permission of [...entry.permissions.ios, ...entry.permissions.android]) {
      expect.soft(rowText.includes(permission), `${entry.label} lists ${permission}`).toBe(true);
    }
  }

  // Quadrant jobs: explanation stays prose, how-to keeps numbered steps,
  // reference stays austere; no separately maintained executable markdown.
  await requireOk(page, ROUTES.introduction);
  expect
    .soft(await page.locator('main pre').count(), 'introduction: no executable markdown')
    .toBe(0);
  await requireOk(page, ROUTES.installation);
  expect
    .soft(
      await page.locator('main pre').count(),
      'installation: commands live in the component, not markdown',
    )
    .toBe(0);
  expect
    .soft(await page.locator('main ol').count(), 'installation: numbered imperative steps')
    .toBeGreaterThan(0);
  const installationText = (await page.locator('main').textContent()) ?? '';
  expect
    .soft(installationText.includes('dev client'), 'installation uses the locked term dev client')
    .toBe(true);
  await requireOk(page, ROUTES.cli);
  const cliText = (await page.locator('main').textContent()) ?? '';
  expect.soft(cliText.includes('engine tree'), 'CLI uses the locked term engine tree').toBe(true);
  expect
    .soft(cliText.includes('registry item'), 'CLI uses the locked term registry item')
    .toBe(true);

  // Locked terminology: the "Not" column terms never appear on these pages.
  for (const route of [ROUTES.introduction, ROUTES.installation, ROUTES.cli]) {
    await requireOk(page, route);
    const text = (await page.locator('main').textContent()) ?? '';
    for (const banned of ['styling engine', 'registry variant']) {
      expect.soft(text.includes(banned), `${route}: avoids "${banned}"`).toBe(false);
    }
  }

  capture(project, 'content-contract', {
    navHrefs,
    positions,
    internalLinks: [...internalLinks].sort(),
    matrixRowCount,
    matrixEntries: matrix.map((entry) => entry.id),
  });
});
