import joi from "joi"

/** specific to POST operations. */
export const TeachersSchema = joi.object({
    phoneNumber: joi.string().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    school: joi.string().required(),
    salary: joi.string().required(),
    email: joi.string().required(),
    subjects: joi.array().items(joi.string()).min(1).required()
}).options({ abortEarly: false })

/** specific to PATCH operations.  */
export const SubjectSchema = joi.object({
    body: joi.array().items(joi.string()).min(1).required(),
    encryptionKey: joi.string().required(),
})

/** specific to POST operations. */
export const NotesSchema = joi.object({
    body: joi.object({
        data: joi.any(),
        class: joi.string().required(),
        subject: joi.string().required(),
        teacherId: joi.string().required(),
        dateUploaded: joi.string().required(),
    }),
    encryptionKey: joi.string().required(),
})

/** specific to POST operations. */
export const TestsSchema = joi.object({
    body: joi.object({
        date: joi.date(),
        class: joi.string().required(),
        subject: joi.string().required(),
        teacherId: joi.string().required(),
    }),
    encryptionKey: joi.string().required(),
})