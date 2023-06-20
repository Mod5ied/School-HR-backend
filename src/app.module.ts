import { GradesModule } from './entity/tertiary_entities/academic_models/grades/grades.module';
import { GlobalCacheModule } from './entity/primary_entities/_global/global-cache.module';
import { TeachersModule } from './entity/primary_entities/staff/teachers/teachers.module';
import { StudentsModule } from './entity/primary_entities/students/students.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { NestCacheModule } from "./services/cache/cache.module";
import { TokensModule } from './services/tokens/tokens.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from "@nestjs/event-emitter"
import { OtpModule } from './services/otp/otp.module';
import { AppController } from './app.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    OtpModule,
    GradesModule,
    TokensModule,
    TeachersModule,
    StudentsModule,
    NestCacheModule,
    GlobalCacheModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ cache: true }),
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
