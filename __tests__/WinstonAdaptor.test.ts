import { mock, mockReset } from 'jest-mock-extended';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import * as winston from 'winston';
import { WinstonAdaptor } from '../src';
import { allLoggerOptions, otherLoggerOptions } from './LoggingOptions';

const mockStream = mock<NodeJS.WritableStream>();
beforeEach(() => {
  mockReset(mockStream);
});

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [new winston.transports.Stream({ stream: mockStream })],
});

describe('logQuery()', () => {
  const enabledOptions: LoggerOptions[] = [true, 'all', ['query']];

  test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQuery('select 1');

    expect(mockStream.write).toHaveBeenCalledWith('info: query: select 1\n');
  });

  test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQuery('select ?', [1]);

    expect(mockStream.write).toHaveBeenCalledWith('info: query: select ? -- PARAMETERS: [1]\n');
  });

  test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQuery('select 1');

    expect(mockStream.write).not.toBeCalled();
  });
});

describe('logQueryError()', () => {
  const enabledOptions: LoggerOptions[] = [true, 'all', ['error']];

  test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQueryError(
      new Error("Table 'test.Y' doesn't exist"),
      'select X from Y'
    );

    expect(mockStream.write).toHaveBeenCalledWith('error: query failed: select X from Y\n');
  });

  test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQueryError(
      new Error("Table 'test.Y' doesn't exist"),
      'select ? from Y',
      [1]
    );

    expect(mockStream.write).toHaveBeenCalledWith('error: query failed: select ? from Y -- PARAMETERS: [1]\n');
  });

  test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQueryError(
      new Error("Table 'test.Y' doesn't exist"),
      'select X from Y'
    );

    expect(mockStream.write).not.toBeCalled();
  });
});

describe('logQuerySlow()', () => {
  const enabledOptions: LoggerOptions[] = allLoggerOptions;

  test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(2)');

    expect(mockStream.write).toHaveBeenCalledWith(
      'warn: query is slow: execution time = 2000, query = select sleep(2)\n'
    );
  });

  test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(?)', [2]);

    expect(mockStream.write).toHaveBeenCalledWith(
      'warn: query is slow: execution time = 2000, query = select sleep(?) -- PARAMETERS: [2]\n'
    );
  });
});

describe('logSchemaBuild()', () => {
  const enabledOptions: LoggerOptions[] = [true, 'all', ['schema']];

  test.each<LoggerOptions>(enabledOptions)('LoggerOptions = %s', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logSchemaBuild('creating a new table: memo');

    expect(mockStream.write).toHaveBeenCalledWith('debug: creating a new table: memo\n');
  });

  test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logSchemaBuild('creating a new table: memo');

    expect(mockStream.write).not.toBeCalled();
  });
});

describe('logMigration()', () => {
  const enabledOptions: LoggerOptions[] = [true, 'all', ['migration']];

  test.each<LoggerOptions>(enabledOptions)('LoggerOptions = %s', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logMigration('(migration message)');

    expect(mockStream.write).toHaveBeenCalledWith('debug: (migration message)\n');
  });

  test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
    new WinstonAdaptor(logger, loggerOptions).logMigration('(migration message)');

    expect(mockStream.write).not.toBeCalled();
  });
});
