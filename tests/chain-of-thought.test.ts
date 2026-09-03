import { describe, expect, it } from 'vitest';
import {
  CHAIN_OF_THOUGHT_STEP_STATUS_KEYS,
  type ChainOfThoughtStepStatus,
  chainOfThoughtProgress,
  chainOfThoughtProgressLabel,
  chainOfThoughtStepMeta,
} from '../packages/registry/src/components/ai/chain-of-thought.logic.ts';
import { type StatusTone, statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the step map and the progress counter (see agent-status.test.ts's
 * header for why rendering itself cannot live in this tier).
 *
 * This suite is the Vitest half of UC-AGENT-02 AC-4: a multi-step chain must carry a
 * per-step status with no unmapped case, and the collapsed header's count must be
 * computable from data — the collapsed disclosure unmounts its content, so the tree
 * cannot be asked.
 */

describe('CHAIN_OF_THOUGHT_STEP_STATUS_KEYS (the step vocabulary)', () => {
  it('carries exactly the web original’s three step states, in order', () => {
    expect([...CHAIN_OF_THOUGHT_STEP_STATUS_KEYS]).toEqual(['pending', 'active', 'complete']);
  });
});

describe('chainOfThoughtStepMeta (the step status → map)', () => {
  it('labels every step status in the house vocabulary', () => {
    expect(chainOfThoughtStepMeta('pending').label).toBe('Pending');
    expect(chainOfThoughtStepMeta('active').label).toBe('Running');
    expect(chainOfThoughtStepMeta('complete').label).toBe('Completed');
  });

  it('gives every step status its icon: dot, loader, check', () => {
    expect(chainOfThoughtStepMeta('pending').iconName).toBe('circle');
    expect(chainOfThoughtStepMeta('active').iconName).toBe('loader-circle');
    expect(chainOfThoughtStepMeta('complete').iconName).toBe('circle-check');
  });

  it('resolves every tone through the shared status map — no second color vocabulary', () => {
    const tones: Record<ChainOfThoughtStepStatus, StatusTone> = {
      pending: 'pending',
      active: 'running',
      complete: 'success',
    };
    for (const status of CHAIN_OF_THOUGHT_STEP_STATUS_KEYS) {
      expect(chainOfThoughtStepMeta(status).tone).toBe<StatusTone>(tones[status]);
      expect(chainOfThoughtStepMeta(status).className).toBe(statusColor[tones[status]]);
    }
  });

  it('keeps active and complete tonally distinct — a running step never reads done', () => {
    expect(chainOfThoughtStepMeta('active').className).not.toBe(
      chainOfThoughtStepMeta('complete').className,
    );
    expect(chainOfThoughtStepMeta('active').iconName).not.toBe(
      chainOfThoughtStepMeta('complete').iconName,
    );
  });
});

describe('chainOfThoughtProgress (the collapsed header’s count)', () => {
  it('counts an empty chain as zero of zero', () => {
    expect(chainOfThoughtProgress([])).toEqual({ complete: 0, total: 0 });
  });

  it('counts only completed steps in the numerator, everything in the denominator', () => {
    const steps: Array<{ status?: ChainOfThoughtStepStatus }> = [
      { status: 'complete' },
      { status: 'active' },
      { status: 'pending' },
      {},
    ];
    expect(chainOfThoughtProgress(steps)).toEqual({ complete: 1, total: 4 });
  });

  it('a fully complete chain reads 4 of 4', () => {
    const steps = Array.from({ length: 4 }, () => ({
      status: 'complete' as ChainOfThoughtStepStatus,
    }));
    expect(chainOfThoughtProgress(steps)).toEqual({ complete: 4, total: 4 });
  });
});

describe('chainOfThoughtProgressLabel (the badge text)', () => {
  it('an empty chain announces that there are no steps yet', () => {
    expect(chainOfThoughtProgressLabel({ complete: 0, total: 0 })).toBe('No steps yet');
  });

  it('is noun-free so the singular never reads wrong', () => {
    expect(chainOfThoughtProgressLabel({ complete: 1, total: 1 })).toBe('1 of 1 complete');
    expect(chainOfThoughtProgressLabel({ complete: 2, total: 5 })).toBe('2 of 5 complete');
  });
});
