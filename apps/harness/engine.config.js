/**
 * Which styling engine this process is built with.
 *
 * The engine is a BUILD-TIME choice, not a runtime one. Uniwind is a Metro/Vite
 * transform (it peer-depends on metro-transform-worker); NativeWind needs its own
 * babel preset, and Uniwind's migration guide's step 2 is "Remove Nativewind Babel
 * preset". They cannot both process one bundle.
 *
 * So the Storybook toolbar's Engine item does not hot-swap anything — it reports
 * which engine is running and navigates to the other instance, which is why both
 * run on their own port at the same time.
 */
const ENGINE = process.env.ENGINE === 'nativewind' ? 'nativewind' : 'uniwind';

const PORTS = { uniwind: 6006, nativewind: 6007 };

/** RNR components are installed once per engine; the alias picks the tree. */
const UI_DIR = { uniwind: 'components/ui', nativewind: 'components/ui.nativewind' };

const CSS_ENTRY = { uniwind: './src/global.css', nativewind: './src/global.nativewind.css' };

module.exports = { ENGINE, PORTS, UI_DIR, CSS_ENTRY };
