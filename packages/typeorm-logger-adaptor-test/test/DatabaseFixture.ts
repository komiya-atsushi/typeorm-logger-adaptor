import {Connection as MySQLConnection, createConnection as createMySQLConnection} from 'mysql2/promise';

import {mysqlConnectionOptions} from './ConnectionOptions';

async function createMySQLConnectionWithRetry(maxRetries = 5): Promise<MySQLConnection> {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await createMySQLConnection(mysqlConnectionOptions);
    } catch (e) {
      const sleepMs = Math.pow(2, i) * 1000;
      console.info(`Failed to connect MySQL (#${i}th trial). Sleep ${sleepMs}ms.`);
      await new Promise(resolve => setTimeout(resolve, sleepMs));
    }
  }
  throw new Error("Can't connect MySQL server.");
}

export class DatabaseFixture {
  private readonly conn: Promise<MySQLConnection>;

  constructor(private targetDbName: string) {
    this.conn = createMySQLConnectionWithRetry();
  }

  async recreateDatabase(): Promise<void> {
    const conn = await this.conn;
    await conn.beginTransaction();

    let succeeded = false;
    try {
      await conn.execute(`DROP DATABASE IF EXISTS ${this.targetDbName}`);
      await conn.execute(`CREATE DATABASE ${this.targetDbName}`);
      succeeded = true;
    } finally {
      if (succeeded) {
        await conn.commit();
      } else {
        await conn.rollback();
      }
    }
  }

  async close(): Promise<void> {
    await (await this.conn).end();
  }
}
