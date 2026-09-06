# TASK-P6: Declare meta.nativePeerDependencies and meta.permissions on every item that needs them, mined from actual imports, emitted through the build into public/r


> Task ID: TASK-P6  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 5  
> Type: INFRA  
> Wave: A  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: none  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

All 56 registry items carry an explicit meta block (nativePeerDependencies + permissions) that matches their source's actual imports, typed on RegistryItem so the existing spread emits it into all 112 per-item public/r files, with the two live used-but-undeclared holes closed in the arrays and the re-emitted trees committed in the same commit.

## Critical Constraints



## Specification

**Objective:** Mine each item's real external imports from its files[].path sources under packages/registry/src. Fix packages/registry/registry.json so dependencies ∪ meta.nativePeerDependencies equals the imported set: speech-input imports react-native-reanimated (speech-input.tsx line 16) but declares nothing — add it; prompt-input imports expo-document-picker + expo-image-picker (prompt-input.tsx lines 16-17) but declares only react-native-safe-area-context — add both. Items with no native module get explicit empty declarations (meta.nativePeerDependencies: [], meta.permissions: {}), because absence is indistinguishable from not-yet-mined and TASK-P9's bidirectional set equality needs an explicit empty set. Add `meta?: { nativePeerDependencies?: string[]; permissions?: Record<string, string>; devClient?: string[] }` to RegistryItem in packages/registry/scripts/build-registry.ts — the existing `{...item}` spread in buildItem then emits meta into every per-item file for both engines with zero fan-out changes. permissions keys are capability-derived (speech-input → microphone, per the gate step 10 card row) and validated downstream against P9's Info.plist/manifest vocabulary. Re-run `pnpm registry:build` and commit the regenerated public/r/** in the SAME commit as the registry.json edit — the registry CI job diffs a fresh build against the committed tree, so a data-only commit leaves a red freshness gate.

**Success state:** 

## Verification Checklist

| Command | Expect |
|---|---|
| `node -e "const r=require('./packages/registry/registry.json');const s=r.items.find(i=>i.name==='speech-input');console.log(JSON.stringify(s.meta))"` | meta.nativePeerDependencies contains "react-native-reanimated" and meta.permissions contains the microphone key — the first live hole, closed in the array |
| `node -e "const r=require('./packages/registry/registry.json');const p=r.items.find(i=>i.name==='prompt-input');console.log(JSON.stringify({d:p.dependencies,m:p.meta}))"` | expo-document-picker and expo-image-picker appear in dependencies ∪ meta.nativePeerDependencies alongside react-native-safe-area-context — the second live hole |
| `node -e "const r=require('./packages/registry/registry.json');console.log(r.items.length, r.items.filter(i=>i.meta&&Array.isArray(i.meta.nativePeerDependencies)).length)"` | 56 56 — every item carries an explicit meta block, empty arrays where none |
| `node -e "const a=require('./public/r/nativewind/speech-input.json').meta,b=require('./public/r/uniwind/speech-input.json').meta,c=require('./packages/registry/registry.json').items.find(i=>i.name==='speech-input').meta;console.log(JSON.stringify(a)===JSON.stringify(b), JSON.stringify(a)===JSON.stringify(c))"` | true true — the spread emitted meta into both engine trees byte-identically from the source declaration |
| `pnpm registry:build && git diff --exit-code public/r` | build prints "registry built — 56 item(s) x 2 engine(s) = 112 file(s) under public/r/" and the diff exits 0 — the committed tree is fresh |
| `git status --porcelain packages/registry/src` | no output — zero component source files touched; the fix lives in the arrays |
| `pnpm exec tsx scripts/check-contract.ts` | contract OK — the styling contract stays green against the same trees (meta edits introduce no forbidden pattern) |
| `pnpm exec vitest run tests/build-registry.test.ts && pnpm typecheck` | the existing root suite passes unmodified and typecheck exits 0 — meta is typed on RegistryItem, not cast around |

## Reading List

- `AGENTS.md` (full) — 
- `packages/registry/scripts/build-registry.ts` (full) — 
- `packages/registry/registry.json` (full) — 
- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — 

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/registry.json (MODIFY)`
- `packages/registry/scripts/build-registry.ts (MODIFY)`
- `public/r/** (MODIFY)`
- `design/goldens/sprint-02/registry/** (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/src/**`
- `tests/**`
- `scripts/**`
- `apps/**`
- `design/research/**`

## Fixtures

- **`pre_p6_registry`** (cli) — the committed registry.json at sprint-02 entry: speech-input declares no dependencies while importing react-native-reanimated; prompt-input declares only react-native-safe-area-context while importing expo-document-picker + expo-image-picker

## Design

**Pattern:** additive RegistryItem field emitted by the existing spread — buildItem returns {...item, ...} so a new typed field fans out to both engines with no fan-out logic change
**Pattern source:** `packages/registry/scripts/build-registry.ts:86-97 (buildItem spread) and :115 (per-item writeFileSync of the full built item)`

## Dependencies

- **Depends on:** none
- **Blocks:** none
- **Human test hook:** SPRINT.md gate step 10 — the /gallery card rows read the SHIPPED declarations this task emits (`web-preview` → react-native-webview + permissions `none` + Expo Go badge; `speech-input` → microphone + dev-client note), not hand labels.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P6",
 "task_type": "INFRA",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": false,
  "requires_red_evidence": false,
  "requires_seeded_evidence": false
 },
 "fixtures": {
  "pre_p6_registry": {
   "description": "the committed registry.json at sprint-02 entry: speech-input declares no dependencies while importing react-native-reanimated; prompt-input declares only react-native-safe-area-context while importing expo-document-picker + expo-image-picker",
   "seed_method": "cli",
   "records": [
    "speech-input entry has no dependencies key and no meta key",
    "prompt-input dependencies === [\"react-native-safe-area-context\"]"
   ]
  }
 },
 "requirements": []
}
-->
