import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="border-b border-border px-4 pb-3 pt-2">
        <Text className="text-foreground font-semibold text-lg">AI Elements Example</Text>
      </View>
      <View className="flex-1" />
    </SafeAreaView>
  );
}
