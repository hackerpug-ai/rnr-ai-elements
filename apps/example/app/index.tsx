import { isToolUIPart, getToolName, type UIMessage } from 'ai';
import { PieChartIcon } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
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
} from '@/components/ai/context';
import {
  Conversation,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageResponse,
} from '@/components/ai/message';
import { PromptInput, PromptInputHeader } from '@/components/ai/prompt-input';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai/tool';
import { Icon } from '@/components/ui/icon';
import { E2E_IDS } from '@/e2e-ids';
import { THEME } from '@/lib/theme';
import { useUniwind } from 'uniwind';

import transcript from '../fixtures/transcript.json';

// The fixture is consumed as the real ai@7.0.89 UIMessage type. resolveJsonModule widens
// the JSON's string literals (role/type/state become `string`), so this cast is required
// and tsc never inspects the fixture's shape — that proof is
// `node apps/example/fixtures/validate.mjs`, which validates the messages against the
// SDK's own uiMessagesSchema (roles, part discriminants, tool-state union). With the
// cast, tsc still checks every use below (part narrowing, isToolUIPart/getToolName
// guards) against the SDK's types. The values themselves are pinned by the task's node
// -e checks and the F8 on-device flow. Static data: no fetch, no timer, no provider on
// this route (the cold-boot gate runs offline).
const seededMessages = transcript.messages as UIMessage[];

/** Tool part output → what ToolOutput renders. Strings pass through; anything
 * else becomes pretty-printed text (RN child safety: never a bare object). */
function toolOutputText(output: unknown): string | undefined {
  if (typeof output === 'string') return output;
  if (output === undefined || output === null) return undefined;
  return JSON.stringify(output, null, 2);
}

function PartView({ part }: { part: UIMessage['parts'][number] }) {
  if (part.type === 'text') {
    return <MessageResponse>{part.text}</MessageResponse>;
  }
  if (isToolUIPart(part)) {
    return (
      <Tool>
        {/* ToolHeader takes no extra props, so the badge's selector rides on this
            app-owned wrapper — the closest reachable node to the status pill without
            touching a CLI-installed file (see e2e-ids.ts). */}
        <View testID={E2E_IDS['tool-badge-completed']}>
          <ToolHeader type={part.type} state={part.state} toolName={getToolName(part)} />
        </View>
        <ToolContent>
          <ToolInput input={part.input} />
          <ToolOutput output={toolOutputText(part.output)} />
        </ToolContent>
      </Tool>
    );
  }
  // The committed fixture carries only text and tool parts.
  return null;
}

function MessageView({
  message,
  isFirstMessage,
}: {
  message: UIMessage;
  isFirstMessage?: boolean;
}) {
  return (
    <Message from={message.role}>
      {message.role === 'assistant' ? <MessageAvatar fallback="AI" /> : null}
      {/* MessageContent spreads ViewProps, so the first bubble carries its selector
          through an existing prop — no wrapper needed. */}
      <MessageContent
        testID={isFirstMessage ? E2E_IDS['transcript-message-0'] : undefined}
      >
        {message.parts.map((part, index) => (
          <PartView key={index} part={part} />
        ))}
      </MessageContent>
    </Message>
  );
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  // Sent messages append locally — the sprint-01 route is fixture-driven and stays
  // zero-network (the cold-boot gate runs offline), so send renders the message in
  // the transcript instead of calling a backend.
  const [sentMessages, setSentMessages] = React.useState<UIMessage[]>([]);
  const messages = React.useMemo(
    () => [...seededMessages, ...sentMessages],
    [sentMessages],
  );

  function sendMessage(text: string) {
    setSentMessages((prev) => [
      ...prev,
      {
        id: `sent-${prev.length + 1}`,
        role: 'user',
        parts: [{ type: 'text', text }],
      },
    ]);
  }

  // Uniwind does NOT interop react-native-safe-area-context's SafeAreaView, so
  // className is silently dropped on it — layout AND background must arrive as a
  // real style. THEME is the JS twin of global.css's --color-background (same RNR
  // token source as lib/theme.ts, which _layout.tsx already consumes this way);
  // nothing here is hardcoded. Without flex:1 the column auto-sizes and the
  // inverted-FlatList Conversation collapses to zero height on device (FIX-F5-1).
  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: THEME[theme ?? 'light'].background }}
    >
      <View
        className="border-b border-border px-4 pb-3 pt-2"
        testID={E2E_IDS['app-header']}
      >
        <Text className="text-foreground font-semibold text-lg">AI Elements Example</Text>
      </View>
      <Conversation
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item, index }) => (
          <MessageView message={item} isFirstMessage={index === 0} />
        )}
      >
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={sendMessage} testID={E2E_IDS['composer-send']}>
        <PromptInputHeader>
          {/* The context chip: tap the trigger, the popover paints through the root
              PortalHost (_layout.tsx) — the PortalHost behavioral proof the sprint's
              flow runs inside the main journey. Zeros are honest here: the fixture
              carries no usage data. side="top" because the trigger sits at the bottom
              of the screen; a bottom-opening popover would render off-screen. */}
          <Context usedTokens={0} maxTokens={0}>
            <ContextTrigger>
              <Pressable
                testID={E2E_IDS['context-trigger']}
                accessibilityLabel="Model context usage"
                accessibilityRole="button"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon as={PieChartIcon} size={20} className="text-muted-foreground" />
              </Pressable>
            </ContextTrigger>
            <ContextContent
              side="top"
              contentInsets={{
                top: insets.top,
                bottom: insets.bottom,
                left: insets.left,
                right: insets.right,
              }}
              testID={E2E_IDS['context-popover-content']}
            >
              <ContextContentHeader />
              <ContextContentBody>
                <ContextInputUsage />
                <ContextOutputUsage />
                <ContextReasoningUsage />
                <ContextCacheUsage />
              </ContextContentBody>
              <ContextContentFooter />
            </ContextContent>
          </Context>
        </PromptInputHeader>
      </PromptInput>
    </SafeAreaView>
  );
}
