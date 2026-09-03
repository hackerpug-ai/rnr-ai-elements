/**
 * Command — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of sources.logic.ts for why component files themselves cannot load under
 * Node).
 *
 * Extracted when model-selector needed provider grouping and voice-selector needed
 * custom rows: the palette's filter and its flat-item → render-rows transform are the
 * two behaviors those selectors build on, and both are data-in/data-out. The component
 * file consumes them; tests pin them.
 */

/** One selectable entry in the palette. `group` names the section heading it sits under. */
export type CommandItem = {
  value: string;
  label: string;
  description?: string;
  /** Extra match terms beyond label and description — model-selector puts the provider here. */
  keywords?: string;
  /** Section heading. Ungrouped items render without a header, in list order. */
  group?: string;
};

/** A row of the palette's list: either a section heading or a selectable item. */
export type CommandRow =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'item'; key: string; item: CommandItem; selected: boolean };

/**
 * The palette filter — the web original's cmdk match (case-insensitive substring
 * across label, description and keywords). A blank query matches everything; a
 * whitespace query is blank. Order is preserved — the caller's list order IS the
 * display order.
 */
export function filterCommandItems<T extends CommandItem>(
  items: readonly T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((i) =>
    `${i.label} ${i.description ?? ''} ${i.keywords ?? ''}`.toLowerCase().includes(q),
  );
}

/**
 * Interleave section headings into the flat item list: a group's heading renders the
 * first time one of its items appears, so groups keep the caller's first-appearance
 * order and interleaved groups each get exactly one header. Runs AFTER filtering, so
 * a group whose items all failed the filter renders no header at all.
 *
 * `selected` is resolved here, not at render time, so the memoized row array changes
 * identity when the selection changes — the FlatList's re-render trigger.
 */
export function buildCommandRows(
  items: readonly CommandItem[],
  value?: string,
): CommandRow[] {
  const rows: CommandRow[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const group = item.group?.trim();
    if (group && !seen.has(group)) {
      seen.add(group);
      rows.push({ kind: 'header', key: `header:${group}`, label: group });
    }
    rows.push({ kind: 'item', key: item.value, item, selected: item.value === value });
  }
  return rows;
}
