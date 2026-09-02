import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { repairIncompleteMarkdown } from '@/registry/{engine}/lib/markdown';
import {
  initReasoningLifecycle,
  reasoningLabel,
  reasoningLifecycleReducer,
  REASONING_AUTO_CLOSE_DELAY,
  shouldAutoClose,
} from '@/registry/{engine}/lib/reasoning-lifecycle';
import { cn } from '@/registry/{engine}/lib/utils';
import { BrainIcon, ChevronDownIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Reasoning — the collapsible thinking trace.
 *
 * THE LIFECYCLE IS THE COMPONENT. It lives in lib/reasoning-lifecycle.ts as a pure,
 * time-injected reducer precisely so the Vitest tier can own it: auto-open when
 * `isStreaming` starts, auto-close 1000ms after it ends, `defaultOpen` pinned open and
 * never auto-closed, a mount with `isStreaming={false}` starting closed (loaded history
 * must not spring open), and — the rule that protects the reader — any user interaction
 * standing the automation down for good. This file only wires it: dispatch on
 * isStreaming transitions, arm a timer while the reducer says one should be armed.
 *
 * THE DURATION IS FROZEN, NOT TICKING. `durationSeconds` is computed once at stream end
 * and shown on the collapsed header ("Thought for 5 seconds"); while streaming the
 * header reads "Thinking…". A per-second live counter would chatter to screen readers —
 * the design contract bans it explicitly. A caller who already knows the duration can
 * pass it and the tracked value yields.
 *
 * MARKDOWN IS INJECTED, NOT BUNDLED — message.tsx's seam, for the same reason: the
 * native markdown renderer is a Fabric module that would make the whole component
 * dev-client-only. Default is plain RNR Text, with the streamed-half-token repair that
 * keeps `**bold` from flashing literal asterisks mid-stream.
 *
 * NO CONTROLLED `open` PROP, a deliberate divergence from the web original: the
 * lifecycle reducer is the component's value and a controlled open would fork the exact
 * logic the tests own. `onOpenChange` still reports every open change (including the
 * automatic ones) for consumers that want to mirror state; `defaultOpen` covers the
 * stay-open case.
 */

type ReasoningContextValue = {
  streaming: boolean;
  open: boolean;
  /** Seconds, or null while streaming / before the first stream. */
  durationSeconds: number | null;
};

const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);

function useReasoning() {
  const ctx = React.useContext(ReasoningContext);
  if (!ctx) throw new Error('Reasoning components must be used within Reasoning');
  return ctx;
}

type ReasoningProps = Omit<ViewProps, 'children'> & {
  isStreaming?: boolean;
  /** Pinned open. Never auto-closes, and suppresses the auto-open timer entirely. */
  defaultOpen?: boolean;
  /** Overrides the tracked duration — for callers who already know it. */
  duration?: number;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Reasoning({
  isStreaming = false,
  defaultOpen = false,
  duration,
  onOpenChange,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [lifecycle, dispatch] = React.useReducer(
    reasoningLifecycleReducer,
    defaultOpen,
    initReasoningLifecycle,
  );
  // null = not yet observed, so mounting with isStreaming=true still opens the trace.
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

  const effectiveDuration = duration ?? lifecycle.durationSeconds;

  return (
    <ReasoningContext.Provider value={{ streaming: isStreaming, open: lifecycle.open, durationSeconds: effectiveDuration }}>
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
    </ReasoningContext.Provider>
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

function ReasoningTrigger({ className }: { className?: string }) {
  const { streaming, open, durationSeconds } = useReasoning();

  return (
    <CollapsibleTrigger
      accessibilityState={{ busy: streaming, expanded: open }}
      className={cn(
        'flex-row items-center gap-2 rounded-md py-1.5 active:bg-accent',
        className,
      )}
    >
      <Icon
        as={BrainIcon}
        size={14}
        className={cn(streaming ? 'text-foreground' : 'text-muted-foreground')}
      />
      <Badge variant="secondary" accessibilityLiveRegion="polite">
        <Text className="text-xs">{reasoningLabel({ streaming, durationSeconds })}</Text>
      </Badge>
      <View className="flex-1" />
      <Chevron open={open} />
    </CollapsibleTrigger>
  );
}

export type RenderMarkdown = (markdown: string) => React.ReactNode;

type ReasoningContentProps = {
  /** The reasoning trace, as a (possibly half-streamed) markdown string. */
  children: string;
  /** Inject a markdown renderer. Omit it and the body renders as plain Text. */
  renderMarkdown?: RenderMarkdown;
  /** Repair a half-streamed token mid-stream. On by default, as in message. */
  parseIncompleteMarkdown?: boolean;
  className?: string;
};

function ReasoningContent({
  children,
  renderMarkdown,
  parseIncompleteMarkdown = true,
  className,
}: ReasoningContentProps) {
  const text = React.useMemo(
    () => (parseIncompleteMarkdown ? repairIncompleteMarkdown(children) : children),
    [children, parseIncompleteMarkdown],
  );

  return (
    <CollapsibleContent className={cn('pb-1', className)}>
      {renderMarkdown ? (
        renderMarkdown(text)
      ) : (
        <Text className="text-sm leading-5 text-muted-foreground">{text}</Text>
      )}
    </CollapsibleContent>
  );
}

export { Reasoning, ReasoningContent, ReasoningTrigger, useReasoning };
