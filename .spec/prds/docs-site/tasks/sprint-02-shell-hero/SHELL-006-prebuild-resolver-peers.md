================================================================================
TASK: SHELL-006 - Prebuild data: engine/version URL resolver + derived AI SDK v7 peers (site-facts.json)
================================================================================
TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     81fb4f4ecea6a467b642345ab20f0c64b58bd58b
PRIORITY:   P1
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROPOSED-BY: react-native-reusables-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-02-shell-hero | WAVE: ?
HUMAN-TEST-HOOK: panels-list-derived-ai-peers
RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <TOKEN> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Make every {engine}/{version} template in the enriched dataset resolvable at build through one function, and make the AI SDK v7 peers line a build-derived fact (site-facts.json) sourced from the example app's real `ai` pin — the data half of FLOW-GEND-21 that SHELL-008 renders and SHELL-012 proves.
**Success state:** After the docs build, site-facts.json exists with aiSdkPeers derived from apps/example/package.json, resolve-deps.ts resolves every registryDependencies[] entry for both engines with zero template literals remaining, and the preexisting 56-item gates and registry-items.json shape are byte-stable.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Substitution lives in exactly one module (resolve-deps.ts) so served /r/*.json, panel URLs, and peers can never drift
- MUST: {version} resolves against the SAME root package.json version the sprint-01 chip carries — read at build, never hardcoded
- MUST: site-facts.json only ever appears whole (temp+rename, matching registry-items.json's emission)
- NEVER: never emit per-item peer lists — no item carries an AI SDK dependency; that is a packages/registry change for a later sprint
- NEVER: never hand-edit or git-track apps/docs/src/data/site-facts.json
- NEVER: never modify apps/example/package.json (read-only source) or packages/registry/registry.json
- STRICTLY: node:fs/node:path + JSON reads only (TR-06); no new dependency
- STRICTLY: verify lint via `./node_modules/.bin/biome ci <paths>` — local `pnpm lint` crashes
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [ ] AC-1: every resolved URL is concrete — shimmer's text.json URL under both engine segments, conversation's raw.githubusercontent URL at v0.2.1 — and zero {engine}/{version} substrings remain across all 56 items
- [ ] AC-2: aiSdkPeers names `ai` with a 7.x major range derived from 7.0.89, the file is gitignored (check-ignore exit 0, ls-files empty), and an empty peers resolution fails the build
- [ ] AC-3: the build exits 0, registry-items.json still holds exactly the 14 contract keys per item and 56 items, and the prebuild summary logs the site-facts emission
- [ ] typecheck + lint clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: Resolver substitutes {engine} and {version} per engine over the real dataset
  GIVEN: the real enriched dataset (56 items) and the root package.json version (0.2.1)
  WHEN:  the vitest integration test imports resolve-deps.ts and resolves every item's registryDependencies[] for both engines, comparing against the dataset it read
  THEN:  every resolved URL is concrete — shimmer's text.json URL under both engine segments, conversation's raw.githubusercontent URL at v0.2.1 — and zero {engine}/{version} substrings remain across all 56 items
  FLOW_REF:              FLOW-GEND-21-dependency-panel-peers
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real registry-items.json dataset + real root package.json read by the real resolver module
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/dependency-panels.spec.ts
  TEST_FUNCTION:         FLOW-GEND-21-dependency-panel-peers
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF enriched_dataset: import registry-items.json and resolve-deps.ts in the test, resolve shimmer's registryDependencies for nativewind then uniwind
      MUST_OBSERVE: `https://reactnativereusables.com/r/nativewind/text.json` and `.../uniwind/text.json` as the two resolved forms; 0 occurrences of the substring `{engine}` in resolved output
      MUST_NOT_OBSERVE: the unresolved template `https://reactnativereusables.com/r/{engine}/text.json`; an empty resolved array for shimmer
    START_REF enriched_dataset: resolve conversation's registryDependencies with the version read from root package.json, scan all 56 items' resolved output for residual templates
      MUST_OBSERVE: `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` (and the uniwind twin); 0 occurrences of `{version}` and `{engine}` across the resolved dataset
      MUST_NOT_OBSERVE: `v{version}` in any resolved URL; a hardcoded `0.2.1` literal inside resolve-deps.ts
    NEGATIVE_CONTROL: would fail if the resolver is a no-op passthrough — {engine}/{version} literals leak into resolved output; the version is hardcoded in the module instead of read from package.json — a bump leaves v0.2.1 stale…

AC-2: site-facts.json emits build-derived AI SDK v7 peers, fail-closed and untracked
  GIVEN: apps/example/package.json pinning "ai": "7.0.89" and a data tree with site-facts.json absent
  WHEN:  the vitest integration test runs the real docs build chain, reads the emitted site-facts.json, and checks git tracking
  THEN:  aiSdkPeers names `ai` with a 7.x major range derived from 7.0.89, the file is gitignored (check-ignore exit 0, ls-files empty), and an empty peers resolution fails the build
  FLOW_REF:              FLOW-GEND-21-dependency-panel-peers
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real pnpm build chain + real apps/example/package.json + real git index/check-ignore
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/dependency-panels.spec.ts
  TEST_FUNCTION:         FLOW-GEND-21-dependency-panel-peers
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF example_manifest: run the real chain that emits site-facts.json, read site-facts.json and derive the expected AI SDK v7 consumer package requirement from apps/example/package.json in the test
      MUST_OBSERVE: site-facts.json aiSdkPeers == [{ "name": "ai", "range": "^7.0.89" }] — derived from apps/example/package.json dependencies["ai"] == "7.0.89"; aiSdkPeers contains the name `ai` with a 7.x-shaped range derived from `7.0.89`
      MUST_NOT_OBSERVE: aiSdkPeers == [] (empty resolution); a range that disagrees with the manifest (e.g. a hand-typed `^6`)
    START_REF clean_data_tree: delete site-facts.json, rerun the wired docs build, then git check-ignore / git ls-files the path
      MUST_OBSERVE: apps/docs/src/data/site-facts.json exists again with mtime strictly greater than the recorded prebuild start time and content byte-identical to the pre-deletion copy (aiSdkPeers == [{ "name": "ai", "range": "^7.0.89" }]); git check-ignore exit 0 and git ls-files empty for the path
      MUST_NOT_OBSERVE: the file still absent after a successful build; the file tracked in the git index
    NEGATIVE_CONTROL: would fail if site-facts.json is a hand-authored static file decoupled from apps/example/package.json — a manifest bump leaves a stale AI SDK v7 consumer package requirement; the build succeeds with empty/missing aiSdkPeers (fail-closed gate absent)…

AC-3: Prebuild wiring regenerates both outputs without touching the locked artifact shape
  GIVEN: prebuild.ts with the resolver and site-facts emission wired in, and the sprint-01 dataset contract (CONTRACT_KEYS, 56 items) as baseline
  WHEN:  the vitest integration test runs the real docs build and inspects stdout plus the regenerated registry-items.json
  THEN:  the build exits 0, registry-items.json still holds exactly the 14 contract keys per item and 56 items, and the prebuild summary logs the site-facts emission
  FLOW_REF:              FLOW-GEND-21-dependency-panel-peers
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real docs prebuild + real filesystem over the emitted JSON
  SURFACE_POLICY:        .spec/e2e-policy/surface.json
  TDD_STATE:             none
  TEST_FILE:             tests/sprint-02-shell-hero/dependency-panels.spec.ts
  TEST_FUNCTION:         FLOW-GEND-21-dependency-panel-peers
  VERIFY:                pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers
  SCENARIO (validated by validate_scenario — zero CRITICAL):
    START_REF enriched_dataset: run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess capturing stdout, enumerate the regenerated registry-items.json keys and item count
      MUST_OBSERVE: exit code == 0; 56 items; every item carries exactly the 14 CONTRACT_KEYS in contract order; stdout logs the site-facts emission (the `ai` consumer package requirement named)
      MUST_NOT_OBSERVE: a 57th item or a dropped item; an added/removed key on any item (e.g. `aiSdkPeers` leaking onto items)
    NEGATIVE_CONTROL: would fail if the wiring bypasses gate-then-write (partial writes survive a failing build); the 56-item gates are skipped or the emitted field set drifts from the locked contract…

--------------------------------------------------------------------------------
TEST CRITERIA (boolean, mapped to ACs)
--------------------------------------------------------------------------------
- TC-1 [happy_path, → AC-1]: resolve-deps.ts resolves shimmer's registryDependencies to `https://reactnativereusables.com/r/nativewind/text.json` and the uniwind twin, with zero `{engine}` substrings in resolved output.
- TC-2 [edge, → AC-1]: conversation's raw.githubusercontent URL resolves `v{version}` to `v0.2.1` from root package.json (no hardcoded version literal in the module), and zero `{engine}`/`{version}` templates remain across all 56 items' resolved output.
- TC-3 [happy_path, → AC-2]: The emitted site-facts.json's aiSdkPeers names `ai` with a 7.x range equal to the test's expectation derived at run time from apps/example/package.json.
- TC-4 [error, → AC-2]: site-facts.json is untracked (git ls-files empty) and ignored (check-ignore exit 0), regenerates after deletion through the real chain, and an empty peers resolution fails the build.
- TC-5 [happy_path, → AC-3]: The wired docs build exits 0 with 56 items carrying exactly the 14 contract keys and the site-facts emission logged.
  verify: see maps_to_ac VERIFY commands
--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- scripts/docs-data/prebuild.ts (MODIFY)
- apps/docs/src/lib/resolve-deps.ts (NEW)
- apps/docs/src/data/site-facts.json (NEW)
- apps/docs/.gitignore (MODIFY)
- tests/sprint-02-shell-hero/resolve-deps.test.ts (NEW)
- tests/sprint-02-shell-hero/dependency-panels.spec.ts (NEW)
writeProhibited:
- apps/docs/src/pages/**
- apps/docs/src/components/**
- packages/registry/registry.json
- apps/example/** (read-only source)
--------------------------------------------------------------------------------
BOUNDARIES (contract)
--------------------------------------------------------------------------------
- One source per fact: peer names/ranges DERIVED from apps/example/package.json at build — never a hand-typed literal in any page or component (no item source imports ai/@ai-sdk; components are prop-driven, so peers are a project-level fact, honestly rendered as such)
- site-facts.json is generated-only and gitignored like the other data artifacts (outside the tracked set generated-data-untracked.test.ts pins)
- Build fails closed if aiSdkPeers resolves empty (the example app really pins `ai`)
- The existing 56-item gates and emitted registry-items.json fields are untouched
--------------------------------------------------------------------------------
READING LIST (max 5 — canonical pattern first)
--------------------------------------------------------------------------------
- tests/sprint-01-docs-spike-skeleton/generated-data-untracked.test.ts lines 20-60 — PRIMARY PATTERN — git ls-files/check-ignore/delete-and-regenerate proof for a generated untracked artifact
- scripts/docs-data/prebuild.ts lines 203-249 — main() gate-then-write emission (temp+rename, console summary) the site-facts wiring imitates
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts lines 1-60 — CONTRACT_KEYS lock + subprocess build-chain invocation pattern
- apps/docs/src/data/registry-items.json lines items shimmer/conversation/message — real dependencies[]/registryDependencies[] shapes incl. v{version} URL and message's empty array
--------------------------------------------------------------------------------
CODE PATTERN
--------------------------------------------------------------------------------
Pattern: gate-then-write emission over the in-memory dataset, temp+rename, console summary — as prebuild.ts already emits registry-items.json
Source: scripts/docs-data/prebuild.ts:203-249
Anti-pattern: hand-authored peer-contracts.json or per-item peer fields baked into registry-items.json — both fake per-item facts the registry does not carry (Ruling 2)
Interaction notes:
- resolve-deps.ts stays importable by both prebuild.ts (node) and [item].astro frontmatter (Vite build): pure functions over data passed in, no cwd assumptions inside
- site-facts peers are a project-level fact rendered by SHELL-008; per-item peers are out of scope by ruling
--------------------------------------------------------------------------------
VERIFICATION GATES
--------------------------------------------------------------------------------
- resolver substitution: `pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-resolver-substitution`
  expected: exit 0
- derived peers + untracked: `pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-site-facts-derived-peers`
  expected: exit 0
- prebuild wiring: `pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-prebuild-wiring`
  expected: exit 0
- typecheck: `pnpm typecheck`
  expected: exit 0
- lint: `./node_modules/.bin/biome ci scripts/docs-data/prebuild.ts apps/docs/src/lib/resolve-deps.ts tests/sprint-02-shell-hero/resolve-deps.test.ts`
  expected: exit 0 (never `pnpm lint`)
--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------
Depends on: (none)
Blocks:     SHELL-008, SHELL-012
--------------------------------------------------------------------------------
NOTES
--------------------------------------------------------------------------------
The data half of FLOW-GEND-21; rendering is SHELL-008, flow proof is SHELL-012. If per-item peers ever become real registry data, that is a packages/registry change in a later sprint — this task must not invent per-item peer lists. Ground truth (four-way verified at promotion): no item source imports ai/@ai-sdk; the only real AI SDK fact is apps/example/package.json `ai: 7.0.89`, so peers derive at build from that manifest (Ruling 2, fail-closed) and render honestly as a project-level fact.
Coding standards:
- node:fs/node:path + JSON.parse only (TR-06); fail-closed errors name the artifact and recovery command, matching prebuild.ts style
Capability: touches=['CAP-DOCS-01'] provides=3 items consumes=3 items; boundary_contracts=4
--------------------------------------------------------------------------------
REQUIREMENT-CONTRACT v1 (machine-readable; parsed by /kb-run-sprint)
--------------------------------------------------------------------------------
<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "SHELL-006",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "enriched_dataset": {
   "description": "The real generated apps/docs/src/data/registry-items.json (56 items) after the ordered chain: shimmer deps [react-native-reanimated] + registryDependencies [https://reactnativereusables.com/r/{engine}/text.json]; conversation deps [react-native-safe-area-context] + 3 URLs incl. https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/empty.json; message deps [].",
   "seed_method": "build_artifact",
   "records": [
    "pnpm -w run registry:build && pnpm -w run gallery:manifest exit 0; 56 items present",
    "every registryDependencies[] URL carries {engine}; conversation's third URL also carries v{version}"
   ]
  },
  "example_manifest": {
   "description": "apps/example/package.json as committed \u2014 dependencies include \"ai\": \"7.0.89\", the only real AI SDK pin in the repo.",
   "seed_method": "build_artifact",
   "records": [
    "apps/example/package.json dependencies[\"ai\"] == \"7.0.89\""
   ]
  },
  "clean_data_tree": {
   "description": "Working tree with apps/docs/src/data/site-facts.json deleted, proving the wired chain regenerates it (generated-data-untracked pattern).",
   "seed_method": "build_artifact",
   "records": [
    "site-facts.json absent before the chain; present after the docs build exits 0"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "type": "acceptance_criterion",
   "primary": false,
   "description": "GIVEN the real enriched dataset (56 items) and the root package.json version (0.2.1) WHEN the vitest integration test imports resolve-deps.ts and resolves every item's registryDependencies[] for both engines, comparing against the dataset it read THEN every resolved URL is concrete \u2014 shimmer's text.json URL under both engine segments, conversation's raw.githubusercontent URL at v0.2.1 \u2014 and zero {engine}/{version} substrings remain across all 56 items",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-21-dependency-panel-peers",
   "test_file": "tests/sprint-02-shell-hero/dependency-panels.spec.ts",
   "test_function": "FLOW-GEND-21-dependency-panel-peers",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers",
   "test_tier": "integration",
   "verification_service": "real registry-items.json dataset + real root package.json read by the real resolver module",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real registry-items.json dataset + real root package.json",
    "negative_control": {
     "would_fail_if": [
      "the resolver is a no-op passthrough \u2014 {engine}/{version} literals leak into resolved output",
      "the version is hardcoded in the module instead of read from package.json \u2014 a bump leaves v0.2.1 stale",
      "the test's expectations come from a copied fixture instead of the live dataset (static/mock oracle)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "enriched_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "import registry-items.json and resolve-deps.ts in the test",
        "resolve shimmer's registryDependencies for nativewind then uniwind"
       ]
      },
      "end_state": {
       "must_observe": [
        "`https://reactnativereusables.com/r/nativewind/text.json` and `.../uniwind/text.json` as the two resolved forms",
        "0 occurrences of the substring `{engine}` in resolved output"
       ],
       "must_not_observe": [
        "the unresolved template `https://reactnativereusables.com/r/{engine}/text.json`",
        "an empty resolved array for shimmer"
       ]
      }
     },
     {
      "start_ref": "enriched_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "resolve conversation's registryDependencies with the version read from root package.json",
        "scan all 56 items' resolved output for residual templates"
       ]
      },
      "end_state": {
       "must_observe": [
        "`https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.1/public/r/nativewind/empty.json` (and the uniwind twin)",
        "0 occurrences of `{version}` and `{engine}` across the resolved dataset"
       ],
       "must_not_observe": [
        "`v{version}` in any resolved URL",
        "a hardcoded `0.2.1` literal inside resolve-deps.ts"
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
   "description": "GIVEN apps/example/package.json pinning \"ai\": \"7.0.89\" and a data tree with site-facts.json absent WHEN the vitest integration test runs the real docs build chain, reads the emitted site-facts.json, and checks git tracking THEN aiSdkPeers names `ai` with a 7.x major range derived from 7.0.89, the file is gitignored (check-ignore exit 0, ls-files empty), and an empty peers resolution fails the build",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-21-dependency-panel-peers",
   "test_file": "tests/sprint-02-shell-hero/dependency-panels.spec.ts",
   "test_function": "FLOW-GEND-21-dependency-panel-peers",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers",
   "test_tier": "integration",
   "verification_service": "real pnpm build chain + real apps/example/package.json + real git index/check-ignore",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real build chain + real example manifest + real git",
    "negative_control": {
     "would_fail_if": [
      "site-facts.json is a hand-authored static file decoupled from apps/example/package.json \u2014 a manifest bump leaves a stale AI SDK v7 consumer package requirement",
      "the build succeeds with empty/missing aiSdkPeers (fail-closed gate absent)",
      "the generated file is tracked in git \u2014 a fresh build consumes stale bytes"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "example_manifest",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the real chain that emits site-facts.json",
        "read site-facts.json and derive the expected AI SDK v7 consumer package requirement from apps/example/package.json in the test"
       ]
      },
      "end_state": {
       "must_observe": [
        "site-facts.json aiSdkPeers == [{ \"name\": \"ai\", \"range\": \"^7.0.89\" }] \u2014 derived from apps/example/package.json dependencies[\"ai\"] == \"7.0.89\"",
        "aiSdkPeers contains the name `ai` with a 7.x-shaped range derived from `7.0.89`"
       ],
       "must_not_observe": [
        "aiSdkPeers == [] (empty resolution)",
        "a range that disagrees with the manifest (e.g. a hand-typed `^6`)"
       ]
      }
     },
     {
      "start_ref": "clean_data_tree",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "delete site-facts.json, rerun the wired docs build, then git check-ignore / git ls-files the path"
       ]
      },
      "end_state": {
       "must_observe": [
        "apps/docs/src/data/site-facts.json exists again with mtime strictly greater than the recorded prebuild start time and content byte-identical to the pre-deletion copy (aiSdkPeers == [{ \"name\": \"ai\", \"range\": \"^7.0.89\" }])",
        "git check-ignore exit 0 and git ls-files empty for the path"
       ],
       "must_not_observe": [
        "the file still absent after a successful build",
        "the file tracked in the git index"
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
   "description": "GIVEN prebuild.ts with the resolver and site-facts emission wired in, and the sprint-01 dataset contract (CONTRACT_KEYS, 56 items) as baseline WHEN the vitest integration test runs the real docs build and inspects stdout plus the regenerated registry-items.json THEN the build exits 0, registry-items.json still holds exactly the 14 contract keys per item and 56 items, and the prebuild summary logs the site-facts emission",
   "maps_to_ac": null,
   "flow_ref": "FLOW-GEND-21-dependency-panel-peers",
   "test_file": "tests/sprint-02-shell-hero/dependency-panels.spec.ts",
   "test_function": "FLOW-GEND-21-dependency-panel-peers",
   "verify": "pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts --grep FLOW-GEND-21-dependency-panel-peers",
   "test_tier": "integration",
   "verification_service": "real docs prebuild + real filesystem over the emitted JSON",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real docs prebuild + real filesystem",
    "negative_control": {
     "would_fail_if": [
      "the wiring bypasses gate-then-write (partial writes survive a failing build)",
      "the 56-item gates are skipped or the emitted field set drifts from the locked contract",
      "site-facts emission is a side script nobody runs (deleting it never breaks the build)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "enriched_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run `pnpm --filter @rnr-ai-elements/docs build` as a real subprocess capturing stdout",
        "enumerate the regenerated registry-items.json keys and item count"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code == 0",
        "56 items; every item carries exactly the 14 CONTRACT_KEYS in contract order",
        "stdout logs the site-facts emission (the `ai` consumer package requirement named)"
       ],
       "must_not_observe": [
        "a 57th item or a dropped item",
        "an added/removed key on any item (e.g. `aiSdkPeers` leaking onto items)"
       ]
      }
     }
    ]
   }
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "resolve-deps.ts resolves shimmer's registryDependencies to `https://reactnativereusables.com/r/nativewind/text.json` and the uniwind twin, with zero `{engine}` substrings in resolved output.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-resolver-substitution"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "conversation's raw.githubusercontent URL resolves `v{version}` to `v0.2.1` from root package.json (no hardcoded version literal in the module), and zero `{engine}`/`{version}` templates remain across all 56 items' resolved output.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-resolver-substitution"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The emitted site-facts.json's aiSdkPeers names `ai` with a 7.x range equal to the test's expectation derived at run time from apps/example/package.json.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-site-facts-derived-peers"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "site-facts.json is untracked (git ls-files empty) and ignored (check-ignore exit 0), regenerates after deletion through the real chain, and an empty peers resolution fails the build.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-site-facts-derived-peers"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The wired docs build exits 0 with 56 items carrying exactly the 14 contract keys and the site-facts emission logged.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-02-shell-hero/resolve-deps.test.ts -t SHELL-006-prebuild-wiring"
  }
 ]
}
-->
