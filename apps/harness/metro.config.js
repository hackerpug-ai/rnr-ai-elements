const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Any other Metro wrapper goes INSIDE this call. withUniwindConfig must be the
// outermost wrapper (docs.uniwind.dev/quickstart), and cssEntryFile must be a
// relative path string — not path.resolve(...).
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});
