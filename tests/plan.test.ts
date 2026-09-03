import { describe, expect, it } from 'vitest';
import {
  planProgress,
  planProgressLabel,
} from '../packages/registry/src/components/ai/plan.logic.ts';
import type { TaskStatus } from '../packages/registry/src/components/ai/task.logic.ts';

/**
 * Pure logic only — the progress arithmetic (see agent-status.test.ts's header for why
 * rendering itself cannot live in this tier).
 *
 * This suite is the Vitest half of UC-AGENT-03 AC-4: at a glance, how many steps remain.
 * The counting rules under test, on the record: completed is DONE; running/in_progress
 * is IN FLIGHT; pending AND rejected are REMAINING — a declined step is unfinished work,
 * and hiding it would make the plan read complete when it is not.
 */

function stepsOf(...statuses: TaskStatus[]): Array<{ status: TaskStatus }> {
  return statuses.map((status) => ({ status }));
}

describe('planProgress (the count behind the badge)', () => {
  it('an empty plan is zero everywhere', () => {
    expect(planProgress([])).toEqual({ total: 0, completed: 0, running: 0, remaining: 0 });
  });

  it('counts completed toward done and running toward in-flight', () => {
    const progress = planProgress(stepsOf('completed', 'running', 'pending'));
    expect(progress).toEqual({ total: 3, completed: 1, running: 1, remaining: 2 });
  });

  it('the web schema’s in_progress alias counts as running', () => {
    const progress = planProgress(stepsOf('in_progress'));
    expect(progress.running).toBe(1);
    expect(progress.completed).toBe(0);
  });

  it('a rejected step is neither done nor in-flight — it remains', () => {
    const progress = planProgress(stepsOf('completed', 'rejected'));
    expect(progress.completed).toBe(1);
    expect(progress.running).toBe(0);
    expect(progress.remaining).toBe(1);
  });

  it('remaining is exactly total minus completed, whatever else is in the list', () => {
    const progress = planProgress(
      stepsOf('completed', 'completed', 'running', 'in_progress', 'pending', 'rejected'),
    );
    expect(progress.total).toBe(6);
    expect(progress.completed).toBe(2);
    expect(progress.remaining).toBe(4);
  });
});

describe('planProgressLabel (the badge text)', () => {
  it('an empty plan announces that there are no steps yet', () => {
    expect(planProgressLabel(planProgress([]))).toBe('No steps yet');
  });

  it('a running plan shows done and remaining — the AC-4 glance', () => {
    const progress = planProgress(stepsOf('completed', 'completed', 'running', 'pending'));
    expect(planProgressLabel(progress)).toBe('2 of 4 complete · 2 remaining');
  });

  it('a finished plan never says "0 remaining"', () => {
    const progress = planProgress(stepsOf('completed', 'completed'));
    expect(planProgressLabel(progress)).toBe('2 of 2 complete');
  });
});
