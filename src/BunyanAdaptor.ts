import Logger from 'bunyan';
import { LoggerOptions as TypeOrmLoggerOptions } from 'typeorm/logger/LoggerOptions';

import { TypeOrmLoggerBase } from './TypeOrmLoggerBase';
import { Formatter } from './formatter/Formatter';
import { TextFormatter } from './formatter/TextFormatter';

export class BunyanAdaptor extends TypeOrmLoggerBase {
  constructor(logger: Logger, options?: TypeOrmLoggerOptions, formatter: Formatter = new TextFormatter()) {
    super(
      {
        log: (message: string, ...rest: unknown[]) => logger.debug(message, ...rest),
        info: (message: string, ...rest: unknown[]) => logger.info(message, ...rest),
        warn: (message: string, ...rest: unknown[]) => logger.warn(message, ...rest),
        error: (message: string, ...rest: unknown[]) => logger.error(message, ...rest),
      },
      formatter,
      options
    );
  }
}
