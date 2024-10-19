import { ConnectionOptions as MySQLConnectionOptions } from 'mysql2';
import { MysqlConnectionOptions as TypeORMConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

import { Memo } from './entity/Memo';

const host = '127.0.0.1';
const port = 13307;
const username = 'root';
const password = 'test';

export const mysqlConnectionOptions: MySQLConnectionOptions = {
  host,
  port,
  user: username,
  password,
  database: 'test',
};

export const typeORMConnectionOptions: TypeORMConnectionOptions = {
  type: 'mysql',
  host,
  port,
  username,
  password,
  entities: [Memo],
  maxQueryExecutionTime: 900,
  migrations: ['test/migration/*.ts'],
  synchronize: true,
  migrationsRun: false,
};
