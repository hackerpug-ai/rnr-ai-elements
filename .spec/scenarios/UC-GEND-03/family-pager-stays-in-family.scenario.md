---
flow_id: FLOW-GEND-15-family-pager-stays-in-family
service: docs-site
feature: UC-GEND-03
priority: P1
type: happy_path
tier: visible
scope: task
---

# Prev/next pager never crosses a family boundary

Walk all 39 pages following `next` links from each family's first item.

**Expected**: for every family (e.g. reasoning with its members, sources with its members), the next/prev pager links resolve to pages within the SAME family, and following next from the family's last item either wraps to the family's first item or omits the next affordance — it never jumps into a different family. Every pager href returns 200 in `dist/`. Assert per family: `set(pages_reachable_via_pager) == set(family_members)`.
