import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { resolveRegistryDependencies } from '../../apps/docs/src/lib/resolve-deps';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * SHELL-008 — item pages over the REAL built site served by the FUSE-10
 * runner (`pnpm e2e:docs`: ordered build chain, then astro preview over dist).
 *
 * FLOW-GEND-20-exact-absolute-url-command-copy (AC-1/AC-2/AC-3):
 *   1. /components/conversation anatomy: install is the first
 *      main>section[data-section], the tab group carries storage-key
 *      rnr-engine with BOTH engines' full absolute-URL commands
 *      server-rendered (nativewind panel first), and the dependencies
 *      section equals the dataset arrays resolved per engine through the
 *      real resolve-deps.ts plus the site-facts.json peers line.
 *   2. The same contracts looped over all 39 generated component pages,
 *      each rendering inside DocsLayout (header + footer present) with no
 *      {engine}/{version} template, no max-height, and exactly two command
 *      lines (no stacked un-tabbed duplicates).
 *   3. message (empty dependencies[]) renders the explicit empty state while
 *      still listing its resolved registryDependencies[].
 *   4. layouts/spike.astro is deleted with no remaining importer — the
 *      page tree imports DocsLayout only.
 *
 * Every expectation is computed from the REAL artifacts at run time — never
 * hand-copied literals — so a fixture edit moves the panel with it. Every
 * assertion reads server-rendered DOM or served bytes (no page JS), so the
 * test stays UNGUARDED and the chromium-nojs project proves the zero-JS form.
 */

/** Read a spec fixture, bridging the deliv-03 mid-run regeneration window. */
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

interface ItemEntry {
  name: string;
  type: string;
  registryDependencies: string[];
  dependencies: string[];
}
interface SiteFacts {
  aiSdkPeers: { name: string; range: string }[];
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const facts = readJson<SiteFacts>('../../apps/docs/src/data/site-facts.json');
const { version: VERSION } = readJson<{ version: string }>('../../package.json');

const components = items.filter((item) => item.type === 'registry:component');

/** The pinned canonical origin — Astro.site in apps/docs/astro.config.mjs. */
const SITE = 'https://rnraielements.com';
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';

const INSTALL_SECTION = 'main > section[data-section="install"]';
const DEPENDENCIES_SECTION = 'main > section[data-section="dependencies"]';

/** Every .astro/.ts/.js source under apps/docs/src, as absolute paths. */
function docsSources(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...docsSources(path));
    else if (/\.(astro|ts|js|mjs)$/.test(entry.name)) found.push(path);
  }
  return found;
}

test('FLOW-GEND-20-exact-absolute-url-command-copy', async ({ page }, testInfo) => {
  // CASE 1 — conversation: tabbed install first, data-verbatim dependencies.
  const conversation = components.find((item) => item.name === 'conversation');
  if (!conversation) throw new Error('registry-items.json has no `conversation` entry');
  const first = await navigateLocalhost(page, '/components/conversation');
  expect(first?.status(), '/components/conversation must serve 200').toBe(200);

  const install = page.locator(INSTALL_SECTION);
  await expect(page.locator('main > section[data-section]').nth(0)).toHaveAttribute(
    'data-section',
    'install',
  );
  const tabGroup = install.locator('rnr-tab-group[storage-key="rnr-engine"]');
  await expect(tabGroup).toHaveCount(1);
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panel = install.locator(`[role="tabpanel"][data-engine="${engine}"]`);
    await expect(panel.locator('rnr-copy-button code')).toHaveText(
      `${CLI_PREFIX}${SITE}/r/${engine}/conversation.json`,
    );
    await expect(panel.locator('rnr-copy-button button')).toHaveCount(1);
  }
  await expect(install.locator('[role="tabpanel"][data-engine="nativewind"]')).toBeVisible();

  // Dependencies section equals the resolver output per engine + the peers line.
  const dependencies = page.locator(DEPENDENCIES_SECTION);
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const expected = resolveRegistryDependencies(
      conversation.registryDependencies,
      engine,
      VERSION,
    );
    const table = dependencies.locator(`tbody[data-engine-urls="${engine}"]`);
    expect(await table.locator('code').allTextContents(), `${engine} resolved URLs`).toEqual(
      expected,
    );
  }
  for (const peer of facts.aiSdkPeers) {
    await expect(dependencies).toContainText(`${peer.name}@${peer.range}`);
  }

  await page.screenshot({
    path: `.tmp/SHELL-008/evidence/${testInfo.project.name}-conversation.png`,
    fullPage: true,
  });

  // CASE 2 — the same contracts on every generated component page.
  for (const item of components) {
    const response = await page.goto(`${PREVIEW_URL}/components/${item.name}`);
    expect(response?.status(), item.name).toBe(200);
    const html = (await response?.text()) ?? '';

    // Install first; exactly two command lines; tabbed; no stacking.
    // (The repo tsconfig carries no DOM lib — type the one dataset access.)
    const sections = await page
      .locator('main > section[data-section]')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) => (node as unknown as { dataset: Record<string, string> }).dataset.section ?? '',
        ),
      );
    expect(sections[0], `${item.name}: first data-section`).toBe('install');
    expect(html.split(CLI_PREFIX).length - 1, `${item.name}: command-line count`).toBe(2);
    expect(html, `${item.name}: storage-key`).toContain('storage-key="rnr-engine"');
    expect(html, `${item.name}: un-tabbed .install-row duplicates`).not.toContain('install-row');
    expect(html, `${item.name}: {engine} template`).not.toContain('{engine}');
    expect(html, `${item.name}: {version} template`).not.toContain('{version}');
    expect(html, `${item.name}: must not height-limit content`).not.toMatch(/max-height/i);

    // DocsLayout adoption: the shell chrome is present on every item page.
    expect(
      await page.locator('body header').count(),
      `${item.name}: DocsLayout header`,
    ).toBeGreaterThan(0);
    expect(
      await page.locator('body footer').count(),
      `${item.name}: DocsLayout footer`,
    ).toBeGreaterThan(0);

    // Dependencies: resolver equality per engine + peers line on every page.
    const pageDeps = page.locator(DEPENDENCIES_SECTION);
    await expect(pageDeps, `${item.name}: dependencies section present`).toHaveCount(1);
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const expected = resolveRegistryDependencies(item.registryDependencies, engine, VERSION);
      expect(expected.length, `${item.name} fixture sanity`).toBeGreaterThan(0);
      const table = pageDeps.locator(`tbody[data-engine-urls="${engine}"]`);
      expect(await table.locator('code').allTextContents(), `${item.name} ${engine}`).toEqual(
        expected,
      );
    }
    for (const peer of facts.aiSdkPeers) {
      await expect(pageDeps, `${item.name} peers`).toContainText(`${peer.name}@${peer.range}`);
    }

    // Empty dependencies[] renders the explicit empty state; non-empty renders
    // exactly the dataset's npm names and nothing else.
    if (item.dependencies.length === 0) {
      await expect(pageDeps.locator('[data-deps-empty]'), item.name).toHaveCount(1);
      await expect(pageDeps.locator('[data-deps-packages]'), item.name).toHaveCount(0);
    } else {
      await expect(pageDeps.locator('[data-deps-empty]'), item.name).toHaveCount(0);
      const names = await pageDeps.locator('[data-deps-packages] li code').allTextContents();
      expect(names, `${item.name}: npm dependency rows`).toEqual([...item.dependencies]);
    }
  }

  // CASE 3 — message: explicit empty state + resolved registry URLs.
  const message = components.find((item) => item.name === 'message');
  if (!message) throw new Error('registry-items.json has no `message` entry');
  expect(message.dependencies, 'message ships no npm dependencies').toEqual([]);
  await navigateLocalhost(page, '/components/message');
  await expect(page.locator(`${DEPENDENCIES_SECTION} [data-deps-empty]`)).toContainText(
    'No required npm packages',
  );
  await expect(
    page.locator(`${DEPENDENCIES_SECTION} tbody[data-engine-urls="nativewind"] code`),
  ).toContainText(`${SITE}/r/nativewind/avatar.json`);

  // CASE 4 — spike.astro is retired: the file is gone, no importer remains.
  const docsSrc = join(fileURLToPath(new URL('../../', import.meta.url)), 'apps/docs/src');
  expect(
    existsSync(join(docsSrc, 'layouts/spike.astro')),
    'apps/docs/src/layouts/spike.astro must not exist',
  ).toBe(false);
  const importers = docsSources(docsSrc).filter((path) =>
    readFileSync(path, 'utf8').includes('layouts/spike'),
  );
  expect(importers, 'no source may still import layouts/spike').toEqual([]);
});
