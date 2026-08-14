import type {ConnectionOptions as MySQLConnectionOptions} from 'mysql2';

export const host = '127.0.0.1';
export const port = 13307;
export const username = 'root';
export const password = 'test';

export const mysqlConnectionOptions: MySQLConnectionOptions = {
  host,
  port,
  user: username,
  password,
  database: 'test',
};
