import { SeniorScore, JuniorScore } from 'src/entity/tertiary_entities/academic_models/scores/scores.model';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export interface Students {
  id?: string;
  email: string;
  firstname: string;
  lastname: string;
  gender: string;
  scores: undefined | number[];
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
    //writeOwn: boolean /* should permit user to edit select 'own' props. */
  };
}

export type StudentUpdate = {
  email: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  gender: string | undefined;
  scores: undefined | number[];
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
  };
};

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

  @Prop({ default: 'user' })
  role: string;

  @Prop({ required: true })
  permissions: {
    read: boolean;
    write: boolean;
  };

  /* OPTIONAL FIELDS */
  @Prop({ lowercase: true })
  email: string;

  @Prop({})
  examNumber: string

  /* if student is junior, 'juniorGrades' is populated, else 'seniorGrades' is populated */
  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'JuniorScore' } })
  juniorGrades: JuniorScore;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'SeniorScore' } })
  seniorGrades: SeniorScore;
}

export const StudentSchema = SchemaFactory.createForClass(Student);