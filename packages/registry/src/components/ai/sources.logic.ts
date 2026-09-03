/**
 * Sources — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of lib/reasoning-lifecycle.ts for why component files themselves cannot load
 * under Node).
 *
 * SourceData is the data-schema doc's own shape, declared locally per message.tsx
 * precedent — the registry is stateless about the model and takes no runtime dependency
 * on any SDK. `snippet` and `faviconUri` are optional affordances: the web original
 * renders neither (an anchor with a book icon and the title), so the component ignores
 * them unless the caller passes faviconUri to the row explicitly.
 *
 * The trigger label is the web original's template, byte-verbatim — including the
 * plural on `1` ("Used 1 sources"), which the web ships and its test corpus asserts.
 * Parity here is deliberate; localizing the plural is a consumer-level edit.
 */

/** The data-schema doc's source shape — what `sources` and `inline-citation` exchange. */
export type SourceData = {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  faviconUri?: string;
};

/** The one field the row composition asks for, whatever else the caller carries. */
export type SourceLike = Pick<SourceData, 'title' | 'url'> & Partial<Pick<SourceData, 'faviconUri'>>;

/** The web original's trigger text, verbatim: `Used {count} sources`. */
export function usedSourcesLabel(count: number): string {
  return `Used ${count} sources`;
}
