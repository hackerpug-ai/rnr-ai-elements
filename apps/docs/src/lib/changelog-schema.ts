/**
 * changelog-schema — the single changelog_entry contract (TR-03 03-data-schema):
 * frontmatter carries exactly `version` (semver string) and `date`, with the
 * release body (Added/Changed/Fixed) authored as markdown headings (GBC-005).
 *
 * Shared by three consumers so they can never drift:
 *   - apps/docs/src/content.config.ts registers the `changelog` collection
 *     with this one schema object (the Astro loader validates every entry).
 *   - scripts/docs-data/changelog-gates.ts parses entry frontmatter with it in
 *     prebuild, so the gate and the build normalize dates the same way.
 *   - GBC-008's release pages sort with the same release comparator the gate
 *     enforces (date DESC, then semver DESC tiebreak).
 *
 * `date` uses z.coerce.date(): it accepts both the JS Date an unquoted
 * `date: 2026-09-08` yields and the quoted string GBC-005 authors, rejects a
 * missing date and `not-a-date`, and normalizes both to one Date.
 */
import { z } from 'astro/zod';

/**
 * Semver `MAJOR.MINOR.PATCH` with optional prerelease/build segments. The
 * registry's release tags (`v0.1.0`…) are plain triples; the optional segments
 * exist so a future `v0.3.0-rc.1` does not fail the schema.
 */
const SEMVER_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export const changelogSchema = z.object({
  version: z.string().regex(SEMVER_PATTERN),
  date: z.coerce.date(),
});

export type ChangelogEntryData = z.infer<typeof changelogSchema>;

/**
 * Numeric compare of the semver core triple, DESC (Array.sort semantics:
 * negative means `a` first). Prerelease precedence (rc ordering) is not
 * implemented — every released tag today is a plain triple; extend here if
 * prereleases start shipping.
 */
export function compareSemverDesc(a: string, b: string): number {
  const pa = a.split('-')[0].split('.');
  const pb = b.split('-')[0].split('.');
  for (let i = 0; i < 3; i++) {
    const ia = Number(pa[i]);
    const ib = Number(pb[i]);
    if (ia !== ib) return ib - ia;
  }
  return 0;
}

/**
 * The release comparator (a direct Array.sort comparator: negative means `a`
 * first): date DESC, then semver DESC as the tiebreak — equal dates are legal
 * (v0.2.0 and v0.2.1 are both 2026-09-08), so the newest version still renders
 * on top. Dates are compared as instants; both arrive from changelogSchema, so
 * the UTC-calendar-day rendering rule (`toISOString().slice(0, 10)`) is a
 * display concern downstream.
 */
export function compareReleaseDesc(a: ChangelogEntryData, b: ChangelogEntryData): number {
  const byDate = b.date.getTime() - a.date.getTime();
  if (byDate !== 0) return byDate;
  return compareSemverDesc(a.version, b.version);
}
