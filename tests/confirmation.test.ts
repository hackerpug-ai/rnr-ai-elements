import { describe, expect, it } from 'vitest';
import {
  CONFIRMATION_OUTCOME,
  CONFIRMATION_PHASE_KEYS,
  type ConfirmationApproval,
  confirmationPhase,
  resolveDecision,
  type ToolStatus,
} from '../packages/registry/src/components/ai/confirmation.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the approval phase machine (see agent-status.test.ts's header for
 * why rendering itself cannot live in this tier).
 *
 * This suite is the Vitest half of UC-AGENT-04: the web original's render contract made
 * total. EVERY tool-part state crosses the machine below in each approval shape — no
 * unmapped case, no state where the card shows the wrong thing.
 */

const ALL_STATES: ToolStatus[] = [
  'input-streaming',
  'input-available',
  'output-available',
  'output-error',
  'output-denied',
  'approval-requested',
  'approval-responded',
];

const PENDING: ConfirmationApproval = {};
const APPROVED: ConfirmationApproval = { approved: true };
const DENIED: ConfirmationApproval = { approved: false };

describe('CONFIRMATION_PHASE_KEYS (the phase vocabulary)', () => {
  it('carries exactly the four phases, in order', () => {
    expect([...CONFIRMATION_PHASE_KEYS]).toEqual(['hidden', 'pending', 'approved', 'denied']);
  });
});

describe('confirmationPhase (the render contract, made total)', () => {
  it('renders nothing without an approval — no state escapes that', () => {
    for (const state of ALL_STATES) {
      expect(confirmationPhase(state, undefined)).toBe('hidden');
      expect(confirmationPhase(state, null)).toBe('hidden');
    }
  });

  it('renders nothing while arguments are still streaming, EVEN with an approval', () => {
    expect(confirmationPhase('input-streaming', PENDING)).toBe('hidden');
    expect(confirmationPhase('input-available', PENDING)).toBe('hidden');
    expect(confirmationPhase('input-streaming', APPROVED)).toBe('hidden');
    expect(confirmationPhase('input-available', DENIED)).toBe('hidden');
  });

  it('an undecided approval on an approval state is pending', () => {
    expect(confirmationPhase('approval-requested', PENDING)).toBe('pending');
    expect(confirmationPhase('approval-responded', PENDING)).toBe('pending');
  });

  it('a decision persists across every later tool state — the transcript keeps the outcome', () => {
    for (const state of ALL_STATES) {
      if (state === 'input-streaming' || state === 'input-available') continue;
      expect(confirmationPhase(state, APPROVED)).toBe('approved');
      expect(confirmationPhase(state, DENIED)).toBe('denied');
    }
  });

  it('undecided and the part moved on — there is no request left to answer', () => {
    expect(confirmationPhase('output-available', PENDING)).toBe('hidden');
    expect(confirmationPhase('output-error', PENDING)).toBe('hidden');
    expect(confirmationPhase('output-denied', PENDING)).toBe('hidden');
  });

  it('an optimistic local answer drives the phase before props speak', () => {
    expect(confirmationPhase('approval-requested', undefined, true)).toBe('approved');
    expect(confirmationPhase('approval-requested', undefined, false)).toBe('denied');
    expect(confirmationPhase('approval-requested', PENDING, true)).toBe('approved');
  });

  it('the streaming guard outranks even a local answer', () => {
    expect(confirmationPhase('input-streaming', undefined, true)).toBe('hidden');
  });
});

describe('resolveDecision (whose answer wins)', () => {
  it('a controlled approval that carries a decision always wins', () => {
    expect(resolveDecision(APPROVED, false)).toBe(true);
    expect(resolveDecision(DENIED, true)).toBe(false);
  });

  it('an undecided controlled approval yields to the local answer', () => {
    expect(resolveDecision(PENDING, true)).toBe(true);
    expect(resolveDecision(PENDING, false)).toBe(false);
    expect(resolveDecision(PENDING, null)).toBeNull();
  });

  it('no approval and no local answer is no decision', () => {
    expect(resolveDecision(undefined, null)).toBeNull();
    expect(resolveDecision(undefined, true)).toBe(true);
  });
});

describe('CONFIRMATION_OUTCOME (the persisted outcome row)', () => {
  it('labels the two terminal outcomes exactly', () => {
    expect(CONFIRMATION_OUTCOME.approved.label).toBe('Approved');
    expect(CONFIRMATION_OUTCOME.denied.label).toBe('Denied');
  });

  it('keeps color from being the sole channel — distinct icons per outcome', () => {
    expect(CONFIRMATION_OUTCOME.approved.iconName).toBe('circle-check');
    expect(CONFIRMATION_OUTCOME.denied.iconName).toBe('circle-slash');
    expect(CONFIRMATION_OUTCOME.approved.iconName).not.toBe(CONFIRMATION_OUTCOME.denied.iconName);
  });

  it('resolves both outcomes through the shared status map — no second color vocabulary', () => {
    expect(CONFIRMATION_OUTCOME.approved.className).toBe(statusColor.success);
    expect(CONFIRMATION_OUTCOME.denied.className).toBe(statusColor.denied);
  });
});
