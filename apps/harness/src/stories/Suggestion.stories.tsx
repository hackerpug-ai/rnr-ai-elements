import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import { Suggestion, Suggestions } from '@/components/ai/suggestion';
import { Text } from '@/components/ui/text';

/**
 * Suggestion — a ported AI Element. This story renders the REGISTRY SOURCE, resolved
 * through the same alias rewrite the RNR CLI performs on install, so what is on screen is
 * what a consumer receives. RNR's own components are not storied here: consumers get
 * those from RNR.
 */
const meta = {
  title: 'AI Elements/Suggestion',
  component: Suggestions,
} satisfies Meta<typeof Suggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

const PROMPTS = [
  'Summarise this thread',
  'What changed in the last commit?',
  'Explain the error',
  'Write a test for this',
  'Refactor to use the new API',
];

export const Default: Story = {
  render: () => (
    <Suggestions>
      {PROMPTS.map((p) => (
        <Suggestion key={p} suggestion={p} onPress={() => {}} />
      ))}
    </Suggestions>
  ),
};

/** The row scrolls; it never wraps. Swipe it. */
export const Overflowing: Story = {
  render: () => (
    <Suggestions>
      {[...PROMPTS, 'And one more that pushes the row well past the viewport edge'].map((p) => (
        <Suggestion key={p} suggestion={p} onPress={() => {}} />
      ))}
    </Suggestions>
  ),
};

/** onPress receives the STRING, not an event — the caller sends it directly. */
export const ReceivesTheString: Story = {
  render: () => {
    const [sent, setSent] = useState<string | null>(null);
    return (
      <View className="gap-3">
        <Suggestions>
          {PROMPTS.slice(0, 3).map((p) => (
            <Suggestion key={p} suggestion={p} onPress={setSent} />
          ))}
        </Suggestions>
        <View className="rounded-md border border-border bg-muted/50 p-3">
          <Text className="text-sm text-muted-foreground">
            {sent ? `onPress received: "${sent}"` : 'Tap a chip — the handler gets the string.'}
          </Text>
        </View>
      </View>
    );
  },
};

export const Empty: Story = {
  render: () => <Suggestions>{[]}</Suggestions>,
};
