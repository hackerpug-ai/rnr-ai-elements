# ORI-CONT-001 — content review (observed evidence)

Status: GREEN (cycle 1) · Run ID: `ORI-CONT-001-20260916T215814Z` · Branch: `kb-run-sprint/sprint-05-orient-search/ORI-CONT-001` · RED candidate HEAD: `54cec93f` (trunk; the three manuscripts absent)

Every value below was observed during execution against the built dist served by the owned preview at `http://localhost:4321`. Planned paths are treated as proof only after the runs recorded here.

## 1. Run identity and hashes (sha256)

| Artifact | Hash |
|---|---|
| `apps/docs/src/content/docs/introduction.md` | `317d150dd3451c53bf511c95f459024baca24624733ea6927736bfc6ee56a494` |
| `apps/docs/src/content/docs/installation.mdx` | `783d832710b793054d5c0cf2496efa86aa4ba7cb79140c03e25b6f66a8df54e1` |
| `apps/docs/src/content/docs/cli.md` | `ae5a3bd50a021b51fcc55768fc31ff57ca83a68589442ff36d00f22b779ad252` |
| `tests/sprint-05-orient-search/orientation-content.spec.ts` | `8921b6c76170c903e7d3baea0291ed48594a3e81c7a2bc90660cde38f63e74ae` |
| `packages/docs-snippets/commands/nativewind.sh` (AC-3 source oracle) | `5812581f66e98faac75bf7caf6a88fd7a5f3d93a3505cdaf103a73ebda7c3e5c` |
| `packages/docs-snippets/commands/uniwind.sh` (source oracle) | `d2d717c232b2d89a98d96c419d3a8fca5214026afb2997c0574de00b26079b6f` |
| `apps/docs/src/data/dev-client-matrix.json` (AC-4 dataset oracle) | `1eb805d9dcf67ffd0f384a792848d8462fb2eb768a78cd39458a5df4e85b2793` |
| `pnpm-lock.yaml` (unchanged from trunk) | `87be803bb28974756c3706fb89184e25e9ee40898030d1f6416ebe40517c79eb` |
| `.spec/e2e-policy/surface.json` | `f75b3ea90eb2d043fdc425be7a499585ec051e7cae7863a8ca03af4e1f2aa34b` |
| `apps/docs/dist/**` (built dist tree digest, GREEN candidate, 66 pages) | `2ae0f262d9e920422e5034dadad62b166c1013f4fba56c1e8855ce38e2d818d8` |

Ordered production build before each cycle, over cleared content-layer caches (`apps/docs/.astro`, `apps/docs/node_modules/.astro`, `apps/docs/dist` removed first — the ORI-CONT-005 stale-store hazard): `pnpm registry:build` (56 items × 2 engines = 112 files under `public/r/`) → `pnpm gallery:manifest` (56 items, 3 kinds) → `pnpm --filter @rnr-ai-elements/docs prebuild` ("56 items; props resolved for 39/39 component items; 9 families; public/r copy 114 files") → `pnpm --filter @rnr-ai-elements/docs build` (66 pages; RED candidate 63 pages). Standalone dist link gate over the same dist: `pnpm exec tsx scripts/docs-data/check-dist-links.ts --origin https://rnraielements.com` → exit 0, "66 html files, 1307 links (1298 internal, 9 external), 0 error(s), 6 warning(s)".

Preview ownership: `lsof -nP -iTCP:4321 -sTCP:LISTEN` reported the port free before every run; the Playwright `webServer` (`strictPreviewCommand()`) starts `astro preview` behind a strict-port guard that exits 1 if 4321 is already owned, and Playwright tears the server down at run end — no foreign preview answered any recorded run.

## 2. Gates

| Gate | Command | Exit | Observed |
|---|---|---|---|
| RED (pre-content) | `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts` | 1 | **12 failed / 0 passed** — every failure a real content assertion: `/docs/introduction must serve HTTP 200` (received 404) ×3 projects, `/docs/installation must serve HTTP 200` ×3, `/docs/cli must serve HTTP 200` ×3, content-contract first-route 404 ×3. Captured at `.tmp/ORI-CONT-001/cycle-1/red/run.txt` |
| GREEN (authored content) | same | 0 | **12 passed / 0 failed** (4 tests × chromium-desktop, chromium-mobile, chromium-nojs), 9.0 s, workers 1, retries 0. Captured at `.tmp/ORI-CONT-001/cycle-1/green/run.txt` |
| Typecheck | `pnpm typecheck` | 0 | root `tsc --noEmit` + registry typecheck clean |
| Lint | `pnpm lint` (`biome ci .`) | 0 | 161 files checked; 4 infos, all pre-existing in untouched `tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts` (same class ORI-CONT-005 recorded; `git diff --name-only` empty at lint time for that file) |
| Dist link gate | `pnpm exec tsx scripts/docs-data/check-dist-links.ts --origin https://rnraielements.com` | 0 | 0 errors; 6 warnings, all the pre-existing "Edit this page → GitHub blob/main" pattern for docs manuscripts (3 new of the same kind as the 3 already-landed manuscripts) — they 404 only until this branch lands on main |
| Scenario contract | normalized `{fixtures, requirements}` piped to `python3 ~/Projects/brain/tools/validate-scenario/validate_scenario.py` | 0 | `{"ok": true, "scenario_count": 4, "violations": []}` |
| Scope | `git status --porcelain` / `git diff --name-only` | 0 | changed set is exactly the five write-allowed paths plus `git add -f .tmp/ORI-CONT-001` |

Two mid-cycle spec corrections after the first GREEN (before any commit): the AC-1 capture flag re-queried a locator after navigation (capture never written), and the AC-4 matrix-row capture did the same; plus a TS18047 null-narrowing in `requireOk` surfaced by `pnpm typecheck`. All four tests re-ran green after each fix; the assertion set is unchanged from RED. The pre-commit `fallow audit --base HEAD` gate additionally required `// fallow-ignore-next-line complexity` directives above the three linear AC test functions (the load-bearing convention ORI-AST-001 documented for this gate); `pnpm exec fallow audit --base HEAD` exits 0 with the directives, the 74 inherited dependency findings excluded by the audit gate unchanged.

## 3. AC-1 — opening identity and ownership destination (observed)

HTTP `GET /docs/introduction` → **200** in all three projects; `main h1` = `Introduction`.

Opening paragraph (captured verbatim, `chromium-desktop-identity.json`):

> RNR AI Elements provides universal AI chat and agent UI components for React Native. One set of components covers iOS, Android, and Web, so the same chat surface ships on every platform. The library is distributed as a copy-paste registry: you run one command, the item's source is copied into your project, and the code becomes yours to read and edit. It is not an npm package — you never add a runtime dependency, and no part of the library loads from `node_modules`.

Asserted in every project: `React Native`, `AI chat`, `agent UI`, `copy-paste registry`, `not an npm package` all present, plus the contiguous phrase `universal AI chat and agent UI components for React Native`; `main pre` count 0 (no executable markdown in an explanation); no `npm install` claim anywhere in `main`.

Ownership teaser: exactly one `main a[href="/docs/owns-vs-does-not-own"]`. Clicking it navigates (soft-nav in JS projects, full load in chromium-nojs) to `/docs/owns-vs-does-not-own`; boundary `main h1` = `What the library owns`; boundary body assigns `transcript state`, `transport`, and `tool execution` to the consumer (all three asserted present, all projects).

## 4. AC-2 — one engine decision with complete commands (observed)

HTTP `GET /docs/installation` → **200**; `main h1` = `Installation`.

- Exactly **1** heading matching `/engine/i` ("Which engine does your project use?"); exactly **1** `main [role="tablist"]` and **1** `main rnr-tab-group` — no second or nested group.
- Served bytes: the nativewind command appears **exactly once** in the HTML, the uniwind command **exactly once** — each only inside its own panel.
- Decision rows (DataTable): the `NativeWind 4.2.6` row also contains `Tailwind v3` and `nativewind`; the `@theme` row also contains `Tailwind v4` and `uniwind`. `/nativewind\s+v3/i` never matches the page — the package version and the Tailwind major are never conflated.
- Desktop + mobile (chromium-desktop, chromium-mobile): after `__rnrTabGroupRegistered`, clicking the nativewind tab shows its panel and hides uniwind's; displayed panel text is exactly:
  - `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json`
  - clicking the uniwind tab flips `aria-selected="true"`, shows its panel, hides nativewind's; displayed text is exactly `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`; the uniwind panel does **not** contain `rnraielements.com/r/nativewind/`.
- JavaScript disabled (chromium-nojs): both panels **visible** stacked (`:not(:defined)` un-hide); both `rnr-copy-button code` texts equal the full commands above.

Served DOM excerpt (dist/docs/installation/index.html, group prefix digest-derived, nativewind default):

```html
<button type="button" role="tab" id="g-c1830170187e-tab-nativewind" data-engine="nativewind" aria-selected="true" …>
<button type="button" role="tab" id="g-c1830170187e-tab-uniwind" data-engine="uniwind" aria-selected="false" …>
<div class="tab-group__panel" role="tabpanel" id="g-c1830170187e-panel-nativewind" data-engine="nativewind" …>
<div class="tab-group__panel" role="tabpanel" id="g-c1830170187e-panel-uniwind" data-engine="uniwind" hidden …>
```

The TabGroup is the prerequisite `InstallCommand item="conversation"` composition — the manuscript carries no command bytes of its own (`main pre` count on /docs/installation = 0).

## 5. AC-3 — registry-specific CLI reference (observed)

HTTP `GET /docs/cli` → **200**; `main h1` = `CLI`; `main ol` count 0 (reference stays austere).

- Engine trees identified: `/r/nativewind/` and `/r/uniwind/` both present; absolute form `https://rnraielements.com/r/` present.
- Destination contract names `components.json` and addresses the reader ("your project", "the files belong to you").
- **Verified source command (byte-identical):** the test reads `packages/docs-snippets/commands/nativewind.sh` at run time and the page's example fence equals the extracted line exactly — `npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` (1 matching `pre`, captured `displayedExample` == `sourceCommand`).
- Every displayed `npx…` line (all `pre` blocks) matches `^npx .* add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$` — no short-name web-registry form is displayed as a command (the `add conversation` counter-example appears only inside inline code prose, never in a fence).
- Authoritative reference: exactly one `main a[href="https://reactnativereusables.com/docs/cli"]`; that URL is in the checker's fail-hard reference list and the build's link gate passed over it (live HTTP 200 re-verified with curl during authoring).

## 6. AC-4 — collection metadata, generated matrix and editorial contract (observed)

- **Metadata/navigation:** all three routes return 200 with `main h1` = Introduction / Installation / CLI and non-empty `meta[name="description"]`. Built nav (`nav[data-docs-nav]`) hrefs: `['/docs/introduction', '/docs/installation', '/docs/cli', '/docs/dark-mode', '/docs/owns-vs-does-not-own']` — positions `[0, 1, 2, 3]`, order metadata 1/2/3 reflected (order 4 dark-mode and 50 boundary unchanged).
- **Dev client matrix:** `section.dev-client-matrix tbody tr` count **4**, one per dataset entry (`enriched-markdown`, `streamdown`, `speech-recognition`, `extended-audio`); every row matches its dataset peers with ranges (`react-native-enriched-markdown 1.0.2`, `react-native-streamdown 0.3.0`, `react-native-enriched-markdown >=1.0.0`, `react-native-worklets >=0.10.0`, `remend 1.3.0`, `expo-speech-recognition 57.0.0`, `expo-audio 57.0.5`) and permissions (`NSPhotoLibraryAddUsageDescription`, `NSMicrophoneUsageDescription`, `NSSpeechRecognitionUsageDescription`, `INTERNET`, `RECORD_AUDIO`). The matrix is the prerequisite `DevClientMatrix` composition — no data duplicated in the manuscript.
- **Onward links:** 9 unique internal links collected across the three pages; every one resolves 200 through `page.request` (including `/components/conversation`, `/docs/owns-vs-does-not-own`, `/docs/theming`, `/docs/dark-mode`). Zero links match `/troubleshoot/i`.
- **Editorial/quadrant:** all three pages state scope and a `does not cover` non-scope; introduction and installation carry **0** `main pre` (no independently maintained executable markdown); installation carries numbered steps (`main ol` ≥ 1) with expected results per step; CLI carries none. Locked terms observed: `dev client` (installation), `engine tree` and `registry item` (CLI); `styling engine` and `registry variant` appear nowhere on the three pages.

## 7. Command provenance (every executable string displayed)

| Displayed where | Bytes | Provenance |
|---|---|---|
| Installation nativewind panel | `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` | `InstallCommand.astro` `installCommand('nativewind','conversation')` — the prerequisite locked-command interface; test-asserted equal |
| Installation uniwind panel | `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json` | same interface, `uniwind` engine |
| CLI example fence | `npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` | byte-compared at run time against `packages/docs-snippets/commands/nativewind.sh` (ORI-RN-001's verified recipe, executed for real in `quickstart-consumer-install.test.ts`) |

Live registry re-verified during authoring (2026-09-16): `https://rnraielements.com/r/nativewind/prompt-input.json` → 200 with self-dependency `https://rnraielements.com/r/nativewind/input-group.json` (canonical unversioned host, FIX-ORI-DEP-001-1); `…/r/nativewind/conversation.json` and `…/r/uniwind/conversation.json` → 200. Destination claims trace to `packages/registry/registry.json` targets (`components/ai/conversation.tsx`, `components/ui/item.tsx`) and the consumer templates' `components.json` aliases (`"ui": "@/components/ui"`), both read during authoring.

## 8. Captures and screenshots

- JSON captures: `.tmp/ORI-CONT-001/cycle-1/green/captures/{project}-{test}.json` — **12 files** (4 tests × chromium-desktop, chromium-mobile, chromium-nojs), all committed.
- Screenshots (full page, **6 files**): `chromium-{desktop,mobile,nojs}-identity.png`, `chromium-{desktop,mobile}-installation-uniwind.png`, `chromium-nojs-installation-nojs.png` under `.tmp/ORI-CONT-001/cycle-1/green/screenshots/`.
- **Inspection limitation, stated honestly:** the implementer session that produced this evidence cannot render images (no image input), so the PNGs above are captured and committed but were **not visually inspected by the author**. The readable-body proof rides on the DOM-level assertions recorded in §3–§6 (visibility, stacked no-JS panels, exact text equality); the committed PNGs stand ready for the reviewer's visual inspection.

## 9. Editorial review (page-by-page, self-review for the reviewer)

| Page | Quadrant | Audience | Scope / non-scope | Verdict |
|---|---|---|---|---|
| Introduction | explanation | RN developers who know components, not this registry | what the library is / not install commands, URL contract, tokens | Identity in one paragraph; no steps, no commands; one teaser link; descriptive onward links |
| Installation | how-to | integrators with an existing Expo project | choose engine + install Conversation / not project creation, provider wiring, troubleshooting | One engine question, imperative steps each with an expected result, commands only inside the one TabGroup, dataset matrix consumed, no fences |
| CLI | reference | integrators in a terminal | this registry's URL + destination contract / not the upstream command catalog | Austere: bullets + one verified example, no step lists, single authoritative link, `add conversation` shown only as the anti-pattern in inline code |

Known limitations carried forward (not blockers, recorded for the reviewer): (1) the "Edit this page" GitHub warnings in §2; (2) AC-2's scenario wording says a JavaScript-disabled reader "reads both ordinary panel bodies without attempting enhancement-only controls" — satisfied by the stacked-panel visibility assertions, with tab buttons inert rather than hidden; (3) ORI-CONT-004's shared flow (FLOW-DOCS-01) will re-exercise these pages in its own lane — nothing in that lane was written from this task.
