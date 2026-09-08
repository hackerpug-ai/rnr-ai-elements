/**
 * Stack-trace parser — pure logic. Zero react-native imports, so the Vitest tier owns
 * it (see the header of lib/reasoning-lifecycle.ts for why component files themselves
 * cannot load under Node). It lives in registry:lib, not beside the component, because
 * the data-schema doc binds it there: "The parser is pure logic and belongs in
 * registry:lib with real Vitest coverage against real captured traces."
 *
 * PORT OF THE WEB ORIGINAL'S PARSER, behavior for behavior:
 *  - the error header is the FIRST non-blank line; `Type: message` splits into
 *    errorType/errorMessage when the type matches `\\w+Error` or bare `Error`, else the
 *    whole line is the message (a `throw 'string'` has no type)
 *  - frames are the lines AFTER the header that start with `at `; a trailing prose
 *    block after the frames is ignored, exactly as upstream slices past line 0
 *  - `at fn (file:line:col)` and `at file:line:col` both parse; the file path is
 *    greedy-to-the-last-colon so Windows drive letters survive intact
 *  - a line that matches neither shape still becomes a frame (raw text preserved) so a
 *    foreign runtime's trace never loses lines — it renders undecorated
 *  - INTERNAL frames are flagged, never hidden here: `node:` prefixes, `node_modules`
 *    anywhere in the path, and `internal/` segments (the web's rule, verbatim). Hiding
 *    is the RENDERER's decision (StackTraceFrames' showInternalFrames).
 *
 * The one deliberate divergence from the upstream type surface is naming: the
 * data-schema contract binds `StackFrame` to `{ fn?, file?, line?, col? }` — shorter
 * keys, optional rather than null — so a consumer mapping tool output onto this shape
 * writes no adapter. `raw` (the verbatim line) and `isInternal` ride along because the
 * renderer and the filter both need them.
 */

/** One stack frame: parsed fields when the line matched, `raw` always. */
export type StackFrame = {
  /** The verbatim trimmed source line — the fallback render and the list key. */
  raw: string;
  /** Function name, when the frame carried one (`Object.<anonymous>` counts). */
  fn?: string;
  /** File path as the runtime printed it (`file://` prefixes and all). */
  file?: string;
  line?: number;
  col?: number;
  /** node: / node_modules / internal — flagged here, hidden by the renderer. */
  isInternal: boolean;
};

/** A whole parsed trace: header, frames, and the untouched input. */
export type ParsedStackTrace = {
  /** `TypeError`, `RangeError`, … — null when the header had no `Type: ` shape. */
  errorType: string | null;
  /** The message text; the whole first line when no type was parsed. */
  errorMessage: string;
  frames: StackFrame[];
  /** The trace exactly as handed in — what the copy button puts on the clipboard. */
  raw: string;
};

/** `at fn (file:line:col)` — fn may itself contain parens; the location is the LAST one. */
const STACK_FRAME_WITH_PARENS_REGEX = /^at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
/** `at file:line:col` — anonymous module frames. */
const STACK_FRAME_WITHOUT_FN_REGEX = /^at\s+(.+):(\d+):(\d+)$/;
/** `TypeError: msg`, `Error: msg` — the two header shapes a JS runtime prints. */
const ERROR_TYPE_REGEX = /^(\w+Error|Error):\s*(.*)$/;
/** The frame prefix, stripped when a raw fallback frame renders. */
const AT_PREFIX_REGEX = /^at\s+/;

/**
 * The upstream internal-frame rule, verbatim: node built-ins (`node:...`), anything
 * under node_modules, and `internal/` paths (Node's own internal dir in some outputs).
 */
function isInternalPath(filePath: string): boolean {
  return (
    filePath.includes('node_modules') ||
    filePath.startsWith('node:') ||
    filePath.includes('internal/')
  );
}

function parseStackFrame(line: string): StackFrame {
  const trimmed = line.trim();

  // Pattern: at functionName (filePath:line:column)
  const withParensMatch = trimmed.match(STACK_FRAME_WITH_PARENS_REGEX);
  if (withParensMatch) {
    const [, functionName, filePath, lineNum, colNum] = withParensMatch;
    return {
      col: colNum ? Number.parseInt(colNum, 10) : undefined,
      file: filePath || undefined,
      fn: functionName || undefined,
      isInternal: isInternalPath(filePath),
      line: lineNum ? Number.parseInt(lineNum, 10) : undefined,
      raw: trimmed,
    };
  }

  // Pattern: at filePath:line:column (no function name)
  const withoutFnMatch = trimmed.match(STACK_FRAME_WITHOUT_FN_REGEX);
  if (withoutFnMatch) {
    const [, filePath, lineNum, colNum] = withoutFnMatch;
    return {
      col: colNum ? Number.parseInt(colNum, 10) : undefined,
      file: filePath || undefined,
      isInternal: filePath ? isInternalPath(filePath) : false,
      line: lineNum ? Number.parseInt(lineNum, 10) : undefined,
      raw: trimmed,
    };
  }

  // Fallback: unparseable line — kept, so a foreign trace renders undecorated rather
  // than losing frames. Internal-ness reads off the raw text with the same rule.
  return {
    isInternal: trimmed.includes('node_modules') || trimmed.includes('node:'),
    raw: trimmed,
  };
}

/** `trace` → header + frames. Never throws; an empty string parses to an empty trace. */
export function parseStackTrace(trace: string): ParsedStackTrace {
  const lines = trace.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      errorMessage: trace,
      errorType: null,
      frames: [],
      raw: trace,
    };
  }

  const firstLine = lines[0].trim();
  let errorType: string | null = null;
  let errorMessage = firstLine;

  const errorMatch = firstLine.match(ERROR_TYPE_REGEX);
  if (errorMatch) {
    const [, type, msg] = errorMatch;
    errorType = type;
    errorMessage = msg || '';
  }

  const frames = lines
    .slice(1)
    .filter((line) => line.trim().startsWith('at '))
    .map(parseStackFrame);

  return {
    errorMessage,
    errorType,
    frames,
    raw: trace,
  };
}

/**
 * The text a fallback (unparsed) frame renders — the raw line minus its `at ` prefix,
 * which the renderer supplies itself for parsed frames.
 */
export function frameFallbackText(raw: string): string {
  return raw.replace(AT_PREFIX_REGEX, '');
}

/**
 * The file:line:col tail a frame's location renders (`file` alone when the runtime
 * gave no numbers). Null when the frame has no file — there is nothing to press.
 */
export function frameLocation(frame: StackFrame): string | null {
  if (!frame.file) return null;
  let location = frame.file;
  if (frame.line !== undefined) location += `:${frame.line}`;
  if (frame.col !== undefined) location += `:${frame.col}`;
  return location;
}
