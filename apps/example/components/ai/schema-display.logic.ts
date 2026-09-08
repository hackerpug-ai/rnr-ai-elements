import { statusColor, type StatusTone } from '@/lib/status';

/** The five HTTP verbs the web original styles, verbatim union. */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Every verb, spelled out — exhaustiveness for the meta table, UC-AGENT-style. */
export const SCHEMA_HTTP_METHOD_KEYS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
] as const satisfies readonly HttpMethod[];

export type HttpMethodMeta = {
  tone: StatusTone;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

/**
 * verb → tone. One record, exhaustive by type: a verb added here without a row there
 * fails tsc. The badge text is the verb itself — color is never the sole channel.
 */
export const SCHEMA_METHOD_META: Record<HttpMethod, HttpMethodMeta> = {
  GET: { tone: 'success', className: statusColor.success },
  POST: { tone: 'running', className: statusColor.running },
  PUT: { tone: 'denied', className: statusColor.denied },
  PATCH: { tone: 'denied', className: statusColor.denied },
  DELETE: { tone: 'error', className: statusColor.error },
};

export function httpMethodMeta(method: HttpMethod): HttpMethodMeta {
  return SCHEMA_METHOD_META[method];
}

/** One parameter of the endpoint (upstream interface, verbatim fields). */
export type SchemaParameter = {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  location?: 'path' | 'query' | 'header';
};

/** One node of a request/response body tree (upstream interface, verbatim fields). */
export type SchemaProperty = {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  properties?: SchemaProperty[];
  items?: SchemaProperty;
};

export type PathSegment = {
  text: string;
  /** true → a `{param}` run; the renderer paints it with the accent role. */
  param: boolean;
};

/**
 * `/api/users/{userId}/posts/{postId}` → literal and parameter runs, in order.
 * The upstream regex (`/\{([^}]+)\}/g`) applied as data: an empty or brace-less path
 * comes back as one literal segment, so the renderer never special-cases.
 */
export function parsePathSegments(path: string): PathSegment[] {
  const segments: PathSegment[] = [];
  const pattern = /\{([^}]+)\}/g;
  let cursor = 0;

  for (const match of path.matchAll(pattern)) {
    if (match.index > cursor) {
      segments.push({ text: path.slice(cursor, match.index), param: false });
    }
    segments.push({ text: match[0], param: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < path.length) {
    segments.push({ text: path.slice(cursor), param: false });
  }
  if (segments.length === 0) {
    segments.push({ text: path, param: false });
  }
  return segments;
}

/**
 * The indentation of a property row at `depth` — the web's `paddingLeft: 40 +
 * depth * 16`, as data so the Vitest tier owns the arithmetic. Dynamic computed styles
 * merged via style={[…]} are contract-legal; this keeps the formula in one auditable
 * place instead of two components.
 */
export function propertyIndent(depth: number): number {
  return 40 + depth * 16;
}
