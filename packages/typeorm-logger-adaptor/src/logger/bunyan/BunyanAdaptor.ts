import Logger from 'bunyan';
import type {LoggerOptions as TypeOrmLoggerOptions} from 'typeorm/logger/LoggerOptions';
import {TextFormatter} from '../../core/formatter/TextFormatter';
import {type LoggerMethods, TypeOrmLoggerBase} from '../../core/TypeOrmLoggerBase';

export interface BunyanLogLevelMapping {
  log: Logger.LogLevelString;
  info: Logger.LogLevelString;
  warn: Logger.LogLevelString;
  error: Logger.LogLevelString;
  query?: Logger.LogLevelString;
  queryError?: Logger.LogLevelString;
  querySlow?: Logger.LogLevelString;
  schemaBuild?: Logger.LogLevelString;
  migration?: Logger.LogLevelString;
}

export class BunyanAdaptor extends TypeOrmLoggerBase {
  /**
   * Creates a new Bunyan adaptor.
   *
   * @constructor
   * @param {Logger} logger - The instance of the Bunyan logger.
   * @param {TypeOrmLoggerOptions} options - LoggerOptions of the TypeORM.
   * @param {BunyanLogLevelMapping} logLevelMapping - Bunyan log levels that each logger method of the TypeORM uses.
   */
  constructor(logger: Logger, options: TypeOrmLoggerOptions, logLevelMapping?: BunyanLogLevelMapping) {
    super(BunyanAdaptor.toLoggerMethods(logger, logLevelMapping), new TextFormatter(), options);
  }

  static toLoggerMethods(logger: Logger, logLevelMapping: BunyanLogLevelMapping | undefined): LoggerMethods {
    if (logLevelMapping === undefined) {
      return BunyanAdaptor.createLoggerMethods({
        log: (first: unknown, ...rest: unknown[]) => logger.debug(first, ...rest),
        info: (first: unknown, ...rest: unknown[]) => logger.info(first, ...rest),
        warn: (first: unknown, ...rest: unknown[]) => logger.warn(first, ...rest),
        error: (first: unknown, ...rest: unknown[]) => logger.error(first, ...rest),
      });
    }

    const {log, info, warn, error, query, queryError, querySlow, schemaBuild, migration} = logLevelMapping;
    const result = BunyanAdaptor.createLoggerMethods({
      log: (first: unknown, ...rest: unknown[]) => logger[log](first, ...rest),
      info: (first: unknown, ...rest: unknown[]) => logger[info](first, ...rest),
      warn: (first: unknown, ...rest: unknown[]) => logger[warn](first, ...rest),
      error: (first: unknown, ...rest: unknown[]) => logger[error](first, ...rest),
    });

    if (query !== undefined) {
      result.query = (first: unknown, ...rest: unknown[]) => logger[query](first, ...rest);
    }
    if (queryError !== undefined) {
      result.queryError = (first: unknown, ...rest: unknown[]) => logger[queryError](first, ...rest);
    }
    if (querySlow !== undefined) {
      result.querySlow = (first: unknown, ...rest: unknown[]) => logger[querySlow](first, ...rest);
    }
    if (schemaBuild !== undefined) {
      result.schemaBuild = (first: unknown, ...rest: unknown[]) => logger[schemaBuild](first, ...rest);
    }
    if (migration !== undefined) {
      result.migration = (first: unknown, ...rest: unknown[]) => logger[migration](first, ...rest);
    }

    return result;
  }

  protected _logQuery(query: string, parameters?: unknown[]): void {
    this.loggerMethods.query({type: 'Query'}, this.formatter.formatQuery(query, parameters));
  }

  protected _logQueryError(error: string | Error, query: string, parameters?: unknown[]): void {
    const message = this.formatter.formatQueryError(error, query, parameters);
    if (error instanceof Error) {
      this.loggerMethods.queryError({type: 'QueryError', err: Logger.stdSerializers.err(error)}, message);
    } else {
      this.loggerMethods.queryError({type: 'QueryError'}, `${message}. ${error}`);
    }
  }

  protected _logQuerySlow(time: number, query: string, parameters?: unknown[]): void {
    this.loggerMethods.querySlow(
      {type: 'QuerySlow', executionTime: time},
      this.formatter.formatQuerySlow(time, query, parameters),
    );
  }

  protected _logSchemaBuild(message: string): void {
    this.loggerMethods.schemaBuild({type: 'SchemaBuild'}, message);
  }

  protected _logMigration(message: string): void {
    this.loggerMethods.migration({type: 'Migration'}, message);
  }
}
