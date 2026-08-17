import {PlatformTools} from 'typeorm/platform/PlatformTools';

import type {Formatter} from './Formatter';

export class TextFormatter implements Formatter {
  constructor(private readonly highlightEnabled: boolean = false) {}

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
    const stringified = TextFormatter.stringifyParameters(parameters);
    const result = stringified !== undefined ? `${query} -- PARAMETERS: ${stringified}` : query;
    return this.highlightEnabled ? PlatformTools.highlightSql(result) : result;
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
