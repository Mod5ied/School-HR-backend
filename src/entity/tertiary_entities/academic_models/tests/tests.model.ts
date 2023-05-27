import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema()
export class Tests {
    @Prop({ required: true })
    class: string

    @Prop({ required: true })
    subject: string

    @Prop({ required: true })
    subjectTeacher: string

    //todo: config the doc to self delete after the set date.
    @Prop({ required: true })
    date: Date
}

export const TestSchema = SchemaFactory.createForClass(Tests)