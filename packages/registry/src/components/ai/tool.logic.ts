/**
 * Tool — pure logic. Everything here is data-in, data-out with zero react-native
 * imports, which is what lets the Vitest tier own it (see the header of
 * lib/reasoning-lifecycle.ts for why component files themselves cannot load under
 * Node). tool.tsx holds only the static iconName → Lucide component table, typed
 * exhaustively against `iconName` so a key added here without an icon there fails tsc.
 *
 * THE INTEGRATION SEAM. `ToolStatus` mirrors the AI SDK tool-part `state` union
 * verbatim ('input-streaming' | 'input-available' | 'output-available' | 'output-error'
 * | 'output-denied' | 'approval-requested' | 'approval-responded'). It is declared
 * locally, not imported from `ai` — message.tsx's precedent: the registry is stateless
 * about the model and takes no runtime dependency on any SDK. A consumer streams
 * `part.state` straight into `<Tool state={part.state}>` with no adapter.
 */

import { statusColor, type StatusTone } from '@/registry/{engine}/lib/status';

export type ToolStatus =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'
  | 'output-denied'
  | 'approval-requested'
  | 'approval-responded';

/** Every AI SDK tool-part state, spelled out. UC-AGENT-01 AC-4: none may be unhandled. */
export const TOOL_STATUS_KEYS = [
  'input-streaming',
  'input-available',
  'output-available',
  'output-error',
  'output-denied',
  'approval-requested',
  'approval-responded',
] as const satisfies readonly ToolStatus[];

/** Lucide icon NAME (kebab-case); the component resolves the component. */
export type ToolStatusIconName =
  | 'clock'
  | 'circle'
  | 'circle-check'
  | 'circle-x'
  | 'circle-slash'
  | 'circle-help';

export type ToolStatusMeta = {
  /** Badge text — verbatim from the web original's header map. */
  label: string;
  tone: StatusTone;
  iconName: ToolStatusIconName;
  /**
   * Precomposed text class. '' inherits the Badge's own color — the web gives the
   * streaming/running states no hue (remediation row 4). Everything else is either a
   * shared statusColor value or the web's approval hues (yellow/blue, dark twins).
   */
  className: string;
};

/**
 * The web original maps state → badge with NO mapping layer, and so do we — one record,
 * every state, labels byte-identical to the original: input-streaming→Pending,
 * input-available→Running, output-available→Completed, output-error→Error,
 * approval-requested→Awaiting Approval, approval-responded→Responded,
 * output-denied→Denied.
 *
 * HUES CONVERGE TO THE WEB (remediation row 4, web tool.tsx:62-72): streaming and
 * running get NO color ('' — the badge's secondary surface carries them, exactly the
 * web's uncolored Pending/Running); approval-requested is yellow-600 (dark:yellow-400)
 * and approval-responded is blue-600 (dark:blue-400), the web's exact approval pair.
 * output-available/output-error/output-denied keep the shared statusColor values — the
 * destructive token for error is the recorded keep versus the web's red-600, and
 * denied's orange-600 already matches the web. The shared lib/status.ts map is
 * INTENTIONALLY UNTOUCHED: its other consumers keep the recorded 5-tone compression.
 *
 * Icon + color ride along because color is never the sole channel (WCAG 1.4.1): a
 * completed call and an errored one must tell apart with the badge text hidden. The
 * web pairs the plain circle with streaming and the clock with running (web
 * tool.tsx:61-63); the pulse is the one icon the component animates, and it stays on
 * input-available only — gated on reduced motion, per the design lens.
 */
export const TOOL_STATUS_META: Record<ToolStatus, ToolStatusMeta> = {
  'input-streaming': { label: 'Pending', tone: 'pending', iconName: 'circle', className: '' },
  'input-available': { label: 'Running', tone: 'running', iconName: 'clock', className: '' },
  'output-available': { label: 'Completed', tone: 'success', iconName: 'circle-check', className: statusColor.success },
  'output-error': { label: 'Error', tone: 'error', iconName: 'circle-x', className: statusColor.error },
  'output-denied': { label: 'Denied', tone: 'denied', iconName: 'circle-slash', className: statusColor.denied },
  'approval-requested': { label: 'Awaiting Approval', tone: 'running', iconName: 'circle-help', className: 'text-yellow-600 dark:text-yellow-400' },
  'approval-responded': { label: 'Responded', tone: 'pending', iconName: 'circle-check', className: 'text-blue-600 dark:text-blue-400' },
};

export function toolStatusMeta(state: ToolStatus): ToolStatusMeta {
  return TOOL_STATUS_META[state];
}

/**
 * The header's display name, with the web original's precedence: an explicit `title`
 * wins over everything; `type="tool-web-search"` derives "web-search" by stripping the
 * prefix; a dynamic tool's label is its `toolName`; anything else shows the type itself.
 */
export function toolDisplayName(type: string, title?: string, toolName?: string): string {
  if (title) return title;
  if (type.startsWith('tool-')) return type.slice('tool-'.length);
  if (type === 'dynamic-tool' && toolName) return toolName;
  return type;
}

/**
 * ToolInput must render WHILE ARGUMENTS ARE STILL STREAMING IN (input-streaming), so it
 * has to tolerate partial or invalid JSON. Strings pass through verbatim — a
 * half-arrived `{"query": "wea` is displayed exactly as received, never parsed, never
 * repaired. Objects pretty-print at indent 2, the web original's format. Nothing in
 * this function may throw: a circular structure or a stringify-undefined value degrades
 * to String() instead of crashing the transcript.
 */
export function formatToolInput(input: unknown): string {
  if (input === undefined) return '';
  if (typeof input === 'string') return input;
  if (input === null) return 'null';
  try {
    return JSON.stringify(input, null, 2) ?? String(input);
  } catch {
    return String(input);
  }
}
