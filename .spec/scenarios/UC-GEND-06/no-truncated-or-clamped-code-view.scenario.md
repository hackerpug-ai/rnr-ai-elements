---
flow_id: FLOW-GEND-36-no-truncated-or-clamped-code-view
service: docs-site
feature: UC-GEND-06
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A height-clamped or truncated Code view fails

Inject the regression: add a `max-height` + `overflow: hidden` (or a show-more button that hides lines, or a last-200-lines slice) to the Code view. Rebuild and run the completeness check on the longest item source in the registry.

**Expected**: failure. The check asserts (1) the rendered code text's length equals the source file's length, (2) the full text is present in the server HTML (not lazy-loaded on scroll), and (3) no ancestor of the code element carries a height/clamp style that visually cuts content. Copy-paste users own every line — "never height-limited, prettified-only, or line-numbered-only" is the contract.
