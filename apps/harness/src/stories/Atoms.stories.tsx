import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FileTextIcon, InboxIcon, SearchIcon, SendIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Empty, EmptyActions, EmptyDescription, EmptyIcon, EmptyTitle } from '@/components/ui/empty';
import { Icon } from '@/components/ui/icon';
import {
  InputGroup,
  InputGroupActions,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Text } from '@/components/ui/text';

/**
 * Base primitives THIS library ships because RNR does not. Every one is justified by an
 * in-scope AI Element — see design/build-plan.md. RNR's own components are not storied
 * here; consumers get those from RNR.
 */
const meta = { title: 'Base Primitives' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyState: Story = {
  render: () => (
    <View className="h-80 rounded-md border border-border">
      <Empty>
        <EmptyIcon as={InboxIcon} />
        <EmptyTitle>No messages yet</EmptyTitle>
        <EmptyDescription>
          Start the conversation, or pick one of the suggestions below.
        </EmptyDescription>
        <EmptyActions>
          <Button size="sm">
            <Text>New chat</Text>
          </Button>
        </EmptyActions>
      </Empty>
    </View>
  ),
};

export const ItemRows: Story = {
  render: () => (
    <View className="gap-2">
      <Item variant="outline">
        <ItemMedia>
          <Icon as={FileTextIcon} size={20} className="text-muted-foreground" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>metro.config.js</ItemTitle>
          <ItemDescription>Modified · 2 additions, 1 deletion</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Text className="text-muted-foreground">+2</Text>
        </ItemActions>
      </Item>
      <Item variant="muted" onPress={() => {}}>
        <ItemContent>
          <ItemTitle>Pressable row</ItemTitle>
          <ItemDescription>Has an active: state and 44pt hit area via hitSlop</ItemDescription>
        </ItemContent>
      </Item>
      <Item>
        <ItemContent>
          <ItemTitle>Plain row</ItemTitle>
          <ItemDescription>Descriptions truncate at two lines</ItemDescription>
        </ItemContent>
      </Item>
    </View>
  ),
};

export const InputGroupFocusRing: Story = {
  render: () => {
    const [v, setV] = useState('');
    return (
      <View className="gap-3">
        <Text variant="muted">Tap the field — the ring is state-driven, not :focus-within.</Text>
        <InputGroup>
          <InputGroupAddon>
            <Icon as={SearchIcon} size={16} className="text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Ask anything…" value={v} onChangeText={setV} />
          <InputGroupActions>
            <Button size="icon" variant="ghost" disabled={!v}>
              <Icon as={SendIcon} size={16} />
            </Button>
          </InputGroupActions>
        </InputGroup>
      </View>
    );
  },
};

export const SheetBottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <Text>Open sheet</Text>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>
            <Text className="text-base font-medium text-foreground">Choose a model</Text>
          </SheetTitle>
          <SheetDescription>
            <Text className="text-sm text-muted-foreground">
              On a phone a dropdown, a command palette and a side panel all collapse to this.
            </Text>
          </SheetDescription>
        </SheetHeader>
        <View className="gap-2 pt-2">
          {['Claude Opus 5', 'Claude Sonnet 5', 'Claude Haiku 4.5'].map((m) => (
            <Item key={m} variant="outline" onPress={() => {}}>
              <ItemContent>
                <ItemTitle>{m}</ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </View>
      </SheetContent>
    </Sheet>
  ),
};
