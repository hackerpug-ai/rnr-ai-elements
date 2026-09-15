ORI-AST-003 — cycle 2 (remediation, evidence-only).

Cycle-1 review (EG-1, EG-2) found the committed evidence bound to stale source
hashes (three files were edited after the green capture) and recorded no owned
preview. The reviewer confirmed the code is sound (comment-only drift) and
independently re-ran all three lanes green. This cycle re-binds the evidence to
the committed tip (2e92789) and records the genuinely owned preview.

Tip: 2e92789cca5a56a1fbaa6943cb3b62944fa8ac7b

Owned preview (observed BEFORE the three verifies, unchanged AFTER):
  listener_pid:   18154
  listener_cwd:   <worktree>/apps/docs  (this candidate's docs app)
  dist_path:      apps/docs/dist
  dist_tree_sha:  abb7b17a5f37d6a5f3428037406fa2deb04b38d9e7c3902daa20809c757a367d
  theming_html:   cad795a3274c75e752ae7ec3e26fc7716aae03a5070712e1c9b98e0199a7b5c0
  dist_files:     192

Fresh hashes at tip (the cycle-1 manifest recorded pre-edit values):
  token_map_ts:      20a0e855510412cb78b45b2d7f5c864882fd7e718269961ae548c844eca650c4
  token_map_test:    a5ad0f210e0dc1d085c3f218e6bd1b3708ddc6580c2fa3b56258dfb0baf0c47e
  theme_toggle_ts:   8bb38fcf6f8b1c859647a9ec30d9846437f623040cbeb94d5af802971d68cd50

Re-run at the tip (all green):
  pnpm exec vitest run tests/sprint-05-orient-search/token-map.test.ts        -> 1 passed
  pnpm exec playwright test ... --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free -> 3 passed
  pnpm exec playwright test ... --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash -> 3 passed
