---
title: 'Porting from Vercel AI Elements'
description: 'The upstream-to-port mapping with per-element deviations, the exact not-ported list, and why this port differs from the web original and the earlier React Native port.'
section: 'porting'
order: 1
upstream:
  - agent
  - artifact
  - attachments
  - audio-player
  - canvas
  - chain-of-thought
  - checkpoint
  - code-block
  - commit
  - confirmation
  - connection
  - context
  - controls
  - conversation
  - edge
  - environment-variables
  - file-tree
  - image
  - inline-citation
  - jsx-preview
  - message
  - mic-selector
  - model-selector
  - node
  - open-in-chat
  - package-info
  - panel
  - persona
  - plan
  - prompt-input
  - question
  - queue
  - reasoning
  - sandbox
  - schema-display
  - shimmer
  - snippet
  - sources
  - speech-input
  - stack-trace
  - suggestion
  - task
  - terminal
  - test-results
  - tool
  - toolbar
  - transcription
  - voice-selector
  - web-preview
mapping:
  - upstream: agent
    item: agent
  - upstream: artifact
    item: artifact
  - upstream: attachments
    item: attachments
  - upstream: audio-player
    item: audio-player
  - upstream: chain-of-thought
    item: chain-of-thought
  - upstream: checkpoint
    item: checkpoint
  - upstream: code-block
    item: code-block
  - upstream: commit
    item: commit
  - upstream: confirmation
    item: confirmation
  - upstream: context
    item: context
  - upstream: conversation
    item: conversation
  - upstream: environment-variables
    item: environment-variables
  - upstream: file-tree
    item: file-tree
  - upstream: image
    item: image
  - upstream: inline-citation
    item: inline-citation
  - upstream: message
    item: message
  - upstream: mic-selector
    item: mic-selector
  - upstream: model-selector
    item: model-selector
  - upstream: open-in-chat
    item: open-in-chat
  - upstream: package-info
    item: package-info
  - upstream: persona
    item: persona
  - upstream: plan
    item: plan
  - upstream: prompt-input
    item: prompt-input
  - upstream: question
    item: question
  - upstream: queue
    item: queue
  - upstream: reasoning
    item: reasoning
  - upstream: schema-display
    item: schema-display
  - upstream: shimmer
    item: shimmer
  - upstream: snippet
    item: snippet
  - upstream: sources
    item: sources
  - upstream: speech-input
    item: speech-input
  - upstream: stack-trace
    item: stack-trace
  - upstream: suggestion
    item: suggestion
  - upstream: task
    item: task
  - upstream: terminal
    item: terminal
  - upstream: test-results
    item: test-results
  - upstream: tool
    item: tool
  - upstream: transcription
    item: transcription
  - upstream: voice-selector
    item: voice-selector
  - upstream: web-preview
    item: web-preview
notPorted:
  - canvas
  - connection
  - controls
  - edge
  - jsx-preview
  - node
  - panel
  - sandbox
  - toolbar
---

This page maps the upstream Vercel AI Elements element set onto this registry. Read it before backporting a web pattern: the Deviations column states where the port changed the web original's structure, and the not-ported list states what was deliberately left behind.

The upstream set is pinned. It is enumerated from the registry listing the vercel/ai-elements repository serves at `/api/registry/registry.json` (built from `packages/elements/src`), at commit [6a9d5b1822ffb10bba4bd97175f01edd7d8651cd](https://github.com/vercel/ai-elements/tree/6a9d5b1822ffb10bba4bd97175f01edd7d8651cd), dated 2026-08-21: 49 elements, of which 40 ship here and 9 do not. The live listing at elements.ai-sdk.dev can lag that commit. The three sets also live as structured frontmatter arrays (`mapping`, `notPorted`, `upstream`) so tooling can diff them against the tracked registry — keep the arrays and the tables on this page in step.

What the library ships and does not ship in total is the boundary page's job; this page never repeats those tables. Read [What the library owns](/docs/owns-vs-does-not-own) for that split.

## Mapping

Forty of the 49 upstream elements ship as registry items. Each row below links to the item's reference page, and the Deviations column states what differs from the web original — a cell starting with "None" means structure and behavior match, and every cell names one of three kinds: None, Adapted, or Substituted. The following table maps every ported element:

| Upstream element | Registry item | Deviations |
| --- | --- | --- |
| `agent` | [agent](/components/agent) | Adapted — an identity and run card: persona, run-state badge, and a Start/Pause/Stop bar the web config card never had. The web card's model badge, instructions box, tools accordion, and output-schema block are absent. |
| `artifact` | [artifact](/components/artifact) | Adapted — the container and header chrome match the web part set; the web's side-panel presentation becomes a host-mounted sheet, and the action tooltip becomes an accessibility label. |
| `attachments` | [attachments](/components/attachments) | Substituted — the chip row ports at parity, but file acquisition does not: the native image and document pickers are the caller's wiring, with their permission contracts in the consumer's app; none of it ships here. |
| `audio-player` | [audio-player](/components/audio-player) | Substituted — the HTML audio element is dropped: transport controls and the scrubbable progress bar are the item, and the caller supplies the player (expo-audio, a native player, or an `<audio>` element on web) through a state-in/callbacks-out seam; no audio dependency enters the install graph. |
| `chain-of-thought` | [chain-of-thought](/components/chain-of-thought) | None — the ordered step list with per-step status and a rail; the disclosure reuses the reasoning lifecycle, as on web. |
| `checkpoint` | [checkpoint](/components/checkpoint) | Adapted — restore confirms first because it truncates the conversation; the web hides that warning behind a hover tooltip, which does not exist on touch. |
| `code-block` | [code-block](/components/code-block) | Substituted — the DOM-emitting highlighter becomes a tokenizer rendering Text spans, with horizontal scroll and a copy action; ships as a registry:ui base primitive rather than registry:component. |
| `commit` | [commit](/components/commit) | None — commit reference row with hash chip, message, author, and changed files behind a disclosure; one-tap hash copy. |
| `confirmation` | [confirmation](/components/confirmation) | Adapted — a card rather than the web Alert container, with full-width Approve and Deny actions sized to platform touch targets. |
| `context` | [context](/components/context) | Adapted — the hover reveal becomes a press-opened popover; the token and cost data shown is unchanged. |
| `conversation` | [conversation](/components/conversation) | Substituted — the overflow container and scroll hook become an inverted FlatList with maintainVisibleContentPosition plus keyboard and safe-area handling; same surface, different implementation. |
| `environment-variables` | [environment-variables](/components/environment-variables) | None — masked key and value rows with a single-value reveal, at parity with the web part set. |
| `file-tree` | [file-tree](/components/file-tree) | Adapted — the nested rows port, with horizontal scroll keeping deep indentation legible at phone width; the chevron and the name get separate touch targets. |
| `image` | [image](/components/image) | None — the AI SDK result object and prop shape are preserved; alt maps to accessibilityLabel. |
| `inline-citation` | [inline-citation](/components/inline-citation) | Adapted — the hover card becomes a pressable inline chip, nested in Text exactly as the web nests spans, reporting onSelect. |
| `message` | [message](/components/message) | None — role alignment, surface, and avatar match; markdown rendering is injected through renderMarkdown because the web renderer does not run on React Native. |
| `mic-selector` | [mic-selector](/components/mic-selector) | Substituted — the media devices API has no native equivalent; ships as the audio-route picker (built-in, wired, Bluetooth) doing the same job. |
| `model-selector` | [model-selector](/components/model-selector) | Adapted — the dropdown becomes a bottom sheet with search, composed on the command primitive; the selection contract is unchanged. |
| `open-in-chat` | [open-in-chat](/components/open-in-chat) | Adapted — the same six targets and menu, with `target="_blank"` replaced by the platform link handler behind an http/https allowlist; unavailable targets are hidden. |
| `package-info` | [package-info](/components/package-info) | None — card of package name, version, and a copyable install command, all RNR primitives. |
| `persona` | [persona](/components/persona) | Adapted — the web original is a Rive animated avatar; the animation is not ported, so no consumer inherits a native animation runtime. |
| `plan` | [plan](/components/plan) | None — card and collapsible shell with per-step status; the steps compose the task rows, and title and description shimmer while streaming. |
| `prompt-input` | [prompt-input](/components/prompt-input) | Substituted — the composer surface is at parity, but attachments arrive through the native pickers, enter-to-submit becomes an explicit send button, and the composer owns keyboard avoidance and safe-area insets. |
| `question` | [question](/components/question) | Adapted — the select-then-submit form is dropped: an option tap is the submission, and the choice persists in the transcript. |
| `queue` | [queue](/components/queue) | None — collapsible queued-actions list with the count on the trigger and a remove action per row. |
| `reasoning` | [reasoning](/components/reasoning) | None — auto-opens while streaming, auto-closes one second after the answer begins, and shows the frozen duration on the collapsed header. |
| `schema-display` | [schema-display](/components/schema-display) | Adapted — the upstream collapse structure ports; nesting depth and key widths collapse and scroll to stay legible at phone width. |
| `shimmer` | [shimmer](/components/shimmer) | Substituted — the web effect is a linear-gradient with background-clip on text, which React Native does not have, so the signal becomes the RNR Skeleton house pulse (opacity 1 to 0.5 over 1000ms, repeating) on text at text-muted-foreground — a new visual treatment rather than an equivalent one, and no masked view ships. |
| `snippet` | [snippet](/components/snippet) | Adapted — clipboard access moves to the native clipboard module, and long commands scroll horizontally. |
| `sources` | [sources](/components/sources) | None — collapsible grouped sources with title and domain per row. |
| `speech-input` | [speech-input](/components/speech-input) | Substituted — the web's two browser engines do not exist in React Native, so the caller-supplied recorder-and-transcribe contract is the only contract; a denied-permission state is distinct from no engine. |
| `stack-trace` | [stack-trace](/components/stack-trace) | None — mono frame list with expandable frames; every file and line legible through horizontal scroll. |
| `suggestion` | [suggestion](/components/suggestion) | None — the horizontally scrolling chip row maps to a horizontal ScrollView. |
| `task` | [task](/components/task) | Adapted — collapsed by default where the web opens by default, so the transcript stays scannable; the collapsed trigger row carries the status badge. |
| `terminal` | [terminal](/components/terminal) | Adapted — read-only and horizontally scrollable, with ANSI colors mapped to theme tokens; an interactive pseudo-terminal is out of scope. |
| `test-results` | [test-results](/components/test-results) | None — passed, failed, and skipped counts with a failing test expanding to its message. |
| `tool` | [tool](/components/tool) | None — status header plus input and output disclosure, covering every AI SDK tool-part state. |
| `transcription` | [transcription](/components/transcription) | None — display-only live transcript; capture belongs to speech-input, so nothing was substituted. |
| `voice-selector` | [voice-selector](/components/voice-selector) | Adapted — the picker becomes a bottom sheet, and the voice set comes from the caller's native speech synthesis provider. |
| `web-preview` | [web-preview](/components/web-preview) | Substituted — the iframe becomes a native webview with the same URL bar and reload affordance, and the console pane is dropped; the one registry item that names a native module (react-native-webview) as an install-time dependency. |

## Not ported

Nine upstream elements are deliberately not ported: the seven react-flow canvas-family parts and two web-only surfaces. None of them is a shipped registry item, and the mapping above plus this list covers all 49 upstream elements. The following list names each and states why:

- `canvas` — a react-flow workspace: there is no react-flow on React Native, and a pan-and-pinch node graph on a phone is a separate product, not a port. The agent structure it visualizes renders as the plan and task lists.
- `connection` — an SVG connection line with pointer-drag semantics; it has no meaning outside a node editor.
- `controls` — React Flow's zoom, fit, and lock cluster, acting on the canvas viewport store; the run controls that job suggests ship inside agent.
- `edge` — an SVG edge path with no standalone mobile use.
- `jsx-preview` — evaluates a JSX string at runtime; Hermes has no runtime JSX transform, and shipping an evaluator is an app-store and security problem. Render the described UI server-side and show it as an artifact or web preview.
- `node` — a draggable graph node with no standalone mobile use.
- `panel` — an absolutely positioned view inside React Flow's transform layer, positioned in canvas coordinates; sheet is the secondary surface beside the transcript.
- `sandbox` — fronts a hosted code-execution service and renders through a browser surface; the display half is covered by terminal and web-preview.
- `toolbar` — @xyflow/react's NodeToolbar, positioned from the owning node's measured DOM rect; the message action row ships inside message, and a composer row is button-group.

## Port-side additions

The registry carries 56 items. Forty are the mapped upstream elements above; the other 16 have no upstream counterpart — base primitives and shared logic modules this port created so the mapped items stay thin. The following table names each and its job:

| Registry item | Kind | Job |
| --- | --- | --- |
| `breadcrumb` | ui | Path trail for file-tree and web-preview headers; a horizontal ScrollView, because a phone bar overflows before it wraps. |
| `button-group` | ui | Segmented row for message actions and composer rows; corner rounding flows through context because React Native has no `:first-child`. |
| `command` | ui | The searchable picker: cmdk is DOM and keyboard-first, so on a phone the palette is a bottom sheet with a filter and a virtualized list; backs the three selectors. |
| `empty` | ui | Icon, title, description, and an optional action — the fallback surface for conversation, file-tree, sources, attachments, and test-results. |
| `input-group` | ui | Leading and trailing addons around a TextInput, with its own focus ring; backs prompt-input and every filter field. |
| `item` | ui | Generic media, content, and actions row; sources, file-tree, attachments, queue, plan, and task render lists of these. |
| `kbd` | ui | Keyboard-shortcut hint; renders null where no hardware keyboard exists, which on a phone is always. |
| `sheet` | ui | Bottom, top, left, or right sheet on @rn-primitives/dialog, mounting its own named PortalHost so overlays opened inside it layer above it. |
| `slider` | ui | Styled shell over @rn-primitives/slider, which RNR does not wrap; the scrubber for audio-player and transcription. |
| `table` | ui | Styled shell over @rn-primitives/table, horizontally scrollable by default; backs schema-display, test-results, package-info, and environment-variables. |
| `markdown` | lib | Closes unterminated emphasis and code runs in a streaming chunk, so a message never flashes literal syntax mid-token. |
| `mono` | lib | The one monospace class contract every mono surface reads. |
| `reasoning-lifecycle` | lib | The reasoning disclosure's timing state machine: auto-open on stream start, auto-close after it ends. |
| `stack-trace-parser` | lib | Pure V8, Node, and Hermes stack-trace frame parsing for stack-trace. |
| `status` | lib | The one status-tone map every status badge reads. |
| `url` | lib | Where a source URL becomes display parts and an open decision; hostname extraction never throws, and the http/https allowlist lives here. |

## Prior art

Two efforts came before this one, and this port builds on both.

The upstream is Vercel AI Elements — React DOM components over shadcn/ui, documented and published at [elements.ai-sdk.dev](https://elements.ai-sdk.dev). Every element in the mapping above was read there first; this registry answers it for React Native and never copies its code.

The earlier React Native port is [muratcakmak/expo-ai-elements](https://github.com/muratcakmak/expo-ai-elements). Its on-device discoveries are baked into this project's planning: registry-URL install as the one distribution path that works for copy-paste components, and the streaming-markdown option rename that silently crashes markdown streaming when missed.

### Why differs

This port differs from both in one structural decision: it stays on React Native Reusables. The web original is React DOM over shadcn/ui with a single styling setup; this registry is universal React Native over RNR primitives, fanned from one source into two engine trees — nativewind, for Tailwind v3 projects, and uniwind, for Tailwind v4 — so the same item installs into either project as source compiled for its engine. The earlier port began on RNR, but its SDK 57 rewrite drops RNR for a private primitives set, and its npm package ships no component code, so registry-URL install is the only path that works there. This registry never publishes an npm package — distribution is the copy-paste registry alone, which is why the two engine trees exist.
