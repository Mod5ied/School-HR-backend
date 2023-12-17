import joi from "joi"

export const TeachersSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    school: joi.string().required(),
    salary: joi.string().required(),
    role: joi.string().lowercase().required(),
    email: joi.string().lowercase().required(),
    subjects: joi.array().items(joi.string()).min(1).required()
}).required()

export const BursarsSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().required(),
    firstName: joi.string().required(),
    lastName: joi.string().required(),
    school: joi.string().required(),
    salary: joi.string().required(),
    gender: joi.string().required(),
    dateOfBirth: joi.date().required(),
    maritalStatus: joi.string().required(),
    role: joi.string().lowercase().required(),
}).required()

export const FetchSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    role: joi.string().lowercase().required(),
    email: joi.string().lowercase(),
    range: joi.object({
        end: joi.number().optional(),
        start: joi.number(),
    }).optional()
}).required()

export const LoginSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    school: joi.string().required(),
    role: joi.string().required()
})

export const LogoutSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    school: joi.string().lowercase().optional(),
    email: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required(),
    encryptionKey: joi.string().required()
}).required()

export const TokenVerifySchema = joi.object({
    role: joi.string().required(),
    token: joi.string().required().min(200),
    email: joi.string().required().lowercase().email(),
    phoneNumber: joi.string().required().min(11).max(12)
}).required()

export const OtpVerifySchema = joi.object({
    otp: joi.number().required(),
    role: joi.string().required(),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
}).required()

export const DeleteStaffSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required()
}).required()

export const UpdateStaffSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    role: joi.string().required(),
    updateBody: joi.object({
        phoneNumber: joi.string().optional().min(11).max(12),
        firstName: joi.string().optional().lowercase(),
        lastName: joi.string().optional().lowercase(),
        school: joi.string().optional().lowercase(),
        salary: joi.string().optional().lowercase(),
        maritalStatus: joi.string().optional().lowercase(),
        subjects: joi.array().items(joi.string()).min(1).optional()
    })
}).required()

export const SubjectUpdateSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    role: joi.string().lowercase(),
    updateBody: joi.object({
        subject: joi.array().items(joi.string()).min(1).required()
    }).required()
})

export const PermissionsSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    role: joi.string().required(),
    updateBody: joi.object({
        read: joi.boolean(),
        write: joi.boolean(),
        writeOwn: joi.boolean()
    }).required()
})