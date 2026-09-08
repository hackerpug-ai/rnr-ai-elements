# FIX-F5-1 iOS evidence (remediation cycle 2) — the required proving platform

**Purpose of this cycle**: cycle-1 flow evidence was captured on the ANDROID emulator
(`Pixel_7_API_34` — see `../cycle-1/green/core-green.log` header), but this task's checklist
requires the ids to resolve **on a real iOS simulator**. Cycle 2 adds the iOS proof. The cycle-1
Android evidence remains valid as extra cross-platform signal; iOS is the required proof.

## Harness (no rebuild — binary from cycle 1's `expo run:ios` on iPhone 17 Pro)

- Simulator: **iPhone 17 Pro**, UDID `9677B8E8-CD67-4561-89DF-17BFD99309CC`, iOS 26.3, booted.
- App `ai.hackerpug.rnrexample` — the cycle-1-built dev-client binary, still installed.
- Metro started from THIS worktree (`apps/example`, port 8081) — `metro.log` shows
  `iOS Bundled ... expo-router/entry.js` serving the fixed source to the simulator.
- Locked flow: `.tmp/FIX-F5-1/cold-boot.yaml` (cycle-1 copy of TASK-F8's `.maestro/cold-boot.yaml`),
  re-copied here unchanged (`cold-boot.yaml`). Run via
  `maestro test --udid 9677B8E8-... -e SCREENSHOT_PATH=... .tmp/FIX-F5-1/cold-boot.yaml`.
- Provenance check: every run log opens with
  `Running on iPhone 17 Pro - iOS 26.3 - 9677B8E8-CD67-4561-89DF-17BFD99309CC`, and the
  `commands-(cold-boot.yaml).json` debug artifacts record `MAESTRO_DEVICE_UDID=9677B8E8-...`.
- Note: a first attempt without `--udid` was captured by an attached ANDROID emulator from a
  sibling lane (Metro also logged one `Android Bundled` line); it failed at the canary and is
  NOT evidence. All runs below pin the iOS simulator by UDID.

## Result (two runs, reproduced)

| Step | Run 1 (`green/ios-core-green.log`) | Run 2 (`green/run2/ios-core-green.log`) |
|---|---|---|
| launchApp (clearState) / openLink / springboard tap | COMPLETED | COMPLETED |
| **assert `transcript-message-0`** (seed canary — the RED-phase id) | **COMPLETED** | **COMPLETED** |
| assert "AI Elements Example" | COMPLETED | COMPLETED |
| assert "Registry item installed." | COMPLETED | COMPLETED |
| assert `app-header` | COMPLETED | COMPLETED |
| **assert `tool-badge-completed`** | **COMPLETED** | **COMPLETED** |
| assert text "Completed" | FAILED (see blocker B2) | FAILED (same) |

`transcript-message-0` and `tool-badge-completed` — the two ids this task must prove — resolve
**on the real iOS simulator**, reproducibly. The flow's own failure screenshot
(`green/maestro-debug/.../screenshot-❌-...png`, captured at the "Completed" step) shows the full
fixed screen on iOS: header pinned top, complete transcript (user bubble, searchRegistry tool card
with green Completed badge, assistant reply), composer pinned bottom, themed background filling the
screen — the exact on-device rendering this fix restores.

## Blockers (both pre-existing, both outside this task's WRITE-ALLOWED file)

- **B1 — context-popover-content cannot resolve (pre-existing F8 blocker, unchanged).** Not
  reached on iOS runs (flow stops at the "Completed" text step first); reproduced on Android in
  cycle 1 (`../cycle-1/green/core-green.log`, `green-fail-popover.png`): portalled Context content
  is rendered in the root PortalHost subtree and cannot see `ContextContext`
  (`Context components must be used within Context`). Fix requires `apps/example/components/ai/**`
  or `_layout.tsx` — WRITE-PROHIBITED here.
- **B2 — bare-text `assertVisible: "Completed"` does not resolve on iOS (new signal this cycle).**
  Deterministic (identical in both runs; passed on Android in cycle 1). The badge is the only
  element on the screen that carries an `accessibilityLabel` — `components/ai/tool.tsx:200` sets
  `Status: ${meta.label}` on the Badge inside the CollapsibleTrigger Pressable — and on iOS that
  a11y container absorbs the text node, so no standalone "Completed" text element exists for
  Maestro to match. A diagnostic probe (`probe-badge-label.yaml` / `probe-badge-label.log`)
  additionally shows `"Status: Completed"` is also not matched, consistent with Maestro's
  exact-match text semantics against iOS labels. Mechanism detail is INFERRED (Maestro 2.5.1's
  `hierarchy` command cannot target a specific iOS device here); the non-resolution itself is
  VERIFIED twice. The badge text is visually present on the iOS screen in the flow screenshot.
  Fix belongs to `components/ai/tool.tsx` (a11y-label flattening / testID) — WRITE-PROHIBITED here.

## Code state this cycle

`apps/example/app/index.tsx` is UNCHANGED from the cycle-1 commit (0-line diff; the fix
`style={{ flex: 1, backgroundColor: THEME[theme ?? 'light'].background }}` at line 142 is already
landed). Note on the checklist row greping `style={{ flex: 1 }}`: the committed line is
`style={{ flex: 1, backgroundColor: ... }}` — the task's parenthetical ("the SafeAreaView …
receives a real style, not only className") is met in substance; the row-1 literal grep on the raw
line does not match the longer form. Cycle-1 evidence was not touched.
