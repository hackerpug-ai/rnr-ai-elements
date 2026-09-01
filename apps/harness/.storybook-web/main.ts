import path from 'node:path';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ENGINE, UI_DIR, CSS_ENTRY } = require('../engine.config');

/**
 * Web Storybook, one instance per engine. The engine is fixed at launch by the ENGINE
 * env var — it selects the Vite plugin, the CSS entry, and which RNR component tree
 * @/components/ui resolves to. Exactly the same substitution the registry build script
 * performs when it fans one source out to both variants.
 */
const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: { pluginReactOptions: { jsxRuntime: 'automatic' } },
  },
  viteFinal: async (config) => {
    const root = path.resolve(__dirname, '..');

    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      // Engine-specific RNR tree first — order matters, the more specific alias wins.
      '@/components/ui': path.join(root, 'src', UI_DIR[ENGINE]),
      '@': path.join(root, 'src'),
    };

    config.plugins = config.plugins ?? [];
    if (ENGINE === 'uniwind') {
      const { uniwind } = await import('uniwind/vite');
      const tailwindcss = (await import('@tailwindcss/vite')).default;
      config.plugins.push(tailwindcss(), uniwind({ cssEntryFile: CSS_ENTRY.uniwind }));
    }
    // NativeWind's web path is handled by react-native-web-vite's babel pipeline plus
    // the postcss config; it needs no extra Vite plugin here.

    return config;
  },
};

export default main;
