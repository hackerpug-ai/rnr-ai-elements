# TASK-P9: CI test: declared peers and permissions match the source's actual imports, both directions, both engines


> Task ID: TASK-P9  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 5  
> Type: INFRA  
> Wave: B  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: none  
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes

## Outcome

tests/sprint-02/registry-meta.test.ts walks all 56 items against their real source files and proves dependencies ∪ meta.nativePeerDependencies equals the imported set in BOTH directions, every permissions key is vocabulary-valid, and both engine trees carry identical meta — with a RED log captured against the pre-P6 tree naming the two live holes.

## Critical Constraints



## Specification

**Objective:** The suite reads packages/registry/registry.json, walks every item's files[].path under packages/registry/src (asserting the walk is non-empty: 56 items, every file exists on disk), extracts bare external imports from the real source (excluding react, react-native, react/* subpaths, and @/registry/{engine}/* consumer aliases), and asserts set equality both directions against dependencies ∪ meta.nativePeerDependencies: used-but-undeclared must be 0 AND declared-but-unused must be 0, with exactly four permitted imported-nowhere entries — the dev-client caller modules react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition, and audio capture beyond expo-audio (the seam beyond expo-audio's Expo Go surface). Every meta.permissions key is validated against an inline vocabulary table mapping capability → iOS Info.plist key + Android manifest permission (microphone → NSMicrophoneUsageDescription / RECORD_AUDIO); an unknown key fails. The suite asserts public/r/nativewind and public/r/uniwind carry identical meta on every item (the fan-out must not leak engine-specific meta). It fails on an empty walk — a suite that scans nothing prints three zeros vacuously. The RED log is CAPTURED, not written: `git worktree add` at the commit before TASK-P6 landed, run this suite there, capture it failing by naming speech-input + react-native-reanimated and prompt-input + expo-document-picker as used-but-undeclared, then commit the log at design/goldens/sprint-02/registry/meta-declarations.json.RED.log beside the golden.

**Success state:** 

## Verification Checklist

| Command | Expect |
|---|---|
| `pnpm exec vitest run tests/sprint-02/registry-meta.test.ts` | exit 0 and the literal summary line `56 items x 2 engines — 0 used-but-undeclared, 0 declared-but-unused, 0 invalid permissions` |
| `head -n 40 design/goldens/sprint-02/registry/meta-declarations.json.RED.log` | a real captured failing run naming `speech-input` + `react-native-reanimated` and `prompt-input` + `expo-document-picker` as used-but-undeclared, taken against the pre-P6 tree — proof the holes were fixed, not hidden |
| `node -e "const fs=require('fs');const r=JSON.parse(fs.readFileSync('packages/registry/registry.json'));const s=r.items.find(i=>i.name==='speech-input');s.meta.nativePeerDependencies=s.meta.nativePeerDependencies.filter(d=>d!=='react-native-reanimated');fs.writeFileSync('packages/registry/registry.json',JSON.stringify(r,null,2))" && pnpm exec vitest run tests/sprint-02/registry-meta.test.ts; git checkout -- packages/registry/registry.json` | the suite FAILS (exit 1) reporting speech-input used-but-undeclared react-native-reanimated — the negative control proves the comparator can fire; the checkout restores the tree |
| `grep -n 'NSMicrophoneUsageDescription' tests/sprint-02/registry-meta.test.ts` | at least 1 match — the inline vocabulary table maps microphone → NSMicrophoneUsageDescription / RECORD_AUDIO and unknown permission keys fail |
| `grep -n 'packages/registry/src' tests/sprint-02/registry-meta.test.ts` | at least 1 match — the suite reads the real source paths from registry.json, not a copied list |
| `pnpm exec vitest run tests/build-registry.test.ts` | the existing root suite still passes, unmodified — this task adds a lane, it does not edit the root |
| `pnpm registry:build && git diff --exit-code public/r` | no diff — the suite is read-only over the emitted trees |

## Reading List

- `tests/build-registry.test.ts` (full) — 
- `packages/registry/scripts/build-registry.ts` (full) — 
- `AGENTS.md` (full) — 
- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — 

## Guardrails

**WRITE-ALLOWED**
- `tests/sprint-02/registry-meta.test.ts (NEW)`
- `design/goldens/sprint-02/registry/meta-declarations.json (NEW)`
- `design/goldens/sprint-02/registry/meta-declarations.json.RED.log (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `scripts/**`
- `apps/**`
- `design/research/**`
- `tests/build-registry.test.ts`

## Fixtures

- **`pre_p6_worktree`** (cli) — a git worktree at the parent commit of TASK-P6, where the two undeclared-import holes are live

## Design

**Pattern:** walk the real committed tree and assert exact set equality both directions, reading paths from the registry data rather than a copied list
**Pattern source:** `tests/build-registry.test.ts:44-55 (asserts against real path strings with exact toEqual, no mocks) + packages/registry/scripts/build-registry.ts:111-113 (items mapped with a readFile that hits the real disk)`

## Dependencies

- **Depends on:** none
- **Blocks:** none
- **Human test hook:** SPRINT.md gate step 11 — a stranger runs `pnpm exec vitest run tests/sprint-02/registry-meta.test.ts` and reads the three-zero summary plus the RED log naming the two holes this sprint closed.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P9",
 "task_type": "INFRA",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": false
 },
 "fixtures": {
  "pre_p6_worktree": {
   "description": "a git worktree at the parent commit of TASK-P6, where the two undeclared-import holes are live",
   "seed_method": "cli",
   "records": [
    "git worktree add at TASK-P6's parent commit",
    "speech-input.tsx imports react-native-reanimated while the entry declares nothing"
   ]
  }
 },
 "requirements": []
}
-->
