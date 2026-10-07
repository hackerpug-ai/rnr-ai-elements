import { readFileSync } from 'node:fs';
import { expect, type Page, type TestInfo, test } from '@playwright/test';
// REF-004's seam derivation — the item pages render one seam Callout per
// derived kind, so the expected count joins the same pure module the page uses.
import { deriveSeams } from '../../apps/docs/src/lib/seam-map';
import { PREVIEW_URL } from '../harness/docs-preview';

/**
 * Read a spec fixture, bridging a short window if the file is transiently
 * absent. During full-chain runs an out-of-repo process briefly removes the
 * generated data artifacts (and even committed files) from the worktree for
 * seconds at a time, which otherwise fails collection spuriously. A genuinely
 * missing or stale artifact still fails after the deadline.
 */
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

/**
 * FUSE-07 — generated component reference pages + the /components family card
 * grid, served by the real `astro preview` over dist via `pnpm e2e:docs`.
 *
 * FLOW-GEND-14-reference-page-anatomy (AC-1): header/chips anatomy on
 *   /components/conversation, then the same anatomy looped over all 39
 *   registry:component pages, then >=5 sampled Code views byte-compared
 *   against the same-origin served /r/nativewind/{item}.json.
 * FLOW-GEND-15-family-pager-stays-in-family (AC-2): a next-link walk per
 *   component family must visit exactly the family's member set and never
 *   cross families; every pager href serves 200.
 * FUSE-07-components-index (AC-3, superseded by FAM-003): the /components
 *   index renders the seven-family card grid — exactly the all-component
 *   families in families.json order, one card per registry:component, every
 *   card href serving 200, and zero ui/lib entries.
 * FAM-003-family-grid-extras (AC-4 rendered proof): the derived jump nav, the
 *   empty mount slot above the grid, and per-card data-filter-text coverage.
 *
 * Every assertion is server-rendered DOM or an API-context fetch — nothing
 * here needs page JS, so all three tests stay UNGUARDED and the chromium-nojs
 * project proves the zero-JS form rather than skipping it.
 */

interface SourceFile {
  filename: string;
  text: string;
}

interface PropRow {
  name: string;
  type: string;
  default: string | null;
  description: string | null;
}

interface Item {
  name: string;
  title: string;
  description: string;
  type: string;
  engines: string[];
  expoGo: boolean;
  family: string;
  sourceFiles: SourceFile[];
  // REF-008's 16-key contract tail — the regions REF-009 renders.
  props: PropRow[];
  themingNote: string;
  usageSnippet: string;
  qrDeepLink: string;
  metaDescription: string;
}

interface Family {
  id: string;
  title: string;
  order: number;
  itemNames: string[];
}

const items = readJson<Item[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');
const { version: VERSION } = readJson<{ version: string }>('../../package.json');

const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
const componentFamilies = families.filter((family) =>
  family.itemNames.every((name) => componentNames.has(name)),
);

/** The pinned canonical origin — the page composes absolute-URL commands from Astro.site. */
const SITE = 'https://rnraielements.com';

const commandFor = (engine: string, name: string): string =>
  `npx @react-native-reusables/cli@latest add ${SITE}/r/${engine}/${name}.json`;

// REF-009 — the five top-level regions the TR-07 anatomy pins (dependencies
// keeps its data-verbatim section between install and source; the order below
// is the filtered subsequence every page must render, in full and in order).
const EXPECTED_REGIONS = ['install', 'source', 'props', 'theming', 'usage'];

const INSTALL_SECTION = 'main > section[data-section="install"]';
// REF-009 re-pin: the source figures compose the CodeBlock primitive now —
// the byte surface is the island's server-rendered <code> child (one per
// source file), which the count and byte-compare assertions below address.
const SOURCE_CODE = 'section[data-section="source"] rnr-copy-button code';
const PROPS_TABLE_ROWS = 'section[data-section="props"] table.props-table tbody tr';
const THEMING_NOTE = 'section[data-section="theming"] .theming-note';
const USAGE_CODE = 'section[data-section="usage"] rnr-copy-button code';
const QR_PANEL = '[data-qr-panel]';
// R11 seam callouts are direct children of main; DependencyPanel's own
// empty-deps callout nests inside the dependencies section and stays excluded.
const SEAM_CALLOUTS = 'main.component-page > aside.callout';
const PAGER = 'nav[aria-label="Family pager"]';

/**
 * The data-section order of the current page, filtered to the five asserted
 * regions — the dependencies data-verbatim panel renders between install and
 * source without entering this five-name contract.
 */
async function regionOrder(page: Page): Promise<string[]> {
  const names = await page
    .locator('main > section[data-section]')
    .evaluateAll((nodes) =>
      nodes.map(
        (node) => (node as unknown as { dataset: Record<string, string> }).dataset.section ?? '',
      ),
    );
  return names.filter((name) => EXPECTED_REGIONS.includes(name));
}

function evidencePath(testInfo: TestInfo, slug: string): string {
  return `.tmp/FUSE-07/evidence/${testInfo.project.name}-${slug}.png`;
}

test('FLOW-GEND-14-reference-page-anatomy — conversation anatomy, all 39 pages, byte-matched source', async ({
  page,
}, testInfo) => {
  const conversation = components.find((item) => item.name === 'conversation');
  if (!conversation) throw new Error('registry-items.json has no `conversation` entry');

  // CASE 1 — full anatomy on /components/conversation
  const first = await page.goto(`${PREVIEW_URL}/components/conversation`);
  expect(first?.status(), '/components/conversation must serve 200').toBe(200);
  await expect(page.locator('main h1')).toHaveText(conversation.title);
  await expect(page.locator('main p.item-description')).toHaveText(conversation.description);

  await expect(page.locator('li[data-chip="version"]')).toContainText(VERSION);
  await expect(page.locator('li[data-chip="category"]')).toHaveText(
    conversation.type.replace('registry:', ''),
  );
  const engineChips = page.locator('li[data-chip="engine"]');
  await expect(engineChips).toHaveText(conversation.engines);
  await expect(page.locator('li[data-chip="expo"]')).toHaveText(
    conversation.expoGo ? 'runs in Expo Go' : 'requires a dev client',
  );

  const install = page.locator(INSTALL_SECTION);
  // SHELL-008 supersede: the install block is the SHELL-004 engine-tabbed
  // composite now — both panels stay server-rendered (hidden attribute only),
  // so the selectors address each engine's tabpanel directly.
  const nativewindRow = install.locator('[role="tabpanel"][data-engine="nativewind"]');
  const uniwindRow = install.locator('[role="tabpanel"][data-engine="uniwind"]');
  await expect(nativewindRow.locator('rnr-copy-button code')).toHaveText(
    commandFor('nativewind', 'conversation'),
  );
  await expect(nativewindRow.locator('rnr-copy-button button')).toHaveCount(1);
  await expect(uniwindRow.locator('rnr-copy-button code')).toHaveText(
    commandFor('uniwind', 'conversation'),
  );
  await expect(uniwindRow.locator('rnr-copy-button button')).toHaveCount(1);
  await expect(install.locator('rnr-tab-group[storage-key="rnr-engine"]')).toHaveCount(1);

  // REF-009 — the five-region anatomy on the conversation page: the filtered
  // section order must equal the five asserted regions in this exact order
  // (dependencies keeps its data-verbatim slot between install and source).
  expect(await regionOrder(page), 'the five-region anatomy order').toEqual([
    'install',
    'source',
    'props',
    'theming',
    'usage',
  ]);
  expect(await page.locator(PROPS_TABLE_ROWS).count(), 'conversation prop rows').toBe(
    conversation.props.length,
  );
  expect(await page.locator(THEMING_NOTE).count(), 'one theming note').toBe(1);
  await expect(page.locator(THEMING_NOTE)).toContainText(conversation.themingNote.slice(0, 24));
  expect(await page.locator(USAGE_CODE).count(), 'one usage snippet block').toBe(1);
  await expect(page.locator(USAGE_CODE)).toHaveText(conversation.usageSnippet);
  // R6b — the QR aside renders the build-time deep-link SVG, and the Layout
  // carries the dataset-derived meta description.
  expect(await page.locator(QR_PANEL).count(), 'one QR aside').toBe(1);
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute(
    'content',
    conversation.metaDescription,
  );
  // R11 — seam callouts join REF-004's derivation (conversation has none).
  expect(await page.locator(SEAM_CALLOUTS).count(), 'conversation seam callouts').toBe(
    deriveSeams(conversation.sourceFiles).length,
  );

  await page.screenshot({ path: evidencePath(testInfo, 'conversation-anatomy'), fullPage: true });

  // CASE 2 — the same anatomy on every generated component page
  for (const item of components) {
    const response = await page.goto(`${PREVIEW_URL}/components/${item.name}`);
    expect(response?.status(), item.name).toBe(200);
    await expect(page.locator('main h1'), item.name).toHaveText(item.title);
    const description = (await page.locator('main p.item-description').textContent()) ?? '';
    expect(description.trim(), `${item.name} description`).toBe(item.description);

    expect(await page.locator('li[data-chip="version"]').count(), item.name).toBe(1);
    expect(await page.locator('li[data-chip="category"]').count(), item.name).toBe(1);
    expect(await page.locator('li[data-chip="engine"]').count(), item.name).toBe(
      item.engines.length,
    );
    expect(await page.locator('li[data-chip="expo"]').count(), item.name).toBe(1);

    // Install block FIRST in DOM order, both engine commands with copy buttons.
    await expect(page.locator('main > section[data-section]').nth(0), item.name).toHaveAttribute(
      'data-section',
      'install',
    );
    const commands = page.locator(`${INSTALL_SECTION} rnr-copy-button code`);
    expect(await commands.count(), item.name).toBe(2);
    await expect(commands.nth(0)).toHaveText(commandFor('nativewind', item.name));
    await expect(commands.nth(1)).toHaveText(commandFor('uniwind', item.name));

    // REF-009 — the five-region anatomy on every generated page.
    expect(await regionOrder(page), `${item.name} region order`).toEqual(EXPECTED_REGIONS);

    // Full untruncated source: a CodeBlock code surface per source file, and
    // the served HTML itself carries no max-height anywhere to clip it.
    expect(await page.locator(SOURCE_CODE).count(), item.name).toBe(item.sourceFiles.length);
    const html = (await response?.text()) ?? '';
    expect(html, `${item.name} must not height-limit its Code view`).not.toMatch(/max-height/i);

    // REF-009 — the R8/R9/R10 regions render the dataset verbatim, with the
    // QrPanel aside (R6b), the head meta description, and the derived seam
    // callouts (R11) completing the anatomy.
    expect(await page.locator(PROPS_TABLE_ROWS).count(), `${item.name} prop rows`).toBe(
      item.props.length,
    );
    expect(await page.locator(THEMING_NOTE).count(), `${item.name} theming note`).toBe(1);
    expect(await page.locator(USAGE_CODE).count(), `${item.name} usage snippet`).toBe(1);
    expect(await page.locator(QR_PANEL).count(), `${item.name} QR aside`).toBe(1);
    expect(
      await page.locator('head meta[name="description"]').getAttribute('content'),
      `${item.name} meta description`,
    ).toBe(item.metaDescription);
    expect(await page.locator(SEAM_CALLOUTS).count(), `${item.name} seam callouts`).toBe(
      deriveSeams(item.sourceFiles).length,
    );

    // NO-IMAGERY sprint subset: 0 preview panels, 0 placeholder stand-ins.
    // Bare /placeholder/ would false-positive on real shipped source — the
    // TextInput `placeholder` prop appears verbatim in 8 components' code.
    expect(await page.locator('[data-preview-panel]').count(), item.name).toBe(0);
    const mainText = (await page.locator('main.component-page').innerText()) ?? '';
    expect(mainText, `${item.name} placeholder stand-in`).not.toMatch(
      /coming soon|lorem ipsum|placeholder\s+(box|panel|image|preview)|preview\s+placeholder/i,
    );
  }

  // CASE 3 — sampled Code views byte-match the same-origin served registry JSON
  const sampledNames = [
    ...new Set([
      'conversation',
      ...components.filter((_, index) => index % 8 === 0).map((item) => item.name),
    ]),
  ];
  expect(sampledNames.length, 'at least 5 sampled pages').toBeGreaterThanOrEqual(5);
  for (const name of sampledNames) {
    const item = components.find((entry) => entry.name === name);
    if (!item) throw new Error(`registry-items.json has no \`${name}\` entry`);
    await page.goto(`${PREVIEW_URL}/components/${name}`);
    const rendered = await page.locator(SOURCE_CODE).allTextContents();
    const registry = await page.request.get(`${PREVIEW_URL}/r/nativewind/${name}.json`);
    expect(registry.status(), name).toBe(200);
    const served = (await registry.json()) as { name: string; files: { content: string }[] };
    expect(served.name, name).toBe(name);
    expect(served.files.length, `${name} served files`).toBeGreaterThan(0);
    expect(rendered.length, `${name} rendered Code views`).toBe(served.files.length);
    for (let index = 0; index < rendered.length; index++) {
      expect(rendered[index], `${name} source file #${index} byte-match`).toBe(
        served.files[index].content,
      );
    }
  }
});

test.describe('FLOW-GEND-15-family-pager-stays-in-family', () => {
  test('family pager walks each component family exactly', async ({ page, request }, testInfo) => {
    expect(componentFamilies.length, 'the 7 component families').toBe(7);

    for (const family of componentFamilies) {
      const members = family.itemNames;
      await page.goto(`${PREVIEW_URL}/components/${members[0]}`);

      // Walk next-links until the cycle closes back on the first member (the
      // last member wraps to the family's first) or the affordance is omitted.
      const visited: string[] = [];
      for (let step = 0; step <= members.length; step++) {
        const slug = page.url().split('/components/')[1] ?? '';
        visited.push(slug);
        if (visited.length > 1 && slug === members[0]) break;
        const nextLink = page.locator(`${PAGER} a[rel="next"]`);
        const href = await nextLink.getAttribute('href');
        if (href === null) break;
        expect(href.startsWith('/components/'), `pager href form: ${href}`).toBe(true);
        const target = href.replace('/components/', '');
        expect(members, `next from ${slug} must stay in family ${family.id}`).toContain(target);
        const linkResponse = await request.get(`${PREVIEW_URL}${href}`);
        expect(linkResponse.status(), href).toBe(200);
        await page.goto(`${PREVIEW_URL}${href}`);
      }
      expect(new Set(visited), `${family.id} walk covers exactly its members`).toEqual(
        new Set(members),
      );
      expect(visited.length, `${family.id} walk length`).toBeLessThanOrEqual(members.length + 1);
    }

    // Both directions on all 39 pages: no prev or next link may cross families.
    for (const family of componentFamilies) {
      for (const member of family.itemNames) {
        await page.goto(`${PREVIEW_URL}/components/${member}`);
        for (const rel of ['prev', 'next'] as const) {
          const href = await page.locator(`${PAGER} a[rel="${rel}"]`).getAttribute('href');
          const target = href?.replace('/components/', '') ?? '';
          expect(family.itemNames, `${member} ${rel} -> ${target} stays in ${family.id}`).toContain(
            target,
          );
        }
        // REF-009 — the pager closes the extended anatomy: exactly one nav,
        // rendered after the usage region, with the five regions before it.
        expect(await page.locator(PAGER).count(), `${member} pager count`).toBe(1);
        expect(
          await page.locator('section[data-section="usage"] ~ nav.pager').count(),
          `${member} pager placement`,
        ).toBe(1);
        expect(await regionOrder(page), `${member} region order`).toEqual(EXPECTED_REGIONS);
      }
    }

    await page.screenshot({ path: evidencePath(testInfo, 'family-pager'), fullPage: true });
  });

  test('FUSE-07-components-index — /components renders the seven-family card grid', async ({
    page,
    request,
  }, testInfo) => {
    const response = await page.goto(`${PREVIEW_URL}/components`);
    expect(response?.status(), '/components must serve 200').toBe(200);

    // One anchored section per all-component family, in families.json order.
    const sections = page.locator('main section[id]');
    expect(await sections.count(), 'one anchored section per component family').toBe(
      componentFamilies.length,
    );
    const sectionIds: string[] = [];
    for (let index = 0; index < componentFamilies.length; index++) {
      sectionIds.push((await sections.nth(index).getAttribute('id')) ?? '');
    }
    expect(sectionIds, 'sections in committed families.json order').toEqual(
      componentFamilies.map((family) => family.id),
    );

    // The card multiset: every registry:component renders exactly one card.
    const hrefs: string[] = [];
    for (const family of componentFamilies) {
      const cards = page.locator(`main section[id="${family.id}"] a[data-card]`);
      expect(await cards.count(), `${family.id} renders one card per member`).toBe(
        family.itemNames.length,
      );
      for (const card of await cards.all()) {
        hrefs.push((await card.getAttribute('href')) ?? '');
      }
    }
    const slugs = hrefs.map((href) => href.replace('/components/', ''));
    expect(hrefs.length, 'one card per registry:component').toBe(components.length);
    expect([...slugs].sort(), 'card names equal the registry:component names').toEqual(
      components.map((item) => item.name).sort(),
    );

    // 0 ui/lib entries: no ui/lib name renders a card, a link, or a section.
    for (const item of items.filter((entry) => entry.type !== 'registry:component')) {
      expect(
        await page.locator(`main a[href="/components/${item.name}"]`).count(),
        `${item.name} must not render`,
      ).toBe(0);
      expect(
        await page.locator(`main section[id="${item.family}"]`).count(),
        `${item.family} family must not render`,
      ).toBe(0);
    }

    // Every card href resolves to its real page.
    for (const href of hrefs) {
      const linkResponse = await request.get(`${PREVIEW_URL}${href}`);
      expect(linkResponse.status(), href).toBe(200);
    }

    await page.screenshot({ path: evidencePath(testInfo, 'components-index'), fullPage: true });
  });
});

test('FAM-003-family-grid-extras — jump nav, empty mount slot, data-filter-text coverage', async ({
  page,
}, testInfo) => {
  const response = await page.goto(`${PREVIEW_URL}/components`);
  expect(response?.status(), '/components must serve 200').toBe(200);

  // R1 jump nav: one derived anchor per component family, in families.json order.
  const jumpLinks = page.locator('nav.family-jump a');
  expect(await jumpLinks.count(), 'one jump anchor per component family').toBe(
    componentFamilies.length,
  );
  for (const [index, family] of componentFamilies.entries()) {
    const link = jumpLinks.nth(index);
    expect(await link.getAttribute('href'), `${family.id} jump anchor`).toBe(`#${family.id}`);
    expect((await link.textContent())?.trim(), `${family.id} jump label`).toBe(family.title);
  }

  // The mount slot: exactly one empty plain div, structural only, never stub
  // UI. The rnr-ledger-filter island (FAM-004's ruled, contract-locked
  // position) lawfully mounts between the slot and the grid, so precedence is
  // general-sibling — the slot precedes every family section, not merely the
  // first.
  const slot = page.locator('main div.family-grid-slot');
  expect(await slot.count(), 'exactly one mount slot above the grid').toBe(1);
  expect(
    await slot.evaluate((el) => el.children.length),
    'empty structural slot — zero element children',
  ).toBe(0);
  // GBC-013's dev-client matrix added a lawful NON-family section after the
  // grid (class only, no id); the families are the id'd sections the slot
  // still precedes.
  expect(
    await page.locator('main div.family-grid-slot ~ section[id]').count(),
    'the slot precedes every family section',
  ).toBe(componentFamilies.length);

  // data-filter-text: every card carries it, names its item, and sits in its
  // family section (the family dimension rides the section ancestor).
  const itemsByName = new Map(components.map((item) => [item.name, item]));
  const cards = page.locator('main a[data-card][data-filter-text]');
  expect(await cards.count(), 'every card carries data-filter-text').toBe(components.length);
  for (const card of await cards.all()) {
    const slug = ((await card.getAttribute('href')) ?? '').replace('/components/', '');
    const item = itemsByName.get(slug);
    expect(item, `${slug || '(no href)'} is a registry:component`).toBeTruthy();
    if (!item) continue;
    const filterText = (await card.getAttribute('data-filter-text')) ?? '';
    expect(filterText.trim().length, `${slug} filter text non-empty`).toBeGreaterThan(0);
    expect(filterText, `${slug} filter text names the card`).toContain(item.title);
    expect(
      await card.locator('xpath=ancestor::section[1]').getAttribute('id'),
      `${slug} sits in its family section`,
    ).toBe(item.family);
  }

  await page.screenshot({ path: evidencePath(testInfo, 'family-grid-extras'), fullPage: true });
});
