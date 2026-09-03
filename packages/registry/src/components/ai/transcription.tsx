import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import {
  SEGMENT_STATE_CLASS,
  type SegmentPlaybackState,
  type TranscriptionSegmentData,
  filterRenderableSegments,
  segmentState,
} from './transcription.logic';

/**
 * Transcription — the live transcript (UC-VOICE-01 AC-2: "watch their speech appear
 * as a live transcript"), segments colorized by playback position and tappable to
 * seek (UC-VOICE-02's transcript follows the audio).
 *
 * THE PRD VERDICT IS PORT-AT-PARITY: "Display-only live transcript text with an
 * interim and final distinction; capture belongs to speech-input, so this component
 * itself has no browser dependency." There is NOTHING to substitute: capture is
 * speech-input's seam, so this ships dependency-free at full parity.
 *
 * THE UPSTREAM PART SET, from the KB, ported part for part: the Transcription root
 * (segments / currentTime / onSeek / render-prop children) and the TranscriptionSegment
 * (state-styled, click-to-seek). Both of the web's segment-state classes and BOTH
 * byte-traps survive: segments with empty or whitespace text are never rendered
 * (transcription.logic drops them before indexing), and TranscriptionSegment outside
 * the root throws 'Transcription components must be used within Transcription'.
 * Pressing a segment seeks to its start ONLY when onSeek is wired — without it the
 * press is a no-op (onSeek is not invented, the KB's documented behavior). The web's
 * data-slot/data-active/data-index attributes have no React Native carrier (data-*
 * selectors compile to nothing on the native path); the state is expressed by the
 * class map and announced through accessibility state instead.
 *
 * THE INTERIM / FINAL DISTINCTION is the verdict's own product surface and upstream
 * has no part for it, so it ships as a DECLARED ADDITION: the caller passes the
 * in-flight dictation as `interimText` and moves it into `segments` when the engine
 * finalizes. It renders after the finals in the future-segment family
 * (text-muted-foreground/60) plus italic — visually provisional, semantically "not
 * yet real". Caller-owned state, display-only here; nothing listens.
 *
 * NOT SHIPPED, on the record: speaker labels and events — the KB's upstream part set
 * carries neither (the brief's guess); segments are text/start/end only. Search and
 * highlight — the verdict does not name them. Timestamps in the default segment —
 * upstream's default renders text only; they remain reachable through the render-prop
 * children with formatSegmentTime() from the logic module, exactly the web's
 * custom-children call.
 *
 * Composition (default rendering):
 *   <Transcription segments={segments} currentTime={t} onSeek={seek} />
 * Composition (custom segment rendering, the web's render-prop):
 *   <Transcription segments={segments} currentTime={t} onSeek={seek}>
 *     {(segment, index) => (
 *       <TranscriptionSegment key={index} segment={segment} index={index} />
 *     )}
 *   </Transcription>
 */

type TranscriptionContextValue = {
  /** Filtered — empty and whitespace segments never reach a child (the KB trap). */
  segments: readonly TranscriptionSegmentData[];
  currentTime: number;
  /** False when onSeek is unwired — presses are then no-ops, never invented seeks. */
  canSeek: boolean;
  seekToSegment: (segment: TranscriptionSegmentData) => void;
};

const TranscriptionContext = React.createContext<TranscriptionContextValue | null>(null);

/**
 * The upstream trap, byte-verbatim: a part used outside the root throws
 * 'Transcription components must be used within Transcription'.
 */
function useTranscription(): TranscriptionContextValue {
  const ctx = React.useContext(TranscriptionContext);
  if (!ctx) {
    throw new Error('Transcription components must be used within Transcription');
  }
  return ctx;
}

export type TranscriptionProps = {
  /** Finalized segments, caller-owned — append as your engine finalizes them. */
  segments: readonly TranscriptionSegmentData[];
  /** The playback clock in seconds; defaults to 0 (the web root's default). */
  currentTime?: number;
  /** Seek to a segment's start. ABSENT → segment presses are no-ops. */
  onSeek?: (timeSecond: number) => void;
  /** The in-flight dictation — the interim half of the verdict's distinction. */
  interimText?: string;
  /**
   * The web's render-prop children: (segment, index) => ReactNode. Omit for the
   * default state-styled TranscriptionSegment rendering.
   */
  children?: (segment: TranscriptionSegmentData, index: number) => React.ReactNode;
  className?: string;
};

function Transcription({
  segments,
  currentTime = 0,
  onSeek,
  interimText,
  children,
  className,
}: TranscriptionProps) {
  // Empty transcript + no interim renders nothing — the web root with no segments
  // renders nothing either; a blank is the honest display of no transcript.
  const renderable = React.useMemo(() => filterRenderableSegments(segments), [segments]);

  const contextValue = React.useMemo<TranscriptionContextValue>(
    () => ({
      segments: renderable,
      currentTime,
      canSeek: Boolean(onSeek),
      seekToSegment: (segment) => onSeek?.(segment.startSecond),
    }),
    [renderable, currentTime, onSeek],
  );

  return (
    <TranscriptionContext.Provider value={contextValue}>
      <View className={cn('gap-2', className)}>
        {children
          ? renderable.map((segment, index) => children(segment, index))
          : renderable.map((segment, index) => (
              <TranscriptionSegment key={`${segment.startSecond}-${segment.endSecond}-${index}`} segment={segment} index={index} />
            ))}
        {interimText ? <InterimSegment text={interimText} /> : null}
      </View>
    </TranscriptionContext.Provider>
  );
}

type TranscriptionSegmentProps = {
  segment: TranscriptionSegmentData;
  /** Accepted for upstream API parity — the web's data-index has no RN carrier. */
  index?: number;
  className?: string;
};

/**
 * One transcript segment — the web's button, rendered as the house text pressable
 * (the inline-citation chip's form: a Text with onPress, because a transcript is a
 * text flow, not a row of chrome). State styling from the upstream map: active
 * text-primary, past text-muted-foreground, future text-muted-foreground/60. Without
 * onSeek the press is a no-op and the segment renders as plain text — exactly the
 * web's cursor-default.
 */
function TranscriptionSegment({ segment, className }: TranscriptionSegmentProps) {
  const { currentTime, canSeek, seekToSegment } = useTranscription();
  const state: SegmentPlaybackState = segmentState(segment, currentTime);
  const active = state === 'active';

  return (
    <Text
      onPress={canSeek ? () => seekToSegment(segment) : undefined}
      accessibilityRole={canSeek ? 'button' : 'text'}
      accessibilityHint={canSeek ? 'Jumps playback to this point' : undefined}
      accessibilityState={{ selected: active }}
      className={cn(
        'py-1 text-base leading-relaxed',
        SEGMENT_STATE_CLASS[state],
        // The KB's segment-style byte-note: seekable → cursor-pointer (web only;
        // native has no cursor and the class would be inert).
        canSeek && Platform.select({ web: 'cursor-pointer' }),
        className,
      )}
      // A seek target must be a real target (review): text-height alone is ~26px —
      // py-1 above raises the row; no hitSlop (the vendored Text's props don't
      // carry it, and the padding gets us to the ~42px neighborhood).
    >
      {segment.text}
    </Text>
  );
}

type InterimSegmentProps = {
  text: string;
};

/**
 * The interim half of the distinction, rendered after the finals in the future-segment
 * family plus italic — visibly provisional. Announced as in-progress so a screen
 * reader never presents a guess as final text.
 */
function InterimSegment({ text }: InterimSegmentProps) {
  return (
    <Text
      accessibilityLabel={`Transcribing: ${text}`}
      className="text-base italic leading-relaxed text-muted-foreground/60"
    >
      {text}
    </Text>
  );
}

export { Transcription, TranscriptionSegment, useTranscription };
