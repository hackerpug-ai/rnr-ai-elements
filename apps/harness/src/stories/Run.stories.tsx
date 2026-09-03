import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Agent,
  AgentActions,
  AgentContent,
  AgentHeader,
} from '@/components/ai/agent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Persona } from '@/components/ai/persona';
import {
  AGENT_RUN_STATUS_KEYS,
  type AgentRunAction,
  type AgentRunStatus,
} from '@/components/ai/agent.logic';
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtImage,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from '@/components/ai/chain-of-thought';
import { CHAIN_OF_THOUGHT_STEP_STATUS_KEYS, type ChainOfThoughtStepStatus } from '@/components/ai/chain-of-thought.logic';
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationOutcome,
  ConfirmationRequest,
  ConfirmationTitle,
} from '@/components/ai/confirmation';import type { ConfirmationApproval } from '@/components/ai/confirmation.logic';
import { Plan, PlanContent, PlanDescription, PlanFooter, PlanHeader, PlanProgressBadge, PlanTitle, PlanTrigger } from '@/components/ai/plan';
import { Queue, QueueItem, QueueItemContent, QueueItemDescription, QueueItemFile, QueueItemIndicator, QueueItemRemove, QueueList, QueueSection, QueueSectionContent, QueueSectionTrigger } from '@/components/ai/queue';
import { enqueueQueueItems, removeQueueItem, type QueueItemLike } from '@/components/ai/queue.logic';

import { Message, MessageContent } from '@/components/ai/message';
import { TaskItem, TaskItemFile } from '@/components/ai/task';
import type { TaskStatus } from '@/components/ai/task.logic';
import { Text } from '@/components/ui/text';

/**
 * Wave 7 — the identity/run-surface organisms: agent, chain-of-thought, plan,
 * confirmation, queue.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props — the agent sandbox flips runStatus through all five states, the
 * chain-of-thought sandbox streams live to watch the lifecycle happen on device, and
 * the confirmation/queue sandboxes exercise the caller-owned answer and queue state.
 *
 * Fixtures are AI SDK-shaped: a tool part's `state`/`approval` for confirmation, a
 * step array's `status` for chain-of-thought and plan, an item array with `id`s for
 * the queue.
 */
const meta = { title: 'AI Elements/Run' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Sandbox stories keep their primitive props as plain CSF object literals — the
 * on-device controls addon reads args/argTypes at runtime, and annotating them with
 * StoryObj fights Storybook 10's meta inference for cross-component files.
 */

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* ----------------------------------------------------------------- agent ---- */

/** The caller-side run machine: a verb in, the next status out. Start → running,
    pause → paused, stop → idle. Error and done are the caller's to set — they are run
    outcomes, not control-bar verbs. */
function runMachine(action: AgentRunAction): AgentRunStatus {
  if (action === 'start') return 'running';
  if (action === 'pause') return 'paused';
  return 'idle';
}

/** All five run states as identity headers — the badge carries each tone. */
export const AgentRunStates: Story = {
  render: () => (
    <View className="gap-4">
      {AGENT_RUN_STATUS_KEYS.map((status) => (
        <Agent key={status} runStatus={status}>
          <AgentHeader
            name="Atlas"
            description={status === 'done' ? 'Deployed release 2.4.0' : 'Deployment agent'}
          />
        </Agent>
      ))}
      <Text variant="muted">
        Running's loader pulses on the house 1000ms signature and stands still under Reduce
        Motion. Idle and Paused share the muted tone — the icon tells them apart.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — flip runStatus and watch the control bar follow. */
export const AgentSandbox = {
  args: {
    name: 'Atlas',
    description: 'Deployment agent',
    runStatus: 'idle' as AgentRunStatus,
    showActions: true,
  },
  argTypes: {
    name: { control: 'text' },
    description: { control: 'text' },
    runStatus: { control: 'select', options: [...AGENT_RUN_STATUS_KEYS] },
    showActions: { control: 'boolean' },
  },
  render: (args: {
    name: string;
    description: string;
    runStatus: AgentRunStatus;
    showActions: boolean;
  }) => (
    <View className="gap-3">
      <Agent
        runStatus={args.runStatus}
        onRunAction={args.showActions ? () => {} : undefined}
      >
        <AgentHeader name={args.name} description={args.description} />
        <AgentContent>
          <Text variant="muted">The body slot — reasoning, tools, artifacts land here.</Text>
        </AgentContent>
        {args.showActions ? <AgentActions /> : null}
      </Agent>
      <Text variant="muted">
        The bar renders only when a handler is wired; impossible verbs disable in place —
        at idle, Start is live and Pause/Stop refuse the press.
      </Text>
    </View>
  ),
};

/** The control bar, live: press Start/Pause/Stop and the badge follows the caller's machine. */
export const AgentControls: Story = {
  render: () => {
    const [status, setStatus] = useState<AgentRunStatus>('idle');
    return (
      <View className="gap-3">
        <Agent runStatus={status} onRunAction={(action) => setStatus(runMachine(action))}>
          <AgentHeader name="Atlas" description="Deployment agent" />
          <AgentContent>
            <Text variant="muted">
              Press Start, then Pause, then Stop — the caller owns every transition; the
              component only reports the verb.
            </Text>
          </AgentContent>
          <AgentActions />
        </Agent>
      <Text variant="muted">Current run status: {status}</Text>
      </View>
    );
  },
};

/* -------------------------------------------------------- chain-of-thought ---- */

type Step = { label: string; description?: string; status: ChainOfThoughtStepStatus };

const CHAIN_STEPS: Step[] = [
  {
    label: 'Read the failing workflow log',
    description: 'Found the flaky step: integration tests race the container startup.',
    status: 'complete',
  },
  {
    label: 'Search the retries debate',
    description: 'Two prior PRs touched this; the retry helper landed in #4821.',
    status: 'complete',
  },
  {
    label: 'Draft the fix',
    description: 'Add a health-check wait before the suite runs.',
    status: 'active',
  },
  { label: 'Open the PR with the before/after timings', status: 'pending' },
];

const CHAIN_STEPS_DONE: Step[] = CHAIN_STEPS.map((s) => ({ ...s, status: 'complete' as const }));

/** A chain mid-run — auto-opened by the lifecycle, rail joining the steps. */
export const ChainOfThoughtBoard: Story = {
  render: () => (
    <View className="gap-4">
      <Label>Mid-run — opened by the stream, third step active</Label>
      <ChainOfThought isStreaming>
        <ChainOfThoughtHeader steps={CHAIN_STEPS} />
        <ChainOfThoughtContent>
          {CHAIN_STEPS.map((step, i) => (
            <ChainOfThoughtStep
              key={step.label}
              label={step.label}
              description={step.description}
              status={step.status}
              isLast={i === CHAIN_STEPS.length - 1}
            >
              {i === 1 ? (
                <ChainOfThoughtSearchResults>
                  <ChainOfThoughtSearchResult>PR #4821 — retry helper</ChainOfThoughtSearchResult>
                  <ChainOfThoughtSearchResult>ci/flaky-report.md</ChainOfThoughtSearchResult>
                </ChainOfThoughtSearchResults>
              ) : null}
              {i === 2 ? (
                <ChainOfThoughtImage
                  source={{ uri: 'https://picsum.photos/seed/rnr-wave7/640/360' }}
                  caption="Timings before the fix"
                />
              ) : null}
            </ChainOfThoughtStep>
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
      <Label>Every step status, expanded</Label>
      <ChainOfThought defaultOpen>
        <ChainOfThoughtHeader label="Step statuses" steps={CHAIN_STEPS} />
        <ChainOfThoughtContent>
          {CHAIN_OF_THOUGHT_STEP_STATUS_KEYS.map((status, i) => (
            <ChainOfThoughtStep
              key={status}
              label={status === 'active' ? 'Running right now' : status === 'complete' ? 'Done and retained' : 'Waiting its turn'}
              status={status}
              isLast={i === CHAIN_OF_THOUGHT_STEP_STATUS_KEYS.length - 1}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
      <Text variant="muted">
        Tap the header: the whole chain collapses to the progress badge — the count comes
        from data, because the collapsed content is unmounted. The rail stops at the last
        step.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — stream live to watch auto-open / auto-close. */
export const ChainOfThoughtSandbox = {
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
      <ChainOfThought isStreaming={args.isStreaming} defaultOpen={args.defaultOpen}>
        <ChainOfThoughtHeader steps={args.isStreaming ? CHAIN_STEPS : CHAIN_STEPS_DONE} />
        <ChainOfThoughtContent>
          {(args.isStreaming ? CHAIN_STEPS : CHAIN_STEPS_DONE).map((step, i) => (
            <ChainOfThoughtStep
              key={step.label}
              label={step.label}
              description={step.description}
              status={step.status}
              isLast={i === CHAIN_STEPS.length - 1}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
      <Text variant="muted">
        Stream on: opens by itself. Stream off: closes by itself after one second — the
        same lifecycle as reasoning, reused, not forked.
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------------------ plan ---- */

type PlanStep = { label: string; status: TaskStatus; files?: string[] };

const PLAN_STEPS: PlanStep[] = [
  { label: 'Map the current release flow', status: 'completed', files: ['release.md'] },
  { label: 'Add the health-check wait', status: 'running', files: ['ci/integration.yml'] },
  { label: 'Bisect the flaky assertion', status: 'pending' },
  { label: 'Land the retry helper', status: 'pending' },
  { label: 'Roll back the canary (declined)', status: 'rejected' },
];

/** A running plan — web-parity defaultOpen, task rows composed as the steps. */
export const PlanBoard: Story = {
  render: () => (
    <View className="gap-4">
      <Label>A running plan — 1 of 5 complete, 4 remaining</Label>
      <Plan>
        <PlanHeader>
          <PlanTrigger label="Release plan" />
          <PlanTitle>Ship the flaky-CI fix</PlanTitle>
          <PlanDescription>Four steps to green CI, one declined rollback.</PlanDescription>
        </PlanHeader>
        <PlanContent>
          {PLAN_STEPS.map((step) => (
            <TaskItem key={step.label} status={step.status}>
              <Text className="text-sm">{step.label}</Text>
              {step.files?.map((file) => <TaskItemFile key={file}>{file}</TaskItemFile>)}
            </TaskItem>
          ))}
        </PlanContent>
        <PlanFooter>
          <PlanProgressBadge steps={PLAN_STEPS} />
          <Text variant="muted">Rejected work stays in the remaining count.</Text>
        </PlanFooter>
      </Plan>
      <Label>Streaming — title and description shimmer on the house pulse</Label>
      <Plan isStreaming>
        <PlanHeader>
          <PlanTrigger label="Plan" />
          <PlanTitle>Refactor the ingest pipeline</PlanTitle>
          <PlanDescription>The agent is still writing the description…</PlanDescription>
        </PlanHeader>
        <PlanContent>
          <TaskItem status="pending">
            <Text className="text-sm">Steps arrive as the plan streams</Text>
          </TaskItem>
        </PlanContent>
        <PlanFooter>
          <PlanProgressBadge steps={[]} />
        </PlanFooter>
      </Plan>
      <Text variant="muted">
        The trigger is the vendored ghost Button in its pill form. A plan arrives open —
        unlike a task group, which collapses on a phone.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — flip isStreaming to watch the shimmer. */
export const PlanSandbox = {
  args: {
    title: 'Ship the flaky-CI fix',
    description: 'Four steps to green CI, one declined rollback.',
    isStreaming: false,
    defaultOpen: true,
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    isStreaming: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { title: string; description: string; isStreaming: boolean; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Plan isStreaming={args.isStreaming} defaultOpen={args.defaultOpen}>
        <PlanHeader>
          <PlanTrigger label="Plan" />
          <PlanTitle>{args.title}</PlanTitle>
          <PlanDescription>{args.description}</PlanDescription>
        </PlanHeader>
        <PlanContent>
          {PLAN_STEPS.slice(0, 3).map((step) => (
            <TaskItem key={step.label} status={step.status}>
              <Text className="text-sm">{step.label}</Text>
              {step.files?.map((file) => <TaskItemFile key={file}>{file}</TaskItemFile>)}
            </TaskItem>
          ))}
        </PlanContent>
        <PlanFooter>
          <PlanProgressBadge steps={PLAN_STEPS.slice(0, 3)} />
        </PlanFooter>
      </Plan>
      <Text variant="muted">
        isStreaming shimmers title and description — the web original's exact behavior,
        on the Shimmer organism's 1000ms pulse.
      </Text>
    </View>
  ),
};

/* ---------------------------------------------------------- confirmation ---- */

const CONFIRM_TITLE = 'Force-push the rewritten history to origin/main?';
const CONFIRM_DETAIL =
  'The agent wants to run git push --force origin main — 3 rewritten commits replace the remote history. collaborators must re-clone afterwards.';

/** The live HITL flow: approve or deny, and the answer persists with the other side dead. */
export const ConfirmationCard: Story = {
  render: () => {
    const [approval, setApproval] = useState<ConfirmationApproval>({});
    return (
      <View className="gap-3">
        <Confirmation
          state="approval-requested"
          approval={approval}
          onRespond={(approved) => setApproval({ approved })}
        >
          <ConfirmationTitle>{CONFIRM_TITLE}</ConfirmationTitle>
          <ConfirmationRequest>
            <Text className="text-sm leading-5 text-muted-foreground">{CONFIRM_DETAIL}</Text>
          </ConfirmationRequest>
          <ConfirmationActions />
          {typeof approval.approved === 'boolean' ? (
            <ConfirmationOutcome outcome={approval.approved ? 'approved' : 'denied'} />
          ) : null}
        </Confirmation>
        <Text variant="muted">
          Tap either side: the choice flips to a filled, check-marked state and the other
          button dies — the transcript keeps the answer.
        </Text>
      </View>
    );
  },
};

/** A single custom action — the generic slot for consumers who re-map the pair. */
export const ConfirmationCustomAction: Story = {
  render: () => {
    const [answered, setAnswered] = useState<boolean | null>(null);
    return (
      <View className="gap-3">
        <Confirmation state="approval-requested" approval={{}}>
          <ConfirmationTitle>{CONFIRM_TITLE}</ConfirmationTitle>
          <ConfirmationRequest>
            <Text className="text-sm leading-5 text-muted-foreground">{CONFIRM_DETAIL}</Text>
          </ConfirmationRequest>
          <View className="flex-row items-center gap-2">
            <ConfirmationAction
              variant="destructive"
              selected={answered === true}
              disabled={answered === false}
              onPress={() => setAnswered(true)}
              accessibilityLabel="Approve this action"
            >
              Approve
            </ConfirmationAction>
            <ConfirmationAction
              variant="outline"
              selected={answered === false}
              disabled={answered === true}
              onPress={() => setAnswered(false)}
              accessibilityLabel="Deny this action"
            >
              Deny
            </ConfirmationAction>
          </View>
          {answered !== null ? (
            <ConfirmationOutcome outcome={answered ? 'approved' : 'denied'} />
          ) : null}
        </Confirmation>
        <Text variant="muted">
          The default pair composes ConfirmationAction — re-map either side through its own
          variant; the persistence rules stay the component's.
        </Text>
      </View>
    );
  },
};

/** Restored transcripts: the decision arrives through props and neither button is live. */
export const ConfirmationAnswered = {
  args: { approved: true },
  argTypes: { approved: { control: 'boolean' } },
  render: (args: { approved: boolean }) => (
    <View className="gap-3">
      <Confirmation state="approval-responded" approval={{ approved: args.approved }}>
        <ConfirmationTitle>{CONFIRM_TITLE}</ConfirmationTitle>
        <ConfirmationRequest>
          <Text className="text-sm leading-5 text-muted-foreground">{CONFIRM_DETAIL}</Text>
        </ConfirmationRequest>
        <ConfirmationActions />
        <ConfirmationOutcome outcome={args.approved ? 'approved' : 'denied'} />
      </Confirmation>
      <Text variant="muted">
        {args.approved
          ? 'Approved, as the transcript recorded it.'
          : 'Denied, as the transcript recorded it.'}
      </Text>
    </View>
  ),
};

/** The web contract: no approval, or arguments still streaming — the card renders NOTHING. */
export const ConfirmationHidden: Story = {
  render: () => (
    <View className="gap-3">
      <Label>no approval object — renders nothing</Label>
      <View className="rounded-md border border-dashed border-border p-3">
        <Confirmation state="approval-requested">
          <ConfirmationTitle>Never rendered</ConfirmationTitle>
          <ConfirmationActions />
        </Confirmation>
        <Text variant="muted">↑ the card is absent by contract</Text>
      </View>
      <Label>arguments still streaming — renders nothing, even with an approval</Label>
      <View className="rounded-md border border-dashed border-border p-3">
        <Confirmation state="input-streaming" approval={{}}>
          <ConfirmationTitle>Never rendered</ConfirmationTitle>
          <ConfirmationActions />
        </Confirmation>
        <Text variant="muted">↑ deciding about a moving target is forbidden</Text>
      </View>
    </View>
  ),
};

/* ----------------------------------------------------------------- queue ---- */

type QueuedAction = QueueItemLike & {
  title: string;
  description?: string;
  completed?: boolean;
  files?: string[];
};

const INITIAL_QUEUE: QueuedAction[] = [
  {
    id: 'q-1',
    title: 'Deploy the fix to staging',
    description: 'After the current deploy finishes.',
    files: ['ci/integration.yml'],
  },
  { id: 'q-2', title: 'Run the smoke suite', description: 'Staging only.', completed: true },
  { id: 'q-3', title: 'Rotate the API key', description: 'Needs a human in the vault.' },
];

/** The queue, live: remove updates caller state; the count follows. */
export const QueueBoard: Story = {
  render: () => {
    const [items, setItems] = useState<QueuedAction[]>(INITIAL_QUEUE);
    return (
      <View className="gap-3">
        <Queue onRemove={(id) => setItems((prev) => removeQueueItem(prev, id))}>
          <QueueSection defaultOpen>
            <QueueSectionTrigger label="Queued actions" count={items.length} />
            <QueueSectionContent>
              <QueueList>
                {items.map((item) => (
                  <QueueItem key={item.id} id={item.id} completed={item.completed}>
                    <QueueItemIndicator />
                    <View className="min-w-0 flex-1 gap-0.5">
                      <QueueItemContent>{item.title}</QueueItemContent>
                      {item.description ? (
                        <QueueItemDescription>{item.description}</QueueItemDescription>
                      ) : null}
                      {item.files?.map((file) => (
                        <QueueItemFile key={file}>{file}</QueueItemFile>
                      ))}
                    </View>
                    <QueueItemRemove />
                  </QueueItem>
                ))}
              </QueueList>
            </QueueSectionContent>
          </QueueSection>
        </Queue>
        <Text variant="muted">
          {items.length === 0
            ? 'Everything removed — the caller decided that, not the component.'
            : 'Tap the × to remove. The completed row is struck through but stays queued.'}
        </Text>
      </View>
    );
  },
};

/** Controls on the primitive props — flip the count and the open state. */
export const QueueSandbox = {
  args: {
    label: 'Queued actions',
    count: 3,
    defaultOpen: true,
  },
  argTypes: {
    label: { control: 'text' },
    count: { control: 'number' },
    defaultOpen: { control: 'boolean' },
  },
  render: (args: { label: string; count: number; defaultOpen: boolean }) => (
    <View className="gap-3">
      <Queue>
        <QueueSection defaultOpen={args.defaultOpen}>
          <QueueSectionTrigger label={args.label} count={args.count} />
          <QueueSectionContent>
            <QueueList>
              {INITIAL_QUEUE.map((item) => (
                <QueueItem key={item.id} id={item.id} completed={item.completed}>
                  <QueueItemIndicator />
                  <View className="min-w-0 flex-1 gap-0.5">
                    <QueueItemContent>{item.title}</QueueItemContent>
                  </View>
                  <QueueItemRemove />
                </QueueItem>
              ))}
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
      <Text variant="muted">
        No onRemove here: the remove controls render but refuse the press — a control
        that disappears mid-press is worse than one that says no.
      </Text>
    </View>
  ),
};

/* --------------------------------------------------- the whole run turn ---- */

/** Identity + chain + confirmation + queue composed in one assistant turn. */
export const RunTurn: Story = {
  render: () => {
    const [approval, setApproval] = useState<ConfirmationApproval>({});
    const [items, setItems] = useState<QueuedAction[]>(INITIAL_QUEUE);
    return (
      <Message from="assistant">
        <MessageContent variant="flat">
          <Agent runStatus="running">
            <AgentHeader name="Atlas" description="Deployment agent" />
          </Agent>
          <ChainOfThought isStreaming={false} defaultOpen>
            <ChainOfThoughtHeader label="How I got here" steps={CHAIN_STEPS_DONE} />
            <ChainOfThoughtContent>
              {CHAIN_STEPS_DONE.slice(0, 2).map((step, i) => (
                <ChainOfThoughtStep
                  key={step.label}
                  label={step.label}
                  description={step.description}
                  status={step.status}
                  isLast={i === 1}
                />
              ))}
            </ChainOfThoughtContent>
          </ChainOfThought>
          <Confirmation
            state="approval-requested"
            approval={approval}
            onRespond={(approved) => setApproval({ approved })}
          >
            <ConfirmationTitle>{CONFIRM_TITLE}</ConfirmationTitle>
            <ConfirmationRequest>
              <Text className="text-sm leading-5 text-muted-foreground">{CONFIRM_DETAIL}</Text>
            </ConfirmationRequest>
            <ConfirmationActions />
          </Confirmation>
          <Queue onRemove={(id) => setItems((prev) => removeQueueItem(prev, id))}>
            <QueueSection>
              <QueueSectionTrigger label="Queued after this turn" count={items.length} />
              <QueueSectionContent>
                <QueueList>
                  {items.map((item) => (
                    <QueueItem key={item.id} id={item.id} completed={item.completed}>
                      <QueueItemIndicator />
                      <View className="min-w-0 flex-1 gap-0.5">
                        <QueueItemContent>{item.title}</QueueItemContent>
                      </View>
                      <QueueItemRemove />
                    </QueueItem>
                  ))}
                </QueueList>
              </QueueSectionContent>
            </QueueSection>
          </Queue>
        </MessageContent>
      </Message>
    );
  },
};

/** The enqueue helper the queue docs point at — dedupe by id, arrival order. */
export const QueueHelpersNote: Story = {
  render: () => {
    const example: QueuedAction[] = [{ id: 'a', title: 'First' }];
    const withB = enqueueQueueItems(example, { id: 'b', title: 'Second' });
    const withBDup = enqueueQueueItems(withB, { id: 'b', title: 'Second again' });
    return (
      <View className="gap-2">
        <Text variant="muted">enqueue is pure: it appends new ids and skips known ones.</Text>
        <Text variant="muted">
          start {[example.map((i) => i.id).join(',')]} → after b: [{withB.map((i) => i.id).join(',')}] →
          duplicate b: [{withBDup.map((i) => i.id).join(',')}]
        </Text>
      </View>
    );
  },
};
