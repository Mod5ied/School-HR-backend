import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotImplementedException, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class StaffInterceptor implements NestInterceptor {
    constructor(private readonly cacheService: CacheService) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any> | any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const route = request.url;

        switch (method) {
            case 'POST':
                const body = request.body
                //todo: store permitted routes in separate files.
                const teachersTokenRoute = '/api/v1/teachers/account/login/token';
                const teachersVerifyRoute = '/api/v1/teachers/verify/token';
                const teachersOtpRoute = '/api/v1/teachers/account/login/otp';
                const teachersOtpVerifyRoute = '/api/v1/teachers/verify/otp';
                const teachersCreateRoute = '/api/v1/bursars/account/new';
                /* bursaries */
                const bursarsTokenRoute = '/api/v1/bursars/account/login/token';
                const bursarsVerifyRoute = '/api/v1/bursars/verify/token';
                const bursarsOtpRoute = '/api/v1/bursars/account/login/otp';
                const bursarsOtpVerifyRoute = '/api/v1/bursars/verify/otp';
                const bursarsCreateRoute = '/api/v1/bursars/account/new';
                switch (route) {
                    /* if 'User has an active session' fetch the token from cache and return it. THIS IS FOR TEST ONLY! */
                    /* in PROD, we throw an error to prevent multiple login instances. A user can only login with either token or otp, not both. */
                    //! Note that for both the otp and token login, a req is made to an external lib that handles sending these responses.
                    //! hence, the response must be cached and referenced before permitting any more otp/token fetch calls.
                    //! preferably, disable the fetch btn/function for a given no of time(5-mins) before permitting another call.
                    case bursarsOtpRoute:
                    case teachersOtpRoute:
                        if (["staff"].includes(body.role)) {
                            const token = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token) return { token: token, message: `user has an active session` };

                            const otp = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp) return { number: body.phoneNumber, otp };
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case bursarsTokenRoute:
                    case teachersTokenRoute:
                        if (["staff"].includes(body.role)) {
                            const otp2 = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp2) return { otp: otp2, message: `user has an active session` };

                            const token2 = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token2) return { number: body.phoneNumber, token: token2 };
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case teachersOtpVerifyRoute:
                    case bursarsOtpVerifyRoute:
                    case teachersVerifyRoute:
                    case bursarsVerifyRoute:
                        if (["staff"].includes(body.role)) {
                            const login = await this.cacheService.getCached(`${body.phoneNumber}-loginResponse`);
                            if (login) return login;
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case bursarsCreateRoute:
                    case teachersCreateRoute:
                        if (["admin", "director"].includes(body.role)) {
                            const existingTeacher = await this.cacheService.getCached(`${body.phoneNumber}-newTeacher`);
                            if (existingTeacher) return new BadRequestException("Account already exists!");
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!")

                    default: throw new NotImplementedException('Invalid request: nice try!')
                }
            case 'DELETE':
                const delBody = request.body
                const teachersLogoutRoute = "/api/v1/teachers/account/logout";
                const bursarsLogoutRoute = "/api/v1/bursars/account/logout";
                const teachersPurgeRoute = "/api/v1/teachers/account/purge";
                const bursarsPurgeRoute = "/api/v1/bursars/account/purge";
                switch (route) {
                    case teachersLogoutRoute:
                    case bursarsLogoutRoute:
                        if (["director", "staff"].includes(delBody.role)) {
                            await Promise.all([
                                this.cacheService.delCached(`${delBody.phoneNumber}-accessToken`),
                                this.cacheService.delCached(`${delBody.phoneNumber}-encryptedKey`),
                                this.cacheService.delCached(`${delBody.phoneNumber}-loginResponse`)
                            ])
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case teachersPurgeRoute:
                    case bursarsPurgeRoute:
                        if (["director", "admin"].includes(delBody.role)) {
                            await Promise.all([
                                this.cacheService.delCached(`${delBody.phoneNumber}-accessToken`),
                                this.cacheService.delCached(`${delBody.phoneNumber}-encryptedKey`),
                                this.cacheService.delCached(`${delBody.phoneNumber}-loginResponse`)
                            ])
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    default: throw new NotImplementedException('Invalid request: nice try!')
                }

            case 'GET':
                const getBody = request.body;
                const getAllTeachers = "/api/v1/teachers/account/all";
                const getAllBursars = "/api/v1/bursars/account/all";
                const getTeacher = "/api/v1/teachers/account";
                const getBursar = "/api/v1/bursars/account";
                switch (route) {
                    case getAllTeachers:
                    case getAllBursars:
                        if (["director", "admin"].includes(getBody.role)) {
                            /* we use pagination here to return 10 docs per request. No caching. */
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case getTeacher:
                    case getBursar:
                        if (["director", "staff"].includes(getBody.role)) {
                            const cachedStaff = await this.cacheService.getCached(`${getBody.phoneNumber}-info`);
                            if (cachedStaff) return { data: cachedStaff };
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    default: throw new NotImplementedException('Invalid request: nice try!')
                }

            case 'PATCH':
                const patchBody = request.body;
                const teachersPermissions = "/api/v1/teachers/permissions";
                const teachersSubject = "/api/v1/teachers/subjects/update";
                const teachersAccount = "/api/v1/teachers/account/update";
                const bursarsPermissions = "/api/v1/bursars/permissions";
                const bursarsAccount = "/api/v1/bursars/account/update";
                switch (route) {
                    case teachersPermissions:
                    case bursarsPermissions:
                        if (["director", "admin"].includes(patchBody.role)) {
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case teachersAccount:
                    case bursarsAccount:
                        if (["director", "staff"].includes(patchBody.role)) {
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    case teachersSubject:
                        if (["director", "staff"].includes(patchBody.role)) {
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    default: throw new NotImplementedException('Invalid request, nice try!')
                }
            default: throw new NotImplementedException('Invalid request, nice try!')
        }
    }
}