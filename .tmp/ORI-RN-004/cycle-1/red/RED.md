# ORI-RN-004 — RED evidence (observed functional failures before/around the fix)

## AC-5 live-import-graph compiler — RED
Before this task, `apps/example/tsconfig.live-chat.json` included ONLY
`lib/live-chat-config.ts` + `lib/use-live-chat.ts` (the ORI-AI-001 scoped graph).
`app/live-chat.tsx`, `live-chat-screen.tsx`, `live-chat-message.tsx` did not exist, so
the live import graph was not in the compiler program.

Negative control (real compiler read, not a receipt) — a scoped config that omits the
route does NOT list it:

  $ pnpm --dir apps/example exec tsc --noEmit -p <omit-config> --listFilesOnly
  (app/live-chat.tsx is ABSENT from the program)

Captured in green/live-import-graph-typecheck.txt (negative_control: route_absent=true).

## AC-1..AC-4 three-platform proof — RED
The three-platform driver (live-example-proof.test.ts) was run against the REAL
apps/example app, the ORI-AI-001 backend, and the official OpenAI Responses endpoint.

- **iOS**: PASSED (both light/dark) — real streamed replies, real abort. (green)
- **Android**: FAILED — Maestro typed the marker but the composer's send button stayed
  `enabled=false` (the React-controlled TextInput did not register the text). Root cause:
  an Android-only `Can't perform a React state update on a component that hasn't mounted
  yet` error from the `useChat` hook under the React Compiler experiment. Evidence:
  maestro.log element dump shows `accessibilityText=Send message ... enabled=false`.
- **Web**: FAILED — the static /live-chat page renders "EXPO_PUBLIC_API_BASE_URL is not
  configured" and hydration mismatches (React #418). Root cause: `live-chat-config.ts`
  reads `const env = process.env; env.EXPO_PUBLIC_API_BASE_URL` (indirect), which Expo's
  `inline-env-vars` Babel plugin does NOT inline; the browser has no `process.env`.

Both blockers live outside the writeAllowed scope (see final report blockers).
