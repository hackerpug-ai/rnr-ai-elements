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
