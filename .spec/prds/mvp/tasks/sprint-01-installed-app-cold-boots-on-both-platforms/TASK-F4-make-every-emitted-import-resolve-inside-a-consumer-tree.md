# TASK-F4: Make every emitted import resolve inside a consumer tree

> Task ID: TASK-F4  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 8  
> Type: FEATURE  
> Wave: D  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: TASK-F3

**Sizing rationale.** THE CONDITIONAL IS THE POINT AND IT IS NOT AVERAGED. Two branches, and which one runs is unknowable until TASK-F3 has installed once. BRANCH A — the CLI already rewrites the three-segment `@/registry/{engine}/components/ai|components/ui|lib` shape: this task collapses to pinning the evidence and adding the regression assertion, and is worth 2 points. BRANCH B — it does not: the source alias must change to a shape the CLI does rewrite, and 50 files, the emitter and both harness tsconfigs migrate together, which is 8. Carried at 8 because a sprint sized on the optimistic branch has no slack when the pessimistic one fires, and because BRANCH B is the branch that makes this the sprint's real unknown. Re-size to 2 the moment AC-1's verdict is recorded — do not silently keep 8 if Branch A holds.

## Outcome

This is the sprint's real unknown and the task is written so the conditional survives contact. 254 imports across 50 of 56 items in three shapes; only the six registry:lib items are clean. AC-1 exists to force the measurement BEFORE the migration: run TASK-F3's install, count what the CLI actually wrote, commit the verdict naming Branch A or Branch B with its raw counts. If Branch A holds — the CLI already rewrites all three shapes — say so, re-size this task to 2 points, and hand the correction back rather than quietly spending eight. If Branch B holds, change the source alias to a shape the CLI does rewrite and migrate 50 sources, the emitter and BOTH harness tsconfigs in one commit; a partial migration surfaces as a Metro resolution error, not a typecheck error, which is the worst place to find it. The single line that matters: the fix goes UPSTREAM. `apps/example/**` is in write_allowed only for reverting install side-effects. A Metro `resolver.alias` or an extra tsconfig path in the consumer turns this green while leaving every real consumer broken, and TC-5 exists specifically to catch that.

## Critical Constraints

- RUN TASK-F3 FIRST AND READ WHAT LANDED BEFORE CHANGING ANYTHING. The measured surface is 254 imports across 50 of 56 items in three shapes — 168 `components/ui/`, 83 `lib/`, 3 `components/ai/`; only the 6 registry:lib items are clean. The CLI may already rewrite all three. Changing 50 files before looking is the expensive mistake available here.
- DO NOT PATCH `apps/example` TO MAKE THE BOOT WORK. A Metro `resolver.alias`, an extra tsconfig path, or a workspace symlink in the consumer would turn this task green while leaving every real consumer broken — and it would make the install evidence from TASK-F3 worthless. `apps/example/**` is in write_allowed ONLY for reverting install side-effects, never for adding resolution shims.
- The verdict in AC-1 is recorded whichever way it falls. A task that finds the CLI already works is a SUCCESS with a 2-point cost, not a task with nothing to show. Record it and hand the sizing correction back.

## Acceptance Criteria

### AC-1: The CLI's actual rewrite behavior for all three alias shapes is measur

The CLI's actual rewrite behavior for all three alias shapes is measured against the tree TASK-F3 installed and recorded as a Branch A / Branch B verdict, before any source file is changed.

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `tests/alias-resolution.test.ts`  ·  TEST_FUNCTION: `measures the alias rewrite verdict from the installed consumer tree`
- VERIFY: `pnpm exec vitest run tests/alias-resolution.test.ts -t "measures the alias rewrite verdict from the installed consumer tree"`
- VERIFICATION_SERVICE: the real apps/example consumer tree as left by the TASK-F3 install
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`
- RED_PROOF: `design/goldens/sprint-01/install/alias-verdict.RED.log`
- RED provenance: NATURAL RED: run before TASK-F3's install, `apps/example/components` does not exist and the test fails on the missing tree. Capture that run.

<details><summary>Scenario <code>SC-F4-1</code></summary>

```json
{
  "id": "SC-F4-1",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "installed-consumer-tree",
  "action": {
    "actor": "maintainer",
    "steps": [
      "count occurrences of the literal `@/registry/` across `apps/example/components/**` and `apps/example/lib/**` as the install left them, per shape",
      "count the same literal across `packages/registry/src/**` for the before figure",
      "write the per-shape counts and the resulting branch label to the verdict artifact"
    ]
  },
  "end_state": {
    "must_observe": [
      "the source-side count is `254` occurrences across `50` of `56` items, split `168` under `components/ui/`, `83` under `lib/`, `3` under `components/ai/`",
      "the verdict artifact names a consumer-side count for each of the three shapes, for example `components/ui: 168 -> 0`",
      "the verdict artifact contains exactly one of the literals `BRANCH A` or `BRANCH B`, with the counts that decided it"
    ],
    "must_not_observe": [
      "a verdict recorded with `0` counts attached, or with no counts at all",
      "counts read from `packages/registry/src` presented as the consumer-side figure \u2014 that would report the pre-install number unchanged",
      "a file under `packages/registry/src/**` modified before the measurement artifact is written"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the counts are hardcoded in the test rather than read from the installed tree",
      "the measurement runs against an empty `apps/example/components` directory and reports `0` because there is nothing to scan",
      "the install was faked by a `cp`, making every count meaningless",
      "the source-side baseline is omitted, so the before and after cannot be compared"
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true,
    "path": "design/goldens/sprint-01/install/alias-verdict.md"
  }
}
```
</details>

### AC-2: After the install, no file in the consumer's tree contains the literal

After the install, no file in the consumer's tree contains the literal `@/registry/`, and no resolution shim was added to `apps/example` to achieve it.

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `tests/alias-resolution.test.ts`  ·  TEST_FUNCTION: `leaves zero registry aliases in the consumer tree without a resolution shim`
- VERIFY: `pnpm exec vitest run tests/alias-resolution.test.ts -t "leaves zero registry aliases in the consumer tree without a resolution shim"`
- VERIFICATION_SERVICE: the real apps/example consumer tree and its metro/tsconfig configuration after the TASK-F3 install
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`
- RED_PROOF: `design/goldens/sprint-01/install/alias-zero-count.RED.log`
- RED provenance: NATURAL RED, and this one is the single best consequence of the restructure. Under BRANCH B the test fails from the moment it is written until the alias migration lands — the real failure, watched, no mutation dance. Under BRANCH A it passes immediately, which is itself the verdict, and the RED is then produced by planting one `@/registry/uniwind/lib/utils` import, rebuilding, reinstalling and watching the count go non-zero — proving the assertion is live rather than vacuous.

<details><summary>Scenario <code>SC-F4-2</code></summary>

```json
{
  "id": "SC-F4-2",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "installed-consumer-tree",
  "action": {
    "actor": "maintainer",
    "steps": [
      "count the literal `@/registry/` across every file under `apps/example/components/**` and `apps/example/lib/**`",
      "read every import specifier in `apps/example/components/ai/message.tsx`",
      "read `apps/example/metro.config.js` and `apps/example/tsconfig.json` and search them for any alias entry resolving to `packages/registry`"
    ]
  },
  "end_state": {
    "must_observe": [
      "the count of `@/registry/` across the consumer tree is exactly `0`, over a scanned file set of at least `10` .tsx files",
      "`apps/example/components/ai/message.tsx` imports `@/components/ui/text` and `@/components/ui/avatar` through the consumer's own alias",
      "`apps/example/metro.config.js` and `apps/example/tsconfig.json` contain `0` alias entries resolving to `packages/registry`"
    ],
    "must_not_observe": [
      "`@/registry/uniwind/components/ui/text` or any sibling specifier surviving in the consumer tree",
      "a `resolver.alias` or extra tsconfig path pointing at `packages/registry` \u2014 the fix belongs upstream, and a consumer shim leaves every real consumer broken while this passes",
      "a scanned file set of `0` files, which would make the zero-count vacuous"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the alias fix is reverted in `packages/registry/src`, which restores the unresolved specifier",
      "a resolution shim is added to the consumer instead, which the third assertion detects",
      "the installed components are replaced by static stubs that import nothing",
      "the scan runs against an empty components directory and reports `0` because there is nothing to scan"
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true,
    "path": "design/goldens/sprint-01/install/alias-zero-count.json"
  }
}
```
</details>

### AC-3: Both harness packages still typecheck after the migration and the comm

Both harness packages still typecheck after the migration and the committed registry is a byte-exact rebuild, so the alias change did not fix the consumer by breaking development.

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `tests/alias-resolution.test.ts`  ·  TEST_FUNCTION: `keeps both harnesses typechecking and the committed registry byte-exact`
- VERIFY: `pnpm exec vitest run tests/alias-resolution.test.ts -t "keeps both harnesses typechecking and the committed registry byte-exact"`
- VERIFICATION_SERVICE: the real apps/harness and apps/harness-nativewind workspaces under tsc, and the real emitter output under public/r
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`
- RED_PROOF: `design/goldens/sprint-01/install/harness-typecheck.RED.log`
- RED provenance: NATURAL RED under BRANCH B: mid-migration, before the harness tsconfigs are updated, `pnpm typecheck` fails on unresolved paths. Capture it there. Under BRANCH A, revert one tsconfig path entry to produce it.

<details><summary>Scenario <code>SC-F4-3</code></summary>

```json
{
  "id": "SC-F4-3",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "installed-consumer-tree",
  "action": {
    "actor": "maintainer",
    "steps": [
      "shell out to `pnpm typecheck` and capture its exit code and the project list it compiled",
      "shell out to `pnpm registry:build`, then to `git diff --exit-code -- public/r`, capturing both exit codes",
      "read both harness `tsconfig.json` path maps and compare the alias segment against the one the sources now import"
    ]
  },
  "end_state": {
    "must_observe": [
      "`pnpm typecheck` exits `0` and its captured output names both `apps/harness` and `apps/harness-nativewind`",
      "`git diff --exit-code -- public/r` exits `0` after a fresh `pnpm registry:build`",
      "both harness `tsconfig.json` files map the same alias segment the sources import, with `0` divergence between them"
    ],
    "must_not_observe": [
      "a typecheck that names only one harness and reports `0` errors having compiled nothing",
      "`public/r` left stale, which the `registry` CI job reports as a non-empty diff",
      "one harness migrated and the other unchanged"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "only one harness tsconfig is updated, leaving the other with an unresolved path",
      "typecheck is narrowed to the root project so the harnesses are omitted from the run",
      "`public/r` is not rebuilt, so emitted content still carries the removed alias",
      "the exit code is swallowed and the assertion passes on a static string"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/goldens/sprint-01/install/harness-typecheck.log"
  }
}
```
</details>


## Test Criteria

| ID | Maps to | Assertion |
|---|---|---|
| TC-1 | AC-1 | The verdict file records per-shape before/after counts for `components/ai/`, `components/ui/`, `lib/` and names BRANCH A or BRANCH B. |
| TC-2 | AC-1 | The verdict is committed before any file under `packages/registry/src/**` is modified (git log ordering). |
| TC-3 | AC-2 | `@/registry/` occurs exactly 0 times across `apps/example/components/**` and `apps/example/lib/**` after install. |
| TC-4 | AC-2 | `npx expo run:ios` and `npx expo run:android` both build and draw the header `AI Elements Example` with no `Unable to resolve module`. |
| TC-5 | AC-2 | `apps/example/metro.config.js` and `tsconfig.json` contain no alias entry pointing at `packages/registry` — the fix is upstream, not a consumer shim. |
| TC-6 | AC-3 | `pnpm typecheck` exits 0 with both harness packages compiled. |
| TC-7 | AC-3 | `pnpm registry:build` followed by `git diff --exit-code -- public/r` exits 0. |

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/src/**`
- `packages/registry/scripts/build-registry.ts`
- `public/r/**`
- `apps/harness/tsconfig.json`
- `apps/harness-nativewind/tsconfig.json`
- `apps/example/**`
- `tests/alias-resolution.test.ts`

**WRITE-PROHIBITED**
- `design/style-parity-*.md`
- `.github/workflows/**`
- `apps/harness/src/**`
- `apps/harness-nativewind/src/**`

## Boundary Contracts

- THE CONTRACT, and it is one line: after install, no file under the consumer's `components/` or `lib/` may contain the literal `@/registry/`. That is the whole acceptance surface and it is checkable with one command.
- If the alias shape changes, `packages/registry/src/**`, the emitter, and BOTH harness `tsconfig.json` path maps move in the same commit. A partial migration leaves one harness broken and the failure is a resolution error at Metro time, not at typecheck time.
- `registry.json` `files[].target` values are the consumer's paths and are NOT the alias — do not confuse the two. Only import specifiers inside emitted `content` are in scope.

## Fixtures

- **`installed-consumer-tree`** (cli) — apps/example after TASK-F3's real CLI install: five components/ai files, five RNR components/ui files, and whatever import specifiers the CLI actually wrote into them — the measured, unmodified output of the install.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F4",
  "task_type": "FEATURE",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "installed-consumer-tree": {
      "description": "apps/example after TASK-F3's real CLI install: five components/ai files, five RNR components/ui files, and whatever import specifiers the CLI actually wrote into them \u2014 the measured, unmodified output of the install.",
      "seed_method": "cli",
      "records": [
        "apps/example/components/ai/*.tsx",
        "apps/example/components/ui/*.tsx",
        "the install transcript at design/goldens/sprint-01/install/core-happy-path.json"
      ]
    }
  },
  "requirements": [
    {
      "type": "acceptance_criterion",
      "id": "AC-1",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/alias-resolution.test.ts",
      "test_function": "measures the alias rewrite verdict from the installed consumer tree",
      "verify": "pnpm exec vitest run tests/alias-resolution.test.ts -t \"measures the alias rewrite verdict from the installed consumer tree\"",
      "test_tier": "integration",
      "verification_service": "the real apps/example consumer tree as left by the TASK-F3 install",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F4-1",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "installed-consumer-tree",
        "action": {
          "actor": "maintainer",
          "steps": [
            "count occurrences of the literal `@/registry/` across `apps/example/components/**` and `apps/example/lib/**` as the install left them, per shape",
            "count the same literal across `packages/registry/src/**` for the before figure",
            "write the per-shape counts and the resulting branch label to the verdict artifact"
          ]
        },
        "end_state": {
          "must_observe": [
            "the source-side count is `254` occurrences across `50` of `56` items, split `168` under `components/ui/`, `83` under `lib/`, `3` under `components/ai/`",
            "the verdict artifact names a consumer-side count for each of the three shapes, for example `components/ui: 168 -> 0`",
            "the verdict artifact contains exactly one of the literals `BRANCH A` or `BRANCH B`, with the counts that decided it"
          ],
          "must_not_observe": [
            "a verdict recorded with `0` counts attached, or with no counts at all",
            "counts read from `packages/registry/src` presented as the consumer-side figure \u2014 that would report the pre-install number unchanged",
            "a file under `packages/registry/src/**` modified before the measurement artifact is written"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the counts are hardcoded in the test rather than read from the installed tree",
            "the measurement runs against an empty `apps/example/components` directory and reports `0` because there is nothing to scan",
            "the install was faked by a `cp`, making every count meaningless",
            "the source-side baseline is omitted, so the before and after cannot be compared"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "design/goldens/sprint-01/install/alias-verdict.md"
        }
      }
    },
    {
      "type": "acceptance_criterion",
      "id": "AC-2",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/alias-resolution.test.ts",
      "test_function": "leaves zero registry aliases in the consumer tree without a resolution shim",
      "verify": "pnpm exec vitest run tests/alias-resolution.test.ts -t \"leaves zero registry aliases in the consumer tree without a resolution shim\"",
      "test_tier": "integration",
      "verification_service": "the real apps/example consumer tree and its metro/tsconfig configuration after the TASK-F3 install",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F4-2",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "installed-consumer-tree",
        "action": {
          "actor": "maintainer",
          "steps": [
            "count the literal `@/registry/` across every file under `apps/example/components/**` and `apps/example/lib/**`",
            "read every import specifier in `apps/example/components/ai/message.tsx`",
            "read `apps/example/metro.config.js` and `apps/example/tsconfig.json` and search them for any alias entry resolving to `packages/registry`"
          ]
        },
        "end_state": {
          "must_observe": [
            "the count of `@/registry/` across the consumer tree is exactly `0`, over a scanned file set of at least `10` .tsx files",
            "`apps/example/components/ai/message.tsx` imports `@/components/ui/text` and `@/components/ui/avatar` through the consumer's own alias",
            "`apps/example/metro.config.js` and `apps/example/tsconfig.json` contain `0` alias entries resolving to `packages/registry`"
          ],
          "must_not_observe": [
            "`@/registry/uniwind/components/ui/text` or any sibling specifier surviving in the consumer tree",
            "a `resolver.alias` or extra tsconfig path pointing at `packages/registry` \u2014 the fix belongs upstream, and a consumer shim leaves every real consumer broken while this passes",
            "a scanned file set of `0` files, which would make the zero-count vacuous"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the alias fix is reverted in `packages/registry/src`, which restores the unresolved specifier",
            "a resolution shim is added to the consumer instead, which the third assertion detects",
            "the installed components are replaced by static stubs that import nothing",
            "the scan runs against an empty components directory and reports `0` because there is nothing to scan"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true,
          "path": "design/goldens/sprint-01/install/alias-zero-count.json"
        }
      }
    },
    {
      "type": "acceptance_criterion",
      "id": "AC-3",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/alias-resolution.test.ts",
      "test_function": "keeps both harnesses typechecking and the committed registry byte-exact",
      "verify": "pnpm exec vitest run tests/alias-resolution.test.ts -t \"keeps both harnesses typechecking and the committed registry byte-exact\"",
      "test_tier": "integration",
      "verification_service": "the real apps/harness and apps/harness-nativewind workspaces under tsc, and the real emitter output under public/r",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F4-3",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "installed-consumer-tree",
        "action": {
          "actor": "maintainer",
          "steps": [
            "shell out to `pnpm typecheck` and capture its exit code and the project list it compiled",
            "shell out to `pnpm registry:build`, then to `git diff --exit-code -- public/r`, capturing both exit codes",
            "read both harness `tsconfig.json` path maps and compare the alias segment against the one the sources now import"
          ]
        },
        "end_state": {
          "must_observe": [
            "`pnpm typecheck` exits `0` and its captured output names both `apps/harness` and `apps/harness-nativewind`",
            "`git diff --exit-code -- public/r` exits `0` after a fresh `pnpm registry:build`",
            "both harness `tsconfig.json` files map the same alias segment the sources import, with `0` divergence between them"
          ],
          "must_not_observe": [
            "a typecheck that names only one harness and reports `0` errors having compiled nothing",
            "`public/r` left stale, which the `registry` CI job reports as a non-empty diff",
            "one harness migrated and the other unchanged"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "only one harness tsconfig is updated, leaving the other with an unresolved path",
            "typecheck is narrowed to the root project so the harnesses are omitted from the run",
            "`public/r` is not rebuilt, so emitted content still carries the removed alias",
            "the exit code is swallowed and the assertion passes on a static string"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/goldens/sprint-01/install/harness-typecheck.log"
        }
      }
    },
    {
      "type": "test_case",
      "id": "TC-1",
      "maps_to_ac": "AC-1"
    },
    {
      "type": "test_case",
      "id": "TC-2",
      "maps_to_ac": "AC-1"
    },
    {
      "type": "test_case",
      "id": "TC-3",
      "maps_to_ac": "AC-2"
    },
    {
      "type": "test_case",
      "id": "TC-4",
      "maps_to_ac": "AC-2"
    },
    {
      "type": "test_case",
      "id": "TC-5",
      "maps_to_ac": "AC-2"
    },
    {
      "type": "test_case",
      "id": "TC-6",
      "maps_to_ac": "AC-3"
    },
    {
      "type": "test_case",
      "id": "TC-7",
      "maps_to_ac": "AC-3"
    }
  ]
}
-->
