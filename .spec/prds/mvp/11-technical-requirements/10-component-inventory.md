---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Component Inventory — the reuse-before-create ledger

This is the file that makes constraint 1 auditable. Verified from live repo trees
(`vercel/ai-elements@main`, `founded-labs/react-native-reusables@main`) on 2026-09-01.

## The arithmetic

| | Count |
|---|---|
| AI Elements components to port | **49** |
| shadcn/ui primitives they depend on | **55** |
| — of those, RNR already ships | **29 (53%)** → reuse by registry URL, never rebuild |
| — gap with no RNR equivalent | **26** → resolved below |
| Genuinely **new** components written | **6** |

Of 55 primitives, only **6** are built from scratch. Everything else is reused (29),
composed from what exists (10), substituted with a React Native platform affordance
(7), or found unnecessary on mobile (3).

## The 26-primitive gap, resolved

| Primitive | Strategy | Built from | Notes |
|---|---|---|---|
| `breadcrumb` | **compose** | `RNR Text`, `RNR Icon (ChevronRightIcon)`, `RN ScrollView horizontal` | Path trails in file-tree / sandbox / web-preview headers. ~35 lines. Horizontal ScrollView instead of web's wrap-and-ellipsis, since a phone bar overflows before it wraps. Publishes TextClassContext 'text-sm text-muted-foreground' so the trailing crumb can override to 'text-foreground'. |
| `button-group` | **compose** | `RNR Button`, `RNR buttonVariants`, `RN View` | Segmented row for controls / toolbar / message actions. A `flex-row` View plus a small context that publishes corner-radius overrides to first/last children (RN has no `:first-child`). Do NOT try `[&>*:first-child]:` — descendant selectors are web-only and compile to nothing. |
| `command` | **compose** | `RNR Input`, `our sheet`, `RN FlatList`, `RNR Text/Icon`, `our empty`, `our item` | cmdk is DOM+keyboard-first and has no mobile analogue. On device the command palette IS a bottom sheet with a filter field and a virtualized list. Backs model-selector, voice-selector, mic-selector. Critical: any RNR overlay opened from inside it needs a NAMED PortalHost mounted by the sheet, not the root host. |
| `empty` | **compose** | `RNR Text`, `RNR Icon`, `RN View` | Icon + title + description + optional action slot. ~40 lines. This is `ConversationEmptyState` generalized, and it is also the fallback surface for file-tree, sources, attachments, and test-results. Build once, reuse six times. |
| `field` | **compose** | `RNR Label`, `RNR Text`, `TextClassContext` | Label + control slot + description + error text. Publishes 'text-destructive' via TextClassContext when `invalid`, which is how the error state reaches the description Text and its icon without prop drilling. |
| `input-group` | **compose** | `RNR Input`, `RNR Button`, `RNR Icon`, `RN View`, `TextClassContext` | Leading/trailing addons around a TextInput. The highest-leverage gap item — `prompt-input` is built on it, and so are the filter fields in command, attachments, and environment-variables. Must own the focus ring itself (`ring-ring/50` on the wrapper driven by onFocus/onBlur state), because RN has no `:focus-within`. |
| `item` | **compose** | `RN Pressable`, `RNR Text`, `RNR Icon`, `RNR Separator`, `TextClassContext` | Generic media / content / actions row. Second-highest leverage after input-group: sources, file-tree, attachments, model-selector, queue, plan, and task all render lists of these. Publishes TextClassContext so title and description variants style without per-call classes. |
| `kbd` | **compose** | `RNR Text`, `RN View` | ~15 lines. Renders only where a hardware keyboard exists — gated on `Platform.OS === 'web'` by default with an `always` escape for iPad Magic Keyboard. Shows the submit hint in prompt-input. On a phone it renders null, which is correct rather than a compromise. |
| `sidebar` | **compose** | `our sheet`, `our item`, `RNR Separator`, `RNR Button`, `RNR Text`, `RN View` | shadcn's own Sidebar already degrades to a Sheet below its mobile breakpoint — we ship that branch as the default and keep a persistent `View` column behind a width check for web/tablet. A SidebarProvider context carries open state and the collapsed/expanded rail width. Do not port the CSS-variable rail-width machinery; it is a `useState` on native. |
| `spinner` | **compose** | `RNR Icon (Loader2Icon)`, `RNR NativeOnlyAnimatedView`, `react-native-reanimated` | Deliberately NOT RN's ActivityIndicator, despite that being the platform affordance. ActivityIndicator takes a `color` prop and cannot read a Tailwind class, so it would be the one element in the library that ignores TextClassContext and visibly mismatches its surrounding button/badge — a direct hit on constraint 3. A rotating RNR Icon inherits color for free. Uses `reduceMotion: ReduceMotion.System` so it respects the OS accessibility setting. |
| `navigation-menu` | **create** | `@rn-primitives/navigation-menu@1.5.2` | The primitive already exists and RNR simply has not wrapped it — so this is a styled shell (~70 lines) against RNR's template, not new behavior. Reuse-before-create makes it cheap enough to ship, but no component in the 49 requires it on a phone: schedule it in the last wave and cut it if the wave slips. Portal + contentInsets apply. |
| `sheet` | **create** | `@rn-primitives/dialog@1.5.2`, `react-native-reanimated`, `react-native-gesture-handler`, `@rn-primitives/portal`, `RNR dialog as the styling template` | The most load-bearing new component: backs drawer, command, sidebar (mobile), panel, open-in-chat, model-selector. Props: `side` (bottom|top|left|right), `snapPoints`, `dismissOnPan`. Must mount its own NAMED PortalHost so overlays opened inside it layer above it. iOS content wraps in `FullWindowOverlay` per RNR's dialog. Web renders without the pan gesture. |
| `slider` | **create** | `@rn-primitives/slider@1.5.2`, `RNR switch/progress as the styling template` | Primitive exists, RNR has not wrapped it. Styled shell only. Needed by audio-player (scrubber), transcription (seek), voice-selector (rate/pitch), controls. Enlarge the thumb hit-slop well past its visual size — the web thumb size is not a touch target. |
| `table` | **create** | `@rn-primitives/table@1.5.2` | Primitive exists, RNR has not wrapped it. Backs schema-display, test-results, package-info, environment-variables. Wrap in a horizontal ScrollView by default — a phone-width table with more than two columns needs horizontal scroll, and web's `table-layout` has no RN equivalent. Column widths are explicit flex values, not `auto`. |
| `toast` | **create** | `@rn-primitives/toast@1.5.2`, `@rn-primitives/portal`, `RNR alert as the styling template` | Primitive exists, RNR has not wrapped it. Variants default/destructive/success, matching RNR's Alert palette so the two are visually one family. Respects safe-area insets on both edges — a toast at `bottom-0` sits under the home indicator. |
| `toaster` | **create** | `our toast`, `@rn-primitives/portal`, `react-native-safe-area-context` | The host plus the imperative `toast()` API — a tiny module-level queue store (`useSyncExternalStore`) and a `<Toaster />` that renders it. Explicitly documented to mount as a sibling of RNR's `<PortalHost />` in the root layout; mounted inside a screen it disappears on navigation. This is the one gap item with real state, and it is ~80 lines, not a library. |
| `calendar` | **substitute** | `@react-native-community/datetimepicker (Expo-pinned 9.1.0)` | Building a month grid is the wrong answer on mobile — the OS picker is the platform affordance and users already know it. Not a registry item; documented in the example app where a date is actually needed. react-day-picker is DOM-only regardless. |
| `carousel` | **substitute** | `RN FlatList horizontal pagingEnabled`, `RN ScrollView pagingEnabled` | Embla is DOM-only. Attachment galleries and image strips are a horizontal paged FlatList — one prop, zero dependencies, correct momentum physics for free. Used inline inside `attachments`/`image`, not shipped as its own item. |
| `drawer` | **substitute** | `our sheet (side="bottom")` | vaul's Drawer and shadcn's Sheet collapse to one component on mobile. Building both is duplicated gesture and Reanimated code with two sets of bugs. `drawer` is exported as a thin alias so ported AI Elements sources that reference Drawer keep compiling. |
| `pagination` | **substitute** | `RN FlatList onEndReached / onEndReachedThreshold` | Numbered page controls are a desktop pattern. Long result sets (sources, test-results, queue) page in on scroll. No item shipped. |
| `resizable` | **substitute** | `RNR Tabs`, `our sheet` | react-resizable-panels needs a pointer drag. Split views in canvas / panel / sandbox become Tabs on phone, and a detail bottom sheet where the panes are asymmetric. A gesture-handler drag divider is possible on tablet/web but is deferred — it is polish on a surface that already works. |
| `scroll-area` | **substitute** | `RN ScrollView`, `RN FlatList` | Radix ScrollArea exists to replace the browser's scrollbar chrome. React Native has no scrollbar chrome to replace, and there is no `@rn-primitives/scroll-area` (confirmed absent from the npm scope). ScrollView *is* the scroll area. Every ported `<ScrollArea>` becomes a plain ScrollView with a `max-h-*` class. |
| `sonner` | **substitute** | `our toast`, `our toaster` | Sonner is a DOM toast library — it cannot be ported, only replaced. Every ported `toast()` call site maps onto our imperative `toast()` backed by @rn-primitives/toast. Listed separately from `toast` because the ported sources import from `sonner` by name and the build script must retarget those imports. |
| `chart` | **unnecessary** | — | Recharts is DOM+web-SVG. No component in the 49 needs a plotted chart on mobile: `test-results` needs a progress bar (RNR Progress) and `package-info` needs counts (Text + Badge). RNR's own scope excludes components requiring third-party libraries beyond @rn-primitives; a charting surface would violate that. If one ever appears, it belongs in the consumer's app on victory-native, not in this registry. |
| `form` | **unnecessary** | — | shadcn's Form is a react-hook-form + zod adapter. Neither is a UI concern and both are the consumer's choice. Every AI Elements surface that looks like a form (`prompt-input`, `environment-variables`, `confirmation`) is a controlled TextInput and needs no resolver. Shipping this would import a state library into a presentation registry. |
| `input-otp` | **unnecessary** | — | Nothing in the 49 AI Elements components takes a one-time code. It appears in the shadcn dep list because the upstream registry declares a broad common set. RNR's own `verify-email-form` auth block already covers this if a consumer needs it. |

The five `create` items that are cheap: `slider`, `table`, `toast`, `navigation-menu` (and
`toolbar`) exist as `@rn-primitives` packages at 1.5.2 that RNR simply never wrapped. Those
are styled shells against RNR's own template, not new behavior. **`sheet` is the expensive
one** — it backs drawer, command, sidebar, panel, open-in-chat and model-selector, and it
must mount its own **named `PortalHost`** or every overlay opened inside it renders behind it.

## Porting verdicts — all 49 components

22 port-at-parity · 11 port-adapted · 10 native-substitute · 6 out-of-scope

| Component | Verdict | Tier | Composition | Reason |
|---|---|---|---|---|
| `agent` | port-at-parity | agent-surface | pure-rnr | Identity card composed from RNR avatar, card, badge, and text; no browser API and no hover dependency. |
| `artifact` | port-adapted | agent-surface | pure-rnr | Web renders it as a side panel next to the transcript. A phone has no side; it becomes a full-screen sheet with a return control that preserves transcript scroll position. |
| `attachments` | native-substitute | agent-surface | pure-rnr | The chip row ports at parity, but file acquisition cannot: drag-and-drop and the file input are replaced by the native image and document pickers, which changes the permission and dependency contract. |
| `audio-player` | native-substitute | specialist | new-visual | Built on the HTML audio element. Replaced by a native audio module; transport controls and progress bar keep the same product surface. |
| `canvas` | out-of-scope | specialist | new-visual | It is a react-flow workspace. There is no react-flow on React Native, and a pan-and-pinch node graph on a phone is a separate product, not a port. Alternative: render the same agent structure as the plan and task lists. |
| `chain-of-thought` | port-at-parity | agent-surface | new-visual | Collapsible step list built from RNR collapsible, text, and icon; behavior is identical on touch. |
| `checkpoint` | port-at-parity | agent-surface | pure-rnr | A labelled divider in the transcript composed from RNR separator, badge, and text. |
| `code-block` | native-substitute | minimum-chat | new-visual | Web highlighting relies on a DOM-emitting highlighter and CSS overflow. Requires a React Native safe tokenizer rendering into Text spans plus a horizontal ScrollView and a clipboard copy action. |
| `commit` | port-at-parity | agent-surface | pure-rnr | Card of hash, message, and author with a copy action; composes from RNR card, text, and button. |
| `confirmation` | port-at-parity | agent-surface | pure-rnr | Composes from RNR card and button. Only change is enforcing platform minimum touch targets, which is a sizing token, not a different component. |
| `connection` | out-of-scope | specialist | new-visual | Part of the react-flow canvas family; it is an SVG connection line with pointer-drag semantics that has no meaning outside a node editor. |
| `context` | port-adapted | agent-surface | pure-rnr | Token and cost breakdown is revealed on hover in the web version. On touch it becomes a press-opened popover; the data displayed is unchanged. |
| `controls` | port-adapted | specialist | new-visual | The button and toggle cluster ports from RNR primitives, but placement must move into thumb reach and targets must meet the platform minimum, which changes layout rather than composition. |
| `conversation` | native-substitute | minimum-chat | pure-rnr | The whole value is stick-to-bottom scrolling, which on web comes from an overflow container plus a scroll hook. React Native needs a list with maintainVisibleContentPosition or an inverted list plus keyboard and safe-area handling. Same product surface, entirely different implementation, and the highest-risk item in the initiative. |
| `edge` | out-of-scope | specialist | new-visual | react-flow canvas family; an SVG edge path with no standalone mobile use. |
| `environment-variables` | port-at-parity | agent-surface | pure-rnr | Masked key and value rows with a reveal toggle; composes from RNR input, toggle, and button. |
| `file-tree` | port-adapted | agent-surface | new-visual | The nested rows port, but deep indentation is unusable at phone width; needs horizontal scroll or a drill-in navigation model, which changes the interaction. |
| `image` | port-at-parity | agent-surface | pure-rnr | React Native Image accepts data URIs, so generated images render with the same props and aspect-ratio behavior. |
| `inline-citation` | port-adapted | agent-surface | pure-rnr | Hover cards do not exist on touch and inline positioning inside React Native Text is constrained; becomes a pressable inline chip that opens a popover. |
| `jsx-preview` | out-of-scope | agent-surface | new-visual | It evaluates a JSX string at runtime. Hermes has no runtime JSX transform and shipping an evaluator is an app-store and security problem. Alternative: render the described UI server-side and show it as an artifact or a web preview. |
| `message` | port-at-parity | minimum-chat | pure-rnr | Role-based alignment, surface, and avatar all compose from RNR primitives. Note that its content rendering pulls in the markdown renderer decision, which is the real work. |
| `mic-selector` | native-substitute | specialist | pure-rnr | Web enumerates input devices through the media devices API. iOS and Android do not expose an enumerable input device list; they expose audio routes. Ships as a route picker (built-in, wired, Bluetooth) with the same product job. |
| `model-selector` | port-adapted | agent-surface | pure-rnr | A dropdown on web; on mobile the correct pattern is a bottom sheet with search, sized for one-handed use. Same selection contract, different presentation. |
| `node` | out-of-scope | specialist | new-visual | react-flow canvas family; a draggable graph node with no standalone mobile use. |
| `open-in-chat` | port-adapted | agent-surface | pure-rnr | Same buttons and same targets, but window opening is replaced by the platform link handler, and unavailable targets must be hidden rather than opened into a dead tab. |
| `package-info` | port-at-parity | agent-surface | pure-rnr | Card of package name, version, and a copyable install command; all RNR primitives. |
| `panel` | native-substitute | specialist | new-visual | Built on drag-to-resize split panes, which requires a pointer and screen width a phone does not have. Ships as a tabs or bottom-sheet layout that serves the same job of showing a secondary surface beside the transcript. |
| `persona` | port-at-parity | specialist | pure-rnr | Avatar, name, and description card composed from RNR primitives. |
| `plan` | port-at-parity | agent-surface | pure-rnr | Ordered step list with per-step status; composes from RNR collapsible, badge, icon, and text. |
| `prompt-input` | native-substitute | minimum-chat | pure-rnr | Looks the same but almost nothing underneath survives: keyboard avoidance, auto-growing multiline TextInput, safe-area insets, and an explicit send button replacing enter-to-submit. Second-highest-risk item after conversation. |
| `question` | port-at-parity | agent-surface | pure-rnr | A pressable card or pill for a clarifying question; RNR button and card. |
| `queue` | port-at-parity | agent-surface | pure-rnr | A list of pending messages with a remove action; RNR list composition plus the new item primitive. |
| `reasoning` | port-at-parity | agent-surface | new-visual | Auto-opening and auto-collapsing disclosure with a duration label; RNR collapsible plus the shimmer substitute. |
| `sandbox` | out-of-scope | agent-surface | new-visual | It fronts a hosted code-execution service and renders its output through a browser surface. A component registry cannot ship the execution half, and the display half is already covered by terminal and web-preview. |
| `schema-display` | port-adapted | agent-surface | new-visual | The nested schema tree ports, but nesting depth and key widths need collapsing and horizontal scroll to stay legible at phone width. |
| `shimmer` | native-substitute | agent-surface | new-visual | The web effect is an animated CSS gradient with background-clip on text. React Native needs a Reanimated driver with a masked view; visually equivalent, structurally different. |
| `snippet` | port-adapted | agent-surface | pure-rnr | Tabs and code line port from RNR tabs and text, but clipboard access moves to the native clipboard module and long commands need horizontal scroll. |
| `sources` | port-at-parity | agent-surface | pure-rnr | Collapsible list of source rows; RNR collapsible, separator, and text. |
| `speech-input` | native-substitute | specialist | new-visual | Built on browser media recording and speech recognition. Requires native audio recording plus a speech recognition module, runtime microphone permission, and a level indicator driven by native metering. |
| `stack-trace` | port-at-parity | agent-surface | new-visual | Monospace frame list with expandable frames; needs horizontal scroll but no interaction redesign. |
| `suggestion` | port-at-parity | agent-surface | pure-rnr | Horizontally scrollable pill row maps directly to a horizontal ScrollView plus RNR buttons, and swiping is a better fit on touch than on web. |
| `task` | port-adapted | agent-surface | pure-rnr | Collapsible task row with status and touched files; RNR collapsible, badge, and text. Adaptation: `defaultOpen: false` (web ships `true`) — phone-density rule keeps the transcript scannable; the trigger row carries the status badge so state stays glanceable collapsed. |
| `terminal` | port-adapted | agent-surface | new-visual | Ships as a read-only, horizontally scrollable monospace log view with ANSI colors mapped to theme tokens. An interactive pseudo-terminal is explicitly not part of this. |
| `test-results` | port-at-parity | agent-surface | new-visual | Pass, fail, and skip counts with expandable per-test rows; composes from RNR badge, collapsible, and text. |
| `tool` | port-at-parity | agent-surface | new-visual | The central agent component. State header plus input and output disclosure, all from RNR collapsible, badge, and code-block. Must cover every AI SDK tool-part state. |
| `toolbar` | port-at-parity | specialist | pure-rnr | A row of icon buttons above or below the composer; RNR button and toggle-group with mobile touch-target sizing. |
| `transcription` | port-at-parity | specialist | new-visual | Display-only live transcript text with an interim and final distinction; capture belongs to speech-input, so this component itself has no browser dependency. |
| `voice-selector` | port-adapted | specialist | pure-rnr | Voice list ports, but the picker becomes a bottom sheet and the available voice set comes from the native speech synthesis provider rather than the browser. |
| `web-preview` | native-substitute | agent-surface | new-visual | An iframe with a URL bar and console. Replaced by a native webview with the same URL bar and reload affordance, shipped as an opt-in registry entry that declares react-native-webview as a peer dependency. The console pane does not port and is dropped. |


## Minimum usable chat

`conversation` · `message` · `prompt-input` · `code-block` — four components. Everything else is additive, and
this set is what the first shipping wave must deliver together.

## Two composition laws that are behavior, not styling

Both are tested in the web original and both put two outcomes in one row, which makes them
mistap generators on touch unless each target gets a real size:

1. **`file-tree`** — the chevron expands/collapses; the **name** selects. One tap must not
   do both. If both targets cannot get 44pt, move one behavior to long-press; do **not**
   merge them into "tap does both".
2. **`voice-selector`** — tapping the preview button **plays** the sample and must **not**
   select the voice.
