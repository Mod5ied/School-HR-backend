import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  await app.listen(8000);
}
bootstrap();
