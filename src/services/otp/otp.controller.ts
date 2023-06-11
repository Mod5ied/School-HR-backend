// import { CacheInterceptor, Controller, Get, Post, Param, UseInterceptors } from "@nestjs/common"
// import { OtpService } from "./otp.service"

// @UseInterceptors(CacheInterceptor)
// @Controller("otp")
// export class OtpController {
//     constructor(private readonly otpService: OtpService) { }

//     @Get("/:user")
//     getOtp(@Param('user') user: string) {
//         return this.otpService.generateOtp(user)
//     }

//     @Post("/verify/:otp")
//     verifyOtp(@Param('otp') otp: number) {
//         /* re-write this to to pass the otp via the 'bearer-token' option in headers. */
//         return this.otpService.verifyOtp(otp)
//     }
// }   