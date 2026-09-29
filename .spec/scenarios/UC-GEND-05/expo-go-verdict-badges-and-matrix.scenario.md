---
flow_id: FLOW-GEND-28-expo-go-verdict-badges-and-matrix
service: docs-site
feature: UC-GEND-05
priority: P1
type: happy_path
tier: visible
scope: task
---

# Verdict badges and the install-docs matrix cover all items including the 4 dev-client opt-ins

Collect the verdict badge from all 39 component pages and all 56 ledger rows, and open the install docs matrix.

**Expected**: every badge reads one of the two verdict states. Exactly the four opt-in items (enriched markdown, streamdown, speech recognition, extended audio) read `requires a dev client` everywhere they appear; all other items read `runs in Expo Go`. The install-docs matrix names those same four items with their peer dependencies and ios/android permission contracts. Assert: `dev_client_badge_count == 4` on pages and ledger, and the matrix's dev-client row set equals that same set of four names.
