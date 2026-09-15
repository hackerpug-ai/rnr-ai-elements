<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search · orchestrator-authored follow-up 2026-09-15 -->

# FIX-ORI-RN-003-2: replace input-group opacity-shorthand classes that race nativewind's css-interop and break navigation context

> Status: Backlog

> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FIX · Wave: C (unblocks the ORI-RN-003 commit)
> Proposed By: orchestrator (ORI-RN-003 implementer out-of-scope finding, real-device run, 2026-09-15)
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Repo: rnr-ai-elements
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-15
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

## What this does

Removes the two opacity-shorthand utility classes from `InputGroup`'s wrapper and replaces them
with an engine-safe equivalent that renders identically under both NativeWind and Uniwind on
iOS/Android/Web:

- `packages/registry/src/components/ui/input-group.tsx:34` → `'dark:bg-input/30'`
- `packages/registry/src/components/ui/input-group.tsx:35` → `focused && 'border-ring ring-2 ring-ring/50'`

The `bg-input/30` (background-color/opacity shorthand) and `ring-ring/50` (ring-color/opacity
shorthand) are the class family that NativeWind v4's css-interop parses at render time, which races
Expo Router's NavigationContainer initialization (nativewind/nativewind#1536). On a re-render — when
the composer gains focus and the `focused && …` branch first attaches `ring-ring/50` — css-interop
throws `Couldn't find a navigation context`, the `PromptInputSubmit` button disappears from the tree,
and "Tap on Send message" fails. Uniwind renders the identical source without the error (its engine has
no css-interop jsx-runtime), so the defect is nativewind-specific and lives in this one registry source.

The fix preserves the *visual* (a translucent dark input background at 30% and a 50%-opacity focus
ring) while expressing it through a channel neither engine's css layer re-parses at runtime: a plain
RN `style` object driven by `useColorScheme()` (the same engine-safe idiom already in this file for the
placeholder color at line 65), or a named theme token with the opacity baked in. The layout/geometry
classes (`border`, `border-input`, `border-ring`, `ring-2`, `bg-background`, `rounded-md`, `gap-2`,
`px-3`) are NOT opacity shorthand and stay in `className` unchanged.

## Why

ORI-RN-003's cycle-2 real-device run (post FIX-ORI-RN-003-1 / 54ac507) recorded:

- `uniwind/{ios,android,web}` PASS, `nativewind/web` PASS, but `nativewind/ios` and
  `nativewind/android` FAIL at RUNTIME with `Error: Couldn't find a navigation context`, thrown at
  `input-group.tsx` (`<View>` at line 31) on re-render when the composer gains focus; the send button
  vanishes, so `Tap on Send message` fails.

The class pattern at lines 34–35 is the trigger, and the same file is the only registry component that
uses `ring-ring/` or `bg-input/`. `packages/**` is writeProhibited for ORI-RN-003, so this is a
registry-owner FIX. FIX-ORI-RN-003-1 already resolved the bundle failure (css-interop not resolvable);
this FIX resolves the *runtime* failure that the now-successful bundle exposed.

## How to verify

**RED (the observed nativewind native runtime failure — replay, not a source-absence statement):**

Prepare a clean nativewind consumer (copy `packages/docs-snippets/nativewind/` outside the monorepo,
run the committed recipe `bash packages/docs-snippets/commands/nativewind.sh` with cwd = the copy, which
installs the live `rnraielements.com/r/nativewind/*` items including the unfixed input-group), open it
in Expo Go on a reserved iOS simulator / Android emulator, then focus the composer and attempt Send.
Expected (RED): `Couldn't find a navigation context` in the Metro log and the `Send message` button
absent from the accessibility hierarchy. This is the exact failure ORI-RN-003 recorded in
`.tmp/ORI-RN-003/cycle-2/` on `kb-run-sprint/sprint-05-orient-search/ORI-RN-003`; the authoritative
replay is ORI-RN-003's own harness
(`tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind
--platforms ios,android,web`, on ORI-RN-003's branch) — run only its nativewind native legs.

**GREEN (after the fix):**

1. `pnpm registry:build` regenerates `public/r/{nativewind,uniwind}/input-group.json`; `pnpm check:registry`
   exits 0 (the shipped registry is fresh).
2. The composer renders and the send button is tappable on BOTH nativewind iOS and Android (light+dark),
   with NO regression on uniwind iOS/Android and nativewind/uniwind web. Prove it with the harness
   sign-off gate (`pnpm --filter harness storybook:device` for uniwind; `pnpm --filter harness-nativewind
   storybook:device` for nativewind; `pnpm storybook:web`) after the harness/example copies below are
   updated in lockstep, plus the disposable-consumer replay above now passing (no `Couldn't find a
   navigation context`, `Send message` present and tappable).
3. `pnpm typecheck` clean and `pnpm lint` clean.

## Scope

- WRITE-ALLOWED:
  - packages/registry/src/components/ui/input-group.tsx (MODIFY — the single source)
  - public/r/nativewind/input-group.json (REGENERATED by `pnpm registry:build`, commit)
  - public/r/uniwind/input-group.json (REGENERATED by `pnpm registry:build`, commit)
  - apps/harness/src/components/ui/input-group.tsx (MODIFY — uniwind harness copy, hand-maintained)
  - apps/harness/src/components/ui.nativewind/input-group.tsx (MODIFY — nativewind harness copy, hand-maintained)
  - apps/example/components/ui/input-group.tsx (MODIFY — example copy, hand-maintained)
  - tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-2/** (evidence — RED/GREEN)
  - .tmp/FIX-ORI-RN-003-2/** (owned scratch)

- writeProhibited (explicit):
  - packages/registry/src/components/** EXCEPT input-group.tsx (this FIX owns one component, not the registry-wide opacity-shorthand audit — see OPEN QUESTION)
  - packages/registry/src/global.css, apps/**/global.css, apps/**/tailwind.config.js, lib/theme.ts, packages/registry/registry.json (the per-engine `registry.json` index carries only name/type/title and is unaffected by a content change)
  - packages/docs-snippets/** (the consumer templates — owned by ORI-RN-001 / FIX-ORI-RN-003-1)
  - .spec/**, .github/**, playwright.config.ts

### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- The ONLY semantic change is to the two opacity-shorthand classes at lines 34–35 of
  `packages/registry/src/components/ui/input-group.tsx`. Every other class on the wrapper
  (`flex-row items-center gap-2 rounded-md border border-input bg-background px-3`, `border-ring`,
  `ring-2`), every sub-component (`InputGroupInput`, `InputGroupAddon`, `InputGroupActions`,
  `InputGroupText`), every import, and every line of logic stays byte-identical.
- The replacement MUST render identically under BOTH engines on iOS/Android/Web. Do NOT silently
  change the visual (e.g. dropping the `/50` to a full-opacity ring or the `/30` to a full-opacity
  background is a visual regression). The 30% dark-input background and 50% ring opacity are the
  pinned appearance.
- The replacement MUST stay engine-agnostic: no `uniwind` import, no `nativewind` import, no
  `cssInterop`/`withUniwind` call, no engine-only prop (the `placeholderTextColor` comment at line 55
  documents why engine-only props are banned here). Use the plain RN `style` prop + `useColorScheme()`
  (the file's own precedent at line 65) or a named theme token — NOT an engine wrapper.
- If you add a token, you touch the theme files (`global.css`, `theme.ts`, `tailwind.config.js`) which
  are NOT in WRITE-ALLOWED — so a token-based fix requires either a pre-existing token or the
  `useColorScheme()` + literal idiom. Prefer the literal idiom (no new theme surface).
- The three harness/example copies are HAND-MAINTAINED (verified byte-identical to the registry source
  after the `@/registry/{engine}/` → `@/` alias rewrite; no sync script exists). They must be updated in
  lockstep so the Storybook/example surfaces render the same fixed component. Do NOT regenerate them by
  hand-drifting — apply the exact same edit to each.
- `public/r/{nativewind,uniwind}/input-group.json` are DERIVED — produce them with `pnpm registry:build`,
  never hand-edit. Do NOT edit `public/r/{engine}/registry.json` (index carries no file content).

### DONE WHEN

- AC-1: the two opacity-shorthand classes at `input-group.tsx:34-35` are replaced with an engine-safe
  equivalent; `git diff` shows no other semantic change to the component; `pnpm typecheck` + `pnpm lint`
  clean.
- AC-2: `pnpm registry:build` regenerates `public/r/{nativewind,uniwind}/input-group.json` and
  `pnpm check:registry` exits 0; the three harness/example copies are byte-identical to the registry
  source after the alias rewrite.
- AC-3: the composer renders and the send button is tappable on nativewind iOS + Android (light+dark),
  with NO regression on uniwind iOS/Android and nativewind/uniwind web (harness sign-off + the
  disposable-consumer replay now passing).
- Only SCOPE files modified (`git diff --name-only`).

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: the two opacity-shorthand classes are removed and replaced engine-safe, with no other change**

  GIVEN `packages/registry/src/components/ui/input-group.tsx` (lines 34–35 carrying
  `'dark:bg-input/30'` and `focused && 'border-ring ring-2 ring-ring/50'`) WHEN those two classes are
  replaced with a plain-RN `style`-driven equivalent (or a named token) preserving the 30% dark-input
  background and 50% ring opacity THEN `git diff packages/registry/src/components/ui/input-group.tsx`
  shows only that change, the wrapper no longer contains any `*-color/opacity` shorthand, and
  `pnpm typecheck` + `pnpm lint` exit 0.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `git diff` + tsc + biome
  VERIFY: `git diff packages/registry/src/components/ui/input-group.tsx && pnpm typecheck && pnpm lint`
  TEST_FILE: packages/registry/src/components/ui/input-group.tsx · TEST_FUNCTION: (source change; the scoped diff + typecheck/lint are the assertions)

**AC-2: the shipped registry and the three hand-maintained copies are in sync with the source**

  GIVEN the fixed source WHEN `pnpm registry:build` runs THEN `pnpm check:registry` exits 0 (the two
  derived `public/r/{nativewind,uniwind}/input-group.json` match a fresh in-memory build), and each of
  `apps/harness/src/components/ui/input-group.tsx`, `apps/harness/src/components/ui.nativewind/input-group.tsx`,
  and `apps/example/components/ui/input-group.tsx` is byte-identical to the registry source after
  substituting `@/registry/{engine}/` → `@/` (the same rewrite the build performs).

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `pnpm registry:build` + `pnpm check:registry` + `diff`
  VERIFY: `pnpm registry:build && pnpm check:registry` then diff each copy against `sed 's|@/registry/{engine}/|@/|g' packages/registry/src/components/ui/input-group.tsx`
  TEST_FILE: public/r/{nativewind,uniwind}/input-group.json + the three copies · TEST_FUNCTION: (freshness + parity)

**AC-3: GREEN — the composer renders and the send button is tappable on nativewind native, no regression elsewhere**

  GIVEN the fixed source, rebuilt registry and synced copies WHEN the harness sign-off runs on
  nativewind and uniwind (device + web) AND a disposable nativewind consumer (prepared via the committed
  recipe, then its `components/ui/input-group.tsx` overwritten with the fixed source, or the fixed
  `public/r/nativewind` served locally and installed) is opened in Expo Go on iOS and Android and the
  composer is focused and submitted THEN the composer renders and `Send message` is present and tappable
  on nativewind iOS + Android in light and dark (no `Couldn't find a navigation context` in the Metro
  log), and uniwind iOS/Android + nativewind/uniwind web still render the composer identically (no
  regression). RED before the fix: the same nativewind native replay throws
  `Couldn't find a navigation context` and the send button is absent.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Expo Go (iOS + Android) via the harness sign-off and/or ORI-RN-003's on-branch proof harness
  VERIFY: `pnpm --filter harness storybook:device` + `pnpm --filter harness-nativewind storybook:device` + `pnpm storybook:web`; the authoritative 6-leg proof is `tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web` (ORI-RN-003's branch), re-run by ORI-RN-003 after this FIX's `public/r` is deployed
  TEST_FILE: (real-device Maestro/Storybook session) · TEST_FUNCTION: (composer render + send tap, documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `git diff packages/registry/src/components/ui/input-group.tsx` touches only lines 34–35
  (plus any adjacent `style`/`useColorScheme` wiring the replacement requires); no `bg-input/`, no
  `ring-ring/` remain; no other component file changes.
- TC-2 → AC-1: `pnpm typecheck` exits 0; `pnpm lint` (biome) exits 0.
- TC-3 → AC-2: `pnpm registry:build && pnpm check:registry` exits 0; the two `input-group.json` differ
  from HEAD only in the embedded `content` of the `input-group.tsx` file (no manifest metadata drift).
- TC-4 → AC-2: each of the three harness/example copies equals `sed 's|@/registry/{engine}/|@/|g'` of the
  source (byte-identical); `git diff --name-only` lists only the allowed paths.
- TC-5 → AC-3: the nativewind native replay shows the composer + tappable `Send message` in light and
  dark on iOS and Android with no navigation-context error; the uniwind + web replays are unchanged.
  RED (pre-fix) and GREEN (post-fix) evidence saved under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-2/`.

### SCOPE (file-level write permissions)

- packages/registry/src/components/ui/input-group.tsx (MODIFY)
- public/r/nativewind/input-group.json (REGENERATED, commit)
- public/r/uniwind/input-group.json (REGENERATED, commit)
- apps/harness/src/components/ui/input-group.tsx (MODIFY)
- apps/harness/src/components/ui.nativewind/input-group.tsx (MODIFY)
- apps/example/components/ui/input-group.tsx (MODIFY)
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-2/** (evidence)
- .tmp/FIX-ORI-RN-003-2/** (owned scratch)

### VERIFICATION GATES

- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- registry: `pnpm registry:build && pnpm check:registry`

### DEPENDENCIES

- Depends on: ORI-RN-001 (the registry source + consumer templates), FIX-ORI-RN-003-1 (the css-interop
  direct dependency that lets the nativewind bundle reach runtime, exposing this defect)
- Blocks: ORI-RN-003 (the nativewind ios/android legs cannot pass until the navigation-context race is gone)
- Parallel: none (do not race other registry edits; one component, one lane)

### READING LIST (max 5)

- packages/registry/src/components/ui/input-group.tsx (the defect at lines 34–35 + the engine-safe `useColorScheme()` + literal precedent at line 65)
- packages/registry/scripts/build-registry.ts (the fan-out: one source → `public/r/{engine}/*.json` by alias rewrite)
- packages/registry/src/components/ui/sheet.tsx:81 and item.tsx:22 (the wider `bg-*/NN` opacity-shorthand usage — out of scope here, but the systemic context)
- apps/harness-nativewind/global.css + apps/harness/src/global.css (the `--ring` / `--input` tokens the fix must match at 50% / 30% opacity)
- nativewind/nativewind#1536 (the upstream css-interop race condition this FIX works around)

> Note: ORI-RN-003's proof evidence lives on `kb-run-sprint/sprint-05-orient-search/ORI-RN-003`
> (`.tmp/ORI-RN-003/cycle-2/`), not this trunk; the RED is reproduced from the disposable-consumer
> recipe in "How to verify", not from a trunk-resident artifact.

### CODING STANDARDS

Keep the existing `cn(...)` composition and `useColorScheme()`/literal idiom style already in the file.
If using a `style` object, add a comment mirroring the placeholder note at line 55: the literals are the
`--color-input` / `--color-ring` token values at 30% / 50% opacity, and they change together with the
theme. Do not introduce a new dependency, a new hook file, or an engine wrapper.

## OPEN QUESTIONS (stated, not resolved here)

- **Systemic opacity-shorthand usage**: `sheet.tsx` (`bg-black/50`, `bg-muted-foreground/40`),
  `item.tsx` (`bg-muted/50`), `slider.tsx` (`bg-primary/20`), `code-block.tsx`, `sources.tsx`,
  `tool.tsx`, `stack-trace.tsx`, `schema-display.tsx`, `inline-citation.tsx` all use `bg-*/NN` or
  `text-*/NN` shorthand. The quickstart screen exercises only `input-group.tsx`, so only that file is
  OBSERVED to fail on nativewind native. A registry-wide audit of opacity-shorthand classes is a
  separate follow-up, NOT this FIX — but if the reviewer confirms other components also break on
  nativewind native, that becomes a sibling FIX.
- **Upstream race mechanism**: the precise reason css-interop's render-time parse races
  NavigationContainer is an upstream nativewind bug, not explainable from this repo. The RED is scoped
  to the OBSERVED runtime failure + class pattern; the causal mechanism is cited from
  nativewind/nativewind#1536, not re-derived here.
