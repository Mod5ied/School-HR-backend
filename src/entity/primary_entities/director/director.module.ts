import { TokensModule } from "src/services/tokens/tokens.module";
import { DirectorController } from "./director.controller";
import { Director, DirectorSchema } from "./director.model";
import { OtpModule } from "src/services/otp/otp.module";
import { DirectorServices } from "./director.services";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";


@Module({
    imports: [
        OtpModule,
        TokensModule,
        MongooseModule.forFeature([{ name: Director.name, schema: DirectorSchema }])
    ],
    controllers: [DirectorController],
    providers: [DirectorServices],
    exports: [DirectorServices]
})

export class DirectorsModule { }