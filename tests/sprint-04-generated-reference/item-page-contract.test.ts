import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * REF-009 — the unit source-contract lane for the redesigned [item].astro
 * (TR-07 R5–R12) and the in-commit region-contract re-pins.
 *
 * UNIT_TEST_JUSTIFIED: static source-contract scans over the authored .astro
 * page and the two re-pinned region-contract tests, plus dataset-derived
 * joins (registry-items.json, seam map) and sha256/git-commit checks — real
 * file reads only, no rendering, no network (the FAM-002 precedent). Rendered
 * and byte-match proof rides REF-001's flow specs in verification_gates
 * (FLOW-GEND-14/15/20/34/35, FLOW-SHELL-13/14).
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PAGE = join(repoRoot, 'apps/docs/src/pages/components/[item].astro');
const SPEC = join(repoRoot, 'tests/sprint-01-docs-spike-skeleton/component-page.spec.ts');
const PAGE_CONTRACT = join(repoRoot, 'tests/sprint-03-family-browse/page-contract.test.ts');
const REGISTRY = join(repoRoot, 'apps/docs/src/data/registry-items.json');
const SEAM_MAP = join(repoRoot, 'apps/docs/src/lib/seam-map.ts');

const PRIMITIVES = [
  'PropsTable',
  'CodeBlock',
  'ThemingNote',
  'UsageSnippet',
  'Callout',
  'QrPanel',
] as const;

/** The prebuild registry-items-v1 entry shape the item page renders from. */
interface RegistryItem {
  name: string;
  type: string;
  sourceFiles: { filename: string; text: string }[];
  props: { name: string }[];
  themingNote: string;
  usageSnippet: string;
  qrDeepLink: string;
  metaDescription: string;
}

/** The 39 registry:component entries of the real committed dataset. */
function registryComponents(): RegistryItem[] {
  expect(
    existsSync(REGISTRY),
    `registry-items.json exists at ${REGISTRY} (run the build chain)`,
  ).toBe(true);
  const items = JSON.parse(readFileSync(REGISTRY, 'utf8')) as RegistryItem[];
  return items.filter((item) => item.type === 'registry:component');
}

/** sha256 over an exact source region — the byte-identity oracle. */
const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

/** Slice between two exact markers, failing loudly when either goes missing. */
function region(text: string, startMarker: string, endMarker: string): string {
  const start = text.indexOf(startMarker);
  expect(
    start,
    `spec carries the start marker ${JSON.stringify(startMarker.slice(0, 40))}`,
  ).toBeGreaterThan(-1);
  const end = text.indexOf(endMarker, start);
  expect(
    end,
    `spec carries the end marker ${JSON.stringify(endMarker.slice(0, 40))}`,
  ).toBeGreaterThan(start);
  return text.slice(start, end);
}

/** Last commit hash that touched one path (:(literal) — the [item].astro glob). */
function lastCommitFor(path: string): string {
  return execSync(`git log -1 --format=%H -- ':(literal)${path}'`, {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
}

it('REF-009-item-page-region-contract: 6 primitive imports, 5 region markers in order, metaDescription binding, zero tab chrome / islands / placeholders', () => {
  expect(existsSync(PAGE), `[item].astro exists at ${PAGE}`).toBe(true);
  const page = readFileSync(PAGE, 'utf8');

  // TC-1 — the 6 wave-A primitives are imported AND composed; no TabGroup.
  for (const primitive of PRIMITIVES) {
    expect(
      page.match(new RegExp(`import ${primitive} from '`)),
      `imports ${primitive}`,
    ).not.toBeNull();
    expect(page, `composes <${primitive}`).toContain(`<${primitive}`);
  }
  expect(page.match(/import TabGroup from /), 'no tab chrome import').toBeNull();

  // TC-1 — the five asserted region markers render in source order, with the
  // data-verbatim dependencies panel kept between install and source.
  const markerAt = (name: string): number => page.indexOf(`<section data-section="${name}"`);
  for (const name of ['install', 'source', 'props', 'theming', 'usage']) {
    expect(markerAt(name), `renders the ${name} region marker`).toBeGreaterThan(-1);
  }
  const order = ['install', 'dependencies', 'source', 'props', 'theming', 'usage'].map(
    (name) => [name, markerAt(name)] as const,
  );
  for (let index = 1; index < order.length; index++) {
    const [previous, at] = order[index - 1];
    expect(order[index][1], `${order[index][0]} renders after ${previous}`).toBeGreaterThan(at);
  }

  // TC-2 — exactly one Layout description binding carrying item.metaDescription
  // (a real head-slot <meta name="description">), never a hand-derived string.
  expect(
    page.match(/<meta name="description" content=\{item\.metaDescription\} \/>/g) ?? [],
    'exactly one Layout description binding carries item.metaDescription',
  ).toHaveLength(1);
  const conversation = registryComponents().find((item) => item.name === 'conversation');
  expect(conversation, 'the dataset carries conversation').toBeTruthy();
  expect(
    conversation?.metaDescription.startsWith('Conversation — '),
    'conversation metaDescription starts with the dataset literal',
  ).toBe(true);
  expect(page, 'no hand-derived metaDescription sentence in the template').not.toContain(
    ' for React Native, installable via',
  );

  // TC-1 — zero-JS discipline and zero preview/placeholder chrome in the
  // authored strings (comment blocks stripped — the copy-pass precedent).
  const stripped = page.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  expect(stripped, 'no island directives').not.toContain('client:');
  expect(stripped, 'no script tag').not.toContain('<script');
  expect(stripped, 'no preview-panel element').not.toContain('data-preview-panel');
  expect(
    stripped.match(/coming soon|placeholder|lorem ipsum/i) ?? [],
    'no placeholder text',
  ).toHaveLength(0);
});

it('REF-009-code-alone-region: the {engine} byte-substitution survives once, one figure per sourceFile, zero clipping', () => {
  const page = readFileSync(PAGE, 'utf8');

  // TC-3 — the byte oracle: exactly one {engine} substitution expression.
  expect(
    page.match(/file\.text\.split\('\{engine\}'\)\.join\(DEFAULT_ENGINE\)/g) ?? [],
    'exactly 1 {engine}→DEFAULT_ENGINE substitution expression',
  ).toHaveLength(1);
  expect(page, 'DEFAULT_ENGINE stays the nativewind served default').toContain(
    "const DEFAULT_ENGINE = 'nativewind';",
  );

  // TC-3 — the mapping is a 1:1 .map: no filter/slice ever drops a file, so
  // figures == sourceFiles.length holds for every item at test time.
  expect(
    page.match(/item\.sourceFiles\.map\(/g) ?? [],
    'exactly one .map over item.sourceFiles',
  ).toHaveLength(1);
  expect(page.match(/sourceFiles\.filter\(/g) ?? [], 'no per-file drops via filter').toHaveLength(
    0,
  );
  expect(page.match(/sourceFiles\.slice\(/g) ?? [], 'no per-file drops via slice').toHaveLength(0);

  // The map emits exactly 1 <figure> per iteration: one <figure literal in the
  // source section, no conditional around it, and every dataset item carries
  // >=1 file — so the rendered figure count equals sourceFiles.length.
  const sectionStart = page.indexOf('<section data-section="source"');
  const sectionEnd = page.indexOf('</section>', sectionStart);
  expect(sectionStart, 'the source section exists').toBeGreaterThan(-1);
  expect(sectionEnd, 'the source section closes').toBeGreaterThan(sectionStart);
  const sourceSection = page.slice(sectionStart, sectionEnd);
  expect(
    sourceSection.match(/<figure class="source-file">/g) ?? [],
    'exactly 1 <figure> emitted per mapped file',
  ).toHaveLength(1);
  expect(sourceSection, 'the figure composes the CodeBlock byte surface').toContain(
    '<CodeBlock code={file.text}',
  );
  const components = registryComponents();
  expect(components, 'the dataset carries the 39 component items').toHaveLength(39);
  for (const item of components) {
    expect(
      item.sourceFiles.length,
      `${item.name} renders at least one source figure`,
    ).toBeGreaterThan(0);
  }

  // TC-4 — 0 clipping declarations anywhere in the page's styles.
  expect(page.match(/max-height/g) ?? [], '0 max-height declarations').toHaveLength(0);
  expect(page.match(/overflow:\s*hidden/g) ?? [], '0 overflow:hidden rules').toHaveLength(0);
});

it('REF-009-seams-qr-pager: seam map drives the callouts, QrPanel binds item.qrDeepLink, family pager math retained', async () => {
  const page = readFileSync(PAGE, 'utf8');

  // TC-5 — the seam map is consumed (imported, derived per item, rendered as
  // Callouts); the coverage comes from the REAL dataset, never a hardcoded list.
  expect(page, 'the page imports the seam map module').toContain("from '../../lib/seam-map'");
  expect(
    page.match(/deriveSeams\(item\.sourceFiles\)/g) ?? [],
    'per-item seam derivation',
  ).toHaveLength(1);
  expect(page.match(/seams\.map\(/g) ?? [], 'the derived seams render as Callouts').toHaveLength(1);
  const calloutAt = page.indexOf('<Callout');
  const seamsMapAt = page.indexOf('seams.map(');
  expect(calloutAt, 'the Callout composition site sits inside the seams map').toBeGreaterThan(
    seamsMapAt,
  );

  const { deriveSeams } = await import(SEAM_MAP);
  const components = registryComponents();
  const textClass = components.filter((item) =>
    deriveSeams(item.sourceFiles).includes('textclasscontext'),
  );
  const renderMarkdown = components.filter((item) =>
    deriveSeams(item.sourceFiles).includes('rendermarkdown'),
  );
  expect(textClass.map((item) => item.name).sort(), 'the 8 TextClassContext users').toEqual(
    [
      'commit',
      'environment-variables',
      'message',
      'plan',
      'prompt-input',
      'queue',
      'terminal',
      'tool',
    ].sort(),
  );
  expect(renderMarkdown.map((item) => item.name).sort(), 'the 3 renderMarkdown users').toEqual([
    'context',
    'message',
    'reasoning',
  ]);
  expect(
    new Set([...textClass.map((item) => item.name), ...renderMarkdown.map((item) => item.name)])
      .size,
    'the seam map covers 10 item names across 2 seam kinds',
  ).toBe(10);

  // TC-6 — exactly 1 QrPanel composition bound to the dataset deep link,
  // beside the Code view (after the source region, before the pager).
  expect(
    page.match(/<QrPanel item=\{item\.name\} svg=\{qrSvg\} \/>/g) ?? [],
    'exactly 1 QrPanel composition',
  ).toHaveLength(1);
  expect(
    page.match(/QRCode\.toString\(item\.qrDeepLink, \{ type: 'svg' \}\)/g) ?? [],
    'the deep link encodes at build time from the dataset',
  ).toHaveLength(1);
  expect(page, 'no hand-derived deep link in the template').not.toContain('ai-elements-example');
  const sourceAt = page.indexOf('<section data-section="source"');
  const qrAt = page.indexOf('<QrPanel');
  const pagerAt = page.indexOf('<nav class="pager"');
  expect(qrAt, 'the QrPanel aside follows the source region').toBeGreaterThan(sourceAt);
  expect(qrAt, 'the QrPanel aside precedes the family pager').toBeLessThan(pagerAt);

  // TC-7 — the within-family pager math is retained verbatim (1 prev + 1 next).
  expect(
    page.match(/% family\.itemNames\.length/g) ?? [],
    'the family-index modulo expressions survive (1 prev + 1 next)',
  ).toHaveLength(2);
  expect(page, 'prev walks the family list').toContain(
    'family.itemNames[(memberIndex - 1 + family.itemNames.length) % family.itemNames.length]',
  );
  expect(page, 'next walks the family list').toContain(
    'family.itemNames[(memberIndex + 1) % family.itemNames.length]',
  );
  expect(
    page.match(/href=\{`\/components\/\$\{(prevName|nextName)\}`\}/g) ?? [],
    'the pager nav anchors stay family members (1 prev + 1 next)',
  ).toHaveLength(2);
});

it('REF-009-spec-repins: GEND-14/15 bodies assert the five-region anatomy, legacy anchors retained, sha256 pins fresh, re-pins share the commit', () => {
  const spec = readFileSync(SPEC, 'utf8');
  const contract = readFileSync(PAGE_CONTRACT, 'utf8');

  // TC-8 — the extended GEND-14 body asserts the five-region anatomy.
  const gend14 = region(
    spec,
    "test('FLOW-GEND-14-reference-page-anatomy",
    "test.describe('FLOW-GEND-15-family-pager-stays-in-family'",
  );
  const gend15 = region(
    spec,
    "test('family pager walks each component family exactly",
    "test('FUSE-07-components-index",
  );
  let cursor = -1;
  for (const name of ['install', 'source', 'props', 'theming', 'usage']) {
    const at = gend14.indexOf(`'${name}'`, cursor + 1);
    expect(at, `the GEND-14 anatomy asserts the ${name} region in order`).toBeGreaterThan(cursor);
    cursor = at;
  }

  // The four legacy anchors survive the re-pin (file-scope selector consts and
  // body literals): chips, install section, the source-region code surface
  // (the CodeBlock island child that succeeded the sprint-03-era `pre code`
  // markup), and the family pager nav.
  expect(spec, 'the data-chip anchor survives').toContain('li[data-chip="version"]');
  expect(spec, 'the install section anchor survives').toContain('section[data-section="install"]');
  expect(spec, 'the source-region code anchor survives on the CodeBlock surface').toContain(
    'section[data-section="source"] rnr-copy-button code',
  );
  expect(spec, 'the pager nav anchor survives').toContain('nav[aria-label="Family pager"]');

  // Extend-never-delete: the pre-existing source assertions remain (per-item
  // figure count, served-JSON byte compare, no max-height).
  expect(gend14, 'the per-item source count assertion survives').toContain(
    'item.sourceFiles.length',
  );
  expect(gend14, 'the byte-compare against the served registry JSON survives').toContain(
    'served.files[index].content',
  );
  expect(gend14, 'the no-clipping guard survives').toContain('max-height');

  // TC-8 — the 2 sha256 pins in page-contract.test.ts equal hashes computed
  // over the EXTENDED bodies, and the stale sprint-03 pins are gone.
  const gend14Hash = sha256(gend14);
  const gend15Hash = sha256(gend15);
  expect(
    contract.includes(gend14Hash),
    'the FLOW-GEND-14 pin matches the extended body at commit time',
  ).toBe(true);
  expect(
    contract.includes(gend15Hash),
    'the FLOW-GEND-15 pin matches the extended body at commit time',
  ).toBe(true);
  expect(
    contract.includes('ab81c00bf80919a236f48165c35c10f6e23d8b08ac081ebf02ae76054d4e4e45'),
    'the stale sprint-03 GEND-14 pin is re-pinned',
  ).toBe(false);
  expect(
    contract.includes('8c77cc2642bc90f8a98c25105b8969cfb50f10b9ebf001efd7d4887402267cd1'),
    'the stale sprint-03 GEND-15 pin is re-pinned',
  ).toBe(false);

  // TC-8 — the three re-pin paths share ONE commit (the invariant that caught
  // the sprint-04 split-re-pin defect); the page change is committed
  // independently, so a later task may edit [item].astro without re-pinning.
  const pageCommit = lastCommitFor('apps/docs/src/pages/components/[item].astro');
  const specCommit = lastCommitFor('tests/sprint-01-docs-spike-skeleton/component-page.spec.ts');
  const contractCommit = lastCommitFor('tests/sprint-03-family-browse/page-contract.test.ts');
  const laneCommit = lastCommitFor(
    'tests/sprint-04-generated-reference/item-page-contract.test.ts',
  );
  expect(pageCommit, 'the page change is committed').not.toBe('');
  expect(
    new Set([specCommit, contractCommit, laneCommit]).size,
    'the three re-pin paths share one commit',
  ).toBe(1);
});
