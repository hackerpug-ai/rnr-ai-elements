<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-16 -->

# FIX-ORI-RN-004-1: read the live-chat endpoint via direct `process.env` access (web) and un-block the Android composer

> Status: ✅ Completed

Commit: 0b9cd49adcd816aeff53b8838de92f8320818155
> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FIX · Wave: C (unblocks the ORI-RN-004 commit)
> Proposed By: orchestrator (ORI-RN-004 out-of-scope blockers, real-device + web runs, 2026-09-16)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-16
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
> Base: implement on `kb-run-sprint/sprint-05-orient-search/ORI-RN-004` @ `001488c` (or merge that branch into the FIX branch first)

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

**Defect B — the Android leg cannot type (two causes, both in the input path, NOT a production-code bug).**
The ORI-RN-004 Android run recorded an Android-only `Can't perform a React state update on a component that
hasn't mounted yet` error (metro.log) correlated with the composer's `Send message` button staying
`enabled=false` (Maestro element dump `accessibilityText='Send message'` `enabled=false`); the
React-controlled `TextInput` never registered the typed marker, so no message round-trips. iOS does NOT
exhibit it. On-device isolation resolved TWO causes, both in the input path:

1. **Maestro input path** — Maestro's IME-based `inputText` silently fails to type because the emulator's
   soft keyboard is not shown (`dumpsys input_method` → `mIsImeShowing=false`, `mImeHeight=0`), while
   `adb shell input text` (direct key events) types and ENABLES the button. The cycle-1 bisect showed
   React Compiler is NOT the cause of THIS path (button stays `enabled: false` with reactCompiler OFF via
   Maestro `inputText`).
2. **adb input path** — the driver's `adb input tap` is intercepted by the RN LogBox dev overlay, so the
   tap never lands on the field. The reactCompiler-induced "state update before mount" warning re-fires on
   re-renders and re-expands the LogBox; the driver's `dismissLogBox` only acts on a FULL "Console
   Warning"/"Console Error" overlay, so a MINIMIZED banner (which has neither string and no `Dismiss`
   element) is never dismissed, and the next adb tap lands on the overlay. The text itself DOES stick when
   the tap lands — a live re-test (reactCompiler ON, LogBox cleared, tap `Message`, `adb shell input text
   "PROBE4"`) returned `text='PROBE4'` with `Send message enabled: true`. The earlier "reactCompiler drops
   the `setText`" theory is REFUTED by this.

The fix is therefore in the proof driver (WRITE-ALLOWED): make `dismissLogBox` handle the minimized
banner, make `focusField` assert the field gained focus (so an intercepted tap is distinguishable from any
other failure), and avoid the `hideKeyboard` BACK-key propagation when no IME is shown.

## Why

ORI-RN-004's three-platform proof (`tests/sprint-05-orient-search/support/live-example-proof.test.ts
--platforms ios,android,web`) passed the iOS leg (real streamed replies + active abort in light and
dark) and the AC-5 compiler gate, but the web and Android legs were blocked by defects outside
ORI-RN-004's write allowlist (`apps/example/lib/live-chat-config.ts` was absent from that task's
WRITE-ALLOWED; the Android blocker turned out to be a Maestro/emulator text-input artifact outside any
code file). Cycle 1 fixed Defect A (commit `51487c1`) and this cycle re-scopes Defect B to the Android
input path (`tests/sprint-05-orient-search/live-example.maestro.yaml` + the proof driver), so the full
three-platform proof can pass and ORI-RN-004's commit can land.

ORI-RN-004's recorded RED evidence (`.tmp/ORI-RN-004/cycle-1/red/RED.md`, on
`kb-run-sprint/sprint-05-orient-search/ORI-RN-004`):

- Web: static `/live-chat` HTML contains `EXPO_PUBLIC_API_BASE_URL is not configured` and no
  `aria-label="Message"` textarea; the browser logs `Minified React error #418` (hydration mismatch).
- Android: maestro element dump shows `Send message … enabled=false`; metro log line 43 is
  `ERROR Can't perform a React state update on a component that hasn't mounted yet.`

## How to verify

**BASE (prerequisite — not a gate, but a precondition):** implement on a branch based on
`kb-run-sprint/sprint-05-orient-search/ORI-RN-004` @ `001488c` (the ORI-RN-004 deliverable commit), or merge
that branch into the FIX branch before implementing. Every proof below depends on ORI-RN-004's files, which
are ABSENT from the trunk tip (`cffcdb9`): the proof driver
`tests/sprint-05-orient-search/support/live-example-proof.test.ts`, the `/live-chat` route
`apps/example/app/live-chat.tsx`, the screen/message components
`apps/example/components/live-chat-screen.tsx` + `live-chat-message.tsx`, the Maestro flow
`tests/sprint-05-orient-search/live-example.maestro.yaml`, and the ORI-RN-004 revision of
`apps/example/tsconfig.live-chat.json` (which adds `expo-env.d.ts`, the two components, `app/live-chat.tsx`,
and `types: ['uniwind/types']` — trunk's version includes only `lib/live-chat-config.ts` +
`lib/use-live-chat.ts` and would report a FALSE GREEN for the scoped gate). Do NOT create the
ORI-RN-004-owned ROUTE/SCREEN/CONFIG files yourself — `app/live-chat.tsx`,
`components/live-chat-screen.tsx`, `components/live-chat-message.tsx`, and
`tsconfig.live-chat.json` must arrive via the base branch. EXCEPTION (cycle-2): the proof driver
`tests/sprint-05-orient-search/support/live-example-proof.test.ts` and the Maestro flow
`tests/sprint-05-orient-search/live-example.maestro.yaml` are now WRITE-ALLOWED (see the cycle-2
amendment, F-7), so the implementer MAY modify them for the Android text-input path.

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
2. Android — the same `--platforms android` run now delivers real device text input (e.g. `adb shell input
   text` or an explicitly-shown IME) so `Send message` flips to enabled, a real streamed reply arrives (a
   completed provider record appears), and the follow-up + active Stop legs pass in light and dark.
3. No regression — the iOS leg (`--platforms ios`) still passes, and the AC-5 compiler case
   (`--case ORI-RN-004-AC-5-live-import-graph-compiler`) still passes.

## Scope

- WRITE-ALLOWED:
  - `apps/example/lib/live-chat-config.ts` (MODIFY — Defect A, direct `process.env` read only; FIXED in
    cycle 1, commit `51487c1`)
  - `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (MODIFY — Defect B, the PRIMARY fix
    location: make `dismissLogBox` handle the LogBox MINIMIZED banner, make `focusField` assert the field
    gained focus, and avoid the `hideKeyboard` BACK-key propagation when no IME is shown; plus the existing
    web assertions / Android adb text-input driving; the driver already sets `EXPO_PUBLIC_API_BASE_URL`
    before export)
  - `tests/sprint-05-orient-search/live-example.maestro.yaml` (MODIFY — Defect B, the Android text-input
    path: replace Maestro's IME-based `inputText` with a real device input step, e.g. an explicit emulator
    IME show before typing, or a driver-driven `adb shell input text` / key-event step)
  - `apps/example/lib/use-live-chat.ts` (MODIFY — Defect B FALLBACK ONLY, and only if the driver fix above
    is proven insufficient on the real emulator: guard the pre-mount state update; transport, abort/retry,
    throttling, `createRetry`, and the `UseLiveChatResult` shape stay with ORI-AI-001)
  - `apps/example/app.json` (MODIFY — Defect B FALLBACK ONLY, and only if the driver fix above is proven
    insufficient on the real emulator: disable `experiments.reactCompiler`; justify in the commit body)
  - `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/**` (evidence — RED/GREEN)
  - `.tmp/FIX-ORI-RN-004-1/**` (owned scratch)

- writeProhibited (explicit):
  - `apps/example/server/**`, `apps/example/lib/theme.ts`, `apps/example/lib/nav-theme.ts`,
    `apps/example/app/_layout.tsx`, `apps/example/app/index.tsx`, `apps/example/gallery/**`,
    `apps/example/global.css`, `apps/example/package.json`, `packages/registry/**`, `pnpm-lock.yaml`,
    `apps/docs/**`, `.github/**`, `.spec/**`
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
  ordering (ORI-AI-001 owns those). A `use-live-chat.ts` change is FALLBACK-ONLY (see WRITE-ALLOWED) and
  must never touch the transport / abort / retry / throttle semantics.
- The React Compiler finding, corrected: `experiments.reactCompiler` is NOT the cause of the Maestro
  `inputText` button-disabled state (cycle-1 bisect: button stays `enabled: false` with reactCompiler OFF
  via Maestro). The earlier "reactCompiler drops the `setText` on the adb path" claim (cycle-4) is REFUTED
  by a live re-test: with `reactCompiler: true` the "state update before mount" warning fires, but once the
  LogBox is cleared and the tap actually lands, `adb shell input text` sticks (`text='PROBE4'`,
  `Send message enabled: true`). The real adb-path blocker is the RN LogBox overlay intercepting the adb
  tap (the driver's `dismissLogBox` does not dismiss a MINIMIZED banner, and `focusField` does not assert
  focus). The implementer must fix the DRIVER first; a production-code change (app.json / use-live-chat.ts)
  is only authorized if the driver fix is proven insufficient on the real emulator.

### DONE WHEN

- AC-1: `getLiveChatConfig` reads `process.env.EXPO_PUBLIC_API_BASE_URL` directly; the web export no longer
  renders `not configured` and a real message round-trips through the driver's same-origin reverse proxy
  (cross-origin CORS is out of scope, see OPEN QUESTIONS); `resolveLiveChatConfig` behavior is unchanged.
- AC-2: on the real Android emulator the composer receives real device text input (`Send message` becomes
  enabled) and a real streamed reply arrives; the Android leg no longer relies on Maestro's IME-based
  `inputText`, AND the RN LogBox overlay no longer intercepts the adb tap (the driver's `dismissLogBox` /
  `focusField` / `hideKeyboard` weaknesses are fixed). The root cause (two-fold: the Maestro-input artifact
  AND the LogBox/tap-interception on the adb path) is recorded in the commit body.
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

**AC-2: the Android composer accepts real device text input and a real streamed reply arrives (Defect B)**

  GIVEN two causes — (a) Maestro's IME-based `inputText` silently fails (soft keyboard not shown), and
  (b) the driver's `adb input tap` is intercepted by the RN LogBox overlay (the reactCompiler-ON "state
  update before mount" warning re-expands the LogBox; `dismissLogBox` does not handle the MINIMIZED banner,
  and `focusField` never asserts focus) — WHEN the implementer drives the Android leg with REAL device
  input (`adb shell input text` / key events from the proof driver, or an explicitly-shown IME) AND fixes
  the driver's LogBox dismissal + focus assertion (primary; a production-code change to `app.json` /
  `use-live-chat.ts` is authorized only if the driver fix is proven insufficient) THEN on the real Android
  emulator the composer receives the typed text, `Send message` becomes enabled, and a real streamed reply
  arrives (a completed provider record), with the follow-up + active Stop legs passing in light and dark.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Expo Go (Android emulator) + ORI-AI-001 backend + OpenAI Responses
  VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms android`
  TEST_FILE: `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (primary) +
  `tests/sprint-05-orient-search/live-example.maestro.yaml` (+ `apps/example/app.json` / `apps/example/lib/use-live-chat.ts`
  only if the driver fix is proven insufficient)
  TEST_FUNCTION: `runLiveExampleProof` (android leg)
  RED before: Maestro `inputText` reports COMPLETED but the typed marker does not stick; `Send message`
  stays `enabled: false` and no backend record is produced.

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
- TC-3 → AC-2: the real `--platforms android` run delivers real device text input — `Send message` flips to
  enabled and a completed provider record is produced; the commit body records BOTH root causes (the
  Maestro-input artifact AND the LogBox/tap-interception on the adb path) and the driver fix (LogBox
  dismissal + focus assertion), with any production-code change justified only if the driver fix was
  insufficient. RED and GREEN saved under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.
- TC-4 → AC-3: the `--platforms ios` run and the `--case ORI-RN-004-AC-5-live-import-graph-compiler` run
  both pass; `git diff --name-only` lists only WRITE-ALLOWED paths.
- TC-5 → AC-3: `pnpm typecheck` and `pnpm lint` are clean; `pnpm --dir apps/example exec tsc --noEmit`
  (whole-example diagnostic) is retained with its exit status. The known pre-existing root-typecheck
  failure on `tests/sprint-04-generated-reference/code-primitives-contract.test.ts` (references the
  gitignored `apps/docs/src/data/registry-items.json`, generated by `pnpm gallery:manifest && pnpm --filter
  @rnr-ai-elements/docs prebuild`) must be proven pre-existing with `git stash && rerun` before the commit,
  and the commit body must record the proof.

### SCOPE (file-level write permissions)

- apps/example/lib/live-chat-config.ts (MODIFY — FIXED in cycle 1, commit `51487c1`)
- apps/example/lib/use-live-chat.ts (MODIFY — Defect B pre-mount state-update guard only)
- apps/example/app.json (MODIFY — Defect B, disable `experiments.reactCompiler`; justify)
- tests/sprint-05-orient-search/live-example.maestro.yaml (MODIFY — Android text-input path)
- tests/sprint-05-orient-search/support/live-example-proof.test.ts (MODIFY — web/Android legs: assertions + Android input driving)
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

- Depends on: ORI-RN-004 (owns the `/live-chat` route, the screen/message components, the proof driver, and the
  AC-5 compiler case this FIX re-runs — its deliverable commit `001488c` is the implementation BASE, since none
  of those files exist on trunk `cffcdb9`; cycle-2 takes MODIFY on the proof driver and the Maestro flow for the
  Android text-input path — see the cycle-2 amendment, F-7), ORI-AI-001 (owns the `use-live-chat` hook, the
  `/api/chat` backend, and `resolveLiveChatConfig` — this FIX only reads `process.env` directly and must not
  change their transport / abort / retry / throttle semantics)
- Blocks: ORI-RN-004 (its web and Android legs cannot pass until these two defects are fixed)
- Parallel: none (one lane; cycle-2 writes `apps/example/lib/live-chat-config.ts`,
  `tests/sprint-05-orient-search/live-example.maestro.yaml`, and
  `tests/sprint-05-orient-search/support/live-example-proof.test.ts`, plus evidence/scratch)

### READING LIST (max 5)

- apps/example/lib/live-chat-config.ts (Defect A: the direct `process.env` read — FIXED in cycle 1, commit `51487c1`)
- tests/sprint-05-orient-search/support/live-example-proof.test.ts (Defect B PRIMARY fix: the already-committed `runAndroidInputFlow` / `adbTypeText` / `dismissLogBox` / `hideKeyboard` / `focusField` — commit `7dbcdd6` — whose LogBox-dismissal + focus-assertion weaknesses to fix)
- tests/sprint-05-orient-search/live-example.maestro.yaml (Defect B: the Android `inputText` step to replace with a real device input, or an explicit IME show)
- apps/example/lib/use-live-chat.ts + apps/example/app.json (Defect B FALLBACK only, read if the driver fix proves insufficient on the real emulator)
- `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/cycle-2-red/` + `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/android-input-isolation/` (the committed cycle-2/3 evidence: the failed driver run + the reactCompiler-OFF adb success)

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
what `inline-env-vars` inlines. For Defect B, the PRIMARY fix is in the proof driver: (1) drive the Android
text input via `adb shell input text` / key events (real key events to the real focused EditText, never a
mock) or add a step to `live-example.maestro.yaml` that explicitly shows the emulator IME before Maestro's
`inputText`; AND (2) fix the LogBox/tap interception — make `dismissLogBox` dismiss the MINIMIZED banner
(not only a full "Console Warning"/"Console Error" overlay), make `focusField` assert the field actually
gained focus after tapping, and avoid the `hideKeyboard` BACK-key propagating to the Activity when no IME
is shown. A production-code change (`app.json` reactCompiler off, or a `use-live-chat.ts` pre-mount guard)
is authorized ONLY if this driver fix is proven insufficient on the real emulator, and must not touch
`createRetry`, the transport, the throttle, or the returned shape. The composer must receive the real typed
text, `Send message` must flip to enabled, and a real streamed reply must arrive. Follow AGENTS.md
TypeScript strictness and Biome; use actual installed types, no `any`, no declaration stubs, no engine
wrappers. Record every RED/GREEN run under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.

## OPEN QUESTIONS (stated, not resolved here)

- **Defect B root cause (TWO causes, both in the input path)**: (a) the Maestro input path — the emulator's
  soft keyboard is not shown (`dumpsys input_method` → `mIsImeShowing=false`, `mImeHeight=0`), so Maestro's
  IME-based `inputText` silently fails while `adb shell input text` (direct key events) types and ENABLES the
  button; the cycle-1 bisect showed React Compiler is NOT the cause of THIS path (button stays `enabled:
  false` with reactCompiler OFF via Maestro). (b) the adb input path — the driver's `adb input tap` is
  intercepted by the RN LogBox overlay (the reactCompiler-ON "state update before mount" warning re-expands
  it; `dismissLogBox` does not dismiss a MINIMIZED banner, and `focusField` does not assert focus). The text
  itself sticks when the tap lands (live re-test: `text='PROBE4'`, `Send message enabled: true`), so the
  earlier "reactCompiler drops `setText`" claim is REFUTED. The fix is in the driver (primary), with a
  production-code change authorized only if the driver fix is insufficient.
- **CORS (out of scope)**: the ORI-AI-001 backend emits no CORS headers, so the web leg uses the driver's
  same-origin reverse proxy (real forwarding, never a mock). This FIX does not add CORS — a real learner
  browser hitting the backend cross-origin would still need it, and that remains ORI-AI-001's (or a
  dedicated FIX's) concern. The AC-1 proof therefore exercises the proxy-served export, which is the
  driver's existing mechanism.

## Amendments

- Cycle-1 remediation (reviewer NEEDS_FIXES, F-1/F-2/F-3):
  - F-1 (base — blocking) — added an explicit implementation BASE. The branch this charter was handed
    (trunk `cffcdb9`) does NOT contain ORI-RN-004's deliverable commit `001488c`, so the proof driver
    (`tests/sprint-05-orient-search/support/live-example-proof.test.ts`), the `/live-chat` route
    (`apps/example/app/live-chat.tsx`), the screen/message components
    (`apps/example/components/live-chat-screen.tsx` + `live-chat-message.tsx`), the Maestro flow
    (`tests/sprint-05-orient-search/live-example.maestro.yaml`), and the ORI-RN-004 `tsconfig.live-chat.json`
    revision are all absent (verified: `git merge-base --is-ancestor 001488c HEAD` → not an ancestor; the six
    named files absent at HEAD; trunk's `tsconfig.live-chat.json` includes only `lib/live-chat-config.ts` +
    `lib/use-live-chat.ts`). Added a `> Base:` frontmatter line, a BASE paragraph in How-to-verify (with the
    FALSE-GREEN warning for the stale `tsconfig.live-chat.json`), and a base clause in DEPENDENCIES.
  - F-2 (escalation) — added the escalation rule to AC-2 and to the Defect B OPEN QUESTION: if the bisect
    implicates a file outside the two allowlisted fix locations (`app.json` / `use-live-chat.ts`), stop and
    report for a scope amendment rather than expanding the diff.
  - F-3 (CORS qualifier) — repeated the same-origin reverse-proxy qualifier in AC-1's DONE WHEN (cross-origin
    CORS is out of scope, see OPEN QUESTIONS).
  - The confirmed Defect A diagnosis, the honestly-scoped Defect B hypothesis, the WRITE-ALLOWED content, and
    the CRITICAL CONSTRAINTS are otherwise unchanged.

- Cycle-2 remediation (escalation rule fired during cycle-1 implementation):
  - F-4 (Defect A — RECORDED AS FIXED) — cycle-1 commit `51487c1162ace2b6c21632f0b045ec3ce20e1f1a` fixed
    Defect A: `apps/example/lib/live-chat-config.ts` `getLiveChatConfig` now reads
    `process.env.EXPO_PUBLIC_API_BASE_URL` directly; the pure `resolveLiveChatConfig(env)` seam is
    byte-identical (verified by `git diff` + a seam-assertion re-run). Real web RED→GREEN — pre-fix the
    exported client bundle contained "not configured" and `driveLiveWeb` failed at `getByLabel('Message')`;
    post-fix the composer renders (`emptyStateVisible: true`), a real message round-trips (2 completed
    `gpt-4.1-mini-2025-04-14` provider records via the same-origin proxy), no React #418 — and the iOS leg
    re-passed light + dark. The only remaining work is the Android input path.
  - F-5 (Defect B root cause — DISPROVEN code-bug hypothesis) [SUPERSEDED by cycle-5 F-14] — the charter's
    `reactCompiler` on/off bisect
    was RUN: disabling `experiments.reactCompiler` removed the "state update before mount" metro error but
    `Send message` stayed `enabled: false`, so React Compiler is NOT the cause. On-device isolation
    (`.tmp/FIX-ORI-RN-004-1/investigate/`) showed the true cause is a Maestro/emulator text-input artifact:
    `adb shell input text` types and ENABLES the button, while Maestro's IME-based `inputText` silently fails
    because the emulator's soft keyboard is not shown (`dumpsys input_method` → `mIsImeShowing=false`,
    `mImeHeight=0`). The Android composer is functional — this is NOT a code bug.
  - F-6 (re-scope AC-2 / Defect B) — AC-2 no longer asks to bisect-and-fix a code bug in `app.json` or
    `use-live-chat.ts`. It now requires the Android leg to deliver REAL device text input (drive `adb shell
    input text` / key events from the proof driver, or explicitly show the emulator IME before Maestro types),
    with the composer receiving the text, `Send message` becoming enabled, and a real streamed reply arriving.
  - F-7 (WRITE-ALLOWED) — added `tests/sprint-05-orient-search/live-example.maestro.yaml` (MODIFY, the
    Android text-input path) and broadened the proof driver allowance to include Android text-input driving.
    Removed `apps/example/app.json` (reverted; React Compiler hypothesis disproven) and
    `apps/example/lib/use-live-chat.ts` (hook-init disproven as the cause) from WRITE-ALLOWED; both are now
    fully writeProhibited.
  - F-8 (OPEN QUESTIONS) [SUPERSEDED by cycle-5 F-14] — the Defect B root cause is marked RESOLVED; the React
    Compiler hypothesis is removed/marked DISPROVEN.
  - The CRITICAL CONSTRAINTS (credential server-side only; the `resolveLiveChatConfig(env)` seam preserved;
    no mocks; no skipped platform) and the confirmed Defect A diagnosis are unchanged.

- Cycle-3 remediation (reviewer NEEDS_FIXES, F-1/F-2/F-3/F-4):
  - F-9 (evidence gaps) — captured the previously-missing artifacts. F-1: the adb-vs-Maestro isolation is now
    captured under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/android-input-isolation/` —
    `dumpsys-input-method.txt` (IME not shown: `mInputShown=false`, `mIsImeShowing=false`, `mImeHeight=0`),
    `adb-input-text-hierarchy.json` (`adb shell input text` → field `text: "hello test"`, `Send message
    enabled: true`), and `maestro-inputtext-red.txt` + `maestro-inputtext-hierarchy.json` (Maestro `inputText`
    reports COMPLETED but the field reverts and `Send message` stays `enabled: false`). F-2: the web GREEN pair
    is now committed — `web-green-manifest.json` + `web-green-provider-correlation.json` (2 completed
    `gpt-4.1-mini-2025-04-14` provider records; the per-leg `assistantResponded` flag is false because the
    model's seed response did not literally contain "rain", but the round-trip is proven by the completed
    records). F-3: the bisect OFF run is committed — `bisect-reactcompiler-off-manifest.json` +
    `bisect-reactcompiler-off-metro.log` (no "state update" error, android legs still FAIL).
  - F-10 (stale prose + write-access transfer) — corrected the BASE paragraph (the proof driver + Maestro flow
    are now WRITE-ALLOWED exceptions), the DEPENDENCIES attribution (cycle-2 takes MODIFY on the proof driver
    and Maestro flow), and the `Parallel:` line (the lane now writes three files, not "one config file").

- Cycle-4 remediation (reviewer NEEDS_FIXES — the cycle-2 React-Compiler conclusion was only half-right):
  - F-11 (re-open fix locations) — re-added `apps/example/app.json` (MODIFY, disable
    `experiments.reactCompiler`) and `apps/example/lib/use-live-chat.ts` (MODIFY, ONLY the pre-mount
    state-update guard) to WRITE-ALLOWED; removed them from writeProhibited (the hook's transport / abort /
    retry / throttle semantics stay prohibited). The implementer must determine and justify the MINIMAL fix,
    preferring the config change only if the hook cannot be made mount-safe without touching ORI-AI-001's
    transport/abort/retry semantics.
  - F-12 (correct the React Compiler finding) [SUPERSEDED by cycle-5 F-14 — the "dropped setText" half of this
    bullet is refuted] — it is NOT disproven. The cycle-1 bisect only showed it is not
    the cause of the Maestro-`inputText` button-disabled state (button stays `enabled: false` with
    reactCompiler OFF via Maestro). The cycle-2 run showed it IS the cause of the dropped `setText` on the
    real `adb shell input text` path: with `experiments.reactCompiler: true` the "state update before mount"
    error drops the controlled `TextInput`'s `setText`, reverting the adb-typed text. Both facts are now
    recorded in the Defect B paragraph, AC-2, CRITICAL CONSTRAINTS, CODING STANDARDS, and OPEN QUESTIONS so
    the charter is no longer self-contradictory.
  - F-13 (keep AC-2 + the adb path) — AC-2 still requires real Android device input (composer receives text,
    `Send message` enables, real streamed reply, light+dark, follow-up + active Stop); the proof driver
    `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (adb path) and
    `tests/sprint-05-orient-search/live-example.maestro.yaml` stay WRITE-ALLOWED.
  - The confirmed Defect A fix (commit `51487c1`) and its real web/iOS proof, the credential server-side-only
    constraint, the no-mocks constraint, and the no-skipped-platform constraint are unchanged.

- Cycle-5 remediation (reviewer REFUTED the cycle-4 "reactCompiler drops setText" claim):
  - F-14 (correct the cause — LogBox/tap interception, not setText-drop) — the reviewer's live re-test refuted
    the cycle-4 claim: with the unchanged `reactCompiler: true` app.json and the bundle firing the
    "state update before mount" warning, clearing the LogBox and tapping `Message` then
    `adb shell input text "PROBE4"` returned `text='PROBE4' focused=true` + `Send message enabled: true` —
    the text stuck, so reactCompiler does NOT drop the `setText`. The better-supported adb-path cause is the
    RN LogBox overlay intercepting the driver's `adb input tap` (the driver's `dismissLogBox` only acts on a
    full "Console Warning"/"Console Error" overlay and misses the MINIMIZED banner; `focusField` sleeps but
    never asserts focus; `hideKeyboard`'s `keyevent 4` propagates BACK when no IME is shown). Rewrote the
    Defect B paragraph, AC-2, CRITICAL CONSTRAINTS, DONE WHEN, CODING STANDARDS, OPEN QUESTIONS, and TC-3 to
    name the LogBox/tap-interception cause and the driver's dismissal/focus weaknesses.
  - F-15 (re-scope WRITE-ALLOWED to the driver) — `tests/sprint-05-orient-search/support/live-example-proof.test.ts`
    is now the PRIMARY fix location (LogBox dismissal + focus assertion + BACK-key fix); `apps/example/app.json`
    and `apps/example/lib/use-live-chat.ts` remain WRITE-ALLOWED only as FALLBACK, and the charter no longer
    directs a production-code change unless the driver fix is proven insufficient on the real emulator.
  - F-16 (fix citations) — corrected the READING LIST (the `.tmp/.../cycle-2-red/` path → the real
    `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/cycle-2-red/` path; the proof-driver line now
    names the already-implemented `runAndroidInputFlow`/`adbTypeText`/`dismissLogBox`/`focusField`, commit
    `7dbcdd6`, rather than "to extend"; the `use-live-chat.ts` line dropped the refuted "setText-drop fix
    location" framing) and added the supersession markers on cycle-2 F-5/F-8 and cycle-4 F-12.
  - AC-2's real-device requirements, the confirmed Defect A fix and proofs, the credential/no-mocks/
    no-skipped-platform constraints, and the adb input path are unchanged.

## Handoff

```json
{
  "task": "FIX-ORI-RN-004-1",
  "commit_sha": "0b9cd49adcd816aeff53b8838de92f8320818155",
  "done": "Landed entirely in the WRITE-ALLOWED proof driver (tests/sprint-05-orient-search/support/live-example-proof.test.ts) plus evidence (tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/README.md and .tmp/FIX-ORI-RN-004-1/cycle-6/): every Android turn now hard-gates on a NEW terminal provider record via an async waitForRecordOutcome (completed x3, aborted x1), sendEnabled asserts the Send control flips enabled after typing, focusField asserts focused=true before typing, dismissLogBox handles all LogBox forms plus the notification shade, hideKeyboard's BACK is IME-gated, the stop turn sends and stops by coordinate with zero device reads between (live-example-proof.test.ts:622-680) with slow verified fallback, the backend launches with maxOutputTokens 4096 and a 1200-word essay demand, and driveLiveWeb submits the seed prompt fixing the assistantResponded false negative; android light+dark passed on emulator-5554 with a mid-stream abort at 193/231 deltas, iOS and web re-ran green, the AC-5 compiler case passed, and typecheck/lint/fallow exited 0 through the righthook gates.",
  "deviations": [
    "app.json and lib/use-live-chat.ts are untouched at HEAD because the cycle-2/3 bisects disproved the reactCompiler hypothesis, so the charter's conditional write permission for them was never exercised.",
    "The driver self-launches the backend with maxOutputTokens 4096 (live-example-proof.test.ts:124-135), a documented server env knob set driver-side rather than any change to ORI-AI-001's transport/abort/retry/throttle semantics.",
    "The fresh RED evidence is a passing run of the committed driver paired with cycle-4's recorded false green of the same driver, not a newly captured failing run, because a flaky driver's pre-fix run can win its race by luck \u2014 documented in .tmp/FIX-ORI-RN-004-1/cycle-6/red/README.md."
  ],
  "concerns": [
    "The stop fast path depends on two invariants the code comments state but nothing enforces: the composer button's coordinate is stable from the idle-read state through streaming, and the 2s sleep outlasts the Send-to-Stop morph \u2014 a PromptInput layout change or a very slow emulator breaks it (the fallback then fails honestly, but slowly).",
    "Any future edit that inserts a maestro hierarchy capture (~9s) or accessibility tap (~8s) between the send and the stop tap re-creates the cycle-4/5 race, so the hot path's zero-device-reads rule is load-bearing, not stylistic.",
    "A future 'long turn never produced an aborted provider record' leg failure most likely means emulator slowness or an overlay regression, not an app bug \u2014 check dismissLogBox behavior and device speed before touching app code.",
    "dismissLogBox carries a fallow-ignore-next-line complexity pragma (live-example-proof.test.ts:480) matching the file's existing convention; a reviewer may reasonably ask for extraction instead."
  ],
  "findings": [
    "The Android app was never broken: Maestro's IME-based inputText silently fails on this emulator (soft keyboard never shows, mIsImeShowing=false) while adb shell input text works, so all native typing must go through adb (live-example-proof.test.ts:258-279).",
    "The server emits sanitized records only at stream termination (apps/example/server/chat.ts finally block), so backend.records() cannot observe in-flight streams and every gate must be written against terminal outcomes.",
    "maestro hierarchy costs ~9s per capture while adb uiautomator dump costs ~2s for the same tree \u2014 a large untapped speedup if the driver ever needs cheaper reads.",
    "Direct pnpm lint / biome invocations from an agent shell exit 254 with 'Linter process terminated abnormally' because the shell's shimmed PATH (cmux-cli-shims/rtk) breaks biome's child process; the righthook pre-commit and clean-env invocations work fine, so agent-side lint failures of this shape are environmental.",
    "reserveDevices requires both RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL even for a single-platform android run (tests/sprint-05-orient-search/support/native-session.ts:225-231).",
    "The driver unconditionally writes run-manifest.json, provider-correlation.json, metro.log, and per-leg screenshots into ORI-RN-004's evidence directory (EVIDENCE_ROOT at live-example-proof.test.ts:51), so any task re-running it must git-restore those ORI-RN-004-owned paths before committing.",
    "Whole-example tsc exits 2 on pre-existing errors in apps/example gallery/server files (including NodeJS.ErrnoException at apps/example/server/index.ts:142) unrelated to any sprint-05 diff; the scoped tsconfig.live-chat.json gate is the meaningful signal.",
    "The stale-accessibility behavior (content-desc never flipping mid-stream, collapsed bounds) is Android Fabric only \u2014 iOS flips to 'Stop generating' correctly and its Maestro flow needs none of this machinery."
  ],
  "scope_impact": [
    {
      "target": "ORI-RN-004",
      "found": "Its three-platform proof driver is now genuinely green (android gated on provider records, web seed-submit fixed, iOS unchanged) and its commit can land; its own evidence README still describes the web assistantResponded false negative this fix removed.",
      "change": "Update ORI-RN-004's evidence README web note when it lands, and treat .tmp/FIX-ORI-RN-004-1/cycle-6/ as the canonical android proof record."
    },
    {
      "target": "ORI-CONT-004",
      "found": "The locked Quickstart gate calls runLiveExampleProof, whose web leg now submits the seed prompt (3 completed records, assistantResponded true) and whose backend launches with maxOutputTokens 4096.",
      "change": "Refresh any recorded expected outputs for that gate (older captures show 2 web records and a false assistantResponded) before replaying or locking new evidence."
    }
  ],
  "feedback": [
    "The task file's Defect B framed the reactCompiler hypothesis as the primary suspect and gated app.json writes on a bisect; two remediation cycles were spent disproving it before the scope amendments moved the fix to the driver \u2014 write FIX charters from the observed artifact (button disabled + adb input works) rather than the suspected mechanism.",
    "The RED contract is ill-defined for flaky-driver defects: 'replay the observed failure' can pass by luck, as my fresh pre-fix run did; define RED for driver fixes as a demonstration of the vacuous assertion (record-based false green) instead of a full failing rerun.",
    "The VERIFY commands are correct but the task file never states that both RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL must be set even for an android-only run.",
    "WRITE-ALLOWED should either cover the ORI-RN-004 evidence paths the driver mutates as a side effect or require an explicit restore step, since every run dirties files outside the FIX task's scope."
  ]
}
```
