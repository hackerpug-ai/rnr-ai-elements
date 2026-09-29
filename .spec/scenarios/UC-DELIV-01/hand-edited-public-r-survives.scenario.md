---
flow_id: FLOW-DELIV-01-hand-edited-public-r-survives
service: docs-site
feature: UC-DELIV-01
priority: P0
type: security
tier: holdout
scope: task
---

# Hand-edited gitignored public/r file must not survive into a deploy

`apps/docs/public/r` is generated-only and gitignored. A hand edit must never reach production, because the absolute-URL install commands would then ship code that never passed the registry gates.

**Test inputs**: hand-edit `apps/docs/public/r/nativewind/conversation.json` (change `description` to `HAND-EDITED MARKER`), then rerun the full CI chain without cleaning the workspace.

**Expected outputs**:
- `sha256sum apps/docs/dist/r/nativewind/conversation.json` equals the sha256 of the freshly generated root `public/r/nativewind/conversation.json` at the same commit.
- `grep -r 'HAND-EDITED MARKER' apps/docs/dist/` finds nothing.
- The prebuild deletes and fully replaces the directory: a JSON for a renamed or removed item does not survive either.
