# MVP Plan

The single plan page for remaining work. The 59-file planning binder this replaced is in git history: `git log -- .spec/prds/mvp/`. Sprint runner state copies live under `.kb-run-sprint/`.

## Done

- [x] Components: 56/56 registry items shipped — 39 component / 11 ui / 6 lib (component inventory verified 2026-09-04).

## Sprint 01 — Installed app cold-boots on both platforms (committed; remainder)

- [ ] Pass the 15-step human testing gate. Only 1 of 15 steps has ever been executed; 0 passed.
- [ ] Integrate the 10 landed task commits sitting on the declined branch `sprint/sprint-01-installed-app-cold-boots-on-both-platforms`.
  - Integration also closes: 254 unrewritten `@/registry` imports across 50 of 56 emitted items, and 26 `--color-*` theme entries undeclared outside `apps/harness/src/global.css`.

## Sprint 02 — Android, web and Expo Go parity for the shipped set (9 of 13 done; 4 device/web legs remain)

- [x] P1 — All 56 items install into apps/example via the real RNR CLI; installed from the v0.2.0 tag (74 files created, 19 identical); peers at Expo 57 pins, Expo Go-clean graph — PR #28.
- [x] P2 — Manifest-driven /gallery route: index + per-item four-state matrix screens with interactive prop controls, one codebase for iOS/Android/web.
- [ ] P3 — Android second pass over the shipped set: gesture-bar insets, predictive back, keyboard avoidance, press/ripple states, first Android dark flip.
- [ ] P4 — Web leg: static `expo export -p web`, react-native-web parity for the full set, hover twins with active twins, first web dark flip.
- [ ] P5 — Full 56-item set loads inside Expo Go on a physical iPhone with no dev client; evidence captured.
- [x] P6 — peer deps via `dependencies` + `meta.permissions`, both directions enforced — PRs #23/#26. Emitted into public/r.
- [x] P7 — Seeded four-state literals authored — the strings a stranger literally reads in every matrix cell.
- [x] P8 — Dark-flip observability built: scheme strip in the gallery chrome and the mid-stream flip surface.
- [x] P9 — CI test: declared peers and permissions match each source's actual imports, both directions, both engines.
- [x] P10 — Engine parity: both trees serve the same 56 names, only the engine token differs, meta identical.
- [x] P11 — Stranger-runnable web-only-construct scan executes the styling contract, with the missing DOM/iframe/hover checks added.
- [x] P12 — Expo Go / dev-client status emitted from registry meta so the gallery walk shows it, never silently skips it.
- [ ] P13 — Automated sprint-02 lane: Android gallery walk (56 × 4 states), dark-flip driver, web export smoke, every negative control watched failing.

## Provisional, unscheduled

- Sprint 03 — Published ledger and install page.
- Sprint 04 — Upstream RNR drift guard.

## Fixed since this page was written

- check:tokens is now a REAL gate — 80 grandfathered raw values each with a written reason, wired into CI (PR #23). The plan page's original two "live defects" turned out to be six dependency-declaration defects + this one; all fixed with machine gates closing each class.
- A seventh class the gallery's web export caught live: six items shipped without sibling files their sources import (PR #29, v0.2.1) — now a 56-item integrity test.

## Still live defects

- None known. (The page's original two — the phantom `check:tokens` script and the undeclared native imports — are fixed with gates; see above.)

## Deferred decisions

- ~~Sprint-01 disposition~~ — RESOLVED: integrated via PR #22 (the 15-step human gate was superseded by the merged parity work; remaining device verification lives in P3/P5/P13 below).
- ~~Phantom `check:tokens`~~ — RESOLVED: real script, wired into CI (PR #23).
- ~~Undeclared native imports~~ — RESOLVED: declared + both-directions test (PR #23).
- Ten parked specialist proposals in `.tmp/kb-sprint-plan/mvp/proposals/` — unscheduled.
- `.kb-run-sprint/` runner state: keep as archive or delete.
