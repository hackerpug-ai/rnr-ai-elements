---
stability: FEATURE_SPEC
last_validated: 2026-09-04
prd_version: 2.0.0
functional_group: REG
---

# Use Cases: Registry, Compatibility and Docs (REG)

RNR CLI installability, registry entries with declared peer dependencies, Expo SDK 57 compatibility across iOS, Android and web, published per-component porting verdicts including documented non-goals, a live example app demonstrating every state, and the packaging and distribution surface that makes `react-native-reusables` a declared, checkable peer dependency.

| ID | Title | Description |
|----|-------|-------------|
| `UC-REG-01` | Install exactly like RNR | Distribution is a copy-paste registry driven by the RNR CLI; the code lands in the developer's tree and stays editable. |
| `UC-REG-02` | Expo compatibility across iOS, Android, and web | One codebase runs on all three targets under Expo SDK 57 with no web-only construct anywhere in the shipped source. |
| `UC-REG-03` | Published porting verdicts and honest non-goals | Every one of the 49 AI Elements components has a public verdict, and every out-of-scope component names an alternative. |
| `UC-REG-04` | Storybook demonstrates every component and every state | A Storybook running BOTH on device (@storybook/react-native) and on web (@storybook/react-native-web-vite) from one set of story files, proving each component in loading, empty, error and populated states. The device build is the sign-off gate. |
| `UC-REG-05` | RNR is a declared, checkable peer dependency | The library never vendors an RNR primitive. Each item declares the RNR items it needs, a developer who has not set RNR up is told so before they hit a compile error, and CI proves the whole set installs into a freshly initialized RNR app. |
| `UC-REG-06` | Versioned public distribution | Items install from a stable public URL that survives a branch move, in the styling engine the consumer chose, at a version they can pin and reinstall byte-identically. |

---

## UC-REG-01: Install exactly like RNR

Distribution is a copy-paste registry driven by the RNR CLI; the code lands in the developer's tree and stays editable.

### Acceptance Criteria

- ☐ **AC-1** — Developer can install any shipped component with a single RNR CLI add command and see it appear in their project source tree as editable code.
- ☐ **AC-2** — Developer can install a component and have its RNR primitive dependencies resolved and installed automatically.
- ☐ **AC-3** — Developer can re-run the CLI for an updated component and be shown what would be overwritten before it is written.
- ☐ **AC-4** — Maintainer can run a CI job that validates every registry entry resolves and installs into a clean Expo application.

---

## UC-REG-02: Expo compatibility across iOS, Android, and web

One codebase runs on all three targets under Expo SDK 57 with no web-only construct anywhere in the shipped source.

### Acceptance Criteria

- ☐ **AC-1** — Developer can run every shipped component in an Expo SDK 57 application on iOS, Android, and web from a single codebase.
- ☐ **AC-2** — Developer can install any component that requires a native module and see its peer dependency and required permissions declared in its registry entry.
- ☐ **AC-3** — Developer can use any component that requires no custom native module inside an Expo Go session.
- ☐ **AC-4** — System contains no web-only construct such as a DOM element, an iframe, a hover-only interaction, or a CSS cascade assumption in any shipped component.

---

## UC-REG-03: Published porting verdicts and honest non-goals

Every one of the 49 AI Elements components has a public verdict, and every out-of-scope component names an alternative.

### Acceptance Criteria

- ☐ **AC-1** — Developer can read a per-component porting verdict stating whether it ships at parity, adapted, substituted, or not at all, together with the reason.
- ☐ **AC-2** — Developer can find a named mobile alternative for every component marked out of scope.
- ☐ **AC-3** — Developer arriving from AI Elements on the web can look up a component by its web name and find its mobile counterpart or its documented absence.
- ☐ **AC-4** — Maintainer can show that all 49 AI Elements components carry a verdict with no component left unaddressed.

---

## UC-REG-04: Storybook demonstrates every component and every state

A Storybook running BOTH on device (@storybook/react-native) and on web (@storybook/react-native-web-vite) from one set of story files, proving each component in loading, empty, error and populated states. The device build is the sign-off gate.

### Acceptance Criteria

- ☐ **AC-1** — Developer can open Storybook on an iOS simulator and an Android emulator and see every shipped component with interactive controls for its props.
- ☐ **AC-2** — Developer can open the same story set in a web browser and see every shipped component render through react-native-web.
- ☐ **AC-3** — Developer can see each component demonstrated in its loading, empty, error, and populated states.
- ☐ **AC-4** — Design-system owner can switch Storybook to a custom token set and confirm every component tracks it in both light and dark mode.
- ☐ **AC-5** — Maintainer can show that no component is marked done on the strength of a web story alone — every completion cites an on-device story.

---


## UC-REG-05: RNR is a declared, checkable peer dependency

`react-native-reusables` is a prerequisite, not a bundled copy. Every RNR primitive a
component uses is resolved through the *consumer's* own `@/components/ui/*` alias, so a
token edit in the consumer's theme reaches our components and theirs at the same time. That
is the whole reason this library is a registry rather than an npm package — and it means
the prerequisite has to be declared, discoverable, and enforced rather than assumed.

The measured surface: 14 distinct RNR items (`text`, `icon`, `button`, `badge`,
`collapsible`, `card`, `avatar`, `native-only-animated-view`, `progress`, `separator`,
`input`, `popover`, `dropdown-menu`, `switch`) plus RNR's `lib/utils`.

### Acceptance Criteria

- ☐ **AC-1** — Developer can read, on any shipped item, the exact list of RNR items it requires, and install those RNR items in the same CLI run that installs the component.
- ☐ **AC-2** — Developer installing into an Expo app that has not been initialized for RNR is told which prerequisite is missing at install time, rather than discovering it as a module-not-found error at build time.
- ☐ **AC-3** — Maintainer can show that no shipped file contains a copied or forked RNR primitive; every RNR primitive is reached through the consumer's own alias.
- ☐ **AC-4** — Maintainer can run a CI job that installs the entire registry into a clean, freshly initialized Expo application and typechecks it, for both styling engines.
- ☐ **AC-5** — Developer can find, in one place, the minimum supported `react-native-reusables` version and the `@rn-primitives` versions the created items require, and CI fails when the shipped set stops resolving against them.

---

## UC-REG-06: Versioned public distribution

Registry URLs are the product's install surface. Today they point at a repository default
branch, which means an install is not reproducible and a rename breaks every published
link. A consumer needs a URL that survives a branch move, an engine choice they make at
install time, and a version they can pin.

### Acceptance Criteria

- ☐ **AC-1** — Developer can install any shipped item from a stable public URL that does not change when the repository's default branch is renamed or moved.
- ☐ **AC-2** — Developer can choose the styling engine at install time and receive the matching item tree, with the two engine trees at parity item for item.
- ☐ **AC-3** — Developer can pin a released version, reinstall it later, and receive byte-identical files.
- ☐ **AC-4** — Maintainer can publish a release whose registry output is a deterministic rebuild of the source tree, proven by CI diffing a fresh build against the committed tree.
- ☐ **AC-5** — Developer can open one install page that lists every shipped item with its required RNR items, its native peer dependencies, and its porting verdict.

---
