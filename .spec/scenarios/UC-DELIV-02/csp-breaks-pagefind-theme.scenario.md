---
flow_id: FLOW-DELIV-02-csp-breaks-pagefind-theme
service: docs-site
feature: UC-DELIV-02
priority: P0
type: security
tier: holdout
scope: task
---

# Shipped CSP must keep Pagefind search and the pre-paint theme script working

The CSP allowances (`script-src 'unsafe-inline'` for the `is:inline` pre-paint theme script, `connect-src 'self'` for same-origin Pagefind fetches) exist because real features depend on them.

**Test inputs**: load `https://rnraielements.com/docs/introduction` in a real browser; press Cmd+K and search for a component name; select the light theme and hard-reload.

**Expected outputs**:
- `/pagefind/pagefind.js` and its index chunks return `200` same-origin.
- Zero CSP violation entries in the browser console.
- Search returns results for a known component name.
- The first painted frame is already light — no dark-to-light flash; `document.documentElement` carries the theme dataset before first paint.
- If either feature breaks, the most recent `Content-Security-Policy` header diff is the regression to bisect.
