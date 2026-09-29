---
flow_id: FLOW-SHELL-23-copy-fails-silently-insecure-origin
service: docs-site
feature: UC-SHELL-04
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Copy button fails loudly on insecure origins, never shows false success

`navigator.clipboard` exists only in secure contexts. Serve the built site over plain `http://` (local static server) so `navigator.clipboard === undefined`. On `/docs/installation`, click the CopyButton on the install command. The failure must never be silent: the button shows a visible error state or fallback (the command text becomes selected, or a "copy manually" hint renders) and the outcome is announced via aria-live. The success check icon must NOT appear — no false success. Contrast control on `https://` (or localhost): the same click succeeds — clipboard content equals the literal command `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/{engine}/{item}.json` — and the check icon shows for roughly 1.5s.
