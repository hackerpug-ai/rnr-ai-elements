/**
 * Seeded matrix cells — chat-core surfaces. The strings here are what a
 * stranger literally reads in the gallery: real paths, plausible model ids,
 * an actual assistant answer about this codebase. Never placeholder text.
 */
import type { UIMessage } from 'ai';
import * as React from 'react';
import { Text } from 'react-native';

import {
  Checkpoint,
  CheckpointIcon,
} from '@/components/ai/checkpoint';
import { Conversation } from '@/components/ai/conversation';
import { InlineCitationChip } from '@/components/ai/inline-citation';
import { Message } from '@/components/ai/message';
import { PromptInput } from '@/components/ai/prompt-input';
import { Reasoning, ReasoningContent } from '@/components/ai/reasoning';
import { Shimmer } from '@/components/ai/shimmer';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai/sources';
import { Suggestions } from '@/components/ai/suggestion';
import { TaskContent, TaskItem, TaskTrigger, Task as TaskList } from '@/components/ai/task';
import { Tool, ToolContent, ToolHeader } from '@/components/ai/tool';
import transcript from '../../fixtures/transcript.json';
import type { ItemCells } from '../cells';

/** The sprint-01 fixture — a real install conversation, reused verbatim. */
const FIXTURE_MESSAGES = (transcript as { messages: UIMessage[] }).messages;

const USER_MSG: UIMessage = {
  id: 'gallery-user-1',
  role: 'user',
  parts: [{ type: 'text', text: 'Install the conversation item into this app.' }],
};

export const AI_CHAT_CELLS: Record<string, ItemCells> = {
  conversation: {
    populated: () => <Conversation data={FIXTURE_MESSAGES} />,
    empty: () => <Conversation data={[]} />,
    loading: () => (
      <Conversation
        data={[
          USER_MSG,
          {
            id: 'gallery-assistant-1',
            role: 'assistant',
            parts: [{ type: 'text', text: 'Resolving registry items for' }],
          },
        ]}
      />
    ),
    error: () => (
      <Conversation
        data={[
          USER_MSG,
          {
            id: 'gallery-assistant-1',
            role: 'assistant',
            parts: [
              { type: 'text', text: 'The install failed: registry item not found at v0.2.0.' },
            ],
          },
        ]}
      />
    ),
  },
  message: {
    populated: (o) => (
      <Message from={(o.from as 'user' | 'assistant') ?? 'assistant'}>
        <Text className="text-sm text-foreground">
          The 56-item set installs through the real RNR CLI at Expo 57 pins.
        </Text>
      </Message>
    ),
    empty: (o) => (
      <Message from={(o.from as 'user' | 'assistant') ?? 'user'}>
        <Text className="text-sm text-foreground">(nothing sent yet)</Text>
      </Message>
    ),
    loading: (o) => (
      <Message from={(o.from as 'user' | 'assistant') ?? 'assistant'}>
        <Shimmer active>
          <Text className="text-sm">Resolving registry dependencies…</Text>
        </Shimmer>
      </Message>
    ),
    error: (o) => (
      <Message from={(o.from as 'user' | 'assistant') ?? 'assistant'}>
        <Text className="text-sm text-destructive">
          Stream interrupted: the provider connection dropped mid-generation.
        </Text>
      </Message>
    ),
  },
  'prompt-input': {
    populated: (o) => (
      <PromptInput
        onSubmit={() => {}}
        status={(o.status as 'ready' | 'submitted' | 'streaming' | 'error') ?? 'ready'}
        placeholder="Ask about the registry…"
      />
    ),
    empty: () => <PromptInput onSubmit={() => {}} placeholder="" />,
    loading: (o) => (
      <PromptInput
        onSubmit={() => {}}
        status={(o.status as 'ready' | 'submitted' | 'streaming' | 'error') ?? 'streaming'}
        placeholder="Generating…"
      />
    ),
    error: (o) => (
      <PromptInput
        onSubmit={() => {}}
        status={(o.status as 'ready' | 'submitted' | 'streaming' | 'error') ?? 'error'}
        placeholder="Retry the failed turn…"
      />
    ),
  },
  suggestion: {
    populated: () => (
      <Suggestions>
        <Text className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
          Install the full 56-item set
        </Text>
        <Text className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
          Show the engine parity proof
        </Text>
        <Text className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
          Why does terminal stay dark in light mode?
        </Text>
      </Suggestions>
    ),
    empty: () => <Suggestions />,
    loading: () => (
      <Suggestions>
        <Shimmer active>
          <Text className="px-3 py-1.5 text-sm">Loading suggestions…</Text>
        </Shimmer>
      </Suggestions>
    ),
    error: () => (
      <Suggestions>
        <Text className="rounded-full border border-destructive/50 px-3 py-1.5 text-sm text-destructive">
          Suggestion fetch failed
        </Text>
      </Suggestions>
    ),
  },
  reasoning: {
    populated: (o) => (
      <Reasoning
        isStreaming={o.isStreaming === true}
        defaultOpen={o.defaultOpen === true}
        duration={4200}
      >
        <ReasoningContent>
          <Text className="text-sm text-muted-foreground">
            The consumer installs from raw GitHub at the v0.2.0 tag, so the registry URLs must pin the release, not main.
          </Text>
        </ReasoningContent>
      </Reasoning>
    ),
    empty: () => (
      <Reasoning duration={0}>
        <ReasoningContent>
          <Text className="text-sm text-muted-foreground">(no reasoning supplied)</Text>
        </ReasoningContent>
      </Reasoning>
    ),
    loading: () => (
      <Reasoning isStreaming defaultOpen>
        <ReasoningContent>
          <Shimmer active>
            <Text className="text-sm">Thinking through the install graph…</Text>
          </Shimmer>
        </ReasoningContent>
      </Reasoning>
    ),
    error: () => (
      <Reasoning defaultOpen duration={1200}>
        <ReasoningContent>
          <Text className="text-sm text-destructive">
            Reasoning trace truncated — the stream dropped before the closing tag.
          </Text>
        </ReasoningContent>
      </Reasoning>
    ),
  },
  task: {
    populated: (o) => (
      <TaskList>
        <TaskTrigger />
        <TaskContent>
          <TaskItem status={(o.status as 'completed') ?? 'completed'}>
            <Text className="text-sm text-foreground">Install 56 items via the RNR CLI</Text>
          </TaskItem>
          <TaskItem status="running">
            <Text className="text-sm text-foreground">Verify the Expo Go dependency graph</Text>
          </TaskItem>
          <TaskItem status="pending">
            <Text className="text-sm text-foreground">Cut the v0.2.0 release tag</Text>
          </TaskItem>
          <TaskItem status="failed">
            <Text className="text-sm text-foreground">Boot the gallery on a physical device</Text>
          </TaskItem>
        </TaskContent>
      </TaskList>
    ),
    empty: () => (
      <TaskList>
        <TaskTrigger />
        <TaskContent>
          <TaskItem>
            <Text className="text-sm text-muted-foreground">(no steps yet)</Text>
          </TaskItem>
        </TaskContent>
      </TaskList>
    ),
    loading: () => (
      <TaskList>
        <TaskTrigger />
        <TaskContent>
          <TaskItem status="running">
            <Shimmer active>
              <Text className="text-sm">Resolving registry item graph…</Text>
            </Shimmer>
          </TaskItem>
        </TaskContent>
      </TaskList>
    ),
    error: () => (
      <TaskList>
        <TaskTrigger />
        <TaskContent>
          <TaskItem status="failed">
            <Text className="text-sm text-destructive">
              CLI install aborted: registry item not found at the pinned tag
            </Text>
          </TaskItem>
        </TaskContent>
      </TaskList>
    ),
  },
  tool: {
    populated: (o) => (
      <Tool>
        <ToolHeader
          type={(o.type as string) ?? 'tool-fetch_registry_item'}
          state={(o.state as 'input-streaming' | 'input-available' | 'output-available' | 'output-error') ?? 'output-available'}
        />
        <ToolContent>
          <Text className="text-sm text-muted-foreground">
            {'{ "item": "conversation", "engine": "uniwind", "tag": "v0.2.0" }'}
          </Text>
        </ToolContent>
      </Tool>
    ),
    empty: () => (
      <Tool>
        <ToolHeader type="dynamic-tool" state="input-streaming" />
      </Tool>
    ),
    loading: () => (
      <Tool>
        <ToolHeader type="tool-install_item_set" state="input-available" />
        <ToolContent>
          <Shimmer active>
            <Text className="text-sm">Installing 56 items…</Text>
          </Shimmer>
        </ToolContent>
      </Tool>
    ),
    error: () => (
      <Tool>
        <ToolHeader type="tool-fetch_registry_item" state="output-error" />
        <ToolContent>
          <Text className="text-sm text-destructive">404 — item not found at v0.2.0</Text>
        </ToolContent>
      </Tool>
    ),
  },
  sources: {
    populated: () => (
      <Sources>
        <SourcesTrigger />
        <SourcesContent>
          <Source
            href="https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.0/public/r/uniwind/conversation.json"
            title="rnr-ai-elements registry — conversation.json"
          />
          <Source
            href="https://reactnativereusables.com/r/uniwind/text.json"
            title="React Native Reusables — text"
          />
        </SourcesContent>
      </Sources>
    ),
    empty: () => (
      <Sources>
        <SourcesTrigger />
        <SourcesContent />
      </Sources>
    ),
    loading: () => (
      <Sources>
        <SourcesTrigger />
        <SourcesContent>
          <Shimmer active>
            <Text className="text-sm">Collecting sources…</Text>
          </Shimmer>
        </SourcesContent>
      </Sources>
    ),
    error: () => (
      <Sources>
        <SourcesTrigger />
        <SourcesContent>
          <Text className="text-sm text-destructive">Source fetch failed — link allowlist refused the host</Text>
        </SourcesContent>
      </Sources>
    ),
  },
  'inline-citation': {
    populated: () => (
      <InlineCitationChip
        sources={[
          'https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.0/public/r/uniwind/conversation.json',
          'https://reactnativereusables.com/r/uniwind/text.json',
        ]}
      />
    ),
    empty: () => <InlineCitationChip sources={[]} />,
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">Citation resolving…</Text>
      </Shimmer>
    ),
    error: () => (
      <InlineCitationChip
        sources={['https://unreachable-host.invalid/registry/item.json']}
      />
    ),
  },
  checkpoint: {
    populated: () => (
      <Checkpoint label="Checkpoint — after the CLI install">
        <CheckpointIcon />
      </Checkpoint>
    ),
    empty: () => <Checkpoint />,
    loading: () => (
      <Checkpoint label="Checkpointing…">
        <Shimmer active>
          <Text className="text-xs">saving</Text>
        </Shimmer>
      </Checkpoint>
    ),
    error: () => <Checkpoint label="Checkpoint failed — restore unavailable" />,
  },
  shimmer: {
    populated: () => (
      <Shimmer active>
        <Text className="text-sm">The registry is still generating this item's content</Text>
      </Shimmer>
    ),
    empty: () => <Shimmer active={false} />,
    loading: () => (
      <Shimmer active duration={600}>
        <Text className="text-sm">Fast pulse while the first chunk lands…</Text>
      </Shimmer>
    ),
    error: () => (
      <Shimmer active={false}>
        <Text className="text-sm text-destructive">Generation stopped — pulse frozen</Text>
      </Shimmer>
    ),
  },
};
