export type SourceData = {
  id: string;
  title: string;
  url: string;
  snippet?: string;
  faviconUri?: string;
};

/** The one field the row composition asks for, whatever else the caller carries. */
export type SourceLike = Pick<SourceData, 'title' | 'url'> & Partial<Pick<SourceData, 'faviconUri'>>;

/** The web original's trigger text, verbatim: `Used {count} sources`. */
export function usedSourcesLabel(count: number): string {
  return `Used ${count} sources`;
}
