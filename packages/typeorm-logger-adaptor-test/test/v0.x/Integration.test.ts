import 'reflect-metadata';
import {DataSource} from 'typeorm';
import type {LoggerOptions} from 'typeorm/logger/LoggerOptions';
import {WinstonAdaptor} from 'typeorm-logger-adaptor/winston';
import {afterAll, beforeAll, beforeEach, expect, test, vi} from 'vitest';
import type {Logger} from 'winston';

import {DatabaseFixture} from '../common/DatabaseFixture';
import {typeORMConnectionOptions} from './ConnectionOptions';

const database = 'test_winston_v0';

let fixture: DatabaseFixture;

beforeAll(() => {
  fixture = new DatabaseFixture(database);
});

afterAll(async () => {
  await fixture.close();
});

beforeEach(async () => {
  await fixture.recreateDatabase();
});

interface MockLogger {
  debug: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  log: ReturnType<typeof vi.fn>;

  resetMocks: () => void;
  asTypeOrmLogger: () => Logger;
}

function createMockLogger(): MockLogger {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  } as MockLogger;

  mockLogger.resetMocks = () => {
    mockLogger.debug.mockReset();
    mockLogger.info.mockReset();
    mockLogger.warn.mockReset();
    mockLogger.error.mockReset();
    mockLogger.log.mockReset();
  };

  mockLogger.asTypeOrmLogger = () => mockLogger as unknown as Logger;

  return mockLogger;
}

async function run(
  loggerOptions: LoggerOptions,
  fn: (mockLogger: MockLogger, conn: DataSource) => Promise<void>,
): Promise<void> {
  const mockLogger = createMockLogger();

  const dataSource = new DataSource({
    ...typeORMConnectionOptions,
    database,
    logger: new WinstonAdaptor(mockLogger.asTypeOrmLogger(), loggerOptions),
  });

  try {
    await fn(mockLogger, await dataSource.initialize());
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

test('LoggerOptions: all', async () => {
  await run('all', async (mockLogger) => {
    expect(mockLogger.debug).toHaveBeenCalledWith('creating a new table: test_winston_v0.memo');

    expect(mockLogger.info).toHaveBeenCalledTimes(7);
    expect(mockLogger.info).toHaveBeenNthCalledWith(1, 'query: SELECT version()');
    expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'query: START TRANSACTION');
    expect(mockLogger.info).toHaveBeenNthCalledWith(3, 'query: SELECT DATABASE() AS `db_name`');
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      6,
      'query: CREATE TABLE `memo` (`id` int NOT NULL AUTO_INCREMENT, `memo` varchar(100) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB',
    );
    expect(mockLogger.info).toHaveBeenNthCalledWith(7, 'query: COMMIT');

    expect(mockLogger.warn).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });
});

test('LoggerOptions: query', async () => {
  await run(['query'], async (mockLogger, conn) => {
    expect(mockLogger.info).toHaveBeenCalledTimes(7);

    mockLogger.resetMocks();

    await conn.query('select 1');

    expect(mockLogger.info).toHaveBeenCalledWith('query: select 1');

    expect(mockLogger.debug).toHaveBeenCalledTimes(0);
    expect(mockLogger.warn).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });
});

test('LoggerOptions: schema', async () => {
  await run(['schema'], async (mockLogger) => {
    expect(mockLogger.debug).toHaveBeenCalledWith('creating a new table: test_winston_v0.memo');

    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.warn).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });
});

test('LoggerOptions: migration', async () => {
  await run(
    [
      'migration',
      'schema', // fixme: workaround of the issue https://github.com/typeorm/typeorm/issues/2793
    ],
    async (mockLogger, conn) => {
      mockLogger.resetMocks();

      await conn.runMigrations();

      expect(mockLogger.debug).toHaveBeenCalledTimes(4);
      expect(mockLogger.debug).toHaveBeenNthCalledWith(1, '0 migrations are already loaded in the database.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(2, '1 migrations were found in the source code.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(3, '1 migrations are new migrations must be executed.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(
        4,
        'Migration Test1600000000000 has been executed successfully.',
      );

      expect(mockLogger.info).toHaveBeenCalledTimes(0);
      expect(mockLogger.warn).toHaveBeenCalledTimes(0);
      expect(mockLogger.error).toHaveBeenCalledTimes(0);
    },
  );
});

test('LoggerOptions: error', async () => {
  await run(['error'], async (mockLogger, conn) => {
    try {
      await conn.query('select col from foo');
    } catch (_) {
      // ignore
    }

    expect(mockLogger.error).toHaveBeenCalledWith('query failed: select col from foo', expect.any(Error));

    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.debug).toHaveBeenCalledTimes(0);
    expect(mockLogger.warn).toHaveBeenCalledTimes(0);
  });
});

test('Slow query', async () => {
  await run(['warn'], async (mockLogger, conn) => {
    await conn.query('select sleep(1)');

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringMatching(/query is slow: execution time = \d+, query = select sleep\(1\)/),
    );

    expect(mockLogger.info).toHaveBeenCalledTimes(0);
    expect(mockLogger.debug).toHaveBeenCalledTimes(0);
    expect(mockLogger.error).toHaveBeenCalledTimes(0);
  });
});
