import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable, View, type ViewProps } from 'react-native';

/**
 * Item — the generic media / content / actions row.
 *
 * RNR ships no `item`. Second-highest leverage of the gap after input-group: sources,
 * file-tree, attachments, model-selector, queue, plan and task all render lists of these.
 *
 * Publishes TextClassContext so ItemTitle and ItemDescription style their descendants
 * without per-call classes — React Native has no cascade, so a className on this View
 * would never reach a nested Text.
 */

const itemVariants = cva('flex-row items-center gap-3 rounded-md px-3 py-2', {
  variants: {
    variant: {
      default: '',
      outline: 'border border-border',
      muted: 'bg-muted/50',
    },
    // Web keeps its hover; native gets the active twin. A hover-only row renders
    // identically at rest and is dead under a thumb.
    interactive: { true: 'active:bg-accent', false: '' },
  },
  defaultVariants: { variant: 'default', interactive: false },
});

type ItemProps = ViewProps &
  VariantProps<typeof itemVariants> & {
    onPress?: () => void;
  };

function Item({ className, variant, onPress, ...props }: ItemProps) {
  const interactive = Boolean(onPress);
  const classes = cn(
    itemVariants({ variant, interactive }),
    interactive && Platform.select({ web: 'hover:bg-accent cursor-pointer' }),
    className,
  );

  if (interactive) {
    return (
      <Pressable
        className={classes}
        onPress={onPress}
        accessibilityRole="button"
        // RNR's mobile control is h-10 (40pt). hitSlop reaches the 44pt platform minimum
        // with a zero-pixel visual change; growing to h-11 would make our rows taller
        // than every other row in the host app.
        hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
        {...props}
      />
    );
  }
  return <View className={classes} {...props} />;
}

function ItemMedia({ className, ...props }: ViewProps) {
  return <View className={cn('shrink-0 items-center justify-center', className)} {...props} />;
}

function ItemContent({ className, ...props }: ViewProps) {
  return <View className={cn('min-w-0 flex-1 gap-0.5', className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text numberOfLines={1} className={cn('text-sm font-medium text-foreground', className)} {...props} />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text numberOfLines={2} className={cn('text-xs text-muted-foreground', className)} {...props} />
  );
}

function ItemActions({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-xs font-medium">
      <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle, itemVariants };
