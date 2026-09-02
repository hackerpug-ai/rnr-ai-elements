/**
 * Custom entry point.
 *
 * withStorybook() in metro.config.js enables story BUNDLING but does not change what the
 * app renders — with expo-router, "main": "expo-router/entry" would always load the app
 * and silently ignore the flag. This switch is what actually shows Storybook.
 */
import { registerRootComponent } from 'expo';

if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true') {
  const StorybookUI = require('./.rnstorybook').default;
  registerRootComponent(StorybookUI);
} else {
  require('expo-router/entry');
}
