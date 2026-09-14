# ORI-CONT-004: Verify the completed content path and bind its claims to real integration evidence

## What this does

Own the three complete DOCS flow tests and reconcile the seven docs pages, two supporting publications and 404 copy with current source and real integration evidence.

## Why

Readers must be able to follow the published commands and see each promised result. A resolving link or a passing static assertion cannot prove the live example.

## How to verify

After the real dependencies are ready, run these locked commands:

```sh
pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision
pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav
pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop
```

Require fresh public installations, both six-target seed/live matrices and source-bound captures. Product evidence remains planned. The read-only scenario validator returned exit 0 with four scenarios and zero findings.

## Scope

Correct only the allowlisted content and owned flow tests. Consume native/provider drivers and content gates; route their implementation failures to their assigned owners.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: techwriting-implementer · Reviewer: techwriting-reviewer
> Priority: P1 · Points: 3 · Type: FEATURE
> Dependency phase: Final content verification after every listed prerequisite; before post-integration journey acceptance
> Proposed By: techwriting-planner
> Co-authored By: astro-planner, react-native-reusables-planner, aisdk-planner, frontend-designer
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

### OUTCOME

Integrators complete the orientation and Quickstart paths, and every published technical claim matches current source or fresh native, browser and provider evidence.

### CRITICAL CONSTRAINTS

- Never replace real CLI, browser, native or provider behavior with mocks, view injection, copied registry sources, canned answers, static success, runtime skips or stale receipts.
- Keep credentials server-only; preserve shared WIP and reserved resources. Stop only owned processes and never alter deployment, policy, dependency pins or other owners' implementation files.
- Preserve exact locked test paths, grep tokens, commands, primary ownership and proof.red paths. RED must be an observed functional assertion failure on recorded source, never a missing server or test.
- Quickstart must await fresh public installs and both six-target seed/live matrices in this invocation, including the genuine NativeWind live consumer; missing required dependencies fail closed.
- Correct only allowlisted prose and owned flow tests. Keep registry UI separate from consumer model behavior and consume upstream proof drivers and content pipelines unchanged.

### DONE WHEN

- [ ] AC-1 and AC-2 prove orientation and theming in desktop, mobile and genuinely JavaScript-disabled projects.
- [ ] AC-3 proves fresh literal installs and all six seed plus six live targets, including active abort and real error recovery.
- [ ] AC-4 reconciles claims, boundary search, recovery copy and current content-gate evidence.
- [ ] Exact verification commands, typecheck, lint and relevant prior-sprint gates pass with captured seeded values.
- [ ] Only writeAllowed paths change, and independent reviewers accept the candidate evidence.

### RUNTIME COMMANDS

```text
test: the three exact commands in How to verify
typecheck: pnpm typecheck
lint: pnpm lint
prior logic lanes: pnpm exec vitest run tests/harness tests/sprint-01 tests/sprint-01-docs-spike-skeleton tests/sprint-02-shell-hero tests/sprint-03-family-browse tests/sprint-04-generated-reference
prior browser lanes: pnpm exec playwright test tests/sprint-01-docs-spike-skeleton tests/sprint-02-shell-hero tests/sprint-03-family-browse tests/sprint-04-generated-reference
```

PROGRESS: 0/4 acceptance criteria complete; every TDD_STATE is none.

### ACCEPTANCE CRITERIA

#### AC-1: Complete orientation and engine decision [PRIMARY]

GIVEN the current built docs and fresh browser storage WHEN an integrator follows Introduction, boundary, Installation, CLI, Theming and Dark mode THEN all named bodies, engine mappings and complete commands match the documented reader path.

```text
PRIMARY: true
FLOW_REF: FLOW-DOCS-01-getting-started-engine-decision
TEST_FILE: tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts
TEST_FUNCTION: FLOW-DOCS-01-getting-started-engine-decision
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision
TEST_TIER: e2e
VERIFICATION_SERVICE: Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json
RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red
MAPS_TO_AC: null
TDD_STATE: none
```

SCENARIO:

```json
{"id":"SC-ORI-CONT-004-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","negative_control":{"would_fail_if":["The docs are a static empty shell with shared-footer text but no authored page bodies.","Engine selection is disconnected, commands are hardcoded to one tree, or the no-JavaScript bodies are omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Open /docs/introduction, follow its boundary link, then traverse all five Getting started routes; capture statuses, final URLs and named bodies.","In chromium-desktop and chromium-mobile, select nativewind then uniwind through Installation tabs; read each entire conversation command inside its panel."]},"end_state":{"must_observe":["All 5 Getting started routes return 200 with substantive Introduction, Installation, CLI, Theming and Dark mode bodies.","Introduction opens with `universal AI chat and agent UI components for React Native`, `copy-paste registry` and `not an npm package`; its boundary link opens substantive ownership content.","Exactly 1 engine question and 1 engine-decision TabGroup map `Tailwind v4` + `@theme` to `uniwind`, and `NativeWind 4` + `Tailwind v3` to `nativewind`.","Each panel contains its full command: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` or `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","The `CLI` body explains absolute-URL add, consumer destinations and engine trees, with the authoritative RNR CLI reference link."],"must_not_observe":["Empty bodies containing only shared-footer keywords.","Commands outside their engine panels, duplicate questions or unchanged default-only engine selection."]}},{"start_ref":"built_orientation","action":{"actor":"user","steps":["In chromium-nojs, follow the same routes and read both labeled panels with JavaScript disabled."]},"end_state":{"must_observe":["All 5 route bodies and both labeled `nativewind`/`uniwind` panels retain complete `conversation.json` commands."],"must_not_observe":["Blank no-JavaScript bodies or hidden-only instructions with no readable command."]}}]}
```

#### AC-2: Theming reference and section navigation [PRIMARY]

GIVEN the rendered Theming reference WHEN an integrator reads its token table and follows section links and preserved anchors THEN paired values, scoped engine guidance and current interface descriptions remain readable across all three browser projects.

```text
PRIMARY: true
FLOW_REF: FLOW-DOCS-01-theming-and-section-nav
TEST_FILE: tests/sprint-05-orient-search/theming-and-section-nav.spec.ts
TEST_FUNCTION: FLOW-DOCS-01-theming-and-section-nav
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav
TEST_TIER: e2e
VERIFICATION_SERVICE: Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/run.json
RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/proof.red
MAPS_TO_AC: null
TDD_STATE: none
```

SCENARIO:

```json
{"id":"SC-ORI-CONT-004-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","negative_control":{"would_fail_if":["The TokenTable is a static shell, omits dark values or hardcodes the same --primary value in both columns.","Section navigation or preserved anchors are disconnected; the test accepts shared shell text as the reference."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read /docs/theming and its full token table in desktop/mobile; follow CLI and Dark mode section links and return.","Follow #textclasscontext and #rendermarkdown; compare descriptions against current registry interfaces and consumer theme sources."]},"end_state":{"must_observe":["`Theming`, `CLI` and `Dark mode` return 200 through actual section navigation.","The no-`tailwind.config.js` statement is scoped to Uniwind/Tailwind v4; consumer `@theme` is distinguished from docs CSS.","At least 10 token rows have usage text and paired `Light`/`Dark` values; at least 10 `oklch` values include distinct `--primary` pairs.","`#textclasscontext` and `#rendermarkdown` navigate to accurate current interface descriptions."],"must_not_observe":["Empty token rows, one value column, unchanged identical --primary values, or no section destinations."]}},{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read Theming's columns and follow its section/fragment links in chromium-nojs without enabling JavaScript."]},"end_state":{"must_observe":["`Light` and `Dark` columns, at least 10 `oklch` values, `#textclasscontext`, `#rendermarkdown`, `CLI` and `Dark mode` remain readable and navigable."],"must_not_observe":["Blank token cells or placeholder reference text without the paired values."]}}]}
```

#### AC-3: Literal Quickstart and fresh seed/live matrices [PRIMARY]

GIVEN fresh clean consumers, reserved targets and the real provider WHEN the locked Quickstart invocation follows the displayed tutorial and live guide THEN both engines pass all three seed and live targets with correlated fresh evidence.

```text
PRIMARY: true
FLOW_REF: FLOW-DOCS-02-quickstart-chat-screen
TEST_FILE: tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
TEST_FUNCTION: FLOW-DOCS-02-quickstart-chat-screen
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop
TEST_TIER: e2e
VERIFICATION_SERVICE: Built Astro preview, real RNR CLI and public rnraielements.com registry, clean Expo 57 consumers, iOS simulator, Android emulator, Web browser and official OpenAI Responses backend
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json
RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red
MAPS_TO_AC: null
TDD_STATE: none
```

SCENARIO:

```json
{"id":"SC-ORI-CONT-004-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real RNR CLI and public rnraielements.com registry, clean Expo 57 consumers, iOS simulator, Android emulator, Web browser and official OpenAI Responses backend","negative_control":{"would_fail_if":["The composer is a no-op, the exact source is disconnected from the installed consumer, or an engine/platform leg is omitted.","The live hook is a static stub or canned answer, follow-ups omit history, Stop does not abort, or Retry duplicates a turn.","The browser accepts hardcoded success or stale receipts instead of awaiting both real proof matrices."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_quickstart","action":{"actor":"user","steps":["Open /docs/quickstart, select nativewind and execute every literal displayed public command in a clean consumer; compile the exact displayed source and run Expo doctor.","Await RN-owned runQuickstartProof on iOS, Android and Web: scroll to an older named seed turn, enter ORI-CONT-004-<fresh-run-id> and press Send message; inspect both native appearances with the keyboard open.","Repeat the complete command/source/compiler/seed sequence in an independent uniwind consumer; await all six legs and compare source and registry hashes."]},"end_state":{"must_observe":["`/docs/quickstart` returns 200, names the scrolling seed-data list and working Expo Go composer before step 1, and states each step's expected result.","Exactly 1 tutorial has complete source and every engine-varying block for `nativewind` and `uniwind`; both public conversation commands run with `rnraielements.com` unchanged.","All 6 seed legs compile the displayed source, pass Expo checks and scroll to the older named seed turn.","`ORI-CONT-004-<fresh-run-id>` appears exactly 1 time per target; Send message clears the composer without synthesizing an assistant reply.","In both native appearances, `Send message` stays above the keyboard/gesture region beside a visible scrollable list; iOS screenshots are inspected and Android recordings captured."],"must_not_observe":["An empty transcript or unchanged composer after Send message.","A missing target, stale run receipt, copied registry source, host rewrite, or canned assistant response."]}},{"start_ref":"fresh_quickstart","action":{"actor":"user","steps":["Execute the conclusion's apps/example/docs/live-chat.md guide and launch /live-chat; include ORI-RN-005's genuine NativeWind consumer and Uniwind using the same app-owned useChat hook.","On all six live targets, send a fresh nonce prompt then a contextual follow-up without the nonce; observe incremental and completed text against server request/response IDs and hashes.","Press Stop generating during an active unfinished request. Stop only the owned endpoint, submit, restart and Retry. Obtain a real nonexistent-model rejection, restore gpt-4.1-mini-2025-04-14 and Retry.","Await fresh RN/AI proof in this invocation; reject missing legs or mismatched hashes. On every exit abort requests, stop only recorded children, remove owned Android mappings, restore appearance, close contexts and release reservations."]},"end_state":{"must_observe":["All 6 live targets show incremental and completed text correlated with real OpenAI request/response IDs, `gpt-4.1-mini-2025-04-14`, usage and final server text hashes.","All 6 contextual follow-ups recall the first nonce without repeating it in the follow-up prompt.","`Stop generating` aborts an active provider request on all 6 targets; actual endpoint loss and provider rejection yield sanitized errors.","`Retry` makes a successful real request after each recovery with exactly 1 copy of the retained user turn.","The locked `run.json` binds this invocation's 6 seed and 6 live records to source, public registry bytes, CLI/package versions, native captures and sanitized provider evidence."],"must_not_observe":["An empty or static assistant transcript, no provider correlation, or a finished stream presented as active abort.","Duplicate user turns, leaked credentials, missing NativeWind live legs, or prior-run evidence substituted for fresh execution."]}}]}
```

#### AC-4: Content claims, boundary search and recovery

GIVEN seven rendered docs pages, two supporting publications and the authored 404 copy WHEN the verifier reconciles claims against source and actual integration evidence THEN all claims have matching evidence, correct page quadrants and usable boundary and recovery links.

```text
PRIMARY: false
FLOW_REF: FLOW-DOCS-01-getting-started-engine-decision
TEST_FILE: tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts
TEST_FUNCTION: FLOW-DOCS-01-getting-started-engine-decision
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision
TEST_TIER: e2e
VERIFICATION_SERVICE: Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects plus real source files and current-invocation RN/AI evidence
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json
RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red
MAPS_TO_AC: null
TDD_STATE: none
```

SCENARIO:

```json
{"id":"SC-ORI-CONT-004-4","use_case_ref":"UC-DOCS-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects plus real source files and current-invocation RN/AI evidence","negative_control":{"would_fail_if":["The boundary search index is disconnected, the recovery page is a static placeholder, or technical claims have no source/runtime evidence.","The audit accepts an empty report, a stub live example or hardcoded passing gate labels."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read the seven rendered docs pages and two repository publications; reconcile quadrant, audience, opening scope, glossary, commands and expected results with standards and source.","In desktop/mobile search for transport and open the canonical boundary result; in chromium-nojs follow Introduction's boundary link and read the ownership tables.","Request /docs/ori-cont-004-missing, verify its real status and authored recovery copy, then follow its recovery link.","Map every substantive claim to source/hash or current-candidate runtime evidence in content-verification.md; reconcile the executed live guide and fresh Quickstart hashes, and consume real snippet/single-tutorial/dist-link outputs."]},"end_state":{"must_observe":["`content-verification.md` maps all claims across 7 docs pages, 2 publications and 404 copy to source/runtime evidence and records quadrant/audience checks.","Enhanced `transport` search opens `/docs/owns-vs-does-not-own`; its tables distinguish registry UI from consumer transport, streaming client and tool executor.","The boundary links to verified `apps/example/docs/live-chat.md`; executed `/live-chat` behavior matches current source and provider evidence.","`/docs/ori-cont-004-missing` returns 404 with authored recovery copy; its onward link returns 200 with the named destination body.","The real `snippet`, `single-tutorial` and `dist-link` outputs identify this candidate; displayed command/source hashes match fresh Quickstart evidence."],"must_not_observe":["Empty claim evidence, placeholder 404 copy, or a shared-footer-only ownership assertion.","A resolving example link with no executed live-guide evidence, duplicate boundary explanations, or stale native/provider receipts."]}}]}
```

### TEST CRITERIA

- **TC-1 → AC-1:** All five named orientation bodies, the canonical boundary link, one engine decision and both complete panel commands satisfy AC-1 in desktop/mobile and the genuine no-JavaScript reading floor.
  VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`
- **TC-2 → AC-2:** Theming contains at least ten paired token rows, distinct --primary values, scoped engine guidance and functioning section links and anchors in all three browser projects.
  VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav`
- **TC-3 → AC-3:** The locked Quickstart invocation executes fresh public installs and all six seed plus six live legs, verifies active abort and real error recovery, and rejects missing legs or stale hashes.
  VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`
- **TC-4 → AC-4:** The claim ledger covers the seven docs pages, two publications and 404 copy; actual boundary search/recovery and all required source/runtime and content-gate evidence satisfy AC-4.
  VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`

### FIXTURES

Shared fixtures are defined completely in the Requirement Contract below and referenced by start_ref in every case. built_orientation uses the real ordered build and owned preview. fresh_quickstart uses actual public CLI installs, displayed source and real seed/live screens. No view injection, mocked service, synthetic assistant response or copied registry source may seed a case.

### SCOPE

writeAllowed:

```text
apps/docs/src/content/docs/introduction.md
apps/docs/src/content/docs/installation.mdx
apps/docs/src/content/docs/cli.md
apps/docs/src/content/docs/theming.mdx
apps/docs/src/content/docs/dark-mode.md
apps/docs/src/content/docs/quickstart.mdx
apps/docs/src/content/docs/owns-vs-does-not-own.md
apps/docs/src/content/system/not-found.md
apps/example/docs/live-chat.md
apps/example/README.md
tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts
tests/sprint-05-orient-search/theming-and-section-nav.spec.ts
tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
tests/sprint-05-orient-search/evidence/content-verification.md
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/red.txt
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/run.json
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/red.txt
tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json
tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/red.txt
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red
tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/proof.red
tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red
```

writeProhibited:

```text
apps/docs/src/pages/**
apps/docs/src/components/**
apps/docs/src/layouts/**
apps/docs/src/styles/**
apps/docs/src/data/**
apps/example/app/**
apps/example/components/**
apps/example/hooks/**
apps/example/server/**
packages/**
scripts/**
public/**
.github/**
.spec/**
package.json
pnpm-lock.yaml
playwright.config.ts
tests/harness/**
Any file not explicitly listed in write_allowed
```

### BOUNDARIES

Always:

- Use exact locked flows and current-source evidence.
- Read every promised publication through its actual rendered or repository surface.
- Use real entrypoints and preserve genuine no-JavaScript behavior.
- Consume upstream drivers and gates; route implementation failures to their owners.
- Record failures and clean up only owned resources.

Ask First:

- Escalate any required change outside write_allowed or to a locked flow, provider, version or deployment contract.
- An unavailable required dependency blocks verification until its owner restores it; no fallback or reduced target matrix.

Never: the five critical constraints apply throughout.

### DELIVERABLE

- Corrected content in the seven docs entries, not-found copy and two example publications.
- Three complete locked Playwright flow tests, including explicit content/fallback cases.
- content-verification.md and the exact allowlisted per-flow run.json, proof.red and supplementary red.txt outputs. These are future artifacts. red.txt never replaces canonical proof.red.

### AGENT INSTRUCTIONS

1. **RED:** Author behavior assertions before prose corrections. Run the same locked flow against recorded source lacking the promised behavior. Capture the actual assertion failure, command output and source/lockfile/test/driver/policy hashes at proof.red. Missing services or test files are failed preconditions, not functional RED. Where a clause already works, consume upstream RED only if it proves that exact behavior and carries source identity.
2. **GREEN:** After RED is accepted, make minimal allowlisted content corrections and complete the owned flow tests. Await the RN/AI-owned real drivers. Route framework, native, provider, build and deployment failures to their owners.
3. **REFACTOR:** Refine only touched prose/tests when needed and rerun affected locked flows. Preserve all proof bindings and product scope.
4. **REVIEW:** Scan touched files for placeholders, skips, fake success and deferred required behavior. Submit the exact candidate and evidence to techwriting-reviewer with react-native-reusables-reviewer and aisdk-reviewer.

### READING LIST

1. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`, lines 1-38 [PRIMARY PATTERN]: glossary, page forms and source-backed content gates. This existing path supersedes the stale 10-technical-requirements pointer.
2. `.spec/prds/docs-site/04-uc-docs.md`, lines 19-77: orientation, single tutorial, expected results and canonical ownership boundary.
3. `tests/harness/docs-preview.ts`, lines 1-101: built-preview origin, ownership and navigation helpers; consume without editing.
4. `playwright.config.ts`, lines 1-40: actual desktop/mobile/nojs projects, serial execution and retries:0.
5. `apps/docs/src/pages/docs/theming.astro`, lines 1-93: existing Theming route and seam anchors; missing paired values/navigation must cause RED, not a false route-absence assertion.

### AUDIENCE, DESIGN AND REFERENCE GUIDANCE

Audience: integrators who know React Native and Expo and need to choose an engine, install this registry, build the seed screen and run the separate live example.

| Content | Quadrant | Reader outcome |
|---|---|---|
| introduction.md | explanation | Understand product identity, distribution and ownership. |
| installation.mdx | how-to | Choose the engine once from project facts and run complete commands. |
| cli.md | reference | Find registry-specific URL and consumer-destination facts. |
| theming.mdx | reference | Look up paired tokens, engine scope and current rendering seams. |
| dark-mode.md | how-to | Apply the documented procedure and recognize its result. |
| quickstart.mdx | tutorial | Build the single seed-data chat screen, then follow the live guide. |
| owns-vs-does-not-own.md | explanation | Distinguish registry UI from consumer model behavior. |
| not-found.md | how-to recovery fragment | Follow a useful action after an unknown route. |
| apps/example/docs/live-chat.md | how-to | Run the actual live screen, backend and provider. |
| apps/example/README.md | reference | Find the actual entrypoint and canonical run guide. |

Audit the completed ORI-VIS-001 through ORI-VIS-005 surfaces without changing layout, tokens or components. Use named bodies, table rows and labeled panels as observation targets. Generic roots may support waits but cannot establish success. Keep NativeWind 4/Tailwind v3 and Uniwind/Tailwind v4 facts aligned with the locked context; nativewind remains the engine value.

### BOUNDARY CONTRACTS

- Capture a real RED assertion against the source state missing the promised behavior; record source hashes and commands. A missing server or test file is not the behavior's RED proof.
- Use the built Astro preview and the real Playwright projects. Assert named page bodies and meaningful reader outcomes, not only status codes or shared-footer keywords.
- Exercise enhanced desktop and mobile behavior and the JavaScript-disabled reading floor. Do not skip a required assertion at runtime when its dependency is absent.
- Confirm the literal displayed command was run through the real CLI against rnraielements.com in a clean Expo consumer for each engine.
- Confirm the exact displayed screen source produced the promised seed-data interaction on iOS, Android, and Web.
- Read and execute the live-example run guide against the actual live route, hook, backend, and provider. Do not accept a hook file or a resolving repository link as complete integration evidence.
- Update the boundary's example link to the verified live run guide while preserving the distinction between consumer-owned model behavior and registry-owned UI.
- Consume the real snippet, single-tutorial, and dist-link gate results. This task does not reimplement those pipelines.
- Record each substantive technical claim with its source or runtime evidence. List an unavailable required dependency as a failed verification precondition.
- The final Quickstart flow awaits fresh seed and live proof from this invocation, including ORI-RN-005's genuine NativeWind live consumer. Run heavyweight six-target proof once in chromium-desktop; explicit content/fallback cases still run in chromium-mobile and chromium-nojs without changing or omitting the required native legs.

### CAPABILITIES AND CONTRACT EXCHANGE

Touches: CAP-DOCS-01.

Provides: three complete locked DOCS flow proofs; source-to-prose corrections; a claim ledger and current-candidate run records.

Consumes: ORI-CONT-001/002/003/005/006 content; ORI-AST-003/004/006/009 integration surfaces; ORI-RN-003 seed proof and ORI-RN-005 genuine NativeWind live proof; ORI-AI-002 provider evidence; ORI-CI-001/002 snippet, tutorial and link gates; ORI-VIS-001/002/003/004/005 visual surfaces. Transitive registry, package, native, provider and deployment prerequisites retain their named owners.

PRD references:

- `.spec/prds/docs-site/04-uc-docs.md`: UC-DOCS-01, UC-DOCS-02 and the canonical UC-DOCS-04 boundary content supporting this path.
- `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`.
- `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`: CAP-DOCS-01.

### EVIDENCE GATES

1. Verify source identity and required execution preconditions. Consume actual ordered registry/gallery/docs-data/snippet/Astro/Pagefind/link outputs. Preserve the compact context's complete verification_preconditions and their owners.
2. Record real functional RED at each canonical proof.red with exact commands and source hashes. Never accept missing infrastructure or an authored success flag.
3. Run the three unchanged locked commands. Run explicit Quickstart reading-floor cases separately:

```sh
pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep ORI-CONT-004-quickstart-reading-floor --project=chromium-mobile --project=chromium-nojs
```

4. Require run.json and content-verification.md to carry concrete current-run values and source/lockfile/dist/test/driver/policy hashes. Quickstart must await fresh clean public installs and both complete six-target matrices. Reject missing legs, changed hashes or prior-run receipts. Capture native/browser evidence through the existing owners' contracts, including inspected iOS screenshots, Android recordings and sanitized provider correlations.
5. Run typecheck, lint and relevant prior-sprint gates; verify changed paths are within writeAllowed. The orchestrator validates full-sprint flow coverage and post-integration journeys separately.

The complete precondition authority is `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-CONT-004.json`. VP-EXECUTION-SCOPE and VP-BUILD-AND-PROOF apply directly. Package availability, real provider access, server-only secrets, reserved ports/targets, normal public DNS/TLS, publication identity, hosted acceptance and cleanup remain required with their assigned owners. This task cannot replace those prerequisites or claim hosted acceptance from local evidence.

### CODING STANDARDS

- Use typed Playwright tests, real filesystem reads and real native/provider drivers. No mocked HTTP, renderer, filesystem or provider.
- Preserve retries:0 and genuinely JavaScript-disabled observations. Explicit project-specific content cases must not omit required native legs.
- Use OS-derived owned scratch roots outside the monorepo. Never hardcode /tmp, stash/reset shared WIP or bypass commit hooks.
- Follow the content standards: active voice, short sentences, defined acronyms, precise terminology and source-backed snippets. Use engine, engine tree, registry item, family, verdict, peers and dev client consistently.

### OUT OF SCOPE

- Framework, routing, island, search, token, layout or visual implementation repairs.
- Registry components, dependency upgrades, proof-driver or AI hook/backend implementation, and provider/model substitution.
- Pipeline rewrites, hosted-runner/workflow/protection changes, deployment or domain operations.
- Additional pages/tutorials, broader example/gallery remediation, or ORI-AST-010's post-integration journeys.

### CONTEXT

Current gap: a real Theming route and preserved seam anchors exist. Final authored-page, paired-token, navigation and complete integration evidence remain planned. Route presence cannot serve as proof of the missing behavior.

Success state: all three locked DOCS flows pass on the current candidate, and the claim ledger binds seven docs pages, two supporting publications and 404 copy to actual source and fresh runtime evidence.

Fixed sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The sprint retains 13 flows: 9 task flows and 4 journeys. AC-1, AC-2 and AC-3 are this task's sole primary proofs for its three locked flows. AC-4 supports the first flow. ORI-AST-010 owns the four journey proofs; this task returns none.

### REVIEW

techwriting-implementer owns prose correctness and reader-path tests. techwriting-reviewer checks claims, quadrant and glossary conformance. Additional reviewers react-native-reusables-reviewer and aisdk-reviewer assess the consumed integration evidence.

Must pass:

- Every AC has an executed real case, exact proof binding and functional RED with seeded captures.
- The three flows retain their commands and primary ownership; Quickstart proves fresh installs and all twelve seed/live legs.
- Named bodies, token pairs, commands and executed live-guide behavior match the prose.
- Content standards, boundary search and real 404 recovery pass; absent evidence fails closed.
- Write scope, source identity, server-only secrets and owned-resource cleanup hold.

Should verify:

- Each page serves its named audience and quadrant; only Quickstart is a tutorial.
- Glossary and engine facts stay consistent.
- No-JavaScript and native claims have evidence from their actual targets.
- The claim ledger records actual source/runtime bases rather than passing labels.

Verdict: APPROVED or NEEDS_FIXES. Findings identify the failed AC, concrete source/artifact location and required correction.

### DEPENDENCIES

Depends on: ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005, ORI-AST-003, ORI-AST-004, ORI-AST-006, ORI-AST-009, ORI-RN-003, ORI-AI-002, ORI-CI-001, ORI-CI-002, ORI-CONT-006, ORI-RN-005, ORI-VIS-001, ORI-VIS-002, ORI-VIS-003, ORI-VIS-004, ORI-VIS-005.

Blocks: ORI-AST-010 post-integration acceptance. Do not author these content files concurrently with prerequisite owners.

### PROVENANCE AND STATUS

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/techwriting-planner-absorb-prerequisites.json`; source task ORI-CONT-004. All functional RED, product runs and evidence artifacts are planned_output_not_observed. Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-004","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_orientation":{"description":"Use the real ordered registry/gallery/docs-data/snippet/Astro/Pagefind/link build entrypoints, then serve current dist at owned http://localhost:4321. Open fresh browsers with empty storage and each project's actual JavaScript setting.","seed_method":"cli","records":["Candidate source, lockfile, dist, test, surface-policy and coldboot-policy hashes plus a fresh run ID.","Seven authored routes: /docs/introduction, /docs/installation, /docs/cli, /docs/theming, /docs/dark-mode, /docs/quickstart, /docs/owns-vs-does-not-own.","Engine values nativewind and uniwind; public conversation URLs https://rnraielements.com/r/nativewind/conversation.json and https://rnraielements.com/r/uniwind/conversation.json.","Search query transport and absent route /docs/ori-cont-004-missing; authored recovery source apps/docs/src/content/system/not-found.md.","Read real apps/example/docs/live-chat.md and apps/example/README.md from the same candidate; record their hashes."]},"fresh_quickstart":{"description":"During the locked Quickstart invocation, RN-owned CLI drivers create independent nativewind and uniwind Expo 57 consumers outside the monorepo from literal displayed public commands/source; launch actual seed/live screens on reserved native targets and Web.","seed_method":"cli","records":["Ordinary public DNS and trusted HTTPS serve corrected registry bytes; no copied registry files or monorepo source links enter either consumer.","Reserve RNR_S05_IOS_UDID, RNR_S05_ANDROID_SERIAL and exact owned Metro/Web/backend ports; record each target and child process identity.","Retain the displayed tutorial's actual named seed turns and source hash; enter marker ORI-CONT-004-<fresh-run-id> through Send message, never through view injection.","For each of nativewind/uniwind x iOS/Android/Web, begin the live screen with zero user turns; enter a fresh nonce through the composer and a contextual follow-up that omits the nonce.","Use the real app-owned useChat hook and server-only official OpenAI Responses backend with gpt-4.1-mini-2025-04-14; record actual resolved SDK versions and sanitized request evidence."]}},"requirements":[{"id":"AC-1","name":"Complete orientation and engine decision","type":"acceptance_criterion","primary":true,"description":"GIVEN the current built docs and fresh browser storage WHEN an integrator follows Introduction, boundary, Installation, CLI, Theming and Dark mode THEN all named bodies, engine mappings and complete commands match the documented reader path.","flow_ref":"FLOW-DOCS-01-getting-started-engine-decision","test_file":"tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts","test_function":"FLOW-DOCS-01-getting-started-engine-decision","verify":"pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-004-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","negative_control":{"would_fail_if":["The docs are a static empty shell with shared-footer text but no authored page bodies.","Engine selection is disconnected, commands are hardcoded to one tree, or the no-JavaScript bodies are omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Open /docs/introduction, follow its boundary link, then traverse all five Getting started routes; capture statuses, final URLs and named bodies.","In chromium-desktop and chromium-mobile, select nativewind then uniwind through Installation tabs; read each entire conversation command inside its panel."]},"end_state":{"must_observe":["All 5 Getting started routes return 200 with substantive Introduction, Installation, CLI, Theming and Dark mode bodies.","Introduction opens with `universal AI chat and agent UI components for React Native`, `copy-paste registry` and `not an npm package`; its boundary link opens substantive ownership content.","Exactly 1 engine question and 1 engine-decision TabGroup map `Tailwind v4` + `@theme` to `uniwind`, and `NativeWind 4` + `Tailwind v3` to `nativewind`.","Each panel contains its full command: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` or `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","The `CLI` body explains absolute-URL add, consumer destinations and engine trees, with the authoritative RNR CLI reference link."],"must_not_observe":["Empty bodies containing only shared-footer keywords.","Commands outside their engine panels, duplicate questions or unchanged default-only engine selection."]}},{"start_ref":"built_orientation","action":{"actor":"user","steps":["In chromium-nojs, follow the same routes and read both labeled panels with JavaScript disabled."]},"end_state":{"must_observe":["All 5 route bodies and both labeled `nativewind`/`uniwind` panels retain complete `conversation.json` commands."],"must_not_observe":["Blank no-JavaScript bodies or hidden-only instructions with no readable command."]}}]}},{"id":"AC-2","name":"Theming reference and section navigation","type":"acceptance_criterion","primary":true,"description":"GIVEN the rendered Theming reference WHEN an integrator reads its token table and follows section links and preserved anchors THEN paired values, scoped engine guidance and current interface descriptions remain readable across all three browser projects.","flow_ref":"FLOW-DOCS-01-theming-and-section-nav","test_file":"tests/sprint-05-orient-search/theming-and-section-nav.spec.ts","test_function":"FLOW-DOCS-01-theming-and-section-nav","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-theming-and-section-nav/proof.red","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-004-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects","negative_control":{"would_fail_if":["The TokenTable is a static shell, omits dark values or hardcodes the same --primary value in both columns.","Section navigation or preserved anchors are disconnected; the test accepts shared shell text as the reference."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read /docs/theming and its full token table in desktop/mobile; follow CLI and Dark mode section links and return.","Follow #textclasscontext and #rendermarkdown; compare descriptions against current registry interfaces and consumer theme sources."]},"end_state":{"must_observe":["`Theming`, `CLI` and `Dark mode` return 200 through actual section navigation.","The no-`tailwind.config.js` statement is scoped to Uniwind/Tailwind v4; consumer `@theme` is distinguished from docs CSS.","At least 10 token rows have usage text and paired `Light`/`Dark` values; at least 10 `oklch` values include distinct `--primary` pairs.","`#textclasscontext` and `#rendermarkdown` navigate to accurate current interface descriptions."],"must_not_observe":["Empty token rows, one value column, unchanged identical --primary values, or no section destinations."]}},{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read Theming's columns and follow its section/fragment links in chromium-nojs without enabling JavaScript."]},"end_state":{"must_observe":["`Light` and `Dark` columns, at least 10 `oklch` values, `#textclasscontext`, `#rendermarkdown`, `CLI` and `Dark mode` remain readable and navigable."],"must_not_observe":["Blank token cells or placeholder reference text without the paired values."]}}]}},{"id":"AC-3","name":"Literal Quickstart and fresh seed/live matrices","type":"acceptance_criterion","primary":true,"description":"GIVEN fresh clean consumers, reserved targets and the real provider WHEN the locked Quickstart invocation follows the displayed tutorial and live guide THEN both engines pass all three seed and live targets with correlated fresh evidence.","flow_ref":"FLOW-DOCS-02-quickstart-chat-screen","test_file":"tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts","test_function":"FLOW-DOCS-02-quickstart-chat-screen","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop","test_tier":"e2e","verification_service":"Built Astro preview, real RNR CLI and public rnraielements.com registry, clean Expo 57 consumers, iOS simulator, Android emulator, Web browser and official OpenAI Responses backend","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-004-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real RNR CLI and public rnraielements.com registry, clean Expo 57 consumers, iOS simulator, Android emulator, Web browser and official OpenAI Responses backend","negative_control":{"would_fail_if":["The composer is a no-op, the exact source is disconnected from the installed consumer, or an engine/platform leg is omitted.","The live hook is a static stub or canned answer, follow-ups omit history, Stop does not abort, or Retry duplicates a turn.","The browser accepts hardcoded success or stale receipts instead of awaiting both real proof matrices."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_quickstart","action":{"actor":"user","steps":["Open /docs/quickstart, select nativewind and execute every literal displayed public command in a clean consumer; compile the exact displayed source and run Expo doctor.","Await RN-owned runQuickstartProof on iOS, Android and Web: scroll to an older named seed turn, enter ORI-CONT-004-<fresh-run-id> and press Send message; inspect both native appearances with the keyboard open.","Repeat the complete command/source/compiler/seed sequence in an independent uniwind consumer; await all six legs and compare source and registry hashes."]},"end_state":{"must_observe":["`/docs/quickstart` returns 200, names the scrolling seed-data list and working Expo Go composer before step 1, and states each step's expected result.","Exactly 1 tutorial has complete source and every engine-varying block for `nativewind` and `uniwind`; both public conversation commands run with `rnraielements.com` unchanged.","All 6 seed legs compile the displayed source, pass Expo checks and scroll to the older named seed turn.","`ORI-CONT-004-<fresh-run-id>` appears exactly 1 time per target; Send message clears the composer without synthesizing an assistant reply.","In both native appearances, `Send message` stays above the keyboard/gesture region beside a visible scrollable list; iOS screenshots are inspected and Android recordings captured."],"must_not_observe":["An empty transcript or unchanged composer after Send message.","A missing target, stale run receipt, copied registry source, host rewrite, or canned assistant response."]}},{"start_ref":"fresh_quickstart","action":{"actor":"user","steps":["Execute the conclusion's apps/example/docs/live-chat.md guide and launch /live-chat; include ORI-RN-005's genuine NativeWind consumer and Uniwind using the same app-owned useChat hook.","On all six live targets, send a fresh nonce prompt then a contextual follow-up without the nonce; observe incremental and completed text against server request/response IDs and hashes.","Press Stop generating during an active unfinished request. Stop only the owned endpoint, submit, restart and Retry. Obtain a real nonexistent-model rejection, restore gpt-4.1-mini-2025-04-14 and Retry.","Await fresh RN/AI proof in this invocation; reject missing legs or mismatched hashes. On every exit abort requests, stop only recorded children, remove owned Android mappings, restore appearance, close contexts and release reservations."]},"end_state":{"must_observe":["All 6 live targets show incremental and completed text correlated with real OpenAI request/response IDs, `gpt-4.1-mini-2025-04-14`, usage and final server text hashes.","All 6 contextual follow-ups recall the first nonce without repeating it in the follow-up prompt.","`Stop generating` aborts an active provider request on all 6 targets; actual endpoint loss and provider rejection yield sanitized errors.","`Retry` makes a successful real request after each recovery with exactly 1 copy of the retained user turn.","The locked `run.json` binds this invocation's 6 seed and 6 live records to source, public registry bytes, CLI/package versions, native captures and sanitized provider evidence."],"must_not_observe":["An empty or static assistant transcript, no provider correlation, or a finished stream presented as active abort.","Duplicate user turns, leaked credentials, missing NativeWind live legs, or prior-run evidence substituted for fresh execution."]}}]}},{"id":"AC-4","name":"Content claims, boundary search and recovery","type":"acceptance_criterion","primary":false,"description":"GIVEN seven rendered docs pages, two supporting publications and the authored 404 copy WHEN the verifier reconciles claims against source and actual integration evidence THEN all claims have matching evidence, correct page quadrants and usable boundary and recovery links.","flow_ref":"FLOW-DOCS-01-getting-started-engine-decision","test_file":"tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts","test_function":"FLOW-DOCS-01-getting-started-engine-decision","verify":"pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects plus real source files and current-invocation RN/AI evidence","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-004-4","use_case_ref":"UC-DOCS-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview at http://localhost:4321 with real Playwright chromium-desktop, chromium-mobile and chromium-nojs projects plus real source files and current-invocation RN/AI evidence","negative_control":{"would_fail_if":["The boundary search index is disconnected, the recovery page is a static placeholder, or technical claims have no source/runtime evidence.","The audit accepts an empty report, a stub live example or hardcoded passing gate labels."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_orientation","action":{"actor":"user","steps":["Read the seven rendered docs pages and two repository publications; reconcile quadrant, audience, opening scope, glossary, commands and expected results with standards and source.","In desktop/mobile search for transport and open the canonical boundary result; in chromium-nojs follow Introduction's boundary link and read the ownership tables.","Request /docs/ori-cont-004-missing, verify its real status and authored recovery copy, then follow its recovery link.","Map every substantive claim to source/hash or current-candidate runtime evidence in content-verification.md; reconcile the executed live guide and fresh Quickstart hashes, and consume real snippet/single-tutorial/dist-link outputs."]},"end_state":{"must_observe":["`content-verification.md` maps all claims across 7 docs pages, 2 publications and 404 copy to source/runtime evidence and records quadrant/audience checks.","Enhanced `transport` search opens `/docs/owns-vs-does-not-own`; its tables distinguish registry UI from consumer transport, streaming client and tool executor.","The boundary links to verified `apps/example/docs/live-chat.md`; executed `/live-chat` behavior matches current source and provider evidence.","`/docs/ori-cont-004-missing` returns 404 with authored recovery copy; its onward link returns 200 with the named destination body.","The real `snippet`, `single-tutorial` and `dist-link` outputs identify this candidate; displayed command/source hashes match fresh Quickstart evidence."],"must_not_observe":["Empty claim evidence, placeholder 404 copy, or a shared-footer-only ownership assertion.","A resolving example link with no executed live-guide evidence, duplicate boundary explanations, or stale native/provider receipts."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All five named orientation bodies, the canonical boundary link, one engine decision and both complete panel commands satisfy AC-1 in desktop/mobile and the genuine no-JavaScript reading floor.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Theming contains at least ten paired token rows, distinct --primary values, scoped engine guidance and functioning section links and anchors in all three browser projects.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theming-and-section-nav.spec.ts --grep FLOW-DOCS-01-theming-and-section-nav","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The locked Quickstart invocation executes fresh public installs and all six seed plus six live legs, verifies active abort and real error recovery, and rejects missing legs or stale hashes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The claim ledger covers the seven docs pages, two publications and 404 copy; actual boundary search/recovery and all required source/runtime and content-gate evidence satisfy AC-4.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision","maps_to_ac":"AC-4"}]}
-->
</details>
