import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";

@Injectable()
export class EntityGuards implements CanActivate {
    constructor(private readonly tokenService: TokenService) { }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request?.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const authToken = this.extractTokenFromHeader(req);
        const method = req.method;

        switch (method) {
            case "GET":
                if (!authToken || !req.body) throw new UnauthorizedException('Missing required params - ensure authToken or request-body is defined');
                return await this.tokenService.verifyAccessToken(authToken);

            case "PATCH":
                if (!req.body.updateBody) throw new BadRequestException('Missing required params - update-body');
            /* check if it works like this, or missing some logic. */

            case "DELETE":
                if (!req.body || !req.body.encryptionKey) throw new BadRequestException('Missing required params - ensure encryptionKey or request-body is defined');
                const { email, encryptionKey } = req.body;

                switch (req.body.role) {
                    case "admin": return await this.tokenService.verifyAdminKeys(encryptionKey, email)
                    case "director": return await this.tokenService.verifyEncryptedKeys(encryptionKey);
                    default: throw new BadRequestException('Missing required params - role');
                }

            case "POST":
                return true;
        }
    }
}