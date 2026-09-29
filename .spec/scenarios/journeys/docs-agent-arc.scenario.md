---
service: docs-site
feature: journey-docs-agent-arc
covers_ucs: [UC-EXT-01, UC-GEND-04, UC-DELIV-03]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# An AI agent installs correctly from machine-readable docs alone

The non-human path: fetch `llms.txt`, read the not-an-npm-package statement, apply the engine-detection heuristics to the target project's facts (Tailwind v4 + `@theme` -> uniwind; nativewind v3 -> nativewind tree), run the literal absolute-URL CLI command against `rnraielements.com/r/{engine}/{item}.json`, install the listed peers, and surface the dev-client flags for the 4 opt-in items before the user hits them. The arc fails if any llms.txt command diverges from the ledger's, any `/r/` URL redirects or returns HTML, or a verdict is missing.

**Covers:** `UC-EXT-01`, `UC-GEND-04`, `UC-DELIV-03`
