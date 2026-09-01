import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/**
 * The Engine toolbar item reports which styling engine rendered this. Every value below
 * comes from the consumer theme in global.css — RNR's own tokens — so both engines must
 * produce visually identical output. Any difference between :6006 and :6007 is a defect.
 */
const meta = {
  title: 'RNR Base/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'default', size: 'default', disabled: false },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <Button {...args}>
      <Text>Button</Text>
    </Button>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <View className="gap-2">
      {(['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] as const).map((v) => (
        <Button key={v} variant={v}>
          <Text>{v}</Text>
        </Button>
      ))}
    </View>
  ),
};

/** Token-driven surfaces — the shape AI Elements tool cards will use. */
export const ThemedSurfaces: Story = {
  render: () => (
    <View className="gap-3">
      <View className="rounded-md border border-border bg-card p-3">
        <Text className="text-card-foreground">bg-card · border-border</Text>
      </View>
      <View className="rounded-md bg-muted/50 p-3">
        <Text className="text-muted-foreground">bg-muted/50 · text-muted-foreground</Text>
      </View>
      <View className="rounded-md bg-primary p-3">
        <Text className="text-primary-foreground">bg-primary · text-primary-foreground</Text>
      </View>
    </View>
  ),
};
