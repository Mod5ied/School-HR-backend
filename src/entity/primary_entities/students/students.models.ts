import { SeniorGrade, JuniorGrade } from 'src/entity/tertiary_entities/academic_models/grades/grades.model';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Permissions } from './student.interface';

@Schema()
export class Student {
  @Prop({ required: true })
  regNumber: string

  @Prop({ required: true, lowercase: true })
  firstname: string;

  @Prop({ required: true, lowercase: true })
  lastname: string;

  @Prop({ required: true, lowercase: true })
  gender: string;

  @Prop({ required: true })
  dob: Date;

  @Prop({ default: 'student' })
  role: string;

  @Prop({ required: true, type: Object })
  permissions: Permissions

  /* OPTIONAL FIELDS */
  @Prop({ lowercase: true })
  email: string;

  @Prop({})
  examNumber: string

  /* if student is junior, 'juniorGrades' is populated, else 'seniorGrades' is populated */
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'JuniorScore' } })
  juniorGrades: JuniorGrade;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'SeniorScore' } })
  seniorGrades: SeniorGrade;
}

export const StudentSchema = SchemaFactory.createForClass(Student);