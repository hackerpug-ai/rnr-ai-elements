---
service: rnr-ai-elements
feature: UC-FOUND-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Rebrand a real app

Take a shipping RNR app with a non-default brand palette, install conversation+message+tool, and change only --color-primary. Every AI surface AND every pre-existing RNR surface must move together in one rebuild. If the chat bubbles keep the old primary, the passthrough is fake.
