import {DataSource} from 'typeorm';
// eslint-disable-next-line import/no-unresolved
import {WinstonAdaptor} from 'typeorm-logger-adaptor/logger/winston';
import * as winston from 'winston';
import {User} from './entity/User';

async function main(): Promise<void> {
  // Configure logger (Winston)
  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
  });

  const dataSource = await new DataSource({
    type: 'mysql',
    host: '127.0.0.1',
    port: 13307,
    username: 'root',
    password: 'test',
    database: 'test',
    entities: [User],
    migrations: ['src/migration/*.ts'],
    logger: new WinstonAdaptor(logger, 'all', true),
  }).initialize();

  try {
    await dataSource.synchronize();
    await dataSource.runMigrations();
    await dataSource.query('SELECT count(1) FROM user WHERE name = ?', ['Taro']);
    await dataSource.query('SELECT ___column_that_does_not_exist___ FROM ___table_that_does_not_exist___');
  } finally {
    await dataSource.destroy();
  }
}

main()
  .then(() => {})
  .catch(e => console.error(e));
