import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import { resolveRegistryDependencies } from '../../apps/docs/src/lib/resolve-deps';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 — FLOW-GEND-21-dependency-panel-peers, authored RED-first: the
 * DependencyPanel already ships (sprint-02) and the same origin serves
 * /r/{engine}/{item}.json, so this spec's panel-equality clauses hold today
 * and the run exits 1 through the shared sprint-04 anatomy preamble until
 * REF-009 lands the five-section page.
 *
 * The shared sprint-04 anatomy preamble (duplicated in every flow spec of this
 * lane — the task's write scope is exactly the twelve spec files) asserts, on
 * every dataset-enumerated page: the five-section section[data-section] order,
 * 0 preview-panel elements, and the pager in-family.
 *
 * The flow's own clauses on every page: the panel lists the dataset's
 * dependencies[] verbatim (or the explicit empty state), both engines'
 * registryDependencies[] resolved through the ONE resolver, and the
 * site-facts.json AI SDK peers line — plus a >=5-item sample matched against
 * the LIVE-SERVED /r/nativewind/{item}.json dependency fields with 0 invented
 * or dropped entries. Locators only (no page.evaluate); UNGUARDED across
 * chromium-desktop, chromium-mobile, and chromium-nojs, retries 0; expect.soft
 * accumulates the full diff; the writer fires on a genuine full pass only.
 */

/** Read a spec fixture, bridging a short window if the file is transiently absent. */
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

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

interface SiteFacts {
  aiSdkPeers: { name: string; range: string }[];
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');
const facts = readJson<SiteFacts>('../../apps/docs/src/data/site-facts.json');
const { version: VERSION } = readJson<{ version: string }>('../../package.json');

const components = items.filter((item) => item.type === 'registry:component');
const familyOf = new Map<string, Family>();
for (const family of families) {
  for (const name of family.itemNames) familyOf.set(name, family);
}

const EXPECTED_SECTIONS = ['install', 'source', 'props', 'theming', 'usage'];
const PREVIEW_PANEL_SELECTOR = '[data-preview-panel], .preview-panel';
const DEPENDENCIES_SECTION = 'main > section[data-section="dependencies"]';

/** The >=5-item live-served sample: a deterministic stride over dataset order. */
const SAMPLE_STRIDE = Math.max(1, Math.floor(components.length / 5));
const sampledItems = components.filter((_, index) => index % SAMPLE_STRIDE === 0).slice(0, 6);

async function sprint04AnatomyPreamble(page: Page, soft: typeof expect.soft): Promise<boolean> {
  let ok = true;
  for (const item of components) {
    const response = await navigateLocalhost(page, `/components/${item.name}`);
    soft(response?.status(), `${item.name}: serves 200`).toBe(200);
    ok &&= response?.status() === 200;

    const sectionLocators = page.locator('main > section[data-section]');
    const sectionCount = await sectionLocators.count();
    const sections: string[] = [];
    for (let index = 0; index < sectionCount; index++) {
      sections.push((await sectionLocators.nth(index).getAttribute('data-section')) ?? '');
    }
    soft(
      sections,
      `${item.name}: top-level section[data-section] order — expected ${JSON.stringify(
        EXPECTED_SECTIONS,
      )}`,
    ).toEqual(EXPECTED_SECTIONS);
    ok =
      ok &&
      sections.length === EXPECTED_SECTIONS.length &&
      EXPECTED_SECTIONS.every((section, index) => sections[index] === section);

    const previewPanels = await page.locator(PREVIEW_PANEL_SELECTOR).count();
    soft(previewPanels, `${item.name}: preview-panel elements (omitted, never a placeholder)`).toBe(
      0,
    );
    ok &&= previewPanels === 0;

    const family = familyOf.get(item.name);
    for (const rel of ['prev', 'next'] as const) {
      const href = await page.locator(`nav.pager a[rel="${rel}"]`).getAttribute('href');
      const target = familyOf.get((href ?? '').replace('/components/', ''));
      soft(
        target ?? undefined,
        `${item.name}: ${rel} pager target is a dataset family member`,
      ).toBeTruthy();
      soft(target === family, `${item.name}: ${rel} pager stays in-family`).toBe(true);
      ok &&= target !== undefined && target === family;
    }
  }
  return ok;
}

// Evidence JSON at the locked sprint-04 path (human-flows.json artifact).
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-21-dependency-panel-peers.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
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

test('FLOW-GEND-21-dependency-panel-peers', async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  const anatomyOk = await sprint04AnatomyPreamble(page, soft);

  // Panel equality on EVERY page: npm dependencies verbatim (or the explicit
  // empty state), both engines' resolved registryDependency URLs, the peers.
  let panelsOk = true;
  for (const item of components) {
    await navigateLocalhost(page, `/components/${item.name}`);
    const panel = page.locator(DEPENDENCIES_SECTION);
    const present = await panel.count();
    soft(present, `${item.name}: dependencies section present`).toBe(1);
    panelsOk &&= present === 1;

    if (item.dependencies.length === 0) {
      const empty = await panel.locator('[data-deps-empty]').count();
      soft(empty, `${item.name}: explicit empty state for dependencies === []`).toBe(1);
      panelsOk &&= empty === 1;
    } else {
      const names = await panel.locator('[data-deps-packages] li code').allTextContents();
      soft(names, `${item.name}: npm dependency rows equal the dataset`).toEqual([
        ...item.dependencies,
      ]);
      panelsOk &&= JSON.stringify(names) === JSON.stringify(item.dependencies);
    }

    for (const engine of ['nativewind', 'uniwind'] as const) {
      const expected = resolveRegistryDependencies(item.registryDependencies, engine, VERSION);
      const urls = await panel
        .locator(`tbody[data-engine-urls="${engine}"] code`)
        .allTextContents();
      soft(
        urls,
        `${item.name} ${engine}: resolved registry URLs equal the resolver output`,
      ).toEqual(expected);
      panelsOk &&= JSON.stringify(urls) === JSON.stringify(expected);
    }

    const peersText = (await panel.locator('[data-deps-peers]').textContent()) ?? '';
    for (const peer of facts.aiSdkPeers) {
      const listed = peersText.includes(`${peer.name}@${peer.range}`);
      soft(listed, `${item.name}: AI SDK peer ${peer.name}@${peer.range} listed`).toBe(true);
      panelsOk &&= listed;
    }
  }

  // >=5 sampled panels matched against the LIVE-SERVED dependency fields —
  // nothing invented, nothing dropped: the served JSON, the dataset, and the
  // panel must agree exactly.
  let servedOk = true;
  const servedSample: Record<string, number> = {};
  for (const item of sampledItems) {
    const response = await request.get(`${PREVIEW_URL}/r/nativewind/${item.name}.json`);
    soft(response.status(), `${item.name}: served /r/nativewind JSON responds 200`).toBe(200);
    const served = (await response.json()) as { dependencies: string[] };
    const names = item.dependencies;
    soft(
      served.dependencies,
      `${item.name}: served dependencies equal the dataset array (0 invented, 0 dropped)`,
    ).toEqual([...names]);
    servedOk &&= JSON.stringify(served.dependencies) === JSON.stringify(names);
    servedSample[item.name] = served.dependencies.length;
  }
  soft(
    sampledItems.length,
    `sampled panels matched against live-served /r JSON (>=5 required)`,
  ).toBe(sampledItems.length);
  servedOk &&= sampledItems.length >= 5;

  if (anatomyOk && panelsOk && servedOk) {
    writeEvidence({
      project: testInfo.project.name,
      pagesEnumerated: components.length,
      sampledServedItems: sampledItems.map((item) => item.name),
      servedSample,
    });
  }
});
