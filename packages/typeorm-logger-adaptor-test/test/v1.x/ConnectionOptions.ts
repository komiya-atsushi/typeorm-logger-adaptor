import type {MysqlDataSourceOptions as TypeORMConnectionOptions} from 'typeorm/driver/mysql/MysqlDataSourceOptions';

import {host, password, port, username} from '../common/ConnectionOptions';
import {Memo} from '../common/entity/Memo';
import {Test1600000000000} from '../common/migration/1600000000000-test';

export const typeORMConnectionOptions: TypeORMConnectionOptions = {
  type: 'mysql',
  host,
  port,
  username,
  password,
  entities: [Memo],
  maxQueryExecutionTime: 900,
  migrations: [Test1600000000000],
  synchronize: true,
  migrationsRun: false,
};
