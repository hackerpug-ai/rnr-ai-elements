import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Pure ESM. import.meta.dirname, not __dirname — Storybook loads this as an ES module.
const root = path.resolve(import.meta.dirname, '..');
const sharedSrc = path.resolve(root, '../harness/src');
const cfg = JSON.parse(readFileSync(path.join(root, 'engine.config.json'), 'utf8')) as {
  uiDir: Record<string, string>;
};

/**
 * NativeWind + Tailwind v3 Storybook. Shares story files and screens with the uniwind
 * harness; only @/components/ui is redirected to the nativewind component tree.
 */
const main: StorybookConfig = {
  stories: [`${sharedSrc}/**/*.stories.?(ts|tsx|js|jsx)`],
  addons: [],
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@/components/ui': path.join(sharedSrc, cfg.uiDir.nativewind),
      '@/global.css': path.join(root, 'global.css'),
      '@': sharedSrc,
    };
    return config;
  },
};

export default main;
