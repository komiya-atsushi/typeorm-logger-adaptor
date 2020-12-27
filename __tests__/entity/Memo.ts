import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Memo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  memo: string;
}
