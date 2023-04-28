import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

/* info: this model applies both for Students and Staff */
type DayType = {
    date: Date,
    rollcall: {
        timeTaken: Date,
        studentPresent: boolean
    }
}

@Schema()
export class Attendance {
    @Prop()
    monday: DayType

    @Prop()
    tuesday: DayType

    @Prop()
    wednesday: DayType

    @Prop()
    thursday: DayType

    @Prop()
    friday: DayType
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)