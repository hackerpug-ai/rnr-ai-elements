/**
 * The reasoning disclosure lifecycle, as a pure reducer.
 *
 * THE WEB ORIGINAL'S BEHAVIOR, EXACTLY (this is the component's whole point):
 *  - `isStreaming` going true AUTO-OPENS the trace — the user watches the model think.
 *  - When streaming ends it auto-closes after REASONING_AUTO_CLOSE_DELAY (1000ms — the
 *    web original's delay, which is also RNR's own house tempo: Skeleton's pulse and
 *    this registry's Shimmer both run 1000ms).
 *  - `isStreaming={false}` at mount starts CLOSED — loaded history must not spring open.
 *  - defaultOpen keeps it open and it must NEVER auto-close (the web original's
 *    documented exception).
 *  - Once the user has touched the disclosure, automation stands down: it never
 *    auto-opens again and a pending auto-close is cancelled. Yanking a disclosure out of
 *    the reader's hands is the failure this state machine exists to prevent.
 *  - It tracks how long isStreaming stayed true and freezes that at stream end
 *    (`durationSeconds`, undefined while streaming — a per-second live tick would
 *    chatter to screen readers; the collapsed header shows it once, after).
 *
 * WHY A REDUCER, and why HERE and not in reasoning.tsx: this file is pure TypeScript
 * with zero imports, so the Vitest tier can own the lifecycle outright — the styling
 * engine compiles classes in the Metro transform, and react-native itself cannot load
 * under Node, so anything living in a component file is untestable there. The component
 * contributes exactly two lines of glue: dispatch on isStreaming transitions, and a
 * setTimeout armed while `shouldAutoClose` is true.
 *
 * Time is INJECTED (`at` on events, epoch ms) rather than read from a clock, so tests
 * drive the timeline explicitly instead of with fake timers.
 */

/** ms the disclosure stays open after the answer begins. Web original: 1000. */
export const REASONING_AUTO_CLOSE_DELAY = 1000;

export type ReasoningLifecycleEvent =
  | { type: 'stream-start'; at: number }
  | { type: 'stream-end'; at: number }
  /** The component's timer fired. A no-op unless the countdown is armed. */
  | { type: 'auto-close' }
  /** The user pressed the trigger. */
  | { type: 'user-toggle'; open: boolean };

export type ReasoningLifecycle = {
  open: boolean;
  streaming: boolean;
  /** Any user interaction sets this; automation never overrides it again. */
  userTouched: boolean;
  /** From `defaultOpen` — pinned open, never auto-closes. */
  keepOpen: boolean;
  /** True between stream-end and the auto-close firing. The component's timer keys on this. */
  closeArmed: boolean;
  startedAt: number | null;
  /** Whole seconds the model reasoned. null while streaming and before the first stream. */
  durationSeconds: number | null;
};

export function initReasoningLifecycle(defaultOpen = false): ReasoningLifecycle {
  return {
    open: defaultOpen,
    streaming: false,
    userTouched: false,
    keepOpen: defaultOpen,
    closeArmed: false,
    startedAt: null,
    durationSeconds: null,
  };
}

export function reasoningLifecycleReducer(
  state: ReasoningLifecycle,
  event: ReasoningLifecycleEvent,
): ReasoningLifecycle {
  switch (event.type) {
    case 'stream-start': {
      // Auto-open, but only while the automation still owns the disclosure.
      const open = state.userTouched ? state.open : true;
      return {
        ...state,
        open,
        streaming: true,
        closeArmed: false,
        startedAt: event.at,
        // A new stream invalidates the previous duration until it ends again.
        durationSeconds: null,
      };
    }

    case 'stream-end': {
      const durationSeconds =
        state.startedAt === null
          ? null
          : Math.max(0, Math.floor((event.at - state.startedAt) / 1000));
      return {
        ...state,
        streaming: false,
        durationSeconds,
        // Arm the countdown only if the automation still owns the disclosure.
        closeArmed: !state.userTouched && !state.keepOpen && state.open,
      };
    }

    case 'auto-close': {
      // Stale timers (a user toggle raced the tick) must be a no-op, not a close.
      if (!state.closeArmed) return state;
      return { ...state, open: false, closeArmed: false };
    }

    case 'user-toggle': {
      return {
        ...state,
        open: event.open,
        userTouched: true,
        // A user action always cancels a pending auto-close.
        closeArmed: false,
      };
    }
  }
}

/** True while the component should keep a timer armed to fire `auto-close`. */
export function shouldAutoClose(state: ReasoningLifecycle): boolean {
  return state.closeArmed;
}

/**
 * The collapsed header's label. While streaming it announces the work; afterwards the
 * frozen duration; and for a block that never streamed (loaded history, no timing data)
 * the fallback — the web original's 1.6.1 fix, which requires this message to be
 * reachable.
 */
export function reasoningLabel(state: Pick<ReasoningLifecycle, 'streaming' | 'durationSeconds'>): string {
  if (state.streaming) return 'Thinking…';
  if (state.durationSeconds === null) return 'Thought for a few seconds';
  const n = state.durationSeconds;
  return `Thought for ${n} second${n === 1 ? '' : 's'}`;
}
