/**
 * Confirmation — pure logic. Zero react-native imports, so the Vitest tier owns the
 * approval state machine; confirmation.tsx holds only presentation.
 *
 * THE AI SDK TOOL-PART STATE UNION IS DECLARED LOCALLY — tool.logic.ts's precedent:
 * the registry is stateless about the model and takes no runtime dependency on any SDK.
 * The union mirrors the tool part's `state` verbatim; a consumer streams `part.state`
 * and `part.approval` straight in, no adapter.
 *
 * THE STATE MACHINE IS THE WEB ORIGINAL'S RENDER CONTRACT, MADE TOTAL. The web
 * Confirmation renders NOTHING without an `approval` and nothing while the tool part is
 * still streaming its input ('input-streaming' / 'input-available'); Actions render
 * only while approval is requested; a decision persists. Those rules are `phase` here,
 * covering every input without an unmapped case.
 */

import { statusColor } from '@/registry/{engine}/lib/status';

/**
 * The tool approval object, as the AI SDK tool part carries it: present (possibly
 * undecided) once the run has asked for permission, carrying the decision afterwards.
 */
export type ConfirmationApproval = { approved?: boolean };

export type ToolStatus =
  | 'input-streaming'
  | 'input-available'
  | 'output-available'
  | 'output-error'
  | 'output-denied'
  | 'approval-requested'
  | 'approval-responded';

/** What the card shows. `hidden` renders nothing — the web original's contract. */
export type ConfirmationPhase = 'hidden' | 'pending' | 'approved' | 'denied';

export const CONFIRMATION_PHASE_KEYS = [
  'hidden',
  'pending',
  'approved',
  'denied',
] as const satisfies readonly ConfirmationPhase[];

/**
 * The decision the UI should honor: a controlled `approval` that already carries a
 * decision always wins (props are the transcript's memory — a restored card must show
 * what was decided, never a stale optimistic answer); otherwise the caller-side
 * optimistic answer stands.
 */
export function resolveDecision(
  approval?: ConfirmationApproval | null,
  localAnswer: boolean | null = null,
): boolean | null {
  if (approval && typeof approval.approved === 'boolean') return approval.approved;
  return localAnswer;
}

/**
 * The phase machine. Rules, verbatim from the web original's render contract:
 *   - No `approval` and no local answer → hidden. Nothing was ever requested.
 *   - input-streaming / input-available → hidden, EVEN with an approval object — the
 *     tool is still assembling its arguments; asking for a decision now would decide
 *     about a moving target.
 *   - A decision (controlled or optimistic) → approved / denied, and it PERSISTS: the
 *     transcript keeps the outcome visible afterward (UC-AGENT-04 AC-3), whatever the
 *     tool part's later state.
 *   - Still undecided on an approval state → pending.
 *   - Undecided and the part moved on (output-error, output-denied with no recorded
 *     decision) → hidden. There is no request left to answer.
 */
export function confirmationPhase(
  state: ToolStatus,
  approval?: ConfirmationApproval | null,
  localAnswer: boolean | null = null,
): ConfirmationPhase {
  if (state === 'input-streaming' || state === 'input-available') return 'hidden';
  const decision = resolveDecision(approval, localAnswer);
  if (!approval && decision === null) return 'hidden';
  if (decision === true) return 'approved';
  if (decision === false) return 'denied';
  if (state === 'approval-requested' || state === 'approval-responded') return 'pending';
  return 'hidden';
}

/**
 * The two terminal outcomes, with the labels a restored transcript reads and the icons
 * that keep color from being the sole channel. Tones resolve through lib/status.ts —
 * the ONE map. Approve persists as success, deny as denial.
 */
export const CONFIRMATION_OUTCOME: Record<
  Exclude<ConfirmationPhase, 'hidden' | 'pending'>,
  { label: string; iconName: 'circle-check' | 'circle-slash'; className: string }
> = {
  approved: {
    label: 'Approved',
    iconName: 'circle-check',
    className: statusColor.success,
  },
  denied: {
    label: 'Denied',
    iconName: 'circle-slash',
    className: statusColor.denied,
  },
};
