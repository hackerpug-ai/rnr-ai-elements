import { describe, expect, it } from 'vitest';
import {
  httpMethodMeta,
  parsePathSegments,
  propertyIndent,
  SCHEMA_HTTP_METHOD_KEYS,
  SCHEMA_METHOD_META,
} from '../packages/registry/src/components/ai/schema-display.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the method compression table and the path splitter behind the
 * schema-display organism (see agent-status.test.ts's header for why rendering itself
 * cannot live in this tier).
 *
 * Pinned: every HTTP verb resolves to a sanctioned status tone (the five web washes
 * compress onto the house palette — PATCH's yellow onto denied/orange exactly as
 * terminal.logic compressed yellow), the badge WORD is the verb so color is never the
 * sole channel, and the {param} splitter reproduces the web's highlight regex as
 * plain data — the port's replacement for dangerouslySetInnerHTML.
 */

describe('SCHEMA_METHOD_META (the compression table)', () => {
  it('maps all five verbs onto the sanctioned status tones', () => {
    expect(SCHEMA_METHOD_META.GET.className).toBe(statusColor.success);
    expect(SCHEMA_METHOD_META.POST.className).toBe(statusColor.running);
    expect(SCHEMA_METHOD_META.PUT.className).toBe(statusColor.denied);
    expect(SCHEMA_METHOD_META.PATCH.className).toBe(statusColor.denied); // yellow → orange, declared
    expect(SCHEMA_METHOD_META.DELETE.className).toBe(statusColor.error);
  });

  it('is exhaustive over the union — no verb may be added without a row here', () => {
    expect([...SCHEMA_HTTP_METHOD_KEYS]).toEqual(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
    for (const verb of SCHEMA_HTTP_METHOD_KEYS) {
      expect(SCHEMA_METHOD_META[verb]).toBeDefined();
    }
  });

  it('no entry invents a fourth color outside the sanctioned set', () => {
    const allowed = new Set([
      statusColor.pending,
      statusColor.running,
      statusColor.success,
      statusColor.error,
      statusColor.denied,
    ]);
    for (const meta of Object.values(SCHEMA_METHOD_META)) {
      expect(allowed.has(meta.className)).toBe(true);
    }
  });

  it('httpMethodMeta is a plain lookup (the component never re-derives)', () => {
    expect(httpMethodMeta('DELETE')).toBe(SCHEMA_METHOD_META.DELETE);
  });
});

describe('parsePathSegments (the {param} highlighter, de-dangerous-ified)', () => {
  it('splits a path with parameters into literal and param runs, in order', () => {
    expect(parsePathSegments('/api/users/{userId}/posts/{postId}')).toEqual([
      { text: '/api/users/', param: false },
      { text: '{userId}', param: true },
      { text: '/posts/', param: false },
      { text: '{postId}', param: true },
    ]);
  });

  it('a path with no parameters is one literal run', () => {
    expect(parsePathSegments('/healthz')).toEqual([{ text: '/healthz', param: false }]);
  });

  it('a leading parameter keeps the trailing literal; a trailing parameter keeps the leading one', () => {
    expect(parsePathSegments('{version}/schema')).toEqual([
      { text: '{version}', param: true },
      { text: '/schema', param: false },
    ]);
    expect(parsePathSegments('/api/{id}')).toEqual([
      { text: '/api/', param: false },
      { text: '{id}', param: true },
    ]);
  });

  it('adjacent parameters stay separate runs', () => {
    expect(parsePathSegments('/{a}/{b}')).toEqual([
      { text: '/', param: false },
      { text: '{a}', param: true },
      { text: '/', param: false },
      { text: '{b}', param: true },
    ]);
  });

  it('an unterminated brace is a literal, never a highlight', () => {
    expect(parsePathSegments('/api/{id')).toEqual([{ text: '/api/{id', param: false }]);
  });

  it('an empty path still yields one run so the renderer never special-cases', () => {
    expect(parsePathSegments('')).toEqual([{ text: '', param: false }]);
  });
});

describe('propertyIndent (the recursion arithmetic, upstream 40 + depth*16)', () => {
  it('depth 0 is the web base indent of 40', () => {
    expect(propertyIndent(0)).toBe(40);
  });

  it('each level adds 16', () => {
    expect(propertyIndent(1)).toBe(56);
    expect(propertyIndent(2)).toBe(72);
    expect(propertyIndent(5)).toBe(120);
  });
});
