import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose"
import gen from "otp-generator"

@Schema()
export class Admin {
    /* implement a getter to return blurred email when called. */
    @Prop({ required: true, lowercase: true, unique: true })
    email: string

    @Prop({ required: true, lowercase: true })
    firstName: string

    @Prop({ required: true, lowercase: true })
    lastName: string

    @Prop({ required: true, length: 12, max: 12, unique: true })
    phoneNumber: string

    @Prop({ default: "director", immutable: true })
    role: string

    //todo: the values are generated on creation of the account by otp.
    // the values are changed every single time admin logs-in for tight-security reasons.
    @Prop({ default: parseInt( gen.generate(6, { lowerCaseAlphabets: false, digits: true })), unique: true })
    adminKey: number

    @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
    dateCreated: Date

    @Prop({ default: Date.now, get: (date: Date) => date.toISOString().split('T')[0] })
    lastUpdated: Date
}

export const AdminSchema = SchemaFactory.createForClass(Admin)