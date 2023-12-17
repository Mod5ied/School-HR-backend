import joi from "joi";

export const DirectorSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    firstName: joi.string().required().lowercase(),
    lastName: joi.string().required().lowercase(),
    school: joi.string().required().lowercase(),
    email: joi.string().lowercase().required(),
    gender: joi.string().lowercase().required(),
    address: joi.string().lowercase().required(),
    role: joi.string().lowercase().optional()
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
}).required()

export const LogoutSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required(),
    encryptionKey: joi.string().required()
}).required()

export const TokenVerifySchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().required().lowercase().email(),
    token: joi.string().required().min(200),
    role: joi.string().required()
}).required()

export const OtpVerifySchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().lowercase().optional(),
    otp: joi.number().required(),
    role: joi.string().required()
}).required()

export const DeleteDirectorSchema = joi.object({
    phoneNumber: joi.string().required().min(11).max(12),
    encryptionKey: joi.string().required().min(200),
    email: joi.string().lowercase().optional(),
    role: joi.string().lowercase().required()
}).required()

export const UpdateDirectorSchema = joi.object({
    encryptionKey: joi.string().required().min(200),
    phoneNumber: joi.string().required().min(11).max(12),
    email: joi.string().optional(),
    role: joi.string().required(),
    updateBody: joi.object({
        phoneNumber: joi.string().required().min(11).max(12),
        firstName: joi.string().lowercase().optional(),
        lastName: joi.string().lowercase().optional(),
        school: joi.string().lowercase().optional(),
        gender: joi.string().lowercase().optional(),
        address: joi.string().lowercase().optional(),
        staffTotal: joi.string().lowercase().optional()
    })
}).required()