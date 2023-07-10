import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Permissions } from "./teachers.interface"

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
  @Prop({ required: true, default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
  dateCreated: Date

  @Prop({ required: true, lowercase: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, lowercase: true, unique: false })
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

  @Prop({ type: Object, default: { read: true, write: false, writeOwn: false } })
  permissions: { read: boolean, write: boolean, writeOwn: boolean }

  @Prop({ default: 'staff' })
  role: string;
}

export const TeachersSchema = SchemaFactory.createForClass(Teacher);