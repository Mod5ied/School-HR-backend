import { Note } from 'src/entity/tertiary_entities/academic_models/notes/notes.model';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export interface Teachers {
  id: string | undefined;
  email: string | undefined;
  firstname: string | undefined;
  lastname: string | undefined;
  notes: any;
  role: string;
  permissions: {
    read: boolean;
    write: boolean;
    //writeOwn: boolean /* should permit user to edit select 'own' props. */
  };
}

@Schema()
export class Teacher {
  @Prop({ required: true, lowercase: true })
  email: string;

  @Prop({ required: true, lowercase: true })
  firstname: string;

  @Prop({ required: true, lowercase: true })
  lastname: string;

  //todo: For this, we only need to populate the notes 'titles' and 'dateuploaded' to the prop.
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }] })
  notes: Note[];

  @Prop({ default: 'user' })
  role: string;

  @Prop({ required: true })
  permissions: {
    read: boolean;
    write: boolean;
  };
}

export const TeachersSchema = SchemaFactory.createForClass(Teacher);
