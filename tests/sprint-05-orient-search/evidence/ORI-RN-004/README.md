# ORI-RN-004 — evidence

The separate `/live-chat` worked example and its three-platform proof. This
directory is refreshed by the re-run cycle against candidate HEAD `45464ed0`
(main + the landed FIX-ORI-RN-004-1 driver hardening); the previous copy bound
the cycle-0 branch tip `cffcdb95` and reported `passed_platforms: 1 /
completed: false`, which no longer described the tree.

## Corrected web-leg note (supersedes the earlier false negative)

The web leg now submits the seed prompt ("three short facts about rain") before
asserting the streamed reply, so `assistantResponded` is `true` on a real
round-trip. The old driver asserted rain from a reply to a prompt it never sent
— a deterministic false negative documented in earlier cycles — and that
behavior is gone (fixed by FIX-ORI-RN-004-1 cycle 6; re-proven here on every
web run: R2, R2B, R2D, R2E).

## What the final run proves

Final run: `ORI-RN-004-R2E-1789560800` (`pnpm exec tsx
tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms
ios,android,web`), real iPhone 17 simulator `81487B1E-…` (iOS 26.3) +
emulator-5554 with Expo Go 57.0.9, real Metro on :8095, the owned ORI-AI-001
backend on :4000 (`gpt-4.1-mini-2025-04-14`, `maxOutputTokens: 4096`), a real
`expo export` web build served same-origin (real `/api/chat` forwarding) in
Chromium.

- **AC-1 (separate live route)** — all 3 platforms open `/live-chat` with the
  empty-state transcript (0 turns) and a usable `Send message`; the marker turn
  lands exactly once; the composer clears; the `/` offline route stays separate.
- **AC-2 (incremental + contextual history)** — every conversational turn is
  hard-gated on its own NEW terminal `completed` provider record; the follow-up
  answer quotes the exact `ORI-RN-004:<run-id>:<platform>` marker that the
  follow-up prompt does not contain.
- **AC-3 case 1 (active Stop)** — every native appearance stops a real
  mid-stream essay (aborted provider record, 100-240 deltas already streamed;
  Android via the coordinate hot path with zero device reads between send and
  stop); web catches `Stop generating` mid-request.
- **AC-4 (readable native streaming + keyboard)** — `ios/` and `android/`
  screenshots in light AND dark show readable nonempty assistant text, the
  seeded marker turn, and the composer above the keyboard/gesture region.
- **AC-3 case 2 (endpoint loss + Retry)** — this re-run ADDED the missing leg:
  the owned backend is stopped through its lifecycle handle, a fresh nonsecret
  probe turn is submitted, and all 3 platforms must surface a SANITIZED error
  with an accessible `Retry` control; restarting the endpoint and activating
  Retry must complete a NEW provider-correlated record while leaving exactly 1
  retained user turn. Current observed status:
  - **web: full pass** (retry completes a new 2-delta record; probe appears
    exactly once).
  - **ios/android: the sanitized-error + Retry surface passes; retry
    COMPLETION fails** — a genuine product defect, not a driver gap. The retry
    request reaches the restarted backend and dies server-side (`error`, 0
    deltas, ~330-560 ms). Root-caused headlessly with the hook's exact SDK
    classes and bisected on the real backend to duplicated assistant messages
    carrying repeated OpenAI `itemId`s in the regenerate payload (any variant
    that leaves each `itemId` unique completes). The payload is assembled by
    `apps/example/lib/use-live-chat.ts` / the installed `@ai-sdk/react@4.0.92`
    + `ai@7.0.89` (ORI-AI-001 ownership — dependency + hook), or must be
    sanitized in `apps/example/server/**` (also ORI-AI-001). No file in this
    task's allowlist can fix the request payload. Full repro + bisect tables:
    `.tmp/ORI-RN-004/cycle-1/red/RED-rerun.md` (probes alongside).

## Artifacts

- `run-manifest.json` — per-leg outcomes, diagnostics, per-leg hierarchy
  excerpts, backend identity, candidate/source identity (written by the final
  run).
- `provider-correlation.json` — every sanitized backend/provider record for the
  run (request/response ids, outcome, delta counts, final text hashes) across
  all backend instances, including the restart cycles the retry leg drives.
- `ios/{light,dark}/screenshot.png`, `android/{light,dark}/screenshot.png` —
  the AC-4 captures (written even when a leg's retry phase fails, so they always
  bind to THIS run).
- `metro.log` — the run's Metro output.
- `live-import-graph-typecheck.txt` — AC-5: the exact scoped compiler command,
  exit status, the real program file list (includes the route + both
  composition components + the installed ai components), the negative control
  (an omit-config does not list the route), and the verbatim compiler output.
- `example-package-typecheck.txt` — the whole-example diagnostic retained
  separately and unsuppressed (exit 2; pre-existing gallery/server errors —
  every sprint-05 diff on those files is empty).

## Run lineage (this cycle, all against 45464ed0)

| run id | scope | result |
| --- | --- | --- |
| `ORI-RN-004-R2-1789552340` | 3 platforms, pre-retry-leg driver (the landed surface) | 3/3 platforms PASS (baseline) |
| `ORI-RN-004-R2B-1789552900` | 3 platforms, + retry leg | web PASS; ios/android fail only at retry completion |
| `ORI-RN-004-R2C-iosdiag` | ios only, diagnostics with record dumps | confirmed the server-side error record |
| `ORI-RN-004-R2D-1789557100` | 3 platforms (repeat) | identical shape to R2B — stable |
| `ORI-RN-004-R2E-1789560800` | 3 platforms, final (screenshot-on-failure fix) | the committed record |

The canonical pre-re-hardening Android proof record (per-turn provider gates,
coordinate stop path, IME findings) remains
`.tmp/FIX-ORI-RN-004-1/cycle-6/` — not duplicated here.
