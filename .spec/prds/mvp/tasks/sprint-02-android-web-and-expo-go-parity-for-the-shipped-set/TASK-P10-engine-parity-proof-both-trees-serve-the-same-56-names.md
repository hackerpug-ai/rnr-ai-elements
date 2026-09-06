# TASK-P10: Engine parity proof: both trees serve the same 56 names, only the engine token differs, meta identical


> Task ID: TASK-P10  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 2  
> Type: INFRA  
> Wave: B  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: none  
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes

## Outcome

tests/sprint-02/engine-parity.test.ts proves the two emitted trees are the same registry: same 56 names in both indexes, every per-item file pair byte-identical after normalizing ONLY the two fan-out segments, meta identical across engines — and a seeded synthetic divergent pair is REPORTED divergent, so the comparator is known to be able to fail.

## Critical Constraints



## Specification

**Objective:** Two describe blocks, named EXACTLY `engine-parity-core` and `engine-parity-divergence-negctl`. The core block: both per-engine index files (public/r/{nativewind,uniwind}/registry.json) hold the same 56 item names; for every item name, the per-item file pair is compared content-wise and must be BYTE-IDENTICAL after normalizing only the two segments the fan-out rewrites — the `@/registry/<engine>/` import alias segment and the engine URL segment in registryDependencies (https://…/r/<engine>/…) — anything else that differs is a divergence and is reported; meta is asserted deeply equal across engines on all 56 items. The divergence negative-control block: a seeded synthetic divergent pair (one file with an extra engine-token difference beyond the two sanctioned segments) is fed to the same comparator and must be REPORTED divergent — the suite FAILS if the comparator does not report the seeded divergence, which is the comparator-visibility guarantee. Goldens: design/goldens/sprint-02/registry/engine-parity.json (per-item parity record) and engine-parity-divergence.json (the negative-control record). RED log: engine-parity.json.RED.log captured from a real failing run (e.g. the comparator stubbed to always-equal, or run against a stale tree), never hand-written. The describe names are deliberately NOT the locked flow ids — UC-REG-04's -t selectors belong to TASK-P13's bash lane; a vitest describe must not impersonate a flow selector, because a -t matching zero tests exits green having run nothing.

**Success state:** 

## Verification Checklist

| Command | Expect |
|---|---|
| `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts` | exit 0, both describes passing, with the core summary line `parity — 56 items x 2 engines — 56 name matches, 0 divergent beyond the engine token, meta identical on all 56` |
| `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "engine-parity-core"` | exit 0 — the core describe is selectable by its own name and prints the 56/0/56 parity summary |
| `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "engine-parity-divergence-negctl"` | exit 0 with the line `negative control: seeded device-only divergence caught — comparator reported divergent: 1` — a pass WITHOUT that report is the failure mode this block exists to catch |
| `grep -n 'engine-parity-core\|engine-parity-divergence-negctl' tests/sprint-02/engine-parity.test.ts && grep -c 'UC-REG-04' tests/sprint-02/engine-parity.test.ts` | both describe names present; the UC-REG-04 grep returns 0 matches — no describe impersonates a flow selector |
| `grep -n 'normaliz' tests/sprint-02/engine-parity.test.ts` | at least 1 match, and its implementation rewrites ONLY @/registry/<engine>/ and the URL engine segment before byte comparison |
| `test -s design/goldens/sprint-02/registry/engine-parity.json.RED.log && head -n 5 design/goldens/sprint-02/registry/engine-parity.json.RED.log` | a non-empty log captured from a real failing run of the core command (comparator stubbed always-equal, or a stale tree), ending in a non-zero exit |
| `pnpm exec vitest run tests/build-registry.test.ts` | the existing root suite passes unmodified |

## Reading List

- `packages/registry/scripts/build-registry.ts` (full) — 
- `tests/build-registry.test.ts` (full) — 
- `AGENTS.md` (full) — 
- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — 

## Guardrails

**WRITE-ALLOWED**
- `tests/sprint-02/engine-parity.test.ts (NEW)`
- `design/goldens/sprint-02/registry/engine-parity.json (NEW)`
- `design/goldens/sprint-02/registry/engine-parity-divergence.json (NEW)`
- `design/goldens/sprint-02/registry/engine-parity.json.RED.log (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `scripts/**`
- `apps/**`
- `tests/build-registry.test.ts`

## Fixtures

- **`seeded_divergent_pair`** (cli) — a synthetic in-memory file pair identical except for one difference beyond the two sanctioned fan-out segments, fed to the same comparator the core block uses

## Design

**Pattern:** deterministic emit makes byte-identity the parity proof, and a seeded divergent sample proves the comparator can fail — the negative-control discipline from sprint-01's F8, re-derived for a source-level comparator
**Pattern source:** `packages/registry/scripts/build-registry.ts:15-16 ("identical input produces byte-identical output") + tests/build-registry.test.ts:57-64 (per-engine outputs differ only by the engine token)`

## Dependencies

- **Depends on:** none
- **Blocks:** none
- **Human test hook:** SPRINT.md gate steps 13-14 — a stranger runs both engine-parity commands and sees the parity summary, then the negative-control run where the seeded divergence is reported; if the negative control passes without reporting, the parity gate is theatre.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P10",
 "task_type": "INFRA",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": false
 },
 "fixtures": {
  "seeded_divergent_pair": {
   "description": "a synthetic in-memory file pair identical except for one difference beyond the two sanctioned fan-out segments, fed to the same comparator the core block uses",
   "seed_method": "cli",
   "records": [
    "the seeded pair differs by exactly one unsanctioned byte run",
    "the comparator must report divergent: 1 or the suite fails"
   ]
  }
 },
 "requirements": []
}
-->
