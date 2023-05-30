import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class GradeInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const request = context.switchToHttp().getRequest()
        const method = request.method
        const regNumberPattern = /^ss[1-3]-(?:0\d|[1-9]\d{0,2})$/;
        const regNumber = request.params.reg_numb

        if (method == "GET" && !regNumberPattern.test(regNumber)) {
            console.log(regNumberPattern.test(regNumber));
            
            throw new NotFoundException('Invalid reg-number format')
        }
        return next.handle()
    }
}