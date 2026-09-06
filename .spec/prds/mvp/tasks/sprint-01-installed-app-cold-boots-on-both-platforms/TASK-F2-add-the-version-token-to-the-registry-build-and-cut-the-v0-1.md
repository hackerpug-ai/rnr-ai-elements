# TASK-F2: Add the {version} token to the registry build and cut the v0.1.0 tag

> Task ID: TASK-F2  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: FEATURE
> Wave: B  
> Status: ⬜ Pending    
> TDD Mode: `red_first` · RED_GREEN_REQUIRED: yes
> Proposed By: `react-native-reusables-planner`
> Depends On: TASK-F1

## Outcome

Two-line change, one tag, no pipeline. Substitute `{version}` from package.json exactly where `{engine}` is substituted today so both tokens share one code path — do not write a second helper. Substitute BEFORE the `https://` guard at build-registry.ts:79 runs, or a correctly-templated URL fails the guard for the wrong reason and you will spend an hour on a self-inflicted bug. Then `pnpm registry:build`, commit `public/r/**` in the same commit (the `registry` CI job diffs a fresh build and goes red on staleness), and `git tag v0.1.0`. Annotate the tag as a pre-release snapshot with no support promise: the style-parity remediation is mid-flight and the first pinnable version is not the final one. RNR's own `reactnativereusables.com` dependencies are NEVER version-substituted — pinning those would freeze a consumer to an RNR snapshot we do not control, which is the opposite of the peer-dependency model this whole registry exists to honor.

## Critical Constraints

- SCOPED DOWN FROM 5 POINTS ON PURPOSE. No release workflow. `git tag v0.1.0 && git push --tags` is the whole publication step. An automated release pipeline is scaffolding for a cadence that does not exist — it belongs in the distribution sprint where UC-REG-06 is actually claimed and where a reinstall-twice-and-diff assertion has a gate to live in.
- The tag is cut from a tree whose style-parity remediation is mid-flight, so `v0.1.0` is a pre-release snapshot that carries NO support promise. Say that in the tag annotation. Do not let it be read as a stability claim.
- `pnpm check:tokens` is BROKEN — it points at `scripts/check-tokens.ts`, which does not exist. Do not add it to any verification gate here. `scripts/check-contract.ts` is the working color-literal gate.
- The `registry` CI job diffs a fresh build against the committed tree. Any change to the emitter means `pnpm registry:build` must be re-run and `public/r/**` re-committed in the same commit, or CI goes red on staleness.

## Supersedes

This task modifies test files that already exist. Declared so a later sprint can tell a deliberate change from a regression.

- `tests/build-registry.test.ts`

sprint-01 adds a nested `describe("UC-REG-01/edge-a-short-name-registry-dependency", ...)` block to tests/build-registry.test.ts holding both halves of the locked edge flow — the short-name refusal (AC-1) and the v0.1.0 tag-pinning scan (AC-2) — because the locked run_cmd selects on that suite name with -t. LEAVES TRUE for later sprints: every registryDependencies string in all 112 emitted files starts with https://, every self-referencing URL names the v0.1.0 tag with 0 occurrences of /main/, and all 14 reactnativereusables.com dependencies carry no version segment. A later sprint that cuts v0.2.0 changes the asserted tag and must list this file under its own supersedes; the same assertion failing without such a declaration is a regression, not a deliberate bump.

## Verification Checklist

| Command | Expect |
|---|---|
| `git tag -l --format='%(contents)' v0.1.0` | the annotation names v0.1.0 a PRE-RELEASE snapshot carrying no support promise, because the style-parity remediation is mid-flight when the tag is cut |
| `pnpm registry:build && git diff --exit-code -- public/r` | exits 0 — the emitter change and the re-emitted public/r/** are in the same commit, which is what keeps the `registry` CI job from going red on staleness |

## Acceptance Criteria

### AC-1 — PRIMARY: A `registryDependencies` entry given as a bare short name is refused by the build, and every one of the 56 emitted entries in both engine trees resolves to an absolute `https://` URL.
**GIVEN** the 56-item registry source and both engine output trees  
**WHEN** `pnpm registry:build` runs and `buildItem` is called with a `registryDependencies` entry of `["card"]`  
**THEN** the build refuses the short name and every registryDependencies string across all 112 emitted files starts with `https://`

- FLOW_REF: `UC-REG-01/edge-a-short-name-registry-dependency`
- TEST_TIER: `integration`
- TEST_FILE: `tests/build-registry.test.ts`  ·  TEST_FUNCTION: `UC-REG-01/edge-a-short-name-registry-dependency`
- VERIFY: `pnpm exec vitest run tests/build-registry.test.ts -t "UC-REG-01/edge-a-short-name-registry-dependency"`
- VERIFICATION_SERVICE: the real 56-item registry emitted by `pnpm registry:build` into `public/r/nativewind/` and `public/r/uniwind/`
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F2-1</code></summary>

```json
{
  "id": "SC-F2-1",
  "primary": true,
  "test_tier": "integration",
  "start_ref": "built-registry-both-engines",
  "action": {
    "actor": "maintainer",
    "steps": [
      "run `pnpm registry:build` to emit both engine trees from the real source",
      "assert every `registryDependencies` string in all 112 emitted files starts with `https://`",
      "call `buildItem` with an item whose `registryDependencies` is `[\"card\"]` and assert it throws"
    ]
  },
  "end_state": {
    "must_observe": [
      "`112` emitted item files checked (56 items x 2 engines) with `0` non-https registryDependencies among them",
      "`buildItem` throws an Error whose message contains `is not an absolute URL`",
      "every self-referencing URL matches `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/`"
    ],
    "must_not_observe": [
      "a `registryDependencies` entry equal to a bare name such as `card` with no scheme",
      "any URL still containing the mutable segment `/main/`",
      "`0` assertions executed, or a suite that reports pass having checked an empty file list"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the `startsWith('https://')` guard is removed from `buildItem`",
      "the guard is downgraded to a console warning instead of a throw",
      "the test is pointed at a stub registry object rather than the real emitted tree",
      "the emitted file list is empty and the loop asserts nothing"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/goldens/sprint-01/registry/edge-short-name.json"
  }
}
```

</details>

### AC-2: Every self-referencing registry URL in both emitted engine trees names the `v0.1.0` tag, and none carries the mutable `/main/` segment — so the command in gate step 2 resolves the same bytes tomorrow as today.
**GIVEN** the 56-item registry source and a `version` of `0.1.0` in package.json  
**WHEN** `pnpm registry:build` emits both engine trees and the locked flow command scans every emitted file  
**THEN** every self-referencing URL names `v0.1.0`, `/main/` occurs 0 times, and no version segment is injected into any reactnativereusables.com URL

- FLOW_REF: `UC-REG-01/edge-a-short-name-registry-dependency`
- TEST_TIER: `integration`
- TEST_FILE: `tests/build-registry.test.ts`  ·  TEST_FUNCTION: `UC-REG-01/edge-a-short-name-registry-dependency`
- VERIFY: `pnpm exec vitest run tests/build-registry.test.ts -t "UC-REG-01/edge-a-short-name-registry-dependency"`
- VERIFICATION_SERVICE: the real 56-item registry emitted by `pnpm registry:build` into `public/r/nativewind/` and `public/r/uniwind/`
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F2-2</code></summary>

```json
{
  "id": "SC-F2-2",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "built-registry-both-engines",
  "action": {
    "actor": "maintainer",
    "steps": [
      "run `pnpm registry:build` to emit both engine trees from the real source",
      "collect every `registryDependencies` string across all 112 emitted item files and partition them by host",
      "assert the partition rules: our own host is tag-pinned, RNR's host is not version-substituted at all"
    ]
  },
  "end_state": {
    "must_observe": [
      "`112` emitted item files scanned (56 items x 2 engines), with every self-referencing URL matching `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/`",
      "the count of the substring `/main/public/r/` across all emitted files is exactly `0`",
      "the count of unsubstituted `{version}` and `{engine}` tokens across all emitted files is exactly `0`",
      "all `14` distinct RNR dependencies still resolve to `reactnativereusables.com/r/<engine>/` with NO version segment inserted"
    ],
    "must_not_observe": [
      "any URL still carrying the mutable segment `/main/`, which is what makes an install unreproducible",
      "a version segment injected into a `reactnativereusables.com` URL \u2014 that would pin a consumer to an RNR snapshot we do not control",
      "`0` files scanned, or a suite that reports pass having walked an empty emitted tree"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the `{version}` substitution is removed from the emitter, leaving `/main/` in every URL",
      "the version token is applied to RNR's host as well, freezing a dependency we consume at a package-manifest range rather than own \u2014 which pins every consumer to one RNR snapshot",
      "the emitted tree is stale and the test scans it unchanged rather than rebuilding first",
      "the scan is pointed at a stub registry object instead of the real emitted files"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/goldens/sprint-01/registry/url-pinning.json"
  }
}
```

</details>

## Test Criteria

| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-1 |  | AC-1 | `—` |
| TC-2 |  | AC-1 | `—` |
| TC-3 |  | AC-1 | `—` |
| TC-4 |  | AC-2 | `—` |
| TC-5 |  | AC-2 | `—` |
| TC-6 |  | AC-2 | `—` |

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/scripts/build-registry.ts`
- `packages/registry/registry.json`
- `public/r/**`
- `package.json`
- `tests/build-registry.test.ts`
- `design/goldens/sprint-01/registry/**`

**WRITE-PROHIBITED**
- `packages/registry/src/components/**`
- `apps/**`
- `design/style-parity-*.md`
- `.github/workflows/**`

## Boundary Contracts

- `{version}` is substituted from `package.json`'s `version` field by the same `resolveEngine`-style pure helper that handles `{engine}`, so both tokens share one code path and one unit of test coverage.
- Published URL form is exactly `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/<engine>/<item>.json`. RNR's own dependencies keep pointing at `reactnativereusables.com` and are NEVER version-substituted by us — substituting them would pin a consumer to an RNR snapshot we do not control.
- `buildItem` must keep throwing on any `registryDependency` that does not resolve to a string starting with `https://` (the guard at `packages/registry/scripts/build-registry.ts:79`). The `{version}` token must be substituted BEFORE that check runs, or a templated URL fails the guard for the wrong reason.

## Fixtures

- **`built-registry-both-engines`** (cli) — The real emitted registry: 56 items fanned into public/r/nativewind/ and public/r/uniwind/ by pnpm registry:build from the committed source tree.
  - 56 registry.json items
  - 112 emitted item JSON files
  - 2 per-engine index files

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F2",
  "task_type": "FEATURE",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "built-registry-both-engines": {
      "description": "The real emitted registry: 56 items fanned into public/r/nativewind/ and public/r/uniwind/ by pnpm registry:build from the committed source tree.",
      "seed_method": "cli",
      "records": [
        "56 registry.json items",
        "112 emitted item JSON files",
        "2 per-engine index files"
      ]
    }
  },
  "requirements": [
    {
      "type": "acceptance_criterion",
      "id": "AC-1",
      "num": 1,
      "name": "A `registryDependencies` entry given as a bare short name is refused by the build, and every one of the 56 emitted entries in both engine trees resolves to an absolute `https://` URL.",
      "primary": true,
      "given": "the 56-item registry source and both engine output trees",
      "when": "`pnpm registry:build` runs and `buildItem` is called with a `registryDependencies` entry of `[\"card\"]`",
      "then": "the build refuses the short name and every registryDependencies string across all 112 emitted files starts with `https://`",
      "flow_ref": "UC-REG-01/edge-a-short-name-registry-dependency",
      "test_file": "tests/build-registry.test.ts",
      "test_function": "UC-REG-01/edge-a-short-name-registry-dependency",
      "verify": "pnpm exec vitest run tests/build-registry.test.ts -t \"UC-REG-01/edge-a-short-name-registry-dependency\"",
      "test_tier": "integration",
      "verification_service": "the real 56-item registry emitted by `pnpm registry:build` into `public/r/nativewind/` and `public/r/uniwind/`",
      "unit_test_justified": false,
      "surface_policy": ".spec/e2e-policy/surface.json",
      "red_proof": "design/goldens/sprint-01/registry/edge-short-name.RED.log",
      "scenario": {
        "id": "SC-F2-1",
        "primary": true,
        "test_tier": "integration",
        "start_ref": "built-registry-both-engines",
        "action": {
          "actor": "maintainer",
          "steps": [
            "run `pnpm registry:build` to emit both engine trees from the real source",
            "assert every `registryDependencies` string in all 112 emitted files starts with `https://`",
            "call `buildItem` with an item whose `registryDependencies` is `[\"card\"]` and assert it throws"
          ]
        },
        "end_state": {
          "must_observe": [
            "`112` emitted item files checked (56 items x 2 engines) with `0` non-https registryDependencies among them",
            "`buildItem` throws an Error whose message contains `is not an absolute URL`",
            "every self-referencing URL matches `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/`"
          ],
          "must_not_observe": [
            "a `registryDependencies` entry equal to a bare name such as `card` with no scheme",
            "any URL still containing the mutable segment `/main/`",
            "`0` assertions executed, or a suite that reports pass having checked an empty file list"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the `startsWith('https://')` guard is removed from `buildItem`",
            "the guard is downgraded to a console warning instead of a throw",
            "the test is pointed at a stub registry object rather than the real emitted tree",
            "the emitted file list is empty and the loop asserts nothing"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/goldens/sprint-01/registry/edge-short-name.json"
        }
      }
    },
    {
      "type": "acceptance_criterion",
      "id": "AC-2",
      "num": 2,
      "name": "Every self-referencing registry URL in both emitted engine trees names the `v0.1.0` tag, and none carries the mutable `/main/` segment \u2014 so the command in gate step 2 resolves the same bytes tomorrow as today.",
      "primary": false,
      "given": "the 56-item registry source and a `version` of `0.1.0` in package.json",
      "when": "`pnpm registry:build` emits both engine trees and the locked flow command scans every emitted file",
      "then": "every self-referencing URL names `v0.1.0`, `/main/` occurs 0 times, and no version segment is injected into any reactnativereusables.com URL",
      "flow_ref": "UC-REG-01/edge-a-short-name-registry-dependency",
      "test_file": "tests/build-registry.test.ts",
      "test_function": "UC-REG-01/edge-a-short-name-registry-dependency",
      "verify": "pnpm exec vitest run tests/build-registry.test.ts -t \"UC-REG-01/edge-a-short-name-registry-dependency\"",
      "test_tier": "integration",
      "verification_service": "the real 56-item registry emitted by `pnpm registry:build` into `public/r/nativewind/` and `public/r/uniwind/`",
      "unit_test_justified": false,
      "surface_policy": ".spec/e2e-policy/surface.json",
      "red_proof": "design/goldens/sprint-01/registry/url-pinning.RED.log",
      "scenario": {
        "id": "SC-F2-2",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "built-registry-both-engines",
        "action": {
          "actor": "maintainer",
          "steps": [
            "run `pnpm registry:build` to emit both engine trees from the real source",
            "collect every `registryDependencies` string across all 112 emitted item files and partition them by host",
            "assert the partition rules: our own host is tag-pinned, RNR's host is not version-substituted at all"
          ]
        },
        "end_state": {
          "must_observe": [
            "`112` emitted item files scanned (56 items x 2 engines), with every self-referencing URL matching `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/`",
            "the count of the substring `/main/public/r/` across all emitted files is exactly `0`",
            "the count of unsubstituted `{version}` and `{engine}` tokens across all emitted files is exactly `0`",
            "all `14` distinct RNR dependencies still resolve to `reactnativereusables.com/r/<engine>/` with NO version segment inserted"
          ],
          "must_not_observe": [
            "any URL still carrying the mutable segment `/main/`, which is what makes an install unreproducible",
            "a version segment injected into a `reactnativereusables.com` URL \u2014 that would pin a consumer to an RNR snapshot we do not control",
            "`0` files scanned, or a suite that reports pass having walked an empty emitted tree"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the `{version}` substitution is removed from the emitter, leaving `/main/` in every URL",
            "the version token is applied to RNR's host as well, freezing a dependency we consume at a package-manifest range rather than own \u2014 which pins every consumer to one RNR snapshot",
            "the emitted tree is stale and the test scans it unchanged rather than rebuilding first",
            "the scan is pointed at a stub registry object instead of the real emitted files"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/goldens/sprint-01/registry/url-pinning.json"
        }
      }
    },
    {
      "type": "test_case",
      "id": "TC-1",
      "maps_to_ac": "AC-1",
      "assertion": "`pnpm registry:build` emits 112 files; every registryDependencies string in every one starts with `https://`."
    },
    {
      "type": "test_case",
      "id": "TC-2",
      "maps_to_ac": "AC-1",
      "assertion": "`buildItem({registryDependencies:['card']}, 'uniwind', readFile)` throws with a message containing `is not an absolute URL`."
    },
    {
      "type": "test_case",
      "id": "TC-3",
      "maps_to_ac": "AC-1",
      "assertion": "`resolveEngine` substitutes `{version}` and `{engine}` in one pass; a URL carrying both tokens emits with neither remaining."
    },
    {
      "type": "test_case",
      "id": "TC-4",
      "maps_to_ac": "AC-2",
      "assertion": "Every self-referencing URL across all 112 emitted files matches `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/`."
    },
    {
      "type": "test_case",
      "id": "TC-5",
      "maps_to_ac": "AC-2",
      "assertion": "The substring `/main/public/r/` occurs 0 times across `public/r/**`, and 0 unsubstituted `{version}`/`{engine}` tokens remain."
    },
    {
      "type": "test_case",
      "id": "TC-6",
      "maps_to_ac": "AC-2",
      "assertion": "All 14 distinct `reactnativereusables.com` dependencies are emitted with no version segment inserted."
    }
  ],
  "supersedes": [
    "tests/build-registry.test.ts"
  ],
  "supersedes_note": "sprint-01 adds a nested `describe(\"UC-REG-01/edge-a-short-name-registry-dependency\", ...)` block to tests/build-registry.test.ts holding both halves of the locked edge flow \u2014 the short-name refusal (AC-1) and the v0.1.0 tag-pinning scan (AC-2) \u2014 because the locked run_cmd selects on that suite name with -t. LEAVES TRUE for later sprints: every registryDependencies string in all 112 emitted files starts with https://, every self-referencing URL names the v0.1.0 tag with 0 occurrences of /main/, and all 14 reactnativereusables.com dependencies carry no version segment. A later sprint that cuts v0.2.0 changes the asserted tag and must list this file under its own supersedes; the same assertion failing without such a declaration is a regression, not a deliberate bump."
}
-->
