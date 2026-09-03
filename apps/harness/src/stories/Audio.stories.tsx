import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import {
  AudioPlayer,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerVolumeRange,
} from '@/components/ai/audio-player';
import {
  Transcription,
  TranscriptionSegment,
  useTranscription,
} from '@/components/ai/transcription';
import type { TranscriptionSegmentData } from '@/components/ai/transcription.logic';
import { formatSegmentTime } from '@/components/ai/transcription.logic';
import { Text } from '@/components/ui/text';

/**
 * Wave 11 — the audio pair: audio-player, transcription (UC-VOICE).
 *
 * THE CALLER-SEAM IS THE STORY, as with speech-input/mic-selector/voice-selector:
 * the PRD verdicts make the audio module the CALLER'S (native-substitute, "replaced
 * by a native audio module... transport controls and progress bar keep the same
 * product surface") and transcription display-only ("capture belongs to
 * speech-input"). No wave installs anything and the registry takes no audio
 * dependency — so these sandboxes own a ticking useState engine (250ms caller code,
 * not the component's) and the component only renders the state reported back.
 *
 * The transcription board ships the upstream anatomy statically: the three playback
 * states at byte-classes, the whitespace-drop trap in the fixture data itself, the
 * no-onSeek no-op, the render-prop custom children with real timestamps, and the
 * hook throw probe.
 */
const meta = { title: 'AI Elements/Audio' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* -------------------------------------------------- the caller's fake engine ---- */

/**
 * The seam demonstration: THIS hook is the consumer's audio module stand-in. It owns
 * playback state and a tick; AudioPlayer is strictly the display over it. Pressing
 * play advances positionMs from OUTSIDE the component — proof that nothing inside
 * plays, which is also why UC-VOICE-02 AC-3 (scrolling the transcript never restarts
 * audio) holds by construction.
 */
function useFakeEngine(durationMs: number, initialPositionMs = 0) {
  const [isPlaying, setPlaying] = useState(false);
  const [positionMs, setPosition] = useState(initialPositionMs);

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setPosition((p) => {
        if (p + 250 >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return p + 250;
      });
    }, 250);
    return () => clearInterval(id);
  }, [isPlaying, durationMs]);

  return {
    isPlaying,
    positionMs,
    durationMs,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onSeek: (next: number) => setPosition(Math.min(Math.max(0, next), durationMs)),
    onMuteToggle: () => {},
    onVolumeChange: () => {},
  };
}

/* ---------------------------------------------------- fixtures ---- */

const CLIP_MS = 182_000; // 3:02

const SEGMENTS: TranscriptionSegmentData[] = [
  { text: 'Welcome back to the build log.', startSecond: 0, endSecond: 2.4 },
  { text: 'Today the audio pair lands: transport controls and the live transcript.', startSecond: 2.4, endSecond: 7.1 },
  { text: '   ', startSecond: 7.1, endSecond: 7.4 }, // the upstream trap: whitespace never renders
  { text: 'Tap any line to jump playback to that moment.', startSecond: 7.4, endSecond: 11.2 },
  { text: 'The interim line at the bottom is still being dictated.', startSecond: 11.2, endSecond: 15.8 },
];

const SEGMENT_COUNT_RENDERED = SEGMENTS.filter((s) => s.text.trim().length > 0).length;

/* ------------------------------------------------------- audio-player ---- */

export const AudioPlayerBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Playing — pause mark, clock advancing in the caller's engine</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer isPlaying positionMs={73_000} durationMs={CLIP_MS} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}} />
        </View>
      </View>
      <View className="gap-1">
        <Label>Paused at rest — play mark, elapsed 0:00</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer positionMs={0} durationMs={CLIP_MS} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}} />
        </View>
      </View>
      <View className="gap-1">
        <Label>Ended — position holds at the duration, play mark returns</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer positionMs={CLIP_MS} durationMs={CLIP_MS} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}} />
        </View>
      </View>
      <View className="gap-1">
        <Label>Muted — the crossed volume mark</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer muted volume={0.8} positionMs={30_000} durationMs={CLIP_MS} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}} />
        </View>
      </View>
      <View className="gap-1">
        <Label>No duration yet — clock holds at 0:00, scrubber at rest, never NaN</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer positionMs={0} durationMs={0} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}} />
        </View>
      </View>
      <View className="gap-1">
        <Label>Unwired — every control DISABLES, never pretends (speech-input law)</Label>
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer positionMs={45_000} durationMs={CLIP_MS} />
        </View>
      </View>
      <Text variant="muted">
        PRD verdict native-substitute: the HTML audio element is replaced by the
        CALLER'S audio module; the transport controls and progress bar keep the same
        product surface. The upstream composition's single control row re-lays into
        three rows a thumb can serve (scrub · transport · volume); the parts remain
        exported for custom rows. AudioPlayerElement is dropped on the record — it IS
        the substitution.
      </Text>
    </View>
  ),
};

export const AudioPlayerSandbox: Story = {
  args: {
    playing: true,
    positionSeconds: 61,
    muted: false,
  },
  argTypes: {
    playing: { control: 'boolean' },
    positionSeconds: { control: 'number' },
    muted: { control: 'boolean' },
  },
  render: (args: { playing: boolean; positionSeconds: number; muted: boolean }) => {
    const engine = useFakeEngine(CLIP_MS, args.positionSeconds * 1000);
    return (
      <View className="gap-3">
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer
            isPlaying={engine.isPlaying}
            positionMs={engine.positionMs}
            durationMs={engine.durationMs}
            muted={args.muted}
            volume={0.8}
            onPlay={engine.onPlay}
            onPause={engine.onPause}
            onSeek={engine.onSeek}
            onMuteToggle={engine.onMuteToggle}
            onVolumeChange={engine.onVolumeChange}
          />
        </View>
        <Text variant="muted" numberOfLines={3}>
          {engine.isPlaying ? 'Playing' : 'Paused'} — the tick is THIS sandbox's
          useState engine, not the component's. Press play and the clock advances;
          scrub and the engine jumps; stop and start — nothing restarts, because
          nothing inside the component plays (UC-VOICE-02 AC-3 by construction).
        </Text>
      </View>
    );
  },
};

/** The upstream part set, composed custom — the web's single-row shape, small. */
export const AudioPlayerCustomComposition: Story = {
  render: () => (
    <View className="gap-3">
      <View className="gap-1">
        <Label>Custom composition — the upstream parts, caller-arranged</Label>
        <View className="gap-2 rounded-lg border border-border p-4">
          <AudioPlayer isPlaying positionMs={47_000} durationMs={CLIP_MS} onPlay={() => {}} onPause={() => {}} onSeek={() => {}} onMuteToggle={() => {}} onVolumeChange={() => {}}>
            <View className="flex-row items-center gap-3">
              <AudioPlayerTimeDisplay />
              <View className="min-w-0 flex-1">
                <AudioPlayerTimeRange />
              </View>
              <AudioPlayerDurationDisplay />
            </View>
            <View className="flex-row items-center gap-2">
              <AudioPlayerMuteButton />
              <AudioPlayerSeekBackwardButton seekOffsetMs={15_000} />
              <AudioPlayerPlayButton />
              <AudioPlayerSeekForwardButton seekOffsetMs={15_000} />
              <AudioPlayerVolumeRange className="w-24" />
            </View>
          </AudioPlayer>
        </View>
      </View>
      <Text variant="muted" numberOfLines={2}>
        Every part reads the seam from context — seekOffsetMs=15000 here, the upstream
        part's seekOffset (default 10s) elsewhere.
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------- transcription ---- */

export const TranscriptionBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Mid-playback — active text-primary, past muted, future muted/60</Label>
        <View className="rounded-lg border border-border p-4">
          <Transcription segments={SEGMENTS} currentTime={8.9} onSeek={() => {}} interimText="and the next sentence is still" />
        </View>
      </View>
      <View className="gap-1">
        <Label>No onSeek — presses are no-ops, segments render as plain text</Label>
        <View className="rounded-lg border border-border p-4">
          <Transcription segments={SEGMENTS} currentTime={8.9} />
        </View>
      </View>
      <View className="gap-1">
        <Label>Custom children — the web's render-prop: timestamp + text per segment</Label>
        <View className="gap-2 rounded-lg border border-border p-4">
          <Transcription segments={SEGMENTS} currentTime={2.6} onSeek={() => {}}>
            {(segment) => (
              <View key={`${segment.startSecond}-${segment.endSecond}`} className="flex-row gap-2">
                <Text variant="muted" className="text-xs tabular-nums">
                  {formatSegmentTime(segment.startSecond)}
                </Text>
                <TranscriptionSegment segment={segment} className="flex-1 text-sm" />
              </View>
            )}
          </Transcription>
        </View>
      </View>
      <Text variant="muted" numberOfLines={4}>
        The fixture carries a whitespace segment ({SEGMENTS.length - SEGMENT_COUNT_RENDERED} of
        {' '}{SEGMENTS.length} dropped before indexing) — the upstream trap: empty text never
        renders. The interim line is the verdict's own distinction ("interim and
        final"), rendered in the future-segment family plus italic; upstream has no
        interim part, so the seam is a declared addition. Not shipped: speaker labels,
        events, search — the upstream part set carries none and the verdict does not
        name them.
      </Text>
    </View>
  ),
};

export const TranscriptionSandbox: Story = {
  args: {
    currentTime: 8.9,
  },
  argTypes: {
    currentTime: { control: 'number' },
  },
  render: (args: { currentTime: number }) => (
    <View className="gap-3">
      <View className="rounded-lg border border-border p-4">
        <Transcription segments={SEGMENTS} currentTime={args.currentTime} onSeek={() => {}} />
      </View>
      <Text variant="muted" numberOfLines={2}>
        currentTime={args.currentTime}s — the active segment follows the clock; a
        boundary exactly ON start/end is still active (upstream inclusive range).
      </Text>
    </View>
  ),
};

/** Smoke — the exported hook throws outside the root (upstream trap, byte-verbatim). */
export const TranscriptionHookTrap: Story = {
  render: () => {
    let trapped: string | undefined;
    function Probe(): null {
      try {
        useTranscription();
      } catch (error) {
        trapped = (error as Error).message;
      }
      return null;
    }
    return (
      <View className="gap-2">
        <Probe />
        <Text variant="muted" numberOfLines={2} selectable>
          {trapped ?? 'NOT THROWN — the trap failed'}
        </Text>
      </View>
    );
  },
};

/** The pair together — playback above, transcript below, one clock in the caller's
 *  hands. Scrolling this story never restarts the tick: nothing inside plays. */
export const VoiceReplyPair: Story = {
  render: () => {
    const engine = useFakeEngine(CLIP_MS, 8_400);
    return (
      <View className="gap-4">
        <View className="rounded-lg border border-border p-4">
          <AudioPlayer
            isPlaying={engine.isPlaying}
            positionMs={engine.positionMs}
            durationMs={engine.durationMs}
            onPlay={engine.onPlay}
            onPause={engine.onPause}
            onSeek={engine.onSeek}
            onMuteToggle={engine.onMuteToggle}
            onVolumeChange={engine.onVolumeChange}
          />
        </View>
        <View className="rounded-lg border border-border p-4">
          <Transcription
            segments={SEGMENTS}
            currentTime={engine.positionMs / 1000}
            // Transcription seeks in SECONDS, the engine stores MILLISECONDS — the
            // bridge must convert on BOTH sides (review: the mismatch sent 7.4s to
            // 7.4ms and the highlight snapped back to segment one).
            onSeek={(sec) => engine.onSeek(sec * 1000)}
          />
        </View>
        <Text variant="muted" numberOfLines={2}>
          One clock, two surfaces — both components render the caller's state; tapping
          a line seeks the engine, the scrubber follows, and a scroll of the page
          touches neither.
        </Text>
      </View>
    );
  },
};
