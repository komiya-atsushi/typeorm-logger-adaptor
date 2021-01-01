import { QueryRunner } from 'typeorm';
import { Logger } from 'typeorm/logger/Logger';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { Formatter } from './formatter/Formatter';

export type LoggerMethod = (first: unknown, ...rest: unknown[]) => void;

export interface BasicLoggerMethods {
  log: LoggerMethod;
  info: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
}

export interface LoggerMethods extends BasicLoggerMethods {
  query: LoggerMethod;
  queryError: LoggerMethod;
  querySlow: LoggerMethod;
  schemaBuild: LoggerMethod;
  migration: LoggerMethod;
}

function isLoggerMethods(loggerMethods: BasicLoggerMethods | LoggerMethods): loggerMethods is LoggerMethods {
  const t = loggerMethods as LoggerMethods;
  return (
    t.query !== undefined &&
    t.queryError !== undefined &&
    t.querySlow !== undefined &&
    t.schemaBuild !== undefined &&
    t.migration !== undefined
  );
}

export abstract class TypeOrmLoggerBase implements Logger {
  private static readonly NOOP: LoggerMethod = () => {
    return;
  };
  protected readonly loggerMethods: LoggerMethods;

  protected constructor(
    loggerMethods: LoggerMethods,
    protected readonly formatter: Formatter,
    options?: LoggerOptions
  ) {
    this.loggerMethods = Object.assign(loggerMethods);

    const array: ('query' | 'schema' | 'error' | 'warn' | 'info' | 'log' | 'migration')[] =
      options instanceof Array ? options : [];

    if (options !== 'all' && options !== true) {
      if (!array.includes('query')) {
        this.loggerMethods.query = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('error')) {
        this.loggerMethods.queryError = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('schema')) {
        this.loggerMethods.schemaBuild = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('migration')) {
        this.loggerMethods.migration = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('warn')) {
        this.loggerMethods.warn = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('info')) {
        this.loggerMethods.info = TypeOrmLoggerBase.NOOP;
      }
      if (!array.includes('log')) {
        this.loggerMethods.log = TypeOrmLoggerBase.NOOP;
      }
    }
  }

  protected static createLoggerMethods(loggerMethods: LoggerMethods | BasicLoggerMethods): LoggerMethods {
    if (isLoggerMethods(loggerMethods)) {
      return loggerMethods;
    }

    const result = {
      log: loggerMethods.log,
      info: loggerMethods.info,
      warn: loggerMethods.warn,
      error: loggerMethods.error,
    } as LoggerMethods;

    result.query = result.info;
    result.queryError = result.error;
    result.querySlow = result.warn;
    result.schemaBuild = result.log;
    result.migration = result.log;

    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this._logQuery(query, parameters);
  }

  protected _logQuery(query: string, parameters?: unknown[]): void {
    this.loggerMethods.query(this.formatter.formatQuery(query, parameters));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this._logQueryError(error, query, parameters);
  }

  protected _logQueryError(error: string | Error, query: string, parameters?: unknown[]): void {
    this.loggerMethods.queryError(this.formatter.formatQueryError(error, query, parameters), error);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this._logQuerySlow(time, query, parameters);
  }

  protected _logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    this.loggerMethods.querySlow(this.formatter.formatQuerySlow(time, query, parameters));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    this._logSchemaBuild(message);
  }

  protected _logSchemaBuild(message: string): void {
    this.loggerMethods.schemaBuild(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logMigration(message: string, queryRunner?: QueryRunner): any {
    this._logMigration(message);
  }

  protected _logMigration(message: string): void {
    this.loggerMethods.migration(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.loggerMethods[level](message);
  }
}
