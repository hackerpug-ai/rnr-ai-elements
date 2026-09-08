import { statusColor, type StatusTone } from '@/lib/status';

/** The run states the control bar can drive and the transcript can show. */
export type AgentRunStatus = 'idle' | 'running' | 'paused' | 'error' | 'done';

export const AGENT_RUN_STATUS_KEYS = [
  'idle',
  'running',
  'paused',
  'error',
  'done',
] as const satisfies readonly AgentRunStatus[];

/** The three verbs of UC-AGENT-05 AC-4's control bar. */
export type AgentRunAction = 'start' | 'pause' | 'stop';

export const AGENT_RUN_ACTIONS = [
  'start',
  'pause',
  'stop',
] as const satisfies readonly AgentRunAction[];

/** Lucide icon NAME (kebab-case); the component resolves the component. */
export type AgentRunIconName =
  | 'circle'
  | 'loader-circle'
  | 'circle-pause'
  | 'circle-x'
  | 'circle-check';

export type AgentRunMeta = {
  /** Badge text. */
  label: string;
  tone: StatusTone;
  iconName: AgentRunIconName;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

export const AGENT_RUN_STATUS_META: Record<AgentRunStatus, AgentRunMeta> = {
  idle: { label: 'Idle', tone: 'pending', iconName: 'circle', className: statusColor.pending },
  running: { label: 'Running', tone: 'running', iconName: 'loader-circle', className: statusColor.running },
  paused: { label: 'Paused', tone: 'pending', iconName: 'circle-pause', className: statusColor.pending },
  error: { label: 'Error', tone: 'error', iconName: 'circle-x', className: statusColor.error },
  done: { label: 'Done', tone: 'success', iconName: 'circle-check', className: statusColor.success },
};

export function agentRunMeta(status: AgentRunStatus): AgentRunMeta {
  return AGENT_RUN_STATUS_META[status];
}

/**
 * Which controls each run state enables — the whole state machine behind the control
 * bar, kept pure so the Vitest tier owns it. A run that has already ended (error, done)
 * has nothing left to stop, and an idle run has nothing to pause: the impossible
 * controls are disabled, never hidden — a control that vanishes under a thumb mid-press
 * is the failure this shape prevents.
 */
export function enabledRunActions(status: AgentRunStatus): AgentRunAction[] {
  switch (status) {
    case 'idle':
      return ['start'];
    case 'running':
      return ['pause', 'stop'];
    case 'paused':
      return ['start', 'stop'];
    case 'error':
    case 'done':
      return ['start'];
  }
}
