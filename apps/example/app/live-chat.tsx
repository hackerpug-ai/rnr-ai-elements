import { Stack } from 'expo-router';

import { LiveChatScreen } from '@/components/live-chat-screen';

/**
 * The separate `/live-chat` route — the worked example's real streaming surface,
 * reachable independently of the offline fixture-driven `/` entry.
 */
export default function LiveChatRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LiveChatScreen />
    </>
  );
}
