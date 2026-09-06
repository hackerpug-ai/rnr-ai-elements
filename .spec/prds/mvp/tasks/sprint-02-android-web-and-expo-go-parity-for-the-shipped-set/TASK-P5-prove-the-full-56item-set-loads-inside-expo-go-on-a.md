# TASK-P5: Prove the full 56-item set loads inside Expo Go on a physical iPhone with no dev client, and capture the evidence


> Task ID: TASK-P5  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 2  
> Type: INFRA  
> Wave: D  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-P2  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

The full 56-item set is proven to load in Expo Go on a physical iPhone with no dev client, dark flip included, capture and run record committed.

## Critical Constraints

- MUST: Run `npx expo start --go`, scan the QR with a physical iPhone, and load the app inside Expo Go with NO dev-client prompt
- MUST: Record the verbatim procedure in apps/example/README.md — a stranger with the file open repeats the session without a code editor
- MUST: Commit design/goldens/mobile-ios/sprint-02/expo-go-gallery.png plus a run record (device, OS, Expo Go version, date, what was walked)
- NEVER substitute the iOS simulator leg for the physical iPhone — Go compatibility is claimed from Go on real hardware or not at all
- NEVER leave a gallery screen that errors on a native module; if one does, the defect goes back to P1's graph or P2's screen, not into the record
- STRICTLY walk the same gallery the other legs walk: counter `56 / 56`, all four states on several items including web-preview and speech-input

## Specification

**Objective:** Close the last never-observed leg: the entire shipped set running inside Expo Go on a physical iPhone, dark flip included, with committed evidence and a repeatable procedure.

**Success state:** Expo Go on the physical iPhone shows the app with no dev-client prompt, header `AI Elements Example`, `Gallery` → counter `56 / 56`, web-preview's populated section rendering the webview, speech-input in its documented disabled state, no native-module error anywhere, and Settings → Dark flipping every surface in the same frame — all captured.

## Verification Checklist

| Command | Expect |
|---|---|
| `grep -c "expo start --go" apps/example/README.md` | at least 1 — the procedure's entrypoint command is recorded |
| `grep -c "Expo Go" apps/example/README.md` | at least 1 — the procedure names the target and the physical-device steps |
| `test -s design/goldens/mobile-ios/sprint-02/expo-go-gallery.png && echo present` | prints present — the capture is committed and non-empty |
| `ls design/goldens/mobile-ios/sprint-02/` | expo-go-gallery.png plus the run record (device, OS, Expo Go version, date, items walked) |
| `node -p "Object.keys(require('./apps/example/package.json').dependencies).filter(d=>['react-native-enriched-markdown','react-native-streamdown','expo-speech-recognition'].includes(d)).length"` | prints 0 — the graph precondition that makes the Go session possible |
| `cd apps/example && npx expo start --go` | Metro starts and prints a QR code; scanning it on the physical iPhone loads the app in Expo Go with no dev-client prompt |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (82-83) — gate steps 20-21 verbatim — the no-prompt load, the counter, web-preview/speech-input expectations, the no-native-module-error rule, and the Settings flip
- `AGENTS.md` (128-137) — 'Expo Go vs dev client' — the four opt-in items and why the core surface must stay Go-clean
- `design/manifest.json` (full) — the device-evidence row format the run record should echo

## Guardrails

**WRITE-ALLOWED**
- `apps/example/README.md (NEW)`
- `design/goldens/mobile-ios/sprint-02/** (NEW)`

**WRITE-PROHIBITED**
- `apps/example/app/**`
- `apps/example/components/**`
- `apps/example/package.json`
- `packages/registry/**`
- `public/r/**`
- `tests/**`
- `.maestro/**`
- `design/goldens/mobile-android/**`
- `design/goldens/web-desktop/**`

## Design

**References:** gate steps 20-21 (the Expo Go session and the Settings dark flip); AGENTS.md 'The core chat and agent surface runs in Expo Go'
**Pattern:** committed device evidence rows — a human procedure plus a committed capture and record, the way design/manifest.json carries its mobile-ios evidence
**Pattern source:** `design/manifest.json (device evidence format)`
**Anti-pattern:** claiming Expo Go compatibility from the simulator leg — the claim is only as good as the physical-iPhone capture behind it
- speech-input's disabled state is the documented contract — 'every control DISABLES, never pretends' — and on Go that is exactly what a stranger must see
- The run record makes the session auditable: device model, iOS version, Expo Go version, date, and the items walked

## Boundary Contracts

- no dev client and no native-module error anywhere in the gallery — a screen naming react-native-enriched-markdown, react-native-streamdown or expo-speech-recognition is a FAIL
- web-preview renders its webview in Go; speech-input renders its documented disabled state (no engine wired — controls DISABLE, never pretend)
- evidence is committed: the capture and the run record, not a claim

## Dependencies

- **Depends on:** TASK-P2
- **Blocks:** none
- **Human test hook:** Gate steps 20-21 verbatim: `cd apps/example && npx expo start --go`, scan the QR, open in Expo Go — no dev-client prompt, counter `56 / 56`, walk web-preview (webview renders) and speech-input (disabled state), no native-module error; then Settings → Display & Brightness → `Dark` — every AI Elements surface flips in the same frame as the app chrome; `Light` flips back.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P5",
 "task_type": "INFRA",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": false,
  "requires_red_evidence": false,
  "requires_seeded_evidence": false
 },
 "fixtures": {},
 "requirements": []
}
-->
