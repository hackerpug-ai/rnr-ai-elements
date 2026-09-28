# FIX-ORI-SUITE-2-1: Route the aggregate failures that are outside FIX-ORI-SUITE-2

## What this does

Records one owner for every test file the single `pnpm test` run failed, without adding those files to FIX-ORI-SUITE-2's residual and without editing the four chartered suites.

The recorded run is head `8ee4282f24474eb8824e5a92685063f1070a12d6`. It did not collect `ORI-VIS-005-ac-5`. `charter_residual_match` is false. The only residual token remains `FLOW-DELIV-01-ci-chain-order`, owned by ORI-DEP-002 and ORI-DEP-003. Files whose recorded error is a missing `dev-client-matrix.json`, `token-usage.json`, or generated `registry-items.json` stay report-only: that worktree was missing the two HEAD-tracked data files, so the cold build stopped. Files already chartered by another task stay with that task. Proof scripts that Vitest collected with "No test suite found" stay with the task that added the script.

## How to verify

```sh
pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts
```

## Scope

writeAllowed:

- tests/sprint-05-orient-search/aggregate-owner-routing.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/FIX-ORI-SUITE-2-1/owner-routing.json (NEW)
- tests/sprint-05-orient-search/evidence/FIX-ORI-SUITE-2-1/aggregate-inventory.json (NEW)
- .spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2-1.md (NEW)

writeProhibited:

- tests/sprint-05-orient-search/docs-collection.test.ts
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts
- tests/sprint-05-orient-search/live-example-api.test.ts
- tests/sprint-05-orient-search/nativewind-live-example.test.ts
- .spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md
- apps/**, packages/**, scripts/**

> Status: ⬜ Pending

AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

### ACCEPTANCE CRITERIA

#### AC-1: Every recorded aggregate failure has an owner and the residual is unchanged

GIVEN the committed inventory of the one `pnpm test` WHEN the routing record and this task's test run THEN every failed test file has one route, the residual token list is exactly `FLOW-DELIV-01-ci-chain-order`, `ORI-VIS-005-ac-5` was not collected, and git diff against main shows no change to the four chartered suites or to TASK-FIX-ORI-SUITE-2.md.

- TEST_FILE: tests/sprint-05-orient-search/aggregate-owner-routing.test.ts
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts`
