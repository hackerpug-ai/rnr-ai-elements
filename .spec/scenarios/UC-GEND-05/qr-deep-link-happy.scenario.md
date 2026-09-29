---
flow_id: FLOW-GEND-27-qr-deep-link-happy
service: docs-site
feature: UC-GEND-05
priority: P1
type: happy_path
tier: visible
scope: task
---

# Scanning the component-page QR opens that item's live gallery screen in Expo Go

Open `/components/shimmer`, decode the rendered QR (it is an inlined build-time SVG) with a QR decoder, and follow the decoded URL on a phone with Expo Go installed.

**Expected**: the decoded URL points at the configured published-gallery base URL deep-linking the shimmer screen, and following it opens the live gallery on that screen in Expo Go — no repo clone, no install, no dev build. The QR is an inline SVG with no runtime script and no external image request.
