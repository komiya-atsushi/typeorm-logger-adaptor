typeorm-logger-adaptor
======================

[![npm version](https://badge.fury.io/js/typeorm-logger-adaptor.svg)](https://badge.fury.io/js/typeorm-logger-adaptor)

Logger adaptors for TypeORM.

Supported loggers
-----------------

* [Bunyan](https://github.com/trentm/node-bunyan) (>= 1.8.5)
* [Winston](https://github.com/winstonjs/winston) (>= 3.0.0)

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
    * See [here](https://typeorm.io/#/logging/using-custom-logger) for details.

Example
-------

```typescript
import { createConnection } from 'typeorm';
import * as winston from 'winston';
import { WinstonAdaptor } from 'typeorm-logger-adaptor/logger/winston';

// Configure logger (Winston)
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.cli(),
  transports: [new winston.transports.Console()],
});

const host = 'host';
const port = 3306;
const username = 'conn_user';
const password = 'conn_user_pw';
const database = 'db_name';

// Configure connection
createConnection({
  type: 'mysql',
  host,
  port,
  username,
  password,
  database,
  synchronize: true,
  migrationsRun: true,
  logger: new WinstonAdaptor(logger, 'all'),
})
  .then(async (conn) => {
    try {
      await conn.query('select 1');
    } finally {
      await conn.close();
    }
  })
  .catch((e) => console.error(e));
```

License
-------

MIT License.

Copyright (c) 2020 KOMIYA Atsushi.
