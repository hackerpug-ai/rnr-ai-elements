## What this does
The canonical live-chat source runs independently under NativeWind on iOS, Android and Web, with real streaming, abort, error recovery and traceable evidence.

## Why
The locked plan requires an independent NativeWind live composition; the Uniwind apps/example result cannot prove the NativeWind consumer.

## How to verify

- `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts`
- `pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --platforms ios,android,web`

Inspect real iOS/Android/Web interactions, source identity, negative cases and cleanup. All product commands and evidence remain planned.

## Scope
One NativeWind package manifest, one source manifest, the task test/driver and task-owned evidence. Canonical app sources and consumer root configuration are read-only inputs.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-RN-005: Run the real worked-example source in an independent NativeWind consumer

> Status: Backlog
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 3 · Type: TEST
> Dependency phase: After ORI-RN-001, ORI-RN-004 and ORI-AI-001; before ORI-AI-002 matrix acceptance
> Proposed By: react-native-reusables-planner · Co-authored By: aisdk-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
> Additional reviewer: aisdk-reviewer
> PROGRESS: 0/4 ACs; all TDD_STATE values are none.

### OUTCOME
The canonical live-chat source runs independently under NativeWind on iOS, Android and Web, with real streaming, abort, error recovery and traceable evidence.

### CRITICAL CONSTRAINTS — Never

- Never expose provider credentials to installs, compilers, Metro, client configuration, browser bundles, arguments or evidence. Only the trusted launcher and owned backend receive them.
- Never touch shared WIP or unowned devices/processes. Use the assigned isolated candidate and OS-derived scratch roots; preserve the exact write allowlist.
- Never substitute a mock renderer, mocked HTTP, canned answer, provider stub, declaration shim, skipped native target or static success for actual behavior.
- Never copy registry components or the Uniwind app shell. Install components through literal public HTTPS CLI commands; copy only the five canonical app-owned sources.
- Never change pinned versions, engine, provider/model, root lockfile or dependency-owned sources to force green. Unavailable prerequisites and active-abort races block acceptance.

### DONE WHEN

- [ ] AC-1: Install and compile exact source.
- [ ] AC-2: Observe live text and context on all targets.
- [ ] AC-3: Abort and recover through the real hook.
- [ ] AC-4: Reject invalid inputs and release owned resources.
- [ ] Fixed commands, consumer compiler/Expo doctor, typecheck, lint, evidence and scope gates pass.

### SPECIFICATION / CONTEXT
Split the NativeWind live-composition obligation already required by ORI-AI-002 from the Uniwind apps/example target. Materialize an independent clean NativeWind/Tailwind v3 consumer from ORI-RN-001, install the real canonical registry commands, add the verified pinned AI hook peers through Expo's resolver, and copy only the canonical app-owned live route, screen, message, hook and config sources into their matching consumer paths. Compile and run those identical app sources under the genuine NativeWind root providers; do not import or copy the Uniwind app shell.

Current gap: The locked plan requires an independent NativeWind live composition; the Uniwind apps/example result cannot prove the NativeWind consumer.

Success state: A fresh public installation compiles all five identical app sources, completes every NativeWind platform interaction, rejects invalid source/device inputs and releases owned resources.

### RUNTIME_COMMANDS

- test: `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts`
- live: `pnpm exec tsx tests/sprint-05-orient-search/support/nativewind-live-example.ts --platforms ios,android,web`
- typecheck: `pnpm typecheck`
- lint: `pnpm exec biome ci packages/docs-snippets/nativewind/package.json tests/sprint-05-orient-search/support/nativewind-live-example.ts tests/sprint-05-orient-search/nativewind-live-source-manifest.json tests/sprint-05-orient-search/nativewind-live-example.test.ts`

The driver also runs the actual compiler and `npx expo-doctor` in the independent consumer. Root typecheck alone cannot prove that import graph.

### FIXTURES

```json
{"clean_nativewind":{"description":"Fresh consumer outside the monorepo, created by ORI-RN-001's real CLI entrypoint.","seed_method":"cli","records":["NativeWind/Tailwind v3 root; five canonical app sources; verified hook pins; normal public registry DNS/TLS.","Fresh run/SHA; reserved RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and backend/Metro/Web ports."]},"live_nativewind":{"description":"Real driver opens /live-chat with zero turns on each of iOS, Android and Web.","seed_method":"ui_flow","records":["Generate a fresh nonce per platform; send 'Remember marker <nonce> and count from 1 to 12.' with that nonce substituted.","Follow-up: 'What marker did I give you?' Backend uses server-only credentials and gpt-4.1-mini-2025-04-14; responses are never preseeded."]}}
```

### ACCEPTANCE CRITERIA
Each row below contains the complete acceptance criterion, proof fields and Scenario Contract. These are task-owned TEST proofs with PRIMARY=false and FLOW_REF=null. ORI-CONT-004 retains primary ownership of the Quickstart flow.

#### AC-1: Install and compile exact source

```json
{"id":"AC-1","type":"acceptance_criterion","name":"Install and compile exact source","description":"GIVEN a fresh NativeWind consumer and verified prerequisites WHEN the real driver installs public registry items and copies the canonical app sources THEN all five source hashes match and the clean Expo 57 consumer compiles.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-install-exact-source","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-install-exact-source","test_tier":"integration","verification_service":"Public RNR CLI/HTTPS registry, real filesystem and Expo 57 compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Public RNR CLI/HTTPS registry, real filesystem and Expo 57 compiler","negative_control":{"would_fail_if":["A static manifest or mocked CLI replaces the real public installation, or a disconnected compiler resolves workspace packages."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Run the real driver and ORI-RN-001's public install commands, including npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json.","Use npx expo install for verified hook pins; copy the five mapped app files; run the clean consumer compiler and Expo doctor."]},"end_state":{"must_observe":["5 source/target SHA-256 pairs match, with installed versions and public registry hashes recorded.","The NativeWind 4.2.6/Tailwind v3 /live-chat graph compiles using consumer dependencies; compiler and Expo doctor exit 0."],"must_not_observe":["empty installation, 0 copied sources, declaration shims, workspace links or Uniwind shell"]}}]}}
```

#### AC-2: Observe live text and context on all targets

```json
{"id":"AC-2","type":"acceptance_criterion","name":"Observe live text and context on all targets","description":"GIVEN the exact installed source and an empty live transcript WHEN a nonce-bearing prompt and contextual follow-up are sent on each target THEN iOS, Android and Web show incremental, correlated replies that retain the nonce.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-live-three-platforms","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-live-three-platforms","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","negative_control":{"would_fail_if":["A canned answer, static transcript, mocked provider or disconnected useChat hook supplies the screen."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_nativewind","action":{"actor":"user","steps":["On each real ios/android/web target, observe zero turns, send the generated nonce prompt, and capture text growth before completion.","Send the follow-up without the nonce; inspect native captures/accessibility and correlate both replies with backend/provider records."]},"end_state":{"must_observe":["3 platform records each contain at least 2 distinct nonempty assistant text lengths before completion.","Each final answer SHA-256 matches the server hash; request/response IDs, model gpt-4.1-mini-2025-04-14 and actual usage are recorded.","Each follow-up returns its first-turn nonce; the first user turn occurs 1 time and the successful composer clears."],"must_not_observe":["empty/placeholder answer, 0 growth observations, missing platform or stale-run receipt"]}}]}}
```

#### AC-3: Abort and recover through the real hook

```json
{"id":"AC-3","type":"acceptance_criterion","name":"Abort and recover through the real hook","description":"GIVEN a live NativeWind session on every target WHEN the user stops active generation and retries after real endpoint loss and provider rejection THEN active requests abort and both failure paths recover without duplicated user turns.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-abort-error-retry","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-abort-error-retry","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","negative_control":{"would_fail_if":["Stop is a no-op, error state is mocked, or Retry returns a static answer without a new provider request."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_nativewind","action":{"actor":"user","steps":["On each target, start ORI-RN-004's bounded long generation; observe streaming while the provider request is active, then press Stop generating."]},"end_state":{"must_observe":["3 targets record Stop generating before completion, correlated provider abort and no further assistant growth."],"must_not_observe":["0 active requests at Stop, completion before Stop or continued growth after abort"]}},{"start_ref":"live_nativewind","action":{"actor":"user","steps":["Stop only the owned endpoint; submit a prompt, observe connection failure, restart it and press Retry on each target.","Use the shared backend contract to request a nonexistent model; observe actual rejection, restore gpt-4.1-mini-2025-04-14 and Retry."]},"end_state":{"must_observe":["3 targets each show 2 sanitized failure paths and 2 successful retries with new provider requests.","Recovered answer hashes match server hashes; each retained user turn occurs 1 time."],"must_not_observe":["blank error, 0 retry requests, leaked credentials, canned recovery or duplicated user turn"]}}]}}
```

#### AC-4: Reject invalid inputs and release owned resources

```json
{"id":"AC-4","type":"acceptance_criterion","name":"Reject invalid inputs and release owned resources","description":"GIVEN real source files and reserved execution resources WHEN a source hash differs, a requested target is absent, or execution exits THEN invalid runs fail explicitly and owned resources are released with retained evidence.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-fail-closed-cleanup","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-fail-closed-cleanup","test_tier":"integration","verification_service":"Real filesystem, platform tools and owned backend/Metro/Web processes","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, platform tools and owned backend/Metro/Web processes","negative_control":{"would_fail_if":["Source validation is stubbed, an absent target is silently skipped, or cleanup is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Run the real driver with an isolated manifest copy containing one mismatched source hash."]},"end_state":{"must_observe":["1 hash mismatch names the mapped path and expected/actual hashes; the run exits nonzero before target launch."],"must_not_observe":["0 mismatches, static success or launch with stale source"]}},{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Confirm the requested proof-owned target is unavailable through real platform tooling; run the driver with that exact selector."]},"end_state":{"must_observe":["1 unavailable target yields a nonzero result naming its selector, without replacement."],"must_not_observe":["0 missing targets reported, skipped-target success or substituted target"]}},{"start_ref":"live_nativewind","action":{"actor":"cli_user","steps":["After success, real negative runs and controlled interruption, inspect owned processes/ports, Android mappings and device appearance."]},"end_state":{"must_observe":["teardown.json records both native appearances restored and reservations released; 0 owned listeners/mappings remain.","manifest.json retains 3 successful platform records, matching source/registry hashes, provider correlation and inspected captures."],"must_not_observe":["empty teardown, missing cleanup, lost prior-run evidence or altered unowned resources"]}}]}}
```

### TEST CRITERIA

- TC-1 → AC-1: Five source hashes match; public installation, consumer compiler and Expo doctor succeed. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-install-exact-source`
- TC-2 → AC-2: Three targets prove incremental replies and nonce-preserving context with provider correlation. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-live-three-platforms`
- TC-3 → AC-3: Active abort and both real failure/retry paths pass on three targets without duplicate user turns. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-abort-error-retry`
- TC-4 → AC-4: Invalid source/target inputs fail; every exit path releases only owned resources and retains evidence. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-fail-closed-cleanup`

### SCOPE
writeAllowed:

- packages/docs-snippets/nativewind/package.json
- tests/sprint-05-orient-search/support/nativewind-live-example.ts
- tests/sprint-05-orient-search/nativewind-live-source-manifest.json
- tests/sprint-05-orient-search/nativewind-live-example.test.ts
- tests/sprint-05-orient-search/evidence/ORI-RN-005/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-RN-005/ios/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/android/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/web/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/teardown.json

writeProhibited:

- pnpm-lock.yaml
- package.json
- apps/example/**
- packages/registry/**
- apps/docs/**
- .spec/**
- packages/docs-snippets/nativewind/** except packages/docs-snippets/nativewind/package.json
- packages/docs-snippets/uniwind/**
- tests/sprint-05-orient-search/support/live-example.ts
- tests/sprint-05-orient-search/support/live-backend.ts
- Any repository path outside write_allowed

### BOUNDARIES
Always:

- Preserve source and evidence provenance; append bounded per-run evidence instead of overwriting prior records.
- Reserve RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and exact ports; verify compatible Expo Go and actual expo/fetch streaming, structuredClone and text-encoding support.
- Keep credentials only in the trusted launcher/backend; verify per-platform endpoint reachability and actual Web CORS.
- Restore prior appearance, abort active requests, clear listeners/timers and stop only recorded child identities on every exit path.
- Report missing public DNS/TLS, exact package pins, device/tooling or provider access as concrete prerequisite blockers.

Ask First:

- Changing source mappings, package versions, provider/model, write scope or dependency-owned files requires a separate decision.
- Implementation and external actions require subsequent authorization; this charter grants none.

### BOUNDARY CONTRACTS

- nativewind-live-source-manifest.json enumerates exact source-to-target mappings for apps/example/app/live-chat.tsx, components/live-chat-screen.tsx, components/live-chat-message.tsx, lib/live-chat-config.ts and lib/use-live-chat.ts. Record source hashes and installed package/registry hashes. Component files come only from the real public CLI installation.
- Reuse packages/docs-snippets/nativewind/app/_layout.tsx, global.css, babel.config.js, metro.config.js, tailwind.config.js, theme.ts and PortalHost topology from ORI-RN-001. Only the nested nativewind package.json changes for exact live-hook peers. This task never writes the root lockfile or adds Uniwind to the consumer.
- Export runNativewindLiveExampleProof from support/nativewind-live-example.ts with the same typed platform/run/source/device/output/owned-backend contract as runLiveExampleProof. CLI accepts --platforms ios,android,web and uses support/live-backend.ts. The two engine drivers execute the same live interactions and preserve real backend/provider correlation.
- The compiler runs in the clean consumer with actual installed Expo 57 dependencies and the exact copied source. A missing import, engine-mixed setup, stale source hash or absent device fails. No declarations conceal missing components or packages.
- iOS uses an explicitly reserved simulator, Android an explicitly reserved emulator, and Web the same source exported and served by the owned process. Restore appearance, stop owned processes and release reservations.
- Expose actual incremental text, contextual follow-up, active Stop, real endpoint-loss error and recovery through the same hook. ORI-AI-002 correlates all six targets and validates provider outcomes; engine labels alone prove nothing.

Exact source mappings; targets are relative to the fresh consumer root:

- apps/example/app/live-chat.tsx → app/live-chat.tsx
- apps/example/components/live-chat-screen.tsx → components/live-chat-screen.tsx
- apps/example/components/live-chat-message.tsx → components/live-chat-message.tsx
- apps/example/lib/live-chat-config.ts → lib/live-chat-config.ts
- apps/example/lib/use-live-chat.ts → lib/use-live-chat.ts

### DELIVERABLE

- support/nativewind-live-example.ts exports the typed proof and executable CLI consumed by ORI-AI-002.
- nativewind-live-source-manifest.json records exact mappings, hashes and installed-package/registry provenance.
- packages/docs-snippets/nativewind/package.json adds only verified exact live-hook packages.
- nativewind-live-example.test.ts contains the four named real proofs and negative cases.
- The allowed evidence directory retains manifest.json, ios/, android/, web/ and teardown.json as future outputs.

### AGENT INSTRUCTIONS — TDD

- RED: add one behavior test per AC in the allowed test file; invoke the real driver and dependencies, preserve actual failing assertions and source/run identity, then obtain the orchestrator's RED verification.
- GREEN: implement the smallest allowed NativeWind driver/package/manifest change; run the AC selector and both fixed verification commands; retain measured observations.
- REFACTOR: only restructure within scope when needed, then rerun affected checks without changing behavior. Do not weaken or skip native/provider proof.
- After all ACs: run the relevant gates, scan for stubs and hand the candidate to the independent reviewers. No artifact is treated as present or passed in this charter.

### READING LIST

1. apps/harness-nativewind/src/app/_layout.tsx [PRIMARY PATTERN], lines 1-23: existing PortalHost placement only; ORI-RN-001 supplies the complete consumer root. Do not copy the harness or Uniwind shell.
2. AGENTS.md, sections Tech Stack, Distribution, Known Risk and Scratch artifacts: Expo pins, registry distribution, real native evidence and shared-WIP protection.
3. .spec/prds/docs-site/04-uc-docs.md, UC-DOCS-02: single tutorial and worked-example handoff.
4. /Users/justinrich/Projects/brain/docs/TDD-METHODOLOGY.md: observed RED before GREEN, then independent review.
5. /Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md, What authors must do: OS-derived roots, deterministic teardown and external reaper lifecycle.

### DESIGN / CODING STANDARDS

- Preserve ORI-RN-001 NativeWind/Tailwind v3 providers, theme.ts, global.css, Metro/Babel configuration and PortalHost topology byte-for-byte; no token or layout redesign.
- Preserve canonical Text/TextClassContext use, bounded transcript and streaming throttle. No new overlay or markdown-native-module requirement belongs here.
- Reference /Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/MIGRATION.md and /Users/justinrich/Projects/brain/.rosetta/docs/expo-ai-elements/README.md. This project's dual-engine contract and Expo 57 pins override prior-art stack assumptions.
- Use strict TypeScript and the dependency-owned typed driver contract. Unresolved imports in the real consumer compiler fail acceptance.
- Use actual child-process statuses, bounded waits and finally cleanup. Refuse unowned listeners; never kill by an unverified port.
- Keep registry components model-stateless and engine-agnostic; provider integration remains in canonical app sources/backend.
- Install exact verified client hook packages through Expo tooling. ai@7.0.89 and @ai-sdk/react@4.0.92 require ORI-AI-001 proof; server @ai-sdk/openai@4.0.66 and zod@4.6.1 compatibility belongs to that prerequisite.
- No stubs, placeholders, fake success, runtime skips or TODO deferrals in required behavior or tests.

### VERIFICATION / EVIDENCE GATES

1. Run each AC's exact selected Vitest command against real preimplementation behavior and preserve actual assertion failure. Missing tooling, imports or devices are blockers, not functional RED.
2. Run both fixed verification commands, `pnpm typecheck`, and the exact lint command. Compile the copied live graph and run Expo doctor in the independent consumer.
3. Require all four AC scenarios to pass the read-only scenario validator. Capture seeded observations, not only runner exit codes.
4. Compare changed repository paths with write_allowed and scan touched production/test code for stubs, skips, placeholders, fake success and deferred core logic.
5. Bind manifest.json to run ID, candidate SHA, source/lockfile/test/driver/policy hashes, five mappings, literal commands, CLI version, installed versions and public registry hashes.
6. Capture each platform's actual identity, compiler/Metro/export logs, accessibility observations, incremental growth, completed answer hash and sanitized provider request/response/model/usage correlation. Inspect iOS screenshots and Android recordings.
7. Preserve active-abort, endpoint-loss, actual rejected-model and successful-retry evidence. Completion before Stop cannot pass. teardown.json proves cleanup after success, failure and interruption.
8. ORI-CONT-004's locked Quickstart invocation awaits fresh installs and both engine matrices in the same run. ORI-AI-002 rejects missing/stale legs and validates all six targets. Parent validates flow ownership; this task claims no journey proof.

Verification contract: The real driver creates a fresh consumer, executes the literal public CLI commands, compiles the exact copied source, launches real iOS/Android/Web targets and observes send/stream/Stop/error/retry. A deliberate source-hash mismatch in an isolated manifest copy must fail before launch; a genuine missing device must fail without accepting another target. Capture native screenshots, recordings, accessibility observations, actual HTTP/provider correlation and teardown.

Planned evidence paths:

- tests/sprint-05-orient-search/evidence/ORI-RN-005/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-RN-005/ios/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/android/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/web/
- tests/sprint-05-orient-search/evidence/ORI-RN-005/teardown.json

Task RED outputs remain inside its allowed evidence directory. They do not replace the canonical flow RED proof.

Human test hook: Follow the worked-example handoff with the nativewind engine selected, send a real prompt on iOS, Android and Web, then use Stop and Retry.

### FLOW SUPPORT
FLOW-DOCS-02-quickstart-chat-screen: primary=false; primary_owner=ORI-CONT-004; gate=ORI-GATE-03.

- TEST_FILE: tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
- TEST_FUNCTION: FLOW-DOCS-02-quickstart-chat-screen
- Locked run_cmd: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`
- Surface policy: .spec/e2e-policy/surface.json
- Coldboot policy: .spec/e2e-policy/coldboot.json
- Artifact: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json
- Canonical RED: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red

Task-owned TEST requirements use flow_ref:null and primary:false. ORI-CONT-004 owns the locked Quickstart invocation and canonical proof.red; ORI-AI-002 validates all six live targets. This task owns only the NativeWind contribution. The flow test and canonical RED artifact are outside this task's write scope.

The fixed sprint gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). Inventory remains 13 flows: nine task flows and four journey flows; 36 tasks and 131 points. No journey proof is owned here.

### EXECUTION PRECONDITIONS

- Planning only: all product evidence is future output. Recheck candidate SHA, lockfile, commands and source/driver/policy hashes before execution.
- ORI-RN-001 must supply a genuinely clean NativeWind root and normal public DNS/trusted HTTPS registry installs. No hostname rewrite or local component copy.
- ORI-AI-001 must prove exact package installation and LanguageModelV4 compatibility: ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66, zod@4.6.1. Missing/incompatible pins require a version decision.
- Use the official OpenAI Responses endpoint and gpt-4.1-mini-2025-04-14. Credentials remain server-only; authentication, quota, model and network failures block proof.
- Reserve exact native selectors/ports. Verify Expo Go, native automation, expo/fetch streaming, structuredClone, encoding globals, endpoint reachability and Web CORS; no absent-target skip.
- Keep independent consumers/caches and worktree-local native outputs. Restore appearance, abort requests, clear timers/listeners, remove only owned mappings and stop only recorded children on every exit.
- Root typecheck is insufficient: compile the actual copied live graph. Whole-example diagnostics remain separate; broader gallery repairs require explicit scope.

### OUT OF SCOPE

- Editing the five canonical app sources, live backend or shared Uniwind driver; route findings to ORI-AI-001 or ORI-RN-004.
- Changing NativeWind root/theme/config files beyond its package.json; ORI-RN-001 owns them.
- Registry fixes, root dependency/lockfile changes, gallery repairs, UI redesign, tools, persistence or new markdown modules.
- Authoring the Quickstart/browser flow, claiming six-target acceptance, journey proofs, hosted CI, deployment, merge or sprint closure.

### REVIEW / AGENT RATIONALE
react-native-reusables-planner owns the NativeWind consumer boundary; aisdk-planner co-authors the unchanged hook/provider seam. react-native-reusables-implementer builds the proof, react-native-reusables-reviewer reviews native correctness, and aisdk-reviewer checks actual provider correlation.

Must pass:

- Every AC has real execution evidence and functional RED/GREEN; selected tests exercise the real driver.
- Five source pairs are identical, components came from public CLI installation and NativeWind configuration remains independent.
- All three targets provide inspected observations and provider correlation for stream/context/abort/errors/retries.
- Hash and absent-target cases fail closed; every exit releases owned resources without affecting others.
- Exact scope, pins, provenance, evidence identity and server-only secrets are preserved.

Should verify:

- Native text, safe-area/keyboard behavior and theme chrome remain usable under the preserved consumer root.
- Both engine drivers use the same interactions and typed backend contract; engine labels cannot substitute for independent execution.

Verdict: Pending independent review. Return APPROVED or NEEDS_FIXES with concrete evidence.

### DEPENDENCIES / CAPABILITIES / PROVENANCE
Depends on: ORI-RN-001, ORI-RN-004, ORI-AI-001.
Blocks: ORI-AI-002.

Provides:

- runNativewindLiveExampleProof and --platforms ios,android,web CLI with the same typed platform/run/source/device/output/owned-backend contract as runLiveExampleProof.
- Five-file source mapping, independent NativeWind compilation and fresh ios/android/web evidence consumable by ORI-AI-002.

Consumes:

- ORI-RN-001: clean NativeWind/Tailwind v3 consumer materializer, literal public install commands and unchanged root/provider/theme configuration.
- ORI-RN-004: runLiveExampleProof types and common real interactions; support/live-backend.ts owned-backend lifecycle contract.
- ORI-AI-001: canonical live-chat sources, installed-compatible exact hook packages and the reachable official OpenAI Responses backend.

Touches: CAP-DOCS-01.

PRD references:

- .spec/prds/docs-site/04-uc-docs.md#uc-docs-02-build-a-chat-screen-with-the-single-quickstart-tutorial
- .spec/prds/docs-site/12-e2e-testing-criteria.md
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md

Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/react-native-reusables-planner-absorb-prerequisites.json.
Source task IDs: ORI-RN-004, ORI-AI-002. Supersedes: [].

Isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.
Artifact status: planned_output_not_observed.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-RN-005","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"clean_nativewind":{"description":"Fresh consumer outside the monorepo, created by ORI-RN-001's real CLI entrypoint.","seed_method":"cli","records":["NativeWind/Tailwind v3 root; five canonical app sources; verified hook pins; normal public registry DNS/TLS.","Fresh run/SHA; reserved RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and backend/Metro/Web ports."]},"live_nativewind":{"description":"Real driver opens /live-chat with zero turns on each of iOS, Android and Web.","seed_method":"ui_flow","records":["Generate a fresh nonce per platform; send 'Remember marker <nonce> and count from 1 to 12.' with that nonce substituted.","Follow-up: 'What marker did I give you?' Backend uses server-only credentials and gpt-4.1-mini-2025-04-14; responses are never preseeded."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Install and compile exact source","description":"GIVEN a fresh NativeWind consumer and verified prerequisites WHEN the real driver installs public registry items and copies the canonical app sources THEN all five source hashes match and the clean Expo 57 consumer compiles.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-install-exact-source","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-install-exact-source","test_tier":"integration","verification_service":"Public RNR CLI/HTTPS registry, real filesystem and Expo 57 compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Public RNR CLI/HTTPS registry, real filesystem and Expo 57 compiler","negative_control":{"would_fail_if":["A static manifest or mocked CLI replaces the real public installation, or a disconnected compiler resolves workspace packages."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Run the real driver and ORI-RN-001's public install commands, including npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json.","Use npx expo install for verified hook pins; copy the five mapped app files; run the clean consumer compiler and Expo doctor."]},"end_state":{"must_observe":["5 source/target SHA-256 pairs match, with installed versions and public registry hashes recorded.","The NativeWind 4.2.6/Tailwind v3 /live-chat graph compiles using consumer dependencies; compiler and Expo doctor exit 0."],"must_not_observe":["empty installation, 0 copied sources, declaration shims, workspace links or Uniwind shell"]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Observe live text and context on all targets","description":"GIVEN the exact installed source and an empty live transcript WHEN a nonce-bearing prompt and contextual follow-up are sent on each target THEN iOS, Android and Web show incremental, correlated replies that retain the nonce.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-live-three-platforms","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-live-three-platforms","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","negative_control":{"would_fail_if":["A canned answer, static transcript, mocked provider or disconnected useChat hook supplies the screen."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_nativewind","action":{"actor":"user","steps":["On each real ios/android/web target, observe zero turns, send the generated nonce prompt, and capture text growth before completion.","Send the follow-up without the nonce; inspect native captures/accessibility and correlate both replies with backend/provider records."]},"end_state":{"must_observe":["3 platform records each contain at least 2 distinct nonempty assistant text lengths before completion.","Each final answer SHA-256 matches the server hash; request/response IDs, model gpt-4.1-mini-2025-04-14 and actual usage are recorded.","Each follow-up returns its first-turn nonce; the first user turn occurs 1 time and the successful composer clears."],"must_not_observe":["empty/placeholder answer, 0 growth observations, missing platform or stale-run receipt"]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Abort and recover through the real hook","description":"GIVEN a live NativeWind session on every target WHEN the user stops active generation and retries after real endpoint loss and provider rejection THEN active requests abort and both failure paths recover without duplicated user turns.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-abort-error-retry","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-abort-error-retry","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"NativeWind iOS/Android/Web, owned backend and official OpenAI Responses API","negative_control":{"would_fail_if":["Stop is a no-op, error state is mocked, or Retry returns a static answer without a new provider request."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_nativewind","action":{"actor":"user","steps":["On each target, start ORI-RN-004's bounded long generation; observe streaming while the provider request is active, then press Stop generating."]},"end_state":{"must_observe":["3 targets record Stop generating before completion, correlated provider abort and no further assistant growth."],"must_not_observe":["0 active requests at Stop, completion before Stop or continued growth after abort"]}},{"start_ref":"live_nativewind","action":{"actor":"user","steps":["Stop only the owned endpoint; submit a prompt, observe connection failure, restart it and press Retry on each target.","Use the shared backend contract to request a nonexistent model; observe actual rejection, restore gpt-4.1-mini-2025-04-14 and Retry."]},"end_state":{"must_observe":["3 targets each show 2 sanitized failure paths and 2 successful retries with new provider requests.","Recovered answer hashes match server hashes; each retained user turn occurs 1 time."],"must_not_observe":["blank error, 0 retry requests, leaked credentials, canned recovery or duplicated user turn"]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Reject invalid inputs and release owned resources","description":"GIVEN real source files and reserved execution resources WHEN a source hash differs, a requested target is absent, or execution exits THEN invalid runs fail explicitly and owned resources are released with retained evidence.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/nativewind-live-example.test.ts","test_function":"ORI-RN-005-fail-closed-cleanup","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-fail-closed-cleanup","test_tier":"integration","verification_service":"Real filesystem, platform tools and owned backend/Metro/Web processes","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-005-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, platform tools and owned backend/Metro/Web processes","negative_control":{"would_fail_if":["Source validation is stubbed, an absent target is silently skipped, or cleanup is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Run the real driver with an isolated manifest copy containing one mismatched source hash."]},"end_state":{"must_observe":["1 hash mismatch names the mapped path and expected/actual hashes; the run exits nonzero before target launch."],"must_not_observe":["0 mismatches, static success or launch with stale source"]}},{"start_ref":"clean_nativewind","action":{"actor":"cli_user","steps":["Confirm the requested proof-owned target is unavailable through real platform tooling; run the driver with that exact selector."]},"end_state":{"must_observe":["1 unavailable target yields a nonzero result naming its selector, without replacement."],"must_not_observe":["0 missing targets reported, skipped-target success or substituted target"]}},{"start_ref":"live_nativewind","action":{"actor":"cli_user","steps":["After success, real negative runs and controlled interruption, inspect owned processes/ports, Android mappings and device appearance."]},"end_state":{"must_observe":["teardown.json records both native appearances restored and reservations released; 0 owned listeners/mappings remain.","manifest.json retains 3 successful platform records, matching source/registry hashes, provider correlation and inspected captures."],"must_not_observe":["empty teardown, missing cleanup, lost prior-run evidence or altered unowned resources"]}}]}},{"id":"TC-1","type":"test_criterion","description":"Five source hashes match; public installation, consumer compiler and Expo doctor succeed.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-install-exact-source","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Three targets prove incremental replies and nonce-preserving context with provider correlation.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-live-three-platforms","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Active abort and both real failure/retry paths pass on three targets without duplicate user turns.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-abort-error-retry","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Invalid source/target inputs fail; every exit path releases only owned resources and retains evidence.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t ORI-RN-005-fail-closed-cleanup","maps_to_ac":"AC-4"}]}
-->
</details>
