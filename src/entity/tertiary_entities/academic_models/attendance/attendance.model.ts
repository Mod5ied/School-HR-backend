import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

/* info: this model applies both for Students and Staff */
type DayType = {
    /* present day. */
    date: Date,
    rollcall: {
        timeTaken: Date,
        studentPresent: boolean
    }
}

@Schema()
export class Attendance {
    @Prop({ required: true, unique: true })
    name: string

    @Prop({ required: true })
    class: string

    @Prop({ type: Object })
    monday: DayType

    @Prop({ type: Object })
    tuesday: DayType

    @Prop({ type: Object })
    wednesday: DayType

    @Prop({ type: Object })
    thursday: DayType

    @Prop({ type: Object })
    friday: DayType
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)