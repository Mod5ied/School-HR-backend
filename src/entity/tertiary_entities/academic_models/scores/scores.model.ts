import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

type Subject = {
    CA: {
        test: number,
        assignment: number
    }
    Exams: number;
}

@Schema()
export class SeniorScore {
    /* sciences. */
    @Prop()
    englishLanguage: Subject

    @Prop()
    mathematics: Subject

    @Prop()
    biology: Subject

    @Prop()
    physics: Subject

    @Prop()
    computerStudies: Subject

    @Prop()
    economics: Subject

    @Prop()
    agriculturalScience: Subject

    @Prop()
    chemistry: Subject

    @Prop()
    civicEducation: Subject

    @Prop()
    geography: Subject

    @Prop()
    furtherMaths: Subject

    @Prop()
    dataProcessing: Subject

    @Prop()
    crk: Subject

    @Prop()
    frenchLanguage: Subject

    @Prop()
    technicalDrawing: Subject

    /* arts. */
    @Prop()
    literature: Subject

    @Prop()
    government: Subject

    @Prop()
    financialAccounts: Subject

    @Prop()
    commerce: Subject

    @Prop()
    igboLanguage: Subject

    @Prop()
    marketing: Subject

    @Prop()
    homeManagement: Subject
}

@Schema()
export class JuniorScore {
    @Prop()
    englishStudies: Subject

    @Prop()
    mathematics: Subject

    @Prop()
    furtherMaths: Subject

    @Prop()
    basicScience: Subject

    @Prop()
    basicTechnology: Subject

    @Prop()
    businessStudies: Subject

    @Prop()
    phe: Subject

    @Prop()
    crk: Subject

    @Prop()
    civicEducation: Subject

    @Prop()
    agriculturalScience: Subject

    @Prop()
    literature: Subject

    @Prop()
    socialStudies: Subject

    @Prop()
    igboLanguage: Subject
}

@Schema()
export class PupilScore {
    @Prop()
    englishLanguage: Subject

    @Prop()
    mathematics: Subject

    @Prop()
    igboLanguage: Subject

    @Prop()
    culturalAndCreativeArts: Subject

    @Prop()
    religionAndNationalValues: Subject  

    @Prop()
    basicScienceAndTech: Subject

    @Prop()
    prevocationalStudies: Subject
}

export const SeniorScoresSchema = SchemaFactory.createForClass(SeniorScore)
export const JuniorScoresSchema = SchemaFactory.createForClass(JuniorScore)
export const PupilScoresSchema = SchemaFactory.createForClass(PupilScore)