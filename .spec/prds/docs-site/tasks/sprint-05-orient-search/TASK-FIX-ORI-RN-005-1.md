# FIX-ORI-RN-005-1: Make the canonical live-chat sources compile in the independent NativeWind consumer

## What this does

Fixes the two compile defects that block ORI-RN-005's clean-consumer proof. In the prescribed independent NativeWind consumer — fresh Expo 57 root outside the monorepo from ORI-RN-001's committed template, registry items from the literal public recipe, the verified hook pins, and the five canonical app sources copied byte-identical — the consumer's own `tsc --noEmit` rejects with exactly two errors, both in landed files outside ORI-RN-005's write scope:

1. `apps/example/components/live-chat-screen.tsx:5` — `import { useUniwind } from 'uniwind'` → TS2307 in a consumer that never adds uniwind. The hook's only use is `theme === 'dark' ? 'dark' : 'light'` feeding `THEME[mode].background`; the behavior-preserving fix is React Native's `useColorScheme`.
2. `packages/docs-snippets/nativewind/lib/theme.ts:8` — `const THEME` is not exported while the canonical screen imports `{ THEME } from '@/lib/theme'` (apps/example's own lib/theme.ts exports it) → TS2459. One-word fix: `export const THEME`.

## Why

ORI-RN-005's cycle-1 blocked report (checkpoint 20f4b6a6) proved everything else green and root-caused the failure to exactly these two errors. No pending task can fix them: ORI-RN-005's write allowlist excludes `apps/example/**` and `packages/docs-snippets/nativewind/**` except its package.json; ORI-RN-001, ORI-RN-004 and ORI-AI-001 are completed. Behavior preservation is grounded in the landed code: apps/example's only theme control (`apps/example/gallery/chrome.tsx`) flips the app via `Appearance.setColorScheme` — exactly the signal `useColorScheme()` tracks — and the NativeWind consumer root (`packages/docs-snippets/nativewind/app/_layout.tsx`) already themes via `useColorScheme()`. After this lands, ORI-RN-005 reruns its blocked legs with no further work in its own files.

## How to verify

Run `pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts` — the task-owned scratch harness that materializes the prescribed consumer, copies the five canonical sources byte-identical (SHA-256 pairs), runs the consumer's `tsc --noEmit` (functional RED pre-fix with exactly the two named errors, GREEN post-fix), and records the preserved repository checks. Also run the preserved commands below.

## Scope

Own the two one-line fixes in `apps/example/components/live-chat-screen.tsx` and `packages/docs-snippets/nativewind/lib/theme.ts`, plus the scratch harness and bounded evidence under `.tmp/FIX-ORI-RN-005-1/`. On-device behavior remains ORI-RN-005's rerun and ORI-AI-002's matrix; every ORI-RN-005 in-flight file stays untouched.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Backlog

> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 2 · Type: FIX
> Dependency phase: after ORI-RN-001, ORI-RN-004 and ORI-AI-001
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-18
> Source SHA: 5a8ce9e2bb60f424e07ef42665d0a719da92c100

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The five canonical app sources compile clean (`tsc --noEmit` exit 0, expo-doctor exit 0) in the prescribed independent NativeWind consumer, with the canonical screen's theme read engine-agnostic and the template's `THEME` exported; both owning apps' public behavior, exports and compile surfaces are unchanged.

### CRITICAL CONSTRAINTS — Never

- Never weaken the consumer oracle: fresh consumer outside the monorepo, literal public recipe over real HTTPS, five byte-identical copies with SHA-256 pair validation, the consumer's own `tsc`. No declaration shims, no monorepo-resolved imports, no skipLibCheck/path-rewrite concealment, no filtering errors from output.
- Never remove or rename public API: `THEME`'s export is additive; `NAV_THEME`, every token value, and the screen's rendered structure and accessibility labels stay unchanged.
- Never change the theme mapping semantics: dark ⇔ scheme 'dark', everything else (including null) → 'light', exactly as before.
- Never leave the canonical screen importing uniwind or introduce uniwind anywhere in the NativeWind path (engine mixing).
- Never touch ORI-RN-005's in-flight files (its driver, manifest, test, evidence, and `packages/docs-snippets/nativewind/package.json`); never edit the other four canonical sources.
- Never change pinned versions or the lockfile to force green; never write outside the exact allowlist.

### DONE WHEN

- [ ] AC-1 proves the screen fix: the TS2307 uniwind error is gone from the consumer compile and the Uniwind-app compile surface stays green with identical dark/light behavior.
- [ ] AC-2 proves the THEME export: the TS2459 error is gone, the export is additive-only, and the root compile/lint surfaces stay green.
- [ ] The exact selector and preserved commands pass; independent review confirms functional RED, seeded evidence and no stubs.

### SPECIFICATION

Two one-line root-cause fixes plus a scratch compile harness. The harness reproduces ORI-RN-005's consumer shape at this task's dependency position (its driver and manifest exist only on its parked branch and must not become dependencies): ORI-RN-001's committed template files and literal recipe, the ORI-AI-001-proven hook pins installed through Expo's resolver in the scratch consumer, the five canonical copies, then the consumer's own compiler.

### BOUNDARY CONTRACTS

1. Screen fix: remove `import { useUniwind } from 'uniwind'`; import `useColorScheme` from `react-native`; `const { theme } = useUniwind()` → `const colorScheme = useColorScheme()`; keep `const mode = colorScheme === 'dark' ? 'dark' : 'light'`; update only the stale narrowing comment. Nothing else changes.
2. Theme fix: `const THEME = {` → `export const THEME = {` in `packages/docs-snippets/nativewind/lib/theme.ts`; every value, `NAV_THEME` and the comments otherwise byte-identical. The uniwind template's `lib/theme.ts` is NOT in scope — grep in-task to confirm no canonical source compiled in a uniwind consumer imports `THEME` from the template (apps/example resolves `@/lib/theme` to its own exporting copy; ORI-RN-002's seed screen does not import it); if that changes, separate ask.
3. Harness `.tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts` exports `runConsumerCompileProof`: fresh OS-scratch consumer root outside the monorepo; copy the twelve committed template files from `packages/docs-snippets/nativewind/`; run `packages/docs-snippets/commands/nativewind.sh` verbatim with cwd at the consumer root; `npx expo install ai@7.0.89 @ai-sdk/react@4.0.92`; copy the five canonical sources (`apps/example/app/live-chat.tsx` → `app/live-chat.tsx`, `components/live-chat-screen.tsx` → `components/live-chat-screen.tsx`, `components/live-chat-message.tsx` → `components/live-chat-message.tsx`, `lib/live-chat-config.ts` → `lib/live-chat-config.ts`, `lib/use-live-chat.ts` → `lib/use-live-chat.ts`) with SHA-256 pair validation before anything compiles; run the consumer's `pnpm exec tsc --noEmit` and `pnpm exec expo-doctor`; classify the tsc output (TS2307 'uniwind', TS2459 'THEME'); run the three preserved repository commands and record exits; emit bounded JSON evidence; remove the consumer root on every exit path. Pattern reference only: ORI-RN-005's `runInstallExactSource` via `git show 20f4b6a6:tests/sprint-05-orient-search/support/nativewind-live-example.ts` — never imported, never a dependency.
4. The hook pins are ORI-AI-001's proven set; any version change requires the ask-first gate. No credentials and no provider calls anywhere in this task.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. Both criteria run through the same scratch harness on the real toolchain.

#### AC-1: Engine-agnostic screen compiles in both consumers [PRIMARY]

GIVEN the prescribed independent NativeWind consumer with the five canonical sources copied byte-identical WHEN the screen's theme read swaps `useUniwind` for React Native's `useColorScheme` THEN the consumer's tsc no longer reports TS2307 'uniwind' at `components/live-chat-screen.tsx`, the screen contains no uniwind import, and apps/example's scoped live-chat compiler still exits 0 with the identical dark/light mapping.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: real public RNR CLI over HTTPS (rnraielements.com), real Expo 57 resolver and filesystem, the fresh consumer's own TypeScript compiler, and apps/example's scoped live-chat compiler
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts
- TEST_FUNCTION: runConsumerCompileProof
- VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-005-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real public RNR CLI over HTTPS (rnraielements.com), real Expo 57 resolver and filesystem, the fresh consumer's own TypeScript compiler, and apps/example's scoped live-chat compiler","negative_control":{"would_fail_if":["A declaration shim or tsconfig weakening conceals the TS2307, the consumer's copied source is edited instead of the repository source, the uniwind import survives, or the dark/light mapping changes semantics.","a stubbed compile check that never runs the consumer's own tsc, an empty or mocked copy step, a static pass flag with no real command output, or a disconnected verify that skips SHA-256 pair validation"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_consumer_compile","action":{"actor":"cli_user","steps":["Materialize the prescribed consumer, run the literal recipe, install the hook pins, copy the five canonical sources with SHA-256 pair validation.","Run the consumer's tsc pre-fix and capture the TS2307 'uniwind' error at components/live-chat-screen.tsx as part of the functional RED.","Apply the useColorScheme swap and rerun the identical harness plus pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json."]},"end_state":{"must_observe":["Pre-fix RED includes TS2307 Cannot find module 'uniwind' at components/live-chat-screen.tsx with all 5 SHA-256 pairs matching.","Post-fix the consumer tsc output contains no TS2307 'uniwind' error and no uniwind package exists in the consumer dependency tree.","apps/example's scoped live-chat compiler exits 0; the screen narrows colorScheme === 'dark' ? 'dark' : 'light' exactly as before and uniwind imports remain in apps/example only at app/_layout.tsx and app/index.tsx."],"must_not_observe":["A remaining uniwind import in the canonical screen, a shim concealing the error, edited consumer copies, or a changed mapping.","a RED capture that shows 0 captured errors (empty), or pre-fix tsc output with the two errors filtered out (0 occurrences of TS2307/TS2459)."]}}]}
```

#### AC-2: Template THEME export closes the TS2459 additively

GIVEN the same prescribed consumer WHEN `packages/docs-snippets/nativewind/lib/theme.ts` exports `THEME` THEN the consumer's tsc no longer reports TS2459 for the screen's `@/lib/theme` import, the file is otherwise byte-identical, and the root typecheck and scoped lint exit 0.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the fresh consumer's own TypeScript compiler, the root TypeScript program, and the real Biome linter over the two touched files
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts
- TEST_FUNCTION: runConsumerCompileProof
- VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-RN-005-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the fresh consumer's own TypeScript compiler, the root TypeScript program, and the real Biome linter over the two touched files","negative_control":{"would_fail_if":["The export renames or removes anything, any THEME token value or the NAV_THEME derivation changes, the TS2459 is silenced by editing the consumer copy instead of the template, or the root compile/lint surfaces regress."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"nativewind_consumer_compile","action":{"actor":"cli_user","steps":["Run the consumer's tsc pre-fix and capture the TS2459 missing-export error for THEME as part of the functional RED.","Apply the export keyword and rerun the identical harness; run pnpm typecheck and pnpm exec biome ci apps/example/components/live-chat-screen.tsx packages/docs-snippets/nativewind/lib/theme.ts, verifying lint coverage explicitly where biome.json's files.includes omits apps/example/**.","Inspect the complete diff against the allowlist."]},"end_state":{"must_observe":["Post-fix the consumer tsc contains no TS2459 THEME error and exits 0 overall with expo-doctor exit 0.","The git diff of lib/theme.ts vs its pre-state shows exactly 1 insertion and 0 deletions (the added export keyword), THEME appears in exactly 1 export site (the new export const THEME), and git diff --stat -- packages/docs-snippets/nativewind/lib/theme.ts reports exactly 1 file changed, 1 insertion(+), 0 deletions(-); NAV_THEME and every token value are otherwise byte-identical.","pnpm typecheck and the scoped lint exit 0 with coverage explicitly verified; the complete diff touches only the two defect files and .tmp/FIX-ORI-RN-005-1 evidence."],"must_not_observe":["Removed or renamed exports, changed token values, edits to the other four canonical sources, or writes outside the exact allowlist.","a RED capture that shows 0 captured errors (empty), or pre-fix tsc output with the two errors filtered out (0 occurrences of TS2307/TS2459)."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The prescribed consumer records the pre-fix TS2307 'uniwind' error, then compiles without it after the useColorScheme swap, with the scoped live-chat compiler green and the mapping unchanged. VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts`
- TC-2 → AC-2: The prescribed consumer records the pre-fix TS2459 THEME error, then compiles clean after the additive export, with root typecheck and scoped lint green and the diff inside the allowlist. VERIFY: `pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts`

### SHARED FIXTURES

```json
{"nativewind_consumer_compile":{"description":"A fresh NativeWind/Tailwind v3 Expo 57 consumer materialized by the task-owned scratch harness under an OS-derived root outside the monorepo: the twelve committed ORI-RN-001 template files, the literal public recipe, the ORI-AI-001-proven hook pins through Expo's resolver, and the five canonical app sources copied byte-identical from the task's isolated candidate.","seed_method":"cli","records":["Normal public DNS/TLS to rnraielements.com and working pnpm/npx toolchain are prerequisites; their absence blocks execution","No credentials and no provider calls: install + compile only; the consumer root is removed on every exit path"]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/example/components/live-chat-screen.tsx
- packages/docs-snippets/nativewind/lib/theme.ts
- .tmp/FIX-ORI-RN-005-1/**

writeProhibited:

- packages/docs-snippets/nativewind/package.json
- tests/sprint-05-orient-search/support/nativewind-live-example.ts
- tests/sprint-05-orient-search/nativewind-live-source-manifest.json
- tests/sprint-05-orient-search/nativewind-live-example.test.ts
- tests/sprint-05-orient-search/evidence/**
- apps/example/** except components/live-chat-screen.tsx
- packages/docs-snippets/nativewind/** except lib/theme.ts
- packages/docs-snippets/uniwind/**
- pnpm-lock.yaml
- package.json
- .spec/**
- .kb-run-sprint/**
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- Stop for a version decision before any dependency change: prove from the installed packages that no source-level fix can work, then name one pinned real version with evidence. Never "latest".
- Report (do not silently absorb) any third error class in the consumer compile — it means the blocked report's scope was incomplete and needs an orchestrator decision.

### DELIVERABLE

- `apps/example/components/live-chat-screen.tsx`: engine-agnostic theme read via `useColorScheme`, identical dark/light narrowing, no uniwind import.
- `packages/docs-snippets/nativewind/lib/theme.ts`: `export const THEME` (additive only).
- `.tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts` plus red.json, green.json, preserved-checks.json, run.json.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; run the exact selector pre-fix; the compile assertion must fail functionally with exactly the two named errors captured. Missing network/tooling is a blocker, never functional RED. Wait for orchestrator verification of RED.
2. GREEN: apply the two one-line fixes; rerun the identical selector; keep the preserved commands green. REFACTOR: keep the diff minimal; rerun affected checks.
3. Hand the candidate and evidence to react-native-reusables-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/example/components/live-chat-screen.tsx` [PRIMARY TARGET] — the uniwind import and its single dark/light use.
2. `packages/docs-snippets/nativewind/lib/theme.ts` [PRIMARY TARGET] — the unexported THEME and the NAV_THEME derivation that must not change.
3. `.kb-run-sprint/sprint-05-orient-search/ORI-RN-005/cycle-1.blocked.json` — the root-cause evidence naming exactly the two errors.
4. `packages/docs-snippets/commands/nativewind.sh` and `packages/docs-snippets/nativewind/app/_layout.tsx` — the literal recipe and the consumer root's own `useColorScheme` theming.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact locked selector:

```sh
pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts
```

Preserved verification commands (run by the harness and individually):

```sh
pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json
pnpm typecheck
pnpm exec biome ci apps/example/components/live-chat-screen.tsx packages/docs-snippets/nativewind/lib/theme.ts
```

Command contract: the harness needs real network access to rnraielements.com and working pnpm/npx toolchain; missing DNS/TLS or registry access blocks execution. The scoped biome command carries the known caveat that biome.json's files.includes omits apps/example/** — verify lint coverage explicitly rather than trusting a silent exit 0. Do not rerun ORI-RN-005's, ORI-AI-001's or ORI-RN-004's suites as gates — they touch in-flight files or evidence directories outside this allowlist.

### EVIDENCE GATES

1. Prerequisites: public registry reachability and toolchain established; the committed template, recipe and five canonical sources present at the recorded candidate SHA.
2. Functional RED: the exact selector against the recorded pre-fix candidate on the real toolchain; exactly the two named errors captured; the five pairs match. An authored failure flag or missing harness is not functional RED.
3. GREEN: the identical selector post-fix; tsc exit 0, expo-doctor exit 0, preserved commands exit 0; no skipped steps or zero-check success.
4. Evidence: bind candidate source and harness hashes to exact commands/exits and a fresh run identity; capture copy pairs, resolved versions, CLI version, public registry hashes, tsc/expo-doctor output and the preserved-check exits, all bounded. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, no stubs, exact scope compliance.

Planned evidence paths: .tmp/FIX-ORI-RN-005-1/red.json, .tmp/FIX-ORI-RN-005-1/green.json, .tmp/FIX-ORI-RN-005-1/preserved-checks.json, .tmp/FIX-ORI-RN-005-1/run.json. Teardown: remove the scratch consumer root on every exit path; stop only children recorded by this run's owned handles; preserve unrelated listeners and shared WIP.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the fixed gate, locked steps and human-flows.json are unchanged; no flow evidence writes, no journey proofs.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-RN-001, ORI-RN-004, ORI-AI-001 (all completed).

Blocks: ORI-RN-005's blocked legs — its registered session reruns them after this task lands, with no further work in its own files; indirectly ORI-AI-002's six-target matrix and ORI-CONT-004's Quickstart gate step 3.

Provides: an engine-agnostic canonical live-chat screen and an exporting nativewind template `lib/theme.ts`, together making the five canonical sources compile in the prescribed NativeWind consumer; the scratch compile harness with captured RED/GREEN evidence under `.tmp/FIX-ORI-RN-005-1/`.

Consumes: ORI-RN-001's committed template and literal recipe; ORI-RN-004's canonical screen/route/message sources; ORI-AI-001's hook/config sources and proven pins.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave9-add-nativewind-compile-fix` (wave-9, sequence next); source task ORI-RN-005 (blocked cycle 1, checkpoint 20f4b6a6; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-RN-005/cycle-1.blocked.json`); proposed by react-native-reusables-planner.

### OUT OF SCOPE

ORI-RN-005's driver, manifest, test, evidence and package.json (in flight on its branch); on-device behavior and the native/web proof matrix (ORI-RN-005's rerun, ORI-AI-002); the uniwind template's `lib/theme.ts`; registry fixes; root dependency/lockfile changes; UI redesign; journey proofs; planning policy edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED and GREEN source/command bound on the real recipe and the consumer's own compiler, with the two named errors the complete RED set; both owning compile surfaces stay green; the THEME export is additive; the screen's mapping and structure unchanged; only allowed files change; no stub or fake success remains. Should verify: the harness's consumer shape matches ORI-RN-005's so its rerun lands clean first try; compile success is not presented as on-device acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-RN-005-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"nativewind_consumer_compile":{"description":"A fresh NativeWind/Tailwind v3 Expo 57 consumer materialized by the task-owned scratch harness under an OS-derived root outside the monorepo: the twelve committed ORI-RN-001 template files, the literal public recipe, the ORI-AI-001-proven hook pins through Expo's resolver, and the five canonical app sources copied byte-identical from the task's isolated candidate.","seed_method":"cli","records":["Normal public DNS/TLS to rnraielements.com and working pnpm/npx toolchain are prerequisites; their absence blocks execution","No credentials and no provider calls: install + compile only; the consumer root is removed on every exit path"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Engine-agnostic screen compiles in both consumers","primary":true,"description":"GIVEN the prescribed independent NativeWind consumer with the five canonical sources copied byte-identical WHEN the screen's theme read swaps useUniwind for React Native's useColorScheme THEN the consumer's tsc no longer reports TS2307 'uniwind' at components/live-chat-screen.tsx, the screen contains no uniwind import, and apps/example's scoped live-chat compiler still exits 0 with the identical dark/light mapping.","flow_ref":null,"test_file":".tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","test_function":"runConsumerCompileProof","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","test_tier":"integration","verification_service":"real public RNR CLI over HTTPS (rnraielements.com), real Expo 57 resolver and filesystem, the fresh consumer's own TypeScript compiler, and apps/example's scoped live-chat compiler","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-005-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real public RNR CLI over HTTPS (rnraielements.com), real Expo 57 resolver and filesystem, the fresh consumer's own TypeScript compiler, and apps/example's scoped live-chat compiler","negative_control":{"would_fail_if":["A declaration shim or tsconfig weakening conceals the TS2307, the consumer's copied source is edited instead of the repository source, the uniwind import survives, or the dark/light mapping changes semantics.","a stubbed compile check that never runs the consumer's own tsc, an empty or mocked copy step, a static pass flag with no real command output, or a disconnected verify that skips SHA-256 pair validation"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"nativewind_consumer_compile","action":{"actor":"cli_user","steps":["Materialize the prescribed consumer, run the literal recipe, install the hook pins, copy the five canonical sources with SHA-256 pair validation.","Run the consumer's tsc pre-fix and capture the TS2307 'uniwind' error at components/live-chat-screen.tsx as part of the functional RED.","Apply the useColorScheme swap and rerun the identical harness plus pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json."]},"end_state":{"must_observe":["Pre-fix RED includes TS2307 Cannot find module 'uniwind' at components/live-chat-screen.tsx with all 5 SHA-256 pairs matching.","Post-fix the consumer tsc output contains no TS2307 'uniwind' error and no uniwind package exists in the consumer dependency tree.","apps/example's scoped live-chat compiler exits 0; the screen narrows colorScheme === 'dark' ? 'dark' : 'light' exactly as before and uniwind imports remain in apps/example only at app/_layout.tsx and app/index.tsx."],"must_not_observe":["A remaining uniwind import in the canonical screen, a shim concealing the error, edited consumer copies, or a changed mapping.","a RED capture that shows 0 captured errors (empty), or pre-fix tsc output with the two errors filtered out (0 occurrences of TS2307/TS2459)."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Template THEME export closes the TS2459 additively","primary":false,"description":"GIVEN the same prescribed consumer WHEN packages/docs-snippets/nativewind/lib/theme.ts exports THEME THEN the consumer's tsc no longer reports TS2459 for the screen's @/lib/theme import, the file is otherwise byte-identical, and the root typecheck and scoped lint exit 0.","flow_ref":null,"test_file":".tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","test_function":"runConsumerCompileProof","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","test_tier":"integration","verification_service":"the fresh consumer's own TypeScript compiler, the root TypeScript program, and the real Biome linter over the two touched files","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-RN-005-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the fresh consumer's own TypeScript compiler, the root TypeScript program, and the real Biome linter over the two touched files","negative_control":{"would_fail_if":["The export renames or removes anything, any THEME token value or the NAV_THEME derivation changes, the TS2459 is silenced by editing the consumer copy instead of the template, or the root compile/lint surfaces regress."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"nativewind_consumer_compile","action":{"actor":"cli_user","steps":["Run the consumer's tsc pre-fix and capture the TS2459 missing-export error for THEME as part of the functional RED.","Apply the export keyword and rerun the identical harness; run pnpm typecheck and pnpm exec biome ci apps/example/components/live-chat-screen.tsx packages/docs-snippets/nativewind/lib/theme.ts, verifying lint coverage explicitly where biome.json's files.includes omits apps/example/**.","Inspect the complete diff against the allowlist."]},"end_state":{"must_observe":["Post-fix the consumer tsc contains no TS2459 THEME error and exits 0 overall with expo-doctor exit 0.","The git diff of lib/theme.ts vs its pre-state shows exactly 1 insertion and 0 deletions (the added export keyword), THEME appears in exactly 1 export site (the new export const THEME), and git diff --stat -- packages/docs-snippets/nativewind/lib/theme.ts reports exactly 1 file changed, 1 insertion(+), 0 deletions(-); NAV_THEME and every token value are otherwise byte-identical.","pnpm typecheck and the scoped lint exit 0 with coverage explicitly verified; the complete diff touches only the two defect files and .tmp/FIX-ORI-RN-005-1 evidence."],"must_not_observe":["Removed or renamed exports, changed token values, edits to the other four canonical sources, or writes outside the exact allowlist.","a RED capture that shows 0 captured errors (empty), or pre-fix tsc output with the two errors filtered out (0 occurrences of TS2307/TS2459)."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The prescribed consumer records the pre-fix TS2307 'uniwind' error, then compiles without it after the useColorScheme swap, with the scoped live-chat compiler green and the mapping unchanged.","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The prescribed consumer records the pre-fix TS2459 THEME error, then compiles clean after the additive export, with root typecheck and scoped lint green and the diff inside the allowlist.","verify":"pnpm exec tsx .tmp/FIX-ORI-RN-005-1/consumer-compile-proof.ts","maps_to_ac":"AC-2"}]}
-->
</details>
