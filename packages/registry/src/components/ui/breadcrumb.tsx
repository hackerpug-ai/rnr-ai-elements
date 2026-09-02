import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { ChevronRightIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

/**
 * Breadcrumb — the path trail in file-tree and web-preview headers.
 *
 * A HORIZONTAL SCROLLVIEW, not the web's wrap-and-ellipsis: a phone bar overflows long
 * before it would wrap, so scrolling keeps the full path reachable instead of hiding it
 * behind an ellipsis the user cannot expand.
 *
 * Publishes TextClassContext so the trailing crumb can override to text-foreground while
 * the rest stay muted, without per-call classes.
 */
function Breadcrumb({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className={cn('w-full', className)}
        contentContainerClassName="flex-row items-center gap-1"
        accessibilityRole="none"
      >
        {children}
      </ScrollView>
    </TextClassContext.Provider>
  );
}

function BreadcrumbItem({
  children,
  onPress,
  current = false,
  className,
}: { children?: React.ReactNode; onPress?: () => void; current?: boolean; className?: string }) {
  const content = (
    <Text
      numberOfLines={1}
      className={cn('text-sm', current ? 'font-medium text-foreground' : 'text-muted-foreground', className)}
    >
      {children}
    </Text>
  );
  if (!onPress || current) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      className="active:opacity-70"
    >
      {content}
    </Pressable>
  );
}

function BreadcrumbSeparator({ className }: { className?: string }) {
  return (
    <View className={cn('shrink-0', className)}>
      <Icon as={ChevronRightIcon} size={14} className="text-muted-foreground" />
    </View>
  );
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator };
