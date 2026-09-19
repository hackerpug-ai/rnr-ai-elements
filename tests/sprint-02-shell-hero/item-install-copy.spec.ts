import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { resolveRegistryDependencies } from '../../apps/docs/src/lib/resolve-deps';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

/**
 * SHELL-012 — owns FLOW-GEND-20 end-to-end over the real preview, extending
 * the landed SHELL-008 spec in place (same precedent as home-hero.spec.ts):
 *
 * FLOW-GEND-20-exact-absolute-url-command-copy (AC-1):
 *   1. (SHELL-008, retained) /components/conversation anatomy + the same
 *      contracts looped over every generated component page: install first,
 *      tab group under storage-key rnr-engine, both engines' absolute-URL
 *      commands server-rendered, dependencies equal to the resolver output.
 *   2. (SHELL-012) Clipboard proof on EVERY page enumerated from the dataset:
 *      one copy click per engine tab yields exactly that engine's command
 *      (locked regex, no trailing newline), success shows by VALUE within
 *      500 ms, and the displayed panel text equals the clipboard.
 *   3. (SHELL-012) Zero-JS proof: in an explicit javaScriptEnabled:false
 *      context both engines' panel text is server-rendered and selectable on
 *      every page, with exactly two command lines in the served HTML and no
 *      un-tabbed duplicate forms.
 *
 * SHELL-012-engine-follow-and-zerojs (AC-3): rnr-engine=uniwind seeded via
 *   addInitScript before any page script survives cold navigations across
 *   item pages (active tab + displayed command), the URL never carries engine
 *   state, and no page renders a second un-tabbed copy of either command.
 *
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
// The root tsconfig has no DOM lib; declare the one browser global the
// in-page clipboard assertion needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

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

/**
 * The pinned INSTALL-command origin — Astro.site in apps/docs/astro.config.mjs.
 * Install commands are the only consumers: dependency-panel URLs are
 * dataset-resolved through resolveRegistryDependencies, never this constant.
 */
const SITE = 'https://rnraielements.com';
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';

const commandFor = (engine: string, name: string): string =>
  `${CLI_PREFIX}${SITE}/r/${engine}/${name}.json`;

// The locked command shape (FLOW-GEND-20): absolute-URL, engine in the path,
// never a short-name or relative form.
const COMMAND_PATTERN =
  /^npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

const INSTALL_SECTION = 'main > section[data-section="install"]';
const DEPENDENCIES_SECTION = 'main > section[data-section="dependencies"]';

/**
 * FIX-REF-009-1: {engine}-guard exemption slice. REF-003 mandates the usage
 * section render usageSnippet byte-verbatim, and code-block + schema-display
 * legitimately document the registry-API pattern
 * `path="/r/{engine}/{item}.json"` there. Returns the page minus that single
 * exempted region, or the page unchanged when it has no usage section — the
 * guard keeps its substitution-detection teeth on every substituted surface
 * (install tabs + commands, dependencies, source, props, theming, QR/pager
 * chrome).
 */
function htmlOutsideUsageRegion(html: string, label: string): string {
  const usageStart = html.indexOf('data-section="usage"');
  if (usageStart === -1) return html;
  const usageEnd = html.indexOf('</section>', usageStart);
  expect(usageEnd, `${label}: usage section must close`).toBeGreaterThan(-1);
  return `${html.slice(0, usageStart)}${html.slice(usageEnd)}`;
}

// Evidence JSON at the locked sprint-02 path (human-flows.json artifact).
// Multiple tests contribute keyed sections; each write merges over the file's
// current contents so the one locked artifact accumulates the whole flow.
const EVIDENCE_DIR = join(process.cwd(), '.tmp/sprint-02-shell-hero/e2e-evidence');

function writeEvidence(flow: string, observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const path = join(EVIDENCE_DIR, `${flow}.json`);
  let prior: Record<string, unknown> = {};
  try {
    prior = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch {
    // First writer for this flow — nothing to merge.
  }
  writeFileSync(
    path,
    JSON.stringify({ ...prior, flow, capturedAt: new Date().toISOString(), ...observed }, null, 2),
  );
}

function projectHasNoJs(testInfo: { project: { use: { javaScriptEnabled?: boolean } } }): boolean {
  return testInfo.project.use.javaScriptEnabled === false;
}

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
    // {engine} narrowed (FIX-REF-009-1, see htmlOutsideUsageRegion): the
    // verbatim usage section is the only exempted region.
    expect(
      htmlOutsideUsageRegion(html, item.name),
      `${item.name}: {engine} template`,
    ).not.toContain('{engine}');
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
    // No per-item length sanity here (cycle-1 RED against the never-executed
    // spec): `image` legitimately ships registryDependencies: [] — the array
    // equality below is the whole oracle, empty-for-empty included.
    const pageDeps = page.locator(DEPENDENCIES_SECTION);
    await expect(pageDeps, `${item.name}: dependencies section present`).toHaveCount(1);
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const expected = resolveRegistryDependencies(item.registryDependencies, engine, VERSION);
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
  // The panel's URLs come from the dataset through the SAME resolver the page
  // frontmatter uses — first entry in dataset order is avatar.json — so this
  // expectation cannot drift when the registry's domain or version bumps.
  const messageNativewind = resolveRegistryDependencies(
    message.registryDependencies,
    'nativewind',
    VERSION,
  );
  expect(messageNativewind[0], 'message fixture sanity: avatar.json is first').toContain(
    '/nativewind/avatar.json',
  );
  await navigateLocalhost(page, '/components/message');
  await expect(page.locator(`${DEPENDENCIES_SECTION} [data-deps-empty]`)).toContainText(
    'No required npm packages',
  );
  // message lists three resolved URLs — scope to the first row (strict mode);
  // the full-array equality for every page already ran in CASE 2.
  await expect(
    page.locator(`${DEPENDENCIES_SECTION} tbody[data-engine-urls="nativewind"] code`).first(),
  ).toHaveText(messageNativewind[0]);

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

test('FLOW-GEND-20-exact-absolute-url-command-copy: per-engine clipboard on every enumerated page — exact command, success by value within 500 ms', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'clipboard assertions need a JS-enabled project; the zero-JS form has its own unguarded test below',
  );
  // 39 cold navigations x 2 engine tabs x (tab click + copy + 500 ms-window
  // value asserts + clipboard read) legitimately exceeds the 30 s default —
  // this is a budget for the contracted enumeration, never a retry.
  test.setTimeout(240_000);

  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  const page = await context.newPage();

  let copied = 0;
  const sample: Record<string, string> = {};
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    expect(response?.status(), `${item.name} must serve 200`).toBe(200);
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');

    for (const engine of ['nativewind', 'uniwind'] as const) {
      // Click the engine's tab (activation is the only path to an un-hidden
      // panel), then copy from that engine's now-active panel.
      await page.locator(`${INSTALL_SECTION} [role="tab"][data-engine="${engine}"]`).click();
      const panel = page.locator(`${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"]`);
      const displayed = ((await panel.locator('rnr-copy-button code').textContent()) ?? '').trim();
      expect(displayed, `${item.name} ${engine} displayed command`).toBe(
        commandFor(engine, item.name),
      );

      const trigger = panel.locator('rnr-copy-button button');
      await trigger.click();
      // Success shows by VALUE within 500 ms of the click — the label swap and
      // the status line, never a success class name.
      await expect(trigger).toHaveAttribute('data-state', 'copied', { timeout: 500 });
      await expect(trigger).toHaveText('Copied', { timeout: 500 });
      await expect(panel.locator('.copy-button__status')).toHaveText('Copied', {
        timeout: 500,
      });

      // Clipboard CONTENT is the oracle: exact equality (no trailing newline,
      // no short-name or relative form) plus the locked shape regex.
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboard, `${item.name} ${engine} clipboard equals displayed panel text`).toBe(
        displayed,
      );
      expect(clipboard, `${item.name} ${engine} clipboard exact command`).toBe(
        commandFor(engine, item.name),
      );
      expect(clipboard, `${item.name} ${engine} clipboard shape`).toMatch(COMMAND_PATTERN);
      copied += 1;
      if (item.name === 'shimmer') sample[engine] = clipboard;
    }
  }
  expect(copied, 'one clipboard read per engine per enumerated page').toBe(components.length * 2);

  await testInfo.attach('flow-gend-20-per-engine-clipboard', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-20-exact-absolute-url-command-copy', {
    clipboardProof: {
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      clipboardReads: copied,
      shimmerSample: sample,
    },
  });
  await context.close();
});

test("FLOW-GEND-20-exact-absolute-url-command-copy zero-JS: both engines' panel text server-rendered and selectable on every page", async ({
  browser,
}, testInfo) => {
  // Unguarded on purpose: the explicit no-JS context keeps the stacked-panels
  // observation identical in every project, and under the chromium-nojs
  // project this doubles as the project-level zero-JS proof (TC-2).
  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJsContext.newPage();

  const selectable: Record<string, string[]> = {};
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    expect(response?.status(), item.name).toBe(200);
    const html = (await response?.text()) ?? '';

    // Both engines' full commands are server-rendered, selectable text — the
    // un-upgraded tab group's :not(:defined) fallback keeps both readable.
    const engineTexts: string[] = [];
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const code = page.locator(
        `${INSTALL_SECTION} [role="tabpanel"][data-engine="${engine}"] rnr-copy-button code`,
      );
      await expect(code, `${item.name} ${engine} panel code`).toHaveCount(1);
      await expect(code, `${item.name} ${engine} selectable under zero JS`).toBeVisible();
      const text = ((await code.textContent()) ?? '').trim();
      expect(text, `${item.name} ${engine} zero-JS command`).toBe(commandFor(engine, item.name));
      engineTexts.push(text);
    }

    // Exactly two command lines in the served bytes: a short-name or relative
    // or un-tabbed duplicate form would raise the count past the tabbed pair.
    expect(html.split(CLI_PREFIX).length - 1, `${item.name} command-line count under zero JS`).toBe(
      2,
    );
    expect(html, `${item.name} no relative add form`).not.toContain('add /r/');
    expect(html, `${item.name} no un-tabbed install rows`).not.toContain('install-row');
    if (item.name === 'shimmer' || item.name === 'conversation') {
      selectable[item.name] = engineTexts;
    }
  }

  await testInfo.attach('flow-gend-20-zero-js', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-20-exact-absolute-url-command-copy', {
    zeroJsProof: {
      project: testInfo.project.name,
      pagesProbed: components.length,
      selectableCommands: selectable,
    },
  });
  await noJsContext.close();
});

test('SHELL-012-engine-follow-and-zerojs: persisted rnr-engine follows across cold navigations; zero un-tabbed duplicates on every page', async ({
  browser,
}, testInfo) => {
  test.skip(
    projectHasNoJs(testInfo),
    'seeded localStorage needs a JS-enabled project to be applied by the island',
  );
  // Budget for the contracted all-pages duplicate scan (see the clipboard
  // test above) — a runtime budget, never a retry.
  test.setTimeout(120_000);

  // The storage write runs BEFORE any page script (addInitScript), so each
  // cold navigation's first activation reads uniwind as the persisted engine.
  const context = await browser.newContext();
  await grantClipboardPermissions(context);
  await context.addInitScript(() => {
    // Browser-context callback, typed through globalThis: this repo's tsconfig
    // carries no DOM lib (it is a React Native workspace).
    (
      globalThis as unknown as {
        localStorage: { setItem(key: string, value: string): void };
      }
    ).localStorage.setItem('rnr-engine', 'uniwind');
  });
  const page = await context.newPage();

  for (const name of ['shimmer', 'message']) {
    const item = components.find((entry) => entry.name === name);
    if (!item) throw new Error(`registry-items.json has no \`${name}\` entry`);
    await navigateLocalhost(page, `/components/${name}`);
    await waitForAstroPageLoad(page, '__rnrTabGroupRegistered');

    // FIRST read, no interaction: the persisted uniwind is the active tab and
    // its command is the displayed one on every cold navigation.
    const activeTab = page.locator(`${INSTALL_SECTION} button[role="tab"][aria-selected="true"]`);
    await expect(activeTab).toHaveCount(1);
    expect(await activeTab.getAttribute('data-engine'), `${name} active engine`).toBe('uniwind');
    expect(((await activeTab.textContent()) ?? '').trim(), `${name} active tab name`).toContain(
      'uniwind',
    );
    await expect(
      page.locator(
        `${INSTALL_SECTION} [role="tabpanel"][data-engine="uniwind"] rnr-copy-button code`,
      ),
    ).toHaveText(commandFor('uniwind', name));

    // Engine state never leaks into the URL — exact href, no query, no hash.
    expect(page.url(), `${name} URL carries no engine state`).toBe(
      `${PREVIEW_URL}/components/${name}`,
    );
  }

  // Zero un-tabbed duplicates across every enumerated page: exactly two
  // command lines in the served bytes, no legacy install-row stacking.
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    expect(response?.status(), item.name).toBe(200);
    const html = (await response?.text()) ?? '';
    expect(html.split(CLI_PREFIX).length - 1, `${item.name} command-line count`).toBe(2);
    expect(html, `${item.name} no un-tabbed install rows`).not.toContain('install-row');
  }

  await testInfo.attach('shell-012-engine-follow', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  writeEvidence('FLOW-GEND-20-exact-absolute-url-command-copy', {
    engineFollowProof: {
      project: testInfo.project.name,
      persistedEngine: 'uniwind',
      coldNavigations: ['/components/shimmer', '/components/message'],
      duplicateScanPages: components.length,
      urlSample: page.url(),
    },
  });
  await context.close();
});
