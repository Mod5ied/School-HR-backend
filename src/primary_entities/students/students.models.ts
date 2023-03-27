import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { SeniorScore, JuniorScore } from 'src/academic_models/scores/scores.model';

export interface Students {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  gender: string;
  scores: undefined | number[];
}

export type StudentUpdate = {
  email: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  gender: string | undefined;
  scores: undefined | number[];
};

export const flatStudent = (students: Students[]) => {
  return students.map((stud) => ({
    id: stud.id,
    email: stud.email,
    firstname: stud.firstname,
    lastname: stud.lastname,
    gender: stud.gender,
    scores: stud.scores,
  }));
};

@Schema()
export class Student {
  @Prop({ lowercase: true })
  email: string;

  @Prop({ required: true, lowercase: true })
  firstname: string;

  @Prop({ required: true, lowercase: true })
  lastname: string;

  @Prop({ required: true, lowercase: true })
  gender: string;

  /* if student is junior, 'juniorGrades' is populated, else 'seniorGrades' is populated */

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'JuniorScore' } })
  juniorGrades: JuniorScore

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'SeniorScore' } })
  seniorGrades: SeniorScore

  @Prop({ required: true })
  dob: Date
}

export const StudentSchema = SchemaFactory.createForClass(Student);
