import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotImplementedException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class GradesInterceptor implements NestInterceptor {
    constructor(
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any> | any> {
        const request = context.switchToHttp().getRequest();
        const authToken = request.headers['authorization'];
        const { reg_numb, level } = request.body
        const method = request.method;
        const path = request.url

        if (method == "GET") {
            await this.tokenService.verifyAccessToken(authToken, request.params.reg_numb)
            const records = '/api/v1/grades/all';
            if (path == records) {
                const cachedRecords = await this.cacheService.getCached('all-grades');
                if (cachedRecords) return cachedRecords;
                else return next.handle()
            }
            else {
                switch (level) {
                    case "senior":
                        const allSenior = await this.cacheService.getCached(`senior-grades`);
                        const singleSenior = await this.cacheService.getCached(`${reg_numb}-grade`);
                        if (allSenior || singleSenior) return { allSenior, singleSenior };
                        else return next.handle();
                    case "junior":
                        const allJunior = await this.cacheService.getCached(`junior-grades`);
                        const singleJunior = await this.cacheService.getCached(`${reg_numb}-grade`);
                        if (allJunior || singleJunior) return { allJunior, singleJunior };
                        else return next.handle();
                    case "pupil":
                        const allPupil = await this.cacheService.getCached(`pupil-grades`);
                        const singlePupil = await this.cacheService.getCached(`${reg_numb}-grade`);
                        if (allPupil || singlePupil) return { allPupil, singlePupil };
                        else return next.handle();
                    default: throw new BadRequestException("Invalid Grade fetch request!");
                }
            }
        }
        else if (method == "DELETE" || "POST" || "UPDATE") {
            const { encryptionKey, role } = request.body;
            const result = await this.tokenService.verifyEncryptedKeys(encryptionKey, role);
            // if (result) return next.handle();
        }
        else return new NotImplementedException("Request is invalid and not implemented!")
    }
}