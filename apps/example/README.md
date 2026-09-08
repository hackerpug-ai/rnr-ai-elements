# AI Elements Example

The real consumer app for `rnr-ai-elements`: an Expo SDK 57 app (expo-router, Uniwind +
Tailwind v4) that installs RNR AI Elements registry items through the real RNR CLI and
renders them from its OWN tree — no workspace alias back into `packages/registry` or
`apps/harness` exists here, on purpose. That is what makes this app the sprint's
instrument: findings about installs are findings about what a real consumer experiences.

## Structure

- `global.css` — RNR's real theme, transcribed verbatim (registry ships no theme; tokens live in the consumer)
- `app/_layout.tsx` — root layout; mounts `<PortalHost />` at the root (portalled overlays render nowhere without it)
- `lib/nav-theme.ts` — react-navigation chrome colors from the same token source as `global.css`
- `components.json` — written by `npx @react-native-reusables/cli@latest init`, not by hand

## Run

```bash
pnpm install                      # from the repository root
cd apps/example
npx expo run:ios                  # or: npx expo run:android
```
