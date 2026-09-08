import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { MicIcon, MicOffIcon, SquareIcon } from 'lucide-react-native';
import * as React from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * SpeechInput — push-to-talk that turns speech into composer text.
 *
 * The web original has TWO engines: window.SpeechRecognition when present, and a
 * MediaRecorder fallback whose audio is handed to a CALLER-SUPPLIED transcriber via
 * `onAudioRecorded`. Neither browser API exists in React Native.
 *
 * So this ships the fallback contract as the ONLY contract: the caller supplies
 * `recorder` and `transcribe`. That is faithful — it is the web original's own second
 * engine — and it keeps the registry dependency-free. A consumer wires
 * expo-speech-recognition, expo-audio, or a server transcribe() call; we do not force one,
 * and none of them lands in anybody's install graph who does not want it.
 *
 * TWO BEHAVIOURS PRESERVED VERBATIM, both about not lying to the user:
 *  - with no engine available the button is DISABLED. It never pretends to listen.
 *  - only FINAL transcripts fire onTranscriptionChange. Interim results and empty strings
 *    are suppressed, or the composer flickers on every syllable.
 *
 * And one addition the web original does not need: PERMISSION IS NOT CAPABILITY. On mobile
 * the capability exists but may be denied, so a denied state is distinct from an absent
 * engine and is surfaced rather than silently swallowed.
 *
 * THE RECORD CONTROL CONVERGED (remediation row 7, design/style-parity-remediation.md):
 * the web record control has two visual states (web speech-input.tsx:291-310). WHILE
 * LISTENING the destructive pill wears the three pulsing rings — the web's own gate is
 * `{isListening && [0, 1, 2].map(...)}` at :291-301, rings + `bg-destructive` together;
 * at idle it is the plain `bg-primary text-primary-foreground` filled pill, NO rings.
 * The prior port rendered a ghost icon button, which read as a muted utility control,
 * not a record affordance; the port converges both states: recording = destructive
 * stop pill + rings, not-recording = filled primary pill. FOR THE RECORD: the parity
 * audit misread the anchor as rings-on-idle and one remediation pass shipped that
 * inversion before this correction restored the snapshot's gate. The rings converge
 * to the RNR Skeleton pulse idiom
 * (shimmer.tsx's withRepeat + ReduceMotion.System) — the web's `animate-ping` has no
 * native compiler target — three absolutely-positioned rounded-full ring Views behind
 * the button, opacity-pulsing with the web's own period (2s) and stagger (300ms per
 * ring), colored by the destructive role token instead of the web's border-red-400/30
 * (the /NN opacity modifier is a standing house ban; the animated opacity IS the
 * dimming). Rings are decorative motion: they render only while recording and not at
 * all under Reduce Motion. RECORDED KEEP: the button stays size="icon" + hitSlop — a
 * 40pt+ touch target, above the web's smaller pill.
 */

export type SpeechRecorder = {
  start: () => Promise<void>;
  /** Resolve with the recording handle your transcriber understands. */
  stop: () => Promise<unknown>;
  /** Return false if the user denied the microphone. */
  requestPermission?: () => Promise<boolean>;
};

type SpeechInputProps = {
  recorder?: SpeechRecorder;
  transcribe?: (recording: unknown) => Promise<string>;
  /** Fires ONLY with a final, non-empty transcript. */
  onTranscriptionChange?: (text: string) => void;
  onError?: (error: unknown) => void;
  onPermissionDenied?: () => void;
  className?: string;
};

type State = 'idle' | 'recording' | 'transcribing' | 'denied';

/** The web's ring geometry (web speech-input.tsx:292-301): three rings, 2s period,
 * 300ms stagger. Opacity pulse per the Skeleton idiom, never scale. */
const RING_COUNT = 3;
const RING_PERIOD_MS = 2000;
const RING_STAGGER_MS = 300;
const RING_MIN_OPACITY = 0.2;

/**
 * One pulse ring — shimmer.tsx's exact motion pattern (opacity shared value,
 * withRepeat(withTiming(..., ReduceMotion.System), -1, true)) with a withDelay
 * stagger standing in for the web's per-ring animationDelay. Border color is the
 * destructive role (the web's border-red-400/30 without its banned /NN modifier —
 * the animated opacity supplies the dimming). Absent entirely under reduced motion:
 * a static red ring would read as a permanent error halo.
 */
function PulseRing({ index }: { index: number }) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withDelay(
      index * RING_STAGGER_MS,
      withRepeat(
        withTiming(RING_MIN_OPACITY, { duration: RING_PERIOD_MS, reduceMotion: ReduceMotion.System }),
        -1,
        true,
      ),
    );
    // Unmount cleanup (review fix): a repeating UI-thread animation outlives its
    // view unless cancelled — reanimated keeps driving the shared value, leaving
    // an orphaned loop. Shimmer's identical effect omits the cancel only because
    // it unmounts with the whole screen; rings mount/unmount on every state flip,
    // so the cancel is load-bearing here.
    return () => cancelAnimation(opacity);
  }, [index, reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (reduced) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={style}
      className="absolute inset-0 rounded-full border-2 border-destructive"
    />
  );
}

function SpeechInput({
  recorder,
  transcribe,
  onTranscriptionChange,
  onError,
  onPermissionDenied,
  className,
}: SpeechInputProps) {
  const [state, setState] = React.useState<State>('idle');
  // No engine wired means no engine. Disabled, not fake-listening.
  const unavailable = !recorder || !transcribe;

  async function toggle() {
    if (unavailable) return;
    try {
      if (state === 'recording') {
        setState('transcribing');
        const recording = await recorder.stop();
        const text = (await transcribe(recording))?.trim();
        // Only a final, non-empty transcript reaches the caller.
        if (text) onTranscriptionChange?.(text);
        setState('idle');
        return;
      }
      if (recorder.requestPermission) {
        const granted = await recorder.requestPermission();
        if (!granted) {
          setState('denied');
          onPermissionDenied?.();
          return;
        }
      }
      await recorder.start();
      setState('recording');
    } catch (error) {
      setState('idle');
      onError?.(error);
    }
  }

  const denied = state === 'denied';
  const icon = denied ? MicOffIcon : state === 'recording' ? SquareIcon : MicIcon;
  const label = denied
    ? 'Microphone access denied'
    : state === 'recording'
      ? 'Stop recording'
      : state === 'transcribing'
        ? 'Transcribing'
        : 'Record a message';

  return (
    // The wrapper is the ring STAGE — rings sit on its inset-0, the p-2 padding
    // holding them clear of the 40pt (h-10 w-10) record pill — the web's
    // rings-around-pill silhouette. Caller className merges HERE, after p-2, so
    // positioning classes behave as flex-item classes on the stage (review fix:
    // on the Button they collided with its own size="icon" sizing); the inner
    // Button keeps its own sizing.
    <View className={cn('items-center justify-center p-2', className)}>
      {/* The ring gate IS the web's — `{isListening && [0, 1, 2].map(...)}` (web
          speech-input.tsx:291-301): rings render ONLY while listening/recording,
          around the destructive stop pill; idle is the plain bg-primary pill with
          NO rings. FOR THE RECORD: the parity audit misread the anchor as
          rings-on-idle and a remediation pass shipped that inversion; the pinned
          snapshot is unambiguous, so the gate sits on the recording side. */}
      {state === 'recording'
        ? Array.from({ length: RING_COUNT }, (_, index) => <PulseRing key={index} index={index} />)
        : null}
      <Button
        size="icon"
        // Remediation row 7: the not-recording side converges to the web's FILLED
        // record pill (bg-primary text-primary-foreground, rounded-full) — plain,
        // NO rings; recording converges to the web's listening state — destructive
        // stop pill + the rings above (web speech-input.tsx:291-310). size="icon"
        // + hitSlop is the recorded 40pt+ keep.
        variant={state === 'recording' ? 'destructive' : 'default'}
        disabled={unavailable || denied || state === 'transcribing'}
        onPress={toggle}
        accessibilityLabel={label}
        accessibilityState={{ disabled: unavailable || denied, busy: state === 'transcribing' }}
        hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
        className="rounded-full"
      >
        <Icon as={icon} size={16} />
      </Button>
    </View>
  );
}

export { SpeechInput };
