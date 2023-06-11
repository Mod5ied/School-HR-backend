import { Teacher } from "src/entity/primary_entities/staff/teachers/teachers.model"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose"

@Schema()
export class Tests {
    @Prop({ required: true })
    class: string

    @Prop({ required: true })
    subject: string

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' })
    teacher: Teacher
    /* this would be the phone-number, first & lastname. */

    //todo: config the doc to self delete after the set date.
    @Prop({ required: true })
    date: Date
}

export const TestSchema = SchemaFactory.createForClass(Tests)