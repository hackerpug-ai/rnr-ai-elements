---
flow_id: FLOW-GEND-08-family-card-anatomy
service: docs-site
feature: UC-GEND-02
priority: P1
type: happy_path
tier: visible
scope: task
---

# Every family card carries name, one-line description, category chip, and Expo Go verdict badge

Iterate all 39 cards on `/components`.

**Expected**: each card renders (1) the item title, (2) its one-line registry description (non-empty, matching the `description` field of the enriched item), (3) a category chip, and (4) an Expo Go verdict badge whose text is one of the two verdict states (runs in Expo Go / requires a dev client). No card has an empty description, a missing chip, or a blank/placeholder badge — a card missing any of the four elements fails the count assertion `cards_with_all_fields == 39`.
