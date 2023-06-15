import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

//! Notes that notes will be in clusters, to avoid overwriting by another entity.
/* each cluster has a collection for specific schools/subscribers */

@Schema()
export class Notes {
    @Prop({ required: true, lowercase: true })
    dateUploaded: string

    @Prop({ required: true, lowercase: true })
    class: string

    @Prop({ required: true, lowercase: true })
    subject: string

    @Prop({ required: true, lowercase: true })
    teacherId: string

    @Prop({ required: true, lowercase: true })
    teacherEmail: string

    @Prop()
    data: Blob
}

export const NotesSchema = SchemaFactory.createForClass(Notes)
