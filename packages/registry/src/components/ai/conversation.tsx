import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { cn } from '@/registry/{engine}/lib/utils';
import { ArrowDownIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  View,
  type FlatListProps,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Conversation — the transcript scroller.
 *
 * The single highest-risk component in the port. The web original is `use-stick-to-bottom`
 * over a non-virtualized div: ResizeObserver plus scrollHeight arithmetic, and it renders
 * every message because the DOM tolerates that. Neither survives.
 *
 * VIRTUALIZED FROM DAY ONE. The prior RN port shipped a ScrollView + .map() wearing
 * FlatList's prop signature — it passes review, passes a demo, and only degrades once real
 * users accumulate history. This is a FlatList.
 *
 * `inverted` is what makes stick-to-bottom free: the list renders bottom-up, so new items
 * arrive at the visual bottom with no scroll arithmetic at all, and a two-message
 * conversation sits at the bottom of the viewport rather than the top — the behaviour the
 * web original works to reproduce. `maintainVisibleContentPosition` is what stops the view
 * jumping when items are prepended mid-stream.
 *
 * STICKINESS RELEASES THE MOMENT THE USER SCROLLS UP, and is never taken back
 * automatically — the web original's rule, and the one that matters: yanking a reader back
 * down mid-token is worse than no auto-scroll.
 *
 * Deliberately GENERIC over T. It is not bound to UIMessage, so it works with the AI SDK,
 * a hand-rolled hook, or a raw SSE reader.
 */

type ConversationProps<T> = Omit<FlatListProps<T>, 'inverted' | 'data'> & {
  data: readonly T[];
  /** px from the bottom still counted as "at the bottom". Web original uses 50. */
  nearBottomThreshold?: number;
  /** Wrap in KeyboardAvoidingView. The web component has nothing to copy here. */
  avoidKeyboard?: boolean;
  contentClassName?: string;
};

type ConversationContextValue = { isAtBottom: boolean; scrollToBottom: () => void };
const ConversationContext = React.createContext<ConversationContextValue | null>(null);

function useConversation() {
  const ctx = React.useContext(ConversationContext);
  if (!ctx) throw new Error('Conversation sub-components must be used within <Conversation>');
  return ctx;
}

function Conversation<T>({
  data,
  nearBottomThreshold = 50,
  avoidKeyboard = true,
  className,
  contentClassName,
  onScroll,
  children,
  ...props
}: ConversationProps<T> & { children?: React.ReactNode }) {
  const listRef = React.useRef<FlatList<T>>(null);
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const insets = useSafeAreaInsets();

  // Inverted: offset 0 IS the bottom. No scrollHeight arithmetic.
  const handleScroll = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setIsAtBottom(e.nativeEvent.contentOffset.y <= nearBottomThreshold);
      onScroll?.(e);
    },
    [nearBottomThreshold, onScroll],
  );

  const scrollToBottom = React.useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  // Inverted lists take data newest-first.
  const inverted = React.useMemo(() => [...data].reverse(), [data]);

  const list = (
    <FlatList
      ref={listRef}
      inverted
      data={inverted}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: nearBottomThreshold }}
      className={cn('flex-1', className)}
      contentContainerClassName={cn('gap-3 px-4', contentClassName)}
      contentContainerStyle={{ paddingTop: insets.bottom, paddingBottom: insets.top }}
      {...props}
    />
  );

  return (
    <ConversationContext.Provider value={{ isAtBottom, scrollToBottom }}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {list}
          {children}
        </KeyboardAvoidingView>
      ) : (
        <>
          {list}
          {children}
        </>
      )}
    </ConversationContext.Provider>
  );
}

/** Renders ONLY while not at the bottom — the web original's rule. */
function ConversationScrollButton({ className }: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useConversation();
  if (isAtBottom) return null;
  return (
    <View className={cn('absolute bottom-4 self-center', className)} pointerEvents="box-none">
      <Button
        size="icon"
        variant="outline"
        className="rounded-full"
        onPress={() => {
          Keyboard.dismiss();
          scrollToBottom();
        }}
        accessibilityLabel="Scroll to latest message"
        hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      >
        <Icon as={ArrowDownIcon} size={18} />
      </Button>
    </View>
  );
}

export { Conversation, ConversationScrollButton, useConversation };
