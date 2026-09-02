import '../src/global.css';

import type { Preview } from '@storybook/react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Uniwind } from 'uniwind';

/**
 * On-device preview. The Engine toolbar item from the web config has no equivalent here —
 * on device the engine is whichever package you launched, and there is no second server to
 * navigate to. Theme remains a real runtime global.
 */
const preview: Preview = {
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals as { theme: 'light' | 'dark' }).theme ?? 'light';
      useEffect(() => {
        Uniwind.setTheme(theme);
      }, [theme]);
      return (
        <View className="flex-1 bg-background p-4">
          <Story />
        </View>
      );
    },
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
  },
};

export default preview;
