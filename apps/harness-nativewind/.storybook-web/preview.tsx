import '../global.css';

import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ENGINE, setTheme } from './theme-bridge';

const PORTS = { uniwind: 6006, nativewind: 6007 } as const;

/**
 * TOOLBAR — https://storybook.js.org/docs/essentials/toolbars-and-globals
 *
 *   theme  — a REAL runtime global. Re-renders every story immediately.
 *   engine — NOT runtime-switchable. Uniwind and NativeWind are bundler transforms with
 *            conflicting Tailwind majors (NativeWind 4 needs v3, Uniwind needs v4), so
 *            they live in separate workspace packages on separate ports. Selecting the
 *            other engine hard-refreshes to its server.
 *
 * The item earns its place regardless: without it, nothing on screen tells you which
 * engine rendered a story, and a component broken on one engine would look fine.
 */
const preview: Preview = {
  initialGlobals: { engine: ENGINE, theme: 'light' },
  globalTypes: {
    engine: {
      description: 'Styling engine — build-time; switching reloads the other server',
      toolbar: {
        title: 'Engine',
        icon: 'component',
        dynamicTitle: true,
        items: [
          { value: 'uniwind', title: 'Uniwind · Tailwind v4', right: `:${PORTS.uniwind}` },
          { value: 'nativewind', title: 'NativeWind · Tailwind v3', right: `:${PORTS.nativewind}` },
        ],
      },
    },
    theme: {
      description: 'Color scheme — a real runtime global',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const { engine, theme } = context.globals as {
        engine: keyof typeof PORTS;
        theme: 'light' | 'dark';
      };

      useEffect(() => {
        if (engine === ENGINE || typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        url.port = String(PORTS[engine]);
        window.location.assign(url.toString());
      }, [engine]);

      useEffect(() => setTheme(theme), [theme]);

      return (
        <View className="flex-1 bg-background p-4" style={{ minHeight: 240 }}>
          <Story />
        </View>
      );
    },
  ],
};

export default preview;
