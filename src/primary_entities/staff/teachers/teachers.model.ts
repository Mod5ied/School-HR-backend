import { Note } from "src/tertiary_entities/academic_models/notes/notes.model"
import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose"
import * as mongoose from "mongoose"

@Schema()
export class Teacher {
    @Prop({ required: true, lowercase: true })
    email: string

    @Prop({ required: true, lowercase: true })
    firstname: string

    @Prop({ required: true, lowercase: true })
    lastname: string

    @Prop({ required: true, lowercase: true })
    password: string

    //todo: For this, we only need to populate the notes 'titles' and 'dateuploaded' to the prop.
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }] })
    notes: Note[]
}

export const TeachersSchema = SchemaFactory.createForClass(Teacher)