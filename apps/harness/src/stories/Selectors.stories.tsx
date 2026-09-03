import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import {
  ModelSelector,
  ModelSelectorLogo,
  ModelSelectorTrigger,
} from '@/components/ai/model-selector';
import type { ModelSelectorModel } from '@/components/ai/model-selector.logic';
import {
  MicSelector,
  MicSelectorTrigger,
  MicSelectorValue,
} from '@/components/ai/mic-selector';
import type { MicRoute } from '@/components/ai/mic-selector.logic';
import {
  useVoiceSelector,
  VoiceSelector,
  VoiceSelectorAccent,
  VoiceSelectorAttributes,
  VoiceSelectorBullet,
  VoiceSelectorGender,
  VoiceSelectorTrigger,
} from '@/components/ai/voice-selector';
import type { VoiceSelectorVoice } from '@/components/ai/voice-selector.logic';
import { Text } from '@/components/ui/text';

/**
 * Wave 10 — the selector organisms: model-selector, mic-selector, voice-selector.
 * All three are the command atom wearing a different data model: bottom sheet, filter
 * field, virtualized rows, explicit empty state.
 *
 * Every state is visible statically where a row can exist outside the sheet (the
 * voice attribute anatomy, including the upstream traps), and the sheets themselves
 * are the press IS the demo (ChatSurfaces precedent — @rn-primitives dialogs have no
 * headless opener in a fixture). The voice preview states are argTypes-driven: flip
 * "previewingId" in the sandbox and open the sheet to see the pause mark move rows.
 *
 * THE CALLER-CONTRACTS ARE THE STORY, as with speech-input and attachments: the model
 * list, the route list and the voice list are YOURS — the registry cannot enumerate
 * devices (the OS owns audio routing), voices (the TTS provider owns the roster), or
 * models (your gateway owns the menu). Preview playback is a caller callback; the
 * sandboxes echo instead of playing, and the component only displays the state you
 * report back.
 */
const meta = { title: 'AI Elements/Selectors' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* --------------------------------------------------------------- fixtures ---- */

const MODELS: ModelSelectorModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Flagship multimodal' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', description: 'Fast and cheap' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', description: 'Deepest reasoning' },
  { id: 'claude-haiku-4', name: 'Claude Haiku 4', provider: 'Anthropic', description: 'Fastest responses' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'Google', description: 'Long context' },
  { id: 'llama-70b', name: 'Llama 4 70B', provider: 'Meta', description: 'Open weights' },
];

const ROUTES: MicRoute[] = [
  { id: 'car-bt', label: 'Car Stereo', kind: 'bluetooth' },
  { id: 'built-in', label: 'iPhone Microphone', kind: 'built-in' },
  { id: 'capture', label: 'Screen Recording Capture' }, // no kind → the generic mark, ordered last
  { id: 'wired', label: 'Wired Headphones', kind: 'wired' },
];

const VOICES: VoiceSelectorVoice[] = [
  { id: 'alloy', name: 'Alloy', group: 'Neutral', gender: 'female', accent: 'american', age: '30-45', description: 'Balanced and warm' },
  { id: 'echo', name: 'Echo', group: 'Neutral', gender: 'male', accent: 'american', age: '40-55' },
  { id: 'fable', name: 'Fable', group: 'Narration', gender: 'male', accent: 'british', age: '35-50', description: 'Storyteller cadence' },
  { id: 'sage', name: 'Sage', group: 'Narration', gender: 'female', accent: 'australian', age: '30-45' },
  { id: 'amelie', name: 'Amélie', group: 'International', gender: 'female', accent: 'french', age: '25-40' },
  { id: 'giuseppe', name: 'Giuseppe', group: 'International', gender: 'male', accent: 'italian', age: '45-60' },
  // The upstream trap, shipped as a fixture row: "AMERICAN" renders NO flag (the
  // lookup is case-sensitive) and an unrecognized gender falls back to the default
  // mark — never a crash, never a guess.
  { id: 'legacy', name: 'Legacy Row (trap fixture)', group: 'International', gender: 'android', accent: 'AMERICAN', age: '0-0' },
];

/* ----------------------------------------------------------- model-selector ---- */

export const ModelSelectorBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Trigger — selected model + chevrons</Label>
        <ModelSelector models={MODELS} value="claude-opus-4" onValueChange={() => {}}>
          <ModelSelectorTrigger />
        </ModelSelector>
      </View>
      <View className="gap-1">
        <Label>Trigger — nothing selected reads "Select model"</Label>
        <ModelSelector models={MODELS} value={undefined} onValueChange={() => {}}>
          <ModelSelectorTrigger />
        </ModelSelector>
      </View>
      <View className="gap-1">
        <Label>Stale value degrades to the placeholder, never a blank</Label>
        <ModelSelector models={MODELS} value="deleted-model" onValueChange={() => {}}>
          <ModelSelectorTrigger />
        </ModelSelector>
      </View>
      <View className="gap-1">
        <Label>Custom trigger — the consumer's chip</Label>
        <ModelSelector models={MODELS} value="gpt-4o" onValueChange={() => {}}>
          <ModelSelectorTrigger>
            <Text className="text-sm font-medium">model: gpt-4o ▾</Text>
          </ModelSelectorTrigger>
        </ModelSelector>
      </View>
      <View className="gap-1">
        <Label>Logo slot — themed mark by default, consumer raster source when supplied</Label>
        <View className="flex-row items-center gap-4">
          <ModelSelectorLogo provider="anthropic" />
          <ModelSelectorLogo
            provider="anthropic"
            source={{ uri: 'https://picsum.photos/seed/rnr-logo/32' }}
          />
          <Text variant="muted" className="text-xs">← default · consumer raster →</Text>
        </View>
      </View>
      <Text variant="muted">
        Press a trigger — the bottom sheet IS the demo: search filters across name,
        provider and description; groups carry provider headings; the selected row is
        muted with a check. The ⌘-shortcut part is dropped on the record (no ⌘ on a
        phone) and the models.dev SVG logo is a declared substitution (RN Image cannot
        render SVG; the derivation stays available as data).
      </Text>
    </View>
  ),
};

export const ModelSelectorSandbox = {
  args: {
    value: 'gpt-4o',
    placeholder: 'Search models…',
  },
  argTypes: {
    value: { control: 'radio', options: MODELS.map((m) => m.id) },
    placeholder: { control: 'text' },
  },
  render: (args: { value: string; placeholder: string }) => (
    <View className="gap-3">
      <ModelSelector models={MODELS} value={args.value} onValueChange={() => {}} placeholder={args.placeholder}>
        <ModelSelectorTrigger />
      </ModelSelector>
      <Text variant="muted" numberOfLines={2}>
        value={args.value} — flip it, then open the sheet: the check follows the control.
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------------- mic-selector ---- */

export const MicSelectorBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Trigger — selected route + mic mark</Label>
        <MicSelector routes={ROUTES} value="wired" onValueChange={() => {}}>
          <MicSelectorTrigger />
        </MicSelector>
      </View>
      <View className="gap-1">
        <Label>Trigger — nothing selected reads "Input"</Label>
        <MicSelector routes={ROUTES} value={undefined} onValueChange={() => {}}>
          <MicSelectorTrigger />
        </MicSelector>
      </View>
      <View className="gap-1">
        <Label>Custom trigger — the MicSelectorValue part inside the consumer's chip</Label>
        <MicSelector routes={ROUTES} value="built-in" onValueChange={() => {}}>
          <MicSelectorTrigger>
            <Text className="text-sm">🎙</Text>
            <MicSelectorValue placeholder="No route" className="text-sm font-medium" />
            <Text className="text-xs text-muted-foreground">▾</Text>
          </MicSelectorTrigger>
        </MicSelector>
      </View>
      <View className="gap-1">
        <Label>Empty routes — say WHY when you know (permission, not "none")</Label>
        <MicSelector
          routes={[]}
          value={undefined}
          onValueChange={() => {}}
          emptyTitle="No input routes"
          emptyDescription="Microphone access was denied — enable it in Settings to pick a route."
        >
          <MicSelectorTrigger />
        </MicSelector>
      </View>
      <Text variant="muted">
        PRD verdict native-substitute: iOS and Android expose audio ROUTES, not an
        enumerable input device list — so the route list is caller-supplied and the
        web's useAudioDevices hook does not port. Routes order built-in, wired,
        bluetooth, other; caller order survives within a kind. Press a trigger to open
        the sheet.
      </Text>
    </View>
  ),
};

export const MicSelectorSandbox = {
  args: {
    value: 'built-in',
  },
  argTypes: {
    value: { control: 'radio', options: ROUTES.map((r) => r.id) },
  },
  render: (args: { value: string }) => (
    <View className="gap-3">
      <MicSelector routes={ROUTES} value={args.value} onValueChange={() => {}}>
        <MicSelectorTrigger />
      </MicSelector>
      <Text variant="muted" numberOfLines={2}>
        value={args.value} — the trigger label follows, the row is muted in the sheet.
      </Text>
    </View>
  ),
};

/* ----------------------------------------------------------- voice-selector ---- */

/** Static attribute anatomy — the parts are props-driven, so the traps render in a fixture. */
function AttributeRow({ voice }: { voice: VoiceSelectorVoice }) {
  return (
    <View className="flex-row items-center gap-2">
      <Text className="w-24 text-xs" numberOfLines={1}>
        {voice.name}
      </Text>
      <VoiceSelectorAttributes voice={voice} />
    </View>
  );
}

export const VoiceSelectorBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Attribute anatomy — icon, flag, age, and the upstream traps</Label>
        <View className="gap-2 self-start rounded-md border border-border p-3">
          <AttributeRow voice={VOICES[0]} />
          <AttributeRow voice={VOICES[4]} />
          <AttributeRow voice={VOICES[6]} />
          <View className="flex-row items-center gap-1">
            <VoiceSelectorGender />
            <VoiceSelectorBullet />
            <VoiceSelectorAccent value="klingon" />
            <Text variant="muted" className="text-xs">
              ← omitted gender + unknown accent: default mark, then NOTHING (empty span upstream)
            </Text>
          </View>
        </View>
      </View>
      <View className="gap-1">
        <Label>Trigger — selected voice id + waveform mark</Label>
        <VoiceSelector voices={VOICES} value="alloy" onValueChange={() => {}} onPreview={() => {}}>
          <VoiceSelectorTrigger />
        </VoiceSelector>
      </View>
      <View className="gap-1">
        <Label>Trigger — nothing selected reads "Select voice"</Label>
        <VoiceSelector voices={VOICES} value={undefined} onValueChange={() => {}} onPreview={() => {}}>
          <VoiceSelectorTrigger />
        </VoiceSelector>
      </View>
      <View className="gap-1">
        <Label>No onPreview wired — every preview control DISABLES, never pretends</Label>
        <VoiceSelector voices={VOICES} value="alloy" onValueChange={() => {}}>
          <VoiceSelectorTrigger />
        </VoiceSelector>
      </View>
      <Text variant="muted">
        PRD verdict port-adapted: the voice set comes from YOUR native speech synthesis
        provider, and preview playback is a caller callback — the component displays
        the state you report (previewingId / previewLoadingId). THE COMPOSITION LAW:
        pressing the preview button PLAYS and NEVER selects — the button is a nested
        pressable in the row's action slot, so the row's onPress never fires (verify
        the row-press half on device). "AMERICAN" renders no flag: the accent lookup
        is case-sensitive, upstream byte-behavior.
      </Text>
    </View>
  ),
};

export const VoiceSelectorSandbox = {
  args: {
    value: 'alloy',
    previewingId: 'echo',
    previewLoadingId: 'none',
  },
  argTypes: {
    value: { control: 'radio', options: VOICES.map((v) => v.id) },
    previewingId: { control: 'radio', options: ['none', ...VOICES.map((v) => v.id)] },
    previewLoadingId: { control: 'radio', options: ['none', ...VOICES.map((v) => v.id)] },
  },
  render: (args: { value: string; previewingId: string; previewLoadingId: string }) => (
    <View className="gap-3">
      <VoiceSelector
        voices={VOICES}
        value={args.value}
        onValueChange={() => {}}
        onPreview={() => {}}
        previewingId={args.previewingId === 'none' ? undefined : args.previewingId}
        previewLoadingId={args.previewLoadingId === 'none' ? undefined : args.previewLoadingId}
      >
        <VoiceSelectorTrigger />
      </VoiceSelector>
      <Text variant="muted" numberOfLines={3}>
        value={args.value} · previewing={args.previewingId} · loading={args.previewLoadingId} —
        open the sheet: the pause mark sits on the previewing row, the disabled control
        on the loading row, and pressing either must never select.
      </Text>
    </View>
  ),
};

/** Smoke — the exported hook throws outside the root (upstream trap, byte-verbatim). */
export const VoiceSelectorHookTrap: Story = {
  render: () => {
    let trapped: string | undefined;
    function Probe(): null {
      try {
        useVoiceSelector();
      } catch (error) {
        trapped = (error as Error).message;
      }
      return null;
    }
    return (
      <View className="gap-2">
        <Probe />
        <Text variant="muted" numberOfLines={2} selectable>
          {trapped ?? 'NOT THROWN — the trap failed'}
        </Text>
      </View>
    );
  },
};

/** The controlled-open contract as a fixture: the sheet pinned open demonstrates the
 *  programmatic seam AND gives the device gate its open-sheet capture (search, provider
 *  group headers with header role, the selected row's muted check) in one frame. */
export const ModelSheetOpen: Story = {
  render: () => (
    <ModelSelector models={MODELS} value="claude-opus-4" onValueChange={() => {}} open onOpenChange={() => {}}>
      <ModelSelectorTrigger />
    </ModelSelector>
  ),
};

/** defaultOpen — the web contract — posed open: rows with preview buttons (play/pause/
 *  loading states), accent flags, gender marks, group headers. */
export const VoiceSheetOpen: Story = {
  render: () => (
    <VoiceSelector
      voices={VOICES}
      value="alloy"
      onValueChange={() => {}}
      onPreview={() => {}}
      previewingId="echo"
      defaultOpen
    >
      <VoiceSelectorTrigger />
    </VoiceSelector>
  ),
};
