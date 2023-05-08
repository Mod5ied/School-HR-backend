import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose"

//! Note that all primary entities do not have to be embedded with the tertiary entitiy docs.
//? Why, they can be fetched and served on the UI once the entity needs sucuh data.

@Schema()
export class Director {
    @Prop({ required: true, lowercase: true })
    firstName: string

    @Prop({ required: true, lowercase: true })
    lastName: string

    @Prop({ required: true, lowercase: true })
    emailAddress: string

    /* implement a getter to return blurred email when called. */
}

export const DirectorSchema = SchemaFactory.createForClass(Director)