import joi from "joi";

export const TokenSchema = joi.object({
  //todo: in v.1.1 the 'verified' option would determine 'permissions'
  /* if 'verified' is true then the permissions are auto-filled to be truthy. */
  encryptionKey: joi.string().required(),
  verified: joi.boolean().optional(),
  email: joi.string().email().optional(),
  ok: joi.boolean().default(true),
  token: joi.string().required(),
  role: joi.string().required(),
  phoneNumber: joi.string().required(),
  permissions: joi.object({
    read: joi.boolean().default(true),
    write: joi.boolean().required(),
    writeOwn: joi.boolean().required(),
  }),
});

