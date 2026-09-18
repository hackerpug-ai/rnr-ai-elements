# FIX-ORI-AI-001-1: Keep the worked example hook's regenerate payload itemIds unique

## What this does

Fixes the worked example's retry defect at its root. After owned-endpoint loss, the `useLiveChat` hook's clearError-then-regenerate path assembles an outgoing payload containing duplicated assistant message entries that carry repeated OpenAI itemIds in `providerMetadata`; the real OpenAI Responses endpoint rejects that payload and the server emits an error record with 0 deltas. The fix keeps every assistant provider-metadata itemId unique across the outgoing history before the transport serializes the request body.

## Why

ORI-RN-004's cycle-1 blocked report (checkpoint a86231aa) root-caused the iOS/Android retry-completion failure headlessly with the hook's exact SDK classes (`Chat` from @ai-sdk/react 4.0.92 + `DefaultChatTransport` from ai 7.0.89, throttle 50) and bisected it on the real backend: any payload variant leaving each itemId unique completes. Web passes only because its fresh-session path never regenerates with stale history. No pending task owns the hook file — ORI-RN-004's write-allowlist cannot reach `apps/example/lib/use-live-chat.ts`, and ORI-AI-001 is completed — while the gate's locked steps already promise retry completion. The missing piece is this hook-side fix.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof` against the real owned backend and the official OpenAI Responses endpoint. The driver imports the real `Chat` + `DefaultChatTransport` classes from apps/example's installed packages, reproduces the endpoint-loss retry state through the owned backend lifecycle, captures the outgoing bodies and the server's sanitized records, and proves functional RED before the fix and GREEN after. Also run the preserved scoped compiler command below.

## Scope

Own the regenerate-payload fix in `apps/example/lib/use-live-chat.ts`, one new scoped driver under `tests/sprint-05-orient-search/support/`, and bounded evidence under `.tmp/FIX-ORI-AI-001-1/`. Rendered retry acceptance on devices remains with ORI-RN-004; the server, the screen and the native drivers stay untouched.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ✅ Completed

Commit: 755edeae8c7f6e4186122eaf70f824d347a25327

> Assignee: aisdk-implementer
> Priority: P1 · Points: 2 · Type: FIX
> Dependency phase: after ORI-AI-001
> Proposed By: aisdk-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-18
> Source SHA: 6b4509144a557a76c7b9e8c5f825ba20691d7897
AGENT: planner=aisdk-planner | implementer=aisdk-implementer | reviewer=aisdk-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

After owned-endpoint loss, the worked example hook's Retry (clearError then regenerate) produces an outgoing payload whose assistant providerMetadata itemIds are all unique; the real OpenAI Responses endpoint accepts it and the server records a new completed, provider-correlated answer with exactly 1 retained user turn. The normal send/follow-up path is unchanged.

### CRITICAL CONSTRAINTS — Never

- Never expose OPENAI_API_KEY to client imports, EXPO_PUBLIC variables, install/compiler processes, command arguments or captured evidence. Credentials reach only the trusted launcher and the server child.
- Never mock the thing under test: no mocked Chat, transport, fetch, server or provider. Drive the REAL classes installed for apps/example (ai@7.0.89, @ai-sdk/react@4.0.92) against the REAL backend route and the REAL OpenAI Responses endpoint.
- Never satisfy retry by duplicating the user turn (re-sending via sendMessage), swallowing the error, retrying silently in a loop, or classifying an errored HTTP 200 stream as completed.
- Never weaken the consumer oracle: the fixed retry must deliver a new real request ID, a completed provider-correlated answer, and exactly 1 retained user turn.
- Never strip or rewrite legitimate unique itemIds or remove message text/parts such that contextual history breaks (the follow-up must still retain the nonce).
- Never write outside the exact allowlist: NOT apps/example/server/**, NOT ORI-RN-004's screen/driver files, NOT ORI-AI-001's or ORI-RN-004's evidence directories, NOT the planning-owned surface policy.
- Never upgrade dependencies by default. Only a pinned real version with evidence from the installed packages that no hook-level fix can work; never "latest", never a forced alias.

### DONE WHEN

- [ ] AC-1 proves functional RED (duplicated-itemId payload → real provider rejection, 0 deltas) and GREEN (unique itemIds → new real request ID, completed provider-correlated record, exactly 1 retained user turn) on the real stack.
- [ ] AC-2 proves the happy path, hook contract, scoped compiler and exact scope compliance are preserved.
- [ ] The exact selector and preserved commands pass; independent review confirms canonical functional RED, seeded evidence and no stubs.

### SPECIFICATION

Remediate the ORI-AI-001 hook so the regenerate path emits provider-acceptable history. The defect: after a failed turn (endpoint loss), the outgoing regenerate payload contains duplicated assistant entries carrying repeated OpenAI itemIds in providerMetadata; the OpenAI Responses endpoint rejects it. The fix is a hook-level sanitize/stabilize of the outgoing history at the transport seam in `apps/example/lib/use-live-chat.ts`. Dependency installation ownership and the server stay with ORI-AI-001's landed surface; this task changes only the hook and adds one scoped driver.

### BOUNDARY CONTRACTS

1. Fix the root cause in `apps/example/lib/use-live-chat.ts`: keep every assistant provider-metadata itemId unique across the outgoing (regenerate) history before the transport serializes the body. The installed `HttpChatTransport` accepts `prepareSendMessagesRequest({ id, messages, trigger, messageId })` and returns the prepared request body (apps/example/node_modules/ai/src/ui/http-chat-transport.ts, lines 106-158) — pass it to the existing `new DefaultChatTransport({ api, fetch, ... })` construction; an equivalent transport-level sanitize inside the hook module is acceptable. Editing the server is not.
2. Sanitize semantics: keep the first occurrence of each itemId and strip the stale duplicates, or an equivalent uniqueness-preserving transform. Never invent provider itemIds, never remove message text, parts, or legitimate unique metadata.
3. Preserve the public hook contract from ORI-AI-001 AC-4: `messages`, `status`, `error`, `sendMessage`, `stop`, `regenerate`, `clearError`; retry makes 2 ordered calls `clearError()` then `regenerate()`; throttle 50; 0 initial messages; stable `DefaultChatTransport` with `expo/fetch`; absolute `EXPO_PUBLIC_API_BASE_URL` validation appending `/api/chat`.
4. The scoped driver must exercise the REAL `Chat` + `DefaultChatTransport` classes resolved from the apps/example workspace packages (pnpm layout; ORI-RN-004 cycle-1 recorded that `ai` resolves only from apps/example's node_modules and its probes imported by absolute worktree path). The sanitize logic itself must live in and be exported from `apps/example/lib/use-live-chat.ts`. If the top-level `expo/fetch` import blocks headless import of the hook module outside Expo, a lazy dynamic import inside `chatFetch` is the allowed enabler — runtime behavior in Expo must stay identical.
5. Reuse `tests/sprint-05-orient-search/support/live-backend.ts` for backend launch/stop/restart; act only on recorded owned PIDs. The server emits sanitized records only at stream termination (apps/example/server/chat.ts finally block), so assertions await record emission rather than polling mid-stream.
6. Keep evidence under `.tmp/FIX-ORI-AI-001-1/` only, bounded and sanitized (request IDs, outcome, response IDs, delta counts, itemId-uniqueness results; never credentials or raw provider errors).

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. Both criteria run on the same real stack in one scoped driver.

#### AC-1: Regenerate recovery after endpoint loss [PRIMARY]

GIVEN the installed Chat and DefaultChatTransport classes (ai@7.0.89, @ai-sdk/react@4.0.92, throttle 50) driven headlessly against the owned backend and the real OpenAI Responses endpoint WHEN the hook's clearError-then-regenerate retry path runs after owned-endpoint loss THEN the outgoing payload keeps every assistant providerMetadata itemId unique and the provider completes a new provider-correlated record with exactly 1 retained user turn.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, and the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts
- TEST_FUNCTION: runRegeneratePayloadProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-AI-001-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, and the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["The regenerate payload still contains duplicated assistant entries or repeated OpenAI itemIds, the retry is satisfied by duplicating the user turn, or a mocked Chat/transport/fetch/provider stands in for the real stack."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_chat_hook_stack","action":{"actor":"api_client","steps":["Launch the owned backend through support/live-backend.ts, stop it via its lifecycle handle, submit a nonce turn through the real Chat + DefaultChatTransport to produce the sanitized endpoint-loss error and the retained user turn, then restart the same owned endpoint.","Capture the pre-fix regenerate request body and the server's sanitized records; run the hook's retry path (clearError then regenerate) and observe the real OpenAI rejection with an error record and 0 deltas as functional RED.","Apply the itemId-uniqueness fix in apps/example/lib/use-live-chat.ts and repeat the identical retry path against the same real stack."]},"end_state":{"must_observe":["Functional RED is captured before the fix: the regenerate payload carries duplicated assistant entries with repeated providerMetadata OpenAI itemIds and the server emits an error record with 0 deltas.","After the fix every assistant providerMetadata itemId in the outgoing regenerate payload is unique (0 duplicated itemId values across the regenerate request body) and the payload contains exactly 1 user turn for the failed submission.","In this leg's records the server shows exactly 2 outcome=completed records (the fresh seed turn and the retried turn) and exactly 1 error record (the endpoint-loss turn); the retried request has a new real request ID distinct from the failed one, an actual provider response ID, usage and at least 2 nonempty text deltas."],"must_not_observe":["Repeated itemIds or duplicated assistant entries in any outgoing body (duplicated itemId count greater than 0), a second user message, 0 completed provider records for the retried turn, an empty (0-delta) retry stream, the error record's outcome staying error after retry, a canned or replayed answer, or credentials in any captured evidence."]}}]}
```

#### AC-2: Happy-path preservation and hook contract intact

GIVEN the fixed hook and the same real stack WHEN a fresh-session send and an SDK-history contextual follow-up complete and the scoped live-chat compiler runs THEN legitimate unique itemIds and history pass through unchanged, the follow-up retains the nonce, the compiler exits 0 and the public hook contract is unchanged.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14, and the real TypeScript scoped compiler
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts
- TEST_FUNCTION: runRegeneratePayloadProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-AI-001-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14, and the real TypeScript scoped compiler","negative_control":{"would_fail_if":["The sanitizer strips or rewrites legitimate unique itemIds or history content, the contextual follow-up loses the nonce, the hook surface or retry ordering changes, the transport is stubbed or the provider response is mocked rather than reaching the real OpenAI Responses endpoint, a static canned answer satisfies the oracle without a new real request ID, or the scoped compiler regresses."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_chat_hook_stack","action":{"actor":"api_client","steps":["Send a fresh nonce-bearing turn and an SDK-history contextual follow-up that omits the nonce through the fixed hook path; capture both outgoing bodies and both server records.","Run pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json and inspect the actual hook diff against the allowlist."]},"end_state":{"must_observe":["The full driver run records exactly 3 outcome=completed records (the fresh nonce turn, the post-retry regenerated turn and the contextual follow-up) with 3 distinct real provider response IDs; the follow-up answer contains the literal nonce string, and every captured outgoing body shows 0 duplicated itemId values with each legitimate unique itemId unchanged.","The scoped live-chat compiler exits 0; the hook still exposes messages, status, error, sendMessage, stop, regenerate and clearError with retry as clearError() then regenerate(), throttle 50 and a stable DefaultChatTransport with expo/fetch.","The complete diff touches only apps/example/lib/use-live-chat.ts, the new scoped driver and .tmp/FIX-ORI-AI-001-1 evidence."],"must_not_observe":["Stripped unique itemIds, a lost nonce, 0 completed provider records for the follow-up, an empty (0-delta) stream, a changed hook surface, server or screen/driver edits, or writes outside the exact allowlist."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The endpoint-loss retry leg records functional RED pre-fix (duplicated assistant entries with repeated itemIds and a provider error record with 0 deltas) and GREEN post-fix (unique itemIds, a new real request ID, a completed provider-correlated record with at least 2 deltas and exactly 1 retained user turn). VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof`
- TC-2 → AC-2: A fresh send and an SDK-history contextual follow-up complete through the real provider with the nonce retained and legitimate unique itemIds unchanged, the scoped live-chat compiler exits 0 and the diff stays inside the exact allowlist. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof`

### SHARED FIXTURES

Launch through the real backend CLI and its owned lifecycle; drive the real installed SDK classes headlessly. Generate a fresh nonsecret nonce per invocation. Never inject authored assistant output.

```json
{"live_chat_hook_stack":{"description":"Launch the owned backend through tests/sprint-05-orient-search/support/live-backend.ts with valid server-only configuration; drive the real Chat and DefaultChatTransport classes installed for apps/example (ai@7.0.89, @ai-sdk/react@4.0.92, throttle 50) headlessly, reproducing the endpoint-loss retry state by stopping and restarting only the recorded owned backend handle.","seed_method":"cli","records":["OPENAI Responses model=gpt-4.1-mini-2025-04-14 at the fixed official base URL; credentials reach only the server child","Real installed ai@7.0.89 and @ai-sdk/react@4.0.92 resolved from the apps/example workspace packages; fresh nonsecret nonce per invocation","The server emits sanitized records only at stream termination; stop/restart acts only on recorded owned PIDs"]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/example/lib/use-live-chat.ts
- tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts
- .tmp/FIX-ORI-AI-001-1/**

writeProhibited:

- apps/example/server/**
- apps/example/app/**
- apps/example/components/**
- tests/sprint-05-orient-search/support/live-example-proof.test.ts
- tests/sprint-05-orient-search/support/live-backend.ts
- tests/sprint-05-orient-search/live-example-api.test.ts
- tests/sprint-05-orient-search/evidence/**
- apps/example/package.json
- pnpm-lock.yaml
- .spec/**
- .kb-run-sprint/**
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Always / Ask First

Always:

- Use the assigned isolated candidate and OS-derived owned scratch roots. Record source/run/PID identities; preserve shared WIP.
- Reuse the owned backend lifecycle; stop and restart only recorded owned children; await record emission at stream termination.
- Capture the actual outgoing request bodies (prepared payload) and the server's sanitized records for both RED and GREEN runs under `.tmp/FIX-ORI-AI-001-1/`.
- Keep new exports in apps/example/lib/use-live-chat.ts fallow-annotated as ORI-AI-001's deviations did (the pre-commit check:fallow gate flags new apps/example files otherwise).

Ask First:

- Stop for a version decision before any dependency change: prove from the installed packages that no hook-level fix can work, then name one pinned real version with evidence. Never "latest".
- Escalate if the fix appears to require server-side payload sanitization or screen changes — those belong to other owners and need an orchestrator decision, not a quiet edit.

### DELIVERABLE

- `apps/example/lib/use-live-chat.ts`: outgoing-history sanitize/stabilize so every assistant providerMetadata itemId is unique on the regenerate path; public hook contract unchanged.
- `tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts`: the scoped real-stack driver with its runRegeneratePayloadProof test covering the RED/GREEN retry leg, the happy-path legs, the payload-invariant assertions and the scoped compiler check.
- `.tmp/FIX-ORI-AI-001-1/`: bounded RED/GREEN evidence — captured bodies, uniqueness results, sanitized server records, command transcripts.

### AGENT INSTRUCTIONS — TDD FLOW

1. Read the current AC, the boundary contracts, the installed SDK source and the ORI-RN-004 cycle-1 blocked report. Establish the exact duplicate shape during reproduction.
2. RED: write the real assertion cases in the scoped driver and run the exact selector against the pre-fix candidate. The retry-completion assertion must fail functionally (provider error record, 0 deltas, non-unique itemIds captured). Missing prerequisites are blockers, never functional RED. Wait for orchestrator verification of RED.
3. GREEN: implement the smallest real change in apps/example/lib/use-live-chat.ts. Rerun the identical selector and record actual outcomes. Keep the happy-path legs green.
4. REFACTOR only after verified GREEN; preserve the proof bindings and rerun affected checks.
5. Hand the exact candidate and evidence to aisdk-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/example/lib/use-live-chat.ts`, full file [PRIMARY TARGET] — the fix site and its current transport construction.
2. `apps/example/node_modules/ai/src/ui/http-chat-transport.ts`, lines 100-175 — the installed `prepareSendMessagesRequest` seam returning the request body.
3. `.kb-run-sprint/sprint-05-orient-search/ORI-RN-004/cycle-1.blocked.json`, full file — the root-cause evidence, the headless-probe assumptions and the consumer oracle.
4. `apps/example/server/chat.ts`, lines 260-326 (read-only) — record emission only at stream termination and the sanitized record shape.
5. `tests/sprint-05-orient-search/support/live-backend.ts` (read-only) — the owned backend lifecycle to reuse for stop/restart.

### DESIGN / REFERENCE GUIDANCE

No layout, styling or screen work. The diagnostic probe scripts under `.tmp/ORI-RN-004/cycle-1` (absolute-path SDK imports) are the reference for headless driving; this task's driver supersedes them as the durable proof. Use v7 names throughout (`instructions`, `result.stream`, `onEnd`); the installed source overrides older Rosetta examples.

### CODING STANDARDS

- Strict TypeScript, no `any`, no concealment casts, no declaration replacements, no compatibility shims.
- Pure sanitize function exported from the hook module; typed against the installed UIMessage shapes.
- Await record emission; clear listeners and stop only owned children on every exit path.
- Keep request records bounded, correlated and sanitized.

### RUNTIME COMMANDS AND VERIFICATION GATES

All commands below are future execution commands. None ran during rendering.

Exact locked selector:

```sh
pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof
```

Preserved verification commands:

```sh
pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json
pnpm --dir apps/example exec tsc --noEmit
pnpm exec biome ci apps/example/lib/use-live-chat.ts tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts
```

Command contract:

- The driver starts the real server as an owned child through support/live-backend.ts; the real credential is inherited only by that child; missing credentials, networking or model access block execution.
- The scoped biome command carries ORI-AI-001's known caveat: biome.json's files.includes omits apps/example/**, so verify lint coverage explicitly rather than trusting a silent exit 0.
- The whole-example diagnostic remains a separate retained output; it is not this task's acceptance.
- Do not rerun ORI-AI-001's or ORI-RN-004's suites as gates — they write to evidence directories outside this allowlist.

### EVIDENCE GATES

1. Prerequisites: real installed ai@7.0.89 / @ai-sdk/react@4.0.92 and real provider access established without exposing credentials. Missing prerequisites block execution.
2. Functional RED: the exact selector against the recorded pre-fix candidate with real dependencies; the retry-completion assertion fails on the real stack; the duplicated-itemId payload shape is captured. An authored failure flag or missing test is not functional RED.
3. GREEN: the identical selector post-fix; every leg observes seeded real outcomes; no skipped dependencies or zero-test success.
4. Evidence: bind current source and test hashes to exact commands/exits and a fresh run identity; capture outgoing bodies (itemId uniqueness), new request IDs, provider response IDs, usage, delta counts and terminal outcomes, all sanitized.
5. Independent review: Scenario/Requirement Contract parity, real RED/GREEN on the real stack, no stubs, exact scope compliance. The orchestrator validates scenarios and flow coverage before dispatch.

Planned evidence paths:

- .tmp/FIX-ORI-AI-001-1/red.json
- .tmp/FIX-ORI-AI-001-1/payload-bodies.json
- .tmp/FIX-ORI-AI-001-1/retry-recovery.json
- .tmp/FIX-ORI-AI-001-1/happy-path.json
- .tmp/FIX-ORI-AI-001-1/run.json

Teardown: abort unfinished requests, clear listeners and deadlines, stop only children recorded by this run's owned handles, preserve unrelated listeners, and retain bounded evidence.

### CONTEXT AND EXECUTION PRECONDITIONS

Current gap: ORI-RN-004 cycle 1 proved AC-1..AC-2, AC-4, AC-3 case 1 and AC-5 green on all platforms, with iOS/Android retry completion failing server-side on the duplicated-itemId regenerate payload. The hook's web path passes; only the regenerate-with-stale-history path is red.

Success state: the scoped driver proves the retry recovery end-to-end on the real stack and the happy path is unchanged; ORI-RN-004's retry-completion oracle (new real request ID + completed provider-correlated answer + exactly 1 retained user turn) becomes satisfiable on all three platforms.

- VP-EXECUTION-SCOPE: planning only. Implementation requires execution authorization. Use an isolated candidate and owned scratch roots; preserve shared WIP.
- VP-OPENAI: credential presence is not provider proof; require actual fixed-endpoint requests with gpt-4.1-mini-2025-04-14 and sanitized outcomes.
- VP-SECRETS: credentials only in the trusted launcher and the server child; strip from drivers, compilers, arguments and evidence.
- VP-RESOLUTION: the headless driver resolves `ai`/`@ai-sdk/react` from the apps/example workspace (pnpm layout); the cycle-1 probes' absolute-path approach is the recorded workaround if plain resolution fails.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

- No locked flow belongs to this task. FLOW-DOCS-02-live-example-api-stream-history-abort remains owned by ORI-AI-001; FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004. This task owns no flow evidence writes and adds no journey proofs.
- The sprint's fixed gate and entrypoint are unchanged.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-AI-001.

Blocks: ORI-RN-004's AC-3 case-2 retry-completion oracle consumes this fix (a separate ask revises that dependency; this task does not edit it). Rendered retry acceptance on devices remains ORI-RN-004's; whole-example proof remains ORI-AI-002's.

Provides:

- A `useLiveChat` hook whose regenerate path keeps every assistant providerMetadata itemId unique across the real OpenAI Responses endpoint.
- The scoped real-stack driver with captured RED/GREEN payload evidence under `.tmp/FIX-ORI-AI-001-1/`.

Consumes:

- ORI-AI-001's landed hook, backend, scoped compiler and owned-backend lifecycle.
- Actual pinned packages, provider/model/network access and validated server-only configuration.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave8-add-payload-retry-fix` (wave-8, sequence next); source task ORI-AI-001; evidence ORI-RN-004 cycle-1 blocked report at checkpoint a86231aa; proposed by aisdk-planner.

### AGENT RATIONALE AND REVIEW

The aisdk-planner owns this Core/UI seam remediation. The aisdk-implementer lands the smallest real hook-level fix. The aisdk-reviewer verifies real-stack RED/GREEN, payload uniqueness, hook-contract preservation and scope compliance.

Must pass:

- Functional RED and GREEN are source/command bound on the real backend and real provider; the payload invariant and the consumer oracle are both asserted.
- The happy path, hook surface, retry ordering, throttle and transport configuration are unchanged.
- Every preserved command and the exact selector are accounted for; no owned process or listener remains.
- Only allowed files change; no stub, fake success, runtime skip or deferred required behavior remains.

Should verify:

- The sanitize is inert for unique itemIds (happy-path bodies byte-comparable on metadata).
- No dependency change landed without the pinned-version proof gate.
- Scoped compiler success is not presented as rendered-device acceptance.

Verdict: APPROVED or NEEDS_FIXES. NEEDS_FIXES must identify failed ACs, concrete files/lines and missing or contradictory evidence. Planned artifacts are not completion evidence.

### OUT OF SCOPE

- Rendered device acceptance, screen composition and the native/web proof matrix: ORI-RN-004 and ORI-AI-002.
- Server-side payload sanitization, server configuration, provider/model changes and dependency upgrades without the proof gate.
- ORI-AI-001/ORI-RN-004 evidence rewrites, planning policy edits, tracker mutation and trunk/worktree lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-AI-001-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"live_chat_hook_stack":{"description":"Launch the owned backend through tests/sprint-05-orient-search/support/live-backend.ts with valid server-only configuration; drive the real Chat and DefaultChatTransport classes installed for apps/example (ai@7.0.89, @ai-sdk/react@4.0.92, throttle 50) headlessly, reproducing the endpoint-loss retry state by stopping and restarting only the recorded owned backend handle.","seed_method":"cli","records":["OPENAI Responses model=gpt-4.1-mini-2025-04-14 at the fixed official base URL; credentials reach only the server child","Real installed ai@7.0.89 and @ai-sdk/react@4.0.92 resolved from the apps/example workspace packages; fresh nonsecret nonce per invocation","The server emits sanitized records only at stream termination; stop/restart acts only on recorded owned PIDs"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Regenerate recovery after endpoint loss","primary":true,"description":"GIVEN the installed Chat and DefaultChatTransport classes (ai@7.0.89, @ai-sdk/react@4.0.92, throttle 50) driven headlessly against the owned backend and the real OpenAI Responses endpoint WHEN the hook's clearError-then-regenerate retry path runs after owned-endpoint loss THEN the outgoing payload keeps every assistant providerMetadata itemId unique and the provider completes a new provider-correlated record with exactly 1 retained user turn.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts","test_function":"runRegeneratePayloadProof","verify":"pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, and the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AI-001-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, and the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14","negative_control":{"would_fail_if":["The regenerate payload still contains duplicated assistant entries or repeated OpenAI itemIds, the retry is satisfied by duplicating the user turn, or a mocked Chat/transport/fetch/provider stands in for the real stack."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_chat_hook_stack","action":{"actor":"api_client","steps":["Launch the owned backend through support/live-backend.ts, stop it via its lifecycle handle, submit a nonce turn through the real Chat + DefaultChatTransport to produce the sanitized endpoint-loss error and the retained user turn, then restart the same owned endpoint.","Capture the pre-fix regenerate request body and the server's sanitized records; run the hook's retry path (clearError then regenerate) and observe the real OpenAI rejection with an error record and 0 deltas as functional RED.","Apply the itemId-uniqueness fix in apps/example/lib/use-live-chat.ts and repeat the identical retry path against the same real stack."]},"end_state":{"must_observe":["Functional RED is captured before the fix: the regenerate payload carries duplicated assistant entries with repeated providerMetadata OpenAI itemIds and the server emits an error record with 0 deltas.","After the fix every assistant providerMetadata itemId in the outgoing regenerate payload is unique (0 duplicated itemId values across the regenerate request body) and the payload contains exactly 1 user turn for the failed submission.","In this leg's records the server shows exactly 2 outcome=completed records (the fresh seed turn and the retried turn) and exactly 1 error record (the endpoint-loss turn); the retried request has a new real request ID distinct from the failed one, an actual provider response ID, usage and at least 2 nonempty text deltas."],"must_not_observe":["Repeated itemIds or duplicated assistant entries in any outgoing body (duplicated itemId count greater than 0), a second user message, 0 completed provider records for the retried turn, an empty (0-delta) retry stream, the error record's outcome staying error after retry, a canned or replayed answer, or credentials in any captured evidence."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Happy-path preservation and hook contract intact","primary":false,"description":"GIVEN the fixed hook and the same real stack WHEN a fresh-session send and an SDK-history contextual follow-up complete and the scoped live-chat compiler runs THEN legitimate unique itemIds and history pass through unchanged, the follow-up retains the nonce, the compiler exits 0 and the public hook contract is unchanged.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts","test_function":"runRegeneratePayloadProof","verify":"pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14, and the real TypeScript scoped compiler","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-AI-001-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Node 24 example HTTP server through support/live-backend.ts, installed ai@7.0.89 and @ai-sdk/react@4.0.92 classes, the OpenAI Responses API at https://api.openai.com/v1 using gpt-4.1-mini-2025-04-14, and the real TypeScript scoped compiler","negative_control":{"would_fail_if":["The sanitizer strips or rewrites legitimate unique itemIds or history content, the contextual follow-up loses the nonce, the hook surface or retry ordering changes, the transport is stubbed or the provider response is mocked rather than reaching the real OpenAI Responses endpoint, a static canned answer satisfies the oracle without a new real request ID, or the scoped compiler regresses."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"live_chat_hook_stack","action":{"actor":"api_client","steps":["Send a fresh nonce-bearing turn and an SDK-history contextual follow-up that omits the nonce through the fixed hook path; capture both outgoing bodies and both server records.","Run pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json and inspect the actual hook diff against the allowlist."]},"end_state":{"must_observe":["The full driver run records exactly 3 outcome=completed records (the fresh nonce turn, the post-retry regenerated turn and the contextual follow-up) with 3 distinct real provider response IDs; the follow-up answer contains the literal nonce string, and every captured outgoing body shows 0 duplicated itemId values with each legitimate unique itemId unchanged.","The scoped live-chat compiler exits 0; the hook still exposes messages, status, error, sendMessage, stop, regenerate and clearError with retry as clearError() then regenerate(), throttle 50 and a stable DefaultChatTransport with expo/fetch.","The complete diff touches only apps/example/lib/use-live-chat.ts, the new scoped driver and .tmp/FIX-ORI-AI-001-1 evidence."],"must_not_observe":["Stripped unique itemIds, a lost nonce, 0 completed provider records for the follow-up, an empty (0-delta) stream, a changed hook surface, server or screen/driver edits, or writes outside the exact allowlist."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The endpoint-loss retry leg records functional RED pre-fix (duplicated assistant entries with repeated itemIds and a provider error record with 0 deltas) and GREEN post-fix (unique itemIds, a new real request ID, a completed provider-correlated record with at least 2 deltas and exactly 1 retained user turn).","verify":"pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"A fresh send and an SDK-history contextual follow-up complete through the real provider with the nonce retained and legitimate unique itemIds unchanged, the scoped live-chat compiler exits 0 and the diff stays inside the exact allowlist.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts -t runRegeneratePayloadProof","maps_to_ac":"AC-2"}]}
-->
</details>

## Handoff

```json
{
 "task": "FIX-ORI-AI-001-1",
 "commit_sha": "755edeae8c7f6e4186122eaf70f824d347a25327",
 "done": "Landed on the task branch as 755edeae (merged to main as a7e76866) a hook-level fix in apps/example/lib/use-live-chat.ts \u2014 sanitizeOutgoingChatMessages (apps/example/lib/use-live-chat.ts:124) keeps the first occurrence of each OpenAI provider itemId and strips itemIds from text parts still in state 'streaming', prepareSanitizedSendMessagesRequest (apps/example/lib/use-live-chat.ts:150) wires it into the existing DefaultChatTransport construction while reproducing the default body otherwise byte-identically, and chatFetch (apps/example/lib/use-live-chat.ts:45) lazy-imports expo/fetch so the module loads headlessly \u2014 plus the scoped real-stack driver tests/sprint-05-orient-search/support/live-chat-regenerate-payload.test.ts (locked selector, RED then GREEN on the real owned backend and the real OpenAI Responses endpoint) and sanitized evidence under .tmp/FIX-ORI-AI-001-1/ including the raw-error diagnostic that root-caused the rejection; the public hook contract is unchanged and all pre-commit gates (root tsc, biome via direct binary, fallow, scoped live-chat compiler) passed.",
 "deviations": [
  "The sanitize exceeds the charter's literal 'keep the first occurrence of each itemId' rule by also stripping itemIds from parts not yet state 'done' (apps/example/lib/use-live-chat.ts:98-108), because the live RED proved a payload with 0 duplicated itemIds is still rejected when it references an unfinished stream's item \u2014 the 'equivalent uniqueness-preserving transform' clause of Boundary Contract 2 was invoked and documented in the function's JSDoc.",
  "chatFetch changed from a static to a lazy dynamic expo/fetch import (apps/example/lib/use-live-chat.ts:45-50), the Boundary Contract 4 enabler, which makes the function body async \u2014 runtime behavior in Expo is identical modulo one resolved-promise microtask.",
  "ORI-AI-001's landed '// fallow-ignore-file unused-file' header on the hook file was removed (it became a stale suppression after this change; removal verified gate-green), so the file header differs from the landed ORI-AI-001 surface.",
  "The driver constructs the headless Chat without throttle:50, because throttle is a react useChat-wrapper option that does not exist on the headless ChatInit type \u2014 the task's 'throttle 50 driven headlessly' is not literally expressible at the class level.",
  "The driver loads ai/@ai-sdk/react and the hook module through computed specifiers bounded by local structural interfaces rather than static or type-only imports, because any static import of apps/example package types injects global DOM augmentations into the root tsc program and breaks unrelated spec files.",
  "AC-1's record tally and 'new request ID distinct from the failed one' were satisfied as cross-capture evidence rather than in-run assertions (see findings), matching the oracle ORI-RN-004's reviewed web leg actually implemented."
 ],
 "concerns": [
  "The state damage is a throttling race and varies run to run: my final RED capture happened to fail via the stale-streaming-itemId class (0 duplicated itemIds in that body), so the duplication-class RED shape exists only in the cycle-1 probe captures (.tmp/FIX-ORI-AI-001-1/cycle-1/probe-duplication.ts output) \u2014 a future SDK upgrade could change the damage shape into a third class the sanitize does not cover.",
  "The retry's deltaCount >= 2 oracle rides on the 'Reply with the single word pineapple.' prompt empirically streaming as 2 text deltas; a provider-side chunking change to 1 delta would flake GREEN.",
  "The cast at apps/example/lib/use-live-chat.ts:49 (init as Parameters<typeof expoFetch>[1]) papers over undici-RequestInit vs expo-FetchRequestInit typing-lib skew and would silently conceal a future real signature divergence.",
  "The pre-commit biome job is vacuous in this environment ('pnpm lint' dies with 'Linter process terminated abnormally' yet exits 0), so hook-level lint coverage here rests on the direct-binary verification I recorded, not on the gate itself.",
  "Keep-first semantics mean that if a future damage ordering ever places a partial snapshot before the complete one for the same itemId, the partial text is what gets sent \u2014 contract-prescribed and provider-accepted, but lower history fidelity."
 ],
 "findings": [
  "The defect is two failure classes, not one: duplicated assistant entries repeating itemIds AND unique-but-stale itemIds from streams that never completed, where the second class returns OpenAI 400 'Item with id \u2026 not found' even with zero duplicates \u2014 proven by direct provider replay in .tmp/FIX-ORI-AI-001-1/cycle-1/diag-raw-provider-error.ts, and invisible in server records because sanitizeError collapses every provider failure to one generic string (apps/example/server/chat.ts:162).",
  "Mechanism: @ai-sdk/openai responses defaults store to true and converts every assistant text part carrying providerMetadata.openai.itemId into a bare item_reference whose content is NOT sent (apps/example/node_modules/@ai-sdk/openai/src/responses/convert-to-openai-responses-input.ts:606-610), so a stale itemId simultaneously drops the partial text and fails the request.",
  "The client-side staleness signal is part.state: aborted turns leave text parts stuck at 'streaming' while completed turns end 'done' \u2014 this is what the sanitize keys on and it is the only reliable client-side discriminator.",
  "The minimal AC-1 scenario as written (seed turn, stop backend, submit, restart, retry) does NOT reproduce the failure \u2014 a single completed turn plus endpoint loss retries successfully even pre-fix; an aborted mid-stream turn (or equivalent state damage) between them is the prerequisite, which is why the driver adds the aborted-essay leg.",
  "Static or even type-only imports of apps/example modules (the hook via expo/fetch, and the ai/@ai-sdk/react dist d.ts themselves) add global DOM augmentations (HTMLElement | SVGElement unions) to the root tsc program and break unrelated spec files \u2014 any future driver touching these packages must runtime-load via computed specifiers with structural surfaces.",
  "The published expo/fetch entry (expo/fetch.js requiring ./src/winter/fetch/index) cannot resolve in plain Node at all; only Metro resolves it, and its types live under expo/build/winter/fetch \u2014 which is why the lazy-import enabler works for types but must never be called headlessly.",
  "Terminal-status helpers must gate on status DEPARTURE before waiting for the terminal state, because Chat sets 'submitted' asynchronously after sendMessage returns and a naive wait returns the stale 'ready' (a vacuous pass that bit the first driver draft)."
 ],
 "scope_impact": [
  {
   "target": "ORI-RN-004",
   "found": "Its AC-3 case-2 retry-completion oracle is now satisfiable on iOS/Android since the regenerate payload no longer 400s, and its 'new real request ID' language can only mean the restarted backend's fresh completed record \u2014 in-run id inequality is impossible because DefaultChatTransport sends id = the per-Chat chatId.",
   "change": "Re-run its committed driver for the green R-final per its own dependency note, and reword the oracle to 'a new server-side record with a real request id' when the ask revising that dependency is written."
  },
  {
   "target": "ROADMAP",
   "found": "The upstream state corruption itself (duplicated and text-merged assistant messages accumulating in the Chat state after an aborted stream, @ai-sdk/react 4.0.92 / ai 7.0.89) remains unfixed \u2014 this task patches the wire, not the state.",
   "change": "Track an upstream report/upgrade follow-up: when ai/@ai-sdk/react fix the state duplication, the transport sanitize becomes harmless belt-and-suspenders and the pinned-version dependency gate in this charter is the place to revisit."
  }
 ],
 "feedback": [
  "The RED must_observe pinned the duplicated-itemIds shape, but which failure class manifests is a throttling race \u2014 write the RED bar as 'real provider rejection with an error record and 0 deltas' (both classes satisfy it) and treat the specific payload shape as captured-not-required.",
  "AC-1's 'exactly 2 outcome=completed records and exactly 1 error record' is unachievable inside one GREEN run because the endpoint-loss submission never reaches a server; state it as the union of the leg's RED and GREEN captures.",
  "The scenario's step list omits the state-damage prerequisite (an aborted mid-stream turn before the endpoint loss) \u2014 without it the pre-fix retry completes and no functional RED exists.",
  "Boundary Contract 4 anticipated expo/fetch blocking the hook import but not that even ai/@ai-sdk/react dist type imports break the root tsc program; prescribe runtime loading with structural surfaces for any driver touching apps/example packages.",
  "The setup note's generation command 'pnpm docs-data prebuild' does not exist \u2014 it should read 'pnpm --dir apps/docs prebuild'.",
  "The locked VERIFY selector was correct and ran unchanged across RED and GREEN; keep that pattern."
 ]
}
```
