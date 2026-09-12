import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';
import { resolveRegistryDependencies } from '../../apps/docs/src/lib/resolve-deps';

/**
 * SHELL-008 — item pages: tabbed install first + data-verbatim dependencies.
 *
 * Integration tier, same lane shape as theming-route.test.ts: seed the ordered
 * chain (registry:build -> gallery:manifest), spawn the real filtered docs
 * build (`pnpm --filter @rnr-ai-elements/docs build`) as a subprocess, then
 * read apps/docs/dist/components/*.html from the real filesystem. The build
 * subprocess + filesystem artifacts ARE the surface.
 *
 * - SHELL-008-tabbed-install-first (TC-1/TC-2, AC-1): on every generated
 *   component page install is the first main>section[data-section], both
 *   engines' full absolute-URL commands are server-rendered with the
 *   nativewind panel first, the tab group carries storage-key rnr-engine,
 *   exactly two command lines exist (no stacked un-tabbed duplicates), and no
 *   {engine}/{version} template or max-height string reaches served HTML.
 * - SHELL-008-dependencies-dataverbatim (TC-3/TC-4, AC-2): the dependencies
 *   section equals the dataset arrays resolved per engine through the real
 *   resolve-deps.ts (ordered, nothing invented, nothing dropped), every page
 *   carries the peers line read from the generated site-facts.json, and an
 *   item with empty dependencies[] (message) renders an explicit empty state
 *   while still listing its resolved registryDependencies[].
 *
 * Every expectation is computed from the REAL artifacts at run time — never
 * hand-copied literals — so a fixture edit moves the panel with it.
 *
 * The root vitest config sets fileParallelism:false, so this lane never races
 * the other build lanes.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_COMPONENTS = join(repoRoot, 'apps/docs/dist/components');

/** The pinned canonical origin — Astro.site in apps/docs/astro.config.mjs. */
const SITE = 'https://rnraielements.com';
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';

type ItemEntry = {
  name: string;
  title: string;
  type: string;
  registryDependencies: string[];
  dependencies: string[];
};
type SiteFacts = { aiSdkPeers: { name: string; range: string }[] };

/** document-order data-section values of one served page. */
function sectionOrder(html: string): string[] {
  return [...html.matchAll(/<section\b[^>]*data-section="([^"]+)"/g)].map((match) => match[1]);
}

/** URLs (in document order) inside one served HTML slice. */
function urlsIn(html: string): string[] {
  return [...html.matchAll(/https:\/\/[^\s"<]+/g)].map((match) => match[0]);
}

let buildExit: number | null = null;
let buildLog = '';
let items: ItemEntry[] = [];
let facts: SiteFacts = { aiSdkPeers: [] };
let version = '';
/** name -> served dist HTML ('' when the page never built). */
const pages = new Map<string, string>();

beforeAll(() => {
  // Seed the real ordered chain first (registry:build -> gallery:manifest): a
  // fresh checkout has no generated data artifacts, and pnpm runs the docs
  // package's prebuild hook BEFORE its build script. Same ordering as the root
  // e2e:docs script and the sprint-01/02 build lanes.
  for (const command of ['registry:build', 'gallery:manifest'] as const) {
    const seed = spawnSync('pnpm', [command], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const log = `${seed.stdout ?? ''}\n${seed.stderr ?? ''}`;
    expect(seed.error, `${command} failed to spawn: ${seed.error?.message}`).toBeUndefined();
    expect(seed.status, `${command} exited ${seed.status}\n${log}`).toBe(0);
  }
  const result = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  buildExit = result.status;
  buildLog = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;

  items = JSON.parse(
    readFileSync(join(repoRoot, 'apps/docs/src/data/registry-items.json'), 'utf8'),
  ) as ItemEntry[];
  facts = JSON.parse(
    readFileSync(join(repoRoot, 'apps/docs/src/data/site-facts.json'), 'utf8'),
  ) as SiteFacts;
  version = (
    JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')) as { version: string }
  ).version;
  for (const item of items.filter((entry) => entry.type === 'registry:component')) {
    try {
      // Astro's default directory format: /components/{name} emits
      // dist/components/{name}/index.html (same shape as theming-route's
      // dist/docs/theming/index.html read).
      pages.set(item.name, readFileSync(join(DIST_COMPONENTS, item.name, 'index.html'), 'utf8'));
    } catch {
      // RED-safe read: an unbuilt page yields '' so the failure names the page,
      // never a thrown ENOENT that hides which assertion fired.
      pages.set(item.name, '');
    }
  }
}, 900_000);

it('SHELL-008-tabbed-install-first: install first, both engines server-rendered in tabbed panels, no templates, no duplicates', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  // The pnpm filter really matched the docs package — this marker is printed
  // by the docs prebuild; a no-match filter still exits 0 on this pnpm.
  expect(buildLog, 'the docs prebuild marker is absent — the chain broke').toContain('56 items');

  const components = items.filter((entry) => entry.type === 'registry:component');
  expect(components.length, 'component pages today').toBe(39);

  for (const item of components) {
    const html = pages.get(item.name) ?? '';
    expect(html, `dist/components/${item.name}/index.html is absent or empty`).not.toBe('');

    // TC-1: install is the FIRST main>section[data-section] on the page.
    const sections = sectionOrder(html);
    expect(sections[0], `${item.name}: first data-section`).toBe('install');

    // TC-1: both engines' full absolute-URL commands are in the SERVED HTML,
    // nativewind panel first (server-rendered panels — hidden attribute only).
    const nativewindCommand = `${CLI_PREFIX}${SITE}/r/nativewind/${item.name}.json`;
    const uniwindCommand = `${CLI_PREFIX}${SITE}/r/uniwind/${item.name}.json`;
    expect(html, `${item.name}: nativewind command`).toContain(nativewindCommand);
    expect(html, `${item.name}: uniwind command`).toContain(uniwindCommand);
    expect(
      html.indexOf(nativewindCommand),
      `${item.name}: nativewind panel must precede the uniwind panel`,
    ).toBeLessThan(html.indexOf(uniwindCommand));

    // TC-1: the tab group persists the engine under the contracted key.
    expect(html, `${item.name}: storage-key`).toContain('storage-key="rnr-engine"');

    // TC-2: exactly two command LINES on the whole page — a stacked un-tabbed
    // duplicate row alongside the tabs would make this four.
    expect(html.split(CLI_PREFIX).length - 1, `${item.name}: command-line count`).toBe(2);

    // TC-2: no template literal and no height clipping ever reaches the page.
    expect(html, `${item.name}: {engine} template`).not.toContain('{engine}');
    expect(html, `${item.name}: {version} template`).not.toContain('{version}');
    expect(html, `${item.name}: max-height`).not.toMatch(/max-height/i);

    // TC-2: the old un-tabbed stacking selector is gone from the served DOM.
    expect(html, `${item.name}: un-tabbed .install-row duplicates`).not.toContain('install-row');
  }
});

it('SHELL-008-dependencies-dataverbatim: sections equal the resolved dataset, peers line present, empty deps explicit', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  expect(items, 'registry-items.json must be loaded').not.toEqual([]);

  const components = items.filter((entry) => entry.type === 'registry:component');
  for (const item of components) {
    const html = pages.get(item.name) ?? '';
    const start = html.indexOf('data-section="dependencies"');
    expect(
      start,
      `${item.name}: the dependencies section must exist (never dropped)`,
    ).toBeGreaterThan(-1);
    const sectionStart = html.lastIndexOf('<section', start);
    const depsHtml = html.slice(sectionStart, html.indexOf('</section>', start));

    // TC-4: the npm dependency list is the dataset array verbatim — or the
    // explicit empty state when dependencies[] is empty (never a silent drop,
    // never an invented row).
    if (item.dependencies.length === 0) {
      expect(depsHtml, `${item.name}: explicit empty-deps state`).toContain('data-deps-empty');
      expect(
        depsHtml,
        `${item.name}: no invented npm rows on an empty dependencies[]`,
      ).not.toContain('data-deps-packages');
    } else {
      const listStart = depsHtml.indexOf('data-deps-packages');
      expect(listStart, `${item.name}: npm dependency list`).toBeGreaterThan(-1);
      const listHtml = depsHtml.slice(listStart, depsHtml.indexOf('</ul>', listStart));
      for (const dependency of item.dependencies) {
        expect(listHtml, `${item.name}: npm dependency ${dependency}`).toContain(dependency);
      }
    }

    // TC-3: each engine's URL table equals resolve-deps.ts output for that
    // engine — ordered equality, so an invented or dropped row fails.
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const expected = resolveRegistryDependencies(item.registryDependencies, engine, version);
      const tableStart = depsHtml.indexOf(`data-engine-urls="${engine}"`);
      expect(tableStart, `${item.name}: ${engine} registry-URL table`).toBeGreaterThan(-1);
      const tableHtml = depsHtml.slice(tableStart, depsHtml.indexOf('</table>', tableStart));
      expect(urlsIn(tableHtml), `${item.name}: ${engine} resolved registry URLs`).toEqual(expected);
    }

    // TC-4: the peers line names every site-facts peer at its derived range.
    for (const peer of facts.aiSdkPeers) {
      expect(depsHtml, `${item.name}: peers line must carry ${peer.name}@${peer.range}`).toContain(
        `${peer.name}@${peer.range}`,
      );
    }
  }

  // The named AC cases fall out of the loop, but pin them explicitly: message
  // (empty dependencies[]) still lists its resolved registry dependencies —
  // first of which (dataset order) is the avatar.json registry URL.
  const message = items.find((entry) => entry.name === 'message');
  if (!message) throw new Error('registry-items.json has no `message` entry');
  expect(message.dependencies, 'message ships no npm dependencies').toEqual([]);
  const messageHtml = pages.get('message') ?? '';
  expect(messageHtml).toContain('data-deps-empty');
  const messageNativewind = resolveRegistryDependencies(
    message.registryDependencies,
    'nativewind',
    version,
  );
  expect(messageNativewind[0], 'message fixture sanity: avatar.json is first').toContain(
    '/nativewind/avatar.json',
  );
  expect(messageHtml).toContain(messageNativewind[0]);
});
