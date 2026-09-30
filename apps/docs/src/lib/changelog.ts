/**
 * changelog — the single release derivation both changelog routes read
 * (GBC-008). The collection sorted newest-first through GBC-007's comparator
 * (date DESC, then semver DESC — never re-derived here), the one UTC
 * calendar-day rendering rule, and the touched-component links extracted from
 * each entry's markdown body: TR-03 fixes frontmatter to exactly `version` and
 * `date`, so the links live in the body, never a frontmatter field.
 *
 * Routes and hrefs derive from `entry.data.version`, never `entry.id` — the
 * glob loader's default id for `0.2.1.md` is `021` (github-slugger).
 */
import { type CollectionEntry, getCollection } from 'astro:content';
import { compareReleaseDesc } from './changelog-schema';

export type ChangelogEntry = CollectionEntry<'changelog'>;

/** One release: the schema-normalized frontmatter plus its entry. */
export interface ChangelogRelease {
  version: string;
  date: Date;
  entry: ChangelogEntry;
}

/** All changelog releases newest-first: date DESC, then semver DESC. */
export async function changelogReleases(): Promise<ChangelogRelease[]> {
  const entries = await getCollection('changelog');
  return entries
    .map((entry) => ({ version: entry.data.version, date: entry.data.date, entry }))
    .sort(compareReleaseDesc);
}

/** The one date rendering rule: the UTC calendar day, never local time. */
export function formatReleaseDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** A touched component: the registry slug and the label the entry authored. */
export interface TouchedComponent {
  href: string;
  label: string;
}

const COMPONENT_LINK = /\[([^\]]+)\]\(\/components\/([a-z0-9-]+)\)/g;

/**
 * The touched-component links in an entry's markdown body, in first-seen
 * order, deduplicated by slug — the /changelog row and the release page always
 * link the same slug set because both read this one extraction.
 */
export function touchedComponents(body: string | undefined): TouchedComponent[] {
  const links: TouchedComponent[] = [];
  if (!body) return links;
  const seen = new Set<string>();
  for (const [, label, slug] of body.matchAll(COMPONENT_LINK)) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    links.push({ href: `/components/${slug}`, label });
  }
  return links;
}
