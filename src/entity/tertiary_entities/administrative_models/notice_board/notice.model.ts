import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";

@Schema()
export class Notice {
    @Prop()
    message: string

    @Prop({ required: true, default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
    dateCreated: Date

    /* we don't need this as it's already clear who sends the notices (Bursars & Directors). */
    // @Prop()
    // uploadedBy: string
}

export const NoticeSchema = SchemaFactory.createForClass(Notice)