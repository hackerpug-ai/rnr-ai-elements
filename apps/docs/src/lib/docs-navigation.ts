/**
 * docs-navigation — the single publication contract for the authored docs
 * collection (CAP-DOCS-01). Pure module (no `astro:content` import) so both the
 * catch-all route and the build-time test graph can resolve it.
 *
 * Responsibilities, in order:
 *   1. Validate collection data is present before deriving anything.
 *   2. Exclude drafts from routes, section navigation, and search input alike.
 *   3. Derive the ONE section-aware destination per entry (hrefFor): published
 *      getting-started entries at /docs/{id}, guides entries at
 *      /guides/{basename(id)} (the `guides/` directory prefix is stripped — the
 *      single-segment [slug] route never matches a param containing /), and the
 *      porting section at the single /porting destination. The catch-all route,
 *      the guides route, the porting route, and the sidebar nav all read this
 *      one derivation, so no route and the nav can never disagree.
 *   4. Split the reserved `theming` slug between the publication contract's two
 *      consumers: excluded from catch-all generation (the static /docs/theming
 *      route owns that destination, and hrefFor keeps /docs/{id} for reserved
 *      slugs so the nav entry stays put), included in section navigation under
 *      its authored section so every rendered page still reaches it.
 *   5. Detect duplicate published destinations and fail with the destination and
 *      both source paths — keyed on the section-aware href, so same-slug
 *      cross-section entries are legal while a same destination still fails.
 *   6. Sort deterministically: section order, then numeric order, then id.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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

/**
 * The ONE href derivation every publication consumer reads: the published
 * destination for an entry id in its authored section. getting-started
 * publishes at /docs/{id}, guides at /guides/{basename(id)} — the `guides/`
 * directory prefix is stripped, because idFromFile joins path segments and the
 * single-segment [slug] route never matches a param containing / — and the
 * porting section publishes at the single /porting destination. Reserved slugs
 * keep /docs/{id}: the static routes own those destinations, so the nav entry
 * stays at /docs/theming.
 */
export function hrefFor(id: string, section: DocsSection): string {
  if (RESERVED_DOC_SLUGS.includes(id)) return `/docs/${id}`;
  switch (section) {
    case 'guides':
      return `/guides/${id.split('/').at(-1) ?? id}`;
    case 'porting':
      return '/porting';
    default:
      return `/docs/${id}`;
  }
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
      href: hrefFor(entry.id, entry.data.section),
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
 * Throws when two entries resolve to the same section-aware published
 * destination — the diagnostic names the destination and both source paths.
 * Keyed on hrefFor, so the same final slug in different sections is legal
 * (/docs/troubleshooting and /guides/troubleshooting) while a same derived
 * destination still fails.
 */
// fallow-ignore-next-line complexity
export function publishedDocs(entries: DocsCollectionEntry[]): PublishedDoc[] {
  const byHref = new Map<string, DocsCollectionEntry[]>();
  const published = entries.filter((entry) => entry.data.draft !== true);
  for (const entry of published) {
    if (RESERVED_DOC_SLUGS.includes(entry.id)) continue;
    const href = hrefFor(entry.id, entry.data.section);
    const list = byHref.get(href) ?? [];
    list.push(entry);
    byHref.set(href, list);
  }

  const duplicates = [...byHref.entries()].filter(([, list]) => list.length > 1);
  if (duplicates.length > 0) {
    const detail = duplicates
      .map(([href, list]) => {
        const sources = list.map((entry) => sourcePathFor(entry.filePath)).sort();
        return `duplicate docs destination "${href}": sources [${sources.join(', ')}]`;
      })
      .join('\n');
    throw new Error(detail);
  }

  return toPublishedDocs(published).filter((doc) => !RESERVED_DOC_SLUGS.includes(doc.id));
}

/**
 * The single porting-section entry the /porting route renders. The count gate
 * fires on the raw published entries BEFORE any destination derivation — two
 * porting entries collide into the one /porting destination by design, so the
 * duplicate-destination check can never name the count for them. A zero or
 * multi-porting collection fails the build naming 'porting' and the count.
 */
export function portingEntry(entries: DocsCollectionEntry[]): PublishedDoc {
  const count = entries.filter(
    (entry) => entry.data.draft !== true && entry.data.section === 'porting',
  ).length;
  if (count !== 1) {
    throw new Error(
      `[porting] the docs collection must carry exactly 1 published porting-section entry; found ${count} — /porting renders exactly one manuscript and nothing aliases it`,
    );
  }
  const doc = publishedDocs(entries).find((candidate) => candidate.section === 'porting');
  if (!doc) {
    throw new Error('[porting] the single porting entry vanished in the publication derivation');
  }
  return doc;
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

type FrontmatterParser = (text: string) => { frontmatter: Record<string, unknown> };

let parserPromise: Promise<FrontmatterParser> | undefined;

/**
 * Astro's own frontmatter parser — the same single authority the glob loader
 * uses — resolved through the astro install the docs project owns (the
 * isolated pnpm linker exposes no direct import path). Tries the
 * module-relative docs package.json first (the test graph loads this file as
 * real source from the repo root), then the process cwd (the Vite-bundled
 * build executes with cwd = apps/docs). Cached after the first resolution.
 */
function frontmatterParser(): Promise<FrontmatterParser> {
  parserPromise ??= (async () => {
    const candidates = [
      fileURLToPath(new URL('../../package.json', import.meta.url)),
      join(process.cwd(), 'package.json'),
    ];
    for (const pkg of candidates) {
      try {
        const requireFromAstro = createRequire(
          createRequire(pathToFileURL(pkg)).resolve('astro/package.json'),
        );
        const helperPath = requireFromAstro.resolve('@astrojs/internal-helpers/frontmatter');
        const module = (await import(helperPath)) as {
          parseFrontmatter: FrontmatterParser;
        };
        return module.parseFrontmatter;
      } catch {
        // Try the next candidate; fall through to the collective diagnostic.
      }
    }
    throw new Error(
      `[docs-navigation] cannot resolve Astro's frontmatter parser (tried ${candidates.join(', ')})`,
    );
  })();
  return parserPromise;
}

/** The authored section of a raw source file, parsed with Astro's own parser.
 * A missing or unknown section fails naming the file — the collection schema
 * requires the field, so the build would fail later anyway; failing here does
 * it before any route is generated. */
async function sectionFromSource(file: string): Promise<DocsSection> {
  const parse = await frontmatterParser();
  const { frontmatter } = parse(readFileSync(file, 'utf8'));
  const section = frontmatter.section;
  if (typeof section !== 'string' || !DOCS_SECTIONS.includes(section as DocsSection)) {
    throw new Error(
      `[docs-navigation] ${file}: frontmatter section must be one of ${DOCS_SECTIONS.join(' | ')}; found ${JSON.stringify(section)}`,
    );
  }
  return section as DocsSection;
}

/**
 * Deterministic duplicate-destination detection over the raw source files.
 *
 * Astro's glob loader stores one entry per generated id (a Map keyed by slug),
 * so `getCollection` cannot observe two sources that slug-collide — and its own
 * duplicate warning races under its concurrent file processing. The publication
 * contract therefore re-derives the section-aware destination of every raw
 * source (github-slugger id + Astro-parsed frontmatter section through hrefFor)
 * and fails the build naming the destination and both source paths before any
 * route is generated. Keyed on the derived href, so the same final slug in
 * different sections is legal while a same destination still fails.
 */
// fallow-ignore-next-line complexity
export async function assertUniqueDestinations(contentDir: string): Promise<void> {
  if (!existsSync(contentDir)) return;
  const byHref = new Map<string, string[]>();
  for (const file of collectContentFiles(contentDir)) {
    const id = idFromFile(contentDir, file);
    const section = await sectionFromSource(file);
    const href = hrefFor(id, section);
    const list = byHref.get(href) ?? [];
    list.push(file);
    byHref.set(href, list);
  }
  const duplicates = [...byHref.entries()].filter(([, list]) => list.length > 1);
  if (duplicates.length > 0) {
    const detail = duplicates
      .map(([href, list]) => {
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
