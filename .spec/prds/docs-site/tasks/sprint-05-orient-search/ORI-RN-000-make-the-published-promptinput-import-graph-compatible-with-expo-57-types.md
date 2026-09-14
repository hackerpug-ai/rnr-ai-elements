# ORI-RN-000: Make the published PromptInput import graph compatible with Expo 57 types

## What this does

Both shipped PromptInput mappers accept Expo 57 image-picker assets while preserving attachment mapping and generated registry freshness.

## Why

ImagePickerAssetShape requires fileName, mimeType, and fileSize; the actual Expo 57 SDK permits omission, so the consumer compilation fails. This blocks the public installation prerequisite for the existing Quickstart.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts`, then `pnpm registry:build` and `pnpm check:registry`. Inspect actual SDK diagnostics and both emitted mapper hashes. Native and public-domain proof belongs to downstream tasks.

## Scope

One mapper type, its two generated PromptInput JSONs, the focused test/helper, and bounded evidence. This is a 2-point FIX.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

Status: Backlog
Assignee: react-native-reusables-implementer
Priority: P1
Points: 2
Type: FIX
Dependency phase: A: no predecessors
Proposed By: react-native-reusables-planner
Co-authored By: none
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)
Planned date: 2026-09-14
Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROGRESS: Not started; all four AC TDD_STATE values are none.

## Outcome

Both shipped PromptInput mappers accept Expo 57 image-picker assets while preserving attachment mapping and generated registry freshness.

## Critical constraints

- Use the real Expo 57 SDK and TypeScript compiler. Never replace declarations, cast away incompatibility, suppress diagnostics, or mock the compiler.
- Keep the change to mapper type compatibility and generated PromptInput artifacts. Preserve runtime mapping, nullish fallbacks, and engine-agnostic source.
- Generate public JSON through the real registry build. Never hand-edit content or patch a consumer after installation to conceal a shipped defect.
- Use the assigned isolated worktree and owned scratch roots; preserve shared WIP. Never stash, reset, clean, broadly stage, or run trunk lifecycle operations.
- Do not claim public deployment, native behavior, or the complete Quickstart flow from this FIX. ORI-DEP-001 and the downstream proof owners supply those results.

## Done when

- [ ] AC-1: GIVEN the real Expo 57 ImagePickerAsset type WHEN the compiler checks assets.map(imageAssetToAttachment) against production source THEN the SDK asset is accepted without casts or replacement declarations.
- [ ] AC-2: GIVEN the real registry manifest and corrected source WHEN registry:build emits nativewind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and accepts the real SDK asset.
- [ ] AC-3: GIVEN the real registry manifest and corrected source WHEN registry:build emits uniwind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and registry freshness passes.
- [ ] AC-4: GIVEN full, omitted, and null metadata inputs WHEN the production mapper processes each input THEN filename, media type, URI, size, and generated identity retain the existing mapping and fallbacks.
- [ ] All verification gates pass and only write-allowed files changed.

## Specification

Correct the mapper parameter type to accept the actual Expo 57 ImagePickerAsset optional fileName, mimeType, and fileSize fields. Preserve the existing runtime mapping and nullish fallbacks. The published PromptInput module imports this mapper even when the tutorial exposes no attachment controls, so its type error prevents the required clean consumer from compiling. Rebuild both engine artifacts from source. Do not use an ambient declaration, cast, compiler suppression, or consumer patch to hide the mismatch.

Current gap: ImagePickerAssetShape requires fileName, mimeType, and fileSize; the actual Expo 57 SDK permits omission, so the consumer compilation fails.

Success state: Production and both emitted mapper modules compile against the real Expo 57 type; runtime fallbacks are unchanged and generated artifacts are fresh.

## Acceptance criteria

All requirements below are task-owned FIX proofs. They use flow_ref:null and do not take PRIMARY ownership of the Quickstart flow. Each JSON proof supplies the exact human-readable proof fields and complete Scenario Contract.

### AC-1

GIVEN the real Expo 57 ImagePickerAsset type WHEN the compiler checks assets.map(imageAssetToAttachment) against production source THEN the SDK asset is accepted without casts or replacement declarations.

```json
{"primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-1-real-sdk","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-1-real-sdk","test_tier":"integration","verification_service":"Real Expo 57 expo-image-picker package and TypeScript 6.0.3 compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real Expo 57 expo-image-picker package and TypeScript 6.0.3 compiler","negative_control":{"would_fail_if":["the production type stays disconnected from the real SDK by retaining required metadata fields or replacing the SDK declaration"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Run the actual compiler on a function accepting ImagePickerAsset[] and returning assets.map(imageAssetToAttachment)."]},"end_state":{"must_observe":["ImagePickerAsset resolves from the installed expo-image-picker package; all 3 optional metadata fields are accepted."],"must_not_observe":["An empty compatibility proof with 0 real SDK type references, or TS2345 or TS2322 caused by fileName, mimeType, or fileSize optionality."]}}]}}
```

### AC-2

GIVEN the real registry manifest and corrected source WHEN registry:build emits nativewind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and accepts the real SDK asset.

```json
{"primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-2-nativewind-artifact","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-2-nativewind-artifact","test_tier":"integration","verification_service":"Real registry build CLI, filesystem, Expo 57 package, and TypeScript compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real registry build CLI, filesystem, Expo 57 package, and TypeScript compiler","negative_control":{"would_fail_if":["the emitted nativewind item is empty, stale, or disconnected from production source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Run pnpm registry:build, read public/r/nativewind/prompt-input.json, materialize its actual mapper content in scratch, and compile it against the real SDK."]},"end_state":{"must_observe":["nativewind prompt-input.json contains the production mapper at target components/ai/prompt-input.logic.ts with matching SHA-256 and accepts all 3 optional metadata fields."],"must_not_observe":["Empty mapper content (0 bytes), or a stale nativewind mapper with required metadata fields."]}}]}}
```

### AC-3

GIVEN the real registry manifest and corrected source WHEN registry:build emits uniwind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and registry freshness passes.

```json
{"primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-3-uniwind-artifact","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-3-uniwind-artifact","test_tier":"integration","verification_service":"Real registry build and freshness CLIs, filesystem, Expo 57 package, and TypeScript compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real registry build and freshness CLIs, filesystem, Expo 57 package, and TypeScript compiler","negative_control":{"would_fail_if":["the uniwind artifact is static stale output or the freshness check is disconnected from the generated files"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Read the actual uniwind PromptInput mapper after registry:build, compile it against the real SDK, then run pnpm check:registry; prove the freshness check rejects an isolated stale mapper before rebuilding."]},"end_state":{"must_observe":["uniwind prompt-input.json contains target components/ai/prompt-input.logic.ts matching production SHA-256; both engine artifacts pass the real freshness comparison."],"must_not_observe":["Empty uniwind mapper content (0 bytes), or a stale artifact accepted by the freshness check."]}}]}}
```

### AC-4

GIVEN full, omitted, and null metadata inputs WHEN the production mapper processes each input THEN filename, media type, URI, size, and generated identity retain the existing mapping and fallbacks.

```json
{"primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-4-mapping-preserved","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-4-mapping-preserved","test_tier":"unit","verification_service":"Production imageAssetToAttachment export; pure value transformation","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"unit_test_justified":"This dependency-free mapper performs only a value transformation. Direct production calls prove its outputs; AC-1 through AC-3 exercise the real SDK and registry pipeline.","scenario":{"primary":false,"test_tier":"unit","tier":"visible","verification_service":"Production imageAssetToAttachment export; pure value transformation","unit_test_justified":"Pure production value transformation; real dependency and emitted-artifact integration are separately required.","negative_control":{"would_fail_if":["the mapper is stubbed to return an empty record or its nullish filename fallback is removed"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"mapper_inputs","action":{"actor":"api_client","steps":["Call the actual export for full metadata and for omitted/null metadata; compare output fields and generated nonempty IDs."]},"end_state":{"must_observe":["Full metadata maps to filename=photo.png, mediaType=image/png, url=file://photo.png, size=2048.","Omitted/null metadata maps to filename=Image, mediaType='', url=file://photo.png, size=undefined, with a generated pi- identity."],"must_not_observe":["The input object returned unchanged, a constant empty record, or literal undefined used as the filename."]}}]}}
```

## Test criteria

- TC-1 → AC-1: The source compiler proof uses the actual Expo 57 package and accepts its optional metadata fields. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-1-real-sdk`
- TC-2 → AC-2: The nativewind emitted mapper matches production source and compiles against the actual Expo 57 package. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-2-nativewind-artifact`
- TC-3 → AC-3: The uniwind emitted mapper matches production source, compiles, and the freshness check rejects isolated stale output. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-3-uniwind-artifact`
- TC-4 → AC-4: The real mapper returns the expected full-metadata values and omitted/null fallbacks without changing its runtime contract. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-4-mapping-preserved`

## Shared fixtures

```json
{"sdk57_workspace":{"description":"Owned scratch checkout with the production mapper, real registry manifest, Expo 57 dependency resolution, and TypeScript 6.0.3.","seed_method":"cli","records":["Expo 57 installs the actual expo-image-picker package through npx expo install.","The real SDK exports ImagePickerAsset with optional fileName, mimeType, and fileSize.","The registry build emits nativewind and uniwind PromptInput items."]},"mapper_inputs":{"description":"Representative arguments passed directly to the production imageAssetToAttachment export; these are pure function inputs, not simulated picker results.","seed_method":"public_api","records":["Full input: uri=file://photo.png, fileName=photo.png, mimeType=image/png, fileSize=2048.","Boundary inputs: uri=file://photo.png with metadata fields omitted, or explicitly null."]}}
```

The SDK fixture uses real CLI installation and files. Mapper records are inputs to the actual exported pure function; they do not simulate an external picker or service. No view injection, mocked filesystem, mocked HTTP, provider stub, or canned success is permitted.

## Scope and deliverables

Write allowed:

- packages/registry/src/components/ai/prompt-input.logic.ts
- public/r/nativewind/prompt-input.json
- public/r/uniwind/prompt-input.json
- tests/sprint-05-orient-search/prompt-input-sdk57.test.ts
- tests/sprint-05-orient-search/support/verify-prompt-input-sdk57.ts
- tests/sprint-05-orient-search/evidence/ORI-RN-000/
- tests/sprint-05-orient-search/evidence/ORI-RN-000/real-sdk-red.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-000/real-sdk-green.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-000/registry-hashes.json

Write prohibited:

- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- packages/registry/types/**
- packages/registry/registry.json
- .github/**
- .spec/**
- Any path not explicitly allowed above.

Deliver the compatible mapper first, then its generated engine files, followed by the focused test/helper and captured evidence. The two JSONs must be generated, not hand-edited.

## Boundaries and guardrails

Always:

- Write and run the real failing SDK contract before the source correction; record actual diagnostics.
- Bind evidence to the candidate SHA, commands, resolved package paths/versions, and source/artifact hashes.
- Use real temporary files and teardown only owned scratch roots and processes.
- Keep all unlisted paths read-only and inspect any generated diff outside the two permitted JSON files.

Ask first:

- Expand source/dependency/registry-manifest scope beyond the listed files.
- Change runtime attachment behavior or replace the locked downstream verification.

Boundary contracts:

- ORI-DEP-001 must deploy artifacts containing this correction before ORI-RN-001 verifies public installation.
- The mapper already uses nullish fallback expressions. This task changes the accepted SDK type, not attachment behavior or the tutorial's feature set.
- The clean consumer must not receive a post-install edit that makes a broken published artifact appear valid.

## Agent instructions

1. For AC-1, write the SDK compatibility test first and capture the actual optional-field failure against unchanged production source.
2. After RED is verified, widen only the mapper parameter's optional metadata fields; keep its runtime body unchanged.
3. For AC-2 and AC-3, compile the real emitted mapper source and prove stale output is rejected before regenerating the authorized artifacts.
4. For AC-4, call the real mapper with the shared cases. If the invariant already passes, prove sensitivity using an isolated removed-fallback mutation, then restore it; do not mislabel that mutation as the original defect.
5. Run focused tests, registry build/freshness, typecheck, lint, and scope checks; request independent domain review against the resulting candidate.

Follow /Users/justinrich/Projects/brain/docs/TDD-METHODOLOGY.md. Review validates the exact candidate independently. Commit only the validated task unit on its assigned branch; the orchestrator owns integration.

## Reading list

1. packages/registry/src/components/ai/prompt-input.logic.ts:60-84 [PRIMARY PATTERN] — SDK-facing type and unchanged nullish mapper.
2. packages/registry/scripts/build-registry.ts:100-169 — Real dual-engine generation and source embedding.
3. scripts/check-registry-fresh.ts:1-91 — Read-only generated-file comparison and stale-output rejection.
4. tests/prompt-input.test.ts:173-245 — Existing direct production mapper assertions; no mocked SDK.
5. /Users/justinrich/Projects/brain/docs/kanban/SCENARIO-CONTRACT-V1.md — Shared fixtures, non-degenerate oracles, and captured negative controls.

## Design and coding standards

No visual design or theme change. Keep registry source engine-agnostic; the two engine artifacts use the same mapper.

- Follow AGENTS.md and TypeScript strictness; keep the mapper dependency-free.
- Resolve RN/Expo packages through Expo 57 in isolated scratch only; do not change workspace dependency pins.
- Do not introduce any, assertion casts, ts-ignore, replacement modules, test-only production seams, or skipped checks.

## Verification gates

1. `pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts`
2. `pnpm registry:build`
3. `pnpm check:registry`
4. `pnpm typecheck`
5. `pnpm lint`

Run the four per-AC commands above during RED/GREEN cycles. Missing SDK dependencies or compiler failures fail closed. Scope verification must compare changed paths with write_allowed. The build may regenerate its tree, but any unrelated generated diff is not silently authorized.

## Evidence gates

- Record the actual source compatibility failure in real-sdk-red.txt and the exact same compiler proof after correction in real-sdk-green.txt.
- Capture both engine artifact hashes and real compiler/freshness results in registry-hashes.json.
- For the already-working mapping invariant, record a scratch-only removed-fallback negative control as sensitivity evidence, not as the original defect.
- Run scenario/requirement validation on the rendered contract and retain exact human/machine proof parity.
- All listed evidence paths are planned outputs, not existing proof.

Planned evidence paths:

- tests/sprint-05-orient-search/evidence/ORI-RN-000/real-sdk-red.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-000/real-sdk-green.txt
- tests/sprint-05-orient-search/evidence/ORI-RN-000/registry-hashes.json

Verification policy:

```json
{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true}
```

## Review

Agent rationale: The RNR implementer owns registry source, engine fan-out, and real Expo consumer compatibility; the RNR reviewer validates that the published files carry the actual fix.

Must pass:

- Actual original SDK type incompatibility is recorded RED before the change.
- All four exact tests and the real registry build/freshness gates pass.
- Both emitted modules are checked against the installed SDK, not a reconstructed interface.
- The mapping regression proof calls production code and detects a removed fallback.
- Only authorized source, generated artifacts, tests, and planned evidence change.

Should verify:

- No runtime mapper change hides inside the type correction.
- Evidence records installed SDK/compiler versions and both artifact hashes.
- No claimed native, public deployment, or whole-example proof exceeds this task.

Verdict: APPROVED or NEEDS_FIXES, supported by exact commands, source locations, and captured outputs.

## Dependencies and handoff

Depends on: none.
Blocks: ORI-DEP-001, ORI-RN-001, ORI-RN-004.
Provides: Expo-57-compatible PromptInput artifacts for ORI-DEP-001 and ORI-RN-001.
Consumes: Actual Expo 57 ImagePickerAsset type and TypeScript 6.0.3 compiler; Production mapper source, real registry manifest, registry build CLI, and freshness CLI.
Capability: CAP-DOCS-01.
PRD references:

- .spec/prds/docs-site/04-uc-docs.md#uc-docs-02-build-a-chat-screen-with-the-single-quickstart-tutorial
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md

Supports gate step 3 and FLOW-DOCS-02-quickstart-chat-screen; ORI-CONT-004 remains its sole PRIMARY owner. This FIX owns no locked flow.

Provenance: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/react-native-reusables-planner-absorb-prerequisites.json; source task ORI-RN-000; no co-authors; no superseded tasks.

## Out of scope

- Public deployment and DNS, owned by ORI-DEP-001.
- Full clean-consumer install and native/Web Quickstart execution, owned by ORI-RN-001/002/003 and ORI-CONT-004.
- Live example/provider integration and unrelated apps/example type errors.
- Registry dependency metadata, new attachment behavior, engine-specific logic, dependency upgrades, and visual changes.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-RN-000","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"sdk57_workspace":{"description":"Owned scratch checkout with the production mapper, real registry manifest, Expo 57 dependency resolution, and TypeScript 6.0.3.","seed_method":"cli","records":["Expo 57 installs the actual expo-image-picker package through npx expo install.","The real SDK exports ImagePickerAsset with optional fileName, mimeType, and fileSize.","The registry build emits nativewind and uniwind PromptInput items."]},"mapper_inputs":{"description":"Representative arguments passed directly to the production imageAssetToAttachment export; these are pure function inputs, not simulated picker results.","seed_method":"public_api","records":["Full input: uri=file://photo.png, fileName=photo.png, mimeType=image/png, fileSize=2048.","Boundary inputs: uri=file://photo.png with metadata fields omitted, or explicitly null."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real Expo 57 ImagePickerAsset type WHEN the compiler checks assets.map(imageAssetToAttachment) against production source THEN the SDK asset is accepted without casts or replacement declarations.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-1-real-sdk","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-1-real-sdk","test_tier":"integration","verification_service":"Real Expo 57 expo-image-picker package and TypeScript 6.0.3 compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real Expo 57 expo-image-picker package and TypeScript 6.0.3 compiler","negative_control":{"would_fail_if":["the production type stays disconnected from the real SDK by retaining required metadata fields or replacing the SDK declaration"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Run the actual compiler on a function accepting ImagePickerAsset[] and returning assets.map(imageAssetToAttachment)."]},"end_state":{"must_observe":["ImagePickerAsset resolves from the installed expo-image-picker package; all 3 optional metadata fields are accepted."],"must_not_observe":["An empty compatibility proof with 0 real SDK type references, or TS2345 or TS2322 caused by fileName, mimeType, or fileSize optionality."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the real registry manifest and corrected source WHEN registry:build emits nativewind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and accepts the real SDK asset.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-2-nativewind-artifact","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-2-nativewind-artifact","test_tier":"integration","verification_service":"Real registry build CLI, filesystem, Expo 57 package, and TypeScript compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real registry build CLI, filesystem, Expo 57 package, and TypeScript compiler","negative_control":{"would_fail_if":["the emitted nativewind item is empty, stale, or disconnected from production source"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Run pnpm registry:build, read public/r/nativewind/prompt-input.json, materialize its actual mapper content in scratch, and compile it against the real SDK."]},"end_state":{"must_observe":["nativewind prompt-input.json contains the production mapper at target components/ai/prompt-input.logic.ts with matching SHA-256 and accepts all 3 optional metadata fields."],"must_not_observe":["Empty mapper content (0 bytes), or a stale nativewind mapper with required metadata fields."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the real registry manifest and corrected source WHEN registry:build emits uniwind PromptInput and its mapper is compiled against Expo 57 THEN the shipped mapper matches source and registry freshness passes.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-3-uniwind-artifact","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-3-uniwind-artifact","test_tier":"integration","verification_service":"Real registry build and freshness CLIs, filesystem, Expo 57 package, and TypeScript compiler","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"primary":false,"test_tier":"integration","tier":"visible","verification_service":"Real registry build and freshness CLIs, filesystem, Expo 57 package, and TypeScript compiler","negative_control":{"would_fail_if":["the uniwind artifact is static stale output or the freshness check is disconnected from the generated files"]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"sdk57_workspace","action":{"actor":"cli_user","steps":["Read the actual uniwind PromptInput mapper after registry:build, compile it against the real SDK, then run pnpm check:registry; prove the freshness check rejects an isolated stale mapper before rebuilding."]},"end_state":{"must_observe":["uniwind prompt-input.json contains target components/ai/prompt-input.logic.ts matching production SHA-256; both engine artifacts pass the real freshness comparison."],"must_not_observe":["Empty uniwind mapper content (0 bytes), or a stale artifact accepted by the freshness check."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN full, omitted, and null metadata inputs WHEN the production mapper processes each input THEN filename, media type, URI, size, and generated identity retain the existing mapping and fallbacks.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/prompt-input-sdk57.test.ts","test_function":"ORI-RN-000-AC-4-mapping-preserved","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-4-mapping-preserved","test_tier":"unit","verification_service":"Production imageAssetToAttachment export; pure value transformation","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"unit_test_justified":"This dependency-free mapper performs only a value transformation. Direct production calls prove its outputs; AC-1 through AC-3 exercise the real SDK and registry pipeline.","scenario":{"primary":false,"test_tier":"unit","tier":"visible","verification_service":"Production imageAssetToAttachment export; pure value transformation","unit_test_justified":"Pure production value transformation; real dependency and emitted-artifact integration are separately required.","negative_control":{"would_fail_if":["the mapper is stubbed to return an empty record or its nullish filename fallback is removed"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"mapper_inputs","action":{"actor":"api_client","steps":["Call the actual export for full metadata and for omitted/null metadata; compare output fields and generated nonempty IDs."]},"end_state":{"must_observe":["Full metadata maps to filename=photo.png, mediaType=image/png, url=file://photo.png, size=2048.","Omitted/null metadata maps to filename=Image, mediaType='', url=file://photo.png, size=undefined, with a generated pi- identity."],"must_not_observe":["The input object returned unchanged, a constant empty record, or literal undefined used as the filename."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The source compiler proof uses the actual Expo 57 package and accepts its optional metadata fields.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-1-real-sdk","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The nativewind emitted mapper matches production source and compiles against the actual Expo 57 package.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-2-nativewind-artifact","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The uniwind emitted mapper matches production source, compiles, and the freshness check rejects isolated stale output.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-3-uniwind-artifact","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The real mapper returns the expected full-metadata values and omitted/null fallbacks without changing its runtime contract.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/prompt-input-sdk57.test.ts -t ORI-RN-000-AC-4-mapping-preserved","maps_to_ac":"AC-4"}]}
-->
</details>
