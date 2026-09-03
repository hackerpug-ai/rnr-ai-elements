/**
 * Commit — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of lib/reasoning-lifecycle.ts for why component files themselves cannot load
 * under Node).
 *
 * The web original formats the timestamp with `Intl.RelativeTimeFormat('en')` over a
 * rounded day delta. The format is hand-rolled here instead, byte-compatible for the
 * cases the web produces ("yesterday", "5 days ago"), because Hermes' Intl build is a
 * device-variable surface a display component must not lean on — and so the Vitest
 * tier can own the format with injected time.
 *
 * COLOR COMPRESSION, DECLARED: the web paints file statuses with FOUR escape-hatch
 * hues (added green, deleted red, modified yellow, renamed blue). The styling contract
 * permits exactly three non-token colors, confined to lib/status.ts. The port maps the
 * four statuses onto the house StatusTone vocabulary — added→success, modified→running,
 * deleted→error, renamed→pending — and leans on the rule that carries the whole design:
 * color is never the sole channel (WCAG 1.4.1). The web's own status LETTERS (A/M/D/R)
 * render beside the tone, so the compressed map loses no information.
 */

import { statusColor, type StatusTone } from '@/registry/{engine}/lib/status';

/** File change kinds, verbatim from the web original's union. */
export type CommitFileStatus = 'added' | 'modified' | 'deleted' | 'renamed';

/** Every status, spelled out — UC-AGENT-style exhaustiveness for the meta table. */
export const COMMIT_FILE_STATUS_KEYS = [
  'added',
  'modified',
  'deleted',
  'renamed',
] as const satisfies readonly CommitFileStatus[];

export type CommitFileStatusMeta = {
  /** The web original's one-letter label: A, M, D, R. */
  label: string;
  tone: StatusTone;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

/**
 * status → letter + tone, one record, exhaustive by type: a status added here without a
 * row there fails tsc. Letters are the web original's; tones are the compressed map.
 */
export const COMMIT_FILE_STATUS_META: Record<CommitFileStatus, CommitFileStatusMeta> = {
  added: { label: 'A', tone: 'success', className: statusColor.success },
  modified: { label: 'M', tone: 'running', className: statusColor.running },
  deleted: { label: 'D', tone: 'error', className: statusColor.error },
  renamed: { label: 'R', tone: 'pending', className: statusColor.pending },
};

export function commitFileStatusMeta(status: CommitFileStatus): CommitFileStatusMeta {
  return COMMIT_FILE_STATUS_META[status];
}

/** One file in the commit. Counts are optional; `commitDiffstat` normalizes them. */
export type CommitFileData = {
  path: string;
  status: CommitFileStatus;
  additions?: number;
  deletions?: number;
};

/**
 * The short SHA for the hash chip. Trims and truncates at `length` (git's default
 * abbreviated form). No-throw: an empty or short hash comes back as-is rather than
 * throwing — a streamed commit object may still be arriving.
 */
export function shortSha(hash: string, length = 7): string {
  return hash.trim().slice(0, length);
}

/**
 * The relative day label the web CommitTimestamp renders, hand-rolled over the same
 * rounded-day delta. `now` is injectable so tests (and callers with a fixed clock) own
 * time. Negative diffs are the past ("yesterday", "5 days ago"), zero is "today",
 * positive the future ("tomorrow", "in 3 days").
 */
export function formatRelativeDate(date: Date, now: Date = new Date()): string {
  const days = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}

/** Totals across a commit's files — the summary line's +N −N math, undefined → 0. */
export function commitDiffstat(files: readonly CommitFileData[]): {
  additions: number;
  deletions: number;
  files: number;
} {
  return {
    additions: files.reduce((sum, f) => sum + (f.additions ?? 0), 0),
    deletions: files.reduce((sum, f) => sum + (f.deletions ?? 0), 0),
    files: files.length,
  };
}

/**
 * The signed per-file counts. The web renders `+{count}` spans and returns NULL at zero
 * and below — a file with no additions shows no +0. Same rule here: null means render
 * nothing. (The row itself renders the web's icon-plus-count pair; these strings are
 * for callers composing a summary line.)
 */
export function signedDiffCount(count: number): string | null {
  if (count <= 0) return null;
  return `+${count}`;
}

/** The deletions twin of signedDiffCount. */
export function signedDeletionCount(count: number): string | null {
  if (count <= 0) return null;
  return `-${count}`;
}
