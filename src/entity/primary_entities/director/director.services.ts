import { CreateDirector, DeleteDirector, FetchDirector, LoginDirector, LogoutDirector, OtpVerify, TokenVerify, UpdateDirector } from "src/validation/dtos/director.dto";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";
import { CacheService } from "src/services/cache/cache.service";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { OtpService } from "src/services/otp/otp.service";
import { FlattenMaps, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Director } from "./director.model";

@Injectable()
export class DirectorServices {
    constructor(
        @InjectModel(Director.name) private readonly directorModel: Model<Director>,
        private readonly eventEmitter: EventEmitter2,
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly otpService: OtpService
    ) { }

    public async createAnAccount(payload: CreateDirector) {
        /* next ULID is created & set to pojo */
        const directorPojo = new this.directorModel({ ...payload });
        const savedDirector = await directorPojo.save().catch(err => {
            throw new BadRequestException(`Account creation failed: ${err.message}`)
        })
        //todo: handle errors within the `setCache` method.
        try {
            /* save the new record to the cache for about 15-mins to prevent re-write. */
            return await this.cacheService.setCache(`${savedDirector.phoneNumber}-newDirector`, savedDirector, 900)
                && { data: savedDirector };
        } catch (error) {
            throw new Error("Failed to set to cache!");
        }
    }

    public async loginViaEmail(payload: LoginDirector) {
        const { phoneNumber, school } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.directorModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'email', 'role', 'permissions', 'phoneNumber']);

        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`)
        /* v.1.1x: call a timed app service */
        return await this.tokenService.generateTokens(account);
    }

    public async loginViaOTP(payload: LoginDirector) {
        const { phoneNumber, school } = payload;
        /* v.1.1x: call a timed database service */
        const account = await this.directorModel
            .findOne({ $and: [{ phoneNumber }, { school }] })
            .select(['firstName', 'lastName', 'phoneNumber', 'role', 'subjects', 'permissions']).lean()
        if (!account) throw new NotFoundException(`Account does not exist for user: ${phoneNumber}`);
        /* v.1.1x: call a timed app service */
        //todo: run a script that checks if user is already logged-in, if truthy, then break context & ret tokens & message.
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
        const account = await this.directorModel.findOne({ phoneNumber })
            .select(['email', 'phoneNumber', 'role', 'permissions']).lean();

        if (!account) throw new BadRequestException({ info: 'Account not found', err: account })
        // /* v.1.1x: call a timed app service */
        return await this.otpService.verifyOtp(otp, account);
    }

    public async fetchDirectorDoc(payload: FetchDirector) {
        const { email, phoneNumber } = payload;
        const account = await this.directorModel.findOne({ $and: [{ email }, { phoneNumber }] }).lean()
        if (!account) throw new NotFoundException(`Director's info not found!`);
        this.eventEmitter.emit("director.fetched", account);
        return { data: account };
    }
    @OnEvent("director.fetched")
    async cacheDirectorInfo(payload: FlattenMaps<Director> & { _id: Types.ObjectId }) {
        //todo: clear this cache after the user-info is updated at PATCH route.
        await this.cacheService.setCache(`${payload.phoneNumber}-info`, payload, 600)
    }

    public async fetchAllDirectors() {
        const users = await this.directorModel.find().lean();
        if (!users) throw new NotFoundException(`Directors list not found!`)
        this.eventEmitter.emit("directors.fetched", users);
        return { data: users };
    }
    @OnEvent("directors.fetched")
    async cacheDirectors(payload: (FlattenMaps<Director> & {_id: Types.ObjectId})[]) {
        await this.cacheService.setCache(`directors-list`, payload, 600);
    }

    public async runUpdateAccount(payload: UpdateDirector) {
        const { phoneNumber, updateBody } = payload;
        /* v.1.1x: call a timed database service */
        const result = await this.directorModel.findOneAndUpdate(
            { phoneNumber }, updateBody, { new: true }
        );
        if (!result) throw new BadRequestException({ info: `Director account update failed!`, err: result });
        //todo: emit an event to clear the FETCH cache after 3 secs.
        return { updated: true, data: result };
    }

    public async runLogoutAccount(payload: LogoutDirector) {
        /* v.1.1x: call a timed app service */
        const { aTokenDeleted, rTokenDeleted } = await this.tokenService.nullifyTokens(payload);
        if (aTokenDeleted.deletedCount === 0) throw new NotFoundException('Account not found; logout failed!');
        if (rTokenDeleted.deletedCount === 0) throw new NotFoundException('RefToken deletion aborted; logout failed!');
        return { loggedOut: true }
    }

    /** method is exclusive to admin account.  */
    public async runDeleteAccount(payload: DeleteDirector) {
        const { phoneNumber } = payload;
        const deletedDirector = await this.directorModel.deleteOne({ phoneNumber }, { lean: true });
        if (deletedDirector.deletedCount === 0) throw new BadRequestException("Account not found; purging failed!");
        else if (deletedDirector.deletedCount >= 1) return { deleted: true };
    }
}