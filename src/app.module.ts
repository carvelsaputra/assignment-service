import { Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { redisStore } from 'cache-manager-redis-store';
@Module({
  imports: [
    // ==== DEPEDENCIES MODULE START =====

    /**
     * Config Module
     */
    ConfigModule.forRoot({
      // validationSchema: better to add this
      isGlobal: true,
      load: [config],
    }),
    /**
     * MySQL Module
     */
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mysqlConfig = configService.get('mysql');
        return {
          type: 'mysql',
          host: mysqlConfig.host,
          port: mysqlConfig.port,
          username: mysqlConfig.username,
          database: mysqlConfig.name,
          entities: [User],
          synchronize: true,
        };
      },
    }),
    /**
     * Cache Module
     */
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        const host = redisConfig.host;
        const port = redisConfig.port;
        return {
          store: (): any =>
            redisStore({
              socket: {
                host,
                port,
              },
            }),
        };
      },
    }),
    // ==== APP MODULE START =====
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
