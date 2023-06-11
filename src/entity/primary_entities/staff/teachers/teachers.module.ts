import { ExamTimetable, ExamTimetableSchema, TimeTable, TimetableSchema } from "src/entity/tertiary_entities/academic_models/timetable/timetable.model";
import { JuniorGrade, JuniorGradesSchema, SeniorGrade, SeniorGradesSchema } from "src/entity/tertiary_entities/academic_models/grades/grades.model";
import { Attendance, AttendanceSchema } from "src/entity/tertiary_entities/academic_models/attendance/attendance.model";
import { Notes, NotesSchema } from "src/entity/tertiary_entities/academic_models/notes/notes.model";
import { TestSchema, Tests } from "src/entity/tertiary_entities/academic_models/tests/tests.model";
import { TokensModule } from "src/services/tokens/tokens.module";
import { TeachersControllers } from "./teachers.controller";
import { Teacher, TeachersSchema } from "./teachers.model";
import { OtpModule } from "src/services/otp/otp.module";
import { TeachersServices } from "./teachers.services";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        OtpModule,
        TokensModule,
        MongooseModule.forFeature([
            { name: ExamTimetable.name, schema: ExamTimetableSchema },
            { name: JuniorGrade.name, schema: JuniorGradesSchema },
            { name: SeniorGrade.name, schema: SeniorGradesSchema },
            { name: Attendance.name, schema: AttendanceSchema },
            { name: TimeTable.name, schema: TimetableSchema },
            { name: Teacher.name, schema: TeachersSchema },
            { name: Notes.name, schema: NotesSchema },
            { name: Tests.name, schema: TestSchema }
        ]),
    ],
    controllers: [TeachersControllers],
    providers: [TeachersServices], // Use the existing CACHE_MANAGER],
    exports: [TeachersServices]
})
export class TeachersModule { }