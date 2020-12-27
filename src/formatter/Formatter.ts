export interface Formatter {
  formatQuery(query: string, parameters?: unknown[]): string;

  formatQueryError(error: string | Error, query: string, parameters?: unknown[]): string;

  formatQuerySlow(time: number, query: string, parameters?: unknown[]): string;
}
