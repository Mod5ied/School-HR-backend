import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "src/services/tokens/tokens.service";

@Injectable()
export class TeachersGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService) { }

    async canActivate(context: ExecutionContext): Promise<any> {
        const req = context.switchToHttp().getRequest();
        const authToken = req.headers['authorization'];
        const method = req.method;

        switch (method) {
            case "GET":
                if (!authToken || !req.body) throw new UnauthorizedException('Missing required params - ensure authToken or request-body is defined');
                const user = { role: req.body.role }
                return await this.tokenService.verifyAccessToken(authToken, user);

            case "UPDATE":
            case "DELETE":
                if (!req.body || !req.body.encryptionKey) throw new BadRequestException('Missing required params - ensure encryptionKey or request-body is defined');
                const { encryptionKey, role } = req.body;
                return await this.tokenService.verifyEncryptedKeys(encryptionKey, role);
            case "POST":
                return true
        }
    }
}