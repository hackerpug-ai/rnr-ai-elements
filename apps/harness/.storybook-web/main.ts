import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Pure ESM — no require, no createRequire. engine.config.json is plain data so the CJS
// metro config and this ESM config share one source without an interop shim.
const root = path.resolve(import.meta.dirname, '..');
const cfg = JSON.parse(readFileSync(path.join(root, 'engine.config.json'), 'utf8')) as {
  uiDir: Record<string, string>;
};
const ENGINE = process.env.ENGINE === 'nativewind' ? 'nativewind' : 'uniwind';

const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [],
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // More specific alias first — it must win over the bare '@'.
      // web-preview's react-native-webview PEER: the registry source tree takes no
      // dependency on it (same story as the Metro shims), so pin this harness's own
      // Expo-pinned install rather than trusting the fallback walk.
      'react-native-webview': path.join(root, 'node_modules', 'react-native-webview'),
      '@/components/ui': path.join(root, 'src', cfg.uiDir[ENGINE]),
      '@': path.join(root, 'src'),
    };
    if (ENGINE === 'uniwind') {
      // BOTH are required. tailwindcss() compiles the @theme block; uniwind() is what
      // actually turns className into React Native styles. With only the first, stories
      // render as unstyled text — the components mount fine and nothing errors, which is
      // why this has to be checked by looking at a story, not by an HTTP 200.
      const tailwindcss = (await import('@tailwindcss/vite')).default;
      const { uniwind } = await import('uniwind/vite');
      config.plugins = [
        ...(config.plugins ?? []),
        tailwindcss(),
        uniwind({ cssEntryFile: path.join(root, 'src/global.css') }),
      ];
    }
    return config;
  },
};

export default main;
