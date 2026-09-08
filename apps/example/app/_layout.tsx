import '@/global.css';

import { NAV_THEME } from '@/lib/nav-theme';
import { PortalHost } from '@rn-primitives/portal';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUniwind } from 'uniwind';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        {/*
          PortalHost lives in the ROOT layout — portalled overlays (popover, dialog,
          select, ...) render into this host. Mounted inside a screen instead, an
          overlay is clipped or silently invisible with no error and no log line.
        */}
        <PortalHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
