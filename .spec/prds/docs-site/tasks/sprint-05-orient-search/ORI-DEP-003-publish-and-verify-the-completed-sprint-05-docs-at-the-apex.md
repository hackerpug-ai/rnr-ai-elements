# ORI-DEP-003: Publish and verify the completed Sprint 05 docs at the apex

## What this does

Promote the already uploaded, accepted Sprint 05 version to https://rnraielements.com and verify its public pages, search recovery, registry bytes, and fresh consumer installs.

## Why

An accepted build and an uploaded version do not prove what visitors receive. Publication needs a traceable connection from accepted source and evidence to the active apex version and actual downloaded bytes.

## How to verify

Run the exact completed-phase HTTP check and remote Playwright suite listed below. Inspect the recorded deployment identities, response hashes and statuses, search navigation, and fresh CLI-installed files. All evidence paths are future outputs; this charter reports no executed verification.

## Scope

Start with ORI-CI-004's accepted immutable artifact and ORI-DEP-002's verified uploaded version. End when that exact version serves the apex and all four acceptance criteria have captured real evidence. Write only the nine allowlisted files. This task owns publication and verification; it does not rebuild the candidate or change domain attachments.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

> Status: Backlog
> Assignee: cloudflare-workers-implementer
> Priority: P1 · Points: 3 · Type: INFRA
> Dependency phase: after ORI-DEP-001, ORI-DEP-002, and ORI-CI-004
> Proposed By: cloudflare-workers-planner
> Co-authored By: ghactions-planner, react-native-reusables-planner, aisdk-planner, astro-planner
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer
> PROGRESS: 0/4 acceptance criteria verified; all TDD_STATE values are none.

## Outcome

The accepted Sprint 05 version serves the verified apex, with matching public bytes, working search recovery, and fresh public registry installs.

## Critical constraints — Never

1. Never overwrite another operator's deployment, replace a domain attachment, or restore a prior version without the Cloudflare owner's authorization and a fresh ownership check.
2. Never regenerate, mutate, or reupload the accepted dist; source, artifact, evidence, version, account, Worker, or attachment drift stops promotion.
3. Never satisfy public proof with a preview host, hosts-file override, URL rewrite, disabled TLS validation, mocked HTTP, canned response, or reused install receipt.
4. Never accept public registry hashes that differ from the manifest used by prepublication native/provider proof; require a separately reviewed prerequisite update and fresh proof.
5. Never expose credentials or modify shared WIP, unowned scratch roots, or files outside the exact write allowlist.

## Done when

- [ ] AC-1: the actual active deployment allocates 100 percent to the accepted candidate version, and identity and failure handling are evidenced.
- [ ] AC-2: required public HTML, Pagefind resources, both 56-item registry trees, both indexes, and missing-path statuses are verified against accepted bytes.
- [ ] AC-3: the public branded 404 recovers through real search to Quickstart, and Pagefind loads on first search use.
- [ ] AC-4: fresh literal public CLI installs succeed for both engines, installed source matches the documented alias transform, and registry hashes match native/provider acceptance.
- [ ] Exact verification commands, typecheck, lint, independent review, and scope checks pass with captured seeded values.

## Acceptance criteria

### AC-1 — Accepted version promotion and ownership

GIVEN the accepted immutable candidate and recorded prior apex identity WHEN the owner rechecks identity and promotes the verified uploaded version THEN the apex assigns 100 percent to that version with unchanged ownership and attachment.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Cloudflare Workers API and Wrangler 4.81.0
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/completed-site.remote.spec.ts
TEST_FUNCTION: ORI-DEP-003-accepted-version
VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-accepted-version
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-DEP-003-1","use_case_ref":"UC-DELIV-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Cloudflare Workers API and Wrangler 4.81.0","negative_control":{"would_fail_if":["Promotion is a no-op and the prior version remains active.","The verifier is disconnected from Cloudflare and trusts a static success receipt."]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"accepted_candidate","action":{"actor":"cli_user","steps":["Recheck the accepted bytes and evidence, account, Worker, original attachment, candidate version, and active deployment through the real CLI/API.","After authorization, execute the exact candidate@100 promotion command once; query the active deployment again."]},"end_state":{"must_observe":["Active version equals the actual ORI-DEP-002 candidate version at 100 percent.","Account ID, Worker identity, and original attachment ID for `rnraielements.com` each equal their non-empty recorded before values: 3 identity comparisons and 0 mismatches; literal prior/current deployment and version IDs and numeric command exit codes are captured."],"must_not_observe":["The recorded prior version remains active instead of the candidate.","An empty identity record or a success receipt without a real deployment response."]}},{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Run the read-only identity verifier using the genuinely recorded prior version as the expected version against the now-active candidate.","Record rejection and re-read the active deployment; this negative case performs no deploy, rollback, or domain action."]},"end_state":{"must_observe":["The stale expected version produces `identity-mismatch` with 1 version-ID mismatch: expected ID equals the recorded prior version ID, observed ID equals the live candidate version ID, and both distinct IDs are captured.","The active version still equals the candidate at 100 percent; this check issues 0 mutation commands."],"must_not_observe":["A static pass for the stale version, an empty mismatch record, or 0 version-ID mismatches.","An automatic rollback or replacement of another operator's deployment."]}}]}
```

### AC-2 — Exact public responses

GIVEN the promoted candidate WHEN real HTTPS requests inspect its required assets and missing paths THEN accepted bytes match, both engine trees contain 56 items, and missing paths return 404.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Cloudflare apex HTTPS and public DNS
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/completed-site.remote.spec.ts
TEST_FUNCTION: ORI-DEP-003-public-bytes
VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-bytes
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-DEP-003-2","use_case_ref":"UC-DELIV-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Cloudflare apex HTTPS and public DNS","negative_control":{"would_fail_if":["The apex serves an empty or stale asset set.","A static fallback returns HTML or status 200 for every path."]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Run the exact completed-phase public-http command against https://rnraielements.com using ordinary DNS and trusted TLS.","Request required HTML routes, every accepted Pagefind resource, all manifest-enumerated registry items, and both registry indexes; compare response hashes with accepted bytes."]},"end_state":{"must_observe":["Required HTML and actual Pagefind resources return 200 and match the accepted manifest.","There are 56 nativewind and 56 uniwind item responses plus 2 registry indexes; registry GETs return direct 200 application/json with matching hashes."],"must_not_observe":["An empty registry tree, stale asset hash, or HTML substituted for registry JSON.","A redirect, preview origin, or disabled certificate verification satisfying an apex request."]}},{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Generate and request a fresh missing HTML path and a fresh missing JSON path under each engine tree; record their exact URLs and responses."]},"end_state":{"must_observe":["All 3 missing-path requests return HTTP 404.","The missing HTML response contains the accepted branded 404 content and search recovery surface."],"must_not_observe":["HTTP 200 for a missing path.","A blank fallback page or successful registry-item response for missing JSON."]}}]}
```

### AC-3 — Public search recovery

GIVEN a fresh browser at the public candidate WHEN a visitor opens search and recovers from a missing page THEN Pagefind loads on demand and selecting Quickstart opens the real tutorial.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Public Astro docs, Pagefind, and Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/completed-site.remote.spec.ts
TEST_FUNCTION: ORI-DEP-003-search-recovery
VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-search-recovery
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-DEP-003-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public Astro docs, Pagefind, and Chromium","negative_control":{"would_fail_if":["Search is a static dialog disconnected from Pagefind.","The branded 404 has an inert search control or navigation is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"user","steps":["Open /docs/introduction in a fresh browser context and observe network requests before search.","Open the real search control, enter Quickstart, and activate the result for /docs/quickstart."]},"end_state":{"must_observe":["There are 0 Pagefind search-resource requests before first open; first search use fetches real accepted Pagefind resources successfully.","At least 1 result links to `/docs/quickstart`; activation reaches `https://rnraielements.com/docs/quickstart` with HTTP 200, the heading text equals the accepted Quickstart heading, and the non-empty tutorial text has the same SHA-256 as the accepted tutorial text."],"must_not_observe":["An empty result list for Quickstart.","The browser remains on /docs/introduction after result activation."]}},{"start_ref":"published_candidate","action":{"actor":"user","steps":["Navigate in a fresh context to a run-unique missing HTML path and confirm the navigation response is 404.","Use its real search recovery control, search Quickstart, and activate the matching result."]},"end_state":{"must_observe":["The initial response is 404 with the accepted branded page.","Search recovery reaches https://rnraielements.com/docs/quickstart with HTTP 200 and the accepted tutorial heading."],"must_not_observe":["The branded 404 remains the final page, with 0 successful Quickstart navigations or empty tutorial content.","A static search result that does not navigate or a generic root-element visibility assertion standing in for tutorial content."]}}]}
```

### AC-4 — Fresh public registry installs

GIVEN matching public and prepublication registry manifests WHEN both engines execute fresh literal Quickstart CLI installs THEN installed files match the documented alias transform of accepted registry source.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Public apex registry, real RNR CLI, and Expo consumers
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/completed-site.remote.spec.ts
TEST_FUNCTION: ORI-DEP-003-public-install
VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-install
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-DEP-003-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public apex registry, real RNR CLI, and Expo consumers","negative_control":{"would_fail_if":["The installer is a no-op or the check reuses an already populated consumer.","Static success receipts hide different public registry source or an overbroad source normalization."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"cli_user","steps":["Create separate fresh nativewind and uniwind Expo consumers through real CLI entrypoints in owned OS-derived scratch roots.","Read and execute each engine's literal registry install sequence from the accepted public Quickstart against https://rnraielements.com; capture the resolved CLI version and real process exits.","Read the installed files and compare them with downloaded registry source using only the CLI's documented alias transform; compare all public registry hashes with the prepublication native/provider manifest."]},"end_state":{"must_observe":["Both nativewind and uniwind fresh install sequences exit 0 and create non-empty expected component files.","For both `nativewind` and `uniwind`, every installed component file's SHA-256 equals the SHA-256 of its documented alias-transformed registry source: 2 engines checked, at least 1 non-empty component file per engine, and 0 source-hash mismatches.","All 112 public registry item hashes and both index hashes equal the accepted prepublication manifest."],"must_not_observe":["An empty installed component set or a prior consumer receipt reused as fresh proof.","A different registry hash accepted without a separately reviewed prerequisite update and fresh native/provider proof."]}}]}
```

## Test criteria

- TC-1 → AC-1: The live candidate receives 100 percent, ownership and attachment match the before record, and a stale-version check fails without mutation. VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-accepted-version
- TC-2 → AC-2: Required public responses match accepted hashes, both 56-item trees and two indexes respond correctly, and all three missing paths return 404. VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-bytes
- TC-3 → AC-3: Real first-use Pagefind requests and navigation from Introduction and the branded 404 reach the accepted public Quickstart. VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-search-recovery
- TC-4 → AC-4: Both fresh public CLI installs produce the expected transformed source and every public registry hash equals the native/provider acceptance manifest. VERIFY: pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-install

## Shared fixtures

These describe required execution seeds, not observed current state. Populate identities and hashes from real prerequisite receipts and fresh CLI/API responses; never invent values.

```json
{"accepted_candidate":{"description":"Planned real seed: ORI-CI-004's accepted immutable source, assets, and evidence plus ORI-DEP-002's actually uploaded and verified version; the prior apex remains active.","seed_method":"recorded_external","records":["Actual accepted source SHA, lockfile hash, command and test/driver/policy hashes, artifact manifest, and hosted native/provider evidence identity.","Actual candidate version ID from ORI-DEP-002 and actual prior deployment/version IDs from a fresh Cloudflare query.","Actual owning account, Worker, original domain attachment, and accepted registry manifest containing 56 items per engine and both indexes."]},"published_candidate":{"description":"Planned real seed: the authorized owner has promoted the same accepted candidate through Wrangler and recorded the actual result.","seed_method":"cli","records":["https://rnraielements.com uses ordinary public DNS and trusted TLS; its active deployment assigns 100 percent to the recorded candidate version.","The immutable accepted manifest enumerates required HTML, actual Pagefind assets, 112 registry items, and 2 registry indexes.","The original before record, current release receipt, accepted public Quickstart commands, and prepublication native/provider registry manifest remain available without alteration."]}}
```

## Scope — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/completed-site.remote.spec.ts
- tests/sprint-05-orient-search/initial-deployment.md
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/before.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/build.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/asset-manifest.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/release.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/public-http.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/search-recovery.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-003/quickstart-public-install.json

writeProhibited:

- .spec/**
- apps/**
- packages/**
- public/**
- scripts/**
- .github/**
- package.json, pnpm-lock.yaml, pnpm-workspace.yaml
- Every other path not explicitly listed in writeAllowed, including shared public-http and Playwright configuration files.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations. Fresh consumer directories and runner temporaries belong only in owned OS-derived scratch roots; they do not extend repository write permissions.

## Boundary contracts

1. Consume ORI-CI-004's complete accepted source/asset/evidence identity and ORI-DEP-002's actual uploaded version ID. Do not regenerate, mutate or reupload the accepted dist.
2. Recheck the exact bytes, active apex version, owning account, Worker identity and original domain attachment immediately before promotion. Stop on source, artifact, evidence, version or ownership drift.
3. Promote the already verified candidate version at 100 percent with wrangler versions deploy. Apply no domain or trigger changes.
4. Run the real public HTTP and browser assertions against https://rnraielements.com. Verify required HTML routes, actual Pagefind resources, both 56-item engine trees plus their registry indexes, trusted TLS, direct registry JSON statuses and true 404 responses for unknown HTML and JSON paths.
5. Execute fresh literal public RNR CLI installs against final apex bytes and compare the installed source using the CLI's documented alias transform. Public registry hashes must equal the prepublication native/provider proof's registry manifest; a mismatch prevents completion and requires a separately reviewed prerequisite update plus fresh proof.
6. Record prior/current deployment and version IDs and exact command outcomes. On a post-promotion failure, leave publication incomplete; only the Cloudflare owner may restore the recorded prior version after proving this run still owns the active deployment. Do not overwrite another operator's update or claim a generalized DNS rollback.

## Boundaries — Always / Ask first

Always:

- Consume the exact accepted identity and existing evidence before any promotion; missing or unverifiable prerequisites block execution.
- Recheck live ownership immediately before mutation and before any owner-directed restoration.
- Drive real HTTP, browser, filesystem, and CLI paths; record URLs, values, hashes, exits, timestamps, and run identity.
- Keep secrets out of install processes, browsers, command arguments, and evidence; use normal credential access without reading or copying cached tokens.
- Preserve earlier evidence when updating the allowlisted records and stop only owned processes or scratch resources.

Ask first:

- Obtain subsequent implementation and external-action authorization through the orchestrator; this planning response provides neither.
- Route artifact or registry-manifest drift to a separately reviewed prerequisite update and fresh acceptance.
- Escalate account/Worker/domain ownership changes or unavailable credentials to the owner; do not select another target.
- Leave a failed publication incomplete and request owner-directed restoration only after proving the run still owns the active deployment.
- Request explicit scope expansion before changing shared tests, configuration, dependencies, source, or deployment topology.

## Deliverables and evidence contracts

- completed-site.remote.spec.ts: four named real-service checks corresponding to AC-1 through AC-4. Verification reruns are read-only against Cloudflare; only the explicit authorized release operation promotes a version.
- initial-deployment.md: append the completed release sequence, actual command outcomes, prior/current identities, public verification results, and any incomplete-publication or owner-restoration outcome. Preserve prior deployment history.
- before.json: timestamped account, Worker, attachment, deployment/version identities and pre-promotion drift comparison.
- build.json: provenance of the consumed ORI-CI-004 artifact, accepted source and lockfile, command/test/driver/policy hashes, and accepted hosted evidence identity. This file records consumption, not a new build.
- asset-manifest.json: the consumed accepted asset paths and hashes, including actual Pagefind resources and both complete registry trees and indexes; record provenance without rebuilding assets.
- release.json: actual uploaded candidate ID, prior/current deployment/version IDs, promotion allocation and exits, ownership checks, release status, and any failure or owner-directed restoration. Never mark complete before public checks pass.
- public-http.json: actual request URLs, statuses, content types, redirects, TLS outcomes, and expected/observed hashes, including fresh missing HTML and JSON requests.
- search-recovery.json: actual browser project/run identity, starting and final URLs/statuses, observed branded-page/tutorial targets, search result hrefs, and first-use Pagefind requests. Keep assertions tied to specific product content; generic document roots are not success targets.
- quickstart-public-install.json: fresh consumer identities, both engines' exact public commands, resolved CLI version, exits, expected/installed file hashes, documented alias-transform basis, and comparison with the native/provider manifest.

All seven evidence files are planned outputs. Record actual values during execution; absent evidence is a blocker, never a static success.

## Agent instructions

This is an INFRA publication task. TDD_MODE is skipped because it promotes an already accepted artifact and consumes existing native/provider and feature RED evidence. It still requires real integration/e2e tests and seeded evidence. Do not create a failing public deployment to manufacture RED. Preserve all inherited canonical proof.red paths without renaming them.

1. Read the prerequisite contracts and complete accepted evidence. Verify that ORI-DEP-001 established the authorized apex, ORI-CI-004 accepted the exact source/artifact/evidence identity, and ORI-DEP-002 uploaded and verified that artifact once. Confirm Wrangler 4.81.0. Missing prerequisites stop the task.
2. Prepare the four named checks in the allowlisted remote test file. Reuse prerequisite HTTP/configuration contracts read-only. Source expected routes, Pagefind paths, registry indexes, command bytes, and headings from accepted artifacts. Do not invent missing assets or weaken assertions.
3. Populate before/build/manifest provenance using real observations. Immediately before promotion compare accepted bytes and evidence, active deployment, candidate version, account, Worker, and attachment. A mismatch stops the release.
4. Execute the authorized promotion once using the exact commands below. Run the completed public verification commands and four focused checks. Ordinary reruns must not deploy or roll back. The stale-version negative case uses a genuinely recorded prior identity and real API responses without changing remote state.
5. Record success only after all assertions and evidence checks pass. On any post-promotion failure, retain an incomplete release and actual active identity. Only the Cloudflare owner can authorize restoring the recorded prior version, after a fresh check proves this run still owns the active deployment. A concurrent update stops restoration.

### Exact Cloudflare commands

Execute in this order. CANDIDATE_VERSION_ID comes from ORI-DEP-002; RELEASE_SHA comes from the accepted release identity. Neither is a guessed value.

```sh
pnpm --dir apps/docs exec wrangler whoami
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
pnpm --dir apps/docs exec wrangler versions view "$CANDIDATE_VERSION_ID" --config wrangler.jsonc
pnpm --dir apps/docs exec wrangler versions deploy "$CANDIDATE_VERSION_ID@100" --config wrangler.jsonc --message "$RELEASE_SHA"
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
```

No command in this task attaches domains, changes triggers, uploads versions, or rebuilds dist. A missing shared verifier or required attachment-inspection capability blocks the prerequisite contract; it does not authorize a new implementation surface here.

### Runtime commands and exact verification gates

```sh
pnpm typecheck
pnpm lint
pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase completed --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-003/release.json
pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts
```

Run focused AC commands for diagnosis, then both exact complete verification commands for acceptance. Do not invoke a build-producing convenience command against the accepted artifact. Full hosted native/provider acceptance remains ORI-CI-004's prerequisite; these public checks do not replace it.

## Reading list

1. [PRIMARY PATTERN] .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-DEP-003.json — lines 1–60 and the complete task, boundary, verification, and publication-precondition sections; exact immutable release sequence and write ownership.
2. tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts — complete file; real Playwright observations, literal public registry origin, and evidence tied to observed values. Reuse the observation discipline, not its local-preview origin or unrelated flow preamble.
3. .spec/e2e-policy/surface.json — complete file; governed driver and product-target requirements, supplemented by the concrete per-AC oracles here.
4. .spec/prds/docs-site/11-technical-requirements/04-api-design.md — URL-contract table; public registry response semantics. This task verifies the accepted artifact without expanding into unrelated routes or services.
5. .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md — CAP-DOCS-01 and supporting publication/install context. The compact task's exact version-promotion and owner-restoration contract takes precedence over older generic deployment examples.

## Design and reference guidance

Consume the accepted site's branded 404, Introduction, Quickstart, and search controls. Do not redesign them. Derive exact product-owned observation targets from the accepted pages and assert the final Quickstart URL and heading in executable code. Use .spec/prds/docs-site/11-technical-requirements/10-routing.md for route terminology, while the accepted candidate defines this task's required route set.

## Coding standards

Use the existing TypeScript, pnpm, Biome, Playwright, and real Node filesystem/process conventions. Validate consumed receipt shapes and fail closed on missing identities or hashes. Never mock fetch, Cloudflare, Pagefind, the CLI, or consumer files. Do not add test-only product seams, skips, catch-and-pass paths, or permissive source normalization. Preserve exact public command bytes and record the actual CLI version. Apply [Google technical writing guidance](https://developers.google.com/tech-writing) to the deployment record: active voice, short sentences, and concrete outcomes.

## Evidence gates

1. Before mutation: prerequisite review and hosted acceptance identities resolve; accepted bytes, registry/native-provider manifest, actual candidate version, account, Worker, original attachment, and current apex identity all match. No planned receipt counts as observed evidence.
2. Static checks: typecheck and lint pass for the implementation candidate; scope review confirms only allowlisted repository files changed. Do not rebuild accepted release assets to satisfy a check.
3. Real proof: both exact verification commands and all four named checks pass against the public apex; stale-identity verification rejects without mutation. Capture seeded identities, counts, hashes, content, and installed files rather than exit codes alone.
4. Contract checks: the orchestrator validates the matching human and machine requirements, complete scenarios, and non-primary task-owned bindings. No locked task-flow or journey ownership is claimed here.
5. Independent review: cloudflare-workers-reviewer verifies current public behavior, immutable source/artifact/evidence linkage, failure handling, scope, and absence of stubs or skips before reporting publication complete.

## Out of scope

- Rebuilding, modifying, or reuploading the accepted candidate; registry or docs source fixes; new dependencies; CI/workflow changes.
- Initial DNS/custom-domain attachment or trigger changes, generalized DNS rollback, account migration, and overwriting concurrent operator updates.
- Replacing the accepted native/provider matrices with web proof, or extending their implementation; ORI-CI-004 owns complete hosted acceptance.
- Owning or redefining any locked task flow or the four journeys assigned to ORI-AST-010; changing the local-preview sprint gate; later-sprint closure.

## Context and flow support

Current gap: this planning input supplies a required release sequence, not evidence that the completed candidate is active or that final public installs work. External authority, DNS/TLS, prerequisite acceptance, and uploaded version identity require execution-time proof.

Completion contract: The completed Sprint 05 build is active on the verified apex, its required public routes and registry responses match that build, and unknown paths return the branded 404 with working search recovery.

Supports existing flows: FLOW-DOCS-01-getting-started-engine-decision, FLOW-DOCS-02-quickstart-chat-screen, FLOW-SHELL-07-cmdk-open-search-navigate, FLOW-SHELL-08-pagefind-lazy-load-on-first-open. ORI-PUBLIC-RECOVERY is a supporting public human check shared with ORI-DEP-002. It explicitly references the first three flows. The compact context assigns this task no locked primary flow; all ACs therefore use primary:false and flow_ref:null with real task-owned integration/e2e proof.

Human test hook: Open the real public site and exercise FLOW-DOCS-01-getting-started-engine-decision, FLOW-DOCS-02-quickstart-chat-screen, FLOW-SHELL-07-cmdk-open-search-navigate, FLOW-SHELL-08-pagefind-lazy-load-on-first-open.

The sprint gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint remains: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The sprint retains 13 flows: 9 task flows and 4 journeys, across 36 tasks and 131 points. Public publication proof supplements that gate.

## Review

Must pass:

- Exact accepted source, artifact, evidence, uploaded version, and live apex identities remain linked; no rebuild, reupload, or attachment change occurred.
- Real public observations prove both complete engine trees, indexes, accepted Pagefind resources, required HTML, trusted TLS, and genuine missing-path statuses.
- Real browser actions prove on-demand Pagefind and 404-to-Quickstart recovery using product-owned targets.
- Fresh CLI-installed source and public registry hashes match the accepted native/provider manifest, with only the documented alias transform.
- Failures remain incomplete, concurrent ownership changes stop mutation/restoration, secrets remain absent, and every repository write is allowlisted.

Should verify:

- Evidence preserves prior run identities and exact observed values rather than summary-only success claims.
- Test reruns cannot repeat promotion or perform rollback.
- No mock, skip, static success, TODO deferral, or test-only product seam remains in the touched files.

Verdict: APPROVED or NEEDS_FIXES, with concrete evidence and file/line references for findings. This charter contains no review verdict.

## Dependencies and capability contracts

Depends on:

- ORI-DEP-001: authorized owning account, Worker and original apex attachment, ordinary public DNS/TLS, and initial corrected registry publication.
- ORI-DEP-002: the actual uploaded version ID and real verification of the immutable completed candidate before apex promotion.
- ORI-CI-004: complete accepted source/asset/evidence identity, hosted acceptance, and the registry manifest consumed by native/provider proof.

Blocks: no downstream task IDs are assigned in the compact context; incomplete evidence prevents this publication task's completion.

Provides: a recorded controlled apex promotion and current public HTTP, browser, and fresh-install proof linked to the accepted artifact.

Consumes: prerequisite ownership/attachment records, accepted source and lockfile identity, command/test/driver/policy hashes, exact artifact manifest, uploaded candidate version, native/provider evidence, and literal accepted Quickstart commands.

Touches capability: CAP-DOCS-01. PRD references: .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md, .spec/prds/docs-site/11-technical-requirements/04-api-design.md, .spec/prds/docs-site/11-technical-requirements/10-routing.md; UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-DELIV-02, UC-DELIV-03, UC-DELIV-04 provide context without serving as flow aliases.

Agent rationale: cloudflare-workers-planner owns the release boundary; cloudflare-workers-implementer executes the controlled version promotion and public checks; cloudflare-workers-reviewer independently checks authority, immutable bytes, failure handling, and live outcomes. Co-authors retain CI evidence, registry installation, provider-proof, and Astro asset expertise.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "ORI-DEP-003",
  "tdd_mode": "skipped",
  "verification_policy": {"requires_tests": true, "requires_red_evidence": false, "requires_seeded_evidence": true},
  "fixtures": {
    "accepted_candidate": {"description": "Planned real seed: ORI-CI-004's accepted immutable source, assets, and evidence plus ORI-DEP-002's actually uploaded and verified version; the prior apex remains active.", "seed_method": "recorded_external", "records": ["Actual accepted source SHA, lockfile hash, command and test/driver/policy hashes, artifact manifest, and hosted native/provider evidence identity.", "Actual candidate version ID from ORI-DEP-002 and actual prior deployment/version IDs from a fresh Cloudflare query.", "Actual owning account, Worker, original domain attachment, and accepted registry manifest containing 56 items per engine and both indexes."]},
    "published_candidate": {"description": "Planned real seed: the authorized owner has promoted the same accepted candidate through Wrangler and recorded the actual result.", "seed_method": "cli", "records": ["https://rnraielements.com uses ordinary public DNS and trusted TLS; its active deployment assigns 100 percent to the recorded candidate version.", "The immutable accepted manifest enumerates required HTML, actual Pagefind assets, 112 registry items, and 2 registry indexes.", "The original before record, current release receipt, accepted public Quickstart commands, and prepublication native/provider registry manifest remain available without alteration."]}
  },
  "requirements": [
    {"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the accepted immutable candidate and recorded prior apex identity WHEN the owner rechecks identity and promotes the verified uploaded version THEN the apex assigns 100 percent to that version with unchanged ownership and attachment.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/completed-site.remote.spec.ts","test_function":"ORI-DEP-003-accepted-version","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-accepted-version","test_tier":"integration","verification_service":"Cloudflare Workers API and Wrangler 4.81.0","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-DEP-003-1","use_case_ref":"UC-DELIV-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Cloudflare Workers API and Wrangler 4.81.0","negative_control":{"would_fail_if":["Promotion is a no-op and the prior version remains active.","The verifier is disconnected from Cloudflare and trusts a static success receipt."]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"accepted_candidate","action":{"actor":"cli_user","steps":["Recheck the accepted bytes and evidence, account, Worker, original attachment, candidate version, and active deployment through the real CLI/API.","After authorization, execute the exact candidate@100 promotion command once; query the active deployment again."]},"end_state":{"must_observe":["Active version equals the actual ORI-DEP-002 candidate version at 100 percent.","Account ID, Worker identity, and original attachment ID for `rnraielements.com` each equal their non-empty recorded before values: 3 identity comparisons and 0 mismatches; literal prior/current deployment and version IDs and numeric command exit codes are captured."],"must_not_observe":["The recorded prior version remains active instead of the candidate.","An empty identity record or a success receipt without a real deployment response."]}},{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Run the read-only identity verifier using the genuinely recorded prior version as the expected version against the now-active candidate.","Record rejection and re-read the active deployment; this negative case performs no deploy, rollback, or domain action."]},"end_state":{"must_observe":["The stale expected version produces `identity-mismatch` with 1 version-ID mismatch: expected ID equals the recorded prior version ID, observed ID equals the live candidate version ID, and both distinct IDs are captured.","The active version still equals the candidate at 100 percent; this check issues 0 mutation commands."],"must_not_observe":["A static pass for the stale version, an empty mismatch record, or 0 version-ID mismatches.","An automatic rollback or replacement of another operator's deployment."]}}]}},
    {"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the promoted candidate WHEN real HTTPS requests inspect its required assets and missing paths THEN accepted bytes match, both engine trees contain 56 items, and missing paths return 404.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/completed-site.remote.spec.ts","test_function":"ORI-DEP-003-public-bytes","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-bytes","test_tier":"integration","verification_service":"Cloudflare apex HTTPS and public DNS","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-DEP-003-2","use_case_ref":"UC-DELIV-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Cloudflare apex HTTPS and public DNS","negative_control":{"would_fail_if":["The apex serves an empty or stale asset set.","A static fallback returns HTML or status 200 for every path."]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Run the exact completed-phase public-http command against https://rnraielements.com using ordinary DNS and trusted TLS.","Request required HTML routes, every accepted Pagefind resource, all manifest-enumerated registry items, and both registry indexes; compare response hashes with accepted bytes."]},"end_state":{"must_observe":["Required HTML and actual Pagefind resources return 200 and match the accepted manifest.","There are 56 nativewind and 56 uniwind item responses plus 2 registry indexes; registry GETs return direct 200 application/json with matching hashes."],"must_not_observe":["An empty registry tree, stale asset hash, or HTML substituted for registry JSON.","A redirect, preview origin, or disabled certificate verification satisfying an apex request."]}},{"start_ref":"published_candidate","action":{"actor":"api_client","steps":["Generate and request a fresh missing HTML path and a fresh missing JSON path under each engine tree; record their exact URLs and responses."]},"end_state":{"must_observe":["All 3 missing-path requests return HTTP 404.","The missing HTML response contains the accepted branded 404 content and search recovery surface."],"must_not_observe":["HTTP 200 for a missing path.","A blank fallback page or successful registry-item response for missing JSON."]}}]}},
    {"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN a fresh browser at the public candidate WHEN a visitor opens search and recovers from a missing page THEN Pagefind loads on demand and selecting Quickstart opens the real tutorial.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/completed-site.remote.spec.ts","test_function":"ORI-DEP-003-search-recovery","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-search-recovery","test_tier":"e2e","verification_service":"Public Astro docs, Pagefind, and Chromium","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-DEP-003-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public Astro docs, Pagefind, and Chromium","negative_control":{"would_fail_if":["Search is a static dialog disconnected from Pagefind.","The branded 404 has an inert search control or navigation is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"user","steps":["Open /docs/introduction in a fresh browser context and observe network requests before search.","Open the real search control, enter Quickstart, and activate the result for /docs/quickstart."]},"end_state":{"must_observe":["There are 0 Pagefind search-resource requests before first open; first search use fetches real accepted Pagefind resources successfully.","At least 1 result links to `/docs/quickstart`; activation reaches `https://rnraielements.com/docs/quickstart` with HTTP 200, the heading text equals the accepted Quickstart heading, and the non-empty tutorial text has the same SHA-256 as the accepted tutorial text."],"must_not_observe":["An empty result list for Quickstart.","The browser remains on /docs/introduction after result activation."]}},{"start_ref":"published_candidate","action":{"actor":"user","steps":["Navigate in a fresh context to a run-unique missing HTML path and confirm the navigation response is 404.","Use its real search recovery control, search Quickstart, and activate the matching result."]},"end_state":{"must_observe":["The initial response is 404 with the accepted branded page.","Search recovery reaches https://rnraielements.com/docs/quickstart with HTTP 200 and the accepted tutorial heading."],"must_not_observe":["The branded 404 remains the final page, with 0 successful Quickstart navigations or empty tutorial content.","A static search result that does not navigate or a generic root-element visibility assertion standing in for tutorial content."]}}]}},
    {"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN matching public and prepublication registry manifests WHEN both engines execute fresh literal Quickstart CLI installs THEN installed files match the documented alias transform of accepted registry source.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/completed-site.remote.spec.ts","test_function":"ORI-DEP-003-public-install","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-install","test_tier":"e2e","verification_service":"Public apex registry, real RNR CLI, and Expo consumers","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-DEP-003-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public apex registry, real RNR CLI, and Expo consumers","negative_control":{"would_fail_if":["The installer is a no-op or the check reuses an already populated consumer.","Static success receipts hide different public registry source or an overbroad source normalization."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_candidate","action":{"actor":"cli_user","steps":["Create separate fresh nativewind and uniwind Expo consumers through real CLI entrypoints in owned OS-derived scratch roots.","Read and execute each engine's literal registry install sequence from the accepted public Quickstart against https://rnraielements.com; capture the resolved CLI version and real process exits.","Read the installed files and compare them with downloaded registry source using only the CLI's documented alias transform; compare all public registry hashes with the prepublication native/provider manifest."]},"end_state":{"must_observe":["Both nativewind and uniwind fresh install sequences exit 0 and create non-empty expected component files.","For both `nativewind` and `uniwind`, every installed component file's SHA-256 equals the SHA-256 of its documented alias-transformed registry source: 2 engines checked, at least 1 non-empty component file per engine, and 0 source-hash mismatches.","All 112 public registry item hashes and both index hashes equal the accepted prepublication manifest."],"must_not_observe":["An empty installed component set or a prior consumer receipt reused as fresh proof.","A different registry hash accepted without a separately reviewed prerequisite update and fresh native/provider proof."]}}]}},
    {"id":"TC-1","type":"test_criterion","description":"The live candidate receives 100 percent, ownership and attachment match the before record, and a stale-version check fails without mutation.","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-accepted-version","maps_to_ac":"AC-1"},
    {"id":"TC-2","type":"test_criterion","description":"Required public responses match accepted hashes, both 56-item trees and two indexes respond correctly, and all three missing paths return 404.","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-bytes","maps_to_ac":"AC-2"},
    {"id":"TC-3","type":"test_criterion","description":"Real first-use Pagefind requests and navigation from Introduction and the branded 404 reach the accepted public Quickstart.","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-search-recovery","maps_to_ac":"AC-3"},
    {"id":"TC-4","type":"test_criterion","description":"Both fresh public CLI installs produce the expected transformed source and every public registry hash equals the native/provider acceptance manifest.","verify":"pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/completed-site.remote.spec.ts --grep ORI-DEP-003-public-install","maps_to_ac":"AC-4"}
  ]
}
-->
</details>
