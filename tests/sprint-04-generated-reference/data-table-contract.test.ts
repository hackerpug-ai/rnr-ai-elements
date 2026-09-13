import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * REF-006 — source-contract scan over the authored DataTable primitive and the
 * re-skinned DependencyPanel in the REAL apps/docs/src tree.
 *
 * UNIT_TEST_JUSTIFIED: pure static source-contract scans plus one real dataset
 * read — file reads only, no runtime behavior, no network, no rendering (same
 * pattern as the landed primitives.test.ts). The rendered panel equality is
 * REF-009's FLOW-GEND-21 primary over the real preview, outside this task's
 * write_allowed; tests/sprint-02-shell-hero/dependency-panels.spec.ts stays the
 * byte-unchanged behavioral oracle this re-skin must not move.
 *
 * Contract (task REF-006, AC-1..AC-4):
 * - DataTable: generic {columns?, rows, bodyAttrs?, caption?} prop surface,
 *   exactly 1 rows-driven loop, optional thead (0 columns = bare tbody),
 *   zebra var(--muted), sticky thead, overflow-x scroll wrapper, and exactly
 *   1 max-width media query pinning the first column — zero-JS, token-only.
 * - Panel: the sprint-02 {dependencies, registryUrls, peers} interface, the
 *   type-only AiSdkPeer import, 2 slot panels inside 1 TabGroup, the 4
 *   data-testid families, exactly 3 .map render paths, <code> URL cells, and
 *   exactly 1 footer Callout (variant 'info') carrying the troubleshooting
 *   link through its link slot (REF-004's Callout).
 * - Resolver: lib/resolve-deps.ts byte-identical to task start (HEAD).
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentsDir = join(repoRoot, 'apps', 'docs', 'src', 'components');
const DATA_TABLE = join(componentsDir, 'DataTable.astro');
const PANEL = join(componentsDir, 'DependencyPanel.astro');
const RESOLVER = join(repoRoot, 'apps', 'docs', 'src', 'lib', 'resolve-deps.ts');
const REGISTRY_ITEMS = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

function countMatches(source: string, pattern: RegExp): number {
  const global = pattern.flags.includes('g')
    ? pattern
    : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...source.matchAll(global)].length;
}

function readPanel(): string {
  expect(existsSync(PANEL), `DependencyPanel.astro exists at ${PANEL}`).toBe(true);
  return readFileSync(PANEL, 'utf8');
}

it('REF-006-data-table-generic-contract: prop-driven table, zebra var(--muted), sticky thead, mobile first-column scroll', () => {
  // RED at task start: DataTable.astro does not exist yet.
  expect(existsSync(DATA_TABLE), `DataTable.astro exists at ${DATA_TABLE}`).toBe(true);
  const dataTable = readFileSync(DATA_TABLE, 'utf8');

  // TC-1 — 1 prop surface {columns?, rows, bodyAttrs?, caption?}; the cell
  // shape carries mono so URL cells render as <code>.
  expect(dataTable, 'rows prop is the required readonly cell-matrix').toMatch(
    /rows:\s*readonly\s*\{\s*text:\s*string;\s*mono\?:\s*boolean;?\s*\}\[\]\[\]/,
  );
  expect(dataTable, 'columns prop is optional').toMatch(/columns\?:\s*readonly string\[\]/);
  expect(dataTable, 'bodyAttrs prop is optional').toMatch(
    /bodyAttrs\?:\s*Record<string,\s*string>/,
  );
  expect(dataTable, 'caption prop is optional').toMatch(/caption\?:\s*string/);

  // Exactly 1 rows-driven loop emitting 1 <tr> per row — 0 hardcoded rows and
  // 0 dependency-panel domain strings: the primitive stays generic.
  expect(countMatches(dataTable, /rows\.map\(/), 'exactly 1 rows-driven loop').toBe(1);
  expect(dataTable, 'no dependency-panel domain strings baked into the generic table').not.toMatch(
    /nativewind|uniwind|peer|data-deps|data-engine-urls/,
  );
  expect(dataTable, 'no hardcoded URL or package rows').not.toMatch(/https?:\/\/|react-native/);

  // Optional thead: renders only when columns arrive (0 columns = the
  // bare-tbody engine-URL form).
  expect(dataTable, 'thead renders only when a non-empty columns array arrives').toMatch(
    /\{columns && columns\.length > 0 && \(\s*<thead>/s,
  );

  // Mono cells render as <code> — 1 code element per mono cell.
  expect(dataTable, 'mono cells render as code').toMatch(
    /cell\.mono \? <code>\{cell\.text\}<\/code> : cell\.text/,
  );

  // TC-2 — zebra, sticky thead, scroll wrapper, mobile pinned first column.
  expect(
    countMatches(dataTable, /background:\s*var\(--muted\)/),
    'exactly 1 zebra rule on var(--muted)',
  ).toBe(1);
  expect(dataTable, 'zebra targets even body rows').toMatch(/tbody tr:nth-child\(even\)/);
  expect(dataTable, '1 position: sticky top rule on thead cells').toMatch(
    /thead th\s*\{[^}]*position: sticky;\s*top: 0;/,
  );
  expect(countMatches(dataTable, /overflow-x:\s*auto/), '1 overflow-x auto scroll wrapper').toBe(1);
  expect(countMatches(dataTable, /@media/), 'exactly 1 media query (the mobile one)').toBe(1);
  expect(dataTable, 'the single media query is a max-width one').toMatch(/@media\s*\(max-width:/);
  const mobileBlock = dataTable.slice(dataTable.indexOf('@media'));
  expect(mobileBlock, 'mobile block pins the header first column').toContain('th:first-child');
  expect(mobileBlock, 'mobile block pins the body first column').toContain('td:first-child');
  expect(mobileBlock, 'pinned columns are sticky').toMatch(/position:\s*sticky/);
  expect(mobileBlock, 'pinned columns anchor to the left edge').toMatch(/left:\s*0/);

  // Zero-JS + token + boundary guards.
  expect(dataTable.match(HEX_LITERAL), 'no hex color literals').toBeNull();
  expect(dataTable, 'no script tag').not.toContain('<script');
  expect(dataTable, 'no custom element').not.toContain('customElements.define');
  expect(dataTable, 'no max-height on any table surface').not.toContain('max-height');
  expect(dataTable, 'no print styles').not.toMatch(/@media\s+print/);

  console.log('[REF-006] DataTable anchors:', {
    rowsLoops: countMatches(dataTable, /rows\.map\(/),
    zebraRules: countMatches(dataTable, /background:\s*var\(--muted\)/),
    overflowWrappers: countMatches(dataTable, /overflow-x:\s*auto/),
    mediaQueries: countMatches(dataTable, /@media/),
    hexLiterals: countMatches(dataTable, HEX_LITERAL),
  });
});

it('REF-006-panel-props-mount-stability: 3-key props contract, type-only AiSdkPeer import, 2 slots in 1 TabGroup, resolver untouched', () => {
  const panel = readPanel();

  // RED at task start: the panel still renders its ad-hoc .deps-urls tables
  // and composes no DataTable.
  expect(panel, 'panel imports the DataTable primitive').toContain(
    "import DataTable from './DataTable.astro'",
  );
  expect(countMatches(panel, /<DataTable/), 'panel renders through DataTable').toBeGreaterThan(0);
  expect(panel, 'the ad-hoc .deps-urls table is gone').not.toContain('deps-urls');

  // TC-3 — the Props interface names exactly 3 keys with the sprint-02
  // readonly types (top-level keys sit at one indent level).
  const propsBlock = panel.match(/interface Props \{([\s\S]*?)\n\}/)?.[1] ?? '';
  const keys = propsBlock
    .split('\n')
    .map((line) => line.match(/^ {2}([a-zA-Z]+)\??:/)?.[1])
    .filter((key): key is string => key !== undefined);
  expect(keys, 'Props names exactly dependencies, registryUrls, peers').toEqual([
    'dependencies',
    'registryUrls',
    'peers',
  ]);
  expect(propsBlock, 'dependencies keeps the sprint-02 readonly type').toMatch(
    /dependencies:\s*readonly string\[\]/,
  );
  expect(propsBlock, 'registryUrls keeps the sprint-02 per-engine readonly type').toMatch(
    /registryUrls:\s*\{\s*nativewind:\s*readonly string\[\];\s*uniwind:\s*readonly string\[\];?\s*\}/,
  );
  expect(propsBlock, 'peers keeps the sprint-02 readonly AiSdkPeer type').toMatch(
    /peers:\s*readonly AiSdkPeer\[\]/,
  );

  // Exactly 1 AiSdkPeer import and it is type-only — no resolution logic
  // migrates into the panel.
  expect(
    countMatches(panel, /import[^;\n]*AiSdkPeer[^;\n]*from '\.\.\/lib\/resolve-deps'/),
    'exactly 1 AiSdkPeer import from resolve-deps',
  ).toBe(1);
  expect(panel, 'the AiSdkPeer import is type-only').toMatch(
    /import type \{ AiSdkPeer \} from '\.\.\/lib\/resolve-deps'/,
  );

  // TC-4 — exactly 2 slot panels inside 1 TabGroup; 0 URL construction and
  // 0 peers derivation inside the panel.
  expect(countMatches(panel, /<TabGroup/), 'exactly 1 TabGroup').toBe(1);
  expect(countMatches(panel, /slot="nativewind"/), 'exactly 1 nativewind slot panel').toBe(1);
  expect(countMatches(panel, /slot="uniwind"/), 'exactly 1 uniwind slot panel').toBe(1);
  expect(panel, 'no URL construction — every URL arrives via registryUrls').not.toMatch(
    /https?:\/\//,
  );
  expect(panel, 'no resolver or peers-derivation calls in the panel').not.toMatch(
    /resolveDependencyUrl|resolveRegistryDependencies|deriveAiSdkPeers/,
  );

  // lib/resolve-deps.ts is byte-identical to task start (worktree HEAD).
  const resolverBaseline = execFileSync('git', ['show', 'HEAD:apps/docs/src/lib/resolve-deps.ts'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  expect(existsSync(RESOLVER), `resolve-deps.ts exists at ${RESOLVER}`).toBe(true);
  expect(readFileSync(RESOLVER, 'utf8'), 'resolve-deps.ts byte-identical to task start').toEqual(
    resolverBaseline,
  );

  console.log('[REF-006] panel mount anchors:', {
    propsKeys: keys,
    tabGroups: countMatches(panel, /<TabGroup/),
    slotPanels: countMatches(panel, /slot="nativewind"/) + countMatches(panel, /slot="uniwind"/),
    resolverBytes: resolverBaseline.length,
  });
});

it('REF-006-panel-testid-continuity-equality: 4 testid families, 3 map paths, code URL cells, 1 footer Callout', () => {
  const panel = readPanel();

  // RED at task start: no DataTable composition in the panel.
  expect(panel, 'panel composes the DataTable primitive').toContain(
    "import DataTable from './DataTable.astro'",
  );

  // TC-5 — all 4 sprint-02 data-testid families survive the re-skin.
  expect(countMatches(panel, /data-deps-empty/), '1 data-deps-empty path').toBe(1);
  expect(countMatches(panel, /data-deps-packages/), '1 data-deps-packages list').toBe(1);
  expect(countMatches(panel, /data-engine-urls/), '2 data-engine-urls tbodys').toBe(2);
  expect(countMatches(panel, /data-deps-peers/), '1 data-deps-peers element').toBe(1);
  expect(panel, 'the empty-state copy stays the sprint-02 wording').toContain(
    'No required npm packages',
  );
  expect(panel, 'engine URL cells render as mono code cells').toMatch(/mono: true/);

  // TC-6 — exactly 3 .map render paths (dependencies, registryUrls per
  // engine, peers) and 0 literal package/URL strings outside the props.
  expect(countMatches(panel, /\.map\(/), 'exactly 3 .map render paths').toBe(3);
  expect(panel, 'dependencies render through dependencies.map').toMatch(/dependencies\.map\(/);
  expect(panel, 'both engines share the one per-engine registryUrls path').toMatch(
    /registryUrls\[engine\]\.map\(/,
  );
  expect(panel, 'peers render through peers.map').toMatch(/peers\.map\(/);
  expect(panel, 'the peers section still renders when peers is non-empty').toContain(
    'peers.length > 0',
  );
  expect(panel, 'no literal dataset URLs').not.toMatch(/https?:\/\//);
  expect(panel, 'no literal dataset package names').not.toMatch(
    /react-native-reanimated|react-native-safe-area-context/,
  );

  // Exactly 1 footer region composing exactly 1 Callout (variant 'info') with
  // the troubleshooting link through its link slot (REF-004's Callout).
  expect(countMatches(panel, /<footer/), 'exactly 1 footer region').toBe(1);
  expect(countMatches(panel, /<Callout/), 'exactly 1 Callout in the panel').toBe(1);
  expect(panel, 'the Callout is the info variant').toMatch(/<Callout variant="info"/);
  expect(panel, 'the troubleshooting link rides the Callout link slot').toMatch(
    /<a slot="link" href="\/registry">/,
  );

  console.log('[REF-006] panel continuity anchors:', {
    testidFamilies: {
      empty: countMatches(panel, /data-deps-empty/),
      packages: countMatches(panel, /data-deps-packages/),
      engineUrls: countMatches(panel, /data-engine-urls/),
      peers: countMatches(panel, /data-deps-peers/),
    },
    mapPaths: countMatches(panel, /\.map\(/),
    footers: countMatches(panel, /<footer/),
    callouts: countMatches(panel, /<Callout/),
  });
});

it('REF-006-panel-empty-state-guards: explicit empty branch, real dataset trigger, no max-height/print/new-island', () => {
  const panel = readPanel();

  // RED at task start: no re-skinned panel (no DataTable composition).
  expect(panel, 'the re-skinned panel composes DataTable').toContain(
    "import DataTable from './DataTable.astro'",
  );

  // TC-7 — exactly 1 empty-deps branch rendering the explicit message.
  expect(countMatches(panel, /dependencies\.length === 0/), 'exactly 1 empty-deps branch').toBe(1);
  expect(panel, 'the empty branch renders the data-deps-empty message').toMatch(
    /dependencies\.length === 0[\s\S]{0,400}data-deps-empty/,
  );

  // TC-8 — 0 max-height, 0 @media print, 0 new islands or scripts beyond the
  // retained TabGroup.
  expect(panel, 'no max-height on any panel surface').not.toContain('max-height');
  expect(panel, 'no print styles').not.toMatch(/@media\s+print/);
  expect(panel, 'no script tag').not.toContain('<script');
  expect(panel, 'no custom element').not.toContain('customElements.define');
  expect(
    panel.match(/from '\.\/islands\/[^']+'/g) ?? [],
    'only the TabGroup island import',
  ).toEqual(["from './islands/TabGroup.astro'"]);

  // Dataset grounding: the real message item carries dependencies === []
  // while its registryDependencies still resolve per engine.
  expect(existsSync(REGISTRY_ITEMS), `registry dataset exists at ${REGISTRY_ITEMS}`).toBe(true);
  const items = JSON.parse(readFileSync(REGISTRY_ITEMS, 'utf8')) as Array<{
    name: string;
    type: string;
    dependencies: string[];
    registryDependencies: string[];
  }>;
  const message = items.find((item) => item.name === 'message');
  expect(message, 'the dataset carries the message item').toBeDefined();
  expect(message?.dependencies, 'message dependencies is the real empty trigger').toEqual([]);
  expect(
    message?.registryDependencies.length,
    'message registryDependencies still resolve per engine',
  ).toBeGreaterThan(0);
  expect(
    items.filter((item) => item.type === 'registry:component').length,
    '39 registry:component items mount the panel',
  ).toBe(39);

  console.log('[REF-006] empty-state guards:', {
    emptyBranches: countMatches(panel, /dependencies\.length === 0/),
    maxHeight: countMatches(panel, /max-height/),
    printRules: countMatches(panel, /@media\s+print/),
    messageDependencies: message?.dependencies,
    messageRegistryDependencies: message?.registryDependencies.length,
  });
});
