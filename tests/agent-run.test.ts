import { describe, expect, it } from 'vitest';
import {
  AGENT_RUN_ACTIONS,
  AGENT_RUN_STATUS_KEYS,
  type AgentRunAction,
  type AgentRunStatus,
  agentRunMeta,
  enabledRunActions,
} from '../packages/registry/src/components/ai/agent.logic.ts';
import { type StatusTone, statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the run-state map and the control-bar state machine. Rendering and
 * any style assertion belong to the device tier (see agent-status.test.ts's header for
 * why: the styling engine compiles classes in the Metro transform, and
 * lucide-react-native cannot load under Node — hence iconNames here, icons in the
 * component).
 *
 * This suite is the Vitest half of UC-AGENT-05 AC-4: the thumb-reachable control bar
 * must enable exactly the verbs each run state allows, never more.
 */

describe('AGENT_RUN_STATUS_KEYS (the run vocabulary)', () => {
  it('carries exactly the five run states, in order', () => {
    expect([...AGENT_RUN_STATUS_KEYS]).toEqual(['idle', 'running', 'paused', 'error', 'done']);
  });
});

describe('agentRunMeta (the run status → badge map)', () => {
  it('labels every run state exactly', () => {
    expect(agentRunMeta('idle').label).toBe('Idle');
    expect(agentRunMeta('running').label).toBe('Running');
    expect(agentRunMeta('paused').label).toBe('Paused');
    expect(agentRunMeta('error').label).toBe('Error');
    expect(agentRunMeta('done').label).toBe('Done');
  });

  it('gives every run state an icon name, and running the animated one', () => {
    expect(agentRunMeta('idle').iconName).toBe('circle');
    expect(agentRunMeta('running').iconName).toBe('loader-circle');
    expect(agentRunMeta('paused').iconName).toBe('circle-pause');
    expect(agentRunMeta('error').iconName).toBe('circle-x');
    expect(agentRunMeta('done').iconName).toBe('circle-check');
  });

  it('resolves every tone through the shared status map — no second color vocabulary', () => {
    const tones: Record<AgentRunStatus, StatusTone> = {
      idle: 'pending',
      running: 'running',
      paused: 'pending',
      error: 'error',
      done: 'success',
    };
    for (const status of AGENT_RUN_STATUS_KEYS) {
      expect(agentRunMeta(status).tone).toBe<StatusTone>(tones[status]);
      expect(agentRunMeta(status).className).toBe(statusColor[tones[status]]);
    }
  });

  it('keeps idle and paused the same tone but distinct icons — color is never the sole channel', () => {
    expect(agentRunMeta('idle').tone).toBe(agentRunMeta('paused').tone);
    expect(agentRunMeta('idle').iconName).not.toBe(agentRunMeta('paused').iconName);
  });
});

describe('enabledRunActions (the control-bar state machine)', () => {
  it('offers exactly the three verbs of UC-AGENT-05 AC-4', () => {
    expect([...AGENT_RUN_ACTIONS]).toEqual(['start', 'pause', 'stop']);
  });

  it('idle: start only', () => {
    expect(enabledRunActions('idle')).toEqual<AgentRunAction[]>(['start']);
  });

  it('running: pause and stop, never start', () => {
    expect(enabledRunActions('running')).toEqual<AgentRunAction[]>(['pause', 'stop']);
  });

  it('paused: start (resume) and stop', () => {
    expect(enabledRunActions('paused')).toEqual<AgentRunAction[]>(['start', 'stop']);
  });

  it('a run that already ended has nothing left to stop', () => {
    expect(enabledRunActions('error')).toEqual<AgentRunAction[]>(['start']);
    expect(enabledRunActions('done')).toEqual<AgentRunAction[]>(['start']);
  });

  it('never enables an impossible verb, for every state', () => {
    for (const status of AGENT_RUN_STATUS_KEYS) {
      const enabled = enabledRunActions(status);
      expect(new Set(enabled).size).toBe(enabled.length);
      if (status !== 'running' && status !== 'paused') {
        expect(enabled).not.toContain('stop');
      }
      if (status === 'running') {
        expect(enabled).not.toContain('start');
      }
    }
  });
});
