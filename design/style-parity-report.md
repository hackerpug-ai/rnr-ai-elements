# Style-Parity Audit — web AI Elements vs this port

**Provenance.** Web source pinned at `vercel/ai-elements@main` / `6a9d5b1` (`packages/elements/src/*.tsx`,
snapshotted out-of-repo). Port source: `packages/registry/src/components/{ai,ui}/*.tsx` at HEAD.
Method: 7 parallel parity batches (one component family each) + inline `checkpoint` audit; every
finding carries line-anchored quotes from BOTH sides; orchestrator spot-verified 8 of the
highest-impact claims against the raw files (all held). Audit only — no component was edited.

**Scope.** 40 of the web library's 49 components (the 9 out-of-scope items — canvas, node, edge,
connection, controls, toolbar, panel, sandbox, jsx-preview — were excluded by the PRD verdict and
are not audited). The referenced docs entry point for the audit was
`https://elements.ai-sdk.dev/components/attachments`; source code is the authority the docs render.

**Scoreboard.** 40/40 components carry at least one deviation: **28 MAJOR · 12 MINOR**, ~330
line-anchored findings. Zero components are byte-parity. That is expected — the PRD verdict table
itself declares 22 at-parity / 11 adapted / 10 native-substitute — but a large share of the drift
below is **not on the record** (§2), and several items contradict the record (§4).

---

## 1. Top unexplained style drifts (ranked by product visibility)

1. **message — user-bubble token family flipped.** Web user bubble is
   `group-[.is-user]:bg-secondary … :text-foreground` (light bubble, dark text — message.tsx:58);
   port renders `bg-primary` + `text-primary-foreground` (near-black bubble, white text —
   ai/message.tsx:71,79). Also radius `rounded-lg`→`rounded-xl`, padding `px-4 py-3`→`px-3 py-2`,
   and the port adds a `MessageAvatar` that the pinned web Message does not have, while its own
   header comment claims "the web original's layout unchanged." This is the chat's signature look.
2. **terminal — surface inverted.** Web root `bg-zinc-950 text-zinc-100` (near-black terminal,
   terminal.tsx:250) → port `bg-muted` + default foreground (ai/terminal.tsx:103). A terminal that
   reads as a light grey card. ANSI color mapping was recorded in wave 12; the surface swap was not.
3. **test-results — pass/fail bar lost its second segment.** Web renders a two-segment
   `bg-green-500`/`bg-red-500` h-2 bar (test-results.tsx:179-185); port renders a single
   `<Progress>` in `bg-primary` (ai/test-results.tsx:183). The red failed fraction is gone.
4. **tool — status badge family + hue compression.** Web badge `variant="secondary" gap-1.5
   rounded-full text-xs` with `text-yellow-600` (approval-requested) and `text-blue-600`
   (approval-responded); Running clock has NO color (tool.tsx:71-82). Port: `variant="outline"
   gap-1` (no `rounded-full`), yellow/blue collapsed to `text-primary`/`text-muted-foreground`,
   and Running GAINS a color it never had (ai/tool.tsx:193-200, lib/status.ts). Same compression
   hits chain-of-thought step icons and test-results/summary badges.
5. **conversation — density + missing upstream surfaces.** Web content gap `gap-8` (32px,
   conversation.tsx:32) → port `gap-3` (12px, ai/conversation.tsx:102). `ConversationEmptyState`
   and `ConversationDownload` (web 1.6 surfaces) are absent from the port and from the record.
6. **transcription — layout grammar changed.** Web is a flowing inline paragraph
   (`flex flex-wrap gap-1`, transcription.tsx:62); port stacks full-width segment blocks
   (column `gap-2`, ai/transcription.tsx:123). The recorded interim-dimming decision survives,
   but the paragraph-vs-stacked change is not on the record.
7. **speech-input — record button identity lost.** Web idle is a filled `bg-primary
   text-primary-foreground` pill wrapped in 3 `animate-ping` rings (speech-input.tsx:291-310);
   port idle is a `variant="ghost"` icon button with no rings (ai/speech-input.tsx:102-103).
8. **file-tree — selection state demoted.** Web selected row fills `bg-muted`
   (file-tree.tsx:175); port marks selection with `font-medium` on the name only
   (ai/file-tree.tsx:335). Folder glyph hue `text-blue-500`→`text-muted-foreground` (:198→:316).
9. **commit / artifact — container token swap.** Web containers are `bg-background`
   (commit.tsx:26, artifact.tsx:20); port rides Card's default `bg-card` (ai/commit.tsx:94;
   ai/artifact.tsx:41 — whose comment claims "exactly as the web writes it"). Harmless in light,
   visible in dark. Commit also re-chrome-ifies the hash: bare `font-mono text-xs` span →
   `Badge variant="outline"` chip (commit.tsx:59-60 → ai/commit.tsx:147-149).
10. **reasoning — invented label chrome + lost choreography.** Web label is bare `text-sm` text;
    port wraps it in a `Badge variant="secondary"` at `text-xs` (added chrome). Web content opens
    with `animate-in fade-in slide-in-from-top-2` (and the mirror on close); port has no entry/exit
    animation. The same animation loss affects tool and confirmation.
11. **voice-selector — preview control drift.** Web `outline size-6` (24px) button, 12px icon,
    spinning loader (voice-selector.tsx:502-518) → port `ghost` 40pt, 16px icon, static icon
    (ai/voice-selector.tsx:413-428). Gender-mark set shrunk (`MarsStrokeIcon`, `VenusAndMarsIcon`
    dropped; default `CircleSmallIcon`→`UserIcon`), bullet `•`→`·`, age `tabular-nums` lost.
12. **package-info / environment-variables — recorded compression, unrecorded chrome.** The
    monochrome change-type badges and neutral rows match the wave-12 receipts (recorded), but the
    port ADDS `Key`/`Value` column headers and drops the web's per-badge `<ArrowRightIcon>` and
    colored `bg-*-100` washes without a record.
13. **attachments — remove-button geometry.** Web grid remove: `size-6 … top-2 right-2` (24px
    button, 12px icon, 8px inset, hidden until hover — attachments.tsx:343-347). Port: 40pt button
    (recorded touch-target rule — the port comment cites it), 16px icon, `right-1 top-1` (4px
    inset), always visible (hover-reveal has no touch analogue — platform-forced). Only the inset
    halving is genuine drift. Same 24/32px→40pt inflation applies at list (`size-8`) and inline
    (`size-5`) removes and across web-preview nav buttons.
14. **Selector substrate — content deltas inside the recorded sheet swap.** The
    dropdown→bottom-sheet move is recorded, but inside it: search field `py-3.5`→`py-2`; all three
    selectors gain a visible `SheetTitle` (web is `sr-only`; mic-selector web has none); empty
    state gains SearchX icon+title vs web's single text line; model-selector's check moves to the
    trailing side and recolors to `text-primary`; mic-selector's chevron is `ChevronDownIcon`
    where its own siblings use `ChevronsUpDownIcon`.

## 2. Recorded & intentional (do NOT re-flag)

Touch-target 40pt/44pt house formula · hover/focus-visible→active/pressed · ScrollArea→ScrollView/
FlatList · dropdown→sheet, hover-card→press popover, tooltip→press/Alert · Enter-submit→explicit
send button · iframe→webview (console dropped by verdict) · mediaDevices→audio routes ·
drag-drop→native pickers · clipboard→native · Rive persona avatar dropped · shimmer = RNR Skeleton
pulse (1→0.5, 1000ms) not gradient sweep · task `defaultOpen:false` · artifact as full-screen sheet
· code-block unhighlighted MVP · terminal read-only with ANSI→token map · monochrome compression of
commit M/R letters + package-info change types (wave 8/12 receipts) · sanctioned escape colors
green-600/orange-600/destructive in `lib/status.ts` · /NN opacity-modifier avoidance + inline-style
hardening (engine-defect mitigations) · schema-display path-literal dimming (wave-13 recorded fix).

## 3. Cross-cutting patterns

- **Token-family swaps** (bg-primary vs secondary; bg-background→bg-card; zinc-950→muted) recur
  across message, commit, artifact, terminal. One decision should cover them: accept-and-record,
  or converge.
- **Hue compression**: the web's yellow/blue/green/red status hues collapse to the port's
  5-tone `statusColor` palette. Partially sanctioned; the yellow and blue losses are not.
- **Chrome inflation**: where the web leans on hover/tooltip/sr-only, the port adds visible
  chrome (SheetTitles, reasoning label badge, checkpoint pill border, env Key/Value headers,
  richer empty states). Mostly accessibility-positive on touch — but it should be a recorded
  rule, not per-component accident.
- **Motion losses**: `animate-in/out` collapsible choreography, `animate-ping` rings, spinner
  rotation, and the gradient sweep are all absent or substituted. Only shimmer's substitution
  is recorded.
- **Density**: the port is systematically tighter (conversation gap-8→gap-3 being the extreme).

## 4. Record-vs-ship mismatches (repair the record, not just the code)

- PRD verdict says **agent** is port-at-parity; the shipped port is a re-designed identity/run
  card (Start/Pause/Stop bar; web's instructions/tools/schema config card absent).
- PRD verdict says **question** is port-at-parity; the port drops the select-then-submit form
  (tap-to-submit instead) and restyles options `default`→`secondary`.
- **confirmation** re-homes from web's `Alert` container to `Card`, and right-aligned `h-8`
  actions become full-width `h-10 flex-1` — reasonable, unrecorded.
- **checkpoint**: port header says the web uses absolute positioning — it does not (children +
  trailing Separator); the port's centered two-rule composition is its own design (fine, but the
  comment misstates the source).

## 5. Recommendations (audit-only; no edits made)

1. Decide the **user-bubble token family** (message) and the **terminal surface** — the two most
   product-visible drifts. Both are one-class fixes if convergence is wanted; otherwise record.
2. Restore or explicitly drop the **test-results red segment** and the **tool badge rounded-full
   secondary** family; extend `statusColor` with the yellow/blue tones or record their loss.
3. Record the structural re-designs (agent, question, confirmation, transcription layout,
   speech-input button) in the PRD verdict table so the ledger matches what ships.
4. Sweep the small VALUE drifts (insets, icon sizes 12/14/16, py-2 search field, gap steps) in one
   refinement pass once the family decisions land.

Full per-finding detail (every claim with both sides' file:line quotes) is preserved in
`~/.cache/agent-scratch/rnr-web-ref/findings/batch-{1-chat-core,2-agent-run,3-content,4-devtools,5-data-audio,6-selectors,7-atoms-misc}.md`.

---

## 6. Remediation status (post-audit)

All 14 §1 unexplained drifts were remediated per the user-approved converge+record policy
(`design/style-parity-remediation.md`): converged to the pinned web intent, or deliberately kept
with the keep recorded. Every wave was implemented by the react-native-reusables implementer,
adversarially reviewed by the react-native-reusables reviewer, passed the full gate set
(tsc 0 · vitest 385/385 · biome 0 · registry fresh 56×2 · styling + component contracts 0
violations), and carries on-device iOS simulator evidence.

| §1 item | Outcome | Evidence (design/goldens/mobile-ios/) |
|---|---|---|
| 1 message bubble | CONVERGED (bg-secondary/text-foreground/rounded-lg/px-4 py-3); avatar KEPT+recorded | remediation-wave-b/chat-populated.png |
| 2 terminal surface | CONVERGED (bg-zinc-950/text-zinc-100, scheme-safe ANSI map; span-default fix for the nested-Text rule) | remediation-wave-c/../remediation-wave-a/terminal-board.png (in wave-a dir) |
| 3 test-results bar | CONVERGED (two-segment green/red + text-sm duration; progressbar a11y restored) | remediation-wave-a/test-results-board.png |
| 4 tool badge | CONVERGED (secondary rounded-full; yellow/blue restored; Running/streaming un-colored; streaming icon = web's circle) | remediation-wave-a/tool-lifecycle.png |
| 5 conversation | CONVERGED (gap-8; empty-state surface via the empty atom; Download DEFERRED-recorded) | remediation-wave-b/chat-populated.png + chat-first-run.png |
| 6 transcription | CONVERGED (flowing inline paragraph, explicit per-segment colors; /60 eliminated) | remediation-wave-b/transcription-board.png |
| 7 speech-input | CONVERGED (filled bg-primary idle pill; destructive pill + 3 pulsing rings while recording — gate matches web `{isListening && …}`) | remediation-wave-b/speech-input-idle.png + speech-input-recording.png |
| 8 file-tree | CONVERGED (row bg-muted selection; text-blue-500 folder glyphs) | remediation-wave-b/file-tree-selected.png |
| 9 commit/artifact | CONVERGED (bg-background containers; hash = bare mono span + icon, Badge removed) | remediation-wave-c/commit-board.png + artifact-board.png |
| 10 reasoning | CONVERGED label (Badge removed → bare text-sm); motion KEPT+recorded (RNR Collapsible layout animation) | remediation-wave-c/reasoning-states.png |
| 11 voice-selector | CONVERGED (outline preview + 12px icon + spinning loader; six-gender set; • bullet; tabular-nums); 40pt target KEPT | remediation-wave-c/voice-sheet-open.png |
| 12 env-vars / package-info | CONVERGED headers away (headerless divide-y table); package-info compression KEPT (was already recorded) | remediation-wave-c/environment-variables-board.png |
| 13 attachments | CONVERGED inset (right-2/top-2); size/visibility/icon KEPT+recorded | remediation-wave-c/attachments-board.png |
| 14 selector substrate | CONVERGED (search h-auto py-3.5; mic chevron ChevronsUpDown; model check TRAILING + unselected placeholder — web-true, fixing an earlier misread) | remediation-wave-c/model-sheet-open.png + mic-selector-board.png |

§4 record-vs-ship mismatches are repaired in `.spec/prds/mvp/11-technical-requirements/10-component-inventory.md`
(v2.1.0: agent/question/confirmation → port-adapted with true reasons). The checkpoint/artifact/message
header comments now state the web truth. New findings made DURING remediation are recorded in
`design/style-parity-remediation.md` §Execution status (incl. two audit misreads corrected against
the pinned snapshot: input-streaming icon, speech-input ring gate).
