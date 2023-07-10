import joi from "joi";

const Subject = joi.object({
    continuousAssessment: {
        test: joi.number(),
        assignment: joi.number(),
    },
    exams: joi.number()
})

//Todo: Split the Senior class schema into "Sciences" & "Arts".

/** validates request payload */
export const CreateSeniorGradeSchema = joi.object({
    encryptionKey: joi.string().required(),
    gradeBody: joi.object({
        regNum: joi.string(),
        email: joi.string().optional(),
        englishLanguage: Subject,
        mathematics: Subject,
        biology: Subject,
        physics: Subject,
        computerStudies: Subject,
        economics: Subject,
        agriculturalScience: Subject,
        chemistry: Subject,
        civicEducation: Subject,
        geography: Subject,
        furtherMaths: Subject,
        dataProcessing: Subject,
        crk: Subject,
        frenchLanguage: Subject,
        technicalDrawing: Subject,
        literature: Subject,
        government: Subject,
        financialAccounts: Subject,
        commerce: Subject,
        igboLanguage: Subject,
        marketing: Subject,
        homeManagement: Subject
    })
})

export const CreateJuniorGradeSchema = joi.object({
    encryptionKey: joi.string(),
    gradeBody: joi.object({
        email: joi.string().optional(),
        regNum: joi.string(),
        englishStudies: Subject,
        mathematics: Subject,
        furtherMaths: Subject,
        basicScience: Subject,
        basicTechnology: Subject,
        businessStudies: Subject,
        phe: Subject,
        crk: Subject,
        civicEducation: Subject,
        agriculturalScience: Subject,
        literature: Subject,
        socialStudies: Subject,
        igboLanguage: Subject
    })
})

/* Pupils basically needs no email, just regNumber. */
export const CreatePupilGradeSchema = joi.object({
    encryptionKey: joi.string(),
    gradeBody: joi.object({
        email: joi.string().optional(),
        regNum: joi.string(),
        englishLanguage: Subject,
        mathematics: Subject,
        igboLanguage: Subject,
        culturalAndCreativeArts: Subject,
        religionAndNationalValues: Subject,
        basicScienceAndTech: Subject,
        prevocationalStudies: Subject
    })
})

/* Update Grades Schema */
/** validates request payload */
export const UpdateSeniorGradeSchema = joi.object({
    encryptionKey: joi.string().required(),
    gradeBody: joi.object({
        regNum: joi.string(),
        email: joi.string().optional(),
        englishLanguage: Subject.optional(),
        mathematics: Subject.optional(),
        biology: Subject.optional(),
        physics: Subject.optional(),
        computerStudies: Subject.optional(),
        economics: Subject.optional(),
        agriculturalScience: Subject.optional(),
        chemistry: Subject.optional(),
        civicEducation: Subject.optional(),
        geography: Subject.optional(),
        furtherMaths: Subject.optional(),
        dataProcessing: Subject.optional(),
        crk: Subject.optional(),
        frenchLanguage: Subject.optional(),
        technicalDrawing: Subject.optional(),
        literature: Subject.optional(),
        government: Subject.optional(),
        financialAccounts: Subject.optional(),
        commerce: Subject.optional(),
        igboLanguage: Subject.optional(),
        marketing: Subject.optional(),
        homeManagement: Subject.optional()
    })
})

export const UpdateJuniorGradeSchema = joi.object({
    encryptionKey: joi.string(),
    gradeBody: joi.object({
        email: joi.string().optional(),
        regNum: joi.string(),
        englishStudies: Subject.optional(),
        mathematics: Subject.optional(),
        furtherMaths: Subject.optional(),
        basicScience: Subject.optional(),
        basicTechnology: Subject.optional(),
        businessStudies: Subject.optional(),
        phe: Subject.optional(),
        crk: Subject.optional(),
        civicEducation: Subject.optional(),
        agriculturalScience: Subject.optional(),
        literature: Subject.optional(),
        socialStudies: Subject.optional(),
        igboLanguage: Subject.optional()
    })
})

/* Pupils basically needs no email, just regNumber. */
export const UpdatePupilGradeSchema = joi.object({
    encryptionKey: joi.string(),
    gradeBody: joi.object({
        email: joi.string().optional(),
        regNum: joi.string(),
        englishLanguage: Subject.optional(),
        mathematics: Subject.optional(),
        igboLanguage: Subject.optional(),
        culturalAndCreativeArts: Subject.optional(),
        religionAndNationalValues: Subject.optional(),
        basicScienceAndTech: Subject.optional(),
        prevocationalStudies: Subject.optional()
    })
})



/* Fetch Grades Schema. */
export const FetchGradeSchema = joi.object({
    reg_numb: joi.string().required(),
    level: joi.string().required()
})


