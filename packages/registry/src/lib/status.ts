/**
 * The ONE status vocabulary for every agent surface — tool, task, and whatever
 * status-bearing component follows (test-results, plan, chain-of-thought).
 *
 * WHY THIS FILE EXISTS. The styling contract permits exactly three non-token colors,
 * and only because the web original makes the identical deviation: `text-destructive`
 * (a real RNR role) plus Tailwind's built-in `green-600` / `orange-600` for success and
 * denial, which need no `@theme` entry because Tailwind ships the default palette. A
 * deviation used twice is a pattern; used in five files it is five places to drift. So
 * all of it is confined to this one exported map, auditable in a single file, exactly
 * as the contract requires.
 *
 * Two rules travel with the map:
 *  1. COLOR IS NEVER THE SOLE CHANNEL. Every status is also carried by a distinct icon
 *     and a text label (WCAG 1.4.1), which is what makes the unthemed green tolerable.
 *  2. NO NEW ROLE. `pending` and `running` resolve through RNR tokens only
 *     (`text-muted-foreground`, `text-primary`); a consumer's palette flip moves them
 *     like everything else.
 *
 * Zero imports on purpose: this file is imported by pure logic modules and must stay
 * loadable under Vitest, which cannot resolve a react-native module graph.
 */

/** Semantic tone — the only key set allowed to carry a non-token color. */
export type StatusTone = 'pending' | 'running' | 'success' | 'error' | 'denied';

/**
 * tone → text class. The three escape-hatch colors (destructive / green-600 /
 * orange-600) live ONLY here; dark-mode twins ride along exactly as the web original
 * writes them (`dark:text-green-500`, `dark:text-orange-500`).
 */
export const statusColor: Record<StatusTone, string> = {
  pending: 'text-muted-foreground',
  running: 'text-primary',
  success: 'text-green-600 dark:text-green-500',
  error: 'text-destructive',
  denied: 'text-orange-600 dark:text-orange-500',
};
