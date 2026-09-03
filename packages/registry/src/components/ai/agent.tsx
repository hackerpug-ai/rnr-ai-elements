import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Card } from '@/registry/{engine}/components/ui/card';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  CircleCheckIcon,
  CircleIcon,
  CirclePauseIcon,
  CircleXIcon,
  LoaderCircleIcon,
  PauseIcon,
  PlayIcon,
  SquareIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Persona } from './persona';
import {
  agentRunMeta,
  enabledRunActions,
  AGENT_RUN_ACTIONS,
  type AgentRunAction,
  type AgentRunIconName,
  type AgentRunStatus,
} from './agent.logic';

/**
 * Agent — the identity/run surface.
 *
 * COMPOSITION IS THE POINT: the header is the existing `persona` molecule — avatar,
 * name, description — never re-implemented, plus a run-state badge whose tones come from
 * lib/status.ts, the ONE status map. The web original's Agent is a configuration card
 * (instructions, tools, output schema); the PRD's porting verdict narrows `agent` to an
 * identity card, and UC-AGENT-05 AC-4 adds what the web card never had: start / pause /
 * stop controls in thumb reach. The config body (instructions markdown, the tools
 * accordion, the output schema) is deferred, not dropped — instructions is a markdown
 * surface (message.tsx's injected-renderer seam), and the schema belongs to
 * schema-display's own wave; this organism composes the identity and the run.
 *
 * THE RUN IS THE CALLER'S. Like every queue and answer in this registry (speech-input
 * precedent), the component holds no run state: `runStatus` is controlled,
 * `onRunAction` reports the verb, and the component never advances a run by itself.
 * With no `onRunAction` wired the control bar does not render at all — a dead row of
 * buttons teaches nothing.
 *
 * The Running badge's loader pulses on RNR Skeleton's own 1000ms signature and is gated
 * on useReducedMotion, exactly as tool.tsx's clock — the one looping animation this
 * surface carries. Impossible controls DISABLE rather than vanish (see
 * enabledRunActions in agent.logic.ts).
 */

type AgentContextValue = {
  runStatus: AgentRunStatus;
  /** Present only when the consumer wired onRunAction. */
  fire?: (action: AgentRunAction) => void;
};

const AgentContext = React.createContext<AgentContextValue | null>(null);

function useAgent() {
  const ctx = React.useContext(AgentContext);
  if (!ctx) throw new Error('Agent sub-components must be used within <Agent>');
  return ctx;
}

type AgentProps = Omit<ViewProps, 'children'> & {
  /** Controlled run state. The caller owns the run — this only mirrors it. */
  runStatus?: AgentRunStatus;
  /** Fires on Start / Pause / Stop. Omit it and the control bar never renders. */
  onRunAction?: (action: AgentRunAction) => void;
  children?: React.ReactNode;
};

function Agent({ runStatus = 'idle', onRunAction, className, children, ...props }: AgentProps) {
  const fire = React.useCallback(
    (action: AgentRunAction) => {
      onRunAction?.(action);
    },
    [onRunAction],
  );

  return (
    <AgentContext.Provider value={{ runStatus, fire: onRunAction ? fire : undefined }}>
      <Card className={cn('gap-3 p-3', className)} {...props}>
        {children}
      </Card>
    </AgentContext.Provider>
  );
}

/** iconName (from agent.logic.ts) → Lucide component. Static and exhaustive by type. */
const RUN_ICONS: Record<AgentRunIconName, LucideIcon> = {
  circle: CircleIcon,
  'loader-circle': LoaderCircleIcon,
  'circle-pause': CirclePauseIcon,
  'circle-x': CircleXIcon,
  'circle-check': CircleCheckIcon,
};

/**
 * The run badge. For the running state the loader pulses on RNR Skeleton's signature
 * (1→0.5, 1000ms, reversed repeat) and stands perfectly still under reduced motion —
 * tool.tsx's clock, reused as a pattern, not forked into a second tempo.
 */
function RunBadge({ runStatus }: { runStatus: AgentRunStatus }) {
  const meta = agentRunMeta(runStatus);
  const reduced = useReducedMotion();
  const looping = runStatus === 'running';
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
    <Badge
      variant="outline"
      accessibilityLabel={`Run status: ${meta.label}`}
      accessibilityLiveRegion="polite"
      className="shrink-0 gap-1"
    >
      <Animated.View style={style}>
        <Icon as={RUN_ICONS[meta.iconName]} size={12} className={cn(meta.className)} />
      </Animated.View>
      <Text className={cn('text-xs', meta.className)}>{meta.label}</Text>
    </Badge>
  );
}

type AgentHeaderProps = {
  /** Passed straight to the Persona molecule — never re-implemented here. */
  name: string;
  description?: string;
  avatarUri?: string;
  className?: string;
};

function AgentHeader({ name, description, avatarUri, className }: AgentHeaderProps) {
  const { runStatus } = useAgent();

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      {/* flex-1 + min-w-0 let the name truncate while the badge keeps its shape. */}
      <Persona name={name} description={description} avatarUri={avatarUri} className="min-w-0 flex-1" />
      <RunBadge runStatus={runStatus} />
    </View>
  );
}

/** The identity card's body slot — reasoning, tools, artifacts, whatever the run shows. */
function AgentContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('gap-2', className)} {...props}>
      {children}
    </View>
  );
}

/** The control bar's verb → row entry. Static table; order is the thumb's reading order. */
const ACTION_BUTTONS: Record<
  AgentRunAction,
  { label: string; icon: LucideIcon; variant: 'default' | 'outline' | 'ghost' }
> = {
  start: { label: 'Start', icon: PlayIcon, variant: 'default' },
  pause: { label: 'Pause', icon: PauseIcon, variant: 'outline' },
  stop: { label: 'Stop', icon: SquareIcon, variant: 'ghost' },
};

/**
 * The thumb-reachable control bar (UC-AGENT-05 AC-4). Renders only when a handler is
 * wired; impossible verbs are disabled in place — a control that disappears
 * mid-press is worse than one that refuses the press.
 */
function AgentActions({ className }: { className?: string }) {
  const { runStatus, fire } = useAgent();
  if (!fire) return null;

  const enabled = enabledRunActions(runStatus);

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      {AGENT_RUN_ACTIONS.map((action) => {
        const button = ACTION_BUTTONS[action];
        // From paused, the verb semantically resumes — same 'start' action the run
        // machine speaks, the label the user hears (M8).
        const label =
          action === 'start' && runStatus === 'paused' ? 'Resume' : button.label;
        const isEnabled = enabled.includes(action);
        return (
          <Button
            key={action}
            variant={button.variant}
            disabled={!isEnabled}
            onPress={() => fire(action)}
            accessibilityLabel={`${label} the run`}
            accessibilityState={{ disabled: !isEnabled }}
            className="flex-1"
          >
            <Icon as={button.icon} size={14} />
            <Text>{label}</Text>
          </Button>
        );
      })}
    </View>
  );
}

export { Agent, AgentActions, AgentContent, AgentHeader, useAgent };
