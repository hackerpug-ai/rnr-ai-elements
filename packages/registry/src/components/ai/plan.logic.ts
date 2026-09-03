/**
 * Plan — pure logic. Zero react-native imports, so the Vitest tier owns the progress
 * arithmetic; plan.tsx holds only presentation.
 *
 * THE STEP STATUS UNION IS TASK'S, NOT A SECOND ONE. Plan steps are task rows (plan.tsx
 * composes the task organism's own primitives — TaskItem / TaskItemFile — and never
 * re-derives their status map), so the plan counts `TaskStatus` verbatim, including the
 * web schema's `in_progress` alias. Counting rules, on the record:
 *   - `completed` counts toward DONE.
 *   - `running` / `in_progress` count toward IN FLIGHT.
 *   - `pending` and `rejected` count toward REMAINING — a rejected step is unfinished
 *     work the user declined, and hiding it from the remaining count would make the
 *     plan read complete when it is not.
 */

import type { TaskStatus } from './task.logic';

export type PlanProgress = {
  total: number;
  completed: number;
  running: number;
  remaining: number;
};

export function planProgress(steps: ReadonlyArray<{ status?: TaskStatus }>): PlanProgress {
  let completed = 0;
  let running = 0;
  for (const step of steps) {
    if (step.status === 'completed') completed++;
    else if (step.status === 'running' || step.status === 'in_progress') running++;
  }
  return { total: steps.length, completed, running, remaining: steps.length - completed };
}

/**
 * UC-AGENT-03 AC-4 — "tell at a glance how many steps remain in a running plan". The
 * remaining clause only appears while work remains; a finished plan reads as a plain
 * "N of N complete" and never as "0 remaining".
 */
export function planProgressLabel(progress: PlanProgress): string {
  if (progress.total === 0) return 'No steps yet';
  const base = `${progress.completed} of ${progress.total} complete`;
  return progress.remaining > 0 ? `${base} · ${progress.remaining} remaining` : base;
}
