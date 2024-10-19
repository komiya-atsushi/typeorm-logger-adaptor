import {MigrationInterface, QueryRunner} from 'typeorm';

export class Test1600000000000 implements MigrationInterface {
  name = 'Test1600000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("insert into memo(memo) values ('hello')");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
