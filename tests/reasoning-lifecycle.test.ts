import { describe, expect, it } from 'vitest';
import {
  initReasoningLifecycle,
  REASONING_AUTO_CLOSE_DELAY,
  type ReasoningLifecycle,
  reasoningLabel,
  reasoningLifecycleReducer as reduce,
  shouldAutoClose,
} from '../packages/registry/src/lib/reasoning-lifecycle.ts';

/**
 * The reasoning disclosure lifecycle, owned end to end by the logic tier.
 *
 * The reducer is pure and time-INJECTED (events carry `at`, epoch ms), so this suite
 * drives the timeline explicitly instead of with fake timers — same determinism, fewer
 * moving parts. The component's timer glue (setTimeout armed while shouldAutoClose is
 * true) is four lines and belongs to the device tier.
 *
 * This is the Vitest half of UC-AGENT-02: auto-open while streaming, auto-collapse when
 * the answer begins, reopenable by the user, duration on the collapsed header.
 */

const T0 = 1_000_000;

function streamStart(state: ReasoningLifecycle, at = T0): ReasoningLifecycle {
  return reduce(state, { type: 'stream-start', at });
}

function streamEnd(state: ReasoningLifecycle, at: number): ReasoningLifecycle {
  return reduce(state, { type: 'stream-end', at });
}

describe('lifecycle: mount', () => {
  it('starts CLOSED when mounted with isStreaming=false — history must not spring open', () => {
    const state = initReasoningLifecycle(false);
    expect(state.open).toBe(false);
    expect(state.streaming).toBe(false);
  });

  it('starts OPEN when defaultOpen is set, and pins keepOpen', () => {
    const state = initReasoningLifecycle(true);
    expect(state.open).toBe(true);
    expect(state.keepOpen).toBe(true);
  });
});

describe('lifecycle: auto-open on stream start', () => {
  it('opens when streaming begins', () => {
    const state = streamStart(initReasoningLifecycle(false));
    expect(state.open).toBe(true);
    expect(state.streaming).toBe(true);
    expect(state.startedAt).toBe(T0);
  });

  it('does NOT auto-open once the user has touched the disclosure', () => {
    const touched = reduce(initReasoningLifecycle(false), { type: 'user-toggle', open: true });
    const state = streamStart(touched);
    expect(state.userTouched).toBe(true);
    expect(state.open).toBe(true); // stayed as the user left it — no automation involved
    // ...and a later close by the user is likewise respected:
    const closed = reduce(state, { type: 'user-toggle', open: false });
    const next = streamStart(closed, T0 + 5_000);
    expect(next.open).toBe(false);
  });
});

describe('lifecycle: auto-close after the answer begins', () => {
  it('arms the countdown at stream-end while still open', () => {
    const state = streamEnd(streamStart(initReasoningLifecycle(false)), T0 + 4_000);
    expect(state.streaming).toBe(false);
    expect(state.open).toBe(true);
    expect(shouldAutoClose(state)).toBe(true);
  });

  it('the armed delay is the documented 1000ms', () => {
    expect(REASONING_AUTO_CLOSE_DELAY).toBe(1000);
  });

  it('closes when the timer fires, and disarms so the timer cannot double-fire', () => {
    const armed = streamEnd(streamStart(initReasoningLifecycle(false)), T0 + 4_000);
    const closed = reduce(armed, { type: 'auto-close' });
    expect(closed.open).toBe(false);
    expect(shouldAutoClose(closed)).toBe(false);
    expect(reduce(closed, { type: 'auto-close' })).toEqual(closed);
  });

  it('a stale timer is a no-op when nothing is armed', () => {
    const idle = initReasoningLifecycle(false);
    expect(reduce(idle, { type: 'auto-close' })).toBe(idle);
  });

  it('defaultOpen never arms the countdown — pinned open by design', () => {
    const pinned = initReasoningLifecycle(true);
    const state = streamEnd(streamStart(pinned, T0), T0 + 4_000);
    expect(state.open).toBe(true);
    expect(shouldAutoClose(state)).toBe(false);
  });
});

describe('lifecycle: user interaction wins', () => {
  it('a user toggle DURING streaming cancels the auto-close that would follow', () => {
    let state = streamStart(initReasoningLifecycle(false));
    state = reduce(state, { type: 'user-toggle', open: false });
    state = streamEnd(state, T0 + 4_000);
    expect(shouldAutoClose(state)).toBe(false);
    expect(state.open).toBe(false);
  });

  it('a user reopen DURING the countdown disarms it — the reader keeps the trace', () => {
    let state = streamEnd(streamStart(initReasoningLifecycle(false)), T0 + 4_000);
    expect(shouldAutoClose(state)).toBe(true);
    state = reduce(state, { type: 'user-toggle', open: true });
    expect(shouldAutoClose(state)).toBe(false);
    expect(reduce(state, { type: 'auto-close' }).open).toBe(true); // timer firing changes nothing
  });
});

describe('lifecycle: duration', () => {
  it('freezes whole seconds at stream end', () => {
    const state = streamEnd(streamStart(initReasoningLifecycle(false), T0), T0 + 5_200);
    expect(state.durationSeconds).toBe(5);
  });

  it('floors sub-second reasoning to 0 rather than pretending a second passed', () => {
    const state = streamEnd(streamStart(initReasoningLifecycle(false), T0), T0 + 600);
    expect(state.durationSeconds).toBe(0);
  });

  it('is null while streaming and resets on a second stream', () => {
    let state = streamEnd(streamStart(initReasoningLifecycle(false), T0), T0 + 3_000);
    expect(state.durationSeconds).toBe(3);
    state = streamStart(state, T0 + 10_000);
    expect(state.durationSeconds).toBeNull();
    state = streamEnd(state, T0 + 11_500);
    expect(state.durationSeconds).toBe(1);
  });

  it('stays null if stream-end arrives with no recorded start', () => {
    const state = streamEnd(initReasoningLifecycle(false), T0 + 3_000);
    expect(state.durationSeconds).toBeNull();
  });
});

describe('reasoningLabel (the collapsed header)', () => {
  it('announces the work while streaming', () => {
    expect(reasoningLabel({ streaming: true, durationSeconds: null })).toBe('Thinking…');
  });

  it('the fallback is REACHABLE — the web original’s 1.6.1 fix', () => {
    // A block that never streamed (loaded history, no timing data).
    expect(reasoningLabel({ streaming: false, durationSeconds: null })).toBe(
      'Thought for a few seconds',
    );
  });

  it('shows the frozen duration with correct pluralization', () => {
    expect(reasoningLabel({ streaming: false, durationSeconds: 5 })).toBe('Thought for 5 seconds');
    expect(reasoningLabel({ streaming: false, durationSeconds: 1 })).toBe('Thought for 1 second');
    expect(reasoningLabel({ streaming: false, durationSeconds: 0 })).toBe('Thought for 0 seconds');
  });
});
