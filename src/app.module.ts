import { StudentsModule } from './entity/primary_entities/students/students.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { OtpModule } from './services/broadcast/otp/otp.module';
import { TokensModule } from './services/tokens/tokens.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { ZodValidationPipe } from 'nestjs-zod';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
// import { AUTH_SECRET } from './services/tokens/tokens.secrets';
// import { TokensLoggerModule } from './services/broadcast/logger/logger.module';

@Module({
  imports: [
    OtpModule,
    TokensModule,
    StudentsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DB_URI');
        console.log(uri); // Make sure the value is being read correctly
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),
    // TokensLoggerModule,
    // JwtModule.registerAsync({
    //   useFactory: async () => ({
    //     secret: AUTH_SECRET,
    //   }),
    // }),
  ],
  controllers: [AppController],
  providers: [],
  exports:  []
  // providers: [
  //   // {
  //   //   /* ensures zod validation at app-level, applies to e'ry ctrlr in app. */
  //   //   provide: APP_PIPE,
  //   //   useClass: ZodValidationPipe,
  //   // },
  // ],
})
export class AppModule { }
