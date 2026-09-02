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
const REGISTRY_SRC = path.resolve(__dirname, '../../packages/registry/src');
const fsExists = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

config.watchFolders = [...(config.watchFolders ?? []), REGISTRY_SRC];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Registry sources are engine-agnostic and carry a literal {engine} in their import
  // aliases. Resolve them here the way the RNR CLI resolves them on install, so the
  // harness exercises the SAME source the registry ships rather than a copy.
  if (moduleName.startsWith('@/registry/{engine}/')) {
    const rest = moduleName.replace('@/registry/{engine}/', '');
    if (rest.startsWith('components/ui/'))
      return context.resolveRequest(
        context,
        path.join(__dirname, 'src', cfg.uiDir[ENGINE], rest.replace('components/ui/', '')),
        platform,
      );
    if (rest.startsWith('lib/'))
      return context.resolveRequest(context, path.join(__dirname, 'src/lib', rest.replace('lib/', '')), platform);
  }
  if (moduleName.startsWith('@/components/ai/')) {
    return context.resolveRequest(
      context,
      path.join(REGISTRY_SRC, 'components/ai', moduleName.replace('@/components/ai/', '')),
      platform,
    );
  }
  if (moduleName === '@/components/ui' || moduleName.startsWith('@/components/ui/')) {
    const rest = moduleName.slice('@/components/ui'.length);
    // OUR base primitives target components/ui/ deliberately — a consumer edits ONE
    // directory, not two. So resolve registry source first and fall back to RNR's
    // installed tree, which is exactly the shape a consumer's folder has after install.
    const ours = path.join(REGISTRY_SRC, 'components/ui' + rest + '.tsx');
    if (rest && fsExists(ours)) {
      return context.resolveRequest(context, path.join(REGISTRY_SRC, 'components/ui' + rest), platform);
    }
    return context.resolveRequest(
      context,
      path.join(__dirname, 'src', cfg.uiDir[ENGINE] + rest),
      platform,
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

let styled;
if (ENGINE === 'nativewind') {
  const { withNativeWind } = require('nativewind/metro');
  styled = withNativeWind(config, { input: cfg.cssEntry.nativewind });
} else {
  const { withUniwindConfig } = require('uniwind/metro');
  // withUniwindConfig must be the OUTERMOST *engine* wrapper and cssEntryFile must be a
  // relative path string (docs.uniwind.dev/quickstart).
  styled = withUniwindConfig(config, {
    cssEntryFile: cfg.cssEntry.uniwind,
    dtsFile: './src/uniwind-types.d.ts',
  });
}

// Storybook wraps LAST. It only enables story bundling — switching the app entry is the
// job of index.js, because expo-router's "main" would otherwise always win.
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');
module.exports = withStorybook(styled, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
