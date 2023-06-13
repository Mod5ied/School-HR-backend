import { ResponseService } from "../broadcast/response/response.tokens";
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

    /** generates OTP and saves it to the cache.  */
    public async generateOtp(user: Partial<Users>) {
        const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, digits: true, specialChars: false, upperCaseAlphabets: false })
        await this.cacheService.setCache(`${user.phoneNumber}-otp`, otp)
        return { number: user.phoneNumber, otp }
        // await this.responseService.respondViaOtp(user.phoneNumber, otp)
    }


    /** verifies an OTP and clears it from cache.  */
    public async verifyOtp(otp: number, user: Partial<Users>) {
        const cachedOtp = await this.cacheService.getCached(`${user.phoneNumber}-otp`);
        if (cachedOtp !== otp) throw new UnauthorizedException("OTP is expired or not a match!")
        else {
            await this.cacheService.delCached(`${user.phoneNumber}-otp`)
            const encryptedKey = await this.tokenService.generateEncryptedKeys(user)
            return await this.responseService.respondToClient(encryptedKey, {
                permissions: user.permissions, role: user.role
            })
        }
    }
}