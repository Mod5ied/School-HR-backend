import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Permissions } from "./teachers.interface"

export interface Teachers {
  id: string | undefined;
  dateCreated: Date;
  lastUpdated: Date;
  role: string;
  school: string;
  subjects: string[];
  salary: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: undefined | string;
  permissions: Permissions;
}

@Schema({ strict: true })
export class Teacher {
  @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
  dateCreated: Date

  @Prop({ default: null, get: (date: Date) => date.toISOString().split('T')[0] })
  lastUpdated: Date

  @Prop({ required: true, lowercase: true, unique: true })
  phoneNumber: string;

  @Prop({ lowercase: true, required: true, unique: true })
  email: string

  @Prop({ required: true, lowercase: true })
  firstName: string;

  @Prop({ required: true, lowercase: true })
  lastName: string;

  @Prop({ required: true, lowercase: true })
  school: string

  @Prop({ required: true, lowercase: true })
  salary: string

  @Prop({ required: true })
  subjects: string[]

  @Prop({ type: Object, default: { read: true, write: false, writeOwn: false } })
  permissions: { read: boolean, write: boolean, writeOwn: boolean }

  @Prop({ required: true, default: 'staff', immutable: true })
  role: string;
}

export const TeachersSchema = SchemaFactory.createForClass(Teacher);