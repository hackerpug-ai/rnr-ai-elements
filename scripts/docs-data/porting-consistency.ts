/**
 * Porting consistency gates (GBC-012) — fail-closed cross-checks so the
 * /porting structured source (GBC-004's porting.md frontmatter) can never
 * drift from the tracked registry or the boundary page:
 *
 *   1. Slug resolution: every `mapping` entry's `item` is one of the 56
 *      registry.json `name` values — an unknown slug fails naming the mapping
 *      entry (its `upstream` key, exactly as the frontmatter holds it) and the
 *      unknown slug.
 *   2. Exact complement: set(upstream) - set(mapping.upstream) == set(notPorted)
 *      — an element mapped AND not-ported fails naming both lists; an upstream
 *      element in neither list, a notPorted entry outside upstream, and a
 *      mapped element outside upstream each fail naming the element.
 *   3. Boundary gaps (GBC-003): no `gaps` entry exactly equals one of the 56
 *      shipped slugs — the boundary page cannot disown an item that ships.
 *      Exact equality only (never substring), so a sentence-case consumer
 *      responsibility like `Tool execution` never false-flags the shipped
 *      `tool` item.
 *
 * - Frontmatter parses through ASTRO'S OWN parser: createRequire from
 *   apps/docs/package.json resolves astro/package.json, a second createRequire
 *   from that path resolves @astrojs/internal-helpers/frontmatter, and its
 *   parseFrontmatter runs — the same YAML stack Astro's glob loader uses, so
 *   the gate's view cannot drift from Astro's (arrays intact, unquoted dates
 *   as JS Date). No YAML dependency is added and no parser is hand-rolled; if
 *   the resolve or import fails the gate throws naming
 *   @astrojs/internal-helpers/frontmatter and the build fails closed.
 * - The 56-item source is the TRACKED packages/registry/registry.json — never
 *   the gitignored prebuild output registry-items.json. The expected count is
 *   the pinned EXPECTED_ITEM_COUNT (gates.ts), never derived.
 * - Every violation renders as '[docs-data] porting: item "<x>" <detail>'
 *   (the gates.ts renderer shape); runPortingConsistencyGates throws one
 *   PortingConsistencyError listing every offender — never a warning, and
 *   prebuild calls it BEFORE any output byte is written.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXPECTED_ITEM_COUNT } from './gates';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** The registry manifest the slugs resolve against (tracked, never generated). */
export const REGISTRY_JSON = 'packages/registry/registry.json';
/** GBC-004's structured /porting source. */
export const PORTING_MD = 'apps/docs/src/content/docs/porting.md';
/** GBC-003's boundary page, whose `gaps` array the cross-check consumes. */
export const OWNS_MD = 'apps/docs/src/content/docs/owns-vs-does-not-own.mdx';

/** One failed check. `item` is the offending element/gap (quoted when rendered). */
type PortingViolation = { item: string; detail: string };

/** The pinned violation renderer — matches the gates.ts '[docs-data] <gate>:' shape. */
function formatPortingViolation(v: PortingViolation): string {
  return `[docs-data] porting: item "${v.item}" ${v.detail}`;
}

/** Aggregate of every violation from a gate pass — one throw, all offenders listed. */
class PortingConsistencyError extends Error {
  readonly violations: PortingViolation[];

  constructor(violations: PortingViolation[]) {
    super(violations.map(formatPortingViolation).join('\n'));
    this.name = 'PortingConsistencyError';
    this.violations = violations;
  }
}

/** The landed porting.md frontmatter shape (zod-typed the same way in content.config.ts). */
type PortingFrontmatter = {
  upstream: string[];
  mapping: { upstream: string; item: string }[];
  notPorted: string[];
};

/**
 * The pure check: violations only, no filesystem access. The upstream set is
 * taken from porting.md's `upstream` array — never derived from the mapping —
 * so a new upstream element tracked in neither list is always seen.
 */
function checkPortingConsistency(input: {
  porting: PortingFrontmatter;
  gaps: string[];
  registryNames: string[];
}): PortingViolation[] {
  const registry = new Set(input.registryNames);
  return [
    ...checkRegistryLedger(registry),
    ...checkMappingSlugs(input.porting.mapping, registry),
    ...checkComplement(input.porting),
    ...checkBoundaryGaps(input.gaps, registry),
  ];
}

/** The pin itself: the slug source must be the tracked 56-item registry. */
function checkRegistryLedger(registry: Set<string>): PortingViolation[] {
  if (registry.size === EXPECTED_ITEM_COUNT) return [];
  return [
    {
      item: '<registry>',
      detail: `${REGISTRY_JSON} holds ${registry.size} names, expected ${EXPECTED_ITEM_COUNT} — the tracked 56-item source is required`,
    },
  ];
}

/** Check 1: each mapping entry's item must be a registry name. */
function checkMappingSlugs(
  mapping: { upstream: string; item: string }[],
  registry: Set<string>,
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const entry of mapping) {
    if (!registry.has(entry.item)) {
      violations.push({
        item: entry.upstream,
        detail: `mapping entry maps unknown registry slug "${entry.item}" — not one of the ${EXPECTED_ITEM_COUNT} registry.json names`,
      });
    }
  }
  return violations;
}

/**
 * Check 2: the exact complement against porting.md's upstream array —
 * mapped-and-not-ported names both lists, and neither list may hold an
 * element outside the partition.
 */
function checkComplement(porting: PortingFrontmatter): PortingViolation[] {
  const notPortedSet = new Set(porting.notPorted);
  const upstreamSet = new Set(porting.upstream);
  const mappedSet = new Set(porting.mapping.map((entry) => entry.upstream));
  return [
    ...checkMappedAndNotPorted(porting.mapping, notPortedSet),
    ...checkUntrackedUpstream(upstreamSet, mappedSet, notPortedSet),
    ...checkPartitionOutliers(porting, upstreamSet),
    ...checkDuplicates(porting.upstream, porting.mapping, porting.notPorted),
  ];
}

/** An element cannot be mapped AND not-ported — the violation names both lists. */
function checkMappedAndNotPorted(
  mapping: { upstream: string; item: string }[],
  notPortedSet: Set<string>,
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const entry of mapping) {
    if (notPortedSet.has(entry.upstream)) {
      violations.push({
        item: entry.upstream,
        detail:
          'appears in both mapping and notPorted — a mapped element cannot also be not-ported; remove it from one list',
      });
    }
  }
  return violations;
}

/** Every upstream element must land in exactly one of the two lists. */
function checkUntrackedUpstream(
  upstreamSet: Set<string>,
  mappedSet: Set<string>,
  notPortedSet: Set<string>,
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const element of upstreamSet) {
    if (!mappedSet.has(element) && !notPortedSet.has(element)) {
      violations.push({
        item: element,
        detail:
          'is listed in upstream but neither mapped nor not-ported — add it to mapping or notPorted so the complement holds',
      });
    }
  }
  return violations;
}

/** Neither list may hold an element the upstream array does not declare. */
function checkPartitionOutliers(
  porting: PortingFrontmatter,
  upstreamSet: Set<string>,
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const element of new Set(porting.notPorted)) {
    if (!upstreamSet.has(element)) {
      violations.push({
        item: element,
        detail:
          'is in notPorted but not in upstream — notPorted must be the exact complement of mapping against upstream',
      });
    }
  }
  for (const entry of porting.mapping) {
    if (!upstreamSet.has(entry.upstream)) {
      violations.push({
        item: entry.upstream,
        detail:
          'is mapped but not listed in upstream — the mapping must partition the upstream array',
      });
    }
  }
  return violations;
}

/** Set semantics need unique elements; a duplicate silently shrinks the sets. */
function checkDuplicates(
  upstream: string[],
  mapping: { upstream: string; item: string }[],
  notPorted: string[],
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const name of duplicated(upstream)) {
    violations.push({ item: name, detail: 'is duplicated in upstream' });
  }
  for (const name of duplicated(notPorted)) {
    violations.push({ item: name, detail: 'is duplicated in notPorted' });
  }
  for (const name of duplicated(mapping.map((entry) => entry.upstream))) {
    violations.push({ item: name, detail: 'is duplicated in mapping' });
  }
  return violations;
}

/**
 * Check 3: boundary gaps — a gap may name a not-ported element or any
 * consumer responsibility, never one of the 56 shipped slugs (exact equality).
 */
function checkBoundaryGaps(gaps: string[], registry: Set<string>): PortingViolation[] {
  const violations: PortingViolation[] = [];
  for (const gap of gaps) {
    if (registry.has(gap)) {
      violations.push({
        item: gap,
        detail: `gap names one of the ${EXPECTED_ITEM_COUNT} shipped registry slugs — the boundary page cannot disown an item that ships`,
      });
    }
  }
  return violations;
}

function duplicated(names: string[]): string[] {
  return [...new Set(names.filter((name, i) => names.indexOf(name) !== i))];
}

/**
 * Astro's own frontmatter parser, reached through the isolated pnpm linker:
 * apps/docs/package.json -> astro/package.json -> @astrojs/internal-helpers/
 * frontmatter. Fails closed naming the helper module.
 */
function loadAstroParseFrontmatter(): (text: string) => { frontmatter: Record<string, unknown> } {
  try {
    const docsRequire = createRequire(join(REPO_ROOT, 'apps/docs/package.json'));
    const astroPkg = docsRequire.resolve('astro/package.json');
    const astroRequire = createRequire(astroPkg);
    const helper = astroRequire.resolve('@astrojs/internal-helpers/frontmatter');
    const helperModule = astroRequire(helper) as {
      parseFrontmatter: (text: string) => { frontmatter: Record<string, unknown> };
    };
    return helperModule.parseFrontmatter;
  } catch (err) {
    throw new Error(
      '[docs-data] porting: could not resolve @astrojs/internal-helpers/frontmatter through ' +
        "apps/docs -> astro — the porting gates need Astro's own parser to read the " +
        `frontmatter (${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

function readText(path: string, what: string): string {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(
      `[docs-data] porting: ${what} ${path} unreadable — the porting gates run over the real ` +
        `tracked files (${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isMappingArray(value: unknown): value is { upstream: string; item: string }[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        entry !== null &&
        typeof entry === 'object' &&
        typeof (entry as { upstream?: unknown }).upstream === 'string' &&
        typeof (entry as { item?: unknown }).item === 'string',
    )
  );
}

/**
 * Parse one file's frontmatter through Astro's parser; a parse failure is a
 * fail-closed throw naming the file — never an empty-shape fallback.
 */
function parseSource(
  parse: (text: string) => { frontmatter: Record<string, unknown> },
  raw: string,
  path: string,
): Record<string, unknown> {
  try {
    return parse(raw).frontmatter;
  } catch (err) {
    throw new Error(
      `[docs-data] porting: ${path} frontmatter failed to parse through Astro's parser ` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

/** Shape errors cannot run set math — each is one violation naming file + field. */
function collectFrontmatterViolations(
  porting: Record<string, unknown>,
  gapsSource: Record<string, unknown>,
): PortingViolation[] {
  const violations: PortingViolation[] = [];
  if (!isStringArray(porting.upstream)) {
    violations.push({
      item: '<frontmatter>',
      detail: `${PORTING_MD} field "upstream" is missing or not a string array`,
    });
  }
  if (!isMappingArray(porting.mapping)) {
    violations.push({
      item: '<frontmatter>',
      detail: `${PORTING_MD} field "mapping" is missing or not an array of {upstream, item}`,
    });
  }
  if (!isStringArray(porting.notPorted)) {
    violations.push({
      item: '<frontmatter>',
      detail: `${PORTING_MD} field "notPorted" is missing or not a string array`,
    });
  }
  if (!isStringArray(gapsSource.gaps)) {
    violations.push({
      item: '<frontmatter>',
      detail: `${OWNS_MD} field "gaps" is missing or not a string array`,
    });
  }
  return violations;
}

/** The slug source: item names from the tracked registry.json, fail-closed. */
function loadRegistryNames(registryRaw: string): {
  names: string[];
  violations: PortingViolation[];
} {
  try {
    const registry = JSON.parse(registryRaw) as { items?: { name?: unknown }[] };
    const names = (registry.items ?? [])
      .map((item) => item.name)
      .filter((name): name is string => typeof name === 'string');
    if (names.length === 0) {
      return {
        names,
        violations: [
          {
            item: '<registry>',
            detail: `${REGISTRY_JSON} holds no item names — the tracked 56-item source is required`,
          },
        ],
      };
    }
    return { names, violations: [] };
  } catch (err) {
    return {
      names: [],
      violations: [
        {
          item: '<registry>',
          detail: `${REGISTRY_JSON} is not readable JSON — the tracked manifest is the only slug source (${err instanceof Error ? err.message : String(err)})`,
        },
      ],
    };
  }
}

/**
 * The runner prebuild calls (and this task's drill exercises): loads the real
 * porting.md, owns-vs-does-not-own.mdx and packages/registry/registry.json —
 * or the drill's $TMPDIR copies of the first two — and throws ONE
 * PortingConsistencyError naming every offender. Success prints the computed
 * counts line; nothing is ever warn-only.
 */
export function runPortingConsistencyGates(files: {
  portingPath: string;
  gapsPath: string;
  registryPath: string;
}): void {
  const parse = loadAstroParseFrontmatter();
  const porting = parseSource(
    parse,
    readText(files.portingPath, 'porting source'),
    files.portingPath,
  );
  const gapsSource = parseSource(
    parse,
    readText(files.gapsPath, 'boundary source'),
    files.gapsPath,
  );

  const { names: registryNames, violations } = loadRegistryNames(
    readText(files.registryPath, 'registry manifest'),
  );
  violations.push(...collectFrontmatterViolations(porting, gapsSource));
  if (violations.length > 0) throw new PortingConsistencyError(violations);

  violations.push(
    ...checkPortingConsistency({
      porting: {
        upstream: porting.upstream as string[],
        mapping: porting.mapping as { upstream: string; item: string }[],
        notPorted: porting.notPorted as string[],
      },
      gaps: gapsSource.gaps as string[],
      registryNames,
    }),
  );
  if (violations.length > 0) throw new PortingConsistencyError(violations);

  const mapping = porting.mapping as { upstream: string; item: string }[];
  const upstream = porting.upstream as string[];
  const notPorted = porting.notPorted as string[];
  console.log(
    `[docs-data] porting: ${mapping.length} mapped, ${notPorted.length} not-ported of ` +
      `${upstream.length} upstream elements — every mapping slug resolves against ` +
      `${registryNames.length} registry items, notPorted is the exact complement, gaps cross-check passes`,
  );
}
