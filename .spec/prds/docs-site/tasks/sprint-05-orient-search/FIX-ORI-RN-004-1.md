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

**Defect B — the Android leg cannot type (ROOT CAUSE RESOLVED by the cycle-1 bisect: a Maestro/emulator
text-input artifact, NOT a code bug).** The ORI-RN-004 Android run recorded an Android-only
`Can't perform a React state update on a component that hasn't mounted yet` error (metro.log) correlated
with the composer's `Send message` button staying `enabled=false` (Maestro element dump
`accessibilityText='Send message'` `enabled=false`); the React-controlled `TextInput` never registered the
typed marker, so no message round-trips. iOS does NOT exhibit it. The cycle-1 implementer ran the charter's
`reactCompiler` on/off bisect, which **DISPROVED** the React Compiler hypothesis: disabling
`experiments.reactCompiler` removed the "state update before mount" error from the metro log, but the
button STAYED `enabled: false` and no backend record was produced. Direct `adb shell input text` then typed
into the composer and ENABLED the button, while Maestro's IME-based `inputText` silently failed to type
because the emulator's soft keyboard is not shown (`dumpsys input_method` → `mIsImeShowing=false`,
`mImeHeight=0`). The Android composer is therefore functional; the remaining work is to make the Android
leg deliver REAL device text input (adb key events or an explicitly-shown IME) instead of relying on
Maestro's `inputText`.

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
  - `tests/sprint-05-orient-search/live-example.maestro.yaml` (MODIFY — Defect B, the Android text-input
    path: replace Maestro's IME-based `inputText` with a real device input step, e.g. an explicit emulator
    IME show before typing, or a driver-driven `adb shell input text` / key-event step)
  - `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (MODIFY — the ORI-RN-004 driver's
    web/Android legs only: web assertions if a proof assertion must change, and/or Android text-input
    driving; the driver already sets `EXPO_PUBLIC_API_BASE_URL` before export)
  - `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/**` (evidence — RED/GREEN)
  - `.tmp/FIX-ORI-RN-004-1/**` (owned scratch)

- writeProhibited (explicit):
  - `apps/example/server/**`, `apps/example/lib/use-live-chat.ts`, `apps/example/app.json`,
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
  ordering (ORI-AI-001 owns those). `use-live-chat.ts` is fully writeProhibited — the Defect B fix is in
  the Android text-input path, NOT the hook.
- `app.json` is fully writeProhibited: the cycle-1 bisect DISPROVED the React Compiler hypothesis
  (disabling `experiments.reactCompiler` removed the "state update before mount" error but the button stayed
  `enabled: false`), so `reactCompiler` stays untouched. The fix belongs in the Android text-input path
  (`live-example.maestro.yaml` and/or the proof driver), and the bisect evidence is committed under
  `.tmp/FIX-ORI-RN-004-1/cycle-1/red/`.

### DONE WHEN

- AC-1: `getLiveChatConfig` reads `process.env.EXPO_PUBLIC_API_BASE_URL` directly; the web export no longer
  renders `not configured` and a real message round-trips through the driver's same-origin reverse proxy
  (cross-origin CORS is out of scope, see OPEN QUESTIONS); `resolveLiveChatConfig` behavior is unchanged.
- AC-2: on the real Android emulator the composer receives real device text input (`Send message` becomes
  enabled) and a real streamed reply arrives; the Android leg no longer relies on Maestro's IME-based
  `inputText`. The root cause (Maestro/emulator text-input artifact, with the React Compiler hypothesis
  DISPROVEN by the bisect) is recorded in the commit body.
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

  GIVEN the cycle-1 bisect DISPROVED the React Compiler hypothesis (disable `experiments.reactCompiler` →
  re-run → the "state update before mount" error disappears but `Send message` stays `enabled: false`) and
  isolated the cause to the Maestro/emulator text-input path (`adb shell input text` ENABLES the button;
  Maestro's IME-based `inputText` silently fails because the emulator soft keyboard is not shown) WHEN the
  implementer makes the Android leg deliver REAL device text input — either by driving `adb shell input
  text` / key events from the proof driver, or by explicitly showing the emulator IME before Maestro types —
  THEN on the real Android emulator the composer receives the typed text, `Send message` becomes enabled,
  and a real streamed reply arrives (a completed provider record), with the follow-up + active Stop legs
  passing in light and dark.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Expo Go (Android emulator) + ORI-AI-001 backend + OpenAI Responses
  VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms android`
  TEST_FILE: `tests/sprint-05-orient-search/live-example.maestro.yaml` and/or
  `tests/sprint-05-orient-search/support/live-example-proof.test.ts`
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
  enabled and a completed provider record is produced; the committed bisect evidence (reactCompiler on/off,
  `.tmp/FIX-ORI-RN-004-1/cycle-1/red/`) records the DISPROVEN React Compiler hypothesis and the
  Maestro/emulator text-input root cause. RED and GREEN saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.
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
- tests/sprint-05-orient-search/live-example.maestro.yaml (Defect B: the Android `inputText` step to replace with a real device input, or an explicit IME show)
- tests/sprint-05-orient-search/support/live-example-proof.test.ts (the ORI-RN-004 web/android leg drivers; the android `runLiveMaestro` path to extend with real `adb shell input text` / key events)
- babel-preset-expo build/plugins/inline-env-vars.js (`isProcessEnv` — why only the DIRECT `process.env.EXPO_PUBLIC_*` access inlines)
- `.tmp/FIX-ORI-RN-004-1/cycle-1/red/` (the committed cycle-1 bisect evidence: reactCompiler on/off + the Maestro `inputText` failure)

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
what `inline-env-vars` inlines. For Defect B, the bisect is DONE (React Compiler DISPROVEN) — apply the
smallest change to the Android text-input path, not to app code: either drive `adb shell input text` / key
events from the proof driver (real key events to the real focused EditText, never a mock), or add a step to
`live-example.maestro.yaml` that explicitly shows the emulator IME before Maestro's `inputText`. Do NOT touch
`app.json`, `use-live-chat.ts`, the transport, the throttle, or `createRetry`. The composer must receive the
real typed text, `Send message` must flip to enabled, and a real streamed reply must arrive. Follow AGENTS.md
TypeScript strictness and Biome; use actual installed types, no `any`, no declaration stubs, no engine
wrappers. Record every RED/GREEN run under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/`.

## OPEN QUESTIONS (stated, not resolved here)

- **Defect B root cause (RESOLVED by the cycle-1 bisect)**: the `reactCompiler` on/off bisect DISPROVED the
  React Compiler hypothesis — disabling `experiments.reactCompiler` removed the "state update before mount"
  metro warning but the button stayed `enabled: false`. On-device isolation then showed the true cause: the
  emulator's soft keyboard is not shown (`dumpsys input_method` → `mIsImeShowing=false`, `mImeHeight=0`), so
  Maestro's IME-based `inputText` silently fails while `adb shell input text` (direct key events) types and
  ENABLES the button. The Android composer is functional; the Android leg's RED is a Maestro/emulator
  text-input artifact, not a defect in `app.json` or `use-live-chat.ts`.
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
  - F-5 (Defect B root cause — DISPROVEN code-bug hypothesis) — the charter's `reactCompiler` on/off bisect
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
  - F-8 (OPEN QUESTIONS) — the Defect B root cause is marked RESOLVED; the React Compiler hypothesis is
    removed/marked DISPROVEN.
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
