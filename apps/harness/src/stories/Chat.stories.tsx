import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { CodeBlock, CodeBlockActions, CodeBlockContent, CodeBlockCopyButton, CodeBlockFilename, CodeBlockHeader } from '@/components/ui/code-block';
import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from '@/components/ui/empty';
import { Text } from '@/components/ui/text';
import { Conversation, ConversationScrollButton } from '@/components/ai/conversation';
import { Message, MessageAvatar, MessageContent, MessageResponse } from '@/components/ai/message';
import {
  type ChatStatus,
  type PickerKind,
  type PromptInputMessage,
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputPrimary,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputToolsMenu,
  PromptInputToolsMenuItem,
  PromptInputToolsMenuTrigger,
  usePromptInputAttachments,
} from '@/components/ai/prompt-input';
import {
  ModelSelector,
  ModelSelectorTrigger,
  type ModelSelectorModel,
} from '@/components/ai/model-selector';
import { SpeechInput } from '@/components/ai/speech-input';
import { Suggestion, Suggestions } from '@/components/ai/suggestion';
import { CameraIcon, FolderOpenIcon, GlobeIcon, ImageIcon, MessageSquareIcon } from 'lucide-react-native';

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

const COMPOSER_MODELS: ModelSelectorModel[] = [
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
];

/**
 * The composed composer — header attachment display, footer tools row, status submit.
 * onSubmit receives the whole PromptInputMessage, so attachments ride along; the
 * appended text names them, which keeps the message contract visible on device.
 *
 * The EVOLVED default pose: `+` is the one rest entry point (web-search checkmark +
 * Camera/Photos/Files through the picker seam), the model chip sits in-row, and the
 * primary slot morphs voice circle → send → stop. Voice is SpeechInput with no
 * engine wired: disabled, never fake-listening. Toggle state (web search) is
 * consumer-owned — this story owns it the way a chat route would.
 */
function ChatComposer({
  onSubmit,
  status = 'ready',
  onStop,
}: {
  onSubmit: (message: PromptInputMessage) => void | Promise<void>;
  status?: ChatStatus;
  onStop?: () => void;
}) {
  return (
    <PromptInput onSubmit={onSubmit} status={status} onStop={onStop}>
      <PromptInputHeader>
        <PromptInputAttachments />
      </PromptInputHeader>
      <ChatComposerField />
    </PromptInput>
  );
}

/** Inside the PromptInput tree so the menu rows reach the picker seam. */
function ChatComposerField() {
  const { openPicker } = usePromptInputAttachments();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const [model, setModel] = useState<string | undefined>(COMPOSER_MODELS[0].id);
  return (
    <PromptInputBody>
      <PromptInputTextarea />
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputToolsMenuTrigger onPress={() => setToolsOpen(true)} expanded={toolsOpen} />
          <ModelSelector models={COMPOSER_MODELS} value={model} onValueChange={setModel}>
            <ModelSelectorTrigger size="sm" className="rounded-full" />
          </ModelSelector>
        </PromptInputTools>
        <PromptInputPrimary renderVoice={() => <SpeechInput className="p-0" />} />
        <PromptInputToolsMenu open={toolsOpen} onOpenChange={setToolsOpen}>
          <PromptInputToolsMenuItem
            icon={GlobeIcon}
            label="Web search"
            selected={webSearch}
            onPress={() => setWebSearch((v) => !v)}
          />
          <PromptInputToolsMenuItem
            icon={CameraIcon}
            label="Camera"
            onPress={() => openPicker('camera' satisfies PickerKind)}
          />
          <PromptInputToolsMenuItem
            icon={ImageIcon}
            label="Photos"
            onPress={() => openPicker('media')}
          />
          <PromptInputToolsMenuItem
            icon={FolderOpenIcon}
            label="Files"
            onPress={() => openPicker('file')}
          />
        </PromptInputToolsMenu>
      </PromptInputFooter>
    </PromptInputBody>
  );
}

export const Populated: Story = {
  render: () => {
    const [messages, setMessages] = useState<Msg[]>(SEED);
    const send = useCallback((message: PromptInputMessage) => {
      const names = message.files.map((f) => f.filename);
      const text = names.length > 0 ? `${message.text}\n[${names.join(', ')}]` : message.text;
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
        <ChatComposer onSubmit={send} />
      </View>
    );
  },
};

/** Empty state + suggestions — what a first-run user actually sees. */
export const FirstRun: Story = {
  render: () => {
    const [messages, setMessages] = useState<Msg[]>([]);
    const send = useCallback((message: PromptInputMessage) => {
      setMessages((m) => [
        ...m,
        { id: String(Date.now()), role: 'user', text: message.text },
      ]);
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
              <Suggestion key={s} suggestion={s} onPress={(text) => send({ text, files: [] })} />
            ))}
          </Suggestions>
        </View>
        <ChatComposer onSubmit={send} />
      </View>
    );
  },
};

/**
 * A rejected onSubmit must LEAVE EVERYTHING INTACT — text and attachments — the rule
 * that protects the user. (The composer board's SubmitFailureKeepsAttachments pose
 * shows the same contract with chips seeded; here it runs bare, as the minimum chat.)
 */
export const SubmitFailureKeepsText: Story = {
  render: () => (
    <View className="flex-1 justify-end -m-4">
      <View className="px-4 pb-2">
        <Text variant="muted">
          Type something and send. The handler rejects, so your text stays in the field.
        </Text>
      </View>
      <ChatComposer
        onSubmit={async () => {
          throw new Error('network');
        }}
      />
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
      <ChatComposer status="streaming" onStop={() => {}} onSubmit={() => {}} />
    </View>
  ),
};
