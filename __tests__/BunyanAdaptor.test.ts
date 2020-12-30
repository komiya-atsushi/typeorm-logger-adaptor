import * as bunyan from 'bunyan';
import { mock, mockReset } from 'jest-mock-extended';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { BunyanAdaptor } from '../src';
import { allLoggerOptions, otherLoggerOptions } from './LoggingOptions';

const mockRingBuffer = mock<bunyan.RingBuffer>();
beforeEach(() => {
  mockReset(mockRingBuffer);
});

const loggerName = 'test-logger';
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

    expect(mockRingBuffer.write).not.toBeCalled();
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

    expect(mockRingBuffer.write).not.toBeCalled();
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

    expect(mockRingBuffer.write).not.toBeCalled();
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

    expect(mockRingBuffer.write).not.toBeCalled();
  });
});
