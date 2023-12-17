import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Permissions } from '../teachers/teachers.interface';

export interface Bursars {
  id: string | undefined;
  dateCreated: Date;
  lastUpdated: Date;
  school: string
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: undefined | string;
  role: string;
  permissions: Permissions;
  dateOfBirth: Date;
  maritalStatus: string;
}

@Schema({ strict: true })
export class Bursary {
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

  @Prop({ required: true, lowercase: true })
  gender: string

  @Prop({ type: Object, default: { read: true, write: false, writeOwn: false } })
  permissions: { read: boolean, write: boolean, writeOwn: boolean }

  @Prop({ required: true, default: 'staff', immutable: true })
  role: string;

  @Prop({ required: true })
  dateOfBirth: Date

  @Prop({ required: true })
  maritalStatus: string
}

export const BursarySchema = SchemaFactory.createForClass(Bursary);