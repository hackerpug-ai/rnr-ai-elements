# ORI-RN-004 — GREEN evidence (observed passing outputs)

## AC-5 live-import-graph compiler — GREEN
`pnpm --dir apps/example exec tsc --noEmit -p tsconfig.live-chat.json` exits 0.
The program includes app/live-chat.tsx, components/live-chat-screen.tsx,
components/live-chat-message.tsx and the installed components/ai/{conversation,message,
prompt-input}.tsx. Whole-example diagnostic retained separately (exit 2, pre-existing
gallery/server/index errors). Full verbatim output in green/live-import-graph-typecheck.txt
and green/example-package-typecheck.txt.

## AC-1..AC-3 iOS native leg — GREEN (real provider)
The live-example.maestro.yaml flow ran against the REAL apps/example app in Expo Go on
the reserved iPhone 17 simulator (iOS 26.3), in both light and dark, reaching the real
gpt-4.1-mini-2025-04-14 endpoint through the ORI-AI-001 backend.

Observed (provider-correlation.json): 4 real requests per appearance —
  completed (deltaCount ~50), completed (~66-77, the seed exchange),
  completed (~28-29, the contextual follow-up), aborted (~88-198, the active Stop).
Real `resp_` response IDs, non-zero usage, non-empty final text hashes.

The Maestro flow asserts: empty transcript ("Start a conversation"), submit a marker
(exactly one user turn), seed + follow-up completion, and an active Stop mid-stream.

Evidence: tests/sprint-05-orient-search/evidence/ORI-RN-004/ios/{light,dark}/screenshot.png
and run-manifest.json legs (ios light/dark status=passed).
