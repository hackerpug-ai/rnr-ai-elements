import { Button } from '@/registry/{engine}/components/ui/button';
import { Command } from '@/registry/{engine}/components/ui/command';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  AudioLinesIcon,
  BluetoothIcon,
  ChevronDownIcon,
  HeadphonesIcon,
  MicIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import {
  findMicRoute,
  orderMicRoutes,
  type MicRoute,
  type MicRouteKind,
} from './mic-selector.logic';
import type { CommandItem } from '../ui/command.logic';

/**
 * MicSelector — the audio input route picker (UC-VOICE-01 AC-3: "choose an audio
 * input route such as built-in microphone, wired headset, or Bluetooth from a native
 * route picker").
 *
 * THE PRD VERDICT IS NATIVE-SUBSTITUTE, PURE-RNR: "Web enumerates input devices
 * through the media devices API. iOS and Android do not expose an enumerable input
 * device list; they expose audio routes. Ships as a route picker (built-in, wired,
 * Bluetooth) with the same product job." The substitution lands in the CONTRACT, not
 * the component: the route list is CALLER-SUPPLIED, because enumeration is the one
 * part with no honest registry implementation — AVAudioSession inputs on iOS and
 * Android's audio routing live behind platform APIs (and outside Expo Go), and
 * guessing routes would ship a lie. The web's useAudioDevices hook (getUserMedia)
 * does NOT port; there is no hook here.
 *
 * PERMISSION IS THE CALLER'S TOO (speech-input's framing). The web original requests
 * microphone permission on open and shows an empty list until it is granted; here an
 * empty route list renders the empty state, and `emptyTitle`/`emptyDescription` exist
 * so a consumer can say "Microphone access denied" when that is WHY the list is
 * empty. The component cannot know why its list is empty, and pretending otherwise
 * would be the lie.
 *
 * THE SURFACE IS THE COMMAND ATOM per the build plan ("command backs model-selector,
 * voice-selector and mic-selector") — the same sheet+filter+list muscle memory as the
 * other two selectors, with the filter carrying route labels and kinds. The web's
 * Input/List/Item/Empty parts are absorbed into that substrate; MicSelectorLabel
 * (Chrome's "(XXXX:XXXX)" hardware-ID stripper) is dead code natively per the KB.
 *
 * Composition:
 *   <MicSelector routes={routes} value={value} onValueChange={setValue}>
 *     <MicSelectorTrigger />
 *   </MicSelector>
 */

/** The route-kind → mark map. Kind is identity, never the sole channel — the label carries it too. */
const routeKindIcons: Record<MicRouteKind, LucideIcon> = {
  'built-in': MicIcon,
  wired: HeadphonesIcon,
  bluetooth: BluetoothIcon,
  other: AudioLinesIcon,
};

type MicSelectorContextValue = {
  routes: readonly MicRoute[];
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MicSelectorContext = React.createContext<MicSelectorContextValue | null>(null);

function useMicSelectorContext(): MicSelectorContextValue {
  const ctx = React.useContext(MicSelectorContext);
  if (!ctx) throw new Error('MicSelector components must be used within MicSelector');
  return ctx;
}

type MicSelectorProps = {
  /** The routes YOUR platform exposes — the registry cannot enumerate them for you. */
  routes: readonly MicRoute[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyTitle?: string;
  /** Say WHY the list is empty when you know — "Microphone access denied", not "None". */
  emptyDescription?: string;
  /** The sheet's screen-reader title. Defaults to "Choose an input route". */
  title?: string;
  /** Passed to the sheet content — height and padding adjustments. */
  className?: string;
  children?: React.ReactNode;
};

function MicSelector({
  routes,
  value,
  onValueChange,
  open: openProp,
  onOpenChange,
  placeholder = 'Filter routes…',
  emptyTitle = 'No input routes',
  emptyDescription = 'No audio input routes are available right now.',
  title = 'Choose an input route',
  className,
  children,
}: MicSelectorProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  // Built-in first, wired, bluetooth, other — caller order kept within a kind.
  const ordered = React.useMemo(() => orderMicRoutes(routes), [routes]);
  const items = React.useMemo(
    () =>
      ordered.map((r) => ({
        value: r.id,
        label: r.label,
        description: r.kind && r.kind !== 'other' ? r.kind : undefined,
        keywords: r.kind,
        group: undefined,
      })),
    [ordered],
  );

  const contextValue = React.useMemo<MicSelectorContextValue>(
    () => ({ routes, value, open, setOpen }),
    [routes, value, open, setOpen],
  );

  function renderRow({ item, selected }: { item: CommandItem; selected: boolean }) {
    // kind rides `keywords` (set when the rows were built); 'other' and absent fall
    // to the generic mark. The label still carries the kind — the icon is never the
    // sole channel.
    const kind = (routeKindIcons as Record<string, LucideIcon>)[item.keywords ?? '']
      ? (item.keywords as MicRouteKind)
      : 'other';
    return (
      <Item
        variant={selected ? 'muted' : 'default'}
        onPress={() => {
          onValueChange(item.value);
          setOpen(false);
        }}
      >
        <ItemMedia>
          <Icon as={routeKindIcons[kind]} size={16} className="text-muted-foreground" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{item.label}</ItemTitle>
          {/* The kind is ANNOUNCED, not just iconized (review M2) — the icon alone
              can't tell a screen reader "Car Stereo" is a Bluetooth route. */}
          <ItemDescription>{item.description}</ItemDescription>
        </ItemContent>
      </Item>
    );
  }

  return (
    <MicSelectorContext.Provider value={contextValue}>
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
        placeholder={placeholder}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        title={title}
        className={className}
      >
        {children}
      </Command>
    </MicSelectorContext.Provider>
  );
}

type MicSelectorTriggerProps = {
  /** Overrides the default outline button (web: children on the trigger). */
  children?: React.ReactNode;
  className?: string;
};

function MicSelectorTrigger({ children, className }: MicSelectorTriggerProps) {
  const { routes, value, setOpen, open } = useMicSelectorContext();
  const selected = findMicRoute(routes, value);
  const label = selected?.label ?? 'Input';

  return (
    children ?? (
      <Button
        variant="outline"
        onPress={() => setOpen(!open)}
        accessibilityLabel={`Choose input route, current: ${label}`}
        accessibilityState={{ expanded: open }}
        className={cn('justify-between gap-2', className)}
      >
        <Icon as={MicIcon} size={16} className="text-muted-foreground" />
        <Text numberOfLines={1} className="flex-1 text-left">
          {label}
        </Text>
        <Icon as={ChevronDownIcon} size={16} className="shrink-0 text-muted-foreground" />
      </Button>
    )
  );
}

type MicSelectorValueProps = {
  /** The placeholder when nothing is selected — the web part's own fallback text. */
  placeholder?: string;
  className?: string;
};

/**
 * The selected route's label, for consumers composing a custom trigger — the web
 * part-set's MicSelectorValue. Renders the placeholder when the value matches
 * nothing, because a disconnected route should read as unselected, not as a lie.
 */
function MicSelectorValue({ placeholder = 'Input', className }: MicSelectorValueProps) {
  const { routes, value } = useMicSelectorContext();
  const selected = findMicRoute(routes, value);
  return (
    <Text numberOfLines={1} className={className}>
      {selected?.label ?? placeholder}
    </Text>
  );
}

export { MicSelector, MicSelectorTrigger, MicSelectorValue, routeKindIcons };
export type { MicRoute, MicRouteKind };
