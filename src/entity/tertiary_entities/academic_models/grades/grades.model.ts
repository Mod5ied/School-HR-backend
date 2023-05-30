import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

type Subject = {
    CA: {
        test: number,
        assignment: number
    }
    Exams: number;
}

/* The reason you need to specify the type in the @Prop decorator is that 
    Mongoose cannot automatically determine the type of the Subject object in your schema. 
    By explicitly defining the type as Object, you are informing Mongoose that 
    the Subject type should be treated as a plain object in the schema. */

@Schema()
export class SeniorGrade {
    @Prop({ required: true, lowercase: true })
    regNum: string
    /* eg: 'ss1-09, ss1-05 */

    /* sciences. */
    @Prop({ type: Object })
    englishLanguage: Subject

    @Prop({ type: Object })
    mathematics: Subject

    @Prop({ type: Object })
    biology: Subject

    @Prop({ type: Object })
    physics: Subject

    @Prop({ type: Object })
    computerStudies: Subject

    @Prop({ type: Object })
    economics: Subject

    @Prop({ type: Object })
    agriculturalScience: Subject

    @Prop({ type: Object })
    chemistry: Subject

    @Prop({ type: Object })
    civicEducation: Subject

    @Prop({ type: Object })
    geography: Subject

    @Prop({ type: Object })
    furtherMaths: Subject

    @Prop({ type: Object })
    dataProcessing: Subject

    @Prop({ type: Object })
    crk: Subject

    @Prop({ type: Object })
    frenchLanguage: Subject

    @Prop({ type: Object })
    technicalDrawing: Subject

    /* arts. */
    @Prop({ type: Object })
    literature: Subject

    @Prop({ type: Object })
    government: Subject

    @Prop({ type: Object })
    financialAccounts: Subject

    @Prop({ type: Object })
    commerce: Subject

    @Prop({ type: Object })
    igboLanguage: Subject

    @Prop({ type: Object })
    marketing: Subject

    @Prop({ type: Object })
    homeManagement: Subject
}

@Schema()
export class JuniorGrade {
    @Prop({ required: true,lowercase: true })
    regNum: string
    /* eg: 'js1-05, js2-07' */

    @Prop({ type: Object })
    englishStudies: Subject

    @Prop({ type: Object })
    mathematics: Subject

    @Prop({ type: Object })
    furtherMaths: Subject

    @Prop({ type: Object })
    basicScience: Subject

    @Prop({ type: Object })
    basicTechnology: Subject

    @Prop({ type: Object })
    businessStudies: Subject

    @Prop({ type: Object })
    phe: Subject

    @Prop({ type: Object })
    crk: Subject

    @Prop({ type: Object })
    civicEducation: Subject

    @Prop({ type: Object })
    agriculturalScience: Subject

    @Prop({ type: Object })
    literature: Subject

    @Prop({ type: Object })
    socialStudies: Subject

    @Prop({ type: Object })
    igboLanguage: Subject
}

@Schema()
export class PupilGrade {
    @Prop({ required: true, lowercase: true })
    regNum: string

    @Prop({ type: Object })
    englishLanguage: Subject

    @Prop({ type: Object })
    mathematics: Subject

    @Prop({ type: Object })
    igboLanguage: Subject

    @Prop({ type: Object })
    culturalAndCreativeArts: Subject

    @Prop({ type: Object })
    religionAndNationalValues: Subject

    @Prop({ type: Object })
    basicScienceAndTech: Subject

    @Prop({ type: Object })
    prevocationalStudies: Subject
}

export const SeniorGradesSchema = SchemaFactory.createForClass(SeniorGrade)
export const JuniorGradesSchema = SchemaFactory.createForClass(JuniorGrade)
export const PupilGradesSchema = SchemaFactory.createForClass(PupilGrade)