---
flow_id: FLOW-DOCS-05-prior-art-link-rot
service: docs-site
feature: UC-DOCS-05
priority: P2
type: error_handling
tier: holdout
scope: task
---

# Prior-art links are absolute, well-formed, and live

The prior-art section links https://elements.ai-sdk.dev and the muratcakmak/expo-ai-elements GitHub repository. Mangle one in a scratch build: make it relative, drop the https, or typo the host. Expected output: the healthy build has both links as absolute https URLs resolving with 200 or 301; the mangled link fails the check, naming the anchor text and the malformed href.
