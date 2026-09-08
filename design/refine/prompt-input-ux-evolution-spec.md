# Composer Evolution Spec — Claude/ChatGPT Mobile UX Learnings

frontend-designer, 2026-09-05. `design engine: frontend-designer`. Spec only — no code.
Target: `packages/registry/src/components/ai/prompt-input.tsx` + harness pose.

## Reuse scan (no new primitives needed)

Already exist and cover the gap: `Sheet`/`SheetContent side="bottom"` (house overlay), `Item`/`ItemMedia`/`ItemTitle` with the check-trailing-row pattern (model-selector's renderRow), `SpeechInput` (its idle state is ALREADY a filled `bg-primary` circle — visually the Claude/ChatGPT voice button), `ModelSelector`/`ModelSelectorTrigger` (composable chip), `PromptInputButton` (consumer-owned `active`), the `__openPicker` seam. This is composition plus one small primary-button part.

Flag-only: `input-group.tsx` internals still carry pre-wave-13 `dark:bg-input/30` / `ring-ring/50`; `PromptInputSubmit`'s `ml-auto` needs a fixed `size-11` primary slot so the morph has no layout shift.

## A. UX findings

1. **The primary slot is never dead — voice-first morphing.** Claude + ChatGPT put a filled, high-contrast circle (waveform) in the primary position while the field is empty; it morphs to send the moment text exists. Principle: the primary slot always offers the fastest path to intent — when you haven't typed, the fastest intent is speaking. Ours shows a gray opacity-50 arrow that does nothing: a permanently dead control in the most valuable pixel, at the exact terminus of the thumb's sweep.
2. **Progressive disclosure via +.** One tools affordance at rest (+); ours exposes three (paperclip/globe/mic) before a character is typed. Fewer rest targets = less noise, fewer accidental hits while typing.
3. **Toggles live in the menu, with checkmarks.** ChatGPT's "Think harder ✓" — control and state display colocated, shown at the only moment state matters. Ours spends a permanent row slot + accent fill on the globe.
4. **Inline model chip.** Claude renders the model as a compact bordered pill in the row — conversation property, visible at the point of composition. Our model-selector organism has the selection contract (UC-CHAT-03 AC-4) but the pose doesn't show it in-field.
5. **One content-hugging floating container** — we already match (the refactor's InputGroup column). Residual: Claude's radius is ~24px "card" vs our 12px "input" — cosmetic.
6. ChatGPT compresses the composer while its menu is open — clever, unverifiable payoff, real complexity.

Library lens: our parts are prop-driven and stateless about model/voice/web-search — every adopted behavior must stay consumer-composable (voice optional, toggle state consumer-owned, menu content consumer-authored).

## B. Adopt / Adapt / Reject

| Pattern | Verdict | Mapping |
|---|---|---|
| Voice-first morphing primary | **Adapt** | New `PromptInputPrimary`: empty → voice affordance; text → send; streaming → stop. Voice props mirror SpeechInput's caller-supplied `recorder`/`transcribe` (registry stays engineless); without voice composed, falls back to today's PromptInputSubmit exactly. Declared mobile divergence (same class as ArrowUp-vs-CornerDownLeft). |
| + menu: Camera / Photos / Files | **Adapt** | Bottom sheet, not dropdown (house answer; popover fights the keyboard + portal z-order). `PickerKind` gains `'camera'`; `launchCameraAsync` reuses the same asset mapping + validated `add()` (~6 lines). Denial surfaces as canceled — never fake success. |
| Menu checkmark toggles absorbing globe | **Adapt** | Sheet rows via `Item`; `selected` renders trailing `CheckIcon` in a reserved `size-4` slot. State stays consumer-owned; the registry never knows what web search is. |
| Mic as persistent button | **Adapt (conditional)** | When voice is composed, the mic IS the primary — remove from row. When not, keep today's ghost mic. Mic-selector stays a standalone organism. |
| Model chip in row | **Adopt** | `ModelSelectorTrigger` (`variant="outline" size="sm" rounded-full`) in `PromptInputHeader`'s left cluster. Zero new registry code. |
| Field radius to 24px card | **Reject (for now)** | rounded-xl was pinned deliberately; churn without function. |
| Composer collapse under open menu | **Reject** | Keyboard-avoidance risk (AC-1/AC-2 load-bearing); no user-voiced need. |
| Suggestion rows above composer | **Reject here** | UC-CHAT-04; Suggestion/Suggestions already ship it. |

## C. Evolved composer spec

### New parts

- **`PromptInputToolsMenu`** — `Sheet`/`SheetContent side="bottom" rounded-t-xl`, controlled `open`/`onOpenChange`, `SheetTitle` for a11y, named-portal-host rule honored. Items are consumer children — content-agnostic. Why not command: command is a searchable FlatList for large sets; 4 static rows want Sheet + Item atoms (which already carry the check/selected idiom).
- **`PromptInputToolsMenuTrigger`** — the +: `PromptInputButton size-11 ghost`, `PlusIcon size={20}`, `accessibilityLabel="Add content and tools"`, `accessibilityState={{ expanded }}`.
- **`PromptInputToolsMenuItem`** — `Item` row: `ItemMedia` = icon in `size-8 rounded-md bg-muted` box (ChatGPT's icon-chip anatomy), `ItemTitle` label, optional `selected?: boolean` → trailing `CheckIcon size={16} ml-auto` else a reserved `size-4` View. `onPress` fires `onSelect` and closes.
- **`PromptInputPrimary`** — fixed `size-11` slot, right side (`ml-auto`). Delegates: streaming/error → exact PromptInputSubmit branches; text non-empty → send; empty + `renderVoice` composed → consumer's voice affordance; empty + no voice → today's disabled send. New optional prop only; PromptInputSubmit stays exported and unchanged.

Logic delta: `PickerKind` gains `'camera'` (explicit-kind only; `resolvePickerKind` untouched); one `launchCameraAsync` branch mapping assets identically; validation order accept → size → count preserved verbatim.

### Changed poses (registry API unchanged — nothing deleted)

Tools row becomes `[+Trigger] [model chip] … [PromptInputPrimary]`. Paperclip/globe/mic leave the DEFAULT pose; globe's job moves to a checkmarked menu item; mic is absorbed by the primary when voice is composed. `PromptInputActionAddAttachments` kept (direct-open, web parity, tests untouched) — just leaves the default pose.

### Morph behavior table

| Field state | Primary slot | Enabled |
|---|---|---|
| empty, voice composed | voice circle (AudioLinesIcon) | per SpeechInput contract |
| empty, no voice | ArrowUp, disabled | no |
| text ready | ArrowUp, bg-primary | yes |
| submitted | ActivityIndicator | — |
| streaming | Square stop | yes |
| error | X, disabled | no |

Fixed `size-11` slot → in-place swap, zero layout shift; keyboard-avoided field never reflows (AC-1/AC-2 deterministic). Reduced motion: all morphs instant swaps; waveform static in v1.

### PRD anchors

- UC-CHAT-03 AC-3: pickers behind + menu; camera additive; chips unchanged. New scenario: menu-driven attach.
- AC-4 strengthened: chip permanently visible in-row; selection surface already the command sheet.
- AC-5 preserved by the morph table. AC-1/AC-2 untouched.
- New AC candidates: empty-state voice primary; menu-held toggle with checkmark state.

## Recommendation

**Minimum high-value slice (one PR):**
1. Model chip into the row — free, pure composition.
2. `PromptInputToolsMenu` (+ trigger/items) absorbing pickers AND the globe toggle as a checkmarked item — deletes the always-exposed trio.
3. `PromptInputPrimary` with the morph, voice composed in the harness (SpeechInput's idle pill IS the reference visual), clean fallback without it.

Full mirror adds only animated waveform / radius bump / composer-collapse — none survive cost/benefit.

**Explicitly NOT copying:** anchored dropdown (keyboard collision; sheet is house law), composer shrink-under-menu, persistent web-search icon, plugins-style mode chrome, animated voice indicator without a ReduceMotion gate. The win is not looking like Claude — it's the three principles: **never-dead primary, one tools entry point, state-in-menu.**
