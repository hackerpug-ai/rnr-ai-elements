import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item } from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { statusColor } from '@/registry/{engine}/lib/status';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  ChevronDownIcon,
  CircleCheckIcon,
  CircleIcon,
  FileIcon,
  ListTodoIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Platform, ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Queue — the queued-actions list: what will run after the current turn, with a remove
 * action per row (UC web original: Collapsible of queued items, count on the trigger).
 *
 * THE COMPONENT NEVER OWNS THE QUEUE. There is no useQueue hook here — caller state,
 * caller mutations (speech-input precedent: a caller-supplied contract only). The root
 * takes `onRemove(id)` and reports; queue.logic.ts ships the pure remove/enqueue/count
 * helpers so the caller's reducer stays one import away. With no `onRemove` wired, the
 * remove buttons DISABLE rather than hide — a control that disappears mid-press is the
 * failure this shape prevents.
 *
 * LISTS COMPOSE THE `item` PRIMITIVE — the PRD's own verdict ("RNR list composition
 * plus the new item primitive"), realized: each row is Item, so media/content/actions
 * alignment and the published TextClassContext are item's, never re-derived.
 *
 * THE WEB'S HOVER-REVEAL IS DEAD ON TOUCH. QueueItemActions renders always-visible —
 * message.tsx's actions precedent, declared. The list scrolls (the web ScrollArea
 * becomes a plain ScrollView with a max-h cap, the scroll-area substitute) so a long
 * queue never pushes the composer off screen.
 *
 * Rows read as PENDING until marked done: the indicator carries the house status tones
 * (lib/status.ts), and a completed row strikes through exactly as the web original does
 * — visible, but visually retired.
 */

type QueueContextValue = {
  onRemove?: (id: string) => void;
};

const QueueContext = React.createContext<QueueContextValue | null>(null);

function useQueue() {
  const ctx = React.useContext(QueueContext);
  if (!ctx) throw new Error('Queue sub-components must be used within <Queue>');
  return ctx;
}

type QueueProps = ViewProps & {
  /** Called with the item's id. Omit it and every remove control disables. */
  onRemove?: (id: string) => void;
  children?: React.ReactNode;
};

function Queue({ onRemove, className, children, ...props }: QueueProps) {
  return (
    <QueueContext.Provider value={{ onRemove }}>
      <View className={cn('gap-2', className)} {...props}>
        {children}
      </View>
    </QueueContext.Provider>
  );
}

type QueueSectionContextValue = { open: boolean };

const QueueSectionContext = React.createContext<QueueSectionContextValue | null>(null);

function useQueueSection() {
  const ctx = React.useContext(QueueSectionContext);
  if (!ctx) throw new Error('QueueSection sub-components must be used within <QueueSection>');
  return ctx;
}

type QueueSectionProps = Omit<ViewProps, 'children'> & {
  /** Web parity: a queue section arrives open. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function QueueSection({
  defaultOpen = true,
  onOpenChange,
  className,
  children,
  ...props
}: QueueSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <QueueSectionContext.Provider value={{ open }}>
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        className={cn('rounded-md border border-border bg-muted/50', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </QueueSectionContext.Provider>
  );
}

type QueueSectionTriggerProps = {
  /** The section's name — "Queued actions", "Follow-ups", whatever the queue is of. */
  label: string;
  /** The item count, glanceable while collapsed. Omit it and no count badge renders. */
  count?: number;
  /** Defaults to the house list icon. */
  icon?: LucideIcon;
  className?: string;
};

function QueueSectionTrigger({ label, count, icon = ListTodoIcon, className }: QueueSectionTriggerProps) {
  const { open } = useQueueSection();
  const rotation = useSharedValue(open ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(open ? 1 : 0, {
      duration: open ? 250 : 200,
      reduceMotion: ReduceMotion.System,
    });
  }, [open, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <CollapsibleTrigger
      accessibilityLabel={`${label}${typeof count === 'number' ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
      className={cn(
        'flex-row items-center gap-2 rounded-md p-3 active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-accent/50' }),
        className,
      )}
    >
      <Icon as={icon} size={14} className="text-muted-foreground" />
      <Text numberOfLines={1} className="flex-1 text-left text-sm font-medium text-foreground">
        {label}
      </Text>
      {typeof count === 'number' ? (
        <Badge variant="outline">
          <Text className="text-xs text-muted-foreground">{count}</Text>
        </Badge>
      ) : null}
      <Animated.View style={style}>
        <Icon as={ChevronDownIcon} size={14} className="text-muted-foreground" />
      </Animated.View>
    </CollapsibleTrigger>
  );
}

function QueueSectionContent({
  className,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('px-2 pb-2', className)} {...props}>
      {children}
    </CollapsibleContent>
  );
}

/**
 * The web ScrollArea becomes a plain ScrollView with a max-h cap — the scroll-area
 * substitute. A long queue scrolls; it never pushes the composer off screen.
 */
function QueueList({ className, ...props }: React.ComponentProps<typeof ScrollView>) {
  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      className={cn('max-h-52', className)}
      contentContainerClassName="gap-1"
      {...props}
    />
  );
}

type QueueItemContextValue = {
  id: string;
  completed: boolean;
  removable: boolean;
  remove: () => void;
};

const QueueItemContext = React.createContext<QueueItemContextValue | null>(null);

function useQueueItem() {
  const ctx = React.useContext(QueueItemContext);
  if (!ctx) throw new Error('QueueItem sub-components must be used within <QueueItem>');
  return ctx;
}

type QueueItemProps = ViewProps & {
  /** The item's identity — what `onRemove` receives. */
  id: string;
  completed?: boolean;
  children?: React.ReactNode;
};

function QueueItem({ id, completed = false, className, children, ...props }: QueueItemProps) {
  const { onRemove } = useQueue();
  const removable = typeof onRemove === 'function';
  const remove = React.useCallback(() => {
    onRemove?.(id);
  }, [onRemove, id]);

  return (
    <QueueItemContext.Provider value={{ id, completed, removable, remove }}>
      <Item variant="outline" className={cn('items-start py-2', className)} {...props}>
        {children}
      </Item>
    </QueueItemContext.Provider>
  );
}

function QueueItemIndicator({ className }: { className?: string }) {
  const { completed } = useQueueItem();

  // The icon is decorative proof of state — an accessible View group carries the
  // label for a screen reader (house rule: color is never the sole channel).
  return completed ? (
    <View accessible accessibilityLabel="Status: Completed">
      <Icon
        as={CircleCheckIcon}
        size={16}
        className={cn('pt-0.5', statusColor.success, className)}
      />
    </View>
  ) : (
    <View accessible accessibilityLabel="Status: Pending">
      <Icon as={CircleIcon} size={16} className={cn('pt-0.5', statusColor.pending, className)} />
    </View>
  );
}

function QueueItemContent({ className, ...props }: React.ComponentProps<typeof Text>) {
  const { completed } = useQueueItem();

  return (
    <Text
      numberOfLines={2}
      className={cn(
        'text-sm text-foreground',
        completed && 'text-muted-foreground line-through',
        className,
      )}
      // Redundant with `line-through` on purpose: the class rides uniwind's compiled
      // stylesheet, whose candidate extraction has been observed on device to drop
      // classes from newly added files between incremental rebuilds — the strike
      // silently vanished. Plain RN style is immune to stylesheet state.
      style={completed ? { textDecorationLine: 'line-through' } : undefined}
      {...props}
    />
  );
}

function QueueItemDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  const { completed } = useQueueItem();

  return (
    <Text
      numberOfLines={2}
      className={cn(
        'text-xs text-muted-foreground',
        completed && 'line-through',
        className,
      )}
      // Same stylesheet-immunity rationale as QueueItemContent above.
      style={completed ? { textDecorationLine: 'line-through' } : undefined}
      {...props}
    />
  );
}

function QueueItemFile({ children, className }: { children: string; className?: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-sm border border-border bg-background px-1.5 py-0.5',
        className,
      )}
    >
      <Icon as={FileIcon} size={12} className="text-muted-foreground" />
      <Text numberOfLines={1} className="text-xs text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}

type QueueItemImageProps = {
  source: { uri: string };
  className?: string;
};

function QueueItemImage({ source, className }: QueueItemImageProps) {
  return (
    <Image
      source={source}
      resizeMode="cover"
      className={cn('size-10 rounded-md border border-border bg-muted/50', className)}
    />
  );
}

/**
 * ALWAYS VISIBLE. The web original reveals these on hover, which on touch renders
 * identically at rest and is simply unreachable — message.tsx's actions precedent.
 */
function QueueItemActions({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex-row items-center gap-1', className)} {...props} />
  );
}

type QueueItemActionProps = {
  /** The icon. Defaults to the house remove mark. */
  icon?: LucideIcon;
  /** The accessibility label — a bare icon has no text for a screen reader. */
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

function QueueItemAction({
  icon = XIcon,
  label,
  onPress,
  disabled,
  className,
}: QueueItemActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      // House formula (confirmation.tsx): RNR's h-10 (40pt) + hitSlop 2/side = the 44pt
      // platform minimum. No size-8 override — a 32pt visual with a 40pt hit area
      // undershot the wave's own standard.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('rounded-full', className)}
    >
      <Icon as={icon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

/** The remove control, wired to the row's id. Disables when no onRemove is wired. */
function QueueItemRemove({ className }: { className?: string }) {
  const { remove, removable } = useQueueItem();

  return (
    <QueueItemAction
      icon={XIcon}
      label="Remove from queue"
      onPress={remove}
      disabled={!removable}
      className={className}
    />
  );
}

export {
  Queue,
  QueueItem,
  QueueItemAction,
  QueueItemActions,
  QueueItemContent,
  QueueItemDescription,
  QueueItemFile,
  QueueItemImage,
  QueueItemIndicator,
  QueueItemRemove,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionTrigger,
  useQueue,
  useQueueItem,
  useQueueSection,
};
