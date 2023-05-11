import { Injectable } from "@nestjs/common"
import * as speakeasy from "speakeasy"


@Injectable()
export class OtpService {
    OTP_DIGITS = 6
    OTP_STEPS = 120
    constructor(
        private readonly speakeasyPkg: typeof speakeasy,
        private readonly secret = speakeasy.generateSecret().base32,
    ) { }

    // public generateOtp() {
    //     const otp = this.speakeasyPkg.totp({
    //         secret: this.secret,
    //         encoding: "base32",
    //         step: this.OTP_STEPS,
    //         digits: this.OTP_DIGITS,
    //     })

    //     /* encode the otp as a number */
    //     // const otpNumber = parseInt(Buffer.from(otp, 'utf8').toString('hex'), 16)

    //     return { otp, secret: this.secret }
    // }
    public generateOtp(): { otp: string; secret: string } {
        const { base32: secret } = this.speakeasyPkg.generateSecret({ length: 20 });
        const otp = this.speakeasyPkg.totp({
            secret,
            encoding: 'base32',
            step: 30,
        });

        return { otp, secret };
    }


    // public verifyOtp(otpNumber: string): boolean {
    //     // const otp = Buffer.from(otpNumber.toString(16), 'hex').toString('utf8')
    //     const verified = this.speakeasyPkg.totp.verify({
    //         secret: this.secret,
    //         encoding: 'base32',
    //         token: otpNumber,
    //         window: 1
    //     });
    //     return verified;
    // }
    public verifyOtp(otpNumber: string, secret: string): boolean {
        const verified = this.speakeasyPkg.totp.verify({
            secret,
            encoding: 'base32',
            token: otpNumber,
            step: 30,
        });
        return verified;
    }

}
