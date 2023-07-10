import { TokensModule } from "src/services/tokens/tokens.module";
import { TeachersControllers } from "./teachers.controller";
import { Teacher, TeachersSchema } from "./teachers.model";
import { OtpModule } from "src/services/otp/otp.module";
import { TeachersServices } from "./teachers.services";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        OtpModule,
        TokensModule,
        MongooseModule.forFeature([{ name: Teacher.name, schema: TeachersSchema }]),
    ],
    controllers: [TeachersControllers],
    providers: [TeachersServices],
    exports: [TeachersServices]
})
export class TeachersModule { }