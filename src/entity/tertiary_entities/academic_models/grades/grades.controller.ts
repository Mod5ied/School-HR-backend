import { CreateSeniorGradeSchema, UpdateJuniorGradeSchema, UpdatePupilGradeSchema, UpdateSeniorGradeSchema } from "src/validation/schemas/grades.schema";
import { DeleteGradeDto, FetchGradesDto, JuniorGradesDto, PupilGradesDto, SeniorGradesDto, UpdateSeniorDto } from "src/validation/dtos/grades.dto";
import { Body, Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from "@nestjs/common";
import { CreateJuniorGradeSchema } from "src/validation/schemas/grades.schema";
import { CreatePupilGradeSchema } from "src/validation/schemas/grades.schema";
import { JoiPipe } from "src/validation/validation.pipe";
import { GradesInterceptor } from "./grades.intercept";
import { GradesServices } from "./grades.services";

@Controller('grades')
// @UseInterceptors(GradesInterceptor)
export class GradesController {
    constructor(private readonly gradesServices: GradesServices) { }
    
    /* reg-no must exist from (01-09) & (10-999), level can be either (senior|junior|pupil)*/
    @Get('all')
    async returnGrades(@Body() body: FetchGradesDto) {
        return await this.gradesServices.fetchGrades(body);
    }

    @Get('single')
    async returnGrade(@Body() body: FetchGradesDto) {
        return await this.gradesServices.fetchGrade(body);
    }

    /** endpoint is accessed and use by Bursary or Director entity while registering students. */
    @Post('new/senior/')
    async createNewSeniorGrade(@Body(new JoiPipe(CreateSeniorGradeSchema)) grades: SeniorGradesDto) {
        return await this.gradesServices.registerSeniorGrade(grades);
    }

    /** endpoint is accessed and use by Bursary or Director entity while registering students. */
    @Post('new/junior/')
    async createNewJuniorGrade(@Body(new JoiPipe(CreateJuniorGradeSchema)) grades: JuniorGradesDto) {
        return await this.gradesServices.registerJuniorGrade(grades);
    }

    /** endpoint is accessed and use by Bursary or Director entity while registering students. */
    @Post('new/pupil/')
    async createNewPupilGrade(@Body(new JoiPipe(CreatePupilGradeSchema)) grades: PupilGradesDto) {
        return await this.gradesServices.registerPupilGrade(grades);
    }

    @Patch('update/senior/')
    async updateSeniorGrade(@Body(new JoiPipe(UpdateSeniorGradeSchema)) grade: UpdateSeniorDto) {
        return await this.gradesServices.updateSeniorGrade(grade);
    }

    @Patch('update/junior/')
    async updateJuniorGrade(@Body(new JoiPipe(UpdateJuniorGradeSchema)) grade: UpdateSeniorDto) {
        return await this.gradesServices.updateJuniorGrade(grade);
    }

    @Patch('update/pupil/')
    async updatePupilGrade(@Body(new JoiPipe(UpdatePupilGradeSchema)) grade: UpdateSeniorDto) {
        return await this.gradesServices.updatePupilGrade(grade);
    }

    //todo: ensure to pipe each delete request through the validation pipe. (DELETE IS CRUCIAL).

    @Delete('all')
    async clearAllGrades(@Body() body: DeleteGradeDto) {
        return await this.gradesServices.deleteAllGrades(body);
    }

    @Delete('single')
    async clearSingleGrade(@Body() body: DeleteGradeDto) {
        return await this.gradesServices.deleteOneGrade(body);
    }
}