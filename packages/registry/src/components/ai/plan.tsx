import { Button } from '@/registry/{engine}/components/ui/button';
import { Card } from '@/registry/{engine}/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Shimmer } from '@/registry/{engine}/components/ai/shimmer';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { ChevronDownIcon, RouteIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { planProgress, planProgressLabel } from './plan.logic';
import type { TaskStatus } from './task.logic';

/**
 * Plan — the agent's plan, as an ordered, status-bearing step list that updates in place
 * (UC-AGENT-03).
 *
 * COMPOSITION IS THE WEB ORIGINAL'S SHAPE, WITH TASK'S PRIMITIVES INSIDE. The web Plan
 * is a Card + Collapsible whose PlanContent hosts consumer-rendered steps; this port
 * keeps that shell exactly and steps are the TASK organism's own rows — TaskItem /
 * TaskItemFile, composed directly, never re-implemented. The step status map is
 * task.logic's, the one map this registry has for step-shaped work; plan.logic only
 * counts it.
 *
 * STREAMING SHIMMER, AT WEB PARITY. PlanTitle and PlanDescription shimmer while
 * isStreaming, on the Shimmer organism's house pulse (RNR Skeleton's 1000ms signature,
 * reduced-motion gated) — the web original's exact behavior, ported to the substitute
 * the design lens chose.
 *
 * DEFAULTOPEN STAYS TRUE, AT WEB PARITY — unlike `task`, which collapses by default on
 * a phone. A plan is the overview the user explicitly asked the agent to commit to; the
 * phone-density rule that hides a task group's body does not reach this far. The
 * trigger row still carries the progress badge, so a user-collapsed plan keeps its
 * count (UC-AGENT-03 AC-4) glanceable.
 */

type PlanContextValue = {
  open: boolean;
  isStreaming: boolean;
};

const PlanContext = React.createContext<PlanContextValue | null>(null);

function usePlan() {
  const ctx = React.useContext(PlanContext);
  if (!ctx) throw new Error('Plan sub-components must be used within <Plan>');
  return ctx;
}

type PlanProps = Omit<ViewProps, 'children'> & {
  isStreaming?: boolean;
  /** Web parity: a plan arrives open. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Plan({
  isStreaming = false,
  defaultOpen = true,
  onOpenChange,
  className,
  children,
  ...props
}: PlanProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <PlanContext.Provider value={{ open, isStreaming }}>
      <Card className={cn('gap-2 p-3', className)} {...props}>
        <Collapsible open={open} onOpenChange={handleOpenChange} className="gap-1">
          {children}
        </Collapsible>
      </Card>
    </PlanContext.Provider>
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

/**
 * The disclosure control, as a pill — checkpoint.tsx's vendored-ghost-Button form, the
 * house shape for pill buttons. Raw Pressable would skip Button's TextClassContext and
 * its press states; the checkpoint precedent exists precisely so this file never
 * hand-rolls one.
 */
function PlanTrigger({ label = 'Plan', className }: { label?: string; className?: string }) {
  const { open } = usePlan();

  return (
    <CollapsibleTrigger asChild>
      <Button
        variant="ghost"
        accessibilityLabel={`${label}. ${open ? 'Collapse' : 'Expand'} the plan steps.`}
        accessibilityState={{ expanded: open }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        className={cn('h-auto self-start gap-1.5 rounded-full border border-border px-2.5 py-1', className)}
      >
        <Icon as={RouteIcon} size={14} className="text-muted-foreground" />
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Chevron open={open} />
      </Button>
    </CollapsibleTrigger>
  );
}

/** The header row: trigger left, actions right, title/description flowing under. */
function PlanHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

function PlanTitle({ children, className }: { children: string; className?: string }) {
  const { isStreaming } = usePlan();
  const classes = cn('text-base font-semibold text-foreground', className);
  // The web original shimmers title and description while streaming; the shimmer is
  // the Shimmer organism's house pulse — not a second motion vocabulary.
  if (isStreaming) {
    return (
      <Shimmer className={classes} numberOfLines={2}>
        {children}
      </Shimmer>
    );
  }
  return (
    <Text numberOfLines={2} className={classes}>
      {children}
    </Text>
  );
}

function PlanDescription({ children, className }: { children: string; className?: string }) {
  const { isStreaming } = usePlan();
  const classes = cn('text-sm text-muted-foreground', className);
  if (isStreaming) {
    return (
      <Shimmer className={classes} numberOfLines={2}>
        {children}
      </Shimmer>
    );
  }
  return (
    <Text numberOfLines={2} className={classes}>
      {children}
    </Text>
  );
}

/** Header-right slot — a custom trigger, a progress badge, whatever the caller adds. */
function PlanAction({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center gap-2', className)} {...props} />;
}

/**
 * The steps' body. Steps are the TASK organism's own rows, composed by the consumer:
 *
 *   <PlanContent>
 *     <TaskItem status="completed"><Text className="text-sm">…</Text></TaskItem>
 *     <TaskItem status="running"><Text className="text-sm">…</Text>
 *       <TaskItemFile>src/retry.ts</TaskItemFile></TaskItem>
 *   </PlanContent>
 *
 * — TaskItem / TaskItemFile come from the task registry item (a registryDependency of
 * this one), so the status map and the animated arrival stay task's, never a fork.
 */
function PlanContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('pt-1', className)} {...props}>
      <View className="gap-1">{children}</View>
    </CollapsibleContent>
  );
}

/** Footer row — the progress badge lives here by convention, with any trailing actions. */
function PlanFooter({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row flex-wrap items-center gap-2 pt-1', className)} {...props} />;
}

type PlanProgressBadgeProps = {
  /** The same steps array the content renders. */
  steps: ReadonlyArray<{ status?: TaskStatus }>;
  className?: string;
};

/** UC-AGENT-03 AC-4: the remaining count, glanceable even while the plan is collapsed. */
function PlanProgressBadge({ steps, className }: PlanProgressBadgeProps) {
  const label = planProgressLabel(planProgress(steps));

  return (
    <Badge
      variant="outline"
      accessibilityLabel={`Plan progress: ${label}`}
      accessibilityLiveRegion="polite"
      className={className}
    >
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </Badge>
  );
}

export {
  Plan,
  PlanAction,
  PlanContent,
  PlanDescription,
  PlanFooter,
  PlanHeader,
  PlanProgressBadge,
  PlanTitle,
  PlanTrigger,
  usePlan,
};
