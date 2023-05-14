import { Student } from "src/entity/primary_entities/students/students.models"
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose"
import mongoose, { Schema as MongooseSchema } from "mongoose"

@Schema()
export class CumulativeFee {
    @Prop()
    _id: MongooseSchema.Types.ObjectId

    @Prop({ default: "Lesson Fee", required: true })
    paymentDesription: string

    @Prop()
    amountPaid: number

    @Prop({ required: true })
    datePaid: Date

    /* here, the entire student hydrated object is gummed into this doc hence making it kinda heavy. */
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Students' })
    student: Student
}

export const CumulativeFeesSchema = SchemaFactory.createForClass(CumulativeFee)