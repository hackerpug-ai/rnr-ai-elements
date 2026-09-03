import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Attachment,
  AttachmentEmpty,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from '@/components/ai/attachments';
import type { AttachmentData, AttachmentState, AttachmentVariant } from '@/components/ai/attachments.logic';
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
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInItem,
  OpenInLabel,
  OpenInScira,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
} from '@/components/ai/open-in-chat';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/**
 * Wave 9 — the content organisms II: chat surfaces. attachments, context,
 * open-in-chat.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props. Two behaviors are live on device by design: pressing a Context
 * trigger opens its popover (the PRD verdict's press-opened breakdown — @rn-primitives
 * popovers and menus have no defaultOpen, so the press IS the demo), and pressing an
 * open-in-chat target with the default handler asks the OS to open the deep link
 * (sources precedent: the platform link handler IS the behavior; the sandboxes echo
 * the URL through the caller handler instead).
 *
 * Anchored content carries static insets ({ top: 8, bottom: 16, left: 12, right: 12 }):
 * the stories render inside ordinary bounded columns, not behind a notch, and
 * deterministic numbers beat device-dependent ones in a fixture.
 */
const meta = { title: 'AI Elements/Chat Surfaces' } satisfies Meta;
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

/* --------------------------------------------------------------- fixtures ---- */

const IMAGE: AttachmentData = {
  id: 'a1',
  name: 'composer-screenshot.png',
  mimeType: 'image/png',
  uri: 'https://picsum.photos/seed/rnr-chat/240',
  sizeBytes: 1284000,
};

const PDF: AttachmentData = {
  id: 'a2',
  name: 'requirements-draft.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 486000,
};

const CSV: AttachmentData = {
  id: 'a3',
  name: 'eval-metrics.csv',
  mimeType: 'text/csv',
  sizeBytes: 18400,
};

const UPLOADING_VIDEO: AttachmentData = {
  id: 'a4',
  name: 'stream-recording.mp4',
  mimeType: 'video/mp4',
  sizeBytes: 25160000,
};

const FAILED_REPORT: AttachmentData = {
  id: 'a5',
  name: 'crash-report.dmp',
  mimeType: 'application/octet-stream',
  sizeBytes: 512,
};

/* ------------------------------------------------------------- attachments ---- */

/** The three upstream variants, plus the upload states the web never needed. */
export const AttachmentsBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Inline — the composer strip</Label>
        <Attachments variant="inline">
          <Attachment data={PDF} onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo showMediaType />
            <AttachmentRemove label="Remove requirements-draft.pdf" />
          </Attachment>
          <Attachment data={UPLOADING_VIDEO} state="uploading" onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
          <Attachment data={FAILED_REPORT} state="error" onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        </Attachments>
      </View>
      <View className="gap-1">
        <Label>Grid — right-aligned thumbnails</Label>
        <Attachments variant="grid">
          <Attachment data={IMAGE} onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
          <Attachment data={UPLOADING_VIDEO} state="uploading" onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
          <Attachment data={CSV} onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
        </Attachments>
      </View>
      <View className="gap-1">
        <Label>List — rows on the item primitive</Label>
        <Attachments variant="list">
          <Attachment data={IMAGE} onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo showMediaType />
            <AttachmentRemove />
          </Attachment>
          <Attachment data={UPLOADING_VIDEO} state="uploading" onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
          <Attachment data={FAILED_REPORT} state="error" onRemove={() => {}}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        </Attachments>
      </View>
      <View className="gap-1">
        <Label>No onRemove wired — remove DISABLES, never disappears</Label>
        <Attachments variant="inline">
          <Attachment data={PDF}>
            <AttachmentPreview />
            <AttachmentInfo />
            <AttachmentRemove />
          </Attachment>
        </Attachments>
      </View>
      <View className="gap-1">
        <Label>Empty — the shared empty primitive, tuned to a composer strip</Label>
        <AttachmentEmpty />
      </View>
      <Text variant="muted">
        File acquisition is the caller's (native pickers, their permission contracts).
        Upload states are display-only: the lifecycle above the wire is caller-owned.
        Grid tiles announce name and state to the screen reader — they have no text.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — flip the variant and watch the same three files. */
export const AttachmentSandbox = {
  args: {
    variant: 'inline' as AttachmentVariant,
    state: 'done' as AttachmentState,
    showMediaType: true,
    removable: true,
  },
  argTypes: {
    variant: { control: 'radio', options: ['grid', 'inline', 'list'] },
    state: { control: 'radio', options: ['uploading', 'done', 'error'] },
    showMediaType: { control: 'boolean' },
    removable: { control: 'boolean' },
  },
  render: (args: {
    variant: AttachmentVariant;
    state: AttachmentState;
    showMediaType: boolean;
    removable: boolean;
  }) => (
    <View className="gap-3">
      <Attachments variant={args.variant}>
        <Attachment data={IMAGE} state={args.state} onRemove={args.removable ? () => {} : undefined}>
          <AttachmentPreview />
          <AttachmentInfo showMediaType={args.showMediaType} />
          <AttachmentRemove />
        </Attachment>
        <Attachment data={PDF} state={args.state} onRemove={args.removable ? () => {} : undefined}>
          <AttachmentPreview />
          <AttachmentInfo showMediaType={args.showMediaType} />
          <AttachmentRemove />
        </Attachment>
      </Attachments>
      <Text variant="muted">
        Same data, three presentations. Grid is the web's right-aligned thumbnail block;
        inline is the compact chip row; list composes the item primitive.
      </Text>
    </View>
  ),
};

/* ----------------------------------------------------------------- context ---- */

/** Triggers at rest; the breakdown is one press away (the press IS the demo). */
export const ContextBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Trigger — percent + usage gauge</Label>
        <View className="flex-row items-center gap-4">
          <Context usedTokens={60000} maxTokens={200000}>
            <ContextTrigger />
          </Context>
          <Context usedTokens={170000} maxTokens={200000}>
            <ContextTrigger />
          </Context>
          <Context usedTokens={8192} maxTokens={200000}>
            <ContextTrigger />
          </Context>
        </View>
      </View>
      <View className="gap-1">
        <Label>Full breakdown — press a trigger above to open</Label>
        <Context
          usedTokens={124000}
          maxTokens={200000}
          usage={{ inputTokens: 86000, outputTokens: 31000, reasoningTokens: 5400, cachedInputTokens: 1200 }}
        >
          <ContextTrigger />
          <ContextContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
            <ContextContentHeader />
            <ContextContentBody>
              <ContextInputUsage costText="$0.0013" />
              <ContextOutputUsage costText="$0.0047" />
              <ContextReasoningUsage />
              <ContextCacheUsage />
            </ContextContentBody>
            <ContextContentFooter costText="$0.0060" />
          </ContextContent>
        </Context>
      </View>
      <View className="gap-1">
        <Label>No usage data — rows render NOTHING, footer shows the unknown marker</Label>
        <Context usedTokens={124000} maxTokens={200000}>
          <ContextTrigger />
          <ContextContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
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
      </View>
      <Text variant="muted">
        The web's hover card is the PRD's press-opened popover here. Cost strings are
        injected by the caller — tokenlens is a dependency this registry does not take —
        and an unsupplied cost renders "—", the web original's own unknown-marker, never
        a lying $0.00.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props — drive the numbers, press to read the breakdown. */
export const ContextSandbox = {
  args: {
    usedTokens: 124000,
    maxTokens: 200000,
    inputTokens: 86000,
    outputTokens: 31000,
    reasoningTokens: 0,
    cachedInputTokens: 1200,
    costText: '$0.0060',
  },
  argTypes: {
    usedTokens: { control: 'number', min: 0, max: 400000, step: 1000 },
    maxTokens: { control: 'number', min: 1000, max: 1000000, step: 1000 },
    inputTokens: { control: 'number', min: 0, max: 200000, step: 100 },
    outputTokens: { control: 'number', min: 0, max: 200000, step: 100 },
    reasoningTokens: { control: 'number', min: 0, max: 50000, step: 100 },
    cachedInputTokens: { control: 'number', min: 0, max: 50000, step: 100 },
    costText: { control: 'text' },
  },
  render: (args: {
    usedTokens: number;
    maxTokens: number;
    inputTokens: number;
    outputTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
    costText: string;
  }) => (
    <View className="gap-3">
      <Context
        usedTokens={args.usedTokens}
        maxTokens={args.maxTokens}
        usage={{
          inputTokens: args.inputTokens,
          outputTokens: args.outputTokens,
          reasoningTokens: args.reasoningTokens,
          cachedInputTokens: args.cachedInputTokens,
        }}
      >
        <ContextTrigger />
        <ContextContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
          <ContextContentHeader />
          <ContextContentBody>
            <ContextInputUsage />
            <ContextOutputUsage />
            <ContextReasoningUsage />
            <ContextCacheUsage />
          </ContextContentBody>
          <ContextContentFooter costText={args.costText} />
        </ContextContent>
      </Context>
      <Text variant="muted">
        Zero-count rows render nothing — a breakdown never says "Reasoning 0". The
        header bar tracks the used/max ratio; a zero budget reads 0%, never NaN.
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------------ open-in-chat ---- */

/**
 * The web original's menu: "Open in chat" trigger, label, six targets. Pressing a
 * target with the default handler asks the OS to open the deep link — the platform
 * link handler IS the behavior (sources precedent).
 */
export const OpenInBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Default trigger — the web original's "Open in chat"</Label>
        <OpenIn query="Explain how the registry fan-out rewrites one source into two engine variants">
          <OpenInTrigger />
          <OpenInContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
            <OpenInLabel>
              <Text className="text-xs text-muted-foreground">Open in</Text>
            </OpenInLabel>
            <OpenInChatGPT />
            <OpenInClaude />
            <OpenInCursor />
            <OpenInScira />
            <OpenInT3 />
            <OpenInv0 />
          </OpenInContent>
        </OpenIn>
      </View>
      <View className="gap-1">
        <Label>Custom trigger — the consumer's chip, same menu</Label>
        <OpenIn query="Summarize the wave 9 porting verdicts">
          <OpenInTrigger>
            <Button variant="secondary" size="sm">
              <Text>Hand off…</Text>
            </Button>
          </OpenInTrigger>
          <OpenInContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
            <OpenInChatGPT />
            <OpenInClaude />
            <OpenInSeparator />
            <OpenInItem disabled>
              <Text>Open in (unwired target)</Text>
            </OpenInItem>
          </OpenInContent>
        </OpenIn>
      </View>
      <Text variant="muted">
        Same buttons, same targets — the URL templates are the web's, byte for byte.
        Targets the caller does not mount are hidden, never opened into a dead tab.
        The brand marks are lucide stand-ins for the web's inline brand SVGs; the title
        carries the identity.
      </Text>
    </View>
  ),
};

/** The caller handler echoes instead of opening — the contract the consumer owns. */
export const OpenInSandbox = {
  args: {
    query: 'Explain how the registry fan-out rewrites one source into two engine variants',
  },
  argTypes: {
    query: { control: 'text' },
  },
  render: (args: { query: string }) => {
    const [echo, setEcho] = useState<string>();
    return (
      <View className="gap-3">
        <OpenIn
          query={args.query}
          onOpen={(url, provider) => setEcho(`${provider} → ${url}`)}
          onOpenError={(error) => setEcho(`error: ${error.message}`)}
        >
          <OpenInTrigger />
          <OpenInContent insets={{ top: 8, bottom: 16, left: 12, right: 12 }}>
            <OpenInChatGPT />
            <OpenInClaude />
            <OpenInCursor />
            <OpenInScira />
            <OpenInT3 />
            <OpenInv0 />
          </OpenInContent>
        </OpenIn>
        <Text variant="muted" numberOfLines={2}>
          {echo
            ? `onOpen: ${echo}`
            : 'Press a target — the caller handler receives the URL and the provider; opening it is the caller\u2019s call.'}
        </Text>
      </View>
    );
  },
};
