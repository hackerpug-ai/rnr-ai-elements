import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFilename, CodeBlockHeader } from '@/components/ui/code-block';
import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from '@/components/ui/empty';
import { Text } from '@/components/ui/text';
import { Conversation, ConversationScrollButton } from '@/components/ai/conversation';
import { Message, MessageAvatar, MessageContent, MessageResponse } from '@/components/ai/message';
import { PromptInput } from '@/components/ai/prompt-input';
import { Suggestion, Suggestions } from '@/components/ai/suggestion';
import { MessageSquareIcon } from 'lucide-react-native';

/**
 * The minimum chat — conversation + message + prompt-input + code-block composed into the
 * surface they exist for. This is the arc the PRD's mvp-full-arc journey describes.
 *
 * NOTE: prose here is deliberately plain. MessageResponse's markdown renderer is INJECTED
 * (`renderMarkdown`) and defaults to plain Text, which is what keeps the core Expo Go-clean
 * — the native markdown module is a Fabric package absent from Expo 57's bundled list. The
 * renderer ships as its own opt-in registry item; see MarkdownSeam below for the contract.
 */
const meta = { title: 'AI Elements/Chat' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Msg = { id: string; role: 'user' | 'assistant'; text: string; code?: { file: string; body: string } };

const SEED: Msg[] = [
  { id: '1', role: 'user', text: 'How do I pin the transcript to the bottom while streaming?' },
  {
    id: '2',
    role: 'assistant',
    text: 'Use an inverted FlatList. Offset 0 becomes the bottom, so new items arrive there with no scroll arithmetic, and maintainVisibleContentPosition stops the view jumping.',
    code: {
      file: 'conversation.tsx',
      body: '<FlatList\n  inverted\n  data={[...data].reverse()}\n  maintainVisibleContentPosition={{\n    minIndexForVisible: 0,\n  }}\n/>',
    },
  },
];

function Row({ item }: { item: Msg }) {
  return (
    <Message from={item.role}>
      {item.role === 'assistant' ? <MessageAvatar fallback="AI" /> : null}
      <MessageContent>
        <MessageResponse>{item.text}</MessageResponse>
        {item.code ? (
          <CodeBlock code={item.code.body} language="tsx">
            <CodeBlockHeader>
              <CodeBlockFilename>{item.code.file}</CodeBlockFilename>
              <CodeBlockActions>
                <CodeBlockCopyButton />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent showLineNumbers />
          </CodeBlock>
        ) : null}
      </MessageContent>
    </Message>
  );
}

export const Populated: Story = {
  render: () => {
    const [messages, setMessages] = useState<Msg[]>(SEED);
    const send = useCallback((text: string) => {
      setMessages((m) => [...m, { id: String(Date.now()), role: 'user', text }]);
    }, []);
    return (
      <View className="flex-1 -m-4">
        <Conversation
          data={messages}
          keyExtractor={(m: Msg) => m.id}
          renderItem={({ item }: { item: Msg }) => <Row item={item} />}
        >
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={send} />
      </View>
    );
  },
};

/** Empty state + suggestions — what a first-run user actually sees. */
export const FirstRun: Story = {
  render: () => {
    const [messages, setMessages] = useState<Msg[]>([]);
    const send = useCallback((text: string) => {
      setMessages((m) => [...m, { id: String(Date.now()), role: 'user', text }]);
    }, []);
    return (
      <View className="flex-1 -m-4">
        {messages.length === 0 ? (
          <Empty>
            <EmptyIcon as={MessageSquareIcon} />
            <EmptyTitle>Ask anything</EmptyTitle>
            <EmptyDescription>Pick a suggestion or type a message below.</EmptyDescription>
          </Empty>
        ) : (
          <Conversation
            data={messages}
            keyExtractor={(m: Msg) => m.id}
            renderItem={({ item }: { item: Msg }) => <Row item={item} />}
          >
            <ConversationScrollButton />
          </Conversation>
        )}
        <View className="px-4">
          <Suggestions>
            {['Summarise this thread', 'Explain the error', 'Write a test'].map((s) => (
              <Suggestion key={s} suggestion={s} onPress={send} />
            ))}
          </Suggestions>
        </View>
        <PromptInput onSubmit={send} />
      </View>
    );
  },
};

/** A rejected onSubmit must LEAVE THE TEXT INTACT — the rule that protects the user. */
export const SubmitFailureKeepsText: Story = {
  render: () => (
    <View className="flex-1 justify-end -m-4">
      <View className="px-4 pb-2">
        <Text variant="muted">
          Type something and send. The handler rejects, so your text stays in the field.
        </Text>
      </View>
      <PromptInput onSubmit={async () => { throw new Error('network'); }} />
    </View>
  ),
};

/** The injected-renderer seam, shown explicitly: same component, a renderer supplied. */
export const MarkdownSeam: Story = {
  render: () => (
    <View className="gap-4">
      <Message from="assistant">
        <MessageAvatar fallback="AI" />
        <MessageContent>
          <MessageResponse>{'Default: **bold** stays literal, by design.'}</MessageResponse>
        </MessageContent>
      </Message>
      <Message from="assistant">
        <MessageAvatar fallback="AI" />
        <MessageContent>
          <MessageResponse
            renderMarkdown={(md) => (
              <Text className="text-base">
                {md.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
                  part.startsWith('**') ? (
                    <Text key={i} className="font-semibold">
                      {part.slice(2, -2)}
                    </Text>
                  ) : (
                    part
                  ),
                )}
              </Text>
            )}
          >
            {'Injected: **bold** is rendered by the supplied renderer.'}
          </MessageResponse>
        </MessageContent>
      </Message>
    </View>
  ),
};

export const Streaming: Story = {
  render: () => (
    <View className="flex-1 justify-end -m-4">
      <PromptInput status="streaming" onSubmit={() => {}} onStop={() => {}} />
    </View>
  ),
};
