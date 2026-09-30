---
title: 'Re-theme your app'
description: 'Change the tokens your installed items read — fonts, radius, and colors — in the engine tree your project uses, without touching the copied item files.'
section: 'guides'
order: 1
---

This guide shows you how to re-theme your app by editing the theme tokens your installed items read. The item files the CLI wrote stay untouched: every item resolves its colors, radii, and fonts against tokens your app owns.

## Prerequisites

Before you start:

- At least one registry item installed in an Expo project. If you have not installed one yet, follow [Installation](/docs/installation).
- You know which engine tree your project uses. The engine follows your Tailwind major, and [Installation](/docs/installation) shows how to read the engine from your `package.json`.

## Where your tokens live

The token location follows the engine tree:

- Tailwind v4, with tokens declared in a `@theme` block in global CSS, is the uniwind engine tree. Your tokens live in that `@theme` block, usually in `global.css` at the project root.
- NativeWind 4.2.6 — Tailwind v3, with styles configured through a tailwind.config.js file — is the nativewind engine tree. Your tokens are the CSS variables that the config maps utility classes onto.

For the complete token map, read [Theming](/docs/theming). This guide changes tokens; that page is the reference for what each token controls.

## Change the radius or a font (uniwind engine tree)

The example app declares its fonts and base radius at the top of the `@theme` block in `apps/example/global.css`:

```css
@theme {
  --font-sans: 'Spline Sans', Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --radius: 0.625rem;
```

1. Open `global.css` at your project root and find the `@theme` block. You should see your font and radius tokens at the top of the block.
2. Change one value — for example, raise `--radius` from `0.625rem` to `1rem` — and save the file.
3. Reload your app. The change appears wherever the token is read, and no item file moves: if your project is under version control, `git diff` shows only your `global.css` line.

## Change a color (uniwind engine tree)

Every status color in the example app is an oklch value in the same `@theme` block, each with a comment naming the item and file that reads it:

```css
  --color-green-500: oklch(0.723 0.219 149.579); /* tool, lib/status.ts success dark twin */
  --color-green-600: oklch(0.627 0.194 149.214); /* tool, lib/status.ts success */
  --color-orange-500: oklch(0.705 0.213 47.604); /* tool, lib/status.ts denied-in-dark */
  --color-orange-600: oklch(0.646 0.222 41.116); /* tool, lib/status.ts denied */
  --color-yellow-400: oklch(0.852 0.199 91.936); /* tool, tool.logic.ts approval-requested dark twin */
  --color-yellow-600: oklch(0.681 0.162 75.834); /* tool, tool.logic.ts approval-requested */
  --color-blue-400: oklch(0.707 0.165 254.624); /* tool, tool.logic.ts approval-responded dark twin */
  --color-blue-600: oklch(0.546 0.245 262.881); /* tool, tool.logic.ts approval-responded */
  --color-red-500: oklch(0.637 0.237 25.331); /* icon (RNR primitive), icon.tsx JSDoc example */
```

1. Pick the `--color-…` token your screen reads. The tool item's success tone, for example, comes from the green pair: `lib/status.ts` writes `text-green-600 dark:text-green-500`.
2. Replace the oklch value with yours and save the file.
3. Reload your app. The class that reads the token — `text-green-600` in the example — now resolves to your value, in both scheme variants when you change the pair together.

## Change a color (nativewind engine tree)

In the nativewind engine tree, tailwind.config.js maps each utility class onto a CSS variable. The committed consumer keeps this mapping:

```js
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) + 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
```

1. Open `tailwind.config.js` and read the `colors` block. Each entry names the class and the variable it resolves to, such as `hsl(var(--primary))`.
2. Open the stylesheet that defines those variables — the consumer keeps them as bare HSL triplets under `:root` in `global.css` — and change the triplet of the token you want to move.
3. Reload your app. Every class mapped onto that variable resolves to your new value.

## Next steps

- The token reference: [Theming](/docs/theming)
- Light and dark on your terms: [Dark mode](/docs/dark-mode)
- Bring items back in sync later: [Update installed items](/guides/update-installed-items)
