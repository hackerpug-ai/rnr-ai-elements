// This package is nativewind-only by construction: it pins Tailwind v3, which Uniwind
// cannot use. The shared toolbar reads ENGINE to label itself and to know where to send
// you when you pick the other engine.
module.exports = {
  ENGINE: 'nativewind',
  PORTS: { uniwind: 6006, nativewind: 6007 },
  UI_DIR: { nativewind: 'components/ui.nativewind' },
  CSS_ENTRY: { nativewind: './global.css' },
};
