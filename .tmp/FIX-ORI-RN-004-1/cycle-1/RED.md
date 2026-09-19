# FIX-ORI-RN-004-1 — RED evidence (cycle-1)

Task: `FIX-ORI-RN-004-1` — read the live-chat endpoint via direct `process.env`
access (web) and un-block the Android composer.

Branch: `kb-run-sprint/sprint-05-orient-search/FIX-ORI-RN-004-1-impl` (base
`kb-run-sprint/sprint-05-orient-search/ORI-RN-004` @ `001488c` merged with `main`).

All runs against the real `apps/example` app, the real ORI-AI-001 owned backend,
and the real OpenAI Responses endpoint (`gpt-4.1-mini-2025-04-14`). No mocks, no
stubs, no injected messages, no canned streams.

---

## Defect A — web leg cannot reach the backend (CONFIRMED, pre-fix)

Command: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms web`

**Observed failure (RED):**
- The static web export's client bundle (`_expo/static/js/web/entry-*.js`, 5.9MB)
  contains the literal `EXPO_PUBLIC_API_BASE_URL is not configured` string and does
  NOT contain the inlined value `127.0.0.1:8406` — verified on the export with
  `grep -c "EXPO_PUBLIC_API_BASE_URL is not configured"` → 1 and `grep -c
  "127.0.0.1:8406"` → 0 (the 5.9MB minified bundle is reproducible via
  `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8406 npx expo export --platform web`
  and is not committed for size).
- `driveLiveWeb` fails at `getByLabel('Message')` (timeout 30000ms) with
  `emptyStateVisible: false` — the browser client-rendered the `ConfigError`
  ("not configured") branch instead of the composer, so the hydration tree
  mismatches the SSR HTML (React error #418).
- `run-manifest.json` (web leg): `status: failed`, `emptyStateVisible: false`,
  `backend_records: []`.

This is the exact ORI-RN-004 observed failure: the `const env = process.env`
alias in `getLiveChatConfig` blocked `babel-preset-expo`'s `inline-env-vars`
(which requires a DIRECT `process.env.EXPO_PUBLIC_*` member access), so the web
client bundle carried no value.

Artifacts:
- `red/web-red.out` — driver stdout (`completed: false`)
- `red/web-red-manifest.json` — driver manifest (web leg failed)

## Defect B — Android composer stuck `enabled=false` (HYPOTHESIS, pre-fix)

Command: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms android`
(`RNR_S05_ANDROID_SERIAL=emulator-5554`)

**Observed failure (RED), light + dark:**
- Maestro `Input text ${MARKER}... COMPLETED`, then `Tap on "Send message"...
  COMPLETED`, then `Assert that "${MARKER}" is visible... FAILED`.
- Maestro hierarchy dump at the failure: `"accessibilityText": "Send message"`,
  `"enabled": "false"`; the `Message` EditText shows the placeholder (`text:
  "What would you like to know?"`), i.e. the typed marker did NOT stick.
- `hierarchy_has_marker: false`, `latest_backend_record: null`.
- Metro log line 43: `ERROR Can't perform a React state update on a component
  that hasn't mounted yet.` (reactCompiler ON — see bisect below).

Artifacts:
- `red/android-red.out` — driver stdout (`completed: false`)
- `red/android-red-manifest.json` — driver manifest (android light+dark failed)
- `red/android-red-metro.log` — metro log (line 43 "state update" error)
- `red/android-red-maestro-commands.json` — full maestro command trace incl. the
  failure hierarchy (Send message `enabled: false`)
- `red/android-bisect-reactcompiler-off.out` — bisect run stdout

### Bisect (reactCompiler ON → OFF)

The charter requires bisecting `experiments.reactCompiler` before choosing
`app.json` vs `use-live-chat.ts`. Performed:

1. `apps/example/app.json` `experiments.reactCompiler` set `true → false`.
2. Re-ran `--platforms android`.

Result: the "state update before mount" error DISAPPEARED from the metro log
(the OFF run's metro lines have no such error), but the composer STILL failed —
`Send message` remained `enabled: false`, `hierarchy_has_marker: false`, no
backend record. **React Compiler is NOT the root cause.**

`app.json` was reverted to `reactCompiler: true` (no diff) and is NOT part of the
final change set.
