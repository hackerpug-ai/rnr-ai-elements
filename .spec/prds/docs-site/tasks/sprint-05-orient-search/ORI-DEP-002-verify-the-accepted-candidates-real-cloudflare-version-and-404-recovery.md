<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search -->

## What this does

Verifies the accepted candidate on its actual Cloudflare version URL, including branded 404 responses and desktop/mobile recovery, while preserving the initial apex deployment.

## Why

ORI-DEP-003 needs a verified version ID bound to the exact accepted artifact. A local preview or a successful upload cannot prove Cloudflare's status codes, asset delivery, or recovery behavior.

## How to verify

Run `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts` against this run's recorded version URL. Inspect the HTTP evidence, both screenshots, and deployment identity before and after upload.

## Scope

Owns two remote-test files and five evidence files. Consumes the accepted build, existing branded 404, and reviewed presentation. Final apex promotion belongs to ORI-DEP-003.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-DEP-002: Verify the accepted candidate's real Cloudflare version and 404 recovery

> Status: Backlog
> Assignee: cloudflare-workers-implementer · Reviewer: cloudflare-workers-reviewer
> Priority: P1 · Points: 2 · Type: INFRA
> Dependency phase: After ORI-DEP-001, ORI-CI-004, ORI-AST-009, and ORI-VIS-005; before ORI-DEP-003
> Proposed By: cloudflare-workers-planner
> Co-authored By: astro-planner, frontend-designer, ghactions-planner
> Additional Reviewer: frontend-designer
> TDD_MODE: skipped · RED_GREEN_REQUIRED: false
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer
> PROGRESS: 0/4 acceptance criteria verified; all TDD_STATE values are none.

### OUTCOME

The accepted artifact serves branded HTTP 404 responses and working recovery from its verified Cloudflare version, while the initial apex deployment remains active.

### 🚫 CRITICAL CONSTRAINTS

- Never promote, reattach the domain, apply triggers, or upload a second artifact. ORI-DEP-003 promotes this exact verified version.
- Never upload before ORI-CI-004 acceptance and completed-mode identity verification. Stop on byte drift, registry-hash mismatch, or concurrent deployment ownership changes.
- Never substitute localhost, an arbitrary host, disabled certificate validation, mocked HTTP, injected views, canned responses, or skipped browser targets for the real version.
- Never edit product pages, content, assets, build configuration, shared tests, or policies. Use only the seven allowed paths and owned OS-derived scratch roots.
- Never represent planned receipts, screenshots, checks, or deployment state as observed evidence. This charter authorizes no implementation or external action.

### DONE WHEN

- [ ] AC-1 binds the accepted bytes, actual version ID, actual version URL, and guarded remote configuration to one run.
- [ ] AC-2 proves both missing paths return the accepted branded bytes with HTTP 404 and no redirects.
- [ ] AC-3 proves rendered branding, stylesheet application, plain-link recovery, and shared-search recovery on desktop and mobile; both screenshots are visually inspected.
- [ ] AC-4 proves the initial apex deployment remains active and provides ORI-DEP-003 the exact verified version identity.
- [ ] All verification and evidence gates pass, independent review is recorded, and changes remain within write_allowed.

### RUNTIME COMMANDS

- Test: `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm exec biome ci tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts`

Authorized execution later uses these exact Cloudflare commands:

```sh
pnpm --dir apps/docs exec wrangler versions upload --config wrangler.jsonc --message "$RELEASE_SHA"
pnpm --dir apps/docs exec wrangler versions view "$CANDIDATE_VERSION_ID" --config wrangler.jsonc
pnpm --dir apps/docs exec wrangler deployments list --config wrangler.jsonc --json
```

The upload is a single preparation action outside repeatable tests. Read-only verification and reviewer reruns reuse the recorded version. Use the upstream prepare.ts completed-mode invocation supplied by ORI-CI-004; do not invent flags or rebuild the accepted artifact.

### ACCEPTANCE CRITERIA

Each JSON row below is the complete human-readable proof specification. Descriptions use GIVEN-WHEN-THEN; the same rows appear unchanged in the Requirement Contract. All criteria are task-local and non-primary. No locked flow or journey ownership is claimed.

#### AC-1: Accepted version and guarded origin

```json
{
  "id": "AC-1",
  "type": "acceptance_criterion",
  "description": "GIVEN ORI-CI-004's accepted immutable artifact WHEN one authorized upload and the remote checks execute THEN the receipt binds accepted bytes to the actual version and rejects untrusted origins.",
  "primary": false,
  "flow_ref": null,
  "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
  "test_function": "ORI-DEP-002 AC-1 accepted-version-and-origin",
  "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-1 accepted-version-and-origin'",
  "test_tier": "integration",
  "verification_service": "Cloudflare Workers versions API through real Wrangler, Cloudflare HTTPS assets, and the accepted filesystem artifact",
  "surface_policy": ".spec/e2e-policy/surface.json",
  "maps_to_ac": null,
  "tdd_state": "none",
  "scenario": {
    "id": "SC-ORI-DEP-002-1",
    "ac_ref": "AC-1",
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "Cloudflare Workers versions API through real Wrangler, Cloudflare HTTPS assets, and the accepted filesystem artifact",
    "negative_control": {
      "would_fail_if": [
        "The upload is a no-op or the receipt invents a version absent from the real Cloudflare account.",
        "The checks accept an empty receipt, stale artifact, localhost, or a static result from another host."
      ]
    },
    "evidence": { "artifact_type": "file_artifact", "required_capture": true },
    "cases": [
      {
        "start_ref": "accepted_version_run",
        "action": {
          "actor": "cli_user",
          "steps": [
            "Read the completed-mode identity result and this run's actual upload receipt; query the recorded version with Wrangler versions view.",
            "Run the remote configuration against the receipt's exact HTTPS version origin and make a real request to /__sprint05_missing__."
          ]
        },
        "end_state": {
          "must_observe": [
            "release.json records the actual version ID and URL, RELEASE_SHA, accepted manifest hash, and matching apps/docs/dist/404.html SHA-256.",
            "The real version lookup matches the receipt and /__sprint05_missing__ returns HTTP 404 from that version.",
            "The loaded configuration has no webServer, retries: 0, strict certificate validation, and only *.remote.ts tests."
          ],
          "must_not_observe": [
            "An empty version ID, absent acceptance receipt, or mismatched accepted manifest.",
            "A local webServer, ignored certificate errors, or a substituted origin."
          ]
        }
      },
      {
        "start_ref": "accepted_version_run",
        "action": {
          "actor": "cli_user",
          "steps": [
            "Exercise the real configuration entrypoint with a missing receipt, http://localhost:4321, and https://example.com; assert rejection before network activity.",
            "Check that only the receipt's exact version origin and https://rnraielements.com are eligible; keep this task's proof bound to the version origin."
          ]
        },
        "end_state": {
          "must_observe": [
            "Each of the 3 invalid-input cases reports configuration rejection.",
            "The eligible origins are the recorded HTTPS version origin and https://rnraielements.com."
          ],
          "must_not_observe": [
            "An empty receipt falling back to localhost or apex.",
            "Any request to a rejected origin."
          ]
        }
      }
    ]
  }
}
```

#### AC-2: Direct branded 404 responses

```json
{
  "id": "AC-2",
  "type": "acceptance_criterion",
  "description": "GIVEN the recorded candidate version WHEN both missing paths are requested directly THEN each returns HTTP 404, text/html, and accepted 404.html bytes without redirects.",
  "primary": false,
  "flow_ref": null,
  "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
  "test_function": "ORI-DEP-002 AC-2 direct-branded-404",
  "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-2 direct-branded-404'",
  "test_tier": "integration",
  "verification_service": "Real Cloudflare static asset service over trusted HTTPS and accepted apps/docs/dist/404.html",
  "surface_policy": ".spec/e2e-policy/surface.json",
  "maps_to_ac": null,
  "tdd_state": "none",
  "scenario": {
    "id": "SC-ORI-DEP-002-2",
    "ac_ref": "AC-2",
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "Real Cloudflare static asset service over trusted HTTPS and accepted apps/docs/dist/404.html",
    "negative_control": {
      "would_fail_if": [
        "Cloudflare serves an empty or generic error page, a static success shell, or a redirect instead of the accepted 404.",
        "A deep path resolves a different artifact or the test observes only the final redirected response."
      ]
    },
    "evidence": { "artifact_type": "api_response", "required_capture": true },
    "cases": [
      {
        "start_ref": "accepted_version_run",
        "action": { "actor": "api_client", "steps": ["GET /__sprint05_missing__ directly on the recorded version with redirects disabled; compare the decoded response bytes with accepted apps/docs/dist/404.html."] },
        "end_state": {
          "must_observe": ["HTTP 404; Content-Type media type text/html; byte-for-byte equality with accepted apps/docs/dist/404.html."],
          "must_not_observe": ["An empty or generic error body, HTTP 200, any 3xx response, or a Location header."]
        }
      },
      {
        "start_ref": "accepted_version_run",
        "action": { "actor": "api_client", "steps": ["GET /docs/__sprint05_missing__/nested directly on the recorded version with redirects disabled; compare the decoded response bytes with accepted apps/docs/dist/404.html."] },
        "end_state": {
          "must_observe": ["HTTP 404; Content-Type media type text/html; byte-for-byte equality with the same accepted apps/docs/dist/404.html."],
          "must_not_observe": ["An empty or different deep-path body, HTTP 200, any 3xx response, or a Location header."]
        }
      }
    ]
  }
}
```

#### AC-3: Rendered recovery on desktop and mobile

```json
{
  "id": "AC-3",
  "type": "acceptance_criterion",
  "description": "GIVEN the real candidate 404 WHEN desktop and mobile visitors use its recovery controls THEN branding, styling, plain links, and shared search work on the recorded version.",
  "primary": false,
  "flow_ref": null,
  "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
  "test_function": "ORI-DEP-002 AC-3 rendered-recovery",
  "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-3 rendered-recovery'",
  "test_tier": "e2e",
  "verification_service": "Real Chromium desktop/mobile browsers, Cloudflare HTTPS assets, and the candidate's shared Pagefind search",
  "surface_policy": ".spec/e2e-policy/surface.json",
  "maps_to_ac": null,
  "tdd_state": "none",
  "scenario": {
    "id": "SC-ORI-DEP-002-3",
    "ac_ref": "AC-3",
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "Real Chromium desktop/mobile browsers, Cloudflare HTTPS assets, and the candidate's shared Pagefind search",
    "negative_control": {
      "would_fail_if": [
        "The rendered page is an empty or unstyled shell, or deep-path assets are disconnected.",
        "Search is a static dialog or canned result, recovery controls are no-ops, or navigation escapes to the initial apex."
      ]
    },
    "evidence": { "artifact_type": "screenshot", "required_capture": true },
    "cases": [
      {
        "start_ref": "accepted_version_run",
        "action": {
          "actor": "user",
          "steps": [
            "In real desktop and mobile browser contexts, visit both missing paths; assert the visible 404 heading and site branding against the accepted page.",
            "Observe root-relative stylesheet requests and applied computed styles; capture and visually inspect 404-desktop.png and 404-mobile.png before navigating away.",
            "Activate the page's ordinary /components and /registry recovery links, returning to the missing page between actions.",
            "Open the shared search through the desktop keyboard command and mobile visible trigger, search for conversation, and activate the /components/conversation result."
          ]
        },
        "end_state": {
          "must_observe": [
            "Both browser targets display the accepted 404 heading and site branding; stylesheet requests return HTTP 200 with CSS matching the accepted asset manifest and applied styles matching the reviewed presentation.",
            "Recovery reaches /components and /registry with HTTP 200 and the corresponding visible page headings on the version origin.",
            "Searching `conversation` produces at least 1 actionable result targeting `/components/conversation`; activating that result loads `/components/conversation` on the recorded version origin with HTTP 200 and exactly 1 visible level-1 heading named `Conversation`.",
            "404-desktop.png and 404-mobile.png contain the rendered page; review.json records visual inspection of both."
          ],
          "must_not_observe": [
            "An empty or unstyled error page, broken deep-path stylesheet URLs, or blank screenshots.",
            "An empty search result list for conversation, an unchanged missing-path URL after activation, or a generic root used as the success oracle."
          ]
        }
      }
    ]
  }
}
```

#### AC-4: Initial apex preserved and exact-version handoff

```json
{
  "id": "AC-4",
  "type": "acceptance_criterion",
  "description": "GIVEN the recorded initial apex deployment WHEN candidate verification finishes THEN the same apex deployment remains active and ORI-DEP-003 receives the exact verified version identity.",
  "primary": false,
  "flow_ref": null,
  "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
  "test_function": "ORI-DEP-002 AC-4 apex-preserved-handoff",
  "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-4 apex-preserved-handoff'",
  "test_tier": "integration",
  "verification_service": "Real Cloudflare deployment and version APIs through Wrangler and public https://rnraielements.com",
  "surface_policy": ".spec/e2e-policy/surface.json",
  "maps_to_ac": null,
  "tdd_state": "none",
  "scenario": {
    "id": "SC-ORI-DEP-002-4",
    "ac_ref": "AC-4",
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "Real Cloudflare deployment and version APIs through Wrangler and public https://rnraielements.com",
    "negative_control": {
      "would_fail_if": [
        "Upload silently promotes the candidate, replaces domain ownership, or the verification is disconnected from the current deployment API.",
        "The handoff is empty, stale, or points to a second artifact instead of the tested version."
      ]
    },
    "evidence": { "artifact_type": "api_response", "required_capture": true },
    "cases": [
      {
        "start_ref": "accepted_version_run",
        "action": {
          "actor": "cli_user",
          "steps": [
            "Query deployments after upload and again after browser verification; compare active deployment identity and version allocations with the pre-upload baseline.",
            "Fetch the existing apex registry URLs from ORI-DEP-001's receipt over ordinary trusted HTTPS and compare their bytes with that receipt and the accepted manifest.",
            "Bind the verified version ID, URL, artifact hashes, test identities, and evidence hashes in the handoff; perform no further upload or promotion."
          ]
        },
        "end_state": {
          "must_observe": [
            "The before/after active deployment ID and version allocations are identical; the initial deployment still serves https://rnraielements.com.",
            "The receipt-listed public registry URLs return HTTP 200 and bytes whose SHA-256 values match both the prerequisite release and the accepted manifest.",
            "release.json hands ORI-DEP-003 the same nonempty version ID and URL exercised by AC-1 through AC-3."
          ],
          "must_not_observe": [
            "An absent baseline, empty handoff, changed deployment owner, or candidate traffic allocation at the apex.",
            "A second uploaded artifact, domain reattachment, trigger deployment, or mismatched registry bytes."
          ]
        }
      }
    ]
  }
}
```

### TEST CRITERIA

- TC-1 → AC-1: The real version, accepted hashes, and guarded configuration agree; missing receipts and untrusted origins are rejected. VERIFY: `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-1 accepted-version-and-origin'`
- TC-2 → AC-2: Both direct missing-path responses are HTTP 404 text/html with accepted bytes and no redirects. VERIFY: `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-2 direct-branded-404'`
- TC-3 → AC-3: Both browser targets show styled branding and complete link/search recovery, with inspected screenshots. VERIFY: `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-3 rendered-recovery'`
- TC-4 → AC-4: The initial apex identity and registry bytes remain unchanged, and the handoff identifies the tested version. VERIFY: `pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-4 apex-preserved-handoff'`

### FIXTURES

`accepted_version_run` is seeded once through the real acceptance and Wrangler CLI entrypoints. Its records are ORI-CI-004's accepted source and artifact receipt, completed-mode identity result, frozen dist manifest including 404.html and stylesheet hashes, ORI-DEP-001's actual apex deployment and public-registry receipt, fresh pre-upload deployment state, and the actual single-upload version receipt. These are required future execution inputs, not observations from planning. Tests and reviewers reuse the same version. Missing inputs block execution; no synthetic receipt or injected page substitutes.

### SCOPE

writeAllowed:
- tests/sprint-05-orient-search/cloudflare.playwright.config.ts
- tests/sprint-05-orient-search/custom-404.remote.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-DEP-002/release.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-002/public-http.json
- tests/sprint-05-orient-search/evidence/ORI-DEP-002/404-desktop.png
- tests/sprint-05-orient-search/evidence/ORI-DEP-002/404-mobile.png
- tests/sprint-05-orient-search/evidence/ORI-DEP-002/review.json

writeProhibited:
- apps/docs/**
- .spec/**
- .github/**
- scripts/**
- package.json
- pnpm-lock.yaml
- playwright.config.ts
- Any repository path not explicitly listed in write_allowed.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations. Route incidental browser output to owned OS-derived scratch storage; keep durable evidence within the five allowed evidence paths.

### BOUNDARIES

Always:
- Validate dependency acceptance, source identity, artifact hashes, and current Cloudflare ownership before the one authorized upload.
- Bind every request, screenshot, command result, and review entry to the same run and version.
- Observe product-owned headings, recovery destinations, and search results through real browser actions and HTTPS requests.
- Keep prior run identity in evidence records and fail closed when prerequisites or assertions fail.
- Preserve the fixed sprint gate, local-preview entrypoint, flow count, ownership, and journey assignments.

Ask First:
- Obtain separate implementation/external-action authorization before executing this planning candidate.
- Return missing authority, artifact drift, ownership changes, or required product repairs to the orchestrator for an explicit decision; do not expand this task.

Boundary contracts:
1. Consume the already implemented branded 404 from ORI-AST-009 and its reviewed presentation from ORI-VIS-005; this task writes no page or content.
2. Verify ORI-CI-004's accepted candidate identity and frozen dist manifest; use prepare.ts completed mode to assert identical accepted bytes. Upload that exact immutable candidate once as a nonpromoting Worker version. Record its actual version URL and ID for ORI-DEP-003.
3. Use root-relative asset and recovery URLs already supplied by the route owner so deep unknown paths receive the same branded response.
4. Add the remote-only Playwright configuration with no webServer, retries: 0, strict certificate validation, and testMatch limited to *.remote.ts. Accept only the recorded Cloudflare version URL or https://rnraielements.com; reject localhost and arbitrary hosts.
5. Execute actual unknown-path/deep-path 404, branding, stylesheet, navigation and shared-search recovery assertions on the uploaded version. Capture and visually inspect desktop/mobile screenshots. Confirm the initial apex deployment remains active.
6. Do not reattach the domain or deploy triggers. ORI-DEP-003 promotes this exact verified version; it must not upload a second artifact.
7. Bind the remote test origin to the actual version URL in this run's release receipt.
8. Request /__sprint05_missing__ and /docs/__sprint05_missing__/nested directly. Each returns HTTP 404, text/html, and the built branded page without redirects.
9. Compare returned bytes with the accepted dist/404.html; verify visible heading, site branding, rendered stylesheet, and working recovery links.
10. Confirm that uploading this candidate leaves the initial apex deployment active. This upload does not publish the completed Sprint 05 site.

### DELIVERABLE

- release.json: source/acceptance identity, frozen manifest and 404 hashes, actual upload/version identity, baseline/current deployment identity, and exact-version handoff.
- cloudflare.playwright.config.ts: guarded remote-only desktop/mobile runner; no inherited local webServer or report outputs.
- custom-404.remote.spec.ts: the four named real integration/E2E tests; no upload in repeatable tests.
- public-http.json: run/version-bound request URLs, status, media type, redirect observations, byte lengths/hashes, stylesheet observations, recovery results, and apex checks.
- 404-desktop.png and 404-mobile.png: actual candidate-page captures, referenced by hash in review evidence.
- review.json: independent review, inspected screenshot findings, per-AC results, sanitized command evidence, and handoff readiness. Planned fields must not imply approval before review occurs.

### AGENT INSTRUCTIONS

TDD_MODE is skipped because this is immutable-release infrastructure verification after product implementation and hosted acceptance. It must not manufacture a product RED by editing the accepted artifact or uploading a second version. Behavioral integration/E2E tests and seeded evidence remain mandatory; requires_tests=true, requires_red_evidence=false, requires_seeded_evidence=true. All TDD_STATE values begin at none. Existing flow proof paths remain owned by their tasks and retain canonical proof.red names.

1. After separate execution authorization, consume all four dependencies and their acceptance evidence. Verify the pinned Wrangler 4.81.0 and actual account/Worker authority through normal authenticated tooling without reading or copying tokens. Use prepare.ts completed mode to assert the frozen accepted bytes. An absent interface or receipt is a dependency blocker.
2. Record the initial apex deployment before upload. Upload once, capture the actual version ID and URL, and query that version. If upload outcome is ambiguous, reconcile with Cloudflare before any further action; never blindly upload again.
3. Implement the guarded remote runner and four tests. Keep test reruns read-only toward the deployed candidate. Validate origin rejection through the real configuration entrypoint, without calling rejected hosts or fabricating service responses.
4. Run the remote suite against the recorded version. Capture direct HTTP evidence and desktop/mobile screenshots; inspect the screenshots. Search recovery must use the shared ORI-AST-004 implementation. A failure routes to its owner and blocks this handoff.
5. Recheck apex identity and registry hashes, run scoped compiler/lint gates, and submit the exact candidate and evidence for independent Cloudflare review plus presentation review. Stop at a verified-version handoff; ORI-DEP-003 owns promotion.

### READING LIST

1. playwright.config.ts, lines 1–46 [PRIMARY PATTERN]: real Playwright projects and zero-retry convention; do not inherit its local webServer or report destinations.
2. .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-DEP-002.json, full file: immutable scope, commands, dependencies, and publication order.
3. .spec/prds/docs-site/07-uc-deliv.md, UC-DELIV-02 and UC-DELIV-04: deployment and dead-URL recovery intent.
4. .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md, not-found section: reviewed 404 presentation and existing recovery destinations.
5. .spec/e2e-policy/surface.json, full file: governed driver and product-target rules; use executable observations, not comments or generic-root assertions.

### DESIGN / REFERENCE GUIDANCE

Consume ORI-AST-009's page and ORI-VIS-005's reviewed presentation without restyling. Derive exact branding and heading expectations from the accepted page and reviewed reference. Assert stylesheet bytes and applied computed styles, then inspect both viewport captures. Use /components, /registry, and the real conversation search result as specific recovery targets. Browser viewport evidence proves this docs deployment only; it does not replace upstream native acceptance.

### CODING STANDARDS

- Use TypeScript, the existing pnpm toolchain, and the installed Playwright API; add no dependency.
- Parse receipts and URLs deterministically. Require exact eligible origins, ordinary trusted HTTPS, and the actual receipt-backed version for this task.
- Keep uploads outside tests. Do not add retries, skips, mock routes, page.setContent, provider stubs, fake filesystem layers, or test-only product seams.
- Compare accepted bytes and hashes without rebuilding or mutating the dist. Serialize evidence writes and bind them to source, run, version, and test/config/policy hashes.
- Sanitize evidence; do not capture OAuth tokens or credentials. Use owned OS-derived scratch paths and preserve unrelated work.

### EVIDENCE GATES

1. Preconditions: all four dependency handoffs exist and are accepted; completed-mode artifact validation and prerequisite registry-hash equality succeed; current authority and deployment ownership are established. Stop before upload on failure.
2. Configuration: the actual remote entrypoint rejects the three invalid-input cases; only *.remote.ts is selected, no webServer exists, retries=0, and certificates remain validated.
3. Tests: run the exact verify_commands entry; all four named criteria execute, including desktop/mobile AC-3. Require successful behavioral observations, not only exit 0. No skipped target or fabricated response is acceptable.
4. Compiler/lint: pnpm typecheck and the scoped Biome command exit 0. Preserve full failure output and route any required repair beyond this allowlist to the orchestrator.
5. Evidence/review: all five planned evidence files are produced for this run; HTTP observations show exact status/byte results; both screenshots are inspected; before/after apex identity matches; the independent reviewer approves the exact tested version. Verify scope and contract/scenario consistency before handoff. No verification has run during charter rendering.

### OUT OF SCOPE

- Final apex promotion, domain attachment, DNS changes, trigger deployment, or a second candidate upload.
- Page/content/style/search implementation; failures belong to ORI-AST-009, ORI-VIS-005, or the shared-search owner ORI-AST-004.
- Rebuilding or modifying the accepted artifact, changing registry bytes, or replacing hosted acceptance with local checks.
- Final public fresh-install verification and ORI-PUBLIC-RECOVERY after promotion; these remain downstream responsibilities.
- Native UI changes, additional flows, journey ownership, shared policy changes, dependencies, or broader repository remediation.

### CONTEXT / CAPABILITIES

Current gap: the compact planning context contains no observed Cloudflare version receipt, remote 404 proof, screenshot review, or unchanged-apex evidence for the accepted candidate.

Success state: The real Cloudflare asset service returns the branded static page with HTTP 404. Search recovery remains a required ORI-AST-004 integration assertion before final publication.

Touches CAP-DOCS-01. PRD references: .spec/prds/docs-site/07-uc-deliv.md (UC-DELIV-02, UC-DELIV-04); .spec/prds/docs-site/06-uc-shell.md (UC-SHELL-02); .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md (CAP-DOCS-01); .spec/prds/docs-site/11-technical-requirements/10-routing.md (/404).

Supports existing FLOW-SHELL-07-cmdk-open-search-navigate through a task-local remote integration assertion; primary=false and flow_ref=null throughout this INFRA task. ORI-PUBLIC-RECOVERY exercises ORI-DEP-002 and ORI-DEP-003 after controlled promotion; it does not change the locked local-preview gate or assign this task a primary flow. journey_proofs remains empty.

The fixed sprint gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint remains: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction. Demonstrates UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The 13 flows remain 9 task flows and 4 journeys; sprint sizing remains 36 tasks and 131 points.

### REVIEW

Agent rationale: cloudflare-workers-implementer owns version upload and asset-service integration; cloudflare-workers-reviewer independently verifies Cloudflare identity, nonpromotion, and actual remote behavior. frontend-designer reviews the two captured presentations. Co-author provenance remains astro-planner, frontend-designer, and ghactions-planner.

Must pass:
- Accepted source/artifact identity and exactly one actual version upload are demonstrated with real receipts.
- Every AC has its exact named test, full scenario, seeded observations, and corresponding TC; no mocks, skips, placeholders, fake success, or deferred required behavior remains.
- Both direct 404 responses match accepted bytes; both browser targets complete link and shared-search recovery with visually inspected screenshots.
- The initial apex deployment and prerequisite registry hashes remain unchanged; the handoff names the tested version.
- Scope, compiler/lint gates, evidence provenance, and independent review match the candidate submitted for handoff.

Should verify:
- Receipt URL validation cannot fall back to a different origin.
- Version redirects or absolute links cannot silently move the test to apex.
- Styles are observed as applied, not inferred from a link tag.
- Rerunning tests cannot upload or promote.
- Evidence contains concrete values and no credentials.

Verdict at execution: APPROVED or NEEDS_FIXES, with evidence-backed findings. No verdict is issued by this planning charter.

### DEPENDENCIES

Depends on:
- ORI-DEP-001: owning account/Worker authority, initial corrected registry publication, apex deployment identity, and public registry receipt.
- ORI-CI-004: hosted acceptance, reviewed candidate identity, frozen dist manifest, and prepare.ts completed-mode contract.
- ORI-AST-009: implemented branded 404 with root-relative assets and recovery links.
- ORI-VIS-005: reviewed presentation consumed for remote visual verification.

Blocks: ORI-DEP-003.

Provides: the exact verified version ID/URL, accepted-byte identity, direct HTTP proof, desktop/mobile recovery evidence, unchanged-apex proof, and independent handoff review.

Consumes: the four dependency handoffs plus the shared ORI-AST-004 search behavior already integrated into the accepted artifact. This does not add a dependency edge or transfer ownership of search.

Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/cloudflare-workers-planner-absorb-prerequisites.json. Source task IDs: ORI-DEP-002. Artifact status: planned_output_not_observed. Supersedes: none.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "ORI-DEP-002",
  "tdd_mode": "skipped",
  "verification_policy": { "requires_tests": true, "requires_red_evidence": false, "requires_seeded_evidence": true },
  "fixtures": {
    "accepted_version_run": {
      "description": "One future authorized run consumes the real accepted artifact, records the initial apex, and uploads the immutable candidate once through Wrangler. Tests reuse that actual version.",
      "seed_method": "cli",
      "records": [
        "ORI-CI-004 acceptance receipt binds RELEASE_SHA, reviewed source, lockfile, commands, and the frozen dist manifest; prepare.ts completed mode confirms identical bytes.",
        "The accepted apps/docs/dist/404.html, its stylesheet assets, recovery links, and shared Pagefind index are present in that manifest.",
        "ORI-DEP-001 supplies the actual initial apex identity and public registry hashes; a fresh pre-upload Wrangler deployments list records the current deployment and allocations.",
        "Exactly one authorized Wrangler versions upload produces the actual version ID and HTTPS URL recorded in release.json; these values are never synthesized."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "description": "GIVEN ORI-CI-004's accepted immutable artifact WHEN one authorized upload and the remote checks execute THEN the receipt binds accepted bytes to the actual version and rejects untrusted origins.",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
      "test_function": "ORI-DEP-002 AC-1 accepted-version-and-origin",
      "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-1 accepted-version-and-origin'",
      "test_tier": "integration",
      "verification_service": "Cloudflare Workers versions API through real Wrangler, Cloudflare HTTPS assets, and the accepted filesystem artifact",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "tdd_state": "none",
      "scenario": {
        "id": "SC-ORI-DEP-002-1",
        "ac_ref": "AC-1",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "Cloudflare Workers versions API through real Wrangler, Cloudflare HTTPS assets, and the accepted filesystem artifact",
        "negative_control": { "would_fail_if": ["The upload is a no-op or the receipt invents a version absent from the real Cloudflare account.", "The checks accept an empty receipt, stale artifact, localhost, or a static result from another host."] },
        "evidence": { "artifact_type": "file_artifact", "required_capture": true },
        "cases": [
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "cli_user", "steps": ["Read the completed-mode identity result and this run's actual upload receipt; query the recorded version with Wrangler versions view.", "Run the remote configuration against the receipt's exact HTTPS version origin and make a real request to /__sprint05_missing__."] },
            "end_state": {
              "must_observe": ["release.json records the actual version ID and URL, RELEASE_SHA, accepted manifest hash, and matching apps/docs/dist/404.html SHA-256.", "The real version lookup matches the receipt and /__sprint05_missing__ returns HTTP 404 from that version.", "The loaded configuration has no webServer, retries: 0, strict certificate validation, and only *.remote.ts tests."],
              "must_not_observe": ["An empty version ID, absent acceptance receipt, or mismatched accepted manifest.", "A local webServer, ignored certificate errors, or a substituted origin."]
            }
          },
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "cli_user", "steps": ["Exercise the real configuration entrypoint with a missing receipt, http://localhost:4321, and https://example.com; assert rejection before network activity.", "Check that only the receipt's exact version origin and https://rnraielements.com are eligible; keep this task's proof bound to the version origin."] },
            "end_state": {
              "must_observe": ["Each of the 3 invalid-input cases reports configuration rejection.", "The eligible origins are the recorded HTTPS version origin and https://rnraielements.com."],
              "must_not_observe": ["An empty receipt falling back to localhost or apex.", "Any request to a rejected origin."]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "description": "GIVEN the recorded candidate version WHEN both missing paths are requested directly THEN each returns HTTP 404, text/html, and accepted 404.html bytes without redirects.",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
      "test_function": "ORI-DEP-002 AC-2 direct-branded-404",
      "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-2 direct-branded-404'",
      "test_tier": "integration",
      "verification_service": "Real Cloudflare static asset service over trusted HTTPS and accepted apps/docs/dist/404.html",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "tdd_state": "none",
      "scenario": {
        "id": "SC-ORI-DEP-002-2",
        "ac_ref": "AC-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "Real Cloudflare static asset service over trusted HTTPS and accepted apps/docs/dist/404.html",
        "negative_control": { "would_fail_if": ["Cloudflare serves an empty or generic error page, a static success shell, or a redirect instead of the accepted 404.", "A deep path resolves a different artifact or the test observes only the final redirected response."] },
        "evidence": { "artifact_type": "api_response", "required_capture": true },
        "cases": [
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "api_client", "steps": ["GET /__sprint05_missing__ directly on the recorded version with redirects disabled; compare the decoded response bytes with accepted apps/docs/dist/404.html."] },
            "end_state": { "must_observe": ["HTTP 404; Content-Type media type text/html; byte-for-byte equality with accepted apps/docs/dist/404.html."], "must_not_observe": ["An empty or generic error body, HTTP 200, any 3xx response, or a Location header."] }
          },
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "api_client", "steps": ["GET /docs/__sprint05_missing__/nested directly on the recorded version with redirects disabled; compare the decoded response bytes with accepted apps/docs/dist/404.html."] },
            "end_state": { "must_observe": ["HTTP 404; Content-Type media type text/html; byte-for-byte equality with the same accepted apps/docs/dist/404.html."], "must_not_observe": ["An empty or different deep-path body, HTTP 200, any 3xx response, or a Location header."] }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "description": "GIVEN the real candidate 404 WHEN desktop and mobile visitors use its recovery controls THEN branding, styling, plain links, and shared search work on the recorded version.",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
      "test_function": "ORI-DEP-002 AC-3 rendered-recovery",
      "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-3 rendered-recovery'",
      "test_tier": "e2e",
      "verification_service": "Real Chromium desktop/mobile browsers, Cloudflare HTTPS assets, and the candidate's shared Pagefind search",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "tdd_state": "none",
      "scenario": {
        "id": "SC-ORI-DEP-002-3",
        "ac_ref": "AC-3",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real Chromium desktop/mobile browsers, Cloudflare HTTPS assets, and the candidate's shared Pagefind search",
        "negative_control": { "would_fail_if": ["The rendered page is an empty or unstyled shell, or deep-path assets are disconnected.", "Search is a static dialog or canned result, recovery controls are no-ops, or navigation escapes to the initial apex."] },
        "evidence": { "artifact_type": "screenshot", "required_capture": true },
        "cases": [
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "user", "steps": ["In real desktop and mobile browser contexts, visit both missing paths; assert the visible 404 heading and site branding against the accepted page.", "Observe root-relative stylesheet requests and applied computed styles; capture and visually inspect 404-desktop.png and 404-mobile.png before navigating away.", "Activate the page's ordinary /components and /registry recovery links, returning to the missing page between actions.", "Open the shared search through the desktop keyboard command and mobile visible trigger, search for conversation, and activate the /components/conversation result."] },
            "end_state": {
              "must_observe": ["Both browser targets display the accepted 404 heading and site branding; stylesheet requests return HTTP 200 with CSS matching the accepted asset manifest and applied styles matching the reviewed presentation.", "Recovery reaches /components and /registry with HTTP 200 and the corresponding visible page headings on the version origin.", "Searching `conversation` produces at least 1 actionable result targeting `/components/conversation`; activating that result loads `/components/conversation` on the recorded version origin with HTTP 200 and exactly 1 visible level-1 heading named `Conversation`.", "404-desktop.png and 404-mobile.png contain the rendered page; review.json records visual inspection of both."],
              "must_not_observe": ["An empty or unstyled error page, broken deep-path stylesheet URLs, or blank screenshots.", "An empty search result list for conversation, an unchanged missing-path URL after activation, or a generic root used as the success oracle."]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "description": "GIVEN the recorded initial apex deployment WHEN candidate verification finishes THEN the same apex deployment remains active and ORI-DEP-003 receives the exact verified version identity.",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/custom-404.remote.spec.ts",
      "test_function": "ORI-DEP-002 AC-4 apex-preserved-handoff",
      "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-4 apex-preserved-handoff'",
      "test_tier": "integration",
      "verification_service": "Real Cloudflare deployment and version APIs through Wrangler and public https://rnraielements.com",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "maps_to_ac": null,
      "tdd_state": "none",
      "scenario": {
        "id": "SC-ORI-DEP-002-4",
        "ac_ref": "AC-4",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "Real Cloudflare deployment and version APIs through Wrangler and public https://rnraielements.com",
        "negative_control": { "would_fail_if": ["Upload silently promotes the candidate, replaces domain ownership, or the verification is disconnected from the current deployment API.", "The handoff is empty, stale, or points to a second artifact instead of the tested version."] },
        "evidence": { "artifact_type": "api_response", "required_capture": true },
        "cases": [
          {
            "start_ref": "accepted_version_run",
            "action": { "actor": "cli_user", "steps": ["Query deployments after upload and again after browser verification; compare active deployment identity and version allocations with the pre-upload baseline.", "Fetch the existing apex registry URLs from ORI-DEP-001's receipt over ordinary trusted HTTPS and compare their bytes with that receipt and the accepted manifest.", "Bind the verified version ID, URL, artifact hashes, test identities, and evidence hashes in the handoff; perform no further upload or promotion."] },
            "end_state": {
              "must_observe": ["The before/after active deployment ID and version allocations are identical; the initial deployment still serves https://rnraielements.com.", "The receipt-listed public registry URLs return HTTP 200 and bytes whose SHA-256 values match both the prerequisite release and the accepted manifest.", "release.json hands ORI-DEP-003 the same nonempty version ID and URL exercised by AC-1 through AC-3."],
              "must_not_observe": ["An absent baseline, empty handoff, changed deployment owner, or candidate traffic allocation at the apex.", "A second uploaded artifact, domain reattachment, trigger deployment, or mismatched registry bytes."]
            }
          }
        ]
      }
    },
    { "id": "TC-1", "type": "test_criterion", "description": "The real version, accepted hashes, and guarded configuration agree; missing receipts and untrusted origins are rejected.", "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-1 accepted-version-and-origin'", "maps_to_ac": "AC-1" },
    { "id": "TC-2", "type": "test_criterion", "description": "Both direct missing-path responses are HTTP 404 text/html with accepted bytes and no redirects.", "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-2 direct-branded-404'", "maps_to_ac": "AC-2" },
    { "id": "TC-3", "type": "test_criterion", "description": "Both browser targets show styled branding and complete link/search recovery, with inspected screenshots.", "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-3 rendered-recovery'", "maps_to_ac": "AC-3" },
    { "id": "TC-4", "type": "test_criterion", "description": "The initial apex identity and registry bytes remain unchanged, and the handoff identifies the tested version.", "verify": "pnpm exec playwright test --config tests/sprint-05-orient-search/cloudflare.playwright.config.ts tests/sprint-05-orient-search/custom-404.remote.spec.ts --grep 'ORI-DEP-002 AC-4 apex-preserved-handoff'", "maps_to_ac": "AC-4" }
  ]
}
-->
</details>
