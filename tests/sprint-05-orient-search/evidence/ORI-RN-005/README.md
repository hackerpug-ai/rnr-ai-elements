# ORI-RN-005 — evidence

The independent NativeWind live-chat proof. Current state: **cycle-1, compile-gated**.
The driver, consumer build, fail-closed negative controls and teardown all ran for
real; the three live legs are `blocked` at the consumer compiler, on two gaps that
live in files OUTSIDE this task's write scope.

## What ran for real (cycle-1)

- `install-exact-source.json` + `install-log.txt` — the real ORI-RN-001 template copy,
  the verbatim public recipe (`pnpm install`, `npx expo install`, the literal
  `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/…`
  commands), all **5 source/target SHA-256 pairs matching byte-identical**, the exact
  live-hook pins resolved (`ai 7.0.89`, `@ai-sdk/react 4.0.92`), and `expo-doctor`
  21/21. `uniwind: missing` in the resolved versions — no engine mixing.
- `manifest.json` — the canonical run record: run/candidate identity, five verified
  copy pairs, resolved versions, public registry hashes, and the three `blocked` legs
  each carrying the verbatim compiler diagnostic.
- `teardown.json` — after the blocked run: owned backend stopped, owned consumer
  removed, zero adb reverse mappings remaining, both native appearances restored,
  reservations released.
- The AC-4 negative controls (real runs, vitest-green):
  a tampered manifest hash fails nonzero BEFORE any launch naming the mapped path +
  expected/actual hashes; an absent requested iOS target fails nonzero naming
  `RNR_S05_IOS_UDID=…` exactly, and its teardown.json proves the owned backend was
  still stopped on the failure path.

## The two upstream gaps (the compile gate)

The consumer's own compiler exits 2 on the byte-identical canonical sources with
exactly these two errors (nothing else — the hook pins and all registry imports
resolve):

```
components/live-chat-screen.tsx(5,28): error TS2307: Cannot find module 'uniwind' or its corresponding type declarations.
components/live-chat-screen.tsx(21,10): error TS2459: Module '"@/lib/theme"' declares 'THEME' locally, but it is not exported.
```

1. `apps/example/components/live-chat-screen.tsx` line 5 imports
   `import { useUniwind } from 'uniwind'` — the canonical screen is authored against
   the Uniwind engine's theme hook. This task's contract forbids adding Uniwind to the
   NativeWind consumer (BOUNDARY CONTRACTS) and forbids declaration shims, so the
   import cannot resolve here. Fix belongs to ORI-RN-004's file
   (`apps/example/**` is writeProhibited for this task): replace the `useUniwind`
   read with React Native's `useColorScheme` (the only use is
   `theme === 'dark' ? 'dark' : 'light'` for `THEME[mode].background`).
2. `packages/docs-snippets/nativewind/lib/theme.ts` declares `const THEME = {…}`
   without exporting it, while the screen imports `{ THEME } from '@/lib/theme'`
   (`apps/example`'s own `lib/theme.ts` exports it). Fix belongs to ORI-RN-001's
   template (`packages/docs-snippets/nativewind/**` except `package.json` is
   writeProhibited for this task): change `const THEME` to `export const THEME`.

Once both one-line upstream fixes land, rerun:

```
pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --platforms ios,android,web
```

`ios/`, `android/` and `web/` are the future outputs of that run (screenshots,
retry-state oracle artifacts, Metro log).

## Provenance of the interaction oracles

`support/nativewind-live-example.ts` ports ORI-RN-004's hardened oracles (see
`../ORI-RN-004/README.md`): record-gated turns, the Android coordinate stop hot path,
the innermost-match transcript count, the iOS keyboard dismissal tap, the
DOWN-direction `scrollUntilVisible`, and the same typed backend contract
(`support/live-backend.ts`). Owned ports are distinct (backend 4010 / Metro 8097 /
web 8408) so both engine drivers can run concurrently in ORI-AI-002's six-target
matrix.
