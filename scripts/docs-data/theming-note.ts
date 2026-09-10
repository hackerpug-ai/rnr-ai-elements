/**
 * Theming-note enrichment (FUSE-03). A deterministic one-line note per
 * registry item, derived from the SEMANTIC theme-token utility classes that
 * actually appear in the item's real source files — the same semantic-vs-raw
 * distinction scripts/check-tokens.ts enforces. Only classes verbatim in the
 * source are ever named; an item consuming no token classes gets the defined
 * default note, never an empty string.
 */
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type RegistryItem = { name: string; type: string; files: { path: string }[] };

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Theme-token utility classes: a design-token prefix over the semantic token
 * vocabulary (bg-background, text-muted-foreground, border-border, …). Raw
 * palette classes (bg-zinc-950, text-blue-500) deliberately do not match —
 * those are check-tokens territory, not theming surface.
 *
 * LONGEST TOKEN FIRST, always: regex alternation is first-match, and `\b` is
 * satisfied before a hyphen, so a compound token listed after its prefix
 * would capture truncated ('text-muted' out of 'text-muted-foreground') —
 * a class the source does not use. The test files mirror this canonical
 * ordering and enforce it with a whole-utility boundary oracle.
 */
const TOKEN_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|caret|accent)-(?:card-foreground|popover-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|destructive-foreground|background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)\b/g;

/** The note for items whose sources consume no semantic token classes. */
export const DEFAULT_THEMING_NOTE =
  'No semantic theme classes in source — appearance follows the consumer theme and component defaults.';

export function buildThemingNotes(items: RegistryItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const item of items) out[item.name] = deriveThemingNote(item);
  return out;
}

export function deriveThemingNote(item: RegistryItem): string {
  const seen = new Set<string>();
  for (const file of item.files) {
    const path = isAbsolute(file.path) ? file.path : join(REPO_ROOT, file.path);
    const source = readFileSync(path, 'utf8');
    for (const match of source.matchAll(TOKEN_CLASS)) seen.add(match[0]);
  }
  if (seen.size === 0) return DEFAULT_THEMING_NOTE;
  return `Themed via ${[...seen].join(', ')}.`;
}
