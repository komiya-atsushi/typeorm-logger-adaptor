import { QueryRunner } from 'typeorm';
import { Logger } from 'typeorm/logger/Logger';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { Formatter } from './formatter/Formatter';

export type LoggerMethod = (message: string, ...rest: unknown[]) => void;

export interface LoggerMethods {
  log: LoggerMethod;
  info: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
}

export abstract class TypeOrmLoggerBase implements Logger {
  private static readonly NOOP: LoggerMethod = () => {
    return;
  };
  private readonly logQueryEnabled: boolean;
  private readonly logQueryErrorEnabled: boolean;
  private readonly logSchemaBuildEnabled: boolean;
  private readonly logMigrationEnabled: boolean;
  private readonly loggerMethodsForLog: LoggerMethods;

  protected constructor(
    private readonly loggerMethods: LoggerMethods,
    private readonly formatter: Formatter,
    private readonly options?: LoggerOptions
  ) {
    this.logQueryEnabled =
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('query') !== -1);
    this.logQueryErrorEnabled =
      this.options === 'all' ||
      this.options === true ||
      (this.options instanceof Array && this.options.indexOf('error') !== -1);
    this.logSchemaBuildEnabled =
      this.options === 'all' || (this.options instanceof Array && this.options.indexOf('schema') !== -1);
    this.logMigrationEnabled =
      this.options === 'all' || (this.options instanceof Array && this.options.indexOf('migration') !== -1);

    const noop = TypeOrmLoggerBase.NOOP;
    this.loggerMethodsForLog = {
      log:
        this.options === 'all' || (this.options instanceof Array && this.options.indexOf('log') !== -1)
          ? loggerMethods.log
          : noop,
      info:
        this.options === 'all' || (this.options instanceof Array && this.options.indexOf('info') !== -1)
          ? loggerMethods.info
          : noop,
      warn:
        this.options === 'all' || (this.options instanceof Array && this.options.indexOf('warn') !== -1)
          ? loggerMethods.warn
          : noop,
      error: noop,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    if (this.logQueryEnabled) {
      this.loggerMethods.info(this.formatter.formatQuery(query, parameters));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    if (this.logQueryErrorEnabled) {
      this.loggerMethods.error(this.formatter.formatQueryError(error, query, parameters), error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): any {
    this.loggerMethods.warn(this.formatter.formatQuerySlow(time, query, parameters));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logSchemaBuild(message: string, queryRunner?: QueryRunner): any {
    if (this.logSchemaBuildEnabled) {
      this.loggerMethods.log(message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  logMigration(message: string, queryRunner?: QueryRunner): any {
    if (this.logMigrationEnabled) {
      this.loggerMethods.log(message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner): any {
    this.loggerMethodsForLog[level](message);
  }
}
