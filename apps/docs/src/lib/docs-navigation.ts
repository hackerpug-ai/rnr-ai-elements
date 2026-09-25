/**
 * docs-navigation — the single publication contract for the authored docs
 * collection (CAP-DOCS-01). Pure module (no `astro:content` import) so both the
 * catch-all route and the build-time test graph can resolve it.
 *
 * Responsibilities, in order:
 *   1. Validate collection data is present before deriving anything.
 *   2. Exclude drafts from routes, section navigation, and search input alike.
 *   3. Split the reserved `theming` slug between the publication contract's two
 *      consumers: excluded from catch-all generation (the static /docs/theming
 *      route owns that destination), included in section navigation under its
 *      authored section so every rendered page still reaches it.
 *   4. Detect duplicate published destinations and fail with the destination and
 *      both source paths.
 *   5. Sort deterministically: section order, then numeric order, then id.
 */
import { existsSync, readdirSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { slug as githubSlug } from 'github-slugger';

export type DocsSection = 'getting-started' | 'guides' | 'porting';

export interface DocsEntryData {
  title: string;
  description: string;
  section: DocsSection;
  order: number;
  draft?: boolean;
}

export interface DocsCollectionEntry {
  id: string;
  filePath?: string;
  data: DocsEntryData;
}

export interface PublishedDoc {
  id: string;
  title: string;
  description: string;
  section: DocsSection;
  order: number;
  /** The published destination, e.g. `/docs/introduction`. */
  href: string;
  /** Repo-relative source path, e.g. `apps/docs/src/content/docs/introduction.md`. */
  sourcePath: string;
}

/** Slugs the catch-all must never generate — the static route owns them. */
const RESERVED_DOC_SLUGS: readonly string[] = ['theming'];

/** Declared section order (data schema: getting-started | guides | porting). */
const DOCS_SECTIONS: readonly DocsSection[] = ['getting-started', 'guides', 'porting'];

const SECTION_ORDER: Record<DocsSection, number> = {
  'getting-started': 0,
  guides: 1,
  porting: 2,
};

/** Repo-relative source path for a loader filePath (relative to the site root). */
function sourcePathFor(filePath?: string): string {
  if (!filePath) return 'apps/docs/src/content/docs/';
  const normalized = filePath.split(sep).join('/');
  return `apps/docs/${normalized}`;
}

/** Map + sort shared by both publication-contract consumers. Callers decide
 * which entries go in; this never filters. */
function toPublishedDocs(entries: DocsCollectionEntry[]): PublishedDoc[] {
  return entries
    .map((entry) => ({
      id: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      section: entry.data.section,
      order: entry.data.order,
      href: `/docs/${entry.id}`,
      sourcePath: sourcePathFor(entry.filePath),
    }))
    .sort(
      (a, b) =>
        SECTION_ORDER[a.section] - SECTION_ORDER[b.section] ||
        a.order - b.order ||
        a.id.localeCompare(b.id),
    );
}

/**
 * The published (non-draft, non-reserved) docs in deterministic order.
 * Throws when two entries resolve to the same published destination — the
 * diagnostic names the destination and both source paths.
 */
// fallow-ignore-next-line complexity
export function publishedDocs(entries: DocsCollectionEntry[]): PublishedDoc[] {
  const byHref = new Map<string, DocsCollectionEntry[]>();
  const published = entries.filter((entry) => entry.data.draft !== true);
  for (const entry of published) {
    if (RESERVED_DOC_SLUGS.includes(entry.id)) continue;
    const href = `/docs/${entry.id}`;
    const list = byHref.get(href) ?? [];
    list.push(entry);
    byHref.set(href, list);
  }

  const duplicates = [...byHref.values()].filter((list) => list.length > 1);
  if (duplicates.length > 0) {
    const detail = duplicates
      .map((list) => {
        const href = `/docs/${list[0].id}`;
        const sources = list.map((entry) => sourcePathFor(entry.filePath)).sort();
        return `duplicate docs destination "${href}": sources [${sources.join(', ')}]`;
      })
      .join('\n');
    throw new Error(detail);
  }

  return toPublishedDocs(published).filter((doc) => !RESERVED_DOC_SLUGS.includes(doc.id));
}

export interface SectionNavGroup {
  section: DocsSection;
  entries: PublishedDoc[];
}

/**
 * Section navigation grouped in declared section order. Excludes drafts but
 * includes the reserved slugs the static routes own — the catch-all never
 * generates them, yet navigation still reaches those destinations (the
 * generation/navigation split).
 */
export function sectionNavigation(entries: DocsCollectionEntry[]): SectionNavGroup[] {
  const docs = toPublishedDocs(entries.filter((entry) => entry.data.draft !== true));
  const groups: SectionNavGroup[] = [];
  for (const section of DOCS_SECTIONS) {
    const members = docs.filter((doc) => doc.section === section);
    if (members.length > 0) groups.push({ section, entries: members });
  }
  return groups;
}

const CONTENT_EXTENSIONS = ['.md', '.mdx'];

/** Recursively collect authored source files under the content directory. */
// fallow-ignore-next-line complexity
function collectContentFiles(contentDir: string): string[] {
  const out: string[] = [];
  const stack = [contentDir];
  while (stack.length > 0) {
    const dir = stack.pop() as string;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}${sep}${entry.name}`;
      if (entry.isDirectory()) stack.push(full);
      else if (CONTENT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) out.push(full);
    }
  }
  return out;
}

/** Derive the collection id (slug) for a source file, exactly as the glob loader does. */
function idFromFile(contentDir: string, file: string): string {
  const rel = relative(contentDir, file);
  const withoutExt = rel.replace(/\.[^/.]+$/, '');
  const segments = withoutExt.split(sep);
  return segments
    .map((segment) => githubSlug(segment))
    .join('/')
    .replace(/\/index$/, '');
}

/**
 * Deterministic duplicate-destination detection over the raw source files.
 *
 * Astro's glob loader stores one entry per generated id (a Map keyed by slug),
 * so `getCollection` cannot observe two sources that slug-collide — and its own
 * duplicate warning races under its concurrent file processing. The publication
 * contract therefore re-derives ids from the real source files with the same
 * github-slugger rule and fails the build naming the destination and both
 * source paths before any route is generated.
 */
// fallow-ignore-next-line complexity
export function assertUniqueDestinations(contentDir: string): void {
  if (!existsSync(contentDir)) return;
  const byId = new Map<string, string[]>();
  for (const file of collectContentFiles(contentDir)) {
    const id = idFromFile(contentDir, file);
    const list = byId.get(id) ?? [];
    list.push(file);
    byId.set(id, list);
  }
  const duplicates = [...byId.values()].filter((list) => list.length > 1);
  if (duplicates.length > 0) {
    const detail = duplicates
      .map((list) => {
        const href = `/docs/${idFromFile(contentDir, list[0])}`;
        const sources = list
          .map(
            (file) =>
              `apps/docs/src/content/docs/${relative(contentDir, file).split(sep).join('/')}`,
          )
          .sort();
        return `duplicate docs destination "${href}": sources [${sources.join(', ')}]`;
      })
      .join('\n');
    throw new Error(detail);
  }
}
