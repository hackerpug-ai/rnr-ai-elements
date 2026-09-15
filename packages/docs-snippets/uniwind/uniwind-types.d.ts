// NOTE: TypeScript 6 requires the CSS side-effect import declaration to live in a SCRIPT
// (non-module) file — a module file (with `export {}`) does not resolve `import '*.css'`
// (TS2882). On `expo start`, withUniwindConfig regenerates this file to its canonical
// augmentation shape, and the generated expo-env.d.ts carries the CSS declaration instead.
/// <reference types="uniwind/types" />

declare module '*.css';
