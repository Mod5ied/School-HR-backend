import { GlobalCacheModule } from './entity/primary_entities/_global/global-cache.module';
import { TeachersModule } from './entity/primary_entities/staff/teachers/teachers.module';
import { StudentsModule } from './entity/primary_entities/students/students.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { OtpModule } from './services/otp/otp.module';
import { TokensModule } from './services/tokens/tokens.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  imports: [
    OtpModule,
    TokensModule,
    TeachersModule,
    StudentsModule,
    GlobalCacheModule,
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<string>('REDIS_PORT')
      })
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DB_URI');
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule { }
