# Behavior Spec — AI Elements `prompt-input` (web original)

Consulted by shadcn-ai-elements-planner, 2026-09-05. Grounding: local Rosetta KB `vercel/ai-elements` @ `6a9d5b1` (npm `ai-elements` v6.0.0, pinned 2026-08-28) + live `main` source (`packages/elements/src/prompt-input.tsx`, 1463 lines) + docs mdx fetched same day. Architecture matches the KB (Provider-based).

Import root: `@/components/ai-elements/prompt-input`. Root wraps children in `InputGroup` (overflow-hidden) inside a `<form>`. A hidden `<input type="file">` is always rendered by `PromptInput` itself (aria-label "Upload files").

## Composition tree (default order in docs example)

```
<PromptInput>                      ← hidden file input + <form><InputGroup>
├── <PromptInputHeader>            ← addon row, order-first (TOP)
│   └── <Attachments variant="inline"> (consumer component, via usePromptInputAttachments)
├── <PromptInputBody>              ← display:contents wrapper
│   ├── <PromptInputTextarea>
│   └── <PromptInputFooter>        ← addon row, justify-between (BOTTOM)
│       ├── <PromptInputTools>     ← left cluster
│       │   ├── <PromptInputActionMenu> (+Trigger/Content/AddAttachments/AddScreenshot)
│       │   ├── <PromptInputButton> (toggle, e.g. globe)
│       │   └── <PromptInputSelect…> (model select)
│       └── <PromptInputSubmit status disabled/>
```

There is NO `PromptInputToolbar` part and no top/bottom variant. Header/Footer are `InputGroupAddon` rows both `align="block-end"`; Header additionally `order-first` + `flex-wrap gap-1`; Footer `justify-between`. "Tools row on top" = render Footer content in Header.

## PromptInput (root)

- Props: `onSubmit(message: PromptInputMessage, event) => void | Promise<void>`, `accept?: string` (comma MIME list, `"image/*"` wildcard supported), `multiple?: boolean`, `globalDrop?: boolean` (default false), `syncHiddenInput?: boolean` (deprecated — source comments "no longer functional"), `maxFiles?: number`, `maxFileSize?: number` (bytes), `onError?: (err: { code: "max_files" | "max_file_size" | "accept"; message: string }) => void`, plus form HTML props.
- `PromptInputMessage = { text: string; files: FileUIPart[] }`.
- Renders `<form>`; Enter-path and click both go through form submit → `handleSubmit`.
- Dual-mode: detects optional `PromptInputController`; with provider, text/attachments live in provider; without, self-managed `useState`.

## PromptInputProvider / context contracts

- `PromptInputProvider` takes only `initialInput?: string` + children. Lifts **text** (useState) and **attachments** (`(FileUIPart & { id: string })[]` via useState) into context. Plain React context + useState — NOT syncExternalStore.
- `usePromptInputController()` throws outside the provider ("Wrap your component inside `<PromptInputProvider>`…"); returns `{ textInput: { value, setInput, clear }, attachments: AttachmentsContext, __registerFileInput }`.
- `usePromptInputAttachments()` — always available inside `PromptInput` (local context, provider-backed when wrapped); throws outside. Returns `{ files, add, remove, clear, openFileDialog, fileInputRef }`.
- `useProviderAttachments()` — raw provider attachments context; throws outside `PromptInputProvider`. `add` here is the RAW setter without accept/size/maxFiles validation; `PromptInput` wraps it with validation.
- `usePromptInputReferencedSources()` — always local to `PromptInput` (never provider-lifted): `{ sources, add, remove, clear }` of `(SourceDocumentUIPart & { id })[]`.
- In-flight status is NOT in context. `status` comes from `useChat()` at the consumer and is passed to `PromptInputSubmit` as a prop.
- Provider→PromptInput wiring: `PromptInput` registers its hidden file input via `__registerFileInput` so external triggers (e.g. `PromptInputActionAddAttachments`) can call `openFileDialog()`.

## PromptInputBody

`display: contents` div. Pure layout passthrough; no context, no behavior.

## PromptInputTextarea

- Props: shadcn `Textarea` props; `placeholder` default `"What would you like to know?"`; `name="message"`.
- Provider mode: controlled by `controller.textInput` (value + setInput on change). Local mode: uncontrolled, read from form data on submit.
- Auto-grow: `field-sizing-content max-h-48 min-h-16` CSS (live source). (Older docs said scrollHeight JS — stale.)
- Keyboard contract (web-only): Enter → `form.requestSubmit()` unless shiftKey/isComposing/disabled submit. Backspace on EMPTY textarea removes the LAST attachment. Paste with file items → `attachments.add(files)` (preventDefault). External `onKeyDown` runs first; preventDefault skips internal handling.

## Attachment lifecycle

- Entry points: hidden file input `onChange` (value reset after capture so re-picking the same file re-fires), drag-drop (form-scope default, document-scope with `globalDrop`), clipboard paste, `PromptInputActionAddAttachments` → `openFileDialog()`, `PromptInputActionAddScreenshot` (`getDisplayMedia` → File).
- Validation order (each failure calls `onError` once and aborts): `accept` → all files rejected → `{code:"accept"}`; `maxFileSize` → all accepted files over → `{code:"max_file_size"}`; `maxFiles` → silently caps incoming to remaining capacity, fires `{code:"max_files"}` only if some were dropped.
- Record shape: `FileUIPart & { id: nanoid() }` → `{ type: "file", mediaType: file.type, filename: file.name, url: URL.createObjectURL(file) }` (blob: URL).
- Removal: `remove(id)` filters the record and revokes its object URL.
- Clear: `clear()` revokes all URLs and empties the array.
- On submit: `id` stripped from each file; every blob: URL converted to a data: URL (async; conversion failure keeps the blob URL); converted `files` + `text` go to `onSubmit`.
- Clear timing: clearing (attachments + referencedSources + provider text) happens ONLY after `onSubmit` resolves. Throw/reject ⇒ nothing is cleared (retry-friendly). Local mode additionally does `form.reset()` immediately after capturing text, before the async conversion.
- Unmount in non-provider mode revokes all object URLs.
- No `maxCount` prop exists — it is `maxFiles`. (Since 1.8.0, `maxFiles=1` + `multiple=false` strictly enforced.)

## Chips rendering (separate `attachment` module, not prompt-input parts)

- Docs pattern: `PromptInputAttachmentsDisplay` reads `usePromptInputAttachments()`, returns null when empty, else `<Attachments variant="inline">` mapping files → `<Attachment data onRemove={() => attachments.remove(id)}>` with `<AttachmentPreview />` + `<AttachmentRemove />`. Placed inside `PromptInputHeader`.
- `AttachmentPreview` branches on `getMediaCategory(data)`: image → img thumbnail, video → poster, else type icon fallback. `AttachmentInfo` adds filename + optional media type. `getAttachmentLabel` falls back to "Image"/"Attachment".
- `AttachmentRemove` is hover-revealed on web (web-only affordance).
- Variants: `grid | inline | list` (density only).

## PromptInputButton

- Base: `InputGroupButton`, `type="button"`, default `variant="ghost"`. Auto-size: children.length > 1 → "sm", else "icon-sm".
- `tooltip?: string | { content; shortcut?; side? }` — Tooltip wrapper (hover).
- NO built-in toggle semantics. Consumer owns state and swaps variant — docs example: `variant={useWebSearch ? "default" : "ghost"}` on the globe button.
- Mic: wired via the separate `SpeechInput` element (Web Speech API), also placed in `PromptInputTools`.

## PromptInputActionMenu (+Trigger/Content/Item)

- Thin wrappers over shadcn `DropdownMenu`. Trigger = `PromptInputButton` rendering default `<PlusIcon />`. Content defaults `align="start"`.
- No default menu content — consumer composes items. Library items: `PromptInputActionAddAttachments` (label "Add photos or files"; onClick → `openFileDialog()`) and `PromptInputActionAddScreenshot` (screen capture → File → `add`).

## PromptInputTools

Just a flex container (`flex min-w-0 items-center gap-1`) — no state, no default children. Sits left in the Footer; `PromptInputSubmit` sits right.

## PromptInputSubmit

- Props: `status?: ChatStatus` (`ready | submitted | streaming | error`), `onStop?: () => void`, plus button props. Defaults: `variant="default"`, `size="icon-sm"`.
- Status→icon map (children override): ready/undefined → CornerDownLeftIcon (diff: older KB said ArrowUp — live is CornerDownLeft); submitted → Spinner; streaming → SquareIcon; error → XIcon. All size-4.
- `isGenerating = submitted || streaming`. When generating AND `onStop` provided: click calls onStop (preventDefault), aria-label "Stop". Otherwise submit, aria-label "Submit".
- Not auto-disabled on empty text. Docs pass `disabled={!text && !status}`; empty-message guarding (hasText || hasAttachments) is consumer-side in onSubmit.

## Model select (there is NO `PromptInputModelSelect` part)

Composed from `PromptInputSelect` (shadcn Select passthrough), `PromptInputSelectTrigger` (borderless, muted, ghost, ChevronDownIcon), `PromptInputSelectValue`, `PromptInputSelectContent`, `PromptInputSelectItem`. Sits INSIDE `PromptInputTools` in the Footer. Consumer owns value/onValueChange; value goes in the request body, not through PromptInputMessage.

## HoverCard / Command / Tabs parts

- `PromptInputHoverCard(+Trigger/Content)`: passthrough wrappers, openDelay/closeDelay 0. @-mention preview popups.
- `PromptInputCommand(+Input/List/Group/Item/Empty/Separator)`: cmdk passthroughs — searchable palette (slash/@ commands) anchored above the input (cursor-style example).
- `PromptInputTabsList/Tab/TabLabel(h3)/TabBody/TabItem`: dumb layout divs for grouped lists inside popovers.
- None carry state or context.

## Web-only / no-native-equivalent affordances

Enter/Shift+Enter/IME handling; Backspace-to-remove-attachment; disabled-submit DOM probe; drag-and-drop; clipboard file paste; tooltips (hover); AttachmentRemove hover-reveal; HoverCard popovers; PromptInputCommand palette; AddScreenshot via getDisplayMedia; syncHiddenInput (dead); CSS field-sizing auto-grow.

## Local KB vs live docs — disagreements

1. Send icon: live renders CornerDownLeftIcon for ready (KB glossary implied arrow-up).
2. Auto-grow: live uses CSS field-sizing, not scrollHeight JS.
3. syncHiddenInput: still documented but source marks it non-functional.
4. maxCount does not exist; the prop is maxFiles.
5. Everything else matches the local KB exactly; no additional v6.0.0→main drift found.
