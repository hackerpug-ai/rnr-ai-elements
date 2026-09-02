import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  InputGroup,
  InputGroupActions,
  InputGroupInput,
} from '@/registry/{engine}/components/ui/input-group';
import { cn } from '@/registry/{engine}/lib/utils';
import { ArrowUpIcon, SquareIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * PromptInput — the composer.
 *
 * Looks like the web original and shares almost nothing underneath.
 *
 * THE SUBMIT CONTRACT IS DELIBERATELY DIFFERENT. The web version is Enter-submits,
 * Shift+Enter-newline, with an IME-composition guard. On a soft keyboard none of that
 * exists: Enter is a newline and there is no modifier. So an explicit SEND BUTTON is the
 * ONLY submit path. That is a real behavioural change, made once, on purpose.
 *
 * WHAT IS PRESERVED, because it is the rule that protects the user:
 *   a resolved onSubmit clears the field; an onSubmit that THROWS OR REJECTS leaves the
 *   text intact. Losing someone's typed message on a network failure is the failure this
 *   exists to prevent.
 *
 * Also preserved: the submit button swaps by status — idle shows send, submitted/streaming
 * shows stop.
 */

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

type PromptInputProps = Omit<ViewProps, 'children'> & {
  onSubmit: (text: string) => void | Promise<void>;
  onStop?: () => void;
  status?: ChatStatus;
  placeholder?: string;
  /** Grow to this many px, then scroll internally. */
  maxHeight?: number;
  children?: React.ReactNode;
};

function PromptInput({
  onSubmit,
  onStop,
  status = 'ready',
  placeholder = 'Ask anything…',
  maxHeight = 140,
  className,
  children,
  ...props
}: PromptInputProps) {
  const [text, setText] = React.useState('');
  const [height, setHeight] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const insets = useSafeAreaInsets();

  const streaming = status === 'submitted' || status === 'streaming';
  const canSend = text.trim().length > 0 && !streaming && !busy;

  async function submit() {
    if (!canSend) return;
    const value = text.trim();
    setBusy(true);
    try {
      await onSubmit(value);
      // Only on success. A rejection leaves the text exactly where it was.
      setText('');
      setHeight(0);
    } catch {
      // Intentionally swallowed here: the caller owns error reporting, and the user's
      // message must survive. Re-clearing or re-throwing would lose it.
    } finally {
      setBusy(false);
    }
  }

  return (
    <View
      className={cn('gap-2 border-t border-border bg-background px-4 pt-2', className)}
      // The home indicator and the Android gesture bar both sit here.
      style={{ paddingBottom: insets.bottom || 8 }}
      {...props}
    >
      {children}
      <InputGroup className="items-end py-1">
        <InputGroupInput
          multiline
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          // Auto-grow to a cap, then scroll internally — the RN equivalent of the web
          // original's scrollHeight measurement.
          onContentSizeChange={(e) => setHeight(e.nativeEvent.contentSize.height)}
          style={{ height: Math.min(Math.max(40, height), maxHeight) }}
          className="max-h-40 py-2"
          accessibilityLabel="Message"
        />
        <InputGroupActions>
          {streaming ? (
            <Button
              size="icon"
              variant="secondary"
              onPress={onStop}
              accessibilityLabel="Stop generating"
              hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
            >
              <Icon as={SquareIcon} size={16} />
            </Button>
          ) : (
            <Button
              size="icon"
              onPress={submit}
              disabled={!canSend}
              accessibilityLabel="Send message"
              hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
            >
              <Icon as={ArrowUpIcon} size={16} />
            </Button>
          )}
        </InputGroupActions>
      </InputGroup>
    </View>
  );
}

/** Slot above the field — attachment chips, a model picker, queued messages. */
function PromptInputHeader({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center gap-2', className)} {...props} />;
}

export { PromptInput, PromptInputHeader };
