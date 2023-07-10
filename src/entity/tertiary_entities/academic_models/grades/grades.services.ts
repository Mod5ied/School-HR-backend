import { CacheJunior, CachePupil, CacheSenior, DeleteGradeDto, FetchGradesDto, JuniorGradesDto, PupilGradesDto, SeniorGradesDto, UpdateJuniorDto, UpdatePupilDto, UpdateSeniorDto } from "src/validation/dtos/grades.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { JuniorGrade, PupilGrade, SeniorGrade } from "./grades.model";
import { CacheService } from "src/services/cache/cache.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class GradesServices {
    constructor(
        @InjectModel(SeniorGrade.name) private readonly seniorGrade: Model<SeniorGrade>,
        @InjectModel(JuniorGrade.name) private readonly juniorGrade: Model<JuniorGrade>,
        @InjectModel(PupilGrade.name) private readonly pupilGrade: Model<PupilGrade>,
        private readonly cacheServices: CacheService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    /* Grades does not need to be deleted here. */
    /* Grades are 'created' when Student account is created. */
    /* Grades are only deleted when the student account is deleted. */

    public async registerSeniorGrade(grades: SeniorGradesDto) {
        const newGrade = new this.seniorGrade({ ...grades.gradeBody });
        this.eventEmitter.emit('senior-grades.created', { newGrade });
        return await newGrade.save({ validateBeforeSave: true });
    }
    @OnEvent('senior-grade.created')
    async cacheSeniorGrade(payload: CacheSenior) {
        await this.cacheServices.setCache('senior-grades.created', payload.newGrade, 200)
    }

    public async registerJuniorGrade(grades: JuniorGradesDto) {
        const newGrade = new this.juniorGrade({ ...grades.gradeBody })
        this.eventEmitter.emit('junior-grade.created', { newGrade });
        return await newGrade.save({ validateBeforeSave: true });
    }
    @OnEvent('junior-grade.created')
    async cacheJuniorGrade(payload: CacheJunior) {
        await this.cacheServices.setCache('junior-grades.created', payload.newGrade, 200)
    }

    public async registerPupilGrade(grades: PupilGradesDto) {
        const newGrade = new this.pupilGrade({ ...grades.gradeBody })
        this.eventEmitter.emit('pupil-grade.created', { newGrade });
        return await newGrade.save({ validateBeforeSave: true });
    }
    @OnEvent('pupil-grade.created')
    async cachePupilGrade(payload: CachePupil) {
        await this.cacheServices.setCache('pupil-grades.created', payload.newGrade, 200)
    }

    public async fetchGrades(options: FetchGradesDto) {
        switch (options.level) {
            case "senior":
                const snrGrades = await this.seniorGrade.find({}).lean();
                if (!snrGrades) throw new NotFoundException('Senior grades fetch failed!');
                await this.cacheServices.setCache('senior-grades', snrGrades, 900);
                return snrGrades;
            case "junior":
                const jnrGrades = await this.juniorGrade.find({}).lean();
                if (!jnrGrades) throw new NotFoundException('Junior grades fetch failed!');
                await this.cacheServices.setCache('junior-grades', jnrGrades, 900);
                return jnrGrades;
            case "pupil":
                const pupGrades = await this.pupilGrade.find({}).lean();
                if (!pupGrades) throw new NotFoundException('Pupil grades fetch failed');
                await this.cacheServices.setCache('pupil-grades', pupGrades, 900);
                return pupGrades;
        }
    }

    public async fetchGrade(options: FetchGradesDto) {
        switch (options.level) {
            case "senior":
                const snrGrade = await this.seniorGrade.findOne({}).lean();
                if (!snrGrade) throw new NotFoundException('Senior grades fetch failed!');
                await this.cacheServices.setCache(`${snrGrade.regNum}-grade`, snrGrade, 900);
                return snrGrade;
            case "junior":
                const jnrGrade = await this.juniorGrade.findOne({}).lean();
                if (!jnrGrade) throw new NotFoundException('Junior grades fetch failed!');
                await this.cacheServices.setCache(`${jnrGrade.regNum}-grade`, jnrGrade, 900);
                return jnrGrade;
            case "pupil":
                const pupGrade = await this.pupilGrade.findOne({}).lean();
                if (!pupGrade) throw new NotFoundException('Pupil grades fetch failed')
                await this.cacheServices.setCache(`${pupGrade.regNum}-grade`, pupGrade, 900);
        }
    }


    //todo: Note that after an update, schedule a task to update the cache with fresh data from DB.

    public async updateSeniorGrade(grades: UpdateSeniorDto) {
        /* validation pipe passes and proceeds here. */
        const { updateBody } = grades;
        const updatedGrade = await this.seniorGrade.findOneAndUpdate(
            { regNum: updateBody.regNum }, updateBody, { new: true, upsert: false }
        );
        if (!updatedGrade) throw new BadRequestException(`Senior grade update for student: ${updateBody.regNum} failed!`)
        this.eventEmitter.emit('senior-grade.updated', { regNum: updatedGrade.regNum })
        return updatedGrade;
    }
    @OnEvent("senior-grade.updated")
    async updateCachedSeniorGrade(payload: { regNum: string }) {
        await this.cacheServices.delCached(`${payload.regNum}-grade`)
        const grade = await this.seniorGrade.findOne({ regNum: payload.regNum }).lean();
        grade && await this.cacheServices.setCache(`${payload.regNum}-grade`, grade, 900);
    }

    public async updateJuniorGrade(grades: UpdateJuniorDto) {
        const { updateBody } = grades;
        const updatedGrade = await this.juniorGrade.findOneAndUpdate(
            { regNum: updateBody.regNum }, updateBody, { new: true, upsert: false }
        );
        if (!updatedGrade) throw new BadRequestException(`Junior grade update for student: ${updateBody.regNum} failed!`)
        this.eventEmitter.emit('junior-grade.updated', { regNum: updatedGrade.regNum })
        return updatedGrade;
    }
    @OnEvent("junior-grade.updated")
    async updateCachedJuniorGrade(payload: { regNum: string }) {
        await this.cacheServices.delCached(`${payload.regNum}-grade`)
        const grade = await this.juniorGrade.findOne({ regNum: payload.regNum }).lean();
        grade && await this.cacheServices.setCache(`${payload.regNum}-grade`, grade, 900);
    }

    public async updatePupilGrade(grades: UpdatePupilDto) {
        const { updateBody } = grades;
        const updatedGrade = await this.pupilGrade.findOneAndUpdate(
            { regNum: updateBody.regNum }, updateBody, { new: true, upsert: false }
        );
        if (!updatedGrade) throw new BadRequestException(`Pupil grade update for pupil: ${updateBody.regNum} failed!`)
        this.eventEmitter.emit('pupil-grade.updated', { regNum: updatedGrade.regNum })
    }
    @OnEvent("pupil-grade.updated")
    async updateCachedPupilGrade(payload: { regNum: string }) {
        await this.cacheServices.delCached(`${payload.regNum}-grade`)
        const grade = await this.pupilGrade.findOne({ regNum: payload.regNum }).lean();
        grade && await this.cacheServices.setCache(`${payload.regNum}-grade`, grade, 900);
    }


    public async deleteAllGrades(options: DeleteGradeDto) {
        switch (options.level) {
            case "senior":
                const seniorGrade = await this.seniorGrade.deleteMany({});
                if (seniorGrade.deletedCount == 0) throw new NotFoundException("Senior grades deletion failed!")
                else return { message: `Senior grades deleted successfully!` }
            case "junior":
                const juniorGrade = await this.juniorGrade.deleteMany({});
                if (juniorGrade.deletedCount == 0) throw new NotFoundException("Junior grades deletion failed!")
                else return { message: `Junior grades deleted successfully` }
            case "pupil":
                const pupilGrade = await this.pupilGrade.deleteMany({});
                if (pupilGrade.deletedCount == 0) throw new NotFoundException("Pupil grades deletion failed!")
                else return { message: `Pupil grades deleted successfully` }
        }
    }

    public async deleteOneGrade(options: DeleteGradeDto) {
        switch (options.level) {
            case "senior":
                const seniorGrade = await this.seniorGrade.deleteOne({});
                if (seniorGrade.deletedCount == 0) throw new NotFoundException("Senior grade deletion failed!")
                else return { message: `Senior grade deleted successfully!` }
            case "junior":
                const juniorGrade = await this.juniorGrade.deleteOne({});
                if (juniorGrade.deletedCount == 0) throw new NotFoundException("Junior grade deletion failed!")
                else return { message: `Junior grade deleted successfully` }
            case "pupil":
                const pupilGrade = await this.pupilGrade.deleteOne({});
                if (pupilGrade.deletedCount == 0) throw new NotFoundException("Pupil grade deletion failed!")
                else return { message: `Pupil grade deleted successfully` }
        }
    }
}