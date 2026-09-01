import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

const root = path.resolve(__dirname, '..');
const sharedSrc = path.resolve(root, '../harness/src');

/** NativeWind + Tailwind v3 Storybook. Shares the story files with the uniwind harness. */
const main: StorybookConfig = {
  stories: [`${sharedSrc}/**/*.stories.?(ts|tsx|js|jsx)`],
  addons: [],
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@/components/ui': path.join(sharedSrc, 'components/ui.nativewind'),
      '@/global.css': path.join(root, 'global.css'),
      '@': sharedSrc,
    };
    return config;
  },
};

export default main;
