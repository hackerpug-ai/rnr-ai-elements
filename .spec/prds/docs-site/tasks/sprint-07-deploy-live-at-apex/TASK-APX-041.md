================================================================================
TASK: APX-041 - Add the real-CLI round trip into fresh Expo SDK 57 apps, both engines, with the exact alias-transform assertion
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P1
POINTS:     3
AGENT:      planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROPOSED BY: react-native-reusables-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md) · Wave C

---
## Background
**Problem.** The original Sprint 07 gate (real CLI add from the live domain, both engines, `tsc` clean) already passes, but no test locks it in. Its wording, "byte-equal to the served JSON", was also wrong: the CLI rewrites the `@/registry/{engine}/` imports by design.

**Why it matters.** The install command is the product's front door. A regression in the served JSON, the alias rewrite, or a registry dependency would break every integrator silently.

**Current.** Observed 2026-09-29: the literal add exits 0 on both engines and creates 5 files; `conversation.tsx` differs from the served content only in lines 1-4 and `empty.tsx` only in lines 1, 2 and 4; the consumer's TypeScript 6.0.3 exits 0.

**Desired.** The flow spec runs the literal command into fresh Expo SDK 57 apps per engine and asserts the exact alias transform and a clean compile, as a regression test that is green today.

Capabilities: CAP-INST-01. PRD: UC-DELIV-03 AC-3; T-DELIV-013; CAP-INST-01; real-CLI job (both engines, tsc --noEmit).
Boundary contracts:
- Alias transform: the lines that differ between served files[0].content and the installed file are exactly the served lines that contain `@/registry/{engine}/`. The prefix `…/components/ui/` maps to components.json aliases.ui and `…/lib/utils` maps to aliases.utils. The mapped served content equals the installed bytes, and no `@/registry/` survives.
- Consumer allowlist: TEMPLATE_FILES[engine] equals `git ls-files packages/docs-snippets/{engine}` minus app/index.tsx, and each consumer root is outside REPO_ROOT.
- Compile: the consumer's own TypeScript 6.0.x `tsc --noEmit` exits 0 with no TS2307.

## Critical Constraints
MUST:
- MUST reuse tests/sprint-05-orient-search/support/quickstart-consumer.ts (REPO_ROOT, run, sha256, resolveCliVersion, compileConsumer, cleanupConsumer). The ONLY helper edit is `const TEMPLATE_FILES` → `export const TEMPLATE_FILES`, declared in supersedes.
- MUST build each consumer in a fresh mkdtemp root under os.tmpdir(), outside REPO_ROOT, and copy exactly TEMPLATE_FILES[engine]. Hold an open lease fd inside the root for the whole run. Fail with `consumer root vanished: <path>` if the root is missing before any phase.
- MUST run the literal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/conversation.json` in the consumer root. Derive the alias map from that consumer's components.json (aliases.ui, aliases.utils).
- MUST do all consumer preparation (copy, `pnpm install`, `npx expo install`, CLI add) in the serial describe's beforeAll, so any single APX-041 grep reproduces the full install. Append the 5 APX-041 tokens to APX-040's required-test list. Add the CLI version, created files, changed lines and tsc exits to the run.json receipt.
NEVER:
- NEVER pass --yes or --overwrite to the CLI, and never use a local, rewritten or preview registry URL. Never copy repo component sources into a consumer or resolve consumer imports into the monorepo.
- NEVER ignore, normalize or whitespace-strip the diff between the served and installed content.
- NEVER retry the CLI add, tsc or any assertion. Retry `pnpm install` at most once, in a brand-new root, and only when the first failure output contains `react-native-web`. Record that output's tail in the receipt.
- NEVER reuse a populated consumer or leave consumer roots behind (call cleanupConsumer in afterAll).
STRICTLY:
- STRICTLY confirm that APX-040's module-top `delete process.env.NODE_ENV` runs before every APX-041 spawn. Playwright exports NODE_ENV=test, which breaks Expo children.
- STRICTLY set test.describe.configure({ mode: 'serial', timeout: 50 * 60_000 }) on the consumer describe. Set per-test timeouts of 60 s or less on AC-3 and AC-5.
- STRICTLY replace RED evidence with a mutation check. tdd_mode is skipped because the behavior is live today, and a RED against the start state would mean breaking production. The reviewer changes the expected aliases.ui target to `@/ui`: the APX-041-AC-2-alias-transform grep must report `1 failed`, then `1 passed` after the revert.

## Specification
Objective: Lock in the original Sprint 07 gate as a regression test. The site's literal CLI add of conversation.json into a fresh Expo SDK 57 app per engine exits 0, writes files identical to the served content except the CLI's alias rewrite, and compiles.
Success state: `--grep APX-041` reports 5 passed. For 2 of 2 engines, the CLI add exits 0 and writes 5 files. conversation.tsx differs only in lines 1-4 and empty.tsx only in lines 1, 2 and 4. tsc exits 0 for both engines. The allowlists hold 12 and 10 files. An absent-package install is not retried.

Fixtures (shared seed data referenced by each START_REF): `live_registry_items`, `committed_templates`, `fresh_consumers`, `absent_package_root`. Their records are in the `fixtures` object of the REQUIREMENT-CONTRACT block at the end of this file.

## Acceptance Criteria
### AC-1: Literal CLI add exits 0 and writes the item with its dependencies
  GIVEN: a fresh consumer per engine built from TEMPLATE_FILES with `pnpm install` and `npx expo install` done
  WHEN:  the consumer runs `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/conversation.json`
  THEN:  the command exits 0 for nativewind and uniwind. Each consumer then holds exactly the 5 non-empty files components/ui/text.tsx, components/ui/icon.tsx, components/ui/button.tsx, components/ui/empty.tsx and components/ai/conversation.tsx. The resolved CLI version is recorded.
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: APX-041-AC-1-cli-add
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-1-cli-add
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real RNR CLI (@latest), live https://rnraielements.com and reactnativereusables.com registries, Expo 57 resolver, real filesystem
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-041-1","use_case_ref":"UC-DELIV-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"real RNR CLI, live registries, Expo 57 resolver","negative_control":{"would_fail_if":["the CLI add is a no-op or skipped, writing 0 files","the consumer was pre-populated by an earlier run","the install hits a local or rewritten registry instead of rnraielements.com"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumers","action":{"actor":"cli_user","steps":["npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json","npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json"]},"end_state":{"must_observe":["CLI exit `0` for 2 of 2 engines","5 files per consumer: `components/ui/text.tsx`, `components/ui/icon.tsx`, `components/ui/button.tsx`, `components/ui/empty.tsx`, `components/ai/conversation.tsx`, each larger than 0 bytes"],"must_not_observe":["0 files under `components/`","a CLI exit other than `0`"]}}]}
```

### AC-2: Installed files equal the served content except the CLI's alias rewrite
  GIVEN: the 2 consumers after AC-1 and the live served conversation.json and empty.json for each engine
  WHEN:  each installed file is compared line by line with its served files[0].content
  THEN:  conversation.tsx differs only in lines 1-4 and empty.tsx only in lines 1, 2 and 4. Each of those lines contains `@/registry/{engine}/` on the served side, and mapping by the consumer's aliases.ui and aliases.utils reproduces the installed line. The fully mapped served content equals the installed bytes for all 4 files, and 0 `@/registry/` occurrences remain.
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: APX-041-AC-2-alias-transform
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-2-alias-transform
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live https://rnraielements.com registry JSON and the real CLI-written consumer files
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-041-2","use_case_ref":"UC-DELIV-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"live registry JSON and CLI-written files","negative_control":{"would_fail_if":["the diff is normalized or ignored (whitespace or line-ending stripping)","the alias map is hardcoded instead of read from components.json","the CLI changed or dropped a non-import line and the test did not compare it","the served content is empty"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_registry_items","action":{"actor":"cli_user","steps":["fetch each served files[0].content and diff it against the installed file in each consumer"]},"end_state":{"must_observe":["conversation.tsx: exactly 4 changed lines (1-4), installed as `@/components/ui/button`, `@/components/ui/empty`, `@/components/ui/icon`, `@/lib/utils`","empty.tsx: exactly 3 changed lines (1, 2, 4), installed as `@/components/ui/text`, `@/lib/utils`, `@/components/ui/icon`","mapped served content equals installed bytes for 4 of 4 files"],"must_not_observe":["any `@/registry/` occurrence in an installed file","a changed line whose served side lacks `@/registry/`","an empty installed file (0 bytes)"]}}]}
```

### AC-3: Consumer allowlist matches the committed template and stays outside the monorepo
  GIVEN: the committed templates at HEAD and the exported TEMPLATE_FILES
  WHEN:  the test compares TEMPLATE_FILES[engine] with `git ls-files packages/docs-snippets/{engine}` minus app/index.tsx and checks the consumer root prefix
  THEN:  nativewind lists 12 equal entries and uniwind lists 10 equal entries. Neither includes app/index.tsx, and each consumer root begins with os.tmpdir() and not with REPO_ROOT.
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: APX-041-AC-3-template-allowlist
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-3-template-allowlist
  TEST_TIER: integration
  VERIFICATION_SERVICE: local git index (git ls-files) and the sprint-05 helper module
  SURFACE_POLICY: null
  SCENARIO:
```json
{"id":"SC-APX-041-3","use_case_ref":"UC-DELIV-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","topology":"single-node","verification_service":"local git index","negative_control":{"would_fail_if":["the allowlist drifts from the template, so a new tracked file is not copied","the copy includes app/index.tsx, which imports `@/shared/quickstart-screen` and breaks tsc","the consumer root sits inside the monorepo, so imports resolve into packages/","the allowlist is hardcoded in the spec instead of imported from the helper"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"committed_templates","action":{"actor":"cli_user","steps":["git ls-files packages/docs-snippets/nativewind","git ls-files packages/docs-snippets/uniwind","compare with TEMPLATE_FILES after removing app/index.tsx"]},"end_state":{"must_observe":["nativewind: 12 of 12 entries equal","uniwind: 10 of 10 entries equal"],"must_not_observe":["`app/index.tsx` in either allowlist","a consumer root beginning with the REPO_ROOT path","an empty allowlist (0 entries)"]}}]}
```

### AC-4: Each consumer compiles with its own TypeScript
  GIVEN: the 2 consumers after AC-1
  WHEN:  `pnpm exec tsc --noEmit` runs in each consumer root
  THEN:  each run exits 0 with TypeScript 6.0.x from the consumer's node_modules and 0 TS2307 diagnostics
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: APX-041-AC-4-consumer-compiles
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-4-consumer-compiles
  TEST_TIER: e2e
  VERIFICATION_SERVICE: the consumer's own TypeScript compiler over CLI-written files
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"id":"SC-APX-041-4","use_case_ref":"UC-DELIV-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"consumer TypeScript 6.0.x","negative_control":{"would_fail_if":["the rewritten imports point at paths the CLI did not write","tsc runs from the monorepo root instead of the consumer","a stubbed or cached compile result is reported"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"fresh_consumers","action":{"actor":"cli_user","steps":["pnpm exec tsc --noEmit (nativewind consumer)","pnpm exec tsc --noEmit (uniwind consumer)"]},"end_state":{"must_observe":["tsc exit `0` in 2 of 2 consumers","TypeScript version `6.0.x`","0 `TS2307` diagnostics"],"must_not_observe":["`TS2307: Cannot find module`","tsc exit `2`","no `tsc` process run (empty compile log)"]}}]}
```

### AC-5: An install failure that does not name react-native-web is not retried
  GIVEN: a scratch root whose only dependency, apx041-definitely-absent-package-2026@1.0.0, does not exist on npm
  WHEN:  the lane's install phase runs `pnpm install` in that root
  THEN:  pnpm exits non-zero with `ERR_PNPM` in its output. The phase reports 1 attempt and retried false, and the test fails the phase instead of retrying.
  TDD_STATE: N/A
  FLOW_REF: null
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts
  TEST_FUNCTION: APX-041-AC-5-install-failure-not-retried
  VERIFY: CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-5-install-failure-not-retried
  TEST_TIER: integration
  VERIFICATION_SERVICE: real pnpm 10 against the public npm registry
  SURFACE_POLICY: null
  SCENARIO:
```json
{"id":"SC-APX-041-5","use_case_ref":"UC-DELIV-03","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","topology":"single-node","verification_service":"pnpm 10 and the public npm registry","negative_control":{"would_fail_if":["the retry classifier retries every install failure, masking real breakage","install failures are swallowed into an empty success"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"absent_package_root","action":{"actor":"cli_user","steps":["run the lane's install phase (`pnpm install`) in the scratch root"]},"end_state":{"must_observe":["pnpm exit other than `0` with `ERR_PNPM` in the output","attempts `1`, retried `false`"],"must_not_observe":["attempts `2`","install exit `0`"]}}]}
```

## Test Criteria
Verify = `<base> --grep <selector>`; full commands are in the contract block.
- `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts`

| ID | Statement | Maps to | Verify |
|----|-----------|---------|--------|
| TC-1 | The literal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/conversation.json` exits 0 in both the nativewind and the uniwind consumer. | AC-1 | `--grep APX-041-AC-1-cli-add` |
| TC-2 | Each consumer holds exactly the 5 named component files, each larger than 0 bytes, after the add. | AC-1 | `--grep APX-041-AC-1-cli-add` |
| TC-3 | The changed lines are exactly the served lines containing `@/registry/{engine}/`: 4 in conversation.tsx and 3 in empty.tsx, per engine. | AC-2 | `--grep APX-041-AC-2-alias-transform` |
| TC-4 | The served content with the consumer's components.json alias map applied equals the installed bytes for all 4 files, leaving 0 `@/registry/` occurrences. | AC-2 | `--grep APX-041-AC-2-alias-transform` |
| TC-5 | TEMPLATE_FILES equals `git ls-files packages/docs-snippets/{engine}` minus app/index.tsx for each engine (12 nativewind entries, 10 uniwind entries). | AC-3 | `--grep APX-041-AC-3-template-allowlist` |
| TC-6 | Each consumer root path lies outside REPO_ROOT. | AC-3 | `--grep APX-041-AC-3-template-allowlist` |
| TC-7 | `pnpm exec tsc --noEmit` exits 0 with 0 `TS2307` diagnostics in each of the 2 consumers. | AC-4 | `--grep APX-041-AC-4-consumer-compiles` |
| TC-8 | The install phase reports 1 attempt after a `pnpm install` failure whose output contains `ERR_PNPM` and lacks `react-native-web`. | AC-5 | `--grep APX-041-AC-5-install-failure-not-retried` |

## Reading List
- `tests/sprint-05-orient-search/support/quickstart-consumer.ts` (36-80, 123-160, 233-260): REPO_ROOT, TEMPLATE_FILES (the one line to export), sha256, run (inherits process.env), resolveCliVersion, cleanupConsumer, compileConsumer
- `tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts`: APX-040's env hygiene, required-test list and run.json receipt writer to extend
- `packages/docs-snippets/commands/nativewind.sh`: the literal recipe order: pnpm install, npx expo install, CLI add
- `packages/docs-snippets/nativewind/components.json`: aliases.ui and aliases.utils that drive the rewrite (uniwind's is identical apart from tailwind.config)
- `.spec/scenarios/UC-DELIV-03/live-registry-round-trip.scenario.md`: the flow's visible expected outputs
- `~/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md` (1-40): $TMPDIR scratch plus the reaper, which keeps roots that lsof shows are held (hence the lease fd)

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts (MODIFY)
- tests/sprint-05-orient-search/support/quickstart-consumer.ts (MODIFY)
WRITE-PROHIBITED:
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns the shared lane
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/run.json - APX-042 records the green run
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-live-registry-round-trip/proof.red - APX-040's RED proof
- tests/sprint-05-orient-search/quickstart-consumer-install.test.ts - earlier lane, unchanged
- tests/sprint-05-orient-search/completed-site.remote.spec.ts - ORI-DEP-003
- tests/sprint-05-orient-search/evidence/** - earlier-lane evidence
- apps/docs/** - edge config belongs to other lenses
- .github/workflows/** - ghactions lens
- public/r/** - generated registry
- packages/registry/** - product source
- packages/docs-snippets/** - committed templates, read only
- playwright.config.ts - root config
- vitest.config.ts - root config
- .env - credential file
SUPERSEDES:
- tests/sprint-05-orient-search/support/quickstart-consumer.ts

## Design
References: SPRINT.md gate steps 14-16; .spec/scenarios/UC-DELIV-03/live-registry-round-trip.scenario.md; .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md CAP-INST-01
- Test layout: one serial describe titled with the flow id, holding AC-1, AC-2 and AC-4 behind a shared beforeAll. AC-3 and AC-5 sit outside it, so their greps do not trigger a 20-minute install.
- Every APX-041 title carries `FLOW-DELIV-03-live-registry-round-trip`, so the locked run_cmd runs all 5.
Pattern (from live observation 2026-09-29: `diff` of served vs installed conversation.tsx printed exactly one hunk `1,4c1,4` for both engines):
```ts
const map = (line: string) => line.replace(`@/registry/${engine}/components/ui/`, `${aliases.ui}/`).replace(`@/registry/${engine}/lib/utils`, aliases.utils);
const changed = served.split('\n').flatMap((l, i) => (l === installed.split('\n')[i] ? [] : [i]));
```
Anti-pattern: Asserting only that conversation.tsx exists or parses, stripping imports before comparing, or calling prepareConsumer (it runs the full 5-item script and hides which add failed).

## Verification Gates
- typecheck: `pnpm typecheck` → exit 0
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts tests/sprint-05-orient-search/support/quickstart-consumer.ts` → exit 0
- complexity: `pnpm check:fallow` → exit 0 with no new finding
- helper edit is export-only: `git diff -U0 main -- tests/sprint-05-orient-search/support/quickstart-consumer.ts` → exactly 1 removed and 1 added line: `const TEMPLATE_FILES` → `export const TEMPLATE_FILES`
- APX-041 all: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041` → 5 passed; no consumer root left under os.tmpdir()
- mutation (reviewer): AC-2 VERIFY → `1 failed` with the expected aliases.ui target changed to `@/ui`, and `1 passed` after the revert

## Agent Instructions
1. tdd_mode is `skipped`: the behavior is live, and a RED against the start state would mean breaking production. Write each test, run it against the live domain, and prove it bites with the mutation check in Verification Gates.
2. Edit the sprint-05 helper first: change `const TEMPLATE_FILES` to `export const TEMPLATE_FILES` and nothing else.
3. AC-3 and AC-5 sit outside the consumer describe and run in under 60 s each. Write and pass them first.
4. AC-1, AC-2 and AC-4 live in one `test.describe` titled with the flow id, with `test.describe.configure({ mode: 'serial', timeout: 50 * 60_000 })` and a `beforeAll` that prepares both consumers and runs the literal CLI add. The beforeAll records exits instead of throwing, except for `consumer root vanished`.
5. Append the 5 APX-041 test tokens to APX-040's required list, and add `cli_version`, created files, changed lines and tsc exits to the receipt.

## Orchestrator Verification Protocol
- VERIFY_GREEN: `CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041` reports `5 passed`.
- Mutation: with the expected `aliases.ui` target changed to `@/ui`, the `APX-041-AC-2-alias-transform` grep reports `1 failed`; after the revert it reports `1 passed`.
- Helper diff: `git diff -U0 main -- tests/sprint-05-orient-search/support/quickstart-consumer.ts` shows exactly 1 removed and 1 added line.
- No consumer root is left under `os.tmpdir()` after the run.

## Evidence Gates
- stdout of the `--grep APX-041` run showing `5 passed`, including the resolved `@latest` CLI version.
- stdout of the mutation run (`1 failed`) and the revert run (`1 passed`).
- The one-line helper diff.

## Review Criteria
- REVIEWER CHECKS: the CLI command is exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/${engine}/conversation.json`, with no `--yes`, no `--overwrite` and no rewritten host.
- REVIEWER CHECKS: the alias map comes from the consumer's own `components.json`, and the comparison has no trim, no whitespace normalization and no line-ending normalization.
- REVIEWER CHECKS: only `pnpm install` can retry, once, in a new root, and only when the first output contains `react-native-web`.
- REVIEWER CHECKS: `delete process.env.NODE_ENV` runs before the first spawn; each consumer root holds an open lease fd and is removed in afterAll.
- REVIEWER CHECKS: `prepareConsumer` is not called (it runs the full five-item script and hides which add failed).
Coding standards: ~/Projects/brain/docs/TESTING-HIERARCHY.md; ~/Projects/brain/docs/FUNCTIONAL-FLOW-COVERAGE.md; ~/Projects/brain/docs/kanban/SCENARIO-CONTRACT-V1.md; ~/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md; ~/Projects/brain/.rosetta/docs/react-native-reusables/blocks-and-registry.md; AGENTS.md

## Dependencies
Depends on: ['APX-040']
Blocks:     ['APX-042']

## Notes
- This test hits the live domain and the public npm and RNR registries. It needs network access, and the consumer describe takes about 20 minutes.
- The trap list from this repo applies. Playwright exports NODE_ENV=test, which breaks Expo children. The $TMPDIR reaper keeps directories that lsof shows are held, hence the lease fd. `pnpm install` occasionally flakes on react-native-web; that is the only retried case.
- Overlap: Sprint 05 ORI-DEP-003 AC-4 proves the same alias transform once, for the publication. If it lands first with an exported comparator, import it instead of adding a second one.
- Gate steps 14, 15 and 16 are the human form of AC-1, AC-2 and AC-4.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-041","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"live_registry_items":{"description":"Served registry items as observed 2026-09-29","seed_method":"recorded_external","records":["conversation.json files[0].content: 4 lines with `@/registry/{engine}/` (components/ui/button, components/ui/empty, components/ui/icon, lib/utils)","empty.json files[0].content: 3 such lines (components/ui/text, lib/utils, components/ui/icon)","conversation registryDependencies: reactnativereusables.com button.json and icon.json, and rnraielements.com empty.json"]},"committed_templates":{"description":"Consumer templates at HEAD","seed_method":"cli","records":["packages/docs-snippets/nativewind: 13 tracked files including app/index.tsx; TEMPLATE_FILES.nativewind has 12","packages/docs-snippets/uniwind: 11 tracked files including app/index.tsx; TEMPLATE_FILES.uniwind has 10","components.json aliases: ui `@/components/ui`, utils `@/lib/utils`"]},"fresh_consumers":{"description":"Two consumers prepared by beforeAll","seed_method":"cli","records":["one mkdtemp root per engine under os.tmpdir(), outside REPO_ROOT, holding only TEMPLATE_FILES[engine]","`pnpm install` and `npx expo install` completed; no components/ directory before the CLI add"]},"absent_package_root":{"description":"Scratch root whose only dependency does not exist on npm","seed_method":"cli","records":["package.json `{\"name\":\"apx041-probe\",\"version\":\"0.0.0\",\"dependencies\":{\"apx041-definitely-absent-package-2026\":\"1.0.0\"}}`"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN a fresh consumer per engine built from TEMPLATE_FILES with `pnpm install` and `npx expo install` done WHEN the consumer runs `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/conversation.json` THEN the command exits 0 for nativewind and uniwind. Each consumer then holds exactly the 5 non-empty files components/ui/text.tsx, components/ui/icon.tsx, components/ui/button.tsx, components/ui/empty.tsx and components/ai/conversation.tsx. The resolved CLI version is recorded.","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-1-cli-add","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-1-cli-add","test_tier":"e2e","verification_service":"real RNR CLI (@latest), live https://rnraielements.com and reactnativereusables.com registries, Expo 57 resolver, real filesystem","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-041-1","use_case_ref":"UC-DELIV-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"real RNR CLI, live registries, Expo 57 resolver","negative_control":{"would_fail_if":["the CLI add is a no-op or skipped, writing 0 files","the consumer was pre-populated by an earlier run","the install hits a local or rewritten registry instead of rnraielements.com"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumers","action":{"actor":"cli_user","steps":["npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json","npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json"]},"end_state":{"must_observe":["CLI exit `0` for 2 of 2 engines","5 files per consumer: `components/ui/text.tsx`, `components/ui/icon.tsx`, `components/ui/button.tsx`, `components/ui/empty.tsx`, `components/ai/conversation.tsx`, each larger than 0 bytes"],"must_not_observe":["0 files under `components/`","a CLI exit other than `0`"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the 2 consumers after AC-1 and the live served conversation.json and empty.json for each engine WHEN each installed file is compared line by line with its served files[0].content THEN conversation.tsx differs only in lines 1-4 and empty.tsx only in lines 1, 2 and 4. Each of those lines contains `@/registry/{engine}/` on the served side, and mapping by the consumer's aliases.ui and aliases.utils reproduces the installed line. The fully mapped served content equals the installed bytes for all 4 files, and 0 `@/registry/` occurrences remain.","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-2-alias-transform","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-2-alias-transform","test_tier":"e2e","verification_service":"live https://rnraielements.com registry JSON and the real CLI-written consumer files","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-041-2","use_case_ref":"UC-DELIV-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"live registry JSON and CLI-written files","negative_control":{"would_fail_if":["the diff is normalized or ignored (whitespace or line-ending stripping)","the alias map is hardcoded instead of read from components.json","the CLI changed or dropped a non-import line and the test did not compare it","the served content is empty"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_registry_items","action":{"actor":"cli_user","steps":["fetch each served files[0].content and diff it against the installed file in each consumer"]},"end_state":{"must_observe":["conversation.tsx: exactly 4 changed lines (1-4), installed as `@/components/ui/button`, `@/components/ui/empty`, `@/components/ui/icon`, `@/lib/utils`","empty.tsx: exactly 3 changed lines (1, 2, 4), installed as `@/components/ui/text`, `@/lib/utils`, `@/components/ui/icon`","mapped served content equals installed bytes for 4 of 4 files"],"must_not_observe":["any `@/registry/` occurrence in an installed file","a changed line whose served side lacks `@/registry/`","an empty installed file (0 bytes)"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the committed templates at HEAD and the exported TEMPLATE_FILES WHEN the test compares TEMPLATE_FILES[engine] with `git ls-files packages/docs-snippets/{engine}` minus app/index.tsx and checks the consumer root prefix THEN nativewind lists 12 equal entries and uniwind lists 10 equal entries. Neither includes app/index.tsx, and each consumer root begins with os.tmpdir() and not with REPO_ROOT.","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-3-template-allowlist","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-3-template-allowlist","test_tier":"integration","verification_service":"local git index (git ls-files) and the sprint-05 helper module","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-041-3","use_case_ref":"UC-DELIV-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","topology":"single-node","verification_service":"local git index","negative_control":{"would_fail_if":["the allowlist drifts from the template, so a new tracked file is not copied","the copy includes app/index.tsx, which imports `@/shared/quickstart-screen` and breaks tsc","the consumer root sits inside the monorepo, so imports resolve into packages/","the allowlist is hardcoded in the spec instead of imported from the helper"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"committed_templates","action":{"actor":"cli_user","steps":["git ls-files packages/docs-snippets/nativewind","git ls-files packages/docs-snippets/uniwind","compare with TEMPLATE_FILES after removing app/index.tsx"]},"end_state":{"must_observe":["nativewind: 12 of 12 entries equal","uniwind: 10 of 10 entries equal"],"must_not_observe":["`app/index.tsx` in either allowlist","a consumer root beginning with the REPO_ROOT path","an empty allowlist (0 entries)"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the 2 consumers after AC-1 WHEN `pnpm exec tsc --noEmit` runs in each consumer root THEN each run exits 0 with TypeScript 6.0.x from the consumer's node_modules and 0 TS2307 diagnostics","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-4-consumer-compiles","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-4-consumer-compiles","test_tier":"e2e","verification_service":"the consumer's own TypeScript compiler over CLI-written files","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-041-4","use_case_ref":"UC-DELIV-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","topology":"single-node","verification_service":"consumer TypeScript 6.0.x","negative_control":{"would_fail_if":["the rewritten imports point at paths the CLI did not write","tsc runs from the monorepo root instead of the consumer","a stubbed or cached compile result is reported"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"fresh_consumers","action":{"actor":"cli_user","steps":["pnpm exec tsc --noEmit (nativewind consumer)","pnpm exec tsc --noEmit (uniwind consumer)"]},"end_state":{"must_observe":["tsc exit `0` in 2 of 2 consumers","TypeScript version `6.0.x`","0 `TS2307` diagnostics"],"must_not_observe":["`TS2307: Cannot find module`","tsc exit `2`","no `tsc` process run (empty compile log)"]}}]}},{"id":"AC-5","type":"acceptance_criterion","description":"GIVEN a scratch root whose only dependency, apx041-definitely-absent-package-2026@1.0.0, does not exist on npm WHEN the lane's install phase runs `pnpm install` in that root THEN pnpm exits non-zero with `ERR_PNPM` in its output. The phase reports 1 attempt and retried false, and the test fails the phase instead of retrying.","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-5-install-failure-not-retried","verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-5-install-failure-not-retried","test_tier":"integration","verification_service":"real pnpm 10 against the public npm registry","surface_policy":null,"unit_test_justified":null,"maps_to_ac":null,"scenario":{"id":"SC-APX-041-5","use_case_ref":"UC-DELIV-03","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","topology":"single-node","verification_service":"pnpm 10 and the public npm registry","negative_control":{"would_fail_if":["the retry classifier retries every install failure, masking real breakage","install failures are swallowed into an empty success"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"absent_package_root","action":{"actor":"cli_user","steps":["run the lane's install phase (`pnpm install`) in the scratch root"]},"end_state":{"must_observe":["pnpm exit other than `0` with `ERR_PNPM` in the output","attempts `1`, retried `false`"],"must_not_observe":["attempts `2`","install exit `0`"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The literal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/conversation.json` exits 0 in both the nativewind and the uniwind consumer.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-1-cli-add","test_tier":"e2e","verification_service":"real RNR CLI (@latest), live https://rnraielements.com and reactnativereusables.com registries, Expo 57 resolver, real filesystem","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-1-cli-add","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"Each consumer holds exactly the 5 named component files, each larger than 0 bytes, after the add.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-1-cli-add","test_tier":"e2e","verification_service":"real RNR CLI (@latest), live https://rnraielements.com and reactnativereusables.com registries, Expo 57 resolver, real filesystem","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-1-cli-add","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The changed lines are exactly the served lines containing `@/registry/{engine}/`: 4 in conversation.tsx and 3 in empty.tsx, per engine.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-2-alias-transform","test_tier":"e2e","verification_service":"live https://rnraielements.com registry JSON and the real CLI-written consumer files","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-2-alias-transform","maps_to_ac":"AC-2"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The served content with the consumer's components.json alias map applied equals the installed bytes for all 4 files, leaving 0 `@/registry/` occurrences.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-2-alias-transform","test_tier":"e2e","verification_service":"live https://rnraielements.com registry JSON and the real CLI-written consumer files","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-2-alias-transform","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"TEMPLATE_FILES equals `git ls-files packages/docs-snippets/{engine}` minus app/index.tsx for each engine (12 nativewind entries, 10 uniwind entries).","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-3-template-allowlist","test_tier":"integration","verification_service":"local git index (git ls-files) and the sprint-05 helper module","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-3-template-allowlist","maps_to_ac":"AC-3"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"Each consumer root path lies outside REPO_ROOT.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-3-template-allowlist","test_tier":"integration","verification_service":"local git index (git ls-files) and the sprint-05 helper module","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-3-template-allowlist","maps_to_ac":"AC-3"},{"id":"TC-7","type":"test_criterion","primary":false,"description":"`pnpm exec tsc --noEmit` exits 0 with 0 `TS2307` diagnostics in each of the 2 consumers.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-4-consumer-compiles","test_tier":"e2e","verification_service":"the consumer's own TypeScript compiler over CLI-written files","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-4-consumer-compiles","maps_to_ac":"AC-4"},{"id":"TC-8","type":"test_criterion","primary":false,"description":"The install phase reports 1 attempt after a `pnpm install` failure whose output contains `ERR_PNPM` and lacks `react-native-web`.","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts","test_function":"APX-041-AC-5-install-failure-not-retried","test_tier":"integration","verification_service":"real pnpm 10 against the public npm registry","surface_policy":null,"unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test --config tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/live-registry-round-trip.remote.spec.ts --grep APX-041-AC-5-install-failure-not-retried","maps_to_ac":"AC-5"}]}
-->
