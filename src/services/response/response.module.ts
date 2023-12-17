import { Module } from "@nestjs/common";
import { ResponseService } from "./response.services";
import { EmailTransport } from "../mailer/mailer.transport";


@Module({
    imports: [
    ],
    providers: [
        ResponseService,
    ],
    exports: [ResponseService]
})

export class ResponseModule { }