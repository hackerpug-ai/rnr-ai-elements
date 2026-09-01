const fs = require('node:fs');
const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

// engine.config.json is the single source of truth for the engine maps. It is plain data
// so both this CJS file and the ESM Storybook config can read it without interop shims.
const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'engine.config.json'), 'utf8'));
const ENGINE = process.env.ENGINE === 'nativewind' ? 'nativewind' : 'uniwind';

const config = getDefaultConfig(__dirname);

// Point @/components/ui at this engine's RNR tree — the same substitution the registry
// build script makes when fanning one source into two variants.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@/components/ui' || moduleName.startsWith('@/components/ui/')) {
    const rest = moduleName.slice('@/components/ui'.length);
    return context.resolveRequest(
      context,
      path.join(__dirname, 'src', cfg.uiDir[ENGINE] + rest),
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

if (ENGINE === 'nativewind') {
  const { withNativeWind } = require('nativewind/metro');
  module.exports = withNativeWind(config, { input: cfg.cssEntry.nativewind });
} else {
  const { withUniwindConfig } = require('uniwind/metro');
  // Must be the OUTERMOST wrapper; cssEntryFile must be a relative path string.
  module.exports = withUniwindConfig(config, {
    cssEntryFile: cfg.cssEntry.uniwind,
    dtsFile: './src/uniwind-types.d.ts',
  });
}
