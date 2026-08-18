typeorm-logger-adaptor
======================

[![npm version](https://badge.fury.io/js/typeorm-logger-adaptor.svg)](https://badge.fury.io/js/typeorm-logger-adaptor)

Logger adaptors for TypeORM.

Supported versions
------------------

* [TypeORM](https://typeorm.io/) 0.2.x, 0.3.x and 1.x
    * Note: TypeORM 1.x requires Node.js 20.19 or later.
* [Bunyan](https://github.com/trentm/node-bunyan) 1.8.5 or later
* [Winston](https://github.com/winstonjs/winston) 3.0.0 or later

Install
-------

```bash
# NPM
npm install typeorm-logger-adaptor

# Yarn
yarn add typeorm-logger-adaptor
```

How to use
----------

1. Install `typeorm-logger-adaptor`, `typeorm` and a logger library you want to use.
2. `import { XxxAdaptor } from 'typeorm-logger-adaptor/logger/xxx';`.
    * Replace `xxx` with logger library name (e.g. `winston`, `bunyan`).
3. Create and configure a logger instance. 
4. Create an adaptor instance and configure TypeORM connection.
    * See [here](https://typeorm.io/docs/logging#using-custom-logger) for details.

Example
-------

```typescript
import {DataSource} from 'typeorm';
import * as winston from 'winston';
import {WinstonAdaptor} from 'typeorm-logger-adaptor/logger/winston';

async function example(): Promise<void> {
  // Configure logger (Winston)
  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
  });

  // Create and initialize DataSource
  const dataSource = await new DataSource({
    type: 'mysql',
    host: 'database-host',
    port: 3306,
    username: 'conn_user',
    password: 'conn_user_pw',
    database: 'database_name',
    // Use logger adaptor like this
    logger: new WinstonAdaptor(logger, 'all', {highlightSql: true, formatSql: true}),
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
```

Adaptor options
---------------

The third constructor argument accepts an options object.

```typescript
new WinstonAdaptor(logger, 'all', {
  highlightSql: true, // Enables SQL syntax highlighting.
  formatSql: true, // Enables SQL pretty-printing.
  loggerMethodMapping: {...}, // Maps Winston logger methods to TypeORM logger methods.
});

new BunyanAdaptor(logger, 'all', {
  // Note: highlightSql is not supported here because ANSI escape sequences would pollute Bunyan's JSON logs.
  formatSql: true, // Enables SQL pretty-printing.
  logLevelMapping: {...}, // Specifies Bunyan log levels that each TypeORM logger method uses.
});
```

License
-------

MIT License.

Copyright (c) 2020 KOMIYA Atsushi.
