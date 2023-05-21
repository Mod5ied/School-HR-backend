import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

const validateEmail = (value: string) => {
  const regex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(value);
};

@Schema()
export class AccessToken {
  @Prop({ required: true, get: () => null })
  token: string;

  /* only checks if it has "@" and is more than 30 chars. */
  // @Prop({ lowercase: true, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, maxlength: 30 })
  @Prop({
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

  /* this was inspired by OAuth auth-flows.
        'user' interface should equal - { email, role, permissions: { write: t/f, read: t/f } }.
    */
  /* then the verifier ensures that only access-tokens with read & write permissions
         set to true can make lasting edits to any records or accounts.
         */
  @Prop({ required: true, immutable: true , type: Object})
  tokenPermissions: {
    read: boolean;
    write: boolean;
  };

  @Prop({ lowercase: true })
  role: string;

  // Adds a new field `expiresAt` with a default value set to 4 hours from the creation time
  @Prop({ default: () => Date.now() + 4 * 60 * 60 * 1000, expires: 4 * 60 * 60 })
  expiresAt: Date;
}

export const AccessTokensSchema = SchemaFactory.createForClass(AccessToken);
