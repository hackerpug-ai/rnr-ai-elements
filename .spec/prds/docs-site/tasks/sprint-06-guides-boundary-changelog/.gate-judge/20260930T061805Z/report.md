# Gate Judge Report — sprint-06-guides-boundary-changelog

Run dir: `.gate-judge/20260930T061805Z` · Judge: blind (input = source.md gate section only; evidence = running product at http://localhost:4321, executed commands, and the machine) · Date: 2026-09-30

Machine identity (first contact): `justinrich` @ `Justins-MBP-2.lan`, `$HOME=/Users/justinrich`, judged as-found (no fixture, no HOME override).

---

## FIRST CONTACT (step 6) — PASS (attempt 2)

**Result: pass — build exits 0, preview serves the printed URL, and the header links Guides, Porting, and Changelog each open a real page (not a 404) matching its Promise verbatim, on this machine as it is.**

- Machine identity (re-recorded this attempt): `justinrich` @ `Justins-MBP-2.lan`, `$HOME=/Users/justinrich`, 2026-09-30T02:17:40-0600. Port 4321 free before launch; no stale listener.
- `pnpm --filter @rnr-ai-elements/docs build` from the repository root → **exit 0**. Stdout carries verbatim: `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological`, `[docs-data] guides: 5 guides — cap satisfied`; link-check "0 error(s), 13 warning(s)".
- `pnpm --filter @rnr-ai-elements/docs preview` (default port) printed `Preview server running at http://localhost:4321 (pid 26101)`; curl → HTTP 200. Preview killed after judgment (pid 26101 only). The build's dist output was the only write.
- Promise (UC-DOCS-03) "A Guides section capped at five launch pages serves the re-theme, update, preview, engine-choice, and port-next jobs without becoming a curriculum." — **match**: /guides 200, "All guides 5"; re-theme/update/preview served directly by the five guides; the engine-choice job is answered by Installation ("Which engine does your project use?"), the port-next job by /porting ("Read it before backporting a web pattern").
- Promise (UC-DOCS-04) "The boundary page states as scannable tables that the library ships no transport, no streaming client, and no tool executor, and points to the example app as the worked reference." — **match**: /docs/owns-vs-does-not-own 200; "No. This library ships no transport / streaming client / tool executor." in table cells; "See the worked example app" + "example app source (apps/example)".
- Promise (UC-DOCS-05) "Porting notes explain intentional divergences from Vercel AI Elements and earlier RN ports before an extender backports anything." — **match**: /porting 200; "Read it before backporting a web pattern: the Deviations column states where the port changed the web original's structure"; Prior art credits the upstream and the earlier RN port.
- Promise (UC-DOCS-06) "One entry per release in reverse chronological order makes maintenance health visible on the site." — **match**: /changelog 200; exactly one entry per release, 0.2.1 → 0.2.0 → 0.1.0.
- Evidence: `step6-home.png`, `step6-guides.png`, `step6-porting.png`, `step6-changelog.png`, `step6-installation.png`, `step6-owns.png`, `step6-build-attempt2.log`, `step6-preview-attempt2.log`, `step6-machine-attempt2.txt`.

### Attempt 1 (blocked) — environmental deletion incident, remedied by the operator

The first first-contact attempt at 02:10 failed with `GateError: ... dev-client-matrix.json unreadable (ENOENT)`. Root cause: two git-tracked data files (`apps/docs/src/data/dev-client-matrix.json`, `token-usage.json`) were deleted from the working tree at ~01:38 mid-gate by an actor outside this judging session (dir mtime 01:38:27; the same build had succeeded three times earlier with the files present; the judge issued no working-tree writes between 01:34 and 02:10). The judge's run rules correctly forbade repairing the tree, so the attempt was recorded **blocked**. The operator then restored both files via `git restore` and authorized this re-attempt. Ledger line for attempt 1 kept as `blocked` for the record.

---

## Per-step verdicts

### Step 1 — build + preview on 4321 — PASS
- `lsof -nP -iTCP:4321 -sTCP:LISTEN` before start: **empty**.
- `pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build`: **exit 0**; registry stdout: `registry built — 56 item(s) x 2 engine(s) = 112 file(s) under public/r/`; no violation offenders (0 error(s); 13 external-link warnings only).
- Required stdout lines present verbatim: `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` and `[docs-data] guides: 5 guides — cap satisfied`.
- `pnpm --filter @rnr-ai-elements/docs preview --port 4321`: `Preview server running at http://localhost:4321 (pid 41675)`; curl -> **HTTP 200**. Evidence: `step1.png` (served homepage), `step1-build.log`, `step1-preview.log`.

### Step 2 — boundary / porting / registry cross-check — PASS
- `/docs/owns-vs-does-not-own` (200): real **tables**. Does-not-ship cells carry the exact terms: "No. This library ships no transport." / "...no streaming client." / "...no tool executor."; `useChat` in the consumer-wires cell ("You wire AI SDK v7 useChat, or a client you write."); ownership-split table (Layer/What it covers/Owned by) and a 5-row **Gaps** table each naming "Where your app provides it".
- `/porting` (200): mapping table with **Deviations** column, **40 rows** (>=5 required); not-ported list of **9**: canvas, connection, controls, edge, jsx-preview, node, panel, sandbox, toolbar. 40 + 9 = 49 upstream; ledger 56 = 40 mapped + 16 port-side additions.
- `/registry` (200): chips "All 56 | component 39 | ui 11 | lib 6"; counted rows = **56, split 39/11/6** (programmatically counted from the rendered table).
- Cross-check: every boundary gap names its consumer-owned provider; no not-ported element is claimed as shipped anywhere on the boundary page; the porting page explicitly defers ship/not-ship to the boundary page; home teaser agrees. **Zero contradictions, zero known omissions found.** Evidence: `step2-owns.png`, `step2-porting.png`, `step2-registry.png` + text dumps.

### Step 3 — five capped guides — PASS
- `/guides` (200): index lists **exactly 5** guides.
- Each guide 200 and opens with a sentence matching /This guide shows you how to/: re-theme (9 numbered steps in 3 ordered lists), update-installed-items (4 steps), preview-on-device (3 steps), customize-rendering (7 steps) — numbered steps verified in DOM (`<ol>` lists with visible markers).
- `/guides/troubleshooting` (200): **4 symptom->cause->fix entries** (web component from short name / missing styles wrong engine tree / Expo Go crash on dev-client items / renamed Streamdown option -> `importForwarding.moduleNames`).
- Judgment note (recorded honestly): the step sentence's "and numbered steps" — the 4 how-to guides have true numbered steps; troubleshooting has 0 `<ol>` but its structure is exactly the 4 symptom->cause->fix entries the same sentence mandates; judged as satisfying the step.
- `customize-rendering` documents `renderMarkdown` (dedicated section + inject-your-own-renderer steps) and `TextClassContext` (dedicated section).
- Component-page seam Callouts: `/components/message` (200) carries two Callouts — "The TextClassContext seam" and "The renderMarkdown seam" — linking `/guides/customize-rendering#textclasscontext` and `#rendermarkdown`; `/components/reasoning` (200) carries the renderMarkdown Callout; both anchor targets resolve on the guide page. Evidence: `step3-*.png`, `step3-probe.json`, `step3-callouts.json`, `step3-message-callout.png`.

### Step 4 — changelog — PASS
- `/changelog` (200): 3 releases in order **0.2.1 (2026-09-08) -> 0.2.0 (2026-09-08) -> 0.1.0 (2026-09-07)** — reverse-chronological.
- `/changelog/0.2.1` (200): literal "Released **2026-09-08**"; **Added / Changed / Fixed** headings all present (Added = "none", explicit).
- Touched-component links: prompt-input, agent, plan, model-selector, mic-selector, voice-selector -> **all 6 resolve 200**.
- No on-screen contradictions. Evidence: `step4-changelog-index.png`, `step4-021.png`.

### Step 5 — header links + `pnpm e2e:docs` — FAIL
- Header clause **PASS**: header shows Components, Registry, Guides, Porting, Changelog (screenshot `step5-header.png`); each resolves **200**.
- e2e clause **FAIL**: `pnpm e2e:docs` **exits 1**.
  - Attempt 1 (preview from step 1 still serving): **56 failed / 386 passed / 32 skipped** in 23.2m; no flaky, no suite-level retries (retries: 0). All 56 failures in sprint-01/03/04/05 lanes (site-crawl, ledger 56-rows/base-urls, home hero, family-grid-extras, search-contract, orientation-content, ...). **Sprint-06 lane: 0 failures** — FLOW-DOCS-03/04/05/06 green, and the docs-integrator-arc + docs-themer-arc journeys ran and passed, writing evidence (166 files under `.tmp/sprint-06-guides-boundary-changelog/e2e-evidence/` written this run, incl. FLOW-DOCS-03/04/05/06 surface JSONs).
  - Attempt 2 (clean: preview stopped, port freed before run): **112 failed / 206 passed / 24 skipped / 132 did not run**, exit 1 — worse, because two tracked data files had been deleted from the working tree at 01:38:27 (see first contact), ENOENT-ing matrix-reading tests. Sprint-06 lane still **0 failures**.
  - Conclusion: the command's own words demand "exits 0 with retries: 0, all lanes green". Even on the best reading (attempt 1, intact tree) it exits 1 with 56 cross-lane failures. The failures are genuine on the current tree, not caused by the judge's preview. **FAIL.**

### Step 6 — first contact — PASS (attempt 2; attempt 1 blocked by an environmental deletion incident, remedied by the operator)
See FIRST CONTACT section above.

---

## Surface contradictions check (per-step whole-screen judgment)

- Step 2 pages: no element contradicts the boundary/porting/ledger claims (footer, sidebar, home teaser all consistent).
- Step 3 pages: sidebar + footer expose exactly the 5 guides; no contradictions.
- Step 4 pages: header/footer consistent; no contradictions.
- Steps 5/6: contradiction is at command level (non-zero exits), not visual.

---

## OVERALL VERDICT

**fail** — steps 1-4 pass; step 6 passes on re-attempt (first contact: build exit 0, preview serves, header Guides/Porting/Changelog open real pages matching their Promises verbatim; attempt 1 was blocked by an environmental mid-gate deletion, remedied by the operator); step 5 fails (`pnpm e2e:docs` exits 1 with 56 genuine cross-lane failures and retries 0 on the intact tree — the sprint-06 lane itself is green).
