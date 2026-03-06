import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Memo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {
    length: 100,
  })
  memo: string;
}
