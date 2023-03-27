import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema()
export class Bursary {
    @Prop()
    email: string

    @Prop({ required: true, lowercase: true })
    firstname: string

    @Prop({ required: true, lowercase: true })
    lastname: string
}

export const BursarySchema = SchemaFactory.createForClass(Bursary)