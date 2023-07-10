import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose";

@Schema()
export class Permissions extends Document {
    @Prop({ default: true })
    read: boolean

    @Prop({ default: false })
    write: boolean

    @Prop({ default: true })
    writeOwn: boolean
}

export const PermissionsSchema = SchemaFactory.createForClass(Permissions);