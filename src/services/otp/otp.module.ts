import { ResponseService } from "../broadcast/response/response.services";
import { TokensModule } from "../tokens/tokens.module";
import { OtpService } from "./otp.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [TokensModule],
    providers: [OtpService, ResponseService],
    exports: [OtpService]
})
export class OtpModule { }
