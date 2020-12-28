typeorm-logger-adaptor
======================

Logger adaptors for TypeORM.

Supported loggers
-----------------

* [Winston](https://github.com/winstonjs/winston) (>= 3.0)

Install
-------

```bash
# NPM
npm install typeorm-logger-adaptor

# Yarn
yarn add typeorm-logger-adaptor
```

Example
-------

```typescript
import { createConnection } from 'typeorm';
import * as winston from 'winston';
import { WinstonAdaptor } from 'typeorm-logger-adaptor';

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
