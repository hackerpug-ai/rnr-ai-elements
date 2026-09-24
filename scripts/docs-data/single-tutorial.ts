/**
 * Single-tutorial gate (ORI-CI-001 / UC-DOCS-02). One deterministic check over
 * the complete published docs collection, to be evaluated BEFORE route
 * filtering: exactly one published entry may carry the `tutorial` designation,
 * and that sole entry's destination must be the canonical /docs/quickstart.
 * A missing, duplicated, or noncanonical designation is a violation — the gate
 * never selects a winner, suppresses a violation, or downgrades one to a
 * warning.
 *
 * - Publication parity: an entry is published exactly when `draft !== true`
 *   (the docs-navigation.ts publication rule), and the count runs over every
 *   published entry — reserved slugs and route filters never shrink the set
 *   before counting, so a draft copy cannot hide a duplicate and a second
 *   slug cannot escape the count.
 * - The expected count (1) and canonical destination (/docs/quickstart) are
 *   pinned constants, never derived from the collection under test.
 * - Diagnostics follow the docs-data violation style ('[docs-data] <gate>:
 *   item "<name>" ...') and always carry source identity: the designated
 *   source IDs for a cardinality violation, and the published entry sitting
 *   at the canonical destination when the designation is missing (the one
 *   whose designation was lost).
 *
 * Not yet imported anywhere (hence the fallow-ignore-file unused-file
 * directive below): the route-generator wiring in
 * apps/docs/src/pages/docs/[...id].astro is gated on the authored
 * `tutorial: true` designation landing in the Quickstart source — wiring a
 * fail-closed gate before that line exists would fail every real build on the
 * unmodified tree. Remove this directive in the same change that adds the
 * import; fallow reports a stale suppression until it is.
 */
// fallow-ignore-file unused-file
import { sep } from 'node:path';

/** The structural docs-collection data the gate reads (draft + designation). */
export interface TutorialEntryData {
  draft?: boolean;
  tutorial?: boolean;
}

/** The structural collection-entry shape the gate operates on. */
export interface TutorialCollectionEntry {
  id: string;
  filePath?: string;
  data: TutorialEntryData;
}

/** The pinned expected cardinality: UC-DOCS-02 allows exactly one tutorial. */
export const EXPECTED_TUTORIAL_COUNT = 1;

/** The pinned canonical destination of the single tutorial. */
export const CANONICAL_TUTORIAL_DESTINATION = '/docs/quickstart';

export type TutorialGateName = 'single-tutorial' | 'canonical-destination';

/** One failed check. `item` is the violated invariant or the offending source ID. */
export interface TutorialViolation {
  gate: TutorialGateName;
  item: string;
  detail: string;
  /** Present on cardinality violations: the observed-versus-expected pair. */
  observed?: number;
  expected?: number;
}

/**
 * The pinned violation renderer. Exactly '[docs-data] <gate>: item "<name>"
 * <detail>' with an optional '; observed <n> versus <m>' suffix — the same
 * shape the docs-data gates emit, so the build failure always names the
 * invariant and the offending sources.
 */
export function formatTutorialViolation(v: TutorialViolation): string {
  const counts =
    v.observed !== undefined && v.expected !== undefined
      ? `; observed ${v.observed} versus ${v.expected}`
      : '';
  return `[docs-data] ${v.gate}: item "${v.item}" ${v.detail}${counts}`;
}

/** Aggregate of every violation from one pass — one throw, all facts listed. */
export class SingleTutorialError extends Error {
  readonly violations: TutorialViolation[];

  constructor(violations: TutorialViolation[]) {
    super(violations.map(formatTutorialViolation).join('\n'));
    this.name = 'SingleTutorialError';
    this.violations = violations;
  }
}

/** Repo-relative source path for a loader filePath (the docs-navigation convention). */
function sourcePathFor(filePath?: string): string {
  if (!filePath) return 'apps/docs/src/content/docs/';
  const normalized = filePath.split(sep).join('/');
  return `apps/docs/${normalized}`;
}

/** The published destination of a collection entry, exactly as the catch-all derives it. */
function destinationFor(entry: TutorialCollectionEntry): string {
  return `/docs/${entry.id}`;
}

/**
 * The zero-designation diagnostic. When a published entry occupies the
 * canonical destination without carrying the designation, name it — that is
 * the source whose designation was lost; otherwise state the destination is
 * unoccupied.
 */
function missingDesignationDetail(published: TutorialCollectionEntry[]): string {
  const atCanonical = published.find(
    (entry) => destinationFor(entry) === CANONICAL_TUTORIAL_DESTINATION,
  );
  if (!atCanonical) {
    return `no published entry occupies the required destination ${CANONICAL_TUTORIAL_DESTINATION}`;
  }
  return (
    `the published entry at the required destination ${CANONICAL_TUTORIAL_DESTINATION} is ` +
    `"${atCanonical.id}" (${sourcePathFor(atCanonical.filePath)}) but carries no tutorial designation`
  );
}

/**
 * Compute every violation for the complete published collection. Deterministic
 * order: a cardinality violation (observed count is not exactly 1) short-circuits
 * — with no sole tutorial there is no unambiguous destination to check — and the
 * canonical-destination violation fires only for exactly one designated entry.
 */
export function singleTutorialViolations(entries: TutorialCollectionEntry[]): TutorialViolation[] {
  const published = entries.filter((entry) => entry.data.draft !== true);
  const designated = published
    .filter((entry) => entry.data.tutorial === true)
    .sort((a, b) => a.id.localeCompare(b.id));

  if (designated.length !== EXPECTED_TUTORIAL_COUNT) {
    const sources = designated.map((entry) => `"${entry.id}"`).join(', ');
    const detail =
      designated.length === 0
        ? missingDesignationDetail(published)
        : `the published tutorial sources are [${sources}]`;
    return [
      {
        gate: 'single-tutorial',
        item: 'tutorial-cardinality',
        detail,
        observed: designated.length,
        expected: EXPECTED_TUTORIAL_COUNT,
      },
    ];
  }

  const sole = designated[0];
  const actualDestination = destinationFor(sole);
  if (actualDestination === CANONICAL_TUTORIAL_DESTINATION) return [];
  return [
    {
      gate: 'canonical-destination',
      item: sole.id,
      detail: `the sole published tutorial publishes at ${actualDestination} (${sourcePathFor(sole.filePath)}) but must publish at ${CANONICAL_TUTORIAL_DESTINATION}`,
    },
  ];
}

/**
 * Fail closed on any violation: throw one SingleTutorialError carrying every
 * violation, so the Astro build (invoking this before route selection) fails
 * with source-identifying diagnostics instead of rendering an invalid
 * published collection.
 */
export function assertSinglePublishedTutorial(entries: TutorialCollectionEntry[]): void {
  const violations = singleTutorialViolations(entries);
  if (violations.length > 0) throw new SingleTutorialError(violations);
}
