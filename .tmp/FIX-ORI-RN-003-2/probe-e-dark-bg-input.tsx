import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, TextInput, View, useColorScheme, type TextInputProps, type ViewProps } from 'react-native';

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
          focused && 'border-ring',
          className,
        )}
        {...props}
      />
    </InputGroupContext.Provider>
  );
}

function InputGroupInput({ className, onFocus, onBlur, ...props }: TextInputProps) {
  const { setFocused } = useInputGroup();
  const scheme = useColorScheme();
  return (
    <TextInput
      className={cn('h-10 flex-1 py-2 text-base text-foreground sm:h-9', Platform.select({ web: 'outline-none' }), className)}
      placeholderTextColor={scheme === 'dark' ? 'hsl(0 0% 63.9%)' : 'hsl(0 0% 45.1%)'}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      {...props}
    />
  );
}

function InputGroupAddon({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />
    </TextClassContext.Provider>
  );
}

function InputGroupActions({ className, ...props }: ViewProps) {
  return <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />;
}

function InputGroupText({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

export { InputGroup, InputGroupActions, InputGroupAddon, InputGroupInput, InputGroupText };
