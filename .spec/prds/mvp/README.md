# MVP Plan

The single plan page for remaining work. The 59-file planning binder this replaced is in git history: `git log -- .spec/prds/mvp/`. Sprint runner state copies live under `.kb-run-sprint/`.

## Done

- [x] Components: 56/56 registry items shipped — 39 component / 11 ui / 6 lib (component inventory verified 2026-09-04).

## Sprint 01 — Installed app cold-boots on both platforms (committed; remainder)

- [ ] Pass the 15-step human testing gate. Only 1 of 15 steps has ever been executed; 0 passed.
- [ ] Integrate the 10 landed task commits sitting on the declined branch `sprint/sprint-01-installed-app-cold-boots-on-both-platforms`.
  - Integration also closes: 254 unrewritten `@/registry` imports across 50 of 56 emitted items, and 26 `--color-*` theme entries undeclared outside `apps/harness/src/global.css`.

## Sprint 02 — Android, web and Expo Go parity for the shipped set (committed; 13 tasks, none started)

- [ ] P1 — All 56 items install into apps/example via the real RNR CLI from the v0.1.0 tag, peers at Expo 57's pin, Expo Go-clean graph.
- [ ] P2 — Manifest-driven /gallery route: index + per-item four-state matrix screens with interactive prop controls, one codebase for iOS/Android/web.
- [ ] P3 — Android second pass over the shipped set: gesture-bar insets, predictive back, keyboard avoidance, press/ripple states, first Android dark flip.
- [ ] P4 — Web leg: static `expo export -p web`, react-native-web parity for the full set, hover twins with active twins, first web dark flip.
- [ ] P5 — Full 56-item set loads inside Expo Go on a physical iPhone with no dev client; evidence captured.
- [ ] P6 — `meta.nativePeerDependencies` and `meta.permissions` declared on every item that needs them, mined from actual imports, emitted into public/r.
- [ ] P7 — Seeded four-state literals authored — the strings a stranger literally reads in every matrix cell.
- [ ] P8 — Dark-flip observability built: scheme strip in the gallery chrome and the mid-stream flip surface.
- [ ] P9 — CI test: declared peers and permissions match each source's actual imports, both directions, both engines.
- [ ] P10 — Engine parity: both trees serve the same 56 names, only the engine token differs, meta identical.
- [ ] P11 — Stranger-runnable web-only-construct scan executes the styling contract, with the missing DOM/iframe/hover checks added.
- [ ] P12 — Expo Go / dev-client status emitted from registry meta so the gallery walk shows it, never silently skips it.
- [ ] P13 — Automated sprint-02 lane: Android gallery walk (56 × 4 states), dark-flip driver, web export smoke, every negative control watched failing.

## Provisional, unscheduled

- Sprint 03 — Published ledger and install page.
- Sprint 04 — Upstream RNR drift guard.

## Live defects not covered by landed work

- `check:tokens` is declared in package.json but `scripts/check-tokens.ts` does not exist — the check silently never runs, and CI invokes neither it nor `check:registry`.
- Undeclared native imports: speech-input imports react-native-reanimated; prompt-input imports expo-document-picker + expo-image-picker.

## Deferred decisions

- Sprint-01 disposition: integrate the 10 declined-branch commits (above) or re-decide.
- Phantom `check:tokens`: implement `scripts/check-tokens.ts` or drop the package.json entry.
- Undeclared native imports: declare via registry meta or vendor the dependency.
- Ten parked specialist proposals in `.tmp/kb-sprint-plan/mvp/proposals/` — unscheduled.
- `.kb-run-sprint/` runner state: keep as archive or delete.
