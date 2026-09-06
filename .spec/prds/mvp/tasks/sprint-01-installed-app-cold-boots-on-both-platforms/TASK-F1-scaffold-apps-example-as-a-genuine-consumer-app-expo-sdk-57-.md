# TASK-F1: Scaffold apps/example as a genuine consumer app (Expo SDK 57, expo-router, uniwind + Tailwind v4, rnr init)

> Task ID: TASK-F1  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 8  
> Type: INFRA  
> Wave: A  
> Status: 🔄 in_progress
> Proposed By: `react-native-ui-planner`
> Depends On: none

## Outcome

apps/example exists as a real consumer app that resolves its own alias, carries RNR's real theme, mounts PortalHost at the root, and boots on both platforms.

## Critical Constraints

- NEVER resolve @/components/ui/* through packages/registry or apps/harness. apps/example is a CONSUMER; a workspace alias back into the monorepo is the shortcut that would invalidate every finding in this sprint and in sprint 02.
- <PortalHost /> goes in the ROOT layout, not inside a screen. A missing or misplaced PortalHost renders portalled overlays as literally nothing, with no error, no crash and no log line. It is the landmine ledger's worst silent failure.
- global.css must be RNR's real theme transcribed VERBATIM. An invented starting palette makes sprint 03's flip prove nothing, because 'the colors changed' is only evidence if the before state was the state a real RNR app is actually in.
- Every RN/Expo package is added with `npx expo install`. react-native must resolve to 0.86.3 (Expo 57's pin), NOT npm latest 0.87.1; react-native-gesture-handler to ~2.32.0, NOT 3.2.1.
- components.json must be produced by a genuine `npx @react-native-reusables/cli@latest init`, not hand-written. UC-REG-01 AC-2 and gate step 13 both depend on that being real.

## Verification Checklist

| Command | Expect |
|---|---|
| `pnpm install --frozen-lockfile` | the printed project list contains a line for `apps/example`; 3 workspace packages resolve |
| `cat apps/example/components.json` | contains `"style": "uniwind"` and an aliases block written by `rnr init`, not by hand |
| `grep -c 'PortalHost' apps/example/app/_layout.tsx` | returns at least 1 (the root layout mounts it) |
| `grep -c 'PortalHost' apps/example/app/index.tsx` | returns 0 (it is NOT mounted inside a screen, where the overlay would be clipped) |
| `grep -c -- '--color-' apps/example/global.css` | returns the same count as RNR's own theme block, transcribed verbatim; 0 invented values |
| `grep -n 'AI Elements Example' apps/example/app/index.tsx` | the exact literal the gate's steps 5 and 10 assert, authored in the screen and not injected by a test |
| `cat apps/example/lib/nav-theme.ts` | NAV_THEME reads the same token source as global.css, not the Expo template default |
| `node -p "require('./apps/example/package.json').dependencies['react-native']"` | prints 0.86.3, NOT 0.87.1 |
| `node -p "require('./apps/example/package.json').dependencies['react-native-gesture-handler']"` | prints ~2.32.0, NOT 3.2.1 |
| `node -p "require('./apps/example/app.json').expo.android.edgeToEdgeEnabled"` | prints true; predictiveBackGestureEnabled is also set explicitly |
| `node -p "require('./apps/example/app.json').expo.ios.bundleIdentifier"` | prints ai.hackerpug.rnrexample, the id both LOCKED e2e-policy files match by regex |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Behavior Proven By

Flow `UC-REG-01/core-happy-path`, owned by **TASK-F8 AC-1 and AC-6**. Delegated assertions:

- the app cold-boots on an iOS simulator and a Pixel_7_API_34 emulator with no red screen (gate steps 4, 10)
- the header reads `AI Elements Example` on both platforms (gate steps 5, 10)
- tapping `context-trigger` paints `context-popover-content` over the transcript — the PortalHost proof (F8 delta below)
- the light-to-dark capture pair moves the navigation chrome and the body together (F8 captures light AND dark)

## Guardrails

**WRITE-ALLOWED**
- `apps/example/**`
- `pnpm-workspace.yaml`
- `package.json`
- `tsconfig.json`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `public/r/**`
- `design/**`
- `tests/sprint-01/**`
- `.maestro/**`

## Fixtures

- **`clean_checkout`** (cli) — repo checkout at sprint-01 entry: apps/ holds harness and harness-nativewind only, no apps/example directory
- **`installed_example_app`** (cli) — apps/example scaffolded, rnr init run, the 5 sprint items installed from the v0.1.0 tag by the real RNR CLI

## Notes

- Reclassified FEATURE -> INFRA. This task is configuration and scaffolding: workspace membership, Expo/Metro config, a theme file, a root layout. It has no product surface of its own to assert against, which is precisely the FEATURE-vs-INFRA line in the template. Its behavior is proven by TASK-F8's composed arc and nothing that was going to be verified stops being verified.
- Use `npx expo run:ios` / `run:android` local native builds, not Expo Go: Maestro needs a real appId. Expo Go compatibility (UC-REG-02 AC-3) is a later sprint's claim.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F1",
  "task_type": "INFRA",
  "tdd_mode": "skipped",
  "verification_policy": {
    "requires_tests": false,
    "requires_red_evidence": false,
    "requires_seeded_evidence": false
  },
  "fixtures": {
    "clean_checkout": {
      "description": "repo checkout at sprint-01 entry: apps/ holds harness and harness-nativewind only, no apps/example directory",
      "seed_method": "cli",
      "records": [
        "`ls apps/` returns exactly 2 entries",
        "apps/example does not exist"
      ]
    },
    "installed_example_app": {
      "description": "apps/example scaffolded, rnr init run, the 5 sprint items installed from the v0.1.0 tag by the real RNR CLI",
      "seed_method": "cli",
      "records": [
        "apps/example/components.json written by rnr init",
        "components/ai/tool.tsx present",
        "components/ui/popover.tsx present"
      ]
    }
  },
  "requirements": []
}
-->
