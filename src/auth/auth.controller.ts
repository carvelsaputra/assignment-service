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
  login(@Body() body: LoginDto): Promise<User> {
    return this.authService.login(body);
  }
}
