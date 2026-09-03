import { Button } from '@/registry/{engine}/components/ui/button';
import { ButtonGroup } from '@/registry/{engine}/components/ui/button-group';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Slider } from '@/registry/{engine}/components/ui/slider';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  clampVolume,
  formatPlaybackTime,
  playbackProgress,
  seekTarget,
} from './audio-player.logic';

/**
 * AudioPlayer — transport controls and a scrubbable progress bar for a generated
 * audio response (UC-VOICE-02 AC-1 "play, pause, and a scrubbable progress bar",
 * AC-4 "elapsed and total duration").
 *
 * THE PRD VERDICT IS NATIVE-SUBSTITUTE: "Built on the HTML audio element. Replaced
 * by a native audio module; transport controls and progress bar keep the same product
 * surface." The transport controls and progress bar ARE this component. The audio
 * module is the CALLER'S: expo-audio, a native player, or an <audio> element on web —
 * the seam is state-in/callbacks-out (isPlaying/positionMs/durationMs/volume in;
 * onPlay/onPause/onSeek/onMuteToggle/onVolumeChange out), the speech-input precedent
 * exactly. NO audio dependency enters anyone's install graph, and the registry stays
 * Expo Go-clean. This verdict does NOT prescribe a module the way web-preview's did
 * ("declares react-native-webview as a peer dependency") — nothing here names one, so
 * nothing here is a STOP.
 *
 * AC-3 ("continue playback while scrolling without audio restarting") is free BY
 * CONSTRUCTION: the component holds no playback to restart — it renders the state
 * the caller reports, and a scroll of the transcript does not touch it.
 *
 * THE UPSTREAM PART SET, from the KB (media-chrome composition), ported part for
 * part: Play, SeekBackward/Forward (seekOffset 10 → seekOffsetMs 10000), TimeDisplay,
 * TimeRange, DurationDisplay, Mute, VolumeRange, ControlBar. DROPPED ON THE RECORD:
 * AudioPlayerElement — the HTML <audio>/data-URI half is the verdict's substitution
 * itself; there is no media surface to render, only controls. The default composition
 * re-lays the web's single control row into three rows a phone thumb can actually
 * serve (scrub · transport · volume); ControlBar remains exported for custom rows.
 *
 * EVERY UNWIRED SEAM DISABLES ITS CONTROL — never pretends (speech-input law: a
 * control that fakes working is the lie). Volume seam unwired → VolumeRange renders
 * at its reported value but inert, MuteButton disabled.
 *
 * Composition (default):
 *   <AudioPlayer isPlaying={p} positionMs={t} durationMs={d}
 *                onPlay={play} onPause={pause} onSeek={seek} />
 * Composition (custom, upstream shape):
 *   <AudioPlayer {...seam}>
 *     <AudioPlayerControlBar>
 *       <AudioPlayerPlayButton />
 *       <AudioPlayerSeekBackwardButton seekOffsetMs={15000} />
 *       <AudioPlayerTimeDisplay />
 *     </AudioPlayerControlBar>
 *   </AudioPlayer>
 */

type AudioPlayerContextValue = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  muted: boolean;
  /** 0..1 — the caller-reported engine volume. */
  volume: number;
  play: (() => void) | undefined;
  pause: (() => void) | undefined;
  /** Seek to an absolute position. Undefined → every seek control is disabled. */
  seek: ((positionMs: number) => void) | undefined;
  toggleMute: (() => void) | undefined;
  changeVolume: ((volume: number) => void) | undefined;
};

const AudioPlayerContext = React.createContext<AudioPlayerContextValue | null>(null);

/**
 * The web's context hook. Byte-trap parity with the house selectors: parts used
 * outside the root throw with the upstream message shape.
 */
function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = React.useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('AudioPlayer components must be used within AudioPlayer');
  }
  return ctx;
}

export type AudioPlayerProps = {
  /** The caller's engine state, reported back on every change. */
  isPlaying?: boolean;
  positionMs?: number;
  /** 0 until the engine knows the length — time displays hold at 0:00, never NaN. */
  durationMs?: number;
  muted?: boolean;
  /** 0..1. Reported volumes are clamped; garbage reads as muted-silent. */
  volume?: number;
  onPlay?: () => void;
  onPause?: () => void;
  /** Absolute seek in ms — from the scrubber AND the ±offset buttons (they clamp). */
  onSeek?: (positionMs: number) => void;
  onMuteToggle?: () => void;
  onVolumeChange?: (volume: number) => void;
  /** Omit for the default three-row layout; supply for the upstream composition. */
  children?: React.ReactNode;
  className?: string;
};

function AudioPlayer({
  isPlaying = false,
  positionMs = 0,
  durationMs = 0,
  muted = false,
  volume = 1,
  onPlay,
  onPause,
  onSeek,
  onMuteToggle,
  onVolumeChange,
  children,
  className,
}: AudioPlayerProps) {
  const contextValue = React.useMemo<AudioPlayerContextValue>(
    () => ({
      isPlaying,
      positionMs,
      durationMs,
      muted,
      volume: clampVolume(volume),
      play: onPlay,
      pause: onPause,
      seek: onSeek,
      toggleMute: onMuteToggle,
      changeVolume: onVolumeChange,
    }),
    [isPlaying, positionMs, durationMs, muted, volume, onPlay, onPause, onSeek, onMuteToggle, onVolumeChange],
  );

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children ?? (
        <View className={cn('gap-4', className)}>
          <View className="flex-row items-center gap-3">
            <AudioPlayerTimeDisplay className="shrink-0" />
            <View className="min-w-0 flex-1">
              <AudioPlayerTimeRange />
            </View>
            <AudioPlayerDurationDisplay className="shrink-0" />
          </View>
          <AudioPlayerControlBar className="justify-center">
            <AudioPlayerSeekBackwardButton />
            <AudioPlayerPlayButton />
            <AudioPlayerSeekForwardButton />
          </AudioPlayerControlBar>
          <View className="flex-row items-center gap-3">
            <AudioPlayerMuteButton />
            <View className="min-w-0 flex-1">
              <AudioPlayerVolumeRange />
            </View>
          </View>
        </View>
      )}
    </AudioPlayerContext.Provider>
  );
}

type AudioPlayerControlBarProps = ViewProps;

/**
 * The web's control row — the registered ButtonGroup atom (the upstream composition
 * also styles its controls as one ButtonGroup). A toolbar role wraps it; children
 * compose any AudioPlayer control parts.
 */
/**
 * The transport row. DECLARED DIVERGENCE from upstream: the web's control bar is one
 * segmented ButtonGroup row; here the three controls render as independent rounded
 * ghost-icon buttons (ButtonGroup wraps for a11y grouping, but its segmented
 * corner-rounding machinery is intentionally NOT applied — icon buttons read better
 * as distinct 44pt targets at phone width than as one fused pill).
 */
function AudioPlayerControlBar({ className, ...props }: AudioPlayerControlBarProps) {
  return <ButtonGroup className={cn('gap-1', className)} {...props} />;
}

type AudioPlayerPlayButtonProps = {
  className?: string;
};

/**
 * Play/pause — one control, two states (the web's MediaPlayButton). Unwired engine →
 * DISABLED, never a button that fakes playing.
 */
function AudioPlayerPlayButton({ className }: AudioPlayerPlayButtonProps) {
  const { isPlaying, play, pause } = useAudioPlayer();
  const toggle = isPlaying ? pause : play;
  const label = isPlaying ? 'Pause audio' : 'Play audio';

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!toggle}
      onPress={toggle}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !toggle, busy: isPlaying }}
      // House formula: h-10 control + hitSlop 2/side = the 44pt minimum, zero pixels.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(className)}
    >
      <Icon as={isPlaying ? PauseIcon : PlayIcon} size={20} className="text-foreground" />
    </Button>
  );
}

type AudioPlayerSeekButtonProps = {
  /** Milliseconds (the upstream part's seekOffset is seconds, default 10 — kept in ms
   * here because positionMs/durationMs are ms throughout; default 10_000 = 10s). */
  seekOffsetMs?: number;
  className?: string;
};

/** Seek back by seekOffsetMs — media-chrome's clamp, computed from reported state. */
function AudioPlayerSeekBackwardButton({ seekOffsetMs = 10_000, className }: AudioPlayerSeekButtonProps) {
  const { positionMs, durationMs, seek } = useAudioPlayer();
  const label = `Back ${Math.round(seekOffsetMs / 1000)} seconds`;

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!seek}
      onPress={seek ? () => seek(seekTarget(positionMs, -seekOffsetMs, durationMs)) : undefined}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !seek }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(className)}
    >
      <Icon as={RotateCcwIcon} size={18} className="text-muted-foreground" />
    </Button>
  );
}

/** Seek forward by seekOffsetMs — clamps to the duration when one is known. */
function AudioPlayerSeekForwardButton({ seekOffsetMs = 10_000, className }: AudioPlayerSeekButtonProps) {
  const { positionMs, durationMs, seek } = useAudioPlayer();
  const label = `Forward ${Math.round(seekOffsetMs / 1000)} seconds`;

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!seek}
      onPress={seek ? () => seek(seekTarget(positionMs, seekOffsetMs, durationMs)) : undefined}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !seek }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(className)}
    >
      <Icon as={RotateCwIcon} size={18} className="text-muted-foreground" />
    </Button>
  );
}

type AudioPlayerTimeDisplayProps = {
  className?: string;
};

/** Elapsed time — tabular so digits do not jitter the row as the clock ticks. */
function AudioPlayerTimeDisplay({ className }: AudioPlayerTimeDisplayProps) {
  const { positionMs } = useAudioPlayer();
  return (
    <Text
      accessibilityLabel={`Elapsed ${formatPlaybackTime(positionMs)}`}
      className={cn('text-xs tabular-nums text-muted-foreground', className)}
    >
      {formatPlaybackTime(positionMs)}
    </Text>
  );
}

type AudioPlayerDurationDisplayProps = {
  className?: string;
};

/** Total duration — 0:00 until the engine knows the length. */
function AudioPlayerDurationDisplay({ className }: AudioPlayerDurationDisplayProps) {
  const { durationMs } = useAudioPlayer();
  return (
    <Text
      accessibilityLabel={`Duration ${formatPlaybackTime(durationMs)}`}
      className={cn('text-xs tabular-nums text-muted-foreground', className)}
    >
      {formatPlaybackTime(durationMs)}
    </Text>
  );
}

type AudioPlayerTimeRangeProps = {
  className?: string;
};

/**
 * The scrubber — the registered slider atom wearing the playback contract. The atom's
 * value is normalized 0..1 (the wave-4 contract); the primitive reports its drags back
 * in its own 0..100 scale as an ARRAY, so this part converts before seeking. Unwired
 * onSeek → the slider renders its position, disabled — visible progress, no fake drag.
 */
function AudioPlayerTimeRange({ className }: AudioPlayerTimeRangeProps) {
  const { positionMs, durationMs, seek } = useAudioPlayer();
  return (
    <Slider
      value={playbackProgress(positionMs, durationMs)}
      onValueChange={
        seek
          ? (values) => {
              const next = Array.isArray(values) ? values[0] : values;
              const pct = clampVolume(Number(next) / 100);
              seek(pct * durationMs);
            }
          : undefined
      }
      disabled={!seek}
      accessibilityLabel="Audio position"
      className={cn(className)}
    />
  );
}

type AudioPlayerMuteButtonProps = {
  className?: string;
};

/** Mute toggle — the reported muted state with the web's volume-mark ladder. */
function AudioPlayerMuteButton({ className }: AudioPlayerMuteButtonProps) {
  const { muted, volume, toggleMute } = useAudioPlayer();
  const icon = muted ? VolumeXIcon : volume > 0.5 ? Volume2Icon : Volume1Icon;
  const label = muted ? 'Unmute audio' : 'Mute audio';

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={!toggleMute}
      onPress={toggleMute}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !toggleMute, checked: muted }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(className)}
    >
      <Icon as={icon} size={16} className="text-muted-foreground" />
    </Button>
  );
}

type AudioPlayerVolumeRangeProps = {
  className?: string;
};

/** The volume slider — 0..1 caller seam over the same slider atom as the scrubber. */
function AudioPlayerVolumeRange({ className }: AudioPlayerVolumeRangeProps) {
  const { volume, changeVolume } = useAudioPlayer();
  return (
    <Slider
      value={volume}
      onValueChange={
        changeVolume
          ? (values) => {
              const next = Array.isArray(values) ? values[0] : values;
              changeVolume(clampVolume(Number(next) / 100));
            }
          : undefined
      }
      disabled={!changeVolume}
      accessibilityLabel="Volume"
      className={cn('max-w-xs', className)}
    />
  );
}

export {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerVolumeRange,
  useAudioPlayer,
};
