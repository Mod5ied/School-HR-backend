import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

type Subject = {
    CA: { test: number, assignment: number }
    Exams: number;
}

const defaultSubject: Subject = {
    CA: { assignment: 0, test: 0 },
    Exams: 0
}

@Schema()
export class SeniorGrade {
    @Prop({ required: true, lowercase: true })
    regNum: string
    /* eg: 'ss1-09, ss1-05 */

    /* sciences. */
     @Prop({ type: Object, default: defaultSubject })
    englishLanguage: Subject

     @Prop({ type: Object, default: defaultSubject })
    mathematics: Subject

     @Prop({ type: Object, default: defaultSubject })
    biology: Subject

     @Prop({ type: Object, default: defaultSubject })
    physics: Subject

     @Prop({ type: Object, default: defaultSubject })
    computerStudies: Subject

     @Prop({ type: Object, default: defaultSubject })
    economics: Subject

     @Prop({ type: Object, default: defaultSubject })
    agriculturalScience: Subject

     @Prop({ type: Object, default: defaultSubject })
    chemistry: Subject

     @Prop({ type: Object, default: defaultSubject })
    civicEducation: Subject

     @Prop({ type: Object, default: defaultSubject })
    geography: Subject

     @Prop({ type: Object, default: defaultSubject })
    furtherMaths: Subject

     @Prop({ type: Object, default: defaultSubject })
    dataProcessing: Subject

     @Prop({ type: Object, default: defaultSubject })
    crk: Subject

     @Prop({ type: Object, default: defaultSubject })
    frenchLanguage: Subject

     @Prop({ type: Object, default: defaultSubject })
    technicalDrawing: Subject

    /* arts. */
     @Prop({ type: Object, default: defaultSubject })
    literature: Subject

     @Prop({ type: Object, default: defaultSubject })
    government: Subject

     @Prop({ type: Object, default: defaultSubject })
    financialAccounts: Subject

     @Prop({ type: Object, default: defaultSubject })
    commerce: Subject

     @Prop({ type: Object, default: defaultSubject })
    igboLanguage: Subject

     @Prop({ type: Object, default: defaultSubject })
    marketing: Subject

     @Prop({ type: Object, default: defaultSubject })
    homeManagement: Subject
}

@Schema()
export class JuniorGrade {
    @Prop({ required: true, lowercase: true })
    regNum: string
    /* eg: 'js1-05, js2-07' */

     @Prop({ type: Object, default: defaultSubject })
    englishStudies: Subject

     @Prop({ type: Object, default: defaultSubject })
    mathematics: Subject

     @Prop({ type: Object, default: defaultSubject })
    furtherMaths: Subject

     @Prop({ type: Object, default: defaultSubject })
    basicScience: Subject

     @Prop({ type: Object, default: defaultSubject })
    basicTechnology: Subject

     @Prop({ type: Object, default: defaultSubject })
    businessStudies: Subject

     @Prop({ type: Object, default: defaultSubject })
    phe: Subject

     @Prop({ type: Object, default: defaultSubject })
    crk: Subject

     @Prop({ type: Object, default: defaultSubject })
    civicEducation: Subject

     @Prop({ type: Object, default: defaultSubject })
    agriculturalScience: Subject

     @Prop({ type: Object, default: defaultSubject })
    literature: Subject

     @Prop({ type: Object, default: defaultSubject })
    socialStudies: Subject

     @Prop({ type: Object, default: defaultSubject })
    igboLanguage: Subject
}

@Schema()
export class PupilGrade {
    @Prop({ required: true, lowercase: true })
    regNum: string

     @Prop({ type: Object, default: defaultSubject })
    englishLanguage: Subject

     @Prop({ type: Object, default: defaultSubject })
    mathematics: Subject

     @Prop({ type: Object, default: defaultSubject })
    igboLanguage: Subject

     @Prop({ type: Object, default: defaultSubject })
    culturalAndCreativeArts: Subject

     @Prop({ type: Object, default: defaultSubject })
    religionAndNationalValues: Subject

     @Prop({ type: Object, default: defaultSubject })
    basicScienceAndTech: Subject

     @Prop({ type: Object, default: defaultSubject })
    prevocationalStudies: Subject
}

export const SeniorGradesSchema = SchemaFactory.createForClass(SeniorGrade)
export const JuniorGradesSchema = SchemaFactory.createForClass(JuniorGrade)
export const PupilGradesSchema = SchemaFactory.createForClass(PupilGrade)