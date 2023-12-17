import { ResponseService } from "../response/response.services";
import { Injectable, UnauthorizedException } from "@nestjs/common"
import { TokenService } from "../tokens/tokens.service";
import { CacheService } from "../cache/cache.service";
import { Users } from "../tokens/tokens.types";
import otpGenerator from "otp-generator"

@Injectable()
export class OtpService {
    constructor(
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
        private readonly responseService: ResponseService,
    ) { }

    /** `generateOtp` generates OTP and saves it to the cache (for 2-minutes). 
    ** In `v.1.1`, cache `ttl` would be set to 1-min to max up security */
    public async generateOtp(user: Partial<Users>) {
        //todo: save otps to and check cache if generated otps already exist for the day before generating a new one.
        //? means all verified/expired/unverified token are saved to cache (after their 'ttl') to be used to query b4 gen new Otps.
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, digits: true, specialChars: false, upperCaseAlphabets: false })
        await this.cacheService.setCache(`${user.phoneNumber}-otp`, otp, 60); //🤞

        /* recall that only the OTP is the return value here. */
        /* it is sent directly to the phoneNumber provided. */
        return { number: user.phoneNumber, otp: parseInt(otp) }
        // await this.responseService.respondViaOtp(user.phoneNumber, otp);
    }

    /** In `v.1.1`, the generateAdminOtp method would be used to ensure a longer 
        and more secured otp secure code by generating up to 8 digits of random code. */
    // public async generateAdminOtp(user: Partial<Users>) {
    //     const otp = otpGenerator.generate(8, { lowerCaseAlphabets: false, digits: true, specialChars: false, upperCaseAlphabets: false })
    //     await this.cacheService.setCache(`${user.phoneNumber}-otp`, otp, 60);
    //     return { number: user.phoneNumber, otp: parseInt(otp) }
    // }

    /** `verifyOtp` verifies an OTP and clears it from cache. */
    public async verifyOtp(otp: number, user: Partial<Users>) {
        const cachedOtp = parseInt(await this.cacheService.getCached(`${user.phoneNumber}-otp`));
        if (cachedOtp !== otp) throw new UnauthorizedException("OTP is expired or not a match!") //? wrong logic, check info above.
        await Promise.all([
            //? we don't clear our cache until 24-hours.
            this.cacheService.delCached(`${user.phoneNumber}-otp`),
            this.cacheService.getCached(`${user.phoneNumber}-accessToken`)
        ])
        const encryptedKey = await this.tokenService.generateEncryptedKeys(user);
        const token = (await this.tokenService.generateTokens(user)).hashedAccessToken;
        return this.responseService.verifiedResponse(token, encryptedKey, {
            permissions: user.permissions, role: user.role, phoneNumber: user.phoneNumber
        })
    }
}