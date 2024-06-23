import { Exclude } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';
@Entity()
@Unique(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;
}
