import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ObjectSchema } from "joi";


@Injectable()
export class JoiPipe implements PipeTransform {
    constructor(private schema: ObjectSchema) { }

    transform(val: any) {
        const { error, value } = this.schema.validate(val, { abortEarly: false, })

        if (error) throw new BadRequestException(error.message)
        return value
    }
}