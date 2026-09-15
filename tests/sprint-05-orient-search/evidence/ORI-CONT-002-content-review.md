# ORI-CONT-002 — content review evidence (source-bound)

Task: Author the Theming reference (`theming.mdx`) and Dark mode explanation
(`dark-mode.md`) manuscripts for the real route adapter, with a task-owned
real-file contract test. Status: all four selectors GREEN with source-backed
observed values and discriminating mutation evidence.

Captured: 2026-09-15 (worktree
`.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-CONT-002`, branch
`kb-run-sprint/sprint-05-orient-search/ORI-CONT-002`, base `30d14ba`).

## Deliverables

| File | Role | SHA-256 |
|---|---|---|
| `apps/docs/src/content/docs/theming.mdx` | Theming reference (section `guides`, order 1) | `943d15402bfa26171dcc37cdcec9c7733ae3b3c0c5a114194f116293848cbc80` |
| `apps/docs/src/content/docs/dark-mode.md` | Dark mode explanation (section `getting-started`, order 4) | `978dc3c903381dc9aeba107a9d41b3f4589a8a51a4004770be3af32f61a3d374` |
| `tests/sprint-05-orient-search/theming-manuscript.test.ts` | Task-owned contract (4 selectors + mutation controls) | `a5b9fed94b66c2ac2c048bb0a314d56fe3463d5c15deedd0c08ac8e3a0283b2e` |
| `tests/sprint-05-orient-search/evidence/ORI-CONT-002-content-review.md` | This report | (this file) |

## Source provenance (read before every claim; SHA-256 at capture time)

| Source | SHA-256 |
|---|---|
| `packages/registry/src/components/ai/message.tsx` | `b87830c643bf3340c0d1db477922071ed7066a0ad111214843dd8adf2acd10f1` |
| `packages/registry/src/components/ai/reasoning.tsx` | `14d0c1d3c2a965dc22c65411870152341e6f9b7b524b0009c0b1a4b1e5ee6641` |
| `packages/registry/src/components/ai/context.tsx` | `e4bfdfeda07694f236c6814cdc8719352633f7f627dea8f2da7cc0b1705e8794` |
| `apps/example/components/ui/text.tsx` | `846436f6465343bf2150c19276a90401f787b443e47a7869e7aafdc834c1e151` |
| `apps/docs/src/styles/global.css` | `fe528104552e1c1c17c1a0be96b51da82c61e6fbbf6507b8b372e0ab27023fb6` |
| `apps/example/global.css` | `9de2709e5a3615d57d4e33ba0e570584389547642ca254ac78ef0c6f5b312b2c` |
| `apps/example/lib/theme.ts` | `d6483d0e64eb770969124f75c3ba65441abe6c4021997deb813fe7a7534d3884` |
| `apps/harness-nativewind/tailwind.config.js` | `142cc30b5aa74ff1e0c2fc4f929a7c5003dc40835b65183f915779543414c1c9` |
| `apps/docs/src/scripts/theme-toggle.ts` | `4c233ac0fe63d9a109018709a2c8a504fd3cfb47ae851ea936a4b31783c44437` |
| `apps/docs/src/layouts/DocsLayout.astro` | `485c7934fa3033ee4e2716849365d7151bbf2251d75bda2fbe33d1ef830f3dda` |
| `apps/docs/src/lib/seam-map.ts` (read, unchanged) | `d78a145dabf366eb3866ed0adbe8fa64f411eba2d132f1fffb06506db360d468` |
| `apps/docs/src/lib/docs-navigation.ts` (read, unchanged) | `746aeb636bea88bb6c1e9f29c22e2b895bd9e401071434e84131d7602160b6c8` |
| `apps/docs/src/pages/docs/theming.astro` (read, unchanged) | `edf0cd19a893a1ecdbbc58a1436ee3c4f052e550632573cac34e1da7834b64bb` |

## Claims as implemented (each checked against the source above)

- **Seam anchors preserved.** `theming.mdx` declares headings `## TextClassContext`
  and `## renderMarkdown`; their github-slugger slugs are exactly
  `textclasscontext` and `rendermarkdown` — the same slugger
  `apps/docs/src/lib/docs-navigation.ts` uses to derive heading ids, so the
  `/docs/theming#textclasscontext` and `/docs/theming#rendermarkdown` targets in
  `seam-map.ts` resolve to real headings. The four copy-stable phrases survive:
  `ship no tokens`, `oklch`, `prefers-color-scheme`, `toggle`.
- **renderMarkdown ownership corrected.** Source truth: `MessageResponseProps`
  (message.tsx) and `ReasoningContentProps` (reasoning.tsx) declare
  `renderMarkdown?`; `ContextProps` does not (context.tsx injects caller-priced
  `costText` strings instead). The `#rendermarkdown` section attributes the prop
  to MessageResponse and ReasoningContent only and forbids both false shapes
  ("Each takes a renderMarkdown prop" and "Context … takes a renderMarkdown
  prop"). The old static route's claim that context takes the prop is NOT
  repeated.
- **TextClassContext described without style cascade.** The text module
  (`apps/example/components/ui/text.tsx`) exports `TextClassContext` and merges
  the provider value into every nested `Text`; the `#textclasscontext` section
  states the no-style-cascade fact and names the provider.
- **One token binding, honest palette boundary.** The MDX tree contains exactly
  one render binding, `<TokenTable />`, with no import (ORI-AST-003 binds the
  real component at render time; importing the absent file is forbidden and the
  contract rejects any import specifier that does not resolve). The manuscript
  contains zero numeric palette literals: the docs sheet's oklch values and the
  consumer's HSL triplets are derived from the real sources at test time and
  banned from the body. `--code-background`/`--code-foreground` are labeled
  docs-specific. The docs (oklch) versus consumer (HSL) distinction is stated in
  prose.
- **Engine facts scoped.** "No tailwind.config.js" appears only in a sentence
  scoped to Uniwind; Uniwind is paired with Tailwind v4 and the CSS-first
  `@theme` block. NativeWind 4 is paired with Tailwind v3 and the real config
  path `apps/harness-nativewind/tailwind.config.js` (`darkMode: 'class'`,
  `nativewind/preset`, `hsl(var(--token))` mapping verified in source);
  "NativeWind 3" appears nowhere.
- **Source-backed example.** The `@theme` mapping example is 839 bytes copied
  verbatim from `apps/example/global.css` (verified byte-exact by the test
  against the current file bytes and against the extracted `@theme` block
  range); the manuscript names the source file in prose.
- **Dark mode explanation.** `dark-mode.md` separates application-owned theme
  state (Uniwind scheme via `useUniwind()`, the `apps/example/lib/theme.ts`
  light/dark token map, NAV_THEME to react-navigation) from the docs site's
  stored choice, and describes the site's real resolution order in order:
  stored `rnr-theme` first (the key verified in both `DocsLayout.astro` and
  `theme-toggle.ts`), then OS `prefers-color-scheme`, then dark. It contains no
  numbered steps, no `## Quickstart`, no `.dark`-class or `color-scheme:` claim
  (the source toggles the light class; the behavior correction belongs to the
  Astro workstream), and no rendered-proof claim.

## Test reality (RED → GREEN, real files and installed parsers)

Parser basis: js-yaml (frontmatter, resolved from the workspace pnpm store) and
github-slugger (the docs app's own symlinked copy — the same slugger
docs-navigation.ts uses). No mocked modules, filesystem, HTTP, or renderers. All
mutation controls derive from the real manuscripts and re-run the same contract
functions.

### RED (captured with the final contract, manuscripts absent)

Command pattern:
`pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t <selector>`

| Selector | Exit | Observed failure |
|---|---|---|
| `ORI-CONT-002-seam-anchors` | 1 | `Error: [ORI-CONT-002] required file missing: apps/docs/src/content/docs/theming.mdx` |
| `ORI-CONT-002-token-boundary` | 1 | same functional missing-manuscript failure |
| `ORI-CONT-002-engine-provenance` | 1 | same functional missing-manuscript failure |
| `ORI-CONT-002-dark-mode-explanation` | 1 | `... required file missing: apps/docs/src/content/docs/dark-mode.md` |

Artifacts: `.tmp/ORI-CONT-002/cycle-1/red/ORI-CONT-002-*.txt`. The failure is
the fixture-declared functional one ("missing or empty manuscripts fail"),
raised inside the test body — the module itself imports cleanly, so this is not
an import/setup error.

### GREEN (observed source-backed values)

| Selector | Exit | Observed |
|---|---|---|
| `ORI-CONT-002-seam-anchors` | 0 | `#textclasscontext` 437 chars, `#rendermarkdown` 540 chars; owners verified in message.tsx/reasoning.tsx |
| `ORI-CONT-002-token-boundary` | 0 | 1 TokenTable binding, 1 provenance-checked example, no duplicated palette literal |
| `ORI-CONT-002-engine-provenance` | 0 | @theme example resolves byte-exact against apps/example/global.css (839 bytes) |
| `ORI-CONT-002-dark-mode-explanation` | 0 | ownership split stated; resolution order rnr-theme → prefers-color-scheme → dark; 3 onward links; no numbered lesson |

Artifacts: `.tmp/ORI-CONT-002/cycle-1/green/ORI-CONT-002-*.txt` and
`task-suite.txt`.

### Mutation controls (each must fail, naming the mismatch)

| Mutation (isolated copy of the real manuscript) | Rejected by |
|---|---|
| `## renderMarkdown` heading renamed (`### markdown rendering`) | anchor assertion naming `rendermarkdown` |
| `MessageResponse` renamed to `MessageBody` | attribution assertion naming `MessageResponse` |
| second `<TokenTable />` inserted | binding-count assertion naming `TokenTable` |
| docs `--primary` oklch line (taken from the real sheet at runtime) appended as a copied palette | palette-literal ban naming the value |
| one byte altered inside the @theme example (149.579 → 149.578) | provenance check (`verbatim` / `real source bytes`) |
| every `apps/example/global.css` mention renamed to `apps/example/theme.css` | source-naming assertion naming `apps/example/global.css` |
| dark-mode body emptied | ownership assertion naming `your app` |
| `rnr-theme` renamed to `docs-theme` throughout dark-mode.md | storage-key assertion naming `rnr-theme` (key derived from the real sources) |

Mutation copies are written under `.tmp/ORI-CONT-002/<run>/mutations/` and read
back from disk.

## Gates

| Gate | Command | Exit |
|---|---|---|
| AC-1 | `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors` | 0 |
| AC-2 | `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary` | 0 |
| AC-3 | `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance` | 0 |
| AC-4 | `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation` | 0 |
| task-suite | `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts` | 0 (4 passed) |
| typecheck | `pnpm typecheck` | 0 (does not claim apps/example or rendered-docs coverage) |
| lint | `pnpm exec biome ci tests/sprint-05-orient-search/theming-manuscript.test.ts` | 0 |
| scope | `git status --porcelain` | only the four allowlisted paths |

## Scope statement

Changed files: `apps/docs/src/content/docs/theming.mdx`,
`apps/docs/src/content/docs/dark-mode.md`,
`tests/sprint-05-orient-search/theming-manuscript.test.ts`, and this report.
The live route `apps/docs/src/pages/docs/theming.astro`, `seam-map.ts`,
`docs-navigation.ts`, all registry components, all engine configuration files,
and every other source were read but not modified.

## Assumptions recorded

- `order: 1` for Theming (hidden from navigation by the reserved `theming`
  slug; the value is inert until ORI-AST-003 adapts the route) and `order: 4`
  for Dark mode, assuming the Getting started reading order
  introduction=1, installation=2, cli=3, dark-mode=4, quickstart=5,
  owns-vs-does-not-own=6 (matching the destination order listed in ORI-AST-001
  AC-3). `publishedDocs` tie-breaks deterministically by id, so sibling tasks
  choosing different orders cannot break the build.
- Dark mode links `/docs/installation` and `/docs/cli` as the engine setup
  references (required by AC-4). Those manuscripts are ORI-CONT-001
  deliverables landing in this sprint; the built-site link check is owned by
  ORI-AST-006/ORI-CONT-004, and this task's contract asserts the link strings
  only.
- Theming links only to `/docs/dark-mode` (a same-commit deliverable), keeping
  every outbound link real at landing time.

## Explicitly not proven here (downstream owners)

- No rendered token values: ORI-AST-003 supplies the real TokenTable, binds the
  route adapter, publishes the adapted /docs/theming, and owns theme/first-paint
  proof.
- No browser reading, navigation, or no-JS proof: ORI-CONT-004 performs the
  locked browser-reading proof after AST-003 publishes.
- No visual presentation claims (DataTable/CodeBlock styling, DOCS-ONLY label
  rendering): ORI-VIS-002.
- No toggle-behavior correction: the Astro workstream owns moving the toggle to
  `.dark`/`color-scheme`; this manuscript deliberately describes neither.
- All evidence above was planned and then executed in this task; no flow
  artifact or canonical RED path ownership transferred to this task.
