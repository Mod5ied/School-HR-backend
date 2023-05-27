import { Controller, Get, Post, Patch, Delete, Param } from "@nestjs/common";
import { TeachersServices } from "./teachers.services"

@Controller("teachers")
export class TeachersControllers {
    constructor(
        private readonly teachersServices: TeachersServices
    ) { }

    /* retrieval routes */
    @Get('account/:number/:school')
    async returnAccount(@Param() params: { number: number, school: string }) {
        const { number, school } = params
        return this.teachersServices.fetchAccount(number, school)
    }

    @Get("attendance/:class")
    async returnAttendance(@Param('class') _class: string) {
        return this.teachersServices.fetchAttendance(_class)
    }

    @Get("timetable/:lesson")
    async returnTimetable(@Param('lesson') lesson: string | unknown) {
        return this.teachersServices.fetchTimetable(lesson)
    }

    @Get("subjects/:firstname/:school")
    async returnSubjects(@Param() params: { firstname: string, school: string }) {
        const { firstname, school } = params
        return this.teachersServices.fetchSubjects(firstname, school)
    }

    @Get("grades/:student/:level")
    async returnGrades(@Param() params: { student: string, level: string }) {
        const { level, student } = params
        return this.teachersServices.fetchGrades(student, level)
    }

    @Get("notes/:subject")
    async returnNotes(@Param('subject') subject: string) {
        return this.teachersServices.fetchNotes(subject)
    }

    @Get("tests/:subject/:class")
    async returnTests(@Param() params: { subject: string, class: string }) {
        const { subject, class: _class } = params
        return this.teachersServices.fetchTests(subject, _class)
    }

    /* record creation routes */
    // @Post("subjects")
    // async postToSubjects() {
    //     return this.teachersServices.uploadToSubjects()
    // }

    // @Post("notes")
    // async postToNotes() {
    //     return this.teachersServices.uploadToNotes()
    // }

    // @Post("testss")
    // async postToTests() {
    //     return this.teachersServices.uploadTotests()
    // }

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