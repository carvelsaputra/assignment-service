import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
