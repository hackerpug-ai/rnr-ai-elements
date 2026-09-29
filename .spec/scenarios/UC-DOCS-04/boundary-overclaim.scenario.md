---
flow_id: FLOW-DOCS-04-boundary-overclaim
service: docs-site
feature: UC-DOCS-04
priority: P1
type: error_handling
tier: holdout
scope: task
---

# The page never claims to own what it does not

Marketing copy creeps in: a planted edit adds phrases like 'ships with a built-in streaming client' or 'runs tool calls for you'. Scan the page for ownership-claiming language (built-in streaming client, handles tool execution, manages transport). Expected output: zero occurrences in the healthy build. With the planted phrase, the check fails, quoting the sentence and the table row it contradicts.
