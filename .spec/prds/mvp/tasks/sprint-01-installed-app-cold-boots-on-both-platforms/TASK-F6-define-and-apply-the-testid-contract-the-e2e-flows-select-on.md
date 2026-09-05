# TASK-F6: Define and apply the testID contract the e2e flows select on

> Task ID: TASK-F6  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 2  
> Type: INFRA  
> Wave: F  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-F5

## Outcome

One frozen id map exists and every selector the locked Maestro flow uses is applied in apps/example's own files, with none inside a CLI-installed component.

## Critical Constraints

- NEVER add a testID by editing a file under apps/example/components/ai/. Those are CLI-installed. Editing one to make a test selectable destroys the only evidence that the install produces working files, and the next `add` would overwrite it anyway. Pass ids through existing props or apply them to the example app's own wrapper Views.
- Maestro selects by `id:` only. No flow may select on visible text: once sprint 04 introduces real streaming the text is non-deterministic and text selectors become the flake source the flake policy forbids.
- Ids live in ONE exported frozen map so a rename is a compile error, not a silently dead selector.
- The ids `app-header`, `transcript-message-0`, `tool-badge-completed`, `context-trigger`, `composer-send` are referenced by regex inside .spec/e2e-policy/surface.json, which is LOCKED. Renaming any of them silently vacates the surface policy.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -e "const m=require('./apps/example/e2e-ids.ts');console.log(Object.keys(m.E2E_IDS).length)"` | prints 6: app-header, transcript-message-0, tool-badge-completed, context-trigger, context-popover-content, composer-send |
| `node -e "const m=require('./apps/example/e2e-ids.ts');m.E2E_IDS.appHeader='x'"` | throws — the map is frozen, so a rename is a compile/runtime error rather than a silently dead selector |
| `for id in app-header transcript-message-0 tool-badge-completed context-trigger context-popover-content composer-send; do grep -rq "$id" apps/example/app/ || echo "MISSING $id"; done` | prints nothing; every id in the map is applied somewhere under apps/example/app/ |
| `grep -rc 'testID' apps/example/components/ai/` | returns 0 for every file; no CLI-installed component carries an id |
| `git diff --name-only -- apps/example/components/ai/` | prints 0 lines while `git diff --name-only -- apps/example/app/` prints at least 1 |
| `for id in app-header transcript-message-0 tool-badge-completed; do grep -q "$id" .spec/e2e-policy/surface.json || echo "DRIFT $id"; done` | prints nothing; the ids match the LOCKED surface policy character-for-character |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8 AC-1**. Delegated assertions:

- each of the 6 selectors resolves to exactly one element on iOS and on Android under `maestro test .maestro/cold-boot.yaml` (gate steps 8, 11)

## Guardrails

**WRITE-ALLOWED**
- `apps/example/e2e-ids.ts`
- `apps/example/app/**`
- `apps/example/components/**`

**WRITE-PROHIBITED**
- `apps/example/components/ai/**`
- `packages/registry/**`
- `public/r/**`
- `scripts/e2e/**`
- `.maestro/**`
- `.spec/e2e-policy/**`

## Fixtures

- **`seeded_transcript`** (recorded_external) — apps/example/fixtures/transcript.json committed: 1 user part, 1 assistant text part, 1 completed tool part
- **`rendered_home_route`** (ui_flow) — apps/example / route mounted on a booted simulator from the committed fixture with no network call

## Notes

- Reclassified FEATURE -> INFRA. A contract file applied to a screen is test infrastructure, not product behavior. React Native maps testID to accessibilityIdentifier on iOS and resource-id on Android, so one map serves both flows with no per-platform branch.
- context-trigger and context-popover-content exist so the PortalHost proof runs inside the MAIN flow rather than only in the hostile-app journey at steps 13-15.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F6",
  "task_type": "INFRA",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
    "requires_seeded_evidence": false
  },
  "fixtures": {
    "seeded_transcript": {
      "description": "apps/example/fixtures/transcript.json committed: 1 user part, 1 assistant text part, 1 completed tool part",
      "seed_method": "recorded_external",
      "records": [
        "assistant text part reads `Registry item installed.`",
        "tool part state is `output-available`",
        "tool part toolName is `searchRegistry`"
      ]
    },
    "rendered_home_route": {
      "description": "apps/example / route mounted on a booted simulator from the committed fixture with no network call",
      "seed_method": "ui_flow",
      "records": [
        "3 transcript rows mounted",
        "header text `AI Elements Example`"
      ]
    }
  },
  "requirements": []
}
-->
