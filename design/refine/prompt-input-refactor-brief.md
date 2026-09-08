# PromptInput Refactor — Gap Brief

Invocation: `refine --component prompt-input "match the web original's feature surface"` + screenshot of
elements.ai-sdk.dev default demo (paperclip · globe · mic · rounded-square submit).

## What exists today

`packages/registry/src/components/ai/prompt-input.tsx` — 2 exports:

| Export | What it does |
|---|---|
| `PromptInput` | InputGroup + auto-growing multiline TextInput + send/stop icon Button. Internal text state. Submit clears on resolve, keeps text on rejection. Safe-area bottom inset. |
| `PromptInputHeader` | Empty flex-row slot. Nothing composes into it. |

Preserved contracts that must survive the refactor: **rejected onSubmit leaves text intact**; status-aware
submit swaps send↔stop; Expo Go-clean (no dev-client deps in the core).

## The web original's part map (what we're missing)

| Web part | Feature | RN verdict |
|---|---|---|
| `PromptInputActionAddAttachments` | Paperclip trigger | Port — needs native picker |
| `PromptInputAttachments` / `Attachment` | Removable chip row (image thumb + name) above textarea | Port — UC-CHAT-03 AC-3 |
| `PromptInputButton` | Toggle-able icon button (globe web-search, mic) | Port — trivial, press-based active state |
| `PromptInputTools` | Dropdown of tool actions | Port via RNR dropdown/sheet — house press pattern |
| `PromptInputSubmit` | Status-aware submit (arrow/loader/stop) | HAVE — reskin to the prominent rounded-square of the demo |
| `PromptInputSelect` / `ModelSelect*` | Model picker composed INSIDE the input footer | Compose existing `model-selector` organism (bottom sheet) — UC-CHAT-03 AC-4 |
| `PromptInputProvider` / `usePromptInputController` | Lifted global text+attachments state | Port if attachments land (attachments state must live somewhere) |
| `PromptInputBody`, `Toolbar` (top/bottom) | Layout rows | Port as layout shells |
| `PromptInputHoverCard`, `PromptInputCommand` (@-mentions) | Hover + keyboard palette | Documented non-goal (hover is web-only; @-palette out of PRD scope) |

## PRD anchors

- **UC-CHAT-03 AC-3** — attach photo/file from native picker, removable chip above composer. NOT BUILT.
- **UC-CHAT-03 AC-4** — switch models from composer via bottom-sheet picker. model-selector organism
  exists standalone; never composed into the input.
- **UC-CHAT-03 AC-1** — keyboard avoidance. Composer carries no KeyboardAvoidingView today (screen-level
  concern; example app doesn't exist yet). Storybook can't prove it — device gate.
- AC-2 (bounded growth) and AC-5 (in-flight disable/clear) — already built.

## New native dependencies

`expo-image-picker` + `expo-document-picker` — both in Expo 57's bundled list and Expo Go. Registry records
them as declared opt-in `dependencies` on the item (shimmer/reanimated, web-preview/webview precedent);
a consumer who never opens the picker path pays nothing.

## Existing assets to compose (no rebuilds)

model-selector (AC-4) · speech-input + mic-selector (mic demo) · button-group (tools row) · command/sheet
(tool menu) · input-group (shell) · attachments organism stays a message-display surface — composer chips
are the input's own parts, per the web split.

## Execution shape (after gate)

1. `shadcn-ai-elements-planner` consult: authoritative web behavior surface (composition tree, provider
   contract, attachment lifecycle) — input to the plan, never a diff.
2. `frontend-designer` with DESIGN-CONTRACT: submit-button treatment, chip row, tools row against the
   screenshot, token-only styling.
3. `react-native-reusables-implementer`: rewrite prompt-input.tsx (+ registry deps + ambient boundary
   declarations), TDD on the state contracts (rejected-submit, attachments add/remove, status swap).
4. Stories: PromptInput board (attach/toggle/tools/model/in-flight poses) + Chat board updates.
5. Gates: tsc · vitest · biome · registry:build ×2 fresh · both contracts · device capture (sign-off).
