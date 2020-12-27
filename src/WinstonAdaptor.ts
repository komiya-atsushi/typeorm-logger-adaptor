import { LoggerOptions as TypeOrmLoggerOptions } from 'typeorm/logger/LoggerOptions';
import { Logger as WinstonLogger } from 'winston';

import { TypeOrmLoggerBase } from './TypeOrmLoggerBase';
import { Formatter } from './formatter/Formatter';
import { TextFormatter } from './formatter/TextFormatter';

export class WinstonAdaptor extends TypeOrmLoggerBase {
  constructor(logger: WinstonLogger, options?: TypeOrmLoggerOptions, formatter: Formatter = new TextFormatter()) {
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
