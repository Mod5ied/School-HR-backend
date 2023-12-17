import { GradesModule } from './entity/tertiary_entities/academic_models/grades/grades.module';
import { TeachersModule } from './entity/primary_entities/staff/teachers/teachers.module';
import { BursaryModule } from './entity/primary_entities/staff/bursary/bursary.module';
import { DirectorsModule } from './entity/primary_entities/director/director.module';
import { StudentsModule } from './entity/primary_entities/students/students.module';
import { ResponseModule } from './services/broadcast/response/response.module';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { NestCacheModule } from "./services/cache/cache.module";
import { TokensModule } from './services/tokens/tokens.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from "@nestjs/event-emitter"
import { OtpModule } from './services/otp/otp.module';
import { AppController } from './app.controller';
import { ScheduleModule } from "@nestjs/schedule"
import { Module } from '@nestjs/common';

@Module({
  imports: [
    OtpModule,
    GradesModule,
    TokensModule,
    BursaryModule,
    TeachersModule,
    ResponseModule,
    StudentsModule,
    NestCacheModule,
    DirectorsModule,
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
