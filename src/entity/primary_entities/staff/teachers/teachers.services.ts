import {
    Injectable,
    Inject,
    CACHE_MANAGER,
    NotFoundException,
    UnauthorizedException,
    BadRequestException,
} from '@nestjs/common';
import {
    CreateNoteDto,
    CreateSubjectsDto,
    CreateTeacherDto,
    CreateTestDto,
} from 'src/validation/dtos/teachers.dto';
import {
    TimeTable,
    ExamTimetable,
} from 'src/entity/tertiary_entities/academic_models/timetable/timetable.model';
import {
    JuniorGrade,
    SeniorGrade,
} from 'src/entity/tertiary_entities/academic_models/grades/grades.model';
import { Attendance } from 'src/entity/tertiary_entities/academic_models/attendance/attendance.model';
import { Tests } from 'src/entity/tertiary_entities/academic_models/tests/tests.model';
import { Notes } from 'src/entity/tertiary_entities/academic_models/notes/notes.model';
import { TokenService } from 'src/services/tokens/tokens.service';
import { OtpService } from 'src/services/otp/otp.service';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from './teachers.model';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';

@Injectable()
export class TeachersServices {
    constructor(
        @InjectModel(ExamTimetable.name)
        private readonly examTable: Model<ExamTimetable>,
        @InjectModel(JuniorGrade.name)
        private readonly juniorGrade: Model<JuniorGrade>,
        @InjectModel(SeniorGrade.name)
        private readonly seniorGrade: Model<SeniorGrade>,
        @InjectModel(Attendance.name)
        private readonly attendance: Model<Attendance>,
        @InjectModel(TimeTable.name) private readonly timetable: Model<TimeTable>,
        @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
        @InjectModel(Tests.name) private readonly tests: Model<Tests>,
        @InjectModel(Notes.name) private readonly notes: Model<Notes>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
    ) { }

    private async fetchCachedData(key: string) {
        const data = await this.cacheManager.get<string>(key)
        if (data) return JSON.parse(data)
    }

    private async saveToCache(key: string, data: any, ttl: number) {
        await this.cacheManager.set(key, JSON.stringify(data), ttl)
    }

    /** class can be either of items in list - [ss1, ss2, ss3] | [js1, js2, js3] */
    public async fetchAttendance(_class: string) {
        /* don't cache attendance requests since its regularly updated. */
        const attendance = await this.attendance
            .find({ class: _class })
            .lean()
            .exec();
        if (!attendance)
            throw new NotFoundException(`Attendance fetch failed: ${attendance}`);
        return attendance;
    }

    /** type can be either of the items in list - ['lesson', 'exam']  */
    public async fetchTimetable(type?: string | unknown) {
        //! Timetable model is complicated, test if it works.
        const cachedTimetable = await this.cacheManager.get('timetable');
        if (cachedTimetable) return cachedTimetable;

        if (type === 'exam') {
            const timetable = await this.examTable.find({}).exec();
            if (!timetable)
                throw new NotFoundException(`Timetable fetch failed: ${timetable}`);
            await this.cacheManager.set('timetable', timetable, 900);
            return timetable;
        }
        const timetable = await this.timetable.find({}).exec();
        return timetable;
    }

    public async fetchSubjects(firstName: string, school: string) {
        //Todo: place the init-fetch within a cache-interceptor!
        const cachedValue = await this.cacheManager.get<string>('teachers-subject');
        if (cachedValue) return JSON.parse(cachedValue);

        const teacher = await this.teacherModel
            .findOne({ firstName, school })
            .lean()
            .exec();
        if (!teacher)
            throw new NotFoundException(`Subject fetch failed: ${teacher}`);
        await this.cacheManager.set('teachers-subject', teacher, 900);
        return teacher;
    }

    /** level can be either of the items in list - ['junior', 'senior', null]  */
    public async fetchGrades(regNum: string, level: string) {
        //todo: [future] use an AI plugin to feed students grades(& patterns) and get a predition of likely to fail or pass.
        //todo: [future++] this can also be made available to students as a graph/chart of progress.
        if (level === 'senior') {
            const grades = await this.seniorGrade
                .findOne({ regNum: regNum })
                .lean()
                .exec();
            if (!grades)
                throw new NotFoundException(`Grades fetch (senior) failed: ${grades}`);
            await this.cacheManager.set('grades', grades, 900);
            return grades;
        } else if (level === 'junior') {
            const grades = await this.juniorGrade
                .findOne({ regNum: regNum })
                .lean()
                .exec();
            if (!grades)
                throw new NotFoundException(`Grades fetch (junior) failed: ${grades}`);
            await this.cacheManager.set('grades', grades, 900);
            return grades;
        } else {
            const grades = await this.juniorGrade.find({}).lean().exec();
            if (!grades)
                throw new NotFoundException(`Grades fetch failed: ${grades}`);
            await this.cacheManager.set('grades', grades, 900);
            return grades;
        }
    }

    /** accepts subject related to note as argument, e.g: fn('english') */
    public async fetchNotes(subject: string) {
        //Todo: attach the init-fetch within a cache interceptor.
        if (typeof subject === 'string') {
            const cachedNotes = await this.cacheManager.get<string>(
                `${subject}-notes`,
            );
            if (cachedNotes) return JSON.parse(cachedNotes);

            const notes = await this.notes.findOne({ subject }).exec();
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
            await this.cacheManager.set(`${subject}-notes`, notes, 900);
            return { notes };
        }
        const cachedNotes = await this.cacheManager.get<string>('notes');
        if (cachedNotes) return JSON.parse(cachedNotes);

        const notes = await this.notes.find({}).exec();
        if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
        await this.cacheManager.set('notes', notes, 900);
        return { notes };
    }

    /** accepts student's class and subject related to test as arguments, e.g: fn('english', 'ss1') */
    public async fetchTests(subject: string, _class: string) {
        if (typeof subject === 'string') {
            const cachedTests = await this.cacheManager.get<string>(
                `${subject}-tests`,
            );
            if (cachedTests) return JSON.parse(cachedTests);

            const tests = await this.tests
                .findOne({ subject, class: _class })
                .lean()
                .exec();
            if (!tests)
                throw new NotFoundException(`${subject}-test fetch error:  ${tests}`);
            await this.cacheManager.set(`${subject}-tests`, tests, 600);
            return tests;
        }
        //todo: maybe place this in 'tertiairy-entity' services instead.
        const cachedTests = await this.cacheManager.get<string>('tests');
        if (cachedTests) return cachedTests;

        const tests = await this.tests.find({}).exec();
        if (!tests) throw new NotFoundException(`Tests fetch error: ${tests}`);
        await this.cacheManager.set('tests', tests, 600);
    }

    /* POST operations */
    //Todo: [v1.1], use another thread to handle uploading posts.
    //Todo: place the init-fetch within a cache-interceptor!

    public async loginViaEmail(number: string, school: string) {
        await this.fetchCachedData('email-account')
        const account = await this.teacherModel
            .findOne({ phoneNumber: number, school })
            .select(['firstName', 'lastName', 'email', 'role', 'subjects', 'notes', 'permissions'])
            .populate('notes');
        if (!account)
            throw new NotFoundException(`Account fetch failed: ${account}`);

        return await this.tokenService.generateTokens(account);
    }

    public async logoutAccount(number: string, school: string) {
        const account = await this.teacherModel.findOne({ phoneNumber: number, school })
            .select(['email', 'permissions'])
        if (!account) throw new NotFoundException(`Account not found, logout failed!`)
        return await this.tokenService.nullifyTokens(account)
    }

    public async loginViaOTP(number: string, school: string) {
        await this.fetchCachedData('otp-account')
        const account = await this.teacherModel
            .findOne({ phoneNumber: number, school })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'notes', 'permissions'])
            .populate('notes');
        if (!account)
            throw new NotFoundException(`Account fetch failed: ${account}`);

        return await this.otpService.generateOtp(account);
    }

    public async createAnAccount(teacher: CreateTeacherDto) {
        const existing_teacher = await this.fetchCachedData('new-teacher')
        if (existing_teacher) return new BadRequestException("Account already exists!")

        const teacherPojo = new this.teacherModel({ ...teacher });
        const savedTeacher = await teacherPojo.save()
        if (!savedTeacher) throw new BadRequestException(`Account creation failed: ${savedTeacher}`);
        await this.saveToCache('new-teacher', savedTeacher, 900)

        return { data: savedTeacher }
    }

    // public async verifyEmailLogin() { }

    // public async verifyOtpLogin() { }

    public async uploadToSubjects(subjects: CreateSubjectsDto) {
        const { body, encryptionKey, teacherId } = subjects;
        const result = await this.tokenService.verifyEncryptedKeys(encryptionKey);
        if (!result) throw new UnauthorizedException('Encryption key is invalid!');

        const teacher = await this.teacherModel
            .findOne({ phoneNumber: teacherId })
            .select(['firstName', 'lastName', 'phoneNumber', 'subjects'])
            .exec();
        if (!teacher) throw new NotFoundException("Teacher's account not found!");
        teacher && teacher.subjects.push(...body);
        const savedTeacher = (await teacher.save()).subjects;

        return { data: savedTeacher };
    }

    public async uploadToNotes(notes: CreateNoteDto) {
        const { body, encryptionKey } = notes;
        const result = await this.tokenService.verifyEncryptedKeys(encryptionKey);
        if (!result) throw new UnauthorizedException('Encryption key is invalid!');

        const teacher = await this.teacherModel
            .findOne({ phoneNumber: body.teacherId })
            .select(['firstName', 'lastName', 'phoneNumber', 'notes'])
            .exec();
        if (!teacher) throw new NotFoundException("Teacher's account not found!");
        //todo: find out what it takes to upload a blob to mongodb (* or maybe Postgres)
        const note = new this.notes({ ...body });
        note.teacher = teacher;
        const populated = (await note.save()).populate('teacher');
        return { data: populated };
    }

    public async uploadToTests(tests: CreateTestDto) {
        const { body, encryptionKey } = tests;
        const result = await this.tokenService.verifyEncryptedKeys(encryptionKey);
        if (!result) throw new UnauthorizedException('Encryption key is invalid!');

        const teacher = await this.teacherModel
            .findOne({ phoneNumber: body.teacherId })
            .select(['firstName', 'lastName', 'phoneNumber']);
        if (!teacher) throw new NotFoundException("Teacher's account not found!");
        const test = new this.tests({ ...body });
        test.teacher = teacher;
        const populated = (await test.save()).populate('teacher');
        return { body: populated };
    }

    /* update srevices */
    // public async runUpdateAttendance() { }

    //public async runUpdateSubjects() { }

    // public async runUpdateGrades() { }

    // public async runUpdateNotes() { }

    // public async runUpdateTests() { }

    /* delete services */
    // public async runDeleteNotes() { }

    // public async runDeleteTests() { }
}
