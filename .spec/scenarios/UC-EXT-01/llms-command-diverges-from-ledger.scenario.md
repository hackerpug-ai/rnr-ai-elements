---
flow_id: FLOW-EXT-03-llms-command-diverges-from-ledger
service: docs-site
feature: UC-EXT-01
priority: P0
type: security
tier: holdout
scope: task
---

# llms.txt command disagrees with the ledger copy-button command for the same item

Hidden framing: if llms-full.txt were hand-written or built from different data, it would silently diverge from what a human copies on the site. An agent following llms.txt and a human following the ledger must receive identical instructions, because both are generated from the same collections and registry data.

Test inputs:
- https://rnraielements.com/llms-full.txt
- https://rnraielements.com/registry ledger rows and the component-page install blocks from the same build

Expected outputs:
- For all 56 items, the command string in llms-full.txt is string-identical (including the engine URL segment) to the ledger row copy-button command and the component-page install command.
- Any single mismatch fails: for example llms.txt saying /r/nativewind/ while the ledger says /r/uniwind/, or one surface using a short-name form.
- Security classification: two authoritative sources disagreeing means an agent silently installs the wrong engine tree, with no error pointing at the divergence.
