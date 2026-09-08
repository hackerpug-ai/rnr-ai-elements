# Style-Parity Remediation — Disposition Table

**Provenance.** Derived from `design/style-parity-report.md` §1 (top unexplained drifts), with
target values quoted from the pinned web snapshot `vercel/ai-elements@6a9d5b1`
(`~/.cache/agent-scratch/rnr-web-ref/packages/elements/src/`). Policy (user-approved): **converge +
record** — converge values/structure to the web look; keep genuinely mobile-forced affordances,
each written into the record in the same pass. No code edit happens before this table is approved.

**Legend.** CONVERGE = change code to the web value/structure. KEEP = mobile-forced; record it.
DEFER = feature-level work outside a style remediation; record as deferred.

| # | §1 item / component(s) | Disposition | Exact target (web anchor) | Notes |
|---|---|---|---|---|
| 1 | message — user bubble | CONVERGE values; KEEP avatar (record) | `bg-secondary`, `text-foreground` bubble; `rounded-lg`; `px-4 py-3`; `gap-2` (message.tsx:57-58) | Replace `bg-primary`/`text-primary-foreground` on ai/message.tsx:71-79; `rounded-xl`→`rounded-lg`, `px-3 py-2`→`px-4 py-3`. KEEP MessageAvatar + `flex-row items-end` (mobile convention, absent at pinned web) — header comment corrected to say so. |
| 2 | terminal — surface | CONVERGED | `bg-zinc-950 text-zinc-100`, `rounded-lg` (terminal.tsx:250) | Port :103 `bg-muted rounded-md` → near-black surface. Consumer `@theme` declares `--color-zinc-950`/`--color-zinc-100`; safelist `bg-zinc-950`, `text-zinc-100`. ✅ DONE — root, header border-zinc-800, fixed-palette ANSI remap, per-span text-zinc-100 default (nested-Text rule; found by capture zoom). Evidence: remediation-wave-a/terminal-board.png. |
| 3 | test-results — pass/fail bar | CONVERGE | two-segment bar: container `h-2 overflow-hidden rounded-full bg-muted`, segments `bg-green-500` / `bg-red-500` width% (test-results.tsx:179-185); duration label `text-sm` sans (:75) | Replace single `<Progress>` (port :183) with flex-row of two percentage-width Views. Duration label drops `text-xs` mono for `text-sm`. Safelist adds `bg-green-500`, `bg-red-500`. |
| 4 | tool — status badge | CONVERGE badge + hues; KEEP destructive-for-error (record); KEEP chain-of-thought enrichment (record) | Badge `variant="secondary" className="gap-1.5 rounded-full text-xs"` (tool.tsx:74); `text-yellow-600` approval-requested, `text-blue-600` approval-responded, Running NO color, `text-green-600` success, `text-orange-600` denied (tool.tsx:62-72) | Port :193-200 → secondary/rounded-full/gap-1.5; tool's tone map gains yellow/blue (dark:yellow-400/blue-400), running inherits. `lib/status.ts` shared map untouched (other consumers keep the recorded 5-tone palette). chain-of-thought keeps its per-status colored icons — recorded enrichment, web shows static neutral dots. |
| 5 | conversation — density + missing surfaces | CONVERGE gap; CONVERGE empty state; DEFER download | content gap `gap-8` (conversation.tsx:32); `ConversationEmptyState` = icon + title + description | Port :102 `gap-3`→`gap-8`. EmptyState composed from the port's own `empty` atom when no messages. ConversationDownload DEFER — feature-level (share sheet design), recorded as deferred, not a style fix. |
| 6 | transcription — layout | CONVERGE | flowing inline paragraph: `flex flex-wrap gap-1` (transcription.tsx:62) | Port :123 stacked blocks → ONE wrapping parent `Text` with nested per-segment `Text` children (true RN inline flow), single-space separators, per-segment explicit colors (standing no-`/NN` rule for interim dimming). |
| 7 | speech-input — record button | CONVERGE | idle = filled `bg-primary text-primary-foreground` pill + 3 pulsing rings (speech-input.tsx:291-310) | Port :102-103 ghost icon → filled pill; rings = absolutely-positioned `rounded-full` Views pulsing via Reanimated (Skeleton's `ReduceMotion.System` pattern). |
| 8 | file-tree — selection + folder hue | CONVERGE | selected row fill `bg-muted` (file-tree.tsx:175); folder glyph `text-blue-500` (:198) | Port :335 `font-medium`-only selection → row-level `bg-muted`; port :316 muted folder → `text-blue-500` (safelist add; `bg-muted` is a token). |
| 9 | commit + artifact — container & hash chip | CONVERGE | both roots `bg-background` (commit.tsx:26, artifact.tsx:20); hash = bare `font-mono text-xs` + inline GitCommitIcon (commit.tsx:59-60) | Add `bg-background` override on both port Cards (bg-card default); commit hash Badge → mono Text + icon. KEEP-record: artifact-as-sheet (PRD verdict), commit add/del escape colors (wave-8). |
| 10 | reasoning — label + motion | CONVERGE label; KEEP motion (record) | trigger label = bare `text-sm text-muted-foreground`, no badge (reasoning.tsx trigger) | Remove the invented `Badge variant="secondary"` wrapper on the trigger label. Collapsible entry/exit animation: RNR Collapsible's native layout animation stands in for web's `animate-in/out` slide-fade — recorded, no code. |
| 11 | voice-selector — preview + attributes | CONVERGE controls; KEEP 40pt target (record) | preview button `variant="outline"`, 12px icon, animated loader (voice-selector.tsx:502-518); gender marks incl. `MarsStrokeIcon`, `VenusAndMarsIcon`, default `CircleSmallIcon` (16px set) (:205-229); bullet `•`; age `tabular-nums` (:423-471) | Port :413-428 ghost→outline (visual border restored), icon 16→12, loader spins via Reanimated rotate (ReduceMotion-aware); gender-mark set + icon sizes restored (all icons verified present in lucide-react-native@0.577). The BUTTON stays 40pt (touch floor) while its icon converges. |
| 12 | environment-variables / package-info | CONVERGE env headers away; KEEP package-info compression (already recorded) | env rows = headerless `divide-y` rows, name left / value right (environment-variables.tsx:137,227) | Drop the added `Key`/`Value` header rows in the port's table; keep the Table atom itself (PRD primitive decision) recorded. package-info's monochrome badges are the wave-12 recorded compression — no code. |
| 13 | attachments — remove-button geometry | CONVERGE inset; KEEP size/visibility/icon (record) | `top-2 right-2` = 8px inset (attachments.tsx:343-347) | Port `right-1 top-1`→`right-2 top-2`. 40pt button, always-visible, 16px X stay (touch floor; hover-reveal has no analogue) — recorded keeps. |
| 14 | selector substrate (command, model/mic) | CONVERGE search padding + chevron + check; KEEP SheetTitle/empty-state (record) | search row `py-3.5` (prompt-input.tsx search analog); mic chevron `ChevronsUpDownIcon` (mic-selector.tsx:18,241); check = trailing `CheckIcon` (`ml-auto size-4`) on selected rows + equal-size placeholder `div` on unselected, consumer-rendered (model-selector.tsx:302-306 — reserved slot, no row jitter) | command.tsx input padding `py-2`→`py-3.5`; mic-selector chevron aligned to siblings+web; model-selector check: consumer-rendered trailing 16px slot after the text — CheckIcon (via the Icon wrapper) when selected, equal-size empty View when not. Visible SheetTitle + SearchX empty state stay (touch/a11y) — recorded. |

## Consumer-side additions required (the standing engine rules)

- **`apps/harness/src/global.css` `@theme`** (Tailwind-default palette slices the CSS-first build
  lacks): `--color-zinc-950`, `--color-zinc-100`, `--color-yellow-600`, `--color-yellow-400`,
  `--color-blue-400`, `--color-blue-500`, `--color-blue-600`, `--color-red-500` (green-500 exists).
  Values = Tailwind v4 default palette, verified at implementation from the installed tailwindcss
  package (no hand-invented hex).
- **`apps/harness/src/class-safelist.tsx`** (data-map + new-file rule, waves 9-12 pattern):
  `bg-zinc-950`, `text-zinc-100`, `bg-green-500`, `bg-red-500`, `text-yellow-600`,
  `dark:text-yellow-400`, `text-blue-600`, `dark:text-blue-400`, `text-blue-500`, `gap-8`,
  `py-3.5` — each cross-file-scanned before declaration, then device-verified in the style map.
- Registry sources stay engine-agnostic; no new runtime dependencies (rings/rotation ride the
  existing reanimated + ReduceMotion pattern).
- No `/NN` color opacity modifiers introduced; per-segment explicit colors only.

## Sequencing

Waves in goal order: A (items 1-4) → B (5-8) → C (9-14) → ledger repairs → final gate. Each wave:
implement via `react-native-reusables-implementer`, review via `react-native-reusables-reviewer`,
then gates (tsc / vitest / biome / registry:build / check:registry / both contracts) and iOS
simulator captures per changed component before the wave closes.

## Approval

**GATE: no code edit before this table is approved.** Any row can be flipped (e.g. KEEP instead of
CONVERGE) by naming it — the table is the record either way.

APPROVED by the user (verbatim "approve") before any code edit.

## Execution status

**FINAL GATE — PASSED (independent sweep on the final tree).** tsc 0 · vitest 385/385 · biome 0
(1 pre-existing config-migration info baseline) · registry fresh 56×2 · styling contract OK ·
component contract 0 violations · 18 on-device captures (wave-a 4, wave-b 6, wave-c 8) under
`design/goldens/mobile-ios/remediation-wave-{a,b,c}/`. Ledger repaired: PRD inventory bumped to
v2.1.0 (agent/question/confirmation → port-adapted, true reasons), checkpoint/artifact/message
header comments state the web truth, and this table + style-parity-report.md §6 record every
outcome with evidence paths.

Residual notes (recorded, non-blocking): the conversation `emptyState` prop is additive API not
yet exercised by a story (the First Run story carries the capture via call-site composition);
nested-segment VoiceOver focusability in the inline transcription (N3) should be watched in a
manual pass; file-row name-alignment spacer (web size-4) is pre-existing and out of scope;
command's search-field fix rides the vendored input-group atom via a scoped className override,
not an atom edit (4 other consumers unharmed).

**Wave C — COMPLETE.**

**Wave B — COMPLETE.** Rows 5-8 implemented and reviewed (blocking: conversation.json was missing
the `empty` registry dependency — source-fixed in packages/registry/registry.json; render-prop branch
dropped interimText — restored). One orchestrator error corrected on the record: the parity audit
misread the web's ring gate — the pinned snapshot renders rings `{isListening && ...}` (WHILE
recording, alongside the destructive pill), not at idle; the port matches the snapshot. Gates green
(tsc 0 · vitest 385/385 · biome 0 · registry fresh · both contracts 0). Device evidence:
`design/goldens/mobile-ios/remediation-wave-b/` — chat-populated (gap-8 density), chat-first-run
(empty atom), transcription-board (flowing inline paragraph, explicit per-segment colors),
speech-input-idle (filled bg-primary pill, no rings) + speech-input-recording (destructive pill +
pulsing ring mid-animation), file-tree-selected (bg-muted row fill + text-blue-500 folder glyphs).
Reviewer minors recorded: M2 emptyState prop currently unexercised by stories (call-site First Run
composition carries the capture); N3 nested-segment VoiceOver focusability to watch; N5 file-row
name-alignment spacer is pre-existing, out of scope.

**Wave A — COMPLETE.** Rows 1-4 implemented (implementer), adversarially reviewed
(react-native-reusables-reviewer: 2 blocking found and fixed — zero-height bar segments B1,
unsafelisted inverse-ANSI classes M1 — plus N1 shimmer contrast, N2 guard honesty), all gates green
(tsc 0 · vitest 385/385 · biome 0 · registry fresh 56×2 · both contracts 0 violations). Device
evidence (iOS 17 sim, Expo Go, uniwind harness): `design/goldens/mobile-ios/remediation-wave-a/` —
`test-results-board.png` (green/red two-segment bar + passing-run 100% bar), `chat-populated.png`
(bg-secondary user bubble, dark text), `terminal-board.png` (bg-zinc-950 surface, zinc/blue ANSI,
inverse chips, bright plain lines after the span-default fix), `tool-lifecycle.png` (all 7 badge
states: pill secondary badges, yellow/blue approval hues, no-color Pending/Running). Two extra
defects found ON DEVICE and fixed in-wave: the wave-13 nested-Text inheritance rule violation
(plain terminal spans fell back to near-black — fixed with an explicit per-span `text-zinc-100`
default) and the brief's own icon error (input-streaming converged to the web's circle, not clock).
Reviewer minors recorded, not fixed: `ToolStatusMeta.tone` field is vestigial for approval states;
bar a11y restored via accessibilityRole/value (fixed with B1); pre-existing biome info baseline.
---

## Sprint-01 installed-app consumer @theme obligation (TASK-F7)

**Finding.** The walking-skeleton install (TASK-F3, real RNR CLI from the pinned v0.1.0
tag) writes nine `(dark:)text|bg|border-<palette>-<step>` classes from
`apps/example/lib/status.ts`, `apps/example/components/ai/tool.logic.ts` and
`apps/example/components/ui/icon.tsx`. Uniwind's RN interop carries no Tailwind default
`@theme`, so each class compiles to nothing — renders colorless, no error — unless the
consuming app's `apps/example/global.css` declares the matching `--color-*` var. That
obligation is **silent**: the registry ships no `cssVars` (see ESCALATION 3), so nothing
in the install flow declares these colors for the consumer. This section records the
derivation, the declared slice, the harness full set the app is NOT inheriting, and the
three escalations for sprint-03's distribution decision. **No fix is chosen here.**

### OBLIGATION-DERIVATION-SPRINT-01-START

Derivation (checklist rows 2/3/4/6 run against the installed tree — `apps/example/components`
+ `apps/example/lib`, never `packages/registry/src`). Verbatim stdout:

Row 2 — derived set (sorted unique `--color-*` names written by the installed tree) and count:

```text
--color-blue-400
--color-blue-600
--color-green-500
--color-green-600
--color-orange-500
--color-orange-600
--color-red-500
--color-yellow-400
--color-yellow-600
9
```

Row 3 — `comm -23` (derived but missing from `apps/example/global.css`); empty = 0 lines:

```text
```

Row 4 — `comm -13` (declared in `apps/example/global.css` but not referenced by the
installed tree); empty = 0 lines:

```text
```

Row 6 — safelist files under `apps/example`; `0` = no safelist crutch:

```text
0
```

### OBLIGATION-DERIVATION-SPRINT-01-END

### OBLIGATION-TABLE-SPRINT-01-START

The declared slice in `apps/example/global.css` `@theme` — 9 entries, one row per class,
each naming the item and the module that writes it. Every value is transcribed verbatim
from the installed `tailwindcss` package's `theme.css` (verified: `9 declared; 0 invented
values`).

| `--color-*` | item | module writing the class | tone / note |
|---|---|---|---|
| `--color-green-500` | tool | `lib/status.ts` | success, dark twin (`dark:text-green-500`) |
| `--color-green-600` | tool | `lib/status.ts` | success |
| `--color-orange-500` | tool | `lib/status.ts` | denied, dark twin (`dark:text-orange-500`) — the entry a 3-class comment at `apps/harness/src/global.css:28-34` missed while `lib/status.ts` writes four classes |
| `--color-orange-600` | tool | `lib/status.ts` | denied |
| `--color-yellow-400` | tool | `components/ai/tool.logic.ts` | approval-requested, dark twin |
| `--color-yellow-600` | tool | `components/ai/tool.logic.ts` | approval-requested |
| `--color-blue-400` | tool | `components/ai/tool.logic.ts` | approval-responded, dark twin |
| `--color-blue-600` | tool | `components/ai/tool.logic.ts` | approval-responded |
| `--color-red-500` | icon (RNR primitive) | `components/ui/icon.tsx` | the installed icon item's JSDoc `@example` literal `text-red-500` (a class the mechanical derivation rows count, so the slice declares it) |

### OBLIGATION-TABLE-SPRINT-01-END

**FULL-SET — the harness's full declaration set, marked NOT declared in this app.**
`apps/harness/src/global.css` today declares 62 `--color-*` lines / 39 distinct names:
16 entries in its `@theme` escape/remediation palette slice (`--color-green-500`,
`--color-green-600`, `--color-orange-600`, `--color-zinc-500`, `--color-zinc-700`,
`--color-zinc-800`, `--color-zinc-950`, `--color-zinc-100`, `--color-yellow-600`,
`--color-yellow-400`, `--color-blue-400`, `--color-blue-500`, `--color-blue-600`,
`--color-red-500`, `--color-neutral-400`, `--color-neutral-500`) plus 23 role tokens in its
`@layer theme` block declared twice each — once in the light block, once in the dark block
(`--color-background` … `--color-ring`, with `--color-chart-1` through `--color-chart-5`
among the twice-declared names). That full set is sprint-02's inheritance for the per-item
table; the palette slice + the double-declared chart role tokens alone account for
`26` declaration lines / `21` distinct names (the 16 `@theme` palette entries declared
once, plus `--color-chart-1` … `--color-chart-5` declared twice). **NOT declared in this
app's `@theme` slice:** apps/example declares only the 9 rows of
OBLIGATION-TABLE-SPRINT-01; the harness's `@theme` extras (`--color-zinc-100/500/700/800/950`,
`--color-blue-500`, `--color-neutral-400/500`) are not transcribed into the consumer
`@theme` — over-declaring would hide which installed item requires what. (RNR's role
tokens, including the chart-1..5 pair, do live in this app's `@layer theme` block as
F1's verbatim RNR theme — untouched; they are obligations of that theme block, not of
the palette slice this record tracks.)

### ESCALATION 1 — our own harness never declared orange-500 (a denied status renders colorless in dark mode)

The comment at `apps/harness/src/global.css:28-34` enumerates three escape classes
(`text-green-600` / `dark:text-green-500` / `text-orange-600`) while
`packages/registry/src/lib/status.ts` writes four — `success: 'text-green-600
dark:text-green-500'` and `denied: 'text-orange-600 dark:text-orange-500'` — so
`--color-orange-500` was never transcribed and a denied tool status renders colorless in
dark mode in our own harness. Reproduce:

```bash
grep -c -- '--color-orange-500' apps/harness/src/global.css; grep -c 'dark:text-orange-500' packages/registry/src/lib/status.ts
```

prints `0` then `2` (0 = never declared in the harness css; 2 = the registry's `status.ts`
writes `dark:text-orange-500` — once in its doc comment, once in the `denied` map).

### ESCALATION 2 — shipped items point consumers at a `class-safelist.tsx` that will not exist in their tree

Both shipped items carry a comment instructing consumers to safelist classes in a harness
path (`class-safelist.tsx`) that a consumer install never creates. Reproduce:

```bash
grep -c class-safelist public/r/uniwind/file-tree.json public/r/uniwind/transcription.json
```

prints `1` for each file.

### ESCALATION 3 — not one shipped item declares `cssVars`, so the obligation reaches the consumer as nothing at all

The RNR CLI merges no theme block, and no registry item declares a `cssVars` payload, so
the palette requirement recorded above arrives at the consumer as nothing. Reproduce:

```bash
node -e "const r=require('./packages/registry/registry.json');console.log(r.items.length, r.items.filter(i=>i.cssVars&&Object.keys(i.cssVars).length).length)"
```

prints `56 0` (56 items, 0 with a non-empty `cssVars`).

**Distribution decision — NOT made here.** Whether the fix is registry `cssVars`, a
documented install prerequisite, or converting the escape colors back to RNR roles is
sprint-03's call, and it needs the flip evidence this task deliberately does not pre-empt.
