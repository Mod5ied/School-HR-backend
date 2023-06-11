import {
    CreateNoteDto,
    CreateSubjectsDto,
    CreateTeacherDto,
    CreateTestDto,
} from 'src/validation/dtos/teachers.dto';
import {
    NotesSchema,
    TestsSchema,
    TeachersSchema,
    SubjectSchema,
} from 'src/validation/schemas/teachers.schema';
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    UseInterceptors,
} from '@nestjs/common';
import { NumberInterceptor } from '../_interceptors/phone_number.intercept';
// import { UploadInterceptor } from "../_interceptors/upload.intercept";
import { GradeInterceptor } from '../_interceptors/grades.intercept';
import { TeachersServices } from './teachers.services';
import { JoiPipe } from 'src/validation/validation.pipe';

@Controller('teachers')
@UseInterceptors(NumberInterceptor, GradeInterceptor)
export class TeachersControllers {
    constructor(private readonly teachersServices: TeachersServices) { }

    /* retrieval routes */
    @Get('attendance/:class')
    async returnAttendance(@Param('class') _class: string) {
        return this.teachersServices.fetchAttendance(_class);
    }

    @Get('timetable/:lesson')
    async returnTimetable(@Param('lesson') lesson: string | unknown) {
        return this.teachersServices.fetchTimetable(lesson);
    }

    @Get('subjects/:firstname/:school')
    async returnSubjects(@Param() params: { firstname: string; school: string }) {
        const { firstname, school } = params;
        return this.teachersServices.fetchSubjects(firstname, school);
    }

    /* reg-no must exist from (01-09) & (10-999), level can be either (senior|junior|pupil)*/
    @Get(
        'grades/:reg_numb(ss[1-3]-(?:0\\d|[1-9]\\d{0,2}))/(:level(senior|junior|pupil))',
    )
    async returnGrades(@Param() params: { reg_numb: string; level: string }) {
        const { level, reg_numb } = params;
        return this.teachersServices.fetchGrades(reg_numb, level);
    }

    @Get('notes/:subject')
    async returnNotes(@Param('subject') subject: string) {
        return this.teachersServices.fetchNotes(subject);
    }

    @Get('tests/:subject/:class')
    async returnTests(@Param() params: { subject: string; class: string }) {
        const { subject, class: _class } = params;
        return this.teachersServices.fetchTests(subject, _class);
    }

    /* record creation routes */
    @Post('account/new')
    async createTeacher(@Body(new JoiPipe(TeachersSchema)) teacher: CreateTeacherDto) {
        return await this.teachersServices.createAnAccount(teacher);
    }

    @Post('account/token/:number/:school')
    async tokenLogin(@Param() params: { number: string; school: string }) {
        const { number, school } = params;
        return await this.teachersServices.loginViaEmail(number, school);
    }

    @Post('account/otp/:number/:school')
    async otpLogin(@Param() params: { number: string; school: string }) {
        const { number, school } = params;
        return await this.teachersServices.loginViaOTP(number, school);
    }

    // place in delete ops.
    @Post('account/logout/:number/:school')
    async accountLogout(@Param() params: { number: string; school: string }) {
        const { number, school } = params;
        return await this.teachersServices.logoutAccount(number, school)
    }

    @Post('subjects/new')
    async postToSubjects(@Body(new JoiPipe(SubjectSchema)) subjects: CreateSubjectsDto) {
        return await this.teachersServices.uploadToSubjects(subjects);
    }

    @Post('notes/new')
    async postToNotes(@Body(new JoiPipe(NotesSchema)) notes: CreateNoteDto) {
        return await this.teachersServices.uploadToNotes(notes);
    }

    @Post('tests/new')
    async postToTests(@Body(new JoiPipe(TestsSchema)) tests: CreateTestDto) {
        return await this.teachersServices.uploadToTests(tests);
    }

    // /* record updates routes */
    // @Patch("attendance")
    // async updateAttendance() {
    //     return this.teachersServices.runUpdateAttendance()
    // }

    // @Patch("grades")
    // async updateGrades() {
    //     return this.teachersServices.runUpdateGrades()
    // }

    // @Patch("notes")
    // async updateNotes() {
    //     return this.teachersServices.runUpdateNotes()
    // }

    // @Patch("tests")
    // async updateTests() {
    //     return this.teachersServices.runUpdateTests()
    // }

    // /* record deletion routes */
    // @Delete("notes")
    // async deleteNotes() {
    //     return this.teachersServices.runDeleteNotes()
    // }

    // @Delete("tests")
    // async deleteTests() {
    //     return this.teachersServices.runDeleteTests()
    // }
}
