import { Avatar, AvatarFallback, AvatarImage } from '@/registry/{engine}/components/ui/avatar';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { repairIncompleteMarkdown } from '@/registry/{engine}/lib/markdown';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Message — one turn in the transcript.
 *
 * THE PROP IS `from`, NOT `role`. The web original uses `from={message.role}` and getting
 * this wrong is documented as the single most common port error, so it is preserved
 * verbatim rather than "improved".
 *
 * User messages get a contained bubble on `bg-primary` and reverse the row; assistant
 * messages render full-width and unbubbled — the web original's layout, unchanged.
 *
 * MARKDOWN IS INJECTED, NOT BUNDLED. `MessageResponse` takes `renderMarkdown` and defaults
 * to plain RNR Text. That ~3-line seam is load-bearing: the native markdown renderer
 * (react-native-enriched-markdown) is a Fabric module absent from Expo 57's bundled list,
 * so hard-binding it here would make the entire chat shell dev-client-only. With the seam,
 * the core stays Expo Go-clean and markdown is an opt-in registry item.
 */

type MessageRole = 'user' | 'assistant' | 'system';

const MessageContext = React.createContext<{ from: MessageRole }>({ from: 'assistant' });
const useMessage = () => React.useContext(MessageContext);

type MessageProps = ViewProps & { from: MessageRole };

function Message({ from, className, ...props }: MessageProps) {
  return (
    <MessageContext.Provider value={{ from }}>
      <View
        className={cn(
          'w-full flex-row items-end gap-2',
          from === 'user' ? 'flex-row-reverse' : 'flex-row',
          className,
        )}
        {...props}
      />
    </MessageContext.Provider>
  );
}

function MessageAvatar({
  source,
  fallback,
  className,
}: { source?: string; fallback: string; className?: string }) {
  return (
    <Avatar alt={fallback} className={cn('size-8', className)}>
      {source ? <AvatarImage source={{ uri: source }} /> : null}
      <AvatarFallback>
        <Text className="text-xs">{fallback}</Text>
      </AvatarFallback>
    </Avatar>
  );
}

type MessageContentProps = ViewProps & { variant?: 'contained' | 'flat' };

function MessageContent({ className, variant, ...props }: MessageContentProps) {
  const { from } = useMessage();
  // The web default: user is contained, assistant is flat and full-width.
  const contained = variant ? variant === 'contained' : from === 'user';
  return (
    <TextClassContext.Provider
      value={contained && from === 'user' ? 'text-primary-foreground' : 'text-foreground'}
    >
      <View
        className={cn(
          'max-w-[85%] gap-2',
          contained && 'rounded-xl px-3 py-2',
          contained && from === 'user' && 'bg-primary',
          contained && from !== 'user' && 'bg-muted',
          !contained && 'max-w-full flex-1',
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export type RenderMarkdown = (markdown: string) => React.ReactNode;

type MessageResponseProps = {
  children: string;
  /**
   * Inject a markdown renderer. Omit it and the body renders as plain Text, which is why
   * the core has no native-module dependency.
   */
  renderMarkdown?: RenderMarkdown;
  /**
   * Repair a half-streamed token so `**bold` does not flash literal asterisks mid-stream.
   * Removing this is the documented regression — every streamed message flickers raw syntax.
   */
  parseIncompleteMarkdown?: boolean;
  className?: string;
};

function MessageResponse({
  children,
  renderMarkdown,
  parseIncompleteMarkdown = true,
  className,
}: MessageResponseProps) {
  const text = React.useMemo(
    () => (parseIncompleteMarkdown ? repairIncompleteMarkdown(children) : children),
    [children, parseIncompleteMarkdown],
  );
  if (renderMarkdown) return <>{renderMarkdown(text)}</>;
  return <Text className={cn('text-base', className)}>{text}</Text>;
}

/**
 * Actions are ALWAYS VISIBLE. The web original reveals them on hover, which on touch
 * renders identically at rest and is simply unreachable.
 */
function MessageActions({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-xs text-muted-foreground">
      <View className={cn('flex-row items-center gap-1 pt-1', className)} {...props} />
    </TextClassContext.Provider>
  );
}

export {
  Message,
  MessageActions,
  MessageAvatar,
  MessageContent,
  MessageResponse,
  useMessage,
};
