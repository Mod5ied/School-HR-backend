import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Schema as MongooseSchema } from "mongoose"


@Schema()
export class Note {
    @Prop()
    _id: MongooseSchema.Types.ObjectId

    @Prop({ required: true })
    dateUploaded: Date

    @Prop({ required: true, lowercase: true })
    class: string
    
    @Prop({ required: true, lowercase: true })
    subject: string

    @Prop()
    data: [Blob]
}

export const NotesSchema = SchemaFactory.createForClass(Note)