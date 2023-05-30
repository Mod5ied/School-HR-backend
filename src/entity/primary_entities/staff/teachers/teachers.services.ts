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
        /* the teachers account is always returned frequently, but... */
        /* few changes are frequently to their direct account object, hence cacheable */
        const account = await this.teacherModel.findOne({ phoneNumber: number, school })
            .select(['school', 'phoneNumber', 'firstname', 'lastname', 'subjects'])
            .lean()
        if (!account) throw new NotFoundException(`Account fetch failed: ${account}`)
        await this.cacheManager.set("account", account, 900)
        return {}
    }

    /** retieves attendance list */
    public async fetchAttendance(_class: string) {
        /* attendance is fetched first when teacher goes on the time-table section.. */
        /* the second (& continous) requests (UPDATE) is done in continum..  */
        /* hence, there's no need to cache attandance requests since its regularly updated. */
        const attendance = await this.attendance.find({ class: _class }).lean().exec()
        if (!attendance) throw new NotFoundException(`Attendance fetch failed: ${attendance}`)
        await this.cacheManager.set("attendance", attendance, 200)
        return { attendance }
    }

    /** type can be either of the items in list - ['lesson', null]  */
    public async fetchTimetable(type?: string | unknown) {
        /* time-table is created one-time hence, tis cacheable. */
        if (type === "exam") {
            const timetable = await this.examTable.find({}).lean().exec()
            if (!timetable) throw new NotFoundException(`Timetable fetch failed: ${timetable}`)
            await this.cacheManager.set("timetable", timetable, 900)
            return { timetable }
        }
        const timetable = await this.timetable.find({}).exec();
        return { timetable }
    }

    public async fetchSubjects(firstname: string, school: string) {
        /* subjects is an array that's created once and only updated seldomly.. */
        /* hence, subjects are cachable. */
        const teacher = await this.teacherModel.findOne({ firstname, school }).lean().exec()
        await this.cacheManager.set("teachers-subject", teacher.subjects, 600)
        return teacher.subjects
    }

    /** level can be either of the items in list - ['junior', 'senior', null]  */
    public async fetchGrades(regNum: string, level: string) {
        /* grades are not updated on a daily, rather on a weekly or bi-weekly basis.. */
        /* cache for grades lasts for about 10mins, hence cacheable. */
        if (level === 'senior') {
            const grades = await this.seniorGrade.findOne({ regNum: regNum  }).lean().exec()
            await this.cacheManager.set("grades", grades, 900)
            return { grades }
        }
        else if (level === "junior") {
            const grades = await this.juniorGrade.findOne({ regNum: regNum }).lean().exec()
            await this.cacheManager.set("grades", grades, 900)
            return { grades }
        }
        else {
            const grades = await this.juniorGrade.find({}).lean().exec()
            await this.cacheManager.set("grades", grades, 900)
            return { grades }
        }
    }

    /** accepts subject related to note as argument, e.g: fn('english') */
    public async fetchNotes(subject: string) {
        /* notes are not updated regularly, only at the end of the day.. */
        /* hence, it can be cached. */
        if (typeof subject === 'string') {
            const notes = await this.notes.findOne({ subject }).exec()

            if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`)
            await this.cacheManager.set("notes", notes, 900)
            return { notes }
        }
        const notes = await this.notes.find({}).exec()
        if (!notes) throw new NotFoundException(`Notes fetch error: ${notes}`)
        await this.cacheManager.set("notes", notes, 900)
        return { notes }
    }

    /** accepts student's class and subject related to test as arguments, e.g: fn('english', 'ss1') */
    public async fetchTests(subject: string, _class: string) {
        /* tests are essentially cacheable. */

        if (subject === "string") {
            const tests = await this.tests.findOne({ subject, class: _class }).lean().exec()

            if (!tests) throw new NotFoundException(`Test fetch error:  ${tests}`)
            await this.cacheManager.set("tests", tests, 600)
            return { tests }
        }
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