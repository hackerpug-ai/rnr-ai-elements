---
sequence: 7
timeline: Phase 3
status: planned
sprint_id: sprint-07-deploy-live-at-apex
prd: ../..
planned_from_roadmap_sha: b2465d409edcfac63b6fa04bd38cf360655930db2b96578774406ba3ce0bdeb1
planned_from_source_sha: 40fb4a6291830158e333ca5d786a1b07f58d9c79
planned_at: 2026-09-30
---

# Sprint 07: deploy-live-at-apex

**Status:** Planned
**Sequence:** 7
**Timeline:** Phase 3

## Overview

This sprint puts the delivery contract on the live site at https://rnraielements.com. The gated CI deploy publishes the docs and the 112 registry JSON files as one assets-only Worker. The apex serves three cache tiers (HTML must-revalidate, `/_astro/*` immutable, `/r/*.json` max-age=300) and a security baseline (CSP, HSTS, nosniff, frame-deny, referrer-policy). `www` answers one 301 to the apex. The real consumer CLI installs from the live domain into fresh Expo SDK 57 apps on both engines.

The roadmap gate was re-gated with owner approval. Sprint 05's ORI-DEP-001 already deployed an assets-only Worker to the apex, and the old gate (the real CLI install works) passed before this sprint started, so it proved nothing about this sprint's work. The new gate is red today on the delivery contract itself, and the CLI round trip stays as a regression step that compares the installed file with the served JSON except for the import lines the CLI rewrites by design.

Size drift: the roadmap sketched about 9 items at roughly 21-34 points. The real plan is 18 tasks and 50 points. The sketch counted the deploy job and the headers as single items. The real decomposition needs a shared live-test lane, a www zone-wiring script with a runbook, two preflight checks, a run-bound artifact hand-off, real GitHub Actions proofs, a CSP proof for search and theme, and the real-CLI round trip for two engines.

APX-005 (the serving-contract review task) was dropped. Its checks moved into the review criteria of APX-001, APX-002 and APX-004, where the sprint's own reviewer applies them.

Human-owned preconditions (the runner checks or reports them; none is a task dependency):

- The `CLOUDFLARE_API_TOKEN` repository Actions secret exists.
- The sync PR that brings GitHub `main` level with local `main` is merged, and only after APX-004, APX-031 and APX-032 are green.
- A `production` environment exists, limited to the `main` branch.
- A Cloudflare token with Zone > DNS > Edit and Zone > Single Redirect > Edit is available to run `zone-wiring.ts --apply` (or the runbook's dashboard fallback is used). The current token cannot read the redirect ruleset.
- Sprint 05's ORI-CI-003 and ORI-DEP-003 have landed first.

All implementation, functional RED, and product verification are future work. This document records a plan, not a passing gate.

## Human Testing Gate

**Gate:** Done means an integrator can run `curl -sI` against the live https://rnraielements.com and see the delivery contract on every response (HTML `public, max-age=0, must-revalidate`, `/_astro/*` `public, max-age=31536000, immutable`, each of the 112 `/r/{engine}/{item}.json` returning `200 application/json` with `public, max-age=300`, all carrying CSP, HSTS, nosniff, frame-deny and referrer-policy headers, with `www.rnraielements.com` answering one 301 to the apex), proven by a real-network sweep that ends with the site's own `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` exiting 0 in a fresh Expo SDK 57 app, its written file identical to the served JSON except the import lines the CLI rewrites.

**Entrypoint:** Production https://rnraielements.com (apex + /r/{engine}/{item}.json same-origin) and the real consumer CLI round-trip into a scratch Expo SDK 57 app

**Before:** Observed 2026-09-30 with real commands. The apex answers, but the delivery contract is absent. (1) `curl -sI https://rnraielements.com/` returns 200 with `cache-control: public, max-age=0, must-revalidate`. `/_astro/index.ZWePjmXV.css` and `/r/nativewind/conversation.json` return the same header, so there is no immutable tier and no max-age=300 tier. (2) No `content-security-policy`, `strict-transport-security`, `x-content-type-options`, `x-frame-options` or `referrer-policy` header appears on any path checked (`/`, `/nope`, the JSON, the CSS). (3) `curl -sI https://www.rnraielements.com` fails with `curl: (6) Could not resolve host`. The zone's only DNS record is the apex `AAAA 100::` (proxied), with no www record and no redirect rule. (4) A sweep of all 112 `/r/{engine}/{item}.json` URLs returns `112 200 application/json|public, max-age=0, must-revalidate`, so the files exist but carry the wrong tier. (5) `/docs/introduction` returns 404 because the live deploy is stale (Sprint 05 ORI-DEP-003 owns the republish). (6) `http://rnraielements.com/` returns 200 with no HTTPS redirect (an observation only, outside UC scope). The real-CLI round trip already passes; it stays as a regression step.

**Demonstrates:** UC-DELIV-02 (core AC-1/2 — AC-3 header tiers machine-asserted by the preview-curl lane, AC-4 gate-proven at Sprint 08), UC-DELIV-03 (all three ACs)

## Test Deliverable

*(each stranger-runnable verbatim)*

<!-- TESTING-GATE-START -->

- [ ] 1. PRECONDITION (human, before the gate runs). The human has added the CLOUDFLARE_API_TOKEN repo secret and synced GitHub main to local main through a PR. From the repo root, run `pnpm exec tsx scripts/docs-deploy/check-deploy-preconditions.ts`. Expected: three PASS lines. (1) The secret name CLOUDFLARE_API_TOKEN is listed by the GitHub API. (2) GitHub main's ci.yml contains a `deploy` job. (3) The `production` environment exists and is limited to the main branch. The command exits 0. If any check fails, it names the missing item, exits nonzero, and tells the human to fix it before continuing. Today it exits nonzero on all three.   `exercises: APX-020`

- [ ] 2. Push (merge the PR) a docs-touching change to main. Run `gh run watch` on the resulting ci run, then `gh run view <run-id>`. Expected: registry, typecheck, lint, test and docs-e2e all show success. The deploy job shows success and starts only after all five finish. On the run page, deploy's `needs` lists all five. The docs-dist artifact from docs-e2e is downloaded by deploy after the five jobs. Two steps then pass in order before the wrangler step: `Preflight dist`, then `Preflight edge`. No docs build runs inside deploy. Today there is no deploy job on any main run.   `exercises: APX-022, APX-023, APX-024, APX-031, APX-004`

- [ ] 3. Open the deploy job log with `gh run view <run-id> --log --job <deploy-job-id>`, then run `curl -sI https://rnraielements.com/`. Expected: the log shows the cloudflare/wrangler-action step running `wrangler deploy --message <the 40-hex commit sha>`, with the ./dist static assets uploaded and no secret value printed. The active Worker version's message equals that commit sha. The curl returns `HTTP/2 200` with `content-type: text/html`.   `exercises: APX-023, APX-024`

- [ ] 4. Go to https://github.com/hackerpug-ai/rnr-ai-elements/actions, pick the `ci` workflow run triggered by the push to `main` (the run the human sync PR produced), open its `deploy` job and expand the step named `Preflight dist` — it ran after the `docs-dist` artifact download and before the cloudflare/wrangler-action step, with no build step in the deploy job, exited 0, and its log contains the line `[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)` (the artifact can only carry `_headers` if the committed file reached docs-e2e's fresh checkout).   `exercises: APX-030, APX-031`

- [ ] 5. Run `curl -sI https://www.rnraielements.com/docs/introduction`, then `curl -sIL https://www.rnraielements.com/docs/introduction` — the first prints exactly one `HTTP/2 301` with `location: https://rnraielements.com/docs/introduction`, and the `-L` run ends in `HTTP/2 200` on the apex. RED today: `curl: (6) Could not resolve host: www.rnraielements.com`.   `exercises: APX-002, APX-006`

- [ ] 6. Run `curl -sI https://rnraielements.com/docs/introduction`, then `curl -sI https://rnraielements.com/no-such-page` — the first prints `HTTP/2 200` and the second `HTTP/2 404`. Both carry exactly one `cache-control: public, max-age=0, must-revalidate` (no comma-joined duplicate value), `content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'`, `strict-transport-security: max-age=31536000; includeSubDomains`, `x-content-type-options: nosniff`, `x-frame-options: DENY` and `referrer-policy: strict-origin-when-cross-origin`. RED today: no security header is present.   `exercises: APX-001, APX-006`

- [ ] 7. Run `A=$(curl -s https://rnraielements.com/ | grep -o '/_astro/[^"]*\.css' | head -1); curl -sI "https://rnraielements.com$A"` — prints `HTTP/2 200`, exactly one `cache-control: public, max-age=31536000, immutable`, and the same five security headers as the previous step. RED today: `cache-control: public, max-age=0, must-revalidate`.   `exercises: APX-001, APX-006`

- [ ] 8. From the repo root run `for e in nativewind uniwind; do for i in $(jq -r '.items[].name' packages/registry/registry.json); do curl -s -o /dev/null -w '%{http_code} %{content_type}|%header{cache-control}\n' https://rnraielements.com/r/$e/$i.json; done; done | sort | uniq -c` — prints exactly one line, `112 200 application/json|public, max-age=300`. There are no `404`, no `text/html` and no `max-age=0` lines. RED today: `112 200 application/json|public, max-age=0, must-revalidate`.   `exercises: APX-001, APX-007`

- [ ] 9. Load https://rnraielements.com/docs/introduction in Chrome with DevTools open, press ⌘K (Ctrl+K on Windows/Linux) and type `conversation` — the search dialog's status line reads `<N> results — ↵ opens, ↑↓ select, esc closes` with N ≥ 1 (20 on the 2026-09-29 build) and the first result is **Conversation** linking to /components/conversation/; the Console shows no line containing `Content Security Policy` or `Failed to load the Pagefind WASM`; and DevTools → Network → the `introduction` document's Response Headers include `content-security-policy` whose script-src lists `'wasm-unsafe-eval'` (a missing CSP header fails this step: search that works with no CSP proves nothing).   `exercises: APX-032`

- [ ] 10. Load https://rnraielements.com/docs/introduction in Safari with Develop → Show JavaScript Console open, press ⌘K and type `conversation` — the dialog lists at least 1 result with **Conversation** (/components/conversation/) first, and the console shows no error mentioning `Content Security Policy`, `wasm-unsafe-eval`, or `Failed to load the Pagefind WASM`.   `exercises: APX-032`

- [ ] 11. Click the header's **Theme** button on https://rnraielements.com/docs/introduction in Chrome until the page turns light, then hard-reload with ⌘⇧R (Ctrl+Shift+R) — the reloaded page is light from its first painted frame (no dark-to-light flash), typing `document.documentElement.classList.contains('light')` into the Console returns `true`, and the Console shows no `Content Security Policy` error for the inline theme script.   `exercises: APX-032`

- [ ] 12. Load the deploy token from the gitignored `.env` at the repo root (`set -a; . ./.env; set +a`), then run `pnpm --dir apps/docs exec wrangler versions view "$(pnpm --dir apps/docs exec wrangler deployments status --config wrangler.jsonc --json | jq -r '.versions[0].version_id')" --config wrangler.jsonc --json | jq -r '.annotations["workers/message"]'` — prints a 40-character commit SHA. It equals the SHA printed by `gh run list --workflow ci.yml --branch main --status success --limit 1 --json headSha --jq '.[0].headSha'`. Today it prints `null`, because live version `bb65ae86-7586-45da-8bdb-27d734ded8b9` carries only `workers/triggered_by`.   `exercises: APX-040, APX-042`

- [ ] 13. Run `git fetch origin`. Then compare each engine's live file with the file committed at the SHA from step 12: `for E in nativewind uniwind; do git show <SHA-from-step-12>:public/r/$E/conversation.json | shasum -a 256; curl -s https://rnraielements.com/r/$E/conversation.json | shasum -a 256; done` — the four lines form two pairs of identical 64-hex hashes: nativewind first, then uniwind. CI's `registry` job, which the deploy job needs, proved the committed file fresh at that SHA.   `exercises: APX-040, APX-042`

- [ ] 14. From the repo root, build a fresh Expo SDK 57 app per engine from the committed templates and run the exact command the site shows: `R=$(mktemp -d); for E in nativewind uniwind; do mkdir "$R/$E" && git archive HEAD:packages/docs-snippets/$E | tar -x -C "$R/$E" && rm "$R/$E/app/index.tsx" && (cd "$R/$E" && unset NODE_ENV && pnpm install && npx expo install && npx @react-native-reusables/cli@latest add https://rnraielements.com/r/$E/conversation.json); echo "$E exit=$?"; done`. The template's app/index.tsx imports a Quickstart screen that is not part of this install. If `pnpm install` fails resolving `react-native-web`, rerun the whole step once from a new `R`, never inside a populated app. — prints `nativewind exit=0` and `uniwind exit=0`. Each CLI run ends `Created 5 files:` listing `components/ui/text.tsx`, `components/ui/icon.tsx`, `components/ui/button.tsx`, `components/ui/empty.tsx`, and `components/ai/conversation.tsx`. empty.tsx is the same-origin dependency `https://rnraielements.com/r/$E/empty.json`.   `exercises: APX-041`

- [ ] 15. In the same terminal, so `$R` is still set, compare what the CLI wrote with what the site serves: `for E in nativewind uniwind; do echo "== $E"; diff <(curl -s https://rnraielements.com/r/$E/conversation.json | jq -j '.files[0].content') "$R/$E/components/ai/conversation.tsx"; done` — each engine prints exactly one hunk, `1,4c1,4`. On the left are the served imports from `@/registry/$E/components/ui/button`, `@/registry/$E/components/ui/empty`, `@/registry/$E/components/ui/icon`, and `@/registry/$E/lib/utils`. On the right are the installed imports from `@/components/ui/button`, `@/components/ui/empty`, `@/components/ui/icon`, and `@/lib/utils`. The file is identical to the served JSON except the import lines the CLI rewrites; no other line differs.   `exercises: APX-041`

- [ ] 16. Compile both apps with their own TypeScript: `for E in nativewind uniwind; do (cd "$R/$E" && pnpm exec tsc --noEmit); echo "$E tsc exit=$?"; done` — prints `nativewind tsc exit=0` and `uniwind tsc exit=0` with no diagnostics above them. The rewritten `@/components/…` and `@/lib/…` imports resolve against the files the CLI wrote.   `exercises: APX-041`

- [ ] 17. The delivery arc. Open a PR that edits one registry component source, with the regenerated public/r JSON committed. Let the PR's ci run go green and merge it. Watch the push run through to a green deploy. Then run `curl -s https://rnraielements.com/r/nativewind/<edited-item>.json | shasum -a 256`. Expected: within 300 seconds of the deploy job finishing, the live hash equals the hash of `public/r/nativewind/<edited-item>.json` at the merge commit. The same hash appears in the run's docs-dist artifact, so the docs and the registry JSON came from one deploy. Today this is impossible because nothing deploys from CI.   `exercises: APX-022, APX-023, APX-025`

- [ ] 18. First contact — in a new terminal on your own Mac, as it is (your own network and DNS resolver, nothing seeded, no scratch HOME), run `curl -sI https://www.rnraielements.com/` and `curl -sI https://rnraielements.com/r/nativewind/conversation.json`. Then open https://rnraielements.com/docs/introduction in your everyday browser and press Cmd+K. Stop before any `npx ... add`, because that command writes into a project. Promise (UC-DELIV-02): "The static dist/ deploys as Cloudflare Workers static assets at the rnraielements.com apex, gated behind the existing quality jobs, with security headers, tiered caching, previews, and rollback." Promise (UC-DELIV-03): "Install commands point at rnraielements.com because the registry JSON is served same-origin by the same deploy that serves the docs." You should see your own resolver return one 301 from www to the apex (no stale unresolved-host answer), the JSON return `200`, `application/json` and `public, max-age=300`, the docs page load fully styled in your saved theme, and Cmd+K search return results with no blocked-by-CSP error in your browser's DevTools console.   `exercises: APX-001, APX-002`

<!-- TESTING-GATE-END -->

**Dark tasks:** APX-021 (2 pts) — Test-support plumbing with no user-facing surface. Gate steps 2-4 exercise it through APX-024 and APX-025.; APX-026 (1 pts) — Repo-config upkeep with no gate-visible surface. It is verified in review by actionlint-adjacent schema check and by Dependabot's first PR after the sync.

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| APX-004 | Edge-config preflight: assets-only zero-bindings wrangler.jsonc, 404.html present, optional www-redirect gate | cloudflare-workers-implementer | 2 | A | ⬜ Pending |
| APX-006 | Live-origin edge-contract lane: shared config and RED-first header/www spec | cloudflare-workers-implementer | 3 | A | ⬜ Pending |
| APX-030 | Let the edge config files be committed so every fresh-checkout build ships them | astro-implementer | 1 | A | ⬜ Pending |
| APX-002 | www to apex: zone wiring script (DNS record and 301 rule) plus runbook, failing loudly without authority | cloudflare-workers-implementer | 5 | B | ⬜ Pending |
| APX-007 | Live 112-file completeness sweep spec (per-engine tally, max-age=300) | cloudflare-workers-implementer | 2 | B | ⬜ Pending |
| APX-020 | Add the fail-closed deploy precondition check (secret, synced main, production environment) | ghactions-implementer | 2 | B | ⬜ Pending |
| APX-021 | Add the real-GitHub observation support module for the shared live lane | ghactions-implementer | 2 | B | ⬜ Pending |
| APX-022 | Hand the tested docs dist from docs-e2e to deploy as a run-bound artifact | ghactions-implementer | 2 | B | ⬜ Pending |
| APX-040 | Author the same-deploy half of FLOW-DELIV-03-live-registry-round-trip RED-first in a sprint-07 live lane | react-native-reusables-implementer | 3 | B | ⬜ Pending |
| APX-001 | Author `apps/docs/public/_headers`: three cache tiers plus the security baseline | cloudflare-workers-implementer | 3 | C | ⬜ Pending |
| APX-041 | Add the real-CLI round trip into fresh Expo SDK 57 apps, both engines, with the exact alias-transform assertion | react-native-reusables-implementer | 3 | C | ⬜ Pending |
| APX-031 | Refuse an upload unless dist carries all 112 registry items, both registry indexes, and the committed _headers byte-for-byte | astro-implementer | 3 | D | ⬜ Pending |
| APX-032 | Prove the shipped CSP keeps Pagefind search and the pre-paint theme script working on the built site | astro-implementer | 3 | D | ⬜ Pending |
| APX-023 | Add the gated deploy job to ci.yml (push to main only, two preflights, commit-stamped wrangler deploy) | ghactions-implementer | 5 | E | ⬜ Pending |
| APX-024 | Prove FLOW-DELIV-02-gated-deploy-order against a real GitHub Actions run | ghactions-implementer | 3 | F | ⬜ Pending |
| APX-025 | Prove the docs-delivery-arc journey: merged registry edit reaches the apex within the 300s TTL | ghactions-implementer | 5 | F | ⬜ Pending |
| APX-026 | Add Dependabot for github-actions so SHA pins get reviewed updates | ghactions-implementer | 1 | F | ⬜ Pending |
| APX-042 | Turn FLOW-DELIV-03-live-registry-round-trip green against the first gated GitHub Actions deploy and record run.json | react-native-reusables-implementer | 2 | G | ⬜ Pending |

## Automated Functional Coverage

This table projects the 5 locked flows. `human-flows.json` and each task's Requirement Contract stay authoritative; the exact runnable command for each flow is its `run_cmd` there. Gate step 18 (first contact) is deliberately bound to no flow.

| Flow ID | Scope | Gate | Primary owner | Test file / function | Replay phase |
|---|---|---:|---|---|---|
| FLOW-DELIV-02-gated-deploy-order | task | 2, 3 | APX-024/AC-1 | tests/sprint-07-deploy-live-at-apex/gated-deploy-order.remote.spec.ts :: FLOW-DELIV-02-gated-deploy-order | task |
| FLOW-DELIV-02-header-and-domain-contract | task | 5, 6, 7 | APX-006/AC-1 | tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts :: FLOW-DELIV-02-header-and-domain-contract | task |
| FLOW-DELIV-03-112-file-completeness | task | 8 | APX-007/AC-1 | tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts :: FLOW-DELIV-03-112-file-completeness | task |
| FLOW-DELIV-03-live-registry-round-trip | task | 12, 13, 14, 15, 16 | APX-040/AC-1 (GREEN at APX-042) | tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts :: FLOW-DELIV-03-live-registry-round-trip | task |
| journeys/docs-delivery-arc | journey | 17 | APX-025 | tests/sprint-07-deploy-live-at-apex/docs-delivery-arc.remote.spec.ts :: journeys/docs-delivery-arc | post-integration |

## Source Coverage

- 07-uc-deliv.md UC-DELIV-02 AC-1..3, UC-DELIV-03 AC-1..3
- TR-01 posture 3/6/7; TR-04 (all URL contracts); TR-06 (Delivery); TR-09 (CAP-DEP-01 + CAP-INST-01); TR-11 §1/§4/§7
- 12-e2e-testing-criteria.md T-DELIV-005..008, T-DELIV-011..013, T-DELIV-015, T-DELIV-016

## Capability Coverage

- CAP-DEP-01: owns the deploy hop (gated, assets-only, scoped token) — first live proof
- CAP-INST-01: the real-CLI round-trip against the live domain, both engines

## Blocks

- Sprint 08, Sprint 09, Sprint 10

## Task Detail Files

- TASK-APX-004.md
- TASK-APX-006.md
- TASK-APX-030.md
- TASK-APX-002.md
- TASK-APX-007.md
- TASK-APX-020.md
- TASK-APX-021.md
- TASK-APX-022.md
- TASK-APX-040.md
- TASK-APX-001.md
- TASK-APX-041.md
- TASK-APX-031.md
- TASK-APX-032.md
- TASK-APX-023.md
- TASK-APX-024.md
- TASK-APX-025.md
- TASK-APX-026.md
- TASK-APX-042.md
