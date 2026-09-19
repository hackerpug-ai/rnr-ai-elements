import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

/**
 * REF-010 lane contract — the /components single-owner additions: the
 * engine-tabbed copyable family add command inside each anchored family
 * section, and the trailing no-id DevClientMatrix section. Four test
 * functions, one per AC, each selected by `vitest run ... -t REF-010-<name>`.
 *
 * UNIT_TEST_JUSTIFIED (all four): static source-contract scans over the
 * authored page/component sources plus real file reads (families.json,
 * registry-items.json, dev-client-matrix.json) and real git subprocesses
 * (byte-comparison of the sprint-03 grid lane) — no rendering, no network,
 * no DB (FAM-002 precedent). Rendered proof rides REF-001's
 * dev-client-matrix.spec.ts + site-crawl.spec.ts lanes.
 *
 * RED at task start: DevClientMatrix.astro is absent (ENOENT names it), the
 * InstallCommand family variant does not exist, and index.astro composes
 * neither. The grid-lane boundary guard is green on both sides of the task —
 * it exists to fail the moment the lane is touched.
 */
const ROOT = process.cwd();
const PAGE_PATH = join(ROOT, 'apps/docs/src/pages/components/index.astro');
const INSTALL_PATH = join(ROOT, 'apps/docs/src/components/InstallCommand.astro');
const MATRIX_COMPONENT_PATH = join(ROOT, 'apps/docs/src/components/DevClientMatrix.astro');
const FAMILIES_PATH = join(ROOT, 'apps/docs/src/data/families.json');
const REGISTRY_PATH = join(ROOT, 'apps/docs/src/data/registry-items.json');
const MATRIX_DATA_PATH = join(ROOT, 'apps/docs/src/data/dev-client-matrix.json');
const ITEM_PAGE_PATH = join(ROOT, 'apps/docs/src/pages/components/[item].astro');
const TAB_GROUP_PATH = join(ROOT, 'apps/docs/src/components/islands/TabGroup.astro');

interface Item {
  name: string;
  type: string;
}

interface Family {
  id: string;
  title: string;
  order: number;
  itemNames: string[];
}

type MatrixEntry = {
  id: string;
  label: string;
  peers: { name: string; range: string }[];
  permissions: { ios: string[]; android: string[] };
};

/** The sprint-03 merge commit whose blob is the grid spec's byte baseline. */
const GRID_SPEC_MERGE = '49c2d8e9f60f62f2c7268b4d0dbe60c151a6039e';
const GRID_SPEC = 'tests/sprint-03-family-browse/components-family-grid.spec.ts';

function readExisting(path: string, hint: string): string {
  expect(existsSync(path), `${path} exists (${hint})`).toBe(true);
  return readFileSync(path, 'utf8');
}

/** Same derivation as the page: all-component families in families.json order. */
function componentFamilies(): Family[] {
  const families = JSON.parse(readFileSync(FAMILIES_PATH, 'utf8')) as Family[];
  const items = JSON.parse(readExisting(REGISTRY_PATH, 'run the docs prebuild')) as Item[];
  const componentNames = new Set(
    items.filter((item) => item.type === 'registry:component').map((item) => item.name),
  );
  return families
    .filter((family) => family.itemNames.every((name) => componentNames.has(name)))
    .sort((a, b) => a.order - b.order);
}

/** The locked single-item command shape (byte-pinned by island-budget). */
function singleItemCommand(engine: string, item: string): string {
  return `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/${engine}/${item}.json`;
}

/** The family shape: ONE add invocation listing every item's absolute URL. */
function familyCommand(engine: string, names: readonly string[]): string {
  return `npx @react-native-reusables/cli@latest add ${names
    .map((name) => `https://rnraielements.com/r/${engine}/${name}.json`)
    .join(' ')}`;
}

const ABSOLUTE_URL = /^https:\/\/rnraielements\.com\/r\/[a-z]+\/[a-z0-9-]+\.json$/;

function count(source: string, pattern: RegExp): number {
  return source.match(pattern)?.length ?? 0;
}

/**
 * AC-1 / TC-1 + TC-2 — index.astro composes DevClientMatrix after the family
 * map inside a section carrying no id attribute; the component imports
 * DataTable + Badge and derives its 4 rows from dev-client-matrix.json with
 * no hand-rolled table and no a[data-card].
 */
it('REF-010-matrix-section-contract', () => {
  const page = readExisting(PAGE_PATH, 'the authored components page');
  const matrixSource = readExisting(MATRIX_COMPONENT_PATH, 'the REF-010 trailing matrix component');

  // Exactly one composition, positioned after the family map in source order.
  expect(count(page, /<DevClientMatrix\b/g), 'exactly one DevClientMatrix mount').toBe(1);
  const mountAt = page.indexOf('<DevClientMatrix');
  expect(mountAt, 'the matrix mounts after the componentFamilies.map family grid').toBeGreaterThan(
    page.indexOf('componentFamilies.map'),
  );

  // No id anywhere in the mounted component — the wrapping section is id-less,
  // so /components keeps exactly its seven anchored family sections.
  expect(
    count(matrixSource, /\bid=/g),
    'the matrix component carries 0 id attributes (no eighth anchored section)',
  ).toBe(0);
  expect(count(matrixSource, /<section\b/g), 'the component wraps one section').toBe(1);
  expect(
    matrixSource.match(/<section\b[^>]*>/)?.[0],
    'the wrapping section tag itself carries no id',
  ).not.toMatch(/\bid=/);

  // No cards: the matrix renders rows, never an a[data-card].
  expect(
    count(matrixSource, /data-card/g),
    'the matrix component emits 0 a[data-card] elements',
  ).toBe(0);

  // Consumption anchors: DataTable (REF-006) + Badge + the dataset (REF-007).
  expect(matrixSource, 'imports the generic DataTable primitive').toContain(
    "import DataTable from './DataTable.astro'",
  );
  expect(matrixSource, 'imports the Badge verdict pattern').toContain(
    "import Badge from './Badge.astro'",
  );
  expect(matrixSource, 'reads the dev-client-matrix dataset at build').toContain(
    "from '../data/dev-client-matrix.json'",
  );
  expect(matrixSource, 'maps the dataset into rows').toContain('.map(');

  // No hand-rolled <table> bypassing DataTable; zero JS in the component.
  expect(count(matrixSource, /<table\b/g), 'no hand-rolled table (DataTable owns it)').toBe(0);
  expect(matrixSource, 'no script in the component').not.toMatch(/<script/i);
  expect(matrixSource, 'no client: directive in the component').not.toContain('client:');

  // The rows derive from the committed 4-entry dataset (names, peers,
  // permissions joined from the JSON).
  const matrix = JSON.parse(readExisting(MATRIX_DATA_PATH, 'the REF-007 dataset')) as MatrixEntry[];
  expect(matrix.map((entry) => entry.id)).toEqual([
    'enriched-markdown',
    'streamdown',
    'speech-recognition',
    'extended-audio',
  ]);
  const derivedRows = matrix.map((entry) => ({
    label: entry.label,
    peers: entry.peers.map((peer) => `${peer.name} ${peer.range}`),
    ios: entry.permissions.ios,
    android: entry.permissions.android,
  }));
  expect(derivedRows, 'the dataset joins into exactly 4 matrix rows').toHaveLength(4);
  for (const row of derivedRows) {
    expect(row.label.trim().length, 'row label non-empty').toBeGreaterThan(0);
    expect(row.peers.length, 'row has peers').toBeGreaterThan(0);
    expect(row.ios.length, 'row has ios permissions').toBeGreaterThan(0);
    expect(row.android.length, 'row has android permissions').toBeGreaterThan(0);
  }
  console.log(
    `[REF-010] matrix rows derived from the dataset: ${derivedRows
      .map((row) => `${row.label} (${row.peers.length} peers)`)
      .join('; ')}`,
  );
});

/**
 * AC-2 / TC-3 + TC-4 + TC-7 — the InstallCommand family variant: one add
 * invocation per engine panel listing every family item's absolute URL in
 * families.json order, through the reused TabGroup + CopyButton pair, while
 * the single-item form used by [item].astro stays byte-identical.
 */
it('REF-010-family-command-variant', () => {
  const install = readExisting(INSTALL_PATH, 'the install command composite');
  const tabGroup = readExisting(TAB_GROUP_PATH, 'the reused tabs island');

  // The variant accepts a family items list beside the untouched single item.
  expect(install, 'the family variant prop exists').toMatch(/items\?:/);
  expect(install, 'the single-item prop stays declared').toMatch(/\bitem\?:/);

  // Reuse, not fork: the SAME TabGroup + CopyButton pair with the rnr-engine
  // storage key — exactly one TabGroup and two CopyButtons in source (the
  // sprint-01 island-budget lock), one slot per engine, zero new islands.
  expect(install, 'imports TabGroup').toContain("import TabGroup from './islands/TabGroup.astro'");
  expect(install, 'imports CopyButton').toContain(
    "import CopyButton from './islands/CopyButton.astro'",
  );
  expect(count(install, /<TabGroup\b/g), 'exactly one TabGroup (reused, not forked)').toBe(1);
  expect(count(install, /<CopyButton\b/g), 'CopyButton embedded per engine panel').toBe(2);
  expect(count(install, /<Fragment slot=/g), 'one panel slot per engine').toBe(2);
  expect(tabGroup, 'the reused TabGroup persists the rnr-engine storage key').toContain(
    'storage-key="rnr-engine"',
  );
  expect(install, 'zero new islands: no client: directive').not.toContain('client:');
  expect(install, 'zero new islands: no script').not.toMatch(/<script/i);
  expect(install, 'no copy logic of its own').not.toContain('navigator.clipboard');

  // Absolute URLs only — never a short or relative form.
  expect(install, 'absolute registry host in the command templates').toContain(
    'https://rnraielements.com/r/',
  );
  expect(
    count(install, /rnraielements\.com/g),
    'every registry host mention is the https absolute form',
  ).toBe(count(install, /https:\/\/rnraielements\.com/g));
  expect(install, 'no relative /r/ command form').not.toMatch(/add\s+['"`]?\/r\//);

  // ONE add invocation per engine panel: the family builder joins every item's
  // URL into a single command string.
  const familyBuilder = install.match(/function familyCommand[\s\S]*?\n\}/)?.[0];
  expect(familyBuilder, 'the family command builder exists').toBeDefined();
  expect(
    count(familyBuilder ?? '', /cli@latest add/g),
    'the family builder emits exactly one add invocation',
  ).toBe(1);
  expect(familyBuilder, 'the family builder joins all item URLs into the one command').toContain(
    ".join(' ')",
  );
  expect(familyBuilder, 'the family builder URLs carry the engine in the path').toMatch(
    /https:\/\/rnraielements\.com\/r\/\$\{engine\}\//,
  );

  // Pure derivation over the REAL families.json: conversation lists 3 URLs,
  // tool lists 11, each absolute, in families.json order.
  const families = componentFamilies();
  const conversation = families.find((family) => family.id === 'conversation');
  const tool = families.find((family) => family.id === 'tool');
  expect(conversation, 'the conversation family is in the join').toBeDefined();
  expect(tool, 'the tool family is in the join').toBeDefined();

  for (const engine of ['nativewind', 'uniwind'] as const) {
    const conversationCommand = familyCommand(engine, conversation?.itemNames ?? []);
    const conversationUrls = conversationCommand.match(/https:\/\/\S+\.json/g) ?? [];
    expect(
      conversationUrls,
      `conversation ${engine}: one command lists all 3 item URLs`,
    ).toHaveLength(3);
    for (const [index, url] of conversationUrls.entries()) {
      expect(url, `conversation ${engine} URL ${index} is absolute`).toMatch(ABSOLUTE_URL);
      expect(url, `conversation ${engine} URL ${index} preserves families.json order`).toContain(
        `/${conversation?.itemNames[index]}.json`,
      );
    }
    expect(
      conversationCommand.indexOf(conversationUrls[0] ?? ''),
      'the single invocation precedes its URLs',
    ).toBeLessThan(conversationCommand.indexOf(conversationUrls[1] ?? ''));

    const toolCommand = familyCommand(engine, tool?.itemNames ?? []);
    const toolUrls = toolCommand.match(/https:\/\/\S+\.json/g) ?? [];
    expect(toolUrls, `tool ${engine}: one command lists all 11 item URLs`).toHaveLength(11);
    for (const [index, url] of toolUrls.entries()) {
      expect(url, `tool ${engine} URL ${index} is absolute`).toMatch(ABSOLUTE_URL);
      expect(url, `tool ${engine} URL ${index} preserves families.json order`).toContain(
        `/${tool?.itemNames[index]}.json`,
      );
    }
    console.log(`[REF-010] ${engine} conversation command: ${conversationCommand}`);
  }

  // TC-7: the single-item form is byte-compatible — the locked template
  // literal survives verbatim (island-budget byte-pin), a one-item family
  // command equals the single-item formula, and [item].astro's composition
  // is unchanged.
  expect(
    install.match(
      /`npx @react-native-reusables\/cli@latest add https:\/\/rnraielements\.com\/r\/\$\{engine\}\/\$\{item\}\.json`/,
    ),
    'the locked single-item template literal survives byte-for-byte',
  ).not.toBeNull();
  for (const engine of ['nativewind', 'uniwind']) {
    expect(familyCommand(engine, ['conversation']), 'one-item family command').toBe(
      singleItemCommand(engine, 'conversation'),
    );
  }
  const itemPage = readExisting(ITEM_PAGE_PATH, 'the item detail page');
  expect(count(itemPage, /<InstallCommand\b/g), 'exactly one InstallCommand on [item]').toBe(1);
  expect(itemPage, 'the single-item composition is unchanged').toContain(
    '<InstallCommand item={item.name} />',
  );
});

/**
 * AC-3 / TC-5 — index.astro keeps its derived join: section id bindings come
 * solely from componentFamilies.map (7 rendered sections), the InstallCommand
 * family variant composes inside the family map, and the jump nav, mount
 * slot, and LedgerFilter anchors survive with zero hardcoded family ids.
 */
it('REF-010-components-page-contract', () => {
  const page = readExisting(PAGE_PATH, 'the authored components page');
  const families = componentFamilies();
  expect(
    families.map((family) => family.id),
    'the join still yields exactly the 7 component families in order',
  ).toEqual([
    'conversation',
    'message',
    'prompt-input',
    'reasoning',
    'sources',
    'suggestion',
    'tool',
  ]);

  // Section ids derive solely from the map: one template, one binding site,
  // seven rendered sections.
  expect(count(page, /<section\b/g), 'one section template (inside the family map)').toBe(1);
  expect(count(page, /id=\{family\.id\}/g), 'one section id binding site').toBe(1);
  expect(
    page.match(/<section\b[^>]*>/)?.[0],
    'the section template binds id={family.id}',
  ).toContain('id={family.id}');
  expect(families, 'seven rendered family sections').toHaveLength(7);

  // The family command composes INSIDE the family map — one composition site,
  // after the join opens, before the trailing matrix mounts.
  const mapAt = page.indexOf('componentFamilies.map');
  const installAt = page.indexOf('<InstallCommand');
  const matrixAt = page.indexOf('<DevClientMatrix');
  expect(count(page, /<InstallCommand\b/g), 'one InstallCommand composition site').toBe(1);
  expect(
    installAt,
    'the family command sits inside the componentFamilies.map section',
  ).toBeGreaterThan(mapAt);
  expect(installAt, 'the family command precedes the trailing matrix mount').toBeLessThan(matrixAt);
  expect(page, 'the composition passes the family items').toContain(
    '<InstallCommand items={family.itemNames} />',
  );

  // The three structural anchors survive untouched.
  expect(count(page, /<nav class="family-jump"/g), 'the family jump nav is retained').toBe(1);
  expect(
    count(page, /<div class="family-grid-slot"><\/div>/g),
    'the family-grid mount slot is retained',
  ).toBe(1);
  expect(count(page, /<LedgerFilter\b/g), 'the LedgerFilter mount is retained').toBe(1);
  expect(
    count(page, /href=\{`#\$\{family\.id\}`\}/g),
    'the jump nav anchor binding is unmodified',
  ).toBe(1);

  // Zero hardcoded family id literals — every id derives from families.json.
  const allFamilies = JSON.parse(readFileSync(FAMILIES_PATH, 'utf8')) as Family[];
  for (const family of allFamilies) {
    expect(page, `family id ${family.id} is derived, never hardcoded`).not.toContain(
      `'${family.id}'`,
    );
  }
});

/**
 * AC-4 / TC-6 — the sprint-03 grid lane stays green untouched: clean status,
 * byte-match against its merge-commit blob, derived counts and locked grep
 * intact. The stop-and-declare boundary.
 */
it('REF-010-grid-lane-untouched', () => {
  const gitStatus = execSync('git status --porcelain -- tests/sprint-03-family-browse/', {
    cwd: ROOT,
    encoding: 'utf8',
  });
  expect(gitStatus.trim(), 'git status over the sprint-03 lane prints 0 lines').toBe('');

  const blobDiff = execSync(`git diff ${GRID_SPEC_MERGE}..HEAD -- ${GRID_SPEC}`, {
    cwd: ROOT,
    encoding: 'utf8',
  });
  expect(
    blobDiff,
    'the grid spec byte-matches its sprint-03 merge-commit blob (0 tolerance edits)',
  ).toBe('');

  const gridSpec = readExisting(join(ROOT, GRID_SPEC), 'the pinned grid lane');
  expect(
    gridSpec,
    'the grid spec still asserts the derived componentFamilies.length sections',
  ).toContain('componentFamilies.length');
  expect(gridSpec, 'the grid spec still asserts the derived components.length cards').toContain(
    'components.length',
  );
  expect(gridSpec, 'the locked FLOW-GEND-07 grep target is intact').toContain(
    'FLOW-GEND-07-components-page-39-in-7-families',
  );
});
