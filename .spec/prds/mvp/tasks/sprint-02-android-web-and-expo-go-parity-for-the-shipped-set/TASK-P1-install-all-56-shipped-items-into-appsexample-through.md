# TASK-P1: Install all 56 shipped items into apps/example through the real RNR CLI from the v0.1.0 tag, peers at Expo 57's pin, Expo Go-clean graph


> Task ID: TASK-P1  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: INFRA  
> Wave: A  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: none  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

apps/example carries all 56 shipped items installed by the real CLI from the tag, peers pinned by Expo 57, with a graph Expo Go can load without a dev client.

## Critical Constraints

- MUST: Install every item with the real RNR CLI from absolute v0.1.0 tag URLs (raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/...); the 51 new items print one Created components/<ai|ui>/<name>.tsx line each and the set totals 56 with the 5 sprint-01 items already present
- MUST: Add every RN/Expo peer with npx expo install so the resolver holds Expo 57's pins — react-native-webview must resolve 13.16.1, react-native-gesture-handler ~2.32.0, react-native-reanimated 4.5.1, react-native 0.86.3
- MUST: Finish with npx expo-doctor clean inside apps/example
- NEVER re-add the 5 items sprint-01 already installed (conversation, message, prompt-input, tool, context plus their ui primitives) — the existing files stay untouched
- NEVER resolve @/components/ui/* through packages/registry or apps/harness; a workspace alias back into the monorepo invalidates every sprint-02 finding
- NEVER let react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition, or audio capture beyond expo-audio enter apps/example's dependency graph
- STRICTLY `npx expo install` for every RN/Expo package — never npm install, never npm latest (webview 14.0.1 and gesture-handler 3.2.1 break the native build at runtime, not at install)

## Specification

**Objective:** Take apps/example from sprint-01's 5-item walking skeleton to the full 56-item shipped set, installed exactly the way a stranger would install it — the real RNR CLI against the v0.1.0 tag, peers resolved by Expo 57's own pins — with a graph that Expo Go can still load.

**Success state:** All 56 registry items exist as files under apps/example/components/{ai,ui}, none of the sprint-01 files was re-added or modified, expo-doctor reports no drift, react-native-webview resolves 13.16.1, and no dev-client module appears anywhere in the dependency graph.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -e "const r=require('./packages/registry/registry.json');const fs=require('fs');let n=0;for(const i of r.items){if(fs.existsSync('apps/example/'+i.files[0].target))n++};console.log(n+'/56 registry items installed')"` | prints `56/56 registry items installed` |
| `git ls-files -m apps/example/components | wc -l` | prints 0 — none of the 5 sprint-01-installed files was re-added or modified |
| `node -p "require('./apps/example/package.json').dependencies['react-native-webview']"` | prints 13.16.1 — 14.0.1 (npm latest) is a FAIL |
| `node -p "require('./apps/example/package.json').dependencies['react-native-reanimated'] + ' / ' + require('./apps/example/package.json').dependencies['react-native-gesture-handler']"` | prints 4.5.1-era and ~2.32.0 pins (expo install's tilde ranges), never 4.6.0 / 3.2.1 |
| `node -p "Object.keys(require('./apps/example/package.json').dependencies).filter(d=>['react-native-enriched-markdown','react-native-streamdown','expo-speech-recognition'].includes(d)).length"` | prints 0 — no dev-client module in the graph |
| `grep -rln "packages/registry\|apps/harness" apps/example/components | wc -l` | prints 0 — the consumer tree resolves nothing through the monorepo |
| `cd apps/example && npx expo-doctor` | exit 0 with no version-drift lines against Expo 57's bundledNativeModules pins |
| `pnpm typecheck && pnpm lint` | both exit 0 — every installed file typechecks inside the consumer tree |

## Reading List

- `AGENTS.md` (66-98) — the binding Expo 57 pin table (webview 13.16.1 not 14.0.1), 'Always npx expo install', and expo-doctor as the drift gate
- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (63-64) — gate steps 1-2: the Created-line-per-item expectation, `56/56 gallery items present`, the webview pin line, `dev-client modules in graph: none`, and the first full-set Android resolve
- `packages/registry/registry.json` (full) — the 56 items, their files[].target install paths, and registryDependencies as absolute {engine} URLs
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F3-install-the-walking-skeleton-item-set-into-apps-example-thro.md` (full) — the sprint-01 precedent: real-CLI install from the tag, which 5 items already exist, and the URL form the CLI rewrites
- `AGENTS.md` (128-137) — the four dev-client-only items and why message's renderMarkdown seam keeps the core surface in Expo Go

## Guardrails

**WRITE-ALLOWED**
- `apps/example/components/ai/** (NEW)`
- `apps/example/components/ui/** (NEW)`
- `apps/example/package.json (MODIFY)`
- `pnpm-lock.yaml (MODIFY)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `apps/example/app/**`
- `apps/example/gallery/**`
- `apps/example/components/gallery/**`
- `tests/**`
- `.maestro/**`
- `design/**`

## Design

**References:** AGENTS.md 'Distribution — registry only, no npm package' (absolute https registryDependencies; a short name installs a DOM component); SPRINT.md gate step 1 (install contract) and step 2 (first full-set consumer resolve)
**Pattern:** the sprint-01 walking-skeleton install: real `@react-native-reusables/cli add <absolute-tag-url>` per item, peers via expo install, verified by file-presence counts and expo-doctor
**Pattern source:** `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F3-install-the-walking-skeleton-item-set-into-apps-example-thro.md`
**Anti-pattern:** a workspace alias into packages/registry or apps/harness to 'save' the install — it would make apps/example not a consumer and invalidate every parity finding in this sprint
- The install is the product here: a stranger replays it from the README-less CLI alone, so every URL must be the tag URL and every peer must come from expo install
- The five sprint-01 files are the control group — if any of them changes, the install was not additive and the tree is no longer 'what the CLI emits'

## Boundary Contracts

- @/components/ui/* resolves only inside apps/example's own tree — never packages/registry, never apps/harness
- message keeps its injected renderMarkdown prop with the plain RNR Text default; no native markdown renderer is wired into the example app
- the four dev-client capabilities stay out of the graph: react-native-enriched-markdown, react-native-streamdown, expo-speech-recognition, audio capture beyond expo-audio

## Dependencies

- **Depends on:** none
- **Blocks:** TASK-P2, TASK-P5, TASK-P13
- **Human test hook:** After the install, run `cd apps/example && npx expo-doctor` (expect no version-drift lines), then `cd apps/example && npx expo run:android` on Pixel_7_API_34 (expect launch with no red screen and no `Unable to resolve module '@/registry/uniwind/components/ui/text'` or any sibling) — the sprint gate's steps 1-2.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P1",
 "task_type": "INFRA",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": false,
  "requires_red_evidence": false,
  "requires_seeded_evidence": false
 },
 "fixtures": {},
 "requirements": []
}
-->
