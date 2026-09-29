---
flow_id: FLOW-DELIV-01-empty-file-target
service: docs-site
feature: UC-DELIV-01
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Empty or missing files[].path target fails the build

Every registry item's `files[].path` must point at a real, non-empty file, so no component page ever renders an empty Code view.

**Test inputs**: truncate one item's source file to zero bytes; separately, point a `files[].path` entry at a path that does not exist.

**Expected outputs**:
- Empty file: prebuild exits non-zero with `files[].path is empty for item: conversation (components/ui/conversation.tsx)`.
- Missing file: prebuild exits non-zero with `files[].path not found for item: conversation`.
- Neither case produces a `dist/` output.
