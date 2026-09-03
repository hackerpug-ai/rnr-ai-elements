import { describe, expect, it } from 'vitest';
import {
  contextUsedPercent,
  formatContextPercent,
  formatContextRatio,
  formatContextTokens,
  usageRowVisible,
} from '../packages/registry/src/components/ai/context.logic.ts';

/**
 * Pure logic only — the context budget math (see agent-status.test.ts's header for why
 * rendering itself cannot live in this tier). The formatters are the web original's own
 * Intl calls, so their outputs here are byte-parity claims, not house style.
 */

describe('contextUsedPercent (the budget ratio)', () => {
  it('is the plain used/max ratio inside the window', () => {
    expect(contextUsedPercent(60000, 200000)).toBeCloseTo(0.3);
    expect(contextUsedPercent(200000, 200000)).toBe(1);
    expect(contextUsedPercent(0, 200000)).toBe(0);
  });

  it('clamps an overflowing window to 1', () => {
    expect(contextUsedPercent(250000, 200000)).toBe(1);
  });

  it('reads a zero budget as 0, never NaN — the web original divides bare', () => {
    expect(contextUsedPercent(124000, 0)).toBe(0);
    expect(contextUsedPercent(0, 0)).toBe(0);
  });
});

describe('formatContextPercent (the trigger readout)', () => {
  it('is the web original formatter, byte-parity', () => {
    expect(formatContextPercent(60000, 200000)).toBe('30%');
    expect(formatContextPercent(124000, 200000)).toBe('62%');
    expect(formatContextPercent(170000, 200000)).toBe('85%');
    expect(formatContextPercent(200000, 200000)).toBe('100%');
  });

  it('keeps one fraction digit when the ratio needs it', () => {
    expect(formatContextPercent(8192, 200000)).toBe('4.1%');
    expect(formatContextPercent(62500, 200000)).toBe('31.3%');
  });
});

describe('formatContextTokens (compact counts)', () => {
  it('stays exact below a thousand', () => {
    expect(formatContextTokens(0)).toBe('0');
    expect(formatContextTokens(999)).toBe('999');
  });

  it('compacts at the web original breakpoints: K, M, B', () => {
    // Upstream's call is { notation: 'compact' } with no fraction option, so 12400
    // compacts to 12K — the test pins the formatter's actual output, not an opinion.
    expect(formatContextTokens(1000)).toBe('1K');
    expect(formatContextTokens(12400)).toBe('12K');
    expect(formatContextTokens(200000)).toBe('200K');
    expect(formatContextTokens(1500000)).toBe('1.5M');
    expect(formatContextTokens(2500000000)).toBe('2.5B');
  });
});

describe('formatContextRatio (the header readout)', () => {
  it('is compact on both sides, spaces around the slash — upstream verbatim', () => {
    expect(formatContextRatio(12400, 200000)).toBe('12K / 200K');
    expect(formatContextRatio(0, 200000)).toBe('0 / 200K');
  });
});

describe('usageRowVisible (the zero-token trap)', () => {
  it('a zero or missing count renders nothing — not a zero line', () => {
    expect(usageRowVisible(0)).toBe(false);
    expect(usageRowVisible(undefined)).toBe(false);
  });

  it('any positive count renders', () => {
    expect(usageRowVisible(1)).toBe(true);
    expect(usageRowVisible(5400)).toBe(true);
  });
});
