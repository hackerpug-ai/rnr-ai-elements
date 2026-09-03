import '@/global.css';
import '@/class-safelist';

import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

/**
 * Root layout for the harness.
 *
 * <PortalHost /> must be the LAST child of the root. Without it every RNR overlay —
 * Select, DropdownMenu, Dialog, Popover, Tooltip, ContextMenu — renders NOTHING, with
 * no error and no warning. It is documented as an install prerequisite for every
 * registry item that portals.
 */
export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <PortalHost />
    </>
  );
}
