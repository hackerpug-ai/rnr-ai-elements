import { describe, expect, it } from 'vitest';
import { findRawColorTokens } from '../scripts/check-tokens';

describe('findRawColorTokens', () => {
  it('catches raw tailwind palette classes', () => {
    expect(findRawColorTokens('<View className="bg-zinc-950 border-zinc-800" />')).toEqual([
      'bg-zinc-950',
      'border-zinc-800',
    ]);
    expect(findRawColorTokens('className="text-blue-500"')).toEqual(['text-blue-500']);
    expect(findRawColorTokens('className="bg-black"')).toEqual(['bg-black']);
  });

  it('catches color literals including alpha forms, normalized', () => {
    expect(findRawColorTokens("placeholderTextColor={scheme === 'dark' ? 'hsl(0 0% 63.9%)' : '#737373'}")).toEqual([
      'hsl(',
      '#737373',
    ]);
    expect(findRawColorTokens('const shadow = "rgba(0,0,0,0.5)"')).toEqual(['rgb(']);
  });

  it('passes semantic theme classes untouched', () => {
    expect(findRawColorTokens('className="bg-primary text-muted-foreground dark:bg-background"')).toEqual([]);
  });

  it('normalizes hex case so exceptions match either form', () => {
    expect(findRawColorTokens('color = "#A3A3A3"')).toEqual(['#a3a3a3']);
  });
});
