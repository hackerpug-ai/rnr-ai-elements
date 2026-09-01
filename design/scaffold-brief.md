# Scaffold pre-flight — two conflicts to resolve before installing

Written 2026-09-01. Nothing has been installed. Manifest gates: discover/target/equip passed;
all four platforms have `scaffold: pending`.

## Conflict 1 — the RNR adapter encodes the wrong styling engine

`docs/adapters/react-native-reusables.md` is a real, first-class adapter (12.5 KB) and its
**component** guidance is exactly what this project needs: `npx @react-native-reusables/cli
init`, then pull all components, `components.json` aliases, and a story template.

Its **styling and theming** half is NativeWind + Tailwind v3 throughout:

| Adapter says | This project is |
|---|---|
| `"style": "nativewind"` in `components.json` | `uniwind` |
| `npm install nativewind tailwindcss` | `uniwind` + `tailwindcss@4` |
| CSS variables in HSL without the `hsl()` wrapper | `oklch()` in a Tailwind v4 `@theme` block |
| `theme.ts` mirror with `hsl()` wrapper + `NAV_THEME` | no theme module in the library at all |
| "Replace `.dark` with `.dark:root`" | `@variant dark`; Uniwind pre-registers light/dark/system |

Following the adapter literally would produce a project that **silently does not theme** —
and it would emit three of the eight patterns the researched styling contract hard-fails
(`.dark:root`, `hsl(var(...))`, a `tailwind.config.js`).

This is the same trap the RNR Rosetta KB flags: its own `theming.md` documents the
NativeWind path and is superseded by `MIGRATION.md` v1.1.0 for Uniwind. The adapter is a
snapshot of the older path.

The manifest's `style: uniwind` and the researched contract `uniwind-tailwind4-universal`
(7/7, hard-fail) were resolved later and are more specific. The proposed resolution is to
split the adapter: **components from the adapter, styling and theming from the contract plus
`docs.uniwind.dev`.**

## Conflict 2 — Step 4 would generate a theme this project must not have

Scaffold Step 4 generates a theme from, in precedence order: a token table in the spec, then
design references, then vibe keywords. The RNR adapter supplies a vibe-to-theme mapping
(clean → neutral grays, `--radius: 0.5rem`, and so on).

For this project a generated palette is the wrong artifact. The binding promise is that a
consumer cannot tell which library drew which surface, and the styling contract forbids the
registry declaring any token at all. A theme invented from vibe keywords would be a *fourth*
palette competing with RNR's.

Two things are true at once and the resolution depends on separating them:

- **The registry ships no theme.** Non-negotiable; it is a hard-fail check in the contract.
- **The Storybook and example harness needs one**, because it is a consumer like any other
  app. That harness `global.css` is where an `@theme` block legitimately lives.

The question is what goes in that harness theme: RNR's own published token values (so
Storybook renders exactly what a consuming RNR app renders), or a generated palette.

Taking RNR's own values also makes the palette-flip proof meaningful — flipping *away* from
RNR's defaults to a loud alternate palette is the test, and it only proves something if the
starting point was RNR's real theme.

## What scaffolding actually creates here

The four platforms are **one codebase**. `mobile-ios`, `mobile-android`, `web-mobile` and
`web-desktop` are four render targets of a single universal Expo workspace, not four
projects. Scaffolding the first one creates:

```
package.json (pnpm workspace) · pnpm-workspace.yaml
apps/harness/            Expo 57 + expo-router + Uniwind + Storybook
  global.css             the harness @theme block (a consumer, not the library)
  metro.config.js        withUniwindConfig OUTERMOST, cssEntryFile relative
  components/ui/*        RNR's 32 components, pulled by its CLI
  .storybook/            on-device config
  .storybook-web/        react-native-web config
packages/registry/       the library — ships no theme, no CSS, no tokens
design/goldens/{platform}/
```

The remaining three platforms then reuse that workspace and their theme via the sibling
carry-over path, rather than installing anything again.

---

# Verified from RNR itself (2026-09-01)

Fetched `reactnativereusables.com/r/uniwind/button.json` and `.../text.json`, and inspected
the RNR repo tree. Four facts that settle how customization must work here.

**1. RNR registry items ship NO theme variables.** No `cssVars` key, no `css` key. The
theme lives entirely in the consuming app. Both the `nativewind` and `uniwind` variants ship
only `lib/index.ts` and `lib/utils.ts` — there is no `theme.ts` in the registry at all.
So "our library ships no theme" is not a deviation from RNR; **it is exactly what RNR does.**

**2. `registryDependencies` are absolute URLs.** `button.json` declares
`["https://reactnativereusables.com/r/uniwind/text.json"]`. This is the real, CLI-resolvable
form of the "peer dependency on RNR" that was asked about earlier: our items declare RNR's
registry URLs, and the CLI resolves and installs them. A short name like `"text"` would
resolve against the shadcn **web** registry instead.

**3. Components import consumer aliases, and the CLI rewrites them.** `button.tsx` imports
from `@/registry/uniwind/components/ui/text` and `@/registry/uniwind/lib/utils`; on install
those become the consumer's own paths. It uses `cva`, `cn()`, and `TextClassContext` —
confirming the mechanism our components must ride.

**4. RNR's published customization page is Tailwind v3 + NativeWind.**
`reactnativereusables.com/docs/customization` names four files —
`components.json`, `global.css` (CSS variables under `:root` / `.dark:root`),
`tailwind.config.ts`, and `theme.ts` (HSL mirror + `NAV_THEME`) — and explicitly says to
"replace `.dark` with `.dark:root` for compatibility with Nativewind".

This **corrects** Conflict 1 above. The pixel-perfect RNR adapter is not a stale snapshot;
it matches RNR's current published customization docs. What is actually true is narrower:
RNR *serves* a uniwind registry variant, but its customization documentation has not been
written for it.

## What this means for the request "inherit the same customization RNR does"

The mechanism is already satisfied by the styling contract: ship no tokens, consume the
consumer's roles through `cn` + `cva` + `TextClassContext`, import from their aliases.
That is byte-for-byte RNR's own model.

What is *not* settled is the **file shape** a consumer customizes, and the two options
differ in exactly one way that matters — whether a consumer following RNR's published
customization page ends up matching us or not.

| | Uniwind + Tailwind v4 (currently pinned) | NativeWind + Tailwind v3 (RNR's documented default) |
|---|---|---|
| Consumer edits | `@theme` block, `oklch()`, `@variant dark` | `global.css` `:root`/`.dark:root` + `tailwind.config.ts` + `theme.ts` |
| Matches RNR's customization page | **No** — the page describes v3 | **Yes, exactly** |
| RNR registry variant | `r/uniwind/*` (46 items, verified live) | `r/nativewind/*` |
| pixel-perfect adapter | none → generic + `tools.style_docs` | `react-native-reusables.md` matches it directly |
| pixel-perfect styling contract | `uniwind-tailwind4-universal` (researched, 7/7) | `nativewind-mobile` (shipped built-in) |
| Trade-off | Faster engine, current Tailwind; a consumer following RNR's own docs lands on v3 and mismatches | Maximum customization parity; older Tailwind line, slower engine |

Choosing NativeWind would also dissolve both conflicts in this brief at once: the adapter
would match, and a vetted built-in contract already exists.
