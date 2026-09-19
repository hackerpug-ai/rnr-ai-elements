const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind (Tailwind v3) engine. `input` makes Metro compile global.css; inlineRem: 16
// makes rem-derived sizes match web.
module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
