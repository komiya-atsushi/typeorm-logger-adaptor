import type {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUser1600000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("insert into user(name) values ('Taro')");
  }

  public async down(_: QueryRunner): Promise<void> {}
}
