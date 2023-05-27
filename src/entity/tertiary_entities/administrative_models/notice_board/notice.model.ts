import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";

@Schema()
export class Notice {
    @Prop()
    message: string
    
    @Prop()
    dateUploaded: Date

    @Prop()
    uploadedBy: string
    /* provide a dropdown to select from (director, principal, or VP) */
}

export const NoticeSchema = SchemaFactory.createForClass(Notice)