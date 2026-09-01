import type { Preview } from '@storybook/react';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ENGINE, PORTS } from '../engine.config';

/**
 * TOOLBAR — see https://storybook.js.org/docs/essentials/toolbars-and-globals
 *
 * Two globals, and they behave differently on purpose:
 *
 *   theme  — a REAL runtime global. Changing it re-renders every story immediately.
 *   engine — NOT runtime-switchable. Uniwind and NativeWind are bundler transforms
 *            (Uniwind is a Metro/Vite plugin; NativeWind needs its own babel preset,
 *            and Uniwind's migration guide's step 2 is "Remove Nativewind Babel
 *            preset"). They cannot both process one bundle. So the Engine item reports
 *            which engine THIS instance was built with, and selecting the other one
 *            navigates to its server — which is why both run at once on their own port.
 *
 * The item is still worth having: without it there is no way to tell, looking at a
 * story, which engine rendered it — and a component that only works on one engine
 * would look perfectly fine.
 */
const preview: Preview = {
  initialGlobals: {
    engine: ENGINE,
    theme: 'light',
  },
  globalTypes: {
    engine: {
      description: 'Styling engine (build-time — switching navigates to the other server)',
      toolbar: {
        title: 'Engine',
        icon: 'component',
        dynamicTitle: true,
        items: [
          {
            value: 'uniwind',
            title: 'Uniwind · Tailwind v4',
            right: `:${PORTS.uniwind}`,
            icon: 'lightning',
          },
          {
            value: 'nativewind',
            title: 'NativeWind · Tailwind v3',
            right: `:${PORTS.nativewind}`,
            icon: 'branch',
          },
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
      const { engine, theme } = context.globals as { engine: string; theme: 'light' | 'dark' };

      // Engine: cannot hot-swap. Navigate to the other instance instead of silently
      // doing nothing, which would let someone believe they had switched.
      useEffect(() => {
        if (engine === ENGINE || typeof window === 'undefined') return;
        const target = PORTS[engine as keyof typeof PORTS];
        if (!target) return;
        const url = new URL(window.location.href);
        url.port = String(target);
        window.location.assign(url.toString());
      }, [engine]);

      // Theme: genuinely runtime, and each engine exposes its own mechanism.
      useEffect(() => {
        if (ENGINE === 'uniwind') {
          const { Uniwind } = require('uniwind');
          Uniwind.setTheme(theme);
        } else {
          const { colorScheme } = require('nativewind');
          colorScheme.set(theme);
        }
      }, [theme]);

      return (
        <View className="flex-1 bg-background p-4" style={{ minHeight: 200 }}>
          <Story />
        </View>
      );
    },
  ],
};

export default preview;
