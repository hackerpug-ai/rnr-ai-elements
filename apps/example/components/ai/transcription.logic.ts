export type TranscriptionSegmentData = {
  text: string;
  startSecond: number;
  endSecond: number;
};

/**
 * THE KB'S DOCUMENTED DROP: "segments whose text is whitespace or '' are not passed
 * to children ('   ' and '' dropped; only 'Hello'/'world' remain)". The filter runs
 * BEFORE indexing, so the render-prop's index is the index of what renders, not of
 * what arrived. Non-string text (a malformed segment) drops too — no-throw.
 */
export function filterRenderableSegments(
  segments: readonly TranscriptionSegmentData[],
): TranscriptionSegmentData[] {
  return segments.filter(
    (segment): segment is TranscriptionSegmentData =>
      typeof segment?.text === 'string' && segment.text.trim().length > 0,
  );
}

export type SegmentPlaybackState = 'past' | 'active' | 'future';

/**
 * The web original's three states, byte-behavior: ACTIVE when currentTime is within
 * the range (INCLUSIVE of both ends), past strictly after endSecond, future strictly
 * before startSecond. Garbage currentTime falls back to 0 (the web default), which
 * makes a transcript at rest show its first segment as the active one when it starts
 * at 0 — upstream behavior with `currentTime` defaulted.
 */
export function segmentState(
  segment: Pick<TranscriptionSegmentData, 'startSecond' | 'endSecond'>,
  currentTime: number,
): SegmentPlaybackState {
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  if (t < segment.startSecond) return 'future';
  if (t > segment.endSecond) return 'past';
  return 'active';
}

/**
 * The state → class map. Active and past are the web original's roles verbatim
 * (text-primary / text-muted-foreground). The FUTURE state converges under remediation
 * row 6 (design/style-parity-remediation.md): the web writes text-muted-foreground/60,
 * but /NN color-opacity modifiers are a standing house ban (they never compiled
 * reliably — the wave-11 finding) and segments are nested Texts that must each carry
 * an EXPLICIT color. text-neutral-400 / dark:text-neutral-500 is the nearest fixed
 * step to the web's 60%-dimmed muted-foreground in both schemes (light muted-foreground
 * ≈ neutral-500, dark ≈ neutral-400; one step dimmer each). A data-map string, hence
 * safelisted (apps/harness/src/class-safelist.tsx).
 */
export const SEGMENT_STATE_CLASS: Record<SegmentPlaybackState, string> = {
  active: 'text-primary',
  past: 'text-muted-foreground',
  future: 'text-neutral-400 dark:text-neutral-500',
};

/**
 * A segment timestamp for consumers composing custom children — the web's
 * `{segment.startSecond}s` alternative rendering, given a real clock (m:ss, floor).
 * Negative and non-finite input yields "0:00", never NaN.
 *
 * The arithmetic duplicates audio-player.logic's formatPlaybackTime ON PURPOSE:
 * registry items install independently, so transcription cannot import another
 * item's logic module — a formatter is cheaper than a phantom dependency.
 */
export function formatSegmentTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  return formatPlaybackTimeFromSeconds(seconds);
}

function formatPlaybackTimeFromSeconds(totalSeconds: number): string {
  const whole = Math.floor(totalSeconds);
  const ss = String(whole % 60).padStart(2, '0');
  const minutes = Math.floor(whole / 60) % 60;
  const hours = Math.floor(whole / 3600);
  if (hours === 0) return `${minutes}:${ss}`;
  return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
}
