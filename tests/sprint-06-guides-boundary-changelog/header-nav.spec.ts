import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * GBC-013 — header/footer section-nav wiring over the REAL built docs preview
 * on localhost:4321. Two claims, one per project:
 *
 *   GBC-013-header-section-links (chromium-desktop) — on /, /docs/installation
 *     and /guides the desktop header shows exactly the five section links
 *     (Components, Registry, Guides, Porting, Changelog) in that order, every
 *     href answers 200, and footer nav[aria-label="Footer"] carries the same
 *     five hrefs in the same order.
 *   GBC-013-drawer-section-links (chromium-mobile) — below the 64rem
 *     breakpoint, where the desktop nav is hidden, the zero-JS <details>
 *     drawer opens with ONE click and shows the same five links in the same
 *     order, each answering 200; tapping Porting lands on /porting.
 *
 * Nothing is mocked: both NAV_LINKS consumers (desktop nav and drawer) are
 * read as rendered, so a divergent hand-authored drawer list fails AC-2 while
 * a 2-link NAV_LINKS fails both. Every status check is a real HTTP request
 * against the preview origin; the drawer interaction is the native <details>
 * toggle (zero JS, no island).
 */

const repoRoot = join(fileURLToPath(new URL('../..', import.meta.url)));

/** The five-section set in the locked nav order (Components, Registry, Guides,
 * Porting, Changelog) — the ONE list both the desktop header and the footer
 * must carry, and both NAV_LINKS consumers must render identically. */
const SECTION_LINKS = [
  { href: '/components', label: 'Components' },
  { href: '/registry', label: 'Registry' },
  { href: '/guides', label: 'Guides' },
  { href: '/porting', label: 'Porting' },
  { href: '/changelog', label: 'Changelog' },
] as const;

const SECTION_HREFS = SECTION_LINKS.map((link) => link.href);
const SECTION_LABELS = SECTION_LINKS.map((link) => link.label);

/** The three pages the claims are read on (AC-1/AC-2 GIVEN). */
const PAGES = ['/', '/docs/installation', '/guides'] as const;

const SCREEN_DIR_REL = '.tmp/GBC-013/e2e-evidence/screens';

async function capture(page: Page, testInfo: TestInfo, slug: string): Promise<string> {
  const relative = `${SCREEN_DIR_REL}/${testInfo.project.name}--${slug}.png`;
  mkdirSync(join(repoRoot, SCREEN_DIR_REL), { recursive: true });
  await page.screenshot({ path: join(repoRoot, relative) });
  return relative;
}

/** textContent (never innerText) of every anchor, trimmed — hidden elements
 * still report text, so the count assertions below do the visibility work. */
async function linkTexts(links: ReturnType<Page['locator']>): Promise<string[]> {
  return (await links.allTextContents()).map((text) => text.trim());
}

/** getAttribute returns null for a missing href — kept in the type on purpose:
 * a null href fails the toEqual order assertions below (MUST_NOT_OBSERVE). */
async function linkHrefs(links: ReturnType<Page['locator']>): Promise<(string | null)[]> {
  const handles = await links.all();
  return Promise.all(handles.map((handle) => handle.getAttribute('href')));
}

test('GBC-013-header-section-links: the desktop header and the footer carry the five section links, each resolving 200', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop', 'AC-1 is a chromium-desktop claim');

  const headerLinks = page.locator('.site-header__nav a');
  const footerLinks = page.locator('nav[aria-label="Footer"] a');
  const pageStatuses: Record<string, number | null> = {};

  for (const path of PAGES) {
    const response = await navigateLocalhost(page, path);
    pageStatuses[path] = response?.status() ?? null;

    expect(await headerLinks.count(), `header anchors on ${path}`).toBe(SECTION_LINKS.length);
    expect(await linkTexts(headerLinks), `header link text order on ${path}`).toEqual(
      SECTION_LABELS,
    );
    expect(await linkHrefs(headerLinks), `header href order on ${path}`).toEqual(SECTION_HREFS);
  }

  for (const [path, status] of Object.entries(pageStatuses)) {
    expect(status, `${path} must return HTTP 200`).toBe(200);
  }

  // Every header href (plus the site root) answers 200 over real HTTP.
  const probeTargets = ['/', ...SECTION_HREFS];
  for (const target of probeTargets) {
    const probe = await request.get(new URL(target, PREVIEW_URL).href);
    expect(probe.status(), `${target} must answer HTTP 200`).toBe(200);
  }

  // Footer (read on /): the same five hrefs in the same order.
  await navigateLocalhost(page, '/');
  expect(await footerLinks.count(), 'footer anchors on /').toBe(SECTION_LINKS.length);
  expect(await linkHrefs(footerLinks), 'footer href order on /').toEqual(SECTION_HREFS);

  const screenshot = await capture(page, testInfo, 'header-on-guides');
  expect(screenshot, 'header screenshot captured on /guides').toContain('.png');
});

test('GBC-013-drawer-section-links: the mobile drawer opens with one click and carries the same five links, each resolving 200', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-mobile', 'AC-2 is a chromium-mobile claim');

  const desktopNav = page.locator('.site-header__nav');
  const drawer = page.locator('details.site-drawer');
  const drawerToggle = page.locator('summary.site-drawer__toggle');
  const drawerLinks = page.locator('.site-drawer__nav a');
  const renderedHrefs: (string | null)[] = [];

  for (const path of PAGES) {
    const response = await navigateLocalhost(page, path);
    expect(response?.status(), `${path} must return HTTP 200`).toBe(200);

    // Below 64rem the desktop nav is hidden and the drawer takes over.
    await expect(desktopNav, `desktop nav hidden on ${path}`).toBeHidden();

    await drawerToggle.click();
    expect(await drawer.getAttribute('open'), `drawer open after 1 click on ${path}`).toBe('');

    expect(await drawerLinks.count(), `drawer anchors on ${path}`).toBe(SECTION_LINKS.length);
    expect(await linkTexts(drawerLinks), `drawer link text order on ${path}`).toEqual(
      SECTION_LABELS,
    );
    const hrefs = await linkHrefs(drawerLinks);
    expect(hrefs, `drawer href order on ${path}`).toEqual(SECTION_HREFS);
    for (const link of await drawerLinks.all()) {
      await expect(link, `drawer anchor visible on ${path}`).toBeVisible();
    }
    renderedHrefs.length = 0;
    renderedHrefs.push(...hrefs);
  }

  // Every drawer href answers 200 over real HTTP. A null href fails loudly —
  // the MUST_NOT_OBSERVE bar rejects empty/missing hrefs outright.
  for (const href of renderedHrefs) {
    if (href === null) throw new Error('drawer rendered a null href');
    const probe = await request.get(new URL(href, PREVIEW_URL).href);
    expect(probe.status(), `drawer href ${href} must answer HTTP 200`).toBe(200);
  }

  // Tapping Porting navigates the MPA way and lands on /porting with 200.
  const portingResponse = page.waitForResponse(
    (candidate) => new URL(candidate.url()).pathname === '/porting',
  );
  await page.locator('.site-drawer__nav a', { hasText: 'Porting' }).click();
  expect((await portingResponse).status(), '/porting must answer HTTP 200').toBe(200);
  // The response settles before the browser commits the navigation; toHaveURL
  // waits for the commit instead of racing it.
  await expect(page).toHaveURL(new URL('/porting', PREVIEW_URL).href);

  // The drawer was left open on /guides above; reopen for the evidence shot.
  await navigateLocalhost(page, '/guides');
  await drawerToggle.click();
  await expect(drawer).toHaveAttribute('open', '');
  const screenshot = await capture(page, testInfo, 'drawer-open-on-guides');
  expect(screenshot, 'open drawer screenshot captured on /guides').toContain('.png');
});
