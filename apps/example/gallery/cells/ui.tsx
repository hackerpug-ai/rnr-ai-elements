/**
 * Seeded matrix cells — UI primitives. The registry's own data wherever a
 * stranger reads it: real paths, real counts, real commands.
 */
import { FolderIcon, SearchIcon, TerminalIcon } from 'lucide-react-native';
import * as React from 'react';
import { Text } from 'react-native';

import { Shimmer } from '@/components/ai/shimmer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import {
  CodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
} from '@/components/ui/code-block';
import { Command } from '@/components/ui/command';
import {
  Empty,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Kbd } from '@/components/ui/kbd';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCell,
  TableCellText,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { ItemCells } from '../cells';

const REGISTRY_KINDS = `registry: component — 39 items
  ui — 11 items
  lib — 6 items`;

export const UI_CELLS: Record<string, ItemCells> = {
  breadcrumb: {
    populated: () => (
      <Breadcrumb>
        <BreadcrumbItem onPress={() => {}}>
          <Text className="text-sm text-muted-foreground">apps</Text>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem onPress={() => {}}>
          <Text className="text-sm text-muted-foreground">example</Text>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem current>
          <Text className="text-sm text-foreground">conversation.tsx</Text>
        </BreadcrumbItem>
      </Breadcrumb>
    ),
    empty: () => (
      <Breadcrumb>
        <BreadcrumbItem current>
          <Text className="text-sm text-muted-foreground">(root)</Text>
        </BreadcrumbItem>
      </Breadcrumb>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">resolving path…</Text>
      </Shimmer>
    ),
    error: () => (
      <Breadcrumb>
        <BreadcrumbItem>
          <Text className="text-sm text-destructive">…/deleted-path (gone)</Text>
        </BreadcrumbItem>
      </Breadcrumb>
    ),
  },
  'button-group': {
    populated: () => (
      <ButtonGroup>
        <ButtonGroupItem>
          <Button variant="ghost" className="flex-1">
            <Text>Nativewind</Text>
          </Button>
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Button variant="ghost" className="flex-1">
            <Text>Uniwind</Text>
          </Button>
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Button variant="ghost" className="flex-1">
            <Text>Both</Text>
          </Button>
        </ButtonGroupItem>
      </ButtonGroup>
    ),
    empty: () => (
      <ButtonGroup>
        <Text className="text-sm text-muted-foreground">(no options)</Text>
      </ButtonGroup>
    ),
    loading: () => (
      <ButtonGroup>
        <ButtonGroupItem>
          <Shimmer active>
            <Text className="px-4 text-sm">…</Text>
          </Shimmer>
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Shimmer active>
            <Text className="px-4 text-sm">…</Text>
          </Shimmer>
        </ButtonGroupItem>
      </ButtonGroup>
    ),
    error: () => (
      <ButtonGroup>
        <ButtonGroupItem>
          <Button variant="ghost" disabled className="flex-1">
            <Text>Unavailable</Text>
          </Button>
        </ButtonGroupItem>
      </ButtonGroup>
    ),
  },
  'code-block': {
    populated: () => (
      <CodeBlock
        code={"export function resolveEngine(value: string, engine: Engine): string {\n  return value.split('{engine}').join(engine);\n}"}
        language="ts"
      >
        <CodeBlockHeader>
          <Text className="text-xs text-muted-foreground">build-registry.ts</Text>
          <CodeBlockCopyButton />
        </CodeBlockHeader>
        <CodeBlockContent />
      </CodeBlock>
    ),
    empty: () => (
      <CodeBlock code="" language="ts">
        <CodeBlockContent />
      </CodeBlock>
    ),
    loading: () => (
      <CodeBlock code="export function…">
        <Shimmer active>
          <Text className="text-sm">streaming the fence body…</Text>
        </Shimmer>
        <CodeBlockContent />
      </CodeBlock>
    ),
    error: () => (
      <CodeBlock code={'```\nunterminated fence — the stream cut here'}>
        <CodeBlockContent />
      </CodeBlock>
    ),
  },
  command: {
    populated: () => (
      <Command
        open={false}
        onOpenChange={() => {}}
        value="conversation"
        onSelect={() => {}}
        placeholder="Search the registry…"
        items={[
          { value: 'conversation', label: 'Conversation', description: 'Virtualized transcript', group: 'Components' },
          { value: 'prompt-input', label: 'Prompt Input', description: 'The composer', group: 'Components' },
          { value: 'button', label: 'Button', group: 'UI primitives' },
        ]}
      />
    ),
    empty: () => (
      <Command open={false} onOpenChange={() => {}} value={undefined} onSelect={() => {}} items={[]} placeholder="No items match" />
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">filtering items…</Text>
      </Shimmer>
    ),
    error: () => (
      <Command
        open={false}
        onOpenChange={() => {}}
        value={undefined}
        onSelect={() => {}}
        items={[{ value: 'err', label: 'Registry fetch failed' }]}
        placeholder="Registry unavailable"
      />
    ),
  },
  empty: {
    populated: () => (
      <Empty>
        <EmptyIcon icon={SearchIcon} />
        <EmptyTitle>
          <Text className="text-sm font-medium text-foreground">No matching items</Text>
        </EmptyTitle>
        <EmptyDescription>
          <Text className="text-sm text-muted-foreground">
            Nothing in the 56-item set matches that filter.
          </Text>
        </EmptyDescription>
      </Empty>
    ),
    empty: () => (
      <Empty>
        <EmptyTitle>
          <Text className="text-sm font-medium text-muted-foreground">(nothing here)</Text>
        </EmptyTitle>
      </Empty>
    ),
    loading: () => (
      <Empty>
        <Shimmer active>
          <Text className="text-sm">deciding what to show…</Text>
        </Shimmer>
      </Empty>
    ),
    error: () => (
      <Empty>
        <EmptyIcon icon={TerminalIcon} />
        <EmptyTitle>
          <Text className="text-sm font-medium text-destructive">The surface failed to load</Text>
        </EmptyTitle>
        <EmptyDescription>
          <Text className="text-sm text-muted-foreground">The registry returned 404 at the pinned tag.</Text>
        </EmptyDescription>
      </Empty>
    ),
  },
  'input-group': {
    populated: () => (
      <InputGroup>
        <InputGroupAddon>
          <Text className="text-sm text-muted-foreground">$</Text>
        </InputGroupAddon>
        <InputGroupInput placeholder="pnpm registry:build" />
        <InputGroupAddon>
          <FolderIcon size={14} className="text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    ),
    empty: () => (
      <InputGroup>
        <InputGroupInput placeholder="" />
      </InputGroup>
    ),
    loading: () => (
      <InputGroup>
        <InputGroupAddon>
          <Shimmer active>
            <Text className="text-sm">…</Text>
          </Shimmer>
        </InputGroupAddon>
        <InputGroupInput placeholder="resolving…" />
      </InputGroup>
    ),
    error: () => (
      <InputGroup>
        <InputGroupInput placeholder="A required field" />
      </InputGroup>
    ),
  },
  item: {
    populated: () => (
      <Item onPress={() => {}}>
        <ItemContent>
          <ItemTitle>
            <Text className="text-sm font-medium text-foreground">conversation.json</Text>
          </ItemTitle>
          <ItemDescription>
            <Text className="text-xs text-muted-foreground">
              Virtualized transcript · uniwind · v0.2.0
            </Text>
          </ItemDescription>
        </ItemContent>
      </Item>
    ),
    empty: () => (
      <Item>
        <ItemContent>
          <ItemTitle>
            <Text className="text-sm text-muted-foreground">(empty row)</Text>
          </ItemTitle>
        </ItemContent>
      </Item>
    ),
    loading: () => (
      <Item>
        <ItemContent>
          <Shimmer active>
            <Text className="text-sm">loading row…</Text>
          </Shimmer>
        </ItemContent>
      </Item>
    ),
    error: () => (
      <Item>
        <ItemContent>
          <ItemTitle>
            <Text className="text-sm text-destructive">failed.json</Text>
          </ItemTitle>
          <ItemDescription>
            <Text className="text-xs text-muted-foreground">the item 404'd at the tag</Text>
          </ItemDescription>
        </ItemContent>
      </Item>
    ),
  },
  kbd: {
    populated: () => <Kbd>⌘K</Kbd>,
    empty: () => (
      <Text className="text-sm text-muted-foreground">
        (Kbd renders null on phones — no hardware keyboard)
      </Text>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">⌘…</Text>
      </Shimmer>
    ),
    error: () => (
      <Text className="text-sm text-muted-foreground">
        (no keyboard shortcut exists for this surface)
      </Text>
    ),
  },
  sheet: {
    populated: () => (
      <Sheet>
        <SheetTrigger>
          <Text className="text-sm text-primary">Open the install sheet</Text>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              <Text className="text-sm font-medium text-foreground">Install conversation.json</Text>
            </SheetTitle>
            <SheetDescription>
              <Text className="text-sm text-muted-foreground">
                Runs the real RNR CLI against the v0.2.0 tag.
              </Text>
            </SheetDescription>
          </SheetHeader>
          <SheetClose>
            <Text className="text-sm text-primary">Close</Text>
          </SheetClose>
        </SheetContent>
      </Sheet>
    ),
    empty: () => (
      <Sheet>
        <SheetTrigger>
          <Text className="text-sm text-muted-foreground">(nothing to show)</Text>
        </SheetTrigger>
      </Sheet>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">mounting sheet…</Text>
      </Shimmer>
    ),
    error: () => (
      <Sheet>
        <SheetTrigger>
          <Text className="text-sm text-destructive">Open (host unavailable)</Text>
        </SheetTrigger>
      </Sheet>
    ),
  },
  slider: {
    populated: () => (
      <>
        <Slider value={0.8} onValueChange={() => {}} />
        <Text className="mt-1 text-xs text-muted-foreground">Volume — 80%</Text>
      </>
    ),
    empty: () => (
      <>
        <Slider value={0} onValueChange={() => {}} />
        <Text className="mt-1 text-xs text-muted-foreground">Volume — muted</Text>
      </>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">attaching value listener…</Text>
      </Shimmer>
    ),
    error: () => (
      <>
        <Slider value={0} />
        <Text className="mt-1 text-xs text-destructive">the engine volume read failed</Text>
      </>
    ),
  },
  table: {
    populated: () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TableCellText className="text-xs font-medium">Kind</TableCellText>
            </TableHead>
            <TableHead>
              <TableCellText className="text-xs font-medium">Count</TableCellText>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <TableCellText className="text-sm">component</TableCellText>
            </TableCell>
            <TableCell>
              <TableCellText className="text-sm">39</TableCellText>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TableCellText className="text-sm">ui</TableCellText>
            </TableCell>
            <TableCell>
              <TableCellText className="text-sm">11</TableCellText>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <TableCellText className="text-sm">lib</TableCellText>
            </TableCell>
            <TableCell>
              <TableCellText className="text-sm">6</TableCellText>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
    empty: () => (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <TableCellText className="text-xs font-medium">(no columns)</TableCellText>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody />
      </Table>
    ),
    loading: () => (
      <Shimmer active>
        <Text className="text-sm">hydrating rows…</Text>
      </Shimmer>
    ),
    error: () => (
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <TableCellText className="text-sm text-destructive">
                row fetch failed — the source 404'd
              </TableCellText>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
};
