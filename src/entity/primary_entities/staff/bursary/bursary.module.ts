import { TokensModule } from "src/services/tokens/tokens.module";
import { Bursary, BursarySchema } from "./bursary.model";
import { BursaryController } from "./bursary.controller";
import { OtpModule } from "src/services/otp/otp.module";
import { BursaryServices } from "./bursary.services";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        OtpModule,
        TokensModule,
        MongooseModule.forFeature([{ name: Bursary.name, schema: BursarySchema }])
    ],
    controllers: [BursaryController],
    providers: [BursaryServices],
    exports: [BursaryServices]
})

export class BursaryModule { }