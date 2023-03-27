import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, {Schema as MongooseSchema} from "mongoose"
import { Students } from "src/students/students.models"

@Schema()
export class TuitionFee {
    @Prop()
    _id: MongooseSchema.Types.ObjectId

    @Prop()
    amountPaid: number

    @Prop({ required: true })
    datePaid: Date

    /* here, the entire student hydrated object is gummed into this doc hence making it kinda heavy. */
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Students' })
    student: Students
}

export const TuitionSchema = SchemaFactory.createForClass(TuitionFee)