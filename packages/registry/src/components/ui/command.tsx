import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/{engine}/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/registry/{engine}/components/ui/item';
import { Sheet, SheetContent, SheetTitle, useSheetPortalHost } from '@/registry/{engine}/components/ui/sheet';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { SearchIcon, SearchXIcon } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import {
  buildCommandRows,
  filterCommandItems,
  type CommandItem,
  type CommandRow,
} from './command.logic';

/**
 * Command — the searchable picker.
 *
 * cmdk is DOM- and keyboard-first and has no mobile analogue: there is no ⌘K, no arrow-key
 * navigation, and no hover highlight. On a phone the command palette IS A BOTTOM SHEET
 * with a filter field and a virtualized list, so that is what this is.
 *
 * Backs model-selector, voice-selector and mic-selector.
 *
 * VIRTUALIZED — a FlatList, not a mapped ScrollView. A voice picker can carry hundreds of
 * entries and this is the surface where that shows.
 *
 * GROUPING — CommandItem carries an optional `group`; buildCommandRows (command.logic)
 * interleaves one heading per group, in first-appearance order, after the filter runs
 * (a group whose items all fail the filter renders no header).
 *
 * CUSTOM ROWS — `renderItem` replaces the default item-atom row for palettes whose rows
 * carry more than title + description (voice-selector's two-target preview row). It
 * receives the item and the selection state; the default row is what mic-selector uses.
 *
 * TITLE — an optional SheetTitle. A dialog with no title is an a11y hole, and
 * voice-selector's upstream contract ships one ("Select AI Voice").
 *
 * Anything overlay-shaped opened from inside must use the sheet's own portal host, or it
 * renders behind the sheet. `useCommandPortalHost()` re-exports it for that.
 */

export type { CommandItem };

type CommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandItem[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Sheet title — announced by screen readers; renders as the palette's heading row. */
  title?: string;
  className?: string;
  /** Replace the default item-atom row. Receives the item and its selection state. */
  renderItem?: (info: { item: CommandItem; selected: boolean }) => React.ReactNode;
  /**
   * FlatList extraData — pass any state your renderItem reads from outside `items`
   * (voice-selector's previewing/previewLoading ids). Without it the list would keep
   * stale rows while the sheet is open.
   */
  extraData?: unknown;
  children?: React.ReactNode;
};

/** The sheet's portal host — pass to any overlay nested inside the palette. */
const useCommandPortalHost = useSheetPortalHost;

function Command({
  open,
  onOpenChange,
  items,
  value,
  onSelect,
  placeholder = 'Search…',
  emptyTitle = 'No matches',
  emptyDescription = 'Try a different search.',
  title,
  className,
  renderItem,
  extraData,
  children,
}: CommandProps) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(
    () => filterCommandItems(items, query),
    [items, query],
  );
  const rows = React.useMemo(() => buildCommandRows(filtered, value), [filtered, value]);

  // Reset the filter when the palette closes, so reopening is not mid-search.
  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  function renderRow({ item }: { item: CommandRow }): React.ReactElement | null {
    if (item.kind === 'header') {
      return (
        <Text
          accessibilityRole="header"
          className="px-3 pb-1 pt-3 text-xs font-medium uppercase text-muted-foreground"
        >
          {item.label}
        </Text>
      );
    }
    if (renderItem) {
      // The public contract is ReactNode (lenient for consumers); the list needs an
      // element or null, so a bare string/number render collapses here.
      return renderItem({ item: item.item, selected: item.selected }) as React.ReactElement | null;
    }
    return (
      <Item
        variant={item.selected ? 'muted' : 'default'}
        onPress={() => {
          onSelect(item.item.value);
          onOpenChange(false);
        }}
      >
        <ItemContent>
          <ItemTitle>{item.item.label}</ItemTitle>
          {item.item.description ? (
            <ItemDescription>{item.item.description}</ItemDescription>
          ) : null}
        </ItemContent>
      </Item>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
      <SheetContent side="bottom" className={cn('h-3/4', className)}>
        {title ? (
          <SheetTitle className="text-base font-semibold text-foreground">
            {title}
          </SheetTitle>
        ) : null}
        <InputGroup>
          <InputGroupAddon>
            <Icon as={SearchIcon} size={16} className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder={placeholder}
            value={query}
            onChangeText={setQuery}
            // Do NOT autofocus: on mobile that slams the keyboard up over the list the
            // user came to read.
            autoFocus={false}
            accessibilityLabel={placeholder}
          />
        </InputGroup>

        {filtered.length === 0 ? (
          <Empty className="py-10">
            <EmptyIcon as={SearchXIcon} />
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </Empty>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(r: CommandRow) => r.key}
            renderItem={renderRow}
            extraData={extraData}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-1 pb-4"
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

/** Optional trailing slot inside the palette, above the list. */
function CommandFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex-row items-center gap-2 pt-2', className)} {...props} />;
}

export { Command, CommandFooter, useCommandPortalHost };
