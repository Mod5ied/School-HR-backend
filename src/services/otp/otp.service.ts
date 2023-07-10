import { ResponseService } from "../broadcast/response/response.services";
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
        In `v.1.1`, cache `ttl` would be set to 1-min to max up security */
    public async generateOtp(user: Partial<Users>) {
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, digits: true, specialChars: false, upperCaseAlphabets: false })
        await this.cacheService.setCache(`${user.phoneNumber}-otp`, otp, 60); //🤞

        /* recall that only the OTP is the return value here. */
        /* it is sent directly to the phoneNumber provided. */
        return { number: user.phoneNumber, otp: parseInt(otp) }
        // await this.responseService.respondViaOtp(user.phoneNumber, otp);
    }


    /** `verifyOtp` verifies an OTP and clears it from cache. */
    public async verifyOtp(otp: number, user: Partial<Users>) {
        const cachedOtp = parseInt(await this.cacheService.getCached(`${user.phoneNumber}-otp`));
        if (cachedOtp !== otp) throw new UnauthorizedException("OTP is expired or not a match!")
        await Promise.all([
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