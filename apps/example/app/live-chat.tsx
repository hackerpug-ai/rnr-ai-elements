import { Stack } from 'expo-router';

import { LiveChatScreen } from '@/components/live-chat-screen';

/**
 * Stable screen options — a fresh `{ headerShown: false }` object every render
 * makes Expo Router call setOptions on every pass. After an appearance flip
 * (light → dark) that loops into LogBox "Maximum update depth exceeded", which
 * covers the transcript and fails Maestro's marker assertVisible even when the
 * hierarchy still carries the marker (uniwind iOS/dark live leg).
 */
const LIVE_CHAT_SCREEN_OPTIONS = { headerShown: false } as const;

/**
 * The separate `/live-chat` route — the worked example's real streaming surface,
 * reachable independently of the offline fixture-driven `/` entry.
 */
export default function LiveChatRoute() {
  return (
    <>
      <Stack.Screen options={LIVE_CHAT_SCREEN_OPTIONS} />
      <LiveChatScreen />
    </>
  );
}
