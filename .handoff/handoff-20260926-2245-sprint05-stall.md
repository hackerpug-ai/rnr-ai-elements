# HANDOFF — Sprint 05-orient-search: final three tasks + marathon stall analysis

**Written** 2026-09-26T22:45 local by Claude Code (glm-5.2)
**Repo** rnr-ai-elements · **Branch** main (primary checkout) · **HEAD** be7139f6
**How to use this**: read §1–§2, run the checks in §4, then start at §2 "Start Here".
Claims are labeled VERIFIED / CLAIMED / ASSUMED — re-verify anything not VERIFIED.
**STALENESS WARNING**: §4 changed WHILE THIS DOCUMENT WAS BEING WRITTEN — the CONT-004
flow run that was alive at sweep time died without a marker minutes later (see §4).

## 1. Mission

Drive sprint `sprint-05-orient-search` (the docs-site PRD sprint; goal text calls it
"sprint 11") to completion via the kb-run-sprint workflow (file:
`~/.claude/skills/kb-run-sprint/SKILL.md`): every task implemented by a specialist
implementer agent, reviewed by a different reviewer agent, merged to local `main` by the
orchestrator, with a completion record + handoff JSON per task. "Done" means all tasks
completed + the human testing gate run (`/kb-run-human-tests`) + `sprint-goal-state.json`
saying met. **Out of scope**: pushing to origin (main is 400+ commits ahead of origin,
all landing is local — VERIFIED earlier this session), editing locked gate bytes, any
product code written by the orchestrator itself.

## 2. Start Here

```bash
# 1. Confirm the live state (things move fast — see §4):
ls /Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-CONT-004/.tmp/ORI-CONT-004/cycle-2/FLOW3-COMPLETE.marker 2>/dev/null && cat <that file>
pgrep -f 'gate-evidence/run_flow' ; ps aux | grep -cE '[m]aestro|[m]etro'
# 2. Read the run state file (single source of truth for statuses):
python3 -c "import json;from collections import Counter;s=json.load(open('.kb-run-sprint/sprint-05-orient-search/state.json'));print(Counter(t.get('status') for t in s['tasks'].values()))"
# 3. Then follow §3 "In progress" — the two open loops are ORI-CONT-004 cycle 2 and
#    FIX-ORI-SUITE-2 cycle 1 (both implementer agent sessions still resumable by name:
#    `ori-cont-004-impl` and `fix-suite-2-impl` — a SendMessage to that name resumes it).
```

## 3. State of Play

**Landed on main this session** — VERIFIED via `git log --oneline` (§10): 20+ task
completions including ORI-AI-002 (8 cycles), ORI-CONT-003, ORI-CI-001/002, ORI-AST-004/005/009,
ORI-CONT-006, ORI-VIS-001..005, and FIX tasks FIX-ORI-AI-002-1, FIX-ORI-CI-001-1,
FIX-ORI-AST-004-1, FIX-ORI-VIS-001-1, FIX-ORI-CONT-004-1, all with reviewer approval,
merge, handoff, and completion records. Task statuses at last read — VERIFIED:
`{'completed': 43, 'landed': 1, 'pending': 5, 'in_progress': 2}` (43/51 tracked tasks;
the "landed" one is FIX-ORI-RN-004-3 whose implementer session died pre-handoff —
permanent, recorded in state).

**In progress (the two open loops)**:
- **ORI-CONT-004 cycle 2** (implementer session `ori-cont-004-impl`, worktree
  `.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-CONT-004`, branch tip a68c9a0e):
  flows 1+2 canonically green; flow 3 passes 5/6 seed legs; the 6th (uniwind/web) was
  unblocked by the rnw pin (FIX-ORI-CONT-004-1 landed). Needs ONE clean ~2h run of the
  locked FLOW-DOCS-02 command + gates + commit + report. Its runs have WEDGED THREE
  TIMES (see §6). Cycle-1 blocked report + withdrawal already recorded in state.
- **FIX-ORI-SUITE-2 cycle 1** (implementer session `fix-suite-2-impl`, worktree
  `.../FIX-ORI-SUITE-2`, branch tip 5f94a723): all repairs + both marathon reruns GREEN
  (CLAIMED by the implementer in message; evidence files on disk under its `.tmp/`).
  Remaining: its ~2.5h proof-harness run (needs port 4321 exclusively) + the 16h
  aggregate `pnpm test` (attributed-residual gate: it CANNOT exit 0 until ORI-DEP-003
  publishes, because ci-chain-order embeds the public-origin prerequisite — by design).

**After those two**: dispatch ORI-AST-010 (deps all completed once CONT-004 lands) →
ORI-CI-003 → ORI-CI-004 → ORI-DEP-002 → ORI-DEP-003 → FIX-SUITE-1 cycle-2 aggregate
rerun → human gate → sprint-goal-state.json. CI-004 carries an UNRESOLVED external
risk: the hosted macOS runner (`rnr-s05-native`) was never verified to exist (SPRINT.md
VP-HOSTED-RUNNER); DEP-002/003 need live Cloudflare authority.

**Broken / stuck**: nothing code-broken; the stall is operational (§6).

## 4. Perishable — Check Before Touching Anything

Observed 2026-09-26 22:39–22:45 local:
- **CONT-004 flow run DEAD, NO completion marker** — VERIFIED at 22:44:
  `pgrep -f gate-evidence/run_flow` → nothing; `ps aux | grep -cE '[m]aestro|[m]etro'` → 0;
  `ls .../FLOW3-COMPLETE.marker` → absent. It was ALIVE at 22:20 (21 device procs) and
  died during this handoff's write window. Newest CONT-004 evidence write: 5329s old
  (screenshot.png). Cause of death unknown — machine sleep despite caffeinate, or the
  implementer session ended and reaped it. FIRST ACTION for the next agent: message
  `ori-cont-004-impl` (resumes with context) — tell it the run died without a marker,
  ask for checkpoint assessment + relaunch plan with the outer-watchdog requirement.
- **Ports 4321 and 4010 both FREE** — VERIFIED at 22:44 (no LISTEN entries).
- **Three task worktrees alive** (VERIFIED, `git worktree list` §10): ORI-CONT-004
  (a68c9a0e), FIX-ORI-SUITE-1 (2f15ba41, parked awaiting SUITE-2 then aggregate rerun),
  FIX-ORI-SUITE-2 (5f94a723). Do NOT remove them.
- **Reserved devices**: iOS sim 81487B1E + emulator-5554 were booted earlier; current
  state unknown after the run death — check `xcrun simctl list | grep Booted` and `adb devices`.
- **Implementer agent sessions resumable by name** (same harness only):
  `ori-cont-004-impl`, `fix-suite-2-impl` (plus ~40 idle completed ones). A peer session
  on another machine cannot reach them — for those, read the worktrees and state.json.
- **Primary checkout dirty**: 112 paths — VERIFIED `git status --porcelain | wc -l`.
  Mostly `.kb-run-sprint/sprint-05-orient-search/**` run-state written after the last
  state commit (be7139f6). These are the live sprint records; COMMIT them as a
  `state(sprint-05): ...` checkpoint before any wave transitions (established pattern).
- **Uncommitted in worktrees**: CONT-004 worktree carries ~80+ dirty evidence files from
  its killed runs (the runs' partial output — the implementer knows which to keep).

## 5. Decisions — Do Not Undo Without Reading

- **Landing is LOCAL-main only** — origin/main is ~400 behind; PRs were tried once
  (Sep 8) and the repo moved to local trunk landing. Do not push unasked.
- **Reviewer ≠ implementer by AGENT TYPE** — the sprint_handoff tool enforces it; for
  frontend-designer (VIS tasks) implementers the binding reviewer is astro-reviewer
  (the frontend-designer verdict is kept as `cycle-N.verdict.fd.json` companion).
- **Aggregate `pnpm test` is an ATTRIBUTED-RESIDUAL gate** (FIX-ORI-SUITE-2 charter):
  it is EXPECTED to exit 1 until ORI-DEP-003 publishes, with the failure set EXACTLY
  {ci-chain-order's public-origin token}. Anything else failing = real work remaining.
- **Port arbitration standing order**: CONT-004's in-flight run outranks SUITE-2's
  retryable lanes (I killed SUITE-2's 4010/4321 listeners twice to enforce it). That
  order inverts the moment CONT-004's marker lands — SUITE-2 then owns port+devices.
- **Full-SHA discipline**: implementer agents mis-expanded full SHAs THREE times this
  session (correct 7-char prefix, wrong tail). Always `git rev-parse` the branch tip
  before binding a verdict; corrections are recorded in the verdict JSON `note` field.

## 6. Dead Ends & Traps — WHY THE LAST 8 HOURS STALLED

- **The marathon wedge (the core blocker)**: the FLOW-DOCS-02 locked command is a
  ~2h device+web+provider marathon. It wedged THREE times mid-run (run_flow alive, zero
  device processes, no writes for 60+ min). Causes seen: machine sleep despite
  caffeinate -is (twice), a hung maestro/metro tree after sleep-wake (once), and one
  double-launch device collision (implementer's own error, disclosed). Each wedge costs
  the whole window because the test-level 4h timeout then fails the run wholesale.
  NOT YET TRIED: the phase-aware OUTER WATCHDOG (kills the wedged child and rewrites
  EXIT=2 instead of hanging silently) — demanded in the last dispatch, never delivered
  because the run died first. NEXT SESSION: require the watchdog BEFORE any relaunch.
- **Port contention between sibling agents** burned ~4h total (4321 previews, 4010
  backends, three arbitration rounds, two enforcer kills). Fix already proven: strict
  port pre-check + single-owner windows (the SUITE-2 child's gap-seizing wrappers work).
- **Trap: reaper deletes runtime prerequisites** — `~/.cache/agent-scratch` reaper ate
  the Expo Go APK (3×), the cmux NODE_OPTIONS shim (biome/lint jobs die with
  MODULE_NOT_FOUND — recreate `~/.cache/agent-scratch/cmux-claude-node-options/restore-node-options.cjs`),
  and vite's transform scratch (87 aggregate collection failures late in a 16h run).
  Recovery recipes are in the implementer handoffs (official expo downloadExpoGoAsync
  restore; git-restore + prebuild regen for wiped data files).
- **Trap: agent sessions deliver stale duplicate notifications** hours after the fact —
  always re-verify the named artifact's mtime before acting on any "WRITTEN/REPAIRED".
- **Trap: `pnpm lint` dies locally** (righthook wrapper) — use the biome binary
  directly; `pnpm exec biome` also dies under the NODE_OPTIONS shim when the reaper
  strikes (see above).
- **Planner-ask repair loops are ~3 publish attempts each** (scenario-anchor validators:
  WEAK_ORACLE wants count/literal anchors, NEG_OBSERVE_WEAK wants a "(0)"/empty
  signature, NEG_CONTROL_WEAK wants named stub/mock conditions, SUPERSEDE_UNDECLARED
  wants every existing test file declared, CROSS_NODE false-fires on singular "peer").
  Budget for it; the b/c/d suffix ask-retry pattern is established and cheap.

## 7. Blockers

- **Machine reliability vs marathons** (the real 8h sink): no FLOW-DOCS-02 run has
  survived to completion; every failure was environmental (sleep/wedge/collision), not
  product. Needs: outer watchdog + caffeinate + exclusive port/device window, then ONE
  clean run.
- **ORI-CI-004's hosted runner (`rnr-s05-native`)** — never verified to exist; if it
  doesn't, CI-004 fails closed by design and the human must provision it or descoping
  is a product decision.
- **DEP-002/003** need live Cloudflare account/zone authority (VP-CANONICAL-AUTHORITY)
  and public DNS/TLS at rnraielements.com (currently serving a stale empty-body 404).
- **FIX-ORI-RN-004-3** can never reach `completed` (dead original session, no handoff
  possible; permanent `landed`). sprints goal-state may need its tolerance documented.

## 8. Map — Pointers, Not Payloads

| What | Where |
|---|---|
| Sprint run state (statuses, sessions, verdicts) | `.kb-run-sprint/sprint-05-orient-search/state.json` |
| Sprint contract / tasks / gate | `.spec/prds/docs-site/tasks/sprint-05-orient-search/SPRINT.md` + `human-flows.json` + `TASK-*.md` |
| Workflow rules (worktree/reviewer/merge) | `~/.claude/skills/kb-run-sprint/SKILL.md` |
| Persistence helper (register/record/complete) | `~/Projects/brain/tools/sprint-handoff/sprint_handoff.py` (+ CONTRACT.md) |
| CONT-004 cycle-2 run ground truth | worktree `.tmp/ORI-CONT-004/cycle-2/` (marker, phases, partial evidence) |
| All completed-task handoffs | `## Handoff` blocks in the completed TASK-*.md files + `.kb-run-sprint/sprint-05-orient-search/<TASK>/handoff.json` |
| Gate runner | `~/Projects/brain/tools/gate-evidence/run_flow.py`; human gate skill `~/.claude/skills/kb-run-human-tests/` |

## 9. Environment & Bootstrap

**Build**: `pnpm install && pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs prebuild` (fresh worktrees lack generated data; VERIFIED needed many times).
**Test**: task-specific (`pnpm exec vitest run tests/sprint-05-orient-search/<file>` / playwright specs with `CI=true`); aggregate `pnpm test` (16h, attributed-residual).
**Run docs preview**: build → `pnpm exec tsx scripts/docs-data/search-index.ts` → preview; ANY astro build wipes `dist/pagefind` — index AFTER the last build.
Reserved devices: `RNR_S05_IOS_UDID=81487B1E-A4D1-45AE-9BCE-D675802BACD1`, `RNR_S05_ANDROID_SERIAL=emulator-5554`. Provider: `OPENAI_API_KEY` in env. Marathon children: delete NODE_ENV, `TMPDIR=/tmp/<task>-scratch`, wrap in `caffeinate -is`.

## 10. Evidence Appendix

```
$ git rev-parse --short HEAD && git branch --show-current
be7139f6
main
$ git log --oneline -8
be7139f6 state(sprint-05): wave-21c add published (FIX-ORI-SUITE-2, 5f94a723); implementer dispatched
5f94a723 plan(ask-wave21c-add-foreign-suite-repair): publish add from ghactions-planner
e88adc5c state(sprint-05): wave-21 — FIX-SUITE-1 blocked on six foreign suites; repair ask dispatched
dbf3c0af state(sprint-05): FIX-ORI-CONT-004-1 completed (approved 7d4103ea, merged fbe1d2f6); CONT-004 cycle 2 in its...
7f0b55ba task(FIX-ORI-CONT-004-1): record approved handoff and completion
fbe1d2f6 merge: FIX-ORI-CONT-004-1 react-native-web 0.21.2 exact pin (approved 7d4103ea)
7d4103ea fix(FIX-ORI-CONT-004-1): pin react-native-web 0.21.2 in both consumer templates
99816901 state(sprint-05): wave-20b add published (FIX-ORI-CONT-004-1 rnw pin, fd39f560); implementer dispatched
$ git worktree list | grep -E 'CONT-004|SUITE-1|SUITE-2'
.../FIX-ORI-SUITE-1  2f15ba41 [kb-run-sprint/sprint-05-orient-search/FIX-ORI-SUITE-1]
.../FIX-ORI-SUITE-2  5f94a723 [kb-run-sprint/sprint-05-orient-search/FIX-ORI-SUITE-2]
.../ORI-CONT-004     a68c9a0e [kb-run-sprint/sprint-05-orient-search/ORI-CONT-004]
22:44 sweep: run_flow dead · maestro/metro count 0 · NO FLOW3-COMPLETE.marker ·
4321 free · 4010 free · CONT-004 newest evidence write 5329s old · primary dirty=112 paths
(22:20, 40 min earlier: run alive with 21 device procs — the death happened between checks)
```
