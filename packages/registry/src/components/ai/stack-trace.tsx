import { Button } from '@/registry/{engine}/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import {
  frameFallbackText,
  frameLocation,
  parseStackTrace,
  type ParsedStackTrace,
  type StackFrame,
} from '@/registry/{engine}/lib/stack-trace';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  TriangleAlertIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';

/**
 * StackTrace — a parsed error trace behind a disclosure (UC-CODE-02 AC-3: each frame's
 * file and line legible at phone width; AC-4: the whole raw trace copies with one tap).
 *
 * THE PRD VERDICT IS PORT-AT-PARITY — "Monospace frame list with expandable frames;
 * needs horizontal scroll but no interaction redesign" — so this file ports the
 * upstream part set one for one: StackTrace root (trace / open / defaultOpen=false /
 * onOpenChange / onFilePathClick), StackTraceHeader, StackTraceError (TriangleAlert +
 * type + message), StackTraceErrorType, StackTraceErrorMessage, StackTraceActions,
 * StackTraceCopyButton (copies the RAW trace — what the runtime printed, not our
 * re-render of it), StackTraceExpandButton, StackTraceContent, StackTraceFrames
 * (showInternalFrames default true; `node:` / `node_modules` / `internal/` frames dim
 * to text-muted-foreground, the nearest reliable equivalent of the upstream's
 * 50% wash — the /NN modifier forms compile with an unresolved base color in this
 * engine (colorMix("unset")) and silently no-op, so the port uses the token class.)
 *
 * THE PARSER LIVES IN lib/stack-trace.ts (registry:lib) — the data-schema contract
 * binds it there, pure and Vitest-owned against real captured traces. This file only
 * renders what it returns and never re-derives a frame.
 *
 * THE EXPAND BUTTON IS AN INDICATOR, NOT A CONTROL — verified against the upstream
 * source: it renders a chevron that rotates 180° with the disclosure and has no press
 * handler of its own. The HEADER opens the trace; the chevron mirrors it. It is
 * replicated here as a non-pressable View with the house rotation (250ms open, 200ms
 * close, ReduceMotion.System), NOT as a second way to toggle.
 *
 * TOUCH/PLATFORM ADAPTATIONS, DECLARED:
 *  - the web wraps Header/Content in their own nested <Collapsible> elements because
 *    the root is a plain div; @rn-primitives/collapsible is context-based, so ONE root
 *    Collapsible here carries the open state and both parts — same behavior, less
 *    nesting;
 *  - the file location is upstream's FilePathButton (disabled <button> without a
 *    handler). On RN it is the file:line:col Text itself with onPress +
 *    accessibilityRole="button" — a leaf press target inside the row Text, muted
 *    underline at rest like the web's dotted underline. Without onFilePathClick there
 *    is no onPress: disabled, never pretend;
 *  - Content's web `maxHeight: 400` inline style becomes the house bounded host
 *    (max-h-64, caller-overridable via className — terminal precedent) plus a
 *    horizontal ScrollView, because the verdict demands frames scroll RIGHT rather
 *    than wrap or truncate. Different axes, so the two do not fight (code-block
 *    precedent), and the column wrapper between them is the wave-12 flattening law.
 */

type StackTraceContextValue = {
  trace: ParsedStackTrace;
  /** The verbatim input — what StackTraceCopyButton hands the clipboard. */
  raw: string;
  isOpen: boolean;
  onFilePathClick?: (filePath: string, line?: number, col?: number) => void;
};

const StackTraceContext = React.createContext<StackTraceContextValue | null>(null);

function useStackTrace() {
  const ctx = React.useContext(StackTraceContext);
  if (!ctx) throw new Error('StackTrace components must be used within StackTrace');
  return ctx;
}

export type StackTraceProps = Omit<ViewProps, 'children'> & {
  /** The raw stack trace string, exactly as the runtime printed it. */
  trace: string;
  /** Controlled open state (uncontrolled unless provided). The web default: closed. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Fired by a frame's file:line:col press. Absent → locations render unpressable. */
  onFilePathClick?: (filePath: string, line?: number, col?: number) => void;
  children?: React.ReactNode;
};

function StackTrace({
  trace,
  open,
  defaultOpen = false,
  onOpenChange,
  onFilePathClick,
  className,
  children,
  ...props
}: StackTraceProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  function handleOpenChange(next: boolean) {
    if (open === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }

  const parsed = React.useMemo(() => parseStackTrace(trace), [trace]);
  const contextValue = React.useMemo<StackTraceContextValue>(
    () => ({ trace: parsed, raw: trace, isOpen, onFilePathClick }),
    [parsed, trace, isOpen, onFilePathClick],
  );

  return (
    <StackTraceContext.Provider value={contextValue}>
      <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
        <View
          className={cn('overflow-hidden rounded-lg border border-border bg-background', className)}
          {...props}
        >
          {children}
        </View>
      </Collapsible>
    </StackTraceContext.Provider>
  );
}

/**
 * The disclosure trigger. The whole header is the press target (upstream: a full-width
 * div inside the CollapsibleTrigger), with the native active twin standing in for the
 * web's hover wash.
 */
function StackTraceHeader({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  const { isOpen } = useStackTrace();

  return (
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-3 p-3 text-left active:bg-muted/50',
        Platform.select({ web: 'transition-colors hover:bg-muted/50' }),
        className,
      )}
      {...props}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">{children}</View>
      {/* The expand chevron is upstream's SECOND header affordance (StackTraceExpandButton
          in the actions row); on a phone it reads better beside the error it mirrors. */}
      <StackTraceExpandButton open={isOpen} />
    </CollapsibleTrigger>
  );
}

/**
 * The error line's container: the destructive alert mark, then type + message.
 * Inside the header trigger, so pressing it toggles the trace.
 */
function StackTraceError({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('min-w-0 flex-1 flex-row items-center gap-2', className)} {...props}>
      <Icon as={TriangleAlertIcon} size={16} className="shrink-0 text-destructive" />
      {children}
    </View>
  );
}

/** Parsed error type ("TypeError"). `children` overrides, exactly as the web allows. */
function StackTraceErrorType({ children, className }: { children?: string; className?: string }) {
  const { trace } = useStackTrace();
  const label = children ?? trace.errorType;
  if (label === undefined || label === null) return null;

  return (
    <Text numberOfLines={1} className={cn('shrink-0 font-semibold text-destructive', className)}>
      {label}
    </Text>
  );
}

/** Parsed error message. `children` overrides. */
function StackTraceErrorMessage({ children, className }: { children?: string; className?: string }) {
  const { trace } = useStackTrace();
  const label = children ?? trace.errorMessage;
  if (label === undefined || label === null) return null;

  return (
    <Text numberOfLines={1} className={cn('min-w-0 flex-1 text-foreground', className)}>
      {label}
    </Text>
  );
}

/**
 * Trailing controls. RN's responder system gives the press to the deepest touchable —
 * the copy button never toggles the disclosure, which is what the web's
 * stopPropagation wrapper was for (commit.tsx precedent).
 */
function StackTraceActions({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props}>{children}</View>;
}

type StackTraceCopyButtonProps = {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

/** AC-4's one-tap copy: the RAW trace, unmodified — flip-and-revert per the house form. */
function StackTraceCopyButton({ timeout = 2000, onCopy, onError, className }: StackTraceCopyButtonProps) {
  const { raw } = useStackTrace();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await Clipboard.setStringAsync(raw);
      setCopied(true);
      onCopy?.();
      timer.current = setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      // Never silent — the web original calls onError and so do we.
      onError?.(error);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={copy}
      accessibilityLabel={copied ? 'Copied' : 'Copy stack trace'}
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={className}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

/**
 * The upstream expand control, replicated exactly: a NON-interactive chevron that
 * rotates with the disclosure. It lives in StackTraceHeader here (see the header
 * note); exported for callers composing their own header row.
 */
function StackTraceExpandButton({ open, className }: { open: boolean; className?: string }) {
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
    <Animated.View style={style} className={className}>
      <Icon as={ChevronDownIcon} size={14} className="shrink-0 text-muted-foreground" />
    </Animated.View>
  );
}

/**
 * The frames: vertical outer as the bounded host (max-h-64 default — upstream's 400px
 * inline bound, on the house scale, caller-overridable), horizontal inner carrying
 * long frames and deep paths RIGHT. The column wrapper between them is the wave-12
 * flattening law: a horizontal ScrollView is a ROW container.
 */
function StackTraceContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent
      className={cn('border-t border-border bg-muted/50', className)}
      {...props}
    >
      <ScrollView className="max-h-64" nestedScrollEnabled>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="min-w-full">
          {/* Column wrapper — wave-12's E1: without it every frame lays out side by side. */}
          <View className="flex-col">{children ?? <StackTraceFrames />}</View>
        </ScrollView>
      </ScrollView>
    </CollapsibleContent>
  );
}

type StackTraceFramesProps = {
  /** Upstream default: true — internal frames render DIMMED, not hidden. */
  showInternalFrames?: boolean;
  className?: string;
};

/**
 * The frame list, from the parsed context. Internal frames (`node:`, `node_modules`,
 * `internal/`) dim to text-muted-foreground when shown and vanish when
 * showInternalFrames is false — the upstream trap, verbatim. Without onFilePathClick
 * the file:line:col renders as plain text: a location you cannot open must not look
 * pressable.
 */
function StackTraceFrames({ showInternalFrames = true, className }: StackTraceFramesProps) {
  const { trace, onFilePathClick } = useStackTrace();
  const frames = showInternalFrames ? trace.frames : trace.frames.filter((f) => !f.isInternal);

  if (frames.length === 0) {
    return (
      <Text style={monoStyle} className={cn('p-3 text-xs text-muted-foreground', className)}>
        No stack frames
      </Text>
    );
  }

  return (
    <View className={cn('gap-1 p-3', className)}>
      {frames.map((frame) => (
        <FrameRow key={frame.raw} frame={frame} onFilePathClick={onFilePathClick} />
      ))}
    </View>
  );
}

function FrameRow({ frame, onFilePathClick }: { frame: StackFrame; onFilePathClick?: StackTraceContextValue['onFilePathClick'] }) {
  const location = frameLocation(frame);
  const { file, line, col } = frame;
  // Internal frames dim to the muted token (the upstream's 50% wash does not survive
  // this engine's modifier compilation; the token class is the reliable equivalent).
  // Every segment carries the class EXPLICITLY — nested-Text color inheritance proved
  // unreliable under the mono inline style, and a dimmed line must not depend on it.
  const rowClass = frame.isInternal ? 'text-muted-foreground' : 'text-foreground';

  return (
    <Text style={monoStyle} className={cn('text-xs', rowClass)}>
      <Text style={monoStyle} className={rowClass}>at </Text>
      {frame.fn ? (
        <Text style={monoStyle} className={rowClass}>
          {frame.fn}{' '}
        </Text>
      ) : null}
      {location ? (
        <>
          <Text style={monoStyle} className={rowClass}>(</Text>
          <Text
            // The upstream FilePathButton as a leaf Text press target: no handler →
            // no onPress and no button role. Disabled, never pretend.
            onPress={onFilePathClick && file ? () => onFilePathClick(file, line, col) : undefined}
            accessibilityRole={onFilePathClick ? 'button' : undefined}
            accessibilityLabel={onFilePathClick ? `Open ${location}` : undefined}
            className={cn(
              rowClass,
              'underline',
              onFilePathClick && Platform.select({ web: 'hover:text-primary' }),
            )}
          >
            {location}
          </Text>
          <Text style={monoStyle} className={rowClass}>)</Text>
        </>
      ) : (
        <Text style={monoStyle} className={rowClass}>
          {frameFallbackText(frame.raw)}
        </Text>
      )}
    </Text>
  );
}

export {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceExpandButton,
  StackTraceFrames,
  StackTraceHeader,
  useStackTrace,
};
