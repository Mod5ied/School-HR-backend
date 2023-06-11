import joi from "joi";

export const TokenSchema = joi.object({
  encryptionKey: joi.string().required(),
  verified: joi.boolean().optional(),
  ok: joi.boolean().default(true),
  token: joi.string().required(),
  role: joi.string().required(),
  permissions: joi.object({
    read: joi.boolean().required(),
    write: joi.boolean().required(),
  }),
});

