# ORI-RN-004 cycle 3 — RED

## Command

```
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web
```

Executed (unattended, launched by the prior session before it was killed; the same
working-tree driver this cycle inherited) as run `ORI-RN-004-1789731738223`
(05:42–06:22 MDT). The pre-implementation candidate = branch tip `a86231aa` + the
inherited WIP oracle (blind 4-round swipe loops on Android, screenshot + Vision OCR
on iOS).

## Observed failure (functional, not authored)

- `web`: **passed** (full retry recovery incl. the single-probe-turn count).
- `ios light`, `ios dark`, `android light`, `android dark`: **failed**, every leg at
  the same assertion — AC-3 case 2's "exactly 1 user turn" transcript count:

  ```
  retry probe appears 0x in the transcript (expected exactly 1)
  ```

- Server-side ground truth for the SAME run (`provider-correlation.json`):
  **24 records = 20 completed + 4 aborted + 0 error** — every leg's retried turn
  completed a real provider round-trip (the FIX-ORI-AI-001-1 payload sanitization
  holds on-device). The product behavior is correct; the transcript-count oracle is
  the failing part.

## Root cause (read off the run's own captures)

The Conversation is an inverted virtualized FlatList whose stickiness releases on
the first scroll-up and never auto-reclaims. By the retry phase the transcript
spans several screens (the aborted essay alone covers ~3), so the viewport parks
mid-transcript:

- iOS `retry-state.png` captures show the essay turn, not the probe turn (live
  simulator inspection during the run showed the probe turn and its "Pineapple."
  answer rendered, but below the fold).
- Android `stateSummary` at failure shows the seed/follow-up turns at the top of
  the dump, with a system heads-up ("Set a screen lock") present — 4 blind swipes
  cannot cross the distance and can be eaten by the shade.

The pre-fix oracle read the hierarchy wherever the viewport happened to sit — it
counted the WRONG window.

## Fix direction (implemented after this RED)

`transcriptProbeCount` (driver): channel 1 Maestro `scrollUntilVisible` to the
probe turn (verified scroll, a11y tree re-resolved per gesture) + element-based
hierarchy count (raw substring counts would double-count elements exposing the
string in both `accessibilityText` and `text`); channel 2 the app's own `Scroll to
latest message` affordance / full swipes; channel 3 Vision OCR of the captured
retry-state screenshot with the final hierarchy dump retained beside it.

## Artifacts

- `full-run.log` — the run's console result (`completed: false`).
- `run-manifest.json` — per-leg outcomes and diagnostics.
- `provider-correlation.json` — all 24 sanitized backend records.
