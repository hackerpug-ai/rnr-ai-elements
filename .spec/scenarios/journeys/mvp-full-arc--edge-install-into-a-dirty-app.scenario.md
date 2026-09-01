---
service: rnr-ai-elements
feature: journey-mvp-full-arc
covers_ucs: [UC-REG-01, UC-REG-02, UC-FOUND-03]
priority: P0
type: security
tier: visible
test_tier: e2e
---
# Install into a hostile app, not a clean one

Run the install against an Expo app that already has its own `components/ui/button.tsx` with different variants, a pnpm store with npm-latest gesture-handler (a major ahead of Expo 57's pin), and no PortalHost in its root layout. Three things must happen and each fails silently if unhandled: the CLI must show what it would overwrite BEFORE writing; `expo-doctor` must fail the pin mismatch rather than letting it surface as a native crash; and any component that portals must state PortalHost as an install prerequisite instead of rendering nothing. A clean-app install proves the happy path only — this is where real adoption actually happens.

**Covers:** `UC-REG-01`, `UC-REG-02`, `UC-FOUND-03`
