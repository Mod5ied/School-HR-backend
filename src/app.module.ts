import { StudentModule } from 'src/entity/primary_entities/students/students.module';
import { loggerConfig } from './services/broadcast/logger/logger.tokens';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AUTH_SECRET } from './services/tokens/tokens.secrets';
import { AppController } from './app.controller';
import { ZodValidationPipe } from 'nestjs-zod';
import { WinstonModule } from 'nest-winston';
import { AppService } from './app.service';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    StudentModule,
    WinstonModule.forRoot(loggerConfig),
    MongooseModule.forRoot('mongodb://localhost/nest'),
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: AUTH_SECRET,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
