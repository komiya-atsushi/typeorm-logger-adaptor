import { LoggerOptions as TypeOrmLoggerOptions } from 'typeorm/logger/LoggerOptions';
import { LeveledLogMethod, Logger as WinstonLogger } from 'winston';

import { LoggerMethods, TypeOrmLoggerBase } from '../../core/TypeOrmLoggerBase';
import { TextFormatter } from '../../core/formatter/TextFormatter';

export interface WinstonLoggerMethodMapping {
  log: LeveledLogMethod;
  info: LeveledLogMethod;
  warn: LeveledLogMethod;
  error: LeveledLogMethod;

  query?: LeveledLogMethod;
  queryError?: LeveledLogMethod;
  querySlow?: LeveledLogMethod;
  schemaBuild?: LeveledLogMethod;
  migration?: LeveledLogMethod;
}

export class WinstonAdaptor extends TypeOrmLoggerBase {
  /**
   * Creates a new Winston adaptor.
   *
   * @constructor
   * @param {WinstonLogger} logger - The logger instance of the Winston logger.
   * @param {TypeOrmLoggerOptions} options - LoggerOptions of the TypeORM.
   * @param {boolean} highlightSqlEnabled - Sets true to enable SQL highlighting.
   * @param {WinstonLoggerMethodMapping} loggerMethodMapping - Mappings between Winston logger methods and TypeORM logger methods.
   */
  constructor(
    logger: WinstonLogger,
    options: TypeOrmLoggerOptions,
    highlightSqlEnabled = false,
    loggerMethodMapping?: WinstonLoggerMethodMapping
  ) {
    super(WinstonAdaptor.toLoggerMethods(logger, loggerMethodMapping), new TextFormatter(highlightSqlEnabled), options);
  }

  static toLoggerMethods(
    logger: WinstonLogger,
    logLevelMapping: WinstonLoggerMethodMapping | undefined
  ): LoggerMethods {
    if (logLevelMapping === undefined) {
      // syslog levels do not have 'warn' level, so use 'warning' level instead
      const warn =
        logger.warn !== undefined
          ? (first: unknown, ...rest: unknown[]) => logger.warn(first as string, ...rest)
          : (first: unknown, ...rest: unknown[]) => logger.warning(first as string, ...rest);

      return this.createLoggerMethods({
        log: (first: unknown, ...rest: unknown[]) => logger.debug(first as string, ...rest),
        info: (first: unknown, ...rest: unknown[]) => logger.info(first as string, ...rest),
        warn,
        error: (first: unknown, ...rest: unknown[]) => logger.error(first as string, ...rest),
      });
    }

    const { log, info, warn, error, query, queryError, querySlow, schemaBuild, migration } = logLevelMapping;
    const result = this.createLoggerMethods({
      log: (first: unknown, ...rest: unknown[]) => log(first as string, ...rest),
      info: (first: unknown, ...rest: unknown[]) => info(first as string, ...rest),
      warn: (first: unknown, ...rest: unknown[]) => warn(first as string, ...rest),
      error: (first: unknown, ...rest: unknown[]) => error(first as string, ...rest),
    });

    if (query !== undefined) {
      result.query = (first: unknown, ...rest: unknown[]) => query(first as string, ...rest);
    }
    if (queryError !== undefined) {
      result.queryError = (first: unknown, ...rest: unknown[]) => queryError(first as string, ...rest);
    }
    if (querySlow !== undefined) {
      result.querySlow = (first: unknown, ...rest: unknown[]) => querySlow(first as string, ...rest);
    }
    if (schemaBuild !== undefined) {
      result.schemaBuild = (first: unknown, ...rest: unknown[]) => schemaBuild(first as string, ...rest);
    }
    if (migration !== undefined) {
      result.migration = (first: unknown, ...rest: unknown[]) => migration(first as string, ...rest);
    }

    return result;
  }
}
