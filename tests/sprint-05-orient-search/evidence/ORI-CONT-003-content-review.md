# ORI-CONT-003 — content review (observed evidence)

Status: GREEN (cycle 1) · Run IDs: `ORI-CONT-003-<epoch>` per invocation (marker-carried) · Branch: `kb-run-sprint/sprint-05-orient-search/ORI-CONT-003` · RED candidate HEAD: `8c3cc30e` (trunk; `quickstart.mdx` and `docs/live-chat.md` absent)

Every value below was observed during execution. The built docs were served by the owned Playwright `webServer` (`astro preview`, strict port 4321) over the dist built by `pnpm --filter @rnr-ai-elements/docs build` after the ordered chain `pnpm registry:build` (56 items × 2 engines) → `pnpm gallery:manifest` → `prebuild` (56 items; props 39/39; 9 families) — 67 pages built, one more than trunk's 66 (`/docs/quickstart`). Consumers and the live example ran from real spawned services; the provider legs hit the official OpenAI Responses endpoint at `gpt-4.1-mini-2025-04-14`.

## 1. Run identity and hashes (sha256)

| Artifact | Hash |
|---|---|
| `apps/docs/src/content/docs/quickstart.mdx` | `d18fcb08a7d658216b87eaf93042902fda7a74b2845fd727d3f9112d33c5de18` |
| `apps/example/docs/live-chat.md` | `8f3129bc7b191fe83132f67ad406656fe58843f1e758780f9b680ff93c6a0c5c` |
| `apps/example/README.md` (additions only; preservation proven per-line against `git show HEAD:`) | `e946c2b4ddc08b6f2b933874cf8f2c8eb0c98d3b4fca7e519954b5bbae30e848` |
| `tests/sprint-05-orient-search/quickstart-content.spec.ts` | `b2b84fcdef4bac87eb70537f92baac658dad4d502b200c5ee02f00ee513057a2` |
| `packages/docs-snippets/commands/nativewind.sh` (recipe oracle) | `5812581f66e98faac75bf7caf6a88fd7a5f3d93a3505cdaf103a73ebda7c3e5c` |
| `packages/docs-snippets/commands/uniwind.sh` (recipe oracle) | `d2d717c232b2d89a98d96c419d3a8fca5214026afb2997c0574de00b26079b6f` |
| `packages/docs-snippets/shared/quickstart-screen.tsx` (displayed-source oracle) | `270a1c140af7b0095259bed4c8cb417fc231127469836565bed1453a1e8a91a2` |
| `packages/docs-snippets/shared/quickstart-messages.ts` (displayed-source oracle) | `fba7e6844e9ddc8ab6e4b8e638cda926a8123cb3629b3e329cc82a364f68c322` |
| `packages/docs-snippets/nativewind/app/index.tsx` (entrypoint oracle) | `af11e01b3cf55b807e259e3b426b19245ffebba5898aa20bf73234c54969497b` |
| `packages/docs-snippets/uniwind/app/index.tsx` (entrypoint oracle) | `2152e4cbcc3241dd45592baf380a6657ef6e1c26389a6467f1a1e25a8d4fecd4` |
| `.spec/e2e-policy/surface.json` | `f75b3ea90eb2d043fdc425be7a499585ec051e7cae3863a8ca03af4e1f2aa34b` |
| `pnpm-lock.yaml` (unchanged from trunk) | `87be803bb28974756c3706fb89184e25e9ee40898030d1f6416ebe40517c79eb` |
| `apps/docs/dist/**` (built dist tree digest, GREEN candidate, 67 pages) | `9db02f8c1b597aaf81c311c7b43195434125483e1bbbeb74916218f321d048b6` |

Scratch/process ownership: every long-lived child ran under `TMPDIR=/tmp/ori-cont-003-scratch` (the ORI-AI-002 machine finding — the worktree path overflows tsx IPC pipes and the agent-scratch reaper deletes mid-run dists). Port 4321 was owned only by the Playwright `webServer` behind its strict-port guard; port 4000 was probed free before every backend launch and one orphaned restart instance from a mid-fix iteration was identified by `lsof` (pid 87859, this worktree's `tsx apps/example/server/index.ts`) and killed before the recorded GREEN run. Consumer static serves and the live web serve bound ephemeral owned ports (final run: 55800 nativewind / 58423 uniwind); all were closed in `finally`.

## 2. Gates

| Gate | Command | Exit | Observed |
|---|---|---|---|
| Scenario contract | `{fixtures, requirements}` from REQUIREMENT-CONTRACT v1 piped to `python3 ~/Projects/brain/tools/validate-scenario/validate_scenario.py` | 0 | `{"ok": true, "scenario_count": 4, "violations": []}` |
| RED (pre-content, per-AC VERIFY) | `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts` | 1 | **8 failed / 4 passed** — every failure the real content assertion `Error: /docs/quickstart must serve HTTP 200` (AC-1 ×3 projects, AC-2 ×3, AC-3 desktop, AC-4 desktop); the 4 passes are the non-desktop early returns of the two heavy real-service ACs. Captured at `.tmp/ORI-CONT-003/cycle-1/red/run.txt` |
| GREEN AC-1 | `--grep ORI-CONT-003-AC-1` | 0 | 3 passed (desktop, mobile, nojs) |
| GREEN AC-2 | `--grep ORI-CONT-003-AC-2` | 0 | 3 passed (desktop, mobile, nojs) |
| GREEN AC-3 | `--grep ORI-CONT-003-AC-3` | 0 | 3 passed — the desktop run installed two clean consumers through the displayed commands (final full-suite marker `ORI-CONT-003-1790271747`), compiled, doctored, exported, served and drove both |
| GREEN AC-4 | `--grep ORI-CONT-003-AC-4` | 0 | 3 passed — the desktop run proved the live route against the real provider (final full-suite marker `ORI-CONT-003-1790271747`, response `resp_077a037ecde6f9ac006ab561653d4087d0b45455bf97a32d23`) |
| Full task-wide suite | `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-content.spec.ts` | 0 | **12 passed / 0 failed** (4 tests × 3 projects), recorded at `.tmp/ORI-CONT-003/cycle-1/green/full-run.txt` |
| Docs build | `pnpm --filter @rnr-ai-elements/docs build` | 0 | 67 pages (trunk RED candidate: 66) |
| Dist link gate | `pnpm exec tsx scripts/docs-data/check-dist-links.ts --origin https://rnraielements.com` | 0 | 67 html files, 1457 links (1446 internal, 11 external), 0 errors, 7 warnings — the pre-existing "Edit this page → GitHub blob/main" 404-until-merge class (quickstart adds the 7th of that class); the conclusion's `tree/main/apps/example` link resolves 200 live (AC-4 capture) |
| Typecheck | `pnpm typecheck` (root `tsc --noEmit` + registry) | 0 | clean after `registry:build`/`gallery:manifest`/`prebuild` hydration (the fresh-worktree TS2307 on generated `registry-items.json`, documented by ORI-RN-002) |
| Lint | `pnpm lint` (`biome ci .`) | 0 | 171 files checked; 4 warnings + 1 info, all pre-existing in untouched files (`biome.json` deserialize deprecation; `tests/sprint-05-orient-search/live-example-proof.test.ts` noNonNullAssertion ×3 + unused param); the task-owned spec is clean including the `fallow`-required `// fallow-ignore-next-line complexity` directives above the four linear AC test functions |
| Scope | `git status --porcelain` | — | changed set is exactly the five write-allowed paths plus `git add -f .tmp/ORI-CONT-003` |

Mid-cycle spec corrections before any commit (assertion set unchanged from RED): the messages-panel classifier tightened to `export const SEED_MESSAGES` (the screen source legitimately contains the `SEED_MESSAGES` import, so the loose predicate double-matched); README preservation re-based from substring to per-line containment (an additions-only edit can never contain the original contiguously); the guide-command probe moved from `spawnSync(timeout)` to a supervised detached process group (the timeout kills the shell but orphans the pnpm→tsx server grandchild); the AC-4 export gained a per-run Metro cache dir (Metro's transform cache does not key on `EXPO_PUBLIC_*` values — an export after a different port re-served the previous run's inlined URL, observed as a stale `56715` bake in a fresh `8411` export); provider-record correlation switched to stream-text hash matching (the app reuses one chat id per session, so requestId matching cannot discriminate turns — the ORI-AI-002 correlation) with the restart handle rebound (a stale handle reads an empty record log and orphaned the relaunched server on port 4000); the endpoint-loss proxy path now destroys the socket so the page observes a genuine `Failed to fetch` connection failure rather than a proxy-authored error body; the empty-composer attempt dispatches a DOM-level click (the send control is inert while empty — an actionability click waits forever on it).

## 3. AC-1 — one tutorial with a named result and step outcomes (observed)

HTTP `GET /docs/quickstart` → **200** in all three projects; `main h1` = `Quickstart`.

- **Exactly one tutorial**: exactly one dist route slug contains `quickstart` (`dist/docs/quickstart/`); exactly one `nav[data-docs-nav]` link targets `/docs/quickstart`; the built nav order is introduction (1), installation (2), **quickstart (2.5)**, cli (3), dark-mode (4), owns-vs-does-not-own (50) — ORI-CONT-001's nav-order assertions still hold (positions strictly increasing).
- **Named result before step 1** — the opening paragraph, captured verbatim:
  > In this tutorial we build a seed-data chat screen you can open in Expo Go. By the end you will see a scrolling message list seeded with a 24-turn conversation, type into a working prompt input, and watch your own message appear as a new turn — everything runs on seed data, with no model and no network call.

  All four required phrases asserted present in that first paragraph: `scrolling message list`, `prompt input`, `Expo Go`, `seed data`.
- **Per-step results**: 7 numbered steps, every `main ol > li` starts with an imperative `We …` and contains `You should see …` (asserted per step, all projects). Steps: install Conversation; install Message; install the composed PromptInput (+Item +Sheet); add `shared/quickstart-messages.ts`; add `shared/quickstart-screen.tsx`; render from `app/index.tsx`; run `npx expo start` and open in Expo Go.
- Scope and non-scope are stated (engine choice and model wiring excluded, linked to Installation); the tutorial body exceeds 600 chars; locked terms used: engine, engine tree, registry item, dev client ("no dev client needed"), peers.

## 4. AC-2 — complete engine panels import the executable source (observed)

Selection originates on `/docs/installation`'s engine control; navigation to `/docs/quickstart` (desktop + mobile): every tab group on the page reports the inherited engine as the only `aria-selected="true"` tab. Deliberately switching to uniwind, navigating to `/docs/cli` and back: uniwind selection survives; the nativewind panel of every group stays hidden (inactive instructions never display as selected). Zero-JS (chromium-nojs): both engines' panels stack readable; both conversation commands byte-complete in the served HTML.

- **All code belongs to engine panels**: `main pre` count **0** (no un-tabbed fenced code anywhere on the tutorial); every `rnr-copy-button` sits inside a `[role="tabpanel"]` (0 unpaneled); **6** tab groups (3 `InstallCommand` + 3 source groups), each with nativewind + uniwind panels carrying **6 code blocks per engine**.
- **Literal canonical commands** (displayed text, byte-compared):
  - nativewind conversation panel: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` (the InstallCommand contract, equal to the orientation page's locked command)
  - uniwind conversation panel: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`
  - **Separate Message install**: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/<engine>/message.json` (its own command; does not include prompt-input)
  - **Composed PromptInput install**: `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/<engine>/prompt-input.json https://rnraielements.com/r/<engine>/item.json https://rnraielements.com/r/<engine>/sheet.json` — the item set of the executed recipe (`packages/docs-snippets/commands/<engine>.sh` installs conversation + {message, prompt-input, item, sheet}); Item and Sheet are required because the installed `prompt-input.tsx` imports `@/components/ui/item` and `@/components/ui/sheet`, and conversation does not install any of them automatically.
  - No wrong-engine URL appears in a panel.
- **Imported source, byte-identical**: the tutorial reads the RN-owned files at build time (`readFileSync` over `process.cwd()/../..` in the MDX program block) — there is no hand-copied sample in the manuscript. The spec hashes the displayed text per engine against the committed files, all equal: `quickstart-messages.ts`, `quickstart-screen.tsx`, and each engine's own `app/index.tsx` entrypoint (the panels are engine-correct: the nativewind panel matches only the nativewind entrypoint bytes, and vice versa).
- **Composed PromptInput contract, never the string-callback sample**: the displayed screen contains `message: PromptInputMessage`, `message.text`, `PromptInputBody`, `PromptInputTextarea`, `PromptInputFooter`, `PromptInputSubmit`, and the measured-composer scroll-button offset — and does NOT contain a string-typed `onSubmit` (the known `apps/example/app/index.tsx` string-callback mismatch is never displayed).

## 5. AC-3 — the exact displayed lesson submits a real message (observed)

Two independent clean consumers under `/tmp/ori-cont-003-scratch/consumers/<engine>-<run>` (final full-suite run `1790271747`) (outside the monorepo; OS-derived roots), each seeded from the committed setup template (ORI-RN-001's file list), then — in the learner's order:

1. `pnpm install` (exit 0), `npx expo install` (exit 0).
2. **The three DISPLAYED commands verbatim**, extracted from the built page's engine panels at run time (see §4 literals) — all exit 0; install logs name `rnraielements.com` (public HTTPS registry; no hostname rewriting, no local stand-in).
3. The **exact displayed source** written as `shared/quickstart-messages.ts`, `shared/quickstart-screen.tsx`, `app/index.tsx` (the spec first proved displayed bytes == committed bytes, then copied the displayed text itself).
4. `pnpm exec tsc --noEmit` → exit 0 (both engines); `pnpm exec expo-doctor` → exit 0 (both engines).
5. `npx expo export --platform web` → exit 0; served on owned ephemeral ports (55800 nativewind / 58423 uniwind).

Driven in a real Chromium (390×844) per engine:

- **Case 1**: newest seed (`Seed turn 24: Ready for your message.`) visible; crawl union = **24** distinct seed turns (the whole transcript is reachable); oldest seed (`Seed turn 01: Plan a weekend walk.`) visible; typed marker `ORI-CONT-003-1790271747` submitted through `Send message` → the marker appears **exactly once**, crawl union = **25** turns (N+1), the turn inventory contains only seed literals + the marker (**no synthesized reply**), the composer **cleared**, and the transcript container remains **scrollable** (`scrollHeight > clientHeight`). Screenshots: `screenshots/nativewind-seed-marker.png`, `screenshots/uniwind-seed-marker.png`.
- **Case 2 (fresh page, initially empty composer)**: a DOM-level click on `Send message` fires no handler (the control is inert while empty) → crawl union stays **24**, the composer stays empty, **0 blank user turns**.

The Expo Go promise of the named result is not re-proven here — it is ORI-RN-003's landed six-target proof (both engines × iOS/Android/Web on real Expo Go, light + dark) and ORI-CONT-004's integrated gate; this task's Web legs use the same displayed source and commands.

## 6. AC-4 — the conclusion and run guide reach the real live example (observed)

- **Conclusion link beside useChat** (all projects): the final paragraph names AI SDK v7's `useChat` and links `open the worked example` → `https://github.com/hackerpug-ai/rnr-ai-elements/tree/main/apps/example`; live request → **200**.
- **README**: links `docs/live-chat.md`, distinguishes the routes (`/` offline fixture screen vs `/live-chat` live provider screen), and preserves **every original line** (per-line containment against `git show HEAD:apps/example/README.md`; missing-line set is empty — the edit is additions-only).
- **`docs/live-chat.md` is a run how-to**: opens with "This guide shows you how to…"; names the server-only variables (`OPENAI_API_KEY`, `EXAMPLE_CHAT_MODEL`, `EXAMPLE_CHAT_WEB_ORIGIN`, and the `EXAMPLE_CHAT_*` defaults) and the client variable `EXPO_PUBLIC_API_BASE_URL` without any values; names the model `gpt-4.1-mini-2025-04-14` and the fixed upstream; documents the per-platform endpoint rules derived from the implementation and the landed proofs — iOS simulator shares the host loopback (`127.0.0.1:4000`), Android emulator needs `adb reverse tcp:4000 tcp:4000` first (exactly the drivers' `reverseBackendPort`), Web must be same-origin (the server sends no cross-origin headers) with the export-time inlining rule; carries symptom → cause → fix entries for the unconfigured client, invalid server env (`invalid server configuration: …`), busy port, mid-chat connection loss, and the emulator loopback trap. Contains no credential-shaped value (asserted: no `sk-`).
- **The documented startup command runs verbatim**: `pnpm exec tsx apps/example/server/index.ts` spawned exactly as written (from the repository root) reached `ORI_AI_001_LISTENING 127.0.0.1:58726` and was torn down as a whole process group.
- **The real `/live-chat` proof** (owned backend on 4000 + `expo export` web build served same-origin with `/api/chat` forwarded and an SSE tee; `EXPO_PUBLIC_API_BASE_URL` inlined to the serve origin from a per-run Metro cache):
  - **First turn** (prompt `Remember the marker ORI-CONT-003-1790271747. Reply with three sentences about planning a walk.`): provider record completed with `responseId resp_077a037ecde6f9ac006ab561653d4087d0b45455bf97a32d23`, **57 deltas**, usage 64/58/122 tokens; **sha256 of the tee-captured stream text equals the server record's `textHash`** (`0140d90d…595b4c5` — exact hash correlation between what the page received and what the server proved to the provider); **8 incremental observations before completion** (3 distinct growing DOM texts + 6 distinct proxy chunk arrivals), mid-stream screenshot `screenshots/live-streaming.png`.
  - **Contextual follow-up** (`What marker did I ask you to remember?` — no nonce in the prompt): the streamed answer **contains the marker** — history reached the provider; hash correlation again exact.
  - **Endpoint loss + Retry**: with only the owned backend stopped, submitting `Reply with the single word pineapple.` surfaced an accessible alert reading the browser's genuine **`Failed to fetch`** connection error (sanitized: no `sk-`, no `OPENAI_API_KEY`; screenshot `screenshots/live-endpoint-loss.png`); after restarting through the guide's path, **Retry** completed a **fresh** provider request (its own stream-hash-matched record) with **exactly 1** retained `pineapple` user turn (screenshot `screenshots/live-recovered.png`).
- Credentials stayed server-side throughout: the key was stripped from the export and browser children's environment around their spawns and never captured; backend records are the sanitized `ORI_AI_001_RECORD` lines only.

## 7. Command provenance (every executable string displayed)

| Displayed where | Bytes | Provenance |
|---|---|---|
| Quickstart nativewind/uniwind conversation panels | `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/<engine>/conversation.json` | `InstallCommand.astro` locked interface; test-asserted equal to the canonical literal |
| Quickstart Message panels | `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/<engine>/message.json` | `InstallCommand` family form; the item the displayed screen's `@/components/ai/message` import needs |
| Quickstart PromptInput panels | `… add …/<engine>/prompt-input.json …/item.json …/sheet.json` (one invocation) | `InstallCommand` family form; the item set of the executed recipe `packages/docs-snippets/commands/<engine>.sh` (ORI-RN-001/002 install proof), regrouped so Message and the composed PromptInput are separate installs |
| Quickstart source panels (6 blocks) | the committed bytes of `quickstart-messages.ts`, `quickstart-screen.tsx`, both `app/index.tsx` entrypoints | read at build time from `packages/docs-snippets/**` — single source, no hand copy; spec-hashed equal per engine |
| Quickstart step 7 run instruction | `npx expo start` (inline code, not a block) | the consumer template's own start script |
| live-chat.md backend start | `pnpm exec tsx apps/example/server/index.ts` | executed verbatim in AC-4 (listening line observed); the same module the proof harness spawns |
| live-chat.md client runs | `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:4000 npx expo run:ios` / `run:android` (after `adb reverse tcp:4000 tcp:4000`) | `apps/example/package.json` scripts + the landed drivers' networking rule (`reverseBackendPort`, `BACKEND_HOST=127.0.0.1`) |
| live-chat.md web export | `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8082 npx expo export --platform web --output-dir dist-web` | the export command AC-4 executes (same bytes modulo the run's port/dir); same-origin rule from the server implementation (no CORS headers) and the reference forwarder `serveWithChatProxy` in `tests/sprint-05-orient-search/support/live-example-proof.test.ts` |

## 8. Stub scan and deviation notes

- Touched production content (the two manuscripts + README) contains no placeholders, TODO-style deferrals, or invented scripts/ports/variables: every command and variable name traces to a file listed in §7; the guide's failure remedies quote the implementation's own diagnostics.
- The spec's heavy ACs run their real-service proof once, on `chromium-desktop` only (early return elsewhere, recorded in each run's output); the mobile/nojs projects still prove every content assertion. This mirrors the locked flows' `--project=chromium-desktop` shape and avoids re-paying two public-registry installs per project.
- Native (iOS/Android) execution of the quickstart and live example remains owned by ORI-CONT-004's integrated gate (reserved `RNR_S05_IOS_UDID` / `RNR_S05_ANDROID_SERIAL`); nothing here claims it.
- `quickstart.mdx` uses `order: 2.5` — the schema's `z.number()` accepts it, navigation sorts between Installation (2) and CLI (3), and no sibling manuscript needed renumbering (all are write-prohibited to this task).
