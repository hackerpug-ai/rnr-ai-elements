# TASK-P12: Emit Expo Go / dev-client status from registry meta so the gallery walk shows it, never silently skips it


> Task ID: TASK-P12  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: INFRA  
> Wave: B  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: none  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

Expo Go classification is computed at build time from meta.nativePeerDependencies against a provenance-cited allowlist, projected into the per-engine index (name/type/title/meta + expoGo + devClient notes), and frozen in a classification golden — the /gallery route consumes the emitted index verbatim with zero hand-maintained labels.

## Critical Constraints



## Specification

**Objective:** Author packages/registry/data/expo-go-allowlist.json from Expo 57's bundledNativeModules (provenance in the header citing expo/expo@sdk-57 packages/expo/bundledNativeModules.json, verified 2026-09-01 per AGENTS.md): IN — react-native-webview, expo-clipboard, expo-document-picker, expo-image-picker, react-native-reanimated, react-native-safe-area-context, react-native-screens, expo-audio; OUT — react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition. Extend build-registry.ts (wave B, after P6's wave A landed): rule `expoGo = meta.nativePeerDependencies.every(m => allowlisted)` — computed at emit time, never a hand-set per-item boolean. The per-engine index projection (currently stripped to name/type/title at build-registry.ts:120) gains name/type/title/meta plus expoGo and devClient notes on the four capability seams: message → `dev client — react-native-enriched-markdown / react-native-streamdown`, speech-input → `dev client — expo-speech-recognition`, audio-player + transcription → audio capture beyond expo-audio. registry.json modifications are limited to devClient note fields ONLY — P6's dependencies/meta arrays are frozen by this point. Re-emit and commit public/r/** with the classification golden at design/goldens/sprint-02/registry/expo-go-classification.json (all 56 items with their computed expoGo and notes). The /gallery route (TASK-P2, another task) consumes the emitted index verbatim.

**Success state:** 

## Verification Checklist

| Command | Expect |
|---|---|
| `head -n 20 packages/registry/data/expo-go-allowlist.json` | a provenance header citing expo/expo@sdk-57 packages/expo/bundledNativeModules.json before the module table |
| `node -e "const a=require('./packages/registry/data/expo-go-allowlist.json');const m=a.modules??a;const inn=['react-native-webview','expo-clipboard','expo-document-picker','expo-image-picker','react-native-reanimated','react-native-safe-area-context','react-native-screens','expo-audio'];const out=['react-native-enriched-markdown','react-native-streamdown','expo-speech-recognition'];console.log(inn.every(x=>m[x]===true),out.every(x=>!m[x]))"` | true true — the 8 bundled modules allowlisted, the 3 dev-client modules not |
| `node -e "const r=require('./public/r/uniwind/registry.json');const i=r.items.find(x=>x.name==='web-preview');console.log(i.expoGo, JSON.stringify(i.meta))"` | true plus web-preview's meta (react-native-webview peer, permissions none) — the index projection carries meta + expoGo, not the old name/type/title strip |
| `node -e "const r=require('./public/r/uniwind/registry.json');const s=r.items.find(x=>x.name==='speech-input');const m=r.items.find(x=>x.name==='message');console.log(s.expoGo, s.devClient, '|', m.devClient)"` | false and a note reading `dev client — expo-speech-recognition`; message's note reads `dev client — react-native-enriched-markdown / react-native-streamdown` — the gate step 10 literals |
| `node -e "const g=require('./design/goldens/sprint-02/registry/expo-go-classification.json');const t=g.items.filter(i=>i.expoGo).length;console.log(g.items.length, t, t>0 && t<56)"` | 56 and a non-degenerate true count strictly between 0 and 56 — the classification actually discriminates |
| `pnpm registry:build && git diff --exit-code public/r` | no diff — the committed trees are fresh against the widened projection |
| `git diff --name-only HEAD~1 -- packages/registry/registry.json | xargs -I{} node -e "const r=require('./packages/registry/registry.json');console.log(Object.keys(r.items.find(i=>i.name==='message')).join(','))" ` | registry.json changes are confined to devClient note fields; dependencies and meta arrays are byte-identical to TASK-P6's landing |

## Reading List

- `AGENTS.md` (full) — 
- `packages/registry/scripts/build-registry.ts` (full) — 
- `packages/registry/registry.json` (full) — 
- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — 

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/data/expo-go-allowlist.json (NEW)`
- `packages/registry/scripts/build-registry.ts (MODIFY)`
- `packages/registry/registry.json (MODIFY — devClient note fields only)`
- `public/r/** (MODIFY)`
- `design/goldens/sprint-02/registry/expo-go-classification.json (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/src/**`
- `tests/**`
- `apps/**`
- `scripts/check-contract.ts`
- `design/research/**`

## Fixtures

- **`p6_landed_registry`** (cli) — packages/registry/registry.json as TASK-P6 landed it: all 56 items carrying explicit meta, dependencies ∪ meta.nativePeerDependencies equal to the imported set

## Design

**Pattern:** projection at emit time from one data file; consumers read the emitted index verbatim — the same determinism that lets the freshness CI diff a fresh build against the committed tree
**Pattern source:** `packages/registry/scripts/build-registry.ts:118-121 (per-engine index writeFileSync projecting items to name/type/title) — this task widens that projection`

## Dependencies

- **Depends on:** none
- **Blocks:** none
- **Human test hook:** SPRINT.md gate step 10 — the Expo Go badge on `web-preview` and the four dev-client note rows read straight off the emitted index; also gate step 20, where the whole set must load in Expo Go with no screen naming a dev-client module.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P12",
 "task_type": "INFRA",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": false,
  "requires_red_evidence": false,
  "requires_seeded_evidence": false
 },
 "fixtures": {
  "p6_landed_registry": {
   "description": "packages/registry/registry.json as TASK-P6 landed it: all 56 items carrying explicit meta, dependencies ∪ meta.nativePeerDependencies equal to the imported set",
   "seed_method": "cli",
   "records": [
    "56 items each with a meta block",
    "TASK-P9's suite green against this tree"
   ]
  }
 },
 "requirements": []
}
-->
