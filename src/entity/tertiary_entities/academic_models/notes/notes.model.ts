import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose"
import { Teacher } from "src/entity/primary_entities/staff/teachers/teachers.model"

//! Notes that notes will be in clusters, to avoid overwriting by another entity.
/* each cluster has a collection for specific schools/subscribers */

@Schema()
export class Notes {
    @Prop({ required: true })
    dateUploaded: string

    @Prop({ required: true, lowercase: true })
    class: string

    @Prop({ required: true, lowercase: true })
    subject: string

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }] })
    teacher: Teacher

    @Prop()
    data: [Blob]
}

export const NotesSchema = SchemaFactory.createForClass(Notes)
