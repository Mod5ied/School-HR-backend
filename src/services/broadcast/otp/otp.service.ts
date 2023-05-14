import { ErrorService } from "src/services/errors/error.service";
import { Injectable, Inject, CACHE_MANAGER } from "@nestjs/common"
import { Cache } from "cache-manager";

@Injectable()
export class OtpService {
    OTP_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]
    constructor(
        private readonly errorManager: ErrorService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) { }

    public async generateOtp(user: string): Promise<{ otp: number[] }> {
        const otp: number[] = [];
        for (let i = 0; i < 6; i++) {
            otp.push(this.OTP_DIGITS[Math.floor(Math.random() * 10)])
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        /* save the otp to redis-cache and when user send it back compare the two and respond. */
        await this.cacheManager.set("user", { user, otp })
        return { otp };
    }

    public async verifyOtp(otpNumber: number) {
        /* fetch the otp doc from the redis-cache and verify if it exists. returns truthy or falsy */
        const cachedOtp = await this.cacheManager.get("user")
        if (otpNumber === cachedOtp) return true
        return this.errorManager.unauthorizedRequest("Token is invalid!")
    }

}
