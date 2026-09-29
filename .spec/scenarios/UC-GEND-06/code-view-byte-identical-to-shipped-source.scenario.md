---
flow_id: FLOW-GEND-35-code-view-byte-identical-to-shipped-source
service: docs-site
feature: UC-GEND-06
priority: P0
type: happy_path
tier: visible
scope: task
---

# Code view text is byte-identical to the shipped registry source

For a sample of items with multi-file sources (e.g. `audio-player` with `audio-player.tsx` + `audio-player.logic.ts`), extract the Code view text from the built page and diff it against the `files[].path` contents referenced by the corresponding `public/r/{engine}/{item}.json`.

**Expected**: zero diffs — the docs show exactly the bytes the CLI installs, for every file in the item's `files[]` list (no file silently dropped from a multi-file item). This is the reference-never-contradicts-the-artifact invariant: any normalization (reformatting, semicolon rewriting, import reordering) applied for display breaks copy-paste parity and fails this scenario.
