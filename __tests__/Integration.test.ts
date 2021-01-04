import { mock, mockReset } from 'jest-mock-extended';
import { createConnection, Connection } from 'typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';
import { Logger } from 'winston';

import { WinstonAdaptor } from '../src/logger/winston';
import { typeORMConnectionOptions } from './ConnectionOptions';
import { DatabaseFixture } from './DatabaseFixture';

const database = 'test_winston';

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

async function run(
  loggerOptions: LoggerOptions,
  fn: (mockLogger: Logger, conn: Connection) => Promise<void>
): Promise<void> {
  const mockLogger = mock<Logger>();
  const conn = await createConnection({
    ...typeORMConnectionOptions,
    database,
    logger: new WinstonAdaptor(mockLogger, loggerOptions),
  });

  try {
    await fn(mockLogger, conn);
  } finally {
    await conn.close();
  }
}

test('LoggerOptions: all', async () => {
  await run('all', async (mockLogger) => {
    expect(mockLogger.debug).toHaveBeenCalledWith('creating a new table: memo');

    expect(mockLogger.info).toBeCalledTimes(12);
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      1,
      'All classes found using provided glob pattern "__tests__/migration/*.ts" : "__tests__/migration/1600000000000-test.ts"'
    );
    expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'query: START TRANSACTION');
    expect(mockLogger.info).toHaveBeenNthCalledWith(3, 'query: SELECT DATABASE() AS `db_name`');
    expect(mockLogger.info).toHaveBeenNthCalledWith(
      11,
      'query: CREATE TABLE `memo` (`id` int NOT NULL AUTO_INCREMENT, `memo` varchar(100) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB'
    );
    expect(mockLogger.info).toHaveBeenNthCalledWith(12, 'query: COMMIT');

    expect(mockLogger.warn).toBeCalledTimes(0);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
});

test('LoggerOptions: query', async () => {
  await run(['query'], async (mockLogger, conn) => {
    expect(mockLogger.info).toBeCalledTimes(11);

    mockReset(mockLogger);

    await conn.query('select 1');

    expect(mockLogger.info).toHaveBeenCalledWith('query: select 1');

    expect(mockLogger.debug).toBeCalledTimes(0);
    expect(mockLogger.warn).toBeCalledTimes(0);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
});

test('LoggerOptions: schema', async () => {
  await run(['schema'], async (mockLogger) => {
    expect(mockLogger.debug).toHaveBeenCalledWith('creating a new table: memo');

    expect(mockLogger.info).toBeCalledTimes(0);
    expect(mockLogger.warn).toBeCalledTimes(0);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
});

test('LoggerOptions: migration', async () => {
  await run(
    [
      'migration',
      'schema', // fixme: workaround of the issue https://github.com/typeorm/typeorm/issues/2793
    ],
    async (mockLogger, conn) => {
      mockReset(mockLogger);

      await conn.runMigrations();

      expect(mockLogger.debug).toBeCalledTimes(4);
      expect(mockLogger.debug).toHaveBeenNthCalledWith(1, '0 migrations are already loaded in the database.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(2, '1 migrations were found in the source code.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(3, '1 migrations are new migrations that needs to be executed.');
      expect(mockLogger.debug).toHaveBeenNthCalledWith(
        4,
        'Migration Test1600000000000 has been executed successfully.'
      );

      expect(mockLogger.info).toBeCalledTimes(0);
      expect(mockLogger.warn).toBeCalledTimes(0);
      expect(mockLogger.error).toBeCalledTimes(0);
    }
  );
});

test('LoggerOptions: error', async () => {
  await run(['error'], async (mockLogger, conn) => {
    try {
      await conn.query('select col from foo');
    } catch (e) {}

    expect(mockLogger.error).toHaveBeenCalledWith('query failed: select col from foo', expect.any(Error));

    expect(mockLogger.info).toBeCalledTimes(0);
    expect(mockLogger.debug).toBeCalledTimes(0);
    expect(mockLogger.warn).toBeCalledTimes(0);
  });
});

test('Slow query', async () => {
  await run(['warn'], async (mockLogger, conn) => {
    await conn.query('select sleep(1)');

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringMatching(/query is slow: execution time = \d+, query = select sleep\(1\)/)
    );

    expect(mockLogger.info).toBeCalledTimes(0);
    expect(mockLogger.debug).toBeCalledTimes(0);
    expect(mockLogger.error).toBeCalledTimes(0);
  });
});
