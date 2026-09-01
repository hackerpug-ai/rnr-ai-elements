---
stability: CONSTITUTION
last_validated: 2026-09-01
prd_version: 1.0.0
---

# Data Schema

No database, no persistence, no server state. These are the **prop and context shapes** the
components exchange — the library's public type surface.

| Entity | Shape | Notes |
|---|---|---|
| `MessageRole` | `'user' | 'assistant' | 'system'` | Published through MessageContext by Message; drives row direction, bubble corners, and the TextClassContext value. |
| `ToolStatus` | `'input-streaming' | 'input-available' | 'output-available' | 'output-error' | 'output-denied' | 'approval-requested' | 'approval-responded'` | The ONE type in the library that mirrors an external contract. Locally declared, structurally identical to AI SDK v7's tool-part state. |
| `ReasoningState` | `{ text: string; isStreaming: boolean; durationMs?: number }` | Prop-driven. The duration counter ticks from isStreaming; the component owns no timer state across mounts. |
| `ChainOfThoughtStepStatus` | `'pending' | 'active' | 'complete' | 'error'` | Independent of ToolStatus on purpose — a reasoning step is not a tool call and conflating them makes both harder to render. |
| `AttachmentData` | `{ id: string; name: string; mimeType: string; uri?: string; sizeBytes?: number }` | getMediaCategory(mimeType) derives the preview affordance. Pure function, Vitest-testable. |
| `SourceData` | `{ id: string; title: string; url: string; snippet?: string; faviconUri?: string }` | Backs sources and inline-citation. url goes through RN Linking.openURL with a scheme allowlist — a security-review surface. |
| `PlanStep / TaskItem` | `{ id: string; title: string; status: ChainOfThoughtStepStatus; files?: string[] }` | Shared shape across plan, task, and checkpoint so a consumer maps once. |
| `FileTreeNode` | `{ name: string; path: string; type: 'file' | 'folder'; children?: FileTreeNode[] }` | Flattened to a FlatList with a depth field for rendering — a nested render tree defeats virtualization. |
| `TestStatusType / TestSuite / Test` | `'passed' | 'failed' | 'skipped' | 'running'; suite and test trees` | test-results. Progress bar via RNR Progress, no chart. |
| `StackFrame / ParsedStackTrace` | `{ fn?: string; file?: string; line?: number; col?: number }[] + raw` | The parser is pure logic and belongs in registry:lib with real Vitest coverage against real captured traces. |
| `HttpMethod / SchemaParameter / SchemaProperty` | `verb union + parameter/property records` | schema-display. |
| `ConversationItem<T>` | `consumer-defined; Conversation is generic over it` | Deliberately NOT bound to UIMessage. Conversation<T> takes data: T[], renderItem, keyExtractor — the library never assumes an SDK. |

## The one external contract

`ToolStatus` is the only type in the library that mirrors something outside it. It is
declared locally and is structurally identical to the AI SDK v7 tool-part `state` union:

```
'input-streaming' | 'input-available' | 'approval-requested' | 'approval-responded'
| 'output-available' | 'output-error' | 'output-denied'
```

`<ToolHeader state={part.state} />` type-checks against a `UIMessage` tool part with **no
adapter**. Preserve that verbatim — a hand-rolled status union type-checks locally and
silently drifts on the next SDK upgrade. A Vitest type-conformance test guards it.

Two states are routinely skipped and must be planned deliberately: `input-streaming`
renders while arguments are still arriving, so the input view must survive partial and
invalid JSON; and `approval-requested` / `approval-responded` are the human-in-the-loop
path — without a real UI and a real response call, a gated agent stalls forever.
