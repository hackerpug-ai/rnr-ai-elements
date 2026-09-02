import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { Platform, TextInput, View, type TextInputProps, type ViewProps } from 'react-native';

/**
 * InputGroup — leading/trailing addons around a TextInput.
 *
 * RNR ships no `input-group`. Highest-leverage item of the whole gap: prompt-input is
 * built on it, and so are the filter fields in command, attachments and
 * environment-variables.
 *
 * It owns its own focus ring. React Native has no `:focus-within`, so the ring is driven
 * by onFocus/onBlur state on the wrapper rather than by a CSS selector — without this the
 * group simply never shows focus, silently.
 */

type InputGroupContextValue = { focused: boolean; setFocused: (v: boolean) => void };
const InputGroupContext = React.createContext<InputGroupContextValue | null>(null);

function useInputGroup() {
  const ctx = React.useContext(InputGroupContext);
  if (!ctx) throw new Error('InputGroup sub-components must be used within <InputGroup>');
  return ctx;
}

function InputGroup({ className, ...props }: ViewProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <InputGroupContext.Provider value={{ focused, setFocused }}>
      <View
        className={cn(
          'flex-row items-center gap-2 rounded-md border border-input bg-background px-3',
          'dark:bg-input/30',
          focused && 'border-ring ring-2 ring-ring/50',
          className,
        )}
        {...props}
      />
    </InputGroupContext.Provider>
  );
}

/** The text field. Reports focus up so the wrapper can draw the ring. */
function InputGroupInput({ className, onFocus, onBlur, ...props }: TextInputProps) {
  const { setFocused } = useInputGroup();
  return (
    <TextInput
      className={cn(
        'h-10 flex-1 py-2 text-base text-foreground sm:h-9',
        Platform.select({ web: 'outline-none' }),
        className,
      )}
      placeholderClassName="text-muted-foreground"
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );
}

/** Non-interactive leading/trailing content — an icon, a `$` prefix, a unit. */
function InputGroupAddon({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />
    </TextClassContext.Provider>
  );
}

/** Interactive trailing slot — a send button, a clear button. */
function InputGroupActions({ className, ...props }: ViewProps) {
  return <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export { InputGroup, InputGroupActions, InputGroupAddon, InputGroupInput, InputGroupText };
