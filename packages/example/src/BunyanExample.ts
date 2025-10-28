import {createLogger} from 'bunyan';
import {DataSource} from 'typeorm';
// eslint-disable-next-line import/no-unresolved
import {BunyanAdaptor} from 'typeorm-logger-adaptor/logger/bunyan';
import {User} from './entity/User';

async function main(): Promise<void> {
  // Configure logger (Bunyan)
  const logger = createLogger({name: 'typeorm-logger-adaptor-bunyan-example', level: 'debug'});

  // Configure DataSource
  const dataSource = await new DataSource({
    type: 'mysql',
    host: '127.0.0.1',
    port: 13307,
    username: 'root',
    password: 'test',
    database: 'test',
    entities: [User],
    migrations: ['src/migration/*.ts'],
    logger: new BunyanAdaptor(logger, 'all'),
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
  .catch((e) => console.error(e));
