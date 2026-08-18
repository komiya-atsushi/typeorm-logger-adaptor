import {PlatformTools} from 'typeorm/platform/PlatformTools';

import type {Formatter} from './Formatter';

export interface TextFormatterOptions {
  highlightSql?: boolean;
  formatSql?: boolean;
}

export class TextFormatter implements Formatter {
  constructor(private readonly options: TextFormatterOptions = {}) {}

  formatQuery(query: string, parameters?: unknown[] | Record<string, unknown>): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query: ${q}`;
  }

  formatQueryError(_error: string | Error, query: string, parameters?: unknown[] | Record<string, unknown>): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query failed: ${q}`;
  }

  formatQuerySlow(time: number, query: string, parameters?: unknown[] | Record<string, unknown>): string {
    const q = this.formatQueryWithParameter(query, parameters);
    return `query is slow: execution time = ${time}, query = ${q}`;
  }

  private formatQueryWithParameter(query: string, parameters?: unknown[] | Record<string, unknown>): string {
    const formattedQuery = this.options.formatSql ? TextFormatter.formatSql(query) : query;
    const stringified = TextFormatter.stringifyParameters(parameters);
    const result = stringified !== undefined ? `${formattedQuery} -- PARAMETERS: ${stringified}` : formattedQuery;
    return this.options.highlightSql ? PlatformTools.highlightSql(result) : result;
  }

  private static formatSql(query: string): string {
    // PlatformTools.formatSql is not available in older versions of TypeORM
    return typeof PlatformTools.formatSql === 'function' ? PlatformTools.formatSql(query) : query;
  }

  private static stringifyParameters(parameters?: unknown[] | Record<string, unknown>): string | undefined {
    if (parameters === undefined || parameters === null) {
      return undefined;
    }

    const isEmpty = Array.isArray(parameters) ? parameters.length === 0 : Object.keys(parameters).length === 0;
    if (isEmpty) {
      return undefined;
    }

    try {
      return JSON.stringify(parameters);
    } catch {
      // JSON.stringify fails if the parameters contain circular references
      return String(parameters);
    }
  }
}
