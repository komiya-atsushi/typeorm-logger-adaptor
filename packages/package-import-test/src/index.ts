import {Column, DataSource, Entity, Like, PrimaryGeneratedColumn} from 'typeorm';
// eslint-disable-next-line import/no-unresolved,n/no-extraneous-import
import {WinstonAdaptor} from 'typeorm-logger-adaptor/logger/winston';
import * as winston from 'winston';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 32,
  })
  name: string;
}

async function main(): Promise<void> {
  const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
  });

  const dataSource = await new DataSource({
    type: 'mysql',
    host: 'mysql-service',
    port: 3306,
    username: 'root',
    password: 'test',
    database: 'test',
    entities: [User],
    logger: new WinstonAdaptor(logger, 'all', true),
  }).initialize();

  try {
    await dataSource.synchronize();
    const repo = dataSource.manager.getRepository(User);
    await repo.save([{name: 'Taro'}, {name: 'Jiro'}, {name: 'Hanako'}]);
    const count = await repo.countBy({name: Like('%ro')});
    logger.info(`Count: ${count}`);
  } finally {
    await dataSource.destroy();
  }
}

main()
  .then(() => {})
  .catch(e => {
    throw e;
  });
