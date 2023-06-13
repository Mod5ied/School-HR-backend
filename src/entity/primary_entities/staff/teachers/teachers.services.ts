import { CreateNoteDto, CreateSubjectsDto, CreateTeacherDto, CreateTestDto } from 'src/validation/dtos/teachers.dto';
import { TimeTable, ExamTimetable } from 'src/entity/tertiary_entities/academic_models/timetable/timetable.model';
import { JuniorGrade, SeniorGrade } from 'src/entity/tertiary_entities/academic_models/grades/grades.model';
import { Injectable, NotFoundException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Attendance } from 'src/entity/tertiary_entities/academic_models/attendance/attendance.model';
import { Tests } from 'src/entity/tertiary_entities/academic_models/tests/tests.model';
import { Notes } from 'src/entity/tertiary_entities/academic_models/notes/notes.model';
import mongoose, { Document, LeanDocument, Model } from 'mongoose';
import { TokenService } from 'src/services/tokens/tokens.service';
import { CacheService } from 'src/services/cache/cache.service';
import { OtpService } from 'src/services/otp/otp.service';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from './teachers.model';

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
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
    ) { }

    /** class can be either of items in list - [ss1, ss2, ss3] | [js1, js2, js3] */
    public async fetchAttendance(_class: string) {
        /* don't cache attendance requests since its regularly updated. */
        const attendance = await this.attendance.find({ class: _class }).lean().exec();
        if (!attendance) throw new NotFoundException(`Attendance fetch failed: ${attendance}`);
        return attendance;
    }

    /** type can be either of the items in list - ['lesson', 'exam']  */
    public async fetchTimetable(type?: string) {
        //Todo: attach the init-fetch within a cache interceptor. (may be hard @ fetchGrades).
        //! Timetable model is complicated, test if it works.
        let cacheKey: string;
        let timeTable: any;

        if (type === 'exam') {
            cacheKey = 'exam-table';
            const cachedTimetable = await this.cacheService.getCached(cacheKey);
            if (cachedTimetable) return cachedTimetable;

            timeTable = await this.examTable.find().exec();
            if (!timeTable) throw new NotFoundException(`Exam table fetch failed: ${timeTable}`);
        }
        else if (type === 'lesson') {
            cacheKey = 'time-table';
            const cachedTimetable = await this.cacheService.getCached(cacheKey);
            if (cachedTimetable) return cachedTimetable.data;

            timeTable = await this.timetable.find({}).exec();
            if (!timeTable) throw new NotFoundException(`Lesson table fetch failed: ${timeTable}`);
        }
        else throw new BadRequestException(`Invalid timetable type: ${type}`);

        try {
            await this.cacheService.setCache('exam-table', timeTable, 900);
        } catch (error) {
            //log the error and retry-count in details. then try to cache again.
            /* find out what may cause failure and code an auto resolve before retry! */
            await this.cacheService.setCache('exam-table', timeTable, 900);
        }
    }

    public async fetchSubjects(firstName: string, school: string) {
        const cachedValue = await this.cacheService.getCached('teachers-subject');
        if (cachedValue) return cachedValue;

        const teacher = await this.teacherModel.findOne({ firstName, school }).lean().exec();
        if (!teacher) throw new NotFoundException(`Subject fetch failed: ${teacher}`);
        await this.cacheService.setCache('teachers-subject', teacher, 900);
        return teacher;
    }

    /** level can be either of the items in list - ['junior', 'senior', null]  */
    public async fetchGrades(level: string, regNum?: string) {
        //todo: [future] use an AI plugin to feed students grades(& patterns) and get a predition of likely to fail or pass.
        //todo: [future++] this can also be made available to students as a graph/chart of progress.
        let cacheKey: string;
        let grades: LeanDocument<SeniorGrade | JuniorGrade & { _id: mongoose.Types.ObjectId }> |
            LeanDocument<JuniorGrade & { _id: mongoose.Types.ObjectId }>[];

        if (level === 'senior') {
            cacheKey = 'senior-grades';
            const cachedGrade = await this.cacheService.getCached(cacheKey);
            if (cachedGrade) return cachedGrade;

            grades = await this.seniorGrade.findOne({ regNum: regNum }).lean().exec();
            if (!grades) throw new NotFoundException(`Grades fetch (senior) failed: ${grades}`);
        }
        else if (level === 'junior') {
            cacheKey = 'junior-grades';
            const cachedGrade = await this.cacheService.getCached(cacheKey);
            if (cachedGrade) return cachedGrade;

            grades = await this.juniorGrade.findOne({ regNum: regNum }).lean().exec();
            if (!grades) throw new NotFoundException(`Grades fetch (junior) failed: ${grades}`);
        }
        else {
            cacheKey = 'pupils-grades';
            const cachedGrade = await this.cacheService.getCached(cacheKey);
            if (cachedGrade) return cachedGrade;

            grades = await this.juniorGrade.find({}).lean().exec();
            if (!grades) throw new NotFoundException(`Grades fetch failed: ${grades}`);
        }
        try {
            await this.cacheService.setCache(cacheKey, grades, 900)
        } catch (error) {
            console.log('grades-error', grades);
            //log the error and retry-count in details. then try to cache again.
            await this.cacheService.setCache(cacheKey, grades, 900)
        }
    }

    /** accepts subject related to note as argument, e.g: fn('english') */
    public async fetchNotes(subject: string) {
        let notes: (Document<unknown, any, Notes> & Notes & { _id: mongoose.Types.ObjectId })[]
            | Document<unknown, any, Notes> & Notes & { _id: mongoose.Types.ObjectId; }

        if (typeof subject === 'string') {
            const cachedNotes = await this.cacheService.getCached(`${subject}-notes`);
            if (cachedNotes) return cachedNotes;

            notes = await this.notes.findOne({ subject }).exec();
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
        }
        else {
            const cachedNotes = await this.cacheService.getCached(`${subject}-notes`);
            if (cachedNotes) return cachedNotes;

            notes = await this.notes.find({}).exec();
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`);
        }
        try {
            await this.cacheService.setCache(`${subject}-note`, notes, 900)
        } catch (error) {
            console.log('notes-error', error);
            await this.cacheService.setCache(`${subject}-note`, notes, 900)
        }
    }

    /** accepts student's class and subject related to test as arguments, e.g: fn('english', 'ss1') */
    public async fetchTests(subject: string, _class: string) {
        let tests: LeanDocument<Tests & { _id: mongoose.Types.ObjectId }> |
            (Document<unknown, any, Tests> & Tests & { _id: mongoose.Types.ObjectId })[]

        if (typeof subject === 'string') {
            const cachedTests = await this.cacheService.getCached(`${subject}-tests`);
            if (cachedTests) return cachedTests;

            tests = await this.tests.findOne({ subject, class: _class }).lean().exec();
            if (!tests) throw new NotFoundException(`${subject}-test fetch error:  ${tests}`);
            try {
                await this.cacheService.setCache(`${subject}-tests`, tests, 600);
            } catch (error) {
                await this.cacheService.setCache(`${subject}-tests`, tests, 600);
            }
        }
        else {
            const cachedTests = await this.cacheService.getCached('tests');
            if (cachedTests) return cachedTests;

            tests = await this.tests.find({}).exec();
            if (!tests) throw new NotFoundException(`Tests fetch error: ${tests}`);
            try {
                await this.cacheService.setCache(`tests`, tests, 900);
            } catch (error) {
                await this.cacheService.setCache(`tests`, tests, 900);
            }
        }
    }

    /* POST operations */
    //Todo: [v1.1] use another thread to handle uploading posts.
    //Todo: place the init-fetch within a cache-interceptor!

    public async loginViaEmail(number: string, school: string) {
        const cachedData = await this.cacheService.getCached('email-account');
        if (cachedData) return cachedData;

        const account = await this.teacherModel
            .findOne({ phoneNumber: number, school })
            .select(['firstName', 'lastName', 'email', 'role', 'subjects', 'notes', 'permissions'])
            .populate('notes');
        if (!account) throw new NotFoundException(`Account fetch failed: ${account}`);

        return await this.tokenService.generateTokens(account);
    }

    public async logoutAccount(number: string, school: string) {
        const account = await this.teacherModel.findOne({ phoneNumber: number, school })
            .select(['email', 'permissions'])
        if (!account) throw new NotFoundException(`Account not found, logout failed!`)
        return await this.tokenService.nullifyTokens(account)
    }

    public async loginViaOTP(number: string, school: string) {
        const cachedData = await this.cacheService.getCached('otp-account');
        if (cachedData) return cachedData;

        const account = await this.teacherModel
            .findOne({ phoneNumber: number, school })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'notes', 'permissions'])
            .populate('notes');
        if (!account) throw new NotFoundException(`Account fetch failed: ${account}`);

        return await this.otpService.generateOtp(account);
    }

    public async createAnAccount(teacher: CreateTeacherDto) {
        // await this.teacherModel.deleteMany({})
        //Todo: [v1.1] use UUID as primary key for each teacher document.
        const existing_teacher = await this.cacheService.getCached('new-teacher');
        if (existing_teacher) return new BadRequestException("Account already exists!");

        const teacherPojo = new this.teacherModel({ ...teacher });
        const savedTeacher = await teacherPojo.save();
        if (!savedTeacher) throw new BadRequestException(`Account creation failed: ${savedTeacher}`);

        try {
            await this.cacheService.setCache('new-teacher', savedTeacher, 900);
            return { data: savedTeacher };
        } catch (error) {
            console.log('create-account error', error);
            await this.cacheService.setCache('new-teacher', savedTeacher, 900);
            /* log a creation error, and possible cause. */
        }
    }

    public async verifyEmailLogin(token: string, email: string) {
        return await this.tokenService.verifyAccessToken(token, email);
        /* grab the notification status and "manage" it. */
    }

    public async verifyOtpLogin(otp: number, number: string) {
        const account = await this.teacherModel.findOne({ phoneNumber: number })
            .select(['phoneNumber', 'role', 'permissions']);
        return await this.otpService.verifyOtp(otp, account);
    }

    public async uploadToSubjects(subjects: CreateSubjectsDto) {
        const { body, encryptionKey, teacherId } = subjects;
        const result = await this.tokenService.verifyEncryptedKeys(encryptionKey);
        if (!result) throw new UnauthorizedException('Encryption key is invalid!');

        const teacher = await this.teacherModel.findOne({ phoneNumber: teacherId })
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

        const teacher = await this.teacherModel.findOne({ phoneNumber: body.teacherId })
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

        const teacher = await this.teacherModel.findOne({ phoneNumber: body.teacherId })
            .select(['firstName', 'lastName', 'phoneNumber']);
        if (!teacher) throw new NotFoundException("Teacher's account not found!");
        const test = new this.tests({ ...body });
        test.teacher = teacher;
        const populated = (await test.save()).populate('teacher');
        return { body: populated };
    }

    /* update services */
    // public async runUpdateAttendance() { }

    //public async runUpdateSubjects() { }

    // public async runUpdateGrades() { }

    // public async runUpdateNotes() { }

    // public async runUpdateTests() { }

    /* delete services */
    // public async runDeleteNotes() { }

    // public async runDeleteTests() { }
}
