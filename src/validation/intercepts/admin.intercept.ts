import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotImplementedException, UnauthorizedException } from "@nestjs/common";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class AdminInterceptors implements NestInterceptor {
    constructor(private readonly cacheService: CacheService) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any> | any> {
        const request = context.switchToHttp().getRequest()
        const method = request.method;
        const route = request.url;

        switch (method) {
            case 'POST':
                const body = request.body
                const tokenRoute = '/api/v1/admin/account/login/token';
                const tokenVerifyRoute = '/api/v1/admin/verify/token';
                const otpRoute = '/api/v1/admin/account/login/otp';
                const otpVerifyRoute = '/api/v1/admin/verify/otp';
                const createRoute = '/api/v1/admin/account/new';
                if (["admin"].includes(body.role)) {
                    switch (route) {
                        case otpRoute:
                            const token = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token) return { token: token, message: `user has an active session!` };

                            const otp = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp) return { number: body.phoneNumber, otp };
                            return next.handle();

                        case tokenRoute:
                            const otp2 = await this.cacheService.getCached(`${body.phoneNumber}-otp`);
                            if (otp2) return { otp: otp2, message: `user has an active session!` };

                            const token2 = await this.cacheService.getCached(`${body.phoneNumber}-accessToken`);
                            if (token2) return { number: body.phoneNumber, token: token2 };
                            return next.handle();

                        case createRoute:
                            const existingAdmin = await this.cacheService.getCached(`${body.phoneNumber}-newAdmin`);
                            if (existingAdmin) return new BadRequestException("Account already exists!");
                            return next.handle();

                        case otpVerifyRoute:
                        case tokenVerifyRoute:
                            const login = await this.cacheService.getCached(`${body.phoneNumber}-loginResponse`);
                            if (login) return login;
                            return next.handle();

                        default: throw new NotImplementedException('Invalid request, nice try!')
                    }
                }
                throw new UnauthorizedException("Unauthorized user: access denied!");

            case 'DELETE':
                const delBody = request.body
                const logoutRoute = "/api/v1/admin/account/logout";
                const purgeRoute = "/api/v1/admin/account/purge";
                if (["admin"].includes(body.role)) {
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
                const getAllAdmin = "/api/v1/admin/account/all";
                const getAdmin = "/api/v1/admin/account";
                switch (route) {
                    case getAllAdmin:
                        if (["admin"].includes(body.role)) {
                            /*  paginate here, 10 docs per request. No caching. */
                            return next.handle();
                        } throw new UnauthorizedException("Unauthorized user: access denied!");

                    case getAdmin:
                        if (["admin"].includes(body.role)) {
                            const cachedAdmin = await this.cacheService.getCached(`${getBody.phoneNumber}-info`);
                            if (cachedAdmin) return { data: cachedAdmin };
                            return next.handle();
                        }
                        throw new UnauthorizedException("Unauthorized user: access denied!");

                    default: throw new NotImplementedException('Invalid request, nice try!')
                }

            default: throw new NotImplementedException('Invalid request, nice try!')
        }
    }
}