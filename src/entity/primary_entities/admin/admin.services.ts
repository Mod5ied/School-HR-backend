import { CreateAdmin, DeleteAdmin, FetchAdmin, LoginAdmin, LogoutAdmin, OtpVerify, TokenVerify, UpdateAdmin } from "src/validation/dtos/admin.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";
import { CacheService } from "src/services/cache/cache.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { OtpService } from "src/services/otp/otp.service";
import { InjectModel } from "@nestjs/mongoose";
import { Admin } from "../admin/admin.model";
import { Model, Types } from "mongoose";
import { FlattenMaps } from "mongoose";
import gen from "otp-generator";

@Injectable()
export class AdminServices {
    constructor(
        @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
        private readonly eventEmitter: EventEmitter2,
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService
    ) { }

    public async createAnAccount(payload: CreateAdmin) {

        /* next ULID is created & set to pojo */
        const directorPojo = new this.adminModel({ ...payload });
        const savedDirector = await directorPojo.save().catch(err => {
            throw new BadRequestException(`Account creation failed: ${err.message}`)
        })
        //todo: handle errors within the `setCache` method.
        try {
            /* save the new record to the cache for about 15-mins to prevent re-write. */
            return await this.cacheService.setCache(`${savedDirector.phoneNumber}-newAdmin`, savedDirector, 900)
                && { data: savedDirector };
        } catch (error) {
            throw new Error("Failed to set to cache!");
        }
    }

    public async loginViaEmail(payload: LoginAdmin) {
        //todo: update the admin-keys at this point.
        const { email, phoneNumber } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.adminModel
            .findOne({ $and: [{ phoneNumber }, { email }] })
            .select(['firstName', 'lastName', 'email', 'role', 'permissions', 'phoneNumber']);
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`)
        /* v.1.1x: call a timed app service */
        return await this.tokenService.generateTokens(account);
    }

    public async loginViaOTP(payload: LoginAdmin) {
        //todo: update the admin-keys at this point.
        const { email, phoneNumber } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.adminModel
            .findOne({ $and: [{ phoneNumber }, { email }] })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'permissions']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        /* v.1.1x: call a timed app service */
        await this.adminModel.updateOne({ email }, { $set: { adminKey: parseInt(gen.generate(6, { digits: true })) } })
        return await this.otpService.generateOtp(account);
    }

    public async verifyEmailLogin(payload: TokenVerify) {
        const { email, phoneNumber, token } = payload;
        /* v.1.1x: call a timed app service */
        return await this.tokenService.validateEmailLoginToken(token, email, phoneNumber);
    }

    public async verifyOtpLogin(payload: OtpVerify) {
        const { email, otp, phoneNumber } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.adminModel.findOne({ $and: [{ email }, { phoneNumber }] })
            .select(['email', 'phoneNumber', 'role', 'permissions']).lean();
        if (!account) throw new BadRequestException({ info: 'Account not found', err: account })
        /* v.1.1x: call a timed app service */
        return await this.otpService.verifyOtp(otp, account);
    }

    public async fetchAdminDoc(payload: FetchAdmin) {
        const { email, phoneNumber } = payload;
        const account = await this.adminModel.findOne({ $and: [{ email }, { phoneNumber }] }).lean()
        if (!account) throw new NotFoundException(`Admin info not found!`);
        this.eventEmitter.emit("admin.fetched", account);
        return { data: account };
    }
    @OnEvent("admin.fetched")
    async cacheDirectorInfo(payload: FlattenMaps<Admin> & { _id: Types.ObjectId }) {
        //todo: clear this cache after the user-info is updated at PATCH route.
        await this.cacheService.setCache(`${payload.phoneNumber}-info`, payload, 600)
    }

    public async runUpdateAccount(payload: UpdateAdmin) {
        const { email, updateBody } = payload;
        /* v.1.1x: call a timed database service */
        const result = await this.adminModel.findOneAndUpdate(
            { email }, updateBody, { new: true }
        );
        if (!result) throw new BadRequestException({ info: `Admin account update failed!`, err: result });
        //todo: emit an event to clear the FETCH cache after 3 secs.
        return { updated: true, data: result };
    }

    public async runLogoutAccount(payload: LogoutAdmin) {
        /* v.1.1x: call a timed app service */
        const deletedResults = await this.tokenService.nullifyTokens(payload);
        if (!deletedResults) throw new NotFoundException('Account not found; logout failed!');
        return deletedResults;
    }

    public async runDeleteAccount(payload: DeleteAdmin) {
        const { email, phoneNumber } = payload;
        const deletedDirector = await this.adminModel.deleteOne({ $and: [{ email }, { phoneNumber }] },
            { lean: true });
        return deletedDirector;
    }
}