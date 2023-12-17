import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotImplementedException, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class DirectorsInterceptor implements NestInterceptor {
    constructor(private readonly cacheService: CacheService) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any> | any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const route = request.url;
        switch (method) {
            case 'POST':
                const body = request.body
                const otpRoute = '/api/v1/directors/account/login/otp';
                const tokenRoute = '/api/v1/directors/account/login/token';
                const otpVerifyRoute = '/api/v1/directors/verify/otp';
                const tokenVerifyRoute = '/api/v1/directors/verify/token';
                const createRoute = '/api/v1/directors/account/new';
                if (["director"].includes(body?.role)) {
                    switch (route) {
                        /* if 'User has an active session' fetch the token from cache and return it. THIS IS FOR TEST ONLY! */
                        /* in PROD, we throw an error to prevent multiple login instances. A user can only login with either token or otp, not both. */
                        //! Note that for both the otp and token login, a req is made to an external lib that handles sending these responses.
                        //! hence, the response must be cached and referenced before permitting any more otp/token fetch calls.
                        //? preferably, disable the fetch btn/function for a given no of time(ttl-mins) before permitting another call.
                        case otpRoute:
                            const token = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token) return { token: token, message: `user has an active session` };

                            const otp = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp) return { number: body.phoneNumber, otp, message: `user session in progress` };
                            return next.handle();

                        case tokenRoute:
                            const otp2 = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp2) return { otp: otp2, message: `user session in progress` };

                            const token2 = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token2) return { number: body.phoneNumber, token: token2, message: `user has an active session` };
                            return next.handle();

                        case createRoute:
                            const existingDirector = await this.cacheService.getCached(`${body.phoneNumber}-newDirector`);
                            if (existingDirector) return new BadRequestException("Account already exists!");
                            return next.handle();

                        case otpVerifyRoute:
                        case tokenVerifyRoute:
                            const login = await this.cacheService.getCached(`${body.phoneNumber}-loginResponse`);
                            if (login) return { login, message: `session in progress (v1.1- duration:xx)` };
                            return next.handle();

                        default: throw new NotImplementedException('Invalid request, nice try!')
                    }
                }
                throw new UnauthorizedException("Unauthorized user: access denied!");

            case 'DELETE':
                const delBody = request.body
                const logoutRoute = "/api/v1/directors/account/logout";
                const purgeRoute = "/api/v1/directors/account/purge";
                if (["director"].includes(body?.role)) {
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
                }
                throw new UnauthorizedException("Unauthorized user: access denied!");

            case 'GET':
                const getBody = request.body;
                const getAllDirectors = "/api/v1/directors/account/all";
                const getDirector = "/api/v1/directors/account";
                switch (route) {
                    case getAllDirectors:
                        if (["admin"].includes(getBody?.role)) {
                            /*  paginate here, 10 docs per request. No caching. */
                            return next.handle();
                        } throw new UnauthorizedException("Unauthorized user: admin access required!");

                    case getDirector:
                        if (["director", "admin"].includes(getBody?.role)) {
                            const cachedStaff = await this.cacheService.getCached(`${getBody.phoneNumber}-info`);
                            if (cachedStaff) return { data: cachedStaff };
                            return next.handle();
                        } throw new UnauthorizedException("Unauthorized user: access denied!");

                    default: throw new NotImplementedException('Invalid request, nice try!');
                }

            case 'PATCH':
                const directorAccount = "/api/v1/directors/account/update";
                if (["director"].includes(body?.role)) {
                    switch (route) {
                        case directorAccount:
                            return next.handle();

                        default: throw new NotImplementedException('Invalid request, nice try!')
                    }
                } throw new UnauthorizedException("Unauthorized user: access denied!");

            default: throw new NotImplementedException('Invalid request, nice try!')
        }
    }
}