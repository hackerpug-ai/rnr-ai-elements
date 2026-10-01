# ORI-RN-004 — evidence

The separate `/live-chat` worked example and its three-platform proof. This
directory is refreshed by the cycle-3 GREEN run `ORI-RN-004-C3F-1789744559`
(`pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts
--platforms ios,android,web`): **3/3 platforms passed, `completed: true`** —
including AC-3 case 2 (endpoint loss + Retry) on every leg.

Stack: real iPhone 17 simulator `81487B1E-…` (iOS 26.3) + emulator-5554 with
Expo Go 57.0.9, real Metro on :8095, the owned ORI-AI-001 backend on :4000
(`gpt-4.1-mini-2025-04-14`, `maxOutputTokens: 4096`), and a real `expo export`
web build served same-origin (real `/api/chat` forwarding) in Chromium.

## What the final run proves

- **AC-1 (separate live route)** — all 3 platforms open `/live-chat` with the
  empty-state transcript (0 turns) and a usable `Send message`; the marker turn
  lands exactly once; the composer clears; the `/` offline route stays separate.
- **AC-2 (incremental + contextual history)** — every conversational turn is
  hard-gated on its own NEW terminal `completed` provider record; the follow-up
  answer quotes the exact `ORI-RN-004:<run-id>:<platform>` marker that the
  follow-up prompt does not contain.
- **AC-3 case 1 (active Stop)** — every native appearance stops a real
  mid-stream essay (aborted provider record; Android via the coordinate hot path
  with zero device reads between send and stop); web catches `Stop generating`
  mid-request.
- **AC-3 case 2 (endpoint loss + Retry)** — the owned backend is stopped through
  its lifecycle handle, a fresh nonsecret probe turn ("Reply with the single
  word pineapple.") is submitted, all 3 platforms surface a SANITIZED error with
  an accessible `Retry`, and after restarting the endpoint the retry completes a
  NEW provider-correlated record with exactly 1 retained user turn (the FIX-
  ORI-AI-001-1 payload sanitization holds on-device: 24 records = 20 completed +
  4 aborted + 0 error).
- **AC-4 (readable native streaming + keyboard)** — `ios/` and `android/`
  screenshots in light AND dark show readable nonempty assistant text, the
  seeded marker turn, and the composer above the keyboard/gesture region
  (appearance verified per-file by pixel histogram: light captures ~0.01 dark
  fraction, dark captures ~0.9).
- **AC-5 (strict live import graph)** — `live-import-graph-typecheck.txt`: the
  scoped compiler exits 0 with the route + both composition components + the
  installed ai components in its program, and the negative control (an
  omit-config) does not list the route; `example-package-typecheck.txt`: the
  whole-example diagnostic retained separately and unsuppressed (exit 2 —
  pre-existing gallery/server errors; every sprint-05 diff on those files is
  empty).

## The transcript-count oracle (why it is shaped this way)

"Exactly 1 user turn" must be read from the virtualized transcript, which by
the retry phase spans ~6 screens with its stickiness long released — a count
read wherever the viewport happens to sit counts the wrong window. The driver
(`transcriptProbeCount`) therefore clears the screen-level obstructions first
(iOS's still-focused composer keyboard — Maestro's `hideKeyboard` does NOT
dismiss it; an unhandled tap through `keyboardShouldPersistTaps="handled"` does
— and Android's notification shade), then counts through: (1) Maestro
`scrollUntilVisible` (direction DOWN — content direction per Maestro's docs;
the channel all four native legs won), (2) a full-height swipe crawl, (3) the
app's own `Scroll to latest message` affordance, (4) pixels (Vision OCR +
retained hierarchy dump). The count itself is innermost-match based: RN
aggregates descendant labels onto containers, so one rendered bubble can match
at both the cell wrapper and the inner Text (attempt-5 read a phantom 2 on iOS
until the counter counted innermost matches only).

Cycle-3 lineage against this branch: RED run `ORI-RN-004-1789731738223`
(web pass; all 4 native legs fail the probe count 0x with the backend holding
every completed retry — `.tmp/ORI-RN-004/cycle-3/red/`), then GREEN iterations
`.tmp/ORI-RN-004/cycle-3/green/` (attempt 1: android+web; attempts 2-4 lost to
a concurrent duplicate run and two oracle regressions; attempt 5: android+web
pass, iOS reads the aggregation phantom; attempt 6 proved it; C3F (the committed record) re-proved it on the final refactored source).

## Artifacts

- `run-manifest.json` — per-leg outcomes, diagnostics, backend identity,
  candidate/source identity (written by the final run).
- `provider-correlation.json` — every sanitized backend/provider record (24)
  across all backend instances, including the restart cycles the retry leg
  drives.
- `ios/{light,dark}/screenshot.png`, `android/{light,dark}/screenshot.png` —
  the AC-4 captures; `retry-state.png` beside them — the probe-count oracle's
  post-scroll capture showing the retained probe turn + its answer.
- `metro.log` — the run's Metro output.
- `live-import-graph-typecheck.txt` / `example-package-typecheck.txt` — AC-5.

The canonical pre-re-hardening Android proof record (per-turn provider gates,
coordinate stop path, IME findings) remains `.tmp/FIX-ORI-RN-004-1/cycle-6/`
— not duplicated here.
