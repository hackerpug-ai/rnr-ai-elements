import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  CircleSlashIcon,
  CircleXIcon,
  ChevronDownIcon,
  ClockIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import {
  formatToolInput,
  toolDisplayName,
  toolStatusMeta,
  type ToolStatus,
  type ToolStatusIconName,
} from './tool.logic';

/**
 * Tool — the tool-call card. Name, status badge, and a disclosure with the arguments
 * and the result. It is the primary reason a chat UI reads as an agent.
 *
 * COMPOSITION IS THE WEB ORIGINAL'S: Tool > ToolHeader (state → badge) + ToolContent >
 * (ToolInput + ToolOutput). `state` sits on the HEADER exactly where the web original
 * puts it, so a consumer streams `part.state` straight in — no adapter — and a state
 * change swaps the badge in place without reflowing the transcript (UC-AGENT-01 AC-1).
 * The status map itself is pure data in tool.logic.ts, covering EVERY AI SDK tool-part
 * state; no state renders nothing.
 *
 * THE COLLAPSIBLE IS UNSTYLED at the primitive layer, so the disclosure look is
 * invented here and kept minimal: `rounded-md border` with NO shadow — the tool card is
 * an inset panel, which is exactly the shape law the design contract encodes. The
 * chevron rotates with the house motion scale (250ms open / 200ms close) chained to
 * ReduceMotion.System; the Running badge's clock pulses on RNR Skeleton's own
 * 1000ms signature and is gated on useReducedMotion — one of the looping animations the
 * design lens explicitly calls out, and the one place this registry is stricter than
 * RNR's own Skeleton.
 *
 * INPUTS RENDER WHILE STILL STREAMING. During input-streaming the arguments are a
 * half-arrived string; formatToolInput displays them verbatim and never throws, so a
 * malformed partial never crashes the transcript. Long lines SCROLL horizontally — raw
 * JSON never wraps on a phone.
 *
 * Both output and errorText undefined renders EMPTY — not a spinner, not an error. The
 * web original's documented contract, preserved.
 */

type ToolContextValue = { open: boolean };

const ToolContext = React.createContext<ToolContextValue | null>(null);

function useTool() {
  const ctx = React.useContext(ToolContext);
  if (!ctx) throw new Error('Tool sub-components must be used within <Tool>');
  return ctx;
}

type ToolProps = Omit<ViewProps, 'children'> & {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Tool({ defaultOpen = false, onOpenChange, className, children, ...props }: ToolProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <ToolContext.Provider value={{ open }}>
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        className={cn('rounded-md border border-border bg-muted/50', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </ToolContext.Provider>
  );
}

/** iconName (from tool.logic.ts) → Lucide component. Static and exhaustive by type. */
const STATUS_ICONS: Record<ToolStatusIconName, LucideIcon> = {
  circle: CircleIcon,
  clock: ClockIcon,
  'circle-check': CircleCheckIcon,
  'circle-x': CircleXIcon,
  'circle-slash': CircleSlashIcon,
  'circle-help': CircleHelpIcon,
};

/**
 * The status icon. For the running state it pulses on RNR Skeleton's signature
 * (1→0.5, 1000ms, reversed repeat) — and stands perfectly still when the OS asks for
 * reduced motion, which changes nothing visually when the setting is off.
 */
function ToolStatusIcon({ state }: { state: ToolStatus }) {
  const meta = toolStatusMeta(state);
  const reduced = useReducedMotion();
  const looping = state === 'input-available';
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (!looping || reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [looping, reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <Icon as={STATUS_ICONS[meta.iconName]} size={12} className={cn(meta.className)} />
    </Animated.View>
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

type ToolHeaderProps = {
  /** The AI SDK part type — `tool-fetch_weather_data` or `dynamic-tool`. */
  type: string;
  /** The AI SDK tool-part `state`, streamed straight in. */
  state: ToolStatus;
  /** Wins over everything derived from `type`. */
  title?: string;
  /** A dynamic tool's label comes from here. */
  toolName?: string;
  className?: string;
};

function ToolHeader({ type, state, title, toolName, className }: ToolHeaderProps) {
  const { open } = useTool();
  const meta = toolStatusMeta(state);

  return (
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-2 rounded-md p-3 active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-accent/50' }),
        className,
      )}
    >
      <Text numberOfLines={1} className="flex-1 text-sm font-medium text-foreground">
        {toolDisplayName(type, title, toolName)}
      </Text>
      <Badge
        variant="outline"
        // Color is never the sole channel — the label and icon carry status for a
        // screen reader, and the badge is a legitimate live region: it changes at human
        // pace (a few times per tool call), unlike streaming text.
        accessibilityLabel={`Status: ${meta.label}`}
        accessibilityLiveRegion="polite"
        className="gap-1"
      >
        <ToolStatusIcon state={state} />
        <Text className={cn('text-xs', meta.className)}>{meta.label}</Text>
      </Badge>
      <Chevron open={open} />
    </CollapsibleTrigger>
  );
}

function ToolContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  // The design contract publishes the popover text family here; it must arrive through
  // TextClassContext — a parent className never reaches a descendant Text on native.
  return (
    <TextClassContext.Provider value="text-foreground">
      <CollapsibleContent className={cn('px-3 pb-3', className)} {...props}>
        <View className="gap-2">{children}</View>
      </CollapsibleContent>
    </TextClassContext.Provider>
  );
}

function ToolSectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </Text>
  );
}

type ToolInputProps = {
  input?: unknown;
  className?: string;
};

function ToolInput({ input, className }: ToolInputProps) {
  const text = React.useMemo(() => formatToolInput(input), [input]);
  // Nothing has arrived yet — render nothing rather than an empty Parameters shell.
  if (!text) return null;

  return (
    <View className={cn('gap-1', className)}>
      <ToolSectionLabel>Parameters</ToolSectionLabel>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="py-0.5"
      >
        <Text selectable style={monoStyle} className="text-xs leading-5 text-foreground">
          {text}
        </Text>
      </ScrollView>
    </View>
  );
}

type ToolOutputProps = {
  output?: React.ReactNode;
  errorText?: string;
  className?: string;
};

function ToolOutput({ output, errorText, className }: ToolOutputProps) {
  // The web original's contract, verbatim: both undefined renders EMPTY. Not a
  // spinner, not an error — a tool call may legitimately have no result to show.
  if (output === undefined && errorText === undefined) return null;

  return (
    <View className={cn('gap-1', className)}>
      {errorText !== undefined ? (
        <View className="gap-1">
          <ToolSectionLabel>Error</ToolSectionLabel>
          <Text selectable className="text-xs leading-5 text-destructive">
            {errorText}
          </Text>
        </View>
      ) : (
        <View className="gap-1">
          <ToolSectionLabel>Result</ToolSectionLabel>
          {/* A bare string inside a View crashes React Native ("Text strings must be
              rendered within a <Text> component") while typechecking as a valid
              ReactNode and passing web Storybook — the device gate's exact blind spot.
              Mirror ToolInput: strings get a selectable Text; nodes pass through. */}
          {typeof output === 'string' ? (
            <Text selectable className="text-xs leading-5 text-foreground">
              {output}
            </Text>
          ) : (
            output
          )}
        </View>
      )}
    </View>
  );
}

export { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput, useTool };
