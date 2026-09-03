import { describe, expect, it } from 'vitest';
import {
  formatDuration,
  formatTestDuration,
  passedPercent,
  progressLabel,
  progressPercentLabel,
  TEST_STATUS_KEYS,
  TEST_STATUS_META,
  testStatusMeta,
} from '../packages/registry/src/components/ai/test-results.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the status compression and duration formats behind the
 * test-results organism (see agent-status.test.ts's header for why rendering itself
 * cannot live in this tier).
 *
 * Pinned: the four outcomes resolve to sanctioned tones with distinct icons (color is
 * never the sole channel), the web's four hues compress onto the house palette
 * (skipped's yellow onto denied/orange exactly as terminal.logic compressed yellow),
 * the TWO duration formats stay upstream bytes — TestResultsDuration seconds at 1s,
 * TestDuration NEVER does — and the progress math clamps a zero-total run to 0%
 * where the web rendered NaN.
 */

describe('TEST_STATUS_META (the compression table)', () => {
  it('maps the four outcomes onto the sanctioned status tones', () => {
    expect(TEST_STATUS_META.passed.className).toBe(statusColor.success);
    expect(TEST_STATUS_META.failed.className).toBe(statusColor.error);
    expect(TEST_STATUS_META.skipped.className).toBe(statusColor.denied); // yellow → orange, declared
    expect(TEST_STATUS_META.running.className).toBe(statusColor.running);
  });

  it('gives every outcome a DISTINCT icon — color is never the sole channel', () => {
    const icons = TEST_STATUS_KEYS.map((status) => TEST_STATUS_META[status].iconName);
    expect(new Set(icons).size).toBe(TEST_STATUS_KEYS.length);
  });

  it('is exhaustive over the union — no status may be added without a row here', () => {
    expect([...TEST_STATUS_KEYS]).toEqual(['passed', 'failed', 'skipped', 'running']);
    for (const status of TEST_STATUS_KEYS) {
      expect(TEST_STATUS_META[status]).toBeDefined();
    }
  });

  it('no entry invents a fourth color outside the sanctioned set', () => {
    const allowed = new Set([
      statusColor.pending,
      statusColor.running,
      statusColor.success,
      statusColor.error,
      statusColor.denied,
    ]);
    for (const meta of Object.values(TEST_STATUS_META)) {
      expect(allowed.has(meta.className)).toBe(true);
    }
  });

  it('testStatusMeta is a plain lookup (the component never re-derives)', () => {
    expect(testStatusMeta('failed')).toBe(TEST_STATUS_META.failed);
  });
});

describe('formatDuration (TestResultsDuration — ms under 1s, seconds at/above)', () => {
  it('renders milliseconds below one second', () => {
    expect(formatDuration(0)).toBe('0ms');
    expect(formatDuration(42)).toBe('42ms');
    expect(formatDuration(500)).toBe('500ms');
    expect(formatDuration(999)).toBe('999ms');
  });

  it('renders two-decimal seconds at exactly one second and above (KB bytes: "1.00s", "3.50s", "5.00s")', () => {
    expect(formatDuration(1000)).toBe('1.00s');
    expect(formatDuration(3500)).toBe('3.50s');
    expect(formatDuration(5000)).toBe('5.00s');
  });
});

describe('formatTestDuration (TestDuration — ALWAYS milliseconds, upstream bytes)', () => {
  it('never seconds a per-test duration, even a long one', () => {
    expect(formatTestDuration(42)).toBe('42ms');
    expect(formatTestDuration(500)).toBe('500ms');
    expect(formatTestDuration(5000)).toBe('5000ms');
  });

  it('is deliberately NOT formatDuration — merging them would invent behavior upstream lacks', () => {
    expect(formatTestDuration(5000)).not.toBe(formatDuration(5000));
  });
});

describe('the progress math (TestResultsProgress labels)', () => {
  it('passedPercent is the pass fraction as a percent', () => {
    expect(passedPercent({ passed: 8, total: 10 })).toBeCloseTo(80);
    expect(passedPercent({ passed: 10, total: 10 })).toBeCloseTo(100);
    expect(passedPercent({ passed: 2, total: 3 })).toBeCloseTo(66.666, 2);
  });

  it('a zero-total run clamps to 0 percent — never the NaN the web rendered', () => {
    expect(passedPercent({ passed: 0, total: 0 })).toBe(0);
    expect(progressPercentLabel({ passed: 0, total: 0 })).toBe('0%');
    expect(progressLabel({ passed: 0, total: 0 })).toBe('0/0 tests passed');
  });

  it('progressLabel and progressPercentLabel are the upstream byte strings', () => {
    expect(progressLabel({ passed: 8, total: 10 })).toBe('8/10 tests passed');
    expect(progressPercentLabel({ passed: 8, total: 10 })).toBe('80%');
    expect(progressPercentLabel({ passed: 10, total: 10 })).toBe('100%');
    expect(progressPercentLabel({ passed: 1, total: 3 })).toBe('33%');
  });
});
