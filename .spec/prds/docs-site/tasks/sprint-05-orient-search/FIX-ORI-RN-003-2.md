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

Prepare a clean nativewind consumer (copy `packages/docs-snippets/nativewind/` outside the monorepo, run
the committed recipe `bash packages/docs-snippets/commands/nativewind.sh` with cwd = the copy — the
recipe installs the five top-level items `conversation`/`message`/`prompt-input`/`item`/`sheet` from
`rnraielements.com/r/nativewind/…`), then OVERWRITE the consumer's `components/ui/input-group.tsx` with
the PRE-FIX source (this commit's `packages/registry/src/components/ui/input-group.tsx`, alias
`@/registry/{engine}/` rewritten to `@/components/ui/…`). Do NOT rely on a localhost host substitution:
`input-group` is not a top-level recipe item — it arrives transitively via `prompt-input.json`'s
`registryDependencies`, pinned to the immutable `…/v0.2.1/public/r/nativewind/input-group.json` git-tag
URL, so substituting the top-level install host does not change where `input-group` is fetched. Overwrite
the installed file instead. Open the consumer in Expo Go on a reserved iOS simulator / Android emulator,
focus the composer, and attempt Send. Expected (RED): `Couldn't find a navigation context` in the Metro
log and the `Send message` button absent from the accessibility hierarchy. This is the exact failure
ORI-RN-003 recorded in `.tmp/ORI-RN-003/cycle-2/` on `kb-run-sprint/sprint-05-orient-search/ORI-RN-003`;
the authoritative replay is ORI-RN-003's own harness
(`tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind
--platforms ios,android,web`, on ORI-RN-003's branch) — run only its nativewind native legs.

**GREEN (after the fix):**

1. `pnpm registry:build` regenerates `public/r/{nativewind,uniwind}/input-group.json`; `pnpm check:registry`
   exits 0 (the shipped registry is fresh).
2. The composer renders and the send button is tappable on BOTH nativewind iOS and Android (light+dark),
   with NO regression on uniwind iOS/Android and nativewind/uniwind web. Prove it with the harness
   sign-off gate (`pnpm --filter harness storybook:device` for uniwind device; `pnpm --filter
   harness-nativewind storybook:device` for nativewind device; `pnpm storybook:web` for uniwind web; and
    `pnpm --filter harness storybook:web:nativewind` for nativewind web) after the harness/example copies
    below are updated in lockstep, plus the disposable-consumer replay above now passing — overwrite the
    consumer's `components/ui/input-group.tsx` with the FIXED source (post `pnpm registry:build`) instead
    of the pre-fix source (no `Couldn't find a navigation context`, `Send message` present and tappable).
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
- The replacement literal MUST be `hsl(...)` / `hsla(...)` form ONLY, in the COMMA alpha form
  (`hsla(0, 0%, 14.9%, 0.3)`, `hsla(300, 0%, 45%, 0.5)`) or the no-alpha space form
  (`hsl(0 0% 63.9%)`, matching line 65). FORBIDDEN: the CSS Color 4 slash-alpha form
  (`hsl(0 0% 14.9% / 0.3)`) — `@react-native/normalize-colors@0.86.3` returns `null` for it and
  `processColor.js` then drops the value, so the color silently does NOT render on device. The slash
  form also passes `check:tokens` (the `hsla?\(` → `hsl(` normalization covers it), so the gates cannot
  catch it — the implementer must not write it.
- `scripts/check-tokens.ts` (CI `pnpm check:tokens`) grants this file exactly one exception —
  `TOKEN_EXCEPTIONS` for `input-group.tsx` carries `['#737373', '#a3a3a3', 'hsl(']` — so an
  `hsl(...)`/`hsla(...)` literal passes, but `rgb(...)`, `rgba(...)`, `oklch(...)`, and any hex OTHER
  than the two placeholder parity values `#737373`/`#a3a3a3` FAIL the gate. The gate scans COMMENTS too,
  so do not name a hex / rgb / oklch value in a comment (a comment must use `hsl(...)` or the two
  sanctioned hex values only).
- The replacement style MUST be a HOISTED object or hoisted ternary, NOT an inline literal.
  `scripts/check-contract.ts` (CI `pnpm check:contract`) runs the styling contract's
  `inline-static-style-literal` rule, which globs `packages/registry/src/**/*.tsx` (no exclude) and
  forbids `style={{ … backgroundColor|borderColor|borderRadius|color|fontSize|padding|margin|flex : … }}`.
  Compute the wrapper style outside the JSX (`const wrapperStyle = focused ? focusedStyle : undefined;`
  then `style={wrapperStyle}`) so the replacement is contract-legal; an inline
  `style={{ backgroundColor: … }}` fails CI.
- If you add a token, you touch the theme files (`global.css`, `theme.ts`, `tailwind.config.js`) which
  are NOT in WRITE-ALLOWED — so a token-based fix requires either a pre-existing token or the
  `useColorScheme()` + literal idiom. Prefer the literal idiom (no new theme surface).
- Do NOT drift the placeholder line. The styling contract's `input-group-placeholder-parity` mustInclude
  check pins line 65 byte-exact (`placeholderTextColor={scheme === 'dark' ? 'hsl(0 0% 63.9%)' :
  'hsl(0 0% 45.1%)'}`) — if that line changes shape or value, `pnpm check:contract` fails. Leave it
  untouched.
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
  replaced with a hoisted `style`-driven equivalent (a `const` object / ternary passed as
  `style={wrapperStyle}`, computed from `useColorScheme()` + `focused`, using `hsl(...)` literals only)
  — or a named theme token — preserving the 30% dark-input background and 50% ring opacity THEN
  `git diff packages/registry/src/components/ui/input-group.tsx` shows only that change, the wrapper no
  longer contains any `*-color/opacity` shorthand, and `pnpm typecheck` + `pnpm lint` +
  `pnpm check:tokens` + `pnpm check:contract` all exit 0.

  FLOW_REF: None · TEST_TIER: integration · verification_service: real `git diff` + tsc + biome + token gate + contract gate
  VERIFY: `git diff packages/registry/src/components/ui/input-group.tsx && pnpm typecheck && pnpm lint && pnpm check:tokens && pnpm check:contract`
  TEST_FILE: packages/registry/src/components/ui/input-group.tsx · TEST_FUNCTION: (source change; the scoped diff + typecheck/lint/tokens/contract are the assertions)

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
  recipe, then its `components/ui/input-group.tsx` overwritten with the fixed source) is opened in Expo
  Go on iOS and Android and the composer is focused and submitted THEN the composer renders and
  `Send message` is present and tappable on nativewind iOS + Android in light and dark (no
  `Couldn't find a navigation context` in the Metro log), and uniwind iOS/Android + nativewind/uniwind
  web still render the composer identically (no regression). RED before the fix: the same nativewind
  native replay throws `Couldn't find a navigation context` and the send button is absent.

  EVIDENCE — the pinned 30% dark-input background and 50% ring opacity are NOT assertable by the
  scripted gates (the gates catch the literal FORM — `check:tokens` — and the inline-style FORM —
  `check:contract` — but not whether the color actually renders at the right alpha). Capture a dark-mode
  on-device screenshot of the FOCUSED composer on nativewind iOS AND Android (the focus ring visible at
  50% and the input background translucent at 30%), plus one light-mode focused screenshot each, under
  `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-2/`. The 30%/50% appearance is confirmed ONLY
  by this on-device visual sign-off, never by the scripted gates.

  FLOW_REF: None · TEST_TIER: e2e · verification_service: real Expo Go (iOS + Android) via the harness sign-off and/or ORI-RN-003's on-branch proof harness
  VERIFY: `pnpm --filter harness storybook:device` + `pnpm --filter harness-nativewind storybook:device` + `pnpm storybook:web` (uniwind web) + `pnpm --filter harness storybook:web:nativewind` (nativewind web); the authoritative 6-leg proof is `tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web` (ORI-RN-003's branch), re-run by ORI-RN-003 after this FIX's `public/r` is deployed
  TEST_FILE: (real-device Maestro/Storybook session + dark/light focused-composer screenshots) · TEST_FUNCTION: (composer render + send tap + appearance, documented in evidence)

### TEST CRITERIA

- TC-1 → AC-1: `git diff packages/registry/src/components/ui/input-group.tsx` touches only lines 34–35
  (plus any adjacent hoisted `style`/`useColorScheme` wiring the replacement requires); no `bg-input/`, no
  `ring-ring/` remain; no other component file changes.
- TC-2 → AC-1: `pnpm typecheck` exits 0; `pnpm lint` (biome) exits 0; `pnpm check:tokens` exits 0 (the
  replacement literal is `hsl(...)` only, no hex/rgb/oklch even in comments); `pnpm check:contract`
  exits 0 (the replacement is a hoisted object/ternary, not an inline `style={{ … color }}`, and the
  `input-group-placeholder-parity` line 65 is untouched).
- TC-3 → AC-2: `pnpm registry:build && pnpm check:registry` exits 0; the two `input-group.json` differ
  from HEAD only in the embedded `content` of the `input-group.tsx` file (no manifest metadata drift).
- TC-4 → AC-2: each of the three harness/example copies equals `sed 's|@/registry/{engine}/|@/|g'` of the
  source (byte-identical); `git diff --name-only` lists only the allowed paths.
- TC-5 → AC-3: the nativewind native replay shows the composer + tappable `Send message` in light and
  dark on iOS and Android with no navigation-context error; the uniwind + web replays are unchanged.
  A dark-mode FOCUSED-composer screenshot on nativewind iOS and Android (and a light-mode one each) is
  saved, showing the 50% focus ring and 30% translucent dark background — the only proof of the pinned
  appearance, since the gates assert form, not rendered alpha. RED (pre-fix) and GREEN (post-fix)
  evidence saved under `tests/sprint-05-orient-search/evidence/FIX-ORI-RN-003-2/`.

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
- tokens: `pnpm check:tokens`
- contract: `pnpm check:contract`
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

Keep the existing `cn(...)` composition and `useColorScheme()` idiom already in the file. Compute the
wrapper style OUTSIDE the JSX as a hoisted object/ternary — for example, with `const scheme =
useColorScheme()`:
```
const wrapperStyle =
  scheme === 'dark' ? { backgroundColor: 'hsla(0, 0%, 14.9%, 0.3)' } : undefined;
const focusedStyle = focused
  ? { borderColor: scheme === 'dark' ? 'hsla(300, 0%, 45%, 0.5)' : 'hsla(0, 0%, 63%, 0.5)', borderWidth: 2 }
  : undefined;
```
(comma-form `hsla(...)`, which RN 0.86.3 parses; `--color-ring` light = `0 0% 63%`, dark = `300 0% 45%`,
`--color-input` dark = `0 0% 14.9%`) then `style={[wrapperStyle, focusedStyle]}` — never an inline
`style={{ backgroundColor: … }}`, which trips the styling contract's `inline-static-style-literal` rule.
Express every raw color as comma-form `hsla(...)` or no-alpha `hsl(...)` (the sole forms `check:tokens`
permits AND RN 0.86.3 parses); do NOT write the CSS Color 4 slash-alpha form `hsl(… / …)` (RN drops it),
and do NOT write `#hex`, `rgb(...)`, `rgba(...)` or `oklch(...)` — not even in a comment (the token gate
scans comments). The literals are the `--color-input` / `--color-ring` token values at 30% / 50% opacity
and change together with the theme; state that in a comment that itself uses only `hsl(...)` / the two
sanctioned hex values. Do not introduce a new dependency, a new hook file, or an engine wrapper, and
leave the `placeholderTextColor` line 65 byte-exact.

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

## Amendments

- Cycle-2 remediation (independent reviewer NEEDS_FIXES, DOC-1/DOC-2/DOC-3/DOC-4):
  - DOC-1 (token law) — added `tokens: pnpm check:tokens` to VERIFICATION GATES, AC-1's VERIFY, and
    TC-2, and constrained the replacement literal to `hsl(...)`/`hsla(...)` only: `scripts/check-tokens.ts`
    grants `input-group.tsx` exactly `TOKEN_EXCEPTIONS = ['#737373', '#a3a3a3', 'hsl(']`, so hex other
    than those two parity values, `rgb(...)`, `rgba(...)`, and `oklch(...)` fail — including inside
    comments, which the gate scans by design.
  - DOC-2 (styling contract) — added `contract: pnpm check:contract` to VERIFICATION GATES and AC-1's
    VERIFY, required a HOISTED `style` object/ternary (the contract's `inline-static-style-literal` rule
    forbids inline `style={{ backgroundColor|borderColor|… }}`), and named the
    `input-group-placeholder-parity` mustInclude check that pins line 65 byte-exact so the placeholder
    line must not drift.
  - DOC-3 (web leg coverage) — added `pnpm --filter harness storybook:web:nativewind` (nativewind web)
    to AC-3's VERIFY alongside `pnpm storybook:web` (uniwind web), which alone resolves to the uniwind
    harness and would leave the nativewind web leg unproven.
  - DOC-4 (RED durability) — pinned the RED replay to a locally-served pre-fix snapshot of
    `public/r/nativewind` (install from `http://localhost:<port>/nativewind/…`) instead of the live
    `rnraielements.com` host, so the RED remains reproducible after the fixed `public/r` is deployed.
  - The verified defect location, diagnosis, honest scoping, and WRITE-ALLOWED are otherwise unchanged.

- Cycle-3 remediation (independent reviewer NEEDS_FIXES, DOC-5/DOC-6):
  - DOC-5 (RN-parseable literal) — the cycle-2 example used the CSS Color 4 slash-alpha form
    `hsl(0 0% 14.9% / 0.3)`, which `@react-native/normalize-colors@0.86.3` returns `null` for
    (verified: `normalize-colors` → `null`; `processColor.js` then drops it). Replaced the example with
    the comma form `hsla(0, 0%, 14.9%, 0.3)` / `hsla(300, 0%, 45%, 0.5)` (both parse), added an explicit
    rule forbidding the slash-alpha syntax (the gates cannot catch it — `check:tokens`'s `hsla?\(` → `hsl(`
    normalization covers it), and made the 30%/50% appearance observable via a dark-mode FOCUSED-composer
    on-device screenshot on nativewind iOS + Android (gates assert form, not rendered alpha).
  - DOC-6 (RED replay mechanism) — `input-group` is NOT a top-level recipe item; it arrives transitively
    via `prompt-input.json`'s `registryDependencies`, pinned to the immutable
    `…/v0.2.1/public/r/nativewind/input-group.json` git-tag URL, so the localhost host substitution did
    not change where `input-group` is fetched. Dropped the localhost mechanism: the RED/GREEN replay now
    overwrites the consumer's `components/ui/input-group.tsx` with the pre-fix / fixed source respectively.
  - The verified defect location, diagnosis, scoping, and the DOC-1..DOC-4 fixes are otherwise unchanged.
