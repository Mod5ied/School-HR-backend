import { Teacher } from "src/primary_entities/staff/teachers/teachers.model"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { Schema as MongooseSchema } from "mongoose"


@Schema()
export class Note {
    @Prop()
    _id: MongooseSchema.Types.ObjectId

    @Prop({ required: true })
    dateUploaded: Date

    @Prop({ required: true, lowercase: true })
    noteTitle: string

    @Prop({ required: true, lowercase: true })
    class: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' })
    teacher: Teacher
}

export const NotesSchema = SchemaFactory.createForClass(Note)