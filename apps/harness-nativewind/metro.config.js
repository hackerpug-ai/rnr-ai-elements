const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const sharedSrc = path.resolve(projectRoot, '../harness/src');
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// This package exists only because NativeWind 4 requires Tailwind v3 while Uniwind
// requires v4 — two majors that cannot live in one package. pnpm resolves them per
// package (harness 4.3.3, harness-nativewind 3.4.19), so each engine gets a real,
// stable install and the Storybook toolbar can hard-refresh between the two servers.
//
// The SOURCE is shared: this package watches ../harness/src and only redirects
// @/components/ui to the nativewind component tree. That redirect is the same
// substitution the registry build script makes when fanning one source into two variants.
config.watchFolders = [sharedSrc, workspaceRoot];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@/components/ui' || moduleName.startsWith('@/components/ui/')) {
    const rest = moduleName.slice('@/components/ui'.length);
    return context.resolveRequest(context, path.join(sharedSrc, 'components/ui.nativewind' + rest), platform);
  }
  if (moduleName === '@/global.css') {
    return context.resolveRequest(context, path.join(projectRoot, 'global.css'), platform);
  }
  if (moduleName.startsWith('@/')) {
    return context.resolveRequest(context, path.join(sharedSrc, moduleName.slice(2)), platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
