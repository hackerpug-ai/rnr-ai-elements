import type { StorybookConfig } from '@storybook/react-native';

/**
 * ON-DEVICE Storybook. Note the directory: `.rnstorybook`, not `.storybook` — the latter
 * is the web config and @storybook/react-native will not read it.
 *
 * This is the SIGN-OFF GATE. It runs on Metro, the same pipeline `expo export` uses, which
 * is the path already proven to compile RNR's tokens to real values in both schemes on
 * both engines. The web Storybook is for iteration only: react-native-web reproduces
 * neither portal layering, safe-area insets, keyboard behavior, nor native animation
 * timing, so a component can pass every web story and still be wrong on a phone.
 */
const main: StorybookConfig = {
  stories: ['../src/**/*.stories.?(ts|tsx|js|jsx)'],
  // `addons` is deprecated in @storybook/react-native 10 — on-device UI packages move to
  // `deviceAddons`. The pixel-perfect storybook-native adapter still documents `addons`.
  deviceAddons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};

export default main;
