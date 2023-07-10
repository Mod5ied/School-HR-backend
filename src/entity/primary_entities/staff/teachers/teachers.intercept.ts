import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotImplementedException } from "@nestjs/common";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class TeachersInterceptor implements NestInterceptor {
    constructor(private readonly cacheService: CacheService) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any> | any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const route = request.url;

        switch (method) {
            case 'POST':
                const body = request.body
                //todo: store permitted routes in separate files.
                const tokenRoute = '/api/v1/teachers/account/login/token';
                const tokenVerifyRoute = '/api/v1/teachers/verify/token';
                const otpRoute = '/api/v1/teachers/account/login/otp';
                const otpVerifyRoute = '/api/v1/teachers/verify/otp';
                const createRoute = '/api/v1/teachers/account/new';
                switch (route) {
                    /* if 'User has an active session' fetch the token from cache and return it. THIS IS FOR TEST ONLY! */
                    /* in PROD, we throw the error to prevent multiple login instances. A user can only login with either token or otp, not both. */
                    //! Note that for both the otp and token login, a req is made to an external lib that handles sending these responses.
                    //! hence, the response must be cached and referenced before permitting any more otp/token fetch calls.
                    //! preferably, disable the fetch btn/function for a given no of time(5-mins) before permitting another call.
                    case otpRoute:
                        const token = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                        if (token) return { token: token, message: `user has an active session` };

                        const otp = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                        if (otp) return { number: body.phoneNumber, otp };
                        return next.handle();

                    case tokenRoute:
                        const otp2 = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                        if (otp2) return { otp: otp2, message: `user has an active session` };

                        const token2 = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                        if (token2) return { number: body.phoneNumber, token: token2 };
                        return next.handle();

                    case createRoute:
                        const existingTeacher = await this.cacheService.getCached(`${body.phoneNumber}-newTeacher`);
                        if (existingTeacher) return new BadRequestException("Account already exists!");
                        return next.handle();

                    case otpVerifyRoute:
                    case tokenVerifyRoute:
                        const login = await this.cacheService.getCached(`${body.phoneNumber}-loginResponse`);
                        if (login) return login;
                        return next.handle();

                    default: throw new NotImplementedException('Invalid request, nice try!')
                }
            case 'DELETE':
                const delBody = request.body
                const logoutRoute = "/api/v1/teachers/account/logout";
                const purgeRoute = "/api/v1/teachers/account/purge";
                switch (route) {
                    case logoutRoute:
                        await Promise.all([
                            this.cacheService.delCached(`${delBody.phoneNumber}-accessToken`),
                            this.cacheService.delCached(`${delBody.phoneNumber}-encryptedKey`),
                            this.cacheService.delCached(`${delBody.phoneNumber}-loginResponse`)
                        ])
                        return next.handle();

                    case purgeRoute:
                        await Promise.all([
                            this.cacheService.delCached(`${delBody.phoneNumber}-accessToken`),
                            this.cacheService.delCached(`${delBody.phoneNumber}-encryptedKey`),
                            this.cacheService.delCached(`${delBody.phoneNumber}-loginResponse`)
                        ])
                        return next.handle();

                    default: throw new NotImplementedException('Invalid request, nice try!')
                }
            default: throw new NotImplementedException('Invalid request, nice try!')
        }
    }
}