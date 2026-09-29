---
flow_id: FLOW-SHELL-09-pagefind-fetched-on-page-load
service: docs-site
feature: UC-SHELL-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Network-weight audit: zero Pagefind bytes on plain page loads

Adversarial weight audit, no clicks at all. For each of five cold routes (`/`, `/docs/installation`, `/docs/theming`, `/components/message`, `/registry`): fresh context, navigate, wait for the window load event plus 2 seconds idle, then read the full request log. Expected: exactly 0 requests whose URL matches `/pagefind/` — not `pagefind.js`, not index chunks, not prefetch hints. Then fetch the raw served HTML for each route and assert it contains no `<script src=".../pagefind/...">`, no `<link rel="preload"|"prefetch">` pointing at `/pagefind/`, and no `import('pagefind')` in any always-executed inline script. Any hit means the lazy-load contract regressed to eager loading — FAIL.
