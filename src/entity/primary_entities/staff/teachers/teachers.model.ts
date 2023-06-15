import { Notes } from 'src/entity/tertiary_entities/academic_models/notes/notes.model';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Permissions } from "./teachers.interface"
import * as mongoose from 'mongoose';

export interface Teachers {
  id: string | undefined;
  school: string
  phoneNumber: string;
  firstName: string;
  lastName: string;
  notes: any;
  email: undefined | string;
  role: string;
  permissions: Permissions;
}

@Schema()
export class Teacher {
  @Prop({ required: true, lowercase: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, lowercase: true })
  school: string

  @Prop({ required: true, lowercase: true })
  firstName: string;

  @Prop({ required: true, lowercase: true })
  lastName: string;

  @Prop({ required: true, lowercase: true })
  salary: string

  @Prop({ required: true })
  subjects: string[]

  @Prop({ lowercase: true })
  email: string
  
  @Prop({ type: Object, default: { read: true, write: false } })
  permissions: { read: boolean, write: boolean }

  //todo: For this, we only need to populate the notes 'titles' and 'dateuploaded' to the prop.
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }] })
  notes: Notes[];


  @Prop({ default: 'teacher' })
  role: string;
}

export const TeachersSchema = SchemaFactory.createForClass(Teacher);
