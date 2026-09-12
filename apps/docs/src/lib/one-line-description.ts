/**
 * oneLineDescription — the one family-browse description window (FAM-002).
 *
 * A deterministic clamp of the REAL registry description field, never a
 * curated rewrite: the output (minus the appended ellipsis) is always a
 * string-prefix of the source, cut at a word boundary, <=120 chars total.
 * A plain module (not .astro frontmatter) so vitest can import it directly.
 */

/** The hard window — outputs never exceed this, ellipsis included. */
const MAX_LENGTH = 120;
const ELLIPSIS = '…';

export function oneLineDescription(description: string): string {
  if (description.length <= MAX_LENGTH) {
    return description;
  }
  const window = description.slice(0, MAX_LENGTH);
  // Cut at the last word boundary inside the window so the clamp never ends
  // mid-word; a window with no boundary at all (one 120-char word) falls
  // back to the longest prefix that still leaves room for the ellipsis.
  const boundary = window.lastIndexOf(' ');
  const cut = boundary > 0 ? boundary : MAX_LENGTH - 1;
  return `${window.slice(0, cut).trimEnd()}${ELLIPSIS}`;
}
