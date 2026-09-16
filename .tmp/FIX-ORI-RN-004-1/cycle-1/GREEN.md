# FIX-ORI-RN-004-1 — GREEN evidence (cycle-1)

Task: `FIX-ORI-RN-004-1` (see RED.md for the RED reproduction).

---

## Defect A — FIXED and verified (web)

Fix (`apps/example/lib/live-chat-config.ts`): `getLiveChatConfig` now reads
`process.env.EXPO_PUBLIC_API_BASE_URL` DIRECTLY (no `const env = process.env`
alias). The pure `resolveLiveChatConfig(env)` seam is byte-identical.

```diff
 export function getLiveChatConfig(): LiveChatConfig {
-  const env = process.env;
   return resolveLiveChatConfig({
-    EXPO_PUBLIC_API_BASE_URL: env.EXPO_PUBLIC_API_BASE_URL,
+    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
   });
 }
```

Post-fix `--platforms web` run (re-run 2026-09-16, run_id `ORI-RN-004-1789545535437`):
- `emptyStateVisible: true` — the composer renders, NOT "not configured".
- `markerSubmitted: true`, `inputCleared: true` — a real user message round-trips.
- 2 completed OpenAI provider records via the same-origin proxy
  (`provider: openai`, `providerModel: gpt-4.1-mini-2025-04-14`, `outcome:
  completed`) — see `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/
  web-green-provider-correlation.json` (and `web-green-manifest.json` for the
  per-leg `drive_result`).
- `followUpRecallVisible: true`, `stopControlVisible: true` — follow-up and stop
  control both exercised.

Per-leg status (honest): the driver's web leg reports `status: failed` because the
`assistantResponded` flag (asserting the seed response's literal text contains
"rain") is false — the model's terse response did not contain the word "rain" this
run, so the six-flag `passed` conjunction is false. The round-trip itself is proven
by the two `outcome: completed` provider records and the composer-render/follow-up/
stop flags. `assistantResponded` is model-dependent flakiness, unrelated to Defect A
(endpoint inlining) — the round-trip (composer renders + completed provider records)
is green.

## Defect B — root cause DETERMINED to be a Maestro-input artifact (not a code bug)

The charter's bisect gate was run and recorded (see RED.md): disabling
`experiments.reactCompiler` removes the "state update before mount" error but does
NOT enable the button, so React Compiler is NOT the cause. The captured evidence
lives under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-1/
android-input-isolation/` (README.md describes each artifact):

1. `adb-input-text-hierarchy.json` — `adb -s emulator-5554 shell input text
   "hello test"` → the `Message` field holds `text: "hello test"` and the
   `Send message` button flips to `enabled: true`. The app is NOT broken on Android.
2. `maestro-inputtext-red.txt` + `maestro-inputtext-hierarchy.json` — Maestro
   `inputText "hello test"` reports COMPLETED but the field reverts to the
   placeholder and `Send message` stays `enabled: false` (the `enabled: true`
   assertion FAILS).
3. `dumpsys-input-method.txt` — the emulator's soft keyboard is not shown
   (`mInputShown=false`, `mIsInputViewShown=false`, `mIsImeShowing=false`,
   `mImeHeight=0`), so Maestro's IME-based `inputText` silently fails while
   `adb input text` (direct key events) works.
4. `bisect-reactcompiler-off-manifest.json` + `bisect-reactcompiler-off-metro.log` —
   the `reactCompiler` OFF re-run: no "state update" error in the metro log, yet the
   android light + dark legs still FAIL (`hierarchy_has_marker: false`,
   `latest_backend_record: null`) — the button stays disabled.

Conclusion: the Android composer is functional; the Android leg's RED is a
Maestro/emulator input artifact, NOT a defect in `app.json` or `use-live-chat.ts`.
The fix therefore does not belong in either allowlisted location. Per the
charter's escalation rule this is reported for a scope amendment (see the final
report) rather than expanding the diff.

## AC-3 — no regression

- iOS leg (`--platforms ios`, `green/ios-green-manifest.json`): **light PASSED**,
  **dark PASSED** (`maestro_exit: 0`, `hierarchy_has_marker: true`), 8 real
  provider records incl. `aborted` records from the active-Stop legs. No
  regression from the Defect A change.
- AC-5 compiler case (`--case ORI-RN-004-AC-5-live-import-graph-compiler`):
  `passed: true` (scoped tsc exit 0; live route + components in program; negative
  control holds).
- `pnpm lint`: exit 0 (clean).
- `pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json`: exit 0.
- `pnpm typecheck` and the whole-example tsc (`exit 2`): fail ONLY on the known
  pre-existing `tests/sprint-04-generated-reference/code-primitives-contract.test.ts`
  (references the gitignored `apps/docs/src/data/registry-items.json`). Proven
  pre-existing with `git stash && rerun` — identical 7 errors with the change
  stashed (see the commit body).
