import { Injectable, Inject, CACHE_MANAGER, UnauthorizedException } from "@nestjs/common"
import { ResponseService } from "../broadcast/response/reponse.tokens";
import { Users } from "../tokens/tokens.types";
import otpGenerator from "otp-generator"
import { Cache } from "cache-manager";

@Injectable()
export class OtpService {
    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) { }

    private readonly responseService: ResponseService

    /** generates OTP and saves it to the cache.  */
    public async generateOtp(user: Partial<Users>) {
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, digits: true, specialChars: false, upperCaseAlphabets: false })
        await this.cacheManager.set(`${user.phoneNumber}-otp`, { otp }).catch(err => {
            throw new Error(`Error setting OTP in cache: ${err}`)
        })
        await this.responseService.respondViaOtp(user.phoneNumber, otp)
    }


    /** verifies an OTP and clears it from cache.  */
    public async verifyOtp(otp: number, user: Partial<Users>) {
        const cachedOtp = await this.cacheManager.get(`${user.phoneNumber}-otp`)
        if (cachedOtp !== otp) throw new UnauthorizedException("Token is invalid!")
        await this.cacheManager.del(`${user.phoneNumber}-otp`)
        return true
    }
}