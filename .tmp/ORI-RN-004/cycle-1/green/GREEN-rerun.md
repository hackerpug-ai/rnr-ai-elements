# ORI-RN-004 — GREEN (re-run cycle, against current main 45464ed0)

All observations from the real stack: iPhone 17 sim `81487B1E-…` (iOS 26.3),
emulator-5554 (Android), Expo Go 57.0.9, real Metro on :8095, the owned
ORI-AI-001 backend on :4000 (self-launched, `maxOutputTokens: 4096`), the real
`gpt-4.1-mini-2025-04-14` Responses endpoint, and a real `expo export` web build
served same-origin with a real `/api/chat` forward proxy in Chromium. No mocks.

## AC-5 — live-import-graph compiler — GREEN

`pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json` exits 0
at HEAD 45464ed0; the program includes `app/live-chat.tsx`,
`components/live-chat-screen.tsx`, `components/live-chat-message.tsx` and the
installed `components/ai/{conversation,message,prompt-input}.tsx`. The negative
control (a scoped config that omits the route) does NOT list it — the assertion
reads the real compiler program. Whole-example `tsc --noEmit` retained
separately (exit 2, pre-existing gallery/server errors unrelated to any
sprint-05 diff). Artifacts:
`tests/sprint-05-orient-search/evidence/ORI-RN-004/live-import-graph-typecheck.txt`
and `example-package-typecheck.txt`; run log `../compiler-case-rerun.log`.

## AC-1 / AC-2 / AC-4 — three-platform live proof — GREEN

Baseline full run `ORI-RN-004-R2-1789552340` (pre-retry-leg driver, the exact
committed surface at 45464ed0): 3/3 platforms, 5/5 legs PASSED, 19 provider
records — log `../pre-retry-leg-baseline-run.log`, manifest rewritten by later
runs (this log + git history of `run-manifest.json` carry it).

- AC-1: `/live-chat` opens with the empty-state transcript (0 turns) and a
  `Send message` control on all 3 platforms; the marker turn lands exactly once
  and the composer clears; `/` stays reachable (route separation unchanged).
- AC-2: marker/seed/follow-up turns each hard-gate on their own NEW terminal
  `completed` provider record; the follow-up answer quotes the exact
  `ORI-RN-004:<run-id>:<platform>` marker absent from the follow-up prompt
  (hierarchy/DOM observed on every leg; web additionally asserts the rain
  reply — the driver now submits the seed prompt first, so
  `assistantResponded: true`; the old false negative is gone).
- AC-3 case 1 (active Stop): every native appearance aborts a real mid-stream
  essay (aborted provider record with 100-240 deltas already streamed; Android
  uses the coordinate hot path with zero device reads between send and stop);
  web catches the `Stop generating` control mid-request.
- AC-4: iOS screenshots + Android screenshots in light AND dark show readable
  nonempty assistant text, the seeded marker turn, and the composer above the
  keyboard/gesture region (see `evidence/ORI-RN-004/{ios,android}/{light,dark}/`).

## AC-3 case 2 — endpoint loss + Retry — PARTIAL (web GREEN, native RED)

The new leg (this cycle's driver addition) proves on all 3 platforms that
stopping the owned backend and submitting a fresh probe turn surfaces a
SANITIZED error with an accessible `Retry` control. The web leg additionally
proves the full recovery: Retry creates a new request that completes a NEW
provider-correlated record with exactly 1 retained user turn. The iOS/Android
retry requests die server-side (`error`, 0 deltas, ~330-560 ms) — a genuine
product defect root-caused to the hook/SDK request payload (duplicate OpenAI
`itemId`s), owned by ORI-AI-001 files outside this task's allowlist. Full
analysis + repro + bisect: `../red/RED-rerun.md`; observed failures in
`../full-run-rerun.log` (R2B) and `../ios-diag-run-R2C.log`.

## Gates

- `pnpm typecheck` (root, apps excluded) — exit 0.
- scoped `biome ci` on the task files + full `biome ci .` — exit 0 (clean env).
- `pnpm check:fallow` — exit 0 (complexity finding fixed via `webLegPassed`).
- scoped `tsc -p tsconfig.live-chat.json` — exit 0 (via the AC-5 case).
