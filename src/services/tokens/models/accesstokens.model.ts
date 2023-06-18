import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const validateEmail = (value: string) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(value);
};

@Schema()
export class AccessToken {
  /** `phoneNumber` identifies access-token (specifically for Staff and Director Entities.)  */
  @Prop({ unique: true })
  phoneNumber: string

  /** `regNum` or `tokeEmail` identifies access-token (specifically for Students Entities.) */
  @Prop({ unique: true })
  regNum: string

  /** `tokenEmail` only checks if it has "@" and is more than 30 chars. */
  // @Prop({ lowercase: true, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, maxlength: 30 })
  @Prop({
    unique: true,
    lowercase: true,
    maxlength: 30,
    minlength: 4,
    validate: {
      validator: validateEmail,
      message:
        'Email must have an "@" symbol and must be between 4 and 30 characters.',
    },
  })
  tokenEmail: string;

  // @Prop({ required: true, get: () => null })
  // token: string;
  /** `token` is actual access-token value. */
  @Prop({ required: true })
  token: string;


  /* this was inspired by OAuth auth-flows.
     'user' interface should equal - { email, role, permissions: { write: t/f, read: t/f } }.
  */
  /* then the verifier ensures that only access-tokens with read & write permissions
     set to true can make lasting edits to any records or accounts.
  */
  
  /** `tokenPermissions` specifies the permissions  available to Entity registered to token. */
  @Prop({ required: true, immutable: true, type: Object })
  tokenPermissions: {
    read: boolean;
    write: boolean;
  };

  /** `role` specifies the registered Entity's assigned role.  */
  @Prop({ lowercase: true })
  role: string;

  /** `expiresAt` has a default value set to 10 hours from the creation time */
  @Prop({ default: () => Date.now() + 10 * 60 * 60 * 1000, expires: 10 * 60 * 60 })
  expiresAt: Date;
}

export const AccessTokensSchema = SchemaFactory.createForClass(AccessToken);
