import type {MigrationInterface, QueryRunner} from 'typeorm';

export class Test1600000000000 implements MigrationInterface {
  name = 'Test1600000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("insert into memo(memo) values ('hello')");
  }

  public async down(_: QueryRunner): Promise<void> {}
}
