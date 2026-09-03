import { Button } from '@/registry/{engine}/components/ui/button';
import { Command } from '@/registry/{engine}/components/ui/command';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  AudioLinesIcon,
  ChevronsUpDownIcon,
  LoaderCircleIcon,
  NonBinaryIcon,
  PauseIcon,
  PlayIcon,
  TransgenderIcon,
  UserIcon,
  VenusIcon,
  MarsIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  resolveVoiceGender,
  voiceAccentFlag,
  voicePreviewState,
  type VoiceSelectorVoice,
} from './voice-selector.logic';
import type { CommandItem } from '../ui/command.logic';

/**
 * VoiceSelector — the TTS voice picker (UC-VOICE-02 AC-2: "select a text-to-speech
 * voice from a bottom-sheet list showing each voice name and language").
 *
 * THE PRD VERDICT IS PORT-ADAPTED, PURE-RNR: "Voice list ports, but the picker
 * becomes a bottom sheet and the available voice set comes from the native speech
 * synthesis provider rather than the browser." The set is therefore CALLER-SUPPLIED
 * (expo-speech's getVoices(), a provider roster) — the browser's voice enumeration
 * has no RN equivalent, and the registry takes no audio dependency. Preview playback
 * is a caller callback too: onPreview(voice) fires, the component only DISPLAYS the
 * state you report back.
 *
 * THE COMPOSITION LAW (the PRD's own words): "tapping the preview button PLAYS the
 * sample and must NOT select the voice. Two nested targets, two distinct outcomes."
 * Realized structurally: the preview Button lives in the row's ItemActions, and React
 * Native's responder system gives the touch to the DEEPEST pressable — the row's
 * onPress never fires when the preview is the target. The preview target is RNR's
 * h-10 icon Button + hitSlop (the 44pt house formula), visually separated in the
 * row's action slot per the KB's mistap advice. THE ROW-PRESS-DOES-NOT-FIRE HALF IS
 * A DEVICE-TIER CLAIM — verify it on the sign-off run.
 *
 * PREVIEW STATES are the web's three: idle (play mark, "Play preview"), playing
 * (pause mark, "Pause preview"), loading (disabled). Report them with
 * previewingId / previewLoadingId. With NO onPreview wired the control DISABLES
 * rather than disappears (speech-input: a control that pretends to work is the lie).
 *
 * THE UPSTREAM TRAPS, PRESERVED AT BYTE PARITY:
 *  - useVoiceSelector() outside <VoiceSelector> throws
 *    'VoiceSelector components must be used within VoiceSelector'.
 *  - The accent lookup is CASE-SENSITIVE — "AMERICAN" renders no flag (voice-selector.logic).
 *  - Unknown genders fall back to a default mark rather than throwing.
 *  - Type-to-filter with an explicit empty state (the command atom's).
 *
 * DROPPED ON THE RECORD: VoiceSelectorShortcut (⌘ hints — no ⌘ on a phone, PRD port
 * advice) and VoiceSelectorDialog (the ⌘K dialog variant — the bottom sheet IS the
 * presentation). Input/List/Item/Empty are absorbed into the command atom; rows are
 * data-driven because the list is a FlatList (the KB: "a voice picker can carry
 * hundreds of entries").
 *
 * Composition:
 *   <VoiceSelector voices={VOICES} value={v} onValueChange={setV} onPreview={play}
 *                  previewingId={playingId} previewLoadingId={loadingId}>
 *     <VoiceSelectorTrigger />
 *   </VoiceSelector>
 */

const genderIcons: Record<string, LucideIcon> = {
  male: MarsIcon,
  female: VenusIcon,
  transgender: TransgenderIcon,
  'non-binary': NonBinaryIcon,
  unknown: UserIcon,
};

type VoiceSelectorContextValue = {
  value: string | undefined;
  setValue: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The roster, so the default trigger can resolve an id to its NAME. */
  voices: readonly VoiceSelectorVoice[];
};

const VoiceSelectorContext = React.createContext<VoiceSelectorContextValue | null>(null);

/**
 * The web hook, byte-shape ({ value, setValue, open, setOpen }) and byte-trap
 * (throws outside the provider). setValue notifies onValueChange WITHOUT closing —
 * the row press is what selects-and-closes, the hook is the programmatic seam.
 */
function useVoiceSelector(): VoiceSelectorContextValue {
  const ctx = React.useContext(VoiceSelectorContext);
  if (!ctx) {
    throw new Error('VoiceSelector components must be used within VoiceSelector');
  }
  return ctx;
}

type VoiceSelectorProps = {
  /** The voices YOUR provider offers — native TTS or a hosted roster. */
  voices: readonly VoiceSelectorVoice[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  /** Play this voice's sample. Absent → every preview control DISABLES, never fakes. */
  onPreview?: (voice: VoiceSelectorVoice) => void;
  /** The voice whose sample is currently playing (pause mark on that row). */
  previewingId?: string;
  /** The voice whose sample is loading (disabled control on that row). */
  previewLoadingId?: string;
  open?: boolean;
  /** The web contract ships defaultOpen; the sheet opens closed without it. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** The sheet's screen-reader title — the web Content's `title` prop. */
  title?: string;
  /** Passed to the sheet content — height and padding adjustments. */
  className?: string;
  children?: React.ReactNode;
};

function VoiceSelector({
  voices,
  value,
  onValueChange,
  onPreview,
  previewingId,
  previewLoadingId,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  placeholder = 'Search voices…',
  emptyTitle = 'No voices found',
  emptyDescription = 'Try a different search.',
  title = 'Select AI Voice',
  className,
  children,
}: VoiceSelectorProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const setValue = React.useCallback(
    (next: string) => {
      onValueChange(next);
    },
    [onValueChange],
  );

  const items = React.useMemo(
    () =>
      voices.map((v) => ({
        value: v.id,
        label: v.name,
        description: v.description,
        keywords: [v.accent, v.age, v.keywords].filter(Boolean).join(' ') || undefined,
        group: v.group,
      })),
    [voices],
  );
  const voicesById = React.useMemo(
    () => new Map(voices.map((v) => [v.id, v])),
    [voices],
  );

  function renderRow({ item, selected }: { item: CommandItem; selected: boolean }) {
    const voice = voicesById.get(item.value);
    if (!voice) return null;
    return (
      <Item
        variant={selected ? 'muted' : 'default'}
        onPress={() => {
          onValueChange(voice.id);
          setOpen(false);
        }}
      >
        <ItemContent>
          <VoiceSelectorName>{voice.name}</VoiceSelectorName>
          <VoiceSelectorAttributes voice={voice} />
          {voice.description ? (
            <VoiceSelectorDescription>{voice.description}</VoiceSelectorDescription>
          ) : null}
        </ItemContent>
        <ItemActions>
          <VoiceSelectorPreview
            playing={voicePreviewState(voice.id, previewingId, previewLoadingId) === 'playing'}
            loading={voicePreviewState(voice.id, previewingId, previewLoadingId) === 'loading'}
            onPlay={onPreview ? () => onPreview(voice) : undefined}
          />
        </ItemActions>
      </Item>
    );
  }

  const contextValue = React.useMemo<VoiceSelectorContextValue>(
    () => ({ value, setValue, open, setOpen, voices }),
    [value, setValue, open, setOpen, voices],
  );

  return (
    <VoiceSelectorContext.Provider value={contextValue}>
      <Command
        open={open}
        onOpenChange={setOpen}
        items={items}
        value={value}
        onSelect={(next) => {
          onValueChange(next);
          setOpen(false);
        }}
        renderItem={renderRow}
        // The rows read previewingId/previewLoadingId from the closure — without
        // extraData the FlatList would keep stale rows while the sheet is open.
        extraData={[previewingId, previewLoadingId]}
        placeholder={placeholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        title={title}
        className={className}
      >
        {children}
      </Command>
    </VoiceSelectorContext.Provider>
  );
}

type VoiceSelectorTriggerProps = {
  /** Overrides the default outline button (web: children on the trigger). */
  children?: React.ReactNode;
  className?: string;
};

function VoiceSelectorTrigger({ children, className }: VoiceSelectorTriggerProps) {
  const { value, open, setOpen, voices } = useVoiceSelector();
  // The trigger reads the NAME, never the raw id (findMicRoute/resolveModelLabel
  // precedent — review M1: an id like 'voice-9f2a' is not a human label).
  const label = value === undefined ? 'Select voice' : (voices.find((v) => v.id === value)?.name ?? value);

  return (
    children ?? (
      <Button
        variant="outline"
        onPress={() => setOpen(!open)}
        accessibilityLabel={`Select voice, current: ${label}`}
        accessibilityState={{ expanded: open }}
        className={cn('justify-between gap-2', className)}
      >
        <Icon as={AudioLinesIcon} size={16} className="text-muted-foreground" />
        <Text numberOfLines={1} className="flex-1 text-left">
          {label}
        </Text>
        <Icon as={ChevronsUpDownIcon} size={16} className="shrink-0 text-muted-foreground" />
      </Button>
    )
  );
}

type VoiceSelectorNameProps = {
  children: string;
  className?: string;
};

/** The voice's display name — the web part, one Text. */
function VoiceSelectorName({ children, className }: VoiceSelectorNameProps) {
  return <ItemTitle className={className}>{children}</ItemTitle>;
}

type VoiceSelectorDescriptionProps = {
  children: string;
  className?: string;
};

/** The voice's optional second line — the web part, one Text. */
function VoiceSelectorDescription({ children, className }: VoiceSelectorDescriptionProps) {
  return <ItemDescription className={className}>{children}</ItemDescription>;
}

type VoiceSelectorAttributesProps = {
  voice: VoiceSelectorVoice;
  className?: string;
};

/**
 * The gender/accent/age line. Renders nothing when the voice carries no attribute
 * fields at all — the web composes the Attributes part per item, so a voice with no
 * attributes shows no line, not an empty one. Unknown accents leave a GAP (upstream's
 * empty span), never a placeholder glyph.
 */
function VoiceSelectorAttributes({ voice, className }: VoiceSelectorAttributesProps) {
  const flag = voiceAccentFlag(voice.accent);
  const age = voice.age?.trim();
  const hasAny = Boolean(voice.gender || flag || age);
  if (!hasAny) return null;

  const trailing = [flag, age].filter((part): part is string => Boolean(part)).join(' · ');

  return (
    <View className={cn('flex-row items-center gap-1', className)}>
      <VoiceSelectorGender value={voice.gender} />
      {trailing ? (
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {trailing}
        </Text>
      ) : null}
    </View>
  );
}

type VoiceSelectorGenderProps = {
  /** 'male' | 'female' | 'transgender' | 'non-binary' — anything else renders the default mark. */
  value?: string;
  className?: string;
};

/**
 * The gender mark. Omitted or unknown → the default UserIcon (upstream: omit renders
 * the default icon; unknown values fall back rather than throwing).
 */
function VoiceSelectorGender({ value, className }: VoiceSelectorGenderProps) {
  const gender = resolveVoiceGender(value);
  return (
    <View accessible accessibilityLabel={`Voice gender: ${gender}`}>
      <Icon
        as={genderIcons[gender]}
        size={12}
        className={cn('shrink-0 text-muted-foreground', className)}
      />
    </View>
  );
}

type VoiceSelectorAccentProps = {
  /** One of the 30 lowercase accent keys — CASE-SENSITIVE; unknown renders NOTHING. */
  value?: string;
  className?: string;
};

/**
 * The accent flag, upstream byte-behavior: exactly-lowercase keys render their flag
 * emoji; anything else renders nothing (the web's empty span — no placeholder).
 */
function VoiceSelectorAccent({ value, className }: VoiceSelectorAccentProps) {
  const flag = voiceAccentFlag(value);
  if (!flag) return null;
  return (
    <Text className={cn('text-xs text-muted-foreground', className)} accessibilityLabel={value}>
      {flag}
    </Text>
  );
}

type VoiceSelectorAgeProps = {
  children?: string;
  className?: string;
};

/** The free-text age band ("40-50") — the web part. */
function VoiceSelectorAge({ children, className }: VoiceSelectorAgeProps) {
  if (!children) return null;
  return <Text className={cn('text-xs text-muted-foreground', className)}>{children}</Text>;
}

type VoiceSelectorBulletProps = ViewProps;

/** The attributes separator, for consumers composing their own attribute line. */
function VoiceSelectorBullet({ className, ...props }: VoiceSelectorBulletProps) {
  return (
    <Text className={cn('text-xs text-muted-foreground', className)} {...props}>
      ·
    </Text>
  );
}

type VoiceSelectorPreviewProps = {
  playing?: boolean;
  loading?: boolean;
  /** Play this row's sample. Absent → the control DISABLES, never disappears. */
  onPlay?: () => void;
  className?: string;
};

/**
 * THE TWO-TARGET LAW'S PLAY HALF. Lives in the row's action slot — a nested pressable
 * wins the touch over the row, so pressing this NEVER selects the voice. Three
 * states: play, playing (pause mark), loading (disabled) — and disabled-when-unwired
 * (no onPlay), because a control that pretends to play is the lie (speech-input).
 */
function VoiceSelectorPreview({ playing, loading, onPlay, className }: VoiceSelectorPreviewProps) {
  const label = loading ? 'Loading preview' : playing ? 'Pause preview' : 'Play preview';
  const icon = loading ? LoaderCircleIcon : playing ? PauseIcon : PlayIcon;

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={loading || !onPlay}
      onPress={onPlay}
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading || !onPlay, busy: loading }}
      // House formula (item/attachments precedent): h-10 + hitSlop 2/side = the 44pt
      // platform minimum, no pixel of extra chrome.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('shrink-0', className)}
    >
      <Icon as={icon} size={16} className="text-muted-foreground" />
    </Button>
  );
}

export {
  useVoiceSelector,
  VoiceSelector,
  VoiceSelectorAccent,
  VoiceSelectorAge,
  VoiceSelectorAttributes,
  VoiceSelectorBullet,
  VoiceSelectorDescription,
  VoiceSelectorGender,
  VoiceSelectorName,
  VoiceSelectorPreview,
  VoiceSelectorTrigger,
};
export type { VoiceSelectorVoice };
