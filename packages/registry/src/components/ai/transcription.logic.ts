/**
 * Transcription — pure logic. Zero react-native imports, so the Vitest tier owns it
 * (see the header of sources.logic.ts for why component files themselves cannot load
 * under Node).
 *
 * THE PRD VERDICT IS PORT-AT-PARITY: "Display-only live transcript text with an
 * interim and final distinction; capture belongs to speech-input, so this component
 * itself has no browser dependency." The segment type, the three playback states and
 * the state classes are the web original's, byte-for-byte (the KB's documented
 * transcription behavior); the interim distinction is the verdict's own words and
 * ships as a caller-supplied `interimText` display seam — upstream has no interim
 * part, so that addition is declared in the component header, not smuggled in here.
 */

/** The web original's TranscriptionSegment, field for field. Seconds, not ms. */
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
 * The web original's state → class map, byte-for-byte (the KB's segment-style record:
 * active gets text-primary, past text-muted-foreground, future
 * text-muted-foreground/60). All three are RNR roles with opacity modifiers — no
 * escape-hatch color, so this map stays here rather than in lib/status.ts, which is
 * reserved for the three sanctioned NON-token colors.
 */
export const SEGMENT_STATE_CLASS: Record<SegmentPlaybackState, string> = {
  active: 'text-primary',
  past: 'text-muted-foreground',
  future: 'text-muted-foreground/60',
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
