import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor} from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";
import { CacheService } from "src/services/cache/cache.service";
import { Observable } from "rxjs";

@Injectable()
export class NotesInterceptor implements NestInterceptor {
    constructor(
        private readonly cacheService: CacheService,
        private readonly tokenService: TokenService,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const authToken = request.headers['authorization'];
        const method = request.method;

        if (method == "GET") {
            /* checks if its students or teachers that makes the get request before verifying token. */
            const user = { role: request.body.noteBody.role }
            if (request.body.noteBody.hasOwnProperty('phoneNumber'))
                await this.tokenService.verifyAccessToken(authToken, user);
            else if (request.body.noteBody.hasOwnProperty('regNum'))
                await this.tokenService.verifyAccessToken(authToken, user);

            if (typeof request.params.subject == 'string') {
                //todo: confirm this expression below:
                return await this.cacheService.getCached(`${request.params.subject}-notes`) ?? next.handle();
                // const cachedNote = await this.cacheService.getCached(`${request.params.subject}-notes`);
                // if (cachedNote) return cachedNote;
                // else return next.handle();
            }
            else {
                const cachedNotes = await this.cacheService.getCached(`all-notes`)
                if (cachedNotes) return cachedNotes;
                else return next.handle();
            }
        }
        else if (method == "POST" || "DELETE") {
            if (!request.body.noteBody)
                throw new BadRequestException('Missing required params. Ensure request-noteBody is defined.');
            const { encryptionKey, role } = request.body
            await this.tokenService.verifyEncryptedKeys(encryptionKey, role);
            return next.handle();
        }
        else throw new BadRequestException('Request is invalid!');
    }
}