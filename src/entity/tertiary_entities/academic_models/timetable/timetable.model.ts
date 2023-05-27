import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Tests } from "../tests/tests.model"
import mongoose from "mongoose"

interface ISubject {
    test: Tests | false
    subjects: string[]
}

type ExcludeSubjects<T> = T & Exclude<T, { subjects: string[] }>
type ExcludeTests<T> = T & Exclude<T, { tests: Tests | false }>

const propOptions = { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Tests' }

@Schema()
export class TimeTable {
    @Prop(propOptions)
    monday: [ExcludeSubjects<ISubject>]

    @Prop(propOptions)
    tuesday: [ExcludeSubjects<ISubject>]

    @Prop(propOptions)
    wednesday: [ExcludeSubjects<ISubject>]

    @Prop(propOptions)
    thursday: [ExcludeSubjects<ISubject>]

    @Prop(propOptions)
    friday: [ExcludeSubjects<ISubject>]

    @Prop()
    saturday: [ExcludeSubjects<ISubject>]
}

@Schema()
export class ExamTimetable {
    @Prop(propOptions)
    monday: [ExcludeTests<ISubject>]

    @Prop(propOptions)
    tuesday: [ExcludeTests<ISubject>]

    @Prop(propOptions)
    wednesday: [ExcludeTests<ISubject>]

    @Prop(propOptions)
    thursday: [ExcludeTests<ISubject>]

    @Prop(propOptions)
    friday: [ExcludeTests<ISubject>]

    @Prop()
    saturday: [ExcludeTests<ISubject>]
}

export const TimetableSchema = SchemaFactory.createForClass(TimeTable)
export const ExamTimetableSchema = SchemaFactory.createForClass(ExamTimetable)