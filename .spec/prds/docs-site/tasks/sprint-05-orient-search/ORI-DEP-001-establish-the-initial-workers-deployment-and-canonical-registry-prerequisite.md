## What this does

Publish the reviewed prerequisite candidate as Workers static assets at rnraielements.com, with both engine registries served from the same immutable build as the existing docs.

## Why

Quickstart installation proofs need the literal public registry URLs to resolve first. The compact context records an unresolved domain and unverified deployment authority; neither registration nor cached OAuth establishes a working public registry.

## How to verify

Run the bootstrap preparation command, perform the authorized first deployment in an attended terminal, and run the bootstrap HTTP assertions. Compare actual public response bytes with the frozen build and actual Cloudflare version/deployment observations. All commands and evidence below are planned, not observed.

## Scope

Initial deployment configuration, build preparation, public HTTP assertions, the deployment runbook, and six evidence records. Depends on reviewed ORI-RN-000. Establishes the installation prerequisite only.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-DEP-001: Establish the initial Workers deployment and canonical registry prerequisite

> Status: ✅ Completed

Commit: 2eb5c039495aa1425a6b5f12eb921f1023c47412
> Assignee: cloudflare-workers-implementer
> Priority: P1 · Points: 5 · Type: INFRA
> Dependency phase: After ORI-RN-000; before canonical public-install proofs
> Proposed By: cloudflare-workers-planner
> Co-authored By: react-native-reusables-planner, ghactions-planner
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no
> Verification policy: requires_tests=true; requires_red_evidence=false; requires_seeded_evidence=true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer
> PROGRESS: 0/4 acceptance criteria verified; all TDD_STATE values are none.

## OUTCOME

Both public conversation URLs serve schema-valid, engine-correct JSON matching the accepted build, with verified Cloudflare ownership, deployment identity, public DNS, and trusted HTTPS.

## 🚫 CRITICAL CONSTRAINTS

- Never attach the domain without verified account, active zone, effective permissions, and uncontested DNS/Worker/custom-domain ownership. First deploy requires attended terminal stdout; refuse replacement prompts, captured stdout, tee, and auto-confirmation.
- Never inspect, print, export, or copy cached OAuth tokens. Authentication, authorization, network, DNS, or TLS failures block execution; registration and cached credentials are not authority proof.
- Never publish shared-checkout WIP, unfinished Sprint 05 content, or changed/stale artifacts. Use the isolated reviewed prerequisite candidate and recheck frozen bytes before upload.
- Never add a Worker runtime, Astro server adapter, bindings, Pages configuration, wildcard routes, custom headers, or cache policies. Pin Wrangler exactly to 4.81.0.
- Never claim Quickstart, orientation, search, custom 404, native, provider, hosted acceptance, or final publication completion from this bootstrap. No mocks, canned responses, fake success, skipped behavioral proof, or hostname/TLS bypasses.

## DONE WHEN

- [ ] AC-1: Both literal conversation URLs return real, schema-valid, engine-correct JSON matching the accepted build.
- [ ] AC-2: Preparation proves clean source identity and records actual quality checks plus the explicit ordered build.
- [ ] AC-3: Every asset, lockfile, and configuration digest is bound to the release; changed, missing, or stale input is refused.
- [ ] AC-4: Account, zone, Worker, domain, version, deployment, and attended first attachment agree with actual observations.
- [ ] Required commands pass on the selected candidate, seeded evidence is retained, and authored changes stay within writeAllowed.

## RUNTIME_COMMANDS

- Preparation: `pnpm exec tsx scripts/docs-deploy/prepare.ts --phase bootstrap --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
- Preparation proof: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
- Public verification: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Current-candidate tests: `pnpm test`

RELEASE_SHA must name the actual isolated prerequisite candidate based on the source SHA plus reviewed ORI-RN-000 and this task. It is not an invented SHA or an alias for an unrelated current checkout. The preparation script records each command, working directory, tool version, and exit code. No command in this charter has been executed as part of rendering.

## ACCEPTANCE CRITERIA

### AC-1: Canonical public registry prerequisite

GIVEN the accepted bootstrap release is deployed WHEN the bootstrap HTTP assertions fetch both literal conversation URLs through public DNS THEN both return schema-valid, engine-correct JSON whose SHA-256 values match the accepted build.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: real Cloudflare Workers static assets, public DNS, and trusted HTTPS
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/public-http.test.ts
TEST_FUNCTION: bootstrap
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Cloudflare Workers static assets, public DNS, and trusted HTTPS","negative_control":{"would_fail_if":["HTTP assertions accept a static HTML shell, empty registry, mocked response, wrong engine, or disconnected public hostname"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"published_bootstrap","action":{"actor":"api_client","steps":["Run the bootstrap public-http command against https://rnraielements.com using the actual release receipt.","Fetch /r/nativewind/conversation.json and /r/uniwind/conversation.json without hostname rewriting or disabled certificate validation; compare response bytes with the frozen assets."]},"end_state":{"must_observe":["2 literal conversation endpoints return HTTP 200 with JSON content and name 'conversation'.","Both responses contain non-empty real component files, engine-correct imports and absolute HTTPS registry dependencies, and SHA-256 values equal to their accepted asset-manifest entries.","Existing built pages, including '/components', return the bootstrap expectations derived from the accepted dist."],"must_not_observe":["Empty files arrays, HTML fallback bodies, unresolved DNS, untrusted TLS, cross-engine imports, or mismatched response hashes.","A bootstrap receipt claiming completed orientation, search, custom 404, Quickstart, or native/provider acceptance."]}}]}
```

### AC-2: Clean candidate and explicit ordered build

GIVEN the isolated reviewed prerequisite candidate WHEN bootstrap preparation checks identity and runs the actual quality and build commands THEN build.json records the selected source and successful checks, with registry, gallery, docs-data, and Astro generation explicitly ordered.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: real pnpm workspace commands, registry generator, docs-data pipeline, Astro compiler, and filesystem
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/public-http.test.ts
TEST_FUNCTION: bootstrap-preparation
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm workspace commands, registry generator, docs-data pipeline, Astro compiler, and filesystem","negative_control":{"would_fail_if":["Preparation is a no-op or writes canned success without executing the real commands, or consumes stale generated registry data"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"corrected_candidate","action":{"actor":"cli_user","steps":["Run the exact bootstrap preparation command with RELEASE_SHA bound to the reviewed isolated candidate.","Execute actual root typecheck, lint, token, contract, registry, and applicable current tests; explicitly execute registry generation, gallery generation, docs-data prebuild, and Astro build in that order."]},"end_state":{"must_observe":["'build.json' binds the actual RELEASE_SHA to base '38034e972490945b684f5bd5a706bca0479dc659' and the reviewed ORI-RN-000 correction.","Each required command has its actual command text and exit code 0; the accepted build records 'registry:build', 'gallery:manifest', 'prebuild', and 'astro build' in order.","The generated dist contains both 'r/nativewind/conversation.json' and 'r/uniwind/conversation.json'."],"must_not_observe":["Empty command evidence, an inferred prebuild lifecycle, a stale registry copy, or unreviewed/shared-checkout source.","A fabricated apps/example typecheck script or a claim that root typecheck proves the whole example app."]}},{"start_ref":"corrected_candidate","action":{"actor":"cli_user","steps":["In an owned disposable candidate copy, invoke the same preparation entrypoint with RELEASE_SHA deliberately set to the base SHA while the actual candidate includes reviewed changes."]},"end_state":{"must_observe":["Preparation exits nonzero and reports 'source mismatch' before accepting a build or uploading assets."],"must_not_observe":["Exit 0, a successful build receipt for the mismatched source, or any Cloudflare mutation."]}}]}
```

### AC-3: Immutable artifact identity and refusal

GIVEN a frozen accepted dist and its source-bound manifest WHEN preparation rechecks the release before upload THEN every asset, lockfile, and configuration digest matches, and changed, missing, or stale artifacts are rejected.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: real prepared dist, SHA-256 hashing, release preparation CLI, and filesystem
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/public-http.test.ts
TEST_FUNCTION: bootstrap-preparation
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real prepared dist, SHA-256 hashing, release preparation CLI, and filesystem","negative_control":{"would_fail_if":["Manifest verification is a static success flag, ignores a changed asset, accepts an empty dist, or silently re-baselines stale release evidence"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"frozen_build","action":{"actor":"cli_user","steps":["Run the bootstrap preparation entrypoint against the existing frozen release evidence; rehash the complete dist, pnpm-lock.yaml, and apps/docs/wrangler.jsonc before any upload."]},"end_state":{"must_observe":["'asset-manifest.json' covers every actual dist asset with SHA-256 and includes both conversation files.","The current lockfile and configuration digests equal the frozen digests; 'build.json' and the manifest identify the same RELEASE_SHA and tool versions."],"must_not_observe":["An empty asset inventory, unmatched source identity, unrecorded asset, or silently replaced frozen manifest."]}},{"start_ref":"frozen_build","action":{"actor":"cli_user","steps":["Use an owned disposable copy of the actual frozen build and evidence; change one byte of r/nativewind/conversation.json on the real filesystem and rerun the same preparation entrypoint.","Restore the original bytes, verify their digest, then remove that asset from the disposable copy and repeat; preserve the original accepted build untouched."]},"end_state":{"must_observe":["The changed-byte run exits nonzero with 'asset hash mismatch' naming 'r/nativewind/conversation.json'.","The missing-file run exits nonzero naming 'r/nativewind/conversation.json'; neither run uploads or creates a success receipt."],"must_not_observe":["Exit 0 for changed or missing assets, automatic re-baselining, a Cloudflare mutation, or changes to the original frozen build."]}}]}
```

### AC-4: Verified authority and attended initial attachment

GIVEN verified Cloudflare authority, uncontested ownership, and frozen bootstrap assets WHEN the attended first deploy runs and live control-plane observations are reconciled THEN the configured account, zone, Worker, apex domain, version, and deployment agree with the release receipt.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: real Wrangler 4.81.0, Cloudflare account and deployment APIs, attended terminal, public DNS, and trusted HTTPS
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/public-http.test.ts
TEST_FUNCTION: bootstrap
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json`
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Wrangler 4.81.0, Cloudflare account and deployment APIs, attended terminal, public DNS, and trusted HTTPS","negative_control":{"would_fail_if":["Authority is inferred from a cached login, deployment success is a canned receipt, or public verification is disconnected from the actual Worker version"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"verified_authority","action":{"actor":"cli_user","steps":["Inspect actual account, active zone, effective permissions, DNS, custom domain, routes, and deployment ownership using authenticated read-only observations; reconcile the exact assets-only configuration.","After authorization and frozen-byte checks, run the exact initial wrangler deploy command in a human-attended terminal with inherited terminal stdout; refuse conflicts or replacement prompts.","Bind INITIAL_VERSION_ID to actual output, inspect deployments and that version, and run bootstrap public verification with fresh read-only control-plane comparisons."]},"end_state":{"must_observe":["'authority.json' and 'before.json' identify the actual owning account, active zone, 'rnr-ai-elements-docs', and 'rnraielements.com'; a confirmed absent Worker is distinguished from an API failure.","Wrangler reports version '4.81.0'; the configuration has compatibility_date '2026-09-13', workers_dev false, preview_urls true, and assets.directory './dist'.","'release.json' records non-empty actual version and deployment IDs that agree with subsequent live queries, the accepted asset manifest, and trusted public HTTPS observations."],"must_not_observe":["Unverified or conflicting ownership, accepted replacement prompts, captured deploy stdout, exposed OAuth tokens, inferred deployment IDs, or a success receipt based only on exit 0."]}}]}
```

## TEST CRITERIA

- TC-1 → AC-1: Both public conversation responses satisfy the real schema, engine, non-empty-source, trusted-HTTPS, and accepted-byte assertions. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json`
- TC-2 → AC-2: Preparation records actual successful quality/build commands in order and refuses a source mismatch before acceptance. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
- TC-3 → AC-3: Complete frozen hashes match the accepted candidate, while real changed-byte and missing-file probes fail without upload or re-baselining. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source "$RELEASE_SHA" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001`
- TC-4 → AC-4: Actual account, zone, Worker, domain, version, and deployment observations agree with the attended bootstrap release and contain no credentials. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json`

## FIXTURES

- corrected_candidate: seed_method=cli. Create the assigned isolated candidate through the normal source-control entrypoint, based on 38034e972490945b684f5bd5a706bca0479dc659 with reviewed ORI-RN-000 and this task. Record the actual RELEASE_SHA, clean source state, lockfile, and real registry inputs. No shared WIP or unfinished Sprint 05 content.
- frozen_build: seed_method=cli. Run the real bootstrap preparation entrypoint over corrected_candidate. Retain actual dist bytes, source-bound build.json and asset-manifest.json, both generated conversation files, configuration and lockfile digests, and actual tool versions. Negative probes use owned disposable copies of these real outputs.
- verified_authority: seed_method=recorded_external. Obtain fresh authenticated read-only Cloudflare observations using cached OAuth without reading its token. Records identify the owning account, active zone, effective permissions, rnr-ai-elements-docs, rnraielements.com, routes, DNS/custom-domain ownership, and actual pre-deploy state.
- published_bootstrap: seed_method=cli. Publish frozen_build through the authorized attended Wrangler command after verified_authority passes. Retain actual version/deployment IDs and the frozen manifest; public endpoints remain ordinary HTTPS URLs without overrides.

## SCOPE

writeAllowed:
- apps/docs/wrangler.jsonc
- apps/docs/package.json
- pnpm-lock.yaml
- scripts/docs-deploy/prepare.ts
- tests/sprint-05-orient-search/public-http.test.ts
- tests/sprint-05-orient-search/initial-deployment.md
- .gitignore
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/authority.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/before.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/build.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/asset-manifest.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-001/public-http.json

writeProhibited:
- .spec/**
- .github/**
- packages/registry/**
- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/src/**
- apps/docs/astro.config.mjs
- scripts/docs-data/**
- package.json
- Any authored file not explicitly listed in writeAllowed.

Normal generated build outputs and owned disposable scratch copies are runtime artifacts, not permission to hand-edit or commit additional product files. Follow the scratch-artifact standard; never hardcode /tmp.

## BOUNDARIES

Always:
- Use the assigned isolated candidate; preserve shared WIP and record source, command, artifact, and run identities.
- Run real quality checks and explicit generation; preserve failure details and stop acceptance on required failures.
- Reconcile live deployment observations and public bytes with the frozen release before handing off.
- Keep bootstrap and completed-site HTTP assertion sets explicit; the bootstrap set cannot certify unfinished work.
- Retain bounded, sanitized evidence and stop only processes owned by the current run.

Ask first:
- Obtain implementation/external-action authorization if it has not already been supplied; this charter is planning only.
- Escalate conflicting ownership, unavailable authority, an unavailable pinned dependency, or concurrent deployment changes without replacing resources or silently changing the contract.
- Obtain explicit scope for unrelated example/gallery repairs, additional dependencies, or writes beyond the allowlist.

## CONFIGURATION CONTRACT

```json
{"name":"rnr-ai-elements-docs","account_id":"Populate with the verified owning account ID before execution.","compatibility_date":"2026-09-13","workers_dev":false,"preview_urls":true,"assets":{"directory":"./dist","html_handling":"drop-trailing-slash","not_found_handling":"404-page"},"routes":[{"pattern":"rnraielements.com","custom_domain":true,"zone_id":"Populate with the verified active zone ID before execution."}],"excluded_configuration":["main","Astro server adapter","assets.binding","storage or service bindings","Pages configuration","wildcard origin routes","custom headers and cache policies"]}
```

The two identity instructions above are planning values, not deployable configuration. Replace them with verified identities before execution. The assets-only deployment has no application entrypoint, router, or storage bindings.

## BOUNDARY CONTRACTS

1. Use an isolated clean prerequisite candidate based on 38034e972490945b684f5bd5a706bca0479dc659 containing the reviewed ORI-RN-000 correction and this initial deployment work, with no unfinished Sprint 05 content or shared-checkout WIP.
2. Keep the initial release independent of Quickstart installation tests. Its purpose is to publish the existing real docs and generated registry so those tests can subsequently execute.
3. The preparation script verifies the selected source SHA and clean source tree, runs the candidate's actual quality checks and ordered registry/gallery/docs build, and records every command and exit code. It must explicitly execute the current docs-data prebuild after fresh registry and gallery generation; do not rely on an inferred pnpm lifecycle setting.
4. Freeze the accepted dist tree. Record SHA-256 for every asset, the lockfile and configuration, plus tool versions and build commands. Reject changed or stale artifacts before upload.
5. Implement bootstrap and completed-site assertion sets in public-http.test.ts. The bootstrap set checks existing published pages and both conversation endpoints; it must not report the unfinished orientation, search, or custom 404 work complete.
6. Perform the first domain attachment through an attended terminal with inherited terminal stdout. Refuse conflicting DNS records, another service's custom domain, unexpected routes, or replacement prompts. Do not pipe this deployment through tee or invoke it with non-terminal stdout.
7. Record the actual Worker version and deployment IDs after deployment, then verify the public apex and registry through normal public DNS.
8. Bootstrap runs the candidate's existing root typecheck, lint, token/contract/registry checks and applicable current tests, then explicit registry generation, gallery generation, docs-data prebuild and Astro build. Do not invent a whole-example gate: that command has no current package script and is not part of root typecheck. Record separate example diagnostics honestly; do not repair unrelated gallery paths.
9. All commands are proposed execution steps, not commands executed during this planning pass.
10. Run deploy only after the authority and ownership checks pass. A confirmed absent Worker is a valid first-release state; authentication, authorization, and network failures are blockers.
11. Bind INITIAL_VERSION_ID to the actual command output. Do not infer deployment success from exit code alone.
12. Use cached OAuth. Do not inspect, print, export, or copy its token into repository files or evidence.
13. Wrangler 4.81.0 can set overwrite flags when deployment stdout is captured. The first deploy therefore requires a human-attended terminal with inherited TTY stdout, verified account/zone and absence of conflicting DNS/Worker/custom-domain ownership. No tee, captured stdout, auto-confirmation, or overwrite-conflict acceptance.

## DELIVERABLE

- apps/docs/wrangler.jsonc, apps/docs/package.json, pnpm-lock.yaml: exact assets-only configuration and Wrangler 4.81.0 dependency with consistent lockfile.
- scripts/docs-deploy/prepare.ts: deterministic source validation, real command execution, explicit ordered generation, frozen manifest creation, and refusal of stale or changed accepted artifacts.
- tests/sprint-05-orient-search/public-http.test.ts: task-owned executable integration assertions for bootstrap and completed-site phases; live public byte/schema/engine checks and release-identity reconciliation.
- tests/sprint-05-orient-search/initial-deployment.md and .gitignore: attended execution instructions and narrowly scoped generated/scratch exclusions.
- Six allowlisted evidence JSON files: future sanitized observations with actual identities, commands, exit codes, hashes, and public results.

## AGENT INSTRUCTIONS

This is configuration and publication infrastructure, so TDD_MODE is skipped. This does not waive behavioral integration assertions or seeded evidence. Keep every AC at TDD_STATE none until execution supplies actual observations; never manufacture a RED/GREEN history.

1. Confirm execution authorization, reviewed ORI-RN-000, isolated source identity, and external authority. Preserve pre-deploy observations, including a confirmed absent Worker where applicable. Do not interpret an authentication/network failure as absence.
2. Implement only the allowed preparation, configuration, assertion, and runbook surfaces. Use executable assertions with nonzero failures. No test-only product seam or fake transport.
3. Run actual root checks: `pnpm typecheck`, `pnpm lint`, `pnpm check:tokens`, `pnpm check:contract`, `pnpm check:registry`, and `pnpm test` on the prerequisite candidate. Record any real generated-input hydration needed by those checks. The accepted build must then explicitly run `pnpm registry:build`, `pnpm gallery:manifest`, `pnpm --dir apps/docs run prebuild`, and `pnpm --dir apps/docs exec astro build` in order. Do not rely on implicit lifecycle execution.
4. Freeze and validate artifacts; exercise source-mismatch, changed-byte, and missing-file refusals through the real preparation CLI using owned disposable source/build copies. Existing frozen evidence must be verified before any rebuild can replace it. Keep each probe's actual command, input identity, and exit code in the bounded evidence records.
5. After authority and immutable-byte gates pass, perform the first domain attachment in the attended terminal. Collect IDs using subsequent read-only Cloudflare commands, run the public HTTP assertions, and hand the exact candidate and receipts to the independent reviewer.

Separate diagnostic only: `pnpm --dir apps/example exec tsc --noEmit`. Preserve its actual output and exit code separately from accepted gates; do not claim package-wide example green or repair unrelated gallery paths.

### Exact Cloudflare command sequence

```sh
pnpm --dir apps/docs exec wrangler --version
pnpm --dir apps/docs exec wrangler whoami
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
pnpm --dir apps/docs exec wrangler deploy --config wrangler.jsonc
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
pnpm --dir apps/docs exec wrangler versions view "$INITIAL_VERSION_ID" --config wrangler.jsonc
```

Run the deploy line only at the attended boundary. Do not execute this block as an unattended captured script. Read-only account/zone/DNS/custom-domain ownership observations are also required; the command list alone is not complete authority proof. Capture evidence from safe follow-up queries and attended observations, without capturing the deploy command's terminal stdout through a pipe.

## READING LIST

1. scripts/docs-data/prebuild.ts [PRIMARY PATTERN], lines 1–60: gate-then-write and byte-for-byte generated registry copying; read the remaining implementation before invoking it.
2. apps/docs/package.json, entire file: actual prebuild and build scripts; explicit invocation avoids lifecycle assumptions.
3. package.json, scripts section: existing root quality commands and registry/gallery generators.
4. .spec/prds/docs-site/11-technical-requirements/01-architecture-posture.md, postures 1, 3, and 6: static output, shared docs/registry origin, and gated publication.
5. /Users/justinrich/Projects/brain/.rosetta/docs/cloudflare-workers/wrangler-commands.md, core commands and configuration: CLI context; the compact task's exact version, commands, and attended boundary take precedence.

Required governing references: AGENTS.md; /Users/justinrich/Projects/brain/docs/ROOT-CONTEXT.md; /Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md; /Users/justinrich/Projects/brain/docs/kanban/TASK-TEMPLATE.md; /Users/justinrich/Projects/brain/docs/kanban/REQUIREMENT-CONTRACT-V1.md; /Users/justinrich/Projects/brain/docs/kanban/SCENARIO-CONTRACT-V1.md.

## DESIGN / CODING GUIDANCE

The task-owned public-http.test.ts preparation check launches the real scripts/docs-deploy/prepare.ts entrypoint, asserts its actual ordered-command records and source-bound hashes, and runs the already specified source-mismatch, changed-byte, and missing-file probes in owned disposable copies. It fails on an unexpected exit code or receipt, never substitutes a mocked process or static success, and performs no Cloudflare mutation. The public HTTP assertion mode remains a separate post-deployment check.

Preserve the existing built pages and registry contract. No visual redesign or component implementation belongs here. Keep deployment preparation as host-side TypeScript; it does not introduce a Node runtime into Workers. Validate CLI arguments and evidence structures, use deterministic hashing and parsing, retain real process exit codes, and fail closed. Use Biome and existing TypeScript conventions. Pin only the authorized deployment dependency; do not drift Expo or unrelated packages. Use absolute HTTPS registry dependencies and preserve both engine variants.

## EVIDENCE GATES

1. Authority/source: reviewed prerequisite candidate, real account/zone/permission/ownership observations, exact Wrangler 4.81.0, and actual before state. Missing authority or concurrent ownership changes block deployment.
2. Build: actual root checks plus explicit registry → gallery → docs-data → Astro commands succeed; all commands and failures are recorded. No invented whole-example gate.
3. Integrity: manifest covers every frozen asset plus lockfile/configuration; real refusal probes catch source, byte, and missing-file drift before upload. Do not re-baseline a failed probe.
4. Publication: attended first attachment, actual version/deployment IDs, ordinary public DNS, trusted TLS, and both engine response hashes agree. An exit code alone cannot satisfy this gate.
5. Review/contract: independent cloudflare-workers-reviewer checks each AC/TC, complete scenarios, identical human/machine proof fields, allowlist compliance, no stubs/skips/fake success, and planned-versus-observed evidence status. The orchestrator validates sprint flow ownership; this task owns no PRIMARY flow or journey proof.

Evidence outputs, all future:
- authority.json: fresh sanitized account, active-zone, permission, DNS/custom-domain/route, ownership, and terminal-precondition observations.
- before.json: actual pre-deploy Worker/deployment state; confirmed absence is explicit and distinguishable from errors.
- build.json: run/source/reviewed-input identities, actual commands, tool versions, exits, and refusal-probe observations; separate example diagnostics remain labeled.
- asset-manifest.json: complete accepted dist inventory with SHA-256, source identity, lockfile/configuration hashes, and build linkage.
- release.json: actual account/Worker/domain/version/deployment identities, manifest linkage, and attended release observation.
- public-http.json: actual DNS/TLS/HTTP observations, schema/engine assertions, expected/actual hashes, and bootstrap phase identity.

All six paths are under tests/sprint-05-orient-search/evidence/ORI-DEP-001/. Preserve prior run identities inside these bounded records; never replace failed observations with authored success.

## OUT OF SCOPE

- Executing or declaring completion of the full Quickstart seed/live matrices, orientation, search, or custom 404.
- ORI-RN-000's PromptInput repair, native consumer implementation, AI SDK/provider wiring, and unrelated example/gallery fixes.
- Hosted CI provisioning, final completed-site upload/promotion, rollback automation, headers/cache policy, or Cloudflare resource replacement.
- Worker application code, storage/service bindings, Pages, SSR, or any additional authored path.

## CONTEXT / CAPABILITIES

Current gap: the compact context records rnraielements.com as registered but unresolved during parent preflight, and actual account/zone/permission ownership remains unverified. Recheck all of it during authorized execution. ORI-RN-000 must supply the reviewed Expo 57 PromptInput correction first.

Success state: Both literal public conversation URLs return schema-valid, engine-correct JSON matching the accepted build, and the recorded account, Worker, deployment, domain and TLS observations agree. This establishes the installation prerequisite only.

Touches: CAP-DOCS-01. PRD references: .spec/prds/docs-site/README.md; .spec/prds/docs-site/04-uc-docs.md (UC-DOCS-02 prerequisite); .spec/prds/docs-site/11-technical-requirements/01-architecture-posture.md; .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md.

The immutable sprint gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint remains the built docs preview at http://localhost:4321, route /docs/introduction. Demonstrates UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The sprint retains 13 flows: nine task flows and four journeys; ORI-AST-010 owns the four journey proofs. This charter changes none of them.

## REVIEW

Must pass:
- All four ACs and mapped TCs have real seeded evidence from the exact prerequisite candidate.
- Authority, attended first attachment, and actual deployment/version identity are proven without credential exposure or conflict replacement.
- Explicit ordered generation and complete frozen hashes agree with actual public bytes for both engines.
- Source and artifact refusal probes fail through real entrypoints; bootstrap cannot certify completed-site or native/provider work.
- Scope, configuration exclusions, exact dependency pin, and human/machine requirement parity hold.

Should verify:
- Error messages name the failing source, command, asset, or authority condition.
- Evidence preserves failures and separates diagnostics from gates.
- Completed-site assertions are a separate executable phase and cannot be selected accidentally by bootstrap.
- Cleanup and scratch ownership preserve unrelated work and processes.

Agent rationale: cloudflare-workers-planner owns the assets-only deployment/control-plane contract; cloudflare-workers-implementer builds it; cloudflare-workers-reviewer independently verifies it. react-native-reusables-planner contributes the public registry prerequisite boundary; ghactions-planner contributes immutable artifact and downstream acceptance provenance.

Verdict after execution: APPROVED or NEEDS_FIXES, with concrete evidence and file references. No verdict is asserted by this planning artifact.

## DEPENDENCIES / HANDOFF

Depends on: ORI-RN-000, providing the reviewed published-source correction and regenerated engine artifacts.

Blocks: ORI-RN-001's literal canonical public installations. It also supplies downstream native/Quickstart acceptance with the accepted public registry hashes; this is a prerequisite relationship, not ownership of those proofs.

Provides: verified initial Worker/domain release; both public engine registries; frozen manifest, release receipt, bootstrap HTTP assertions, and the completed-site assertion phase for later publication owners.

Consumes: source 38034e972490945b684f5bd5a706bca0479dc659 plus reviewed prerequisite commits; current generators and docs; verified external Cloudflare authority; normal public DNS and TLS.

FLOW-DOCS-02-quickstart-chat-screen support is non-primary. Its sole primary owner remains ORI-CONT-004. ORI-GATE-03 exercises this task through the public installation prerequisite. The downstream locked proof remains `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`, using .spec/e2e-policy/surface.json and .spec/e2e-policy/coldboot.json. Its canonical RED output remains tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red. Do not make this initial release depend on that proof: publication must precede its clean public installations. Human test hook: Open the real public site and exercise FLOW-DOCS-02-quickstart-chat-screen.

Initial publication hashes must remain the hashes consumed by later acceptance. A later mismatch requires a separately reviewed prerequisite release and fresh native proof. Final completed-candidate upload/promotion belongs to later owners and follows hosted acceptance. Stop on concurrent ownership changes.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "ORI-DEP-001",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "corrected_candidate": {
      "description": "Assigned isolated reviewed prerequisite candidate with clean source identity.",
      "seed_method": "cli",
      "records": [
        "Base source 38034e972490945b684f5bd5a706bca0479dc659 plus reviewed ORI-RN-000 and this task; actual RELEASE_SHA recorded.",
        "Real lockfile and registry inputs; no shared WIP or unfinished Sprint 05 content."
      ]
    },
    "frozen_build": {
      "description": "Actual output of bootstrap preparation, retained before publication.",
      "seed_method": "cli",
      "records": [
        "Real dist, build.json, asset-manifest.json, and both generated conversation files from corrected_candidate.",
        "Actual source, tool versions, asset SHA-256 values, lockfile and configuration hashes; probes use owned disposable copies."
      ]
    },
    "verified_authority": {
      "description": "Fresh authenticated read-only Cloudflare observations obtained without inspecting cached OAuth tokens.",
      "seed_method": "recorded_external",
      "records": [
        "Actual owning account, active zone, effective permissions, Worker rnr-ai-elements-docs, domain rnraielements.com, routes, and DNS/custom-domain ownership.",
        "Actual pre-deploy state distinguishes confirmed absent Worker from authentication, authorization, or network failure."
      ]
    },
    "published_bootstrap": {
      "description": "Frozen build published through the authorized attended Wrangler command after authority checks.",
      "seed_method": "cli",
      "records": [
        "Actual version/deployment IDs and accepted manifest retained in the release receipt.",
        "https://rnraielements.com/r/nativewind/conversation.json and https://rnraielements.com/r/uniwind/conversation.json accessed through normal public DNS and trusted HTTPS."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the accepted bootstrap release is deployed WHEN the bootstrap HTTP assertions fetch both literal conversation URLs through public DNS THEN both return schema-valid, engine-correct JSON whose SHA-256 values match the accepted build.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/public-http.test.ts",
      "test_function": "bootstrap",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json",
      "test_tier": "integration",
      "verification_service": "real Cloudflare Workers static assets, public DNS, and trusted HTTPS",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real Cloudflare Workers static assets, public DNS, and trusted HTTPS",
        "negative_control": {
          "would_fail_if": [
            "HTTP assertions accept a static HTML shell, empty registry, mocked response, wrong engine, or disconnected public hostname"
          ]
        },
        "evidence": {
          "artifact_type": "api_response",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "published_bootstrap",
            "action": {
              "actor": "api_client",
              "steps": [
                "Run the bootstrap public-http command against https://rnraielements.com using the actual release receipt.",
                "Fetch /r/nativewind/conversation.json and /r/uniwind/conversation.json without hostname rewriting or disabled certificate validation; compare response bytes with the frozen assets."
              ]
            },
            "end_state": {
              "must_observe": [
                "2 literal conversation endpoints return HTTP 200 with JSON content and name 'conversation'.",
                "Both responses contain non-empty real component files, engine-correct imports and absolute HTTPS registry dependencies, and SHA-256 values equal to their accepted asset-manifest entries.",
                "Existing built pages, including '/components', return the bootstrap expectations derived from the accepted dist."
              ],
              "must_not_observe": [
                "Empty files arrays, HTML fallback bodies, unresolved DNS, untrusted TLS, cross-engine imports, or mismatched response hashes.",
                "A bootstrap receipt claiming completed orientation, search, custom 404, Quickstart, or native/provider acceptance."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN the isolated reviewed prerequisite candidate WHEN bootstrap preparation checks identity and runs the actual quality and build commands THEN build.json records the selected source and successful checks, with registry, gallery, docs-data, and Astro generation explicitly ordered.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/public-http.test.ts",
      "test_function": "bootstrap-preparation",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source \"$RELEASE_SHA\" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001",
      "test_tier": "integration",
      "verification_service": "real pnpm workspace commands, registry generator, docs-data pipeline, Astro compiler, and filesystem",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real pnpm workspace commands, registry generator, docs-data pipeline, Astro compiler, and filesystem",
        "negative_control": {
          "would_fail_if": [
            "Preparation is a no-op or writes canned success without executing the real commands, or consumes stale generated registry data"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "corrected_candidate",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Run the exact bootstrap preparation command with RELEASE_SHA bound to the reviewed isolated candidate.",
                "Execute actual root typecheck, lint, token, contract, registry, and applicable current tests; explicitly execute registry generation, gallery generation, docs-data prebuild, and Astro build in that order."
              ]
            },
            "end_state": {
              "must_observe": [
                "'build.json' binds the actual RELEASE_SHA to base '38034e972490945b684f5bd5a706bca0479dc659' and the reviewed ORI-RN-000 correction.",
                "Each required command has its actual command text and exit code 0; the accepted build records 'registry:build', 'gallery:manifest', 'prebuild', and 'astro build' in order.",
                "The generated dist contains both 'r/nativewind/conversation.json' and 'r/uniwind/conversation.json'."
              ],
              "must_not_observe": [
                "Empty command evidence, an inferred prebuild lifecycle, a stale registry copy, or unreviewed/shared-checkout source.",
                "A fabricated apps/example typecheck script or a claim that root typecheck proves the whole example app."
              ]
            }
          },
          {
            "start_ref": "corrected_candidate",
            "action": {
              "actor": "cli_user",
              "steps": [
                "In an owned disposable candidate copy, invoke the same preparation entrypoint with RELEASE_SHA deliberately set to the base SHA while the actual candidate includes reviewed changes."
              ]
            },
            "end_state": {
              "must_observe": [
                "Preparation exits nonzero and reports 'source mismatch' before accepting a build or uploading assets."
              ],
              "must_not_observe": [
                "Exit 0, a successful build receipt for the mismatched source, or any Cloudflare mutation."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN a frozen accepted dist and its source-bound manifest WHEN preparation rechecks the release before upload THEN every asset, lockfile, and configuration digest matches, and changed, missing, or stale artifacts are rejected.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/public-http.test.ts",
      "test_function": "bootstrap-preparation",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source \"$RELEASE_SHA\" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001",
      "test_tier": "integration",
      "verification_service": "real prepared dist, SHA-256 hashing, release preparation CLI, and filesystem",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real prepared dist, SHA-256 hashing, release preparation CLI, and filesystem",
        "negative_control": {
          "would_fail_if": [
            "Manifest verification is a static success flag, ignores a changed asset, accepts an empty dist, or silently re-baselines stale release evidence"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "frozen_build",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Run the bootstrap preparation entrypoint against the existing frozen release evidence; rehash the complete dist, pnpm-lock.yaml, and apps/docs/wrangler.jsonc before any upload."
              ]
            },
            "end_state": {
              "must_observe": [
                "'asset-manifest.json' covers every actual dist asset with SHA-256 and includes both conversation files.",
                "The current lockfile and configuration digests equal the frozen digests; 'build.json' and the manifest identify the same RELEASE_SHA and tool versions."
              ],
              "must_not_observe": [
                "An empty asset inventory, unmatched source identity, unrecorded asset, or silently replaced frozen manifest."
              ]
            }
          },
          {
            "start_ref": "frozen_build",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Use an owned disposable copy of the actual frozen build and evidence; change one byte of r/nativewind/conversation.json on the real filesystem and rerun the same preparation entrypoint.",
                "Restore the original bytes, verify their digest, then remove that asset from the disposable copy and repeat; preserve the original accepted build untouched."
              ]
            },
            "end_state": {
              "must_observe": [
                "The changed-byte run exits nonzero with 'asset hash mismatch' naming 'r/nativewind/conversation.json'.",
                "The missing-file run exits nonzero naming 'r/nativewind/conversation.json'; neither run uploads or creates a success receipt."
              ],
              "must_not_observe": [
                "Exit 0 for changed or missing assets, automatic re-baselining, a Cloudflare mutation, or changes to the original frozen build."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "primary": false,
      "description": "GIVEN verified Cloudflare authority, uncontested ownership, and frozen bootstrap assets WHEN the attended first deploy runs and live control-plane observations are reconciled THEN the configured account, zone, Worker, apex domain, version, and deployment agree with the release receipt.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/public-http.test.ts",
      "test_function": "bootstrap",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json",
      "test_tier": "integration",
      "verification_service": "real Wrangler 4.81.0, Cloudflare account and deployment APIs, attended terminal, public DNS, and trusted HTTPS",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real Wrangler 4.81.0, Cloudflare account and deployment APIs, attended terminal, public DNS, and trusted HTTPS",
        "negative_control": {
          "would_fail_if": [
            "Authority is inferred from a cached login, deployment success is a canned receipt, or public verification is disconnected from the actual Worker version"
          ]
        },
        "evidence": {
          "artifact_type": "api_response",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "verified_authority",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Inspect actual account, active zone, effective permissions, DNS, custom domain, routes, and deployment ownership using authenticated read-only observations; reconcile the exact assets-only configuration.",
                "After authorization and frozen-byte checks, run the exact initial wrangler deploy command in a human-attended terminal with inherited terminal stdout; refuse conflicts or replacement prompts.",
                "Bind INITIAL_VERSION_ID to actual output, inspect deployments and that version, and run bootstrap public verification with fresh read-only control-plane comparisons."
              ]
            },
            "end_state": {
              "must_observe": [
                "'authority.json' and 'before.json' identify the actual owning account, active zone, 'rnr-ai-elements-docs', and 'rnraielements.com'; a confirmed absent Worker is distinguished from an API failure.",
                "Wrangler reports version '4.81.0'; the configuration has compatibility_date '2026-09-13', workers_dev false, preview_urls true, and assets.directory './dist'.",
                "'release.json' records non-empty actual version and deployment IDs that agree with subsequent live queries, the accepted asset manifest, and trusted public HTTPS observations."
              ],
              "must_not_observe": [
                "Unverified or conflicting ownership, accepted replacement prompts, captured deploy stdout, exposed OAuth tokens, inferred deployment IDs, or a success receipt based only on exit 0."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "Both public conversation responses satisfy the real schema, engine, non-empty-source, trusted-HTTPS, and accepted-byte assertions.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "Preparation records actual successful quality/build commands in order and refuses a source mismatch before acceptance.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source \"$RELEASE_SHA\" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "Complete frozen hashes match the accepted candidate, while real changed-byte and missing-file probes fail without upload or re-baselining.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --check preparation --source \"$RELEASE_SHA\" --evidence tests/sprint-05-orient-search/evidence/ORI-DEP-001",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "description": "Actual account, zone, Worker, domain, version, and deployment observations agree with the attended bootstrap release and contain no credentials.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/public-http.test.ts --phase bootstrap --origin https://rnraielements.com --receipt tests/sprint-05-orient-search/evidence/ORI-DEP-001/release.json",
      "maps_to_ac": "AC-4"
    }
  ]
}
-->
</details>

## Handoff

```json
{
  "task": "ORI-DEP-001",
  "commit_sha": "2eb5c039495aa1425a6b5f12eb921f1023c47412",
  "done": "The assets-only Workers static-assets deployment rnr-ai-elements-docs is live at https://rnraielements.com (release 10d7f1de, version 2aef7463-0e76-4655-8a67-051bf970f06f, deployment 3a46d447-ff9d-4353-a097-858497e3ae62, custom domain attached, 186-asset frozen manifest whose public bytes byte-match over trusted HTTPS), alongside the preparation CLI scripts/docs-deploy/prepare.ts, the bootstrap/completed-site assertion set tests/sprint-05-orient-search/public-http.test.ts, the attended runbook, and all six evidence records under tests/sprint-05-orient-search/evidence/ORI-DEP-001/.",
  "deviations": [
    "scripts/docs-deploy/prepare.ts:136 verifies 'source tree unchanged since release SHA' via `git diff --quiet <source> HEAD` (excluding evidence/.tmp) instead of `HEAD === source`, because the evidence is committed in a separate record commit that legitimately moves HEAD past the release SHA.",
    "scripts/docs-deploy/prepare.ts:248-256 runs the generators (registry:build -> gallery:manifest -> prebuild) as explicit hydration BEFORE typecheck/lint/checks, because root `tsc --noEmit` imports the generated apps/docs/src/data/registry-items.json.",
    "scripts/docs-deploy/prepare.ts:128,136,163 excludes the evidence tree and .tmp by a FIXED path (tests/sprint-05-orient-search/evidence) rather than the --evidence argument, because the refusal probes pass --evidence pointing at a disposable copy under .tmp.",
    "`pnpm test` (broad vitest) was not run in-lane; scripts/docs-deploy/prepare.ts:290 records this in note_test_suite, and the example-app `tsc --noEmit` (exit 2) is recorded at prepare.ts:289 as a separate non-gating diagnostic."
  ],
  "concerns": [
    "tests/sprint-05-orient-search/public-http.test.ts uses a .test.ts suffix but is run via `pnpm exec tsx`, so the root `vitest run` collects it as an empty suite; rename it or add it to vitest excludes.",
    "scripts/docs-deploy/prepare.ts:128 hardcodes the evidence-tree path, so any future task using a different evidence location must update EVIDENCE_TREE.",
    "apps/docs/wrangler.jsonc:14 sets the legacy `preview_urls: true` field (still accepted by wrangler 4.81.0, maps to subdomain.previews_enabled), which may vanish in a future wrangler major.",
    "The example app's `tsc --noEmit` exits 2 with pre-existing type errors and is recorded as a diagnostic, so downstream must not read it as a green example-app gate.",
    "prepare.ts's `--dist` override is a test-only seam for the refusal probes; used outside that purpose it could freeze against a non-frozen dist."
  ],
  "findings": [
    "Root `pnpm typecheck` imports apps/docs/src/data/registry-items.json (generated by prebuild), so it fails in a clean worktree until the generators hydrate it — the task listed typecheck as a pre-generation 'root check'.",
    "The cached OAuth token actually held workers (write), zone (read), ssl_certs (write), etc. — far more than the preflight's 'user (read) + offline_access' — but still no zone (edit), which is why OAuth alone could not do the custom-domain DNS attachment.",
    "A User API Token's permissions have no read-only introspection endpoint; DNS:Edit was provable only via a reversible create+delete TXT probe, and Workers:Edit / Custom Domains:Edit only by the deploy itself.",
    "The machine-local resolver held a stale negative cache (ENODATA) for rnraielements.com even after 1.1.1.1 / 9.9.9.9 / 1.0.0.1 returned the Cloudflare records, and 8.8.8.8 was unreachable from this machine (local network, not a DNS fact).",
    "`wrangler whoami` with a User API Token omits the account email unless User Details:Read is granted."
  ],
  "scope_impact": [
    {"target": "ORI-RN-001", "found": "The live canonical registry (https://rnraielements.com/r/{nativewind,uniwind}/*.json, hashes bound to release 10d7f1de) now resolves and byte-matches the frozen manifest.", "change": "Its clean-consumer setup proofs can pin to these live hashes; no change to ORI-DEP-001 is needed."},
    {"target": "ORI-DEP-002", "found": "Current version is 2aef7463 / deployment 3a46d447 with the custom domain attached, but the custom 404 content (not_found_handling: 404-page in apps/docs/wrangler.jsonc:18) is configured yet not deployed.", "change": "Verify against these IDs and do not expect the completed custom 404 (owned by ORI-AST-009/ORI-VIS-005) in its 404-recovery check."},
    {"target": "GATE:ORI-GATE-03", "found": "The sprint's 'publication precedes clean public installations' ordering is now satisfied.", "change": "The quickstart-chat-screen proof can run against the live public registry."}
  ],
  "feedback": [
    "The task lists `pnpm typecheck` among the pre-generation 'root checks', but typecheck depends on the generated registry-items.json — state that typecheck requires hydration first, or reorder the steps.",
    "The 'verifies the selected source SHA' wording implied HEAD === RELEASE_SHA, which conflicts with recording evidence in a separate commit — specify 'source tree unchanged since the release SHA'.",
    "The public VERIFY command uses fetch()/system resolver and would fail on a machine with a stale local DNS cache without a hosts override — state that public verification may need a public-DNS resolution path, or that the local cache is not a failure.",
    "The first-deploy 'human-attended TTY' boundary was correct but created a hard agent/human handoff even after the owner granted an API token — specify which single step needs the human and that a token grant does not waive it.",
    "Consider naming the assertion file without a .test.ts suffix (or adding it to vitest excludes) since it is run via tsx, not vitest."
  ]
}
```
