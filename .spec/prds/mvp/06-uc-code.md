---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
functional_group: CODE
---

# Use Cases: Coding-Agent Surfaces (CODE)

Developer-artifact display for coding agents: file-tree, terminal, test-results, stack-trace, commit, package-info, environment-variables, and the native webview substitute for web-preview.

| ID | Title | Description |
|----|-------|-------------|
| `UC-CODE-01` | Repository and environment context on a phone screen | File tree, commits, package info, and environment variables rendered for narrow screens with copy and reveal affordances. |
| `UC-CODE-02` | Run output: terminal, tests, and stack traces | Dense monospace output that scrolls rather than wraps, and summarizes rather than dumps. |
| `UC-CODE-03` | Live web preview through a native webview | The web-preview surface is delivered as a native webview with an explicit dependency contract and a real error state. |

---

## UC-CODE-01: Repository and environment context on a phone screen

File tree, commits, package info, and environment variables rendered for narrow screens with copy and reveal affordances.

### Acceptance Criteria

- ☐ **AC-1** — Developer can browse a file tree of the agent workspace and expand and collapse directories on a phone-width screen.
- ☐ **AC-2** — Developer can view a commit hash, message, and author, and copy the hash with one tap.
- ☐ **AC-3** — Developer can see package information including name, version, and an install command that copies to the clipboard.
- ☐ **AC-4** — Developer can view environment variables with values masked by default and reveal a single value on demand.

---

## UC-CODE-02: Run output: terminal, tests, and stack traces

Dense monospace output that scrolls rather than wraps, and summarizes rather than dumps.

### Acceptance Criteria

- ☐ **AC-1** — Developer can read terminal output in a monospace view that scrolls horizontally without wrapping and vertically without dropping frames.
- ☐ **AC-2** — Developer can see a test run summarized as passed, failed, and skipped counts, and expand a failing test to read its message.
- ☐ **AC-3** — Developer can read a stack trace with each frame file and line legible at phone width.
- ☐ **AC-4** — Developer can copy any run output block to the clipboard with one tap.

---

## UC-CODE-03: Live web preview through a native webview

The web-preview surface is delivered as a native webview with an explicit dependency contract and a real error state.

### Acceptance Criteria

- ☐ **AC-1** — Developer can render a live web preview inside a native webview with a visible URL bar and a reload control.
- ☐ **AC-2** — Developer can install the preview component and be told at install time that it requires the react-native-webview peer dependency.
- ☐ **AC-3** — Developer can see the preview surface show an explicit error state when the previewed URL fails to load rather than a blank white view.
- ☐ **AC-4** — Developer can build the rest of the library without installing the webview dependency at all.

---

