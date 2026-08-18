import type {LoggerOptions} from 'typeorm/logger/LoggerOptions';
import {WinstonAdaptor} from 'typeorm-logger-adaptor/logger/winston';
import {beforeEach, describe, expect, test} from 'vitest';
import * as winston from 'winston';
import {allLoggerOptions, otherLoggerOptions} from '../LoggingOptions';
import {createMockStream} from '../MockStream';

const mockStream = createMockStream();

beforeEach(() => {
  mockStream.clearMock();
});

describe('Each logger method', () => {
  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Stream({stream: mockStream})],
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

    test.each<LoggerOptions>(enabledOptions)('with object parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQuery('select :id', {id: 1});

      expect(mockStream.write).toHaveBeenCalledWith('info: query: select :id -- PARAMETERS: {"id":1}\n');
    });

    test.each<LoggerOptions>(enabledOptions)('with empty object parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQuery('select 1', {});

      expect(mockStream.write).toHaveBeenCalledWith('info: query: select 1\n');
    });

    test.each<LoggerOptions>(enabledOptions)(
      'with circular reference object parameters (LoggerOptions = %s)',
      (loggerOptions) => {
        const parameters: Record<string, unknown> = {id: 1};
        parameters.self = parameters;

        new WinstonAdaptor(logger, loggerOptions).logQuery('select :id', parameters);

        expect(mockStream.write).toHaveBeenCalledWith('info: query: select :id -- PARAMETERS: [object Object]\n');
      },
    );

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQuery('select 1');

      expect(mockStream.write).not.toHaveBeenCalled();
    });
  });

  describe('logQueryError()', () => {
    const enabledOptions: LoggerOptions[] = [true, 'all', ['error']];

    test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select X from Y',
      );

      expect(mockStream.write).toHaveBeenCalledWith(expect.stringMatching(/error: query failed: select X from Y.*/));
    });

    test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select ? from Y',
        [1],
      );

      expect(mockStream.write).toHaveBeenCalledWith(
        expect.stringMatching(/error: query failed: select \? from Y -- PARAMETERS: \[1].*/),
      );
    });

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select X from Y',
      );

      expect(mockStream.write).not.toHaveBeenCalled();
    });
  });

  describe('logQuerySlow()', () => {
    const enabledOptions: LoggerOptions[] = allLoggerOptions;

    test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(2)');

      expect(mockStream.write).toHaveBeenCalledWith(
        'warn: query is slow: execution time = 2000, query = select sleep(2)\n',
      );
    });

    test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
      new WinstonAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(?)', [2]);

      expect(mockStream.write).toHaveBeenCalledWith(
        'warn: query is slow: execution time = 2000, query = select sleep(?) -- PARAMETERS: [2]\n',
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

      expect(mockStream.write).not.toHaveBeenCalled();
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

      expect(mockStream.write).not.toHaveBeenCalled();
    });
  });
});

describe('Customized logger methods', () => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Stream({stream: mockStream})],
  });

  function invokeLoggerMethods(adaptor: WinstonAdaptor): void {
    adaptor.logQuery('select 1');
    adaptor.logQueryError(new Error('Error message'), 'select X from Y');
    adaptor.logQuerySlow(2000, 'select sleep(2)');
    adaptor.logSchemaBuild('creating a new table: memo');
    adaptor.logMigration('(migration message)');
  }

  test('Default log level methods', () => {
    invokeLoggerMethods(new WinstonAdaptor(logger, 'all'));

    expect(mockStream.write).toHaveBeenCalledTimes(3);
    expect(mockStream.write).toHaveBeenNthCalledWith(1, 'info: query: select 1\n');
    expect(mockStream.write).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/error: query failed: select X from Y.*/),
    );
    expect(mockStream.write).toHaveBeenNthCalledWith(
      3,
      'warn: query is slow: execution time = 2000, query = select sleep(2)\n',
    );
  });

  test('DEBUG log level methods', () => {
    invokeLoggerMethods(
      new WinstonAdaptor(logger, 'all', false, {
        log: logger.debug,
        info: logger.debug,
        warn: logger.debug,
        error: logger.debug,
      }),
    );

    expect(mockStream.write).not.toHaveBeenCalled();
  });

  test('INFO log level methods', () => {
    invokeLoggerMethods(
      new WinstonAdaptor(logger, 'all', false, {
        log: logger.info,
        info: logger.info,
        warn: logger.info,
        error: logger.info,
        query: logger.info,
        queryError: logger.info,
      }),
    );

    expect(mockStream.write).toHaveBeenCalledTimes(5);
    expect(mockStream.write).toHaveBeenNthCalledWith(1, 'info: query: select 1\n');
    expect(mockStream.write).toHaveBeenNthCalledWith(2, expect.stringMatching(/info: query failed: select X from Y.*/));
    expect(mockStream.write).toHaveBeenNthCalledWith(
      3,
      'info: query is slow: execution time = 2000, query = select sleep(2)\n',
    );
    expect(mockStream.write).toHaveBeenNthCalledWith(4, 'info: creating a new table: memo\n');
    expect(mockStream.write).toHaveBeenNthCalledWith(5, 'info: (migration message)\n');
  });
});

describe('Adaptor options', () => {
  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Stream({stream: mockStream})],
  });

  test('formatSql: logQuery()', () => {
    new WinstonAdaptor(logger, 'all', {formatSql: true}).logQuery('SELECT count(1) FROM user WHERE name = ?', ['Taro']);

    expect(mockStream.write).toHaveBeenCalledWith(
      'info: query: SELECT count(1)\nFROM user\nWHERE name = ? -- PARAMETERS: ["Taro"]\n',
    );
  });

  test('formatSql: logQueryError()', () => {
    new WinstonAdaptor(logger, 'all', {formatSql: true}).logQueryError(
      new Error("Table 'test.user' doesn't exist"),
      'SELECT count(1) FROM user WHERE name = ?',
      ['Taro'],
    );

    expect(mockStream.write).toHaveBeenCalledWith(
      expect.stringMatching(
        /^error: query failed: SELECT count\(1\)\nFROM user\nWHERE name = \? -- PARAMETERS: \["Taro"]/,
      ),
    );
  });

  test('formatSql is disabled by default', () => {
    new WinstonAdaptor(logger, 'all', {}).logQuery('SELECT count(1) FROM user WHERE name = ?');

    expect(mockStream.write).toHaveBeenCalledWith('info: query: SELECT count(1) FROM user WHERE name = ?\n');
  });

  test('loggerMethodMapping', () => {
    const adaptor = new WinstonAdaptor(logger, 'all', {
      loggerMethodMapping: {
        log: logger.info,
        info: logger.info,
        warn: logger.info,
        error: logger.info,
      },
    });
    adaptor.logSchemaBuild('creating a new table: memo');

    expect(mockStream.write).toHaveBeenCalledWith('info: creating a new table: memo\n');
  });
});

describe('Using syslog levels', () => {
  const logger = winston.createLogger({
    levels: winston.config.syslog.levels,
    level: 'debug',
    format: winston.format.simple(),
    transports: [new winston.transports.Stream({stream: mockStream})],
  });

  test('logQuery()', () => {
    new WinstonAdaptor(logger, 'all').logQuery('select 1');

    expect(mockStream.write).toHaveBeenCalledWith('info: query: select 1\n');
  });

  test('logQueryError()', () => {
    new WinstonAdaptor(logger, 'all').logQueryError(new Error('Error message'), 'select X from Y');

    expect(mockStream.write).toHaveBeenCalledWith(expect.stringMatching(/error: query failed: select X from Y.*/));
  });

  test('logQuerySlow()', () => {
    new WinstonAdaptor(logger, 'all').logQuerySlow(2000, 'select sleep(2)');

    expect(mockStream.write).toHaveBeenCalledWith(
      'warning: query is slow: execution time = 2000, query = select sleep(2)\n',
    );
  });

  test('logSchemaBuild()', () => {
    new WinstonAdaptor(logger, 'all').logSchemaBuild('creating a new table: memo');

    expect(mockStream.write).toHaveBeenCalledWith('debug: creating a new table: memo\n');
  });

  test('logMigration()', () => {
    new WinstonAdaptor(logger, 'all').logMigration('(migration message)');

    expect(mockStream.write).toHaveBeenCalledWith('debug: (migration message)\n');
  });
});
