import { PlatformTools } from 'typeorm/platform/PlatformTools';

import { Formatter } from './Formatter';

export class TextFormatter implements Formatter {
  constructor(private readonly highlightEnabled: boolean = false) {}

  formatQuery(query: string, parameters?: unknown[]): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query: ${q}`;
  }

  formatQueryError(error: string | Error, query: string, parameters?: unknown[]): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query failed: ${q}`;
  }

  formatQuerySlow(time: number, query: string, parameters?: unknown[]): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query is slow: execution time = ${time}, query = ${q}`;
  }

  private formatQueryWithParameter(query: string, parameters?: unknown[]): string {
    const result = parameters && parameters.length ? `${query} -- PARAMETERS: ${JSON.stringify(parameters)}` : query;
    return this.highlightEnabled ? PlatformTools.highlightSql(result) : result;
  }
}
