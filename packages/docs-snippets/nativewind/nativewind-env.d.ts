/// <reference types="nativewind/types" />

// NativeWind/Metro compiles CSS imports (via withNativeWind `input`), so TypeScript must
// not reject the side-effect `import '@/global.css'` the root layout makes.
declare module '*.css';
