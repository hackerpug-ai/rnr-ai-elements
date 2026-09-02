import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { cn } from '@/registry/{engine}/lib/utils';
import { MicIcon, MicOffIcon, SquareIcon } from 'lucide-react-native';
import * as React from 'react';

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
    <Button
      size="icon"
      variant={state === 'recording' ? 'destructive' : 'ghost'}
      disabled={unavailable || denied || state === 'transcribing'}
      onPress={toggle}
      accessibilityLabel={label}
      accessibilityState={{ disabled: unavailable || denied, busy: state === 'transcribing' }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(className)}
    >
      <Icon as={icon} size={16} />
    </Button>
  );
}

export { SpeechInput };
