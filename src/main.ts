import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { InstanceLoader } from '@nestjs/core/injector/instance-loader';
import { buildSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(InstanceLoader.name);

  app.enableCors();
  logger.log('allowed full CORS');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await buildSwagger(app);
  logger.log('swagger included');

  await app.listen(8000);

  const url = await app.getUrl();

  logger.log(`serve on ${url}`);
  logger.log(`swagger on ${url}/docs`);
}
bootstrap();
