/**
 * E2E id contract — the ONLY place Maestro selector ids are spelled.
 *
 * Every selector the locked e2e flows select on (`id:` in .maestro/) must come from
 * this map and be applied under apps/example/app/. Key and value are the same string,
 * verbatim: the names are pinned by the sprint's locked flow specs and
 * .spec/e2e-policy/surface.json, so renaming a key here is a compile error at every
 * usage site instead of a silently dead selector.
 *
 * CLI-installed components (apps/example/components/ai/**) are never edited to carry
 * ids: pass testID through their existing spread props or wrap them in an app-owned
 * View. React Native maps testID to accessibilityIdentifier on iOS and resource-id on
 * Android, so one map serves both platforms with no per-platform branch.
 */
const IDS = Object.freeze({
  'app-header': 'app-header',
  'transcript-message-0': 'transcript-message-0',
  'tool-badge-completed': 'tool-badge-completed',
  'context-trigger': 'context-trigger',
  'context-popover-content': 'context-popover-content',
  'composer-send': 'composer-send',
} as const satisfies Record<string, string>);

// Object.freeze alone fails SILENTLY on a sloppy-mode write (the contract's verify
// command runs under `node -e`, which is sloppy), so the set trap turns any mutation —
// assignment, redefinition, deletion — into a thrown TypeError in every runtime.
export const E2E_IDS: typeof IDS = new Proxy(IDS, {
  set: () => {
    throw new TypeError(
      'E2E_IDS is frozen — e2e ids are a contract; change the caller, not the map',
    );
  },
  deleteProperty: () => {
    throw new TypeError(
      'E2E_IDS is frozen — e2e ids are a contract; change the caller, not the map',
    );
  },
});
