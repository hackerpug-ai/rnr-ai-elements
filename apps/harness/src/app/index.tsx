import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

/**
 * Harness hello-world. Proves the whole chain end to end: RNR components render,
 * Uniwind resolves classes through the Metro transform, and every value comes from
 * the tokens in src/global.css — which are RNR's own.
 */
export default function Index() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-4 p-6">
      <Text variant="h3">rnr-ai-elements harness</Text>
      <Text className="text-muted-foreground">
        Every colour below resolves from the consumer theme, not from a literal.
      </Text>
      <View className="gap-2">
        <Button><Text>Default</Text></Button>
        <Button variant="secondary"><Text>Secondary</Text></Button>
        <Button variant="outline"><Text>Outline</Text></Button>
        <Button variant="destructive"><Text>Destructive</Text></Button>
      </View>
      <View className="rounded-md border border-border bg-muted/50 p-3">
        <Text className="text-sm text-muted-foreground">
          A muted surface with a themed border — the shape AI Elements tool cards use.
        </Text>
      </View>
    </ScrollView>
  );
}
