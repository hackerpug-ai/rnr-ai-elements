---
flow_id: FLOW-EXT-08-license-file-exists
service: docs-site
feature: UC-EXT-02
priority: P0
type: happy_path
tier: visible
scope: task
---

# LICENSE file exists at the repo root

No LICENSE exists in the repo today. Evaluation and legal review both fail without one; the shipped state must have it.

Test inputs:
- GET https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/LICENSE

Expected outputs:
- HTTP 200 with a non-empty body.
- The text is a recognizable standard license identifiable to an SPDX identifier (for example MIT) - not a placeholder, not a TODO, not a redirect page.
- The same identifier is what the README badge and the site footer claim (verified by the license-consistency holdout scenario).
