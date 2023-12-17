import { CreateBursarDto, DeleteStaffDto, FetchStaffDto, LoginDto, LogoutDto, OtpVerify, PermissionsDto, TokenVerify, UpdateStaffDto } from "src/validation/dtos/staff.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";
import { CacheService } from "src/services/cache/cache.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { OtpService } from "src/services/otp/otp.service";
import { FlattenMaps, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Bursary} from "./bursary.model";

@Injectable()
export class BursaryServices {
    constructor(
        @InjectModel(Bursary.name) private readonly bursaryModel: Model<Bursary>,
        private readonly eventEmitter: EventEmitter2,
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService,
    ) { }

    public async createAnAccount(payload: CreateBursarDto) {
        /* next ULID is created & set to pojo */
        const bursarPojo = new this.bursaryModel({ ...payload });
        const savedBursar = await bursarPojo.save().catch(err => {
            throw new BadRequestException(`Account creation failed: ${err.message}`)
        })
        //todo: handle errors within the `setCache` method.
        try {
            return await this.cacheService.setCache(`${savedBursar.phoneNumber}-newBursar`, savedBursar, 900)
                && { data: savedBursar };
        } catch (error) {
            throw new Error("Failed to set to cache!");
        }
    }

    public async loginViaEmail(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.bursaryModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'email', 'role', 'permissions', 'phoneNumber']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        /* v.1.1x: call a timed app service */
        return await this.tokenService.generateTokens(account);
    }

    public async loginViaOTP(payload: LoginDto) {
        const { phoneNumber, school } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.bursaryModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'permissions']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        /* v.1.1x: call a timed app service */
        return await this.otpService.generateOtp(account);
    }

    public async verifyEmailLogin(payload: TokenVerify) {
        const { email, phoneNumber, token } = payload;
        /* v.1.1x: call a timed app service */
        return await this.tokenService.validateEmailLoginToken(token, email, phoneNumber);
    }

    public async verifyOtpLogin(payload: OtpVerify) {
        const { otp, phoneNumber } = payload;
        /* v.1.1x: call a timed database service */
        const result = await this.bursaryModel.findOne({ phoneNumber })
            .select(['email', 'phoneNumber', 'role', 'permissions']).lean();
        if (!result) throw new BadRequestException({ info: 'Account not found', err: result });
        /* v.1.1x: call a timed app service */
        return await this.otpService.verifyOtp(otp, result);
    }

    public async fetchBursarDoc(payload: FetchStaffDto) {
        const { email, phoneNumber } = payload;
        const bursar = await this.bursaryModel.findOne({ $and: [{ email }, { phoneNumber }] }).lean();
        if (!bursar) throw new NotFoundException(`Bursar's info not found!`);
        this.eventEmitter.emit("bursary.fetched", bursar);
        return { data: bursar };
    }
    @OnEvent("bursary.fetched")
    async cacheBursarInfo(payload: FlattenMaps<Bursary> & {_id: Types.ObjectId}) {
        //todo: clear this cache after the user-info is updated at PATCH route.
        await this.cacheService.setCache(`${payload.phoneNumber}-info`, payload, 600)
    }

    public async fetchAllBursaryDocs(payload: FetchStaffDto) {
        const { range } = payload;
        const page = range.start || 0;
        const limit = 20;
        const offset = page * limit;
        try {
            // Getting the total count of teachers
            const totalBursars = await this.bursaryModel.countDocuments().lean();

            // Calculating total pages
            const totalPages = Math.ceil(totalBursars / limit) - 1; // Subtract 1 because page count starts at 0

            if (page > totalPages) throw new BadRequestException('Page number exceeds resource limit!');
            const staff = await this.bursaryModel.find({}).skip(offset).limit(limit).lean();
            return { currentPage: page, totalPages, staff, totalCount: totalBursars }
        } catch (error) {
            throw new BadRequestException(error && error.message);
        }
    }

    public async grantBursaryPermissions(payload: PermissionsDto) {
        const { phoneNumber, updateBody } = payload;
        const result = await this.bursaryModel.findOneAndUpdate(
            { phoneNumber }, { $set: { permissions: updateBody } }, { new: true }
        )
        if (!result) throw new BadRequestException({ info: `Permissions update failed`, err: result });
        return { updated: true, data: result };

    }

    public async runUpdateAccount(payload: UpdateStaffDto) {
        const { phoneNumber, updateBody } = payload;
        const result = await this.bursaryModel.findOneAndUpdate(
            { phoneNumber }, updateBody, { new: true }
        );
        if (!result) throw new BadRequestException({ info: `Staff account update failed`, err: result })
        //todo: emit an event to clear the FETCH cache after 3 secs.
        return { updated: true, data: result };
    }

    public async runLogoutAccount(payload: LogoutDto) {
        /* v.1.1x: call a timed app service */
        const deletedResults = await this.tokenService.nullifyTokens(payload);
        if (!deletedResults) throw new NotFoundException('Account not found; logout failed!');
        return deletedResults;
    }

    public async runDeleteAccount(payload: DeleteStaffDto) {
        const { phoneNumber } = payload;
        const deletedTeacher = await this.bursaryModel.deleteOne({ phoneNumber }, { lean: true });
        return deletedTeacher;
    }
} 