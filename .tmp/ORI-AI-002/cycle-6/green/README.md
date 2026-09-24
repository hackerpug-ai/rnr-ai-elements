# ORI-AI-002 — cycle 6 GREEN (2026-09-24, revised proof contract)

All gates green under the cycle-6 revised contract (task Amendments 2026-09-24):

## The accumulated evidence set (fresh per-engine invocations, one candidate SHA)

- `uniwind` set: run `ORI-AI-002-1790254489381` — `--engines uniwind --platforms
  ios,android,web`, exit 0, manifest `engines: ["uniwind"]`, `exit_code: 0`,
  3 accepted targets (uniwind-ios/android/web, full artifacts incl.
  screen recordings).
- `nativewind` set: run `ORI-AI-002-1790256894249` — same shape, exit 0.
- Both manifests pin IDENTICAL source digests (one candidate SHA), distinct run
  ids, identical API origin, reserved-device identities recorded.
- Contracted environment protocol held: cold reboot of the reserved devices
  before and between engines, TMPDIR=/tmp/ori-ai-002-scratch for children,
  port-4000 pre-clear before each backend launch, unrelated sim untouched.

## Gates

- `vitest-green.txt`: `pnpm exec vitest run
  tests/sprint-05-orient-search/live-example-proof.test.ts` — 4/4 passed, exit
  0. The suite validates the accumulated set on disk (per-engine manifests,
  cross-manifest digest identity, per-target artifacts + provider correlation,
  tamper cases through the real validator, intact-set validations, teardown
  cleanliness) — it no longer spawns a matrix.
- `typecheck.txt`: `pnpm typecheck` — exit 0.
- `biome.txt`: scoped `biome ci` on the three task files — exit 0.
- Per-engine logs: `uniwind-engine-final.log`, `nativewind-engine-final.log`.

## Code this cycle (all in the allowlist)

- Runner: single-engine invocations partition into
  `evidence/ORI-AI-002/<engine>/`; manifest records `engines` and its own
  validated `exit_code`; the validator derives expected targets from the
  manifest's declared engines and completes at that count (the leftover
  `=== 6` was the intact-set false rejection — measured correctly this time,
  no shell pipes).
- Synthesizer honesty fixes, each forced by the suite failing on real runs:
  per-target session scoping via the drivers' `latest_backend_record` (the
  records stream interleaves all legs; one session id spans ~30 turns),
  `completed_before_stop` correct native semantics (each turn yields exactly
  one terminal record; the drivers' bounded re-drives reject
  completed-before-stop attempts before a leg can pass), truncation-tolerant
  follow-up-recall derivation anchored to the session's third completed
  record's observation time, endpoint-loss visible_error derivation matching
  both drivers' actual log wordings, and the follow-up-bubble prefix fix
  ("For request", the fixture's literal wording).
- web-self first-prompt bounded re-drive hardened: ALWAYS relaunch the owned
  child (a zombie tsx wrapper reports started) and re-send from a fresh page
  in the same context (final4: both attempts died to the port-4000 handoff
  race).
- Suite rewritten to the accumulated-evidence shape (fixture sourcing per the
  amendment; web prefix sampling compared as >=, native as exact equality).

## Flake ledger (documented, in the ORI-RN-004-owned driver — not fixable here)

Today's engine attempts: uniwind 1/2 web retryControlVisible oracle flake
(retryCompleted=true, retrySingleUserTurn=true, control gone at sample; also
final2 and final4-era), attempt-1 ios marker-echo assert, nativewind attempt-1
android follow-up crawl, final4 web-self port-4000 handoff (defended), final2
synthesis crash (fixed). The per-engine shape converges: each reroll is ~35
minutes, and the final sets above are fully green.

Note: `.tmp/ORI-AI-002/cycle-6/validate-cases/` (the suite's transient tamper-case
copies of the evidence — recreated on every vitest run) is intentionally NOT
committed: 141 duplicated files including full recording copies tripped the
repo's fallow pre-commit audit and carry no ledger value beyond the suite run.
