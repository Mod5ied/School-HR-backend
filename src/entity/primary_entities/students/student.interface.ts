import { JuniorScore, SeniorScore } from "src/entity/tertiary_entities/academic_models/scores/scores.model";

export interface Permissions {
    read: boolean;
    write: boolean;
}

export interface IStudent {
    regNumber: string
    firstname: string;
    lastname: string;
    gender: string;
    dob: Date;
    role: string;

    /* OPTIONAL FIELDS */
    email?: string;
    examNumber?: string
    /* if student is junior, 'juniorGrades' is populated, else 'seniorGrades' is populated */
    juniorGrades?: JuniorScore;
    seniorGrades?: SeniorScore;
    permissions?: Permissions
}

type StudentUpdateInterface = {
    email: string | undefined;
    firstname: string | undefined;
    lastname: string | undefined;
    gender: string | undefined;
    scores: undefined | number[];
    role: string;
    permissions: {
        read: boolean;
        write: boolean;
        //writeOwn: boolean /* should permit user to edit select 'own' props. */
    };
};
export type StudentUpdate = Partial<StudentUpdateInterface>