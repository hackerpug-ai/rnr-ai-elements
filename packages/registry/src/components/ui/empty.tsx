import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { View, type ViewProps } from 'react-native';

/**
 * Empty — icon + title + description + optional action.
 *
 * RNR ships no `empty`. This is AI Elements' ConversationEmptyState generalised: the same
 * surface is the fallback for file-tree, sources, attachments and test-results, so it is
 * built once and reused rather than re-invented per component.
 *
 * Declares no token. Every value is an RNR role.
 */

function Empty({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-1 items-center justify-center gap-3 p-8', className)}
      accessibilityRole="summary"
      {...props}
    />
  );
}

function EmptyIcon({ as, className }: { as: LucideIcon; className?: string }) {
  // Via RNR's Icon wrapper — a raw Lucide element silently ignores className.
  return <Icon as={as} size={32} className={cn('text-muted-foreground', className)} />;
}

function EmptyTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-center text-base font-medium text-foreground', className)} {...props} />;
}

function EmptyDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn('max-w-sm text-center text-sm text-muted-foreground', className)} {...props} />
  );
}

/** Action slot. TextClassContext so a Button's label inherits without per-call classes. */
function EmptyActions({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-sm font-medium">
      <View className={cn('flex-row items-center gap-2 pt-1', className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Empty, EmptyActions, EmptyDescription, EmptyIcon, EmptyTitle };
