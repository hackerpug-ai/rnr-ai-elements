import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { NativeOnlyAnimatedView } from '@/registry/{engine}/components/ui/native-only-animated-view';
import { Text } from '@/registry/{engine}/components/ui/text';
import {
  initReasoningLifecycle,
  reasoningLifecycleReducer,
  REASONING_AUTO_CLOSE_DELAY,
  shouldAutoClose,
} from '@/registry/{engine}/lib/reasoning-lifecycle';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  ChevronDownIcon,
  CircleCheckIcon,
  CircleIcon,
  GlobeIcon,
  LoaderCircleIcon,
  ListOrderedIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Platform, View, type ViewProps } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  chainOfThoughtProgress,
  chainOfThoughtProgressLabel,
  chainOfThoughtStepMeta,
  type ChainOfThoughtStepIconName,
  type ChainOfThoughtStepStatus,
} from './chain-of-thought.logic';

/**
 * ChainOfThought — the multi-step reasoning list.
 *
 * DISTINCT FROM `reasoning`, WHICH STAYS THE SINGLE COLLAPSIBLE TRACE. Reasoning streams
 * one text body; this renders ordered steps, each with its own status, joined by a rail.
 * The web original's shape is preserved: a collapsible whose header carries the label
 * and a collapsed summary, with steps inside.
 *
 * THE DISCLOSURE LIFECYCLE IS REUSED, NOT FORKED. lib/reasoning-lifecycle.ts is the one
 * lifecycle for thinking disclosures, and this wires it exactly as reasoning.tsx does:
 * stream-start auto-opens, stream-end auto-closes after 1000ms, defaultOpen pins it
 * open forever, and any user toggle stands the automation down. The only difference is
 * the collapsed summary: reasoning freezes a duration, this shows the step progress
 * (UC-AGENT-02 AC-4's "follow a multi-step chain with per-step status" at a glance) —
 * which is also why the count comes in as data (the collapsed content is UNMOUNTED, so
 * a count derived from the tree would forget itself the moment it closed).
 *
 * THE RAIL. The web draws a connected vertical line between steps with CSS borders; a
 * React Native step draws its own segment — icon on top, `w-px flex-1 bg-border` below —
 * and the LAST step hides its segment via `isLast`, because React Native has no
 * :last-child selector.
 *
 * Icons arrive with a 200ms fade on status change (task.tsx's animated-completion beat,
 * ReduceMotion.System chained, bare children on web). No looping animation: the active
 * step's loader mark is static, same reasoning as task — motion that never ends chatters.
 */

type ChainOfThoughtContextValue = {
  open: boolean;
  streaming: boolean;
};

const ChainOfThoughtContext = React.createContext<ChainOfThoughtContextValue | null>(null);

function useChainOfThought() {
  const ctx = React.useContext(ChainOfThoughtContext);
  if (!ctx) throw new Error('ChainOfThought sub-components must be used within <ChainOfThought>');
  return ctx;
}

type ChainOfThoughtProps = Omit<ViewProps, 'children'> & {
  isStreaming?: boolean;
  /** Pinned open. Never auto-closes, and suppresses the auto-open timer entirely. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function ChainOfThought({
  isStreaming = false,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: ChainOfThoughtProps) {
  const [lifecycle, dispatch] = React.useReducer(
    reasoningLifecycleReducer,
    defaultOpen,
    initReasoningLifecycle,
  );
  // null = not yet observed, so mounting with isStreaming=true still opens the chain.
  const prevStreaming = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    if (prevStreaming.current !== null && isStreaming === prevStreaming.current) return;
    if (isStreaming) dispatch({ type: 'stream-start', at: Date.now() });
    else if (prevStreaming.current !== null) dispatch({ type: 'stream-end', at: Date.now() });
    prevStreaming.current = isStreaming;
  }, [isStreaming]);

  React.useEffect(() => {
    if (!shouldAutoClose(lifecycle)) return;
    const timer = setTimeout(() => dispatch({ type: 'auto-close' }), REASONING_AUTO_CLOSE_DELAY);
    return () => clearTimeout(timer);
  }, [lifecycle]);

  return (
    <ChainOfThoughtContext.Provider value={{ open: lifecycle.open, streaming: isStreaming }}>
      <Collapsible
        open={lifecycle.open}
        onOpenChange={(open) => {
          dispatch({ type: 'user-toggle', open });
          onOpenChange?.(open);
        }}
        className={cn('w-full', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </ChainOfThoughtContext.Provider>
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

type ChainOfThoughtHeaderProps = {
  /** The header label. Defaults to "Thinking…" mid-stream, "Chain of thought" at rest. */
  label?: string;
  /**
   * The same steps array the content renders — the collapsed badge's count. The collapsed
   * disclosure unmounts its content, so this cannot be derived from the tree.
   */
  steps?: ReadonlyArray<{ status?: ChainOfThoughtStepStatus }>;
  className?: string;
};

function ChainOfThoughtHeader({ label, steps, className }: ChainOfThoughtHeaderProps) {
  const { open, streaming } = useChainOfThought();
  const progress = steps ? chainOfThoughtProgress(steps) : null;

  return (
    <CollapsibleTrigger
      accessibilityState={{ busy: streaming, expanded: open }}
      className={cn(
        'flex-row items-center gap-2 rounded-md py-1.5 active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-accent/50' }),
        className,
      )}
    >
      <Icon
        as={ListOrderedIcon}
        size={14}
        className={cn(streaming ? 'text-foreground' : 'text-muted-foreground')}
      />
      <Text numberOfLines={1} className="flex-1 text-left text-sm font-medium text-foreground">
        {label ?? (streaming ? 'Thinking…' : 'Chain of thought')}
      </Text>
      {progress ? (
        <Badge
          variant="outline"
          accessibilityLabel={`${chainOfThoughtProgressLabel(progress)}, ${progress.total} steps`}
          accessibilityLiveRegion="polite"
        >
          <Text className="text-xs text-muted-foreground">
            {chainOfThoughtProgressLabel(progress)}
          </Text>
        </Badge>
      ) : null}
      <Chevron open={open} />
    </CollapsibleTrigger>
  );
}

function ChainOfThoughtContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('pt-1 pb-1', className)} {...props}>
      <View className="gap-1">{children}</View>
    </CollapsibleContent>
  );
}

/** iconName (from chain-of-thought.logic.ts) → Lucide component. Exhaustive by type. */
const STEP_ICONS: Record<ChainOfThoughtStepIconName, LucideIcon> = {
  circle: CircleIcon,
  'loader-circle': LoaderCircleIcon,
  'circle-check': CircleCheckIcon,
};

/**
 * The step's status icon, keyed by status so a change remounts and the 200ms fade plays —
 * task.tsx's animated-completion beat, static under reduced motion, bare on web.
 */
function StepStatusIcon({ status }: { status: ChainOfThoughtStepStatus }) {
  const meta = chainOfThoughtStepMeta(status);

  return (
    <NativeOnlyAnimatedView
      key={status}
      entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
      accessible
      accessibilityLabel={`Status: ${meta.label}`}
    >
      <Icon as={STEP_ICONS[meta.iconName]} size={14} className={cn(meta.className)} />
    </NativeOnlyAnimatedView>
  );
}

type ChainOfThoughtStepProps = ViewProps & {
  /** The step's label — what the model is doing. */
  label: string;
  /** One line of detail under the label. */
  description?: string;
  /** Defaults to 'pending' — a step that has not started is pending, not absent. */
  status?: ChainOfThoughtStepStatus;
  /**
   * The last step draws no rail segment below its icon — React Native has no
   * :last-child, so the consumer says it.
   */
  isLast?: boolean;
  children?: React.ReactNode;
};

function ChainOfThoughtStep({
  label,
  description,
  status = 'pending',
  isLast = false,
  className,
  children,
  ...props
}: ChainOfThoughtStepProps) {
  return (
    <View className={cn('flex-row gap-2.5', className)} {...props}>
      <View className="items-center gap-1">
        <StepStatusIcon status={status} />
        {/* width in plain style: `w-px` rides uniwind's compiled stylesheet, whose
            candidate extraction has been observed on device to drop classes from newly
            added files between incremental rebuilds — a dropped `w-px` collapses the
            rail to zero width and the line silently vanishes. */}
        {!isLast ? <View className="w-px flex-1 bg-border" style={{ width: 1 }} /> : null}
      </View>
      <View className="min-w-0 flex-1 gap-0.5 pb-2">
        <Text numberOfLines={1} className="text-sm font-medium text-foreground">
          {label}
        </Text>
        {description ? (
          <Text className="text-xs leading-4 text-muted-foreground">{description}</Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

/** Sources a step consulted, as wrapping chips — task.tsx's chips-flow-beside rule. */
function ChainOfThoughtSearchResults({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row flex-wrap gap-1 pt-1', className)} {...props} />;
}

function ChainOfThoughtSearchResult({ children, className }: { children: string; className?: string }) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-1 self-start rounded-full border border-border bg-background px-2 py-0.5 max-w-full',
        className,
      )}
    >
      <Icon as={GlobeIcon} size={12} className="text-muted-foreground" />
      {/* shrink + numberOfLines: a long title truncates instead of stretching the row.
          max-w-full (not an arbitrary width): the default Tailwind v3 max-w scale that
          the nativewind emit resolves has no numeric steps. */}
      <Text numberOfLines={1} className="shrink text-xs text-muted-foreground">
        {children}
      </Text>
    </View>
  );
}

type ChainOfThoughtImageProps = {
  /** RN Image source — a generated image, usually a data URI from the model result. */
  source: { uri: string };
  caption?: string;
  className?: string;
};

function ChainOfThoughtImage({ source, caption, className }: ChainOfThoughtImageProps) {
  return (
    <View className={cn('gap-1 pt-1.5', className)}>
      <Image
        source={source}
        resizeMode="cover"
        accessibilityLabel={caption}
        className="aspect-video w-full rounded-md border border-border bg-muted/50"
      />
      {caption ? (
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {caption}
        </Text>
      ) : null}
    </View>
  );
}

export {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
  useChainOfThought,
};
