import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';

@Schema()
export class RefreshToken {
  @Prop({ required: true, get: () => null })
  token: string;

  @Prop({
    required: true,
    lowercase: true,
    maxlength: 30,
    minlength: 4,
    validate: {
      validator: (value: string | string[]) => {
        return value.includes('@') && value.length < 30 && value.length > 4;
      },
      message:
        'Email must have an "@" symbol and must be between 4 and 30 characters.',
    },
  })
  tokenEmail: string;

  @Prop({ required: true, type: Object })
  tokenPermissions: {
    read: boolean;
    write: boolean;
  };

  @Prop({ required: true, lowercase: true })
  role: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
