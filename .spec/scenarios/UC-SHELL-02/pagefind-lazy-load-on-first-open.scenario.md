---
flow_id: FLOW-SHELL-08-pagefind-lazy-load-on-first-open
service: docs-site
feature: UC-SHELL-02
priority: P1
type: happy_path
tier: visible
scope: task
---

# Pagefind bundle loads only on first dialog open

Start a network request log on `/docs/introduction`. Hover header nav links (ClientRouter prefetch fires) and complete two soft navigations (`/docs/installation`, `/registry`) WITHOUT opening the dialog: request log contains zero `/pagefind/` requests. Now press Cmd+K for the first time: the log gains at least one request to same-origin `/pagefind/pagefind.js` plus `/pagefind/*` index chunks. Close the dialog and reopen it on the same page: no additional `/pagefind/` requests (the index is cached in the island, not re-fetched). All Pagefind URLs must be same-origin. FAIL if any `/pagefind/` byte moves before the first open or duplicates on reopen.
