/**
 * seam-map — THE one build-time seam derivation (REF-004). A pure module (not
 * .astro frontmatter) so vitest and the item pages import the same function.
 *
 * Detection is a source-text scan over the prebuild sourceFiles shape
 * {filename, text} — never a hand-curated item list. An item carries a seam
 * because its own sources mention the marker, nothing else:
 * - textclasscontext: the TextClassContext provider (React Native has no
 *   style cascade, so parents publish class strings through it).
 * - rendermarkdown: the injected renderMarkdown seam over the
 *   react-native-enriched-markdown native module.
 *
 * SEAM_LINK_TARGETS is the SINGLE retarget point: sprint-06 (GBC-001) points
 * both values at the customize-rendering guide's anchored sections — change
 * them here again in one edit, no consumer changes.
 */

/** The two real seams — exactly these kinds exist, in deterministic order. */
export type SeamKind = 'textclasscontext' | 'rendermarkdown';

export const SEAM_KINDS = [
  'textclasscontext',
  'rendermarkdown',
] as const satisfies readonly SeamKind[];

/** The prebuild registry-items-v1 sourceFiles entry shape. */
export type SeamSourceFile = { filename: string; text: string };

const SEAM_DETECTORS: readonly { kind: SeamKind; marker: RegExp }[] = [
  { kind: 'rendermarkdown', marker: /rendermarkdown|enriched-markdown/i },
  { kind: 'textclasscontext', marker: /TextClassContext/ },
];

/**
 * Derive an item's seams from its sourceFiles text. Pure: no I/O, no side
 * effects; returns kinds in SEAM_KINDS order, each at most once, and an
 * empty array when no source mentions any marker.
 */
export function deriveSeams(sourceFiles: readonly SeamSourceFile[]): SeamKind[] {
  const hits = new Set<SeamKind>();
  for (const file of sourceFiles) {
    for (const { kind, marker } of SEAM_DETECTORS) {
      if (marker.test(file.text)) {
        hits.add(kind);
      }
    }
  }
  return SEAM_KINDS.filter((kind) => hits.has(kind));
}

/** Where each seam's how-to section lives — the customize-rendering guide (GBC-001). */
export const SEAM_LINK_TARGETS: Record<SeamKind, string> = {
  textclasscontext: '/guides/customize-rendering#textclasscontext',
  rendermarkdown: '/guides/customize-rendering#rendermarkdown',
};
