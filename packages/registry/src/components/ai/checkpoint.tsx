import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { BookmarkIcon, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Alert, View, type ViewProps } from 'react-native';

/**
 * Checkpoint — a restorable point in the transcript.
 *
 * Reads as a DIVIDER, not a message: a hairline rule through the row with the label
 * centred on it. The web original does this with absolute positioning; on React Native it
 * is [flex-1 rule][content][flex-1 rule], which is simpler and behaves better.
 *
 * RESTORING IS DESTRUCTIVE. It truncates the transcript — setMessages(slice(0, i + 1)) in
 * the web original — and a mistap loses everything after this point. The web version puts
 * the action behind a hover tooltip, which does not exist on touch, so this asks for
 * confirmation instead. That is a deliberate addition, not a port.
 */

type CheckpointProps = ViewProps & { label?: string };

function Checkpoint({ className, label, children, ...props }: CheckpointProps) {
  return (
    <View className={cn('w-full flex-row items-center gap-2 py-2', className)} {...props}>
      <View className="h-px flex-1 bg-border" />
      {children ?? (
        <Text className="text-xs text-muted-foreground">{label ?? 'Checkpoint'}</Text>
      )}
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

function CheckpointIcon({ as = BookmarkIcon, className }: { as?: LucideIcon; className?: string }) {
  return <Icon as={as} size={14} className={cn('text-muted-foreground', className)} />;
}

type CheckpointTriggerProps = {
  label?: string;
  /** Called only after the user confirms. */
  onRestore: () => void;
  confirm?: boolean;
  className?: string;
};

function CheckpointTrigger({
  label = 'Restore',
  onRestore,
  confirm = true,
  className,
}: CheckpointTriggerProps) {
  function press() {
    if (!confirm) return onRestore();
    Alert.alert(
      'Restore to this point?',
      'Everything after this checkpoint will be removed from the conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: onRestore },
      ],
    );
  }
  return (
    <Button
      variant="ghost"
      onPress={press}
      accessibilityLabel={`${label}. Removes everything after this point.`}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      className={cn(
        'h-auto gap-1 rounded-full border border-border px-2 py-1',
        className,
      )}
    >
      <CheckpointIcon />
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </Button>
  );
}

export { Checkpoint, CheckpointIcon, CheckpointTrigger };
