/**
 * ChainOfThought — pure logic. Zero react-native imports, so the Vitest tier owns the
 * step map and the progress counter; chain-of-thought.tsx holds only the static
 * iconName → Lucide table, typed exhaustively against `iconName` (see tool.logic.ts for
 * the full rationale).
 *
 * THE STEP STATUS UNION IS DECLARED LOCALLY, not imported from `ai` — message.tsx's
 * precedent: the registry is stateless about the model and takes no runtime dependency
 * on any SDK. The three states are the web original's step states (pending / active /
 * complete); an errored chain step is a tool concern and belongs to Tool's own state
 * machine, which is why no `error` state exists here.
 *
 * The disclosure lifecycle is NOT redefined here — lib/reasoning-lifecycle.ts is THE
 * lifecycle for both thinking disclosures, and chain-of-thought.tsx wires it unchanged.
 */

import { statusColor, type StatusTone } from '@/registry/{engine}/lib/status';

export type ChainOfThoughtStepStatus = 'pending' | 'active' | 'complete';

export const CHAIN_OF_THOUGHT_STEP_STATUS_KEYS = [
  'pending',
  'active',
  'complete',
] as const satisfies readonly ChainOfThoughtStepStatus[];

/** Lucide icon NAME (kebab-case); the component resolves the component. */
export type ChainOfThoughtStepIconName = 'circle' | 'loader-circle' | 'circle-check';

export type ChainOfThoughtStepMeta = {
  /** Badge/label text. House vocabulary: in-flight reads "Running", everywhere. */
  label: string;
  tone: StatusTone;
  iconName: ChainOfThoughtStepIconName;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

export const CHAIN_OF_THOUGHT_STEP_META: Record<ChainOfThoughtStepStatus, ChainOfThoughtStepMeta> = {
  pending: { label: 'Pending', tone: 'pending', iconName: 'circle', className: statusColor.pending },
  active: { label: 'Running', tone: 'running', iconName: 'loader-circle', className: statusColor.running },
  complete: { label: 'Completed', tone: 'success', iconName: 'circle-check', className: statusColor.success },
};

export function chainOfThoughtStepMeta(status: ChainOfThoughtStepStatus): ChainOfThoughtStepMeta {
  return CHAIN_OF_THOUGHT_STEP_META[status];
}

export type ChainOfThoughtProgress = {
  complete: number;
  total: number;
};

/**
 * The collapsed header's glanceable count. Steps are declarative children, so the count
 * cannot be derived from the tree — the collapsed disclosure UNMOUNTS its content, and
 * a header that forgets the count the moment it closes is useless. The consumer passes
 * the same steps array it renders; this counts what it is given. A step with no status
 * yet is not complete, and never inflates the denominator's honesty: total is the
 * array's length.
 */
export function chainOfThoughtProgress(
  steps: ReadonlyArray<{ status?: ChainOfThoughtStepStatus }>,
): ChainOfThoughtProgress {
  let complete = 0;
  for (const step of steps) {
    if (step.status === 'complete') complete++;
  }
  return { complete, total: steps.length };
}

/** The header badge's text. Noun-free so the singular never reads wrong. */
export function chainOfThoughtProgressLabel(progress: ChainOfThoughtProgress): string {
  if (progress.total === 0) return 'No steps yet';
  return `${progress.complete} of ${progress.total} complete`;
}
