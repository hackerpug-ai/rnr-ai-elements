---
id: rnr-dual-engine-registry
name: RNR Dual-Engine Registry (NativeWind + Uniwind)
appliesTo:
  platforms: [mobile-ios, mobile-android, web-mobile, web-desktop]
  frameworks: [react-native, expo]
  styleSystem: [nativewind, uniwind]
  componentLibrary: react-native-reusables
source: researched
canonicalDocs: https://docs.uniwind.dev/quickstart
supportingDocs:
  - https://docs.uniwind.dev/api/metro-config
  - https://docs.uniwind.dev/theming/basics
  - https://uniwind.dev/
lastUpdated: 2026-09-01
---

# RNR Dual-Engine Registry — Styling Contract

**This registry ships BOTH engine variants, exactly as React Native Reusables does
(32/32 parity).** That is possible cheaply because of a measured fact: across RNR's own
`button`, `text`, `card`, `badge` and `icon`, the nativewind and uniwind sources differ only
by an import-path segment and prettier line-wrapping — 125 class tokens are identical, there
are zero nativewind-only classes, and the only two uniwind-only classes (`size-4`, `size-5`)
sit in `icon.tsx`, the single file carrying real engine code (`cssInterop` vs `withUniwind`).

**We never write that file.** `Icon` is RNR's, consumed through `registryDependencies`. So
our component source is *engine-agnostic*, and the build fans it out into
`src/nativewind/**` and `src/uniwind/**` by rewriting two things: the import alias segment
(`@/registry/{engine}/…`) and the `registryDependencies` URL segment
(`reactnativereusables.com/r/{engine}/…`). No component logic changes.

The rule that keeps this true is a forbidden pattern below: **no engine-specific API may
appear in registry source.** The moment a component calls `cssInterop` or `withUniwind`
directly, dual-emit stops being a path rewrite and becomes two codebases.

Uniwind is a drop-in replacement for NativeWind: the same `className` API on React Native
primitives, compiled at build time by a Metro (or Vite) transform. It differs in the layer
this contract cares most about — **Tailwind v4 CSS-first configuration**. There is no
`tailwind.config.js`. Tokens live in an `@theme` block in a CSS entry file, and Uniwind
pre-registers `light`, `dark`, and `system` themes with **no ThemeProvider**.

This contract governs a **copy-paste component registry**, not an application. That inverts
the usual token rule and is the load-bearing clause below: **this library declares no tokens
at all.** It only consumes utilities that resolve against whatever `@theme` the *consumer*
already has. A token this library declares is a token the consumer must add by hand — the
RNR CLI copies component files and registry dependencies, it does not merge theme blocks —
and an unresolved `--color-*` renders as nothing with no error.

## Emit method

**How:** `utility-classes-via-className`

Tailwind utilities on `className`, merged with RNR's `cn()` imported from the consumer's
`@/lib/utils`. Variants are `cva`, composed in RNR's exact precedence
`cn(variants, contextClass, className)` so a caller's `className` always wins.

```tsx
// ✓ correct
import { View } from 'react-native';
import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export function ToolCard({ className, children, ...props }) {
  return (
    <TextClassContext.Provider value="text-sm text-muted-foreground">
      <View className={cn('rounded-md border border-border bg-muted/50 p-3 gap-2', className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  );
}
```

```tsx
// ✗ wrong — a token this library invents; the consumer never adds it, Tailwind drops it silently
<View className="bg-reasoning border-tool-pending">…

// ✗ wrong — inline static literal, bypasses the theme entirely
<View style={{ padding: 12, backgroundColor: '#18181b' }}>…

// ✗ wrong — a raw Lucide element; className is ignored with no error under withUniwind
<WrenchIcon className="size-4 text-muted-foreground" />
// ✓ right
<Icon as={WrenchIcon} className="size-4 text-muted-foreground" size={16} />
```

## File placement

**Rule:** `colocated`

Styles live on elements via `className`. The registry ships **no** CSS file, no `@theme`
block, no `tailwind.config.js`, and no theme module.

- **Allowed:** `packages/registry/src/**/*.{tsx,ts}`, `apps/example/**/*.{tsx,ts}`
- **Forbidden:** any `*.css` under `packages/registry/**`; any `styles/**` module exporting
  `StyleSheet.create`; any `theme.ts` / `NAV_THEME` in the registry.

The example app and Storybook may own a `global.css` — they are consumers, not the library.

## Token binding

**Mechanism:** `consumer-theme-via-engine-transform` (NativeWind or Uniwind)

The whole chain, end to end, with this library owning none of it:

```
consumer's global.css   ← the ONLY declaration site, in whichever shape their engine uses
        │   uniwind    →  @theme { --color-primary: oklch(...) } + @variant dark
        │   nativewind →  :root { --primary: <hsl triplet> } + .dark:root  (+ tailwind.config.ts)
        ▼
the consumer's engine transform, whichever they run:
        │   uniwind path    →  withUniwindConfig(config, { cssEntryFile, dtsFile })
        │                      (must be the OUTERMOST Metro wrapper; cssEntryFile relative)
        │   nativewind path →  withNativeWind(config, { input }) + tailwind.config.ts
        ▼
compiled class-to-style map in the CONSUMER's bundle
        ▼
`bg-primary` in a .tsx the RNR CLI copied out of this registry   ← resolves, with no wiring
```

Roles consumed: `background` `foreground` `card` `popover` `primary` `secondary` `muted`
`accent` `destructive` `border` `input` `ring`, plus `rounded-sm/md/lg` derived from
`--radius`. New states are expressed with **opacity modifiers on existing roles**
(`bg-muted/50`, `bg-primary/20`, `dark:bg-input/30`) exactly as RNR does — never a new role.

Dark mode is the consumer's `@variant dark` plus Uniwind's pre-registered themes. This
library emits no `useColorScheme` branch and holds no scheme state.

## Distinctness rule (project-specific, load-bearing)

AI surfaces must read as distinct from ordinary app chrome. That distinctness comes from
**composition only**:

- **Permitted:** borders, rails, dividers, icons, disclosure affordances, spacing, elevation,
  existing roles with opacity modifiers, and the three status colors — `text-destructive`
  for error plus Tailwind's built-in `green-600` / `orange-600` for success and denial,
  which need no `@theme` entry because Tailwind ships the default palette. Confine those
  three to one exported `statusColor` map so they are auditable in a single file.
- **Forbidden:** any new `--color-*`, `--radius-*`, `--spacing-*` this library requires the
  consumer to add. That edit is invisible to the RNR CLI and silently broken when omitted.

## Forbidden patterns

- **A theme declaration shipped from the registry** — a `.css` file, an `@theme` block, or a
  `tailwind.config.js` under `packages/registry/`. *Rationale:* two sources of truth; the
  last one loaded silently wins.
- **An invented token** — a utility naming a role RNR does not define. *Rationale:* Tailwind
  drops unknown utilities without warning, so it renders correctly in our example app (which
  defines it) and unstyled on the consumer's machine.
- **Hardcoded color literals** — `#rrggbb`, `rgb(`, `hsl(`, `oklch(`, named colors.
  *Rationale:* never re-themes. This is the exact defect in the prior art's
  `DARK_MARKDOWN_STYLE`.
- **Inline static `style={{}}` literals** for color, spacing, radius, or layout.
  *Rationale:* bypasses the theme. Dynamic computed values merged via `style={[…]}` are fine.
- **Central stylesheet modules** exporting `StyleSheet.create` for reuse across components.
- **A local `cn` / `clsx` copy** instead of importing the consumer's `@/lib/utils`.
  *Rationale:* tailwind-merge stops deduping against the consumer's config and a caller's
  `className` quietly stops winning over our variants.
- **A raw `lucide-react-native` element** used as JSX instead of `<Icon as={...} />`.
  *Rationale:* `className` is ignored with no error under `withUniwind`; that one icon
  freezes at its default color while its neighbours re-theme.
- **NativeWind-path constructs in the Uniwind emit** — `hairlineWidth()`, `hsl(var(--token))`, `inlineRem`,
  `.dark:root`, `tailwindcss-animate`, `tailwind.config.js`. *Rationale:* Tailwind v3 /
  NativeWind idioms that are inert or wrong on the Uniwind + Tailwind v4 path, and they fail
  silently — a borderless card, a theme that never applies.
- **`hover:` with no `active:` twin.** *Rationale:* renders identically at rest and is dead
  under a thumb; passes every screenshot review.
- **`h-11` / `h-12` / `min-h-[44px]` on a Pressable** outside RNR's own `size="lg"`.
  *Rationale:* RNR's mobile control is `h-10`; a taller chat button is the visible tell that
  a second library drew it. Reach 44pt with `hitSlop`, which changes no pixel.

## Verify checklist (component level)

- Styles applied via `className` utilities; no `StyleSheet`, no static inline literals.
- Every color, radius and spacing value traces to an RNR role or the Tailwind default scale.
- No `.css`, `@theme`, or theme module anywhere under `packages/registry/`.
- `cn` imported from `@/lib/utils`; variant order is `cn(variants, contextClass, className)`.
- Every icon goes through `<Icon as={...} />`; every string is inside `<Text>`.
- Web-only utilities (`hover:`, `focus-visible:`, `transition-*`) sit inside
  `Platform.select({ web })` and each `hover:` has a base `active:` twin.
- Containers with a text intent publish via `TextClassContext.Provider` — there is no cascade.
- The palette-flip proof passes: swap the consumer's `@theme`, rebuild, every pixel moves.

## Checks

```json
{
  "forbiddenPatterns": [
    {
      "id": "registry-ships-a-theme",
      "mode": "path",
      "glob": ["packages/registry/**/*.css", "packages/registry/**/tailwind.config.{js,ts,cjs,mjs}", "packages/registry/**/{theme,nav-theme}.{ts,tsx}"],
      "regex": ".",
      "rationale": "The registry must declare no tokens. A theme file here becomes a second source of truth and the last one loaded silently wins."
    },
    {
      "id": "hardcoded-color-literals",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.{tsx,ts}"],
      "regex": "#[0-9a-fA-F]{8}\\b|#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b|\\brgba?\\(|\\bhsla?\\(|\\boklch\\(",
      "rationale": "A hardcoded color never re-themes and fails with no error. This is the exact defect in the prior art's DARK_MARKDOWN_STYLE constant."
    },
    {
      "id": "inline-static-style-literal",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.tsx"],
      "regex": "style=\\{\\{[^}]*(backgroundColor|borderColor|borderRadius|color|fontSize|padding|margin|flex)\\s*:",
      "rationale": "Inline static style literals bypass Uniwind utilities and the consumer's theme; use className."
    },
    {
      "id": "central-stylesheet-module",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.{ts,tsx}"],
      "regex": "StyleSheet\\.create",
      "rationale": "A shared StyleSheet module recreates a parallel styling system that the consumer's tokens cannot reach."
    },
    {
      "id": "local-cn-copy",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.{ts,tsx}"],
      "regex": "export\\s+(function|const)\\s+cn\\b",
      "rationale": "cn must be imported from the consumer's @/lib/utils or tailwind-merge stops deduping against their config and caller className stops winning."
    },
    {
      "id": "raw-lucide-element",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.tsx"],
      "regex": "<[A-Z][A-Za-z0-9]*Icon\\s[^>]*className=",
      "rationale": "A raw Lucide element ignores className with no error under withUniwind. Route every icon through RNR's <Icon as={...} /> wrapper."
    },
    {
      "id": "engine-specific-api-in-source",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.{ts,tsx}"],
      "regex": "\\bcssInterop\\s*\\(|\\bwithUniwind\\s*\\(|from ['\"](nativewind|uniwind)['\"]",
      "rationale": "Registry source must stay engine-agnostic so one tree fans out to both variants by path rewrite alone. RNR's Icon owns the only genuine engine divergence and we consume it rather than writing it."
    },
    {
      "id": "engine-locked-registry-url",
      "mode": "content",
      "glob": ["packages/registry/registry.json", "packages/registry/**/*.json"],
      "regex": "reactnativereusables\\.com/r/(nativewind|uniwind)/",
      "rationale": "Registry dependency URLs must carry the {engine} placeholder and be substituted at build time, or one variant silently depends on the other engine's components."
    },
    {
      "id": "nativewind-path-constructs",
      "mode": "content",
      "glob": ["public/r/uniwind/**/*.json", "packages/registry/**/*.css"],
      "regex": "hairlineWidth\\(|hsl\\(var\\(|inlineRem|\\.dark:root|tailwindcss-animate",
      "rationale": "Tailwind v3 / NativeWind idioms are inert or wrong on the Uniwind + Tailwind v4 emit, and they fail silently. Scoped to the uniwind output because the nativewind emit legitimately uses them."
    },
    {
      "id": "oversized-touch-target",
      "mode": "content",
      "glob": ["packages/registry/src/**/*.tsx"],
      "regex": "className=\"[^\"]*\\b(h-11|h-12|min-h-\\[44px\\])\\b",
      "rationale": "RNR's mobile control is h-10. A taller chat control is the visible tell that a second library drew it; reach 44pt with hitSlop, which changes no pixel."
    }
  ],
  "mustInclude": [
    {
      "id": "utility-class-usage",
      "glob": ["packages/registry/src/**/components/**/*.tsx"],
      "exclude": ["**/index.{ts,tsx}", "**/*.stories.*", "**/*.test.*", "**/*.spec.*"],
      "regex": "className=",
      "description": "Every registry component styles through className utilities."
    },
    {
      "id": "cn-from-consumer-utils",
      "glob": ["packages/registry/src/**/components/**/*.tsx"],
      "exclude": ["**/index.{ts,tsx}", "**/*.stories.*", "**/*.test.*", "**/*.spec.*"],
      "regex": "from ['\"]@/(registry/\\{engine\\}/)?lib/utils['\"]",
      "description": "cn is imported, never redefined locally. Registry SOURCE uses the @/registry/{engine}/lib/utils alias — RNR's own components do the same, and the CLI rewrites it to the consumer's @/lib/utils on install. Both forms satisfy the rule; a local definition does not, and is caught separately by local-cn-copy."
    }
  ]
}
```
