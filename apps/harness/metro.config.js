const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { ENGINE, UI_DIR, CSS_ENTRY } = require('./engine.config');

const config = getDefaultConfig(__dirname);

// Point @/components/ui at the engine's own RNR tree. This mirrors exactly what the
// registry build script does when it fans one source out to both variants: rewrite the
// path segment, change nothing else.
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@/components/ui' || moduleName.startsWith('@/components/ui/')) {
    const rest = moduleName.slice('@/components/ui'.length);
    const remapped = path.join(__dirname, 'src', UI_DIR[ENGINE] + rest);
    return context.resolveRequest(context, remapped, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

if (ENGINE === 'nativewind') {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, { input: CSS_ENTRY.nativewind });
} else {
  const { withUniwindConfig } = require('uniwind/metro');
  // withUniwindConfig must be the OUTERMOST wrapper and cssEntryFile must be a
  // relative path string — both required by docs.uniwind.dev/quickstart.
  module.exports = withUniwindConfig(config, {
    cssEntryFile: CSS_ENTRY.uniwind,
    dtsFile: './src/uniwind-types.d.ts',
  });
}
