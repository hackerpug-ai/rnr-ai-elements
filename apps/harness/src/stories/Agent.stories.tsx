import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import { Question, QuestionOption, QuestionOptions, QuestionPrompt } from '@/components/ai/question';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai/reasoning';
import { Task, TaskContent, TaskItem, TaskItemFile, TaskTrigger } from '@/components/ai/task';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai/tool';
import { TOOL_STATUS_KEYS, type ToolStatus } from '@/components/ai/tool.logic';
import { Message, MessageContent } from '@/components/ai/message';
import { Text } from '@/components/ui/text';

/**
 * Wave 6 — the agent-surface organisms: tool, reasoning, task, question.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props — `state` flips through all seven AI SDK tool-part states, and the
 * reasoning sandbox lets you stream and un-stream live to watch the auto-open /
 * auto-close lifecycle happen on device.
 *
 * Fixtures are AI SDK-shaped: a tool part's `type`/`state`/`input`/`errorText`, a
 * reasoning part's `isStreaming`, a task object's `title`/`items`/`status`.
 */
const meta = { title: 'AI Elements/Agent' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sandbox stories keep their primitive props as plain CSF object literals — the
 * on-device controls addon reads args/argTypes at runtime, and annotating them with
 * StoryObj fights Storybook 10's meta inference for cross-component files.
 */

const REASONING_TEXT =
  'The user asked about pinning the transcript. The repo uses an inverted FlatList, so ' +
  'stick-to-bottom is offset 0. I should mention maintainVisibleContentPosition — without ' +
  'it, prepending items mid-stream makes the visible row jump. Keep the answer short.';

const REASONING_STREAMED =
  'The user asked about pinning the transcript. The repo uses an inverted FlatList, so ' +
  'stick-to-bottom is offset 0. I should mention maintainVisibleContentPosition — without ' +
  'it, prepending items mid-stream makes the visible row jump. Keep the answer short. …and done.';

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* ------------------------------------------------------------------ tool ---- */

/** All seven AI SDK tool-part states, each a real tool part's shape. No unmapped case. */
export const ToolLifecycle: Story = {
  render: () => (
    <View className="gap-4">
      {TOOL_STATUS_KEYS.map((state) => (
        <Tool key={state} defaultOpen={state === 'output-error'}>
          <ToolHeader
            type={state === 'approval-requested' ? 'dynamic-tool' : 'tool-get_weather'}
            toolName="get_weather"
            state={state}
          />
          <ToolContent>
            <ToolInput input={state === 'input-streaming' ? '{"city": "san fr' : { city: 'San Francisco', units: 'celsius' }} />
            {state === 'output-error' ? (
              <ToolOutput errorText="provider timeout after 30000ms" />
            ) : state === 'input-available' || state === 'input-streaming' || state === 'approval-requested' ? null : (
              <ToolOutput output="21°C, partly cloudy, high 24°" />
            )}
          </ToolContent>
        </Tool>
      ))}
      <Text variant="muted">
        Tap any header: the whole row toggles the disclosure, the chevron turns with it, and
        Running's clock pulses (still under Reduce Motion).
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — flip `state` through all seven live. */
export const ToolSandbox = {
  args: {
    state: 'input-available' as ToolStatus,
    title: 'get_weather',
    defaultOpen: true,
  },
  argTypes: {
    state: { control: 'select', options: [...TOOL_STATUS_KEYS] },
    title: { control: 'text' },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { state: ToolStatus; title: string; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Tool defaultOpen={args.defaultOpen}>
        <ToolHeader type="tool-get_weather" title={args.title} state={args.state} />
        <ToolContent>
          <ToolInput input={{ city: 'San Francisco', units: 'celsius' }} />
          <ToolOutput output="21°C, partly cloudy, high 24°" />
        </ToolContent>
      </Tool>
      <Text variant="muted">Title wins over the derived name — clear it to see "get_weather".</Text>
    </View>
  ),
};

/** Output precedence: errorText beats output; both undefined renders empty, by contract. */
export const ToolOutputPrecedence: Story = {
  render: () => (
    <View className="gap-4">
      <Label>errorText present — heading is Error, in text-destructive</Label>
      <Tool defaultOpen>
        <ToolHeader type="tool-get_weather" state="output-error" />
        <ToolContent>
          <ToolOutput errorText="provider timeout after 30000ms" output="ignored" />
        </ToolContent>
      </Tool>
      <Label>both undefined — renders empty, not a spinner, not an error</Label>
      <Tool defaultOpen>
        <ToolHeader type="tool-get_weather" state="output-available" />
        <ToolContent>
          <ToolInput input={{ city: 'San Francisco' }} />
          <ToolOutput />
        </ToolContent>
      </Tool>
    </View>
  ),
};

/* ------------------------------------------------------------- reasoning ---- */

/** The lifecycle, driven live: toggle isStreaming to watch it open, then self-close. */
export const ReasoningSandbox = {
  args: {
    isStreaming: false,
    defaultOpen: false,
  },
  argTypes: {
    isStreaming: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { isStreaming: boolean; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Reasoning isStreaming={args.isStreaming} defaultOpen={args.defaultOpen}>
        <ReasoningTrigger />
        <ReasoningContent>{REASONING_STREAMED}</ReasoningContent>
      </Reasoning>
      <Text variant="muted">
        Stream on: opens by itself. Stream off: closes by itself after one second. Tap the
        header first — after that, the automation never touches it again.
      </Text>
    </View>
  ),
};

/** The states a loaded transcript shows: collapsed history with the frozen duration. */
export const ReasoningStates: Story = {
  render: () => (
    <View className="gap-4">
      <Label>Streaming — auto-opened, header says Thinking…</Label>
      <Reasoning isStreaming>
        <ReasoningTrigger />
        <ReasoningContent>{REASONING_TEXT}</ReasoningContent>
      </Reasoning>
      <Label>History — starts closed, duration frozen on the header</Label>
      <Reasoning isStreaming={false}>
        <ReasoningTrigger />
        <ReasoningContent>{REASONING_STREAMED}</ReasoningContent>
      </Reasoning>
      <Label>Pinned — defaultOpen stays open and never auto-closes</Label>
      <Reasoning defaultOpen>
        <ReasoningTrigger />
        <ReasoningContent>{REASONING_STREAMED}</ReasoningContent>
      </Reasoning>
      <Text variant="muted">
        The middle one computed its duration from a real stream — loaded history without
        timing data reads "Thought for a few seconds".
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------------------ task ---- */

/** A group mid-run plus one row per status — the states a plan moves through, in place. */
export const TaskBoard: Story = {
  render: () => (
    <View className="gap-4">
      <Label>A running group — collapsed by default, status glanceable</Label>
      <Task>
        <TaskTrigger title="Fix flaky checkout tests" status="running" />
        <TaskContent>
          <TaskItem status="completed">
            <Text className="text-sm">Reproduce the failure on CI</Text>
          </TaskItem>
          <TaskItem status="running">
            <Text className="text-sm">Bisect the flaky assertion</Text>
            <TaskItemFile>checkout.test.ts</TaskItemFile>
          </TaskItem>
          <TaskItem status="pending">
            <Text className="text-sm">Land the retry helper</Text>
          </TaskItem>
        </TaskContent>
      </Task>
      <Label>Every status, expanded</Label>
      <Task defaultOpen>
        <TaskTrigger title="Every status" status="completed" />
        <TaskContent>
          <TaskItem status="pending">
            <Text className="text-sm">Queued — waiting for a worker</Text>
          </TaskItem>
          <TaskItem status="running">
            <Text className="text-sm">In flight right now</Text>
          </TaskItem>
          <TaskItem status="completed">
            <Text className="text-sm">Read the schema</Text>
            <TaskItemFile>schema.sql</TaskItemFile>
            <TaskItemFile>migrations/0002.sql</TaskItemFile>
          </TaskItem>
          <TaskItem status="rejected">
            <Text className="text-sm">The step the user declined</Text>
          </TaskItem>
        </TaskContent>
      </Task>
      <Text variant="muted">
        Tap the trigger: details are one tap away, and the chevron turns with it. Watch the
        icons arrive when a row completes — one 200ms fade, still under Reduce Motion.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — flip the group's status badge live. */
export const TaskSandbox = {
  args: {
    title: 'Refactor the ingest pipeline',
    status: 'in_progress',
    defaultOpen: false,
  },
  argTypes: {
    title: { control: 'text' },
    status: {
      control: 'select',
      options: ['pending', 'in_progress', 'running', 'completed', 'rejected'],
    },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { title: string; status: 'pending' | 'in_progress' | 'running' | 'completed' | 'rejected'; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Task defaultOpen={args.defaultOpen}>
        <TaskTrigger title={args.title} status={args.status} />
        <TaskContent>
          <TaskItem status="completed">
            <Text className="text-sm">Map the current flow</Text>
          </TaskItem>
          <TaskItem status="running">
            <Text className="text-sm">Extract the retry wrapper</Text>
            <TaskItemFile>ingest/retry.ts</TaskItemFile>
          </TaskItem>
        </TaskContent>
      </Task>
      <Text variant="muted">in_progress and running render identically — both read "Running".</Text>
    </View>
  ),
};

/* -------------------------------------------------------------- question ---- */

/** The tap-to-send flow: one tap selects AND fires, and the choice persists. */
export const QuestionCard: Story = {
  render: () => {
    const [answered, setAnswered] = useState<string | null>(null);
    return (
      <View className="gap-3">
        <Question onOptionSelect={setAnswered}>
          <QuestionPrompt>Which environment should I deploy the fix to first?</QuestionPrompt>
          <QuestionOptions>
            {['Staging', 'Canary', 'Production'].map((option) => (
              <QuestionOption key={option} value={option}>
                {option}
              </QuestionOption>
            ))}
          </QuestionOptions>
        </Question>
        <Text variant="muted">
          {answered
            ? `Sent "${answered}" — the transcript keeps the choice, the alternatives are dead.`
            : 'Tap an option: it selects and sends in one tap, no submit button.'}
        </Text>
      </View>
    );
  },
};

/** Controlled answer + disabled — what a restored transcript renders. */
export const QuestionAnswered = {
  args: { disabled: false },
  argTypes: { disabled: { control: 'boolean' } },
  render: (args: { disabled: boolean }) => (
    <View className="gap-3">
      <Question value="Staging" disabled={args.disabled}>
        <QuestionPrompt>Which environment should I deploy the fix to first?</QuestionPrompt>
        <QuestionOptions>
          {['Staging', 'Canary', 'Production'].map((option) => (
            <QuestionOption key={option} value={option}>
              {option}
            </QuestionOption>
          ))}
        </QuestionOptions>
      </Question>
      <Text variant="muted">A restored transcript: the choice is already in it.</Text>
    </View>
  ),
};

/* ------------------------------------------------- the whole agent turn ---- */

/** Tool + reasoning + task composed inside one assistant turn — the wave's arc. */
export const AgentTurn: Story = {
  render: () => (
    <Message from="assistant">
      <MessageContent variant="flat">
        <Reasoning isStreaming={false}>
          <ReasoningTrigger />
          <ReasoningContent>{REASONING_STREAMED}</ReasoningContent>
        </Reasoning>
        <Tool defaultOpen>
          <ToolHeader type="tool-search_files" state="output-available" />
          <ToolContent>
            <ToolInput input={{ pattern: 'checkout.test.ts', limit: 5 }} />
            <ToolOutput output="2 matches in packages/api" />
          </ToolContent>
        </Tool>
        <Task>
          <TaskTrigger title="Investigate flaky checkout" status="running" />
          <TaskContent>
            <TaskItem status="completed">
              <Text className="text-sm">Search for the test</Text>
              <TaskItemFile>checkout.test.ts</TaskItemFile>
            </TaskItem>
            <TaskItem status="running">
              <Text className="text-sm">Read the failing assertion</Text>
            </TaskItem>
          </TaskContent>
        </Task>
        <Question onOptionSelect={() => {}}>
          <QuestionPrompt>Want me to fix it now, or just report findings?</QuestionPrompt>
          <QuestionOptions>
            <QuestionOption value="fix">Fix it now</QuestionOption>
            <QuestionOption value="report">Report findings</QuestionOption>
          </QuestionOptions>
        </Question>
      </MessageContent>
    </Message>
  ),
};
