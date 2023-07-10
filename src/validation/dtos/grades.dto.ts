import mongoose from "mongoose";
import { JuniorGrade, PupilGrade, SeniorGrade } from "src/entity/tertiary_entities/academic_models/grades/grades.model";

type Subject = {
    continuousAssessment: {
        test: number,
        assignment: number
    }
    exams: number;
}

interface SeniorFragment {
    email: string | undefined
    regNum: string
    englishLanguage: Subject
    mathematics: Subject
    biology: Subject
    physics: Subject
    computerStudies: Subject
    economics: Subject
    agriculturalScience: Subject
    chemistry: Subject
    civicEducation: Subject
    geography: Subject
    furtherMaths: Subject
    dataProcessing: Subject
    crk: Subject
    frenchLanguage: Subject
    technicalDrawing: Subject
    literature: Subject
    government: Subject
    financialAccounts: Subject
    commerce: Subject
    igboLanguage: Subject
    marketing: Subject
    homeManagement: Subject
}

interface JuniorFragment {
    email: string | undefined
    regNum: string
    englishStudies: Subject
    mathematics: Subject
    furtherMaths: Subject
    basicScience: Subject
    basicTechnology: Subject
    businessStudies: Subject
    phe: Subject
    crk: Subject
    civicEducation: Subject
    agriculturalScience: Subject
    literature: Subject
    socialStudies: Subject
    igboLanguage: Subject
}

interface PupilFragment {
    regNum: string
    englishLanguage: Subject
    mathematics: Subject
    igboLanguage: Subject
    culturalAndCreativeArts: Subject
    religionAndNationalValues: Subject
    basicScienceAndTech: Subject
    prevocationalStudies: Subject
}

/* Create Request DTOs declared below. */
export class SeniorGradesDto {
    public encryptionKey: string
    public gradeBody: SeniorFragment
}

export class JuniorGradesDto {
    public encryptionKey: string
    public gradeBody: JuniorFragment
}

export class PupilGradesDto {
    public encryptionKey: string
    public gradeBody: PupilFragment
}

/* Update Request DTOs declared below. */
export class UpdateSeniorDto {
    public encryptionKey: string
    public updateBody: Partial<SeniorFragment>
}

export class UpdateJuniorDto {
    public encryptionKey: string
    public updateBody: Partial<JuniorFragment>
}

export class UpdatePupilDto {
    public encryptionKey: string
    public updateBody: Partial<PupilFragment>
}

/* Fetch DTOs. */
export class FetchGradesDto {
    public reg_numb: string
    public level: string
}

/* Delete DTOs. */
export class DeleteGradeDto {
    public encryptionKey: string
    public reg_numb: string
    public level: string
}

export class CacheSenior {
    public newGrade: mongoose.Document<unknown, any, SeniorGrade> & SeniorGrade & {
        _id: mongoose.Types.ObjectId;
    }
}
export class CacheJunior {
    public newGrade: mongoose.Document<unknown, any, JuniorGrade> & SeniorGrade & {
        _id: mongoose.Types.ObjectId;
    }
}
export class CachePupil {
    public newGrade: mongoose.Document<unknown, any, PupilGrade> & SeniorGrade & {
        _id: mongoose.Types.ObjectId;
    }
}