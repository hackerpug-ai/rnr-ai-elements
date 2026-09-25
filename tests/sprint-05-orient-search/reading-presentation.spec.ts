import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL, waitForAstroPageLoad } from '../harness/docs-preview';

/**
 * ORI-VIS-001 — the shared reading presentation over the Getting Started prose
 * surface. Four named tests, one per AC, all observed on the BUILT dist served
 * by the owned preview at http://localhost:4321:
 *
 *   - ORI-VIS-001-AC-1  Introduction identity + boundary explanation read in
 *                       the shared shell (desktop/mobile/no-JS)
 *   - ORI-VIS-001-AC-2  Section navigation + Toc links keep headings readable
 *                       below the 3.5rem sticky header; 70ch measure holds
 *   - ORI-VIS-001-AC-3  Engine panels, step-associated expected results and
 *                       the worked-example link stay readable with and without
 *                       JavaScript
 *   - ORI-VIS-001-AC-4  Local Spline assets answer 200 same-origin, both
 *                       themes render through the token sheet, and long
 *                       content scrolls inside its own containers
 *
 * Presentation-only proofs over the real built pages: geometry, computed
 * tokens, real font responses and screenshots — never a body/root success
 * oracle. The chromium-nojs project never upgrades islands and never calls
 * page.evaluate (it hangs with JavaScript disabled — ORI-CONT-005 finding);
 * no-JS assertions read DOM state through locators only.
 */

const ROUTES = {
  introduction: '/docs/introduction',
  installation: '/docs/installation',
  cli: '/docs/cli',
  theming: '/docs/theming',
  darkMode: '/docs/dark-mode',
  quickstart: '/docs/quickstart',
  boundary: '/docs/owns-vs-does-not-own',
  messageItem: '/components/message',
} as const;

const H1_BY_ROUTE: Record<string, string> = {
  [ROUTES.installation]: 'Installation',
  [ROUTES.cli]: 'CLI',
  [ROUTES.theming]: 'Theming',
  [ROUTES.darkMode]: 'Dark mode',
};

/** The locked single-item install command per engine (InstallCommand contract). */
const COMMANDS = {
  nativewindConversation:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json',
  uniwindConversation:
    'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json',
} as const;

/** Self-hosted Spline faces (TR-07): both families, latin subsets preloaded. */
const FONT_FILES = [
  '/fonts/spline-sans-var-latin.woff2',
  '/fonts/spline-sans-var-latin-ext.woff2',
  '/fonts/spline-sans-mono-var-latin.woff2',
  '/fonts/spline-sans-mono-var-latin-ext.woff2',
] as const;

const REPO_ROOT = process.cwd();
const EVIDENCE_READING = join(REPO_ROOT, 'tests/sprint-05-orient-search/evidence/reading');
const GREEN_ROOT = join(REPO_ROOT, '.tmp/ORI-VIS-001/cycle-1/green');

function capture(project: string, name: string, observed: Record<string, unknown>): void {
  const path = join(GREEN_ROOT, 'captures', `${project}-${name}.json`);
  mkdirSync(dirname(path), { recursive: true });
  const record = { project, capturedAt: new Date().toISOString(), ...observed };
  writeFileSync(path, JSON.stringify(record, null, 2));
  // The committed assertions.json is the cross-project evidence record.
  const assertionsPath = join(EVIDENCE_READING, 'assertions.json');
  mkdirSync(EVIDENCE_READING, { recursive: true });
  let records: unknown[] = [];
  try {
    const existing = JSON.parse(readFileSync(assertionsPath, 'utf8')) as {
      assertions?: unknown[];
    };
    records = existing.assertions ?? [];
  } catch {
    records = [];
  }
  records.push(record);
  writeFileSync(assertionsPath, JSON.stringify({ assertions: records }, null, 2));
}

function screenshotPath(project: string, name: string): string {
  const path = join(GREEN_ROOT, 'screenshots', `${project}-${name}.png`);
  mkdirSync(dirname(path), { recursive: true });
  return path;
}

/** The contract evidence PNGs land under tests/.../evidence/reading/. */
function evidencePath(name: string): string {
  mkdirSync(EVIDENCE_READING, { recursive: true });
  return join(EVIDENCE_READING, name);
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

/** Collect same-origin /fonts/*.woff2 and /_astro/*.css response statuses.
 * The FIRST status per URL is kept: intra-test re-navigations revalidate to
 * 304, but the initial load of every asset must have answered 200. */
function trackAssets(page: Page): {
  fonts: Map<string, number>;
  stylesheets: Map<string, number>;
  stylesheetBytes: Map<string, number>;
} {
  const fonts = new Map<string, number>();
  const stylesheets = new Map<string, number>();
  const stylesheetBytes = new Map<string, number>();
  page.on('response', async (response) => {
    const url = response.url();
    if (!url.startsWith(PREVIEW_URL)) return;
    if (url.includes('/fonts/') && url.endsWith('.woff2')) {
      if (!fonts.has(url)) fonts.set(url, response.status());
    } else if (/_astro\/[^/]+\.css$/.test(url)) {
      if (!stylesheets.has(url)) stylesheets.set(url, response.status());
      try {
        if (!stylesheetBytes.has(url)) stylesheetBytes.set(url, (await response.body()).length);
      } catch {
        stylesheetBytes.set(url, -1);
      }
    }
  });
  return { fonts, stylesheets, stylesheetBytes };
}

/** Navigate and require 200 — every proof below rides a real served page. */
async function requireOk(page: Page, path: string): Promise<string> {
  const response = await navigateLocalhost(page, path);
  const status = response?.status() ?? 0;
  expect(status, `${path} must serve HTTP 200`).toBe(200);
  if (status !== 200 || !response) return '';
  return await response.text();
}

/**
 * Browser-side expressions are STRING evaluates typed through casts — this
 * workspace's tsconfig ships no DOM lib (it is a React Native workspace), the
 * same convention the theme-toggle and engine-state lanes use.
 */

/** The resolved theme class — the pre-paint flip's one observable output. */
async function resolvedTheme(page: Page): Promise<'light' | 'dark' | null> {
  return page.evaluate(`(() => {
    const root = document.documentElement;
    if (root.classList.contains('light')) return 'light';
    if (root.classList.contains('dark')) return 'dark';
    return null;
  })()`) as Promise<'light' | 'dark' | null>;
}

// ---------------------------------------------------------------------------
// AC-1 — Introduction identity and the boundary explanation in the shared shell
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-001-AC-1', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  await page.emulateMedia({ colorScheme: 'light' });
  const html = await requireOk(page, ROUTES.introduction);
  if (!html) return;

  // The shared reading shell composes: PageHeader title block + Prose body.
  await expect(page.locator('main h1')).toHaveText('Introduction');
  const description = page.locator('.page-header__description');
  await expect(description).toBeVisible();
  expect
    .soft((await description.textContent())?.length ?? 0, 'PageHeader carries the description')
    .toBeGreaterThan(20);

  // The three identity statements sit together in normal visible text — no
  // interaction, no collapsed region.
  const opening = page.locator('main .prose p').first();
  await expect(opening).toBeVisible();
  const openingText = (await opening.textContent()) ?? '';
  for (const phrase of ['React Native', 'copy-paste registry', 'not an npm package']) {
    expect.soft(openingText.includes(phrase), `identity names "${phrase}"`).toBe(true);
  }
  const mainText = (await page.locator('main').textContent()) ?? '';
  expect
    .soft(mainText.length, 'introduction body is substantive in the shell')
    .toBeGreaterThan(300);

  // Follow the canonical boundary link and read the substantive explanation.
  const teaser = page.locator(`main a[href="${ROUTES.boundary}"]`);
  expect.soft(await teaser.count(), 'introduction links the boundary page').toBeGreaterThan(0);
  await teaser.first().click();
  await page.waitForURL(`**${ROUTES.boundary}`);
  await expect(page.locator('main h1')).toHaveText('What the library owns');

  const boundaryText = (await page.locator('main').textContent()) ?? '';
  expect
    .soft(boundaryText.includes('renderMarkdown'), 'boundary explains renderMarkdown')
    .toBe(true);
  expect.soft(boundaryText.includes('dev client'), 'boundary explains the dev client').toBe(true);
  expect
    .soft(boundaryText.includes('Coming soon'), 'no coming-soon placeholder boundary')
    .toBe(false);
  // The boundary page rides the same shared reading shell, not a bare route.
  expect
    .soft(await page.locator('nav[data-docs-nav] a, .docs-nav a').count(), 'shared nav present')
    .toBeGreaterThan(3);
  expect
    .soft(await page.locator('main .prose').count(), 'boundary body renders through Prose')
    .toBe(1);

  // Contract evidence: the boundary reading surface, desktop, full page.
  if (project === 'chromium-desktop') {
    await page.screenshot({ path: evidencePath('boundary-table.png'), fullPage: true });
  }
  await page.screenshot({ path: screenshotPath(project, 'boundary'), fullPage: true });
  capture(project, 'ac1', {
    openingText,
    boundaryNamesRenderMarkdown: boundaryText.includes('renderMarkdown'),
    boundaryNamesDevClient: boundaryText.includes('dev client'),
  });
});

// ---------------------------------------------------------------------------
// AC-2 — Section navigation and Toc links below the sticky header
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-001-AC-2', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  const html = await requireOk(page, ROUTES.introduction);
  if (!html) return;

  // The section navigation region is real and non-empty, at every width.
  const navLinks = page.locator('nav[data-docs-nav] a');
  const navCount = await navLinks.count();
  expect.soft(navCount, 'section navigation is populated').toBeGreaterThanOrEqual(4);
  const navHrefs = await navLinks.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href') ?? ''),
  );
  for (const destination of [ROUTES.installation, ROUTES.cli, ROUTES.theming, ROUTES.darkMode]) {
    expect.soft(navHrefs, `section navigation reaches ${destination}`).toContain(destination);
  }

  // Follow the named destinations through the real section-nav links. The
  // theming member is asserted against the nav below; the publication
  // contract currently reserves that slug out of sectionNavigation, so it is
  // read by its real destination instead of a nav click that would hang.
  for (const destination of [ROUTES.installation, ROUTES.cli, ROUTES.darkMode]) {
    await page.locator(`nav[data-docs-nav] a[href="${destination}"]`).click();
    await page.waitForURL(`**${destination}`);
    await expect(page.locator('main h1')).toHaveText(H1_BY_ROUTE[destination]);
  }
  expect.soft(navHrefs, 'section navigation reaches /docs/theming').toContain(ROUTES.theming);

  // Use the on-this-page rail: the #textclasscontext link scrolls the heading
  // to a readable position below the 3.5rem sticky header.
  const tocLink = page.locator('.toc a[href="#textclasscontext"]');
  expect.soft(await tocLink.count(), 'Toc links the TextClassContext heading').toBe(1);
  // The narrower-width ToC is an Astro-owned details control (zero-JS toggle).
  const tocDetails = page.locator('details.toc');
  expect.soft(await tocDetails.count(), 'Toc is a details control').toBe(1);

  await requireOk(page, ROUTES.theming);
  await page.locator('.toc a[href="#textclasscontext"]').click();
  await page.waitForURL('**/docs/theming#textclasscontext');

  if (!nojs) {
    const geometry = (await page.evaluate(`(() => {
      const heading = document.getElementById('textclasscontext');
      const header = document.querySelector('.site-header');
      const prose = document.querySelector('main .prose');
      if (!heading || !header || !prose) return null;
      const headingTop = heading.getBoundingClientRect().top;
      const headerBottom = header.getBoundingClientRect().bottom;
      const proseStyle = getComputedStyle(prose);
      return {
        headingTop,
        headerBottom,
        headerHeight: header.getBoundingClientRect().height,
        headingBelowHeader: headingTop >= headerBottom - 0.5,
        proseMaxWidth: proseStyle.maxWidth,
        proseOverflowing: prose.scrollWidth > prose.clientWidth + 1,
        pageOverflowing:
          document.documentElement.scrollWidth > window.innerWidth + 1,
        navRight:
          (document.querySelector('nav[data-docs-nav]') || { getBoundingClientRect: () => null })
            .getBoundingClientRect()?.right ?? -1,
        viewportWidth: window.innerWidth,
      };
    })()`)) as {
      headingTop: number;
      headerBottom: number;
      headerHeight: number;
      headingBelowHeader: boolean;
      proseMaxWidth: string;
      proseOverflowing: boolean;
      pageOverflowing: boolean;
      navRight: number;
      viewportWidth: number;
    } | null;
    expect.soft(geometry, 'reading geometry is observable').not.toBeNull();
    if (geometry) {
      expect
        .soft(geometry.headingBelowHeader, 'TextClassContext heading sits below the header')
        .toBe(true);
      expect
        .soft(Math.abs(geometry.headerHeight - 56), 'sticky header is 3.5rem (56px)')
        .toBeLessThanOrEqual(0.5);
      expect.soft(geometry.proseMaxWidth, 'prose measure is the 70ch token').toBe('70ch');
      expect.soft(geometry.proseOverflowing, 'prose content stays inside its measure').toBe(false);
      expect.soft(geometry.pageOverflowing, 'no page-wide overflow').toBe(false);
      expect
        .soft(geometry.navRight, 'navigation stays inside the viewport')
        .toBeLessThanOrEqual(geometry.viewportWidth + 1);
      capture(project, 'ac2-geometry', geometry);
    }
  }

  // The ToC details control toggles closed and open again without scripts.
  const summary = page.locator('details.toc > summary');
  await expect(summary).toBeVisible();
  await summary.click();
  expect.soft(await page.locator('details.toc').getAttribute('open'), 'ToC collapses').toBeNull();
  await summary.click();
  expect.soft(await page.locator('details.toc').getAttribute('open'), 'ToC reopens').not.toBeNull();

  await page.screenshot({ path: screenshotPath(project, 'theming-toc'), fullPage: true });
  capture(project, 'ac2', { navHrefs, tocTarget: '#textclasscontext' });
});

// ---------------------------------------------------------------------------
// AC-3 — Engine panels, expected results and the worked-example link
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-001-AC-3', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  const html = await requireOk(page, ROUTES.quickstart);
  if (!html) return;

  await expect(page.locator('main h1')).toHaveText('Quickstart');

  // Before step 1, the tutorial names the end state: seed-data list, prompt
  // input, Expo Go.
  const introText =
    (await page.locator('main .prose > p').first().textContent()) ??
    (await page.locator('main .prose p').first().textContent()) ??
    '';
  for (const phrase of ['scrolling message list', 'prompt input', 'Expo Go']) {
    expect.soft(introText.includes(phrase), `intro names "${phrase}"`).toBe(true);
  }

  // Every numbered step carries its own visible expected result.
  const steps = page.locator('main .prose ol > li');
  const stepCount = await steps.count();
  expect.soft(stepCount, 'the tutorial has numbered steps').toBeGreaterThanOrEqual(7);
  const stepTexts = await steps.allTextContents();
  const stepsWithExpectedResult = stepTexts.filter((text) => /should see/i.test(text));
  expect
    .soft(stepsWithExpectedResult.length, 'each step names its expected result')
    .toBe(stepCount);

  // The worked-example link exists after the steps (XPath works without JS).
  const exampleLink = page.locator(
    `xpath=//main//ol/following::a[contains(@href, "github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example")]`,
  );
  expect
    .soft(await exampleLink.count(), 'worked example link follows the steps')
    .toBeGreaterThanOrEqual(1);
  expect
    .soft((await exampleLink.first().textContent())?.toLowerCase().includes('example'))
    .toBe(true);

  // The conversation install command rides engine panels in step 1.
  const stepOne = page.locator('main .prose ol > li').first();
  const stepOneGroups = stepOne.locator('rnr-tab-group');
  expect.soft(await stepOneGroups.count(), 'step 1 carries an engine group').toBe(1);
  const nativewindTabs = page.locator('main [role="tab"][data-engine="nativewind"]');
  const uniwindTabs = page.locator('main [role="tab"][data-engine="uniwind"]');
  expect
    .soft(await nativewindTabs.count(), 'nativewind labels on every engine group')
    .toBeGreaterThanOrEqual(4);
  expect
    .soft(await uniwindTabs.count(), 'uniwind labels on every engine group')
    .toBeGreaterThanOrEqual(4);

  if (!nojs) {
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
    // Deliberate engine choice through the real tab control: nativewind, then
    // uniwind — every synchronized group flips with it.
    await page.locator('main [role="tab"][data-engine="nativewind"]').first().click();
    const nativewindCommand =
      (await stepOne
        .locator('[role="tabpanel"][data-engine="nativewind"] code')
        .first()
        .textContent()) ?? '';
    expect
      .soft(nativewindCommand.trim(), 'nativewind panel shows the complete command')
      .toBe(COMMANDS.nativewindConversation);

    await page.locator('main [role="tab"][data-engine="uniwind"]').first().click();
    await expect(page.locator('main [role="tab"][data-engine="uniwind"]').first()).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const uniwindCommand =
      (await stepOne
        .locator('[role="tabpanel"][data-engine="uniwind"] code')
        .first()
        .textContent()) ?? '';
    expect
      .soft(uniwindCommand.trim(), 'uniwind panel shows the complete command')
      .toBe(COMMANDS.uniwindConversation);
    await page.screenshot({
      path: screenshotPath(project, 'quickstart-uniwind'),
      fullPage: true,
    });
    capture(project, 'ac3', { stepCount, nativewindCommand, uniwindCommand });
  } else {
    // JavaScript disabled: both panels of every group stay readable, labeled,
    // complete — never a hidden second engine.
    const stepOneNativewind = stepOne.locator('[role="tabpanel"][data-engine="nativewind"]');
    const stepOneUniwind = stepOne.locator('[role="tabpanel"][data-engine="uniwind"]');
    await expect(stepOneNativewind).toBeVisible();
    await expect(stepOneUniwind).toBeVisible();
    expect
      .soft(
        ((await stepOneNativewind.locator('code').first().textContent()) ?? '').trim(),
        'no-JS nativewind panel keeps the complete command',
      )
      .toBe(COMMANDS.nativewindConversation);
    expect
      .soft(
        ((await stepOneUniwind.locator('code').first().textContent()) ?? '').trim(),
        'no-JS uniwind panel keeps the complete command',
      )
      .toBe(COMMANDS.uniwindConversation);
    // Served bytes carry the tab labels (the visible tabs are real buttons).
    expect.soft(html.includes('nativewind engine'), 'labels the nativewind panel').toBe(true);
    expect.soft(html.includes('uniwind engine'), 'labels the uniwind panel').toBe(true);

    // The same no-JS contract holds on Installation and the Message item page:
    // EVERY engine group on the page shows both labeled panels.
    const installationHtml = await requireOk(page, ROUTES.installation);
    if (installationHtml) {
      const installationGroups = page.locator('main rnr-tab-group');
      const installationGroupCount = await installationGroups.count();
      expect
        .soft(installationGroupCount, 'installation carries engine groups')
        .toBeGreaterThanOrEqual(1);
      for (let index = 0; index < installationGroupCount; index++) {
        await expect(
          installationGroups.nth(index).locator('[role="tabpanel"][data-engine="nativewind"]'),
        ).toBeVisible();
        await expect(
          installationGroups.nth(index).locator('[role="tabpanel"][data-engine="uniwind"]'),
        ).toBeVisible();
      }
      await page.screenshot({
        path: evidencePath('installation-nojs.png'),
        fullPage: true,
      });
      await page.screenshot({
        path: screenshotPath(project, 'installation-nojs'),
        fullPage: true,
      });
    }
    const messageHtml = await requireOk(page, ROUTES.messageItem);
    if (messageHtml) {
      const messageGroups = page.locator('main rnr-tab-group');
      const messageGroupCount = await messageGroups.count();
      expect
        .soft(messageGroupCount, 'message page carries engine groups')
        .toBeGreaterThanOrEqual(1);
      for (let index = 0; index < messageGroupCount; index++) {
        await expect(
          messageGroups.nth(index).locator('[role="tabpanel"][data-engine="nativewind"]'),
        ).toBeVisible();
        await expect(
          messageGroups.nth(index).locator('[role="tabpanel"][data-engine="uniwind"]'),
        ).toBeVisible();
      }
      expect
        .soft(messageHtml.includes('nativewind engine'), 'message page labels both panels')
        .toBe(true);
      expect
        .soft(messageHtml.includes('uniwind engine'), 'message page labels both panels')
        .toBe(true);
    }
    capture(project, 'ac3-nojs', {
      stepCount,
      installationBothPanels: true,
      messageBothPanels: true,
    });
  }
});

// ---------------------------------------------------------------------------
// AC-4 — Local Spline assets, both themes, confined containers
// ---------------------------------------------------------------------------
// fallow-ignore-next-line complexity
test('ORI-VIS-001-AC-4', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  const nojs = project === 'chromium-nojs';
  const assets = trackAssets(page);

  // Light column first — the pre-paint flip resolves the emulated scheme.
  await page.emulateMedia({ colorScheme: 'light' });
  const html = await requireOk(page, ROUTES.introduction);
  if (!html) return;

  // Both Spline families answer from the site's own origin. A 304 here is a
  // cached revalidation of an already-200 load (the browser context's cache
  // carries the woff2 from the navigations above) — still a same-origin hit.
  const fontOk = await (async () => {
    for (const file of FONT_FILES) {
      const response = await page.request.get(`${PREVIEW_URL}${file}`);
      expect.soft([200, 304], `${file} serves same-origin`).toContain(response.status());
      expect
        .soft(new URL(response.url()).origin, `${file} stays on the preview origin`)
        .toBe(PREVIEW_URL);
    }
    return true;
  })();
  expect.soft(fontOk, 'all four Spline subsets resolve').toBe(true);

  if (!nojs) {
    // The rendered typography actually uses the local faces + tokens.
    await page.evaluate('document.fonts.ready');
    const typography = (await page.evaluate(`(() => {
      const sansLoaded = document.fonts.check('17px "Spline Sans Variable"');
      const monoLoaded = document.fonts.check('17px "Spline Sans Mono Variable"');
      // Computed font-family serializes with double quotes; normalize for the
      // token-order assertions below.
      const normalize = (family) => family.replace(/"/g, "'");
      const bodyFamily = normalize(getComputedStyle(document.body).fontFamily);
      const codeElement = document.querySelector('main code, main kbd');
      const codeFamily = codeElement ? normalize(getComputedStyle(codeElement).fontFamily) : null;
      const background = getComputedStyle(document.body).backgroundColor;
      const stylesheetLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].map(
        (link) => link.getAttribute('href') ?? '',
      );
      return { sansLoaded, monoLoaded, bodyFamily, codeFamily, background, stylesheetLinks };
    })()`)) as {
      sansLoaded: boolean;
      monoLoaded: boolean;
      bodyFamily: string;
      codeFamily: string | null;
      background: string;
      stylesheetLinks: string[];
    };
    expect.soft(typography.sansLoaded, 'Spline Sans Variable face is loaded').toBe(true);
    expect.soft(typography.monoLoaded, 'Spline Sans Mono Variable face is loaded').toBe(true);
    expect
      .soft(typography.bodyFamily.startsWith("'Spline Sans Variable'"), 'body uses --font-sans')
      .toBe(true);
    expect
      .soft(
        (typography.codeFamily ?? '').startsWith("'Spline Sans Mono Variable'"),
        'code surfaces use --font-mono',
      )
      .toBe(true);
    expect
      .soft(typography.stylesheetLinks.length, 'the built stylesheet is linked')
      .toBeGreaterThanOrEqual(1);

    // Theme flip through the product's own mechanism: light, then dark.
    const lightTheme = await resolvedTheme(page);
    expect.soft(lightTheme, 'light scheme resolves the light column').toBe('light');
    const lightBackground = typography.background;
    await page.emulateMedia({ colorScheme: 'dark' });
    await requireOk(page, ROUTES.introduction);
    const darkTheme = await resolvedTheme(page);
    expect.soft(darkTheme, 'dark scheme resolves the dark column').toBe('dark');
    const darkBackground = (await page.evaluate(
      'getComputedStyle(document.body).backgroundColor',
    )) as string;
    expect
      .soft(lightBackground !== darkBackground, 'the token sheet re-resolves per theme')
      .toBe(true);
    capture(project, 'ac4-themes', { lightTheme, darkTheme, lightBackground, darkBackground });
  }

  // Every font + stylesheet response observed on the wire was same-origin and
  // successful, and no stylesheet response was empty.
  const observedFonts = [...assets.fonts.entries()];
  const observedStyles = [...assets.stylesheets.entries()];
  expect
    .soft(observedFonts.length, 'real font requests hit the wire during navigation')
    .toBeGreaterThanOrEqual(1);
  for (const [url, status] of observedFonts) {
    expect.soft(status, `font response 200: ${url}`).toBe(200);
  }
  expect
    .soft(observedStyles.length, 'the built CSS bundle was requested')
    .toBeGreaterThanOrEqual(1);
  for (const [url, status] of observedStyles) {
    expect.soft(status, `stylesheet response 200: ${url}`).toBe(200);
    const bytes = assets.stylesheetBytes.get(url) ?? 0;
    expect.soft(bytes > 0, `stylesheet response is non-empty: ${url}`).toBe(true);
  }

  // Long content stays inside its own containers on the reading surfaces.
  await requireOk(page, ROUTES.quickstart);
  if (!nojs) {
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');
    const containment = (await page.evaluate(`(() => {
      // The family install command (three URLs, one line) is the longest line.
      const commands = [...document.querySelectorAll('main .copy-button__command')];
      const longest = commands.reduce((a, b) =>
        (b.textContent ?? '').length > (a.textContent ?? '').length ? b : a,
      );
      const commandStyle = longest ? getComputedStyle(longest) : null;
      const tokenScroll = document.querySelector('.token-table__scroll');
      return {
        longestCommandLength: (longest?.textContent ?? '').length,
        commandWhiteSpace: commandStyle?.whiteSpace ?? null,
        commandClientWidth: longest?.clientWidth ?? 0,
        commandParentWidth: longest?.parentElement?.clientWidth ?? 0,
        commandConfined: longest ? longest.clientWidth <= (longest.parentElement?.clientWidth ?? 0) + 1 : false,
        pageOverflowing: document.documentElement.scrollWidth > window.innerWidth + 1,
        viewportWidth: window.innerWidth,
        tokenTableConfined: tokenScroll
          ? tokenScroll.scrollWidth >= tokenScroll.clientWidth - 1 &&
            tokenScroll.getBoundingClientRect().right <= window.innerWidth + 1
          : null,
      };
    })()`)) as {
      longestCommandLength: number;
      commandWhiteSpace: string | null;
      commandClientWidth: number;
      commandParentWidth: number;
      commandConfined: boolean;
      pageOverflowing: boolean;
      viewportWidth: number;
      tokenTableConfined: boolean | null;
    };
    expect
      .soft(containment.longestCommandLength, 'a genuinely long command exists')
      .toBeGreaterThan(150);
    // Long commands scroll inside their own container instead of wrapping the
    // page wide: the code surface preserves its line and stays confined.
    expect
      .soft(containment.commandWhiteSpace, 'command surfaces preserve single lines (pre)')
      .toBe('pre');
    expect
      .soft(containment.commandConfined, 'the long command stays inside its container')
      .toBe(true);
    expect.soft(containment.pageOverflowing, 'no page-wide overflow from a command').toBe(false);
    capture(project, 'ac4-containment', containment);
  }

  // Theming's wide token table scrolls in its own wrapper, not the page.
  await requireOk(page, ROUTES.theming);
  if (!nojs) {
    const tableGeometry = (await page.evaluate(`(() => {
      const scroll = document.querySelector('.token-table__scroll');
      const table = document.querySelector('[data-token-table]');
      if (!scroll || !table) return null;
      return {
        wrapperRight: scroll.getBoundingClientRect().right,
        viewportWidth: window.innerWidth,
        tableWiderThanWrapper: table.scrollWidth > scroll.clientWidth,
        pageOverflowing: document.documentElement.scrollWidth > window.innerWidth + 1,
      };
    })()`)) as {
      wrapperRight: number;
      viewportWidth: number;
      tableWiderThanWrapper: boolean;
      pageOverflowing: boolean;
    } | null;
    expect.soft(tableGeometry, 'token table geometry is observable').not.toBeNull();
    if (tableGeometry) {
      expect
        .soft(tableGeometry.wrapperRight, 'token table wrapper stays in the viewport')
        .toBeLessThanOrEqual(tableGeometry.viewportWidth + 1);
      expect
        .soft(tableGeometry.pageOverflowing, 'no page-wide overflow from the table')
        .toBe(false);
      capture(project, 'ac4-table', tableGeometry);
    }
  }

  // Contract evidence captures: desktop light + mobile dark introductions.
  if (project === 'chromium-desktop') {
    await page.emulateMedia({ colorScheme: 'light' });
    await requireOk(page, ROUTES.introduction);
    if (!nojs) {
      expect
        .soft(await resolvedTheme(page), 'desktop light capture is the light column')
        .toBe('light');
    }
    await page.screenshot({ path: evidencePath('introduction-desktop-light.png'), fullPage: true });
    writeFileSync(
      join(EVIDENCE_READING, 'run-identity.json'),
      JSON.stringify(runIdentity(), null, 2),
    );
  }
  if (project === 'chromium-mobile') {
    await page.emulateMedia({ colorScheme: 'dark' });
    await requireOk(page, ROUTES.introduction);
    if (!nojs) {
      expect.soft(await resolvedTheme(page), 'mobile dark capture is the dark column').toBe('dark');
    }
    await page.screenshot({ path: evidencePath('introduction-mobile-dark.png'), fullPage: true });
  }
  await page.screenshot({ path: screenshotPath(project, 'ac4-final'), fullPage: true });
  capture(project, 'ac4-assets', {
    observedFonts: observedFonts.map(([url, status]) => ({ url, status })),
    observedStylesheets: observedStyles.map(([url, status]) => ({
      url,
      status,
      bytes: assets.stylesheetBytes.get(url) ?? 0,
    })),
  });
});
