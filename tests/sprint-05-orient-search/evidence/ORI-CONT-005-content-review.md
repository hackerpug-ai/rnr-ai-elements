# ORI-CONT-005 — content review (observed evidence)

Status: GREEN (cycle 1) · Run ID: `ORI-CONT-005-20260915T030059` · Branch: `kb-run-sprint/sprint-05-orient-search/ORI-CONT-005` · HEAD at verification: `30d14badaaadbf74cafbd81a20762319d62b70e9`

Every value below was observed during execution. Planned paths are treated as proof only after the runs recorded here.

## 1. Run identity and hashes (sha256)

| Artifact | Hash |
|---|---|
| `apps/docs/src/content/docs/owns-vs-does-not-own.md` | `ca23e0ab23beb4520db19885942b4e81f2053de2e1b1e4e170c6140f12f6e133` |
| `apps/docs/src/content/system/not-found.md` | `361dfc2426b3ca262a3babf184eda7a85e5d31e0c5e777e7f436f140a9586e3f` |
| `tests/sprint-05-orient-search/boundary-content.spec.ts` | `ad96a14187a65d84021f7d01a9ddea5d606c728f3d92016ff3a3c8f41e055fb5` |
| `packages/registry/src/components/ai/message.tsx` (source oracle) | `b87830c643bf3340c0d1db477922071ed7066a0ad111214843dd8adf2acd10f1` |
| `packages/registry/src/components/ai/reasoning.tsx` (source oracle) | `14d0c1d3c2a965dc22c65411870152341e6f9b7b524b0009c0b1a4b1e5ee6641` |
| `apps/docs/src/data/dev-client-matrix.json` (source oracle) | `1eb805d9dcf67ffd0f384a792848d8462fb2eb768a78cd39458a5df4e85b2793` |
| `pnpm-lock.yaml` | `49d85925d40445f37367506111ef3942568d5000a3097b4f26f318d74a446e55` |
| `.spec/e2e-policy/surface.json` | `f75b3ea90eb2d043fdc425be7a499585ec051e7cae3863a8ca03af4e1f2aa34b` |
| `apps/docs/dist/docs/**` (built dist tree digest) | `5be446ed14fe7059f604096b358f02fe6c06b3ef4da37ce3fae817951e75c623` |

Build inputs ran in order before the dist digest: `pnpm registry:build` (56 items × 2 engines = 112 files), `pnpm -w run gallery:manifest` (56 items), `pnpm --filter @rnr-ai-elements/docs prebuild` (gates passed: "56 items; props resolved for 39/39 component items; 9 families; public/r copy 114 files"), then `pnpm --filter @rnr-ai-elements/docs exec astro build` (62 pages) over a cleared content-layer cache (`apps/docs/.astro`, `apps/docs/node_modules/.astro`, `apps/docs/dist` all removed first — see §6 for why this matters).

## 2. Gates

| Gate | Command | Exit | Observed |
|---|---|---|---|
| RED (pre-content) | `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts` | 1 | 12 failed / 0 passed — 3× `/docs/owns-vs-does-not-own must return HTTP 200` (route 404), 3× AC-2 browser-leg `expect(response?.status()).toBe(200)` at 404, 3× AC-3 route 404, 3× `not-found.md must exist as a real file` |
| GREEN (authored content) | same | 0 | **12 passed / 0 failed** (AC-1..AC-4 × chromium-desktop, chromium-mobile, chromium-nojs), 8.8 s, workers 1, retries 0 |
| Typecheck | `pnpm typecheck` | 0 | root `tsc --noEmit` + registry typecheck clean |
| Lint | `pnpm lint` (`biome ci .`) | 0 | remaining diagnostics for `tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts` are infos; single-file `biome ci` on that untouched tracked file exits 0 |

RED captured at `.tmp/ORI-CONT-005/cycle-1/red/` (run.txt + per-project captures), GREEN at `.tmp/ORI-CONT-005/cycle-1/green/` (run.txt + per-project captures). Neither cycle was overwritten after capture.

## 3. AC-1 — ownership split (observed prose)

HTTP `GET /docs/owns-vs-does-not-own` → **200** in all three projects. Excerpts asserted against the rendered `main` text (capture `chromium-*-ac-1.json`):

- Scope: "This page explains who supplies what in an RNR AI Elements chat. Read it to decide which pieces your application must build before any component renders useful output." Non-scope: "It does not cover installation steps or the token system."
- Library side (headings `What the library supplies` / `What your app supplies` render H2): "This library supplies **AI UI compositions** over **React Native Reusables** (RNR) primitives." and "The components are prop-driven and hold no model state."
- Consumer side — the five exact responsibility strings render in the bulleted list: `transcript state`, `transport`, `streaming client`, `provider calls`, `tool execution`.
- Explicit disclaimer: "The library makes no provider calls and executes no tools." No "Coming soon" anywhere in `main`.

Source of truth: repo `AGENTS.md` "What this library owns, and what it does not own" section (same five consumer responsibilities and the prop-driven/stateless statement).

## 4. AC-2 — renderer explanation (source-matched)

Repository-source leg (read as real bytes in the Node worker):

- `message.tsx` matches `/renderMarkdown\?: RenderMarkdown/` and `return <Text` (lines 98–125: `MessageResponseProps.renderMarkdown?`, default branch `<Text className={cn('text-base', className)}>`).
- `reasoning.tsx` matches `/renderMarkdown\?: RenderMarkdown/` and the plain-Text fallback `<Text className="text-sm leading-5 text-muted-foreground">` (lines 181–211).
- Neither file contains `from 'react-native-enriched-markdown'` — no import of the native module; comments naming it remain (message.tsx:25), which is why the oracle asserts the import graph, not the string.

Dev-client matrix leg (`dev-client-matrix.json` parsed live): `streamdown` entry with peers `react-native-streamdown 0.3.0`, `react-native-enriched-markdown >=1.0.0`, `react-native-worklets >=0.10.0`, `remend 1.3.0`; `enriched-markdown` entry with peer `react-native-enriched-markdown 1.0.2`. Verdicts are read from the matrix, never reauthored.

Visible prose asserted on the built route (all projects): `MessageResponse`, `ReasoningContent`, `renderMarkdown`, the concrete omit/supply example ("Omit the prop and each component renders the string as plain Text; supply one and the component renders your function's output."), `streamdown`, `enriched-markdown`, `dev client` (defined on first use: "A dev client is a development build of your app that includes native modules Expo Go cannot load."), `Expo Go`, and the counter-claim guard "The plain-Text core runs in Expo Go with no extra dependency."

## 5. AC-3 — onward references (observed statuses) and AC-4 — recovery copy

Onward references observed on the built boundary page (capture `chromium-desktop-ac-3.json`):

| Link text | href | Observed |
|---|---|---|
| Theming: the renderMarkdown seam | `/docs/theming#rendermarkdown` | 200; `#rendermarkdown` attached; heading contains "renderMarkdown seam" |
| Message reference | `/components/message` | 200; h1 contains "Message" |
| install docs matrix | `/components` | real destination (DevClientMatrix section) |
| example app source (apps/example) | `https://github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example` | local `apps/example/README.md` + `app.json` exist; prose states "The source shows installation and composition today; it does not yet include a live streaming chat." — no live useChat claim |

No `href="#"` placeholders anywhere in the article.

AC-4 (parsed from the actual `apps/docs/src/content/system/not-found.md` bytes, capture `ac-4.json`): title `Page not found`; cause sentence contains `could not be found`; action label `Search documentation`; exactly two links `Introduction → /docs/introduction` and `Browse components → /components`; source path contains `src/content/system` and not `src/content/docs`; no collection duplicate (`src/content/docs/not-found.md` absent); no moved/deleted claims; no `#` placeholders.

## 6. Verification incidents (resolved, recorded for the reviewer)

1. **Content-layer cache replay.** After moving the authored files out for the RED run, `astro build` kept emitting `/docs/owns-vs-does-not-own` because Astro's content store persists in `apps/docs/node_modules/.astro`. RED runs before this discovery were invalid (9 passed against a replayed cache). Fix: clear `apps/docs/.astro`, `apps/docs/dist`, and `apps/docs/node_modules/.astro` before every build. The recorded RED (§2) was captured after the cache fix and fails 12/12 on genuine content absence; the recorded GREEN rebuilt from a clean cache (62 pages) and passes 12/12.
2. **Preview-origin contention.** Concurrent sibling task sessions (observed: `ORI-AST-002`, PIDs 95460/82559/19690, cwd `.../ORI-AST-002/apps/docs`) bind the shared localhost:4321 preview. Playwright's `reuseExistingServer` then serves their dist to this task's tests. Per the task contract the unowned listener was never killed; each recorded run waited for the port to free (poll via `lsof`) so the strict-preview webServer served this candidate's own dist.
3. **False source oracle.** The first draft asserted `messageSource.includes('react-native-enriched-markdown') === false`; `message.tsx:25` names the module in a doc comment. Corrected to assert the import graph (`from 'react-native-enriched-markdown'` absent), which is the claim the page actually makes.

## 7. Contract deviation — recorded blocker (not silently weakened)

AC-3's contract pins three internal link targets: `/components/streamdown`, `/components/message`, `/docs/theming#rendermarkdown`. **`/components/streamdown` does not exist in the current build and cannot be created inside this task's write scope.** Observed proof:

- `curl http://localhost:4321/components/streamdown` over the real built preview → **404**; `apps/docs/dist/components/` contains 56 item directories + index, none named `streamdown`.
- The item fan-out derives from `packages/registry/registry.json` (56 items; no `streamdown`) through `scripts/docs-data/prebuild.ts`; `scripts/docs-data/gates.ts` (PINNED_MATRIX_NAMES comment) states the dev-client matrix entries are "consumer-opt-in capability names, not registry item names" — the architecture deliberately produces no streamdown item page.
- Every path that could create the destination is write-prohibited here: `apps/docs/src/pages/**`, `apps/docs/src/components/**`, `apps/docs/src/data/**`, `packages/**` (task writeProhibited).

Resolution taken: the boundary page carries only real destinations (task Rule "links only to real destinations"; AC-3's own negative control forbids "point[s] to absent targets"). `streamdown` remains fully explained in visible prose (AC-2, and the search-facing needs of ORI-AST-010/ORI-VIS-003 query the prose, which contains `streamdown`). The one-line content edit to add the contracted link once the destination exists is left to the sprint owner.

**Blocker:** AC-3's third contracted internal link `/components/streamdown` requires a streamdown item destination that no landed task provides — see `packages/registry/registry.json` (no `streamdown` item among 56), `scripts/docs-data/prebuild.ts:148` (dataset = `registry.items` only), `scripts/docs-data/gates.ts:227` (matrix names are "not registry item names"), and `apps/docs/src/pages/components/[item].astro:47` (route fan-out = dataset only). Same destination is asserted by ORI-AST-004 AC-1, ORI-VIS-003 AC-2, ORI-AST-010 AC-3, and gate-flow steps at `human-flows.json` lines 730/742 — the gap is sprint-level, not content-level.

## 8. Scope and quadrant conformance

- Written files are exactly the four allowed: the two Markdown sources, the spec, this review. No route, loader, search, indexing, dependency, or registry file touched (`git status` shows only untracked additions under `apps/docs/src/content/`, `tests/sprint-05-orient-search/boundary-content.spec.ts`, and `.tmp/ORI-CONT-005/`).
- `owns-vs-does-not-own.md` is explanation-quadrant: no steps, no numbered procedure, understanding-oriented prose with short sections. `not-found.md` is how-to-quadrant: one cause sentence, one action label, two direct imperative-recovery links.
- Terminology: engine/registry item/peers/dev client used per the content standard's lock (no "styling engine", "component" for items, "dev build"). No second boundary page, no Sprint-06 ownership tables, no future-tense shell, no fabricated gaps list.

## 9. Implementer audit (pre-review pass)

Subagent dispatch was unavailable at this session's nesting depth, so the independent `techwriting-reviewer` pass remains the orchestrator's reviewer-lane gate. The implementer's own audit, recorded here:

- **Claim-to-source map.** "AI UI compositions over React Native Reusables (RNR) primitives", the five consumer responsibilities, "prop-driven and hold no model state" → `AGENTS.md` ownership section. `renderMarkdown` prop + plain-Text fallback + repair-before-branch → `message.tsx:96-125`, `reasoning.tsx:179-211`. Peer counts and names → `dev-client-matrix.json` (streamdown: 4 peers; enriched-markdown: 1). "Expo Go cannot load the native modules the optional renderers need" → `AGENTS.md` Expo Go section (`react-native-enriched-markdown` is a Fabric native module absent from Expo 57's bundled list). "virtualized transcript view, message bubbles, the composer, the reasoning disclosure, tool cards" → the real conversation/message/prompt-input/reasoning/tool registry items. No claim in the page lacks a source.
- **Terminology.** "dev client" defined at first use and locked; RNR expanded at first use; "components" appears only for registry:component-class items (message/reasoning), the standard's reserved sense; no banned synonyms ("styling engine", "dev build", "flavor").
- **Quadrants.** Boundary page holds no imperative steps and no ownership table (Sprint 06's); recovery copy is one cause, one action, two links.
- **Evidence reality.** Hashes in §1 re-verified by `shasum -a 256` at audit time; RED/green run files exist under `.tmp/ORI-CONT-005/cycle-1/` with the counts stated in §2; the dist contains `docs/owns-vs-does-not-own/` and no `components/streamdown/`.
