import { GradesModule } from './entity/tertiary_entities/academic_models/grades/grades.module';
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
import { ResponseModule } from './services/broadcast/response/response.module';
import {ScheduleModule} from "@nestjs/schedule"

@Module({
  imports: [
    OtpModule,
    GradesModule,
    TokensModule,
    TeachersModule,
    ResponseModule,
    StudentsModule,
    NestCacheModule,
    ScheduleModule.forRoot(),
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
