import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import { Checkpoint, CheckpointIcon, CheckpointTrigger } from '@/components/ai/checkpoint';
import { Persona } from '@/components/ai/persona';
import { Shimmer } from '@/components/ai/shimmer';
import { SpeechInput } from '@/components/ai/speech-input';
import { Text } from '@/components/ui/text';

const meta = { title: 'AI Elements/Molecules' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** The only genuinely invented treatment in the port — RNR Skeleton's pulse, not a sweep. */
export const StreamingShimmer: Story = {
  render: () => (
    <View className="gap-4">
      <Shimmer>Thinking through the approach…</Shimmer>
      <Shimmer duration={1000}>Searching the codebase for callers</Shimmer>
      <Shimmer active={false}>Stopped — resting at text-muted-foreground</Shimmer>
      <Text variant="muted">Enable Reduce Motion at OS level: the pulse must stop.</Text>
    </View>
  ),
};

export const CheckpointDivider: Story = {
  render: () => {
    const [restored, setRestored] = useState<number | null>(null);
    return (
      <View className="gap-3">
        <Text>A message before the checkpoint.</Text>
        <Checkpoint>
          <CheckpointIcon />
          <Text className="text-xs text-muted-foreground">Restored here</Text>
        </Checkpoint>
        <Text>A message after it.</Text>
        <View className="items-center pt-2">
          <CheckpointTrigger onRestore={() => setRestored(Date.now())} />
        </View>
        <Text variant="muted">
          {restored ? 'Restore confirmed — the handler ran.' : 'Tap Restore: it confirms first, because a mistap loses transcript.'}
        </Text>
      </View>
    );
  },
};

export const Identity: Story = {
  render: () => (
    <View className="gap-4">
      <Persona name="Claude Opus 5" description="Most capable model, 1M context" status="ready" />
      <Persona name="Research Agent" description="Reads the codebase and cites sources" status="thinking" />
      <Text variant="muted">
        The web original is a Rive animation. The animated avatar is not ported — see the
        porting-verdict table.
      </Text>
    </View>
  ),
};

export const PushToTalk: Story = {
  render: () => {
    const [text, setText] = useState<string | null>(null);
    const [denied, setDenied] = useState(false);
    return (
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <Text className="text-sm">No engine wired:</Text>
          <SpeechInput />
          <Text variant="muted">disabled, never fake-listening</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="text-sm">Wired:</Text>
          <SpeechInput
            recorder={{
              start: async () => {},
              stop: async () => 'recording-handle',
              requestPermission: async () => true,
            }}
            transcribe={async () => 'transcribed text'}
            onTranscriptionChange={setText}
          />
          <Text variant="muted">{text ?? 'tap, then tap again'}</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="text-sm">Denied:</Text>
          <SpeechInput
            recorder={{ start: async () => {}, stop: async () => null, requestPermission: async () => false }}
            transcribe={async () => ''}
            onPermissionDenied={() => setDenied(true)}
          />
          <Text variant="muted">{denied ? 'denied state shown' : 'tap to deny'}</Text>
        </View>
      </View>
    );
  },
};
