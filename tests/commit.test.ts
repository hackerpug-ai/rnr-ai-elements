import { describe, expect, it } from 'vitest';
import {
  COMMIT_FILE_STATUS_KEYS,
  COMMIT_FILE_STATUS_META,
  commitDiffstat,
  commitFileStatusMeta,
  formatRelativeDate,
  shortSha,
  signedDeletionCount,
  signedDiffCount,
} from '../packages/registry/src/components/ai/commit.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the commit's sha formatting, relative dates, diffstat math, and the
 * file-status meta map (see agent-status.test.ts's header for why rendering itself
 * cannot live in this tier).
 *
 * Time is INJECTED everywhere a clock appears, so these cases are deterministic — the
 * device tier owns the fact that "4 days ago" is the right label on a real phone.
 */

describe('shortSha (the hash chip text)', () => {
  it('truncates a full sha to git’s 7-character abbreviated default', () => {
    expect(shortSha('9f2c4ab77e0d31c5a8b6f0d2e1c4a9b8c7d6e5f4')).toBe('9f2c4ab');
  });

  it('takes a caller-supplied length', () => {
    expect(shortSha('9f2c4ab77e0d31c5a8b6f0d2e1c4a9b8c7d6e5f4', 12)).toBe('9f2c4ab77e0d');
  });

  it('a hash shorter than the length comes back verbatim, never padded', () => {
    expect(shortSha('9f2c4ab')).toBe('9f2c4ab');
    expect(shortSha('abc', 7)).toBe('abc');
  });

  it('trims whitespace around a streamed-in hash', () => {
    expect(shortSha('  9f2c4ab77e0d  ')).toBe('9f2c4ab');
  });

  it('an empty hash is an empty chip, not a crash — the object may still be arriving', () => {
    expect(shortSha('')).toBe('');
  });
});

describe('formatRelativeDate (the timestamp label, web Intl semantics hand-rolled)', () => {
  // A fixed "now": Thursday 2026-07-30 12:00:00 UTC.
  const now = new Date('2026-07-30T12:00:00Z');
  const daysFrom = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
  const hoursFrom = (n: number) => new Date(now.getTime() + n * 60 * 60 * 1000);

  it('the same instant is today', () => {
    expect(formatRelativeDate(now, now)).toBe('today');
  });

  it('sub-day offsets round — ±11h is still today, the web’s Math.round day delta', () => {
    expect(formatRelativeDate(hoursFrom(11), now)).toBe('today');
    expect(formatRelativeDate(hoursFrom(-11), now)).toBe('today');
  });

  it('yesterday and tomorrow get the web numeric:auto words', () => {
    expect(formatRelativeDate(daysFrom(-1), now)).toBe('yesterday');
    expect(formatRelativeDate(daysFrom(1), now)).toBe('tomorrow');
  });

  it('past and future days beyond one read as plain counts', () => {
    expect(formatRelativeDate(daysFrom(-5), now)).toBe('5 days ago');
    expect(formatRelativeDate(daysFrom(3), now)).toBe('in 3 days');
  });

  it('the 24h boundary rounds, so +20h is tomorrow, −20h is yesterday', () => {
    expect(formatRelativeDate(hoursFrom(20), now)).toBe('tomorrow');
    expect(formatRelativeDate(hoursFrom(-20), now)).toBe('yesterday');
  });

  it('defaults the clock to real time when the caller has none', () => {
    const realNow = new Date();
    expect(formatRelativeDate(new Date(realNow.getTime() + 24 * 60 * 60 * 1000))).toBe('tomorrow');
  });
});

describe('commitDiffstat (the summary line’s +N −N math)', () => {
  it('sums additions and deletions across files and counts files', () => {
    expect(
      commitDiffstat([
        { path: 'a.ts', status: 'added', additions: 10, deletions: 0 },
        { path: 'b.ts', status: 'modified', additions: 2, deletions: 3 },
        { path: 'c.ts', status: 'deleted', additions: 0, deletions: 7 },
      ]),
    ).toEqual({ additions: 12, deletions: 10, files: 3 });
  });

  it('missing counts are zero, not NaN — streamed objects arrive incomplete', () => {
    expect(commitDiffstat([{ path: 'a.ts', status: 'renamed' }])).toEqual({
      additions: 0,
      deletions: 0,
      files: 1,
    });
  });

  it('an empty commit is all zeros', () => {
    expect(commitDiffstat([])).toEqual({ additions: 0, deletions: 0, files: 0 });
  });

  it('never mutates the input — the caller’s commit object is the caller’s', () => {
    const files = [{ path: 'a.ts', status: 'added' as const, additions: 1, deletions: 2 }];
    commitDiffstat(files);
    expect(files).toEqual([{ path: 'a.ts', status: 'added', additions: 1, deletions: 2 }]);
  });
});

describe('signedDiffCount / signedDeletionCount (summary strings)', () => {
  it('positive counts get their sign; zero and below render nothing', () => {
    expect(signedDiffCount(12)).toBe('+12');
    expect(signedDiffCount(0)).toBe(null);
    expect(signedDiffCount(-1)).toBe(null);
  });

  it('deletions carry the minus sign and the same zero rule as the web', () => {
    expect(signedDeletionCount(3)).toBe('-3');
    expect(signedDeletionCount(0)).toBe(null);
  });
});

describe('COMMIT_FILE_STATUS_META (the compressed color map, exhaustive)', () => {
  it('covers every status the union declares — a new status without a row fails here', () => {
    expect(Object.keys(COMMIT_FILE_STATUS_META).sort()).toEqual(
      [...COMMIT_FILE_STATUS_KEYS].sort(),
    );
    expect(COMMIT_FILE_STATUS_KEYS).toEqual(['added', 'modified', 'deleted', 'renamed']);
  });

  it('carries the web original’s letters', () => {
    expect(commitFileStatusMeta('added').label).toBe('A');
    expect(commitFileStatusMeta('modified').label).toBe('M');
    expect(commitFileStatusMeta('deleted').label).toBe('D');
    expect(commitFileStatusMeta('renamed').label).toBe('R');
  });

  it('every tone resolves through the ONE status map — no second color table', () => {
    expect(commitFileStatusMeta('added').className).toBe(statusColor.success);
    expect(commitFileStatusMeta('modified').className).toBe(statusColor.running);
    expect(commitFileStatusMeta('deleted').className).toBe(statusColor.error);
    expect(commitFileStatusMeta('renamed').className).toBe(statusColor.pending);
  });
});
