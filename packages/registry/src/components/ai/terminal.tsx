import { Shimmer } from '@/registry/{engine}/components/ai/shimmer';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import * as Clipboard from 'expo-clipboard';
import { CheckIcon, CopyIcon, Trash2Icon } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { parseAnsiLines, stripAnsi } from './terminal.logic';

/**
 * Terminal — a read-only log surface for run output (UC-CODE-02 AC-1: monospace output
 * that scrolls horizontally without wrapping and vertically without dropping frames;
 * AC-4: any run output block copies with one tap).
 *
 * THE PRD VERDICT IS PORT-ADAPTED and its line is the constitution of this file: "ships
 * as a read-only, horizontally scrollable monospace log view with ANSI colors mapped to
 * theme tokens. An interactive pseudo-terminal is explicitly not part of this." There is
 * no stdin, no prompt, no PTY — the caller hands a string, the component renders it.
 *
 * THE UPSTREAM PART SET, from the KB, ported part for part: Terminal root (output /
 * isStreaming=false / autoScroll=true / onClear), TerminalHeader (TerminalTitle +
 * TerminalStatus), TerminalActions (TerminalClearButton + TerminalCopyButton), and
 * TerminalContent. The web renders `output` through ansi-to-react with hardcoded hex;
 * the ANSI half is replaced by the pure SGR tokenizer in terminal.logic.ts (Vitest-
 * owned) whose color map compresses onto the house palette — RNR roles plus the three
 * sanctioned status colors, no fourth color anywhere. The DOM half is replaced by
 * nested axis-scrolled ScrollViews: the vertical outer is a bounded host (max-h-64 by
 * default, caller-overridable) and the horizontal inner carries the unwrapped line
 * tails — different axes, so the two do not fight (code-block precedent).
 *
 * BEHAVIOR PRESERVED FROM THE WEB ORIGINAL:
 *  - autoScroll sticks to the bottom on every content change while on; off never moves
 *    the viewport (the web's boolean contract, nothing smarter is invented)
 *  - isStreaming shows the house shimmer pulse ("Running…") — the streaming indicator
 *    the KB credits the original with, rendered through our reduced-motion-gated
 *    Shimmer, not a spinner
 *  - TerminalClearButton is ENABLED ONLY when onClear is wired (the KB's documented
 *    gating); TerminalCopyButton copies stripAnsi(output) — escape codes are useless on
 *    a clipboard, so the copy hands over what the eye saw — and flip-and-reverts with
 *    onError on failure (snippet/code-block precedent)
 *  - text is selectable (code-block precedent), line by line
 *
 * NOT SHIPPED, on the record: an interactive pseudo-terminal (the verdict forbids it);
 * xterm.js-style cursor addressing — cursor-movement escapes are stripped by the
 * tokenizer, so progress-bar redraws accumulate as plain lines rather than repainting.
 */

type TerminalContextValue = {
  output: string;
  isStreaming: boolean;
  autoScroll: boolean;
  /** Unwired → the clear button DISABLES, never pretends. */
  canClear: boolean;
  clear: () => void;
};

const TerminalContext = React.createContext<TerminalContextValue | null>(null);

function useTerminal() {
  const ctx = React.useContext(TerminalContext);
  if (!ctx) throw new Error('Terminal sub-components must be used within <Terminal>');
  return ctx;
}

export type TerminalProps = ViewProps & {
  /** The log — ANSI escapes welcome, they tokenize into themed spans. */
  output: string;
  /** Shows the streaming pulse. The caller's stream state; nothing here listens. */
  isStreaming?: boolean;
  /** Stick to the bottom on content changes. The web default: true. */
  autoScroll?: boolean;
  /** Wired → the clear button enables and calls this. Absent → it disables. */
  onClear?: () => void;
  children?: React.ReactNode;
};

function Terminal({
  output,
  isStreaming = false,
  autoScroll = true,
  onClear,
  className,
  children,
  ...props
}: TerminalProps) {
  const contextValue = React.useMemo<TerminalContextValue>(
    () => ({
      output,
      isStreaming,
      autoScroll,
      canClear: Boolean(onClear),
      clear: () => onClear?.(),
    }),
    [output, isStreaming, autoScroll, onClear],
  );

  return (
    <TerminalContext.Provider value={contextValue}>
      <View
        className={cn('overflow-hidden rounded-md border border-border bg-muted', className)}
        {...props}
      >
        {children}
      </View>
    </TerminalContext.Provider>
  );
}

function TerminalHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-row items-center gap-2 border-b border-border px-3 py-2', className)}
      {...props}
    />
  );
}

/** The log's name. House mono, like the code-block filename it sits beside. */
function TerminalTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      numberOfLines={1}
      style={monoStyle}
      className={cn('min-w-0 flex-1 text-xs font-medium text-foreground', className)}
      {...props}
    />
  );
}

/** Free status slot ("exit 0", "pid 4121") — muted so the title leads. Publishes the
 *  muted-xs pair so its Text children style without per-call classes. */
function TerminalStatus({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-xs text-muted-foreground">
      <View className={cn('shrink-0 flex-row items-center', className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  );
}

function TerminalActions({ className, ...props }: ViewProps) {
  return <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />;
}

type TerminalClearButtonProps = {
  className?: string;
};

/**
 * The KB's documented gate: enabled when the Terminal's onClear is set. Clearing is the
 * CALLER's state change (output is caller-owned); this only fires the callback.
 */
function TerminalClearButton({ className }: TerminalClearButtonProps) {
  const { canClear, clear } = useTerminal();

  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={clear}
      disabled={!canClear}
      accessibilityLabel="Clear terminal"
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={className}
    >
      <Icon as={Trash2Icon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

type TerminalCopyButtonProps = {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

/** AC-4's one-tap copy: the WHOLE log, escapes stripped. Flip-and-revert. */
function TerminalCopyButton({ timeout = 2000, onCopy, onError, className }: TerminalCopyButtonProps) {
  const { output } = useTerminal();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await Clipboard.setStringAsync(stripAnsi(output));
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
      accessibilityLabel={copied ? 'Copied' : 'Copy output'}
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={className}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

/**
 * The log itself: vertical outer (bounded host — max-h-64 by default, override with
 * className), horizontal inner carrying unwrapped line tails. Lines are themed span
 * runs from the pure tokenizer; attributes persist across newlines in the tokenizer, so
 * the renderer never decides color. Selectable per line (code-block precedent).
 */
function TerminalContent({ className }: { className?: string }) {
  const { output, isStreaming, autoScroll } = useTerminal();
  const lines = React.useMemo(() => parseAnsiLines(output), [output]);
  const scrollRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (autoScroll) scrollRef.current?.scrollToEnd({ animated: false });
  }, [output, autoScroll]);

  return (
    <ScrollView
      ref={scrollRef}
      className={cn('max-h-64', className)}
      nestedScrollEnabled
      // Bounded-host law: the vertical bound is the component's default; the caller's
      // className replaces it (e.g. max-h-40 in a dense card).
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="min-w-full px-3 py-2"
      >
        {/* A horizontal ScrollView is a ROW container — without this column wrapper
            every log line lays out SIDE BY SIDE on one strip (review E1; code-block's
            CodeBlockContent is the precedent being followed here). */}
        <View className="flex-col">
          {lines.map((spans, lineIndex) => (
            <Text
              key={`line-${lineIndex}`}
              selectable
              style={monoStyle}
              className="text-xs leading-5 text-foreground"
            >
              {spans.map((span, spanIndex) => (
                <Text key={`span-${lineIndex}-${spanIndex}`} style={monoStyle} className={cn(span.classNames)}>
                  {span.text}
                </Text>
              ))}
            </Text>
          ))}
          {isStreaming ? <ShimmerLine /> : null}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

/** The streaming pulse — the house shimmer at log scale, gated on reduced motion. */
function ShimmerLine() {
  return (
    <Shimmer className="text-xs" style={monoStyle}>
      Running…
    </Shimmer>
  );
}

export {
  Terminal,
  TerminalActions,
  TerminalClearButton,
  TerminalContent,
  TerminalCopyButton,
  TerminalHeader,
  TerminalStatus,
  TerminalTitle,
  useTerminal,
};
