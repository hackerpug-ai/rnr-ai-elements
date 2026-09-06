const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// withUniwindConfig must be the OUTERMOST engine wrapper and cssEntryFile must be a
// relative path string (docs.uniwind.dev/quickstart). This app is a plain consumer:
// no watchFolders into the registry package, no alias rewriting — everything it renders
// must exist inside this package's own tree, installed by the RNR CLI.
module.exports = withUniwindConfig(config, {
  cssEntryFile: './global.css',
  dtsFile: './uniwind-types.d.ts',
});
