# ORI-AI-001: Implement the worked example's useChat hook and real OpenAI streaming route

## What this does

The worked example has a real OpenAI streaming endpoint and a typed useLiveChat hook with contextual history, bounded cancellation, sanitized failures and reusable owned-backend lifecycle.

## Why

The worked example needs a real provider connection that preserves SDK-produced history and cancels unfinished generation. The compact context records absent hook/provider packages and unverified package and provider prerequisites.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort` against the real owned Node server and official OpenAI Responses endpoint. Inspect current-run stream, history, rejection, cancellation, recovery and teardown evidence. Run all five preserved verification commands below.

## Scope

Own the example server, live hook/config, scoped compiler, API integration test and reusable backend lifecycle within the exact allowlist. Deliver server integration and hook implementation. Rendered useChat acceptance remains with ORI-RN-004 and ORI-AI-002.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: Backlog
> Assignee: aisdk-implementer
> Priority: P1 · Points: 5 · Type: FEATURE
> Dependency phase: after ORI-AST-001
> Proposed By: aisdk-planner
> Co-authored By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=aisdk-planner | implementer=aisdk-implementer | reviewer=aisdk-reviewer

PROGRESS: 0/4 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The worked example has a real OpenAI streaming endpoint and a typed useLiveChat hook with contextual history, bounded cancellation, sanitized failures and reusable owned-backend lifecycle.

### CRITICAL CONSTRAINTS — Never

- Never expose OPENAI_API_KEY to client imports, EXPO_PUBLIC variables, install/compiler processes, command arguments or captured evidence. Fix the upstream endpoint to https://api.openai.com/v1.
- Never substitute a provider/model, canned stream, mocked HTTP, fake filesystem, synthetic success, compatibility shim, replacement declaration, runtime skip or artificial streaming delay. Missing prerequisites block execution.
- Never dispatch unvalidated messages or client provider/model overrides. Enforce the 65536-byte and 50-message limits while accepting SDK-produced assistant step-start parts.
- Never classify an errored HTTP 200 stream as completed or accept completed-before-cancellation as abort evidence. Cancel actual unfinished generation and stop only recorded owned children.
- Never write outside the exact allowlist, modify the planning-owned surface policy or overwrite shared WIP. Keep screen composition, registry work and whole-example remediation with their assigned owners.

### DONE WHEN

- [ ] AC-1 proves real incremental output and contextual SDK-produced history.
- [ ] AC-2 proves request/startup rejection with successful real-request controls.
- [ ] AC-3 proves genuine provider error, unfinished cancellation and successful recovery.
- [ ] AC-4 proves pinned-package compilation, the hook/import boundary and complete owned-process cleanup.
- [ ] All preserved verification commands and the exact selector pass; independent review confirms canonical functional RED, seeded evidence and exact scope compliance.

### SPECIFICATION

Implement the example-owned AI SDK Core and UI seam under the frozen provider and boundary contracts. This task delivers server integration and hook implementation. Downstream tasks prove the rendered hook on the required platforms.

### BOUNDARY CONTRACTS

1. Keep the backend in apps/example/server as a Node 24 ESM service. A server-local package.json establishes the ESM boundary without changing Expo's CommonJS configuration files.
2. Expose POST /api/chat through a real node:http server. Retain the example's static Expo web output; do not assume an Expo API route is active.
3. Accept the DefaultChatTransport envelope containing id, messages, trigger, and optional messageId. Enforce a 64 KiB body limit and at most 50 messages. Validate with await validateUIMessages before await convertToModelMessages.
4. Accept user and assistant text turns, including the SDK's assistant step-start structural parts. Reject system roles, tool/file parts, and client-supplied provider or model configuration. Do not reject the SDK's own completed first-turn history.
5. Call streamText with the provider instance, instructions, converted messages, abortSignal, bounded output, and sanitized callbacks. Consume result.stream through toUIMessageStream({ stream: result.stream, originalMessages: messages, generateMessageId, sendReasoning: false, onError }) and await pipeUIMessageStreamToResponse({ response, stream }). Use the SDK's UI stream protocol and headers.
6. Return 400 for invalid bodies, 413 for oversized bodies, and 405 for unsupported methods. Upstream errors after headers are committed must become SDK stream errors; do not label an HTTP 200 stream as successful when its outcome failed.
7. Provide sanitized onError handling explicitly because the installed streamText default logs the raw error. Record request ID, provider/model identifiers, response ID, timings, delta counts, usage, and terminal outcome without request headers, credentials, or raw provider errors.
8. Connect an unfinished outgoing response's close event and a genuinely aborted incoming request to the provider AbortController. A normal completed request-body close must not abort generation. Clear deadlines and listeners on success, error, disconnect, and shutdown.
9. Export useLiveChat using useChat from @ai-sdk/react and a stable DefaultChatTransport with fetch from expo/fetch. Validate an absolute EXPO_PUBLIC_API_BASE_URL and append /api/chat. Missing or invalid configuration must be visible and must prevent sending.
10. Use throttle: 50 and an empty initial live transcript. Expose messages, status, error, sendMessage, stop, regenerate, and clearError. Keep input text and component composition with ORI-RN-004.
11. Implement retry as clearError followed by regenerate for the retained failed or interrupted turn. Do not append a duplicate user message. Stop and navigation cleanup must cancel the active request.
12. Keep provider imports and credential reads unreachable from the client import graph. The registry remains transport/model-stateless.
13. Own apps/example/tsconfig.live-chat.json extending the real example compiler configuration. Initially select the actual hook/config entrypoints and their real transitive imports; ORI-RN-004 extends its explicit entrypoint set to the real live route. Do not introduce declaration replacements, loose compiler settings, or gallery suppression into the existing tsconfig. This is an additional scoped compiler, not a whole-example success claim.
14. Extract the actual backend child-process lifecycle used by the API tests into tests/sprint-05-orient-search/support/live-backend.ts. Export a typed owned-backend handle with origin, PID, launch identity, stop/restart/model-selection operations and recorded actual outcomes. Native drivers and the composed proof use this same lifecycle against the real Node server. Credentials enter only its server child; stop/restart acts on recorded owned PIDs.

### PROVIDER CONTRACT

- Provider: OpenAI Responses API. Primary model: `gpt-4.1-mini-2025-04-14`.
- Packages: `ai@7.0.89`, `@ai-sdk/react@4.0.92`, `@ai-sdk/openai@4.0.66`, `zod@4.6.1`. Require actual LanguageModelV4 compatibility.
- Factory: `createOpenAI({ apiKey: validatedServerEnv.OPENAI_API_KEY, baseURL: 'https://api.openai.com/v1' }).responses(validatedServerEnv.EXAMPLE_CHAT_MODEL)`.
- Require nonempty OPENAI_API_KEY and EXAMPLE_CHAT_MODEL before listening. Validate EXAMPLE_CHAT_HOST, EXAMPLE_CHAT_PORT and EXAMPLE_CHAT_WEB_ORIGIN. Reject malformed configuration and occupied ports with nonzero exit.
- Fix the upstream base URL so inherited OPENAI_BASE_URL cannot redirect credentials. Use maxOutputTokens=1024, maxRetries=0 and a bounded request deadline. Retry is an explicit user action. Do not fall back to Gateway, OpenRouter, another model, offline data or a synthetic response.

The compact context reports ai@7.0.89, @ai-sdk/provider@4.0.10 and @ai-sdk/provider-utils@5.0.35 installed in the example. It reports @ai-sdk/react and @ai-sdk/openai absent and the proposed hook pin unverified. Published installation, compatibility and account/model access must be proved during execution. Older Rosetta examples do not override these pins.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY for the API flow. The four criteria partition the locked flow's six scenario cases. Each AC has a real assertion case under the exact selected integration suite; all four must pass for the flow to pass.

#### AC-1: Streaming and contextual history [PRIMARY]

GIVEN an owned server, the pinned SDK packages and an empty live conversation WHEN a nonce-bearing turn and an SDK-history follow-up reach /api/chat THEN at least 2 real deltas precede completion and the contextual answer retains the nonce.

- PRIMARY: true
- FLOW_REF: FLOW-DOCS-02-live-example-api-stream-history-abort
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14
- SURFACE_POLICY: .spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-api.test.ts
- TEST_FUNCTION: FLOW-DOCS-02-live-example-api-stream-history-abort
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":true,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["The route returns a static/canned stream or is disconnected from OpenAI; history is omitted or SDK assistant step-start parts are rejected."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["POST a fresh DefaultChatTransport envelope to /api/chat asking for the current runNonce and a substantive explanation; consume the actual SDK UI stream incrementally.","Send a contextual follow-up with the SDK-produced first-turn history, including assistant structural parts; omit the nonce from the new user message."]},"end_state":{"must_observe":["At least 2 nonempty text deltas arrive before completion; concatenated text contains the current runNonce.","The second answer contains the exact `runNonce` although the second user message omits it.","Both responses record actual provider response IDs, model, usage, request IDs and text hashes with outcome=`completed`."],"must_not_observe":["0 assistant deltas, an empty response or a canned answer.","Missing first-turn history or an HTTP 200 error stream classified as completed."]}}]}
```

#### AC-2: Request and startup rejection

GIVEN real server launch inputs and a working provider control WHEN malformed, oversized, prohibited and over-limit requests or invalid launches are attempted THEN HTTP 400/413/405, zero rejected-input provider calls and nonzero invalid-launch exits accompany a successful valid control.

- PRIMARY: false
- FLOW_REF: FLOW-DOCS-02-live-example-api-stream-history-abort
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14
- SURFACE_POLICY: .spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-api.test.ts
- TEST_FUNCTION: FLOW-DOCS-02-live-example-api-stream-history-abort
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["Validation is a no-op, rejection evidence is static, invalid startup still listens, or the valid control is disconnected from OpenAI."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["Send malformed JSON, invalid envelopes, system/tool/file parts and client provider/model overrides to /api/chat.","Send a body exceeding 65536 bytes, an envelope with 51 messages and an unsupported method; also send a valid text request through the real provider."]},"end_state":{"must_observe":["Invalid bodies and 51-message input return HTTP 400; oversized input returns HTTP 413; unsupported methods return HTTP 405.","Every rejected request records provider-call count=0; the valid control records outcome=`completed` with an actual provider response ID."],"must_not_observe":["HTTP 200 or provider dispatch for rejected input; empty rejection evidence or an empty valid control."]}},{"start_ref":"live_api","action":{"actor":"cli_user","steps":["Launch actual server children with each required configuration value missing or malformed and with an occupied reserved port; preserve the original listener.","Restore valid configuration, launch the owned server and send a real request."]},"end_state":{"must_observe":["Each invalid launch records exit_code > 0 before listening; the occupied-port case preserves the original PID.","The restored launch answers `/api/chat` with outcome=`completed` and a real provider response ID."],"must_not_observe":["A listener after configuration rejection, hidden port substitution, a killed unrelated listener or empty launch diagnostics."]}}]}
```

#### AC-3: Provider error, active cancellation and recovery

GIVEN real OpenAI generation through the owned server WHEN the model is rejected or an unfinished HTTP stream is aborted, then restored THEN sanitized error and aborted outcomes precede completed recovery with no orphan generation.

- PRIMARY: false
- FLOW_REF: FLOW-DOCS-02-live-example-api-stream-history-abort
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14
- SURFACE_POLICY: .spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-api.test.ts
- TEST_FUNCTION: FLOW-DOCS-02-live-example-api-stream-history-abort
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["Provider errors are replaced with canned success, cancellation is disconnected from the provider AbortController, or normal request-body close aborts generation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["Restart the actual owned server with a deliberately nonexistent model while retaining the official endpoint and real credential; send valid text input.","Observe the actual upstream rejection, restore gpt-4.1-mini-2025-04-14 and repeat the real request."]},"end_state":{"must_observe":["The nonexistent model records an actual upstream rejection, outcome=`error` and a sanitized client-visible HTTP or SDK stream error.","Restored gpt-4.1-mini-2025-04-14 records outcome=`completed`, usage and an actual response ID."],"must_not_observe":["An empty error record, raw provider error, leaked credential, fallback model or errored HTTP 200 stream counted as completed."]}},{"start_ref":"live_api","action":{"actor":"api_client","steps":["Request a long bounded response and abort the real HTTP request after observing a delta while generation remains unfinished.","Observe provider cancellation and cleanup, then issue a new independent real request.","If generation completes before cancellation, retry with a longer bounded prompt; never introduce artificial stream delays."]},"end_state":{"must_observe":["The unfinished request records outcome=`aborted`, provider cancellation and active-generation count=0 after cleanup.","The next request produces at least 2 real deltas and outcome=`completed`; normal request-body close does not abort generation."],"must_not_observe":["No cancellation signal, empty abort evidence, orphan generation or completed-before-Stop accepted as cancellation proof."]}}]}
```

#### AC-4: Pinned hook contract and owned lifecycle

GIVEN the real installed packages and task-owned hook, config and backend lifecycle WHEN the locked suite compiles both import graphs, inspects boundaries and tears down children THEN both compilers pass, the hook meets its contract and owned requests, listeners and children are cleared.

- PRIMARY: false
- FLOW_REF: FLOW-DOCS-02-live-example-api-stream-history-abort
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14
- SURFACE_POLICY: .spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/live-example-api.test.ts
- TEST_FUNCTION: FLOW-DOCS-02-live-example-api-stream-history-abort
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["A stub transport, replacement declaration or weakened compiler hides incompatibility; credentials enter the client graph; lifecycle cleanup is a no-op."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"cli_user","steps":["Run the preserved package-list, server compiler, scoped live-chat compiler and lint commands against actual installed dependencies in the real API integration run.","Inspect the actual hook/config import graph, absolute endpoint validation, transport, exposed API and retained-turn retry/cleanup implementation.","Stop every server child recorded by the shared owned-backend lifecycle; inspect actual shutdown outcomes and ports."]},"end_state":{"must_observe":["The actual server and scoped hook compilers exit 0 with ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1.","The hook uses stable DefaultChatTransport, expo/fetch, throttle: 50 and 0 initial messages; it validates absolute EXPO_PUBLIC_API_BASE_URL and appends `/api/chat`.","The hook exposes 7 required members: `messages`, `status`, `error`, `sendMessage`, `stop`, `regenerate`, `clearError`; retry makes 2 ordered method calls: `clearError()` then `regenerate()` for the retained turn.","After teardown, owned active requests=0 and owned listeners=0; every recorded child has exited."],"must_not_observe":["Empty compiler evidence, replacement declarations, compatibility shims, forced aliases, concealment casts, weakened settings or skipped dependencies.","Client credential/provider imports, silent invalid configuration, a duplicate user turn or a leftover owned listener.","Scoped compiler success presented as rendered useChat acceptance or whole-example/gallery success."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: At least 2 real deltas precede completion; both responses carry actual provider correlation, and the follow-up returns the first nonce without repeating it in the new user message. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- TC-2 → AC-2: Rejected input returns the required 400/413/405 statuses with zero provider calls; invalid launches exit before listening and preserve the existing listener; valid controls complete through OpenAI. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- TC-3 → AC-3: Actual rejected-model and unfinished-abort runs record sanitized error and aborted outcomes; recovery completes through the primary model and leaves no orphan generation. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`
- TC-4 → AC-4: Actual pinned packages compile both required graphs without shims; hook and client boundaries match the contract, and every owned child exits with zero owned listeners. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort`

### SHARED FIXTURES

Seed through the real server CLI and HTTP endpoint. Generate a fresh nonsecret nonce for each invocation. Reuse actual SDK-produced first-turn history; never inject authored assistant output or view state.

```json
{"live_api":{"description":"Launch the actual server through its CLI in the isolated candidate using valid server-only configuration; reserve its port and record its PID, source identity and a fresh nonsecret run nonce.","seed_method":"cli","records":["OPENAI Responses model=gpt-4.1-mini-2025-04-14; official base URL fixed","Empty new conversation; 0 assistant turns; fresh nonce generated for this invocation","Real installed ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1"]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/example/package.json
- pnpm-lock.yaml
- apps/example/server/package.json
- apps/example/server/tsconfig.json
- apps/example/server/env.ts
- apps/example/server/chat.ts
- apps/example/server/index.ts
- apps/example/lib/live-chat-config.ts
- apps/example/lib/use-live-chat.ts
- tests/sprint-05-orient-search/live-example-api.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AI-001/
- apps/example/tsconfig.live-chat.json
- tests/sprint-05-orient-search/support/live-backend.ts
- tests/sprint-05-orient-search/evidence/ORI-AI-001/package-contract.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/red.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/provider-stream.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/error-abort.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/validation.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/red.txt
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/proof.red

writeProhibited:

- packages/registry/**
- public/r/**
- apps/docs/**
- apps/example/app/**
- apps/example/components/**
- apps/example/fixtures/**
- apps/example/README.md
- apps/example/app.json
- .spec/**
- .kb-run-sprint/**
- .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/**
- Any file not explicitly listed in writeAllowed.

The exact API surface policy is a planning-owned read-only input. It is absent in this rendering checkout. Its planning owner must materialize `.spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json` before task-plan validation and execution. ORI-AI-001 must not create or modify it; the `.spec/**` prohibition remains intact.

### BOUNDARIES — Always / Ask First

Always:

- Use the assigned isolated candidate and OS-derived owned scratch roots. Record source/run/PID identities; preserve shared WIP.
- Serialize apps/example/package.json and pnpm-lock.yaml changes with native and Astro dependency owners.
- Validate startup, request and public endpoint configuration. Use the installed SDK APIs and explicit sanitized callbacks.
- Seed and observe through real entrypoints. Capture current-run nonce/provider correlation and canonical functional RED.
- Clear deadlines, listeners and active requests on every exit path. Stop only owned processes and preserve bounded run evidence.

Ask First:

- Stop for a version decision if a pinned package is unavailable or incompatible; do not take latest or force aliases.
- Resolve ownership and scope if required changes exceed the allowlist or collide with another manifest/lockfile owner.
- Report sanitized credential, model, quota or network blockers before proposing any alternate provider/model configuration.

### DELIVERABLE

- `apps/example/lib/live-chat-config.ts` and `apps/example/lib/use-live-chat.ts`: real typed client endpoint and useLiveChat handoff.
- `apps/example/server/package.json`, `tsconfig.json`, `env.ts`, `chat.ts` and `index.ts`: Node 24 ESM service, validated configuration and actual bounded OpenAI UI-stream response.
- `tests/sprint-05-orient-search/support/live-backend.ts`: typed owned-backend lifecycle reused by API, native and composed proofs.
- `apps/example/package.json`, `pnpm-lock.yaml` and `apps/example/tsconfig.live-chat.json`: exact package integration and the strict real import-graph compiler.
- `tests/sprint-05-orient-search/live-example-api.test.ts` and exact allowlisted evidence paths: real scenario cases, functional RED and recorded outcomes.

### AGENT INSTRUCTIONS — TDD FLOW

1. Read the current AC, frozen contracts and installed source. Establish actual package/provider prerequisites and the planning-owned surface policy. Use the assigned isolated candidate.
2. RED: write the current AC's real assertion case inside the exact flow-ID-selected suite. Run the unchanged selector against the recorded preimplementation candidate. Capture a functional assertion failure through run_flow.py --expect red; missing tests/packages, unavailable credentials/network/model access and zero selected tests are blockers, never functional RED.
3. After the orchestrator verifies RED, implement the smallest real change for the current AC. GREEN: rerun the identical selector and record actual seeded outcomes. Keep the remaining ACs explicit.
4. REFACTOR only after verified GREEN. Preserve scope, behavior, exact proof bindings and evidence identity; rerun affected checks after changes. No mocks, artificial delays, test-only product seams or skipped prerequisites.
5. After all ACs, hand the exact candidate and evidence to aisdk-reviewer. The reviewer independently runs required gates. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/example/node_modules/ai/src/ui-message-stream/pipe-ui-message-stream-to-response.ts` [PRIMARY PATTERN], lines 9-52 — installed Node ServerResponse writer, SDK headers and awaited completion.
2. `apps/example/node_modules/ai/src/ui/default-chat-transport.ts`, lines 1-36 — installed SDK event-stream parsing; retain the real protocol.
3. `apps/example/tsconfig.json`, full file — extend the actual compiler settings without weakening them or substituting declarations.
4. `/Users/justinrich/Projects/brain/.rosetta/docs/ai-sdk/ROSETTA.md`, UI transport and false-friend sections — v7 terminology; installed source and frozen task pins override older examples.
5. `.spec/prds/docs-site/README.md`, scope and use-case references — UC-DOCS-02 worked-example purpose and CAP-DOCS-01 boundary.

### DESIGN / REFERENCE GUIDANCE

No layout, styling or token work is assigned. Keep input state and component composition with ORI-RN-004. Both engines use the same example-owned hook. Do not import web AI Elements or move transport/provider behavior into registry components.

### CODING STANDARDS

- Use strict TypeScript, runtime boundary validation and typed owned-backend handles. No any, concealment casts, forced aliases or replacement declarations.
- Keep Node 24 ESM local to apps/example/server; preserve Expo CommonJS configuration and static web output.
- Use v7 instructions, result.stream and installed callback contracts. Await validation, message conversion and response piping. Handle abort cleanup explicitly.
- Keep request records bounded, correlated and sanitized. Clear resources on success, error, disconnect and shutdown.
- Install through Expo tooling, preserve compiler strictness and pass the exact scoped Biome command.

### RUNTIME COMMANDS AND VERIFICATION GATES

All commands below are future execution commands. None ran during rendering.

Setup commands, unchanged:

```sh
pnpm view @ai-sdk/react@4.0.92 version dependencies peerDependencies engines --json
pnpm view @ai-sdk/openai@4.0.66 version dependencies peerDependencies engines --json
pnpm --filter example exec expo install @ai-sdk/react@4.0.92 @ai-sdk/openai@4.0.66 zod@4.6.1 --pnpm
```

Verification commands, unchanged:

```sh
pnpm --filter example list ai @ai-sdk/react @ai-sdk/openai @ai-sdk/provider zod --depth 4
pnpm exec tsc --noEmit -p apps/example/server/tsconfig.json
pnpm exec biome ci apps/example/server apps/example/lib/live-chat-config.ts apps/example/lib/use-live-chat.ts tests/sprint-05-orient-search/live-example-api.test.ts
pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts
pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json
```

Exact locked selector:

```sh
pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort
```

Separate whole-example diagnostic:

```sh
pnpm --dir apps/example exec tsc --noEmit
```

Command contract:

- The install and verification commands are future execution commands; none ran during this correction.
- Serialize apps/example/package.json and pnpm-lock.yaml writes with the native and Astro dependency owners.
- The integration test starts the real server as an owned child, uses the real credential inherited only by that child, and fails when packages, credentials, networking, or model access are unavailable.
- The final launch command requires the documented server environment and does not print credential values.

### EVIDENCE GATES

1. Prerequisites: the planning owner supplies the exact API surface policy; actual package compatibility and real provider access are established without exposing credentials. Missing prerequisites block execution.
2. Functional RED: run the exact selected suite against the recorded preimplementation state with real dependencies. Preserve canonical proof.red from run_flow.py --expect red, including its header and command hash. red.txt is supplementary only.
3. GREEN: run all five preserved verification commands and the exact selector. Require actual selected cases and seeded outcomes for all four ACs. No skipped dependencies or zero-test success.
4. Evidence: bind current source, lockfile, test and policy hashes to exact commands/exits and fresh run identity. Capture nonce/history correlation, actual provider IDs/model/usage/text hashes, validation counts, invalid-launch exits, provider rejection, unfinished abort, recovery and teardown.
5. Independent review: check Scenario/Requirement Contract parity, exact flow ownership, no stubs or deferred core behavior, scope compliance and actual command outcomes. The orchestrator validates the full sprint's scenarios and flow coverage before planning writes and again before dispatch.

Functional RED contract:

Run the exact selected suite against the recorded preimplementation state with real dependencies available and capture a functional assertion failure before implementation. A missing test, missing package, unavailable credential, unreachable prerequisite or zero selected tests is not functional RED. Capture the canonical proof through run_flow.py --expect red at proof.red. Run the identical command against the implemented candidate for GREEN. Never author success receipts, substitute a provider, replay a canned stream or introduce artificial stream delays.

Required evidence capture:

- run.json containing current-run identity, source/lockfile/test/policy hashes, exact command and exit, and references to the actual ORI-AI-001 package, provider-stream, error-abort, validation and teardown artifacts.
- Timestamped nonempty stream deltas, actual final answer, nonce/history correlation, request IDs, provider response IDs, configured model, usage and terminal outcomes.
- Observed validation responses, provider-call counts for rejected requests, invalid-launch exits, genuine upstream rejection, active cancellation and restored successful requests.
- proof.red captured by run_flow.py with --expect red for the exact locked command; its header and command hash must remain intact.
- red.txt retained as the requested supplementary transcript of that same actual RED run. It is not the validator's canonical red_proof.

Planned evidence paths:

- tests/sprint-05-orient-search/evidence/ORI-AI-001/package-contract.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/red.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/provider-stream.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/error-abort.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/validation.json
- tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/red.txt
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/proof.red

Teardown:

- Abort unfinished requests and clear request deadlines and listeners on success, failure, disconnect and shutdown.
- Stop only server children identified by this run's owned backend handles; preserve unrelated listeners.
- Restore the primary model after rejected-model testing and record actual stop/restart outcomes.
- Verify that every recorded child has exited and no owned listener or active generation remains.
- Preserve bounded current-run evidence and dispose only of owned scratch resources.

### CONTEXT AND EXECUTION PRECONDITIONS

Current gap: the compact context records ai@7.0.89 locally, absent hook/provider packages and unverified proposed-pin availability. The endpoint, live hook and reusable backend lifecycle are planned. Whole-example compiler diagnostics remain unresolved.

Success state: the exact API selector proves real streaming, SDK history, rejection, cancellation, recovery and cleanup; the actual pinned server and hook graphs compile. This remains server integration and hook implementation.

- VP-EXECUTION-SCOPE: planning only. Subsequent implementation and external actions require their execution authorization. Use an isolated candidate and owned OS-derived scratch roots; preserve shared WIP. All evidence is future output.
- VP-EXAMPLE-DIAGNOSTICS: root typecheck excludes apps and apps/example has no typecheck script in the supplied context. Preserve the whole-example diagnostic separately. Errors in the required live import graph block this task; broader gallery repair requires explicit scope.
- VP-AI-PACKAGES: verify actual published metadata, installation and LanguageModelV4 compatibility for all four pins. The proposed hook pin was not retrievable in the prior specialist session. Stop for a version decision if unavailable or incompatible.
- VP-OPENAI: credential presence is not provider proof. Require actual fixed-endpoint requests with the selected model and sanitized authentication/model/quota/network outcomes.
- VP-SECRETS: only the trusted launcher and actual server child receive credentials. Strip them from installs, compilers, Metro, browsers, app configuration, EXPO_PUBLIC variables, command arguments and evidence. Inspect produced client artifacts without printing matched secret values.

Reserve and identify the backend address/port before launch; preserve unrelated listeners. Use the assigned isolated writable candidate/worktree and owned scratch roots. Do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

- PRIMARY API flow: FLOW-DOCS-02-live-example-api-stream-history-abort, owned by ORI-AI-001 at ORI-GATE-13. Its exact test, selector, service and API-specific surface policy appear on every AC. It requires no Quickstart page, native screen or ORI-AI-002 output.
- Supporting flow: FLOW-DOCS-02-quickstart-chat-screen at ORI-GATE-03. PRIMARY remains ORI-CONT-004. Its command remains `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`; canonical RED remains `tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red`. This task does not own that test or its evidence writes.
- No journey proof belongs to this task. ORI-AST-010 retains the four exact journey proofs.

The sprint's fixed gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). Counts remain 13 flows, 9 task flows, 4 journey flows, 36 tasks and 131 points.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-AST-001.

Blocks: ORI-RN-004 and ORI-AI-002 through the hook/server/lifecycle handoff. Native and Quickstart composition remain downstream.

Provides:

- Actual Node 24 POST /api/chat with SDK UI-stream protocol and the fixed OpenAI Responses provider.
- Shared example-owned useLiveChat/config and retained-turn Stop/Retry behavior.
- Typed owned-backend lifecycle with origin, PID, launch identity, stop/restart/model-selection operations and real outcomes.
- Strict scoped compiler selecting actual hook/config entrypoints and transitive imports; ORI-RN-004 adds the actual live route entrypoint.

Consumes:

- ORI-AST-001 prerequisite and coordinated manifest/lockfile ownership.
- Actual pinned packages, provider/model/network access and validated server-only configuration.
- Planning-owned API surface policy and locked API-flow contract.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`; `.spec/prds/docs-site/01-scope.md`.

Provenance: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/aisdk-planner-absorb-prerequisites.json`; source task ORI-AI-001; proposed by aisdk-planner; co-authored by react-native-reusables-planner.

### AGENT RATIONALE AND REVIEW

The aisdk-planner owns this Core/UI seam. The aisdk-implementer implements the actual v7 hook and Node transport. The aisdk-reviewer verifies package compatibility and real provider behavior. The react-native-reusables-planner co-authored the universal hook and backend-lifecycle handoff.

Must pass:

- Functional RED and current real-provider evidence are source/command bound; all four ACs have discriminating assertion cases.
- Validation/startup rejection, upstream failure and unfinished cancellation have successful real recovery controls.
- Actual pinned import graphs compile without shims, and all hook/config/lifecycle contracts are implemented.
- Every preserved command and exact selector is accounted for; no owned process, listener or active generation remains.
- Only allowed files change; no stub, fake success, runtime skip or deferred required behavior remains.

Should verify:

- Normal request-body close cannot accidentally abort a valid response.
- SDK assistant structural parts round-trip without duplicate messages.
- Stable transport, throttle: 50, empty initial transcript and clearError then regenerate preserve the retained turn.
- Provider credentials and imports cannot reach client code or artifacts.
- Scoped compiler proof is not presented as rendered-hook or whole-example acceptance.

Verdict: APPROVED or NEEDS_FIXES. NEEDS_FIXES must identify failed ACs, concrete files/lines and missing or contradictory evidence. Planned artifacts are not completion evidence.

### OUT OF SCOPE

- Rendered useChat acceptance, live screen/input composition and the native/web matrix: ORI-RN-004/005 and ORI-AI-002.
- Quickstart content and PRIMARY proof: ORI-CONT-004; the four journey proofs: ORI-AST-010.
- Registry components/artifacts, docs-site implementation, example gallery/fixtures, app configuration and README edits.
- Whole-example/gallery compiler remediation, provider/model substitutions, deployment, hosted CI and new product capabilities.
- Planning policy edits, tracker mutation and trunk/worktree lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AI-001","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"live_api":{"description":"Launch the actual server through its CLI in the isolated candidate using valid server-only configuration; reserve its port and record its PID, source identity and a fresh nonsecret run nonce.","seed_method":"cli","records":["OPENAI Responses model=gpt-4.1-mini-2025-04-14; official base URL fixed","Empty new conversation; 0 assistant turns; fresh nonce generated for this invocation","Real installed ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":true,"description":"GIVEN an owned server, the pinned SDK packages and an empty live conversation WHEN a nonce-bearing turn and an SDK-history follow-up reach /api/chat THEN at least 2 real deltas precede completion and the contextual answer retains the nonce.","flow_ref":"FLOW-DOCS-02-live-example-api-stream-history-abort","test_file":"tests/sprint-05-orient-search/live-example-api.test.ts","test_function":"FLOW-DOCS-02-live-example-api-stream-history-abort","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","surface_policy":".spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":true,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["The route returns a static/canned stream or is disconnected from OpenAI; history is omitted or SDK assistant step-start parts are rejected."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["POST a fresh DefaultChatTransport envelope to /api/chat asking for the current runNonce and a substantive explanation; consume the actual SDK UI stream incrementally.","Send a contextual follow-up with the SDK-produced first-turn history, including assistant structural parts; omit the nonce from the new user message."]},"end_state":{"must_observe":["At least 2 nonempty text deltas arrive before completion; concatenated text contains the current runNonce.","The second answer contains the exact `runNonce` although the second user message omits it.","Both responses record actual provider response IDs, model, usage, request IDs and text hashes with outcome=`completed`."],"must_not_observe":["0 assistant deltas, an empty response or a canned answer.","Missing first-turn history or an HTTP 200 error stream classified as completed."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN real server launch inputs and a working provider control WHEN malformed, oversized, prohibited and over-limit requests or invalid launches are attempted THEN HTTP 400/413/405, zero rejected-input provider calls and nonzero invalid-launch exits accompany a successful valid control.","flow_ref":"FLOW-DOCS-02-live-example-api-stream-history-abort","test_file":"tests/sprint-05-orient-search/live-example-api.test.ts","test_function":"FLOW-DOCS-02-live-example-api-stream-history-abort","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","surface_policy":".spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["Validation is a no-op, rejection evidence is static, invalid startup still listens, or the valid control is disconnected from OpenAI."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["Send malformed JSON, invalid envelopes, system/tool/file parts and client provider/model overrides to /api/chat.","Send a body exceeding 65536 bytes, an envelope with 51 messages and an unsupported method; also send a valid text request through the real provider."]},"end_state":{"must_observe":["Invalid bodies and 51-message input return HTTP 400; oversized input returns HTTP 413; unsupported methods return HTTP 405.","Every rejected request records provider-call count=0; the valid control records outcome=`completed` with an actual provider response ID."],"must_not_observe":["HTTP 200 or provider dispatch for rejected input; empty rejection evidence or an empty valid control."]}},{"start_ref":"live_api","action":{"actor":"cli_user","steps":["Launch actual server children with each required configuration value missing or malformed and with an occupied reserved port; preserve the original listener.","Restore valid configuration, launch the owned server and send a real request."]},"end_state":{"must_observe":["Each invalid launch records exit_code > 0 before listening; the occupied-port case preserves the original PID.","The restored launch answers `/api/chat` with outcome=`completed` and a real provider response ID."],"must_not_observe":["A listener after configuration rejection, hidden port substitution, a killed unrelated listener or empty launch diagnostics."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN real OpenAI generation through the owned server WHEN the model is rejected or an unfinished HTTP stream is aborted, then restored THEN sanitized error and aborted outcomes precede completed recovery with no orphan generation.","flow_ref":"FLOW-DOCS-02-live-example-api-stream-history-abort","test_file":"tests/sprint-05-orient-search/live-example-api.test.ts","test_function":"FLOW-DOCS-02-live-example-api-stream-history-abort","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","surface_policy":".spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["Provider errors are replaced with canned success, cancellation is disconnected from the provider AbortController, or normal request-body close aborts generation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"api_client","steps":["Restart the actual owned server with a deliberately nonexistent model while retaining the official endpoint and real credential; send valid text input.","Observe the actual upstream rejection, restore gpt-4.1-mini-2025-04-14 and repeat the real request."]},"end_state":{"must_observe":["The nonexistent model records an actual upstream rejection, outcome=`error` and a sanitized client-visible HTTP or SDK stream error.","Restored gpt-4.1-mini-2025-04-14 records outcome=`completed`, usage and an actual response ID."],"must_not_observe":["An empty error record, raw provider error, leaked credential, fallback model or errored HTTP 200 stream counted as completed."]}},{"start_ref":"live_api","action":{"actor":"api_client","steps":["Request a long bounded response and abort the real HTTP request after observing a delta while generation remains unfinished.","Observe provider cancellation and cleanup, then issue a new independent real request.","If generation completes before cancellation, retry with a longer bounded prompt; never introduce artificial stream delays."]},"end_state":{"must_observe":["The unfinished request records outcome=`aborted`, provider cancellation and active-generation count=0 after cleanup.","The next request produces at least 2 real deltas and outcome=`completed`; normal request-body close does not abort generation."],"must_not_observe":["No cancellation signal, empty abort evidence, orphan generation or completed-before-Stop accepted as cancellation proof."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the real installed packages and task-owned hook, config and backend lifecycle WHEN the locked suite compiles both import graphs, inspects boundaries and tears down children THEN both compilers pass, the hook meets its contract and owned requests, listeners and children are cleared.","flow_ref":"FLOW-DOCS-02-live-example-api-stream-history-abort","test_file":"tests/sprint-05-orient-search/live-example-api.test.ts","test_function":"FLOW-DOCS-02-live-example-api-stream-history-abort","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","surface_policy":".spec/prds/docs-site/tasks/sprint-05-orient-search/live-example-api.surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Node 24 example HTTP server, installed AI SDK v7 packages and OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["A stub transport, replacement declaration or weakened compiler hides incompatibility; credentials enter the client graph; lifecycle cleanup is a no-op."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_api","action":{"actor":"cli_user","steps":["Run the preserved package-list, server compiler, scoped live-chat compiler and lint commands against actual installed dependencies in the real API integration run.","Inspect the actual hook/config import graph, absolute endpoint validation, transport, exposed API and retained-turn retry/cleanup implementation.","Stop every server child recorded by the shared owned-backend lifecycle; inspect actual shutdown outcomes and ports."]},"end_state":{"must_observe":["The actual server and scoped hook compilers exit 0 with ai@7.0.89, @ai-sdk/react@4.0.92, @ai-sdk/openai@4.0.66 and zod@4.6.1.","The hook uses stable DefaultChatTransport, expo/fetch, throttle: 50 and 0 initial messages; it validates absolute EXPO_PUBLIC_API_BASE_URL and appends `/api/chat`.","The hook exposes 7 required members: `messages`, `status`, `error`, `sendMessage`, `stop`, `regenerate`, `clearError`; retry makes 2 ordered method calls: `clearError()` then `regenerate()` for the retained turn.","After teardown, owned active requests=0 and owned listeners=0; every recorded child has exited."],"must_not_observe":["Empty compiler evidence, replacement declarations, compatibility shims, forced aliases, concealment casts, weakened settings or skipped dependencies.","Client credential/provider imports, silent invalid configuration, a duplicate user turn or a leftover owned listener.","Scoped compiler success presented as rendered useChat acceptance or whole-example/gallery success."]}}]}},{"id":"TC-1","type":"test_criterion","description":"At least 2 real deltas precede completion; both responses carry actual provider correlation, and the follow-up returns the first nonce without repeating it in the new user message.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Rejected input returns the required 400/413/405 statuses with zero provider calls; invalid launches exit before listening and preserve the existing listener; valid controls complete through OpenAI.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Actual rejected-model and unfinished-abort runs record sanitized error and aborted outcomes; recovery completes through the primary model and leaves no orphan generation.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Actual pinned packages compile both required graphs without shims; hook and client boundaries match the contract, and every owned child exits with zero owned listeners.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t FLOW-DOCS-02-live-example-api-stream-history-abort","maps_to_ac":"AC-4"}]}
-->
</details>
