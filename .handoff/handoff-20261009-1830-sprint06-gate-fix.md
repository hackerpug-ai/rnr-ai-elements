# HANDOFF — Sprint 6 gate fix (FIX-GBC-GATE-2)

**Written** 2026-10-09T18:30+02:00 by Claude Code / claude-opus-5-5
**Repo** rnr-ai-elements · **Trunk** local `main` at `c9a03ce4` plus the commits that add and correct this file · **Work branch** `kb-run-sprint/sprint-06-guides-boundary-changelog/FIX-GBC-GATE-2` at `bb388d54`
**Work happens in this worktree, not the repo root:**
`/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/FIX-GBC-GATE-2` (called `$W` below)

**How to use this**: read §1–§2, run the checks in §4, then start at §2. Claims are labeled
VERIFIED / CLAIMED / ASSUMED. Re-verify anything not VERIFIED before you rely on it. Raw
evidence is in §10.

**CORRECTED 18:53**: §2, §3, §4 and §6 changed after this was first written. The device run
that was live at writing time has ended: exit 1 at 18:50:41, and the run is **invalid**
because the laptop slept in the middle of it. Nothing is running now (`VERIFIED` 18:50:
`pgrep -f quickstart-proof.test.ts` → none).

## 1. Mission

Close docs-site sprint 6 (`sprint-06-guides-boundary-changelog`). "Done" means three things:
the command `pnpm e2e:docs` exits 0 on the work-branch code; that code is approved by
independent reviewers and merged into local `main`; and the sprint's six-step human testing
gate records a verified pass.

All 18 sprint tasks plus FIX-GBC-GATE-1 are already merged. What is left is one failing test
inside `pnpm e2e:docs`: `FLOW-DOCS-02` at
`tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts:205`. That test has two halves:

- **Phone half** ("seed matrix"): opens the tutorial chat app in Expo Go on an iPhone
  simulator and an Android emulator and sends a message with canned data. 10 combinations:
  2 styling engines (nativewind, uniwind) × iPhone light/dark, Android light/dark, web.
- **Real-AI half** ("live matrix"): the same against the real OpenAI service, one run per
  engine, including killing the backend mid-chat and pressing Retry.

**Out of scope**: weakening, skipping, or reducing `FLOW-DOCS-02`; renaming or adding guides;
pushing to GitHub (local `main` is the trunk; GitHub `main` is stale); sprint 7; hand-editing
`.kb-run-sprint/**/state.json`; committing the ~270 run-generated evidence files.

**How to talk to the user**: plain words. The user rejected shorthand such as "device
matrix", "clean tree", and "live half" in this session. Say what a step does, how long it
takes, and why.

## 2. Start Here

1. Rerun the phone half from the committed code (command in §9, about 13 minutes). The
   18:27 run does not count: the lid was closed and the charger unplugged from 18:34:53 to
   18:44:24, and the combination in flight was killed by its 5-minute limit (§3, §6).
   Before starting, confirm all three:

   ```bash
   pmset -g batt | head -1                      # must say 'AC Power'
   /bin/ps -axo pid,etime,command | grep -E 'quickstart-proof|maestro test|playwright test|e2e:docs' | grep -v grep   # must print nothing
   adb devices; xcrun simctl list devices booted | grep 81487B1E
   ```

   Then tell the user in plain words that the lid must stay open for the next 15 minutes,
   or ask them to run `sudo pmset -a disablesleep 1` first (undo with `0`). That setting is
   the user's to change, not yours. Afterwards check the sleep log (§6) before believing
   any failure.
2. Run the two short checks the first reviewer asked for (§3 "Owed"), using the probe (§9).
3. Run the real-AI half for `uniwind` alone (§9). It is the unproven part. Estimated 40
   minutes. If it fails, diagnose from its own evidence before any full-suite run.
4. Start two fresh reviewer sessions (the original sessions cannot be resumed from a new
   session) and give each the new commits and results. The two reviewer roles are defined
   at `~/Projects/brain/agents/react-native-reusables-reviewer` and `…/aisdk-reviewer`, but
   the writing session stopped offering them as dispatchable roles at about 18:50. Check
   what your session offers before planning around them. Then get the user's two decisions
   (§7). Then run the full `pnpm e2e:docs` (about 2 hours), then the human testing gate.

## 3. State of Play

**Landed on `main`**: no code from this session, only the commits that add and correct this file on
top of `c9a03ce4` — `VERIFIED` 18:28 (before that commit): `git -C /Users/justinrich/Projects/rnr-ai-elements rev-parse --short HEAD`.

**On the work branch, 5 commits not on `main`, not merged** (the branch is also 1 commit behind `main`: the handoff file) — `VERIFIED` 18:28:
`git -C $W log --oneline main..HEAD`:

| Commit | What | Review status |
|---|---|---|
| `9dbd2562` | Web chat proxy answers 502 within 4 s when its backend is dead. Written 2026-10-07 by an earlier unsupervised agent session with no task file | Reviewed: needs fixes → remediated in `73bb9814`. Not re-reviewed |
| `c43f1e15` | The Maestro flow dismisses one known developer-only warning toast right before tapping the message box | Reviewed: needs fixes → remediated in `c08723ea`. Not re-reviewed |
| `c08723ea` | Every dismissal is recorded: `dev_error_toast_dismissed` per leg, `dev_error_toast_dismissed_legs` in the run manifest. Comment reworded to observed facts | Not reviewed |
| `73bb9814` | The web Retry check counts backend records after the backend restart, not before | Not reviewed |
| `bb388d54` | Evidence only: the invalid 18:27 run and the sleep log that explains it | n/a |

**Phone half — fixed and proven on real devices** (`VERIFIED` this session; evidence under
`$W/.tmp/FIX-GBC-GATE-2/cycle-2/`):

- Cause: in Expo Go a console error ("Can't perform a React state update on a component that
  hasn't mounted yet") can be logged while the app mounts. Its toast sits on the message box
  (Android bounds about `[26,2083][1054,2208]`). The test's tap on the message box opens the
  error screen instead, nothing is typed, and the leg fails later at `Tap on "Send message"`.
- Old flow with the toast forced on, Android: Maestro exit 1, same signature (`red/android.json`).
- Fixed flow with the toast forced on: Android exit 0 and iPhone exit 0, typed marker present
  in the chat (`green/android.json`, `green/ios.json`).
- Fixed flow with a different error toast, Android: exit 1, so other errors are not hidden
  (`negative/android-other-toast.json`).
- All 10 combinations, run standalone at 15:04: exit 0 in 769 s (`green/matrix-1.log`). No
  toast appeared in that run, and it ran before the fix was committed.
- The dismissal detector matches 12 of 12 recorded real Maestro outputs (2 dismissed, 10 not).

**Owed for the phone half** (first reviewer's asks, none done):

- A 10-combination run from the committed code. Attempted at 18:27, **invalid**: 9 of 10
  passed; `nativewind/android/dark` was in flight when the laptop slept and Maestro was
  killed at its 300 s limit (exit 143) after it had typed the marker — `VERIFIED`:
  `.tmp/FIX-GBC-GATE-2/cycle-3/matrix-at-73bb9814.summary.json` and
  `laptop-sleep-1834.pmset.log` beside it. Must be repeated.
- The different-error-toast check on iPhone (done on Android only).
- Launch the unmodified tutorial app about ten times on Android, count how often the toast
  appears, and capture its stack. The trigger is **not isolated**: the stack names only
  Expo Router's root (`ContextNavigator`, `ExpoRoot`), and the tutorial's own layout and
  screen have no state updates during render (`ASSUMED` upstream; read, not reproduced).

**Real-AI half — cause unknown, nothing proven**:

- It failed the human gate run of 2026-10-07 04:08Z on `main`. Evidence still in the main
  checkout: `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind/`. All three uniwind
  targets failed; the web target shows `retryControlVisible: false` — `VERIFIED` by reading
  `uniwind-web/result.json`. Why iPhone and Android failed is not established.
- It passed once on the same code (FIX-GBC-GATE-1 acceptance, 482 passed, exit 0) —
  `CLAIMED` by `.tmp/FIX-GBC-GATE-1/cycle-6/green/e2e-docs-acceptance.log`; I read its footer only.
- `9dbd2562` + `73bb9814` are a plausible fix for the web part only. **No real-AI run has
  ever exercised them.** Local proxy probes pass: dead backend → 502 in 11 ms; backend that
  accepts and never answers → 502 in 4014 ms — `VERIFIED` 15:5x with
  `pnpm exec tsx .tmp/FIX-GBC-GATE-2/cycle-1/probe-proxy-{down,blackhole}.mts <out.json>`.

**Reviewer verdicts** (`CLAIMED` by two separate read-only agent sessions; items I checked
myself are marked):

- Reviewer role `react-native-reusables-reviewer` on `c43f1e15`: NEEDS_FIXES. Dismissal was
  silent; comment stated a guess as fact (both fixed in `c08723ea`); the passing run did not
  exercise the toast branch and predates the commit (owed above).
- Reviewer role `aisdk-reviewer` on `9dbd2562`: NEEDS_FIXES. The retry baseline was read
  before `session.restart()` and compared on the new handle, which starts empty for
  `OwnedBackend` — `VERIFIED` by me at `tests/sprint-05-orient-search/support/live-backend.ts:85`
  and `:266`; fixed in `73bb9814`. The commit message's "404 never showed the banner" claim
  is wrong; only a hang fits.

**Human testing gate**: last verified result is FAIL, 3 of 6 steps (run `20261007T080345Z`,
in the worktree's sprint folder). Steps 3 and 6 fail on the gate's own wording, see §7.

## 4. Perishable — Check Before Touching Anything

- **No device run is live** (observed 18:50:49). The run started at 18:27:06 ended at
  18:50:41 with exit 1, see §3. Re-check before starting anything:
  `/bin/ps -axo pid,etime,command | grep -E 'quickstart-proof|maestro test|playwright test|e2e:docs' | grep -v grep`.
  Do not use `pgrep -f maestro` for this: it matches about 20 unrelated helper processes
  whose environment contains `.maestro/bin`.
- **Reserved devices** (observed 18:27): iPhone 17 simulator
  `81487B1E-A4D1-45AE-9BCE-D675802BACD1`, Android emulator `emulator-5554`. A second booted
  simulator (`9051A0C2-…`) and a second emulator (`Pixel_8_API_34`) belong to other
  sessions. Leave them alone.
- **Power** (observed 18:50): on AC, 51 %, charging. The lid must stay open. Today the
  laptop slept mid-run twice: 12:43–14:07 and 18:34:53–18:44:24 (lid closed, charger
  unplugged). Each time it killed the run in flight.
- **Expo Go APK** (observed 18:27): `~/.cache/agent-scratch/opencode/ori-rn-003/Expo-Go-57.0.9.apk`
  exists. That folder is cleaned by a reaper; if the file is gone, the driver throws before
  any leg runs.
- **Run state**: I set the sprint's planning phase to `triage` and back to `idle` (wave
  `wave-fix-gbc-gate-1-handoff`) with the handoff tool. Nothing else in
  `.kb-run-sprint/sprint-06-guides-boundary-changelog/` changed, and FIX-GBC-GATE-2 is
  **not** registered there.
- **Stashes**: 4, all older than this session and not mine. Do not pop them.
- **Earlier agent session** (Grok CLI) that ran this before me has exited. Its pane printed
  `grok --resume 01a11563-4027-7c02-86cd-9350a0217482`. Do not resume it alongside this work.

**Uncommitted work in the worktree `$W`** — `VERIFIED` 18:28, 272 paths:

- `.spec/prds/docs-site/tasks/sprint-06-guides-boundary-changelog/SPRINT.md` and
  `.spec/prds/docs-site/ROADMAP.md`: the gate wording edits (7 lines each way). Not mine.
  Waiting on the user, §7. **Do not discard.**
- `GATE-RESULTS.md`, `gate-plan.json`, `gate-results.json`, `gate-verification.json`, and
  untracked `.gate-evidence/`, `.gate-judge/20261007T08*/`: output of the failed gate run.
- About 260 tracked evidence files under `.tmp/**` and `tests/**/evidence/**` rewritten by
  test runs. Every run rewrites them. Do not commit them and do not `git checkout` them
  while a run is live.

**Uncommitted work in the main checkout** — `VERIFIED` 18:28, 329 paths, none from this
session: gate result files from the 04:08Z run plus the same kind of evidence rewrite.
Uncommitted changes are invisible to a new session and get destroyed by cleanups.

**Final observed state of that run (18:50:49)**: ended, `EXIT:1`, invalid because of the
sleep. Nothing running.

## 5. Decisions — Do Not Undo Without Reading

- **Dismiss exactly one toast, matched by its full text, right before the message-box tap.**
  The toast's close button has no accessible text, so the flow taps the toast, then
  "Dismiss". Matching one message keeps every other error fatal to the leg.
- **Removed the earlier agent's `hideKeyboard` edit.** Maestro's `hideKeyboard` fails on
  iPhone in this app and broke all four iPhone legs. Its dismiss also ran after typing, which
  is too late. The removed edit is saved at `.tmp/FIX-GBC-GATE-2/cycle-2/superseded-flow-edit.patch`.
- **Kept `9dbd2562` instead of reverting it.** Its target matches the Oct 7 web evidence and
  its probes pass. This is a judgment, not proof. If the real-AI run fails and the cause is
  unclear, reverting `9dbd2562` and `73bb9814` gives the exact code that passed once.
- **Did not merge and did not register the task.** See §6 for why the tooling route is
  closed. The merge guard would not block this branch because it is unregistered; using that
  gap without the user's explicit say is not acceptable.
- **Did not run devices on battery.** One morning run died because the laptop slept.
- **Did not commit the gate wording edits.** They change what the gate asks; the user has
  not confirmed them in this session.

## 6. Dead Ends & Traps

- **Trap: a "hung" device run may be a sleeping laptop.** Symptom: Maestro lookups take about
  17 minutes each. Cause: lid closed on battery, 12:43–14:07; the cadence was the machine's
  periodic dark wake. Check `pmset -g log | grep -E " (Sleep|Wake|DarkWake)  "` and
  `pmset -g batt` first. `caffeinate` does not prevent lid-close sleep on battery.
- **It happened again in this session.** I asked for the lid to stay open, started a
  13-minute run at 18:27, and the lid was closed at 18:34:53. Do not start a device run on
  an instruction the user may not have seen; confirm it, or have the user disable lid-close
  sleep.
- **Trap: the earlier agent's notes say Maestro "spends about 17 minutes per absent optional
  tap".** False. In normal runs those taps cost seconds.
- **Trap: one failure hides behind another.** The toast failure surfaces at "Send", not at
  the message-box tap. Read the screenshots Maestro saves under `~/.maestro/tests/<timestamp>/`.
- **Tried: registering FIX-GBC-GATE-2 through the handoff tool as an added task.** Failed:
  `record-decision` answered "item already has a different orchestrator decision". The only
  candidate source item (FIX-GBC-GATE-1 handoff finding 1) was already closed as "roadmap".
  Do not retry. `publish-initial` would record the batch as the sprint's initial plan, which
  is wrong provenance.
- **Trap: write nothing beside `state.json`** under `.kb-run-sprint/<sprint>/`. Only the
  handoff tool writes there. I removed the files I had put there.
- **Trap: the phone-half command rejects a reduced set.** It needs both engines and all three
  platforms. For one combination, use the probe (§9).
- **Trap: `passed_legs: 6` in the run manifest is a pass.** It counts 6 engine × platform
  targets, not the 10 combinations.
- **Trap: shell output passes through a filter (`rtk`)** that can mangle text and mask exit
  codes. Wrap exit-sensitive commands: `sh -c '…; echo exit=$?'`. `pnpm lint` can die with
  "Linter process terminated abnormally"; run `./node_modules/.bin/biome ci <paths>` instead.
- **Trap: Maestro sessions on this machine share one driver port (7001).** Two sessions
  driving different simulators cross-route taps. Run one Maestro user at a time.
- **Seen once, not chased**: `tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts:383`
  hit its 30 s timeout in the 12:13 full run, when the battery was near 1 %. `ASSUMED`
  power-related. Watch for it in the next full run.

## 7. Blockers

Two decisions belong to the user. Explain each in plain words before asking.

1. **How this lands on `main`.** The governed route needs the task registered in run state,
   and no registration route exists for a gate failure found after all handoffs were triaged.
   My recommendation: the user authorizes it as a gate fix; merge to local `main` only after
   both reviewers approve the final commit; record it in the sprint summary. The alternative
   is a planner-written task file, which costs one to two hours and has no clean tool route.
2. **The gate wording edits** in `SPRINT.md` and `ROADMAP.md`. Gate steps 3, 5, and 6 fail as
   written even with a green suite: step 3 expects numbered steps in the troubleshooting
   guide (the task spec forbids them), step 5 expects the text `retries: 0` in output the
   command never prints, step 6 expects guides named engine-choice and port-next (the PRD,
   `.spec/prds/docs-site/04-uc-docs.md:56`, says those are not guides). The earlier agent's
   plan rewrote the sentences. Its log says the user approved that plan — `CLAIMED`; the copy
   at `.tmp/FIX-GBC-GATE-2/cycle-2/context/human-approved-gate-remediation-plan-20261009.md`
   carries "human-approved" in its filename on that claim only.

Also open: the cause of the Oct 7 real-AI failure (§3).

## 8. Map — Pointers, Not Payloads

| What | Where (relative to `$W` unless absolute) |
|---|---|
| The failing test | `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts:205` (phone half spawned near `:254`, real-AI half near `:326`) |
| The Maestro flow that was fixed | `tests/sprint-05-orient-search/quickstart-expo-go.maestro.yaml` |
| Phone-half driver | `tests/sprint-05-orient-search/support/quickstart-proof.test.ts`, `support/native-session.ts` |
| Real-AI runner | `tests/sprint-05-orient-search/run-live-example-proof.mjs`; drivers `support/live-example-proof.test.ts`, `support/nativewind-live-example.ts`, `support/live-backend.ts` |
| Probe that forces the toast | `.tmp/FIX-GBC-GATE-2/cycle-2/probe-logbox-toast.mts` |
| Phone-half evidence | `.tmp/FIX-GBC-GATE-2/cycle-2/{red,green,negative,context}/` |
| Proxy probes and evidence | `.tmp/FIX-GBC-GATE-2/cycle-1/` |
| Real failure of 11:46 today | `~/.maestro/tests/2026-10-09_114540/` (log + 3 screenshots) |
| Oct 7 real-AI failure evidence | `/Users/justinrich/Projects/rnr-ai-elements/tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind/` |
| Sprint folder | `.spec/prds/docs-site/tasks/sprint-06-guides-boundary-changelog/` (`SPRINT.md`, `GATE-RESULTS.md`) |
| Run state | `/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/sprint-06-guides-boundary-changelog/state.json` |
| Sprint-run workflow and its rules | `~/Projects/brain/skills/kb-run-sprint/SKILL.md`; tool contract `~/Projects/brain/tools/sprint-handoff/CONTRACT.md`; merge guard `~/Projects/brain/tools/driver-guard/driver-guard.py` |
| Human-gate workflow | `~/Projects/brain/skills/kb-run-human-tests/SKILL.md` |
| Project instructions | `/Users/justinrich/Projects/rnr-ai-elements/AGENTS.md` |

## 9. Environment & Bootstrap

Run everything from `$W`. Required environment (names only): `OPENAI_API_KEY` (present in the
user's shell), `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1`,
`RNR_S05_ANDROID_SERIAL=emulator-5554`, `TMPDIR=/tmp/ori-ai-002-scratch` (the default temp
folder is cleaned mid-run). `NODE_ENV` must be unset.

- **Typecheck**: `sh -c 'pnpm exec tsc --noEmit; echo exit=$?'` — `VERIFIED` exit 0 at `73bb9814`.
- **Lint**: `./node_modules/.bin/biome ci <paths>` — `VERIFIED` exit 0 on the touched files.
- **Commit hooks** (biome, fallow, typecheck) — `VERIFIED` pass on all three of my commits.
- **Phone half, all 10 combinations, about 13 minutes** — `VERIFIED` exit 0 at 15:17:

  ```bash
  mkdir -p /tmp/ori-ai-002-scratch
  caffeinate -dimsu pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts \
    --engines nativewind,uniwind --platforms ios,android,web > <log> 2>&1; echo "EXIT:$?" >> <log>
  ```

  Per-combination result:

  ```bash
  python3 -c "import json;m=json.load(open('tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json'));print(m['candidate_head_sha'][:8],m['completed'],m.get('dev_error_toast_dismissed_legs'));[print(l['engine'],l['platform'],l.get('appearance','web'),l['status']) for l in m['legs']]"
  ```

- **One combination with a forced toast, about 1 minute per leg** — `VERIFIED`:
  `pnpm exec tsx .tmp/FIX-GBC-GATE-2/cycle-2/probe-logbox-toast.mts up`, then
  `… leg <ios|android> <flow.yaml> <out-prefix>`, then `… down`. `up` writes `session.json`
  beside the probe; delete it after `down`. For a different toast text, edit the first line
  of the disposable app's `app/index.tsx` (its folder is in `session.json`) before `leg`.
- **Real-AI half, one engine** — `ASSUMED` from reading the spec and the runner; never run by me:

  ```bash
  caffeinate -dimsu node tests/sprint-05-orient-search/run-live-example-proof.mjs \
    --engines uniwind --platforms ios,android,web \
    --output tests/sprint-05-orient-search/evidence/ORI-AI-002 --run-id <unique-id>
  ```

  It makes real OpenAI calls. Results land in `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind/`.
- **Full suite, about 2 hours, AC power, lid open**: `CI=1 caffeinate -dimsu pnpm e2e:docs`.
  Not run by me. Check `lsof -nP -iTCP:4321 -sTCP:LISTEN` is empty first.
- **Human gate**: the workflow named kb-run-human-tests for sprint 6. Not run by me.

Constraints not obvious from the code: only an orchestrating session merges, with
`git merge --no-ff <approved-sha>` from the main checkout, after a reviewer who is not the
author approves that exact commit. Never `--no-verify`. Never bare `git stash` (the stash
stack is shared by all worktrees). Reviewer sessions must not use the devices while a device
run is live.

## 10. Evidence Appendix

Sweep run 2026-10-09 18:28–18:29 +02:00. Status lists are summarized by area because 272 and
329 paths are run-generated; regenerate with `git -C <dir> status --porcelain=v1`.

```text
## worktree $W
HEAD 73bb9814 · branch kb-run-sprint/sprint-06-guides-boundary-changelog/FIX-GBC-GATE-2
git log --oneline main..HEAD
  73bb9814 fix(FIX-GBC-GATE-2): read the web retry baseline after the backend restart
  c08723ea fix(FIX-GBC-GATE-2): record every dev-toast dismissal; state only what is observed
  c43f1e15 fix(FIX-GBC-GATE-2): dismiss the one dev-only LogBox toast before the quickstart composer tap
  9dbd2562 fix(FIX-GBC-GATE-2): return 502 when the web chat proxy's upstream is down
git log --oneline HEAD..main   → 0 commits
git diff --cached --stat       → empty
git status --porcelain=v1      → 272 paths:
  M  SPRINT.md, ROADMAP.md, GATE-RESULTS.md, gate-plan.json, gate-results.json, gate-verification.json
  M  .tmp/** (≈182 paths across FAM-005, FUSE-07, ORI-AST-*, ORI-CONT-*, ORI-VIS-*, sprint-02, sprint-03)
  M  tests/sprint-05-orient-search/evidence/** (60) · tests/sprint-06-guides-boundary-changelog/evidence/** (6)
  ?? .gate-evidence/, .gate-judge/ (2 runs), apps/docs/playwright-report/, test-results/,
     tests/sprint-05-orient-search/evidence/recovery/runs/* (13)

## main checkout /Users/justinrich/Projects/rnr-ai-elements
HEAD c9a03ce4 · branch main
git log --oneline -3
  c9a03ce4 task(FIX-GBC-GATE-1): record approved handoff and completion
  b35c23a1 Merge commit '58cf262352dba66ed2b9ec91a58589417c6e4414'
  58cf2623 fix(FIX-GBC-GATE-1): drop write-prohibited spec notes
git diff --cached --stat       → empty
git status --porcelain=v1      → 329 paths: gate result files (4 M), .tmp/** and tests/**/evidence/**
                                 rewrites, untracked .kb-run-sprint/* folders, .gate-verify-stderr.log

## shared
git stash list → 4 entries, newest "orchestrator: park uncommitted evidence before review of 78ecdf93"
git worktree list → 65 worktrees; sprint-06 ones include FIX-GBC-003-1 (f042f5eb), FIX-GBC-GATE-1 (58cf2623),
                    FIX-GBC-GATE-2 (73bb9814)

## live at 18:28:54 (this run has since ended, see the correction at the top)
ps: 78083 pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind …
    78084 caffeinate -dimsu pnpm exec tsx …   78085 node …/tsx/dist/cli.mjs …   (elapsed 01:48)
log head: start 18:27:06 / 73bb98147d05b6d96ff802e79b044ef54a92f0ef / Now drawing from 'AC Power'
pmset -g batt: AC Power, 34%, charging
lsof listeners on 8093, 8094, 4321, 7001: none at that instant
```

```text
## after the run ended (18:50:49)
grep -E '^(start|EXIT|end)' …/cycle-3/matrix-at-73bb9814.log → start 18:27:06 / EXIT:1 / end 18:50:41
run-manifest: head 73bb9814 · completed False · wall 1414 s · dev_error_toast_dismissed_legs 0
  9 legs passed; nativewind android dark failed, maestro_exit=143
pmset -g log: 18:34:53 DarkWake 'Clamshell Sleep' (AC) · 18:35:03 Sleep 'Clamshell Sleep' (Batt)
              18:35:51 Maintenance Sleep 513 s · 18:44:24 Wake (USB-C_plug, AC)
~/.maestro/tests/2026-10-09_183427/maestro.log: 18:34:55 'Run flow when …' RUNNING → next line 18:44:27
work branch HEAD now bb388d54 (evidence commit)
```
