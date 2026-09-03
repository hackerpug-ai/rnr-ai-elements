/**
 * Attachments — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of sources.logic.ts for why component files themselves cannot load under
 * Node).
 *
 * AttachmentData is the data-schema doc's own shape (11-technical-requirements/
 * 03-data-schema.md), declared locally per message.tsx precedent — the registry is
 * stateless about the model and takes no runtime dependency on any SDK. It is
 * deliberately narrower than the web original's FileUIPart | SourceDocumentUIPart
 * union: `sources` are their own component in this registry, so the source-document
 * variant (and upstream's `source` media category, which exists only to serve it) has
 * no carrier here.
 *
 * The per-file upload state is an RN ADDITION over the web original, declared: a
 * desktop drag-and-drop lands instantly, but a phone upload takes visible seconds, and
 * a chip that looks complete while its bytes are still in flight is lying. UC-CHAT-03
 * AC-3 makes the chip removable "before sending", which is exactly the uploading window.
 * The caller owns the lifecycle (queue precedent — caller state, caller mutations);
 * this is only the display seam for it.
 */

/** The data-schema doc's attachment shape — what prompt-input and attachments exchange. */
export type AttachmentData = {
  id: string;
  name: string;
  mimeType: string;
  uri?: string;
  sizeBytes?: number;
};

/** The caller-owned transport lifecycle of one file, rendered by the chip. */
export type AttachmentState = 'uploading' | 'done' | 'error';

/** Upstream's media categories minus `source` — no source-document variant exists here. */
export type AttachmentMediaCategory = 'image' | 'video' | 'audio' | 'document' | 'unknown';

export const ATTACHMENT_VARIANTS = ['grid', 'inline', 'list'] as const;

export type AttachmentVariant = (typeof ATTACHMENT_VARIANTS)[number];

/**
 * The preview affordance for a mimeType — the data-schema doc names this exact
 * function, pure and Vitest-testable. Same prefix ladder as the web original's
 * getMediaCategory, reading `mimeType` directly instead of a part object.
 * No-throw: an empty or unrecognized type degrades to `unknown` (the paperclip),
 * which is the web original's own fallback.
 */
export function getMediaCategory(mimeType: string): AttachmentMediaCategory {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) return 'document';
  return 'unknown';
}

/**
 * The chip's display label — the web original's getAttachmentLabel with the field
 * renames the data-schema shape dictates (`name` for `filename`). A file with no name
 * falls back to "Image" when it is one, "Attachment" otherwise, byte-verbatim.
 */
export function getAttachmentLabel(
  data: Pick<AttachmentData, 'name' | 'mimeType'>,
): string {
  if (data.name) return data.name;
  return getMediaCategory(data.mimeType) === 'image' ? 'Image' : 'Attachment';
}

/**
 * The one-line state label, or undefined for `done` — a finished upload needs no
 * announcement; the chip itself is the proof. Uploading and failing DO (color is never
 * the sole channel — lib/status.ts rule 1).
 */
export function attachmentStateLabel(state: AttachmentState): string | undefined {
  if (state === 'uploading') return 'Uploading';
  if (state === 'error') return 'Upload failed';
  return undefined;
}

/**
 * A human byte size for the chip's meta line — the data-schema shape carries
 * `sizeBytes` and a file chip without its size is opaque on a phone. 1024-based, one
 * decimal under 10 of a unit, none above. Undefined when the caller supplied no size:
 * a missing measurement renders as nothing, never as "0 B".
 */
export function formatAttachmentSize(sizeBytes: number | undefined): string | undefined {
  if (sizeBytes === undefined || Number.isNaN(sizeBytes)) return undefined;
  if (sizeBytes < 1024) return `${Math.round(sizeBytes)} B`;
  if (sizeBytes < 1024 ** 2) {
    const kb = sizeBytes / 1024;
    return `${kb < 10 ? Math.round(kb * 10) / 10 : Math.round(kb)} KB`;
  }
  const mb = sizeBytes / 1024 ** 2;
  return `${mb < 10 ? Math.round(mb * 10) / 10 : Math.round(mb)} MB`;
}
