import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  deriveAiSdkPeers,
  resolveRegistryDependencies,
} from '../../apps/docs/src/lib/resolve-deps';
import { navigateLocalhost } from '../harness/docs-preview';

/**
 * SHELL-012 — FLOW-GEND-21-dependency-panel-peers over the real preview: the
 * dependency panels on /components/{shimmer,conversation,message} EQUAL the
 * enriched dataset, resolved per engine through the same resolver the page
 * frontmatter uses. The equality oracle is the point: if a panel ever
 * hand-types a URL or version, the dataset diff fails.
 *
 * - shimmer: dependencies[] [react-native-reanimated] + the templated
 *   {engine}/text.json URL resolving to both engine twins.
 * - conversation: dependencies[] [react-native-safe-area-context] + three
 *   URLs including the unversioned rnraielements.com self-dep form.
 * - message: dependencies[] empty — the explicit empty-deps state — while its
 *   registryDependencies[] still resolve per engine.
 * - The peers line names `ai` at the range derived at run time from
 *   apps/example/package.json (deriveAiSdkPeers — never a typed literal).
 *
 * Version comes from the ROOT package.json; items come from the generated
 * registry-items.json (ENOENT-bridged). Every assertion reads server-rendered
 * DOM (no page JS), so the test stays UNGUARDED and the chromium-nojs project
 * proves the zero-JS form.
 */

/** Read a spec fixture, bridging the destructive lanes' mid-run regeneration. */
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

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const { version: VERSION } = readJson<{ version: string }>('../../package.json');
const { dependencies: EXAMPLE_DEPENDENCIES } = readJson<{
  dependencies: Record<string, string>;
}>('../../apps/example/package.json');

// The peers expectation derives from the consumer manifest at run time — the
// same derivation prebuild applies for site-facts.json. No `^7` literal here.
const PEERS = deriveAiSdkPeers(EXAMPLE_DEPENDENCIES);
const AI_PEER = PEERS.find((peer) => peer.name === 'ai');

const components = items.filter((item) => item.type === 'registry:component');
const DEPENDENCIES_SECTION = 'main > section[data-section="dependencies"]';

// Evidence JSON at the locked sprint-02 path (human-flows.json artifact).
const EVIDENCE_DIR = join(process.cwd(), '.tmp/sprint-02-shell-hero/e2e-evidence');

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  writeFileSync(
    join(EVIDENCE_DIR, 'FLOW-GEND-21-dependency-panel-peers.json'),
    JSON.stringify(
      {
        flow: 'FLOW-GEND-21-dependency-panel-peers',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('FLOW-GEND-21-dependency-panel-peers', async ({ page }, testInfo) => {
  // The derivation inputs must exist before any page read: an absent `ai`
  // pin in the manifest is a fixture break, not a skip.
  expect(AI_PEER, 'apps/example/package.json pins the ai SDK').toBeDefined();
  expect(AI_PEER?.range, 'the derived range carries the caret form').toMatch(/^\^/);

  const observed: Record<string, unknown> = {};

  for (const name of ['shimmer', 'conversation', 'message']) {
    const item = components.find((entry) => entry.name === name);
    if (!item) throw new Error(`registry-items.json has no \`${name}\` entry`);

    const response = await navigateLocalhost(page, `/components/${name}`);
    expect(response?.status(), `/components/${name} must serve 200`).toBe(200);

    const section = page.locator(DEPENDENCIES_SECTION);
    await expect(section, `${name}: dependencies section present`).toHaveCount(1);

    // npm dependencies[] verbatim — or the explicit empty state when empty.
    if (item.dependencies.length === 0) {
      await expect(section.locator('[data-deps-empty]'), name).toHaveCount(1);
      await expect(section.locator('[data-deps-packages]'), name).toHaveCount(0);
      await expect(section.locator('[data-deps-empty]')).toContainText('No required npm packages');
    } else {
      await expect(section.locator('[data-deps-empty]'), name).toHaveCount(0);
      expect(
        await section.locator('[data-deps-packages] li code').allTextContents(),
        `${name}: npm dependency rows equal dependencies[]`,
      ).toEqual([...item.dependencies]);
    }

    // registryDependencies[] resolved per engine — both forms, dataset order,
    // through the SAME resolver the page frontmatter uses. An invented or
    // hand-typed URL (or an unresolved {engine}/{version}) fails this equality.
    const resolvedPerEngine: Record<string, string[]> = {};
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const expected = resolveRegistryDependencies(item.registryDependencies, engine, VERSION);
      const table = section.locator(`tbody[data-engine-urls="${engine}"]`);
      expect(
        await table.locator('code').allTextContents(),
        `${name} ${engine} resolved URLs`,
      ).toEqual(expected);
      resolvedPerEngine[engine] = expected;
    }
    const sectionText = (await section.innerText()) ?? '';
    expect(sectionText, `${name}: no unresolved {engine} template`).not.toContain('{engine}');
    expect(sectionText, `${name}: no unresolved {version} template`).not.toContain('{version}');

    // The peers line names `ai` at the manifest-derived range — on every
    // probed page, never empty, never a hand-copied literal.
    const peersLine = section.locator('[data-deps-peers]');
    await expect(peersLine, `${name}: peers line present`).toHaveCount(1);
    await expect(peersLine).toContainText(`ai@${AI_PEER?.range}`);
    for (const peer of PEERS) {
      await expect(peersLine).toContainText(`${peer.name}@${peer.range}`);
    }

    observed[name] = {
      npmDependencies: [...item.dependencies],
      resolvedRegistryUrls: resolvedPerEngine,
      peersLine: `ai@${AI_PEER?.range}`,
    };
    if (name === 'conversation') {
      await testInfo.attach('flow-gend-21-conversation-panel', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  }

  // Fixture sanity, dataset-derived (the AC's named shapes must still exist in
  // the dataset for the probe set to mean what it claims): conversation's
  // unversioned rnraielements.com self-dep and shimmer's templated text.json.
  const conversation = components.find((entry) => entry.name === 'conversation');
  const shimmer = components.find((entry) => entry.name === 'shimmer');
  expect(
    conversation?.registryDependencies.some((url) => url.includes('rnraielements.com/r/{engine}/')),
    'conversation dataset entry carries the unversioned same-host self-dep URL form',
  ).toBe(true);
  expect(
    shimmer?.registryDependencies.some((url) => url.includes('{engine}/text.json')),
    'shimmer dataset entry carries the templated text.json form',
  ).toBe(true);

  writeEvidence({
    project: testInfo.project.name,
    version: VERSION,
    peers: {
      source: 'apps/example/package.json',
      manifestPin: EXAMPLE_DEPENDENCIES.ai,
      derived: PEERS,
    },
    panels: observed,
    emptyStateText: 'No required npm packages',
  });
});
