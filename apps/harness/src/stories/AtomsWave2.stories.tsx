import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FolderIcon, PauseIcon, PlayIcon, SkipForwardIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/ui/button-group';
import { Command } from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import { Kbd } from '@/components/ui/kbd';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableCellText, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Text } from '@/components/ui/text';

const meta = { title: 'Base Primitives/Wave 2' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const BreadcrumbTrail: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem onPress={() => {}}>packages</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem onPress={() => {}}>registry</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem onPress={() => {}}>src</BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem current>conversation.tsx</BreadcrumbItem>
    </Breadcrumb>
  ),
};

export const SegmentedButtons: Story = {
  render: () => (
    <View className="gap-4">
      <Text variant="muted">Corner rounding comes from context — RN has no :first-child.</Text>
      <ButtonGroup>
        <ButtonGroupItem>
          <Button variant="outline" size="icon"><Icon as={SkipForwardIcon} size={16} /></Button>
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Button variant="outline" size="icon"><Icon as={PlayIcon} size={16} /></Button>
        </ButtonGroupItem>
        <ButtonGroupItem>
          <Button variant="outline" size="icon"><Icon as={PauseIcon} size={16} /></Button>
        </ButtonGroupItem>
      </ButtonGroup>
    </View>
  ),
};

export const Scrubber: Story = {
  render: () => {
    const [v, setV] = useState(0.35);
    return (
      <View className="gap-4">
        <Text variant="muted">Thumb hit area is 22pt around a 16pt thumb.</Text>
        <Slider value={v} onValueChange={(n: number[]) => setV((n[0] ?? 0) / 100)} />
        <Text className="text-sm text-muted-foreground">{Math.round(v * 100)}%</Text>
      </View>
    );
  },
};

export const DataTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead style={{ width: 140 }}><TableCellText>KEY</TableCellText></TableHead>
          <TableHead style={{ width: 120 }}><TableCellText>TYPE</TableCellText></TableHead>
          <TableHead style={{ width: 180 }}><TableCellText>DESCRIPTION</TableCellText></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[
          ['API_KEY', 'string', 'Provider credential'],
          ['MODEL', 'string', 'Default model id'],
          ['MAX_TOKENS', 'number', 'Response cap'],
        ].map(([k, t, d]) => (
          <TableRow key={k}>
            <TableCell style={{ width: 140 }}><TableCellText>{k}</TableCellText></TableCell>
            <TableCell style={{ width: 120 }}><TableCellText>{t}</TableCellText></TableCell>
            <TableCell style={{ width: 180 }}><TableCellText>{d}</TableCellText></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const CommandPalette: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('opus');
    return (
      <View className="gap-3">
        <Button onPress={() => setOpen(true)}><Text>Open palette</Text></Button>
        <Text variant="muted">Selected: {value}</Text>
        <Command
          open={open}
          onOpenChange={setOpen}
          value={value}
          onSelect={setValue}
          placeholder="Search models…"
          items={[
            { value: 'opus', label: 'Claude Opus 5', description: 'Most capable' },
            { value: 'sonnet', label: 'Claude Sonnet 5', description: 'Balanced' },
            { value: 'haiku', label: 'Claude Haiku 4.5', description: 'Fastest' },
          ]}
        />
      </View>
    );
  },
};

export const KeyboardHint: Story = {
  render: () => (
    <View className="gap-2">
      <Text variant="muted">Kbd renders null on a phone — correct, not a bug.</Text>
      <View className="flex-row items-center gap-2">
        <Text className="text-sm">Send</Text>
        <Kbd>⌘↵</Kbd>
        <Kbd always>⌘↵ (always)</Kbd>
      </View>
    </View>
  ),
};
