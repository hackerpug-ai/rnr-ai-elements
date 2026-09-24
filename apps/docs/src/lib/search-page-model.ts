/**
 * SearchPageModel (ORI-AST-004) — the typed published-destination and search
 * category vocabulary shared by the post-build indexer
 * (`scripts/docs-data/search-index.ts`), its integration test, and the
 * SearchDialog island's result grouping.
 *
 * Pure by construction: no `node:` imports, so the browser bundle can use the
 * same normalization the build uses. Categories derive from SOURCE data (the
 * registry item type), never from URL text — the ui and lib items keep their
 * kinds while living under /components/. Everything fails closed: an unknown
 * registry type throws naming it, and result metadata that carries no item
 * category groups as `pages` only through the explicit section marker.
 */

/** The four result groups the dialog renders, in display order. */
export type SearchCategory = 'components' | 'ui' | 'lib' | 'pages';

/** One destination the built site must emit and the index must cover. */
export interface ExpectedDestination {
  /** The published destination path, e.g. `/components/message`. */
  href: string;
  category: SearchCategory;
  kind: 'item' | 'doc';
  /** Source-backed title, when the source data carries one. */
  title?: string;
}

/** The category vocabulary in display order. */
export function searchCategories(): readonly SearchCategory[] {
  return ['components', 'ui', 'lib', 'pages'];
}

/**
 * The search category for one registry item type — source-backed, never the
 * route text. Unknown types throw naming the type: a new registry kind must
 * be added to the vocabulary explicitly, not silently binned.
 */
export function categoryFromItemType(itemType: string): 'components' | 'ui' | 'lib' {
  if (itemType === 'registry:component') return 'components';
  if (itemType === 'registry:ui') return 'ui';
  if (itemType === 'registry:lib') return 'lib';
  throw new Error(`[search-page-model] unknown registry item type: ${itemType}`);
}

/** The published destination for one registry item. */
function itemDestinationHref(itemName: string): string {
  return `/components/${itemName}`;
}

/** The published destination for one published documentation source. */
function docDestinationHref(docId: string): string {
  return `/docs/${docId}`;
}

/**
 * The result group for one Pagefind result's metadata. Item documents carry
 * `category:<components|ui|lib>` from their data-pagefind-meta; published
 * documents carry `section:<section>` instead and group as `pages`. Anything
 * else (an unexpected metadata shape) also groups as pages — search results
 * must render, never vanish — but item metas always win because they carry
 * the source-backed kind.
 */
export function groupForResultMeta(meta: { category?: string; section?: string }): SearchCategory {
  if (meta.category === 'components' || meta.category === 'ui' || meta.category === 'lib') {
    return meta.category;
  }
  return 'pages';
}

/** The minimal source shapes the pure derivation consumes. */
export interface DestinationItemSource {
  name: string;
  type: string;
  title?: string;
}

export interface DestinationDocSource {
  id: string;
  draft?: boolean;
  title?: string;
}

/**
 * The full expected-destination list from parsed source data: every registry
 * item plus every published (non-draft) document. The reserved theming slug
 * stays in the list — its destination is emitted by the static /docs/theming
 * route. Sorted by href so the enumeration is deterministic.
 */
export function deriveExpectedDestinations(
  items: readonly DestinationItemSource[],
  docs: readonly DestinationDocSource[],
): ExpectedDestination[] {
  const destinations: ExpectedDestination[] = [
    ...items.map(
      (item): ExpectedDestination => ({
        href: itemDestinationHref(item.name),
        category: categoryFromItemType(item.type),
        kind: 'item',
        title: item.title,
      }),
    ),
    ...docs
      .filter((doc) => doc.draft !== true)
      .map(
        (doc): ExpectedDestination => ({
          href: docDestinationHref(doc.id),
          category: 'pages',
          kind: 'doc',
          title: doc.title,
        }),
      ),
  ];
  return destinations.sort((a, b) => a.href.localeCompare(b.href));
}
