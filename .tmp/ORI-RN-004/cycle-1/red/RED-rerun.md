# ORI-RN-004 — RED (re-run cycle, against current main 45464ed0)

The composed surface (route, screen, message components, driver, maestro flow,
tsconfig.live-chat.json) plus the FIX-ORI-RN-004-1 hardening are already landed on
main. The failure this cycle is the task's own evidence gate, read off the real
committed artifacts (no authored failure flags):

- `tests/sprint-05-orient-search/evidence/ORI-RN-004/run-manifest.json` (copied to
  `stale-run-manifest.json`) binds `candidate_head_sha: cffcdb95…` (the cycle-0
  branch tip), reports `passed_platforms: 1, completed: false` — the Android and
  web legs were still failing when it was written.
- Current tree HEAD is `45464ed0`. The task's DONE WHEN ("All five criteria have
  observed RED/GREEN evidence from the real three-platform Uniwind screen") and
  the review gate "Evidence binds the same source/run" are therefore NOT met by
  the committed evidence: no all-platform passing run is recorded for this source.
- No evidence README exists in
  `tests/sprint-05-orient-search/evidence/ORI-RN-004/`; the stale state it must
  supersede (the pre-FIX `assistantResponded: false` web false-negative) is still
  the only story the artifacts tell.

The functional RED for the original implementation (route absent from the compiler
program; Android `enabled=false` composer; web "not configured" bundle) was
observed and recorded in cycle 0 / FIX-ORI-RN-004-1 — see `RED.md` and
`.tmp/FIX-ORI-RN-004-1/cycle-*/` (landed on main). This cycle's GREEN is a fresh
same-invocation three-platform run + compiler case bound to the current HEAD,
plus the corrected evidence README.

## Second red facet — the driver itself

AC-3 case 2 (endpoint loss + retry) demands, per platform: a sanitized
service-loss error, an accessible `Retry` control, a retry that creates a NEW
real request ID completing a provider-correlated answer, and exactly 1 retained
user turn for the failed submission. The task's BOUNDARY CONTRACTS require the
driver to "Drive send, contextual follow-up, active Stop, server-loss and retry
on actual controls."

The committed driver (live-example-proof.test.ts at 45464ed0) drives NONE of
that: `grep -n "restart\|Retry"` over it finds no backend stop/restart and no
Retry interaction — every leg ends after the active-Stop turn. AC-3's second
assertion group is therefore unevidenced, i.e. the driver's claim to prove
AC-1..AC-4 is false as committed. (The app-side surface exists and is landed —
`live-chat-screen.tsx` renders the hook's error with `accessibilityRole="alert"`
and an accessible Retry wired to `chat.retry` — but no run ever exercised it.)

GREEN for this facet: the driver gains the endpoint-loss + retry leg on all
three platforms (owned-backend stop through the lifecycle handle → probe turn →
sanitized-error + Retry observation → restart → retry → NEW completed provider
record → exactly-one-retained-user-turn check), and the fresh run passes it
everywhere.

## Observed functional RED of the retry-completion oracle (runs R2B / R2C)

With the new leg live, the full run (`ORI-RN-004-R2B-1789552900`) and the iOS
diagnostic run (`ORI-RN-004-R2C-iosdiag`) observed, on the real stack:

- ALL FIVE legs pass everything up to and including the endpoint-loss surface:
  the owned backend stops, the probe turn is retained, a sanitized error
  renders, and the accessible `Retry` control appears (hierarchy/web-DOM
  observed).
- The WEB leg's Retry completes a NEW provider record (2 deltas, new response)
  with exactly 1 retained user turn — full pass.
- The iOS and Android legs' Retry taps DO reach the restarted backend but the
  request dies server-side: `outcome: "error"`, `deltaCount: 0`,
  `durationMs: ~330-560`, `errorText: "An error occurred while generating the
  response."` (the server's sanitized generic text), empty stderr. Provider
  records for these runs: `provider-correlation.json` + the diagnostics quoted
  in `../ios-diag-run-R2C.log` and `../full-run-rerun.log` (R2B copy in
  `../pre-retry-leg-baseline-run.log` is the pre-leg baseline PASS).

## Root cause (reproduced headlessly + bisected — probes in this directory)

`probe-sdk-regenerate.ts` drives the REAL SDK classes the hook wraps
(`Chat` from @ai-sdk/react 4.0.92 + `DefaultChatTransport` from ai 7.0.89, the
hook's exact options: transport + throttle 50) against the REAL backend and
reproduces the identical failure. The captured regenerate request body
(`regenerate-body.json`, `regenerate-body2.json`) contains DUPLICATED assistant
message entries — the same message id (and the same OpenAI `itemId` in
`providerMetadata`) appearing 3-4x as growing text snapshots — plus trailing
empty assistant placeholders from the failed submission.

`probe-bisect.ts` replays that body against the real backend and bisects:

| variant                                     | outcome   |
| ------------------------------------------- | --------- |
| full captured body                          | error     |
| duplicate-id messages removed               | completed |
| empty assistants removed                    | error     |
| part `providerMetadata`/`state` stripped    | completed |
| `step-start` parts removed                  | error     |

So the poison is the repeated OpenAI `itemId` (each variant that leaves each
itemId appearing exactly once completes; the provider 400s on the duplicates).
`probe-first-request.ts` / `probe-retry-payload.ts` / `probe-shapes.ts` rule out
cold-backend, regenerate-shaped history, empty assistants, consecutive users and
step-start parts in isolation.

**Ownership:** the request payload is assembled by the hook
(`apps/example/lib/use-live-chat.ts`, ORI-AI-001, writeProhibited for this
task) driving the installed @ai-sdk/react/ai versions (dependency ownership also
ORI-AI-001), or alternatively must be sanitized server-side
(`apps/example/server/**`, also writeProhibited). No ORI-RN-004-allowlisted
file can fix the request payload: the screen has no message-mutation API, and
re-sending via `sendMessage` would duplicate the retained user turn (violating
the exactly-1 oracle).
