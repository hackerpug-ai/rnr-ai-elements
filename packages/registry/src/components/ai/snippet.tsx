import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/registry/{engine}/components/ui/input-group';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { type ViewProps } from 'react-native';

/**
 * Snippet — the small copyable command the assistant hands over ("run this"), the web
 * original composed on its InputGroup. OUR InputGroup is the registered gap atom, so
 * the composition carries over one-for-one — there was never a CodeBlock in the web
 * Snippet's tree to reuse, and its filename chrome would have been duplication anyway:
 * the web Snippet is a compact InputGroup row, not a fenced block.
 *
 * BRIEF CORRECTION, ON THE RECORD: the task's parenthetical named
 * SnippetHeader/SnippetTabs. Neither exists upstream — the current web part set is
 * Snippet/SnippetAddon/SnippetText/SnippetInput/SnippetCopyButton (verified against
 * upstream main and the KB alike). No tabs ship.
 *
 * BEHAVIOR PRESERVED FROM THE WEB ORIGINAL:
 *  - the code lives in one context; SnippetInput reads it and is readOnly — the
 *    command is display text in a selectable field, not editable state
 *  - copy flips to a check for ~2000ms then reverts (`timeout`)
 *  - copy failure calls `onError` rather than silently doing nothing
 *  - the `$` prefix is SnippetAddon/SnippetText composition, not a prop
 *
 * REACT NATIVE NOTES: the monospace family rides lib/mono (the house decision —
 * Tailwind's font-mono stack has no resolvable RN family). A long command neither wraps
 * nor grows the row: the input is single-line and scrolls within its own field, which
 * is the web's overflow behavior with no new machinery.
 */

type SnippetContextValue = { code: string };

const SnippetContext = React.createContext<SnippetContextValue | null>(null);

function useSnippet() {
  const ctx = React.useContext(SnippetContext);
  if (!ctx) throw new Error('Snippet sub-components must be used within <Snippet>');
  return ctx;
}

type SnippetProps = ViewProps & {
  /** The command. The one prop everything else reads. */
  code: string;
  children?: React.ReactNode;
};

function Snippet({ code, className, children, ...props }: SnippetProps) {
  const contextValue = React.useMemo(() => ({ code }), [code]);

  return (
    <SnippetContext.Provider value={contextValue}>
      <InputGroup className={className} {...props}>
        {children}
      </InputGroup>
    </SnippetContext.Provider>
  );
}

/** Leading/trailing addon slot — a `$` prefix, a label. The web passthrough, kept. */
function SnippetAddon({ className, ...props }: ViewProps) {
  return <InputGroupAddon className={className} {...props} />;
}

/** Static text inside the row — the `$` prefix's type. Web's classes, house mono. */
function SnippetText({ className, style, ...props }: React.ComponentProps<typeof InputGroupText>) {
  return <InputGroupText className={cn('font-normal', className)} style={[monoStyle, style]} {...props} />;
}

/** The command, readOnly and selectable. Value comes from the context, never the caller. */
function SnippetInput({ className, style, ...props }: Omit<React.ComponentProps<typeof InputGroupInput>, 'value' | 'readOnly'>) {
  const { code } = useSnippet();

  return (
    <InputGroupInput
      // Keyboard-proofing: the field is display text — no autocorrect crawl over a
      // command, no soft-key suggestions over a copyable string.
      autoCapitalize="none"
      autoCorrect={false}
      readOnly
      value={code}
      className={cn('text-sm text-foreground', className)}
      style={[monoStyle, style]}
      {...props}
    />
  );
}

type SnippetCopyButtonProps = {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

function SnippetCopyButton({ timeout = 2000, onCopy, onError, className }: SnippetCopyButtonProps) {
  const { code } = useSnippet();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await Clipboard.setStringAsync(code);
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
      accessibilityLabel={copied ? 'Copied' : 'Copy'}
      // House formula (confirmation.tsx): RNR's h-10 (40pt) + hitSlop 2/side = the 44pt
      // platform minimum, with no pixel of extra chrome.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={className}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

export { Snippet, SnippetAddon, SnippetCopyButton, SnippetInput, SnippetText, useSnippet };
