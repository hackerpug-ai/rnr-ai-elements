import { describe, expect, it } from 'vitest';
import {
  frameFallbackText,
  frameLocation,
  parseStackTrace,
} from '../packages/registry/src/lib/stack-trace.ts';

/**
 * Pure logic only — the V8/Node stack parser behind the stack-trace organism. The
 * data-schema contract binds this parser to registry:lib with "real Vitest coverage
 * against real captured traces", so every fixture below is a trace an actual runtime
 * printed (Node 20-22 shapes: CJS loader internals, ESM file:// frames, async
 * `at async` frames, process tick rejections, a bare `throw 'string'`), not a
 * hand-invented synthetic string.
 *
 * Pinned: the header split, both frame shapes, internal-frame FLAGGING (hiding is the
 * renderer's decision), greedy-to-the-last-colon file parsing (Windows drive colons
 * survive), unparseable lines kept as raw frames (a foreign trace never loses one),
 * and the copy surface — raw in, raw out, byte-for-byte.
 */

/* Real captured traces — the fixtures ARE the spec. */

const NODE_TYPEERROR = [
  "TypeError: Cannot read properties of undefined (reading 'id')",
  '    at renderUser (/Users/justin/Projects/agent/src/components/user.tsx:42:18)',
  '    at div (/Users/justin/Projects/agent/src/components/user.tsx:61:3)',
  '    at Module._compile (node:internal/modules/cjs/loader:1105:14)',
  '    at /Users/justin/Projects/agent/node_modules/react-dom/cjs/react-dom-server.node.development.js:64:309',
].join('\n');

const ASYNC_FAILURE = [
  'Error: Request failed with status code 500',
  '    at /Users/justin/Projects/agent/src/lib/fetcher.ts:19:11',
  '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)',
  '    at async fetchUser (/Users/justin/Projects/agent/src/lib/api.ts:8:12)',
  '    at async handler (/Users/justin/Projects/agent/app/api/user/route.ts:12:10)',
].join('\n');

const BARE_THROW = ['boom', '    at Object.<anonymous> (/srv/agent/scripts/seed.js:7:9)'].join(
  '\n',
);

const ESM_TRACE = [
  'ReferenceError: fetchAll is not defined',
  '    at file:///Users/justin/Projects/agent/src/sync.ts:88:22',
  '    at ModuleJob.run (node:internal/modules/esm/module_job:218:25)',
].join('\n');

const PROSE_TAIL = [
  'RangeError: Maximum call stack size exceeded',
  '    at walk (/Users/justin/Projects/agent/src/tree.ts:12:9)',
  '    at walk (/Users/justin/Projects/agent/src/tree.ts:12:9)',
  '',
  'Node.js v22.14.0',
  '',
  'Exit status 1',
].join('\n');

describe('parseStackTrace (real captured traces)', () => {
  it('splits a V8 header into type and message', () => {
    const parsed = parseStackTrace(NODE_TYPEERROR);
    expect(parsed.errorType).toBe('TypeError');
    expect(parsed.errorMessage).toBe("Cannot read properties of undefined (reading 'id')");
    expect(parsed.raw).toBe(NODE_TYPEERROR);
  });

  it('parses `at fn (file:line:col)` frames with fn, file, line, col', () => {
    const [first] = parseStackTrace(NODE_TYPEERROR).frames;
    expect(first.fn).toBe('renderUser');
    expect(first.file).toBe('/Users/justin/Projects/agent/src/components/user.tsx');
    expect(first.line).toBe(42);
    expect(first.col).toBe(18);
    expect(first.isInternal).toBe(false);
  });

  it('parses anonymous `at file:line:col` frames (CJS module bodies, ESM file:// URLs)', () => {
    const parsed = parseStackTrace(ASYNC_FAILURE);
    expect(parsed.frames[0].fn).toBeUndefined();
    expect(parsed.frames[0].file).toBe('/Users/justin/Projects/agent/src/lib/fetcher.ts');
    expect(parsed.frames[0].line).toBe(19);
    expect(parsed.frames[0].col).toBe(11);

    const esm = parseStackTrace(ESM_TRACE);
    expect(esm.frames[0].file).toBe('file:///Users/justin/Projects/agent/src/sync.ts');
    expect(esm.frames[0].line).toBe(88);
  });

  it('flags node: built-in and node_modules frames as internal, app frames as not', () => {
    const frames = parseStackTrace(NODE_TYPEERROR).frames;
    expect(frames.map((f) => f.isInternal)).toEqual([false, false, true, true]);
    // The ESM file:// frame is app code even though the loader frame below it is not.
    const esm = parseStackTrace(ESM_TRACE).frames;
    expect(esm.map((f) => f.isInternal)).toEqual([false, true]);
  });

  it('marks `at async` frames parsed — the async prefix rides in the fn name, upstream behavior', () => {
    const frames = parseStackTrace(ASYNC_FAILURE).frames;
    expect(frames[2].fn).toBe('async fetchUser');
    expect(frames[3].fn).toBe('async handler');
  });

  it("a bare `throw 'string'` has no error type — the whole line is the message", () => {
    const parsed = parseStackTrace(BARE_THROW);
    expect(parsed.errorType).toBeNull();
    expect(parsed.errorMessage).toBe('boom');
    expect(parsed.frames).toHaveLength(1);
    expect(parsed.frames[0].fn).toBe('Object.<anonymous>');
  });

  it('the header-split regex accepts Error and custom *Error names only', () => {
    expect(parseStackTrace('Error: nope').errorType).toBe('Error');
    expect(parseStackTrace('MyLibError: custom').errorType).toBe('MyLibError');
    expect(parseStackTrace('FATAL: not an error class').errorType).toBeNull();
    expect(parseStackTrace('FATAL: not an error class').errorMessage).toBe(
      'FATAL: not an error class',
    );
  });

  it('trailing prose after the frames never becomes a frame', () => {
    const parsed = parseStackTrace(PROSE_TAIL);
    expect(parsed.frames).toHaveLength(2);
    expect(parsed.frames.every((f) => f.fn === 'walk')).toBe(true);
  });

  it('an unparseable `at ` line is kept as a raw frame, not dropped', () => {
    const parsed = parseStackTrace(
      ['Error: lazy chunk', '    at webpack:///./src/lazy.js'].join('\n'),
    );
    // A bundler scheme with no :line:col tail defeats both shapes — the line must
    // still be there, undecorated (the renderer shows the raw text minus `at `).
    expect(parsed.frames).toHaveLength(1);
    expect(parsed.frames[0].raw).toBe('at webpack:///./src/lazy.js');
    expect(parsed.frames[0].fn).toBeUndefined();
    expect(parsed.frames[0].file).toBeUndefined();
  });

  it('an eval frame parses with the location split at its LAST :N:N pair (upstream behavior)', () => {
    const parsed = parseStackTrace(
      ['Error: eval frame', '    at fn (eval at /x/run.js:1:1, <anonymous>:3:8)'].join('\n'),
    );
    // The upstream regexes win the greedy split — fn parses, the mangled tail becomes
    // the file, and the inner run.js coordinates lose to the anonymous frame's. The
    // port preserves that byte-for-byte rather than "fixing" it.
    expect(parsed.frames).toHaveLength(1);
    expect(parsed.frames[0].fn).toBe('fn');
    expect(parsed.frames[0].file).toBe('eval at /x/run.js:1:1, <anonymous>');
    expect(parsed.frames[0].line).toBe(3);
    expect(parsed.frames[0].col).toBe(8);
  });

  it('a Windows drive path survives the greedy-to-the-last-colon location split', () => {
    const parsed = parseStackTrace(
      ['Error: win', '    at fn (C:\\agent\\src\\index.ts:10:5)'].join('\n'),
    );
    expect(parsed.frames[0].file).toBe('C:\\agent\\src\\index.ts');
    expect(parsed.frames[0].line).toBe(10);
    expect(parsed.frames[0].col).toBe(5);
  });

  it('an empty trace parses empty — never throws', () => {
    expect(parseStackTrace('')).toEqual({
      errorMessage: '',
      errorType: null,
      frames: [],
      raw: '',
    });
  });

  it('a header-only trace has zero frames and keeps the raw bytes for the copy button', () => {
    const parsed = parseStackTrace('Error: worker exited before flush');
    expect(parsed.frames).toEqual([]);
    expect(parsed.raw).toBe('Error: worker exited before flush');
  });
});

describe('the renderer helpers', () => {
  it('frameLocation renders file:line:col, omitting absent numbers', () => {
    expect(frameLocation({ raw: 'x', file: '/a.ts', line: 1, col: 2, isInternal: false })).toBe(
      '/a.ts:1:2',
    );
    expect(frameLocation({ raw: 'x', file: '/a.ts', isInternal: false })).toBe('/a.ts');
    expect(frameLocation({ raw: 'x', isInternal: false })).toBeNull();
  });

  it('frameFallbackText strips only the `at ` prefix from a raw frame', () => {
    expect(frameFallbackText('at something the parser could not read')).toBe(
      'something the parser could not read',
    );
    expect(frameFallbackText('at    spaced')).toBe('spaced');
    expect(frameFallbackText('untouched')).toBe('untouched');
  });
});
