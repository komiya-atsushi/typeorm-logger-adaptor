import { createConnection } from 'typeorm';
import * as winston from 'winston';
import { WinstonAdaptor } from '../src';
import { TextFormatter } from '../src/formatter/TextFormatter';
import { User } from './entity/User';

// Configure logger (Winston)
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.cli(),
  transports: [new winston.transports.Console()],
});

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
  logger: new WinstonAdaptor(logger, 'all', new TextFormatter(true)),
})
  .then(async (conn) => {
    try {
      await conn.query('select 1');
      await conn.query('SELECT ___column_that_does_not_exist___ FROM ___table_that_does_not_exist___');
    } finally {
      await conn.close();
    }
  })
  .catch((e) => e);
