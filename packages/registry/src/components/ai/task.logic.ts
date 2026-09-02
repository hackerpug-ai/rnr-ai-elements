/**
 * Task — pure logic. Zero react-native imports, so the Vitest tier owns the
 * status→label/icon/color map; task.tsx holds only the static iconName → Lucide table,
 * typed exhaustively against `iconName` (see tool.logic.ts for the full rationale).
 *
 * The status union is the web original's gen-ui task schema (`pending` | `in_progress` |
 * `completed`) widened by this port's two additions: `running` (the PRD's own word for
 * the in-flight state — UC-AGENT-03: "pending to running to complete") and `rejected`
 * (an agent plan step the user declined). `in_progress` is kept as an accepted alias so
 * a consumer feeding the web schema verbatim still typechecks; it renders identically
 * to `running`.
 *
 * Color is never the sole channel: every status carries a distinct icon and a text
 * label, and the label is what a screen reader announces.
 */

import { statusColor, type StatusTone } from '@/registry/{engine}/lib/status';

export type TaskStatus = 'pending' | 'in_progress' | 'running' | 'completed' | 'rejected';

export const TASK_STATUS_KEYS = [
  'pending',
  'in_progress',
  'running',
  'completed',
  'rejected',
] as const satisfies readonly TaskStatus[];

/** Lucide icon NAME (kebab-case); the component resolves the component. */
export type TaskStatusIconName = 'circle' | 'loader-circle' | 'circle-check' | 'circle-x';

export type TaskStatusMeta = {
  /** Badge text. `in_progress` borrows the PRD's word, "Running". */
  label: string;
  tone: StatusTone;
  iconName: TaskStatusIconName;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

export const TASK_STATUS_META: Record<TaskStatus, TaskStatusMeta> = {
  pending: { label: 'Pending', tone: 'pending', iconName: 'circle', className: statusColor.pending },
  in_progress: { label: 'Running', tone: 'running', iconName: 'loader-circle', className: statusColor.running },
  running: { label: 'Running', tone: 'running', iconName: 'loader-circle', className: statusColor.running },
  completed: { label: 'Completed', tone: 'success', iconName: 'circle-check', className: statusColor.success },
  rejected: { label: 'Rejected', tone: 'denied', iconName: 'circle-x', className: statusColor.denied },
};

export function taskStatusMeta(status: TaskStatus): TaskStatusMeta {
  return TASK_STATUS_META[status];
}
