---
service: docs-site
feature: journey-docs-agent-arc
covers_ucs: [UC-EXT-01, UC-DELIV-03]
priority: P0
type: security
tier: visible
test_tier: e2e
---
# A robots.txt rule silently cuts the agent off from the registry

A crawl-hygiene edit to robots.txt adds a Disallow that matches `/r/` (directly or via a wildcard like `/*.json`). A robots-compliant agent following llms.txt now refuses to fetch every URL the install commands point at, with no error naming the cause. Assert no Disallow rule matches any `/r/` path or `/llms*.txt`, and that the sampled registry URL still returns 200 `application/json`.

**Covers:** `UC-EXT-01`, `UC-DELIV-03`
