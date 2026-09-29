/**
 * GBC-004 — the /porting manuscript source scan (AC-2, AC-4, AC-5).
 *
 * Read-only over the authored sources: apps/docs/src/content/docs/porting.md,
 * the boundary manuscript (owns-vs-does-not-own.mdx — GBC-003 renames the .md;
 * whichever exists on disk is the manuscript), and the tracked
 * packages/registry/registry.json. No build, no network, no browser.
 *
 * Frontmatter parses through Astro's own parser — the same single authority
 * GBC-012's build gate uses (@astrojs/internal-helpers/frontmatter, resolved
 * through the astro install that apps/docs owns) — so this scan's view of the
 * mapping / notPorted / upstream arrays can never drift from the gate's.
 *
 * Named checks (one per unit AC):
 *   - notPorted is the exact complement of mapping over upstream  (AC-2)
 *   - prior-art hrefs are absolute https                          (AC-4)
 *   - porting source carries no boundary table copy               (AC-5)
 *
 * The final describe holds the mutation controls: each check re-runs over a
 * $TMPDIR copy of the real manuscript with one planted drift, and must fail
 * naming the offender. Nothing under apps/ or packages/ is ever written.
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const PORTING_PATH = join(ROOT, 'apps/docs/src/content/docs/porting.md');
const REGISTRY_PATH = join(ROOT, 'packages/registry/registry.json');
/** GBC-003 renames owns-vs-does-not-own.md to .mdx; either is the manuscript. */
const BOUNDARY_PATHS = [
  join(ROOT, 'apps/docs/src/content/docs/owns-vs-does-not-own.mdx'),
  join(ROOT, 'apps/docs/src/content/docs/owns-vs-does-not-own.md'),
];

/** The two prior-art URLs TR-12's link gate already fails hard on. */
const PRIOR_ART_URLS = [
  'https://elements.ai-sdk.dev',
  'https://github.com/muratcakmak/expo-ai-elements',
] as const;

interface MappingEntry {
  upstream: string;
  item: string;
}

interface PortingFrontmatter {
  mapping: MappingEntry[];
  notPorted: string[];
  upstream: string[];
}

/** Astro's own frontmatter parser, reached exactly the way GBC-012's gate reaches it. */
async function parseFrontmatterWithAstro(text: string): Promise<Record<string, unknown>> {
  const requireFromDocs = createRequire(pathToFileURL(join(ROOT, 'apps/docs/package.json')));
  const astroPackagePath = requireFromDocs.resolve('astro/package.json');
  const requireFromAstro = createRequire(astroPackagePath);
  const helperPath = requireFromAstro.resolve('@astrojs/internal-helpers/frontmatter');
  const { parseFrontmatter } = (await import(helperPath)) as {
    parseFrontmatter: (input: string) => { frontmatter: Record<string, unknown> };
  };
  return parseFrontmatter(text).frontmatter;
}

function readPorting(): string {
  if (!existsSync(PORTING_PATH)) {
    throw new Error(
      `[GBC-004] content failure: ${PORTING_PATH} is missing — the /porting manuscript is the authored source this scan reads`,
    );
  }
  return readFileSync(PORTING_PATH, 'utf8');
}

/** The three structured arrays as Astro's loader sees them. */
function frontmatterArrays(fm: Record<string, unknown>): PortingFrontmatter {
  const mapping = fm.mapping;
  const notPorted = fm.notPorted;
  const upstream = fm.upstream;
  if (!Array.isArray(mapping) || !Array.isArray(notPorted) || !Array.isArray(upstream)) {
    throw new Error(
      '[GBC-004] content failure: porting.md frontmatter must carry mapping, notPorted and upstream as arrays',
    );
  }
  return {
    mapping: mapping as MappingEntry[],
    notPorted: notPorted as string[],
    upstream: upstream as string[],
  };
}

/** The 56 registry item names from the tracked registry (never the generated ledger). */
function registryNames(): string[] {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
    items: { name: string }[];
  };
  const names = registry.items.map((item) => item.name);
  if (names.length !== 56) {
    throw new Error(
      `[GBC-004] source failure: packages/registry/registry.json carries ${names.length} items, expected the 56-item ledger`,
    );
  }
  return names;
}

/** The markdown body under one ATX heading, up to the next heading of any level. */
function sectionUnder(text: string, heading: string): string {
  const pattern = new RegExp(`^#{1,6}\\s+${heading}\\s*$`, 'm');
  const match = pattern.exec(text);
  if (!match || match.index === undefined) {
    throw new Error(`[GBC-004] source failure: porting.md has no '${heading}' heading`);
  }
  const rest = text.slice(match.index + match[0].length);
  const next = rest.search(/^#{1,6}\s/m);
  return next === -1 ? rest : rest.slice(0, next);
}

const TABLE_DELIMITER = /^[\s|:-]+$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function normalizeCell(cell: string): string {
  return cell
    .replace(/[`*_[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Normalized header rows of every GFM table in the text ('' cells dropped). */
function tableHeaderRows(text: string): string[] {
  const lines = text.split('\n');
  const headers: string[] = [];
  for (let i = 0; i < lines.length - 1; i += 1) {
    const line = lines[i];
    const next = lines[i + 1];
    if (!line.trim().startsWith('|')) {
      continue;
    }
    if (!TABLE_DELIMITER.test(next) || !next.includes('-')) {
      continue;
    }
    const cells = splitRow(line)
      .map(normalizeCell)
      .filter((cell) => cell.length > 0);
    if (cells.length > 0) {
      headers.push(cells.join(' | '));
    }
  }
  return headers;
}

interface MappingRow {
  upstream: string;
  itemHref: string;
  itemSlug: string;
  deviations: string;
}

/** The rendered mapping table under '## Mapping': header cells plus one parsed body row each. */
// fallow-ignore-next-line complexity
function mappingTable(text: string): { header: string[]; rows: MappingRow[] } {
  const section = sectionUnder(text, 'Mapping');
  const lines = section.split('\n');
  let header: string[] | null = null;
  const rows: MappingRow[] = [];
  for (const line of lines) {
    if (!line.trim().startsWith('|')) {
      continue;
    }
    // A delimiter row (| --- | --- |) separates header from body — never a data row.
    if (TABLE_DELIMITER.test(line) && line.includes('-')) {
      continue;
    }
    const cells = splitRow(line);
    if (header === null) {
      header = cells.map(normalizeCell);
      continue;
    }
    const link = /\[[^\]]*\]\(\/components\/([a-z0-9-]+)\)/.exec(line);
    rows.push({
      upstream: normalizeCell(cells[0] ?? ''),
      itemHref: link ? `/components/${link[1]}` : '',
      itemSlug: link ? link[1] : '',
      deviations: (cells[2] ?? '').trim(),
    });
  }
  if (header === null) {
    throw new Error(
      "[GBC-004] source failure: no GFM table under porting.md's '## Mapping' heading",
    );
  }
  return { header, rows };
}

/** The '- `slug` — reason' entries of the rendered not-ported list. */
function notPortedListEntries(text: string): string[] {
  const section = sectionUnder(text, 'Not ported');
  const entries: string[] = [];
  for (const line of section.split('\n')) {
    const match = /^-\s+`([a-z0-9-]+)`/.exec(line.trim());
    if (match) {
      entries.push(match[1]);
    }
  }
  return entries;
}

/** Every markdown anchor in the text: { text, target }. */
function markdownAnchors(text: string): { text: string; target: string }[] {
  const anchors: { text: string; target: string }[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let match = pattern.exec(text);
  while (match !== null) {
    anchors.push({ text: match[1], target: match[2] });
    match = pattern.exec(text);
  }
  return anchors;
}

/** AC-2 checker: complement arithmetic plus ledger resolution, over any frontmatter. */
// fallow-ignore-next-line complexity
function complementDiagnostics(fm: PortingFrontmatter, ledger: string[]): string[] {
  const diagnostics: string[] = [];
  const ledgerSet = new Set(ledger);
  const mappedUpstream = fm.mapping.map((entry) => entry.upstream);
  if (fm.mapping.length + fm.notPorted.length !== fm.upstream.length) {
    diagnostics.push(
      `[GBC-004] mapping (${fm.mapping.length}) + notPorted (${fm.notPorted.length}) != upstream (${fm.upstream.length})`,
    );
  }
  const overlap = mappedUpstream.filter((name) => fm.notPorted.includes(name));
  if (overlap.length > 0) {
    diagnostics.push(`[GBC-004] elements in both mapping and notPorted: ${overlap.join(', ')}`);
  }
  const union = new Set<string>([...mappedUpstream, ...fm.notPorted]);
  const upstreamSet = new Set(fm.upstream);
  for (const name of union) {
    if (!upstreamSet.has(name)) {
      diagnostics.push(`[GBC-004] "${name}" is mapped or not-ported but absent from upstream`);
    }
  }
  for (const name of upstreamSet) {
    if (!union.has(name)) {
      diagnostics.push(`[GBC-004] upstream element "${name}" is in neither mapping nor notPorted`);
    }
  }
  if (new Set(mappedUpstream).size !== mappedUpstream.length) {
    diagnostics.push('[GBC-004] mapping carries duplicate upstream entries');
  }
  const shipped = fm.notPorted.filter((name) => ledgerSet.has(name));
  if (shipped.length > 0) {
    diagnostics.push(`[GBC-004] notPorted names shipped registry items: ${shipped.join(', ')}`);
  }
  const unresolved = fm.mapping.filter((entry) => !ledgerSet.has(entry.item));
  if (unresolved.length > 0) {
    diagnostics.push(
      `[GBC-004] mapping slugs outside the 56-item ledger: ${unresolved
        .map((entry) => `${entry.upstream} -> ${entry.item}`)
        .join(', ')}`,
    );
  }
  return diagnostics;
}

/** AC-4 checker: both prior-art URLs present as anchors, absolute https. */
function priorArtHttpsDiagnostics(text: string): string[] {
  const diagnostics: string[] = [];
  const anchors = markdownAnchors(text);
  for (const url of PRIOR_ART_URLS) {
    const matching = anchors.filter((anchor) => anchor.target === url);
    if (matching.length === 0) {
      diagnostics.push(`[GBC-004] prior-art URL ${url} is not an anchor in porting.md`);
      continue;
    }
    if (matching.length > 1) {
      diagnostics.push(
        `[GBC-004] prior-art URL ${url} is anchored ${matching.length} times, expected 1`,
      );
    }
    if (!url.startsWith('https://')) {
      diagnostics.push(`[GBC-004] prior-art href ${url} is not an absolute https URL`);
    }
    if (matching.some((anchor) => anchor.text.trim().length === 0)) {
      diagnostics.push(`[GBC-004] prior-art anchor for ${url} has empty text`);
    }
  }
  return diagnostics;
}

/** AC-5 checker: no porting table header row matches a boundary manuscript header row. */
function boundaryCopyDiagnostics(portingText: string, boundaryTexts: string[]): string[] {
  const diagnostics: string[] = [];
  const boundaryHeaders = new Set(boundaryTexts.flatMap((text) => tableHeaderRows(text)));
  for (const header of tableHeaderRows(portingText)) {
    if (boundaryHeaders.has(header)) {
      diagnostics.push(
        `[GBC-004] porting.md table header "${header}" duplicates a boundary manuscript table (single-canonical rule)`,
      );
    }
  }
  return diagnostics;
}

function boundaryManuscriptTexts(): string[] {
  const texts = BOUNDARY_PATHS.filter((path) => existsSync(path)).map((path) =>
    readFileSync(path, 'utf8'),
  );
  if (texts.length === 0) {
    throw new Error(
      '[GBC-004] source failure: no owns-vs-does-not-own manuscript (.mdx or .md) on disk to compare tables against',
    );
  }
  return texts;
}

describe('GBC-004 porting-content source scan', () => {
  it('notPorted is the exact complement of mapping over upstream', async () => {
    const text = readPorting();
    const fm = frontmatterArrays(await parseFrontmatterWithAstro(text));
    const ledger = registryNames();

    expect(complementDiagnostics(fm, ledger)).toEqual([]);

    // The rendered mapping table and the rendered not-ported list carry exactly
    // the frontmatter pairs — one source of truth, no drift either direction.
    const table = mappingTable(text);
    expect(table.rows.length).toBeGreaterThanOrEqual(5);
    expect(table.rows.length).toBe(fm.mapping.length);
    expect(table.header).toContain('deviations');
    const DEVIATION_KINDS = ['None —', 'Adapted —', 'Substituted —'];
    for (const row of table.rows) {
      const pair = fm.mapping.find((entry) => entry.upstream === row.upstream);
      expect(pair).toBeDefined();
      expect(row.itemHref).toBe(`/components/${pair?.item ?? ''}`);
      // The page claims every Deviations cell names one of three kinds.
      expect(
        DEVIATION_KINDS.some((kind) => row.deviations.startsWith(kind)),
        `row ${row.upstream}: deviations cell must start with None, Adapted, or Substituted`,
      ).toBe(true);
      expect(row.deviations.length).toBeGreaterThan(0);
    }
    const rowSlugs = table.rows.map((row) => row.itemSlug).sort();
    expect(rowSlugs).toEqual([...fm.mapping.map((entry) => entry.item)].sort());

    const listEntries = notPortedListEntries(text);
    expect([...listEntries].sort()).toEqual([...fm.notPorted].sort());
  });

  it('prior-art hrefs are absolute https', () => {
    expect(priorArtHttpsDiagnostics(readPorting())).toEqual([]);
  });

  it('porting source carries no boundary table copy', () => {
    expect(boundaryCopyDiagnostics(readPorting(), boundaryManuscriptTexts())).toEqual([]);
  });
});

describe('GBC-004 mutation controls over $TMPDIR copies', () => {
  /** Copy the real manuscript to owned scratch with one planted drift applied. */
  function mutatedCopy(mutate: (text: string) => string): { dir: string; text: string } {
    const dir = mkdtempSync(join(tmpdir(), 'gbc-004-'));
    writeFileSync(join(dir, 'porting.md'), mutate(readPorting()), 'utf8');
    return { dir, text: readFileSync(join(dir, 'porting.md'), 'utf8') };
  }

  it('a notPorted entry removed from the list is reported as untracked upstream', async () => {
    const { dir, text } = mutatedCopy((source) => source.replace(/\n {2}- jsx-preview\n/, '\n'));
    const fm = frontmatterArrays(await parseFrontmatterWithAstro(text));
    const diagnostics = complementDiagnostics(fm, registryNames());
    rmSync(dir, { recursive: true, force: true });
    expect(diagnostics.join('\n')).toContain('jsx-preview');
    expect(diagnostics.length).toBeGreaterThan(0);
  });

  it('a mapping slug that resolves to nothing is reported against the ledger', async () => {
    const { dir, text } = mutatedCopy((source) =>
      source.replace(/item: conversation/, 'item: chat-conversation'),
    );
    const fm = frontmatterArrays(await parseFrontmatterWithAstro(text));
    const diagnostics = complementDiagnostics(fm, registryNames());
    rmSync(dir, { recursive: true, force: true });
    expect(diagnostics.join('\n')).toContain('chat-conversation');
  });

  it('a scheme-less prior-art href is reported as not absolute https', () => {
    const { dir, text } = mutatedCopy((source) =>
      source.replace('(https://elements.ai-sdk.dev)', '(elements.ai-sdk.dev)'),
    );
    const diagnostics = priorArtHttpsDiagnostics(text);
    rmSync(dir, { recursive: true, force: true });
    expect(diagnostics.join('\n')).toContain('elements.ai-sdk.dev');
    expect(diagnostics.length).toBeGreaterThan(0);
  });

  it('a boundary table sharing porting.md header row is reported as a copy', () => {
    const portingText = readPorting();
    const mappingHeader = tableHeaderRows(sectionUnder(portingText, 'Mapping'))[0];
    const dir = mkdtempSync(join(tmpdir(), 'gbc-004-'));
    writeFileSync(
      join(dir, 'owns-vs-does-not-own.mdx'),
      `${boundaryManuscriptTexts()[0]}\n\n| Upstream element | Registry item | Deviations |\n| --- | --- | --- |\n| x | y | z |\n`,
      'utf8',
    );
    const diagnostics = boundaryCopyDiagnostics(portingText, [
      readFileSync(join(dir, 'owns-vs-does-not-own.mdx'), 'utf8'),
    ]);
    rmSync(dir, { recursive: true, force: true });
    expect(diagnostics.join('\n')).toContain(mappingHeader);
    expect(diagnostics.length).toBeGreaterThan(0);
  });
});
