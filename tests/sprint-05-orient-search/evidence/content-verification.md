# ORI-CONT-004 content verification ledger

This ledger reconciles every substantive claim in the seven authored docs pages, the two
supporting publications, and the authored 404 copy against current source and real
integration evidence. Evidence keys: [SRC] current repository source read by the flow
tests; [RUN] a current-candidate flow run in this task's invocation (the flow `run.json`
artifacts alongside this file); [OWNER] committed evidence produced by the named owning
task; [GATE] a real content-gate output consumed by this task.

- Candidate: this task's worktree branch `kb-run-sprint/sprint-05-orient-search/ORI-CONT-004`.
- RED proofs: `FLOW-DOCS-01-getting-started-engine-decision/proof.red`,
  `FLOW-DOCS-01-theming-and-section-nav/proof.red`,
  `FLOW-DOCS-02-quickstart-chat-screen/proof.red` — run_flow captures against the
  recorded preimplementation source (planning SHA `38034e97`, flow tests added, twelve
  functional assertion failures, no infrastructure failures).
- Flow runs: the sibling `run.json` files record the source/lockfile/dist/policy hashes
  of the candidate each green run observed.

## Quadrant and audience audit

Audience for every surface: integrators who know React Native and Expo and need to
choose an engine, install this registry, build the seed screen, and run the separate
live example.

| Surface | Quadrant | Check |
| --- | --- | --- |
| `introduction.md` | explanation | Identity, distribution, ownership only; links out for commands. PASS |
| `installation.mdx` | how-to | One goal (install Conversation), engine chosen from project facts, steps state expected results. PASS |
| `cli.md` | reference | URL and destination facts only; defers the full command catalog to the RNR CLI reference. PASS |
| `theming.mdx` | reference | Lookup form: token table, engine configuration facts, two seams; no tutorial steps. PASS |
| `dark-mode.md` | how-to | Procedure for the app side plus the site's own resolution order; no token lookup. PASS |
| `quickstart.mdx` | tutorial | The sole tutorial (`tutorial: true`, verified by the single-tutorial gate below). |
| `owns-vs-does-not-own.md` | explanation | Ownership split and renderer trade-offs; no steps. PASS |
| `not-found.md` | how-to recovery fragment | One useful action after an unknown route. PASS |
| `apps/example/docs/live-chat.md` | how-to | Configure, start, exercise the live screen; troubleshooting. PASS |
| `apps/example/README.md` | reference | Entrypoint, structure, canonical run guide pointer. PASS |

## Claim map

### introduction.md

| Claim | Evidence |
| --- | --- |
| Universal AI chat and agent UI components for React Native; one set covers iOS, Android, and Web | [SRC] registry families in `apps/docs/src/data/families.json`; [OWNER] `ORI-RN-003/run-manifest.json` — six engine/platform legs rendered the same screen source. |
| Distributed as a copy-paste registry; not an npm package; nothing loads from `node_modules` | [SRC] committed recipes `packages/docs-snippets/commands/{nativewind,uniwind}.sh` install from public URLs; [OWNER] ORI-RN-003 install receipts show real `.tsx` files written into clean consumers outside this monorepo. |
| Items group into seven families; every item is prop-driven | [SRC] `apps/docs/src/data/families.json` (seven families); registry item sources take data through props. |
| Items build on React Native Reusables primitives | [SRC] registry sources import `@/registry/{engine}/components/ui/*` primitives. |
| Registry lives at `https://rnraielements.com`; engine tree per command | [RUN] flow 1 asserts both panel commands name `rnraielements.com/r/{engine}/conversation.json`; [OWNER] public HTTP lane (`public-http.test.ts`) and ORI-DEP-001 deployment evidence. |
| Boundary link opens substantive ownership content | [RUN] flow 1 follows the rendered link and asserts the ownership bodies. |

### installation.mdx

| Claim | Evidence |
| --- | --- |
| NativeWind 4.2.6 pairs with Tailwind v3 and a `tailwind.config.js` | [SRC] `apps/harness-nativewind/tailwind.config.js` maps utilities onto CSS variables. |
| Tailwind v4 with `@theme` in global CSS pairs with uniwind; no `tailwind.config.js` | [SRC] `apps/example/global.css` declares the `@theme` block; no tailwind config in the uniwind consumer trees. |
| Exactly one engine question and one engine-decision TabGroup; each full command inside its panel | [RUN] flow 1 counts the question, the persistent engine group, and each command's single occurrence. |
| The CLI writes files (e.g. `components/ai/conversation.tsx`), installs peers, prints paths | [OWNER] ORI-RN-003 leg receipts record the CLI writing the five required items into clean Expo 57 consumers. |
| Everything this guide installs runs in Expo Go; opt-in items need a dev client | [SRC] `apps/docs/src/data/dev-client-matrix.json` gates the opt-in verdicts; [OWNER] ORI-RN-003 ran every leg in Expo Go (iOS 17 simulator, Android emulator). |

### cli.md

| Claim | Evidence |
| --- | --- |
| Absolute HTTPS item URLs per engine tree (`/r/nativewind/`, `/r/uniwind/`) | [RUN] flow 1 asserts the panel commands; [SRC] public registry bytes are built into `apps/docs/public/r/{engine}/`. |
| The displayed command is copied from the committed recipe | [SRC] `packages/docs-snippets/commands/nativewind.sh` contains the same `npx --yes @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` line. |
| Destination contract: Conversation writes `components/ai/conversation.tsx`, Item writes `components/ui/item.tsx`; aliases resolve through `components.json` | [OWNER] ORI-RN-003 leg `session.json` records show those destinations in real consumers. |
| A bare short name resolves against the shadcn web registry (wrong tree) | [SRC] upstream RNR CLI behavior; the docs keep the absolute-URL contract and never display a short form. |
| Authoritative RNR CLI reference link | [RUN] flow 1 asserts the rendered link to `https://reactnativereusables.com/docs/cli`; [GATE] dist-link lane checks every external destination. |

### theming.mdx

| Claim | Evidence |
| --- | --- |
| Token sheet of plain CSS custom properties in `apps/docs/src/styles/global.css`; every color oklch; dark values are the defaults | [RUN] flow 2 reads the built `TokenTable` rows: >=10 paired `Light`/`Dark` oklch values, distinct `--primary` pair; [SRC] the sheet. |
| The `--code-background`/`--code-foreground` pair is docs-only | [RUN] flow 2 reads the `DOCS-ONLY` badges on those rows. |
| Uniwind needs no `tailwind.config.js`; tokens live in a `@theme` block; consumer `@theme` is distinct from this site's CSS | [RUN] flow 2 asserts the scoped statement and the "no Tailwind or `@theme` block is involved on this site" distinction; [SRC] `apps/example/global.css`. |
| The displayed status colors are copied byte-for-byte from `apps/example/global.css` | [RUN] flow 2 asserts the exact `--color-green-500` oklch line exists in the real file. |
| Surface tokens are bare HSL triplets mirrored in `apps/example/lib/theme.ts` | [SRC] flow 2 reads `lib/theme.ts` and asserts the `hsl(` triplets. |
| `#textclasscontext` and `#rendermarkdown` describe current interfaces | [RUN] flow 2 navigates both anchors and checks `message.tsx`, `reasoning.tsx`, and the `TextClassContext.Provider` consumers in the registry. |

### dark-mode.md

| Claim | Evidence |
| --- | --- |
| The app owns scheme state; example mirrors tokens in `apps/example/lib/theme.ts` | [SRC] flow 2 reads the file; the live matrix switched appearances through device settings. |
| Site resolution order: stored `rnr-theme`, then `prefers-color-scheme`, then dark; dark is the default | [OWNER] `FLOW-SHELL-01` (persisted toggle) and `FLOW-SHELL-02` (first-visit, no flash) proof sets. |

### quickstart.mdx

| Claim | Evidence |
| --- | --- |
| Sole tutorial; every engine-varying block uses the shared engine tabs; complete source for both engines | [GATE] single-tutorial lane (below); [RUN] flow 3 reads both panels' complete sources from the served page. |
| The displayed sources are the executable single source (build-time read from `packages/docs-snippets/shared/`) | [RUN] flow 3 hashes the displayed `quickstart-screen.tsx` and hands it to `runQuickstartProof`, which rejects any mismatch with the committed canonical hash. |
| 24 authored seed turns (`Seed turn 01` … `Seed turn 24`) | [RUN] flow 3 asserts both endpoints in the displayed source; [OWNER] RN-003 leg evidence records the same seed list on device. |
| Marker appears once; composer clears; no assistant reply | [OWNER] ORI-RN-003 six-leg manifest and the callback-disconnection negative control (baseline passes, disconnected fails, restored passes). |
| Both public conversation commands run with `rnraielements.com` unchanged | [RUN] flow 3 asserts the literal strings; [OWNER] ORI-RN-003 executed the recipes verbatim in clean consumers. |
| The worked example composes the items around AI SDK v7 `useChat` with server-held credentials | [SRC] `apps/example/app/live-chat.tsx` + `apps/example/server/*` (the key stays on the server); [RUN] the locked Quickstart playback awaits `run-live-example-proof.mjs` for both engines and binds the result in `FLOW-DOCS-02-quickstart-chat-screen/run.json`. |

### owns-vs-does-not-own.md

| Claim | Evidence |
| --- | --- |
| Five responsibilities stay in the consumer: transcript state, transport, streaming client, provider calls, tool execution | [SRC] `apps/example/app/live-chat.tsx` owns `useChat`; `apps/example/server/chat.ts` owns the provider call; registry items hold no model state. |
| `MessageResponse` and `ReasoningContent` take `renderMarkdown`, default plain Text, repair half-streamed markdown | [SRC] `packages/registry/src/components/ai/{message,reasoning}.tsx`. |
| Plain-Text core runs in Expo Go; `streamdown`/`enriched-markdown` introduce a dev-client requirement | [SRC] dev-client matrix; [OWNER] ORI-RN-003 ran the plain core in Expo Go; streamdown destination lane (`streamdown-destination-proof.test.ts`) proves the dev-client verdict. |
| The example's `/live-chat` route is the verified live screen | [OWNER] ORI-RN-004/005 and ORI-AI-002. **Correction in this task:** the page previously claimed the example "does not yet include a live streaming chat" — false against the landed, proven `/live-chat`; replaced with the link to the verified run guide `apps/example/docs/live-chat.md`. |

### not-found.md (authored 404 copy)

| Claim | Evidence |
| --- | --- |
| Unknown routes serve the authored manuscript with the recovery controls (Search the site, Components, Registry) | [RUN] flow 1 requests `/docs/ori-cont-004-missing`, asserts HTTP 404 plus the manuscript copy, and follows the Components and Registry links to 200 destinations. |

### apps/example/docs/live-chat.md

| Claim | Evidence |
| --- | --- |
| Backend env contract (`OPENAI_API_KEY`, `EXAMPLE_CHAT_MODEL`, `EXAMPLE_CHAT_WEB_ORIGIN` server-only; fixed official endpoint) | [SRC] `apps/example/server/env.ts` schema and `FIXED_OPENAI_BASE_URL`; [OWNER] the ORI-AI-002 runner launches the backend through this exact contract. |
| `ORI_AI_001_LISTENING 127.0.0.1:4000` start line; nonzero exit on invalid config | [OWNER] ORI-AI-001 evidence; the live runner's backend lifecycle records. |
| Platform reach (simulator loopback, `adb reverse`, same-origin web forward) | [OWNER] the ORI-AI-002 six-target matrix exercised iOS, Android, and the same-origin web session. |
| Streaming-in, single retained turn on Retry, sanitized errors, Stop aborts | [OWNER] ORI-AI-002 per-target result sets (request/response IDs, hashes). |

### apps/example/README.md

| Claim | Evidence |
| --- | --- |
| Real consumer app; installs through the real RNR CLI; no workspace alias into `packages/` | [SRC] no workspace aliases in `apps/example`; [OWNER] ORI-RN-004/005 consumer proofs. |
| Two routes (`/` offline, `/live-chat` live); canonical run guide is `docs/live-chat.md` | [SRC] route files; the README links the same guide this ledger verifies. |

## Boundary search and 404 recovery observations

- `transport` in the real Pagefind dialog surfaces `/docs/owns-vs-does-not-own/` and
  keyboard selection opens it (flow 1, chromium-desktop and chromium-mobile). The
  chromium-nojs floor follows Introduction's boundary link instead and reads the same
  ownership bodies.
- `/docs/ori-cont-004-missing` returns a real 404 with the authored recovery copy and
  working onward controls: the recovery search trigger plus the plain Components and
  Registry links, both resolving at HTTP 200 (flow 1, every project).

## Content gates consumed [GATE]

| Gate | Output |
| --- | --- |
| snippet (`pnpm --filter @rnr-ai-elements/docs run check:snippets`) | exit 0 on this candidate — executed by flow 1's ledger case. |
| dist-link (`pnpm --filter @rnr-ai-elements/docs run check:links`) | exit 0 on this candidate (69 html files, 0 errors; external-link warnings are the not-yet-merged GitHub destinations, the same class as the pre-existing edit links). |
| single-tutorial (`singleTutorialViolations` over the published collection) | no violations — exactly one tutorial, at `/docs/quickstart`. |
| ordered build (registry → gallery → prebuild → astro → index) | exit 0; pagefind index rebuilt after the last astro build. |

## Consumed integration evidence

- Seed matrix: the locked Quickstart playback awaits `runQuickstartProof` (the ORI-RN-003
  driver) unchanged. The driver creates two clean consumers from the committed templates,
  runs the literal public commands, and writes
  `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json`. The binding
  record for this candidate is `FLOW-DOCS-02-quickstart-chat-screen/run.json` (`seed.run_id`,
  `seed.completed`, and `seed.manifest_sha256`). An earlier partial manifest is not this
  playback.
- Live matrices: the same playback then awaits `run-live-example-proof.mjs` (the ORI-AI-002
  runner) once per engine, on iOS, Android, and Web. `run.json` `live` holds each engine's
  `run_id` and manifest hash. The runner's output directories stay owned by ORI-AI-002.
- Both drivers are consumed through their declared interfaces. This task does not patch them.

## Consumer web pin consumed from FIX-ORI-CONT-004-1

On 2026-09-26 a fresh uniwind consumer resolved `react-native-web@0.21.3`. That release
exports `InputAccessoryView`, and Uniwind 1.11.0 maps that path to a file the package does
not ship, so `expo export --platform web` failed. NativeWind was unaffected. Five seed legs
passed and the uniwind web leg did not. That failure is the functional RED recorded in
cycle 1; it is not a missing server.

FIX-ORI-CONT-004-1, commit `7d4103ea`, pins `react-native-web` to exact `0.21.2` in
`packages/docs-snippets/nativewind/package.json` and
`packages/docs-snippets/uniwind/package.json`. This candidate includes that commit. The
locked playback still fails closed if any of the six seed legs or six live legs is missing.
