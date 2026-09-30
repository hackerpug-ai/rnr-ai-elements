/**
 * GBC-006 — the sprint-06 content reconciliation pass: the TR-12 terminology
 * lock and the human-gate cross-check invariant (boundary gaps list, 56-item
 * ledger, /porting not-ported list — zero contradictions, zero omissions).
 *
 * UNIT_TEST_JUSTIFIED (task contract): AC-1, AC-2, AC-4 and AC-5 are pure set
 * logic and string scans over local markdown, one tracked JSON file and
 * in-memory fixtures — no network, no database, no build. The rendered-preview
 * proof of the same invariant is AC-3's FLOW-DOCS-05 spec
 * (porting-map.spec.ts, owned by GBC-009/GBC-014): this task must keep it
 * passing but never edits it.
 *
 * Matching semantics (GBC-003 handoff, review-endorsed): "a gap names a
 * shipped item" is EXACT case-insensitive equality between the gap string and
 * a ledger name — never a substring match, because 'Tool execution' must not
 * false-flag against the shipped 'tool' item — optionally plus the
 * absence-claim phrasing mirrored from boundary-tables.spec.ts's
 * gapRowNamesItem oracle.
 *
 * The ledger is read from the tracked packages/registry/registry.json (56
 * items), never from generated data; frontmatter parses through Astro's own
 * parser, the same single authority the build gate uses.
 *
 * Named checks (one per unit AC):
 *   - gaps, ledger and not-ported reconcile with zero contradictions and
 *     omissions                                                    (AC-1)
 *   - terminology lock holds and every authored page has a verdict
 *     row                                                          (AC-2)
 *   - planted gap naming a shipped item is rejected by name        (AC-4)
 *   - porting source has no boundary table copy                     (AC-5)
 */

import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const DOCS = join(ROOT, 'apps/docs/src/content/docs');
const BOUNDARY_PATHS = [
  join(DOCS, 'owns-vs-does-not-own.mdx'),
  join(DOCS, 'owns-vs-does-not-own.md'),
];
const PORTING_PATH = join(DOCS, 'porting.md');
const REGISTRY_PATH = join(ROOT, 'packages/registry/registry.json');
const VERDICTS_PATH = join(
  ROOT,
  'tests/sprint-06-guides-boundary-changelog/evidence/tr12-verdicts.md',
);

/** The sprint-06 authored surface: five guides, the boundary page, /porting, three changelog entries. */
const AUTHORED_PAGES = [
  'apps/docs/src/content/docs/guides/customize-rendering.md',
  'apps/docs/src/content/docs/guides/preview-on-device.md',
  'apps/docs/src/content/docs/guides/re-theme.md',
  'apps/docs/src/content/docs/guides/troubleshooting.md',
  'apps/docs/src/content/docs/guides/update-installed-items.md',
  'apps/docs/src/content/docs/owns-vs-does-not-own.mdx',
  'apps/docs/src/content/docs/porting.md',
  'apps/docs/src/content/changelog/0.1.0.md',
  'apps/docs/src/content/changelog/0.2.0.md',
  'apps/docs/src/content/changelog/0.2.1.md',
] as const;

/** TR-12 terminology lock: the terms that must never appear in authored prose. */
const FORBIDDEN_TERMS = [
  /\bstyling engine\b/i,
  /\bflavor\b/i,
  /\bregistry variant\b/i,
  /\bsupport level\b/i,
  /\bdev build\b/i,
] as const;

/** Astro's own frontmatter parser, reached exactly the way the build gate reaches it. */
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

function boundaryPath(): string {
  const path = BOUNDARY_PATHS.find((candidate) => existsSync(candidate));
  if (!path) {
    throw new Error(
      '[GBC-006] source failure: no owns-vs-does-not-own manuscript (.mdx or .md) on disk',
    );
  }
  return path;
}

function stringArray(value: unknown, what: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`[GBC-006] source failure: ${what} is not a string array`);
  }
  return value as string[];
}

/** The 56 registry item names from the tracked registry (never the generated ledger). */
function registryNames(): string[] {
  const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as {
    items: { name: string }[];
  };
  const names = registry.items.map((item) => item.name);
  if (names.length !== 56) {
    throw new Error(
      `[GBC-006] source failure: packages/registry/registry.json carries ${names.length} items, expected the 56-item ledger`,
    );
  }
  return names;
}

/** The markdown body under one ATX heading, up to the next heading of any level. */
function sectionUnder(text: string, heading: string): string {
  const pattern = new RegExp(`^#{1,6}\\s+${heading}\\s*$`, 'm');
  const match = pattern.exec(text);
  if (!match || match.index === undefined) {
    throw new Error(`[GBC-006] source failure: the manuscript has no '${heading}' heading`);
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
    if (!line.trim().startsWith('|')) continue;
    if (!TABLE_DELIMITER.test(next) || !next.includes('-')) continue;
    const cells = splitRow(line)
      .map(normalizeCell)
      .filter((cell) => cell.length > 0);
    if (cells.length > 0) headers.push(cells.join(' | '));
  }
  return headers;
}

/** Every cell of every GFM table in the text, normalized. */
function tableCells(text: string): string[] {
  return text
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .filter((line) => !(TABLE_DELIMITER.test(line) && line.includes('-')))
    .flatMap((line) => splitRow(line).map(normalizeCell))
    .filter((cell) => cell.length > 0);
}

/** Authored prose: the body with frontmatter and fenced code blocks removed. */
function proseOf(text: string): string {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  return body.replace(/```[\s\S]*?```/g, '');
}

/**
 * THE AC-1 checker — one pure function. Cross-checks the boundary gaps array
 * against the 56 ledger names, the page's consumer-responsibility section, the
 * not-ported array, and the upstream complement. Throws one Error naming every
 * contradiction and omission; returns silently when the sets reconcile. The
 * task contract STRICTLY requires the checker as ONE pure function, so the
 * five check families stay inlined (see the fallow suppression below).
 */
// fallow-ignore-next-line complexity
function reconcileGapsLedgerNotPorted(input: {
  gaps: string[];
  gapRows: { name: string; text: string }[];
  consumerResponsibilityText: string;
  ledgerNames: string[];
  notPorted: string[];
  upstream: string[];
  mappedUpstream: string[];
}): void {
  const problems: string[] = [];
  const ledger = input.ledgerNames.map((name) => name.toLowerCase());
  const notPorted = input.notPorted.map((name) => name.toLowerCase());
  const responsibility = input.consumerResponsibilityText.toLowerCase();
  const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const gap of input.gaps) {
    const gapLower = gap.toLowerCase();
    // Contradiction, endorsed semantics: EXACT equality against a ledger name.
    if (ledger.includes(gapLower)) {
      problems.push(`gap '${gap}' names the shipped registry item '${gapLower}'`);
      continue;
    }
    // Contradiction, second sense (gapRowNamesItem): the gap row pairs an
    // absence claim with a shipped item's name.
    const row = input.gapRows.find((candidate) => candidate.name.toLowerCase() === gapLower);
    if (row) {
      for (const name of ledger) {
        const absenceClaim = new RegExp(
          `(?:ships?\\s+no|not\\s+shipped|does\\s+not\\s+ship|missing|\\bno)\\s+(?:a\\s+|the\\s+)?${escapeRegExp(name)}\\b`,
          'i',
        );
        if (absenceClaim.test(row.text)) {
          problems.push(
            `gap '${gap}' pairs an absence claim with the shipped registry item '${name}'`,
          );
          break;
        }
      }
    }
    // Omission: every gap is a consumer-owned responsibility stated on the
    // page, or a not-ported name.
    if (!responsibility.includes(gapLower) && !notPorted.includes(gapLower)) {
      problems.push(
        `gap '${gap}' is neither stated in the consumer-responsibility section nor a not-ported element`,
      );
    }
  }

  for (const name of input.notPorted) {
    const nameLower = name.toLowerCase();
    const isGap = input.gaps.some((gap) => gap.toLowerCase() === nameLower);
    if (ledger.includes(nameLower) && !isGap) {
      problems.push(`not-ported element '${name}' names a shipped registry item`);
    }
  }

  // The zero-omissions half: every upstream element is mapped or not-ported,
  // nothing else is, and the two never overlap.
  const mapped = input.mappedUpstream.map((name) => name.toLowerCase());
  if (mapped.length + input.notPorted.length !== input.upstream.length) {
    problems.push(
      `mapped (${mapped.length}) + notPorted (${input.notPorted.length}) != upstream (${input.upstream.length})`,
    );
  }
  const overlap = mapped.filter((name) => notPorted.includes(name));
  if (overlap.length > 0) {
    problems.push(`elements in both mapping and notPorted: ${overlap.join(', ')}`);
  }
  const union = new Set<string>([...mapped, ...notPorted]);
  const upstream = new Set(input.upstream.map((name) => name.toLowerCase()));
  for (const name of upstream) {
    if (!union.has(name)) {
      problems.push(`upstream element '${name}' is in neither mapping nor notPorted`);
    }
  }
  for (const name of union) {
    if (!upstream.has(name)) {
      problems.push(`'${name}' is mapped or not-ported but absent from upstream`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `GBC-006 reconciliation: ${problems.length} contradiction(s)/omission(s):\n- ${problems.join('\n- ')}`,
    );
  }
}

/** The real landed content, loaded once and shared by the AC-1 and AC-4 checks. */
interface RealInput {
  gaps: string[];
  gapRows: { name: string; text: string }[];
  consumerResponsibilityText: string;
  ledgerNames: string[];
  notPorted: string[];
  upstream: string[];
  mappedUpstream: string[];
}

let realInputCache: RealInput | null = null;

async function loadRealInput(): Promise<RealInput> {
  if (realInputCache) return realInputCache;
  const boundary = readFileSync(boundaryPath(), 'utf8');
  const porting = readFileSync(PORTING_PATH, 'utf8');
  const boundaryFm = await parseFrontmatterWithAstro(boundary);
  const portingFm = await parseFrontmatterWithAstro(porting);

  const gaps = stringArray(boundaryFm.gaps, 'boundary gaps frontmatter');
  const mapping = portingFm.mapping;
  if (!Array.isArray(mapping)) {
    throw new Error('[GBC-006] source failure: porting.md frontmatter has no mapping array');
  }

  // The Gaps table body rows: first cell names the gap, the whole line is the
  // row text the absence-claim oracle reads.
  const gapRows = sectionUnder(boundary, 'Gaps')
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .filter((line) => !(TABLE_DELIMITER.test(line) && line.includes('-')))
    .slice(1)
    .map((line) => ({ name: normalizeCell(splitRow(line)[0] ?? ''), text: line }));

  realInputCache = {
    gaps,
    gapRows,
    consumerResponsibilityText: sectionUnder(boundary, 'What your app supplies'),
    ledgerNames: registryNames(),
    notPorted: stringArray(portingFm.notPorted, 'porting notPorted frontmatter'),
    upstream: stringArray(portingFm.upstream, 'porting upstream frontmatter'),
    mappedUpstream: mapping.map((entry) => {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        typeof (entry as { upstream?: unknown }).upstream !== 'string'
      ) {
        throw new Error(
          '[GBC-006] source failure: porting.md mapping carries a non-string upstream',
        );
      }
      return (entry as { upstream: string }).upstream;
    }),
  };
  return realInputCache;
}

/** Verdict rows may only name pages inside the authored sprint-06 set. */
function authorizedPage(path: string): boolean {
  return (AUTHORED_PAGES as readonly string[]).includes(path);
}

/** The authored prose of every sprint-06 page, frontmatter and code fences stripped. */
function authoredBodies(): { page: string; prose: string }[] {
  return AUTHORED_PAGES.map((page) => {
    const path = join(ROOT, page);
    if (!existsSync(path)) {
      throw new Error(`[GBC-006] source failure: authored page ${page} is missing`);
    }
    return { page, prose: proseOf(readFileSync(path, 'utf8')) };
  });
}

/** AC-2a: 0 forbidden terms in authored prose. */
function assertNoForbiddenTerms(): void {
  for (const { page, prose } of authoredBodies()) {
    for (const forbidden of FORBIDDEN_TERMS) {
      expect(
        forbidden.exec(prose)?.[0] ?? 'none',
        `${page} must not use the forbidden term ${forbidden}`,
      ).toBe('none');
    }
  }
}

/** AC-2b: canonical terms used where their concepts appear. */
function assertCanonicalTermsUsed(): void {
  const bodies = authoredBodies();

  // Across the corpus each canonical term is present; every page naming both
  // engines uses 'engine'; every page saying 'development build' also says
  // 'dev client' (the term the lock canonicalizes it to).
  const corpus = bodies.map((entry) => entry.prose).join('\n');
  for (const canonical of [/engine tree/i, /registry items?/i, /dev clients?/i]) {
    expect(canonical.test(corpus), `the corpus uses the canonical term ${canonical}`).toBe(true);
  }
  for (const { page, prose } of bodies) {
    if (/nativewind/i.test(prose) && /uniwind/i.test(prose)) {
      expect(/\bengine\b/i.test(prose), `${page} names both engines and must use 'engine'`).toBe(
        true,
      );
    }
    if (/development build/i.test(prose)) {
      expect(
        /dev clients?/i.test(prose),
        `${page} must pair 'development build' with 'dev client'`,
      ).toBe(true);
    }
  }
}

/** AC-2, second half: the verdict file holds exactly one row per authored page. */
function assertVerdictRows(): void {
  const rows = readFileSync(VERDICTS_PATH, 'utf8')
    .split('\n')
    .filter((line) => line.trim().startsWith('|'))
    .filter((line) => !(TABLE_DELIMITER.test(line) && line.includes('-')))
    .slice(1)
    .map((line) => splitRow(line));
  const rowPaths = rows.map((cells) => cells[0] ?? '');
  for (const page of AUTHORED_PAGES) {
    expect(
      rowPaths.filter((path) => path === page),
      `one verdict row for ${page}`,
    ).toHaveLength(1);
  }
  for (const path of rowPaths) {
    expect(
      authorizedPage(path),
      `verdict row '${path}' names a page outside the authored set`,
    ).toBe(true);
  }
  for (const cells of rows) {
    expect(cells[1] ?? '', `the verdict row for ${cells[0]} records a pass`).toMatch(/^pass$/i);
  }
}

/** AC-5: no shared table header row, no boundary cell vocabulary on /porting. */
function assertNoBoundaryTableCopy(): void {
  const porting = readFileSync(PORTING_PATH, 'utf8');
  const boundary = readFileSync(boundaryPath(), 'utf8');

  const boundaryHeaders = new Set(tableHeaderRows(boundary));
  for (const header of tableHeaderRows(porting)) {
    expect(
      boundaryHeaders.has(header),
      `porting table header "${header}" duplicates a boundary table (single-canonical rule)`,
    ).toBe(false);
  }

  const BOUNDARY_CELL_TERMS = ['tool executor', 'streaming client', 'usechat'];
  for (const cell of tableCells(porting)) {
    for (const term of BOUNDARY_CELL_TERMS) {
      expect(
        cell.includes(term),
        `porting table cell "${cell}" carries the boundary term '${term}'`,
      ).toBe(false);
    }
  }
}

describe('GBC-006 content reconciliation', () => {
  it('gaps, ledger and not-ported reconcile with zero contradictions and omissions', async () => {
    const real = await loadRealInput();
    expect(real.gaps.length).toBeGreaterThan(0);
    expect(real.gapRows.length).toBe(real.gaps.length);
    // The pure checker over the real files: silence is the pass condition.
    expect(() => reconcileGapsLedgerNotPorted(real)).not.toThrow();
  });

  it('terminology lock holds and every authored page has a verdict row', () => {
    assertNoForbiddenTerms();
    assertCanonicalTermsUsed();
    assertVerdictRows();
  });

  it('planted gap naming a shipped item is rejected by name', async () => {
    const real = await loadRealInput();
    // The real files from AC-1 still pass.
    expect(() => reconcileGapsLedgerNotPorted(real)).not.toThrow();

    // Two plants, both rejected by name in one throw:
    // - 'button', the contract's example — an RNR primitive, so it is in
    //   neither the 56-item ledger nor the not-ported set, and the omission
    //   branch rejects it;
    // - 'tool', a genuinely shipped item — the exact-equality branch rejects
    //   it, proving 'Tool execution' passes where the shipped name 'tool'
    //   itself fails (the endorsed matching semantics).
    expect(real.ledgerNames).toContain('tool');
    expect(real.ledgerNames).not.toContain('button');
    const planted = { ...real, gaps: [...real.gaps, 'button', 'tool'] };

    let thrown: Error | null = null;
    try {
      reconcileGapsLedgerNotPorted(planted);
    } catch (error) {
      thrown = error as Error;
    }
    expect(thrown, 'the checker throws on the planted gaps array').not.toBeNull();
    expect(thrown?.message ?? '', "the throw names the planted gap 'button'").toContain('button');
    expect(thrown?.message ?? '', "the throw names the planted gap 'tool'").toContain('tool');
    expect(thrown?.message ?? '', 'the tool plant is the shipped-item contradiction').toMatch(
      /gap 'tool' names the shipped registry item 'tool'/,
    );
  });

  it('porting source has no boundary table copy', () => {
    assertNoBoundaryTableCopy();
  });
});
