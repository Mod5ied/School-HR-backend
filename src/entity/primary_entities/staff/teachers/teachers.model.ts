import { Note } from 'src/entity/tertiary_entities/academic_models/notes/notes.model';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Permissions } from "./teachers.interface"
import * as mongoose from 'mongoose';

export interface Teachers {
  id: string | undefined;
  school: string
  phoneNumber: string;
  firstname: string;
  lastname: string;
  notes: any;
  email: undefined | string;
  role: string;
  permissions: Permissions;
}

@Schema()
export class Teacher {
  @Prop({ required: true, lowercase: true })
  school: string

  @Prop({ required: true, lowercase: true })
  phoneNumber: string;

  @Prop({ required: true, lowercase: true })
  firstname: string;

  @Prop({ required: true, lowercase: true })
  lastname: string;

  @Prop({ required: true })
  subjects: string[]

  @Prop({ required: true, type: Object })
  permissions: Permissions;

  /* Optional props. */
  //todo: For this, we only need to populate the notes 'titles' and 'dateuploaded' to the prop.
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }] })
  notes: Note[];

  @Prop({ lowercase: true })
  email: string

  @Prop({ default: 'user' })
  role: string;

}

export const TeachersSchema = SchemaFactory.createForClass(Teacher);
