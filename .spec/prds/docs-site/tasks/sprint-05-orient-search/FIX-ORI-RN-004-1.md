<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-16 -->

# FIX-ORI-RN-004-1: read the live-chat endpoint via direct `process.env` access (web) and un-block the Android composer

> Status: Backlog
> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FIX · Wave: C (unblocks the ORI-RN-004 commit)
> Proposed By: orchestrator (ORI-RN-004 out-of-scope blockers, real-device + web runs, 2026-09-16)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-16
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

## What this does

Resolves the two ORI-RN-004 out-of-scope blockers that kept the web and Android legs of the
separate `/live-chat` screen from passing.

**Defect A — the web leg cannot reach the backend (CONFIRMED).** `apps/example/lib/live-chat-config.ts:69-74`
reads the endpoint through a local alias:

```ts
export function getLiveChatConfig(): LiveChatConfig {
  const env = process.env;
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
  });
}
```

Expo's `inline-env-vars` Babel plugin (`babel-preset-expo@57.0.10 build/plugins/inline-env-vars.js`,
`isProcessEnv`) only inlines a **direct** `process.env.EXPO_PUBLIC_*` member access — it requires
`path.node.object` to be the `process.env` MemberExpression. The `env.EXPO_PUBLIC_API_BASE_URL` access
(where `env` is a local Identifier) is **not** inlined, so the web client bundle carries no value,
`/live-chat` statically renders `EXPO_PUBLIC_API_BASE_URL is not configured`, and the SSR/client render
mismatches (React error #418). Native (Hermes) is unaffected because it reads `process.env` at runtime.

The fix: read `process.env.EXPO_PUBLIC_API_BASE_URL` directly inside `getLiveChatConfig`, and keep the
pure `resolveLiveChatConfig(env)` seam (which takes an explicit env object) byte-identical — that seam is
what ORI-AI-001's unit test and this FIX's unit test exercise, and it must not change.

**Defect B — the Android leg cannot type (ROOT CAUSE IS AN OPEN QUESTION, NOT CONFIRMED).** The
ORI-RN-004 Android run recorded an Android-only `Can't perform a React state update on a component that
hasn't mounted yet` error (metro.log) correlated with the composer's `Send message` button staying
`enabled=false` (Maestro element dump `accessibilityText='Send message'` `enabled=false`); the
React-controlled `TextInput` never registered the typed marker, so no message round-trips. iOS does NOT
exhibit it. The `useChat` hook (`@ai-sdk/react@4.0.92`) reads state through `useSyncExternalStore` whose
subscribe callbacks call `update()` — the classic trigger for "state update before mount" — and
`apps/example/app.json` sets `experiments.reactCompiler: true`, which memoizes `useLiveChat` /
`live-chat-screen` and is the primary suspect for changing the mount/subscribe timing on Android only.
This charter **does not enshrine that theory as fact**: the implementer must first bisect (disable
`reactCompiler` and re-run the Android leg) to confirm the root cause before choosing the fix, and must
record which hypothesis proved correct.

## Why

ORI-RN-004's three-platform proof (`tests/sprint-05-orient-search/support/live-example-proof.test.ts
--platforms ios,android,web`) passed the iOS leg (real streamed replies + active abort in light and
dark) and the AC-5 compiler gate, but the web and Android legs were blocked by defects outside
ORI-RN-004's write allowlist (`apps/example/lib/live-chat-config.ts` and `apps/example/lib/use-live-chat.ts`
and `apps/example/app.json` were all absent from that task's WRITE-ALLOWED). This FIX takes those files
over so the full three-platform proof can pass and ORI-RN-004's commit can land.

ORI-RN-004's recorded RED evidence (`.tmp/ORI-RN-004/cycle-1/red/RED.md`, on
`kb-run-sprint/sprint-05-orient-search/ORI-RN-004`):

- Web: static `/live-chat` HTML contains `EXPO_PUBLIC_API_BASE_URL is not configured` and no
  `aria-label="Message"` textarea; the browser logs `Minified React error #418` (hydration mismatch).
- Android: maestro element dump shows `Send message … enabled=false`; metro log line 43 is
  `ERROR Can't perform a React state update on a component that hasn't mounted yet.`

## How to verify

**RED (replay the observed failure, before the fix):**

1. Web — run the ORI-RN-004 web leg against the PRE-FIX config: `pnpm exec tsx
   tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms web`. Expected: the
   served `/live-chat` page renders `EXPO_PUBLIC_API_BASE_URL is not configured`, no composer, and
   `driveLiveWeb` fails at `getByLabel('Message')`. This is the ORI-RN-004 observed failure, not a
   source-absence statement.
2. Android — run `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts
   --platforms android` against the reserved emulator (`RNR_S05_ANDROID_SERIAL=emulator-5554`). Expected:
   the Maestro flow types the marker but `Send message` stays `enabled=false` and no backend record is
   produced.

**GREEN (after the fix):**

1. Web — the same `--platforms web` run now reaches the real backend: the static `/live-chat` renders
   the composer (no `not configured`), the browser hydrates without #418, and a real message round-trips
   to the ORI-AI-001 backend and OpenAI Responses (a completed provider record appears).
2. Android — the same `--platforms android` run now accepts typed text (`Send message` flips to enabled),
   a real streamed reply arrives (a completed provider record appears), and the follow-up + active Stop
   legs pass in light and dark.
3. No regression — the iOS leg (`--platforms ios`) still passes, and the AC-5 compiler case
   (`--case ORI-RN-004-AC-5-live-import-graph-compiler`) still passes.

## Scope

- WRITE-ALLOWED:
  - `apps/example/lib/live-chat-config.ts` (MODIFY — Defect A, direct `process.env` read only)
  - `apps/example/lib/use-live-chat.ts` (MODIFY — Defect B, ONLY the mount-time-update / initialization;
    transport, abort/retry, throttling, `createRetry`, and the `UseLiveChatResult` shape stay with ORI-AI-001)
  - `apps/example/app.json` (MODIFY — ONLY if Defect B's root cause is confirmed to be the React Compiler;
    justify in the commit body with the bisect evidence)
  - `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (MODIFY — the ORI-RN-004 driver's
    web/Android legs only, if a proof assertion must change; the driver already sets
    `EXPO_PUBLIC_API_BASE_URL` before export)
  - `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/**` (evidence — RED/GREEN)
  - `.tmp/FIX-ORI-RN-004-1/**` (owned scratch)

- writeProhibited (explicit):
  - `apps/example/server/**`, `apps/example/lib/use-live-chat.ts` beyond the Defect B initialization,
    `apps/example/lib/theme.ts`, `apps/example/lib/nav-theme.ts`, `apps/example/app/_layout.tsx`,
    `apps/example/app/index.tsx`, `apps/example/gallery/**`, `apps/example/global.css`,
    `apps/example/package.json`, `packages/registry/**`, `pnpm-lock.yaml`, `apps/docs/**`, `.github/**`,
    `.spec/**`
  - the hook's transport / abort / retry / throttle semantics, and the `resolveLiveChatConfig(env)` seam
    behavior (both owned by ORI-AI-001)

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The credential (`OPENAI_API_KEY`) stays server-side only. It must never appear in Metro, browser code,
  `EXPO_PUBLIC_*` values, command arguments, or captured evidence. `EXPO_PUBLIC_API_BASE_URL` is a
  non-secret reachable address (e.g. `http://127.0.0.1:8406` for the web proxy origin / `http://127.0.0.1:4000`
  for native); it is the ONLY env value this FIX may touch.
- The pure `resolveLiveChatConfig(env)` function and its ORI-AI-001 unit test (explicit env objects) must
  remain byte-identical in behavior. Only `getLiveChatConfig` (the ambient reader) changes shape.
- No mocked HTTP, no stub hook/provider, no injected messages, no canned streams, no skipped platform. The
  proof is a real served web round-trip and a real Android device run against the real `gpt-4.1-mini-2025-04-14`
  endpoint.
- Keep the installed Uniwind engine, the Expo Go default `Text` markdown renderer, and the existing root
  providers — no engine change, no new portal host, no token migration.
- Do NOT change abort/retry semantics, the transport construction, the 50 ms throttle, or `createRetry`
  ordering (ORI-AI-001 owns those). A `use-live-chat.ts` change is permitted only to resolve the Defect B
  mount-time update.
- `app.json` is write-allowed ONLY if the React Compiler is confirmed as Defect B's root cause by the
  bisect; otherwise leave `reactCompiler` untouched and fix the hook instead. The bisect (disable
  `reactCompiler` → re-run the Android leg → does `Send message` enable?) is the gate on that decision and
  must be recorded in evidence.

### DONE WHEN

- AC-1: `getLiveChatConfig` reads `process.env.EXPO_PUBLIC_API_BASE_URL` directly; the web export no longer
  renders `not configured` and a real message round-trips; `resolveLiveChatConfig` behavior is unchanged.
- AC-2: on the real Android emulator the composer accepts typed text (`Send message` becomes enabled) and a
  real streamed reply arrives; the root cause (React Compiler vs. hook init) is recorded.
- AC-3: the iOS leg and the AC-5 compiler gate still pass; `pnpm typecheck`, `pnpm lint`, and
  `pnpm --dir apps/example exec tsc --noEmit` behave as the charter's gates specify (pre-existing failures
  recorded with the AGENTS.md `git stash && rerun` proof).
- Only SCOPE files modified (`git diff --name-only`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: the web export inlines the base URL and a real message round-trips (Defect A)**

  GIVEN `apps/example/lib/live-chat-config.ts` (`getLiveChatConfig` reading the endpoint through a local
  `env` alias) WHEN `getLiveChatConfig` reads `process.env.EXPO_PUBLIC_API_BASE_URL` directly and the
  pure `resolveLiveChatConfig(env)` seam is left unchanged THEN the web client bundle inlines the value,
  `/live-chat` no longer renders `EXPO_PUBLIC_API_BASE_URL is not configured` (no hydration mismatch), and
  a real message round-trips to the ORI-AI-001 backend through the driver's same-origin serving layer (a
  completed provider record is produced).

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real `expo export --platform web` + Chromium +
  ORI-AI-001 backend + OpenAI Responses
  VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms web`
  TEST_FILE: `apps/example/lib/live-chat-config.ts` + `tests/sprint-05-orient-search/support/live-example-proof.test.ts`
  TEST_FUNCTION: `runLiveExampleProof` (web leg)
  RED before: the same run renders `not configured` and `driveLiveWeb` fails at `getByLabel('Message')`.

**AC-2: the Android composer accepts typed text and a real streamed reply arrives (Defect B)**

  GIVEN the Android-only `Can't perform a React state update on a component that hasn't mounted yet`
  error and the `Send message` button stuck at `enabled=false` WHEN the implementer bisects to the true
  root cause (disable `experiments.reactCompiler` → re-run → does the button enable?) and applies the
  minimal fix in the confirmed location (`app.json` or `use-live-chat.ts`) THEN on the real Android
  emulator the composer accepts Maestro-typed text, `Send message` becomes enabled, and a real streamed
  reply arrives (a completed provider record), with the follow-up + active Stop legs passing in light and
  dark.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Expo Go (Android emulator) + ORI-AI-001 backend + OpenAI Responses
  VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms android`
  TEST_FILE: `apps/example/lib/use-live-chat.ts` (or `apps/example/app.json`, per the bisect) +
  `tests/sprint-05-orient-search/support/live-example-proof.test.ts`
  TEST_FUNCTION: `runLiveExampleProof` (android leg)
  RED before: Maestro types the marker but `Send message` stays `enabled=false` and no backend record is produced.

**AC-3: no regression — iOS leg, the AC-5 compiler gate, and the static gates hold**

  GIVEN the two fixes WHEN the iOS leg and the compiler case re-run THEN the iOS leg still passes (real
  streamed replies + active abort in light and dark), the `--case ORI-RN-004-AC-5-live-import-graph-compiler`
  case still exits with `passed: true`, and `pnpm typecheck`, `pnpm lint`, and
  `pnpm --dir apps/example exec tsc --noEmit` behave as specified below (any pre-existing failure recorded
  with the AGENTS.md `git stash && rerun` proof, not silently labelled green).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real Expo Go (iOS) + real TypeScript compiler + biome
  VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios` ·
  `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler` ·
  `pnpm typecheck` · `pnpm lint` · `pnpm --dir apps/example exec tsc --noEmit`
  TEST_FILE: `tests/sprint-05-orient-search/support/live-example-proof.test.ts` + the gate commands
  TEST_FUNCTION: `runLiveExampleProof` (ios leg) + `runLiveImportGraphCompiler`

### TEST CRITERIA

- TC-1 → AC-1: `git diff apps/example/lib/live-chat-config.ts` changes ONLY `getLiveChatConfig`
  (the `const env = process.env; env.X` becomes `process.env.X`); `resolveLiveChatConfig` is byte-identical;
  a Vitest assertion over `resolveLiveChatConfig` with explicit env objects still passes (the seam is intact).
- TC-2 → AC-1: the real `--platforms web` run reaches the real backend — a completed provider record is
  produced, the static `/live-chat` HTML no longer contains `not configured`, and the browser logs no
  React #418. RED (pre-fix) and GREEN (post-fix) saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.
- TC-3 → AC-2: the real `--platforms android` run accepts typed text — `Send message` flips to enabled and
  a completed provider record is produced; the bisect evidence (reactCompiler on/off) names the confirmed
  root cause. RED and GREEN saved under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.
- TC-4 → AC-3: the `--platforms ios` run and the `--case ORI-RN-004-AC-5-live-import-graph-compiler` run
  both pass; `git diff --name-only` lists only WRITE-ALLOWED paths.
- TC-5 → AC-3: `pnpm typecheck` and `pnpm lint` are clean; `pnpm --dir apps/example exec tsc --noEmit`
  (whole-example diagnostic) is retained with its exit status. The known pre-existing root-typecheck
  failure on `tests/sprint-04-generated-reference/code-primitives-contract.test.ts` (references the
  gitignored `apps/docs/src/data/registry-items.json`, generated by `pnpm gallery:manifest && pnpm --filter
  @rnr-ai-elements/docs prebuild`) must be proven pre-existing with `git stash && rerun` before the commit,
  and the commit body must record the proof.

### SCOPE (file-level write permissions)

- apps/example/lib/live-chat-config.ts (MODIFY)
- apps/example/lib/use-live-chat.ts (MODIFY — Defect B initialization only)
- apps/example/app.json (MODIFY — only if the React Compiler bisect confirms it; justify)
- tests/sprint-05-orient-search/support/live-example-proof.test.ts (MODIFY — web/Android leg assertions)
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/** (evidence)
- .tmp/FIX-ORI-RN-004-1/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- scoped: `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json`
- diagnostic: `pnpm --dir apps/example exec tsc --noEmit`
- web proof: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms web`
- android proof: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms android`
- ios proof: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios`
- compiler case: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler`

### DEPENDENCIES

- Depends on: ORI-RN-004 (owns the `/live-chat` screen, the proof driver, and the AC-5 compiler case this
  FIX re-runs), ORI-AI-001 (owns the `use-live-chat` hook, the `/api/chat` backend, and
  `resolveLiveChatConfig` — this FIX only reads `process.env` directly and must not change their transport /
  abort / retry / throttle semantics)
- Blocks: ORI-RN-004 (its web and Android legs cannot pass until these two defects are fixed)
- Parallel: none (one lane, one config file)

### READING LIST (max 5)

- apps/example/lib/live-chat-config.ts (the indirect `const env = process.env` at line 70 + the pure `resolveLiveChatConfig` seam)
- apps/example/lib/use-live-chat.ts (the `useMemo` transport + `useChat` initialization that the React Compiler memoizes)
- apps/example/app.json (the `experiments.reactCompiler: true` experiment, the Defect B primary suspect)
- babel-preset-expo build/plugins/inline-env-vars.js (`isProcessEnv` — why only the DIRECT `process.env.EXPO_PUBLIC_*` access inlines)
- tests/sprint-05-orient-search/support/live-example-proof.test.ts (the ORI-RN-004 web/android leg drivers this FIX re-runs)

> Note: ORI-RN-004's evidence lives on `kb-run-sprint/sprint-05-orient-search/ORI-RN-004`
> (`tests/sprint-05-orient-search/evidence/ORI-RN-004/` and `.tmp/ORI-RN-004/cycle-1/red/RED.md`), not this
> trunk; the RED is reproduced by re-running the proof driver's web/android legs against the pre-fix source.

### CODING STANDARDS

For Defect A, keep the change to the ambient reader only — e.g.
```
export function getLiveChatConfig(): LiveChatConfig {
  return resolveLiveChatConfig({
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
  });
}
```
`resolveLiveChatConfig` and its ORI-AI-001 test stay byte-identical; the direct member access is exactly
what `inline-env-vars` inlines. For Defect B, after the bisect, apply the smallest change in the confirmed
location — either set `experiments.reactCompiler` off in `app.json` (with the bisect evidence in the commit
body, and a note that this affects the whole example app), or restructure `useLiveChat`'s initialization so
the `useChat` store update does not fire before mount (e.g. lazy-init the chat or move a callback into
`useEffect`) — without touching `createRetry`, the transport, the throttle, or the returned shape. Follow
AGENTS.md TypeScript strictness and Biome; use actual installed types, no `any`, no declaration stubs, no
engine wrappers. Record every RED/GREEN run under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.

## OPEN QUESTIONS (stated, not resolved here)

- **Defect B root cause**: the causal link from the Android-only `Can't perform a React state update on a
  component that hasn't mounted yet` warning to the `Send message` `enabled=false` state is a HYPOTHESIS
  (React Compiler memoizing `useLiveChat`/`live-chat-screen` around `useChat`'s `useSyncExternalStore`), not
  confirmed. The charter therefore scopes the RED to the OBSERVED failure (button disabled) and requires the
  implementer to bisect (`reactCompiler` off → re-run) before choosing the fix; if the React Compiler is not
  the cause, the fix belongs in `use-live-chat.ts` (initialization) instead, and `app.json` stays untouched.
- **CORS (out of scope)**: the ORI-AI-001 backend emits no CORS headers, so the web leg uses the driver's
  same-origin reverse proxy (real forwarding, never a mock). This FIX does not add CORS — a real learner
  browser hitting the backend cross-origin would still need it, and that remains ORI-AI-001's (or a
  dedicated FIX's) concern. The AC-1 proof therefore exercises the proxy-served export, which is the
  driver's existing mechanism.
