import { statusColor, type StatusTone } from '@/lib/status';

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
