import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, View } from 'react-native';
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
 * LAYOUT IS THE FLOWING INLINE PARAGRAPH (remediation row 6, design/style-parity-
 * remediation.md): the web renders segments in `flex flex-wrap gap-1` — one wrapping
 * paragraph, segments separated by space (web transcription.tsx:62). The prior port
 * stacked each segment as its own row View, which read as a list, not a transcript.
 * The default rendering is now ONE wrapping parent Text whose children are per-segment
 * nested Texts separated by a single space string — true RN inline flow, wrapping like
 * the web. Presses ride the nested Texts exactly as before (the inline-citation chip
 * precedent: a Text with onPress inside a text flow). Per the wave-13 standing rule
 * (parent Text classes do NOT cascade to nested spans) every segment carries its own
 * EXPLICIT state color from SEGMENT_STATE_CLASS — no inheritance reliance, and no /NN
 * modifiers (the web's text-muted-foreground/60 dim converges to the fixed
 * neutral-400/neutral-500 pair, see the logic module). The custom render-prop path
 * keeps a View host: its children are arbitrary nodes the caller owns, and a View
 * cannot nest inside a Text.
 *
 * THE INTERIM / FINAL DISTINCTION is the verdict's own product surface and upstream
 * has no part for it, so it ships as a DECLARED ADDITION: the caller passes the
 * in-flight dictation as `interimText` and moves it into `segments` when the engine
 * finalizes. It renders inline after the finals in the future-segment color plus
 * italic — visually provisional, semantically "not yet real". Caller-owned state,
 * display-only here; nothing listens.
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
      {children ? (
        // The render-prop path keeps a View host — the web's flex-wrap div. Its
        // children are caller-owned nodes and may be non-text, which cannot nest
        // inside a Text on native. The interim continues after the caller's
        // segments here too — the distinction is a property of the transcript,
        // not of one rendering branch (review fix: the restructure dropped it).
        <View className={cn('gap-2', className)}>
          {renderable.map((segment, index) => children(segment, index))}
          {interimText ? <InterimSegment text={interimText} /> : null}
        </View>
      ) : (
        // Remediation row 6 — ONE wrapping parent Text: per-segment nested Texts
        // separated by a single space string, the RN inline-flow equivalent of the
        // web's `flex flex-wrap gap-1 text-sm leading-relaxed` paragraph (review
        // fix: the paragraph converges to the web's text-sm). Metrics (size/
        // leading) live on the parent; every nested segment carries its OWN
        // explicit color class (wave-13: parent classes do not cascade to nested
        // spans).
        <Text className={cn('text-sm leading-relaxed', className)}>
          {renderable.map((segment, index) => (
            <React.Fragment key={`${segment.startSecond}-${segment.endSecond}-${index}`}>
              {index > 0 ? ' ' : null}
              <TranscriptionSegment segment={segment} index={index} />
            </React.Fragment>
          ))}
          {interimText ? (
            <React.Fragment key="interim">
              {renderable.length > 0 ? ' ' : null}
              <InterimSegment text={interimText} />
            </React.Fragment>
          ) : null}
        </Text>
      )}
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
 * (the inline-citation chip's form: a Text with onPress nested in the flow Text).
 * Remediation row 6: the segment carries its OWN explicit state color — the wave-13
 * rule (no reliance on parent Text inheritance) and the no-/NN standing rule both
 * live in SEGMENT_STATE_CLASS. Size/leading come from the flow's parent Text; the
 * old stacked-row py-1 padding is gone — padding on an inline nested Text is not an
 * RN layout concept and would fight the flow. Without onSeek the press is a no-op
 * and the segment renders as plain text — exactly the web's cursor-default.
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
        SEGMENT_STATE_CLASS[state],
        // The KB's segment-style byte-note: seekable → cursor-pointer (web only;
        // native has no cursor and the class would be inert).
        canSeek && Platform.select({ web: 'cursor-pointer' }),
        className,
      )}
    >
      {segment.text}
    </Text>
  );
}

type InterimSegmentProps = {
  text: string;
};

/**
 * The interim half of the distinction, rendered INLINE after the finals (remediation
 * row 6) in the future-segment color (explicit, from the same map the segments use)
 * plus italic — visibly provisional. Announced as in-progress so a screen reader
 * never presents a guess as final text.
 */
function InterimSegment({ text }: InterimSegmentProps) {
  return (
    <Text
      accessibilityLabel={`Transcribing: ${text}`}
      className={cn('italic', SEGMENT_STATE_CLASS.future)}
    >
      {text}
    </Text>
  );
}

export { Transcription, TranscriptionSegment, useTranscription };
