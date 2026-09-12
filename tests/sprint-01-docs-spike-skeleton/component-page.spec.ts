import { readFileSync } from 'node:fs';
import { expect, type TestInfo, test } from '@playwright/test';
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
 * FUSE-07 — generated component reference pages + lean /components index,
 * served by the real `astro preview` over dist via `pnpm e2e:docs`.
 *
 * FLOW-GEND-14-reference-page-anatomy (AC-1): header/chips anatomy on
 *   /components/conversation, then the same anatomy looped over all 39
 *   registry:component pages, then >=5 sampled Code views byte-compared
 *   against the same-origin served /r/nativewind/{item}.json.
 * FLOW-GEND-15-family-pager-stays-in-family (AC-2): a next-link walk per
 *   component family must visit exactly the family's member set and never
 *   cross families; every pager href serves 200.
 * FUSE-07-components-index (AC-3): the /components index anchors all 56
 *   names exactly once across the families.json sections; the 39 component
 *   links all serve 200.
 *
 * Every assertion is server-rendered DOM or an API-context fetch — nothing
 * here needs page JS, so all three tests stay UNGUARDED and the chromium-nojs
 * project proves the zero-JS form rather than skipping it.
 */

interface SourceFile {
  filename: string;
  text: string;
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

const INSTALL_SECTION = 'main > section[data-section="install"]';
const SOURCE_CODE = 'section[data-section="source"] pre code';
const PAGER = 'nav[aria-label="Family pager"]';

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
    conversation.expoGo ? 'Expo Go' : 'Dev client',
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

    // Full untruncated source: a Code view per source file, and the served
    // HTML itself carries no max-height anywhere to clip it.
    expect(await page.locator(SOURCE_CODE).count(), item.name).toBe(item.sourceFiles.length);
    const html = (await response?.text()) ?? '';
    expect(html, `${item.name} must not height-limit its Code view`).not.toMatch(/max-height/i);

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
      }
    }

    await page.screenshot({ path: evidencePath(testInfo, 'family-pager'), fullPage: true });
  });

  test('FUSE-07-components-index — lean index anchors all 56 names exactly once', async ({
    page,
    request,
  }, testInfo) => {
    const response = await page.goto(`${PREVIEW_URL}/components`);
    expect(response?.status(), '/components must serve 200').toBe(200);

    const sections = page.locator('main > section[id]');
    expect(await sections.count(), 'one anchored section per family').toBe(families.length);

    const seen = new Map<string, number>();
    for (const family of families) {
      const section = page.locator(`main > section[id="${family.id}"]`);
      expect(await section.count(), `section #${family.id}`).toBe(1);
      const texts = (await section.locator('ul li').allTextContents()).map((text) => text.trim());
      expect(texts, `${family.id} members in families.json order`).toEqual(family.itemNames);
      for (const text of texts) seen.set(text, (seen.get(text) ?? 0) + 1);
    }

    const allNames = items.map((item) => item.name);
    expect([...seen.keys()].sort(), 'exactly the 56 registry names').toEqual([...allNames].sort());
    expect(
      [...seen.values()].every((count) => count === 1),
      'every name appears exactly once',
    ).toBe(true);

    // The 39 component names link their page; ui/lib names stay anchor rows.
    for (const name of componentNames) {
      const link = page.locator(`main a[href="/components/${name}"]`);
      expect(await link.count(), `${name} link`).toBe(1);
      expect((await link.textContent())?.trim(), `${name} link text`).toBe(name);
    }
    for (const item of items.filter((entry) => entry.type !== 'registry:component')) {
      expect(
        await page.locator(`main a[href="/components/${item.name}"]`).count(),
        `${item.name} must not link a component page`,
      ).toBe(0);
    }
    for (const name of componentNames) {
      const linkResponse = await request.get(`${PREVIEW_URL}/components/${name}`);
      expect(linkResponse.status(), `/components/${name}`).toBe(200);
    }

    await page.screenshot({ path: evidencePath(testInfo, 'components-index'), fullPage: true });
  });
});
