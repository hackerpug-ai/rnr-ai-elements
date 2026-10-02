import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type APIRequestContext, expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * ORI-AST-010 AC-2 — FLOW-SHELL-14: both complete labeled engine panels exist
 * in the initial HTML with unique tab relationships and a readable no-JS
 * fallback. The journey reads the ORIGINAL HTTP response bodies through
 * Playwright's request API, then loads the same routes in a real
 * JavaScript-disabled browser context and reads the stacked panels — never a
 * hydrated DOM.
 */

const FLOW_TOKEN = 'FLOW-SHELL-14-tab-panels-in-initial-html';
const CAPTURE_DIR = '.tmp/ORI-AST-010/captures';
const FLOW_EVIDENCE_DIR =
  'tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html';
const LOCKED_COMMAND =
  'pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html';

/** The locked install-command shape (InstallCommand.astro). */
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const commandFor = (engine: string, item: string): string =>
  `${CLI_PREFIX}https://rnraielements.com/r/${engine}/${item}.json`;

/** Registry content that could only construct panel commands after load. */
const REGISTRY_FETCH = /\/r\/(nativewind|uniwind)\//;

interface RawPanelAudit {
  status: number;
  groups: number;
  enginesPerGroup: string[][] | boolean;
  commands: Record<string, boolean>;
  labels: { nativewind: number; uniwind: number };
  ids: string[];
  duplicateIds: number;
  crossGroupRefs: number;
}

/** Split the body into one HTML slice per <rnr-tab-group> block. */
function groupSlices(body: string): string[] {
  const matches = [...body.matchAll(/<rnr-tab-group[^>]*>/g)];
  return matches.map((match, index) => {
    const start = body.indexOf(match[0]);
    const end = index + 1 < matches.length ? body.indexOf(matches[index + 1][0]) : body.length;
    return body.slice(start, end);
  });
}

/** Audit one group slice's panels: engines, dangling ARIA references. */
function auditGroupSlice(groupHtml: string): {
  engines: string[];
  crossRefs: number;
  ids: string[];
} {
  const panels = [...groupHtml.matchAll(/<div[^>]*role="tabpanel"[^>]*>/g)].map((match) =>
    match[0].replace(/&quot;/g, '"'),
  );
  const engines = panels
    .map((panel) => /data-engine="(nativewind|uniwind)"/.exec(panel)?.[1] ?? '')
    .filter(Boolean);
  let crossRefs = 0;
  const ids: string[] = [];
  for (const panel of panels) {
    ids.push(/id="([^"]+)"/.exec(panel)?.[1] ?? '');
    // A relationship is cross-group when aria-controls/aria-labelledby
    // names a tab/panel id that does not exist inside this group's slice.
    for (const attribute of ['aria-controls', 'aria-labelledby'] as const) {
      const target = new RegExp(`${attribute}="([^"]+)"`).exec(panel)?.[1] ?? '';
      if (target && !groupHtml.includes(`id="${target}"`)) crossRefs += 1;
    }
  }
  return { engines, crossRefs, ids };
}

/** Audit the RAW served HTML of one route for complete engine panels. */
async function auditRawBody(
  request: APIRequestContext,
  path: string,
  item: string,
): Promise<RawPanelAudit> {
  const response = await request.get(`${PREVIEW_URL}${path}`);
  const status = response.status();
  const body = await response.text();

  const slices = groupSlices(body);
  const audits = slices.map((slice) => auditGroupSlice(slice));
  const ids = audits.flatMap((audit) => audit.ids);

  const labels = {
    nativewind: (body.match(/aria-label="nativewind engine"/g) ?? []).length,
    uniwind: (body.match(/aria-label="uniwind engine"/g) ?? []).length,
  };

  return {
    status,
    groups: slices.length,
    enginesPerGroup: audits.map((audit) => audit.engines),
    commands: {
      nativewind: body.includes(commandFor('nativewind', item)),
      uniwind: body.includes(commandFor('uniwind', item)),
    },
    labels,
    ids,
    duplicateIds: ids.length - new Set(ids).size,
    crossGroupRefs: audits.reduce((sum, audit) => sum + audit.crossRefs, 0),
  };
}

test(`${FLOW_TOKEN}`, async ({ page, browser }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // -- Raw HTTP: original response bodies carry BOTH complete panels ---------
  const request = page.context().request;
  const installation = await auditRawBody(request, '/docs/installation', 'conversation');
  expect(
    installation.status,
    'the integrated candidate must serve /docs/installation with HTTP 200',
  ).toBe(200);
  soft(
    installation.groups,
    'the installation body renders a complete engine tab group',
  ).toBeGreaterThan(0);
  soft(installation.enginesPerGroup, 'installation panels serve nativewind AND uniwind').toEqual(
    expect.arrayContaining([expect.arrayContaining(['nativewind', 'uniwind'])]),
  );
  soft(installation.commands.nativewind, 'installation carries the nativewind command').toBe(true);
  soft(installation.commands.uniwind, 'installation carries the uniwind command').toBe(true);
  soft(
    Math.min(installation.labels.nativewind, installation.labels.uniwind),
    'both engines carry correctly labeled tabs in the raw body',
  ).toBeGreaterThan(0);

  const message = await auditRawBody(request, '/components/message', 'message');
  expect(
    message.status,
    'the integrated candidate must serve /components/message with HTTP 200',
  ).toBe(200);
  soft(message.enginesPerGroup, 'message panels serve nativewind AND uniwind').toEqual(
    expect.arrayContaining([expect.arrayContaining(['nativewind', 'uniwind'])]),
  );
  soft(message.commands.nativewind, 'message carries the nativewind command').toBe(true);
  soft(message.commands.uniwind, 'message carries the uniwind command').toBe(true);
  soft(message.duplicateIds, 'raw message tab/panel IDs are unique').toBe(0);
  soft(message.crossGroupRefs, 'raw message ARIA references stay inside their owning group').toBe(
    0,
  );

  const quickstart = await auditRawBody(request, '/docs/quickstart', 'conversation');
  expect(
    quickstart.status,
    'the integrated candidate must serve /docs/quickstart with HTTP 200',
  ).toBe(200);
  soft(quickstart.groups, 'Quickstart serves multiple tabbed groups').toBeGreaterThan(1);
  soft(quickstart.duplicateIds, 'raw Quickstart tab/panel IDs are unique across all groups').toBe(
    0,
  );
  soft(
    quickstart.crossGroupRefs,
    'raw Quickstart ARIA references stay inside their owning groups',
  ).toBe(0);
  soft(
    Math.min(quickstart.labels.nativewind, quickstart.labels.uniwind),
    'every Quickstart group keeps readable engine labels',
  ).toBeGreaterThan(0);

  // -- JavaScript-disabled browser: stacked readable panels ------------------
  const nojsContext = await browser.newContext({ javaScriptEnabled: false });
  const nojsPage = await nojsContext.newPage();
  const log: string[] = [];
  nojsPage.on('request', (req) => log.push(req.url()));

  await navigateLocalhost(nojsPage, '/docs/installation');
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panel = nojsPage.locator(`main rnr-tab-group [role="tabpanel"][data-engine="${engine}"]`);
    soft(await panel.count(), `no-JS installation keeps the ${engine} panel`).toBe(1);
    soft(await panel.isVisible(), `no-JS installation ${engine} panel is stacked visible`).toBe(
      true,
    );
    const text = await panel.locator('code').first().textContent({ timeout: 10_000 });
    soft(text, `no-JS installation ${engine} command is readable`).toBe(
      commandFor(engine, 'conversation'),
    );
  }

  await navigateLocalhost(nojsPage, '/components/message');
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panels = nojsPage.locator(
      `main rnr-tab-group [role="tabpanel"][data-engine="${engine}"]`,
    );
    soft(await panels.count(), `no-JS message keeps ${engine} panels in both groups`).toBe(2);
    const first = panels.first();
    soft(await first.isVisible(), `no-JS message ${engine} panel is stacked visible`).toBe(true);
    const text = await first.locator('code').first().textContent({ timeout: 10_000 });
    soft(text, `no-JS message ${engine} command is readable`).toBe(commandFor(engine, 'message'));
  }

  await navigateLocalhost(nojsPage, '/docs/quickstart');
  const quickstartGroupCount = await nojsPage.locator('main rnr-tab-group').count();
  soft(quickstartGroupCount, 'no-JS Quickstart renders every tabbed group').toBeGreaterThan(1);
  for (const engine of ['nativewind', 'uniwind'] as const) {
    const panels = nojsPage.locator(
      `main rnr-tab-group [role="tabpanel"][data-engine="${engine}"]`,
    );
    const panelCount = await panels.count();
    soft(panelCount, `no-JS Quickstart keeps a ${engine} panel for every group`).toBe(
      quickstartGroupCount,
    );
    const allVisible = await panels
      .evaluateAll((nodes) => nodes.map((node) => node.checkVisibility()))
      .then((values) => values.every(Boolean))
      .catch(() => false);
    soft(allVisible, `no-JS Quickstart ${engine} panels are stacked readable`).toBe(true);
  }
  const domIds = await nojsPage
    .locator('main [role="tab"], main [role="tabpanel"]')
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  soft(
    domIds.length - new Set(domIds).size,
    'no-JS Quickstart DOM carries zero duplicate IDs',
  ).toBe(0);
  const crossGroup = await nojsPage.evaluate(() => {
    interface NoJsEl {
      id: string;
      getAttribute(name: string): string | null;
      querySelectorAll(selector: string): ArrayLike<NoJsEl>;
    }
    const g = globalThis as unknown as {
      document: { querySelectorAll(selector: string): ArrayLike<NoJsEl> };
    };
    const memberIds = (group: NoJsEl): Set<string> => {
      const ids = new Set<string>();
      for (const el of Array.from(group.querySelectorAll('[role="tab"], [role="tabpanel"]'))) {
        if (el.id) ids.add(el.id);
      }
      return ids;
    };
    const danglingIn = (el: NoJsEl, ids: Set<string>): number =>
      ['aria-controls', 'aria-labelledby'].filter((attribute) => {
        const target = el.getAttribute(attribute);
        return target ? !ids.has(target) : false;
      }).length;
    return Array.from(g.document.querySelectorAll('main rnr-tab-group')).reduce(
      (violations, group) => {
        const ids = memberIds(group);
        const members = Array.from(group.querySelectorAll('[role="tab"], [role="tabpanel"]'));
        return violations + members.reduce((sum, el) => sum + danglingIn(el, ids), 0);
      },
      0,
    );
  });
  soft(crossGroup, 'no-JS Quickstart ARIA relationships are owned by their own groups').toBe(0);

  // -- Zero after-load registry requests constructing panel commands ---------
  const registryRequests = log.filter((url) => REGISTRY_FETCH.test(url));
  soft(
    registryRequests,
    `no after-load request constructs panel commands; saw ${JSON.stringify(registryRequests)}`,
  ).toEqual([]);

  const capture = {
    raw: { installation, message, quickstart: { ...quickstart, ids: [] } },
    nojs: {
      quickstartGroups: quickstartGroupCount,
      domIdCount: domIds.length,
      crossGroupViolations: crossGroup,
      totalRequests: log.length,
      registryRequests,
    },
  };
  const dir = join(process.cwd(), CAPTURE_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, `${testInfo.project.name}-${FLOW_TOKEN}.json`),
    `${JSON.stringify(capture, null, 2)}\n`,
  );
  await nojsContext.close();
});

// ---------------------------------------------------------------------------
// Flow evidence — the run.json artifact the locked flow fingerprints.
// ---------------------------------------------------------------------------
const repoRoot = process.cwd();

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function hashFile(relative: string): string {
  try {
    return sha256(readFileSync(join(repoRoot, relative), 'utf8'));
  } catch {
    return 'absent';
  }
}

let anyFailure = false;

// Playwright requires the fixtures object destructuring pattern in hook
// callbacks; the empty pattern is the only form that needs no fixture.
// biome-ignore lint/correctness/noEmptyPattern: Playwright hook signature requires object destructuring.
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== 'passed') anyFailure = true;
});

test.afterAll(() => {
  const evidenceDir = join(repoRoot, FLOW_EVIDENCE_DIR);
  mkdirSync(evidenceDir, { recursive: true });
  const runJson = {
    runIdentity: `ori-ast-010-flow-shell-14-${Date.now()}`,
    flowToken: FLOW_TOKEN,
    command: LOCKED_COMMAND,
    exit: anyFailure ? 1 : 0,
    sourceHashes: {
      tabGroupIsland: hashFile('apps/docs/src/components/islands/TabGroup.astro'),
      docsLayout: hashFile('apps/docs/src/layouts/MarkdownLayout.astro'),
      testFile: hashFile('tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts'),
      lockfile: hashFile('pnpm-lock.yaml'),
      driver: hashFile('tests/harness/docs-preview.ts'),
      surfacePolicy: hashFile('.spec/e2e-policy/surface.json'),
      coldbootPolicy: hashFile('.spec/e2e-policy/coldboot.json'),
    },
    references: [
      'tests/sprint-05-orient-search/evidence/ORI-AST-010/manifest.json',
      'tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/proof.red',
    ],
  };
  writeFileSync(join(evidenceDir, 'run.json'), `${JSON.stringify(runJson, null, 2)}\n`);
});
