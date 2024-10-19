import {createLogger} from 'bunyan';
import {createConnection} from 'typeorm';

import {BunyanAdaptor} from '../dist/logger/bunyan';
import {User} from './entity/User';

// Configure logger (Bunyan)
const logger = createLogger({name: 'typeorm-logger-adaptor-bunyan-example', level: 'debug'});

const host = '127.0.0.1';
const port = 13307;
const username = 'root';
const password = 'test';
const database = 'test';

// Configure connection
createConnection({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  entities: [User],
  migrations: ['example/migration/*.ts'],
  synchronize: true,
  migrationsRun: true,
  logger: new BunyanAdaptor(logger, 'all'),
})
  .then(async conn => {
    try {
      await conn.query('select 1');
      await conn.query('SELECT ___column_that_does_not_exist___ FROM ___table_that_does_not_exist___');
    } finally {
      await conn.close();
    }
  })
  .catch(e => e);
