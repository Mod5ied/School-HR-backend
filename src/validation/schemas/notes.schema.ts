import joi from "joi"

/** validates request payload.  */
export const CreateNotesSchema = joi.object({
    noteBody: joi.object({
        data: joi.any(),
        class: joi.string().required(),
        subject: joi.string().required(),
        teacherId: joi.string().required(),
        dateUploaded: joi.string().required(),
    }),
    encryptionKey: joi.string().required(),
})

/** validates response payload. */
export const SaveNotesSchema = joi.object({
    dateUploaded: joi.string().required(),
    class: joi.string().required(),
    subject: joi.string().required(),
    teacherId: joi.string().required(),
    data: joi.object({
        data: joi.binary().required(),
        contentType: joi.string().required()
    })
})