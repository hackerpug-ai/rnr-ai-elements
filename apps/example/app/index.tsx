import { isToolUIPart, getToolName, type UIMessage } from 'ai';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai/tool';

import transcript from '../fixtures/transcript.json';

// The committed fixture is consumed as the real ai@7.0.89 UIMessage type — this is the
// boundary where `pnpm exec tsc --noEmit -p apps/example` checks every use below (part
// narrowing, the 7-state ToolStatus union, Message roles) against the SDK's types.
// resolveJsonModule widens the JSON's string literals (role/type/state become `string`),
// so the import itself cannot be assigned directly; the field values are additionally
// pinned by the task's node -e checks and the F8 on-device flow. Static data: no fetch,
// no timer, no provider on this route (the cold-boot gate runs offline).
const messages = transcript.messages as UIMessage[];

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
        <ToolHeader type={part.type} state={part.state} toolName={getToolName(part)} />
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

function MessageView({ message }: { message: UIMessage }) {
  return (
    <Message from={message.role}>
      {message.role === 'assistant' ? <MessageAvatar fallback="AI" /> : null}
      <MessageContent>
        {message.parts.map((part, index) => (
          <PartView key={index} part={part} />
        ))}
      </MessageContent>
    </Message>
  );
}

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 pb-3 pt-2">
        <Text className="text-foreground font-semibold text-lg">AI Elements Example</Text>
      </View>
      <Conversation
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={({ item }) => <MessageView message={item} />}
      >
        <ConversationScrollButton />
      </Conversation>
    </SafeAreaView>
  );
}
