---
title: 'Update installed items'
description: 'Re-run the absolute-URL add command to bring installed items back in sync with the registry, and answer the CLI overwrite prompt on purpose.'
section: 'guides'
order: 2
---

This guide shows you how to bring items you already installed back in sync with the registry. Updating is re-adding: you run the same absolute-URL add command again, and you answer one prompt per changed file.

## Prerequisites

Before you start:

- At least one item installed through the CLI. [Installation](/docs/installation) covers the first install.
- A terminal at your project root.
- The absolute URL of the item you installed. The [CLI](/docs/cli) page describes the URL contract; every item page carries the command for your engine.

## Re-add the item

1. Open a terminal at your project root. You should see your project's `package.json` in the current directory.
2. Re-run the add command with the same absolute URL you installed with. The two forms for the item registry entry in the nativewind engine tree:

```sh
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/item.json
npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/item.json --overwrite
```

   For the uniwind engine tree, the URL carries `uniwind` in the path: `https://rnraielements.com/r/uniwind/item.json`.

3. Read the CLI's output. Each file the item owns lands in one of three states:
   - A file identical to its registry copy is skipped, and the CLI prints `Skipped N files`.
   - A file you edited locally prompts: `The file <name> already exists. Would you like to overwrite? (y/N)`. Answer `y` to take the registry copy, or press Enter to keep your edit.
   - The second command above appends `--overwrite`: differing files update with no prompt, so use it when you want the registry copy back over your edits.
4. Confirm the update. The CLI prints an `Updated … file:` line naming the paths it wrote, and your project still compiles — run your typechecker, for example `pnpm exec tsc --noEmit`.

## What an update touches

The CLI writes the item's own files and installs the peers the item needs. Your screens, your theme tokens, and every other file in your project stay as they are — an update never reaches outside the item's declared paths.

## Next steps

- The URL and destination contract: [CLI](/docs/cli)
- Take over text and markdown rendering: [Customize rendering](/guides/customize-rendering)
