import * as bunyan from 'bunyan';
import { mock, mockReset } from 'jest-mock-extended';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { BunyanAdaptor } from '../../src/logger/bunyan';
import { allLoggerOptions, otherLoggerOptions } from '../LoggingOptions';

const mockRingBuffer = mock<bunyan.RingBuffer>();
beforeEach(() => {
  mockReset(mockRingBuffer);
});

const loggerName = 'test-logger';

describe('Each logger method', () => {
  const logger = bunyan.createLogger({
    name: loggerName,
    level: 'trace',
    streams: [{ type: 'raw', stream: mockRingBuffer }],
  });

  describe('logQuery()', () => {
    const enabledOptions: LoggerOptions[] = [true, 'all', ['query']];

    test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQuery('select 1');

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'Query',
        hostname: expect.any(String),
        level: bunyan.INFO,
        msg: 'query: select 1',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQuery('select ?', [1]);

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'Query',
        hostname: expect.any(String),
        level: bunyan.INFO,
        msg: 'query: select ? -- PARAMETERS: [1]',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQuery('select 1');

      expect(mockRingBuffer.write).not.toHaveBeenCalled();
    });
  });

  describe('logQueryError()', () => {
    const enabledOptions: LoggerOptions[] = [true, 'all', ['error']];

    test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select X from Y'
      );

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'QueryError',
        hostname: expect.any(String),
        level: bunyan.ERROR,
        msg: 'query failed: select X from Y',
        err: {
          message: "Table 'test.Y' doesn't exist",
          name: 'Error',
          stack: expect.stringMatching(/^Error: Table 'test.Y' doesn't exist\n {4}at .*/m),
          signal: undefined,
          code: undefined,
        },
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select ? from Y',
        [1]
      );

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'QueryError',
        hostname: expect.any(String),
        level: bunyan.ERROR,
        msg: 'query failed: select ? from Y -- PARAMETERS: [1]',
        err: {
          message: "Table 'test.Y' doesn't exist",
          name: 'Error',
          stack: expect.stringMatching(/^Error: Table 'test.Y' doesn't exist\n {4}at .*/m),
          signal: undefined,
          code: undefined,
        },
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQueryError(
        new Error("Table 'test.Y' doesn't exist"),
        'select X from Y'
      );

      expect(mockRingBuffer.write).not.toHaveBeenCalled();
    });
  });

  describe('logQuerySlow()', () => {
    const enabledOptions: LoggerOptions[] = allLoggerOptions;

    test.each<LoggerOptions>(enabledOptions)('w/o parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(2)');

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'QuerySlow',
        hostname: expect.any(String),
        level: bunyan.WARN,
        msg: 'query is slow: execution time = 2000, query = select sleep(2)',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        executionTime: 2000,
        v: 0,
      });
    });

    test.each<LoggerOptions>(enabledOptions)('with parameters (LoggerOptions = %s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logQuerySlow(2000, 'select sleep(?)', [2]);

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'QuerySlow',
        hostname: expect.any(String),
        level: bunyan.WARN,
        msg: 'query is slow: execution time = 2000, query = select sleep(?) -- PARAMETERS: [2]',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        executionTime: 2000,
        v: 0,
      });
    });
  });

  describe('logSchemaBuild()', () => {
    const enabledOptions: LoggerOptions[] = [true, 'all', ['schema']];

    test.each<LoggerOptions>(enabledOptions)('LoggerOptions = %s', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logSchemaBuild('creating a new table: memo');

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'SchemaBuild',
        hostname: expect.any(String),
        level: bunyan.DEBUG,
        msg: 'creating a new table: memo',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logSchemaBuild('creating a new table: memo');

      expect(mockRingBuffer.write).not.toHaveBeenCalled();
    });
  });

  describe('logMigration()', () => {
    const enabledOptions: LoggerOptions[] = [true, 'all', ['migration']];

    test.each<LoggerOptions>(enabledOptions)('LoggerOptions = %s', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logMigration('(migration message)');

      expect(mockRingBuffer.write).toHaveBeenCalledWith({
        type: 'Migration',
        hostname: expect.any(String),
        level: bunyan.DEBUG,
        msg: '(migration message)',
        name: loggerName,
        pid: expect.any(Number),
        time: expect.any(Date),
        v: 0,
      });
    });

    test.each<LoggerOptions>(otherLoggerOptions(enabledOptions))('other LoggerOptions (%s)', (loggerOptions) => {
      new BunyanAdaptor(logger, loggerOptions).logMigration('(migration message)');

      expect(mockRingBuffer.write).not.toHaveBeenCalled();
    });
  });
});

describe('Customized logger methods', () => {
  const logger = bunyan.createLogger({
    name: loggerName,
    level: 'info',
    streams: [{ type: 'raw', stream: mockRingBuffer }],
  });

  function invokeLoggerMethods(adaptor: BunyanAdaptor): void {
    adaptor.logQuery('select 1');
    adaptor.logQueryError(new Error('Error message'), 'select X from Y');
    adaptor.logQuerySlow(2000, 'select sleep(2)');
    adaptor.logSchemaBuild('creating a new table: memo');
    adaptor.logMigration('(migration message)');
  }

  test('Default log level methods', () => {
    invokeLoggerMethods(new BunyanAdaptor(logger, 'all'));

    expect(mockRingBuffer.write).toHaveBeenCalledTimes(3);
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(1, {
      type: 'Query',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: 'query: select 1',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(2, {
      type: 'QueryError',
      hostname: expect.any(String),
      level: bunyan.ERROR,
      msg: 'query failed: select X from Y',
      err: expect.any(Object),
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(3, {
      type: 'QuerySlow',
      hostname: expect.any(String),
      level: bunyan.WARN,
      msg: 'query is slow: execution time = 2000, query = select sleep(2)',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      executionTime: 2000,
      v: 0,
    });
  });

  test('DEBUG log level methods', () => {
    invokeLoggerMethods(
      new BunyanAdaptor(logger, 'all', {
        log: 'debug',
        info: 'debug',
        warn: 'debug',
        error: 'debug',
      })
    );

    expect(mockRingBuffer.write).not.toHaveBeenCalled();
  });

  test('INFO log level methods', () => {
    invokeLoggerMethods(
      new BunyanAdaptor(logger, 'all', {
        log: 'info',
        info: 'info',
        warn: 'info',
        error: 'info',
        query: 'info',
        queryError: 'info',
      })
    );

    expect(mockRingBuffer.write).toHaveBeenCalledTimes(5);
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(1, {
      type: 'Query',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: 'query: select 1',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(2, {
      type: 'QueryError',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: 'query failed: select X from Y',
      err: expect.any(Object),
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(3, {
      type: 'QuerySlow',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: 'query is slow: execution time = 2000, query = select sleep(2)',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      executionTime: 2000,
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(4, {
      type: 'SchemaBuild',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: 'creating a new table: memo',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
    expect(mockRingBuffer.write).toHaveBeenNthCalledWith(5, {
      type: 'Migration',
      hostname: expect.any(String),
      level: bunyan.INFO,
      msg: '(migration message)',
      name: loggerName,
      pid: expect.any(Number),
      time: expect.any(Date),
      v: 0,
    });
  });
});
