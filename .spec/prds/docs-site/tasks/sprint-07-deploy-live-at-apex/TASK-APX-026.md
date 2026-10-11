================================================================================
TASK: APX-026 - Add Dependabot for github-actions so SHA pins get reviewed updates
================================================================================

TASK_TYPE:  INFRA
STATUS:     Completed

Commit: 5afb481307fa7b4ac19df4525e989fb0ae6eb0ab
PRIORITY:   P2
POINTS:     1
AGENT:      planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROPOSED BY: ghactions-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: the deploy job holds the path to a Cloudflare deploy credential, and its third-party actions are pinned to commit SHAs. A pinned SHA never updates itself, so without an update channel the pins rot silently.

Why it matters: an outdated action is a supply-chain risk on the job that can publish to production. Reviewed weekly bump PRs keep the pins current without floating tags.

Current: no `.github/dependabot.yml` exists. Existing ci.yml actions are floating `@v4` tags, which are outside this task.

Desired: a minimal Dependabot config for the `github-actions` ecosystem only, weekly, that covers every action in `.github/workflows`. It adds no npm entry, because dependency versions follow Expo SDK 57's resolver.

## Critical Constraints
MUST:
- MUST contain `version: 2` and exactly one `updates` entry with package-ecosystem github-actions, directory `/` and schedule interval weekly.
- MUST leave every action reference in .github/workflows resolvable to an existing GitHub repo, so Dependabot can open its PRs.
NEVER:
- NEVER add an npm, pip, docker or any other ecosystem to the file.
- NEVER edit anything under .github/workflows, and NEVER change the existing floating @v4 references here.
STRICTLY:
- STRICTLY treat the first real Dependabot PR after the human syncs main to GitHub as the final proof. It cannot exist before then, so this task's tests prove the file is well formed and covers every workflow action.

## Specification
Objective: Give the SHA-pinned actions a reviewed update channel.
Success state: .github/dependabot.yml exists with exactly one weekly github-actions entry at `/`. The spec confirms the shape, rejects an extra ecosystem and malformed variants, and confirms every action in the workflows exists on GitHub.

Provides:
- .github/dependabot.yml with exactly one update entry for the github-actions ecosystem at directory `/`, weekly, so SHA-pinned actions are bumped through reviewed PRs (Dependabot rewrites the SHA and its `# vX.Y.Z` comment)

Consumes:
- the SHA-pinned actions added to ci.yml by APX-022 and APX-023
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts (written by APX-022, read only)
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (APX-006)

Boundary contracts:
- Supply-chain seam: every third-party action in .github/workflows is reachable by Dependabot, so a pin never rots silently on the job that holds the Cloudflare deploy token.
- The config covers the github-actions ecosystem only. It adds no npm or other ecosystem, because dependency versions follow Expo SDK 57's resolver and not npm latest.

Capabilities: CAP-DEP-01. PRD refs: 11-technical-requirements/01 posture (supply chain); UC-DELIV-02 AC-1.

## Acceptance Criteria
### AC-1: The config has exactly one weekly github-actions entry at the repo root
  GIVEN: the real .github/dependabot.yml
  WHEN:  it is parsed with the real YAML parser
  THEN:  version equals 2 and updates has exactly one entry whose package-ecosystem equals github-actions, directory equals `/`, and schedule.interval equals weekly
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts
  TEST_FUNCTION: APX-026-config-shape
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape
  TEST_TIER: integration
  VERIFICATION_SERVICE: real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the file is missing","the interval is daily or monthly","the directory is not `/`","there is more than one update entry","the dependabot.yml file is deleted"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_dependabot_yml","action":{"actor":"spec","steps":["parse .github/dependabot.yml","read version and the updates array"]},"end_state":{"must_observe":["version equals 2","updates length equals 1","updates[0].package-ecosystem equals github-actions","updates[0].directory equals /","updates[0].schedule.interval equals weekly"],"must_not_observe":["a missing file","a second update entry","an empty updates array (0 entries)"]}}]}
```

### AC-2: An extra ecosystem is rejected
  GIVEN: a copy of the real config with an added npm update entry
  WHEN:  the spec's shape checker runs on the copy
  THEN:  the checker throws an error containing `npm`
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts
  TEST_FUNCTION: APX-026-rejects-extra-ecosystem
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-extra-ecosystem
  TEST_TIER: integration
  VERIFICATION_SERVICE: real dependabot.yml copy on the real filesystem, parsed by the system ruby YAML parser
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml copy on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the checker only reads the first entry","the checker ignores the ecosystem name","the checker omits every entry after the first"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"dependabot_copy_with_npm","action":{"actor":"spec","steps":["run the shape checker on the copy that adds an npm entry"]},"end_state":{"must_observe":["the checker throws for the copy with an `npm` entry","the error message contains `npm`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}
```

### AC-3: Every workflow action exists on GitHub and the config covers the workflows directory
  GIVEN: every `uses: owner/repo@ref` reference in .github/workflows/*.yml, and a made-up repo GitHub answers with 404
  WHEN:  each owner/repo is looked up with gh api repos/<owner>/<repo>
  THEN:  every real reference resolves with HTTP 200, all workflow files sit directly in .github/workflows (which directory `/` covers), and the made-up repo is rejected by the checker
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts
  TEST_FUNCTION: APX-026-covers-workflow-actions
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions
  TEST_TIER: integration
  VERIFICATION_SERVICE: real GitHub REST API through the gh CLI, real workflow files
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI, real workflow files","topology":"single-node","negative_control":{"would_fail_if":["an action reference points at a repo that does not exist","a workflow lives outside .github/workflows","the checker treats a 404 as success","the gh api lookup is replaced by a hardcoded 200 stub"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_workflow_actions","action":{"actor":"spec","steps":["extract every non-local uses: reference from .github/workflows/*.yml","call gh api repos/<owner>/<repo> for each distinct repo"]},"end_state":{"must_observe":["at least `6` repos are checked: `actions/checkout`, `actions/upload-artifact`, `actions/download-artifact`, `actions/setup-node`, `pnpm/action-setup`, `cloudflare/wrangler-action`","each returns HTTP 200","every workflow file path starts with `.github/workflows/`"],"must_not_observe":["a 404 for a real reference","a workflow file outside .github/workflows","an empty action list (0 repos found in the workflows)"]}},{"start_ref":"real_workflow_actions","action":{"actor":"spec","steps":["run the same existence check on hackerpug-ai/apx-026-no-such-repo"]},"end_state":{"must_observe":["the checker throws for `hackerpug-ai/apx-026-no-such-repo`","the error names hackerpug-ai/apx-026-no-such-repo"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}
```

### AC-4: A misspelled ecosystem or broken YAML is rejected
  GIVEN: a copy with package-ecosystem misspelled as github-action and a copy with an invalid tab indent
  WHEN:  the shape checker runs on each
  THEN:  the misspelled copy throws an error containing `github-action`, and the broken copy throws a YAML parse error
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts
  TEST_FUNCTION: APX-026-rejects-malformed-config
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config
  TEST_TIER: integration
  VERIFICATION_SERVICE: real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser
  SURFACE_POLICY: null
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the checker matches ecosystems by prefix","the checker swallows a parse error","the checker is a no-op stub that never parses the YAML"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"dependabot_copy_misspelled","action":{"actor":"spec","steps":["run the shape checker on the misspelled copy","run it on the tab-indented copy"]},"end_state":{"must_observe":["the first call throws with `github-action`","the second call throws an error from the YAML parser (a `Psych` syntax error)"],"must_not_observe":["either call passing","no thrown error from either call (0 errors)"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The real config's updates array has exactly one entry | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape |
| TC-2 | The real config's schedule interval equals weekly | AC-1 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape |
| TC-3 | The shape checker throws naming `npm` for a copy with an npm update entry | AC-2 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-extra-ecosystem |
| TC-4 | Every distinct action repo referenced in the workflows resolves with HTTP 200 on GitHub | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions |
| TC-5 | The existence checker throws naming a repo that GitHub answers with 404 | AC-3 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions |
| TC-6 | The shape checker throws naming `github-action` for a misspelled ecosystem | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config |
| TC-7 | The shape checker throws a parse error for a config with an invalid tab indent | AC-4 | CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config |

## Reading List
- .github/workflows/ci.yml (all): the action references Dependabot must cover, after APX-022 and APX-023
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts (all): the ruby YAML parse helper written by APX-022, read only
- AGENTS.md (lines Tech Stack): why npm stays out: the Expo SDK 57 pin table

## Guardrails
WRITE-ALLOWED:
- .github/dependabot.yml (NEW)
- tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts (NEW)
WRITE-PROHIBITED:
- .github/workflows/** - workflow edits belong to APX-022 and APX-023
- package.json - no dependency changes
- tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts - written by APX-022, read only, never edit
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only
- tests/sprint-05-orient-search/** - other sprint lane

## Design
References: SPRINT.md dark tasks list; 11-technical-requirements/01 posture
Pattern: version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly (GitHub Dependabot configuration reference for the github-actions ecosystem)
Anti-pattern: Adding an npm entry, which would propose latest-tag bumps that break the Expo SDK 57 pin table.

## Verification Gates
- typecheck: `pnpm typecheck` - Exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts` - Exit 0
- complexity: `pnpm check:fallow` - Exit 0
- tests: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts` - Exit 0 with four passing tests, in a shell with real gh authentication

## Agent Instructions
TDD_MODE is skipped (INFRA), so there is no RED to GREEN ceremony. The real-services proof still applies to every AC.
1. Write `.github/dependabot.yml` with `version: 2` and exactly one `updates` entry: `package-ecosystem: github-actions`, `directory: /`, `schedule.interval: weekly`.
2. Write the spec with the ruby YAML parse helper from `support/workflow-yaml.ts` (APX-022, read only). Every negative control runs on an OS-temp copy of the real config, and the repo file is never mutated.
3. For AC-3, list every non-local `uses: owner/repo@ref` in `.github/workflows/*.yml`, then call `gh api repos/<owner>/<repo>` for each distinct repo. Also check the fake repo `hackerpug-ai/apx-026-no-such-repo` is rejected.
4. Run every gate. Commit on the task's worktree. Do not land anything yourself.

## Orchestrator Verification Protocol
The orchestrator re-runs typecheck, lint, complexity and the four-test gate with real gh authentication. It reads `.github/dependabot.yml` and confirms one github-actions entry and no other ecosystem. It confirms `git diff` touches only the two WRITE-ALLOWED files and that no workflow file changed.

## Evidence Gates
- Playwright output showing four passing tests.
- The file `.github/dependabot.yml` with one weekly github-actions entry.
- `gh api` output showing each workflow action repo resolves with HTTP 200.
- Final proof after the human syncs main: the first Dependabot PR that bumps a pinned action.

## Review Criteria
REVIEWER CHECKS:
- The config has `version: 2` and exactly one update entry for `github-actions` at directory `/`, weekly.
- No npm, pip, docker or other ecosystem appears anywhere in the file.
- No file under `.github/workflows` changed, and the existing floating `@v4` references are untouched.
- The negative controls use OS-temp copies and never mutate the repo's real config.

## Dependencies
Depends on: ['APX-006', 'APX-023']
Blocks:     []

## Notes
- Dark task: repo-config upkeep with no gate-visible surface. Its tests prove the file is well formed and covers every workflow action. The final proof is the first Dependabot PR after the human syncs main to GitHub, and that cannot exist before then.
- Human-owned preconditions for the sprint, stated plainly: the `CLOUDFLARE_API_TOKEN` repo secret, the sync PR that lands local main (605 commits ahead on 2026-09-29) on GitHub main, the `production` environment, and the Cloudflare zone-edit token scope. This task's tests need none of them, because they read local files and public GitHub metadata. Sprint 05's ORI-CI-003 and ORI-DEP-003 are also preconditions of the sprint, never dependencies.
- The specs run in the shared live lane (`live.playwright.config.ts`, owned by APX-006). Root vitest and the root playwright config never collect `*.remote.spec.ts`.
- Dependabot rewrites the SHA and its `# vX.Y.Z` comment together, which is why APX-022 and APX-023 require that comment on every pin.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":[".github/dependabot.yml (NEW)","tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts (NEW)",".tmp/APX-026/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":[".github/workflows/** - workflow edits belong to APX-022 and APX-023","package.json - no dependency changes","tests/sprint-07-deploy-live-at-apex/support/workflow-yaml.ts - written by APX-022, read only, never edit","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - owned by APX-006, read only","tests/sprint-05-orient-search/** - other sprint lane"]},"version":"1","task_id":"APX-026","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_dependabot_yml":{"description":"The repo's real .github/dependabot.yml at HEAD, parsed by the system ruby YAML parser.","seed_method":"cli","records":[".github/dependabot.yml"]},"dependabot_copy_with_npm":{"description":"An OS-temp copy of the real config with a second update entry for package-ecosystem npm.","seed_method":"cli","records":["copy of dependabot.yml plus an npm entry"]},"dependabot_copy_misspelled":{"description":"An OS-temp copy of the real config with the ecosystem misspelled as github-action, and a second copy with a tab character breaking the YAML.","seed_method":"cli","records":["copy with package-ecosystem: github-action","copy with an invalid tab indent"]},"real_workflow_actions":{"description":"Every `uses: owner/repo@ref` reference in the real .github/workflows/*.yml files, including actions/checkout, actions/upload-artifact, actions/download-artifact, actions/setup-node, pnpm/action-setup and cloudflare/wrangler-action, plus a made-up repo hackerpug-ai/apx-026-no-such-repo that GitHub answers with 404.","seed_method":"public_api","records":[".github/workflows/*.yml uses: lines","gh api repos/hackerpug-ai/apx-026-no-such-repo returns 404"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the real .github/dependabot.yml WHEN it is parsed with the real YAML parser THEN version equals 2 and updates has exactly one entry whose package-ecosystem equals github-actions, directory equals `/`, and schedule.interval equals weekly","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-config-shape","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape","test_tier":"integration","verification_service":"real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the file is missing","the interval is daily or monthly","the directory is not `/`","there is more than one update entry","the dependabot.yml file is deleted"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_dependabot_yml","action":{"actor":"spec","steps":["parse .github/dependabot.yml","read version and the updates array"]},"end_state":{"must_observe":["version equals 2","updates length equals 1","updates[0].package-ecosystem equals github-actions","updates[0].directory equals /","updates[0].schedule.interval equals weekly"],"must_not_observe":["a missing file","a second update entry","an empty updates array (0 entries)"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN a copy of the real config with an added npm update entry WHEN the spec's shape checker runs on the copy THEN the checker throws an error containing `npm`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-rejects-extra-ecosystem","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-extra-ecosystem","test_tier":"integration","verification_service":"real dependabot.yml copy on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml copy on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the checker only reads the first entry","the checker ignores the ecosystem name","the checker omits every entry after the first"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"dependabot_copy_with_npm","action":{"actor":"spec","steps":["run the shape checker on the copy that adds an npm entry"]},"end_state":{"must_observe":["the checker throws for the copy with an `npm` entry","the error message contains `npm`"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN every `uses: owner/repo@ref` reference in .github/workflows/*.yml, and a made-up repo GitHub answers with 404 WHEN each owner/repo is looked up with gh api repos/<owner>/<repo> THEN every real reference resolves with HTTP 200, all workflow files sit directly in .github/workflows (which directory `/` covers), and the made-up repo is rejected by the checker","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-covers-workflow-actions","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI, real workflow files","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI, real workflow files","topology":"single-node","negative_control":{"would_fail_if":["an action reference points at a repo that does not exist","a workflow lives outside .github/workflows","the checker treats a 404 as success","the gh api lookup is replaced by a hardcoded 200 stub"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"real_workflow_actions","action":{"actor":"spec","steps":["extract every non-local uses: reference from .github/workflows/*.yml","call gh api repos/<owner>/<repo> for each distinct repo"]},"end_state":{"must_observe":["at least `6` repos are checked: `actions/checkout`, `actions/upload-artifact`, `actions/download-artifact`, `actions/setup-node`, `pnpm/action-setup`, `cloudflare/wrangler-action`","each returns HTTP 200","every workflow file path starts with `.github/workflows/`"],"must_not_observe":["a 404 for a real reference","a workflow file outside .github/workflows","an empty action list (0 repos found in the workflows)"]}},{"start_ref":"real_workflow_actions","action":{"actor":"spec","steps":["run the same existence check on hackerpug-ai/apx-026-no-such-repo"]},"end_state":{"must_observe":["the checker throws for `hackerpug-ai/apx-026-no-such-repo`","the error names hackerpug-ai/apx-026-no-such-repo"],"must_not_observe":["the checker passing","no thrown error (0 errors from the checker)"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN a copy with package-ecosystem misspelled as github-action and a copy with an invalid tab indent WHEN the shape checker runs on each THEN the misspelled copy throws an error containing `github-action`, and the broken copy throws a YAML parse error","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-rejects-malformed-config","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config","test_tier":"integration","verification_service":"real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser","topology":"single-node","negative_control":{"would_fail_if":["the checker matches ecosystems by prefix","the checker swallows a parse error","the checker is a no-op stub that never parses the YAML"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"dependabot_copy_misspelled","action":{"actor":"spec","steps":["run the shape checker on the misspelled copy","run it on the tab-indented copy"]},"end_state":{"must_observe":["the first call throws with `github-action`","the second call throws an error from the YAML parser (a `Psych` syntax error)"],"must_not_observe":["either call passing","no thrown error from either call (0 errors)"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The real config's updates array has exactly one entry","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-config-shape","test_tier":"integration","verification_service":"real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The real config's schedule interval equals weekly","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-config-shape","test_tier":"integration","verification_service":"real dependabot.yml on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-config-shape","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The shape checker throws naming `npm` for a copy with an npm update entry","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-rejects-extra-ecosystem","test_tier":"integration","verification_service":"real dependabot.yml copy on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-extra-ecosystem","maps_to_ac":"AC-2"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"Every distinct action repo referenced in the workflows resolves with HTTP 200 on GitHub","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-covers-workflow-actions","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI, real workflow files","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions","maps_to_ac":"AC-3"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The existence checker throws naming a repo that GitHub answers with 404","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-covers-workflow-actions","test_tier":"integration","verification_service":"real GitHub REST API through the gh CLI, real workflow files","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-covers-workflow-actions","maps_to_ac":"AC-3"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"The shape checker throws naming `github-action` for a misspelled ecosystem","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-rejects-malformed-config","test_tier":"integration","verification_service":"real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config","maps_to_ac":"AC-4"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"The shape checker throws a parse error for a config with an invalid tab indent","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts","test_function":"APX-026-rejects-malformed-config","test_tier":"integration","verification_service":"real dependabot.yml copies on the real filesystem, parsed by the system ruby YAML parser","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts --grep APX-026-rejects-malformed-config","maps_to_ac":"AC-4"}]}
-->

## Handoff

```json
{"task":"APX-026","commit_sha":"5afb481307fa7b4ac19df4525e989fb0ae6eb0ab","done":"Landed .github/dependabot.yml and tests/sprint-07-deploy-live-at-apex/dependabot-config.remote.spec.ts, with cycle evidence under .tmp/APX-026/cycle-1/. Approved at 5afb481307fa7b4ac19df4525e989fb0ae6eb0ab and merged to main as d105cb6b6a70ebb694c0775250b8fc3a4eca896f. The config is Dependabot version 2 with one weekly github-actions entry at /. The spec parses that file with system Ruby, rejects OS-temp npm, misspelled, and tab-indented copies without changing the repo file, and resolves every non-local workflow action through gh api. Four Playwright tests passed.","deviations":[],"concerns":[],"findings":[],"scope_impact":[],"feedback":[]}
```
