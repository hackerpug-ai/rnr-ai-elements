# TASK-F4: Make every emitted import resolve inside a consumer tree

> Task ID: TASK-F4  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 8  
> Type: INFRA
> Wave: D  
> Status: ✅ Completed
> TDD Mode: `skipped` · RED_GREEN_REQUIRED: no
> Proposed By: `react-native-reusables-planner`
> Depends On: TASK-F3
> Commit: 6c39b7df31b6e6a167cc1a7c7c8be76570523c07

**Sizing rationale.** THE CONDITIONAL IS THE POINT AND IT IS NOT AVERAGED. Two branches, and which one runs is unknowable until TASK-F3 has installed once. BRANCH A — the CLI already rewrites the three-segment `@/registry/{engine}/components/ai|components/ui|lib` shape: this task collapses to pinning the evidence and adding the regression assertion, and is worth 2 points. BRANCH B — it does not: the source alias must change to a shape the CLI does rewrite, and 50 files, the emitter and both harness tsconfigs migrate together, which is 8. Carried at 8 because a sprint sized on the optimistic branch has no slack when the pessimistic one fires, and because BRANCH B is the branch that makes this the sprint's real unknown. Re-size to 2 the moment AC-1's verdict is recorded — do not silently keep 8 if Branch A holds.

## Outcome

This is the sprint's real unknown and the task is written so the conditional survives contact. 254 imports across 50 of 56 items in three shapes; only the six registry:lib items are clean. AC-1 exists to force the measurement BEFORE the migration: run TASK-F3's install, count what the CLI actually wrote, commit the verdict naming Branch A or Branch B with its raw counts. If Branch A holds — the CLI already rewrites all three shapes — say so, re-size this task to 2 points, and hand the correction back rather than quietly spending eight. If Branch B holds, change the source alias to a shape the CLI does rewrite and migrate 50 sources, the emitter and BOTH harness tsconfigs in one commit; a partial migration surfaces as a Metro resolution error, not a typecheck error, which is the worst place to find it. The single line that matters: the fix goes UPSTREAM. `apps/example/**` is in write_allowed only for reverting install side-effects. A Metro `resolver.alias` or an extra tsconfig path in the consumer turns this green while leaving every real consumer broken, and TC-5 exists specifically to catch that.

## Critical Constraints

- RUN TASK-F3 FIRST AND READ WHAT LANDED BEFORE CHANGING ANYTHING. The measured surface is 254 imports across 50 of 56 items in three shapes — 168 `components/ui/`, 83 `lib/`, 3 `components/ai/`; only the 6 registry:lib items are clean. The CLI may already rewrite all three. Changing 50 files before looking is the expensive mistake available here.
- DO NOT PATCH `apps/example` TO MAKE THE BOOT WORK. A Metro `resolver.alias`, an extra tsconfig path, or a workspace symlink in the consumer would turn this task green while leaving every real consumer broken — and it would make the install evidence from TASK-F3 worthless. `apps/example/**` is in write_allowed ONLY for reverting install side-effects, never for adding resolution shims.
- The verdict in AC-1 is recorded whichever way it falls. A task that finds the CLI already works is a SUCCESS with a 2-point cost, not a task with nothing to show. Record it and hand the sizing correction back.

## Verification Checklist

| Command | Expect |
|---|---|
| `grep -cE 'BRANCH A\|BRANCH B' design/goldens/sprint-01/install/alias-verdict.md && grep -cE 'components/ui:\|lib:\|components/ai:' design/goldens/sprint-01/install/alias-verdict.md` | exactly one branch literal, and a consumer-side count recorded for each of the three shapes (for example `components/ui: 168 -> 0`). A verdict with 0 counts attached, or with no counts at all, does not count as recorded. |
| `grep -ro '@/registry/' packages/registry/src/ \| wc -l && grep -rlo '@/registry/' packages/registry/src/ \| wc -l` | 254 occurrences across 50 of 56 items — 168 under components/ui/, 83 under lib/, 3 under components/ai/; only the 6 registry:lib items are clean. This is the BEFORE baseline and it must be captured before any source file is edited. |
| `git log --oneline --name-only -- design/goldens/sprint-01/install/alias-verdict.md packages/registry/src/` | alias-verdict.md is committed in an EARLIER commit than any packages/registry/src change — measure first, migrate second. Changing 50 files before looking is the expensive mistake available here. |
| `grep -rc '@/registry/' apps/example/components/ apps/example/lib/ \| grep -v ':0$'; find apps/example/components -name '*.tsx' \| wc -l` | THE CONTRACT: the first command prints nothing (0 occurrences of the literal `@/registry/` anywhere in the consumer tree) over a scanned set of at least 10 .tsx files. A count of 0 over an empty directory is vacuous and fails. |
| `grep -nE 'packages/registry' apps/example/metro.config.js apps/example/tsconfig.json; echo "matches=$?"` | 0 matches. THE LOAD-BEARING ROW: a `resolver.alias` or an extra tsconfig path pointing at packages/registry would make the cold-boot flow pass while leaving every real consumer broken. It is the one failure the device flow cannot see, so it must be checked here. |
| `grep -n 'registry' apps/example/components/ai/message.tsx \|\| grep -n "@/components/ui/" apps/example/components/ai/message.tsx` | message.tsx imports `@/components/ui/text` and `@/components/ui/avatar` through the CONSUMER's own alias, with no `@/registry/` specifier surviving |
| `pnpm typecheck` | exits 0, and its output names BOTH apps/harness and apps/harness-nativewind. One harness migrated and the other left behind is the partial-migration failure, and it surfaces at Metro time rather than typecheck time if this is skipped. |
| `pnpm registry:build && git diff --exit-code -- public/r` | exits 0 — the alias change, the emitter and the re-emitted tree land in one commit, or the `registry` CI job goes red on staleness |
| `cd apps/example && npx expo run:ios && npx expo run:android` | both build and draw the header `AI Elements Example` with no `Unable to resolve module` in Metro output |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8/AC-1**. Delegated assertions:

- the app built from the installed consumer tree cold-boots on an iOS simulator and a Pixel_7_API_34 emulator with no red screen (gate steps 4, 10) — a surviving `@/registry/` specifier fails Metro with `Unable to resolve module` and no boot is possible, so this is a strictly stronger check than the zero-count grep
- two `Flow Passed` lines, one per platform, from `bash tests/sprint-01/install-core.test.sh UC-REG-01/core-happy-path` exiting 0 — every rewritten specifier across the five components/ai and five components/ui files must resolve for either line to print
- the header, the seeded transcript rows and the tool badge render on both platforms, which requires the installed components' own imports of `@/components/ui/text`, `avatar`, `button` and `icon` to resolve through the consumer's alias
- NOT delegated, and deliberately kept in this task's checklist: the absence of a consumer-side resolution shim. A metro `resolver.alias` would make every assertion above pass while the upstream defect survives, so checklist row 5 is the only place that failure is caught.

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/src/**`
- `packages/registry/scripts/build-registry.ts`
- `public/r/**`
- `apps/harness/tsconfig.json`
- `apps/harness-nativewind/tsconfig.json`
- `apps/example/**`
- `tests/sprint-01/alias-resolution.test.ts`

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
  - apps/example/components/ai/*.tsx
  - apps/example/components/ui/*.tsx
  - the install transcript at design/goldens/sprint-01/install/core-happy-path.json

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F4",
  "task_type": "INFRA",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
    "requires_seeded_evidence": false
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
  "requirements": []
}
-->
