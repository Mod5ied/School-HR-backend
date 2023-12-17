import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose"

@Schema()
export class Director {
    /* personal details */
    @Prop({ required: true, lowercase: true })
    firstName: string

    @Prop({ required: true, lowercase: true })
    lastName: string

    /* implement a getter to return blurred email when called. */
    @Prop({ required: true, unique: true, lowercase: true })
    email: string

    @Prop({ required: true, unique: true })
    phoneNumber: string

    @Prop({ required: false, lowercase: true })
    gender: string

    @Prop({ default: "director", immutable: true })
    role: string

    /* school specific details */
    @Prop({ required: true, lowercase: true })
    school: string

    @Prop({ required: true, lowercase: true })
    address: string

    @Prop({ type: Object, default: { read: true, write: false, writeOwn: true } })
    permissions: { read: boolean, write: boolean, writeOwn: boolean }

    /* other details */
    @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
    dateCreated: Date   /* this is date specific. More emphasis is on the date. */

    @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
    lastUpdated: Date    /* this is time specific. More emphasis is on the time. */
}

export const DirectorSchema = SchemaFactory.createForClass(Director)