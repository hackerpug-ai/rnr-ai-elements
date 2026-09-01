---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
functional_group: AGENT
---

# Use Cases: Agent and Tool Surface (AGENT)

Tool call lifecycle, reasoning and chain-of-thought disclosure, task and plan progress, human-in-the-loop confirmation, agent and persona identity, context budget, artifact container, run controls, schema display.

| ID | Title | Description |
|----|-------|-------------|
| `UC-AGENT-01` | Tool call lifecycle rendered in place | A single component covers every tool-part state and shows inputs and outputs without disturbing the transcript. |
| `UC-AGENT-02` | Reasoning and chain-of-thought disclosure | Reasoning streams into an auto-opened disclosure, collapses when the answer begins, and remains reopenable. |
| `UC-AGENT-03` | Plan and task progress | An agent's plan and its running tasks are visible as ordered, status-bearing lists that update in place. |
| `UC-AGENT-04` | Human-in-the-loop confirmation sized for a thumb | Approve and deny for a requested agent action, with the request legible before approval and the outcome persistent afterward. |
| `UC-AGENT-05` | Agent identity, context budget, artifacts, and run controls | Who is acting, how much context is left, what was produced, and how to control the run. |

---

## UC-AGENT-01: Tool call lifecycle rendered in place

A single component covers every tool-part state and shows inputs and outputs without disturbing the transcript.

### Acceptance Criteria

- ☐ **AC-1** — End user can see a tool call render its name and current state as pending, running, complete, or error without the transcript reflowing when the state changes.
- ☐ **AC-2** — End user can expand a tool call to read its input arguments and its output result.
- ☐ **AC-3** — End user can see an errored tool call visually distinguished from a completed one by color and icon drawn from theme tokens.
- ☐ **AC-4** — Developer can render every AI SDK tool-part state through this component without encountering a state the component does not handle.

---

## UC-AGENT-02: Reasoning and chain-of-thought disclosure

Reasoning streams into an auto-opened disclosure, collapses when the answer begins, and remains reopenable.

### Acceptance Criteria

- ☐ **AC-1** — End user can watch reasoning text stream into an automatically opened disclosure and see it collapse on its own once the final answer begins.
- ☐ **AC-2** — End user can reopen a collapsed reasoning block and read the full retained text.
- ☐ **AC-3** — End user can see how long the model reasoned displayed on the collapsed reasoning header.
- ☐ **AC-4** — End user can follow a multi-step chain of thought with per-step status without leaving the transcript.

---

## UC-AGENT-03: Plan and task progress

An agent's plan and its running tasks are visible as ordered, status-bearing lists that update in place.

### Acceptance Criteria

- ☐ **AC-1** — End user can see an agent plan as an ordered list of steps with each step's current status.
- ☐ **AC-2** — End user can watch a task move from pending to running to complete in place without the list reordering.
- ☐ **AC-3** — End user can expand a task to see the files or items it touched.
- ☐ **AC-4** — End user can tell at a glance how many steps remain in a running plan.

---

## UC-AGENT-04: Human-in-the-loop confirmation sized for a thumb

Approve and deny for a requested agent action, with the request legible before approval and the outcome persistent afterward.

### Acceptance Criteria

- ☐ **AC-1** — End user can approve or deny a requested tool call from the transcript using controls that meet the platform minimum touch-target size.
- ☐ **AC-2** — End user can read exactly which action is being requested, including its arguments, before approving it.
- ☐ **AC-3** — End user can see the confirmation resolve into an approved or denied state that remains visible in the transcript afterward.
- ☐ **AC-4** — Developer can wire approve and deny to their own handlers without the component deciding the outcome itself.

---

## UC-AGENT-05: Agent identity, context budget, artifacts, and run controls

Who is acting, how much context is left, what was produced, and how to control the run.

### Acceptance Criteria

- ☐ **AC-1** — End user can see which agent or persona produced a message from an identity header showing its name and avatar.
- ☐ **AC-2** — End user can tap a context indicator and see token usage and remaining context budget in a press-opened popover.
- ☐ **AC-3** — End user can open a generated artifact in a full-screen sheet and return to the transcript with the scroll position preserved.
- ☐ **AC-4** — End user can start, pause, or stop an agent run from a thumb-reachable control bar.
- ☐ **AC-5** — Developer can display a tool's parameter schema in a nested view that remains legible at phone width.

---

