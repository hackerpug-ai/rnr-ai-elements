# Remediate the sprint 6 human gate

The verified run `20261007T080345Z` is fail, 3 of 6. Steps 1, 2, and 4 passed. Steps 3, 5, and 6 failed. The functional requirements in `04-uc-docs.md` and the task files already match the shipped pages. Two of the three failures are the gate sentence describing a different product than the one those requirements name. One failure is a real suite exit.

Do not rename the five guides. Do not add a sixth guide. Do not move registry generation into `apps/docs/dist`. Do not stub `RNR_S05_IOS_UDID`.

## What the gate saw

| Step | What the sentence required | What the machine showed | Kind |
|---|---|---|---|
| 3 | Every guide, including troubleshooting, has numbered steps | `/guides/troubleshooting` is HTTP 200, opens with "This guide shows you how to…", and has four Symptom / Cause / Fix entries. The HTML has no ordered list. The other four guides do have numbered steps. | Sentence disagrees with the requirement |
| 5 | `pnpm e2e:docs` exits 0 and stdout contains `retries: 0`; every lane is green, including FLOW-DOCS-03/04/05/06 and the two journeys | Exit 1 after 23.9 minutes. Footer: 481 passed, 34 skipped, 1 failed. The only failure is sprint 5 `FLOW-DOCS-02` in `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts:205`: `RNR_S05_IOS_UDID must be provided`. Sprint 6 lanes were not in the failed list. Playwright config sets `retries: 0`, and the list reporter never prints that string. | Product/suite failure, plus a sentence that names a string the command does not print |
| 6 | The docs build writes only `apps/docs/dist`. Promise UC-DOCS-03 is served by guides named engine-choice and port-next | Build exits 0. The same command also regenerates `public/r` (114 files), `apps/docs/public`, `apps/docs/src/data/*`, and `apps/example/gallery/manifest.ts`. Git content did not change. Guides index is exactly five: Re-theme, Update installed items, Preview on a device, Customize rendering, Troubleshooting. Boundary, Porting, and Changelog match UC-DOCS-04, 05, and 06. | Sentence disagrees with the requirement |

## Why the two sentences are not product bugs

UC-DOCS-03 AC-6, in `.spec/prds/docs-site/04-uc-docs.md`, says: "System limits the Guides section to five pages at launch (engine choice and porting are NOT guides — Installation and /porting own them)." The sprint overview says the same thing: the roadmap sketch listed engine-choice and port-next as guides, and the plan rejected that. The promise line copied into step 6 is the older one-sentence summary, not AC-6.

GBC-002 requires troubleshooting to be four symptom-cause-fix entries, and it forbids the job-guide template. GBC-002's own scope note tells GBC-011 to exempt that page from the numbered-step template. Step 3's "numbered steps" clause was written once for all five guides and then applied to the page that was specified to have none.

`apps/docs/package.json` `build` is `registry:build && gallery:manifest && prebuild && check:snippets && astro build && search:index && check:links`. Registry JSON lives at `public/r` because consumers install from that URL. The sprint's own tasks say those files are generated and gitignored. "Only `apps/docs/dist`" describes a build this repo does not have.

## What is a real fix

`pnpm e2e:docs` runs `playwright test` over all of `tests/**/*.spec.ts`. Sprint 6's gate command therefore executes sprint 5's quickstart matrix. That test fail-closes when `RNR_S05_IOS_UDID`, `RNR_S05_ANDROID_SERIAL`, or `OPENAI_API_KEY` is empty, then drives iOS, Android, web, and a live OpenAI call. On this machine the variable was empty, so the suite exited 1 before any device work. Sprint 6's own lanes were already green inside that same run.

The string `retries: 0` is config (`playwright.config.ts` line 20), not command output. The list reporter prints `481 passed`, not `retries: 0`. A green rerun still will not show that phrase. Correct the sentence to the footer the command prints, after the suite is actually green. Do not add a log line whose only job is to contain `retries: 0`.

## Tasks

### 1. Correct the two gate sentences that name the wrong product

Scope: `.spec/prds/docs-site/tasks/sprint-06-guides-boundary-changelog/SPRINT.md` (the TESTING-GATE block and the matching success sentence) and the same three sentences in `.spec/prds/docs-site/ROADMAP.md` so the next plan does not copy the old wording back.

Acceptance:

- AC-1. Step 3 still requires the five named guides, HTTP 200, the opener `/This guide shows you how to/`, and 4 symptom→cause→fix entries on troubleshooting. Numbered steps apply to re-theme, update-installed-items, preview-on-device, and customize-rendering. Troubleshooting is graded on symptom, cause, and one fix per entry.
- AC-2. Step 6 keeps the four Promise lines. After the UC-DOCS-03 quote, the step says the five launch pages are re-theme, update, preview, customize-rendering, and troubleshooting, and that engine choice stays on Installation and port-next stays on /porting, quoting UC-DOCS-03 AC-6.
- AC-3. Step 6 names the writes the documented build actually performs: `apps/docs/dist`, the generated registry under `public/r`, the generated docs data under `apps/docs/src/data` and `apps/docs/public`, and `apps/example/gallery/manifest.ts`. It still forbids install, publish, and hand edits.
- AC-4. Step 5's `retries: 0` clause becomes the footer the command prints on a green run: exit 0, failed count 0, and the sprint-06 lane plus both journeys in the passed set. Write the exact footer only after task 2 has a green log.

Dependencies: none. Do this before re-judging. A planner owns the wording (`techwriting-planner`), because these are gate sentences, not page copy.

### 2. Make `pnpm e2e:docs` exit 0 on this machine

Scope: `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts` (the test at line 205), `playwright.config.ts` only if the project list is the right seam, and the env this worktree uses to run the suite. Do not weaken the assertion inside the matrix. Do not set a fake UDID.

The sprint 5 test is one Playwright test that, on chromium-desktop only, requires three real secrets and then runs a six-target seed matrix plus a live provider matrix. `pnpm e2e:docs` has no grep, so that test is part of the sprint 6 command.

Acceptance:

- AC-1. With the machine's real `RNR_S05_IOS_UDID`, `RNR_S05_ANDROID_SERIAL`, and `OPENAI_API_KEY` present, `pnpm e2e:docs` from this worktree exits 0. The failed list is empty. FLOW-DOCS-03, FLOW-DOCS-04, FLOW-DOCS-05, FLOW-DOCS-06, docs-integrator-arc, and docs-themer-arc are in the passed output.
- AC-2. If any of those three values is missing or the named simulator is not booted, stop and say which one. Do not skip the test to force exit 0. That is a missing device, not a docs-site defect.
- AC-3. Record the green footer verbatim and use it in task 1 AC-4.

Dependencies: task 1 can start in parallel. Task 1 AC-4 waits on this log.

Recommended agent: `aisdk-implementer` for the live-matrix env and the spec, then `aisdk-reviewer`. This is the sprint 5 proof, not a docs page.

### 3. Re-run the human gate and accept only a verified pass

Scope: the same sprint directory. No product edits in this task.

Acceptance:

- AC-1. A new `/kb-run-human-tests` run plays the six locked flows, drives steps 1–6 against the corrected sentences, and writes `gate-verification.json` with `verified: true` and `recomputed_verdict: pass`.
- AC-2. Step 5's ledger quotes the `pnpm e2e:docs` exit code and the footer from that run, including failed count 0.
- AC-3. Step 6 records `id -un`, hostname, and HOME with no HOME override, and the four promise pages are HTTP 200.

Dependencies: tasks 1 and 2.

Recommended agent: this operator, via `/kb-run-human-tests`. Do not merge or push.

## Out of scope

- Adding numbered steps to troubleshooting. That would break GBC-002.
- Renaming Customize rendering or Troubleshooting to engine-choice or port-next.
- Changing `registry:build` output away from `public/r`.
- Checking the SPRINT.md task-status table. Those rows still say Pending and are not the gate.
