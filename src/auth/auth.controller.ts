import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Logger,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/decorators/is-public.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { User } from 'src/users/entities/user.entity';
import { UsersResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('/register')
  register(@Body() body: RegisterDto) {
    this.logger.log(`register accessed`);
    return this.authService.register(body);
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/login')
  async login(@Body() body: LoginDto): Promise<UsersResponseDto> {
    this.logger.log(`login accessed`);
    const user = await this.authService.login(body);
    return plainToInstance(UsersResponseDto, user);
  }
}
