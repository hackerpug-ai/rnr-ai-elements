---
stability: FEATURE_SPEC
last_validated: 2026-09-01
prd_version: 1.0.0
functional_group: FOUND
---

# Use Cases: Foundation and Theming (FOUND)

The RNR token bridge, dark-mode parity, the reuse-first primitive policy, and demand-driven creation of the missing shadcn primitives (scroll-area, item, empty, spinner, kbd, field, input-group, button-group) that shipped components actually require.

| ID | Title | Description |
|----|-------|-------------|
| `UC-FOUND-01` | RNR theme tokens drive every ported component | Every color, radius, spacing, and type value in every ported component resolves from the host app's RNR theme rather than from a literal, so a single token edit propagates across both libraries. |
| `UC-FOUND-02` | Dark mode flips both libraries in the same frame | Color scheme is read from the same mechanism the host RNR app already uses, so no AI surface is left behind on an appearance change. |
| `UC-FOUND-03` | Reuse RNR first, create a primitive only on demand | The 29 primitives RNR already ships are reused directly; new primitives are created only when a shipped component requires one from the documented 26-item gap list. |
| `UC-FOUND-04` | One design system on a mobile device | The binding product promise made observable: on a phone, a reviewer cannot tell which library rendered which surface. |

---

## UC-FOUND-01: RNR theme tokens drive every ported component

Every color, radius, spacing, and type value in every ported component resolves from the host app's RNR theme rather than from a literal, so a single token edit propagates across both libraries.

### Acceptance Criteria

- ☐ **AC-1** — Developer can change a single RNR theme token such as the primary color or the base radius and see both RNR components and AI Elements components change together on iOS, Android, and web without editing any component file.
- ☐ **AC-2** — Developer can apply an existing RNR theme configuration from a shipping app to this library without adding a second provider, a second token file, or a per-component override.
- ☐ **AC-3** — System resolves every color, radius, and spacing value in every shipped component from an RNR theme token rather than from a hardcoded literal.
- ☐ **AC-4** — Maintainer can run a CI check that fails the build when any shipped component file contains a hardcoded color or radius literal instead of a theme token.

---

## UC-FOUND-02: Dark mode flips both libraries in the same frame

Color scheme is read from the same mechanism the host RNR app already uses, so no AI surface is left behind on an appearance change.

### Acceptance Criteria

- ☐ **AC-1** — End user can switch the device between light and dark appearance and see every AI Elements surface flip in the same frame as the surrounding RNR screen.
- ☐ **AC-2** — Developer can toggle the app color scheme at runtime and see no component retain a light-mode background, border, or text color.
- ☐ **AC-3** — System reads the active color scheme from the same RNR mechanism the host app already uses rather than from a library-local scheme state.

---

## UC-FOUND-03: Reuse RNR first, create a primitive only on demand

The 29 primitives RNR already ships are reused directly; new primitives are created only when a shipped component requires one from the documented 26-item gap list.

### Acceptance Criteria

- ☐ **AC-1** — Developer can install any shipped component and get RNR's own primitive wherever RNR already ships one, with no duplicated fork of accordion, dialog, popover, or the other reused primitives.
- ☐ **AC-2** — Maintainer can justify each newly created primitive by naming the shipped component that requires it and the gap-list entry it fills.
- ☐ **AC-3** — Developer can use a newly created primitive such as scroll-area, item, empty, or spinner with the same prop and styling conventions RNR uses for its own primitives.
- ☐ **AC-4** — System exposes no primitive that duplicates an existing RNR component under a different name.

---

## UC-FOUND-04: One design system on a mobile device

The binding product promise made observable: on a phone, a reviewer cannot tell which library rendered which surface.

### Acceptance Criteria

- ☐ **AC-1** — Design-system owner can place an RNR demo screen and an AI Elements chat screen side by side on a phone and cannot identify which library rendered which surface from radius, border color, type scale, or spacing.
- ☐ **AC-2** — Design-system owner can review a per-component screenshot comparison against the AI Elements web reference and confirm the mobile version reads as the same design system.
- ☐ **AC-3** — Developer can adopt these components into an already-themed RNR app without opening a component file to correct a mismatched color, radius, or font.
- ☐ **AC-4** — Design-system owner can point to any visual difference from the web reference and find it recorded as a deliberate mobile adaptation rather than an accident.

---

