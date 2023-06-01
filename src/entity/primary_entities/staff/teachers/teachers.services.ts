import { TimeTable, ExamTimetable } from "src/entity/tertiary_entities/academic_models/timetable/timetable.model";
import { JuniorGrade, SeniorGrade } from "src/entity/tertiary_entities/academic_models/grades/grades.model";
import { Attendance } from "src/entity/tertiary_entities/academic_models/attendance/attendance.model";
import { Tests } from "src/entity/tertiary_entities/academic_models/tests/tests.model";
import { Note } from "src/entity/tertiary_entities/academic_models/notes/notes.model";
import { Injectable, Inject, CACHE_MANAGER, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Teacher } from "./teachers.model";
import { Cache } from "cache-manager";
import { Model } from "mongoose";

@Injectable()
export class TeachersServices {
    constructor(
        @InjectModel(ExamTimetable.name) private readonly examTable: Model<ExamTimetable>,
        @InjectModel(JuniorGrade.name) private readonly juniorGrade: Model<JuniorGrade>,
        @InjectModel(SeniorGrade.name) private readonly seniorGrade: Model<SeniorGrade>,
        @InjectModel(Attendance.name) private readonly attendance: Model<Attendance>,
        @InjectModel(TimeTable.name) private readonly timetable: Model<TimeTable>,
        @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
        @InjectModel(Tests.name) private readonly tests: Model<Tests>,
        @InjectModel(Note.name) private readonly notes: Model<Note>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) { }

    /** retrives the teachers account */
    public async fetchAccount(number: number, school: string) {
        //Todo: place the init-fetch within a cache-interceptor!
        const cachedAccount = await this.cacheManager.get<string>("account")

        if (cachedAccount) return JSON.parse(cachedAccount)
        const account = await this.teacherModel.findOne({ phoneNumber: number, school })
            .select(['school', 'phoneNumber', 'firstname', 'lastname', 'subjects'])
            .lean()

        if (!account) throw new NotFoundException(`Account fetch failed: ${account}`)
        await this.cacheManager.set("account", account, 900)
        return account
    }

    /** class can be either of items in list - [ss1, ss2, ss3] | [js1, js2, js3] */
    public async fetchAttendance(_class: string) {
        /* don't cache attandance requests since its regularly updated. */
        const attendance = await this.attendance.find({ class: _class }).lean().exec()
        if (!attendance) throw new NotFoundException(`Attendance fetch failed: ${attendance}`)
        return attendance
    }

    /** type can be either of the items in list - ['lesson', 'exam']  */
    public async fetchTimetable(type?: string | unknown) {
        //! Timetable model is complicated, test if it works.
        const cachedTimetable = await this.cacheManager.get("timetable")
        if (cachedTimetable) return cachedTimetable

        if (type === "exam") {
            const timetable = await this.examTable.find({}).exec()
            if (!timetable) throw new NotFoundException(`Timetable fetch failed: ${timetable}`)
            await this.cacheManager.set("timetable", timetable, 900)
            return timetable
        }
        const timetable = await this.timetable.find({}).exec();
        return timetable
    }

    public async fetchSubjects(firstname: string, school: string) {
        //Todo: place the init-fetch within a cache-interceptor!
        const cachedValue = await this.cacheManager.get<string>("teachers-subject");
        if (cachedValue) return JSON.parse(cachedValue)

        const teacher = await this.teacherModel.findOne({ firstname, school }).lean().exec()
        if (!teacher) throw new NotFoundException(`Subject fetch failed: ${teacher}`)
        await this.cacheManager.set("teachers-subject", teacher, 900)
        return teacher
    }

    /** level can be either of the items in list - ['junior', 'senior', null]  */
    public async fetchGrades(regNum: string, level: string) {
        //todo: [future] use an AI plugin to feed students grades(& patterns) and get a predition of likely to fail or pass.
        //todo: [future++] this can also be made available to students as a graph/chart of progress.
        if (level === 'senior') {
            const grades = await this.seniorGrade.findOne({ regNum: regNum }).lean().exec()
            if (!grades) throw new NotFoundException(`Grades fetch (senior) failed: ${grades}`)
            await this.cacheManager.set("grades", grades, 900)
            return grades
        }
        else if (level === "junior") {
            const grades = await this.juniorGrade.findOne({ regNum: regNum }).lean().exec()
            if (!grades) throw new NotFoundException(`Grades fetch (junior) failed: ${grades}`)
            await this.cacheManager.set("grades", grades, 900)
            return grades
        }
        else {
            const grades = await this.juniorGrade.find({}).lean().exec()
            if (!grades) throw new NotFoundException(`Grades fetch failed: ${grades}`)
            await this.cacheManager.set("grades", grades, 900)
            return grades
        }
    }

    /** accepts subject related to note as argument, e.g: fn('english') */
    public async fetchNotes(subject: string) {
        //Todo: attach the init-fetch within a cache interceptor.
        if (typeof subject === 'string') {
            const cachedNotes = await this.cacheManager.get<string>(`${subject}-notes`)
            if (cachedNotes) return JSON.parse(cachedNotes)

            const notes = await this.notes.findOne({ subject }).exec()
            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`)
            await this.cacheManager.set(`${subject}-notes`, notes, 900)
            return { notes }
        }
        const cachedNotes = await this.cacheManager.get<string>("notes")
        if (cachedNotes) return JSON.parse(cachedNotes)

        const notes = await this.notes.find({}).exec()
        if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`)
        await this.cacheManager.set("notes", notes, 900)
        return { notes }
    }

    /** accepts student's class and subject related to test as arguments, e.g: fn('english', 'ss1') */
    public async fetchTests(subject: string, _class: string) {
        if (typeof subject === "string") {
            const cachedTests = await this.cacheManager.get<string>(`${subject}-tests`)
            if (cachedTests) return JSON.parse(cachedTests)

            const tests = await this.tests.findOne({ subject, class: _class }).lean().exec()
            if (!tests) throw new NotFoundException(`${subject}-test fetch error:  ${tests}`)
            await this.cacheManager.set(`${subject}-tests`, tests, 600)
            return tests
        }
        //todo: maybe place this in 'tertiairy-entity' services instead.
        const cachedTests = await this.cacheManager.get<string>("tests")
        if (cachedTests) return cachedTests

        const tests = await this.tests.find({}).exec()
        if (!tests) throw new NotFoundException(`Tests fetch error: ${tests}`)
        await this.cacheManager.set("tests", tests, 600)
    }


    /* upload services */
    // public async uploadToSubjects() { }

    // public async uploadToNotes() { }

    // public async uploadTotests() { }

    /* update srevices */
    // public async runUpdateAttendance() { }

    // public async runUpdateGrades() { }

    // public async runUpdateNotes() { }

    // public async runUpdateTests() { }

    /* delete services */
    // public async runDeleteNotes() { }

    // public async runDeleteTests() { }

}