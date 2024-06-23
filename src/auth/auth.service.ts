import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersResponseDto } from './dto/user-response.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheStore,
    private jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  /**
   * @see https://www.npmjs.com/package/bcrypt
   * @param password string that need to be hased
   * @returns hashed password with bcrypt
   */
  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * @description
   * validate password between request and database
   */
  async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * @description
   * registration flow,
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { username, name, password } = registerDto;
    this.logger.log(`register account ${username}`);
    const existingUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (existingUser) {
      this.logger.log(`username ${username} already exists `);

      throw new ConflictException('Username already exists');
    }
    const hashedPassword = await this.hashPassword(password);
    const newUser = this.usersRepository.create({
      username,
      name,
      password: hashedPassword,
    });
    await this.usersRepository.save(newUser);
    this.logger.log(`register ${newUser.username} success `);

    return newUser;
  }

  /**
   * @description
   * validating user using cache manager advantage from nest
   * with redis to make login faster
   */
  async validateUser(username: string): Promise<User | null> {
    let user = await this.cacheManager.get<User>(`user:${username}`);
    if (!user) {
      user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new Error('User not found');
      }

      /**
       * set ttl to -1 if redis dont have any expiry timeout
       */
      await this.cacheManager.set(`user:${username}`, user, { ttl: 300 });
    }
    return await this.usersRepository.findOne({ where: { username } });
  }

  /**
   * @description
   * login method that returns signed jwt token with user data
   */
  async login(loginDto: LoginDto): Promise<UsersResponseDto> {
    const { username, password } = loginDto;
    this.logger.log(`login ${username}`);

    const user = await this.validateUser(username);
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      this.logger.log(`invalid credentials for ${username}`);
      throw new Error('Invalid credentials');
    }
    const payload = {
      username: user.username,
      id: user.id,
      name: user.name,
    };
    const access_token = await this.jwtService.sign(payload);
    this.logger.log(`login success for ${username}`);
    return { access_token, ...user };
  }
}
