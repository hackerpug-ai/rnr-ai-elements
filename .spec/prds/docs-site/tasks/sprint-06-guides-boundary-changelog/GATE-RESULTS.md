# Gate Results: sprint-06-guides-boundary-changelog

## VERDICT: fail — VERIFIED (recomputed fail == claimed fail; 6/6 recomputed; 0 discrepancies)

The sprint's product work is complete and green; the gate fails on ONE step (5), entirely
earlier-sprint lane debt outside sprint-06's write scope — see the Human question.

**Date:** 2026-09-30 | **Run:** 20260930T061805Z | **UI driver:** playwright-chromium | **Judge:** blind (.gate-judge/20260930T061805Z)

## First contact — PASS (attempt 2)

Command: `pnpm --filter @rnr-ai-elements/docs build` then `pnpm --filter @rnr-ai-elements/docs preview`
Machine: justinrich@Justins-MBP-2.lan, HOME=/Users/justinrich
- build exit 0; both gate stdout lines verbatim; preview printed http://localhost:4321 (only write: apps/docs/dist/)
- UC-DOCS-03 MATCH: /guides 'All guides 5'; engine-choice on Installation; port-next on /porting
- UC-DOCS-04 MATCH: three "No. This library ships no..." cells + "See the worked example app"
- UC-DOCS-05 MATCH: Deviations column, "Read it before backporting a web pattern", prior art
- UC-DOCS-06 MATCH: one entry per release, 0.2.1 -> 0.2.0 -> 0.1.0
- Header Guides/Porting/Changelog each opened a real page (200)
- (Attempt 1 blocked by EXTERNAL mid-gate deletion of tracked data files — deliv-03-112 residue; operator restored via git; retry passed.)

## Per-Step Results

| # | Gate | Result | Evidence |
|---|------|--------|----------|
| 1 | build + gate lines + preview | PASS | S1: both stdout lines verbatim; port free first |
| 2 | boundary/porting/registry cross-check | PASS | S2: 56 rows 39/11/6; 40+9=49; zero contradictions/omissions |
| 3 | five capped guides + troubleshooting | PASS | S3: goal sentences; 4 symptom-cause-fix; seam anchors |
| 4 | changelog reverse-chron + release pages | PASS | S4: literal 2026-09-08; Added/Changed/Fixed; 6 links 200 |
| 5 | header nav + e2e:docs all-green | FAIL | S5: header 5/5 200, but e2e:docs exit 1 — 56 failed/386 passed/retries 0; ALL failures in sprint-01/03/04/05 lanes; sprint-06 lanes + journeys green |
| 6 | first contact | PASS | S6 attempt 2 (above) |

## Failure (the one)

- expected: pnpm e2e:docs exits 0, retries 0, all lanes green
- actual: exit 1 — 56 failures, all in frozen earlier-sprint lanes (deliv-03-112 data-wipe cascade; three GBC-001-repoint stale-pin lanes; search-slot strict-mode; theming #rendermarkdown heading; FUSE-05 tracked-fonts; SHELL-010 copy anchor); sprint-06's own lanes and both journeys green under the same runner
- HYPOTHESIS (remedy): a remediation task owning those six frozen lane fixes — outside sprint-06 write scope (tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts:92 et al.)

Proof: gate-verification.json (verified=true, 0 discrepancies) | Judge: .gate-judge/20260930T061805Z/{report.md,run.jsonl}, screenshots on disk
