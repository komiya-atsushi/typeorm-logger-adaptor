export interface Formatter {
  formatQuery(query: string, parameters?: unknown[] | Record<string, unknown>): string;

  formatQueryError(error: string | Error, query: string, parameters?: unknown[] | Record<string, unknown>): string;

  formatQuerySlow(time: number, query: string, parameters?: unknown[] | Record<string, unknown>): string;
}
