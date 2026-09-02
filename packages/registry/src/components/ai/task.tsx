import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/registry/{engine}/components/ui/native-only-animated-view';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  ChevronDownIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleXIcon,
  FileIcon,
  LoaderCircleIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { taskStatusMeta, type TaskStatus, type TaskStatusIconName } from './task.logic';

/**
 * Task — what the agent did or is doing, with a status per row and the files it
 * touched. The web original is a collapsible checklist driven by a streamed object
 * (title before items, so the trigger tolerates a missing title with "Loading...").
 *
 * ONE DELIBERATE DIVERGENCE FROM THE WEB: it does NOT defaultOpen. The web's open-by-
 * default rule loses to the design contract's phone-density rule — a transcript that
 * auto-unrolls every task list stops being scannable — because status is still
 * glanceable while collapsed: the trigger row carries a status badge, and each row's
 * icon carries its own after that. Details are one tap away, which is the disclosure's
 * whole job. Like the web original, the trigger tolerates a missing title ("Loading…")
 * because titles arrive before items mid-stream.
 *
 * THE STATUS MAP IS PURE (task.logic.ts, Vitest-owned); this file holds only the static
 * iconName → Lucide table, exhaustive by type. Status swaps animate through
 * NativeOnlyAnimatedView's FadeIn (200ms — the house layout-transition duration,
 * ReduceMotion.System chained, bare children on web), so a task completing reads as the
 * check arriving rather than a flicker. No looping animation here: a spinning loader is
 * motion that never ends, and per-second ticks chatter to screen readers — the loader
 * mark is static by design.
 *
 * FILE CHIPS. The web flows a chip inline INSIDE the sentence via inline-flex, which
 * React Native cannot do (no View inside a Text run). The port advice is followed: a
 * Text run for the sentence plus chips that flow and wrap beside it
 * (flex-row + flex-wrap), never a nested View-in-Text.
 */

type TaskContextValue = { open: boolean };

const TaskContext = React.createContext<TaskContextValue | null>(null);

function useTask() {
  const ctx = React.useContext(TaskContext);
  if (!ctx) throw new Error('Task sub-components must be used within <Task>');
  return ctx;
}

type TaskProps = Omit<ViewProps, 'children'> & {
  /** Collapsed by default on a phone — see the divergence note above. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Task({ defaultOpen = false, onOpenChange, className, children, ...props }: TaskProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <TaskContext.Provider value={{ open }}>
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        className={cn('rounded-md border border-border bg-muted/50', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </TaskContext.Provider>
  );
}

/** iconName (from task.logic.ts) → Lucide component. Static and exhaustive by type. */
const STATUS_ICONS: Record<TaskStatusIconName, LucideIcon> = {
  circle: CircleIcon,
  'loader-circle': LoaderCircleIcon,
  'circle-check': CircleCheckIcon,
  'circle-x': CircleXIcon,
};

/**
 * The status icon, keyed by status so a change remounts and the entering animation
 * plays — the "animated completion" beat. Static under reduced motion (FadeIn chains
 * ReduceMotion.System) and bare on web (NativeOnlyAnimatedView).
 */
function TaskStatusIcon({ status }: { status: TaskStatus }) {
  const meta = taskStatusMeta(status);

  return (
    <NativeOnlyAnimatedView
      key={status}
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
      className="pt-0.5"
    >
      <Icon as={STATUS_ICONS[meta.iconName]} size={14} className={cn(meta.className)} />
    </NativeOnlyAnimatedView>
  );
}

/** House motion scale for the chevron: 250ms open, 200ms close, system-reduced. */
function Chevron({ open }: { open: boolean }) {
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
    <Animated.View style={style}>
      <Icon as={ChevronDownIcon} size={14} className="text-muted-foreground" />
    </Animated.View>
  );
}

type TaskTriggerProps = {
  /** The collapsed summary line. Tolerates a missing title mid-stream. */
  title?: string;
  /** The group's current status, glanceable while collapsed. */
  status?: TaskStatus;
  className?: string;
};

function TaskTrigger({ title, status, className }: TaskTriggerProps) {
  const { open } = useTask();
  const meta = status ? taskStatusMeta(status) : null;

  return (
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-2 rounded-md p-3 active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-accent/50' }),
        className,
      )}
    >
      <Text numberOfLines={1} className="flex-1 text-sm font-medium text-foreground">
        {title || 'Loading…'}
      </Text>
      {meta ? (
        <Badge variant="outline" accessibilityLabel={`Status: ${meta.label}`} className="gap-1">
          <Icon as={STATUS_ICONS[meta.iconName]} size={12} className={cn(meta.className)} />
          <Text className={cn('text-xs', meta.className)}>{meta.label}</Text>
        </Badge>
      ) : null}
      <Chevron open={open} />
    </CollapsibleTrigger>
  );
}

function TaskContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('px-3 pb-3', className)} {...props}>
      <View className="gap-1.5">{children}</View>
    </CollapsibleContent>
  );
}

type TaskItemProps = ViewProps & {
  /** This row's status — icon and color from the pure map, animated on change. */
  status?: TaskStatus;
  children?: React.ReactNode;
};

function TaskItem({ status, className, children, ...props }: TaskItemProps) {
  return (
    <View className={cn('flex-row items-start gap-2 py-0.5', className)} {...props}>
      {status ? <TaskStatusIcon status={status} /> : null}
      {/* Chips flow and wrap beside the sentence; they never nest inside a Text run. */}
      <View className="flex-1 flex-row flex-wrap items-center gap-x-1.5 gap-y-1">{children}</View>
    </View>
  );
}

/** A file the task touched, as a chip. Sits in the item's wrap row, never inside a Text run. */
function TaskItemFile({ children, className }: { children: string; className?: string }) {
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

export { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger, useTask };
