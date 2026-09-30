# GBC-009 cycle-1 RED evidence (pre-implementation)

Date: 2026-09-29, worktree @ 3c96b6da (main).

1. vitest guides-routing.test.ts -> exit 1 (3 failed / 0 passed)
   - GBC-009-porting-entry-count: portingEntry is not a function (guard not exported); porting.astro absent
   - GBC-009-section-href-derivation: hrefFor is not a function
   - GBC-009-duplicate-destinations: expected [Function] to throw (publishedDocs still emits /docs/{id} for guides, so the /guides/re-theme duplicate is not detected)
   Log: .tmp/GBC-009/cycle-1/red/vitest-guides-routing.log (rtk-filtered; full: rtk tee *_vitest_run.log)
2. e2e porting-map.spec.ts FLOW-DOCS-05 gate RED: captured by run_flow.py --expect red -> tests/sprint-06-guides-boundary-changelog/evidence/FLOW-DOCS-05-porting-map-and-prior-art/proof.red
   (/porting 404 pre-implementation; /docs/porting 200 pre-implementation)
