# FIX-ORI-RN-003-1 — RED/GREEN evidence

One dependency line added to `packages/docs-snippets/nativewind/package.json`:

```diff
     "react-native": "0.86.3",
+    "react-native-css-interop": "0.2.6",
     "react-native-gesture-handler": "~2.32.0",
```

## The defect (confirmed RED)

`nativewind@4.2.6` declares `react-native-css-interop@0.2.6` as a hard dependency, but
pnpm's isolated linker nests it under
`.pnpm/nativewind@4.2.6_…/node_modules/react-native-css-interop` and never hoists it to the
consumer root. `babel.config.js` sets `jsxImportSource: 'nativewind'`, so babel injects
`import 'react-native-css-interop/jsx-runtime'` into every JSX file; Metro cannot resolve
that import from app files.

## Proof (real bundling, not a mock)

Consumer preparation mirrors `tests/sprint-05-orient-search/support/quickstart-consumer.ts`
(as exercised by ORI-RN-003): copy the committed nativewind template files OUTSIDE the
monorepo into an `os.tmpdir()`-derived dir, run the verbatim
`packages/docs-snippets/commands/nativewind.sh` recipe with `cwd = the copy`, overlay
`app/index.tsx` + the shared quickstart screen, then bundle with Metro.

### RED — `cycle-1/red/`

- consumer root: `$(cat red-consumer-path.txt)`
- recipe exit 0; `npx expo export --platform web` exit **1**
- `Error: Unable to resolve module react-native-css-interop/jsx-runtime from …/app/index.tsx:
  react-native-css-interop/jsx-runtime could not be found within the project or in these
  directories: node_modules`
- css-interop NOT hoisted (only present nested under `.pnpm/nativewind@4.2.6_…/node_modules/`)
- byte-identical to ORI-RN-003's recorded web-leg failure.

### GREEN — `cycle-1/green/`

- consumer root: `$(cat green-consumer-path.txt)`
- recipe exit 0; `npx expo export --platform web` exit **0**
- `Web Bundled … 3083 modules`, `Exported: …/green/dist` — no css-interop diagnostic
- `react-native-css-interop` hoisted to the consumer root at **0.2.6** (not 0.2.7)

## Control / invariants

- `packages/docs-snippets/uniwind/package.json` — byte-unchanged (`git diff` empty)
- repo-root `pnpm-lock.yaml` — byte-unchanged (the template is not a workspace member)
- `git diff --name-only` lists only `packages/docs-snippets/nativewind/package.json`
- `pnpm install --frozen-lockfile` clean · `pnpm typecheck` clean · `pnpm lint` clean
