<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search -->

## What this does

Learners use the separate live chat screen on iOS, Android and Web to receive real streamed replies, stop generation and recover from endpoint failure.

## Why

The Quickstart conclusion needs a runnable worked example with real streaming, stopping and recovery. This task supplies its Uniwind screen and observed proof.

## How to verify

Run `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web` and `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler` after prerequisite setup. Inspect native captures and provider correlation. Retain `pnpm --dir apps/example exec tsc --noEmit` separately. These are planned execution gates.

## Scope

The separate live route, its two composition components, the installed PromptInput mapper correction, scoped compiler configuration, owned real proof driver and bounded evidence. Exact paths are below.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-RN-004: Compose and verify the separate live chat screen in apps/example

> Status: ✅ Completed

Commit: 7e66cd5999b264064eb88bace6e97f0dfedc0125
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 5 · Type: DOCS
> Dependency phase: After ORI-RN-000, ORI-RN-003 and ORI-AI-001
> Proposed By: react-native-reusables-planner
> Co-authored By: aisdk-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
> PROGRESS: 0/5 ACs; all TDD_STATE values are none.

### OUTCOME

Learners use the separate live chat screen on iOS, Android and Web to receive real streamed replies, stop generation and recover from endpoint failure.

### 🚫 CRITICAL CONSTRAINTS

- Keep provider credentials exclusively in the trusted launcher and backend; never expose them to installs, Metro, compilers, browsers, EXPO_PUBLIC settings, command arguments or evidence.
- Use only recorded owned processes, reserved targets and the assigned isolated candidate; preserve shared WIP and stop on unowned listeners.
- Never substitute mocked HTTP, a stub hook/provider, injected messages, canned streams, test-only app routes, skipped platforms or static success for real UI and provider proof.
- Preserve the installed Uniwind engine, Expo Go Text renderer, existing root providers and compiler strictness; never modify protected files or hide diagnostics.
- Keep transport, provider configuration, dependencies, abort/retry semantics and throttling with ORI-AI-001; this task composes the installed API and proves its actual behavior.

### DONE WHEN

- [ ] AC-1 and TC-1 prove the separate route on all three platforms.
- [ ] AC-2 and TC-2 prove incremental provider responses and contextual history.
- [ ] AC-3 and TC-3 prove active abort and real endpoint-loss recovery.
- [ ] AC-4 and TC-4 prove native keyboard, readability and appearance behavior.
- [ ] AC-5 and TC-5 prove the strict live import graph; all evidence, lint and scope gates pass.

### RUNTIME COMMANDS

```json
{"test":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","typecheck":"pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json","lint":"pnpm exec biome ci apps/example/app/live-chat.tsx apps/example/components/live-chat-screen.tsx apps/example/components/live-chat-message.tsx apps/example/components/ai/prompt-input.logic.ts apps/example/tsconfig.live-chat.json tests/sprint-05-orient-search/support/live-example-proof.test.ts","diagnostic":"pnpm --dir apps/example exec tsc --noEmit"}
```

### ACCEPTANCE CRITERIA

The locked DOCS task uses its task-owned real end-to-end driver and real compiler integration with flow_ref:null and primary:false. It supports the locked Quickstart flow without claiming primary ownership or relabeling runtime proof as unit.

Each complete row below is the human-readable AC and proof specification. The same row appears unchanged in the machine contract. Each AC has a separate assertion group in the owned driver or compiler proof.

**AC-1: Separate live route**

```json
{"id":"AC-1","type":"acceptance_criterion","name":"Separate live route","primary":false,"description":"GIVEN a fresh example-app session on each platform WHEN the learner opens /live-chat and submits a fresh marker THEN the live screen accepts the turn while the offline entry remains reachable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The live route is absent or a static screen leaves submission disconnected from the real hook."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_fresh","action":{"actor":"user","steps":["Open / and record the existing offline screen; navigate to /live-chat through the real app entrypoint on ios, android and web.","Observe the initial empty transcript, enter the run marker in PromptInput and activate Send message; revisit / afterward."]},"end_state":{"must_observe":["3/3 platforms open `/live-chat` with `Send message`; the initial transcript has 0 turns.","Each transcript gains exactly 1 user turn containing the submitted run marker and the accepted composer clears.","The `/` offline screen remains reachable on all 3 platforms."],"must_not_observe":["An unchanged empty transcript after Send message, a missing live route, or replacement of the offline screen."]}}]}}
```

**AC-2: Incremental response and contextual history**

```json
{"id":"AC-2","type":"acceptance_criterion","name":"Incremental response and contextual history","primary":false,"description":"GIVEN an exchange seeded through the real provider WHEN the learner sends a contextual follow-up without repeating the marker THEN incremental replies retain context and match the recorded provider response.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The hook is disconnected, messages are static, history is omitted, or a replayed stream replaces the real provider."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["On ios, android and web, capture the seeded exchange while streaming, then submit: What marker did I ask you to remember?","Observe actual text growth and completion; correlate each visible response with the same run, platform, backend request, OpenAI response and final server text hash."]},"end_state":{"must_observe":["3/3 platforms capture at least 2 increasing assistant-text lengths before completion for a real request.","The follow-up answer contains the exact earlier `ORI-RN-004:<run-id>:<platform>` marker despite its absence from the follow-up prompt.","There are exactly 2 user turns in chronological order; each completed visible reply matches its recorded server text hash."],"must_not_observe":["An empty or unchanged assistant response, a canned answer, missing prior-turn context, or a response correlated to another run."]}}]}}
```

**AC-3: Active Stop and service-loss recovery**

```json
{"id":"AC-3","type":"acceptance_criterion","name":"Active Stop and service-loss recovery","primary":false,"description":"GIVEN a real completed exchange WHEN the learner stops an active generation and retries after owned-endpoint loss THEN abort reaches the provider and retry completes without duplicating the retained user turn.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["Stop or Retry is a no-op, errors are omitted, or a mocked fetch returns success without the owned endpoint."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["Submit a bounded long-answer prompt on each platform and wait for a real incremental delta while the provider request remains active.","Activate Stop generating before completion; observe the actual backend abort and then send a fresh short prompt."]},"end_state":{"must_observe":["3/3 platforms correlate `Stop generating` with an active request aborted before natural completion.","On all 3 platforms the stopped reply ceases growing; a later request has a new request ID and a completed visible answer matching its server text hash."],"must_not_observe":["An unchanged active request after Stop, no abort event, or natural completion presented as abort evidence."]}},{"start_ref":"live_example_history","action":{"actor":"user","steps":["Stop only the recorded owned backend through its lifecycle handle; submit a fresh nonsecret turn through Send message.","Observe the actionable sanitized error, restart the same owned endpoint and activate Retry on the retained turn."]},"end_state":{"must_observe":["3/3 platforms show a sanitized service-loss error and an accessible `Retry` control.","Retry creates a new real request ID, completes a provider-correlated answer and leaves exactly 1 user turn for the failed submission."],"must_not_observe":["An empty error surface, static success while the endpoint is stopped, a missing retry request, or a duplicated retained user turn."]}}]}}
```

**AC-4: Readable native streaming and keyboard layout**

```json
{"id":"AC-4","type":"acceptance_criterion","name":"Readable native streaming and keyboard layout","primary":false,"description":"GIVEN real streaming turns on the reserved native targets WHEN the learner opens the keyboard and switches appearance THEN text, composer and native chrome remain readable in both schemes.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The transcript is empty/static, keyboard avoidance is removed, or text styling is disconnected from the installed theme."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["On the reserved iOS simulator and Android emulator, start a real response, keep the composer keyboard open, and inspect light then dark appearance.","Scroll to the older seeded turn and return to the growing response; inspect iOS screenshots and Android recordings with keyboard, composer and native chrome visible."]},"end_state":{"must_observe":["4 native platform/appearance combinations show readable nonempty assistant text and the seeded `ORI-RN-004` user turn.","The composer and its `Send message` or `Stop generating` control remain above the keyboard and system gesture region in all 4 combinations.","The `light` and `dark` captures show themed message content, navigation chrome and status bar while transcript scrolling remains usable."],"must_not_observe":["A blank transcript, an unreachable composer, text clipped behind the keyboard, or unchanged light chrome in dark appearance."]}}]}}
```

**AC-5: Real live-import-graph compiler**

```json
{"id":"AC-5","type":"acceptance_criterion","name":"Real live-import-graph compiler","primary":false,"description":"GIVEN the actual installed dependencies and inherited strict Expo configuration WHEN the live-route compiler and whole-example diagnostic run THEN the live import graph compiles and broader diagnostics remain separately visible.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"ORI-RN-004-AC-5-live-import-graph-compiler","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler","test_tier":"integration","verification_service":"real TypeScript compiler, Expo 57 packages, installed AI SDK and React Native declarations","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-5","use_case_ref":"UC-DOCS-02","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real TypeScript compiler, Expo 57 packages, installed AI SDK and React Native declarations","negative_control":{"would_fail_if":["The compiler graph omits the live route, imports resolve to declaration stubs, or a static success receipt replaces actual compiler execution."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_example_compiler","action":{"actor":"cli_user","steps":["Run pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json against the actual route and transitive installed components.","Run pnpm --dir apps/example exec tsc --noEmit separately and retain its complete output and exit status without suppressions."]},"end_state":{"must_observe":["The real `tsconfig.live-chat.json` compiler exits 0 with `app/live-chat.tsx`, `live-chat-screen.tsx`, `live-chat-message.tsx` and installed component imports in its program.","`live-import-graph-typecheck.txt` and `example-package-typecheck.txt` contain the exact commands, source identity, actual output and respective exit statuses.","The inherited `strict: true` remains effective; whole-example diagnostics are reported separately."],"must_not_observe":["An empty compiler program, stub declarations, ignore comments, relaxed compiler options, or a whole-package green claim based only on the scoped compiler."]}}]}}
```

### TEST CRITERIA

- **TC-1 → AC-1**: The separate /live-chat screen accepts exactly one submitted marker on all three platforms and the offline / entry remains reachable. Verify: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web`
- **TC-2 → AC-2**: All three platforms show incremental real responses, preserve the prior marker in a contextual follow-up and match visible completion to server text hashes. Verify: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web`
- **TC-3 → AC-3**: All three platforms prove active provider abort, visible real endpoint-loss errors and successful retry without duplicating the failed user turn. Verify: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web`
- **TC-4 → AC-4**: Both native platforms show readable streaming text, reachable keyboard-open controls and themed native chrome in light and dark appearance. Verify: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web`
- **TC-5 → AC-5**: The real strict live-route import graph compiles; whole-example compiler output and exit status remain separately reported without suppression. Verify: `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler`

### FIXTURES

```json
{"live_example_fresh":{"description":"For each of ios, android and web, launch the real Uniwind apps/example through its public route with a fresh UI session and an owned ORI-AI-001 backend.","seed_method":"ui_flow","records":["Initial /live-chat transcript has 0 turns; the existing / offline route is separately reachable.","Use a fresh nonsecret marker ORI-RN-004:<run-id>:<platform>; enter prompts only through PromptInput.","The fixed provider is OpenAI Responses with model gpt-4.1-mini-2025-04-14; credentials are held only by the trusted launcher and backend.","Reserve RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL, browser context and exact backend/Metro/Web ports; record source SHA, run ID and original device appearance."]},"live_example_history":{"description":"In each real live screen, seed a completed exchange through Send message and the real provider before exercising history, stopping or recovery.","seed_method":"ui_flow","records":["Submit: Remember the marker ORI-RN-004:<run-id>:<platform>. Repeat it and give three short facts about rain.","Await the actual completed provider reply; retain its request/response IDs, incremental captures and final text hash.","The transcript contains 1 user turn and 1 real assistant turn; the composer is cleared after accepted submission."]},"live_example_compiler":{"description":"Use the actual isolated candidate and dependencies installed by ORI-AI-001 through Expo tooling, plus the real CLI PromptInput mapper correction from ORI-RN-000.","seed_method":"cli","records":["The inherited strict Expo configuration and real installed SDK/RN declarations remain in effect.","tsconfig.live-chat.json includes app/live-chat.tsx and its transitive imports; the whole-example tsconfig is kept for separate diagnostics.","Record source SHA and installed dependency/lockfile identities before running the real TypeScript compiler."]}}
```

### SCOPE

**writeAllowed**

- `apps/example/app/live-chat.tsx`
- `apps/example/components/live-chat-screen.tsx`
- `apps/example/components/live-chat-message.tsx`
- `apps/example/components/ai/prompt-input.logic.ts`
- `tests/sprint-05-orient-search/support/live-example-proof.test.ts`
- `tests/sprint-05-orient-search/live-example.maestro.yaml`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/`
- `apps/example/tsconfig.live-chat.json`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/live-import-graph-typecheck.txt`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/example-package-typecheck.txt`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/provider-correlation.json`

**writeProhibited**

- `apps/example/app/index.tsx`
- `apps/example/gallery/**`
- `apps/example/server/**`
- `apps/example/lib/use-live-chat.ts`
- `apps/example/package.json`
- `apps/example/app/_layout.tsx`
- `apps/example/global.css`
- `apps/example/lib/theme.ts`
- `apps/example/lib/nav-theme.ts`
- `packages/registry/**`
- `pnpm-lock.yaml`
- `apps/docs/**`
- `.github/**`
- `.spec/**`

Any path absent from writeAllowed is prohibited.

### BOUNDARIES

**Always**

- Drive real public controls with per-AC assertions in runLiveExampleProof; capture run/source/request identities and observed values.
- Pass chronological messages to the installed virtualized Conversation; narrow text parts before string-only MessageResponse and use Message from.
- Compose PromptInput status, PromptInputMessage submission and onStop from the real hook; preserve component-owned clearing and expose accessible error/retry controls.
- Refresh only the ORI-RN-000 PromptInput mapper correction through the real CLI and retain unrelated installed-source edits.
- On every exit abort active requests, clear timers/listeners, stop only recorded children, remove only owned Android mappings, restore appearance and release reservations.

**Ask first**

- Escalate a required write outside the allowlist or a change to dependency ownership before expanding the implementation.
- If the hook is actually assigned to ORI-AI-002, amend the dependency through the orchestrator before dispatch; never introduce a hook-to-screen-proof cycle.
- Unavailable pinned packages, provider/model access or required native runtime support need an explicit owner decision; never substitute another pin, model or platform.

Do not stash, reset, clean, broadly stage, merge or perform trunk lifecycle operations.

### BOUNDARY CONTRACTS

- ORI-AI-001 is the fusion reservation for the real endpoint and hook. The AI SDK specialist owns dependency installation, provider configuration, transport, abort semantics, retry semantics, and streaming throttling.
- If the AI SDK correction keeps the older split with ORI-AI-002 owning the hook, add ORI-AI-002 as a dependency before finalizing this task. Do not create a dependency cycle from the hook implementation back to screen proof.
- Use the installed Message from prop and PromptInputMessage submission contract. Do not copy the stale callback/composer composition from apps/example/app/index.tsx.
- The existing root already supplies GestureHandlerRootView, navigation theme, StatusBar, and PortalHost. This screen introduces no overlay, token migration, or second portal host.
- The live screen is a text-chat worked example. It does not add tools, persistence, voice, attachments, or a second tutorial.
- Provider keys remain server-side. Client configuration contains only the reachable endpoint address and other non-secret settings.
- The proof invokes the actual app route and public UI controls. It does not inject messages, replace useChat, fake fetch, replay a canned stream, or use a test-only app route.
- Extend the existing scoped live-chat tsconfig entrypoints to app/live-chat.tsx without changing compiler strictness. Compile the real route import graph, including installed registry components, against actual Expo 57 dependencies. The untouched gallery is outside this new compiler's claim; preserve the separate whole-example diagnostics.
- Export runLiveExampleProof from support/live-example-proof.test.ts. It accepts engine=uniwind, platform, source SHA, run ID, exact reserved device or browser identity, output directory and the real owned-backend lifecycle handle. Its CLI --platforms ios,android,web creates that handle through support/live-backend.ts. Drive send, contextual follow-up, active Stop, server-loss and retry on actual controls; return observed captures, never a fabricated success receipt. The focused --case ORI-RN-004-AC-5-live-import-graph-compiler selector runs both actual TypeScript commands specified by AC-5, asserts the scoped live import graph and unchanged strictness, and retains the whole-example output and exit status separately. It cannot substitute a source check or receipt for real compiler execution.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/live-example-proof.test.ts` (NEW): Export runLiveExampleProof and its three-platform CLI; return observed captures through the real owned-backend lifecycle.
- `apps/example/components/live-chat-screen.tsx` (NEW): Compose the installed components over the real hook, including accessible errors and retry.
- `apps/example/components/live-chat-message.tsx` (NEW): Render narrowed text parts with Message from and string-only MessageResponse.
- `apps/example/app/live-chat.tsx` (NEW): Expose the separate real /live-chat route.
- `apps/example/components/ai/prompt-input.logic.ts` (MODIFY): Retain only the real CLI-delivered mapper correction from ORI-RN-000.
- `apps/example/tsconfig.live-chat.json` (MODIFY dependency output): Include the live route and its real transitive imports without relaxing compiler options.
- `tests/sprint-05-orient-search/live-example.maestro.yaml` (NEW): Drive native public controls for the owned proof.
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/` (PLANNED OUTPUT): Bounded compiler, native/browser and sanitized provider correlation artifacts.

### AGENT INSTRUCTIONS — TDD

**RED**: Before implementation, add per-AC assertions to the owned real driver or execute the real compiler case. Run the exact command against the preimplementation candidate and preserve the observed functional failure. Wait for orchestrator verification of RED. Missing prerequisites or authored failure flags do not count as functional RED.

**GREEN**: Implement only the current criterion within the allowlist, rerun its exact command and capture observed values. Wait for orchestrator verification of GREEN.

**REFACTOR**: Refactor only when needed to keep the allowed composition clear; rerun affected proof and compiler checks without adding behavior.

**HANDOFF**: After all criteria and evidence gates pass, submit the isolated candidate for react-native-reusables-reviewer review. Workers never merge.

### READING LIST

1. `apps/example/components/ai/conversation.tsx`, lines 54-161 [PRIMARY PATTERN]: Chronological generic data, internal inversion/virtualization, safe-area padding and keyboard avoidance; put the composer in the existing child slot.
2. `apps/example/components/ai/message.tsx`, lines 30-127: Message from, MessageContent text-foreground context and string-only default Text MessageResponse.
3. `apps/example/components/ai/prompt-input.tsx`, lines 227-264,353-378,730-753: PromptInputMessage, status/onStop, accepted-submit clearing and actual Send message/Stop generating labels.
4. `apps/example/app/_layout.tsx`, lines 15-33: Reuse GestureHandlerRootView, navigation ThemeProvider, StatusBar and the single root PortalHost.
5. `apps/example/tsconfig.json`, lines 1-11: Extend strict Expo options and real aliases in the dependency-provided live-chat compiler configuration.

### DESIGN AND REFERENCE GUIDANCE

- Use the installed Conversation child slot for the composer; avoid a second keyboard wrapper or portal host.
- Reuse MessageContent's text-foreground context. New labels use RNR Text; buttons and icons consume the existing text-style providers. No new variant context is required.
- Use the existing token classes and navigation theme; no token migration, overlay, new animation or styling-engine change.
- Omit renderMarkdown to retain the default Text renderer and Expo Go compatibility.
- The project pins and installed source override older expo-ai-elements examples: this Conversation is already virtualized and this registry supports both engines.

References: `/Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/MIGRATION.md`, `/Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/README.md`, `/Users/justinrich/Projects/brain/.rosetta/docs/expo-ai-elements/README.md`.

### CODING STANDARDS

- Follow AGENTS.md, TypeScript strictness and Biome; use actual installed types without any, declaration stubs, ignore comments or compatibility shims.
- Use React Native View/Text, RNR Button/Icon and onPress; do not copy DOM source, assume class cascade or install web AI Elements.
- Preserve component and hook ownership: no transport in registry components, no second transcript store and no changes to hook throttling.
- Use real CLI-installed source and inspect upgrade diffs; keep unrelated installed customizations.
- Use OS-derived scratch roots and task-owned evidence directories; retain source/command identities and sanitized outcomes.

### VERIFICATION AND EVIDENCE GATES

- Record functional RED for every AC against the real preimplementation candidate. Run the exact strict live-route compiler and scoped Biome command; any live-graph error blocks this task.
- Run the exact three-platform live proof with actual UI, endpoint and provider. Every target must execute. Capture per-AC assertions and seeded values; exit 0 alone is insufficient.
- Run and retain the exact whole-example diagnostic independently. Do not infer package-wide green or label failures pre-existing without baseline evidence. Check the complete allowed-path diff before independent review.
- Retain per-run RED/GREEN output under the bounded task evidence directory. Each native/browser leg records its exact target, runtime/driver versions, source and registry hashes, request/response IDs, model, usage, observed growth, final answer correlation, active abort and service-loss recovery. Inspect iOS screenshots and Android recordings, including light/dark keyboard and accessibility captures.
- provider-correlation.json links sanitized backend/provider observations to visible replies. Compiler artifacts retain exact commands, source SHA, program scope, actual output and exit status. Verify cleanup of owned resources. The canonical shared-flow RED remains `tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red`; its owner records it. The final shared gate awaits fresh same-invocation proof and rejects missing legs or stale/mismatched receipts.

Exact planned evidence paths:

- `tests/sprint-05-orient-search/evidence/ORI-RN-004/live-import-graph-typecheck.txt`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/example-package-typecheck.txt`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-004/provider-correlation.json`

All product evidence remains future output. Read-only authoring validation completed with 5 scenarios and zero findings; no product verification ran during rendering.

### EXECUTION PRECONDITIONS

- **VP-EXECUTION-SCOPE / VP-EXAMPLE-DIAGNOSTICS**: Execute later in an isolated candidate with OS-derived scratch roots. Root typecheck excludes apps. Preserve whole-example diagnostics; errors in the required live graph block this task. Broader gallery repair needs separate scope.
- **VP-AI-PACKAGES / VP-OPENAI**: ORI-AI-001 must prove Expo installation and LanguageModelV4 compatibility for ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1. Unavailable pins block execution. Use actual OpenAI Responses requests with gpt-4.1-mini-2025-04-14; key presence is insufficient. Preserve sanitized authentication/model/quota/network outcomes. The complete shared flow retains real provider rejection and retry.
- **VP-SECRETS**: Only the trusted launcher/backend receives credentials. Strip credentials from other children, client configuration and evidence; inspect produced client artifacts without printing matched values.
- **VP-PORTS / VP-NATIVE**: Reserve exact backend, Metro and Web ports, RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL. Identify listeners and refuse unowned processes; localhost:4321 remains the docs gate. Verify native reachability and Web CORS. Boot the selected available AVD, verify compatible Expo Go and real automation, preserve unrelated simulators, use separate consumers/caches and worktree-local outputs. Verify actual expo/fetch streaming, structuredClone and text-encoding globals on every target.
- **VP-CLEANUP-AND-EVIDENCE**: On every exit abort requests, clear timers/listeners, stop only recorded children, remove owned Android mappings, restore appearance and release reservations. Preserve run identities and verify no owned listener remains.

### OUT OF SCOPE

- Offline index/gallery repair and package-wide diagnostic remediation outside the required live import graph.
- Endpoint, hook, dependency installation, provider configuration, transport, abort/retry implementation or throttling changes owned by ORI-AI-001.
- NativeWind live consumer composition owned by ORI-RN-005; the complete six-target Quickstart gate owned by ORI-CONT-004.
- Tools, persistence, voice, attachments, richer native markdown, another tutorial, theme migration or new root providers.
- Registry source changes, docs authoring, CI, deployment, policy edits, planning writes and git lifecycle operations in this rendering request.

### CONTEXT

**Current gap**: The locked task requires a separate live route and its observed native/browser proof. The installed Conversation already virtualizes and avoids the keyboard; the existing root supplies providers. The endpoint and hook remain prerequisite outputs.

**Success state**: All five criteria have observed RED/GREEN evidence from the real three-platform Uniwind screen and strict live-route compiler, with broader compiler diagnostics separately retained.

**Implementation surface**: Add the real /live-chat route linked from the Quickstart conclusion. Compose the installed RNR chat components over the hook and endpoint supplied by ORI-AI-001. Keep the existing Uniwind app engine and root providers. Use the default Text markdown renderer so the live screen remains Expo Go compatible. Render chronological UIMessage data through the existing virtualized Conversation, narrow text parts, and pass strings to MessageResponse. Wire PromptInput status, submission, and Stop generating to the real hook. Expose the hook's actionable error and retry state with accessible controls. Refresh only the installed PromptInput mapper correction from ORI-RN-000 through the real CLI, inspecting and retaining unrelated installed-source changes.

**Human test hook**: The learner follows the Quickstart conclusion and sends a prompt through the worked example to a real provider.

**Isolation**: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### REVIEW

Reviewer: react-native-reusables-reviewer.

**Must pass**

- Every AC/TC maps to actual per-AC driver or compiler assertions with functional RED and fresh seeded GREEN evidence.
- All three Uniwind platforms reach the real provider; history, active abort, endpoint loss and retry satisfy the concrete oracles.
- Actual strict live-route compilation and scoped lint pass; broader diagnostics remain separate and unsuppressed.
- All writes stay within the exact allowlist and original boundary contracts; no stubs, skips, canned outputs or deferred core logic remain.
- Evidence binds the same source/run and shows cleanup of owned processes, targets and mappings.

**Should verify**

- Native screenshots and recordings show readable text, correct keyboard/inset behavior and themed chrome.
- Message from, string-only MessageResponse and PromptInputMessage follow installed source contracts.
- Virtualization, chronological data, component-owned clearing and hook throttling remain intact.
- Errors are actionable and sanitized; retry does not duplicate the retained user turn.
- The Quickstart primary owner and canonical proof.red path remain unchanged.

Verdict: APPROVED or NEEDS_FIXES, with concrete evidence and file/line feedback. No review has run.

**Agent rationale**: The project-local RNR planner/implementer/reviewer trio owns installed React Native composition, keyboard/inset behavior and real native proof. aisdk-planner co-authorship preserves the hook/backend boundary.

### DEPENDENCIES AND CAPABILITIES

Depends on: ORI-RN-000, ORI-RN-003, ORI-AI-001.

Blocks: no additional dependency edges authored. Provide the Uniwind screen and runLiveExampleProof captures to ORI-RN-005 and the ORI-CONT-004-owned Quickstart gate.

Provides:

- NATIVE-OWNED-LIVE-EXAMPLE-COMPOSITION
- NATIVE-OWNED-LIVE-EXAMPLE-PROOF
- SEAM-RN-REAL-USECHAT-EXAMPLE

Consumes:

- ORI-RN-000: corrected published PromptInput mapper and real CLI refresh input.
- ORI-RN-003: real native/browser proof support and reserved-target setup.
- ORI-AI-001: real installed SDK dependencies, use-live-chat hook, reachable owned backend and support/live-backend.ts lifecycle handle.
- Existing apps/example installed Conversation, Message and PromptInput plus the Uniwind root providers.

Touches: CAP-DOCS-01.

PRD references: `.spec/prds/docs-site/04-uc-docs.md#uc-docs-02`, `.spec/prds/docs-site/12-e2e-testing-criteria.md`, `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`.

### LOCKED FLOW SUPPORT

```json
{"flow_ref":"FLOW-DOCS-02-quickstart-chat-screen","primary":false,"primary_owner":"ORI-CONT-004","scope":"task","gate_step":"ORI-GATE-03","gate_steps":[3],"test_file":"tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts","test_function":"FLOW-DOCS-02-quickstart-chat-screen","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop","artifact":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","contribution":"Own the separate Uniwind live-screen composition and three-platform proof. The locked flow still requires both engines, clean public installs, contextual history, active abort, endpoint loss, real provider rejection and retry in the same invocation. ORI-RN-005 and AI owners supply their reserved legs; this task cannot claim the complete six-target flow."}
```

Journey proofs remain with ORI-AST-010. This task returns none. Governed observations must assert the actual live transcript, submitted marker and public controls; generic page roots are not success oracles. The surface policy is a read-only input.

### FIXED SPRINT CONTRACT

```json
{"gate":"A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.","entrypoint":"docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction","demonstrates":"UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)","flow_count":13,"task_flow_count":9,"journey_flow_count":4,"task_count":36,"point_total":131}
```

### PROVENANCE

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/react-native-reusables-planner-absorb-prerequisites.json`.

Source task IDs: ORI-RN-004. Co-authored by: aisdk-planner. Artifact status: planned_output_not_observed.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-RN-004","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"live_example_fresh":{"description":"For each of ios, android and web, launch the real Uniwind apps/example through its public route with a fresh UI session and an owned ORI-AI-001 backend.","seed_method":"ui_flow","records":["Initial /live-chat transcript has 0 turns; the existing / offline route is separately reachable.","Use a fresh nonsecret marker ORI-RN-004:<run-id>:<platform>; enter prompts only through PromptInput.","The fixed provider is OpenAI Responses with model gpt-4.1-mini-2025-04-14; credentials are held only by the trusted launcher and backend.","Reserve RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL, browser context and exact backend/Metro/Web ports; record source SHA, run ID and original device appearance."]},"live_example_history":{"description":"In each real live screen, seed a completed exchange through Send message and the real provider before exercising history, stopping or recovery.","seed_method":"ui_flow","records":["Submit: Remember the marker ORI-RN-004:<run-id>:<platform>. Repeat it and give three short facts about rain.","Await the actual completed provider reply; retain its request/response IDs, incremental captures and final text hash.","The transcript contains 1 user turn and 1 real assistant turn; the composer is cleared after accepted submission."]},"live_example_compiler":{"description":"Use the actual isolated candidate and dependencies installed by ORI-AI-001 through Expo tooling, plus the real CLI PromptInput mapper correction from ORI-RN-000.","seed_method":"cli","records":["The inherited strict Expo configuration and real installed SDK/RN declarations remain in effect.","tsconfig.live-chat.json includes app/live-chat.tsx and its transitive imports; the whole-example tsconfig is kept for separate diagnostics.","Record source SHA and installed dependency/lockfile identities before running the real TypeScript compiler."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Separate live route","primary":false,"description":"GIVEN a fresh example-app session on each platform WHEN the learner opens /live-chat and submits a fresh marker THEN the live screen accepts the turn while the offline entry remains reachable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The live route is absent or a static screen leaves submission disconnected from the real hook."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_fresh","action":{"actor":"user","steps":["Open / and record the existing offline screen; navigate to /live-chat through the real app entrypoint on ios, android and web.","Observe the initial empty transcript, enter the run marker in PromptInput and activate Send message; revisit / afterward."]},"end_state":{"must_observe":["3/3 platforms open `/live-chat` with `Send message`; the initial transcript has 0 turns.","Each transcript gains exactly 1 user turn containing the submitted run marker and the accepted composer clears.","The `/` offline screen remains reachable on all 3 platforms."],"must_not_observe":["An unchanged empty transcript after Send message, a missing live route, or replacement of the offline screen."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Incremental response and contextual history","primary":false,"description":"GIVEN an exchange seeded through the real provider WHEN the learner sends a contextual follow-up without repeating the marker THEN incremental replies retain context and match the recorded provider response.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The hook is disconnected, messages are static, history is omitted, or a replayed stream replaces the real provider."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["On ios, android and web, capture the seeded exchange while streaming, then submit: What marker did I ask you to remember?","Observe actual text growth and completion; correlate each visible response with the same run, platform, backend request, OpenAI response and final server text hash."]},"end_state":{"must_observe":["3/3 platforms capture at least 2 increasing assistant-text lengths before completion for a real request.","The follow-up answer contains the exact earlier `ORI-RN-004:<run-id>:<platform>` marker despite its absence from the follow-up prompt.","There are exactly 2 user turns in chronological order; each completed visible reply matches its recorded server text hash."],"must_not_observe":["An empty or unchanged assistant response, a canned answer, missing prior-turn context, or a response correlated to another run."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Active Stop and service-loss recovery","primary":false,"description":"GIVEN a real completed exchange WHEN the learner stops an active generation and retries after owned-endpoint loss THEN abort reaches the provider and retry completes without duplicating the retained user turn.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["Stop or Retry is a no-op, errors are omitted, or a mocked fetch returns success without the owned endpoint."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["Submit a bounded long-answer prompt on each platform and wait for a real incremental delta while the provider request remains active.","Activate Stop generating before completion; observe the actual backend abort and then send a fresh short prompt."]},"end_state":{"must_observe":["3/3 platforms correlate `Stop generating` with an active request aborted before natural completion.","On all 3 platforms the stopped reply ceases growing; a later request has a new request ID and a completed visible answer matching its server text hash."],"must_not_observe":["An unchanged active request after Stop, no abort event, or natural completion presented as abort evidence."]}},{"start_ref":"live_example_history","action":{"actor":"user","steps":["Stop only the recorded owned backend through its lifecycle handle; submit a fresh nonsecret turn through Send message.","Observe the actionable sanitized error, restart the same owned endpoint and activate Retry on the retained turn."]},"end_state":{"must_observe":["3/3 platforms show a sanitized service-loss error and an accessible `Retry` control.","Retry creates a new real request ID, completes a provider-correlated answer and leaves exactly 1 user turn for the failed submission."],"must_not_observe":["An empty error surface, static success while the endpoint is stopped, a missing retry request, or a duplicated retained user turn."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Readable native streaming and keyboard layout","primary":false,"description":"GIVEN real streaming turns on the reserved native targets WHEN the learner opens the keyboard and switches appearance THEN text, composer and native chrome remain readable in both schemes.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"runLiveExampleProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"real apps/example in Expo Go on iOS and Android and a Web browser, ORI-AI-001 backend and OpenAI Responses","negative_control":{"would_fail_if":["The transcript is empty/static, keyboard avoidance is removed, or text styling is disconnected from the installed theme."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"live_example_history","action":{"actor":"user","steps":["On the reserved iOS simulator and Android emulator, start a real response, keep the composer keyboard open, and inspect light then dark appearance.","Scroll to the older seeded turn and return to the growing response; inspect iOS screenshots and Android recordings with keyboard, composer and native chrome visible."]},"end_state":{"must_observe":["4 native platform/appearance combinations show readable nonempty assistant text and the seeded `ORI-RN-004` user turn.","The composer and its `Send message` or `Stop generating` control remain above the keyboard and system gesture region in all 4 combinations.","The `light` and `dark` captures show themed message content, navigation chrome and status bar while transcript scrolling remains usable."],"must_not_observe":["A blank transcript, an unreachable composer, text clipped behind the keyboard, or unchanged light chrome in dark appearance."]}}]}},{"id":"AC-5","type":"acceptance_criterion","name":"Real live-import-graph compiler","primary":false,"description":"GIVEN the actual installed dependencies and inherited strict Expo configuration WHEN the live-route compiler and whole-example diagnostic run THEN the live import graph compiles and broader diagnostics remain separately visible.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-example-proof.test.ts","test_function":"ORI-RN-004-AC-5-live-import-graph-compiler","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler","test_tier":"integration","verification_service":"real TypeScript compiler, Expo 57 packages, installed AI SDK and React Native declarations","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-RN-004-5","use_case_ref":"UC-DOCS-02","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real TypeScript compiler, Expo 57 packages, installed AI SDK and React Native declarations","negative_control":{"would_fail_if":["The compiler graph omits the live route, imports resolve to declaration stubs, or a static success receipt replaces actual compiler execution."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"live_example_compiler","action":{"actor":"cli_user","steps":["Run pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json against the actual route and transitive installed components.","Run pnpm --dir apps/example exec tsc --noEmit separately and retain its complete output and exit status without suppressions."]},"end_state":{"must_observe":["The real `tsconfig.live-chat.json` compiler exits 0 with `app/live-chat.tsx`, `live-chat-screen.tsx`, `live-chat-message.tsx` and installed component imports in its program.","`live-import-graph-typecheck.txt` and `example-package-typecheck.txt` contain the exact commands, source identity, actual output and respective exit statuses.","The inherited `strict: true` remains effective; whole-example diagnostics are reported separately."],"must_not_observe":["An empty compiler program, stub declarations, ignore comments, relaxed compiler options, or a whole-package green claim based only on the scoped compiler."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The separate /live-chat screen accepts exactly one submitted marker on all three platforms and the offline / entry remains reachable.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All three platforms show incremental real responses, preserve the prior marker in a contextual follow-up and match visible completion to server text hashes.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"All three platforms prove active provider abort, visible real endpoint-loss errors and successful retry without duplicating the failed user turn.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Both native platforms show readable streaming text, reachable keyboard-open controls and themed native chrome in light and dark appearance.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios,android,web","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"The real strict live-route import graph compiles; whole-example compiler output and exit status remain separately reported without suppression.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler","maps_to_ac":"AC-5"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-RN-004",
  "commit_sha": "7e66cd5999b264064eb88bace6e97f0dfedc0125",
  "done": "Landed the hardened AC-3 case-2 transcript-count oracle in tests/sprint-05-orient-search/support/live-example-proof.test.ts (transcriptProbeCount near :777, dismissIosKeyboardByTap near :590, maestroScrollUntilVisible direction DOWN near :639, innermost-match hierarchyElementCount near :564), refreshed every artifact under tests/sprint-05-orient-search/evidence/ORI-RN-004/ plus the README, and committed the cycle-3 RED/GREEN lineage under .tmp/ORI-RN-004/cycle-3/ — final GREEN run ORI-RN-004-C3F-1789744559 on the committed source passed 3/3 platforms (all five legs, exactly 1 retained probe turn each, backend 20 completed + 4 aborted + 0 error), with AC-5 re-proven and typecheck/biome/fallow all exit 0.",
  "deviations": [
    "Kept the UI transcript-count as the AC-3 case-2 oracle instead of switching to backend record counts as the dispatch context hinted, because the AC's end state ('leaves exactly 1 user turn', must_not_observe 'a duplicated retained user turn') is a UI observation and the backend completed-record gates already run alongside it.",
    "Credential-shaped env vars are stripped by temporarily mutating process.env around Metro/expo-export/Chromium/tsc spawns (live-example-proof.test.ts:~264 and call sites), because the spawn call sites that would take an explicit env live in writeProhibited support files (native-session.ts:313, quickstart-consumer.ts).",
    "The evidence dirs gained retry-state.png captures per native leg (and transient retry-state-hierarchy.txt on failed attempts), which the task's exact-path list does not name but the evidence/ORI-RN-004/{ios,android}/ allowlist covers."
  ],
  "concerns": [
    "The iOS oracle leans on three environment behaviors that are not contractual — Maestro's hideKeyboard being a no-op, the unhandled-tap dismissal through keyboardShouldPersistTaps=\"handled\", and the inverted list's self-re-park race (probe visible at t0/t4, oldest turns back at t8 with zero input) — so any Expo/RN/Maestro upgrade can shift which channel wins; channels 2-4 are the cushion but watch for 'exhausted'.",
    "Vision OCR is unreliable on some of these captures (it read 0 on frames whose pixels plainly contained the text once), so it is only the last-resort channel and never decides alone.",
    "The harness's image viewer served cached renditions keyed by basename twice during verification and misrepresented captures, so any future eyeballing of evidence must be done with local pixel reads (histogram/OCR), not the viewer.",
    "A concurrent session edited this worktree's driver mid-run twice and a duplicate driver run fought attempts 2-4 over the same devices and port 4000 — single-writer isolation for this task's worktree was not actually enforced during cycle 3."
  ],
  "findings": [
    "On iOS, Maestro's text matcher cannot see RN Fabric Text nodes that lack explicit accessibility labels (assertVisible/scrollUntilVisible/tapOn by text all fail for transcript bubbles) while `maestro hierarchy` does carry them in accessibilityText — so iOS transcript assertions must read the hierarchy dump, not element selectors.",
    "Maestro's scrollUntilVisible direction is CONTENT direction (DOWN reveals lower content, per docs and two passing Android runs), contradicting the gesture-direction reading a mid-session edit applied when it flipped the driver to UP and broke the attempt-4 Android legs.",
    "RN aggregates descendant accessibility labels onto container elements, so one rendered bubble matches at both the list-cell wrapper and the inner Text — the exactly-1 oracle must count innermost matches or iOS reads a phantom 2.",
    "Maestro's hideKeyboard command does NOT dismiss this app's iOS keyboard; a coordinate tap on the unhandled transcript region does, which matters because a raised keyboard eats ~40% of the screen, covers the scroll affordance, and swallows gestures below ~60% height.",
    "The pinned Expo Go 57.0.9 APK scratch cache (~/.cache/agent-scratch/opencode/ori-rn-003/Expo-Go-57.0.9.apk) is machine-local and was missing this cycle — it was restored from the official expo/expo-go-releases GitHub release, and the driver will hard-fail again on any fresh machine that lacks it.",
    "The whole-example `tsc --noEmit` diagnostic remains exit 2 from pre-existing gallery/server errors outside this task's allowlist, unchanged and retained unsuppressed in example-package-typecheck.txt."
  ],
  "scope_impact": [
    {
      "target": "ORI-CONT-004",
      "found": "The locked flow's spec tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts does not exist on any branch (never committed), so this task's Verify-list Playwright command cannot run at this position in the dependency graph.",
      "change": "Either sequence that command after ORI-CONT-004 lands the spec, or mark it conditional in this task's verify list; the captured evidence lives at .tmp/ORI-RN-004/cycle-3/playwright-flowdocs02-missing-spec.log."
    },
    {
      "target": "ORI-RN-005",
      "found": "The transcriptProbeCount oracle and its iOS/Android keyboard, shade, direction, and label-aggregation findings are directly reusable by any later task that must read the virtualized Conversation on native.",
      "change": "Consume tests/sprint-05-orient-search/support/live-example-proof.test.ts's helpers and the README's oracle notes instead of re-deriving them against the live-chat consumer screen."
    }
  ],
  "feedback": [
    "The Verify list contains a command whose target file is another task's future output, which forces an honest 'cannot run' note rather than a green check — scope verify commands to artifacts that exist at the task's dependency position.",
    "The dispatch context's suggestion that backend record counts are the ground truth would have weakened the AC's UI-level 'exactly 1 user turn' oracle — treat the AC's observable end state, not backend telemetry, as the arbiter when the two conflict.",
    "Device reservations (RNR_S05_IOS_UDID / RNR_S05_ANDROID_SERIAL) were unset in the dispatched shell and had to be reconstructed from ORI-RN-003's evidence — bake the reserved identities into the dispatch environment.",
    "The task file's exact evidence-path list omits the per-leg retry-state.png the oracle naturally produces; naming planned evidence files up front would avoid the deviation judgment call."
  ]
}
```
