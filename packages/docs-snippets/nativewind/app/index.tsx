import { QuickstartScreen } from '@/shared/quickstart-screen';

/**
 * The nativewind consumer's thin entrypoint — the seed-data chat screen, nothing else.
 * Root providers, NAV_THEME, and PortalHost live in app/_layout.tsx (ORI-RN-001); this
 * route only renders the shared screen so both engines consume the identical source.
 */
export default function QuickstartIndex() {
  return <QuickstartScreen />;
}
