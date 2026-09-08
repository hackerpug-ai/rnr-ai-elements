/**
 * PromptInput — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of attachments.logic.ts for why component files themselves cannot load
 * under Node).
 *
 * This is the attachment half of the web original's prompt-input, extracted from the
 * DOM it lived in. Three contracts come across verbatim (behavior spec, validated by
 * prompt-input.test.ts):
 *
 *   1. Validation order is accept → size → count, and only an accept stage that
 *      rejects EVERY file aborts the add. Size drops over-cap files and keeps going;
 *      count caps SILENTLY to remaining capacity and reports only when something was
 *      actually dropped. Web parity, including the asymmetry (accept aborts on
 *      all-rejected, size reports on any-dropped) — the asymmetry is the web's.
 *
 *   2. On submit the record's `id` is stripped — the consumer-facing message carries
 *      content, not internal bookkeeping.
 *
 *   3. The RN divergence, declared: records carry file:// (or content://) URIs from
 *      the native pickers. The web original creates blob: URLs and converts them to
 *      data: URLs on submit; on RN the consumer reads the files, so there is nothing
 *      to convert and nothing to revoke — no URL.createObjectURL, no revokeObjectURL.
 *
 * The pickers themselves are NOT here — this module stays dependency-free. The
 * component owns the expo-image-picker / expo-document-picker calls (recorded as
 * install-time dependencies on the registry item, web-preview/webview precedent).
 * The asset→record mapping for the image-picker family (library AND camera) IS here:
 * both launch paths share it, so the camera kind can only ever produce records the
 * existing validation pipeline already governs.
 */

/** One pending attachment — the composer chip row and the submit message exchange this. */
export type PromptInputAttachmentData = {
  id: string;
  /** MIME type, or '' when the picker could not tell — renders as the generic file chip. */
  mediaType: string;
  filename: string;
  /** A file:// or content:// URI from the native picker. No blob:, no data:. */
  url: string;
  /** Bytes, when the picker measured them. */
  size?: number;
};

/** The consumer-facing file shape inside PromptInputMessage — the `id` is stripped. */
export type PromptInputMessageFile = Omit<PromptInputAttachmentData, 'id'>;

/** The object onSubmit receives — the web original's PromptInputMessage. */
export type PromptInputMessage = { text: string; files: PromptInputMessageFile[] };

/** The web original's onError vocabulary, unchanged. */
export type PromptInputErrorCode = 'max_files' | 'max_file_size' | 'accept';

export type PromptInputError = { code: PromptInputErrorCode; message: string };

/** Which native picker a picker-opening affordance launches. 'camera' is
 * EXPLICIT-KIND ONLY — resolvePickerKind never derives it; the + menu's Camera row
 * asks for the camera by name. */
export type PickerKind = 'media' | 'file' | 'camera';

/**
 * expo-image-picker's asset shape, narrowed to the members the mapping touches — the
 * same interface the registry's ambient boundary declares. Both launch paths (library
 * and camera) map through ONE function so a camera shot produces byte-identical
 * records to a library pick and lands in the SAME validated add() pipeline.
 */
export type ImagePickerAssetShape = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  fileSize: number | null;
};

/** The record-side twin of the web's file-input mapping: uri→url, name→filename,
 * mime→mediaType, size passthrough — with the pickers' nulls collapsed to the record's
 * empties ('' media type, 'Image' fallback, no size). */
export function imageAssetToAttachment(asset: ImagePickerAssetShape): PromptInputAttachmentData {
  return {
    id: makeAttachmentId(),
    mediaType: asset.mimeType ?? '',
    filename: asset.fileName ?? 'Image',
    url: asset.uri,
    size: asset.fileSize ?? undefined,
  };
}

let idCounter = 0;

/** A collision-proof-enough id for records that live in one in-memory array. */
export function makeAttachmentId(): string {
  idCounter += 1;
  return `pi-${Date.now().toString(36)}-${idCounter}`;
}

/**
 * The web file input's accept grammar, narrowed to what the spec pins: a comma list of
 * MIME types with `image/*` wildcards. (The browser's extension forms — ".pdf" — have
 * no native-picker meaning and are not supported.) Case-insensitive on both sides.
 */
export function acceptsMimeType(mediaType: string, accept: string): boolean {
  const needle = mediaType.trim().toLowerCase();
  if (!needle) return false;
  return accept.split(',').some((raw) => {
    const entry = raw.trim().toLowerCase();
    if (!entry) return false;
    if (entry.endsWith('/*')) return needle.startsWith(`${entry.slice(0, -1)}`);
    return needle === entry;
  });
}

/**
 * The paperclip route: 'media' (expo-image-picker) unless accept excludes image/* —
 * a consumer who declared "PDFs only" gets the document picker, and one hidden file
 * input becomes two native pickers.
 */
export function resolvePickerKind(accept?: string): PickerKind {
  if (!accept) return 'media';
  const entries = accept.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (entries.length === 0) return 'media';
  return entries.some((e) => e === 'image/*' || e.startsWith('image/')) ? 'media' : 'file';
}

const filterOut = <T>(
  files: T[],
  keep: (f: T) => boolean,
): { accepted: T[]; rejected: T[] } => {
  const accepted: T[] = [];
  const rejected: T[] = [];
  for (const f of files) (keep(f) ? accepted : rejected).push(f);
  return { accepted, rejected };
};

/**
 * The full pipeline, in the web's order: accept → size → count. Errors come back in
 * stage order; the component fires onError for each (the web's "once per stage"). An
 * all-rejected accept stage short-circuits and nothing later runs.
 */
export function validateAttachments(
  files: PromptInputAttachmentData[],
  opts: {
    accept?: string;
    /** Bytes. Over-cap files drop; the rest continue. */
    maxFileSize?: number;
    /** Total board capacity; the incoming batch caps to what is left. */
    maxFiles?: number;
    /** How many are already attached — remaining capacity is maxFiles − currentCount. */
    currentCount?: number;
  },
): { accepted: PromptInputAttachmentData[]; errors: PromptInputError[] } {
  const errors: PromptInputError[] = [];

  // 1. accept — the aborting stage: every file mismatched means the batch was meant
  //    for a different composer; add nothing, say so once.
  let survivors = files;
  if (opts.accept) {
    const accept_ = opts.accept;
    const { accepted } = filterOut(files, (f) => acceptsMimeType(f.mediaType, accept_));
    if (files.length > 0 && accepted.length === 0) {
      return {
        accepted: [],
        errors: [
          {
            code: 'accept',
            message: 'No files match the accepted types.',
          },
        ],
      };
    }
    survivors = accepted;
  }

  // 2. size — drop and continue: one oversized file must not punish the others.
  if (opts.maxFileSize != null) {
    const { accepted, rejected } = filterOut(
      survivors,
      (f) => f.size == null || f.size <= (opts.maxFileSize as number),
    );
    if (rejected.length > 0) {
      errors.push({
        code: 'max_file_size',
        message:
          `${rejected.length} file(s) exceeded the ${opts.maxFileSize} byte limit and were not added.`,
      });
    }
    survivors = accepted;
  }

  // 3. count — the silent cap: fill the remaining slots, report only the overflow.
  if (opts.maxFiles != null) {
    const remaining = Math.max(0, opts.maxFiles - (opts.currentCount ?? 0));
    if (survivors.length > remaining) {
      errors.push({
        code: 'max_files',
        message:
          `Only ${opts.maxFiles} file(s) can be attached — ${survivors.length - remaining} were not added.`,
      });
      survivors = survivors.slice(0, remaining);
    }
  }

  return { accepted: survivors, errors };
}

/** The submit boundary: consumer-facing files carry no internal id. */
export function stripIds(files: PromptInputAttachmentData[]): PromptInputMessageFile[] {
  return files.map(({ id: _id, ...rest }) => rest);
}
