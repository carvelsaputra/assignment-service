import { Exclude, Expose } from 'class-transformer';

export class UsersResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  name: string;

  @Expose()
  access_token: string;

  @Exclude()
  password: string;
}
