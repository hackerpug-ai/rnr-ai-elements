---
flow_id: FLOW-GEND-13-pagefind-indexes-hidden-engine-panels
service: docs-site
feature: UC-GEND-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Search finds content that lives in the server-rendered but hidden engine panel

After a full build with the Pagefind pass over `dist/`, query the index for engine-specific terms that exist only inside the non-default tab panel (e.g. search `uniwind conversation.json` and `nativewind prompt-input.json`).

**Expected**: both engine panels of every tabbed install block are server-rendered into the static HTML, so Pagefind indexes the uniwind panel content even though it is visually hidden behind the persisted nativewind tab, and the `/components/conversation` page surfaces for both queries. If a future change strips hidden panels from the HTML before indexing (or moves command text into client-only rendering), these queries return nothing — which fails this scenario, because search must remain the primary path to the exact command a uniwind user needs.
