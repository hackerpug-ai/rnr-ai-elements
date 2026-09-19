import { SparklesIcon } from 'lucide-react-native';
import * as React from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Conversation,
  ConversationScrollButton,
} from '@/components/ai/conversation';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputPrimary,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai/prompt-input';
import { Button } from '@/components/ui/button';
import { useLiveChat } from '@/lib/use-live-chat';
import { THEME } from '@/lib/theme';

import { LiveChatMessage } from './live-chat-message';

/**
 * The separate live chat screen — the worked example's real streaming surface.
 *
 * This is the composition layer over ORI-AI-001's `useLiveChat` hook and endpoint.
 * It owns no transport, provider configuration, abort/retry semantics or throttling:
 * every one of those arrives through the hook. The screen only maps hook state onto
 * the installed RNR chat components.
 *
 *   - `Message` receives `from={message.role}` and text parts are narrowed in
 *     live-chat-message.tsx before the string-only `MessageResponse`.
 *   - `PromptInput` submits via the `PromptInputMessage` contract (`msg.text` → the
 *     hook's `sendMessage(text)`), renders its own stop control from `status`, and
 *     clears its own field on the accepted (resolved) submit path.
 *   - The composer is a child of `Conversation`, so it sits inside the installed
 *     keyboard-avoiding subtree — no second wrapper, no second portal host.
 *   - The hook's error state surfaces as an accessible alert with a Retry control;
 *     a non-configured client surfaces its config error instead of the composer.
 */

function ConfigError({ message }: { message: string }) {
  return (
    <View
      accessibilityRole="alert"
      className="flex-1 items-center justify-center gap-2 px-6"
    >
      <Text className="text-foreground text-center text-base">{message}</Text>
    </View>
  );
}

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View
      accessibilityRole="alert"
      className="gap-2 border-t border-destructive/20 bg-destructive/10 px-4 py-3"
    >
      <Text className="text-destructive text-sm">{message}</Text>
      <View className="self-start">
        <Button
          variant="outline"
          size="sm"
          onPress={onRetry}
          accessibilityLabel="Retry"
        >
          <Text>Retry</Text>
        </Button>
      </View>
    </View>
  );
}

// fallow-ignore-next-line complexity
export function LiveChatScreen() {
  const chat = useLiveChat();
  const colorScheme = useColorScheme();
  // useColorScheme returns null before hydration and on no-preference; narrow it
  // before indexing the token map.
  const mode = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: THEME[mode].background }}
    >
      <View className="border-b border-border px-4 pb-3 pt-2">
        <Text className="text-foreground font-semibold text-lg">Live chat</Text>
      </View>

      {!chat.isConfigured ? (
        <ConfigError message={chat.config.error ?? 'Live chat is not configured'} />
      ) : (
        <Conversation
          data={chat.messages}
          keyExtractor={(message) => message.id}
          renderItem={({ item }) => <LiveChatMessage message={item} />}
          emptyState={{
            icon: SparklesIcon,
            title: 'Start a conversation',
            description: 'Send a message to talk to the live model',
          }}
        >
          <ConversationScrollButton />
          {chat.error ? (
            <ErrorBanner message={chat.error.message} onRetry={chat.retry} />
          ) : null}
          <PromptInput
            status={chat.status}
            onStop={chat.stop}
            onSubmit={(message) => chat.sendMessage(message.text)}
          >
            <PromptInputBody>
              <PromptInputTextarea />
              <PromptInputFooter>
                <PromptInputTools />
                <PromptInputPrimary />
              </PromptInputFooter>
            </PromptInputBody>
          </PromptInput>
        </Conversation>
      )}
    </SafeAreaView>
  );
}
