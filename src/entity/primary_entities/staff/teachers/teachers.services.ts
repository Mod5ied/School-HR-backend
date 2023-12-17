import { CreateTeacherDto, DeleteStaffDto, FetchStaffDto, LoginDto, LogoutDto, PermissionsDto, UpdateSubjectDto, UpdateStaffDto, OtpVerify, TokenVerify } from 'src/validation/dtos/staff.dto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TokenService } from 'src/services/tokens/tokens.service';
import { CacheService } from 'src/services/cache/cache.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { OtpService } from 'src/services/otp/otp.service';
import { FlattenMaps, Model, Types } from 'mongoose';
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

    public async createAnAccount(teacher: CreateTeacherDto) {
        /* next ULID is created & set to pojo */
        const teacherPojo = new this.teacherModel({ ...teacher });
        const savedTeacher = await teacherPojo.save().catch((err => {
            throw new BadRequestException(`Account creation failed: ${err.message}`)
        }));
        try {
            return await this.cacheService.setCache(`${savedTeacher.phoneNumber}-newTeacher`, savedTeacher, 900)
                && { data: savedTeacher };
        } catch (error) {
            throw new Error("Failed to set to cache!");
        }
    }

    public async loginViaEmail(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        const account = await this.teacherModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'email', 'role', 'subjects', 'permissions', 'phoneNumber']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        return await this.tokenService.generateTokens(account);
    }

    public async loginViaOTP(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        const account = await this.teacherModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'permissions']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        return await this.otpService.generateOtp(account);
    }

    public async verifyEmailLogin(payload: TokenVerify) {
        const { email, phoneNumber, token } = payload;
        return await this.tokenService.validateEmailLoginToken(token, email, phoneNumber);
    }

    public async verifyOtpLogin(payload: OtpVerify) {
        const { otp, phoneNumber } = payload;
        const result = await this.teacherModel.findOne({ phoneNumber })
            .select(['email', 'phoneNumber', 'role', 'permissions']).lean();
        if (!result) throw new BadRequestException({ info: 'Account not found', err: result });
        return await this.otpService.verifyOtp(otp, result);
    }

    public async fetchTeacherDoc(payload: FetchStaffDto) {
        const { email, phoneNumber } = payload;
        const teacher = await this.teacherModel.findOne({ $and: [{ email }, { phoneNumber }] }).lean()
        if (!teacher) throw new NotFoundException(`Teacher's info not found!`)
        this.eventEmitter.emit("teacher.fetched", teacher);
        return teacher;
    }
    @OnEvent("teacher.fetched")
    async cacheTeacherInfo(payload: FlattenMaps<Teacher> & {_id: Types.ObjectId}) {
        await this.cacheService.setCache(`${payload.phoneNumber}-info`, payload, 600);
    }

    public async fetchAllTeacherDocs(payload: FetchStaffDto) {
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
            const staff = await this.teacherModel.find({}).skip(offset).limit(limit).lean();
            return { currentPage: page, totalPages, staff, totalCount: totalTeachers }
        } catch (error) {
            throw new BadRequestException(error && error.message);
        }
    }

    /* update services */
    public async grantTeacherPermissions(payload: PermissionsDto) {
        const { phoneNumber, updateBody } = payload;
        const result = await this.teacherModel.findOneAndUpdate(
            { phoneNumber }, { $set: { permissions: updateBody } }, { new: true }
        )
        if (!result) throw new BadRequestException({ info: `Permissions update failed`, err: result });
        return { updated: true, data: result };

    }

    public async runUpdateAccount(payload: UpdateStaffDto) {
        const { phoneNumber, updateBody } = payload;
        const result = await this.teacherModel.findOneAndUpdate(
            { phoneNumber }, updateBody, { new: true }
        );
        if (!result) throw new BadRequestException({ info: `Staff account update failed`, err: result })
        return { updated: true, data: result };
    }

    /** `subjects` can also be updated via the `runUpdateAccount` method.  */
    public async runUpdateSubjects(payload: UpdateSubjectDto) {
        const { phoneNumber, updateBody: { subject } } = payload
        const result = await this.teacherModel.findOne({ phoneNumber })
        if (!result) throw new BadRequestException({ info: 'Staff subject update failed', err: result });
        result.subjects.push(...subject);
        return await result.save();
    }

    /* delete services */
    public async runLogoutAccount(payload: LogoutDto) {
        const deletedResults = await this.tokenService.nullifyTokens(payload)
        if (!deletedResults) throw new NotFoundException('Account not found, logout failed!');
        return deletedResults;
    }

    public async runDeleteAccount(payload: DeleteStaffDto) {
        const { phoneNumber } = payload;
        const deletedTeacher = await this.teacherModel.deleteOne({ phoneNumber }, { lean: true })
        return deletedTeacher;
    }
}
