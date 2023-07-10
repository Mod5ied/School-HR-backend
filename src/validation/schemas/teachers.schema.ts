import joi from "joi"

export const FetchSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase(),
    role: joi.string().lowercase().required(),
    range: joi.object({
        start: joi.number(),
        end: joi.number().optional
    })
})

export const LogoutSchema = joi.object({
    encryptionKey: joi.string().required(),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    school: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required()
})

export const LoginSchema = joi.object({
    email: joi.string().lowercase().optional(),
    phoneNumber: joi.string().required().min(11).max(12),
    school: joi.string().required()
})

export const TokenVerifySchema = joi.object({
    token: joi.string().required().min(200),
    email: joi.string().required().lowercase().email(),
    phoneNumber: joi.string().required().min(11).max(12)
})

export const OtpVerifySchema = joi.object({
    otp: joi.number().required(),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional()
})

/** specific to POST operations. */
export const TeachersSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    school: joi.string().required(),
    salary: joi.string().required(),
    email: joi.string().lowercase().required(),
    subjects: joi.array().items(joi.string()).min(1).required()
}).options({ abortEarly: false })

export const DeleteTeachersSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required()
})

export const UpdateTeacherSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    firstName: joi.string().optional(),
    lastName: joi.string().optional(),
    school: joi.string().optional(),
    salary: joi.string().optional(),
    email: joi.string().optional(),
    role: joi.string().lowercase(),
    subjects: joi.array().items(joi.string()).min(1).optional()
})

export const SubjectUpdateSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    subject: joi.array().items(joi.string()).min(1).required(),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    role: joi.string().lowercase(),
})

export const PermissionsSchema = joi.object({
    encryption: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    status: joi.object({
        read: joi.boolean().default(true),
        write: joi.boolean(),
        writeOwn: joi.boolean()
    }).required()
})