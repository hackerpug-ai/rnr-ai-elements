import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/{engine}/components/ui/popover';
import { Progress } from '@/registry/{engine}/components/ui/progress';
import { Text } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import { PieChartIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  contextUsedPercent,
  formatContextPercent,
  formatContextRatio,
  formatContextTokens,
  usageRowVisible,
  type ContextUsage,
} from './context.logic';

/**
 * Context — the context-window budget chip (what the web original shows as a
 * hover-card trigger reading "62.5%" beside the composer).
 *
 * THE PRD VERDICT IS PORT-ADAPTED, PURE-RNR: "Token and cost breakdown is revealed on
 * hover in the web version. On touch it becomes a press-opened popover; the data
 * displayed is unchanged." The web composition maps 1:1 onto RNR's popover —
 * Context wraps Popover exactly as it wraps HoverCard, ContextTrigger wraps
 * PopoverTrigger, ContextContent renders PopoverContent:
 *
 *   <Context usedTokens={…} maxTokens={…} usage={…}>
 *     <ContextTrigger />
 *     <ContextContent insets={contentInsets}>
 *       <ContextContentHeader />
 *       <ContextContentBody>
 *         <ContextInputUsage /> <ContextOutputUsage />
 *         <ContextReasoningUsage /> <ContextCacheUsage />
 *       </ContextContentBody>
 *       <ContextContentFooter costText="…?" />
 *     </ContextContent>
 *   </Context>
 *
 * ContextContent takes the RNR popover content props — insets FIRST among them
 * (anchored content hides under the notch/nav bar without them; the consumer's
 * per-screen contentInsets ritual applies, as with every popover in the house).
 *
 * COST IS INJECTED, NOT COMPUTED. The web prices tokens with `tokenlens`, a model
 * pricing database this registry does not depend on. Every cost surface takes a
 * caller-formatted string instead (the renderMarkdown seam precedent): row
 * `costText` and footer `costText`. An unsupplied cost renders "—" — the web
 * original's own unknown-marker — never "$0.00", which would be a lie.
 *
 * THE RING GLYPH IS A DECLARED SUBSTITUTION. The web trigger draws an SVG
 * stroke-dashoffset progress ring; a raw react-native-svg element cannot receive
 * className without engine-specific cssInterop, which the styling contract forbids in
 * registry source, and an unthemeable stroke would fail the palette-flip proof. The
 * trigger ships the themed PieChartIcon instead — same at-a-glance "portion of whole"
 * semantics, tokens intact. The PRECISE bar is ContextContentHeader's RNR Progress,
 * which is theme-reachable.
 *
 * Two upstream behaviors preserved verbatim: the provider THROW
 * ("Context components must be used within Context"), and the zero-token rows
 * rendering nothing (usageRowVisible) — a breakdown never shows "Input 0".
 */

type ContextSchema = {
  usedTokens: number;
  maxTokens: number;
  usage?: ContextUsage;
  modelId?: string;
};

const ContextContext = React.createContext<ContextSchema | null>(null);

function useContextValue(): ContextSchema {
  const ctx = React.useContext(ContextContext);
  if (!ctx) throw new Error('Context components must be used within Context');
  return ctx;
}

type ContextProps = ContextSchema & {
  children?: React.ReactNode;
};

function Context({ usedTokens, maxTokens, usage, modelId, children }: ContextProps) {
  const contextValue = React.useMemo<ContextSchema>(
    () => ({ usedTokens, maxTokens, usage, modelId }),
    [usedTokens, maxTokens, usage, modelId],
  );

  return (
    <ContextContext.Provider value={contextValue}>
      <Popover>{children}</Popover>
    </ContextContext.Provider>
  );
}

type ContextTriggerProps = {
  /** Overrides the default percent + gauge button (web: children on the trigger). */
  children?: React.ReactNode;
  className?: string;
};

function ContextTrigger({ children, className }: ContextTriggerProps) {
  const { usedTokens, maxTokens } = useContextValue();

  return (
    <PopoverTrigger asChild>
      {children ?? (
        <Button
          variant="ghost"
          accessibilityLabel={`Model context usage, ${formatContextPercent(usedTokens, maxTokens)}`}
          className={cn('gap-1.5', className)}
        >
          <Text className="font-medium text-muted-foreground">
            {formatContextPercent(usedTokens, maxTokens)}
          </Text>
          <Icon as={PieChartIcon} size={20} className="text-muted-foreground" />
        </Button>
      )}
    </PopoverTrigger>
  );
}

type ContextContentProps = React.ComponentProps<typeof PopoverContent> & {
  children?: React.ReactNode;
};

/**
 * The press-opened breakdown. PopoverContent props flow through — insets, align,
 * sideOffset, portalHost — because the safe-area ritual belongs to the caller's
 * screen, not to this file.
 */
function ContextContent({ className, children, ...props }: ContextContentProps) {
  return (
    <PopoverContent className={cn('w-60 gap-0 p-0', className)} {...props}>
      {children}
    </PopoverContent>
  );
}

type ContextContentHeaderProps = ViewProps & { children?: React.ReactNode };

/** Percentage, compact "used / total" in mono, and the progress bar. */
function ContextContentHeader({ className, children, ...props }: ContextContentHeaderProps) {
  const { usedTokens, maxTokens } = useContextValue();
  const usedPercent = contextUsedPercent(usedTokens, maxTokens);

  return (
    <View className={cn('w-full gap-2 border-b border-border p-3', className)} {...props}>
      {children ?? (
        <>
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-xs">{formatContextPercent(usedTokens, maxTokens)}</Text>
            <Text style={monoStyle} className="text-xs text-muted-foreground">
              {formatContextRatio(usedTokens, maxTokens)}
            </Text>
          </View>
          <Progress value={usedPercent * 100} className="bg-muted" />
        </>
      )}
    </View>
  );
}

type ContextContentBodyProps = ViewProps & { children?: React.ReactNode };

function ContextContentBody({ className, children, ...props }: ContextContentBodyProps) {
  return (
    <View className={cn('w-full gap-2 p-3', className)} {...props}>
      {children}
    </View>
  );
}

type ContextContentFooterProps = ViewProps & {
  /** Caller-priced total (see header note — tokenlens is not a dependency). */
  costText?: string;
  children?: React.ReactNode;
};

/**
 * The total row on the secondary surface. The web original prints "$0.00" when it
 * cannot price; that is a lie on a port with no pricing data, so an unsupplied cost
 * renders the web original's own unknown-marker, "—".
 */
function ContextContentFooter({ costText, className, children, ...props }: ContextContentFooterProps) {
  return (
    <View
      className={cn(
        'flex-row w-full items-center justify-between gap-3 bg-secondary p-3',
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <Text className="text-xs text-muted-foreground">Total cost</Text>
          <Text className="text-xs">{costText ?? '—'}</Text>
        </>
      )}
    </View>
  );
}

type ContextUsageRowProps = ViewProps & {
  /** Caller-priced cost for this slice — "• $0.0042" when supplied. */
  costText?: string;
  children?: React.ReactNode;
};

/**
 * One usage slice: label left, compact tokens (+ optional injected cost) right.
 * Children replace the token readout exactly as upstream allows; a zero or missing
 * count renders NOTHING (upstream trap parity).
 */
function ContextUsageRow({
  label,
  tokens,
  costText,
  className,
  children,
  ...props
}: ContextUsageRowProps & { label: string; tokens: number | undefined }) {
  if (children) {
    return (
      <View className={cn('flex-row items-center justify-between', className)} {...props}>
        {children}
      </View>
    );
  }
  if (!usageRowVisible(tokens)) return null;

  return (
    <View className={cn('flex-row items-center justify-between', className)} {...props}>
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-xs">
        {formatContextTokens(tokens as number)}
        {costText ? (
          <Text className="text-xs text-muted-foreground"> • {costText}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function ContextInputUsage(props: ContextUsageRowProps) {
  const { usage } = useContextValue();
  return <ContextUsageRow label="Input" tokens={usage?.inputTokens} {...props} />;
}

function ContextOutputUsage(props: ContextUsageRowProps) {
  const { usage } = useContextValue();
  return <ContextUsageRow label="Output" tokens={usage?.outputTokens} {...props} />;
}

function ContextReasoningUsage(props: ContextUsageRowProps) {
  const { usage } = useContextValue();
  return <ContextUsageRow label="Reasoning" tokens={usage?.reasoningTokens} {...props} />;
}

function ContextCacheUsage(props: ContextUsageRowProps) {
  const { usage } = useContextValue();
  return <ContextUsageRow label="Cache" tokens={usage?.cachedInputTokens} {...props} />;
}

export {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
};
export type { ContextUsage };
