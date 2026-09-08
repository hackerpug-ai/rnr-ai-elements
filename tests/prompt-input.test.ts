import { describe, expect, it } from 'vitest';
import {
  acceptsMimeType,
  imageAssetToAttachment,
  type PickerKind,
  type PromptInputAttachmentData,
  resolvePickerKind,
  stripIds,
  validateAttachments,
} from '../packages/registry/src/components/ai/prompt-input.logic.ts';

/**
 * Pure logic only — the attachment validation pipeline and picker routing (see
 * agent-status.test.ts's header for why rendering itself cannot live in this tier).
 *
 * These are the web original's attachment contracts (behavior spec, prompt-input-web-
 * behavior-spec.md), which the brief pins verbatim:
 *
 *   Validation order: accept → size → count. Each stage may fire onError once; only
 *   an accept stage that rejects EVERY file aborts the add. Size drops over-cap files
 *   and continues. Count caps SILENTLY to remaining capacity and only reports when
 *   something was actually dropped.
 *
 * The RN divergence this tier also owns: records carry file:// URIs from the native
 * pickers — no blob→data conversion, no revokeObjectURL (nothing to revoke) — and the
 * picker route is derived from `accept` ('media' unless accept excludes image/*),
 * because a phone has one hidden file input to replace with TWO native pickers.
 */

const file = (
  over: Partial<PromptInputAttachmentData> & { id?: string } = {},
): PromptInputAttachmentData => ({
  id: over.id ?? 'f1',
  mediaType: 'text/plain',
  filename: 'note.txt',
  url: 'file:///tmp/note.txt',
  ...over,
});

describe('acceptsMimeType (the accept grammar)', () => {
  it('matches an exact MIME type', () => {
    expect(acceptsMimeType('image/png', 'image/png')).toBe(true);
    expect(acceptsMimeType('image/png', 'image/jpeg')).toBe(false);
  });

  it('honors the image/* wildcard', () => {
    expect(acceptsMimeType('image/png', 'image/*')).toBe(true);
    expect(acceptsMimeType('image/jpeg', 'image/*')).toBe(true);
    expect(acceptsMimeType('video/mp4', 'image/*')).toBe(false);
  });

  it('is case-insensitive on both sides', () => {
    expect(acceptsMimeType('IMAGE/PNG', 'image/png')).toBe(true);
    expect(acceptsMimeType('image/png', 'IMAGE/PNG')).toBe(true);
  });

  it('reads a comma-separated list', () => {
    const accept = 'image/png,application/pdf';
    expect(acceptsMimeType('image/png', accept)).toBe(true);
    expect(acceptsMimeType('application/pdf', accept)).toBe(true);
    expect(acceptsMimeType('text/plain', accept)).toBe(false);
  });

  it('an accept with no image entry excludes every image', () => {
    expect(acceptsMimeType('image/png', 'application/pdf')).toBe(false);
  });
});

describe('resolvePickerKind (two native pickers replace the hidden file input)', () => {
  it('routes to the media picker by default — no accept is an open paperclip', () => {
    expect(resolvePickerKind(undefined)).toBe('media');
    expect(resolvePickerKind('')).toBe('media');
  });

  it('any image-capable accept keeps the media picker', () => {
    expect(resolvePickerKind('image/*')).toBe('media');
    expect(resolvePickerKind('image/png')).toBe('media');
    expect(resolvePickerKind('application/pdf,image/*')).toBe('media');
  });

  it('an accept that excludes image/* routes to the document picker', () => {
    expect(resolvePickerKind('application/pdf')).toBe('file');
    expect(resolvePickerKind('text/plain,application/json')).toBe('file');
  });
});

describe('validateAttachments — stage 1, accept (the aborting stage)', () => {
  it('passes everything through when no accept is set', () => {
    const files = [file(), file({ mediaType: 'image/png' })];
    const { accepted, errors } = validateAttachments(files, {});
    expect(accepted).toEqual(files);
    expect(errors).toEqual([]);
  });

  it('rejecting EVERY file aborts with one accept error and adds nothing', () => {
    const files = [file({ mediaType: 'video/mp4' }), file({ id: 'f2', mediaType: 'video/webm' })];
    const { accepted, errors } = validateAttachments(files, { accept: 'image/*' });
    expect(accepted).toEqual([]);
    expect(errors).toEqual([{ code: 'accept', message: expect.any(String) }]);
  });

  it('a partial accept rejection drops the mismatches silently — no error', () => {
    const files = [file({ mediaType: 'image/png' }), file({ id: 'f2', mediaType: 'video/mp4' })];
    const { accepted, errors } = validateAttachments(files, { accept: 'image/*' });
    expect(accepted.map((f) => f.id)).toEqual(['f1']);
    expect(errors).toEqual([]);
  });
});

describe('validateAttachments — stage 2, maxFileSize (drop and continue)', () => {
  it('drops over-cap files, keeps the rest, and reports max_file_size once', () => {
    const files = [file({ id: 'small', size: 100 }), file({ id: 'big', size: 10_000 })];
    const { accepted, errors } = validateAttachments(files, { maxFileSize: 1000 });
    expect(accepted.map((f) => f.id)).toEqual(['small']);
    expect(errors).toEqual([{ code: 'max_file_size', message: expect.any(String) }]);
  });

  it('fires nothing when every file is under the cap', () => {
    const files = [file({ size: 100 })];
    const { errors } = validateAttachments(files, { maxFileSize: 1000 });
    expect(errors).toEqual([]);
  });

  it('a file with no size never trips the cap — the pickers do not always measure', () => {
    const noSize = file({ size: undefined });
    const { accepted, errors } = validateAttachments([noSize], { maxFileSize: 1 });
    expect(accepted).toEqual([noSize]);
    expect(errors).toEqual([]);
  });
});

describe('validateAttachments — stage 3, maxFiles (silent cap, report only on drop)', () => {
  it('caps to remaining capacity and reports max_files when something was dropped', () => {
    const files = [file({ id: 'a' }), file({ id: 'b' }), file({ id: 'c' })];
    const { accepted, errors } = validateAttachments(files, { maxFiles: 3, currentCount: 1 });
    expect(accepted.map((f) => f.id)).toEqual(['a', 'b']);
    expect(errors).toEqual([{ code: 'max_files', message: expect.any(String) }]);
  });

  it('fits exactly in remaining capacity — no error, nothing dropped', () => {
    const files = [file({ id: 'a' }), file({ id: 'b' })];
    const { accepted, errors } = validateAttachments(files, { maxFiles: 3, currentCount: 1 });
    expect(accepted.map((f) => f.id)).toEqual(['a', 'b']);
    expect(errors).toEqual([]);
  });

  it('a full board caps to nothing and reports', () => {
    const files = [file({ id: 'a' })];
    const { accepted, errors } = validateAttachments(files, { maxFiles: 2, currentCount: 2 });
    expect(accepted).toEqual([]);
    expect(errors).toEqual([{ code: 'max_files', message: expect.any(String) }]);
  });
});

describe('PickerKind — the camera route', () => {
  // The camera is MENU-DRIVEN, never derived: resolvePickerKind still answers only for
  // the paperclip's two derived routes. A consumer asking for the camera asks for the
  // camera BY NAME (the + menu's Camera row), so an untargeted open can never land in
  // the camera roll by inference from `accept`.
  it("the union admits 'camera'", () => {
    const kind: PickerKind = 'camera';
    expect(kind).toBe('camera');
  });

  it('is explicit-kind only — resolvePickerKind never routes to the camera', () => {
    expect(resolvePickerKind(undefined)).not.toBe('camera');
    expect(resolvePickerKind('')).not.toBe('camera');
    expect(resolvePickerKind('image/*')).not.toBe('camera');
    expect(resolvePickerKind('application/pdf')).not.toBe('camera');
  });
});

describe('imageAssetToAttachment — the mapping the media AND camera branches share', () => {
  // expo-image-picker's asset shape, exactly as the ambient boundary declares it:
  // nullable metadata the picker may or may not measure. Both launch paths map through
  // this ONE function so a camera pick produces byte-identical records to a library
  // pick — and lands in the SAME validated add() pipeline.
  const asset = (over: Partial<Parameters<typeof imageAssetToAttachment>[0]> = {}) => ({
    uri: 'file:///tmp/pic.jpg',
    fileName: 'pic.jpg',
    mimeType: 'image/jpeg',
    fileSize: 2048,
    ...over,
  });

  it('maps a fully-measured asset', () => {
    expect(imageAssetToAttachment(asset())).toEqual({
      id: expect.any(String),
      mediaType: 'image/jpeg',
      filename: 'pic.jpg',
      url: 'file:///tmp/pic.jpg',
      size: 2048,
    });
  });

  it('ids are unique per record — two picks never collide', () => {
    const a = imageAssetToAttachment(asset());
    const b = imageAssetToAttachment(asset());
    expect(a.id).not.toBe(b.id);
  });

  it("a MIME-less asset maps to '' — the generic file chip, not a crash", () => {
    const record = imageAssetToAttachment(asset({ mimeType: null }));
    expect(record.mediaType).toBe('');
  });

  it("a nameless asset falls back to 'Image'", () => {
    const record = imageAssetToAttachment(asset({ fileName: null }));
    expect(record.filename).toBe('Image');
  });

  it('a file the picker did not measure carries no size — and never trips a size cap', () => {
    const record = imageAssetToAttachment(asset({ fileSize: null }));
    expect(record.size).toBeUndefined();
    const { accepted, errors } = validateAttachments([record], { maxFileSize: 1 });
    expect(accepted).toEqual([record]);
    expect(errors).toEqual([]);
  });

  it('a camera-shaped batch rides the SAME pipeline, order accept → size → count', () => {
    // The + menu's Camera row maps launchCameraAsync assets through this mapper and
    // hands the result to validateAttachments — so a wrong-type shot is aborted on,
    // an over-cap shot is dropped around, and the count caps only the survivors.
    const shots = [
      imageAssetToAttachment(
        asset({
          uri: 'file:///tmp/ok.jpg',
          fileName: 'ok.jpg',
          mimeType: 'image/jpeg',
          fileSize: 100,
        }),
      ),
      imageAssetToAttachment(
        asset({
          uri: 'file:///tmp/big.jpg',
          fileName: 'big.jpg',
          mimeType: 'image/jpeg',
          fileSize: 10_000,
        }),
      ),
      imageAssetToAttachment(
        asset({
          uri: 'file:///tmp/mov.mov',
          fileName: 'mov.mov',
          mimeType: 'video/quicktime',
          fileSize: 10_000,
        }),
      ),
    ] as PromptInputAttachmentData[];
    const { accepted, errors } = validateAttachments(shots, {
      accept: 'image/*',
      maxFileSize: 1000,
      maxFiles: 2,
      currentCount: 1,
    });
    // The video dies at accept (no size error may name it), the oversized image dies
    // at size, and 'ok' fits the one remaining slot. One error, one stage: size.
    expect(accepted.map((f) => f.filename)).toEqual(['ok.jpg']);
    expect(errors.map((e) => e.code)).toEqual(['max_file_size']);
  });
});

describe('validateAttachments — the ORDER is accept → size → count', () => {
  it('size applies only to accept survivors, count only to size survivors', () => {
    const files = [
      file({ id: 'ok', mediaType: 'text/plain', size: 10 }),
      file({ id: 'wrong-type-big', mediaType: 'video/mp4', size: 10_000 }),
    ];
    const { accepted, errors } = validateAttachments(files, {
      accept: 'text/*',
      maxFileSize: 100,
      maxFiles: 5,
      currentCount: 4,
    });
    // accept already killed the oversized video, so NO size error may exist —
    // a size error here would prove the stages ran in the wrong order.
    expect(accepted.map((f) => f.id)).toEqual(['ok']);
    expect(errors).toEqual([]);
  });

  it('count caps the size survivors, not the raw input', () => {
    const files = [
      file({ id: 'small', size: 10 }),
      file({ id: 'medium', size: 50 }),
      file({ id: 'big', size: 10_000 }),
    ];
    const { accepted, errors } = validateAttachments(files, {
      maxFileSize: 100,
      maxFiles: 3,
      currentCount: 1,
    });
    // Two size survivors fit the remaining capacity of 2 exactly. Counting the RAW
    // input (3) instead would have fired a max_files error that must not exist —
    // the cap reads the post-size board, not the batch the user picked.
    expect(accepted.map((f) => f.id)).toEqual(['small', 'medium']);
    expect(errors.map((e) => e.code)).toEqual(['max_file_size']);
  });

  it('an aborting accept stage short-circuits every later stage', () => {
    const files = [file({ mediaType: 'video/mp4', size: 10_000 })];
    const { accepted, errors } = validateAttachments(files, {
      accept: 'text/*',
      maxFileSize: 1,
      maxFiles: 1,
      currentCount: 1,
    });
    expect(accepted).toEqual([]);
    expect(errors.map((e) => e.code)).toEqual(['accept']);
  });
});

describe('stripIds (the submit boundary)', () => {
  it('consumer-facing files carry no internal id', () => {
    const files = [file({ id: 'a' }), file({ id: 'b', size: 5 })];
    expect(stripIds(files)).toEqual([
      { mediaType: 'text/plain', filename: 'note.txt', url: 'file:///tmp/note.txt' },
      { mediaType: 'text/plain', filename: 'note.txt', url: 'file:///tmp/note.txt', size: 5 },
    ]);
  });
});
