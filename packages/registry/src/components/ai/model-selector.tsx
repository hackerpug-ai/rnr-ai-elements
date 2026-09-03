import { Button } from '@/registry/{engine}/components/ui/button';
import { Command } from '@/registry/{engine}/components/ui/command';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { CheckIcon, ChevronsUpDownIcon, CpuIcon } from 'lucide-react-native';
import * as React from 'react';
import { Image } from 'react-native';
import {
  resolveModelLabel,
  toCommandItems,
  type ModelSelectorModel,
} from './model-selector.logic';
import type { CommandItem } from '../ui/command.logic';

/**
 * ModelSelector — the searchable model picker (UC-CHAT: choose which model your
 * route receives), composed on the `command` atom per the build plan.
 *
 * THE PRD VERDICT IS PORT-ADAPTED, PURE-RNR: "A dropdown on web; on mobile the
 * correct pattern is a bottom sheet with search, sized for one-handed use. Same
 * selection contract, different presentation." Every clause, realized:
 *
 *  - SAME SELECTION CONTRACT: `value` is the model id and `onValueChange` receives it —
 *    exactly what the web's ModelSelectorItem.value/onSelect produce and what your
 *    route consumes. `open`/`onOpenChange` stay controllable for programmatic open,
 *    with an internal default so a trigger-only consumer never sees the state.
 *  - BOTTOM SHEET WITH SEARCH: the command atom IS that surface — filter field, the
 *    provider as a search keyword (typing "openai" finds GPT rows), an explicit empty
 *    state, and a virtualized list. No autofocus: the web original's autofocused input
 *    is a desktop idiom that slams the keyboard up over the list (KB port advice).
 *  - PROVIDER GROUPING: ModelSelectorGroup headings survive as the command atom's
 *    group headers, in first-appearance order (model-selector.logic's toCommandItems).
 *
 * THE WEB'S MODEL SELECTOR SHORTCUT IS DROPPED, ON THE RECORD: ModelSelectorShortcut
 * renders ⌘-key hints — there is no ⌘ on a phone (PRD port advice: "Drop
 * ModelSelectorShortcut entirely").
 *
 * THE LOGO IS A DECLARED SUBSTITUTION (open-in-chat's brand-mark precedent): the web
 * derives a remote models.dev SVG per provider — RN Image cannot render SVG, and an
 * SVG element cannot receive className without the forbidden engine-specific
 * cssInterop. The row ships a themed CpuIcon in the logo slot;
 * ModelSelectorLogo accepts a consumer-supplied `source` (a bundled RASTER image —
 * PNG/data URI — not the upstream SVG URL), and modelSelectorLogoUrl keeps the web's
 * URL derivation as data for consumers who mirror the assets themselves.
 *
 * Composition:
 *   <ModelSelector models={MODELS} value={value} onValueChange={setValue}>
 *     <ModelSelectorTrigger />
 *   </ModelSelector>
 * The palette surface (search, groups, rows, empty state) is the command atom's —
 * there is no separate Content part to compose; the web's Input/List/Item/Empty parts
 * are absorbed into that substrate, and rows are data-driven because the list is a
 * FlatList (a composed-children API cannot virtualize).
 */

type ModelSelectorContextValue = {
  models: readonly ModelSelectorModel[];
  value: string | undefined;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const ModelSelectorContext = React.createContext<ModelSelectorContextValue | null>(null);

function useModelSelectorContext(): ModelSelectorContextValue {
  const ctx = React.useContext(ModelSelectorContext);
  if (!ctx) throw new Error('ModelSelector components must be used within ModelSelector');
  return ctx;
}

type ModelSelectorProps = {
  models: readonly ModelSelectorModel[];
  value: string | undefined;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** The sheet's screen-reader title. Defaults to "Select a model". */
  title?: string;
  /** Passed to the sheet content — height and padding adjustments. */
  className?: string;
  children?: React.ReactNode;
};

function ModelSelector({
  models,
  value,
  onValueChange,
  open: openProp,
  onOpenChange,
  placeholder = 'Search models…',
  emptyTitle = 'No models found',
  emptyDescription = 'Try a different search.',
  title = 'Select a model',
  className,
  children,
}: ModelSelectorProps) {
  // Controlled when `open` is supplied, internal otherwise — the web's open/
  // onOpenChange wires a ⌘K that does not exist here, but programmatic open is a
  // real consumer need (settings screens, toolbars).
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  const items = React.useMemo(() => toCommandItems(models), [models]);
  const contextValue = React.useMemo<ModelSelectorContextValue>(
    () => ({ models, value, open, setOpen }),
    [models, value, open, setOpen],
  );

  function renderRow({ item, selected }: { item: CommandItem; selected: boolean }) {
    return (
      <Item
        variant={selected ? 'muted' : 'default'}
        onPress={() => {
          onValueChange(item.value);
          setOpen(false);
        }}
      >
        <ItemMedia>
          <ModelSelectorLogo provider={item.group ?? ''} />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{item.label}</ItemTitle>
          {item.description ? <ItemDescription>{item.description}</ItemDescription> : null}
        </ItemContent>
        {selected ? (
          <ItemActions>
            <Icon as={CheckIcon} size={16} className="text-primary" />
          </ItemActions>
        ) : null}
      </Item>
    );
  }

  return (
    <ModelSelectorContext.Provider value={contextValue}>
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
    </ModelSelectorContext.Provider>
  );
}

type ModelSelectorTriggerProps = {
  /** Overrides the default outline button (web: children on the trigger). */
  children?: React.ReactNode;
  className?: string;
};

function ModelSelectorTrigger({ children, className }: ModelSelectorTriggerProps) {
  const { models, value, setOpen, open } = useModelSelectorContext();
  const label = resolveModelLabel(models, value);

  return (
    children ?? (
      <Button
        variant="outline"
        onPress={() => setOpen(!open)}
        accessibilityLabel={`Select model, current: ${label}`}
        accessibilityState={{ expanded: open }}
        className={cn('justify-between gap-2', className)}
      >
        <Icon as={CpuIcon} size={16} className="text-muted-foreground" />
        <Text numberOfLines={1} className="flex-1 text-left">
          {label}
        </Text>
        <Icon as={ChevronsUpDownIcon} size={16} className="shrink-0 text-muted-foreground" />
      </Button>
    )
  );
}

type ModelSelectorLogoProps = {
  provider: string;
  /** A bundled RASTER image source (PNG/data URI) — the upstream models.dev SVG does not render in RN Image. */
  source?: { uri: string };
  className?: string;
};

/**
 * The row's provider mark. With no consumer `source` it ships the themed CpuIcon —
 * the declared substitution for the web's remote SVG (see header). The derivation
 * stays available as data: modelSelectorLogoUrl(provider).
 */
function ModelSelectorLogo({ provider, source, className }: ModelSelectorLogoProps) {
  if (source) {
    return (
      <Image
        source={source}
        resizeMode="contain"
        className={cn('size-4', className)}
        // Belt-and-braces numeric sizing (attachments.tsx hardening rule) — as a
        // FALLBACK only (review m2): an explicit consumer className wins over the
        // 16px default instead of being silently overridden by the inline style.
        style={className ? undefined : { width: 16, height: 16 }}
        accessibilityLabel={`${provider} logo`}
      />
    );
  }
  return <Icon as={CpuIcon} size={16} className={cn('text-muted-foreground', className)} />;
}

export { ModelSelector, ModelSelectorLogo, ModelSelectorTrigger };
export type { ModelSelectorModel };
