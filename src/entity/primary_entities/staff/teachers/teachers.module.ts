import { TeachersControllers } from "./teachers.controller";
import { Teacher, TeachersSchema } from "./teachers.model";
import { TeachersServices } from "./teachers.services";
import { MongooseModule } from "@nestjs/mongoose";
import { Module, CacheModule } from "@nestjs/common";
import { ExamTimetable, ExamTimetableSchema, TimeTable, TimetableSchema } from "src/entity/tertiary_entities/academic_models/timetable/timetable.model";
import { JuniorGrade, JuniorGradesSchema, SeniorGrade, SeniorGradesSchema } from "src/entity/tertiary_entities/academic_models/grades/grades.model";
import { Attendance, AttendanceSchema } from "src/entity/tertiary_entities/academic_models/attendance/attendance.model";
import { Note, NotesSchema } from "src/entity/tertiary_entities/academic_models/notes/notes.model";
import { TestSchema, Tests } from "src/entity/tertiary_entities/academic_models/tests/tests.model";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Teacher.name, schema: TeachersSchema },
            { name: ExamTimetable.name, schema: ExamTimetableSchema },
            { name: JuniorGrade.name, schema: JuniorGradesSchema },
            { name: SeniorGrade.name, schema: SeniorGradesSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: TimeTable.name, schema: TimetableSchema },
            { name: Note.name, schema: NotesSchema },
            { name: Tests.name, schema: TestSchema }
        ]),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                store: 'redis',
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<string>('REDIS_PORT')
            })
        })
    ],
    controllers: [TeachersControllers],
    providers: [TeachersServices],
    exports: [TeachersServices]
})
export class TeachersModule { }