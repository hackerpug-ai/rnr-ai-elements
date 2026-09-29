---
flow_id: FLOW-EXT-10-license-claim-mismatch
service: docs-site
feature: UC-EXT-02
priority: P0
type: edge_case
tier: holdout
scope: task
---

# LICENSE in the repo contradicts the license the site claims

The repo ships Apache-2.0 while the README badge and site footer say MIT - or the site claims a license while the file is missing.

Test inputs:
- The SPDX identifier derived from the full text at https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/LICENSE
- The license claim in the README (badge or statement)
- The license claim on https://rnraielements.com (footer or legal page)

Expected outputs:
- Exactly one SPDX identifier appears, identical across all three surfaces.
- A claim on any surface with no matching LICENSE file fails.
- Any pairwise mismatch (repo vs README, repo vs site, README vs site) fails.
