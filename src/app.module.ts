import { loggerConfig } from './services/broadcast/logger/logger.tokens';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { AUTH_SECRET } from './services/tokens/tokens.secrets';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ZodValidationPipe } from 'nestjs-zod';
import { WinstonModule } from 'nest-winston';
import { APP_PIPE} from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
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
    {
      /* ensures zod validation at app-level, applies to e'ry ctrlr in app. */
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule { }
