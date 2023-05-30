import { NotFoundException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable} from "rxjs";

/* Check if each cache requests already exists and return else, proceed to the middlewares/services. */
// have an 'cache-return' interceptor for at most each get request.
@Injectable()
export class NumberInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const request = context.switchToHttp().getRequest()
        const method = request.method
        const url = request.url

        // Regular expression to match the desired route pattern
        const routePattern = /^\/api\/v1\/teachers\/account\/\d+\/\w+$/;

        if (method == 'GET' && routePattern.test(url)) {
            const phoneNumber = request.params.number.toString()

            if ((phoneNumber.toString()).length < 11) {
                throw new NotFoundException(`Teacher's phone number must be more than 10 numeric digits!`)
            }
            return next.handle()
        }
        return next.handle();
    }
    /* next: intercept the response and cache the response if its cacheable. */
}