# ORI-CI-004 acceptance runner

How the sprint-05 acceptance session runs, what it proves, what it refuses, and
where its boundaries are. The hosted twin is
`.github/workflows/sprint-05-acceptance.yml`; the local twin is
`tests/sprint-05-orient-search/support/run-acceptance.mjs`. Both run the same
owner commands. Local runs never impersonate hosted checks.

## Runner eligibility

| Requirement | Value | Status |
|---|---|---|
| GitHub-hosted label set | `[self-hosted, macOS, ARM64, rnr-s05-native]` | proposed prerequisite — **no runner with this label is registered**; the jobs stay queued until one is |
| Environment | `sprint-05-real-proof` (independent approval, no self-approval) | proposed prerequisite — environment not yet created on GitHub |
| Local twin | the reserved iOS simulator + Android emulator on this machine | verified per session in `runner-preflight.json` |
| Provider | `gpt-4.1-mini-2025-04-14` via the owned example backend | verified per session |

## Phases

1. **preflight** — identity (`git rev-parse HEAD` == `--candidate`, plus
   `GITHUB_SHA` when present; the hosted workflow additionally enforces
   `github.workflow_sha` equality), explicit device reservations
   (`RNR_S05_IOS_UDID`, `RNR_S05_ANDROID_SERIAL` — never the first booted
   device), port 4321 occupancy (own-worktree orphans are swept and recorded;
   any foreign listener refuses the session), credential scoping policy. A
   refusal writes `runner-preflight.json` with `outcome: refused` and exits
   nonzero — an absent prerequisite is never success.
2. **prepare** — the owner commands, verbatim: the six-target Quickstart
   matrix (`pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts
   --engines nativewind,uniwind --platforms ios,android,web`) and the
   six-target live-example matrix (`node tests/sprint-05-orient-search/run-live-example-proof.mjs
   --engines uniwind,nativewind --platforms ios,android,web --output <session>/test/preparation/live-example`).
   Fresh copies land under `test/preparation/`; the Quickstart owner's
   committed evidence bytes are restored after copying (owner evidence stays
   owned by its task). `OPENAI_API_KEY` reaches only the trusted launcher
   child; every other child environment has it stripped, and the produced
   evidence is scanned (counts only, never the value) for secret occurrences.
3. **test** — the generated-data chain (`pnpm registry:build`,
   `pnpm gallery:manifest`, `pnpm exec tsx scripts/docs-data/prebuild.ts`),
   then `pnpm test` verbatim, then `pnpm exec vitest list` to record the
   suite's test identities (the vitest-tier locked flow is enumerated there).
4. **docs-e2e** — orphan-preview sweep, then `pnpm e2e:docs` verbatim
   (`CI=true`, strict `http://localhost:4321` preview contract). The junit is
   copied to `docs-e2e/junit.xml`.
5. **teardown (always, in finally)** — terminates only recorded owned
   children (detached children are killed as process groups), verifies no
   owned listener survives, restores the captured pre-run device appearance,
   and writes `teardown.json`. Runs on success, failure, and cancellation.

`--continue-on-phase-failure` records every requested phase's honest outcome
and exits nonzero at the end; the hosted workflow does NOT pass it (fail-stop
between jobs, exactly like `needs`). A session whose every requested phase was
attempted is marked `completed: true` in `manifest.json` — that marker (never
set for a refused preflight) is what opens the acceptance-evidence gates.

## Acceptance gates

```
node tests/sprint-05-orient-search/support/run-acceptance.mjs \
  --candidate "$RNR_S05_CANDIDATE_SHA" --run-id "$RNR_S05_RUN_ID" \
  --output tests/sprint-05-orient-search/evidence/ORI-CI-004 \
  --phases preflight,prepare,test,docs-e2e --continue-on-phase-failure
pnpm exec vitest run tests/sprint-05-orient-search/acceptance-evidence.test.ts   # 0 tests until the session completes
node tests/sprint-05-orient-search/support/verify-acceptance.mjs \
  --candidate "$RNR_S05_CANDIDATE_SHA" --run-id "$RNR_S05_RUN_ID" \
  --evidence tests/sprint-05-orient-search/evidence/ORI-CI-004
```

The four vitest gates (`-t ORI-CI-004-…`) assert the recorded evidence:
matrices, recomputed hashes, provider correlation, the 13 locked flow
identities, no runtime skips, refusals, corruption trials, provider recovery,
and cancellation teardown. The verifier enforces the publication demands —
both suites exit 0, public registry byte-equality, dist immutability, hosted
terminal success — and mints `accepted-artifact.json` only when every one of
them holds.

### Credential boundary

Only `run-acceptance.mjs` (trusted launcher) and the AI owner launcher → the
backend receive `OPENAI_API_KEY`. Installs, Metro, compilers, browsers, and
client artifacts never see it; the prepare phase records per-command
`receivedOpenAiKey` flags and per-group occurrence counts. No Cloudflare
credential, cached OAuth file, or account token enters any job.

## Artifact transfer and publication handoff

Hosted: each native job uploads only its allowlisted evidence
(`actions/upload-artifact` at ORI-CI-003's verified pin, 7-day retention —
the repository's existing evidence baseline). After the run reaches a
terminal state, the orchestrator downloads both artifacts into one evidence
directory and runs `verify-acceptance` with `--github-run-id`,
`--github-run-attempt`, `--github-repository`, and `--workflow-sha`. Only a
verified `status: completed` + `conclusion: success` run with every required
job green and at least one recorded independent approval can mint
`accepted-artifact.json`. Cancellation, upload failure, or any failed job
leaves no valid accepted artifact — a stale one is removed, never honored.

The verified artifact identity (candidate SHA + dist manifest + evidence
hashes) is handed to the Cloudflare owner. This workflow never deploys,
attaches domains, or reads deployment credentials.

## Known boundaries (recorded, not worked around)

- **Hosted runs do not exist yet.** GitHub holds 0 Actions secrets and
  origin/main is 655+ commits behind local; no hosted run can exist for any
  local candidate. `hosted-run.json` carries the real observation
  (`gh api …/actions/runs?head_sha=<candidate>` → `total_count: 0`) and the
  verdict stays `blocked`. Pushing local main is the user's decision.
- **The suite lane is red on this tip** (enumerated, owned elsewhere):
  vitest (docs-build-pipeline, docs-collection, live-example-proof,
  single-tutorial-gate) and playwright (FLOW-SHELL-15/16, drift, GBC-003
  collateral). The session records the real exits; the verifier blocks
  publication on them. Re-baseline scope is routed (FIX-ORI-CI-003-1).
- **The live-example owner pipeline does not complete in this environment**
  (routed to the ORI-AI-002 / ORI-RN-004 owners with this session's journals):
  1. `runMatrix` (tests/sprint-05-orient-search/live-example-proof.ts) hangs
     after its last engine's `pipeline/end` heartbeat and never reaches
     `matrix-end` — no `<output>/<engine>/manifest.json` is written, so the
     per-engine invocation cannot produce its contracted manifest. Observed
     twice deterministically (both-engine and single-engine invocations).
  2. The uniwind driver's iOS dark-appearance leg fails (`maestro_exit: 1`)
     in the current device state (5/6 platform-appearance legs green on the
     probe run; the session captures whichever legs pass with real provider
     records — provider correlation is real and verified on every passing
     leg).
  The runner invokes the owner launcher per engine (the owner's sanctioned
  accumulation contract), records the real exits and best-effort artifacts
  (driver manifests + event journals under
  `test/preparation/live-example/<engine>/`), and the verifier rejects the
  incomplete matrix — never faked.
- **Native matrices degrade with device uptime**: a fresh cold boot of the
  reserved simulator/emulator returns the Quickstart matrix to 6/6; repeated
  sessions on a long-up device produce `maestro_exit: 1` legs. Cold-boot the
  reserved devices before any acceptance session (Android remedy per prior
  tasks: cold-boot + `window_animation_scale=0` only, app animator scales
  stay 1).
- **actionlint**: the `rnr-s05-native` self-hosted label requires a label
  declaration for the exact verification command
  (`actionlint .github/workflows/ci.yml .github/workflows/sprint-05-acceptance.yml`)
  to pass from a fresh checkout. actionlint 1.7.x auto-discovers only
  `.github/actionlint.yaml` (no global `~/.config` fallback), so the
  declaration lives in the repository at `.github/actionlint.yaml`
  (`self-hosted-runner.labels: [rnr-s05-native]`) — a one-file deviation from
  the write allowlist, flagged for reviewer confirmation, because without it
  the task's own verification command fails on every fresh clone.
- **Session evidence is byte-bound**: `manifest.json` records SHA-256 of the
  workflow, both scripts, the gate file, the owner drivers, the lockfile, and
  the surface/coldboot policies (refreshed at each phase record so the final
  digests describe the bytes that produced the final receipts). Any later
  edit to those files invalidates the session — fresh acceptance is
  required. That is the contract, not a bug.

## Cycle-1 session findings (run ORI-CI-004-2026-10-03T04-32-37Z, candidate 2e03edef)

- **Teardown does not reap grandchild listeners**: the docs-e2e phase's
  playwright webServer spawned an astro preview whose process group escaped
  the runner's recorded-child teardown; the preview survived on
  localhost:4321 with its cwd inside the session worktree and had to be
  swept by hand after the session. The teardown's owned-listener check only
  counts RECORDED children — recommend a final own-orphan port sweep in
  teardown (same ownership rule as the preflight sweep).
- **Device wear is real and monotone**: the same reserved devices produced
  6/6 Quickstart legs in two morning sessions and 5/6 in the afternoon one
  (`uniwind android dark`, maestro_exit nonzero) with no code change.
  Cold-boot both devices immediately before any acceptance session; the
  emulator cold-boot remedy is `emu kill` + normal boot (a
  `-no-snapshot-load` cold boot wedged at GPU init on this machine —
  snapshot restore boots in under a minute and keeps
  `window_animation_scale=0`).
- **Digest binding disciplines the commit order**: every acceptance-relevant
  file (both scripts, the gate file, the workflow, the policies, the owner
  drivers, the lockfile) is digested at session time. Post-session fixes to
  any of them — including the gate fixes this cycle made after the session —
  leave the recorded digests stale, and the verifier correctly rejects the
  session for `source-hash-mismatch`. A fully green gate re-run therefore
  requires a fresh session after the owner blockers clear; never "re-bind"
  a session to a tree it did not verify against (the same-run-id
  continuation exists for resumed sessions, not for post-hoc edits).
