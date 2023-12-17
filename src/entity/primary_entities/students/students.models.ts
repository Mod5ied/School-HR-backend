import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Permissions } from './student.interface';

@Schema({ strict: true })
export class Student {
  @Prop({ required: true, unique: true })
  regNumber: string

  @Prop({ required: true, lowercase: true })
  firstName: string;

  @Prop({ required: true, lowercase: true })
  lastName: string;

  @Prop({ required: true, lowercase: true })
  gender: string;

  @Prop({ required: true })
  dateOfBirth: Date;

  @Prop({ default: 'student' })
  role: string;

  @Prop({ type: Object, default: { read: true, write: false, writeOwn: false } })
  permissions: Permissions

  @Prop({ required: false, lowercase: true })
  email: string;

  @Prop({ required: false })
  examNumber: string

  //todo: remove the js-generated timestamp and add the "timestamps: true" option to schema
  @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
  dateCreated: Date   /* this is date specific. More emphasis is on the date. */

  @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
  lastUpdated: Date    /* this is time specific. More emphasis is on the time. */
}

export const StudentSchema = SchemaFactory.createForClass(Student);