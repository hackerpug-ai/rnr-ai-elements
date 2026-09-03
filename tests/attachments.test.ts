import { describe, expect, it } from 'vitest';
import {
  ATTACHMENT_VARIANTS,
  type AttachmentData,
  attachmentStateLabel,
  formatAttachmentSize,
  getAttachmentLabel,
  getMediaCategory,
} from '../packages/registry/src/components/ai/attachments.logic.ts';

/**
 * Pure logic only — the attachment category/label/size/state vocabulary (see
 * agent-status.test.ts's header for why rendering itself cannot live in this tier).
 * getMediaCategory is the data-schema doc's own named function: "Pure function,
 * Vitest-testable."
 */

const file = (over: Partial<AttachmentData>): AttachmentData => ({
  id: 'a1',
  name: 'report.pdf',
  mimeType: 'application/pdf',
  ...over,
});

describe('the attachment vocabulary (exhaustive keys)', () => {
  it('ships exactly the web original variants, minus nothing, plus nothing', () => {
    expect([...ATTACHMENT_VARIANTS].sort()).toEqual(['grid', 'inline', 'list'].sort());
  });
});

describe('getMediaCategory (the preview affordance)', () => {
  it('maps the media prefixes the web original maps', () => {
    expect(getMediaCategory('image/png')).toBe('image');
    expect(getMediaCategory('image/jpeg')).toBe('image');
    expect(getMediaCategory('video/mp4')).toBe('video');
    expect(getMediaCategory('audio/m4a')).toBe('audio');
  });

  it('maps application/ and text/ to document', () => {
    expect(getMediaCategory('application/pdf')).toBe('document');
    expect(getMediaCategory('application/octet-stream')).toBe('document');
    expect(getMediaCategory('text/csv')).toBe('document');
    expect(getMediaCategory('text/plain')).toBe('document');
  });

  it('degrades an empty or unknown type to unknown — the paperclip', () => {
    expect(getMediaCategory('')).toBe('unknown');
    expect(getMediaCategory('x-unknown/thing')).toBe('unknown');
    expect(getMediaCategory('applicationx/pdf')).toBe('unknown');
  });

  it('is a prefix rule, so parameters after the semicolon do not matter', () => {
    expect(getMediaCategory('image/png; charset=binary')).toBe('image');
  });
});

describe('getAttachmentLabel (the chip text)', () => {
  it('prefers the file name', () => {
    expect(getAttachmentLabel(file({ name: 'composer.png' }))).toBe('composer.png');
  });

  it('falls back to Image for a nameless image, Attachment otherwise', () => {
    expect(getAttachmentLabel(file({ name: '', mimeType: 'image/png' }))).toBe('Image');
    expect(getAttachmentLabel(file({ name: '', mimeType: 'application/pdf' }))).toBe('Attachment');
    expect(getAttachmentLabel(file({ name: '', mimeType: '' }))).toBe('Attachment');
  });
});

describe('attachmentStateLabel (the per-file transport state)', () => {
  it('names the two states a user must hear about', () => {
    expect(attachmentStateLabel('uploading')).toBe('Uploading');
    expect(attachmentStateLabel('error')).toBe('Upload failed');
  });

  it('done needs no announcement — the chip itself is the proof', () => {
    expect(attachmentStateLabel('done')).toBeUndefined();
  });
});

describe('formatAttachmentSize (the chip meta line)', () => {
  it('renders nothing when the caller supplied no size', () => {
    expect(formatAttachmentSize(undefined)).toBeUndefined();
    expect(formatAttachmentSize(Number.NaN)).toBeUndefined();
  });

  it('keeps bytes exact under a kilobyte', () => {
    expect(formatAttachmentSize(0)).toBe('0 B');
    expect(formatAttachmentSize(512)).toBe('512 B');
    expect(formatAttachmentSize(1023)).toBe('1023 B');
  });

  it('formats kilobytes, one decimal under 10', () => {
    expect(formatAttachmentSize(1024)).toBe('1 KB');
    expect(formatAttachmentSize(18400)).toBe('18 KB');
    expect(formatAttachmentSize(2048)).toBe('2 KB');
  });

  it('formats megabytes, one decimal under 10', () => {
    expect(formatAttachmentSize(1024 ** 2)).toBe('1 MB');
    expect(formatAttachmentSize(1284000)).toBe('1.2 MB');
    expect(formatAttachmentSize(25160000)).toBe('24 MB');
  });
});
