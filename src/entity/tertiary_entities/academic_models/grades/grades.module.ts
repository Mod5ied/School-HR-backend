import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JuniorGrade, JuniorGradesSchema, PupilGrade, PupilGradesSchema, SeniorGrade, SeniorGradesSchema } from "./grades.model";
import { GradesController } from "./grades.controller";
import { GradesServices } from "./grades.services";
import { TokensModule } from "src/services/tokens/tokens.module";

@Module({
    imports: [
        TokensModule,
        MongooseModule.forFeature([
            { name: SeniorGrade.name, schema: SeniorGradesSchema },
            { name: JuniorGrade.name, schema: JuniorGradesSchema },
            { name: PupilGrade.name, schema: PupilGradesSchema }
        ]),
    ],
    controllers: [GradesController],
    providers: [GradesServices],
    exports: [GradesServices]
})

export class GradesModule { }