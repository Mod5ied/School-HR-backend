// import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from "@nestjs/common";
// import { TestsSchema, SubjectSchema, TeachersSchema, NotesSchema } from "src/schemas/entities/teachers.dto";
// import { TestsDto, SubjectsDto, TeachersDto, NotesDto } from "src/schemas/entities/teachers.dto";
// import { Observable } from "rxjs";

// //Todo: Use Joi to handle incoming request body validations. Zod is problematic.
// type Body = SubjectsDto | TestsDto | NotesDto

// /** helps to enforce zod validation by probing undefined values. */
// function deepCheckUndefined(_body: Body) {
//     const { body, encryptionKey } = _body

//     if (!encryptionKey) throw new UnauthorizedException('encryption key is missing!')
//     const result = Object.values(body).filter(val => val == undefined)
//     console.log(result);
// }

// /** helps to enforce zod validation by probing undefined values. */
// function checkUndefined(body: any) {
//     const { _, data } = body
//     const output = []
//     for (const vals of data) if (!vals) output.push(vals)
//     console.log("result:", output);
// }

// @Injectable()
// export class UploadInterceptor implements NestInterceptor {

//     intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
//         const request = context.switchToHttp().getRequest()
//         const method = request.method

//         if (method === "POST") {
//             // const test = TestsSchema.safeParse(request.body)
//             // const subject = SubjectSchema.safeParse(request.body)
//             const teacherObj = TeachersSchema.parse(request.body)

//             //Fixme: when parse fails, it fails to throw an error.
//             // if (subject.success || test.success || teacher.success) return next.handle()
//             throw new BadRequestException('Request body is missing critical parameters!')
//         }
//         else return next.handle()
//     }
// }