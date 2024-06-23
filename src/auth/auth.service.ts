import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: CacheStore,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }
  async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }
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
  async login(loginDto: LoginDto): Promise<User> {
    const { username, password } = loginDto;
    let user = await this.cacheManager.get<User>(`user:${loginDto}`);
    if (!user) {
      user = await this.usersRepository.findOne({ where: { username } });
      if (!user) {
        throw new Error('User not found');
      }
      await this.cacheManager.set(`user:${username}`, user, { ttl: 300 });
    }
    const isPasswordValid = await this.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return user;
  }
}
