# ORI-RN-003 cycle-2 RED

The pre-FIX failure this cycle closes (nativewind legs blocked at the Metro bundle) is recorded
in cycle-1 under `.tmp/ORI-RN-003/cycle-1/red/nativewind-bundle-red.txt`:

  iOS/Android Bundling failed — Unable to resolve "react-native-css-interop/jsx-runtime"
  from app/index.tsx (and app/_layout.tsx); expo export --platform web failed identically.

Root cause (verified, now fixed on trunk by FIX-ORI-RN-003-1 / 54ac507): the nativewind
template omitted `react-native-css-interop` as a direct dependency, so pnpm's isolated linker
nested it and Metro could not resolve the babel jsxImportSource-injected jsx-runtime import.

Cycle-2 GREEN proves the FIX: re-running the same six-target proof with
`"react-native-css-interop": "0.2.6"` in packages/docs-snippets/nativewind/package.json makes the
nativewind iOS/Android/Web legs pass, completing the matrix alongside the already-green uniwind legs.
