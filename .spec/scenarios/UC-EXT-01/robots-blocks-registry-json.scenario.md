---
flow_id: FLOW-EXT-05-robots-blocks-registry-json
service: docs-site
feature: UC-EXT-01
priority: P0
type: security
tier: holdout
scope: task
---

# robots.txt disallows the registry JSON agents must fetch

A robots.txt tweak meant to keep crawlers off bulky endpoints accidentally covers /r/*.json. A robots-compliant agent then refuses to fetch the very URLs every install command points at.

Test inputs:
- https://rnraielements.com/robots.txt parsed into its Disallow rules
- A sample registry item URL, for example https://rnraielements.com/r/nativewind/<first item name from packages/registry/registry.json>.json

Expected outputs:
- No Disallow rule matches any /r/ path: not `Disallow: /r`, not `Disallow: /r/`, and not wildcard forms like `Disallow: /*.json`.
- /llms.txt and /llms-full.txt are not disallowed either.
- The sampled registry URL returns HTTP 200 with application/json.
- Security classification: if violated, every llms.txt install command becomes unexecutable for compliant agents, with no error message pointing at the cause.
