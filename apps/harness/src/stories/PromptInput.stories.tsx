import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import {
  type PromptInputAttachmentData,
  PromptInput,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputPrimary,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputTools,
  PromptInputToolsMenu,
  PromptInputToolsMenuItem,
  PromptInputToolsMenuTrigger,
  usePromptInputAttachments,
  usePromptInputController,
} from '@/components/ai/prompt-input';
import {
  ModelSelector,
  ModelSelectorTrigger,
  type ModelSelectorModel,
} from '@/components/ai/model-selector';
import { SpeechInput } from '@/components/ai/speech-input';
import { CameraIcon, FolderOpenIcon, GlobeIcon, ImageIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

/**
 * The composer's own board — the parts the Chat page composes, exercised one state at
 * a time (the fixture poses are what the device sign-off screenshots). The attachment
 * fixtures are inert file:// / data: URIs on purpose: the PICKER is the device-gate
 * behavior (a web storybook cannot open a native photo sheet and proves nothing), so
 * the stories prove the chip row, the + menu states, the primary morph, and the
 * clear-on-resolve contract — everything visible without the picker.
 *
 * The one clear-on-resolve pose that CANNOT be a fixture is the happy path (submit
 * resolves, text + chips clear); it is the Chat page's Populated story, which appends
 * the sent message live.
 */
const meta = { title: 'AI Elements/Composer' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** Seeds the composer's attachments context on mount — the chip-row fixtures. */
function SeedAttachments({ files }: { files: PromptInputAttachmentData[] }) {
  const seeded = useRef(false);
  const { add } = usePromptInputAttachments();
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    add(files);
  }, [add, files]);
  return null;
}

const DEMO_IMAGE: PromptInputAttachmentData = {
  id: 'demo-image',
  mediaType: 'image/png',
  filename: 'demo-image.png',
  // 1x1 PNG data URI — deterministic and offline-proof on device and web.
  url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
};

const DEMO_PDF: PromptInputAttachmentData = {
  id: 'demo-pdf',
  mediaType: 'application/pdf',
  filename: 'quarterly-report.pdf',
  url: 'file:///tmp/quarterly-report.pdf',
};

const COMPOSER_MODELS: ModelSelectorModel[] = [
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'Google' },
];

/**
 * The evolved tools row — the + is the ONE rest entry point (progressive disclosure):
 * `[+Trigger] [model chip] … [PromptInputPrimary]`. Camera/Photos/Files ride the
 * picker seam as menu rows (the camera kind is explicit — `openPicker('camera')`);
 * web search is a CHECKMARKED toggle whose state lives here, the consumer — the
 * registry never learns what web search is. The voice affordance is SpeechInput
 * composed with NO engine: disabled, never fake-listening; its idle pill IS the
 * filled primary circle the morph table names.
 */
function EvolvedToolsRow({
  initialWebSearch = false,
  initiallyOpen = false,
}: {
  initialWebSearch?: boolean;
  initiallyOpen?: boolean;
}) {
  // The portal boundary carries no React context, so closing is OUR job: every row's
  // onPress fires its own action first, then sets toolsOpen false (handler first — a
  // picker must not race the sheet's exit).
  const [toolsOpen, setToolsOpen] = useState(initiallyOpen);
  const close = () => setToolsOpen(false);
  const [webSearch, setWebSearch] = useState(initialWebSearch);
  const [model, setModel] = useState<string | undefined>(COMPOSER_MODELS[0].id);
  const { openPicker } = usePromptInputAttachments();
  return (
    <>
      <PromptInputTools>
        <PromptInputToolsMenuTrigger onPress={() => setToolsOpen(true)} expanded={toolsOpen} />
        <ModelSelector models={COMPOSER_MODELS} value={model} onValueChange={setModel}>
          <ModelSelectorTrigger size="sm" className="rounded-full" />
        </ModelSelector>
      </PromptInputTools>
      <PromptInputToolsMenu open={toolsOpen} onOpenChange={setToolsOpen}>
        <PromptInputToolsMenuItem
          icon={GlobeIcon}
          label="Web search"
          selected={webSearch}
          onPress={() => {
            setWebSearch((v) => !v);
            close();
          }}
        />
        <PromptInputToolsMenuItem
          icon={CameraIcon}
          label="Camera"
          onPress={() => {
            close();
            openPicker('camera');
          }}
        />
        <PromptInputToolsMenuItem
          icon={ImageIcon}
          label="Photos"
          onPress={() => {
            close();
            openPicker('media');
          }}
        />
        <PromptInputToolsMenuItem
          icon={FolderOpenIcon}
          label="Files"
          onPress={() => {
            close();
            openPicker('file');
          }}
        />
      </PromptInputToolsMenu>
    </>
  );
}

/**
 * The footer the poses share. Voice wiring is optional — a lift (Provider pose) can
 * route transcripts into the field's own text state; bare poses leave the circle
 * inert-but-honest.
 */
function EvolvedComposerField({
  initialWebSearch = false,
  initialToolsOpen = false,
  withVoice = true,
  onTranscriptionChange,
}: {
  initialWebSearch?: boolean;
  initialToolsOpen?: boolean;
  withVoice?: boolean;
  onTranscriptionChange?: (text: string) => void;
}) {
  return (
    <PromptInputBody>
      <PromptInputTextarea />
      <PromptInputFooter>
        <EvolvedToolsRow initialWebSearch={initialWebSearch} initiallyOpen={initialToolsOpen} />
        <PromptInputPrimary
          renderVoice={
            withVoice
              ? () => <SpeechInput className="p-0" onTranscriptionChange={onTranscriptionChange} />
              : undefined
          }
        />
      </PromptInputFooter>
    </PromptInputBody>
  );
}

/* ----------------------------------------------------------------- poses ---- */

/**
 * The evolved rest state: + + model chip, no voice composed — the primary slot is
 * today's disabled send arrow (the morph table's "empty, no voice" row, proving the
 * fallback did not regress).
 */
export const Default: Story = {
  render: () => (
    <PromptInput onSubmit={() => {}}>
      <EvolvedComposerField withVoice={false} />
    </PromptInput>
  ),
};

/** The never-dead primary: empty field + voice composed → the filled voice circle. */
export const VoiceEmpty: Story = {
  render: () => (
    <PromptInput onSubmit={() => {}}>
      <EvolvedComposerField />
    </PromptInput>
  ),
};

/**
 * The + menu, open: Web search (unchecked), then Camera / Photos / Files. Camera and
 * Photos open the REAL pickers on device (Expo Go-clean); the camera kind is
 * explicit-only — this row is the only thing in the app that can ask for it.
 */
export const ToolsMenuOpen: Story = {
  render: () => (
    <View className="gap-2">
      <Text variant="muted">
        The + menu. Web search toggles with a checkmark; Camera/Photos/Files open the
        native pickers on device.
      </Text>
      <PromptInput onSubmit={() => {}}>
        <EvolvedComposerField initialToolsOpen />
      </PromptInput>
    </View>
  ),
};

/** One image chip + one file chip — the two anatomies of the design spec §3. */
export const AttachmentsPopulated: Story = {
  render: () => (
    <PromptInput onSubmit={() => {}}>
      <PromptInputHeader>
        <PromptInputAttachments />
      </PromptInputHeader>
      <SeedAttachments files={[DEMO_IMAGE, DEMO_PDF]} />
      <EvolvedComposerField />
    </PromptInput>
  ),
};

/** Web search ON — the check lives in the MENU now, not a permanent row slot. */
export const GlobeActive: Story = {
  render: () => (
    <View className="gap-2">
      <Text variant="muted">
        Web search toggled on — shown where the state lives: the open menu, checkmark
        trailing. The composer row stays quiet.
      </Text>
      <PromptInput onSubmit={() => {}}>
        <EvolvedComposerField initialToolsOpen initialWebSearch />
      </PromptInput>
    </View>
  ),
};

/** The stop state — Square icon, enabled, press wired to a live flip back to ready. */
export const Streaming: Story = {
  render: () => {
    const [status, setStatus] = useState<'streaming' | 'ready'>('streaming');
    return (
      <PromptInput status={status} onStop={() => setStatus('ready')} onSubmit={() => {}}>
        <EvolvedComposerField />
      </PromptInput>
    );
  },
};

/**
 * The rule that protects the user, now with attachments in scope: a REJECTED onSubmit
 * leaves the text AND the chips intact. Type, send, watch nothing disappear.
 */
export const SubmitFailureKeepsAttachments: Story = {
  render: () => (
    <View className="gap-2">
      <Text variant="muted">
        Send fails on purpose. Your text and both chips must survive it.
      </Text>
      <PromptInputProvider initialInput="Report on the attached numbers">
        <PromptInput
          onSubmit={async () => {
            throw new Error('network');
          }}
        >
          <PromptInputHeader>
            <PromptInputAttachments />
          </PromptInputHeader>
          <SeedAttachments files={[DEMO_IMAGE, DEMO_PDF]} />
          <EvolvedComposerField />
        </PromptInput>
      </PromptInputProvider>
    </View>
  ),
};

/**
 * The lift, proven end to end: the panel reads usePromptInputController OUTSIDE the
 * field (text, attachment count, and an external attach trigger that goes through the
 * controller's registered picker), while the field below shares the same state. The
 * voice affordance is wired HERE to prove the transcription→field route: a real
 * engine would call textInput.setInput with its transcript.
 */
export const ProviderLifted: Story = {
  render: () => {
    function LiftedPanel() {
      const { textInput, attachments, __openPicker } = usePromptInputController();
      return (
        <View className="gap-1 rounded-md border border-border bg-muted p-3">
          <Text className="text-sm text-foreground">
            {textInput.value.trim().length
              ? `"${textInput.value}" (${textInput.value.length} chars)`
              : 'Nothing typed yet — type in the field below.'}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {attachments.files.length} attachment(s) in the lifted context
          </Text>
          <PromptInputToolsMenuTrigger
            onPress={() => __openPicker()}
            accessibilityLabel="Attach from the panel"
            className="self-start"
          />
        </View>
      );
    }
    function FieldWithControllerVoice() {
      const { textInput } = usePromptInputController();
      return (
        <EvolvedComposerField
          onTranscriptionChange={(text) => textInput.setInput(text)}
        />
      );
    }
    return (
      <View className="gap-2">
        <PromptInputProvider>
          <LiftedPanel />
          <PromptInput onSubmit={() => {}}>
            <PromptInputHeader>
              <PromptInputAttachments />
            </PromptInputHeader>
            <FieldWithControllerVoice />
          </PromptInput>
        </PromptInputProvider>
      </View>
    );
  },
};
