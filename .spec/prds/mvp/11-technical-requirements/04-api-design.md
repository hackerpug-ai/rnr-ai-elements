---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# API Design

| Endpoint | Notes |
|---|---|
| `none` | This is a UI registry. It performs no network I/O, opens no sockets, and holds no credentials. It has no endpoints by design, and that is what keeps it usable with any AI backend. |
| `POST /api/chat (apps/example only)` | expo-router API route (app/api/chat+api.ts). Calls a real provider via streamText and returns toUIMessageStreamResponse(). Exists so streaming, throttling, auto-scroll, and tool-state rendering are verified against a real token stream rather than a setTimeout simulation. Client side must use expo/fetch, not global fetch, which does not stream response bodies on native. |
| `GET https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/public/r/*.json` | The distribution surface. Static JSON consumed by the RNR CLI. Not an application API; no auth, no rate-limit handling on our side. |
