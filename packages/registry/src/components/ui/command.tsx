import { Empty, EmptyDescription, EmptyIcon, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/registry/{engine}/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/registry/{engine}/components/ui/item';
import { Sheet, SheetContent, useSheetPortalHost } from '@/registry/{engine}/components/ui/sheet';
import { cn } from '@/registry/{engine}/lib/utils';
import { SearchIcon, SearchXIcon } from 'lucide-react-native';
import * as React from 'react';
import { FlatList, View } from 'react-native';

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
 * Anything overlay-shaped opened from inside must use the sheet's own portal host, or it
 * renders behind the sheet. `useCommandPortalHost()` re-exports it for that.
 */

export type CommandItem = { value: string; label: string; description?: string; keywords?: string };

type CommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: readonly CommandItem[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
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
  className,
  children,
}: CommandProps) {
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.label} ${i.description ?? ''} ${i.keywords ?? ''}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Reset the filter when the palette closes, so reopening is not mid-search.
  React.useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {children}
      <SheetContent side="bottom" className={cn('h-3/4', className)}>
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
            data={filtered}
            keyExtractor={(i: CommandItem) => i.value}
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="gap-1 pb-4"
            renderItem={({ item }: { item: CommandItem }) => (
              <Item
                variant={item.value === value ? 'muted' : 'default'}
                onPress={() => {
                  onSelect(item.value);
                  onOpenChange(false);
                }}
              >
                <ItemContent>
                  <ItemTitle>{item.label}</ItemTitle>
                  {item.description ? <ItemDescription>{item.description}</ItemDescription> : null}
                </ItemContent>
              </Item>
            )}
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
