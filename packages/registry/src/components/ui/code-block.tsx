import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import * as Clipboard from 'expo-clipboard';
import { CheckIcon, CopyIcon } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';

/**
 * CodeBlock — fenced code with an optional filename header, line numbers and copy.
 *
 * Behaviours preserved from the web original:
 *  - long lines SCROLL horizontally; they never wrap
 *  - copy flips to a check for ~2000ms then reverts (`timeout`)
 *  - copy failure calls `onError` rather than silently doing nothing
 *  - the line-number gutter is non-selectable
 *  - an unknown language degrades to plain monospace instead of erroring
 *
 * MVP is UNHIGHLIGHTED. Shiki emits themed HTML that has no React Native equivalent, and
 * its palette is inline hex that answers to no theme — the web original is already a
 * foreign surface there. The block's CHROME is 100% RNR (bg-muted, border-border,
 * rounded-md), and highlighting arrives later as a prop-supplied token map, never as
 * `@theme` entries.
 */

type CodeBlockContextValue = { code: string; language?: string };
const CodeBlockContext = React.createContext<CodeBlockContextValue | null>(null);

function useCodeBlock() {
  const ctx = React.useContext(CodeBlockContext);
  if (!ctx) throw new Error('CodeBlock sub-components must be used within <CodeBlock>');
  return ctx;
}

type CodeBlockProps = ViewProps & { code: string; language?: string };

function CodeBlock({ code, language, className, children, ...props }: CodeBlockProps) {
  return (
    <CodeBlockContext.Provider value={{ code, language }}>
      <View
        className={cn('overflow-hidden rounded-md border border-border bg-muted', className)}
        {...props}
      >
        {children}
      </View>
    </CodeBlockContext.Provider>
  );
}

function CodeBlockHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-row items-center justify-between gap-2 border-b border-border px-3 py-2', className)}
      {...props}
    />
  );
}

function CodeBlockFilename({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      numberOfLines={1}
      style={monoStyle}
      className={cn('flex-1 text-xs text-muted-foreground', className)}
      {...props}
    />
  );
}

function CodeBlockActions({ className, ...props }: ViewProps) {
  return <View className={cn('shrink-0 flex-row items-center gap-1', className)} {...props} />;
}

type CopyButtonProps = {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

function CodeBlockCopyButton({ timeout = 2000, onCopy, onError, className }: CopyButtonProps) {
  const { code } = useCodeBlock();
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
      size="icon"
      variant="ghost"
      onPress={copy}
      className={className}
      accessibilityLabel={copied ? 'Copied' : 'Copy code'}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={16} className="text-muted-foreground" />
    </Button>
  );
}

function CodeBlockContent({ showLineNumbers = false, className }: { showLineNumbers?: boolean; className?: string }) {
  const { code } = useCodeBlock();
  const lines = React.useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);
  const gutterWidth = String(lines.length).length;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // Long lines scroll; they do not wrap. Nested inside the vertical transcript
      // scroller this is a different axis, so the two do not fight.
      contentContainerClassName={cn('p-3', className)}
    >
      <View className="flex-row">
        {showLineNumbers ? (
          <View className="mr-3 items-end">
            {lines.map((_, i) => (
              <Text
                key={`ln-${i}`}
                selectable={false}
                style={monoStyle}
                className="text-xs leading-5 text-muted-foreground/60"
              >
                {String(i + 1).padStart(gutterWidth, ' ')}
              </Text>
            ))}
          </View>
        ) : null}
        <View>
          {lines.map((line, i) => (
            <Text key={`l-${i}`} selectable style={monoStyle} className="text-xs leading-5 text-foreground">
              {line || ' '}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  useCodeBlock,
};
