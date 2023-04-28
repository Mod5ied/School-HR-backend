import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export interface Bursars {
  id: string | undefined;
  email: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
    //writeOwn: boolean /* should permit user to edit select 'own' props. */
  };
}

@Schema()
export class Bursary {
  @Prop()
  email: string;

  @Prop({ required: true, lowercase: true })
  firstname: string;

  @Prop({ required: true, lowercase: true })
  lastname: string;

  //! Check again if "Bursars" can be auth'ed' as admin.
  @Prop({ default: 'admin' })
  role: string;

  @Prop({ required: true })
  permissions: {
    read: boolean;
    write: boolean;
  };
}

export const BursarySchema = SchemaFactory.createForClass(Bursary);
