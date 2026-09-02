import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { Platform, View, type ViewProps } from 'react-native';

/**
 * Kbd — a keyboard-shortcut hint.
 *
 * Renders NULL where there is no hardware keyboard, which on a phone is always. That is
 * correct rather than a compromise: a "⌘K" hint on a touch device is noise. Its consumer
 * is prompt-input's submit hint, which is meaningful on web and on an iPad with a Magic
 * Keyboard and meaningless otherwise.
 *
 * `always` is the escape hatch for a surface that knows it has a keyboard.
 */
type KbdProps = ViewProps & { always?: boolean };

function Kbd({ className, children, always = false, ...props }: KbdProps) {
  if (!always && Platform.OS !== 'web') return null;
  return (
    <View
      className={cn('rounded-sm border border-border bg-muted px-1.5 py-0.5', className)}
      {...props}
    >
      <Text className="text-xs text-muted-foreground">{children}</Text>
    </View>
  );
}

export { Kbd };
