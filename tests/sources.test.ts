import { describe, expect, it } from 'vitest';
import { usedSourcesLabel } from '../packages/registry/src/components/ai/sources.logic.ts';

/**
 * Pure logic only — the sources trigger label (see agent-status.test.ts's header for
 * why rendering itself cannot live in this tier). The domain shown on each row comes
 * from lib/url's hostnameOf, covered by url.test.ts.
 */

describe('usedSourcesLabel (the trigger text)', () => {
  it('is the web original template, byte-verbatim', () => {
    expect(usedSourcesLabel(3)).toBe('Used 3 sources');
  });

  it('interpolates zero without inventing a special case', () => {
    expect(usedSourcesLabel(0)).toBe('Used 0 sources');
  });

  it('keeps the web plural at one — parity over grammar, deliberately', () => {
    // The web original writes `Used {count} sources` with no singular branch, and its
    // test corpus asserts the plural at 1. Localizing is a consumer-level edit.
    expect(usedSourcesLabel(1)).toBe('Used 1 sources');
  });

  it('takes any count a stream can produce, never throwing', () => {
    expect(usedSourcesLabel(128)).toBe('Used 128 sources');
    expect(usedSourcesLabel(-1)).toBe('Used -1 sources');
  });
});
