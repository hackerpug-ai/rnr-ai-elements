# ORI-CONT-003: Author the single seed-data quickstart and its live-example run handoff

## What this does

An integrator follows one engine-specific seed-data tutorial, sends a message, and reaches a verified run guide for the actual live useChat example.

## Why

The tutorial and run handoff need authored, source-backed instructions. The fused input identifies a string-callback mismatch in the current example index; it must not become tutorial source.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts` against the actual built docs and examples. Capture the submitted seed marker and correlated provider response. ORI-CONT-004 retains the complete integrated two-engine, three-platform proof.

## Scope

Author the single Quickstart, the live-example run how-to, and the README handoff. Add the task-owned browser spec and content-review report. Exactly five paths are writable.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: techwriting-implementer · Reviewer: techwriting-reviewer
> Priority: P1 · Points: 5 · Type: DOCS
> Dependency phase: after ORI-CONT-001, ORI-AST-001, ORI-AST-002, ORI-RN-002, ORI-AI-002
> Proposed By: techwriting-planner · Co-authored By: []
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

### OUTCOME

An integrator follows one engine-specific seed-data tutorial, sends a message, and reaches a verified run guide for the actual live useChat example.

Success state: Exactly one site tutorial renders the complete imported seed-data lesson for both engines with per-step outcomes. The conclusion and preserved example README reach a run how-to backed by actual live-screen/provider evidence.

### CRITICAL CONSTRAINTS — Never

- Never expose credential values or move provider credentials into client code, EXPO_PUBLIC variables, command arguments, screenshots, or logs.
- Never invent scripts, routes, ports, variables, provider choices, or platform networking rules; derive instructions from the implemented dependencies and execute them before acceptance.
- Never duplicate the tutorial or hand-copy its sample. Every Quickstart code block belongs to engine panels and uses the RN-owned executable source with composed PromptInputMessage handling.
- Never claim runtime proof from resolving links, static content, mocks, skipped targets, canned responses, or old receipts. Missing real prerequisites block acceptance.
- Never edit beyond the five allowed paths or alter shared WIP, task-flow ownership, registry/runtime implementation, or the locked sprint gate.

### DONE WHEN

- [ ] AC-1: One tutorial names its result before step 1 and ends every numbered step with an observable result.
- [ ] AC-2: Both engine panels preserve selection, display the canonical commands, and contain complete imported source.
- [ ] AC-3: The displayed seed lesson compiles and submits a real message in independent Web consumers for both engines.
- [ ] AC-4: The linked run how-to reaches real contextual provider streaming and recovery while preserving README guidance.
- [ ] Required verification and evidence gates pass, independent review accepts, and only writeAllowed paths change.

### RUNTIME COMMANDS

```text
test: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts
typecheck: pnpm typecheck
lint: pnpm lint
docs_build: pnpm --filter @rnr-ai-elements/docs build
```

PROGRESS: 0/4 ACs; every TDD_STATE is none. Product verification has not run during rendering.

### ACCEPTANCE CRITERIA

This is a DOCS task with task-owned integration/e2e proofs. All ACs have primary:false and flow_ref:null. ORI-CONT-004 remains the sole PRIMARY owner of the locked quickstart flow. Task-local Web proof does not replace the integrated native/Web gate.

#### AC-1: One tutorial with a named result and step outcomes

GIVEN the actual candidate docs are built WHEN the learner opens /docs/quickstart and reads the guided sequence THEN one tutorial names its seed-data Expo Go result before step 1 and gives every step an observable result.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/quickstart-content.spec.ts
TEST_FUNCTION: ORI-CONT-003-AC-1
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-1
MAPS_TO_AC: null
```

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","negative_control":{"would_fail_if":["The content is omitted from the build, leaving an empty shell","A named or per-step result is removed"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Open /docs/quickstart in the real browser; inspect tutorial inventory, intro and every numbered step."]},"end_state":{"must_observe":["HTTP 200 and exactly 1 published tutorial","Before step 1: 'scrolling message list', 'prompt input', 'Expo Go', 'seed data'","N >= 1 imperative 'we' steps; each ends with its own observable expected result"],"must_not_observe":["Empty tutorial or placeholder result","A second tutorial or a step with no expected result"]}}]}
```

#### AC-2: Complete engine panels import the executable source

GIVEN the learner has selected an engine through the existing installation-page control WHEN the learner opens Quickstart, reads every code panel, and deliberately switches engines THEN every block follows the selected engine and contains canonical commands plus complete imported sample source.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/quickstart-content.spec.ts
TEST_FUNCTION: ORI-CONT-003-AC-2
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-2
MAPS_TO_AC: null
```

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","negative_control":{"would_fail_if":["Static panels are disconnected from engine selection","Commands or imported source are omitted or mismatched"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Select nativewind on /docs/installation; navigate to Quickstart and compare every displayed block with the real source files."]},"end_state":{"must_observe":["'nativewind' selection survives navigation","'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json' verbatim","All code, including 'quickstart-screen.tsx', belongs to engine panels and matches source hashes","Separate required 'Message' and composed 'PromptInput' installs"],"must_not_observe":["Empty panel or default engine replacing the selected engine","Un-tabbed code, wrong-engine commands or the unchanged string-callback index sample"]}},{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Select uniwind, inspect all panels, navigate away and return."]},"end_state":{"must_observe":["'uniwind' selection survives navigation","'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json' verbatim","Complete 'uniwind' setup and source panels match input hashes and contain composed PromptInput children"],"must_not_observe":["Empty uniwind source or default nativewind selection","Inactive nativewind instructions displayed as selected"]}}]}
```

#### AC-3: The exact displayed seed lesson submits a real message

GIVEN independent clean consumers run the exact source and commands displayed for each engine WHEN the learner scrolls the transcript and submits a fresh non-empty marker through PromptInput THEN each Web consumer appends the marker once, clears the input, and keeps its seeded transcript scrollable.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real built Quickstart, public HTTPS registry, RNR CLI, clean Expo 57 Web consumers, and a real Playwright browser
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/quickstart-content.spec.ts
TEST_FUNCTION: ORI-CONT-003-AC-3
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-3
MAPS_TO_AC: null
```

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Quickstart, public HTTPS registry, RNR CLI, clean Expo 57 Web consumers, and a real Playwright browser","negative_control":{"would_fail_if":["Submission is a no-op or treats PromptInputMessage as a string","The registry is mocked or the running source differs from displayed source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_seed_consumers","action":{"actor":"user","steps":["For both engines, install through the displayed public commands, compile the exact displayed source and run Expo doctor.","In each real Web consumer, scroll to the recorded seed turn and submit the fresh marker through Send message."]},"end_state":{"must_observe":["2 independent consumers install from 'https://rnraielements.com' and pass compiler and Expo checks","N+1 turns, including exactly 1 user turn 'ORI-CONT-003-<run-id>'","The 'PromptInput' clears; the older named seed turn remains scrollable"],"must_not_observe":["Empty or unchanged N-turn transcript after submission","Duplicate marker, synthesized assistant reply or retained input"]}},{"start_ref":"clean_seed_consumers","action":{"actor":"user","steps":["Attempt submission with the initially empty composer in each fresh consumer."]},"end_state":{"must_observe":["N >= 1 seed turns remain, including the recorded older turn","Composer stays empty and 0 blank user turns are added"],"must_not_observe":["Empty transcript replacing the seed list","Blank user bubble or canned answer"]}}]}
```

#### AC-4: The conclusion and run guide reach the real live example

GIVEN the implemented example and backend are available with server-only credentials WHEN the learner follows the useChat-adjacent conclusion link and the run guide THEN the live screen streams a correlated provider response; the README retains its consumer and offline-route guidance.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real built Quickstart, apps/example /live-chat, the implemented server, official OpenAI Responses endpoint, and a real Playwright browser
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/quickstart-content.spec.ts
TEST_FUNCTION: ORI-CONT-003-AC-4
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-4
MAPS_TO_AC: null
```

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Quickstart, apps/example /live-chat, the implemented server, official OpenAI Responses endpoint, and a real Playwright browser","negative_control":{"would_fail_if":["The link opens a static/offline example","Provider responses are stubbed or instructions are disconnected from implementation"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_example","action":{"actor":"user","steps":["Follow the conclusion link beside useChat and the README link to docs/live-chat.md.","Verify instructions against the implemented app/server; execute the exact Web startup path.","Submit the nonce prompt on /live-chat, watch streaming and ask a follow-up without repeating the nonce.","Compare README preservation and inspect prerequisites, platform endpoints, expected response and failure remedies."]},"end_state":{"must_observe":["Resolving conclusion link beside 'useChat'; README link to 'docs/live-chat.md'","Actual '/live-chat' screen runs the app-owned useChat hook","At least 2 incremental observations before completion; final hash and request/response IDs match OpenAI server evidence","Follow-up recovers 'ORI-CONT-003-<run-id>' from history","'live-chat.md' is a run how-to with server-only variable names; original README consumer/offline guidance remains"],"must_not_observe":["Empty live screen, static answer or repository-link-only success","Second composition lesson, invented instruction, credential value or removed README guidance"]}},{"start_ref":"live_example","action":{"actor":"user","steps":["Stop only the proof-owned backend and submit another prompt; check the real failure against the documented remedy.","Restart using the guide and select Retry for the retained turn."]},"end_state":{"must_observe":["'/live-chat' reports a sanitized connection error during endpoint loss","'Retry' issues a fresh successful provider request with exactly 1 retained user turn"],"must_not_observe":["Empty success receipt or canned answer during service loss","Duplicate user turn or exposed credential"]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: Exactly one rendered tutorial names all four outcome elements before step 1 and every numbered step ends with an observable result. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-1`
- TC-2 → AC-2: Both selected engine panels preserve the real preference, display the literal conversation commands, include all required installs, and match the executable source bytes. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-2`
- TC-3 → AC-3: Both clean Web consumers compile the displayed source, append one non-empty marker, clear the composer, retain scrollable seed turns, and add no blank turn. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-3`
- TC-4 → AC-4: The linked run guide starts the real live screen, proves incremental contextual provider output and endpoint-loss recovery, protects credentials, and preserves README guidance. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-4`

### SHARED FIXTURES

These are required future start states seeded through real entrypoints. They are not observations from rendering.

```json
{"built_quickstart":{"description":"After prerequisites land, build the actual docs through its package entrypoint and serve dist with owned Astro preview at localhost:4321; open a fresh browser context.","seed_method":"cli","records":["Recorded candidate SHA and fresh run ID; browser storage is empty","Actual quickstart.mdx, both command files, quickstart-screen.tsx and quickstart-messages.ts enter the real source-backed build"]},"clean_seed_consumers":{"description":"Execute each engine's displayed public HTTPS commands in independent OS-derived clean Expo 57 consumers; compile the exact displayed source and serve each real Web export.","seed_method":"cli","records":["Independent nativewind and uniwind consumers without monorepo source links","The actual quickstart-messages.ts entrypoint supplies N seed turns and an older named turn, recorded at startup","PromptInput is empty; marker ORI-CONT-003-<run-id> has not been submitted"]},"live_example":{"description":"Follow live-chat.md using verified app/server instructions; start the owned real backend and Web /live-chat screen, with provider credentials supplied only to the server.","seed_method":"cli","records":["Recorded candidate/source hashes and fresh run ID","Official OpenAI Responses endpoint with gpt-4.1-mini-2025-04-14","Fresh conversation has no ORI-CONT-003-<run-id> nonce; retain original README bytes for comparison"]}}
```

### SCOPE — File-level write permissions

writeAllowed:

- apps/docs/src/content/docs/quickstart.mdx
- apps/example/docs/live-chat.md
- apps/example/README.md
- tests/sprint-05-orient-search/quickstart-content.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-CONT-003-content-review.md

writeProhibited:

- packages/**
- public/**
- apps/docs/src/components/**
- apps/docs/src/pages/**
- apps/docs/src/styles/**
- apps/example/app/**
- apps/example/components/**
- apps/example/lib/**
- apps/example/server/**
- apps/example/package.json
- .spec/**
- .github/**
- scripts/**
- pnpm-lock.yaml
- Any file not explicitly listed in write_allowed

### BOUNDARIES — Always / Ask First

Always:

- Name the seed-data result before step 1 and end each numbered step with an observable result.
- Import reviewed source in both engine panels and preserve inherited selection.
- Preserve README consumer/offline guidance and use a focused live-example run how-to.
- Capture real, redacted, source/run-correlated evidence.
- Preserve shared WIP; use assigned isolation and owned scratch/process cleanup.

Ask First:

- A required dependency needs a different published contract, version, source change, or a write outside this task's allowlist.
- A verified product limitation would change the tutorial promise, provider contract, or required platform coverage.

No view injection, fake filesystem, mocked HTTP, stub provider, canned answer, test-only product seam, skipped target, or static success.

### DELIVERABLE / PAGE PLAN

**apps/docs/src/content/docs/quickstart.mdx — tutorial**

Audience: Integrators comfortable editing an Expo screen who have not composed this registry's chat components.

Reader job: Build and exercise a seed-data chat screen through one guided sequence.

Success criterion: The learner sees the seeded transcript, submits a non-empty message through the real PromptInput composition, and sees that message appended.

Shape: Named result, prerequisites, numbered imperative steps using we, engine-tabbed imported source, an expected result after every step, live-example handoff.

**apps/example/docs/live-chat.md — how-to**

Audience: Integrators who already understand the quickstart composition and want to run the provider-backed example.

Reader job: Configure, start, and exercise the existing useChat example against its real backend.

Success criterion: The reader follows the verified commands, opens the actual live screen, sends a message, and observes a real streamed response.

Shape: Goal, prerequisites, server-only credential configuration, exact verified startup commands, platform endpoint guidance, expected response, actionable configuration failures.

Non-scope: Do not repeat the seed-data lesson, teach another chat UI composition, or turn this run guide into provider or SDK reference.

Modify apps/example/README.md only for the live-guide link and necessary route distinction. Add the four named tests in quickstart-content.spec.ts and the planned content-review report.

### BOUNDARY CONTRACTS

- Every Quickstart code block belongs to engine panels, including shared rendering code, as required by T-DOCS-008.
- Include the literal canonical conversation command for each engine. Include the additional registry item installs that the actual Message and PromptInput sample needs; conversation does not install them automatically.
- Import source from the RN-owned sample. Do not copy apps/example/app/index.tsx unchanged: its current caller accepts a string, while installed PromptInput submits a PromptInputMessage object and requires composed input children.
- The tutorial promises seed-data interaction. The worked-example handoff describes only the implemented live useChat route.
- The live-example how-to derives command text and environment-variable names from the implemented backend and app. It never invents a script, endpoint, port, provider choice, or simulator networking rule.
- Keep credentials on the server. Document variable names and where to set them without reproducing values.
- Preserve the example README's existing consumer and offline-route information. Add only the live-example link and the distinction necessary to select the correct route.
- A resolving repository link does not prove that the linked example uses useChat or reaches a provider. Final acceptance requires the actual live-screen and provider evidence.

### AGENT INSTRUCTIONS — RED → GREEN → REFACTOR

1. Read dependency-owned source and the current AC. Add its named test to the allowed spec. Run the exact VERIFY before authoring content and record the real assertion failure. Missing files, test discovery errors and unavailable services do not count as functional RED.
2. Author the minimal prose and import changes. Build the actual candidate, rerun the same VERIFY, and capture its named observations in the allowed report.
3. Refine prose while preserving behavior. Rerun affected checks, then the task-wide command, docs build, typecheck and lint. Do not add runtime seams or skip unavailable targets.
4. Submit the candidate and actual evidence for independent techwriting-reviewer review. Missing dependencies or required runtime evidence block acceptance. Content approval does not close the integrated sprint flow.

### READING LIST — Maximum five

1. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` — PRIMARY PATTERN: Style baseline, Terminology lock, Page templates and Content gates. This is the current path.
2. `.spec/prds/docs-site/04-uc-docs.md` — UC-DOCS-02: one tutorial, engine panels, per-step results and the live useChat handoff.
3. `apps/docs/src/components/islands/TabGroup.astro` (lines 27-63) — Consume the dependency-reviewed engine panel composition and storage key.
4. `apps/example/README.md` — Baseline consumer/run/offline guidance that the live-guide link must preserve.
5. `.spec/e2e-policy/surface.json` — Require a real driver and product-owned observed targets; generic document roots cannot prove success.

### SOURCE MATERIAL — Read-only dependency inputs

- packages/docs-snippets/commands/nativewind.sh
- packages/docs-snippets/commands/uniwind.sh
- packages/docs-snippets/shared/quickstart-screen.tsx
- packages/docs-snippets/shared/quickstart-messages.ts
- apps/example/components/ai/prompt-input.tsx
- apps/example/lib/use-live-chat.ts
- apps/example/server/env.ts
- apps/example/server/index.ts
- apps/example/package.json
- apps/example/README.md

Some inputs are planned dependency outputs. Require their presence and reviewed identity before authoring; do not replace missing inputs with guessed snippets.

### DESIGN / CODING GUIDANCE

- Tutorial: imperative steps with we, named result, prerequisites, engine panels, per-step observations and next steps.
- Run how-to: goal, prerequisites, server-only configuration, verified commands, platform endpoints, expected response and failure remedies.
- Consume existing CodeBlock/TabGroup and source-backed snippet integration. Do not introduce presentation components, tokens or islands.
- Apply active voice, short sentences, present tense and defined acronyms. Use the canonical terms engine, engine tree, registry item, family, verdict, peers and dev client.
- Keep commands and samples tied to actual files and executable entrypoints. Preserve both engine trees and Expo SDK 57 resolver pins.
- Use Playwright against real built docs and app surfaces. Do not replace the browser, CLI, compiler, server or provider with test doubles.

### EVIDENCE GATES

1. Pipe the exact fixtures and requirements to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument; require exit 0 and zero findings.
2. Run every exact per-AC VERIFY before content implementation. Capture actual functional RED, then GREEN on the authored candidate.
3. Run `pnpm --filter @rnr-ai-elements/docs build` with dependency-owned snippet/content gates available, then `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts`. Require all four named tests and captured seeded observations.
4. Run `pnpm typecheck` and `pnpm lint`. Retain real clean-consumer compiler and dependency-owned live import-graph evidence separately: root typecheck does not prove the whole example.
5. Record command/source mapping, README preservation, browser observations, actual seed marker, and sanitized provider correlation in `tests/sprint-05-orient-search/evidence/ORI-CONT-003-content-review.md`. Check the scoped diff and scan touched production content/tests for stubs, placeholders, skips and deferred claims before independent review.
6. At sprint integration, ORI-CONT-004 runs the exact locked quickstart command with fresh public installs and both six-target seed/live matrices in the same invocation. Task-local Web checks do not replace that gate.

Required evidence includes candidate SHA, fresh run ID, test/command/source/policy hashes, per-AC RED/GREEN output, observed counts and literals, source-byte comparisons, real CLI/compiler output, and sanitized provider request/response IDs, model, usage, incremental observations and final server-text hash. Native claims additionally require inspected iOS screenshots and actual Android recordings from the owning matrix proof. Preserve prior run identities. All paths are planned outputs; no product pass is claimed by this charter.

### LOCKED FLOW SUPPORT

ORI-GATE-03 exercises this content task. No PRIMARY ownership is claimed.

```text
FLOW_REF: FLOW-DOCS-02-quickstart-chat-screen
PRIMARY_OWNER: ORI-CONT-004
TEST_FILE: tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
TEST_FUNCTION: FLOW-DOCS-02-quickstart-chat-screen
RUN_CMD: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop
ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json
RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
```

Run this same real-browser flow against the recorded preimplementation source, preserve the actual observed failure and exact command output at red_proof, then run the completed candidate. Source absence or an authored success flag is not RED/GREEN evidence.

Flow co-author provenance: astro-planner, techwriting-planner, frontend-designer, react-native-reusables-planner, aisdk-planner, cloudflare-workers-planner, ghactions-planner.

Preserve FLOW-SHELL-13-engine-tab-persists-across-pages as the fused capability reference. This projection supplies no ownership binding for it; claim no PRIMARY or journey proof. The orchestrator validates full-sprint ownership.

### VERIFICATION PRECONDITIONS

- All five dependencies provide reviewed source, snippet, app, endpoint and package contracts. Missing inputs block acceptance.
- Reserve localhost:4321 and owned consumer/backend ports. Identify listeners, refuse unowned processes, and clean up only recorded children and scratch roots.
- Normal DNS and trusted HTTPS serve the corrected canonical registry. Do not rewrite hostnames, substitute preview URLs or disable certificate checks.
- Only the real backend receives credentials. Use the selected official OpenAI Responses contract with gpt-4.1-mini-2025-04-14; record sanitized failures without substituting a model or canned answer.
- Final integrated proof reserves RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL and executes both engines on iOS, Android and Web. Live proof includes contextual follow-up, active abort, endpoint loss, actual rejected-model request and successful retry without duplicate user turns.
- Bind evidence to fresh candidate/source/run and registry hashes. Reject absent matrix legs and stale receipts. Restore reserved-device appearance and owned mappings.

### OUT OF SCOPE

- A second site tutorial, another component-composition lesson, provider reference or AI SDK reference.
- RN sample, registry component, engine, backend, transport, provider, app route or compiler implementation; their owning tasks supply those inputs.
- Astro content infrastructure, duplicate-tutorial gate implementation, engine persistence machinery, design tokens or new presentation components.
- Taking ownership of FLOW-DOCS-02 or any journey, editing shared proof drivers/policies, CI, publication or deployment.
- Broader example/gallery diagnostics, dependency upgrades or any newly discovered fix outside the allowlist.

### CONTEXT

Implementation surface: Author exactly one site tutorial. Before step 1, name its result: a scrolling message list with working prompt input in Expo Go using seed data. Guide the learner through one sequence using inherited engine selection and imported, executable source. Every numbered step ends with a visible expected result. Conclude with a link adjacent to useChat that opens the real worked integration. Add a concise run how-to within apps/example for that integration and a README link to it; this how-to explains how to start and exercise the existing example without teaching another component-composition lesson.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

Sizing: Original content proposal used 4 points. Round to 5 to satisfy the governing closed Fibonacci estimates within the required 1–5 range; scope is unchanged.

### REVIEW — techwriting-reviewer

Must pass:

- Four ACs and mapped TCs retain matching proof fields, complete scenarios, real RED/GREEN evidence and seeded observations.
- One tutorial meets T-DOCS-007/008/009/010/030/031; all panels consume reviewed source and canonical commands.
- The run instructions reach the actual live route and provider. A resolving link alone cannot pass.
- All boundary contracts hold, credentials remain server-only, and README guidance is preserved.
- Only five allowed paths change; required checks and owner runtime evidence support every completion claim.

Should verify:

- Tutorial and run how-to serve distinct reader jobs without a second composition lesson.
- Expected results are observable and configuration failures have concrete remedies.
- Prose follows the canonical glossary and existing presentation patterns.

Verdict: APPROVED | NEEDS_FIXES. For NEEDS_FIXES, name the affected requirement and file/line or missing real evidence.

Agent rationale: techwriting-planner owns page jobs and the Diataxis split; techwriting-implementer authors verified prose and scoped content checks; techwriting-reviewer validates instructions, quadrant purity and source-to-runtime evidence.

### DEPENDENCIES / CAPABILITIES

Depends on: ORI-CONT-001, ORI-AST-001, ORI-AST-002, ORI-RN-002, ORI-AI-002.

Blocks: ORI-CONT-004 through the content handoff for integrated proof.

Provides: the single source-backed tutorial; focused live-example run guide and README link; scoped browser spec and content-review report.

Consumes: reviewed content, docs composition, engine-selection and snippet contracts from the five dependencies; RN-owned executable commands/screen/data; the implemented useChat hook, backend configuration and real-provider proof through ORI-AI-002. ORI-CONT-004 owns final native/Web acceptance.

Capability: CAP-DOCS-01.

PRD references:

- `.spec/prds/docs-site/04-uc-docs.md` — UC-DOCS-02.
- `.spec/prds/docs-site/12-e2e-testing-criteria.md` — T-DOCS-007, T-DOCS-008, T-DOCS-009, T-DOCS-010, T-DOCS-030, T-DOCS-031.
- `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`.
- `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md` — CAP-DOCS-01.

Human test hook: Read the named seed-data result, follow the selected engine's lesson, then open the live-example run guide and follow its verified startup path.

### FIXED SPRINT CONTRACT

Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The 13 locked flows remain 9 task flows and 4 journeys. This task owns no journey proof. Candidate size remains 36 tasks / 131 points.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-003","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_quickstart":{"description":"After prerequisites land, build the actual docs through its package entrypoint and serve dist with owned Astro preview at localhost:4321; open a fresh browser context.","seed_method":"cli","records":["Recorded candidate SHA and fresh run ID; browser storage is empty","Actual quickstart.mdx, both command files, quickstart-screen.tsx and quickstart-messages.ts enter the real source-backed build"]},"clean_seed_consumers":{"description":"Execute each engine's displayed public HTTPS commands in independent OS-derived clean Expo 57 consumers; compile the exact displayed source and serve each real Web export.","seed_method":"cli","records":["Independent nativewind and uniwind consumers without monorepo source links","The actual quickstart-messages.ts entrypoint supplies N seed turns and an older named turn, recorded at startup","PromptInput is empty; marker ORI-CONT-003-<run-id> has not been submitted"]},"live_example":{"description":"Follow live-chat.md using verified app/server instructions; start the owned real backend and Web /live-chat screen, with provider credentials supplied only to the server.","seed_method":"cli","records":["Recorded candidate/source hashes and fresh run ID","Official OpenAI Responses endpoint with gpt-4.1-mini-2025-04-14","Fresh conversation has no ORI-CONT-003-<run-id> nonce; retain original README bytes for comparison"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"One tutorial with a named result and step outcomes","primary":false,"description":"GIVEN the actual candidate docs are built WHEN the learner opens /docs/quickstart and reads the guided sequence THEN one tutorial names its seed-data Expo Go result before step 1 and gives every step an observable result.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-content.spec.ts","test_function":"ORI-CONT-003-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-1","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","negative_control":{"would_fail_if":["The content is omitted from the build, leaving an empty shell","A named or per-step result is removed"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Open /docs/quickstart in the real browser; inspect tutorial inventory, intro and every numbered step."]},"end_state":{"must_observe":["HTTP 200 and exactly 1 published tutorial","Before step 1: 'scrolling message list', 'prompt input', 'Expo Go', 'seed data'","N >= 1 imperative 'we' steps; each ends with its own observable expected result"],"must_not_observe":["Empty tutorial or placeholder result","A second tutorial or a step with no expected result"]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Complete engine panels import the executable source","primary":false,"description":"GIVEN the learner has selected an engine through the existing installation-page control WHEN the learner opens Quickstart, reads every code panel, and deliberately switches engines THEN every block follows the selected engine and contains canonical commands plus complete imported sample source.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-content.spec.ts","test_function":"ORI-CONT-003-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-2","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build and preview at http://localhost:4321, repository source files, and a real Playwright browser","negative_control":{"would_fail_if":["Static panels are disconnected from engine selection","Commands or imported source are omitted or mismatched"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Select nativewind on /docs/installation; navigate to Quickstart and compare every displayed block with the real source files."]},"end_state":{"must_observe":["'nativewind' selection survives navigation","'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json' verbatim","All code, including 'quickstart-screen.tsx', belongs to engine panels and matches source hashes","Separate required 'Message' and composed 'PromptInput' installs"],"must_not_observe":["Empty panel or default engine replacing the selected engine","Un-tabbed code, wrong-engine commands or the unchanged string-callback index sample"]}},{"start_ref":"built_quickstart","action":{"actor":"user","steps":["Select uniwind, inspect all panels, navigate away and return."]},"end_state":{"must_observe":["'uniwind' selection survives navigation","'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json' verbatim","Complete 'uniwind' setup and source panels match input hashes and contain composed PromptInput children"],"must_not_observe":["Empty uniwind source or default nativewind selection","Inactive nativewind instructions displayed as selected"]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"The exact displayed seed lesson submits a real message","primary":false,"description":"GIVEN independent clean consumers run the exact source and commands displayed for each engine WHEN the learner scrolls the transcript and submits a fresh non-empty marker through PromptInput THEN each Web consumer appends the marker once, clears the input, and keeps its seeded transcript scrollable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-content.spec.ts","test_function":"ORI-CONT-003-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-3","test_tier":"e2e","verification_service":"Real built Quickstart, public HTTPS registry, RNR CLI, clean Expo 57 Web consumers, and a real Playwright browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Quickstart, public HTTPS registry, RNR CLI, clean Expo 57 Web consumers, and a real Playwright browser","negative_control":{"would_fail_if":["Submission is a no-op or treats PromptInputMessage as a string","The registry is mocked or the running source differs from displayed source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_seed_consumers","action":{"actor":"user","steps":["For both engines, install through the displayed public commands, compile the exact displayed source and run Expo doctor.","In each real Web consumer, scroll to the recorded seed turn and submit the fresh marker through Send message."]},"end_state":{"must_observe":["2 independent consumers install from 'https://rnraielements.com' and pass compiler and Expo checks","N+1 turns, including exactly 1 user turn 'ORI-CONT-003-<run-id>'","The 'PromptInput' clears; the older named seed turn remains scrollable"],"must_not_observe":["Empty or unchanged N-turn transcript after submission","Duplicate marker, synthesized assistant reply or retained input"]}},{"start_ref":"clean_seed_consumers","action":{"actor":"user","steps":["Attempt submission with the initially empty composer in each fresh consumer."]},"end_state":{"must_observe":["N >= 1 seed turns remain, including the recorded older turn","Composer stays empty and 0 blank user turns are added"],"must_not_observe":["Empty transcript replacing the seed list","Blank user bubble or canned answer"]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"The conclusion and run guide reach the real live example","primary":false,"description":"GIVEN the implemented example and backend are available with server-only credentials WHEN the learner follows the useChat-adjacent conclusion link and the run guide THEN the live screen streams a correlated provider response; the README retains its consumer and offline-route guidance.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/quickstart-content.spec.ts","test_function":"ORI-CONT-003-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-4","test_tier":"e2e","verification_service":"Real built Quickstart, apps/example /live-chat, the implemented server, official OpenAI Responses endpoint, and a real Playwright browser","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Quickstart, apps/example /live-chat, the implemented server, official OpenAI Responses endpoint, and a real Playwright browser","negative_control":{"would_fail_if":["The link opens a static/offline example","Provider responses are stubbed or instructions are disconnected from implementation"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"live_example","action":{"actor":"user","steps":["Follow the conclusion link beside useChat and the README link to docs/live-chat.md.","Verify instructions against the implemented app/server; execute the exact Web startup path.","Submit the nonce prompt on /live-chat, watch streaming and ask a follow-up without repeating the nonce.","Compare README preservation and inspect prerequisites, platform endpoints, expected response and failure remedies."]},"end_state":{"must_observe":["Resolving conclusion link beside 'useChat'; README link to 'docs/live-chat.md'","Actual '/live-chat' screen runs the app-owned useChat hook","At least 2 incremental observations before completion; final hash and request/response IDs match OpenAI server evidence","Follow-up recovers 'ORI-CONT-003-<run-id>' from history","'live-chat.md' is a run how-to with server-only variable names; original README consumer/offline guidance remains"],"must_not_observe":["Empty live screen, static answer or repository-link-only success","Second composition lesson, invented instruction, credential value or removed README guidance"]}},{"start_ref":"live_example","action":{"actor":"user","steps":["Stop only the proof-owned backend and submit another prompt; check the real failure against the documented remedy.","Restart using the guide and select Retry for the retained turn."]},"end_state":{"must_observe":["'/live-chat' reports a sanitized connection error during endpoint loss","'Retry' issues a fresh successful provider request with exactly 1 retained user turn"],"must_not_observe":["Empty success receipt or canned answer during service loss","Duplicate user turn or exposed credential"]}}]}},{"id":"TC-1","type":"test_criterion","description":"Exactly one rendered tutorial names all four outcome elements before step 1 and every numbered step ends with an observable result.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Both selected engine panels preserve the real preference, display the literal conversation commands, include all required installs, and match the executable source bytes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Both clean Web consumers compile the displayed source, append one non-empty marker, clear the composer, retain scrollable seed turns, and add no blank turn.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The linked run guide starts the real live screen, proves incremental contextual provider output and endpoint-loss recovery, protects credentials, and preserves README guidance.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts --grep ORI-CONT-003-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>
