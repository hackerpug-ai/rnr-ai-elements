import { describe, expect, it } from 'vitest';
import {
  TASK_STATUS_KEYS,
  type TaskStatus,
  taskStatusMeta,
} from '../packages/registry/src/components/ai/task.logic.ts';
import {
  formatToolInput,
  TOOL_STATUS_KEYS,
  type ToolStatus,
  toolDisplayName,
  toolStatusMeta,
} from '../packages/registry/src/components/ai/tool.logic.ts';
import { type StatusTone, statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the maps, the label precedence, and the tolerant input formatter.
 * Rendering and any style assertion belong to the device tier: the styling engine
 * compiles classes in the Metro transform, so under Vitest a className is an inert
 * string, and lucide-react-native cannot load under Node (hence iconNames here, icons
 * in the component).
 *
 * This suite is the Vitest half of UC-AGENT-01 AC-4: every AI SDK tool-part state must
 * pass through the component with NO unmapped case.
 */

describe('statusColor (the shared tone map)', () => {
  it('carries exactly the three permitted non-token colors, confined here', () => {
    const nonToken = Object.entries(statusColor).filter(([, cls]) =>
      /green-600|orange-600|destructive/.test(cls),
    );
    expect(nonToken.map(([tone]) => tone).sort()).toEqual(['denied', 'error', 'success']);
  });

  it('resolves pending and running through RNR tokens only — never a palette escape', () => {
    expect(statusColor.pending).toBe('text-muted-foreground');
    expect(statusColor.running).toBe('text-primary');
    expect(statusColor.pending).not.toMatch(/green|orange|#[0-9a-f]/i);
  });

  it('pairs dark-mode twins with the non-token colors, as the web original writes them', () => {
    expect(statusColor.success).toBe('text-green-600 dark:text-green-500');
    expect(statusColor.denied).toBe('text-orange-600 dark:text-orange-500');
    expect(statusColor.error).toBe('text-destructive');
  });
});

describe('toolStatusMeta (the state → badge map)', () => {
  it('maps EVERY AI SDK tool-part state — none renders nothing', () => {
    const all: ToolStatus[] = [...TOOL_STATUS_KEYS];
    expect(all).toHaveLength(7);
    for (const state of all) {
      const meta = toolStatusMeta(state);
      expect(meta.label).toBeTruthy();
      expect(meta.className).toBeTruthy();
      expect(meta.iconName).toBeTruthy();
    }
  });

  it('uses the web original’s badge labels verbatim, with no mapping layer', () => {
    expect(toolStatusMeta('input-streaming').label).toBe('Pending');
    expect(toolStatusMeta('input-available').label).toBe('Running');
    expect(toolStatusMeta('output-available').label).toBe('Completed');
    expect(toolStatusMeta('output-error').label).toBe('Error');
    expect(toolStatusMeta('output-denied').label).toBe('Denied');
    expect(toolStatusMeta('approval-requested').label).toBe('Awaiting Approval');
    expect(toolStatusMeta('approval-responded').label).toBe('Responded');
  });

  it('gives error and success distinct tones AND icons — color is never the sole channel', () => {
    const done = toolStatusMeta('output-available');
    const failed = toolStatusMeta('output-error');
    expect(done.tone).toBe<StatusTone>('success');
    expect(failed.tone).toBe<StatusTone>('error');
    expect(done.iconName).not.toBe(failed.iconName);
    expect(done.className).not.toBe(failed.className);
  });

  it('pulses (clock) only for the running state', () => {
    expect(toolStatusMeta('input-available').iconName).toBe('clock');
    for (const state of TOOL_STATUS_KEYS.filter((s) => s !== 'input-available')) {
      expect(toolStatusMeta(state).iconName).not.toBe('clock');
    }
  });
});

describe('toolDisplayName (header label precedence)', () => {
  it('an explicit title wins over everything', () => {
    expect(toolDisplayName('tool-search', 'Custom Title', 'web-search')).toBe('Custom Title');
    expect(toolDisplayName('dynamic-tool', 'Custom Title', 'web-search')).toBe('Custom Title');
  });

  it('derives the label by stripping the tool- prefix', () => {
    expect(toolDisplayName('tool-web-search')).toBe('web-search');
    expect(toolDisplayName('tool-fetch_weather_data')).toBe('fetch_weather_data');
  });

  it('a dynamic tool’s label is its toolName', () => {
    expect(toolDisplayName('dynamic-tool', undefined, 'web-search')).toBe('web-search');
  });

  it('falls back to the raw type when nothing else applies', () => {
    expect(toolDisplayName('dynamic-tool')).toBe('dynamic-tool');
    expect(toolDisplayName('other')).toBe('other');
  });
});

describe('formatToolInput (arguments while still streaming)', () => {
  it('pretty-prints an object at indent 2, the web original’s format', () => {
    expect(formatToolInput({ query: 'weather', units: 'c' })).toBe(
      '{\n  "query": "weather",\n  "units": "c"\n}',
    );
  });

  it('passes a partial string through VERBATIM — never parsed, never repaired', () => {
    const partial = '{"query": "wea';
    expect(formatToolInput(partial)).toBe(partial);
  });

  it('renders nothing for undefined — no empty Parameters shell', () => {
    expect(formatToolInput(undefined)).toBe('');
  });

  it('never throws, even on structures JSON.stringify cannot serialize', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => formatToolInput(circular)).not.toThrow();
    expect(typeof formatToolInput(circular)).toBe('string');
    expect(() => formatToolInput(() => 'x')).not.toThrow();
  });

  it('handles null', () => {
    expect(formatToolInput(null)).toBe('null');
  });
});

describe('taskStatusMeta (the status → label/icon map)', () => {
  it('covers every status including the web schema’s in_progress alias', () => {
    const all: TaskStatus[] = [...TASK_STATUS_KEYS];
    expect(all).toEqual(['pending', 'in_progress', 'running', 'completed', 'rejected']);
    for (const status of all) {
      const meta = taskStatusMeta(status);
      expect(meta.label).toBeTruthy();
      expect(meta.iconName).toBeTruthy();
    }
  });

  it('renders in_progress identically to running', () => {
    const a = taskStatusMeta('in_progress');
    const b = taskStatusMeta('running');
    expect(a).toEqual(b);
  });

  it('completion is success/green and rejection is denial/orange, with distinct icons', () => {
    expect(taskStatusMeta('completed').tone).toBe<StatusTone>('success');
    expect(taskStatusMeta('completed').iconName).toBe('circle-check');
    expect(taskStatusMeta('rejected').tone).toBe<StatusTone>('denied');
    expect(taskStatusMeta('rejected').iconName).toBe('circle-x');
    expect(taskStatusMeta('pending').tone).toBe<StatusTone>('pending');
    expect(taskStatusMeta('running').tone).toBe<StatusTone>('running');
  });
});
