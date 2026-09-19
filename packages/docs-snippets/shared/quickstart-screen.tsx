import { Conversation, ConversationScrollButton } from '@/components/ai/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai/prompt-input';
import * as React from 'react';
import { View } from 'react-native';

import { SEED_MESSAGES, type SeedMessage } from './quickstart-messages';

/**
 * The single quickstart seed-data chat screen — the compressed tutorial's named end
 * state: a scrolling transcript over the finite seed, with a working composer that
 * appends local user turns only.
 *
 * Engine-agnostic on purpose: every import resolves through the consumer's `@/` alias
 * into the installed registry components, so the same bytes compile in both the
 * nativewind and uniwind consumers. It never imports an engine wrapper, never calls a
 * model, and never fabricates an assistant reply — the transcript is seed data plus
 * exactly the turns the learner submits.
 */
export function QuickstartScreen() {
  const [messages, setMessages] = React.useState<readonly SeedMessage[]>(SEED_MESSAGES);
  const [composerHeight, setComposerHeight] = React.useState(0);

  const handleSubmit = React.useCallback((message: PromptInputMessage) => {
    // Append exactly one local user turn. PromptInput already trims the text and only
    // invokes onSubmit with a non-empty value, and it clears the composer on success,
    // so this callback only ever records the message it is handed.
    setMessages((prev) => [
      ...prev,
      { id: `user-${prev.length + 1}`, from: 'user', text: message.text },
    ]);
  }, []);

  return (
    <View className="flex-1 bg-background">
      <Conversation
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Message from={item.from}>
            <MessageContent>
              {/* Default MessageResponse: plain RNR Text, no markdown renderer, so the
                  core stays Expo Go-clean with no native markdown dependency. */}
              <MessageResponse>{item.text}</MessageResponse>
            </MessageContent>
          </Message>
        )}
      >
        {/* The scroll button stays inside Conversation's context and is lifted above the
            measured composer by the wrapper below — never a static bottom offset that
            could land on the input as it grows. */}
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', left: 0, right: 0, bottom: composerHeight + 12 }}
        >
          <ConversationScrollButton className="bottom-0" />
        </View>
        <PromptInput
          onSubmit={handleSubmit}
          onLayout={(event) => setComposerHeight(event.nativeEvent.layout.height)}
        >
          <PromptInputBody>
            <PromptInputTextarea />
            <PromptInputFooter>
              <PromptInputSubmit />
            </PromptInputFooter>
          </PromptInputBody>
        </PromptInput>
      </Conversation>
    </View>
  );
}
