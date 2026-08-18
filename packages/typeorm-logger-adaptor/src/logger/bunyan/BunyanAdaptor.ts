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

export interface BunyanAdaptorOptions {
  /** Sets true to enable SQL formatting (pretty-printing). */
  formatSql?: boolean;
  /** Bunyan log levels that each logger method of the TypeORM uses. */
  logLevelMapping?: BunyanLogLevelMapping;
}

export class BunyanAdaptor extends TypeOrmLoggerBase {
  /**
   * Creates a new Bunyan adaptor.
   *
   * @constructor
   * @param {Logger} logger - The instance of the Bunyan logger.
   * @param {TypeOrmLoggerOptions} options - LoggerOptions of the TypeORM.
   * @param {BunyanAdaptorOptions} adaptorOptions - Options of this adaptor.
   */
  constructor(logger: Logger, options: TypeOrmLoggerOptions, adaptorOptions?: BunyanAdaptorOptions);
  /**
   * Creates a new Bunyan adaptor.
   *
   * @deprecated Use the options object form instead: `new BunyanAdaptor(logger, options, {logLevelMapping: ...})`.
   * @constructor
   * @param {Logger} logger - The instance of the Bunyan logger.
   * @param {TypeOrmLoggerOptions} options - LoggerOptions of the TypeORM.
   * @param {BunyanLogLevelMapping} logLevelMapping - Bunyan log levels that each logger method of the TypeORM uses.
   */
  constructor(logger: Logger, options: TypeOrmLoggerOptions, logLevelMapping?: BunyanLogLevelMapping);
  constructor(
    logger: Logger,
    options: TypeOrmLoggerOptions,
    adaptorOptionsOrLogLevelMapping?: BunyanAdaptorOptions | BunyanLogLevelMapping,
  ) {
    const adaptorOptions = BunyanAdaptor.toAdaptorOptions(adaptorOptionsOrLogLevelMapping);
    super(
      BunyanAdaptor.toLoggerMethods(logger, adaptorOptions.logLevelMapping),
      new TextFormatter({formatSql: adaptorOptions.formatSql}),
      options,
    );
  }

  private static toAdaptorOptions(value?: BunyanAdaptorOptions | BunyanLogLevelMapping): BunyanAdaptorOptions {
    if (value === undefined || value === null) {
      return {};
    }
    return BunyanAdaptor.isLogLevelMapping(value) ? {logLevelMapping: value} : value;
  }

  private static isLogLevelMapping(
    value: BunyanAdaptorOptions | BunyanLogLevelMapping,
  ): value is BunyanLogLevelMapping {
    // BunyanLogLevelMapping requires all of these keys, while BunyanAdaptorOptions has none of them
    return 'log' in value && 'info' in value && 'warn' in value && 'error' in value;
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

  protected _logQuery(query: string, parameters?: unknown[] | Record<string, unknown>): void {
    this.loggerMethods.query({type: 'Query'}, this.formatter.formatQuery(query, parameters));
  }

  protected _logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[] | Record<string, unknown>,
  ): void {
    const message = this.formatter.formatQueryError(error, query, parameters);
    if (error instanceof Error) {
      this.loggerMethods.queryError({type: 'QueryError', err: Logger.stdSerializers.err(error)}, message);
    } else {
      this.loggerMethods.queryError({type: 'QueryError'}, `${message}. ${error}`);
    }
  }

  protected _logQuerySlow(time: number, query: string, parameters?: unknown[] | Record<string, unknown>): void {
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
