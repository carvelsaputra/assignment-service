import { Exclude } from 'class-transformer';

export class UserEntity {
  username: string;
  name: string;

  @Exclude()
  password: string;
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
