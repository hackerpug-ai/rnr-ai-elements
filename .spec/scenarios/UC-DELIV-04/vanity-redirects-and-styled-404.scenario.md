---
flow_id: FLOW-DELIV-04-vanity-redirects-and-styled-404
service: docs-site
feature: UC-DELIV-04
priority: P1
type: happy_path
tier: visible
scope: task
---

# Vanity 301s land on real pages; unknown URLs get a styled 404 with search

Short URLs people type from memory must land somewhere real, and dead URLs must offer a way back via search.

**Test inputs**:
- `curl -sI https://rnraielements.com/docs`
- `curl -sI https://rnraielements.com/install`
- `curl -s https://rnraielements.com/no-such-page`

**Expected outputs**:
- `/docs` -> `301` with `location: /docs/introduction`.
- `/install` -> `301` with `location: /docs/installation`.
- The unknown URL returns `404` with an HTML body containing the Cmd+K search affordance (a visible search trigger) — not blank, and not the platform-default error page.
