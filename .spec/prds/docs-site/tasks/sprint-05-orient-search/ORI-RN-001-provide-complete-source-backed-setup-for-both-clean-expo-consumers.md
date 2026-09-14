# ORI-RN-001: Provide complete source-backed setup for both clean Expo consumers

## What this does

Both documented engine setups install public registry source and compile independently in clean Expo 57 consumers.

## Why

The repository has no packages/docs-snippets consumer setup sources. Existing harnesses resolve shared repository source and cannot prove an external learner's installation.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts`. Inspect both actual install logs and the resolution manifest. ORI-RN-003 separately proves native/Web behavior.

## Scope

Two setup templates, two command scripts, one helper, one focused test file, and evidence; 5 points. No registry, docs-page, workspace dependency, or example-app changes.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

Status: Backlog
Assignee: react-native-reusables-implementer
Priority: P1
Points: 5
Type: INFRA
Dependency phase: After ORI-RN-000 and ORI-DEP-001
Proposed By: react-native-reusables-planner
Co-authored By: none
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)
Planned date: 2026-09-14
Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROGRESS: Not started; all AC TDD_STATE values are none.

## Outcome

Both documented engine setups install public registry source and compile independently in clean Expo 57 consumers.

## Critical constraints

- NEVER rewrite rnraielements.com, disable TLS validation, substitute a local registry, copy repository components, install a web short-name item, or repair an installed component to obtain green.
- MUST preserve the fixed Expo 57/React Native/React/TypeScript pins and separate Tailwind majors; use npx expo install for native dependencies and record the actual RNR CLI @latest version.
- MUST execute real CLI, HTTPS, filesystem, and compiler paths. No mocked processes, SDK declarations, provider streams, fixture-mounted views, skipped checks, or static success receipts.
- NEVER broaden repository writes, leak provider credentials to installs or evidence, alter shared WIP, or reuse another task's process/cache/consumer directory.
- MUST distinguish compile/configuration proof from native rendering. ORI-RN-003 owns Expo Go keyboard, inset, portal, and light/dark appearance execution; this task cannot claim those results from Vitest.

## Done when

- [ ] AC-1: Both literal public recipes install five required items into independent compiling consumers.
- [ ] AC-2: Real diagnostics establish the pinned, unmixed engine configurations and coherent themes.
- [ ] AC-3: Both real root layouts compile with the ordered provider topology.
- [ ] AC-4: A genuinely missing installed module produces a retained compiler failure, not success.
- [ ] Focused gates and scope checks pass; downstream owners receive exact source and command contracts.

## Specification

Provide two independent, minimal consumer setup sources. The proof helper copies them into fresh temporary directories outside the monorepo and executes the documented real Expo and RNR CLI commands there. Pin the consumers to Expo SDK 57, React Native 0.86.3, React 19.2.3, and TypeScript 6.0.3; reconcile native dependencies through npx expo install. Use Uniwind 1.11.0 with Tailwind 4.3.3, and NativeWind 4.2.6 with Tailwind 3.4.19 in separate dependency contexts. Record the actually resolved RNR CLI version while preserving the scenario's literal @latest command.

Current gap: The repository has no packages/docs-snippets consumer setup sources. Existing harnesses resolve shared repository source and cannot prove an external learner's installation.

Success state: Two complete committed setup templates and commands produce independent Expo 57 consumers through the literal public registry URLs; real diagnostics, compiler results, source hashes, and resolved versions support downstream docs and native proofs.

### Literal install contract

NativeWind:

```sh
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/message.json https://rnraielements.com/r/nativewind/prompt-input.json https://rnraielements.com/r/nativewind/item.json https://rnraielements.com/r/nativewind/sheet.json
```

Uniwind:

```sh
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/message.json https://rnraielements.com/r/uniwind/prompt-input.json https://rnraielements.com/r/uniwind/item.json https://rnraielements.com/r/uniwind/sheet.json
```

The current PromptInput imports both components, but its registryDependencies omit both. Explicit public item installation closes the documented recipe without silently modifying the registry dependency graph.

Disallowed substitutions: hostname rewriting; a local registry standing in for the public apex; copying repository component sources into the consumer; resolving consumer imports into the monorepo; installing a web shadcn component by short name.

The helper executes the committed scripts, not a second recipe. Record real prompts, command arguments, CLI version, subprocess outcomes, and public response hashes. Keep installed component source unpatched. Expose reusable preparation and compilation operations with actual consumer roots, source/public hashes, resolved versions, receipts, and ownership-aware cleanup for ORI-AST-005 and the native proof consumers. Do not fabricate a chat screen: ORI-RN-002 owns its seed source.

Each consumer runs:

- `npx expo install --check`
- `npx @react-native-reusables/cli@latest doctor --summary`
- `pnpm exec tsc --noEmit`
- `pnpm exec expo-doctor`

### Root, theme, and cache contract

GestureHandlerRootView contains the required safe-area and navigation providers. Bind ThemeProvider to NAV_THEME and StatusBar to the same appearance. PortalHost is last inside the providers. No nested modal or new anchored overlay requires another host here.

NativeWind owns Tailwind v3 configuration, HSL :root/.dark:root tokens, and withNativeWind inlineRem 16. Its CSS, Tailwind mapping, and JavaScript theme agree. Uniwind owns Tailwind v4 @theme/oklch light/dark tokens and withUniwindConfig; it has no tailwind.config.js. Keep its JavaScript navigation colors synchronized. Neither template imports the other engine. Preserve installed RNR TextClassContext and wrap rendered strings in Text; never assume parent text-class cascade.

Use separate external roots, dependency trees, lockfiles, and cache identities. Do not copy harness watchFolders, peer fallbacks, ambient declarations, repository aliases, or Storybook machinery. Downstream Metro/native builds use owned ports and worktree-local native caches.

## Acceptance criteria

This INFRA task explicitly retains red_first. Its task-owned integration proofs use flow_ref:null and primary:false. They do not replace the locked Quickstart or infer native styling from compilation. The complete rows below are the human proof contract.

### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN two clean Expo 57 roots WHEN both literal public recipes execute THEN all five required items compile independently.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-1-public-install","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-1-public-install","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["a no-op install or mock registry replaces real public source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Prepare two fresh roots from committed setups; execute their literal public RNR commands and each installed compiler."]},"end_state":{"must_observe":["Both consumers install conversation, message, prompt-input, item, and sheet from 5 canonical URLs.","Both installed import graphs compile with React Native 0.86.3 and TypeScript 6.0.3."],"must_not_observe":["Missing or empty conversation source (0 bytes) or unresolved item/sheet imports.","Components copied from or resolving into the monorepo."]}}]}}
```

### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN independent consumers WHEN real doctors and configuration checks run THEN each has the pinned engine and matching light/dark theme.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-2-engine-configuration","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-2-engine-configuration","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["mocked doctors or a static theme comparison hide disconnected engine setup"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Run RNR doctor before diagnosis, Expo checks, actual Metro config loading, and theme compilation; compare normalized CSS and NAV_THEME colors."]},"end_state":{"must_observe":["NativeWind 4.2.6/Tailwind 3.4.19: withNativeWind, inlineRem=16, .dark:root and tailwind.config.js.","Uniwind 1.11.0/Tailwind 4.3.3: withUniwindConfig, @theme, oklch light/dark, no tailwind.config.js.","Across 2 consumers and 2 appearances, normalized NAV_THEME background and foreground values equal the actual CSS tokens in all 8 comparisons."],"must_not_observe":["Mixed engine imports, missing or empty doctor output (0 diagnostic records), or static navigation colors disconnected from CSS."]}}]}}
```

### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN both setup templates WHEN real root-layout compilation runs THEN ordered provider wiring is available for downstream native proof.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-3-root-providers","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-3-root-providers","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["an empty root or mock imports replace real provider wiring"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Compile the actual root imports and inspect their provider tree/theme binding; hand root/theme hashes to ORI-RN-003."]},"end_state":{"must_observe":["Both roots (2 of 2) mount GestureHandlerRootView, safe-area context, ThemeProvider/NAV_THEME, matching StatusBar, and PortalHost last.","Root/theme hashes identify source for 6 downstream engine/platform legs."],"must_not_observe":["Empty provider tree (0 mounted providers), missing PortalHost, or unresolvable provider imports.","Compiler output labeled as passed native appearance or keyboard proof."]}}]}}
```

### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN an installed scratch consumer WHEN its required item module is removed THEN real compilation fails and the helper retains diagnostics.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-4-fail-closed","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-4-fail-closed","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["the helper swallows compiler failure or returns static success"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Move the real installed item module aside in owned scratch; run the compiler, restore the module, rerun, and exercise owned cleanup."]},"end_state":{"must_observe":["The missing-item run exits with a nonzero status and at least 1 actual TypeScript module-resolution diagnostic naming the removed item module.","The restored consumer compiles with exit status 0; a fresh receipt identifies the current run, source hashes, dependency paths, and both command statuses (failed missing-item run and successful restored run)."],"must_not_observe":["Static success for a missing module, empty diagnostics (0 recorded failures), skipped execution, or reused receipts."]}}]}}
```

## Test criteria

```json
[{"id":"TC-1","type":"test_criterion","description":"All five public registry items compile in each independent consumer.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-1-public-install","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The two consumers satisfy their engine-specific configuration contract.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-2-engine-configuration","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Each compiled root layout satisfies the ordered provider contract.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-3-root-providers","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The helper rejects a missing installed item.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-4-fail-closed","maps_to_ac":"AC-4"}]
```

## Shared fixtures

```json
{"clean_consumers":{"description":"Two new empty OS-derived directories outside the monorepo, seeded only with committed NativeWind and Uniwind setup templates.","seed_method":"cli","records":["nativewind: Expo 57.0.19, React Native 0.86.3, React 19.2.3, TypeScript 6.0.3, NativeWind 4.2.6, Tailwind 3.4.19.","uniwind: Expo 57.0.19, React Native 0.86.3, React 19.2.3, TypeScript 6.0.3, Uniwind 1.11.0, Tailwind 4.3.3.","Each starts without components/ai or components/ui; public deployment prerequisite identifies the expected registry hashes."]},"installed_consumers":{"description":"Fresh consumers prepared by the actual command scripts and real RNR CLI, not copied installed files or cached acceptance receipts.","seed_method":"cli","records":["conversation, message, prompt-input, item, and sheet are installed through the literal engine URLs.","Actual installed dependencies and complete root/theme/configuration sources are available for the real compiler.","Each engine has its own node_modules, lockfile, CLI resolution record, and owned scratch/cache identity."]}}
```

Failure sensitivity changes only an owned real scratch consumer and invokes its real compiler. No synthetic registry or mocked dependency substitutes for the public installation.

## Scope and deliverables

Write allowed, exactly mirrored in guardrails.write_allowed:

- packages/docs-snippets/commands/nativewind.sh
- packages/docs-snippets/commands/uniwind.sh
- packages/docs-snippets/nativewind/package.json
- packages/docs-snippets/nativewind/app.json
- packages/docs-snippets/nativewind/components.json
- packages/docs-snippets/nativewind/tsconfig.json
- packages/docs-snippets/nativewind/metro.config.js
- packages/docs-snippets/nativewind/babel.config.js
- packages/docs-snippets/nativewind/tailwind.config.js
- packages/docs-snippets/nativewind/global.css
- packages/docs-snippets/nativewind/nativewind-env.d.ts
- packages/docs-snippets/nativewind/app/_layout.tsx
- packages/docs-snippets/nativewind/lib/theme.ts
- packages/docs-snippets/nativewind/lib/utils.ts
- packages/docs-snippets/uniwind/package.json
- packages/docs-snippets/uniwind/app.json
- packages/docs-snippets/uniwind/components.json
- packages/docs-snippets/uniwind/tsconfig.json
- packages/docs-snippets/uniwind/metro.config.js
- packages/docs-snippets/uniwind/global.css
- packages/docs-snippets/uniwind/uniwind-types.d.ts
- packages/docs-snippets/uniwind/app/_layout.tsx
- packages/docs-snippets/uniwind/lib/theme.ts
- packages/docs-snippets/uniwind/lib/utils.ts
- tests/sprint-05-orient-search/support/quickstart-consumer.ts
- tests/sprint-05-orient-search/quickstart-consumer-install.test.ts
- tests/sprint-05-orient-search/evidence/ORI-RN-001/
- tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-001/resolution-manifest.json

Write prohibited:

- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/**
- packages/registry/**
- public/r/**
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- .github/**
- .spec/**
- Any repository path not explicitly allowed.

Deliver complete templates/commands first, reusable helper next, then focused tests and evidence. Scratch node_modules and consumer lockfiles remain outside the monorepo.

## Boundaries and guardrails

Always:

- Copy only the committed setup files into two new OS-derived scratch roots outside the monorepo; reject symlinks or resolution back into repository source and node_modules.
- Run RNR doctor before manual diagnosis, retain actual command failures, and reconcile only the documented consumer dependencies.
- Record run ID, candidate SHA, source/command/public-response hashes, CLI version, dependency paths and versions, and subprocess exit status.
- Stop only recorded children; dispose only exact owned temporary roots; retain bounded evidence and preserve shared devices and listeners.

Ask first:

- Change the fixed dependency pins or add an undocumented setup/source step.
- Change registry metadata, public deployment, workspace dependencies, native automation, or the locked flow contract.

Boundary contracts:

- ORI-AST-005 consumes these exact committed sources and invokes the real consumer compiler. It owns rendered-snippet equality.
- ORI-CONT-001 and ORI-CONT-002 consume these commands and theme sources. NativeWind 4.2.6 is the package version; Tailwind v3 describes its CSS engine.
- Nested packages/docs-snippets consumer templates are copied outside the monorepo before installation. They do not inherit workspace node_modules or registry ambient declarations.
- ORI-DEP-001 is a concrete fusion reservation owned by the Cloudflare specialist. This proposal does not author deployment behavior.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

Execution requires ORI-RN-000's correction in ORI-DEP-001's reviewed public release. Normal DNS and trusted HTTPS must serve the expected bytes. Missing apex resolution, incompatible actual CLI, or unavailable fixed pins blocks acceptance. Strip provider credentials from install/compiler children and evidence without changing parent HOME or system environment.

## Agent instructions

1. Write one focused real-process test per AC before its setup/helper implementation; preserve actual RED output.
2. After RED is reviewed, implement only the setup sources and helper behavior required by that AC.
3. Repeat the exact focused command for GREEN; refactor within the allowlist while retaining actual process execution.
4. Run the task-local suite, consumer compiler/doctors, root typecheck/lint, and scope checks. Request independent RNR review.
5. Hand off exact sources, hashes, and commands. Do not claim native appearance or the complete Quickstart before downstream real execution.

Missing public DNS/TLS is an external blocker, not substitute defect RED. The orchestrator verifies phase transitions and owns integration; workers never merge or change trunk.

## Reading list

1. /Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/setup-and-cli.md:1-120 [PRIMARY PATTERN] — Copy-paste CLI, aliases, complete setup, and doctor-first diagnosis; apply MIGRATION.md engine corrections.
2. /Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/MIGRATION.md — NativeWind-only inlineRem/.dark:root versus Uniwind Tailwind v4.
3. apps/harness-nativewind/tailwind.config.js:1-46 — Existing token mapping; adapt content roots for standalone app/components sources.
4. apps/harness/metro.config.js:1-113 — Wrapper call forms only; repository redirects, shared watchFolders, and Storybook are forbidden in templates.
5. .spec/prds/docs-site/04-uc-docs.md:21-43 — Installation, theme sample, and seed Quickstart promise.

## Design and coding standards

Use independent minimal RNR root layouts and coherent light/dark token sets; no new visual system. Follow AGENTS.md and the RNR MIGRATION.md engine correction. Native screenshots, not class strings, settle later appearance claims. Reject consumers that borrow monorepo modules or mix styling engines.

Follow /Users/justinrich/Projects/brain/docs/TDD-METHODOLOGY.md for RED/GREEN and /Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md for owned OS-derived scratch roots. Keep all rendered strings inside Text and preserve the installed TextClassContext contract.

## Verification gates

1. `pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts`
2. `pnpm typecheck`
3. `pnpm lint`

Each AC's exact command selects its named test. The helper executes both consumers' actual compiler, Expo checks, and RNR doctor. Root typecheck cannot replace consumer compilation. Reject required subprocess failures. Scope checks compare changed paths with the allowlist; unrelated current-sprint RED suites are not this task's gate.

Preserved verification contract:

- Both fresh consumers execute the literal public commands successfully, contain the expected installed files, and compile using their installed dependency trees. Tier: real CLI, HTTP, filesystem, and compiler. Surface: two fresh Expo 57 directories created with the operating system temporary-directory API.
- RNR doctor runs before manual setup diagnosis. The Uniwind consumer uses withUniwindConfig and Tailwind v4 theme syntax; the NativeWind consumer uses withNativeWind with inlineRem 16 and Tailwind v3 configuration. Tier: real CLI and Metro configuration. Surface: each independent consumer.
- Each root mounts GestureHandlerRootView, the required safe-area context, its navigation ThemeProvider, a matching StatusBar, and PortalHost last inside the providers. Native execution is completed by ORI-RN-003 in Expo Go on reserved iOS and Android devices.
- The Uniwind oklch light/dark example and its JavaScript navigation colors agree. The NativeWind CSS, Tailwind config, and JavaScript theme agree. Neither engine imports the other. Tier: real compiler plus device appearance verification. Surface: both consumers in light and dark appearance.

## Evidence gates

Capture actual setup RED/GREEN in the engine install logs. Record run ID, source/command/public hashes, five item results per engine, actual CLI/package versions and resolved paths, process statuses, and compiler diagnostics. Prove failure sensitivity with the real missing-module case; restore only owned scratch files.

Planned outputs:

- tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-001/resolution-manifest.json

Verification policy: requires_tests=true, requires_red_evidence=true, requires_seeded_evidence=true.

All evidence paths are future outputs. Validate Requirement/Scenario Contracts and human/machine parity before publication. No implementation result is claimed here. These receipts cannot replace the locked flow's fresh installs or canonical proof.red.

## Review

The RNR implementer owns the recipes, consumer aliases, engines, and provider topology. The RNR reviewer independently checks real isolated installs.

Must pass:

- Four focused real integration tests with actual RED/GREEN evidence.
- Five public items installed per engine without source substitution or post-install repair.
- Separate pinned consumer dependency resolution with no monorepo leakage.
- Complete compiled root/theme contracts and explicit downstream native proof.
- Exact write scope and current-run evidence identities.

Should verify:

- No harness workaround, Storybook machinery, optional dev-client module, or web shadcn item enters templates.
- The helper returns actual compiler receipts, not static or previous-run success.
- Missing external prerequisites fail closed without silent substitution.

Verdict: APPROVED or NEEDS_FIXES, supported by commands, source references, and observed outcomes.

## Dependencies and handoff

Depends on: ORI-RN-000, ORI-DEP-001.
Blocks: ORI-CONT-001, ORI-RN-002, ORI-RN-003, ORI-RN-005.

Provides: SEAM-RN-VERIFIED-INSTALL-INSTRUCTIONS; SEAM-RN-VERIFIED-THEME-SAMPLE; real clean-consumer preparation and compiler helper.

Consumes: corrected ORI-RN-000 PromptInput artifacts, ORI-DEP-001's reviewed public bytes, real Expo 57 resolver, RNR CLI, registry dependencies, compiler, and OS temporary-directory API.

Capability: CAP-DOCS-01.

PRD references:

- .spec/prds/docs-site/04-uc-docs.md#uc-docs-01-read-the-getting-started-documentation-set
- .spec/prds/docs-site/04-uc-docs.md#uc-docs-02-build-a-chat-screen-with-the-single-quickstart-tutorial
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md

Supports gate step 3 and FLOW-DOCS-02-quickstart-chat-screen with primary:false. ORI-CONT-004 remains the sole PRIMARY owner. Exact downstream command:

`pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`

Canonical flow RED: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red.

ORI-RN-003 runs the exact setup and ORI-RN-002 seed screen in all six combinations: nativewind/iOS, nativewind/Android, nativewind/Web, uniwind/iOS, uniwind/Android, uniwind/Web. Reserved Expo Go iOS/Android targets prove keyboard, insets, portal and light/dark chrome; the same source runs on Web. Use owned ports, processes and worktree-local native caches. Compiler success is not native sign-off.

Other locked task flows retain their named owners; four journey proofs belong to ORI-AST-010. No flow is added or reassigned. Docs/Astro owners retain browser engine persistence and no-JavaScript behavior.

Provenance: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/react-native-reusables-planner-absorb-prerequisites.json; source task ORI-RN-001; no co-authors or superseded tasks. The task-planning skill supplies stable AC/TC and read-only handoff discipline.

## Out of scope

- Registry mapper/dependency metadata changes and public deployment behavior.
- Docs routes, prose, rendered-snippet equality, browser engine persistence, and no-JavaScript flows.
- Seed screen implementation, native/Web runtime automation, live screen/provider wiring, and runner provisioning.
- Workspace manifests/lockfile, harness/example repairs, dependency upgrades beyond the fixed consumer contract, and optional dev-client modules.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-RN-001","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"clean_consumers":{"description":"Two new empty OS-derived directories outside the monorepo, seeded only with committed NativeWind and Uniwind setup templates.","seed_method":"cli","records":["nativewind: Expo 57.0.19, React Native 0.86.3, React 19.2.3, TypeScript 6.0.3, NativeWind 4.2.6, Tailwind 3.4.19.","uniwind: Expo 57.0.19, React Native 0.86.3, React 19.2.3, TypeScript 6.0.3, Uniwind 1.11.0, Tailwind 4.3.3.","Each starts without components/ai or components/ui; public deployment prerequisite identifies the expected registry hashes."]},"installed_consumers":{"description":"Fresh consumers prepared by the actual command scripts and real RNR CLI, not copied installed files or cached acceptance receipts.","seed_method":"cli","records":["conversation, message, prompt-input, item, and sheet are installed through the literal engine URLs.","Actual installed dependencies and complete root/theme/configuration sources are available for the real compiler.","Each engine has its own node_modules, lockfile, CLI resolution record, and owned scratch/cache identity."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN two clean Expo 57 roots WHEN both literal public recipes execute THEN all five required items compile independently.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-1-public-install","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-1-public-install","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["a no-op install or mock registry replaces real public source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Prepare two fresh roots from committed setups; execute their literal public RNR commands and each installed compiler."]},"end_state":{"must_observe":["Both consumers install conversation, message, prompt-input, item, and sheet from 5 canonical URLs.","Both installed import graphs compile with React Native 0.86.3 and TypeScript 6.0.3."],"must_not_observe":["Missing or empty conversation source (0 bytes) or unresolved item/sheet imports.","Components copied from or resolving into the monorepo."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN independent consumers WHEN real doctors and configuration checks run THEN each has the pinned engine and matching light/dark theme.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-2-engine-configuration","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-2-engine-configuration","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["mocked doctors or a static theme comparison hide disconnected engine setup"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Run RNR doctor before diagnosis, Expo checks, actual Metro config loading, and theme compilation; compare normalized CSS and NAV_THEME colors."]},"end_state":{"must_observe":["NativeWind 4.2.6/Tailwind 3.4.19: withNativeWind, inlineRem=16, .dark:root and tailwind.config.js.","Uniwind 1.11.0/Tailwind 4.3.3: withUniwindConfig, @theme, oklch light/dark, no tailwind.config.js.","Across 2 consumers and 2 appearances, normalized NAV_THEME background and foreground values equal the actual CSS tokens in all 8 comparisons."],"must_not_observe":["Mixed engine imports, missing or empty doctor output (0 diagnostic records), or static navigation colors disconnected from CSS."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN both setup templates WHEN real root-layout compilation runs THEN ordered provider wiring is available for downstream native proof.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-3-root-providers","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-3-root-providers","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["an empty root or mock imports replace real provider wiring"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Compile the actual root imports and inspect their provider tree/theme binding; hand root/theme hashes to ORI-RN-003."]},"end_state":{"must_observe":["Both roots (2 of 2) mount GestureHandlerRootView, safe-area context, ThemeProvider/NAV_THEME, matching StatusBar, and PortalHost last.","Root/theme hashes identify source for 6 downstream engine/platform legs."],"must_not_observe":["Empty provider tree (0 mounted providers), missing PortalHost, or unresolvable provider imports.","Compiler output labeled as passed native appearance or keyboard proof."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN an installed scratch consumer WHEN its required item module is removed THEN real compilation fails and the helper retains diagnostics.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-consumer-install.test.ts","test_function":"ORI-RN-001-AC-4-fail-closed","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-4-fail-closed","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real RNR CLI, public HTTPS registry, Expo 57, filesystem, and TypeScript","negative_control":{"would_fail_if":["the helper swallows compiler failure or returns static success"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"installed_consumers","action":{"actor":"cli_user","steps":["Move the real installed item module aside in owned scratch; run the compiler, restore the module, rerun, and exercise owned cleanup."]},"end_state":{"must_observe":["The missing-item run exits with a nonzero status and at least 1 actual TypeScript module-resolution diagnostic naming the removed item module.","The restored consumer compiles with exit status 0; a fresh receipt identifies the current run, source hashes, dependency paths, and both command statuses (failed missing-item run and successful restored run)."],"must_not_observe":["Static success for a missing module, empty diagnostics (0 recorded failures), skipped execution, or reused receipts."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All five public registry items compile in each independent consumer.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-1-public-install","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The two consumers satisfy their engine-specific configuration contract.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-2-engine-configuration","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Each compiled root layout satisfies the ordered provider contract.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-3-root-providers","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The helper rejects a missing installed item.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/quickstart-consumer-install.test.ts -t ORI-RN-001-AC-4-fail-closed","maps_to_ac":"AC-4"}]}
-->
</details>
