import { CreateTeacherDto, DeleteTeacherDto, FetchTeachersDto, LoginDto, LogoutDto, PermissionsDto, UpdateSubjectDto, UpdateTeacherDto } from 'src/validation/dtos/teachers.dto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TokenService } from 'src/services/tokens/tokens.service';
import { CacheService } from 'src/services/cache/cache.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { VerifyUser } from 'src/services/tokens/tokens.types';
import { OtpService } from 'src/services/otp/otp.service';
import { Document, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Teacher } from './teachers.model';

@Injectable()
export class TeachersServices {
    constructor(
        @InjectModel(Teacher.name) private readonly teacherModel: Model<Teacher>,
        private readonly eventEmitter: EventEmitter2,
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
    ) { }

    public async fetchTeacherAccount(payload: FetchTeachersDto) {
        const { email, phoneNumber } = payload;
        const teacher = await this.teacherModel.findOne({ $and: [{ email }, { phoneNumber }] });
        if (!teacher) throw new NotFoundException(`Teacher's info not found!`)
        this.eventEmitter.emit("cache-teacher-account", teacher);
        return teacher;
    }
    @OnEvent("cache-teacher-account")
    async cacheTeacherInfo(payload: Document<unknown, any, Teacher> & Teacher & { _id: Types.ObjectId }) {
        await this.cacheService.setCache(`${payload.phoneNumber}-info`, payload, 600);
    }

    public async fetchAllTeachers(payload: FetchTeachersDto) {
        const { range } = payload;
        const page = range.start || 0;
        const limit = 20;
        const offset = page * limit;
        try {
            // Getting the total count of teachers
            const totalTeachers = await this.teacherModel.countDocuments().lean();

            // Calculating total pages
            const totalPages = Math.ceil(totalTeachers / limit) - 1; // Subtract 1 because page count starts at 0

            if (page > totalPages) throw new BadRequestException('Page number exceeds resource limit!');
            const teachers = await this.teacherModel.find({}).skip(offset).limit(limit).lean();
            return { currentPage: page, totalPages, teachers, totalCount: totalTeachers }
        } catch (error) {
            throw new BadRequestException(error && error.message);
        }
    }

    /* POST operations */
    public async loginViaEmail(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        const account = await this.teacherModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'email', 'role', 'subjects', 'permissions', 'phoneNumber']).lean()
        if (!account) throw new NotFoundException(`Email-login failed: Account fetch failed`);
        return await this.tokenService.generateTokens(account);
    }

    public async loginViaOTP(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        const account = await this.teacherModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'permissions']).lean()
        if (!account) throw new NotFoundException(`Otp-login failed: Account fetch failed`);
        return await this.otpService.generateOtp(account);
    }

    public async createAnAccount(teacher: CreateTeacherDto) {
        // await this.teacherModel.deleteMany({})
        // //Todo: [v1.1] use UUID / ULID as primary key for each teacher document.
        const teacherPojo = new this.teacherModel({ ...teacher });
        const savedTeacher = await teacherPojo.save().catch((err => {
            throw new BadRequestException(`Account creation failed: ${err.message}`)
        }));

        // Try setting cache up to two times if necessary
        let cacheAttempts = 0;
        while (cacheAttempts < 2) {
            try {
                await this.cacheService.setCache(`${savedTeacher.phoneNumber}-newTeacher`, savedTeacher, 900);
                return { data: savedTeacher };
            } catch (error) {
                /* log a creation error, and reset attempts */
                console.log(`Cache setting attempt ${cacheAttempts + 1} error`, error);
                cacheAttempts += 1;
            }
        }

        // If cache setting fails after two attempts, throw an error
        throw new Error("Failed to set cache after 2 attempts.");
    }

    public async verifyEmailLogin(payload: VerifyUser) {
        const { email, phoneNumber, token } = payload;
        return await this.tokenService.validateEmailLoginToken(token, email, phoneNumber);
    }

    public async verifyOtpLogin(otp: number, phoneNumber: string) {
        const account = await this.teacherModel.findOne({ phoneNumber })
            .select(['email', 'phoneNumber', 'role', 'permissions']).lean();
        return await this.otpService.verifyOtp(otp, account);
    }


    /* update services */
    public async grantTeacherPermissions(payload: PermissionsDto) {
        const { email, phoneNumber, status } = payload;
        const teacher = await this.teacherModel.findOne({ $or: [{ email }, { phoneNumber }] });
        if (!teacher) throw new NotFoundException(`Teacher's info not found!`);
        teacher.permissions = status;
        return { writePermissions: true, teacher: await teacher.save() }
    }

    public async runUpdateAccount(payload: UpdateTeacherDto) {
        const { email, phoneNumber } = payload;
        try {
            const updatedTeacher = await this.teacherModel.findOneAndUpdate(
                { $or: [{ email }, { phoneNumber }] }, payload, { new: true, upsert: false }
            );
            return updatedTeacher;
        } catch (error) {
            throw new BadRequestException(`Teacher account update failed:
            {teacher: ${email || phoneNumber}, err:${error?.message}}`);
        }
    }

    /** `subjects` can also be updated via the `runUpdateAccount` method.  */
    public async runUpdateSubjects(payload: UpdateSubjectDto) {
        const { email, phoneNumber, subject } = payload
        try {
            const teacher = await this.teacherModel.findOne({ $or: [{ phoneNumber }, { email }] });
            teacher.subjects.push(...subject);
            return await teacher.save();
        } catch (error) {
            throw new Error(`Error updating teacher's subject: 
            {teacher: ${email || phoneNumber}, err: ${error?.message}}`);
        }
    }

    /* delete services */
    public async runLogoutAccount(payload: LogoutDto) {
        const deletedResults = await this.tokenService.nullifyTokens(payload)
        if (!deletedResults) throw new NotFoundException('Account not found, logout failed!');
        return deletedResults;
    }

    public async runDeleteAccount(payload: DeleteTeacherDto) {
        const { email, phoneNumber } = payload;
        // delete the users account (db record.) && prob clear cache of any user related 
        const deletedTeacher = await this.teacherModel.deleteOne({ $or: [{ email }, { phoneNumber }] }, { lean: true })
        return deletedTeacher;
    }
}
