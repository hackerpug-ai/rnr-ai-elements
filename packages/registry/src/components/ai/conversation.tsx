import { Button } from '@/registry/{engine}/components/ui/button';
import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { cn } from '@/registry/{engine}/lib/utils';
import { ArrowDownIcon, type LucideIcon } from 'lucide-react-native';
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
 *
 * DENSITY + EMPTY STATE (remediation row 5, design/style-parity-remediation.md):
 * the content gap converged to the web's `gap-8` (web conversation.tsx:32), matching the
 * port's existing px-4. When the list is empty and the caller passes `emptyState`, the
 * transcript renders the port's own `empty` atom — the surface the web ships as
 * ConversationEmptyState (icon + title + description, same web defaults) — in place of
 * the list. On the web that composition lives at the call site; here it is a minimal
 * prop on the scroller, and omitting the prop keeps the old behavior exactly (an empty
 * list renders nothing). ConversationDownload is DEFERRED per the approved disposition
 * (feature-level share-sheet work, recorded in the remediation table — not a style fix).
 */

type ConversationProps<T> = Omit<FlatListProps<T>, 'inverted' | 'data'> & {
  data: readonly T[];
  /** px from the bottom still counted as "at the bottom". Web original uses 50. */
  nearBottomThreshold?: number;
  /** Wrap in KeyboardAvoidingView. The web component has nothing to copy here. */
  avoidKeyboard?: boolean;
  contentClassName?: string;
  /**
   * Rendered in place of the list when `data` is empty (remediation row 5). Omit for
   * the previous behavior — an empty list renders nothing.
   */
  emptyState?: ConversationEmptyStateProps;
};

/**
 * The web's ConversationEmptyState props, mirrored (web conversation.tsx:37-41):
 * icon + title + description, each optional, with the web's own defaults filled in.
 */
export type ConversationEmptyStateProps = {
  icon?: LucideIcon;
  title?: string;
  description?: string;
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
  emptyState,
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
      // Remediation row 5: gap-3 → gap-8, the web's transcript density
      // (web conversation.tsx:32 `gap-8 p-4`; the port already carries px-4).
      contentContainerClassName={cn('gap-8 px-4', contentClassName)}
      contentContainerStyle={{ paddingTop: insets.bottom, paddingBottom: insets.top }}
      {...props}
    />
  );

  // Remediation row 5: an empty transcript with a declared emptyState shows the
  // `empty` atom INSTEAD of the list — same surface the web composes at the call site.
  const body =
    data.length === 0 && emptyState !== undefined ? (
      <ConversationEmptySurface emptyState={emptyState} />
    ) : (
      list
    );

  return (
    <ConversationContext.Provider value={{ isAtBottom, scrollToBottom }}>
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {body}
          {children}
        </KeyboardAvoidingView>
      ) : (
        <>
          {body}
          {children}
        </>
      )}
    </ConversationContext.Provider>
  );
}

/**
 * The web's ConversationEmptyState surface, composed from the port's own `empty` atom
 * (remediation row 5): icon + title + description, centered — the atom was generalized
 * FROM this very web part. Title/description fall back to the web's defaults when the
 * caller omits them; the icon is opt-in exactly as on the web.
 */
function ConversationEmptySurface({ emptyState }: { emptyState: ConversationEmptyStateProps }) {
  const {
    icon,
    title = 'No messages yet',
    description = 'Start a conversation to see messages here',
  } = emptyState;

  return (
    <Empty>
      {icon ? <EmptyIcon as={icon} /> : null}
      {/* The web title is `font-medium text-sm` — text-sm over the atom's text-base. */}
      <EmptyTitle className="text-sm">{title}</EmptyTitle>
      {description ? <EmptyDescription>{description}</EmptyDescription> : null}
    </Empty>
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
