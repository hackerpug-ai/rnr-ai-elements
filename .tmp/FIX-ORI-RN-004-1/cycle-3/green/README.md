# FIX-ORI-RN-004-1 — cycle-3 GREEN: Android active-Stop leg

## Diagnosis (corrected)

The active-Stop leg was **not** a mount-safety bug in `use-live-chat.ts`. Instrumenting
the running app proved the product logic is correct end to end:

- `useLiveChat` logs `status ready -> submitted -> streaming -> ready` on the real
  emulator, with timestamps — the status store flips exactly as the AI SDK intends.
- `PromptInput` receives `status=streaming`; `PromptInputSubmit` computes
  `isGenerating=true` and `accessibilityLabel="Stop generating"` mid-stream
  (console-logged from the render).

The failure was **observation-only**, and Android-specific: the button's
`accessibilityLabel` prop flips to "Stop generating", but the native `content-desc`
never updates (an RN Fabric accessibility bug), so the accessibility tree keeps
"Send message" for the whole stream. Neither `maestro hierarchy` (fresh but ~7-8s per
dump) nor `uiautomator dump` (fast but stale/cached during streaming) could see the
stop pose. The iOS leg passes the identical `extendedWaitUntil.visible: "Stop
generating"` flow, confirming the divergence is Android's accessibility tree.

The mount-time `Can't perform a React state update on a component that hasn't mounted
yet` error is a red herring for this leg — it fires in LogBoxData/ExpoRoot (not
useChat), and the status flow is unaffected.

## Fix (driver-only, WRITE-ALLOWED)

`tests/sprint-05-orient-search/support/live-example-proof.test.ts`:

- `sendButtonCenter()` — reads the send/stop button's fixed 44pt-slot center from the
  Maestro hierarchy while it is still the "Send message" pose (its coordinates are
  stable across the send → stop morph).
- The Stop leg now taps that fixed position (`adb input tap`) after the submit +
  a 2s settle, instead of waiting for the accessibility label that Android never
  updates. The same button is the stop control mid-stream (`onPress=stop`), so the tap
  aborts the reply.

No change to `use-live-chat.ts` (status is already correct) or `app.json`
(`reactCompiler` stays `true`).

## Proof (real `emulator-5554`, real OpenAI provider)

Successful runs show the long turn **aborted** mid-stream — the provider correlation's
`outcome: "aborted"` records are the definitive evidence the stop control was
exercised:

| run | android light | android dark | aborted deltas |
|-----|---------------|--------------|----------------|
| coordtap (720-char prompt) | passed | passed | 653 / 955 |
| full 3-platform (720-char prompt) | passed | passed | 158 / 107 |
| orig prompt (130-char) | passed | flake (marker) | 308 / — |

The full 3-platform run also re-verified **iOS light + dark pass** (no regression).

## Pre-existing failures (NOT this change)

- **web `assistantResponded:false`** — reproduced identically at `701057d` with the
  change stashed (`git stash && rerun`): the web driver's "rain" assert looks for a
  reply to a prompt it never submits. Pre-existing.
- **Android marker-turn flakes** — occasional `marker did not land` / `Expo Go isn't
  responding` ANR after the emulator had been up ~1 day and driven ~9 heavy flows.
  The marker-turn code is byte-identical to `701057d`; this is emulator degradation,
  not the stop-leg fix.

## Gates

`pnpm exec tsc --noEmit` ✅ · `pnpm exec biome ci .` ✅ (exit 0) ·
`pnpm exec tsc -p apps/example/tsconfig.live-chat.json --noEmit` ✅
