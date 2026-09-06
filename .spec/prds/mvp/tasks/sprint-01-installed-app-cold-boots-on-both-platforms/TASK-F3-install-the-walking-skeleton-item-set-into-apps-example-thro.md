# TASK-F3: Install the walking-skeleton item set into apps/example through the real RNR CLI from the pinned URL

> Task ID: TASK-F3  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: INFRA
> Wave: C  
> Status: ⬜ Pending    
> TDD Mode: `skipped` · RED_GREEN_REQUIRED: no
> Proposed By: `react-native-reusables-planner`
> Depends On: TASK-F1, TASK-F2

## Outcome

Five items in one command, then boot. The whole value of this task is that the resolver path is REAL, so that when a later sprint finds a class compiling to nothing nobody can attribute it to a harness shortcut. The fakeability floor is specific and I checked it: `components/ui/popover.tsx` exists NOWHERE in this repository — our eleven registry:ui items are kbd, breadcrumb, button-group, slider, table, command, code-block, empty, item, input-group, sheet — so its presence in the consumer tree after the run is proof the RNR registry was actually reached. `cp` cannot produce it. That is why `context.json` is in the install list and not just the four chat items: it is the only cheap way to pull a portalling RNR primitive, and without it gate step 15's PortalHost assertion has nothing to observe. If anything fails to resolve, fix `registry.json`, rebuild, re-tag, re-run — never place a file by hand. A hand-placed file here is the exact lie this task exists to prevent.

## Critical Constraints

- DO NOT HAND-PLACE A FILE TO MAKE THE BOOT WORK. This is the one instruction that matters. A `cp` from `packages/registry/src` into `apps/example/components` produces a green boot and destroys the only evidence this sprint exists to produce — and it silently invalidates TASK-F4's finding as well, because F4 reads what F3's install actually landed.
- FOUR ITEMS PLUS CONTEXT, NOT 56. The full-matrix both-engine install is CAP-DIST-01's own sprint. Doubling it here buys nothing and costs a day.
- The `--yes` flag is FORBIDDEN on the gate-step-13 run. That run exists to demonstrate the overwrite prompt (UC-REG-01 AC-3), and `--yes` suppresses the only thing it is proving. The coldboot policy carries a `forbidden_seed_patterns` entry for exactly this.
- Use `$TMPDIR` for the hostile app in steps 13-15, never a hardcoded `/tmp`, per the repo's scratch-artifacts standard.

## Verification Checklist

| Command | Expect |
|---|---|
| `cd apps/example && npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/context.json 2>&1 \| tee "$TMPDIR/f3-install.log"` | runs against fixture `rnr-initialized-example-app`. exit 0, and one `Created` line for each of components/ai/{conversation,message,prompt-input,tool,context}.tsx AND for each of components/ui/{text,avatar,button,icon,popover}.tsx — five ours, five RNR's, from one command |
| `grep -c 'raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0' "$TMPDIR/f3-install.log"; grep -c 'reactnativereusables.com' "$TMPDIR/f3-install.log"; grep -cE '404\|Cannot find module' "$TMPDIR/f3-install.log"` | both host counts are >= 1 and the error count is exactly 0 — ours resolve from the pinned tag, RNR's primitives resolve from RNR, and nothing 404s |
| `ls apps/example/components/ui/popover.tsx && git ls-files packages/registry/src \| grep -c 'ui/popover.tsx'` | the file exists in the consumer and the repo-side count is 0 — THE FAKEABILITY FLOOR: popover.tsx exists nowhere in this repository, so no `cp` can have produced it |
| `cd "$TMPDIR/pristine-scratch-app" && find . -path ./node_modules -prune -o -name '*.tsx' -print \| grep -cE 'components/(ai\|ui)/' && (echo '127.0.0.1 reactnativereusables.com'; echo '127.0.0.1 raw.githubusercontent.com') \| sudo tee -a /etc/hosts >/dev/null && trap 'sudo sed -i "" "/127.0.0.1 reactnativereusables.com/d;/127.0.0.1 raw.githubusercontent.com/d" /etc/hosts' EXIT && npx @react-native-reusables/cli@latest add <the identical five URLs>; echo "exit=$?"; find . -path ./node_modules -prune -o -name '*.tsx' -print \| grep -cE 'components/(ai\|ui)/'` | runs against fixture `pristine-scratch-app`, NOT apps/example. THE NETWORK DISCRIMINATOR: pre-count is 0, exit is NON-ZERO, post-count is still 0. A success here would mean the files came from somewhere other than the network and nothing about this install was real. The /etc/hosts trap must fire on success, failure and SIGINT. |
| `bash tests/sprint-01/install-dirty-app.test.sh --prepare && cp "$TMPDIR/rnr-dirty/consumer/components/ui/button.tsx" "$TMPDIR/button.before" && cd "$TMPDIR/rnr-dirty/consumer" && printf 'n\n' \| npx @react-native-reusables/cli@latest add <the identical five URLs> 2>&1 \| tee "$TMPDIR/f3-dirty.log"; cmp "$TMPDIR/button.before" components/ui/button.tsx` | runs against fixture `hostile-expo-app`. the log names components/ui/button.tsx as a file it WOULD overwrite, the prompt appears BEFORE any write, and `cmp` exits 0 — the declined file is byte-identical. `--yes` is forbidden on this run; it suppresses the only thing being proven. |
| `cd "$TMPDIR/rnr-dirty/consumer" && npx expo-doctor; echo "exit=$?"` | non-zero exit naming `react-native-gesture-handler` and the expected `~2.32.0` — the major-version drift is caught by doctor rather than surfacing later as a native crash |
| `cd apps/example && npx expo run:ios` | the app builds and opens with no `Cannot find module` in the Metro output |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8/AC-1**. Delegated assertions:

- the locked script's install stage runs the real RNR CLI against the v0.1.0 tag; a 404, an unresolved transitive registryDependency or a missing primitive fails the script before any device is touched (gate steps 1-3)
- the app built from exactly those installed files cold-boots on iOS and on Android with no red screen (gate steps 4, 10) — a stubbed or empty installed component cannot render the transcript
- the seeded transcript, the header and the green tool badge assert on both platforms, which is only possible if components/ai/{conversation,message,tool}.tsx are the real installed sources
- tapping `context-trigger` paints `context-popover-content`, which requires the RNR `popover` primitive that only the context.json install can have pulled

Flow `journeys/mvp-full-arc--edge-install-into-a-dirty-app`, owned by **sprint gate steps 13-15 (JOURNEY scope — by rule no task AC may own it)**. Delegated assertions:

- the CLI shows what it would overwrite BEFORE writing into an app that already has its own components/ui/button.tsx (gate step 13)
- expo-doctor fails the gesture-handler pin mismatch rather than letting it surface as a native crash (gate step 14)
- the portalling item states PortalHost as an install prerequisite instead of rendering nothing (gate step 15)
- NOTE: `tests/sprint-01/install-dirty-app.test.sh`, this journey's locked `test`, is owned by TASK-F8 — it was unowned when this task was written; TASK-F8 now carries two verification-checklist rows making the script and its RED log conditions of done

## Guardrails

**WRITE-ALLOWED**
- `apps/example/**`
- `packages/registry/registry.json`
- `public/r/**`
- `tests/sprint-01/install-evidence.test.ts`

**WRITE-PROHIBITED**
- `packages/registry/src/components/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `design/**`
- `.github/workflows/**`

## Boundary Contracts

- Five items install in ONE command: `conversation`, `message`, `prompt-input`, `tool`, `context`. `context` is present specifically because it is one of only two registry items that pulls a portalling RNR primitive (`context` -> `popover.json`; `open-in-chat` -> `dropdown-menu.json`), and without it the PortalHost prerequisite in gate step 15 cannot be observed at all.
- Every RNR primitive arrives from `reactnativereusables.com`, never from us. The install is the observation point for UC-FOUND-03 AC-1: no forked copy of an RNR primitive is shipped.
- If a transitive `registryDependency` fails to resolve, the fix is in `registry.json` followed by rebuild and re-tag. It is NEVER a file placed by hand.

## Fixtures

- **`rnr-initialized-example-app`** (cli) — apps/example as TASK-F1 leaves it: Expo SDK 57 + expo-router, rnr init run for the uniwind engine, its own components.json and tsconfig alias pointing at its own tree, PortalHost mounted at the root, and zero files under components/ai. THIS is the real install target for checklist row 1.
  - apps/example/components.json written by rnr init
  - apps/example/app/_layout.tsx with PortalHost
  - 0 .tsx files under apps/example/components/ai
- **`pristine-scratch-app`** (cli) — NEWLY DECLARED — a throwaway Expo SDK 57 app at $TMPDIR/pristine-scratch-app created by `npx create-expo-app` followed by `npx @react-native-reusables/cli@latest init`, used ONLY as the network discriminator's second run (checklist row 4). It is deliberately NOT apps/example: the discriminator must be able to fail and leave a dirty tree without touching the real consumer.
  - $TMPDIR/pristine-scratch-app/components.json written by rnr init
  - 0 .tsx files under components/ai and components/ui
  - package.json pinning react-native 0.86.3 via expo install
- **`hostile-expo-app`** (cli) — A fresh Expo SDK 57 app under $TMPDIR deliberately dirtied: its own components/ui/button.tsx with different variants, react-native-gesture-handler at npm-latest 3.x (a major ahead of Expo 57's ~2.32.0), and no PortalHost in its root layout.
  - $TMPDIR/rnr-dirty/consumer/components/ui/button.tsx
  - package.json pinning gesture-handler 3.x
  - app/_layout.tsx without PortalHost

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F3",
  "task_type": "INFRA",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
    "requires_seeded_evidence": false
  },
  "fixtures": {
    "rnr-initialized-example-app": {
      "description": "apps/example as TASK-F1 leaves it: Expo SDK 57 + expo-router, rnr init run for the uniwind engine, its own components.json and tsconfig alias pointing at its own tree, PortalHost mounted at the root, and zero files under components/ai. THIS is the real install target for checklist row 1.",
      "seed_method": "cli",
      "records": [
        "apps/example/components.json written by rnr init",
        "apps/example/app/_layout.tsx with PortalHost",
        "0 .tsx files under apps/example/components/ai"
      ]
    },
    "pristine-scratch-app": {
      "description": "NEWLY DECLARED \u2014 a throwaway Expo SDK 57 app at $TMPDIR/pristine-scratch-app created by `npx create-expo-app` followed by `npx @react-native-reusables/cli@latest init`, used ONLY as the network discriminator's second run (checklist row 4). It is deliberately NOT apps/example: the discriminator must be able to fail and leave a dirty tree without touching the real consumer.",
      "seed_method": "cli",
      "records": [
        "$TMPDIR/pristine-scratch-app/components.json written by rnr init",
        "0 .tsx files under components/ai and components/ui",
        "package.json pinning react-native 0.86.3 via expo install"
      ]
    },
    "hostile-expo-app": {
      "description": "A fresh Expo SDK 57 app under $TMPDIR deliberately dirtied: its own components/ui/button.tsx with different variants, react-native-gesture-handler at npm-latest 3.x (a major ahead of Expo 57's ~2.32.0), and no PortalHost in its root layout.",
      "seed_method": "cli",
      "records": [
        "$TMPDIR/rnr-dirty/consumer/components/ui/button.tsx",
        "package.json pinning gesture-handler 3.x",
        "app/_layout.tsx without PortalHost"
      ]
    }
  },
  "requirements": []
}
-->
